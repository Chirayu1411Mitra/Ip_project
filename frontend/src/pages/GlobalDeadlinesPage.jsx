import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  getMyDeadlines,
  toggleDeadlineComplete,
  updateDeadline,
  deleteDeadline,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import DeadlineCard from "../components/DeadlineCard";

const FILTERS = ["All", "Upcoming", "Overdue", "Completed"];

const GlobalDeadlinesPage = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const res = await getMyDeadlines();
        setDeadlines(res.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load deadlines.");
      } finally {
        setLoading(false);
      }
    };
    fetchDeadlines();
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await toggleDeadlineComplete(id);
      setDeadlines((prev) => prev.map((d) => (d._id === id ? res.data.data : d)));
    } catch {
      alert("Failed to update.");
    }
  };

  const handleEdit = async (id, payload) => {
    const res = await updateDeadline(id, payload);
    setDeadlines((prev) => prev.map((d) => (d._id === id ? res.data.data : d)));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this deadline?")) return;
    try {
      await deleteDeadline(id);
      setDeadlines((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete.");
    }
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const filtered = deadlines.filter((d) => {
    const due = new Date(d.dueDate);
    due.setHours(0, 0, 0, 0);
    if (filter === "All") return true;
    if (filter === "Upcoming") return !d.completed && due >= now;
    if (filter === "Overdue") return !d.completed && due < now;
    if (filter === "Completed") return d.completed;
    return true;
  });

  // Stats
  const total = deadlines.length;
  const overdue = deadlines.filter((d) => {
    const due = new Date(d.dueDate); due.setHours(0, 0, 0, 0);
    return !d.completed && due < now;
  }).length;
  const completed = deadlines.filter((d) => d.completed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
          >
            <Clock size={20} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">All Deadlines</h1>
            <p className="text-xs text-gray-400">Across all your study groups</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total", value: total, color: "#7c3aed", bg: "#f5f3ff", icon: <Clock size={16} /> },
            { label: "Overdue", value: overdue, color: "#dc2626", bg: "#fee2e2", icon: <AlertTriangle size={16} /> },
            { label: "Completed", value: completed, color: "#16a34a", bg: "#dcfce7", icon: <CheckCircle2 size={16} /> },
          ].map(({ label, value, color, bg, icon }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1" style={{ color }}>
                {icon}
                <span className="text-xs font-medium">{label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? "text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              style={filter === f ? { background: "linear-gradient(135deg,#7c3aed,#6d28d9)" } : {}}
            >
              {f}
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Deadline list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {filter === "All"
              ? "No deadlines yet. Add one from inside a group chat."
              : `No ${filter.toLowerCase()} deadlines.`}
            {filter === "All" && (
              <div className="mt-3">
                <button
                  onClick={() => navigate("/groups")}
                  className="text-purple-600 underline text-sm"
                >
                  Go to Groups →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((d) => (
              <div key={d._id}>
                {/* Group label */}
                {d.group?.name && (
                  <button
                    onClick={() => navigate(`/groups/${d.group._id}/deadlines`)}
                    className="text-xs text-purple-500 font-medium mb-1.5 ml-1 hover:underline"
                  >
                    # {d.group.name}
                  </button>
                )}
                <DeadlineCard
                  deadline={d}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  currentUserId={user?._id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalDeadlinesPage;
