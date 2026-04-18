import express from "express";
import { getNotifications } from "../controller/notificationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { markAllAsRead } from "../controller/notificationController.js";


const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.patch("/read-all", authMiddleware, markAllAsRead);

export default router;