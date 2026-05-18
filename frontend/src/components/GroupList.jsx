import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Search, LogIn } from "lucide-react";
import { getMyGroups, getAllGroups, joinGroup, createGroup } from "../services/api";

const GroupList = () => {
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [tab, setTab] = useState("mine"); // "mine" | "discover"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const [mine, all] = await Promise.all([getMyGroups(), getAllGroups()]);
      setMyGroups(mine.data.data);
      setAllGroups(all.data.data);
    } catch {
      setError("Failed to load groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoin = async (groupId) => {
    try {
      await joinGroup(groupId);
      await fetchGroups();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to join group.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!newGroup.name.trim()) return setFormError("Group name is required.");
    try {
      await createGroup(newGroup);
      setCreating(false);
      setNewGroup({ name: "", description: "" });
      await fetchGroups();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to create group.");
    }
  };

  const myGroupIds = new Set(myGroups.map((g) => g._id));

  const filtered = (tab === "mine" ? myGroups : allGroups).filter((g) =>
    g.name.toLowerCase().includes(searchQ.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
          >
            <Users size={18} color="white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Study Groups</h1>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          <Plus size={16} /> New Group
        </button>
      </div>

      {/* Create Group Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create Study Group</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <input
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="Group name *"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              />
              <textarea
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                placeholder="Description (optional)"
                rows={3}
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl">
        {["mine", "discover"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-white text-purple-700 shadow-sm" : "text-gray-500"
            }`}
          >
            {t === "mine" ? "My Groups" : "Discover"}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Search groups..."
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {/* Group Cards */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            {tab === "mine" ? "You haven't joined any groups yet." : "No groups found."}
          </div>
        )}
        {filtered.map((group) => {
          const joined = myGroupIds.has(group._id);
          return (
            <div
              key={group._id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-3 items-center min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                >
                  {group.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{group.name}</p>
                  {group.description && (
                    <p className="text-xs text-gray-500 truncate">{group.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {group.members?.length} member{group.members?.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                {joined && (
                  <button
                    onClick={() => navigate(`/groups/${group._id}/chat`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                  >
                    Open
                  </button>
                )}
                {!joined && (
                  <button
                    onClick={() => handleJoin(group._id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <LogIn size={13} /> Join
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupList;
