import { useEffect, useState } from "react";
import { getDoubts } from "../services/api";
import PostDoubtForm from "../components/PostDoubtForm";
import DoubtCard from "../components/DoubtCard";
import { HelpCircle, MessageSquare, TrendingUp } from "lucide-react";
import { useLocation } from "react-router-dom";

function DoubtPage() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "unanswered"
  const location = useLocation();

  const handleNewDoubt = (newDoubt) => {
    setDoubts((prev) => [newDoubt, ...prev]);
  };

  const handleDoubtUpdate = (updatedDoubt) => {
    setDoubts((prev) =>
      prev.map((d) => (d._id === updatedDoubt._id ? updatedDoubt : d)),
    );
  };

  useEffect(() => {
    getDoubts()
      .then((res) => setDoubts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;

    const searchParams = new URLSearchParams(location.search);
    const focusId = searchParams.get("focus");
    if (!focusId) return;

    const target = document.getElementById(`doubt-${focusId}`);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [loading, location.search, doubts]);

  const filtered =
    filter === "unanswered"
      ? doubts.filter((d) => d.answers?.length === 0)
      : doubts;

  const totalAnswers = doubts.reduce(
    (sum, d) => sum + (d.answers?.length ?? 0),
    0,
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 min-h-screen">
      {/* Adjusted padding for mobile */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page header */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Q&A Forum
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Ask doubts, give answers, help your peers
          </p>
        </div>

        {/* Stats row - Stacked on mobile (grid-cols-1), row on tablet+ (sm:grid-cols-3) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            {
              label: "Total Doubts",
              value: doubts.length,
              icon: <HelpCircle size={16} />,
              color: "#7c3aed",
            },
            {
              label: "Total Answers",
              value: totalAnswers,
              icon: <MessageSquare size={16} />,
              color: "#059669",
            },
            {
              label: "Unanswered",
              value: doubts.filter((d) => !d.answers?.length).length,
              icon: <TrendingUp size={16} />,
              color: "#d97706",
            },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: color + "18", color }}
              >
                {icon}
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-gray-800">
                  {value}
                </p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Post form */}
        <PostDoubtForm onNewDoubt={handleNewDoubt} />

        {/* Filter tabs - Added flex-wrap for mobile screens */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex gap-2">
            {["all", "unanswered"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all"
                style={
                  filter === f
                    ? {
                        background: "#7c3aed",
                        color: "white",
                        border: "1px solid #7c3aed",
                      }
                    : {
                        background: "white",
                        color: "#6b7280",
                        border: "1px solid #e5e7eb",
                      }
                }
              >
                {f === "all" ? "All Doubts" : "Unanswered"}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-gray-400 self-center">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Doubts list */}
        {loading ? (
          <div className="flex flex-col items-center py-16 sm:py-20 text-gray-400">
            <div
              className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin mb-3"
              style={{ borderColor: "#a78bfa", borderTopColor: "transparent" }}
            />
            <p className="text-sm">Loading doubts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 sm:py-20 text-gray-400">
            <HelpCircle className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No doubts found</p>
            <p className="text-xs mt-1 text-center">
              Be the first to ask a question!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {filtered.map((doubt) => (
              <DoubtCard
                key={doubt._id}
                doubt={doubt}
                onUpdate={handleDoubtUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoubtPage;
