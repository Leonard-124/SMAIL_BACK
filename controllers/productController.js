const cloudinary = require("../config/cloudinary.js")
const ProductModel = require("../models/productModel.js")


async function createProduct(req, res) {
    try{
        if(!req.file) return res.status(400).json({error: "Image file required"});
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {folder: "Goods"});
        const {name, description, category, quantity, oldPrice, newPrice} = req.body;
        const product = await ProductModel.createProduct({
            name,
            description,
            category,
            oldPrice,
            newPrice,
            quantity,
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id
        });
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

async function getProducts(req, res) {
    try{
        const products = await ProductModel.getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

async function getProductById(req, res) {
    try{
        const product = await ProductModel.getProductById(req.params.id);
        if(!product) return res.status(404).json({error:"Not found"});
        res.json(product);
    } catch (err) {
        res.status(403).json({error: err.message})
    }
}

async function updateProduct(req, res) {
    try{
        const {name, description, category, quantity, oldPrice, newPrice} = req.body;
        let updates = {name, description, category, quantity, oldPrice, newPrice};
        if(req.file) {
            const existing = await ProductModel.getProductById(req.params.id);
            if(existing?.publicId) await cloudinary.uploader.destroy(existing.public_id);

            const uploadResult = await cloudinary.uploader.upload(req.file.path, {folder: "Goods"});
            updates.imageUrl = uploadResult.secure_url;
            updates.publicId = uploadResult.public_id;
        } else {
             const existing = await ProductModel.getProductById(req.params.id);
             updates.imageUrl = existing.image_url;
             updates.publicId = existing.public_id;
        }

        const updated = await ProductModel.updateProduct(req.params.id, updates);
        res.json(updated);
    } catch (err) {
        res.status(403).json({error: err.message})
    }
}

async function deleteProduct(req, res) {
    try{
        const product = await ProductModel.getProductById(req.params.id);
        if(!product) return res.status(404).json({error: "Not found"});

        if (product.public_id) await cloudinary.uploader.destroy(product.public_id);
        await ProductModel.deleteProduct(req.params.id);
        res.json({message: "Deleted successfully"})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
}

module.exports = {createProduct, getProducts, getProductById, updateProduct, deleteProduct};