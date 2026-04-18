import {
  ArrowLeft,
  User,
  Mail,
  Hash,
  CalendarDays,
  BookOpen,
  Upload,
  Camera,
  Trash2,
} from "lucide-react";
import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import profileService from "../../services/profileServices";
import { getProfilePictureSrc } from "../../utils/profilePicture";

const EditProfile = ({ onCancel }) => {
  const { user, refreshUserData } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    semester: "",
    branch: "",
    bio: "",
  });
  const [bioCount, setBioCount] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Populate form with user data on mount
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        rollNo: user.rollNo || "",
        semester: user.semester || "",
        branch: user.branch || "",
        bio: user.bio || "",
      });
      setBioCount(user.bio?.length || 0);

      const profilePictureSrc = getProfilePictureSrc(user);

      if (profilePictureSrc) {
        // profilePicture may be a data URI, raw URL, or binary payload from the backend.
        if (profilePictureSrc.startsWith("data:")) {
          setImagePreview(profilePictureSrc);
        } else {
          // Fallback for old file paths (can be removed once all data is migrated)
          let baseURL =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
          if (baseURL.endsWith("/api")) {
            baseURL = baseURL.slice(0, -4);
          }
          let path = profilePictureSrc;
          if (path.startsWith("/api")) {
            path = path.substring(4);
          }
          if (!path.startsWith("/")) {
            path = "/" + path;
          }
          setImagePreview(`${baseURL}/api${path}`);
        }
      }
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "bio") setBioCount(value.length);
  };

  // Triggered when file/camera is used
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file)); // Show preview instantly
      await upload_profile_picture(file); // Upload to backend
    }
  };

  // Upload picture to backend along with rollNo
  const upload_profile_picture = async (file) => {
    setLoading(true);
    setError(null);

    const uploadData = new FormData();
    uploadData.append("profile_picture", file);
    uploadData.append("rollNo", formData.rollNo);
    uploadData.append("name", formData.name);

    try {
      const response = await profileService.uploadProfilePicture(uploadData);
      setSuccess(true);

      // Update preview immediately with the base64 image from response
      const profilePictureSrc = getProfilePictureSrc(response.user);
      if (profilePictureSrc) {
        setImagePreview(profilePictureSrc);
      }

      await refreshUserData();
    } catch (err) {
      console.error("Failed to upload profile picture:", err);
      setError(
        err.response?.data?.message || "Failed to upload profile picture",
      );
    } finally {
      setLoading(false);
    }
  };

  // Save text-based profile updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData = {
        name: formData.name,
        bio: formData.bio,
      };

      await profileService.updateProfile(updateData);
      setSuccess(true);
      await refreshUserData();

      setTimeout(() => {
        onCancel();
      }, 1500);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );

    if (isConfirmed) {
      setLoading(true);
      try {
        console.log("Account deletion triggered");
        // await authService.deleteAccount();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete account");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex justify-center p-4 sm:p-6 md:p-8 font-sans text-slate-800">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-2 sm:p-2.5 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 shrink-0"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Edit Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Update your personal information
            </p>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">
            Profile updated successfully!
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm border border-slate-100 mb-6">
          <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-slate-900">
            Profile Picture
          </h2>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleImageChange}
            accept="image/*"
            capture="user"
            className="hidden"
          />

          {/* Changed to flex-col on mobile for better stacking */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="relative shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#2563EB] rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-semibold tracking-wide">
                  {getInitials(formData.name)}
                </div>
              )}

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={loading}
                className="absolute bottom-0 right-0 bg-[#3B82F6] text-white p-1.5 rounded-full border-[3px] border-white hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
              >
                <Camera size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="text-center sm:text-left w-full sm:w-auto">
              <h3 className="font-medium text-slate-900 mb-1">Change Avatar</h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-4">
                Upload a new profile picture or take a photo
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  <Upload size={16} /> Upload Photo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info Form */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm border border-slate-100 mb-6">
          <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-slate-900">
            Personal Information
          </h2>
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base text-slate-700 bg-[#FAFAFA] disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFAFA] outline-none text-sm sm:text-base text-slate-700 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Roll Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Hash size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.rollNo}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFAFA] outline-none text-sm sm:text-base text-slate-700 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Changed grid-cols-2 to stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                    Semester
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <CalendarDays size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.semester}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFAFA] outline-none text-sm sm:text-base text-slate-700 opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                    Branch
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <BookOpen size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.branch}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFAFA] outline-none text-sm sm:text-base text-slate-700 opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                disabled={loading}
                maxLength="200"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base text-slate-700 bg-[#FAFAFA] resize-none disabled:opacity-50"
              ></textarea>
              <div className="mt-1.5 sm:mt-2 text-xs text-slate-400">
                {bioCount}/200 characters
              </div>
            </div>

            {/* Form actions stack on mobile */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 sm:pt-6 border-t border-slate-100 mt-2 sm:mt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 sm:border-transparent hover:bg-slate-100 transition-colors disabled:opacity-50 text-sm sm:text-base text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-lg font-medium text-white bg-[#3B82F6] hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 text-sm sm:text-base flex justify-center items-center"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Delete Account */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 size={20} className="text-red-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Danger Zone
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-5 max-w-xl">
            Once you delete your account, there is no going back.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 text-center"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
