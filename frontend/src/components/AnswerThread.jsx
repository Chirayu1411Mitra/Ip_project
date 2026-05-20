import { useState } from "react";
import { addAnswer } from "../services/api";
import { Send, User, AlertTriangle, Loader2 } from "lucide-react";
import FacultyBadge from "./faculty/FacultyBadge";

function AnswerThread({ doubt, onDoubtUpdated, onBanError }) {
  const [answers, setAnswers] = useState(doubt.answers ?? []);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddAnswer = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await addAnswer(doubt._id, { content });
      // backend returns full updated doubt
      setAnswers(res.data.answers);
      setContent("");
      if (onDoubtUpdated) onDoubtUpdated(res.data);
    } catch (err) {
      console.error(err);
      if (err?.response?.data?.banned) {
        if (onBanError) onBanError(err.response.data);
      } else {
        setError(err?.response?.data?.message || "Failed to add answer");
      }
    } finally {
      setLoading(false);
    }
  };

  const initials = (name) =>
    name
      ? name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "?";

  return (
    <div className="w-full">
      {/* Existing answers */}
      {answers.length === 0 ? (
        <p className="text-xs text-gray-400 italic mb-3 text-center sm:text-left">
          No answers yet — be the first to help!
        </p>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4 mb-4">
          {answers.map((ans) => (
            <div key={ans._id} className="w-full">
              {ans.user?.role === "faculty" ? (
                <div className="flex gap-2 sm:gap-3 items-start bg-blue-50 border-l-4 border-blue-300 rounded-lg p-2.5 sm:p-4 shadow-sm">
                  <div
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] sm:text-xs font-bold mt-0.5"
                    style={{
                      background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
                    }}
                  >
                    {initials(ans.user?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <p className="text-xs sm:text-sm font-semibold text-blue-900 truncate max-w-full">
                        {ans.user.name}
                      </p>
                      <FacultyBadge small />
                    </div>
                    {ans.user?.designation && (
                      <p className="text-[10px] sm:text-xs text-blue-700 mb-1.5 font-medium truncate">
                        {ans.user.designation}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-blue-900 leading-relaxed break-words whitespace-pre-wrap">
                      {ans.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 sm:gap-3 items-start w-full">
                  <div
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] sm:text-xs font-bold mt-1"
                    style={{
                      background: "linear-gradient(135deg,#059669,#34d399)",
                    }}
                  >
                    {initials(ans.user?.name)}
                  </div>
                  <div className="flex-1 min-w-0 bg-white rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm border border-gray-100">
                    {ans.user?.name && (
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 truncate">
                        {ans.user.name}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                      {ans.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {/* Add answer form */}
      <form
        onSubmit={handleAddAnswer}
        className="flex gap-2 items-end sm:items-center"
      >
        <textarea
          rows="1"
          placeholder="Write an answer…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all resize-none min-h-[44px] max-h-[120px]"
          onInput={(e) => {
            // Auto-resize textarea logic for better UX on mobile
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 h-[44px] rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 shrink-0 shadow-sm active:scale-95"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} className="sm:w-[14px] sm:h-[14px]" />
          )}
          <span className="hidden sm:inline">
            {loading ? "Sending..." : "Reply"}
          </span>
        </button>
      </form>
    </div>
  );
}

export default AnswerThread;
