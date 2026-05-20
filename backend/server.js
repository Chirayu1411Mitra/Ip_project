import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./db/config.js";
import { applyGlobalMiddlewares } from "./middlewares/globalMiddlewares.js";
import authRoutes from "./routes/authRoutes.js";
import doubtRoutes from "./routes/doubtsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import groupsRoutes from "./routes/groupsRoutes.js";
import deadlinesRoutes from "./routes/deadlinesRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import { initSocketHandler } from "./socket/socketHandler.js";

dotenv.config();

const app = express();

// 🔥 create HTTP server
const server = http.createServer(app);

// 🔥 attach socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// ✅ export io (VERY IMPORTANT — used by notification controller)
export { io };

// 🔌 Initialize modular socket handler (group chat + personal rooms)
initSocketHandler(io);

// middlewares
applyGlobalMiddlewares(app);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/deadlines", deadlinesRoutes);
app.use("/api/faculty", facultyRoutes);

// connect to database
connectDB();

// ❗ use server.listen instead of app.listen
server.listen(process.env.Port, () => {
  console.log(`Server is running on port ${process.env.Port}`);
});
