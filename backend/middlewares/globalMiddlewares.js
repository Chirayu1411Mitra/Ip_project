import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import express from "express";

export const applyGlobalMiddlewares = (app) => {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use(express.json());
};
