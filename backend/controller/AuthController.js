import bcrypt from "bcryptjs";
import User from "../db/schemas/User.js";
import {
  setTokenCookie,
  generateToken,
  clearTokenCookie,
} from "../utils/genToken.js";
import { serializeUser } from "../utils/userSerializer.js";

// Helper function to convert user document to JSON with binary conversion
const getUserJSON = (user) => serializeUser(user);

const login = async (req, res) => {
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

    const token = generateToken(user._id);
    setTokenCookie(res, token);
    console.log("Login success for user:", email);

    res.json({
      user: getUserJSON(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const register = async (req, res) => {
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
    });
    res.status(201).json({
      user: getUserJSON(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out successfully" });
};
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(getUserJSON(user));
  } catch (err) {
    console.error("GetMe error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Delete user from database
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Clear token cookie
    clearTokenCookie(res);

    console.log("Account deleted for user:", userId);

    return res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

export { login, register, logout, getMe, deleteAccount };
