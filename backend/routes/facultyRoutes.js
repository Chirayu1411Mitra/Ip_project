import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  getStudentActivity,
  getFacultyStats,
} from "../controller/facultyController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { facultyOnly } from "../middlewares/facultyMiddleware.js";

const router = express.Router();

router.get("/announcements", getAnnouncements);
router.post("/announcements", authMiddleware, facultyOnly, createAnnouncement);
router.delete(
  "/announcements/:id",
  authMiddleware,
  facultyOnly,
  deleteAnnouncement,
);
router.get("/students", authMiddleware, facultyOnly, getStudentActivity);
router.get("/stats", authMiddleware, facultyOnly, getFacultyStats);

export default router;
