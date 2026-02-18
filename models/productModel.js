const {pool} = require("../database/db.js")

async function getAllProducts() {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
}

async function getProductById(id) {
    const result = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);
    return result.rows[0];
}

async function createProduct({name, description, category, quantity, oldPrice, newPrice, imageUrl, publicId}) {
    const result = await pool.query(
        `INSERT INTO products (name, description, category, quantity, old_price, new_price, image_url, public_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [name, description, category, quantity, oldPrice, newPrice, imageUrl, publicId ]
    );
    return result.rows[0];
}

async function updateProduct(id, updates) {
    const {name, description, category, quantity, oldPrice, newPrice, imageUrl, publicId} = updates;
    const result = await pool.query(
        `UPDATE products SET name=$1, description=$2, category=$3, quantity=$4, old_price=$5, new_price=$6, image_url=$7 public_id=$8
        WHERE id=$9 RETURNING *`,
        [name, description, category, quantity, oldPrice, newPrice, imageUrl, publicId, id]
    );
    return result.rows[0];
}

async function deleteProduct(id) {
    await pool.query('DELETE FROM products WHERE id=$1', [id]);
}

module.exports = {getAllProducts, getProductById, createProduct, updateProduct, deleteProduct}