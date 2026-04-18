import { toggleDoubtUpvote } from "../../services/doubtsService";
import { useState } from "react";
import AnswerThread from "./AnswerThread";
import { ThumbsUp, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

function DoubtCard({ doubt, onUpdate }) {
  const [upvotes, setUpvotes] = useState(doubt.upvotes?.length ?? 0);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [localDoubt, setLocalDoubt] = useState(doubt);

  const handleUpvote = async () => {
    setUpvoteLoading(true);
    try {
      const res = await toggleDoubtUpvote(doubt._id);
      setUpvotes(res.data.upvotes);
    } catch (err) {
      console.error(err);
    } finally {
      setUpvoteLoading(false);
    }
  };

  const handleDoubtUpdated = (updated) => {
    setLocalDoubt(updated);
    if (onUpdate) onUpdate(updated);
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const answersCount = localDoubt.answers?.length ?? 0;
  const initials = doubt.user?.name
    ? doubt.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div
      id={`doubt-${doubt._id}`}
      className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md"
    >
      {/* Card body - Scaled padding for mobile */}
      <div className="p-4 sm:p-5">
        {/* Top row: avatar + meta */}
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-xs">
                {doubt.user?.name ?? "Anonymous"}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 shrink-0">
                {timeAgo(doubt.createdAt)}
              </span>
            </div>
            {/* Added break-words to handle unbreakable text chunks */}
            <p className="text-gray-800 mt-1 text-xs sm:text-sm leading-relaxed font-medium break-words">
              {doubt.question}
            </p>
          </div>
        </div>

        {/* Action row - Added flex-wrap and scaled gaps/padding */}
        <div className="flex items-center gap-1.5 sm:gap-3 mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-gray-50 flex-wrap">
          {/* Upvote */}
          <button
            onClick={handleUpvote}
            disabled={upvoteLoading}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all hover:bg-purple-50 hover:text-purple-600 text-gray-500 disabled:opacity-50"
          >
            <ThumbsUp size={14} className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
            <span>{upvoteLoading ? "…" : upvotes}</span>
          </button>

          {/* Toggle answers */}
          <button
            onClick={() => setShowAnswers((p) => !p)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all hover:bg-purple-50 hover:text-purple-600 text-gray-500"
          >
            <MessageCircle size={14} className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
            <span>
              {answersCount} {answersCount === 1 ? "Answer" : "Answers"}
            </span>
            {showAnswers ? (
              <ChevronUp size={13} className="w-3 h-3 sm:w-[13px] sm:h-[13px]" />
            ) : (
              <ChevronDown size={13} className="w-3 h-3 sm:w-[13px] sm:h-[13px]" />
            )}
          </button>

          {answersCount === 0 && (
            <span
              className="ml-auto text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "#fef3c7", color: "#92400e" }}
            >
              Unanswered
            </span>
          )}
        </div>
      </div>

      {/* Answer thread - Scaled padding so answers have more room on mobile */}
      {showAnswers && (
        <div className="border-t border-gray-100 bg-gray-50/50 sm:bg-gray-50 px-3 sm:px-5 py-3 sm:py-4">
          <AnswerThread doubt={localDoubt} onDoubtUpdated={handleDoubtUpdated} />
        </div>
      )}
    </div>
  );
}

export default DoubtCard;