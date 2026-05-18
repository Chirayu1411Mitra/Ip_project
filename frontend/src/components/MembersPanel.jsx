import { useState, useEffect, useCallback } from "react";
import { X, UserPlus, Search, Trash2, Crown } from "lucide-react";
import { searchUsers, addMemberToGroup, removeMemberFromGroup } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Avatar = ({ user, size = "sm" }) => {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  const initials = user?.name?.[0]?.toUpperCase() || "?";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center text-white font-bold shrink-0 overflow-hidden`}
      style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
    >
      {user?.avatarURL ? (
        <img src={user.avatarURL} alt={user.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
      ) : initials}
    </div>
  );
};

const MembersPanel = ({ group, onClose, onGroupUpdated }) => {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState(group.members || []);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(null); // userId being added
  const [removing, setRemoving] = useState(null);
  const [searchError, setSearchError] = useState("");

  const isCreator = group.createdBy?._id === currentUser?._id ||
                    group.createdBy === currentUser?._id;

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const res = await searchUsers(query.trim());
        // Filter out existing members
        const memberIds = new Set(members.map((m) => m._id || m));
        setResults(res.data.data.filter((u) => !memberIds.has(u._id)));
      } catch {
        setSearchError("Search failed.");
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query, members]);

  const handleAdd = async (userId) => {
    setAdding(userId);
    try {
      const res = await addMemberToGroup(group._id, userId);
      setMembers(res.data.data);
      setResults((prev) => prev.filter((u) => u._id !== userId));
      setQuery("");
      onGroupUpdated?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add member.");
    } finally {
      setAdding(null);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    setRemoving(userId);
    try {
      await removeMemberFromGroup(group._id, userId);
      setMembers((prev) => prev.filter((m) => (m._id || m) !== userId));
      onGroupUpdated?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to remove member.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Group Members</h2>
            <p className="text-xs text-gray-400">{members.length} member{members.length !== 1 ? "s" : ""} · {group.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Add Members (creator only) */}
          {isCreator && (
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserPlus size={13} /> Add Member
              </p>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Search by name or roll number…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {searching && (
                <p className="text-xs text-gray-400 mt-2 ml-1">Searching…</p>
              )}
              {searchError && (
                <p className="text-xs text-red-500 mt-2 ml-1">{searchError}</p>
              )}

              {results.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {results.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50">
                      <div className="flex items-center gap-2.5">
                        <Avatar user={u} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.rollNo} · {u.branch}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAdd(u._id)}
                        disabled={adding === u._id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                      >
                        {adding === u._id ? "Adding…" : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {query.trim().length >= 2 && !searching && results.length === 0 && (
                <p className="text-xs text-gray-400 mt-2 ml-1">No users found.</p>
              )}
            </div>
          )}

          {/* Members list */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Members
            </p>
            <div className="flex flex-col gap-1">
              {members.map((member) => {
                const memberId = member._id || member;
                const isOwner = (group.createdBy?._id || group.createdBy) === memberId;
                const isSelf = memberId === currentUser?._id;
                const canRemove = isCreator && !isOwner; // creator can remove others but not themselves

                return (
                  <div key={memberId} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50">
                    <div className="flex items-center gap-2.5">
                      <Avatar user={member} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-gray-900">
                            {member.name || "Unknown"}
                            {isSelf && <span className="text-gray-400 font-normal ml-1">(you)</span>}
                          </p>
                          {isOwner && (
                            <Crown size={12} className="text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{member.rollNo || ""}</p>
                      </div>
                    </div>

                    {canRemove && (
                      <button
                        onClick={() => handleRemove(memberId)}
                        disabled={removing === memberId}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {removing === memberId ? (
                          <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    )}

                    {/* Non-creator: show leave button for self */}
                    {!isCreator && isSelf && (
                      <button
                        onClick={() => handleRemove(memberId)}
                        disabled={removing === memberId}
                        className="text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-50"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersPanel;
