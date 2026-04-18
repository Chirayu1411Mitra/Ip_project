import { useState } from "react";
import { createDoubt } from "../../services/doubtsService";
import { Send } from "lucide-react";

function PostDoubtForm({ onNewDoubt }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await createDoubt({ question });
      onNewDoubt(res.data);
      setQuestion("");
    } catch (err) {
      console.error(err);
      alert("Failed to post doubt");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Scaled container padding and margin for mobile
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-4 sm:mb-5">
      <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
        Post a New Doubt
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
        <input
          type="text"
          placeholder="What's your doubt? Ask the community…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          // min-w-0 prevents flexbox overflow, scaled padding/text for mobile
          className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition min-w-0"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          // shrink-0 prevents button from being squished, scaled sizing
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-white transition-all disabled:opacity-50 shrink-0"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          <Send className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]" />
          <span>{loading ? "Posting…" : "Post"}</span>
        </button>
      </form>
    </div>
  );
}

export default PostDoubtForm;