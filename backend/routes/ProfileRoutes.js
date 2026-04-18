import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  updateProfile,
  upload,
  uploadPro,
  dataStats,
  recentNotes,
  recentDoubts,
} from "../controller/ProfileController.js";
const profileRouter = express.Router();
profileRouter.put("/update-profile", authMiddleware, updateProfile);
profileRouter.post(
  "/upload-avatar",
  authMiddleware,
  upload.single("profile_picture"),
  uploadPro,
);
profileRouter.get("/data-stats", authMiddleware, dataStats);
profileRouter.get("/recent-notes", authMiddleware, recentNotes);
profileRouter.get("/recent-doubts", authMiddleware, recentDoubts);
export default profileRouter;
