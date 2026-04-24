import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { facultyOnly } from "../middlewares/facultyMiddleware.js";
import announcementUpload from "../middlewares/announcementUploadMiddleware.js";
import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  getStudentActivity,
  facultyStats,
} from "../controller/FacultyController.js";

const facultyRouter = express.Router();

// Announcements — read public, write faculty only
facultyRouter.get("/announcements", getAnnouncements);
facultyRouter.post(
  "/announcements",
  authMiddleware,
  announcementUpload.array("files", 10),
  facultyOnly,
  createAnnouncement,
);
facultyRouter.delete(
  "/announcements/:id",
  authMiddleware,
  facultyOnly,
  deleteAnnouncement,
);

// Student activity — faculty only
facultyRouter.get("/students", authMiddleware, facultyOnly, getStudentActivity);

// Faculty own stats
facultyRouter.get("/stats", authMiddleware, facultyOnly, facultyStats);

export default facultyRouter;
