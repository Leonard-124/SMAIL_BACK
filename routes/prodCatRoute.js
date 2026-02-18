// const express = require("express");
// const multer = require("multer");
// const {createProduct, getProductById, getProducts, updateProduct, deleteProduct} = require("../controllers/productCatalogue.js");

// const router = express.Router()

// const upload = multer({ dest: 'uploads/'});

// router.get("/", getProducts);
// router.get("/:id", getProductById);
// router.post("/", upload.single("image"), createProduct);
// router.put("/:id", upload.single("image"), updateProduct);
// router.delete("/:id", deleteProduct);

// module.exports = router;
///////////////////////////////////////////////////////////////////////////////////////////

const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productCatalogue.js");

const router = express.Router();

// ✅ FIX: Use disk storage with unique filenames instead of default dest
// This prevents filename collisions and ensures proper cleanup
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

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", upload.single("image"), createProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;

