import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/api";
import { Mail, Hash, BookOpen, GraduationCap, Edit3, Check, X, Camera, AlertCircle, Loader } from "lucide-react";

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

/**
 * Canvas-based image resizer with JPEG compression
 * Resizes image to max 200x200px to keep MongoDB document size reasonable
 * @param {File} file - Image file to resize
 * @param {number} maxWidth - Max width in pixels (default: 200)
 * @param {number} maxHeight - Max height in pixels (default: 200)
 * @returns {Promise<string>} Base64 JPEG dataURL
 */
const resizeImageWithCanvas = (file, maxWidth = 200, maxHeight = 200) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        // Maintain aspect ratio while fitting in max bounds
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.9 quality
        const base64 = canvas.toDataURL("image/jpeg", 0.9);
        resolve(base64);
      };
      
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [editing, setEditing]           = useState(false);
  const [avatarPicker, setAvatarPicker] = useState(false);
  const [form, setForm]                 = useState({
    name:      user?.name      || "",
    bio:       user?.bio       || "",
    avatarURL: user?.avatarURL || "",
  });
  const [saving,  setSaving]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [sizeWarning, setSizeWarning] = useState("");

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  /**
   * Handle file input change - convert image to base64 and set preview
   * Automatically resizes and compresses before storing
   */
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setError("");
    setSizeWarning("");
    
    // Check file size (warn if > 2MB original)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 2) {
      setSizeWarning(
        `Original image is ${fileSizeMB.toFixed(1)}MB. Resizing and compressing...`
      );
    }
    
    try {
      setUploading(true);
      // Resize to 200x200 and compress to JPEG
      const base64 = await resizeImageWithCanvas(file);
      setForm((f) => ({ ...f, avatarURL: base64 }));
      setSizeWarning(""); // Clear warning after successful resize
    } catch (err) {
      setError(`Failed to process image: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

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
      await refreshUser();          // pull fresh user into AuthContext → Header updates automatically
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
    setSizeWarning("");
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
                    disabled={uploading}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                    title="Change avatar"
                  >
                    {uploading ? (
                      <Loader size={13} color="white" className="animate-spin" />
                    ) : (
                      <Camera size={13} color="white" />
                    )}
                  </button>
                )}
                
                {/* Hidden file input for image upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
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
                <p className="text-xs font-semibold text-purple-600 mb-3">Choose or upload an avatar</p>
                
                {/* Size warning */}
                {sizeWarning && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">{sizeWarning}</p>
                  </div>
                )}
                
                {/* Preset avatars */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {AVATAR_PRESETS.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setForm((f) => ({ ...f, avatarURL: url }))}
                      disabled={uploading}
                      className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all disabled:opacity-50 ${
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
                    disabled={uploading}
                    className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-xs font-bold transition-all disabled:opacity-50 ${
                      !form.avatarURL
                        ? "border-purple-600 bg-purple-200 text-purple-800"
                        : "border-gray-200 text-gray-400 hover:border-purple-300"
                    }`}
                  >
                    {initials}
                  </button>
                </div>
                
                {/* File upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full mb-3 px-3 py-2 rounded-xl border-2 border-dashed border-purple-300 bg-white text-sm font-medium text-purple-600 hover:bg-purple-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      Processing image...
                    </>
                  ) : (
                    <>
                      <Camera size={14} />
                      Upload Photo
                    </>
                  )}
                </button>
                
                {/* Custom URL input */}
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50"
                  placeholder="Or paste a custom image URL…"
                  value={form.avatarURL}
                  onChange={(e) => setForm((f) => ({ ...f, avatarURL: e.target.value }))}
                  disabled={uploading}
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
