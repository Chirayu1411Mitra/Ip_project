import bcrypt from "bcryptjs";
import User from "../db/schemas/User.js";
import {
  setTokenCookie,
  generateToken,
  clearTokenCookie,
} from "../utils/genToken.js";
import { serializeUser } from "../utils/userSerializer.js";

const getUserJSON = (user) => serializeUser(user);

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // Check ban
    if (user.bannedUntil && new Date() < new Date(user.bannedUntil)) {
      const daysLeft = Math.ceil(
        (new Date(user.bannedUntil) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return res.status(403).json({
        message: `Account suspended for ${daysLeft} more day${daysLeft !== 1 ? "s" : ""} due to policy violation.`,
        bannedUntil: user.bannedUntil,
        banReason: user.banReason,
        banned: true,
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Update lastActive on login
    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

    res.json({ user: getUserJSON(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const registerStudent = async (req, res) => {
  try {
    const { name, email, password, rollNo, semester, branch } = req.body;
    if (!name || !email || !password || !rollNo) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: "Email already registered" });

    const rollExists = await User.findOne({ rollNo });
    if (rollExists) return res.status(400).json({ message: "Roll number already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      rollNo,
      semester,
      branch,
      role: "student",
    });

    res.status(201).json({ user: getUserJSON(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const registerFaculty = async (req, res) => {
  try {
    const { name, email, password, department, designation, facultyCode } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Simple faculty code verification (set FACULTY_INVITE_CODE in .env)
    const validCode = process.env.FACULTY_INVITE_CODE || "FACULTY2024";
    if (facultyCode !== validCode) {
      return res.status(403).json({ message: "Invalid faculty registration code" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      designation: designation || "Faculty",
      role: "faculty",
    });

    res.status(201).json({ user: getUserJSON(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Keep old register for backwards compat
const register = registerStudent;

const logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out successfully" });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(getUserJSON(user));
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    clearTokenCookie(res);
    return res.json({ message: "Account deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export { login, register, registerStudent, registerFaculty, logout, getMe, deleteAccount };