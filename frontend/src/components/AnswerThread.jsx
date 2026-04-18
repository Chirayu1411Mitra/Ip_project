import { useState } from "react";
import { addAnswer } from "../services/api";
import { Send, User } from "lucide-react";

function AnswerThread({ doubt, onDoubtUpdated }) {
  const [answers, setAnswers] = useState(doubt.answers ?? []);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddAnswer = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await addAnswer(doubt._id, { content });
      // backend returns full updated doubt
      setAnswers(res.data.answers);
      setContent("");
      if (onDoubtUpdated) onDoubtUpdated(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to add answer");
    } finally {
      setLoading(false);
    }
  };

  const initials = (name) =>
    name
      ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
      : "?";

  return (
    <div>
      {/* Existing answers */}
      {answers.length === 0 ? (
        <p className="text-xs text-gray-400 italic mb-3">
          No answers yet — be the first to help!
        </p>
      ) : (
        <div className="flex flex-col gap-3 mb-4">
          {answers.map((ans) => (
            <div key={ans._id} className="flex gap-2 items-start">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: "linear-gradient(135deg,#059669,#34d399)" }}
              >
                {initials(ans.user?.name)}
              </div>
              <div className="flex-1 bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100">
                {ans.user?.name && (
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">
                    {ans.user.name}
                  </p>
                )}
                <p className="text-sm text-gray-700 leading-relaxed">{ans.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add answer form */}
      <form onSubmit={handleAddAnswer} className="flex gap-2">
        <input
          type="text"
          placeholder="Write an answer…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          <Send size={13} />
          {loading ? "…" : "Reply"}
        </button>
      </form>
    </div>
  );
}

export default AnswerThread;
