import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/api";
import { Mail, Hash, BookOpen, GraduationCap, Edit3, Check, X, Camera } from "lucide-react";

const AVATAR_PRESETS = [
  "https://api.dicebear.com/8.x/thumbs/svg?seed=Felix&backgroundColor=7c3aed",
  "https://api.dicebear.com/8.x/thumbs/svg?seed=Aneka&backgroundColor=6d28d9",
  "https://api.dicebear.com/8.x/thumbs/svg?seed=Milo&backgroundColor=4f46e5",
  "https://api.dicebear.com/8.x/thumbs/svg?seed=Zara&backgroundColor=0ea5e9",
  "https://api.dicebear.com/8.x/thumbs/svg?seed=Nico&backgroundColor=059669",
  "https://api.dicebear.com/8.x/thumbs/svg?seed=Luna&backgroundColor=d97706",
  "https://api.dicebear.com/8.x/thumbs/svg?seed=Kai&backgroundColor=dc2626",
  "https://api.dicebear.com/8.x/thumbs/svg?seed=Dev&backgroundColor=7c3aed",
];

const InfoField = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm text-gray-800 font-semibold">{value || "—"}</p>
    </div>
  </div>
);

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  const [editing, setEditing]           = useState(false);
  const [avatarPicker, setAvatarPicker] = useState(false);
  const [form, setForm]                 = useState({
    name:      user?.name      || "",
    bio:       user?.bio       || "",
    avatarURL: user?.avatarURL || "",
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) return setError("Name cannot be empty.");
    setSaving(true);
    try {
      await updateProfile({
        name:      form.name.trim(),
        bio:       form.bio.trim(),
        avatarURL: form.avatarURL.trim(),
      });
      await refreshUser();          // pull fresh user into AuthContext
      setSuccess(true);
      setEditing(false);
      setAvatarPicker(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || "", bio: user?.bio || "", avatarURL: user?.avatarURL || "" });
    setEditing(false);
    setAvatarPicker(false);
    setError("");
  };

  const currentAvatar = editing ? form.avatarURL : user?.avatarURL;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Banner */}
          <div
            className="h-32 w-full relative"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                >
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                {editing && (
                  <button
                    onClick={() => setAvatarPicker((p) => !p)}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shadow-md hover:bg-purple-700 transition-colors"
                  >
                    <Camera size={13} color="white" />
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {!editing ? (
                  <button
                    onClick={() => { setEditing(true); setSuccess(false); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
                  >
                    <Edit3 size={14} /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                    >
                      <Check size={14} /> {saving ? "Saving…" : "Save"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Avatar picker */}
            {avatarPicker && (
              <div className="mb-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-xs font-semibold text-purple-600 mb-3">Choose an avatar</p>
                <div className="flex gap-2 flex-wrap mb-3">
                  {AVATAR_PRESETS.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setForm((f) => ({ ...f, avatarURL: url }))}
                      className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all ${
                        form.avatarURL === url
                          ? "border-purple-600 scale-110 shadow-md"
                          : "border-transparent hover:border-purple-300"
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {/* Initials option */}
                  <button
                    onClick={() => setForm((f) => ({ ...f, avatarURL: "" }))}
                    className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      !form.avatarURL
                        ? "border-purple-600 bg-purple-200 text-purple-800"
                        : "border-gray-200 text-gray-400 hover:border-purple-300"
                    }`}
                  >
                    {initials}
                  </button>
                </div>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Or paste a custom image URL…"
                  value={form.avatarURL}
                  onChange={(e) => setForm((f) => ({ ...f, avatarURL: e.target.value }))}
                />
              </div>
            )}

            {/* Name */}
            {editing ? (
              <input
                className="w-full text-xl font-bold text-gray-900 border-b-2 border-purple-300 bg-transparent outline-none mb-1 pb-1"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            )}

            <p className="text-sm text-gray-500 mt-0.5 mb-1">{user?.email}</p>
            <p className="text-xs text-gray-400 mb-5">
              {[user?.branch, user?.semester ? `Semester ${user.semester}` : null, user?.rollNo]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {/* Bio */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                About
              </p>
              {editing ? (
                <div>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                    placeholder="Write a short bio about yourself…"
                    rows={4}
                    maxLength={300}
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">
                    {form.bio.length}/300
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {user?.bio || (
                    <span className="text-gray-400 italic">
                      No bio yet. Click "Edit Profile" to add one.
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Feedback */}
            {error   && <p className="text-red-500 text-sm mb-3">{error}</p>}
            {success && (
              <p className="text-green-600 text-sm mb-3 flex items-center gap-1.5">
                <Check size={14} /> Profile updated successfully!
              </p>
            )}

            {/* Info fields */}
            <div className="bg-gray-50 rounded-2xl px-4">
              <InfoField icon={<Mail   size={15} />} label="Email"       value={user?.email} />
              <InfoField icon={<Hash   size={15} />} label="Roll Number" value={user?.rollNo} />
              <InfoField icon={<BookOpen size={15} />} label="Branch"    value={user?.branch} />
              <InfoField
                icon={<GraduationCap size={15} />}
                label="Semester"
                value={user?.semester ? `Semester ${user.semester}` : null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
