import Group from "../db/schemas/Group.js";
import User from "../db/schemas/User.js";
import { verifyToken } from "../utils/genToken.js";
import { BedrockRuntimeClient, ApplyGuardrailCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// Map: socketId → { userId, groupId }
const socketUserMap = new Map();
// Map: groupId → Set of userIds currently typing
const typingUsers = new Map();

const TYPING_TIMEOUT_MS = 3000;
const typingTimers = new Map(); // key: `${groupId}:${userId}`

// Helper function to check moderation for group messages
const checkModerationForGroupChat = async (text, userId, io) => {
  try {
    const command = new ApplyGuardrailCommand({
      guardrailIdentifier: process.env.AWS_GUARDRAIL_ID,
      guardrailVersion: process.env.AWS_GUARDRAIL_VERSION || "DRAFT",
      source: "INPUT",
      content: [{ text: { text: text } }],
    });

    const response = await bedrockClient.send(command);

    if (response.action === "GUARDRAIL_INTERVENED") {
      const reason = "Violated community policy";
      const user = await User.findByIdAndUpdate(
        userId,
        {
          bannedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          banReason: reason,
        },
        { returnDocument: "after" },
      );

      // Emit ban event to frontend via Socket.io
      io.to(userId.toString()).emit("userBanned", {
        message: "Your message violated our community policy. Your account has been suspended for 30 days.",
        banReason: reason,
        bannedUntil: user?.bannedUntil,
        banned: true,
      });

      console.log(`User ${userId} banned in group chat for: ${reason}`);
      return { violated: true, reason };
    }

    return { violated: false };
  } catch (err) {
    console.error("Moderation check error:", err);
    return { violated: false };
  }
};

export const initSocketHandler = (io) => {
  io.on("connection", (socket) => {
    // Try auth token first, then fall back to cookie
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.cookie
        ?.split(";")
        .find((c) => c.trim().startsWith("token="))
        ?.split("=")[1];

    let currentUserId = null;

    if (token) {
      try {
        const decoded = verifyToken(token);
        if (decoded) currentUserId = decoded.userId;
      } catch {
        // unauthenticated
      }
    }

    // Re-join personal notification room (existing system)
    if (currentUserId) {
      socket.join(currentUserId);
    }

    // ── join-room ──────────────────────────────────────────────────────
    socket.on("join-room", async ({ groupId }) => {
      try {
        if (!currentUserId)
          return socket.emit("error", { message: "Unauthorized" });

        const group = await Group.findById(groupId).select("members");
        if (!group) return socket.emit("error", { message: "Group not found" });

        const isMember = group.members.some(
          (m) => m.toString() === currentUserId,
        );
        if (!isMember)
          return socket.emit("error", { message: "Access denied" });

        socket.join(groupId);
        socketUserMap.set(socket.id, { userId: currentUserId, groupId });
      } catch (err) {
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // ── send-message ───────────────────────────────────────────────────
    socket.on("send-message", async ({ groupId, text }) => {
      try {
        if (!currentUserId)
          return socket.emit("error", { message: "Unauthorized" });
        if (!text || text.trim().length === 0) return;
        if (text.trim().length > 2000)
          return socket.emit("error", { message: "Message too long" });

        // Check if user is banned
        const user = await User.findById(currentUserId);
        if (user && user.bannedUntil && user.bannedUntil > new Date()) {
          return socket.emit("error", {
            message: "Your account is suspended. You cannot send messages.",
          });
        }

        const group = await Group.findById(groupId);
        if (!group) return socket.emit("error", { message: "Group not found" });

        const isMember = group.members.some(
          (m) => m.toString() === currentUserId,
        );
        if (!isMember)
          return socket.emit("error", { message: "Access denied" });

        // Build and persist message immediately
        const newMessage = { sender: currentUserId, text: text.trim() };
        group.messages.push(newMessage);

        // Trim to latest 100
        if (group.messages.length > 100) {
          group.messages.shift();
        }

        await group.save();

        // Populate sender for broadcast
        const savedMsg = group.messages[group.messages.length - 1];
        await group.populate({
          path: "messages.sender",
          select: "name rollNo avatarURL",
        });

        const populatedMsg = group.messages.find(
          (m) => m._id.toString() === savedMsg._id.toString(),
        );

        io.to(groupId).emit("receive-message", {
          groupId,
          message: populatedMsg,
        });

        // Check moderation asynchronously AFTER posting
        checkModerationForGroupChat(text, currentUserId, io).then(
          (moderation) => {
            if (moderation.violated === true) {
              console.log(
                `User ${currentUserId} banned in group chat for: ${moderation.reason}`,
              );
            }
          },
        );
      } catch (err) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── typing ─────────────────────────────────────────────────────────
    socket.on("typing", ({ groupId, user }) => {
      if (!currentUserId || !groupId) return;

      const timerKey = `${groupId}:${currentUserId}`;

      // Emit to everyone else in room
      socket.to(groupId).emit("user-typing", { groupId, user });

      // Auto-clear after timeout
      if (typingTimers.has(timerKey)) clearTimeout(typingTimers.get(timerKey));
      const timer = setTimeout(() => {
        socket
          .to(groupId)
          .emit("user-stop-typing", { groupId, userId: currentUserId });
        typingTimers.delete(timerKey);
      }, TYPING_TIMEOUT_MS);
      typingTimers.set(timerKey, timer);
    });

    // ── stop-typing (explicit) ─────────────────────────────────────────
    socket.on("stop-typing", ({ groupId }) => {
      if (!currentUserId || !groupId) return;
      const timerKey = `${groupId}:${currentUserId}`;
      if (typingTimers.has(timerKey)) {
        clearTimeout(typingTimers.get(timerKey));
        typingTimers.delete(timerKey);
      }
      socket
        .to(groupId)
        .emit("user-stop-typing", { groupId, userId: currentUserId });
    });

    // ── disconnect ─────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const info = socketUserMap.get(socket.id);
      if (info) {
        const { userId, groupId } = info;
        const timerKey = `${groupId}:${userId}`;
        if (typingTimers.has(timerKey)) {
          clearTimeout(typingTimers.get(timerKey));
          typingTimers.delete(timerKey);
        }
        io.to(groupId).emit("user-stop-typing", { groupId, userId });
        socketUserMap.delete(socket.id);
      }
    });
  });
};
