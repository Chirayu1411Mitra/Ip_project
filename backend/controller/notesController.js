import Note from "../db/schemas/Note.js";
import { uploadToS3, deleteFromS3, getSignedDownloadUrl } from "../utils/s3.js";

/**
 * POST /notes
 * Upload a new note (auth required)
 */
export const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const { title, subject, semester, description } = req.body;

    if (!title || !subject || !semester) {
      return res
        .status(400)
        .json({ message: "Title, subject, and semester are required" });
    }

    // Upload file buffer to S3
    const { key, url } = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    const note = await Note.create({
      title,
      subject,
      semester: Number(semester),
      description: description || "",
      fileUrl: url,
      fileKey: key,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.userId,
    });

    // Populate uploader info before returning
    await note.populate("uploadedBy", "name email");

    res.status(201).json(note);
  } catch (err) {
    console.error("Upload note error:", err);

    // Handle multer file size error
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Maximum size is 10 MB." });
    }

    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /notes
 * List notes with pagination and optional filters
 * Query params: page, limit, subject, semester
 */
export const getNotes = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.subject) {
      filter.subject = req.query.subject;
    }
    if (req.query.semester) {
      filter.semester = Number(req.query.semester);
    }

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .populate("uploadedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Note.countDocuments(filter),
    ]);

    res.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get notes error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /notes/:id
 * Get a single note by ID + increment download count + return signed URL
 */
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true },
    ).populate("uploadedBy", "name email avatarURL");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Generate a signed download URL (valid for 1 hour)
    const downloadUrl = await getSignedDownloadUrl(note.fileKey);

    res.json({
      ...note.toObject(),
      downloadUrl,
    });
  } catch (err) {
    console.error("Get note by ID error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * DELETE /notes/:id
 * Delete a note (auth required, only uploader can delete)
 */
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Only the uploader can delete
    if (note.uploadedBy.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own notes" });
    }

    // Delete from S3 first
    await deleteFromS3(note.fileKey);

    // Then delete from DB
    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /notes/search?q=
 * Partial search across title, description, subject
 * Supports character-level and partial word matching
 */
export const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    // Escape special regex characters to prevent injection
    const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i"); // case-insensitive partial match

    const filter = {
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
        { subject: { $regex: regex } },
        { fileName: { $regex: regex } },
      ],
    };

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .populate("uploadedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Note.countDocuments(filter),
    ]);

    res.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Search notes error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
