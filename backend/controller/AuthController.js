import bcrypt from "bcryptjs";
import User from "../db/schemas/User.js";
import {
  setTokenCookie,
  generateToken,
  clearTokenCookie,
} from "../utils/genToken.js";
import { serializeUser } from "../utils/userSerializer.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt - Email:", email);

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    console.log("User found in DB:", !!user);

    if (!user) {
      console.log("Login failed: User not found for email:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Login failed: Password mismatch for user:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is banned
    if (user.bannedUntil && user.bannedUntil > new Date()) {
      const daysRemaining = Math.ceil(
        (user.bannedUntil - new Date()) / (1000 * 60 * 60 * 24),
      );
      return res.status(403).json({
        message: `Account suspended for ${daysRemaining} more days`,
        bannedUntil: user.bannedUntil,
        banReason: user.banReason,
        banned: true,
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);
    console.log("Login success for user:", email);

    res.json({
      user: serializeUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, rollNo, semester, branch } = req.body;
    if (!name || !email || !password || !rollNo) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const rollExists = await User.findOne({ rollNo });
    if (rollExists) {
      return res
        .status(400)
        .json({ message: "Roll number already registered" });
    }
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
    res.status(201).json({
      user: serializeUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const registerFaculty = async (req, res) => {
  try {
    const { name, email, password, department, designation, facultyCode } =
      req.body;

    if (!name || !email || !password || !department || !designation) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    if (facultyCode !== process.env.FACULTY_INVITE_CODE) {
      return res.status(403).json({ message: "Invalid faculty invite code" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      designation,
      role: "faculty",
    });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      user: serializeUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(serializeUser(user));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { bio, avatarURL, name } = req.body;
    const updates = {};
    if (typeof bio === "string") updates.bio = bio.trim().slice(0, 300);
    if (typeof avatarURL === "string") updates.avatarURL = avatarURL.trim();
    if (typeof name === "string" && name.trim().length > 0)
      updates.name = name.trim();

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      select: "-password",
    });
    res.json({ success: true, data: serializeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) return res.json({ success: true, data: [] });

    const regex = new RegExp(q, "i");
    const users = await User.find({
      $or: [{ name: regex }, { rollNo: regex }],
      _id: { $ne: req.userId },
    })
      .select("name rollNo branch semester avatarURL")
      .limit(10);

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
