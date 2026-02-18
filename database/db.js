
// const { Pool } = require("pg");

// const pool = new Pool({
//   connectionString: process.env.NEON_DB_URI,
//   ssl:
//     process.env.NODE_ENV === "production"
//       ? { rejectUnauthorized: false }
//       : false,
// });

// pool.on("error", (err) => {
//   console.error("Unexpected error on idle PostgreSQL client", err);
//   process.exit(-1);
// });

// async function connnectDB() {
//   try {
//     const client = await pool.connect();
//     console.log("✅ PostgreSQL connected");
//     client.release();
//   } catch (err) {
//     console.error("❌ PostgreSQL connection failed:", err.message);
//     process.exit(1);
//   }
// }

// module.exports = { pool, connnectDB };
/////////////////////////////////////////////////////////////////////

const { Pool } = require("pg");

require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.NEON_DB_URI,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
  process.exit(-1);
});

// ✅ FIX: renamed from connnectDB (triple-n typo) to connectPG
async function connectPG() {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = { pool, connectPG };