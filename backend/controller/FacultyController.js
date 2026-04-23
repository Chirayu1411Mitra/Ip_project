import Announcement from "../db/schemas/Announcement.js";
import User from "../db/schemas/User.js";
import Note from "../db/schemas/Note.js";
import Doubt from "../db/schemas/Doubt.js";

// POST /faculty/announcements
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content required" });
    }

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || "normal",
      postedBy: req.userId,
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

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /faculty/students  — all student activity overview
export const getStudentActivity = async (req, res) => {
  try {
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

    res.json({ students: enrichedStudents, recentNotes, recentDoubts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /faculty/profile-stats  (own stats as faculty)
export const facultyStats = async (req, res) => {
  try {
    const [notesCount, announcementsCount, studentsCount] = await Promise.all([
      Note.countDocuments({ uploadedBy: req.userId }),
      Announcement.countDocuments({ postedBy: req.userId }),
      User.countDocuments({ role: "student" }),
    ]);

    res.json({
      notesUploaded: notesCount,
      announcementsPosted: announcementsCount,
      totalStudents: studentsCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
