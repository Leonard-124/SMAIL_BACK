
const bcrypt = require("bcryptjs");
const { findUserByEmail } = require("../models/authModel.js");
const {
  createPasswordReset,
  findResetByCode,
  findResetByToken,
  markResetAsUsed,
} = require("../models/passwordResetModel.js");
const { sendPasswordResetEmail } = require("../utils/Emailservice.js");
const { pool } = require("../database/db.js");

/**
 * POST /api/v1/auth/forgot-password
 * Request a password reset code
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await findUserByEmail(email.toLowerCase().trim());
    
    // Security: Always return success even if email doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return res.json({
        message: "If that email exists, a reset code has been sent",
      });
    }

    // Generate reset code and token
    const { code, token, expiresAt } = await createPasswordReset(user.id, user.email);

    // Send email
    try {
      await sendPasswordResetEmail({
        to: user.email,
        username: user.username,
        code,
        token,
      });

      res.json({
        message: "Password reset code sent to your email",
        // For development only - remove in production:
        ...(process.env.NODE_ENV !== "production" && { dev_code: code }),
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      return res.status(500).json({
        error: "Failed to send reset email. Please try again later.",
      });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
}

/**
 * POST /api/v1/auth/verify-reset-code
 * Verify the reset code is valid
 */
async function verifyResetCode(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const reset = await findResetByCode(email.toLowerCase().trim(), code);

    if (!reset) {
      return res.status(400).json({
        error: "Invalid or expired reset code",
      });
    }

    // Return a temporary token for the reset password step
    // This allows the frontend to proceed without exposing the reset token in the URL
    res.json({
      message: "Code verified",
      resetToken: reset.reset_token,
    });
  } catch (err) {
    console.error("Verify code error:", err);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
}

/**
 * POST /api/v1/auth/reset-password
 * Reset password using code or token
 */
async function resetPassword(req, res) {
  try {
    const { email, code, token, newPassword, confirmPassword } = req.body;

    // Validation
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Both password fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long",
      });
    }

    // Find reset request by code or token
    let reset;
    if (code && email) {
      reset = await findResetByCode(email.toLowerCase().trim(), code);
    } else if (token) {
      reset = await findResetByToken(token);
    } else {
      return res.status(400).json({
        error: "Either email + code or token is required",
      });
    }

    if (!reset) {
      return res.status(400).json({
        error: "Invalid or expired reset request",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await pool.query(
      `UPDATE users SET password = $1 WHERE id = $2`,
      [hashedPassword, reset.user_id]
    );

    // Mark reset request as used
    await markResetAsUsed(reset.id);

    // Invalidate all refresh tokens for this user (force re-login everywhere)
    await pool.query(
      `UPDATE users SET refresh_token = NULL WHERE id = $1`,
      [reset.user_id]
    );

    res.json({
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
}

/**
 * Cleanup job - delete expired reset requests
 * Call this periodically (e.g., via cron or on server startup)
 */
async function cleanupExpiredResets() {
  const { deleteExpiredResets } = require("../models/passwordResetModel.js");
  try {
    const deleted = await deleteExpiredResets();
    if (deleted > 0) {
      console.log(`🧹 Cleaned up ${deleted} expired password reset requests`);
    }
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}

module.exports = {
  forgotPassword,
  verifyResetCode,
  resetPassword,
  cleanupExpiredResets,
};