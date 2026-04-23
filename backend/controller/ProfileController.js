import express from "express";
import User from "../db/schemas/User.js";
import Note from "../db/schemas/Note.js";
import Doubt from "../db/schemas/Doubt.js";
import multer from "multer";
import cache from "../utils/cache.js";
import { serializeUser } from "../utils/userSerializer.js";

const updateProfile = async (req, res) => {
  try {
    const { bio, name, designation, department } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user to check role
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow updating bio and name for all users
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    // For faculty, also allow designation and department
    if (user.role === "faculty") {
      if (designation) updateData.designation = designation;
      if (department) updateData.department = department;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Invalidate user cache after update
    cache.delete(`user_${req.userId}`);

    return res.json({
      message: "Profile updated successfully",
      user: serializeUser(updatedUser),
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// Setup Multer for memory storage (stores file in RAM, not disk)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadPro = async (req, res) => {
  try {
    // 1. Check for Authentication
    if (!req.userId) {
      console.log("Upload: Unauthorized - no userId");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 2. Check if file was actually uploaded
    if (!req.file) {
      console.log("Upload: No file provided");
      return res.status(400).json({ message: "No image file provided" });
    }

    console.log("Upload: Starting avatar upload for user:", req.userId);
    console.log("File info:", {
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    // 3. Store binary image data instead of base64
    const updateFields = {
      profileImage: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    };

    // 4. Update user in DB using their authenticated ID
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true },
    ).select("-password");

    if (!updatedUser) {
      console.log("Upload: User not found:", req.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Upload: User updated successfully");
    console.log(
      "Updated user profileImage size:",
      updatedUser.profileImage?.data?.length || 0,
    );

    // Invalidate user cache after upload - CRITICAL for immediate display
    cache.delete(`user_${req.userId}`);

    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: "Internal server error during upload",
      error: error.message,
    });
  }
};
const dataStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [notesUploaded, doubtsAsked, downloadsReceivedAgg, answersGivenAgg] =
      await Promise.all([
        Note.countDocuments({ uploadedBy: userId }),
        Doubt.countDocuments({ user: userId }),
        Note.aggregate([
          { $match: { uploadedBy: user._id } },
          { $group: { _id: null, total: { $sum: "$downloads" } } },
        ]),
        Doubt.aggregate([
          { $unwind: "$answers" },
          { $match: { "answers.user": user._id } },
          { $count: "total" },
        ]),
      ]);

    res.json({
      notesUploaded,
      doubtsAsked,
      answersGiven: answersGivenAgg[0]?.total ?? 0,
      downloadsReceived: downloadsReceivedAgg[0]?.total ?? 0,
    });
  } catch (error) {
    console.error("Data stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const recentNotes = async (req, res) => {
  try {
    const notes = await Note.find({ uploadedBy: req.userId })
      .select("_id title subject semester downloads createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ notes });
  } catch (error) {
    console.error("Recent notes error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const recentDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find({ user: req.userId })
      .select("_id question answers upvotes createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedDoubts = doubts.map((doubt) => ({
      _id: doubt._id,
      question: doubt.question,
      answersCount: doubt.answers?.length ?? 0,
      upvotesCount: doubt.upvotes?.length ?? 0,
      createdAt: doubt.createdAt,
    }));

    res.json({ doubts: formattedDoubts });
  } catch (error) {
    console.error("Recent doubts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  updateProfile,
  upload,
  uploadPro,
  dataStats,
  recentNotes,
  recentDoubts,
};
