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
        // explicitly disallow origin without throwing an error to avoid 500 responses
        return callback(null, false);
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  // handle preflight requests with same CORS options without using a '*' route
  // (some router/path-to-regexp versions throw on '*' as a route path)
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
