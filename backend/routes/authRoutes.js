import express from "express";
import {
  login,
  register,
  registerFaculty,
  logout,
  getMe,
  updateProfile,
  searchUsers,
} from "../controller/AuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const authrouter = express.Router();
authrouter.post("/login", login);
authrouter.post("/register", register);
authrouter.post("/register-faculty", registerFaculty);
authrouter.post("/logout", authMiddleware, logout);
authrouter.get("/me", authMiddleware, getMe);
authrouter.patch("/profile", authMiddleware, updateProfile);
authrouter.get("/search", authMiddleware, searchUsers);

export default authrouter;
