import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import express from "express";

export const applyGlobalMiddlewares = (app) => {
  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";
  app.use(
    cors({
      origin: clientUrl,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use(express.json());
};
