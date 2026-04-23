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

notesRouter.get("/search", searchNotes);
notesRouter.get("/", getNotes);
notesRouter.get("/:id", getNoteById);
notesRouter.post("/", authMiddleware, upload.single("file"), uploadNote);
notesRouter.delete("/:id", authMiddleware, deleteNote);

export default notesRouter;
