
const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    image: { type: String, required: true},
    publicId: { type: String, required: true},
    name: { type: String, required: true},
    description: { type: String, required: true},
    quantity: { type: Number, required: true},
    category: { type: String, required: true},
    price: { type: Number, required: true}
}, {timestamps: true})

module.exports = mongoose.model("Product", productSchema)