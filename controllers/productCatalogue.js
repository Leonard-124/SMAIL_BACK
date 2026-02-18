// const productCatalogue = require("../models/productCatalogue.js")
// const express = require("express");
// const cloudinary = require("../config/cloudinary.js")


// //CREATE
// const createProduct = async (req, res) => {
//     console.log("Req.file:", req.file);
//     console.log("Req.body:", req.body);

//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "Image file is required"});
//         }
//         const uploadResult = await cloudinary.uploader.upload(req.file.path, {folder: "Products"});
//         const {name, description, category, quantity, price} = req.body;

//         const product = new productCatalogue({
//             image: uploadResult.secure_url,
//             publicId: uploadResult.public_id,
//             name,
//             description,
//             category,
//             quantity,
//             price,
//         });

//         const savedProduct = await product.save();
//         res.status(201).json(savedProduct);
//     } catch  (err) {
//         console.error("Error creating product:", err);
//         res.status(500).json({error: err.message})
//     }
// };

// //READ ALL
// const getProducts = async (req, res) => {
//     try {
//         const products = await productCatalogue.find().sort({createdAt: -1});
//         res.json(products);
//     } catch (err) {
//         res.status(500).json({error: err.message});
//     }
// };

// //READ ONE
// const getProductById = async (req, res) => {
//     try {
//         const product = await productCatalogue.findById(req.params.id);
//         if (!product) return res.status(404).json({error: "Product Not Found"});
//         res.json(product);
//     } catch (err) {
//         res.status(500).json({error: err.message});
//     }
// };

// //UPDATE
// const updateProduct = async (req, res) => {
//     try {
//         const {name, description, category, quantity, price} = req.body;
//         const updates = {name, description, category, quantity, price};

//         if (req.file) {
//             const product = await productCatalogue.findById(req.params.id);
//             if(!product) return res.status(404).json({error: "Product Not Found"});

//             if (product.publicId) {
//                 await cloudinary.uploader.destroy(product.publicId)
//             }

//             const uploadResult = await cloudinary.uploader.upload(req.file.path, {folder: "Products"});
//             updates.image = uploadResult.secure_url;
//             updates.publicId = uploadResult.public_id;
//         }

//         const product = await productCatalogue.findByIdAndUpdate(req.params.id, updates, {new: true, runValidators: true});

//         if (!product) return res.status(404).json({ error: "Product Not Found"});
//         res.json(product);
//     } catch (err) {
//         res.status(500).json({ error: err.message});
//     }
// };

// //DELETE

// const deleteProduct = async (req, res) => {
//     try{
//         const product = await productCatalogue.findById(req.params.id);
//         if(!product) return  res.status(404).json({error: "Product Not Found"});
//         if(product.publicId) {
//             await cloudinary.uploader.destroy(product.publicId);
//         }

//         await product.deleteOne();
//         res.json({message: "Product deleted successfully"});
//     } catch (err) {
//         res.status(500).json({error: err.message});
//     }
// };

// module.exports = {createProduct, getProductById, getProducts, updateProduct, deleteProduct}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const productCatalogue = require("../models/productCatalogue.js");
const cloudinary = require("../config/cloudinary.js");
const fs = require("fs");

// ✅ Helper: clean up temp file after multer upload
function cleanupFile(filePath) {
  if (filePath) {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("Failed to delete temp file:", err.message);
      }
    });
  }
}

// CREATE
const createProduct = async (req, res) => {
  let tempPath = req.file?.path;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // ✅ FIX: explicitly coerce numeric fields from req.body (body is always strings)
    const { name, description, category } = req.body;
    const quantity = Number(req.body.quantity);
    const price = Number(req.body.price);

    if (!name || !description || !category) {
      return res.status(400).json({ error: "Name, description, and category are required" });
    }
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }
    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ error: "Quantity must be a non-negative number" });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "Products",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
    });

    const product = new productCatalogue({
      image: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      quantity,
      price,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Failed to create product" });
  } finally {
    cleanupFile(tempPath); // ✅ FIX: always delete temp file
  }
};

// READ ALL
const getProducts = async (req, res) => {
  try {
    const products = await productCatalogue.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// READ ONE
const getProductById = async (req, res) => {
  try {
    const product = await productCatalogue.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// UPDATE
const updateProduct = async (req, res) => {
  let tempPath = req.file?.path;
  try {
    const { name, description, category } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (description) updates.description = description.trim();
    if (category) updates.category = category.trim();
    if (req.body.price !== undefined) {
      const price = Number(req.body.price);
      if (isNaN(price) || price <= 0) return res.status(400).json({ error: "Invalid price" });
      updates.price = price;
    }
    if (req.body.quantity !== undefined) {
      const quantity = Number(req.body.quantity);
      if (isNaN(quantity) || quantity < 0) return res.status(400).json({ error: "Invalid quantity" });
      updates.quantity = quantity;
    }

    if (req.file) {
      const existing = await productCatalogue.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: "Product not found" });

      if (existing.publicId) {
        await cloudinary.uploader.destroy(existing.publicId);
      }

      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "Products",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
      });
      updates.image = uploadResult.secure_url;
      updates.publicId = uploadResult.public_id;
    }

    const product = await productCatalogue.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  } finally {
    cleanupFile(tempPath); // ✅ FIX: always delete temp file
  }
};

// DELETE
const deleteProduct = async (req, res) => {
  try {
    const product = await productCatalogue.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.publicId) {
      await cloudinary.uploader.destroy(product.publicId);
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

module.exports = { createProduct, getProductById, getProducts, updateProduct, deleteProduct };