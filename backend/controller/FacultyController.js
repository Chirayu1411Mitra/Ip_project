import Announcement from "../db/schemas/Announcement.js";
import User from "../db/schemas/User.js";
import Note from "../db/schemas/Note.js";
import Doubt from "../db/schemas/Doubt.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3.js";

// POST /faculty/announcements
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content required" });
    }

    const files = [];

    // Handle file uploads if files are present
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const { url, key } = await uploadToS3(
            file.buffer,
            file.originalname,
            file.mimetype,
          );
          files.push({
            url,
            key,
            name: file.originalname,
            size: file.size,
          });
        } catch (err) {
          console.error("S3 upload error:", err);
          return res
            .status(500)
            .json({ message: "Failed to upload file", error: err.message });
        }
      }
    }

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || "normal",
      postedBy: req.userId,
      files,
    });

    await announcement.populate("postedBy", "name designation department");
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /faculty/announcements
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("postedBy", "name designation department avatarURL")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /faculty/announcements/:id  (faculty who posted only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann)
      return res.status(404).json({ message: "Announcement not found" });

    if (ann.postedBy.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Only the author can delete this" });
    }

    // Delete files from S3
    if (ann.files && ann.files.length > 0) {
      for (const file of ann.files) {
        try {
          await deleteFromS3(file.key);
        } catch (err) {
          console.error("Failed to delete file from S3:", err);
          // Continue with deletion even if file deletion fails
        }
      }
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /faculty/students  — all student activity overview
export const getStudentActivity = async (req, res) => {
  try {
    console.log("getStudentActivity called");

    const [students, recentNotes, recentDoubts] = await Promise.all([
      User.find({ role: "student" })
        .select("-password -profileImage")
        .sort({ createdAt: -1 }),
      Note.find()
        .populate("uploadedBy", "name rollNo branch semester")
        .sort({ createdAt: -1 })
        .limit(20),
      Doubt.find()
        .populate("user", "name rollNo branch semester")
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    console.log(
      "Retrieved data - students:",
      students.length,
      "notes:",
      recentNotes.length,
      "doubts:",
      recentDoubts.length,
    );

    // Count students active in the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const activeStudentsCount = await User.countDocuments({
      role: "student",
      lastActive: { $gte: thirtyMinutesAgo },
    });

    // Aggregate per-student stats
    const studentIds = students.map((s) => s._id);
    const [noteStats, doubtStats] = await Promise.all([
      Note.aggregate([
        { $match: { uploadedBy: { $in: studentIds } } },
        {
          $group: {
            _id: "$uploadedBy",
            count: { $sum: 1 },
            downloads: { $sum: "$downloads" },
          },
        },
      ]),
      Doubt.aggregate([
        { $match: { user: { $in: studentIds } } },
        { $group: { _id: "$user", doubtsAsked: { $sum: 1 } } },
      ]),
    ]);

    const noteMap = {};
    noteStats.forEach((n) => {
      noteMap[n._id] = { notes: n.count, downloads: n.downloads };
    });
    const doubtMap = {};
    doubtStats.forEach((d) => {
      doubtMap[d._id] = d.doubtsAsked;
    });

    const enrichedStudents = students.map((s) => ({
      _id: s._id,
      name: s.name,
      email: s.email,
      rollNo: s.rollNo,
      branch: s.branch,
      semester: s.semester,
      bannedUntil: s.bannedUntil,
      banReason: s.banReason,
      notesUploaded: noteMap[s._id]?.notes ?? 0,
      downloadsReceived: noteMap[s._id]?.downloads ?? 0,
      doubtsAsked: doubtMap[s._id] ?? 0,
      joinedAt: s.createdAt,
    }));

    console.log("getStudentActivity completed successfully");

    res.json({
      students: enrichedStudents,
      recentNotes,
      recentDoubts,
      activeStudentsCount,
    });
  } catch (err) {
    console.error("getStudentActivity error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /faculty/stats  (own stats as faculty)
export const facultyStats = async (req, res) => {
  try {
    console.log("facultyStats called for userId:", req.userId);

    const [notesCount, announcementsCount, answersCount] = await Promise.all([
      Note.countDocuments({ uploadedBy: req.userId }),
      Announcement.countDocuments({ postedBy: req.userId }),
      Doubt.aggregate([
        { $unwind: "$answers" },
        { $match: { "answers.user": req.userId } },
        { $count: "total" },
      ]),
    ]);

    const doubtsResolved = answersCount.length > 0 ? answersCount[0].total : 0;

    console.log("Faculty stats retrieved:", {
      notesCount,
      announcementsCount,
      doubtsResolved,
    });

    res.json({
      notesUploaded: notesCount,
      announcementsPosted: announcementsCount,
      answersGiven: doubtsResolved,
    });
  } catch (err) {
    console.error("Faculty stats error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
