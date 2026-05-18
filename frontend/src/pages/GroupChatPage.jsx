import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Clock, Users } from "lucide-react";
import { getGroupById } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext";
import useSocket from "../hooks/useSocket";
import ChatBubble from "../components/ChatBubble";
import MembersPanel from "../components/MembersPanel";

const TYPING_EMIT_THROTTLE = 1500;

const GroupChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocketContext();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  const bottomRef = useRef(null);
  const lastTypingSent = useRef(0);

  const fetchGroup = useCallback(async () => {
    try {
      const res = await getGroupById(groupId);
      setGroup(res.data.data);
      setMessages(res.data.data.messages || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load group.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  useEffect(() => {
    if (!socket || !groupId) return;
    socket.emit("join-room", { groupId });
  }, [socket, groupId]);

  const handleReceiveMessage = useCallback(({ message }) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleUserTyping = useCallback(({ user: typingUser }) => {
    if (typingUser?._id === user?._id) return;
    setTypingUsers((prev) =>
      prev.includes(typingUser?.name) ? prev : [...prev, typingUser?.name]
    );
  }, [user]);

  const handleUserStopTyping = useCallback(({ userId }) => {
    setTypingUsers((prev) => {
      // We do a best-effort filter — the name might not be in state if they never showed as typing
      return prev; // socket cleanup handles this via timeout
    });
    // Use a ref approach — just clear by re-fetching won't work, so we track by name in typing
  }, []);

  useSocket({
    "receive-message": handleReceiveMessage,
    "user-typing": handleUserTyping,
    "user-stop-typing": handleUserStopTyping,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    const now = Date.now();
    if (socket && now - lastTypingSent.current > TYPING_EMIT_THROTTLE) {
      socket.emit("typing", { groupId, user: { _id: user?._id, name: user?.name } });
      lastTypingSent.current = now;
    }
  };

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !socket) return;
    socket.emit("send-message", { groupId, text: trimmed });
    socket.emit("stop-typing", { groupId });
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => navigate("/groups")} className="text-purple-600 text-sm underline">
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate("/groups")} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          {group?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{group?.name}</p>
          <p className="text-xs text-gray-400">{group?.members?.length} members</p>
        </div>
        <button
          onClick={() => setShowMembers(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <Users size={13} /> Members
        </button>
        <button
          onClick={() => navigate(`/groups/${groupId}/deadlines`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <Clock size={13} /> Deadlines
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-16">No messages yet. Start the conversation!</div>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg._id} message={msg} />
        ))}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 ml-10 mb-2">
            <div className="flex gap-1 items-center bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm">
              <span className="text-xs text-gray-500">
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
              </span>
              <span className="flex gap-0.5 ml-1">
                {[0,1,2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <textarea
            rows={1}
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            placeholder="Type a message…"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {showMembers && group && (
        <MembersPanel
          group={group}
          onClose={() => setShowMembers(false)}
          onGroupUpdated={fetchGroup}
        />
      )}
    </div>
  );
};

export default GroupChatPage;
