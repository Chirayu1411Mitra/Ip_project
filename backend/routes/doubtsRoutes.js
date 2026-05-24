import express from "express";
import { createDoubt } from "../controller/doubtController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  checkBanStatus,
  moderateContent,
} from "../middlewares/moderationMiddleware.js";
import { addAnswer } from "../controller/doubtController.js";
import { toggleUpvote } from "../controller/doubtController.js";
import { toggleAnswerUpvote } from "../controller/doubtController.js";
import { getAllDoubts } from "../controller/doubtController.js";

const router = express.Router();

router.post("/", authMiddleware, checkBanStatus, createDoubt);
router.get("/", getAllDoubts);
router.post("/:id/answer", authMiddleware, checkBanStatus, addAnswer);
router.patch("/:id/upvote", authMiddleware, checkBanStatus, toggleUpvote);
router.patch(
  "/:doubtId/answers/:answerId/upvote",
  authMiddleware,
  checkBanStatus,
  toggleAnswerUpvote,
);

export default router;
