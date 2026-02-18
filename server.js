
// const express = require("express");
// const morgan = require("morgan");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");

// dotenv.config();

// // ✅ FIX: updated import to match renamed connectPG (was connnectDB with triple n)
// const { connectPG } = require("./database/db.js");
// const { connectDB } = require("./database/mongo.js");

// const authRoutes = require("./routes/authRoute.js");
// const mpesaRoute = require("./routes/mpesaRoute.js");
// const prodCatRoute = require("./routes/prodCatRoute.js");

// const app = express();
// const PORT = process.env.PORT || 4000;

// // ─── Security Headers ─────────────────────────────────────────────────────────
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//     contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
//   })
// );

// // ─── CORS ─────────────────────────────────────────────────────────────────────
// const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5174")
//   .split(",")
//   .map((o) => o.trim());

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error(`CORS: origin ${origin} not allowed`));
//       }
//     },
//     credentials: true,
//   })
// );

// // ─── Rate Limiting ─────────────────────────────────────────────────────────────
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 20,
//   message: { error: "Too many requests, please try again later." },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // ✅ FIX: added dedicated M-Pesa rate limiter to prevent payment abuse
// const mpesaLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message: { error: "Too many payment requests. Please wait before trying again." },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200,
//   message: { error: "Too many requests, please try again later." },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // ─── Body Parsing ─────────────────────────────────────────────────────────────
// app.use(express.json({ limit: "10kb" }));
// app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// app.use(cookieParser());

// // ─── Logging ──────────────────────────────────────────────────────────────────
// if (process.env.NODE_ENV !== "test") {
//   app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
// }

// // ─── Health Check ─────────────────────────────────────────────────────────────
// app.get("/health", (req, res) =>
//   res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV })
// );

// // ─── Routes ───────────────────────────────────────────────────────────────────
// app.use("/api/v1/auth", authLimiter, authRoutes);
// app.use("/api/v1/prodCat", generalLimiter, prodCatRoute);

// // ✅ FIX: M-Pesa router now mounted at /api/mpesa — handlers use relative paths (/stkpush, /callback, /query)
// app.use("/api/mpesa", mpesaLimiter, mpesaRoute);

// // ─── 404 Handler ─────────────────────────────────────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({ error: "Route not found" });
// });

// // ─── Global Error Handler ─────────────────────────────────────────────────────
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err.stack || err);
//   res.status(err.status || 500).json({
//     error:
//       process.env.NODE_ENV === "production"
//         ? "Internal server error"
//         : err.message,
//   });
// });

// // ─── Start ────────────────────────────────────────────────────────────────────
// async function startServer() {
//   await connectDB();
//   await connectPG();
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
//   });
// }

// startServer();

// module.exports = app;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

// ✅ FIX: updated import to match renamed connectPG (was connnectDB with triple n)
const { connectPG } = require("./database/db.js");
const { connectDB } = require("./database/mongo.js");
const { cleanupExpiredResets } = require("./controllers/passwordResetController.js");

const authRoutes = require("./routes/authRoute.js");
const mpesaRoute = require("./routes/mpesaRoute.js");
const prodCatRoute = require("./routes/prodCatRoute.js");

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5174")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ FIX: added dedicated M-Pesa rate limiter to prevent payment abuse
const mpesaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many payment requests. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/prodCat", generalLimiter, prodCatRoute);

// ✅ FIX: M-Pesa router now mounted at /api/mpesa — handlers use relative paths (/stkpush, /callback, /query)
app.use("/api/mpesa", mpesaLimiter, mpesaRoute);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ─── Cleanup Jobs ─────────────────────────────────────────────────────────────
// Run expired password reset cleanup every 6 hours
setInterval(cleanupExpiredResets, 6 * 60 * 60 * 1000);

// ─── Start ────────────────────────────────────────────────────────────────────
async function startServer() {
  await connectDB();
  await connectPG();
  
  // Run cleanup on startup
  cleanupExpiredResets();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
  });
}

startServer();

module.exports = app;