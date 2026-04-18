import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./db/config.js";
import { applyGlobalMiddlewares } from "./middlewares/globalMiddlewares.js";
import authRoutes from "./routes/authRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import doubtRoutes from './routes/doubtsRoutes.js';
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

// middlewares
applyGlobalMiddlewares(app);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/notifications", notificationRoutes);

// connect to database
connectDB();

// ❗ use server.listen instead of app.listen
server.listen(process.env.Port, () => {
    console.log(`Server is running on port ${process.env.Port}`);
});