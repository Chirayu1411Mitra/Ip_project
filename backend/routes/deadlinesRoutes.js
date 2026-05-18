import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createDeadline,
  getGroupDeadlines,
  toggleComplete,
  updateDeadline,
  deleteDeadline,
  getMyDeadlines,
} from "../controller/deadlinesController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createDeadline);
router.get("/my", getMyDeadlines);
router.get("/group/:groupId", getGroupDeadlines);
router.patch("/:id/complete", toggleComplete);
router.patch("/:id", updateDeadline);
router.delete("/:id", deleteDeadline);

export default router;
