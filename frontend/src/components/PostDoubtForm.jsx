import { useState, useRef } from "react";
import { createDoubt } from "../services/api";
import { Send, AlertTriangle, Loader2, HelpCircle } from "lucide-react";

function PostDoubtForm({ onNewDoubt, onBanError }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await createDoubt({ question });
      onNewDoubt(res.data);
      setQuestion("");
      // Reset textarea height after successful post
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      console.error(err);
      if (err?.response?.data?.banned) {
        if (onBanError) onBanError(err.response.data);
      } else {
        setError(err?.response?.data?.message || "Failed to post doubt");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-5 sm:mb-6 transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle size={18} className="text-purple-600" />
        <h2 className="text-sm sm:text-base font-bold text-gray-800 tracking-tight">
          Post a New Doubt
        </h2>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          ref={textareaRef}
          rows="2"
          placeholder="What's your doubt? Ask the community…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all resize-none min-h-[60px] max-h-[200px]"
          onInput={(e) => {
            // Auto-resize logic
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 active:scale-95 shadow-sm"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} className="w-4 h-4" />
            )}
            {loading ? "Posting…" : "Post Doubt"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostDoubtForm;
