
const { pool } = require("../database/db.js");
const crypto = require("crypto");

/**
 * Generate a 6-digit numeric reset code
 */
function generateResetCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a secure random token for URL-based reset (fallback)
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create or update password reset request
 * @param {number} userId 
 * @param {string} email 
 * @returns {Promise<{code: string, token: string, expiresAt: Date}>}
 */
async function createPasswordReset(userId, email) {
  const code = generateResetCode();
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await pool.query(
    `INSERT INTO password_resets (user_id, email, reset_code, reset_token, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) 
     DO UPDATE SET 
       reset_code = EXCLUDED.reset_code,
       reset_token = EXCLUDED.reset_token,
       expires_at = EXCLUDED.expires_at,
       used = false,
       created_at = NOW()`,
    [userId, email, code, token, expiresAt]
  );

  return { code, token, expiresAt };
}

/**
 * Find valid reset request by code
 */
async function findResetByCode(email, code) {
  const result = await pool.query(
    `SELECT pr.*, u.id as user_id, u.email, u.username
     FROM password_resets pr
     JOIN users u ON pr.user_id = u.id
     WHERE pr.email = $1 
       AND pr.reset_code = $2 
       AND pr.expires_at > NOW()
       AND pr.used = false`,
    [email, code]
  );
  return result.rows[0] || null;
}

/**
 * Find valid reset request by token (fallback)
 */
async function findResetByToken(token) {
  const result = await pool.query(
    `SELECT pr.*, u.id as user_id, u.email, u.username
     FROM password_resets pr
     JOIN users u ON pr.user_id = u.id
     WHERE pr.reset_token = $1 
       AND pr.expires_at > NOW()
       AND pr.used = false`,
    [token]
  );
  return result.rows[0] || null;
}

/**
 * Mark reset request as used
 */
async function markResetAsUsed(resetId) {
  await pool.query(
    `UPDATE password_resets SET used = true WHERE id = $1`,
    [resetId]
  );
}

/**
 * Delete expired reset requests (cleanup job)
 */
async function deleteExpiredResets() {
  const result = await pool.query(
    `DELETE FROM password_resets WHERE expires_at < NOW() OR used = true`,
  );
  return result.rowCount;
}

module.exports = {
  generateResetCode,
  generateResetToken,
  createPasswordReset,
  findResetByCode,
  findResetByToken,
  markResetAsUsed,
  deleteExpiredResets,
};