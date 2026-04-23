import express from "express";
import {
  login,
  register,
  logout,
  getMe,
  deleteAccount,
  registerFaculty,
} from "../controller/AuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const authrouter = express.Router();
authrouter.post("/login", login);
authrouter.post("/register", register);
authrouter.post("/register-faculty", registerFaculty);
authrouter.post("/logout", authMiddleware, logout);
authrouter.get("/me", authMiddleware, getMe);
authrouter.delete("/delete-account", authMiddleware, deleteAccount);

export default authrouter;
