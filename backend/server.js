import express from "express";
import dotenv from "dotenv";

import connectDB from "./db/config.js";
import { applyGlobalMiddlewares } from "./middlewares/globalMiddlewares.js";
import authRoutes from "./routes/authRoutes.js";

// Load environment variables first
dotenv.config();

const app = express();

applyGlobalMiddlewares(app);

app.use("/api/auth", authRoutes);

// connect to database
connectDB();

app.listen(process.env.Port, () => {
  console.log(`Server is running on port ${process.env.Port}`);
});
