
//import { pool } from "../database/db.js"
const {pool} = require("../database/db.js")


async function getAllItems() {
    const result = await pool.query('SELECT * FROM items ORDER BY id DESC')
    return result.rows;
}

async function getItemById(id) {
    const result = await pool.query(
        'SELECT * FROM items WHERE id = $1', [id]);
        return result.rows[0];
}

async function createItem({item, quantity, price, image, category}) {
    const result = await pool.query(
        'INSERT INTO items (item, quantity, price, image, category) VALUES ($1, $2, $3, $4, $5) RETURNING * ',
        [item, quantity, price, image, category ]
    );
    return result.rows[0];
}

async function updateItem(id, {item, quantity, price, image, category}) {
    const result = await pool.query(
        `UPDATE items
        SET item=$1, quantity=$2, price=$3, image=$4, category=$5
        WHERE id=$6 RETURNING *`,
        [item, quantity, price, image, category, id]
    );
    return result.rows[0];
}

async function deleteItem(id) {
    const result = await pool.query(
        'DELETE FROM items WHERE id = $1',[id]) 
}

module.exports = {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
}