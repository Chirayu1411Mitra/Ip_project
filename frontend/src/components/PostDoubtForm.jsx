import { useState } from "react";
import { createDoubt } from "../services/api";
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Post a New Doubt</h2>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="What's your doubt? Ask the community…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          <Send size={15} />
          {loading ? "Posting…" : "Post"}
        </button>
      </form>
    </div>
  );
}

export default PostDoubtForm;
