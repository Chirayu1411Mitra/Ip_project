import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import express from "express";

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);

export const applyGlobalMiddlewares = (app) => {
  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use(express.json());
};