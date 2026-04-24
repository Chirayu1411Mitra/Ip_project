import User from "../db/schemas/User.js";

/**
 * Middleware to track user activity (last active timestamp)
 * Updates the lastActive field for all users (authenticated and during login)
 * Only updates if last update was more than 30 seconds ago to reduce DB writes
 */
export const trackActivity = async (req, res, next) => {
  // Extract userId from either existing req.userId or from request body (for login/register)
  let userId = req.userId;
  
  // For login/register endpoints, we'll update after auth is successful
  // So we skip for unauthenticated auth endpoints
  if (!userId && req.path === '/login') {
    return next(); // Will be handled after successful login
  }
  
  try {
    if (userId) {
      const now = new Date();
      const user = await User.findById(userId);
      
      // Only update if lastActive is older than 30 seconds
      if (user && (!user.lastActive || (now - user.lastActive) > 30000)) {
        await User.findByIdAndUpdate(userId, { lastActive: now }, { new: true });
        console.log(`Activity tracked for user ${userId} at ${now}`);
      }
    }
  } catch (err) {
    console.error("Activity tracking error:", err);
    // Don't fail the request if tracking fails
  }
  
  next();
};
