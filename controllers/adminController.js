const { pool } = require("../database/db.js");
const productCatalogue = require("../models/productCatalogue.js");
const bcrypt = require("bcryptjs");

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/users - Get all users
 */
async function getAllUsers(req, res) {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, username, email, created_at 
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (username ILIKE $1 OR email ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = search
      ? `SELECT COUNT(*) FROM users WHERE username ILIKE $1 OR email ILIKE $1`
      : `SELECT COUNT(*) FROM users`;
    const countParams = search ? [`%${search}%`] : [];
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

/**
 * GET /api/v1/admin/users/:id - Get single user details
 */
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, username, email, created_at FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

/**
 * DELETE /api/v1/admin/users/:id - Delete user
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Prevent admins from deleting themselves
    if (parseInt(id) === req.userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ Admin ${req.adminEmail} deleted user ID ${id}`);
    res.json({ message: "User deleted successfully", userId: id });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

/**
 * PUT /api/v1/admin/users/:id/password - Reset user password
 */
async function resetUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const result = await pool.query(
      `UPDATE users SET password = $1, refresh_token = NULL WHERE id = $2 RETURNING id`,
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ Admin ${req.adminEmail} reset password for user ID ${id}`);
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
}

// ─── CART MANAGEMENT ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/carts - View all user carts (from localStorage simulation)
 * Note: Since carts are stored in frontend localStorage, this returns empty.
 * To track carts server-side, you'd need a carts table.
 */
async function getAllCarts(req, res) {
  res.json({
    message: "Cart data is stored client-side. To view carts, implement a server-side carts table.",
    suggestion: "Add a 'carts' table with user_id, product_id, quantity columns",
  });
}

// ─── PRODUCT MANAGEMENT ───────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/products - Get all products with filters
 */
async function getAllProducts(req, res) {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    const products = await productCatalogue
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await productCatalogue.countDocuments(query);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

/**
 * GET /api/v1/admin/stats - Dashboard statistics
 */
async function getDashboardStats(req, res) {
  try {
    // User stats
    const userCount = await pool.query(`SELECT COUNT(*) FROM users`);
    const recentUsers = await pool.query(
      `SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'`
    );

    // Product stats
    const productCount = await productCatalogue.countDocuments();
    const lowStockProducts = await productCatalogue.countDocuments({ quantity: { $lt: 10 } });

    // Password reset stats
    const pendingResets = await pool.query(
      `SELECT COUNT(*) FROM password_resets WHERE used = false AND expires_at > NOW()`
    );

    res.json({
      users: {
        total: parseInt(userCount.rows[0].count),
        newThisWeek: parseInt(recentUsers.rows[0].count),
      },
      products: {
        total: productCount,
        lowStock: lowStockProducts,
      },
      passwordResets: {
        pending: parseInt(pendingResets.rows[0].count),
      },
    });
  } catch (err) {
    console.error("Get stats error:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
}

/**
 * GET /api/v1/admin/activity - Recent admin activity log
 */
async function getActivityLog(req, res) {
  try {
    const { limit = 50 } = req.query;

    // Get recent password resets
    const resets = await pool.query(
      `SELECT pr.created_at, u.email, pr.used 
       FROM password_resets pr 
       JOIN users u ON pr.user_id = u.id 
       ORDER BY pr.created_at DESC 
       LIMIT $1`,
      [limit]
    );

    // Get recently created users
    const users = await pool.query(
      `SELECT username, email, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );

    res.json({
      recentPasswordResets: resets.rows,
      recentUsers: users.rows,
    });
  } catch (err) {
    console.error("Get activity error:", err);
    res.status(500).json({ error: "Failed to fetch activity log" });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  resetUserPassword,
  getAllCarts,
  getAllProducts,
  getDashboardStats,
  getActivityLog,
};