import Doubt from "../db/schemas/Doubt.js";
import Notification from "../db/schemas/Notification.js";
import { io } from "../server.js";

export const createDoubt = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question)
      return res.status(400).json({ message: "Question is required" });

    const doubt = await Doubt.create({ user: req.userId, question });

    // Populate user data before sending response
    await doubt.populate("user", "name role");

    res.status(201).json(doubt);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content)
      return res.status(400).json({ message: "Answer content is required" });

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: "Doubt not found" });

    doubt.answers.push({ user: req.userId, content });
    await doubt.save();

    // Notify doubt owner (not self)
    if (doubt.user.toString() !== req.userId.toString()) {
      const notification = await Notification.create({
        recipient: doubt.user,
        sender: req.userId,
        type: "ANSWER",
        doubt: doubt._id,
      });
      io.to(doubt.user.toString()).emit("newNotification", notification);
    }

    // Populate and return
    await doubt.populate("user", "name role");
    await doubt.populate("answers.user", "name role designation");
    res.status(200).json(doubt);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleUpvote = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: "Doubt not found" });

    const userId = req.userId;
    const alreadyUpvoted = doubt.upvotes.includes(userId);

    if (alreadyUpvoted) doubt.upvotes.pull(userId);
    else doubt.upvotes.push(userId);

    await doubt.save();
    res
      .status(200)
      .json({
        message: alreadyUpvoted ? "Upvote removed" : "Upvoted",
        upvotes: doubt.upvotes.length,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleAnswerUpvote = async (req, res) => {
  try {
    const { doubtId, answerId } = req.params;
    const doubt = await Doubt.findById(doubtId);
    if (!doubt) return res.status(404).json({ message: "Doubt not found" });

    const answer = doubt.answers.id(answerId);
    if (!answer) return res.status(404).json({ message: "Answer not found" });

    const userId = req.userId;
    const alreadyUpvoted = answer.upvotes.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyUpvoted) answer.upvotes.pull(userId);
    else answer.upvotes.push(userId);

    await doubt.save();
    res
      .status(200)
      .json({
        message: alreadyUpvoted ? "Upvote removed" : "Upvoted",
        upvotes: answer.upvotes.length,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate("user", "name role")
      .populate("answers.user", "name role designation")
      .sort({ createdAt: -1 });

    res.status(200).json(doubts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
