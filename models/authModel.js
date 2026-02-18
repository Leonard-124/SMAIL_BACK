
// const { pool } = require("../database/db.js");

// async function createUser({ username, email, hashedPassword }) {
//   const result = await pool.query(
//     `INSERT INTO users (username, email, password)
//      VALUES ($1, $2, $3)
//      RETURNING id, username, email, created_at`,
//     [username, email, hashedPassword]
//   );
//   return result.rows[0];
// }

// async function findUserByEmail(email) {
//   const result = await pool.query(
//     `SELECT * FROM users WHERE email = $1`,
//     [email]
//   );
//   return result.rows[0] || null;
// }

// async function findUserById(id) {
//   const result = await pool.query(
//     `SELECT id, username, email, created_at FROM users WHERE id = $1`,
//     [id]
//   );
//   return result.rows[0] || null;
// }

// async function storeRefreshToken(userId, token) {
//   await pool.query(
//     `UPDATE users SET refresh_token = $1 WHERE id = $2`,
//     [token, userId]
//   );
// }

// async function getUserByRefreshToken(token) {
//   const result = await pool.query(
//     `SELECT * FROM users WHERE refresh_token = $1`,
//     [token]
//   );
//   return result.rows[0] || null;
// }

// module.exports = {
//   createUser,
//   findUserByEmail,
//   findUserById,
//   storeRefreshToken,
//   getUserByRefreshToken,
// };
////////////////////////////////////////////////////////////////////////////////////////////


const { pool } = require("../database/db.js");

async function createUser({ username, email, hashedPassword }) {
  const result = await pool.query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username, email, hashedPassword]
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, username, email, created_at FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function storeRefreshToken(userId, token) {
  await pool.query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [token, userId]);
}

async function getUserByRefreshToken(token) {
  const result = await pool.query(`SELECT * FROM users WHERE refresh_token = $1`, [token]);
  return result.rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  storeRefreshToken,
  getUserByRefreshToken,
};