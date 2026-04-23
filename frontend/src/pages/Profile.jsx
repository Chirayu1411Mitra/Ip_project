import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/ui/StatCard";
import {
  FileText,
  HelpCircle,
  MessageSquare,
  Download,
  Edit2,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import EditProfile from "../components/Profile/updateProfile";
import FacultyProfile from "../components/Profile/FacultyProfile";
import { getProfilePictureSrc } from "../utils/profilePicture";
import profileService from "../services/profileServices";

const Profile = () => {
  const { user, loading } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentDoubts, setRecentDoubts] = useState([]);
  const [profileStats, setProfileStats] = useState({
    notesUploaded: 0,
    doubtsAsked: 0,
    answersGiven: 0,
    downloadsReceived: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const loadProfileData = async () => {
      try {
        const [stats, notes, doubts] = await Promise.all([
          profileService.dataStats(),
          profileService.getRecentNotes(),
          profileService.getRecentDoubts(),
        ]);

        if (!isActive) return;

        setProfileStats({
          notesUploaded: stats.notesUploaded ?? 0,
          doubtsAsked: stats.doubtsAsked ?? 0,
          answersGiven: stats.answersGiven ?? 0,
          downloadsReceived: stats.downloadsReceived ?? 0,
        });
        setRecentNotes(notes);
        setRecentDoubts(doubts);
      } catch (error) {
        if (isActive) {
          setProfileStats({
            notesUploaded: 0,
            doubtsAsked: 0,
            answersGiven: 0,
            downloadsReceived: 0,
          });
          setRecentNotes([]);
          setRecentDoubts([]);
        }
      }
    };

    if (user) {
      loadProfileData();
    }

    return () => {
      isActive = false;
    };
  }, [user]);

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen px-4">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen px-4">
        <p className="text-red-500 text-center">
          User not found. Please login.
        </p>
      </div>
    );
  }

  // If faculty user, show faculty profile
  if (user.role === "faculty") {
    return <FacultyProfile user={user} loading={loading} />;
  }

  // If editing, show the Edit Profile form
  if (isEditing) {
    return <EditProfile onCancel={() => setIsEditing(false)} />;
  }

  const profilePictureSrc = getProfilePictureSrc(user);

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    // Added container padding and scaled vertical spacing
    <div className="space-y-4 sm:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top Profile Card */}
      <div className="bg-white rounded-[24px] sm:rounded-4xl p-5 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full sm:w-auto">
            {/* Avatar */}
            {profilePictureSrc ? (
              <img
                src={profilePictureSrc}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shrink-0">
                {getInitials(user?.name)}
              </div>
            )}

            {/* User Info - Centered on mobile, left aligned on tablet+ */}
            <div className="flex-1 w-full text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {user?.name || "User Name"}
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-0.5 sm:mt-1 break-all">
                {user?.email || "Email not available"}
              </p>

              {/* Details */}
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Roll No:</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">
                    {user?.rollNo || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Branch:</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">
                    {user?.branch || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Semester:</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">
                    {user?.semester || "N/A"}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm sm:text-base text-gray-700 mt-5 sm:mt-6 max-w-2xl">
                {user?.bio ||
                  "No bio added yet. Add a bio to tell others about yourself!"}
              </p>
            </div>
          </div>

          {/* Edit Profile Button - Full width on mobile */}
          <button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto mt-2 sm:mt-0 justify-center bg-purple-500 text-white px-6 py-2.5 sm:py-2 rounded-xl sm:rounded-full font-semibold flex items-center gap-2 hover:bg-purple-600 transition shrink-0"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Cards Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          label="Notes Uploaded"
          value={profileStats.notesUploaded}
          icon={<FileText size={20} className="sm:w-6 sm:h-6" />}
          color="text-green-500 bg-green-500"
        />
        <StatCard
          label="Doubts Asked"
          value={profileStats.doubtsAsked}
          icon={<HelpCircle size={20} className="sm:w-6 sm:h-6" />}
          color="text-purple-500 bg-purple-500"
        />
        <StatCard
          label="Answers Given"
          value={profileStats.answersGiven}
          icon={<MessageSquare size={20} className="sm:w-6 sm:h-6" />}
          color="text-pink-500 bg-pink-500"
        />
        <StatCard
          label="Downloads"
          value={profileStats.downloadsReceived}
          icon={<Download size={20} className="sm:w-6 sm:h-6" />}
          color="text-orange-500 bg-orange-500"
        />
      </div>

      {/* Bottom Grid - Recent Notes and Doubts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* My Recent Notes */}
        <div className="bg-white rounded-[24px] sm:rounded-4xl p-5 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
            My Recent Notes
          </h2>
          {recentNotes.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8 sm:py-10">
              <p>You haven't uploaded any notes yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <button
                  key={note._id}
                  onClick={() => navigate(`/notes/${note._id}`)}
                  className="w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition"
                >
                  <p className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                    {note.title}
                  </p>
                  {/* Added flex-wrap so meta tags don't overflow */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>{note.subject}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Sem {note.semester}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{note.downloads ?? 0} downloads</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* My Recent Doubts */}
        <div className="bg-white rounded-[24px] sm:rounded-4xl p-5 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
            My Recent Doubts
          </h2>
          {recentDoubts.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8 sm:py-10">
              <p>You haven't asked any doubts yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDoubts.map((doubt) => (
                <button
                  key={doubt._id}
                  onClick={() => navigate(`/doubts?focus=${doubt._id}`)}
                  className="w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/40 transition"
                >
                  <p className="font-semibold text-gray-800 line-clamp-2 text-sm sm:text-base">
                    {doubt.question}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>{doubt.answersCount ?? 0} answers</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{doubt.upvotesCount ?? 0} upvotes</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{formatDate(doubt.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
