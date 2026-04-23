import express from "express";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

import connectDB from "./db/config.js";
import { applyGlobalMiddlewares } from "./middlewares/globalMiddlewares.js";
import authRoutes from "./routes/authRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import doubtRoutes from "./routes/doubtsRoutes.js";
import ProfileRoutes from "./routes/ProfileRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export { io };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

applyGlobalMiddlewares(app);

const cacheControlMiddleware = (req, res, next) => {
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  next();
};

app.use("/api/uploads", cacheControlMiddleware, express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/profile", ProfileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/faculty", facultyRoutes);

connectDB();

server.listen(process.env.Port, () => {
  console.log(`Server running on port ${process.env.Port}`);
});