import express from "express";
import User from "../db/schemas/User.js";
import Note from "../db/schemas/Note.js";
import Doubt from "../db/schemas/Doubt.js";
import multer from "multer";
import cache from "../utils/cache.js";

const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Only allow updating name and bio
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Invalidate user cache after update
    cache.delete(`user_${req.userId}`);

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        semester: user.semester,
        branch: user.branch,
        bio: user.bio,
        avatarURL: user.avatarURL || null,
        profilePicture: user.avatarURL || null,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
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
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 2. Check if file was actually uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // 3. Extract optional fields from req.body
    const { name } = req.body;

    // 4. Convert image to base64 and store in MongoDB
    const imageData = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };

    // 5. Build dynamic update object
    const updateFields = {
      avatarURL: `data:${imageData.contentType};base64,${imageData.data.toString("base64")}`,
    };
    if (name) updateFields.name = name; // Only update name if it was provided

    // 6. Update user in DB using their authenticated ID
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Invalidate user cache after upload - CRITICAL for immediate display
    cache.delete(`user_${req.userId}`);

    const profilePictureUrl = updatedUser.avatarURL || null;

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        rollNo: updatedUser.rollNo,
        semester: updatedUser.semester,
        branch: updatedUser.branch,
        bio: updatedUser.bio,
        avatarURL: profilePictureUrl,
        profilePicture: profilePictureUrl,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error during upload" });
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
