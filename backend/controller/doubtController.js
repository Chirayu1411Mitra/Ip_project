import Doubt from "../db/schemas/Doubt.js";
import User from "../db/schemas/User.js";
import Notification from "../db/schemas/Notification.js";
import { io } from "../server.js";
import { BedrockRuntimeClient, ApplyGuardrailCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// Helper function to check moderation
const checkModeration = async (text, userId) => {
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

      console.log(`User ${userId} banned for: ${reason}`);
      return { violated: true, reason };
    }

    return { violated: false };
  } catch (err) {
    console.error("Moderation check error:", err);
    return { violated: false }; // fail open
  }
};

export const createDoubt = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const doubt = await Doubt.create({
      user: req.userId, // comes from auth middleware
      question,
    });

    // Check moderation asynchronously AFTER posting
    checkModeration(question, req.userId).then((moderation) => {
      if (moderation.violated === true) {
        console.log(
          `User ${req.userId} banned for violating policy: ${moderation.reason}`,
        );
      }
    });

    res.status(201).json(doubt);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addAnswer = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Answer content is required" });
    }

    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    const answer = {
      user: req.userId,
      content,
    };

    doubt.answers.push(answer);
    await doubt.save();

    console.log("Doubt Owner:", doubt.user.toString());
    console.log("Answering User:", req.userId.toString());

    // 🔔 ADD THIS BLOCK
    if (doubt.user.toString() !== req.userId.toString()) {
      const notification = await Notification.create({
        recipient: doubt.user,
        sender: req.userId,
        type: "ANSWER",
        doubt: doubt._id,
      });

      // 🔥 REALTIME EMIT
      io.to(doubt.user.toString()).emit("newNotification", notification);
    }

    // Check moderation asynchronously AFTER posting answer
    checkModeration(content, req.userId).then((moderation) => {
      if (moderation.violated === true) {
        console.log(
          `User ${req.userId} banned for answer violation: ${moderation.reason}`,
        );
      }
    });

    // Populate and return
    const populatedDoubt = await Doubt.findById(doubt._id)
      .populate("user", "name role designation")
      .populate("answers.user", "name role designation");

    res.status(200).json(populatedDoubt);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleUpvote = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    const userId = req.userId;

    const alreadyUpvoted = doubt.upvotes.includes(userId);

    if (alreadyUpvoted) {
      // Remove upvote
      doubt.upvotes.pull(userId);
    } else {
      // Add upvote
      doubt.upvotes.push(userId);
    }

    await doubt.save();

    res.status(200).json({
      message: alreadyUpvoted ? "Upvote removed" : "Upvoted",
      upvotes: doubt.upvotes.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleAnswerUpvote = async (req, res) => {
  try {
    const { doubtId, answerId } = req.params;

    const doubt = await Doubt.findById(doubtId);

    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    const answer = doubt.answers.id(answerId);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const userId = req.userId;

    const alreadyUpvoted = answer.upvotes.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyUpvoted) {
      answer.upvotes.pull(userId);
    } else {
      answer.upvotes.push(userId);
    }

    await doubt.save();

    res.status(200).json({
      message: alreadyUpvoted ? "Upvote removed" : "Upvoted",
      upvotes: answer.upvotes.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate("user", "name role designation")
      .populate("answers.user", "name role designation")
      .sort({ createdAt: -1 });

    res.status(200).json(doubts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
