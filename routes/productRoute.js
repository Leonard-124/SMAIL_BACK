const express = require("express");
const multer = require("multer");

const {createProduct, getProducts, getProductById, updateProduct, deleteProduct} = require("../controllers/productController.js");

const router = express.Router()

const upload = multer({ dest: 'uploads/'});

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", upload.single('image'), createProduct);
router.put("/:id", upload.single('image'), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;