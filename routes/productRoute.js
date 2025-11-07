const express = require("express");
const multer = require("multer");

const {createProduct, getProducts, getProductById, updateProduct, deleteProduct} = require("../controllers/productController.js");

const router = express.Router()

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", uploader.single())