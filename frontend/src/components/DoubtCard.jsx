import { toggleDoubtUpvote } from "../services/api";
import { useState } from "react";
import AnswerThread from "./AnswerThread";
import {
  ThumbsUp,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";

function DoubtCard({ doubt, onUpdate, onBanError }) {
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
    ? doubt.user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div
      id={`doubt-${doubt._id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md"
    >
      {/* Card body */}
      <div className="p-5">
        {/* Top row: avatar + meta */}
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-800">
                {doubt.user?.name ?? "Anonymous"}
              </span>
              <span className="text-xs text-gray-400">
                {timeAgo(doubt.createdAt)}
              </span>
            </div>
            <p className="text-gray-800 mt-1 text-sm leading-relaxed font-medium">
              {doubt.question}
            </p>
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
          {/* Upvote */}
          <button
            onClick={handleUpvote}
            disabled={upvoteLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-purple-50 hover:text-purple-600 text-gray-500 disabled:opacity-50"
          >
            <ThumbsUp size={14} />
            <span>{upvoteLoading ? "…" : upvotes}</span>
          </button>

          {/* Toggle answers */}
          <button
            onClick={() => setShowAnswers((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-purple-50 hover:text-purple-600 text-gray-500"
          >
            <MessageCircle size={14} />
            <span>
              {answersCount} {answersCount === 1 ? "Answer" : "Answers"}
            </span>
            {showAnswers ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {answersCount === 0 && (
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "#fef3c7", color: "#92400e" }}
            >
              Unanswered
            </span>
          )}
        </div>
      </div>

      {/* Answer thread */}
      {showAnswers && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          <AnswerThread
            doubt={localDoubt}
            onDoubtUpdated={handleDoubtUpdated}
            onBanError={onBanError}
          />
        </div>
      )}
    </div>
  );
}

export default DoubtCard;
