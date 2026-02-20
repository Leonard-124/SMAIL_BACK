const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware.js");
const { isAdmin } = require("../middlewares/adminMiddleware.js");
const {
  getAllUsers,
  getUserById,
  deleteUser,
  resetUserPassword,
  getAllCarts,
  getAllProducts,
  getDashboardStats,
  getActivityLog,
} = require("../controllers/adminController.js");

// Import product controller functions for admin use
const {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productCatalogue.js");

const multer = require("multer");
const path = require("path");

const router = express.Router();

// All admin routes require authentication + admin check
router.use(verifyToken, isAdmin);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
router.get("/stats", getDashboardStats);
router.get("/activity", getActivityLog);

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/password", resetUserPassword);

// ─── CART MANAGEMENT ──────────────────────────────────────────────────────────
router.get("/carts", getAllCarts);

// ─── PRODUCT MANAGEMENT ───────────────────────────────────────────────────────
// Get all products with admin filters
router.get("/products", getAllProducts);

// Get single product
router.get("/products/:id", getProductById);

// Create product (with image upload)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG and WebP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

router.post("/products", upload.single("image"), createProduct);

// Update product
router.put("/products/:id", upload.single("image"), updateProduct);

// Delete product
router.delete("/products/:id", deleteProduct);

module.exports = router;