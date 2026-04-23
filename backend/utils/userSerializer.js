export const serializeUser = (user) => {
  let avatarURL = null;
  if (user.profileImage && user.profileImage.data) {
    const base64 = user.profileImage.data.toString("base64");
    avatarURL = `data:${user.profileImage.contentType};base64,${base64}`;
  }

  const base = {
    _id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatarURL: avatarURL || user.avatarURL || null,
    role: user.role || "student",
    bannedUntil: user.bannedUntil || null,
    banReason: user.banReason || "",
  };

  if (user.role === "faculty") {
    return {
      ...base,
      department: user.department,
      designation: user.designation || "Faculty",
    };
  }

  return {
    ...base,
    rollNo: user.rollNo,
    semester: user.semester,
    branch: user.branch,
  };
};