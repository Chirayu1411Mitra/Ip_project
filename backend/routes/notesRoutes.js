import express from "express";
import {
  uploadNote,
  getNotes,
  getNoteById,
  deleteNote,
  searchNotes,
} from "../controller/notesController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const notesRouter = express.Router();

// Search must come before :id to avoid "search" being treated as an ID
notesRouter.get("/search", searchNotes);

// List all notes (with pagination & filters)
notesRouter.get("/", getNotes);

// Get single note by ID (increments download count)
notesRouter.get("/:id", getNoteById);

// Upload a new note (auth required)
notesRouter.post("/", authMiddleware, upload.single("file"), uploadNote);

// Delete a note (auth required, owner only)
notesRouter.delete("/:id", authMiddleware, deleteNote);

export default notesRouter;
