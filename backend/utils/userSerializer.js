import User from "../db/schemas/User.js";

export const serializeUser = (user) => {
  if (!user) return null;

  const serialized = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    avatarURL: user.avatarURL,
    bannedUntil: user.bannedUntil,
    banReason: user.banReason,
  };

  if (user.role === "faculty") {
    serialized.department = user.department;
    serialized.designation = user.designation;
  } else {
    serialized.rollNo = user.rollNo;
    serialized.semester = user.semester;
    serialized.branch = user.branch;
  }

  return serialized;
};
