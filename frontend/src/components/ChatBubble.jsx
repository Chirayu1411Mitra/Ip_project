import { useAuth } from "../context/AuthContext";

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const ChatBubble = ({ message }) => {
  const { user } = useAuth();
  const isOwn = message.sender?._id === user?._id;

  return (
    <div className={`flex gap-2 mb-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
      >
        {message.sender?.name?.[0]?.toUpperCase() || "?"}
      </div>

      <div className={`max-w-[70%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && (
          <span className="text-xs text-gray-500 mb-1 font-medium">
            {message.sender?.name || "Unknown"}
          </span>
        )}
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={
            isOwn
              ? {
                  background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                  color: "white",
                  borderBottomRightRadius: "4px",
                }
              : {
                  background: "#f3f0ff",
                  color: "#1f2937",
                  borderBottomLeftRadius: "4px",
                }
          }
        >
          {message.text}
        </div>
        <span className="text-[10px] text-gray-400 mt-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
