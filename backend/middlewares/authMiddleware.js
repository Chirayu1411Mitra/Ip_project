import { verifyToken } from "../utils/genToken.js";
import User from "../db/schemas/User.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  console.log("Auth Middleware - Token in cookies:", !!token);
  console.log("Auth Middleware - All cookies:", req.cookies);

  if (!token) {
    console.log("Auth Middleware - No token found, returning 401");
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = verifyToken(token);
    console.log(
      "Auth Middleware - Token verified for userId:",
      decoded?.userId,
    );

    // Check if user is suspended/banned
    const user = await User.findById(decoded.userId).select("bannedUntil banReason");
    if (user && user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
      console.log("Auth Middleware - User is banned, logging out.");
      res.clearCookie("token");
      return res.status(401).json({
        message: "Your account has been suspended.",
        banReason: user.banReason,
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("Auth Middleware - Token verification failed:", err.message);
    res.status(400).json({ message: "Invalid token." });
  }
};
