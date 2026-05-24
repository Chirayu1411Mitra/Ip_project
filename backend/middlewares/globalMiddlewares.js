import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import express from "express";

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

export const applyGlobalMiddlewares = (app) => {
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Normalize: strip trailing slash
      const normalizedOrigin = origin.replace(/\/$/, "");

      const isAllowed = allowedOrigins.some(
        (allowed) => allowed.replace(/\/$/, "") === normalizedOrigin
      );

      if (isAllowed) return callback(null, true);

      console.warn("CORS blocked origin:", origin);
      console.warn("Allowed origins:", allowedOrigins);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  };

  // Avoid using app.options("*") which can crash on some hosts (path-to-regexp).
  // Use the cors middleware and a safe OPTIONS handler instead.
  app.use(cors(corsOptions));
  app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      return cors(corsOptions)(req, res, next);
    }
    next();
  });
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use(express.json());
};