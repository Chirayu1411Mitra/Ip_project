import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import express from "express";

export const applyGlobalMiddlewares = (app) => {
  const rawClientUrls =
    process.env.CLIENT_URLS ||
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URLS ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

  const parseOrigins = (raw) => {
    return String(raw)
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean)
      .map((u) => {
        try {
          return new URL(u).origin;
        } catch (err) {
          // fallback: strip path if someone passed a full URL with path
          return u.replace(/^(https?:\/\/[^\/]+).*/i, "$1");
        }
      });
  };

  const allowedOrigins = parseOrigins(rawClientUrls);

  const corsOptions = {
    origin: (origin, callback) => {
      // allow non-browser requests (Postman, server-to-server) which have no origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS policy does not allow origin ${origin}`));
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  // handle preflight requests with same CORS options
  app.options("*", cors(corsOptions));
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use(express.json());
};
