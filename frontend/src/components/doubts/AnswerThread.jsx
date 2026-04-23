import { useState } from "react";
import { useAuth } from "../../hooks/authhook";
import { addAnswer } from "../../services/answerService";
import { Send } from "lucide-react";
import FacultyBadge from "../faculty/FacultyBadge";

function AnswerThread({ doubt, onDoubtUpdated }) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState(doubt.answers ?? []);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const isAsker = user?._id === doubt.user?._id;

  const handleAddAnswer = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await addAnswer(doubt._id, { content });
      setAnswers(res.data.answers);
      setContent("");
      if (onDoubtUpdated) onDoubtUpdated(res.data);
    } catch (err) {
      if (err?.response?.data?.banned) {
        alert(err.response.data.message);
      } else {
        alert("Failed to add answer");
      }
      console.error(err);
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

  const isFaculty = (ans) => ans.user?.role === "faculty";

  return (
    <div>
      {answers.length === 0 ? (
        <p className="text-[11px] sm:text-xs text-gray-400 italic mb-2 sm:mb-3">
          No answers yet — be the first to help!
        </p>
      ) : (
        <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4">
          {answers.map((ans) => (
            <div key={ans._id} className="flex gap-2 items-start">
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold mt-0.5"
                style={{
                  background: isFaculty(ans)
                    ? "linear-gradient(135deg,#1d4ed8,#2563eb)"
                    : "linear-gradient(135deg,#059669,#34d399)",
                }}
              >
                {initials(ans.user?.name)}
              </div>
              <div
                className={`flex-1 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-sm border min-w-0 ${
                  isFaculty(ans)
                    ? "bg-blue-50 border-blue-100"
                    : "bg-white border-gray-100"
                }`}
              >
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  {ans.user?.name && (
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-700">
                      {ans.user.name}
                    </p>
                  )}
                  {isFaculty(ans) && <FacultyBadge small />}
                  {isFaculty(ans) && ans.user?.designation && (
                    <span className="text-[9px] text-blue-500 font-medium">
                      {ans.user.designation}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">
                  {ans.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add answer form */}
      {isAsker ? (
        <div className="text-xs sm:text-sm text-gray-400 italic py-2">
          You can't answer your own doubt
        </div>
      ) : (
        <form onSubmit={handleAddAnswer} className="flex gap-1.5 sm:gap-2">
          <input
            type="text"
            placeholder="Write an answer…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 px-3 py-1.5 sm:py-2 border border-gray-200 rounded-xl text-xs sm:text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition min-w-0"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all disabled:opacity-50 shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
          >
            <Send size={13} className="sm:w-[14px] sm:h-[14px] w-3 h-3" />
            <span className="hidden sm:inline">{loading ? "…" : "Reply"}</span>
            <span className="sm:hidden">{loading ? "…" : "Send"}</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default AnswerThread;
