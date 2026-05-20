import Announcement from "../db/schemas/Announcement.js";
import User from "../db/schemas/User.js";
import Doubt from "../db/schemas/Doubt.js";

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || "normal",
      postedBy: req.userId,
    }).then((doc) => doc.populate("postedBy", "name designation department"));

    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("postedBy", "name designation department")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (announcement.postedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getStudentActivity = async (req, res) => {
  try {
    const [students, recentNotes, recentDoubts, bannedStudents] =
      await Promise.all([
        User.find({ role: "student" }).select(
          "name rollNo branch semester avatarURL",
        ),
        Doubt.find()
          .limit(20)
          .populate("user", "name rollNo")
          .sort({ createdAt: -1 }),
        Doubt.find()
          .limit(20)
          .populate("user", "name rollNo")
          .sort({ createdAt: -1 }),
        User.find({
          role: "student",
          bannedUntil: { $gt: new Date() },
        }).select("name rollNo bannedUntil banReason"),
      ]);

    const enrichedStudents = students.map((student) => {
      const notesCount = 0;
      const doubletsCount = recentDoubts.filter(
        (d) => d.user._id.toString() === student._id.toString(),
      ).length;
      const downloadsCount = 0;

      return {
        ...student.toObject(),
        notesUploaded: notesCount,
        doubtsAsked: doubletsCount,
        downloads: downloadsCount,
        status:
          bannedStudents.some(
            (b) => b._id.toString() === student._id.toString(),
          ) && "Banned"
            ? "Active"
            : "Active",
      };
    });

    res.json({
      students: enrichedStudents,
      recentDoubts,
      recentNotes,
      bannedStudents,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getFacultyStats = async (req, res) => {
  try {
    const faculty = await User.findById(req.userId).select("role");

    if (!faculty || faculty.role !== "faculty") {
      return res.status(403).json({ message: "Access denied. Faculty only." });
    }

    const [announcementsCount, studentsCount] = await Promise.all([
      Announcement.countDocuments({ postedBy: req.userId }),
      User.countDocuments({ role: "student" }),
    ]);

    res.json({
      notesUploaded: 0,
      announcementsPosted: announcementsCount,
      totalStudents: studentsCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
