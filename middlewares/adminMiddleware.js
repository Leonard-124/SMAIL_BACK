const { findUserByEmail } = require("../models/authModel.js");

// Hardcoded admin emails - only these emails have admin access
const ADMIN_EMAILS = [
  "leonardoduor91@gmail.com",
  "alvynox097@gmail.com",
];

/**
 * Middleware to check if authenticated user is an admin
 * Must be used AFTER verifyToken middleware
 */
async function isAdmin(req, res, next) {
  try {
    // req.userId is set by verifyToken middleware
    if (!req.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get user email from database
    const { findUserById } = require("../models/authModel.js");
    const user = await findUserById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user email is in admin list
    if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return res.status(403).json({
        error: "Access denied. Admin privileges required.",
      });
    }

    // User is admin - attach email to request for logging
    req.adminEmail = user.email;
    next();
  } catch (err) {
    console.error("Admin check error:", err);
    res.status(500).json({ error: "Authorization check failed" });
  }
}

/**
 * Check if an email is an admin (utility function)
 */
function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

module.exports = { isAdmin, isAdminEmail, ADMIN_EMAILS };