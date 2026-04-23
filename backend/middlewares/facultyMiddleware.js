import User from "../db/schemas/User.js";

export const facultyOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "faculty") {
      return res.status(403).json({ message: "Access denied. Faculty only." });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
