import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../ui/StatCard";
import { MessageSquare, Bell, Users, Edit2 } from "lucide-react";
import EditProfile from "./updateProfile";
import { getProfilePictureSrc } from "../../utils/profilePicture";
import facultyService from "../../services/facultyService";

const FacultyProfile = ({ user, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    announcementsPosted: 0,
    totalStudents: 0,
    answersGiven: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const loadFacultyStats = async () => {
      try {
        const data = await facultyService.getStats();
        if (!isActive) return;
        setStats({
          announcementsPosted: data.announcementsPosted ?? 0,
          totalStudents: data.totalStudents ?? 0,
          answersGiven: data.answersGiven ?? 0,
        });
      } catch (error) {
        console.error("Failed to load faculty stats:", error);
      }
    };

    if (user) {
      loadFacultyStats();
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

  // If editing, show the Edit Profile form
  if (isEditing) {
    return <EditProfile onCancel={() => setIsEditing(false)} />;
  }

  const profilePictureSrc = getProfilePictureSrc(user);

  return (
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
                {user?.name || "Faculty Name"}
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-0.5 sm:mt-1 break-all">
                {user?.email || "Email not available"}
              </p>

              {/* Faculty Details */}
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Designation:
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">
                    {user?.designation || "Faculty"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Department:
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">
                    {user?.department || "N/A"}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm sm:text-base text-gray-700 mt-5 sm:mt-6 max-w-2xl">
                {user?.bio ||
                  "No bio added yet. Add a bio to tell students about yourself!"}
              </p>
            </div>
          </div>

          {/* Edit Profile Button - Full width on mobile */}
          <button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto mt-2 sm:mt-0 justify-center text-white px-6 py-2.5 sm:py-2 rounded-xl sm:rounded-full font-semibold flex items-center gap-2 hover:opacity-90 transition shrink-0"
            style={{ background: "#7c3aed" }}
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Cards Grid - 2 columns on mobile, 3 on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
        <StatCard
          label="Announcements Posted"
          value={stats.announcementsPosted}
          icon={<Bell size={20} className="sm:w-6 sm:h-6" />}
          color="text-purple-500 bg-purple-500"
        />
        <StatCard
          label="Total Students"
          value={stats.totalStudents}
          icon={<Users size={20} className="sm:w-6 sm:h-6" />}
          color="text-blue-500 bg-blue-500"
        />
        <StatCard
          label="Answers Given"
          value={stats.answersGiven}
          icon={<MessageSquare size={20} className="sm:w-6 sm:h-6" />}
          color="text-green-500 bg-green-500"
        />
      </div>
    </div>
  );
};

export default FacultyProfile;
