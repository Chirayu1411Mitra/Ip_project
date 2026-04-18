// Helper function to convert user document to JSON with binary conversion
export const serializeUser = (user) => {
  let avatarURL = null;
  if (user.profileImage && user.profileImage.data) {
    const base64 = user.profileImage.data.toString("base64");
    avatarURL = `data:${user.profileImage.contentType};base64,${base64}`;
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    rollNo: user.rollNo,
    semester: user.semester,
    branch: user.branch,
    bio: user.bio,
    avatarURL: avatarURL,
  };
};
