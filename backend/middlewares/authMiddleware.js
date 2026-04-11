import { verifyToken } from "../utils/genToken.js";
export const authMiddleware = (req, res, next) => {
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
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("Auth Middleware - Token verification failed:", err.message);
    res.status(400).json({ message: "Invalid token." });
  }
};
