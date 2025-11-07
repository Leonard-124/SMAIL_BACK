
const {pool} = require("../database/db.js");

async function createUser({username, email, hashedPassword}) {
    const result = await pool.query(
        `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURN *`,
        [username, email, hashedPassword]
    );
    return result.rows[0];
}

async function findUserByEmail(email) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`,[email] );
    return result.rows[0];
}

async function storeRefreshToken(userId, token) {
    await pool.query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [token, userId]);
}

async function getUserByRefreshToken(token) {
    const result = await pool.query(`SELECT * FROM users WHERE refresh_token = $1`, [token]);
    return result.rows[0];
}

module.exports = {
    createUser,
    findUserByEmail,
    storeRefreshToken,
    getUserByRefreshToken
};