import express from "express";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

import connectDB from "./db/config.js";
import { applyGlobalMiddlewares } from "./middlewares/globalMiddlewares.js";
import authRoutes from "./routes/authRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import doubtRoutes from './routes/doubtsRoutes.js';
import ProfileRoutes from "./routes/ProfileRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

// 🔥 create HTTP server
const server = http.createServer(app);

// 🔥 attach socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    },
});

// 🔌 socket connection
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // user joins their personal room
    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// ✅ export io (VERY IMPORTANT)
export { io };

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// middlewares
applyGlobalMiddlewares(app);

const cacheControlMiddleware = (req, res, next) => {
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  next();
};

// routes
app.use(
  "/api/uploads",
  cacheControlMiddleware,
  express.static(path.join(__dirname, "uploads")),
);
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/profile", ProfileRoutes);
app.use("/api/notifications", notificationRoutes);

// connect to database
connectDB();

// ❗ use server.listen instead of app.listen
server.listen(process.env.Port, () => {
    console.log(`Server is running on port ${process.env.Port}`);
});