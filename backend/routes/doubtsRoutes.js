import express from "express";
import { createDoubt } from "../controller/doubtController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addAnswer } from "../controller/doubtController.js";
import { toggleUpvote } from "../controller/doubtController.js";
import { toggleAnswerUpvote } from "../controller/doubtController.js";
import { getAllDoubts } from "../controller/doubtController.js";

const router = express.Router();

router.post("/", authMiddleware, createDoubt);
router.get("/", getAllDoubts);
router.post("/:id/answer", authMiddleware, addAnswer);
router.patch("/:id/upvote", authMiddleware, toggleUpvote);
router.patch("/:doubtId/answers/:answerId/upvote", authMiddleware, toggleAnswerUpvote);

export default router;