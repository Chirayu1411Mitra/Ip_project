import { useState } from "react";
import { CheckCircle2, Circle, Trash2, Clock, Pencil, X } from "lucide-react";

const getDaysRemaining = (dueDate) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
};

// Format a Date object to YYYY-MM-DD for <input type="date">
const toInputDate = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const DeadlineCard = ({ deadline, onToggle, onDelete, onEdit, currentUserId }) => {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: deadline.title,
    description: deadline.description || "",
    dueDate: toInputDate(deadline.dueDate),
  });
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const isCreator =
    currentUserId &&
    deadline.createdBy &&
    (deadline.createdBy._id || deadline.createdBy).toString() === currentUserId.toString();

  const days = getDaysRemaining(deadline.dueDate);
  const isOverdue = days < 0 && !deadline.completed;
  const isToday = days === 0 && !deadline.completed;

  const badgeStyle = () => {
    if (deadline.completed) return { bg: "#dcfce7", text: "#16a34a", label: "Done" };
    if (isOverdue) return { bg: "#fee2e2", text: "#dc2626", label: "Overdue" };
    if (isToday) return { bg: "#fef3c7", text: "#d97706", label: "Due Today" };
    return { bg: "#f3f0ff", text: "#7c3aed", label: `${days}d left` };
  };

  const { bg, text: textColor, label } = badgeStyle();

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    if (!editForm.title.trim() || editForm.title.trim().length < 2) {
      return setEditError("Title must be at least 2 characters.");
    }
    if (!editForm.dueDate) {
      return setEditError("Due date is required.");
    }
    setSaving(true);
    try {
      await onEdit(deadline._id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        dueDate: editForm.dueDate,
      });
      setEditing(false);
    } catch (err) {
      setEditError(err?.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditError("");
    setEditForm({
      title: deadline.title,
      description: deadline.description || "",
      dueDate: toInputDate(deadline.dueDate),
    });
  };

  return (
    <>
      <div
        className={`bg-white rounded-2xl p-4 border shadow-sm flex items-start gap-3 transition-all ${
          deadline.completed ? "opacity-60" : ""
        } ${isOverdue ? "border-red-200" : "border-gray-100"}`}
      >
        {/* Toggle button */}
        <button
          onClick={() => onToggle(deadline._id)}
          className="mt-0.5 shrink-0 text-gray-400 hover:text-purple-600 transition-colors"
        >
          {deadline.completed ? (
            <CheckCircle2 size={20} className="text-green-500" />
          ) : (
            <Circle size={20} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold text-sm text-gray-900 ${
              deadline.completed ? "line-through text-gray-400" : ""
            }`}
          >
            {deadline.title}
          </p>
          {deadline.description && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{deadline.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Clock size={12} className="text-gray-400" />
            <span className="text-xs text-gray-400">
              {new Date(deadline.dueDate).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full ml-1"
              style={{ backgroundColor: bg, color: textColor }}
            >
              {label}
            </span>
            {deadline.createdBy?.name && (
              <span className="text-xs text-gray-400 ml-1">by {deadline.createdBy.name}</span>
            )}
          </div>
        </div>

        {/* Actions — only shown to creator */}
        <div className="shrink-0 flex items-center gap-1 mt-0.5">
          {isCreator && onEdit && (
            <button
              onClick={() => setEditing(true)}
              className="text-gray-300 hover:text-purple-500 transition-colors"
              title="Edit deadline"
            >
              <Pencil size={15} />
            </button>
          )}
          {isCreator && onDelete && (
            <button
              onClick={() => onDelete(deadline._id)}
              className="text-gray-300 hover:text-red-400 transition-colors"
              title="Delete deadline"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Deadline</h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
              <input
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="Title *"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
              <textarea
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                placeholder="Description (optional)"
                rows={2}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
              <input
                type="date"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              />
              {editError && <p className="text-red-500 text-xs">{editError}</p>}
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DeadlineCard;
