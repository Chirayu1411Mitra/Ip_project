import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupById,
  getAllGroups,
  addMember,
  removeMember,
} from "../controller/groupsController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createGroup);
router.post("/:id/join", joinGroup);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);
router.get("/my", getMyGroups);
router.get("/", getAllGroups);
router.get("/:id", getGroupById);

export default router;
