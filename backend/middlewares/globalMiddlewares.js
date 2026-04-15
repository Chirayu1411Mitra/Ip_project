import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import express from "express";

export const applyGlobalMiddlewares = (app) => {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use(express.json());
};
