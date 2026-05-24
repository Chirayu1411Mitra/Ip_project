import Note from "../db/schemas/Note.js";
import { uploadFileToS3, getPresignedUrl, deleteFileFromS3 } from "../utils/s3Upload.js";
import User from "../db/schemas/User.js";

// @desc    Upload a new note
// @route   POST /api/notes
// @access  Private
export const uploadNote = async (req, res) => {
  try {
    const { title, description, subject } = req.body;
    
    if (!title || !subject) {
      return res.status(400).json({ success: false, message: "Title and subject are required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a PDF file" });
    }

    // Upload to S3
    const s3Key = await uploadFileToS3(req.file.buffer, req.file.originalname, req.file.mimetype);

    // Save to DB
    const newNote = await Note.create({
      title,
      description,
      subject,
      uploadedBy: req.userId,
      s3Key,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
    });

    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    console.error("Error uploading note:", error);
    res.status(500).json({ success: false, message: "Server error while uploading note" });
  }
};

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
export const getAllNotes = async (req, res) => {
  try {
    const { subject } = req.query;
    let query = {};
    if (subject && subject !== "All") {
      query.subject = subject;
    }

    const notes = await Note.find(query)
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    // Generate presigned URLs for each note
    const notesWithUrls = await Promise.all(
      notes.map(async (note) => {
        const presignedUrl = await getPresignedUrl(note.s3Key);
        return {
          ...note.toObject(),
          url: presignedUrl,
        };
      })
    );

    res.status(200).json({ success: true, data: notesWithUrls });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ success: false, message: "Server error while fetching notes" });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    // Check permissions: only the uploader or a faculty member can delete
    if (note.uploadedBy.toString() !== req.userId) {
      // Fetch user to check role
      const user = await User.findById(req.userId);
      if (!user || user.role !== "faculty") {
        return res.status(403).json({ success: false, message: "Not authorized to delete this note" });
      }
    }

    // Delete from S3
    await deleteFileFromS3(note.s3Key);

    // Delete from DB
    await Note.findByIdAndDelete(noteId);

    res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ success: false, message: "Server error while deleting note" });
  }
};
