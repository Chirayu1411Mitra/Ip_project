import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Clock } from "lucide-react";
import {
  getGroupDeadlines,
  createDeadline,
  toggleDeadlineComplete,
  updateDeadline,
  deleteDeadline,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import DeadlineCard from "../components/DeadlineCard";

const DeadlinePage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [formError, setFormError] = useState("");

  const fetchDeadlines = async () => {
    try {
      const res = await getGroupDeadlines(groupId);
      setDeadlines(res.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load deadlines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, [groupId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) return setFormError("Title is required.");
    if (!form.dueDate) return setFormError("Due date is required.");
    try {
      await createDeadline({ ...form, group: groupId });
      setCreating(false);
      setForm({ title: "", description: "", dueDate: "" });
      await fetchDeadlines();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to create deadline.");
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleDeadlineComplete(id);
      setDeadlines((prev) =>
        prev.map((d) => (d._id === id ? res.data.data : d))
      );
    } catch {
      alert("Failed to update deadline.");
    }
  };

  const handleEdit = async (id, payload) => {
    const res = await updateDeadline(id, payload);
    setDeadlines((prev) =>
      prev.map((d) => (d._id === id ? res.data.data : d))
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this deadline?")) return;
    try {
      await deleteDeadline(id);
      setDeadlines((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete deadline.");
    }
  };

  // Sort: incomplete first, then by due date asc; completed at bottom
  const sorted = [...deadlines].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const pending = sorted.filter((d) => !d.completed);
  const done = sorted.filter((d) => d.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate(`/groups/${groupId}/chat`)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          <Clock size={18} color="white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">Deadlines</p>
          <p className="text-xs text-gray-400">{pending.length} pending</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">New Deadline</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <input
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                placeholder="Description (optional)"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <input
                type="date"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
              {formError && <p className="text-red-500 text-xs">{formError}</p>}
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => { setCreating(false); setFormError(""); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                >
                  Add Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {deadlines.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-16">
            No deadlines yet. Add one!
          </div>
        )}

        {pending.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Upcoming
            </p>
            <div className="flex flex-col gap-3 mb-6">
              {pending.map((d) => (
                <DeadlineCard
                  key={d._id}
                  deadline={d}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  currentUserId={user?._id}
                />
              ))}
            </div>
          </>
        )}

        {done.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Completed
            </p>
            <div className="flex flex-col gap-3">
              {done.map((d) => (
                <DeadlineCard
                  key={d._id}
                  deadline={d}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  currentUserId={user?._id}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeadlinePage;
