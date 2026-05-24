import express from "express";
import multer from "multer";
import { uploadNote, getAllNotes, deleteNote } from "../controller/notesController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Multer config (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
});

router.use(authMiddleware);

router.route("/")
  .post(upload.single("file"), uploadNote)
  .get(getAllNotes);

router.route("/:id")
  .delete(deleteNote);

export default router;
