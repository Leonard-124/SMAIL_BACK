
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const {
//   createUser,
//   findUserByEmail,
//   storeRefreshToken,
//   getUserByRefreshToken,
// } = require("../models/authModel.js");

// const ACCESS_TOKEN_EXPIRY = "15m";
// const REFRESH_TOKEN_EXPIRY = "7d";

// function generateAccessToken(userId) {
//   return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: ACCESS_TOKEN_EXPIRY,
//   });
// }

// function generateRefreshToken(userId) {
//   return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
//     expiresIn: REFRESH_TOKEN_EXPIRY,
//   });
// }

// function setRefreshTokenCookie(res, token) {
//   res.cookie("refreshToken", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
//   });
// }

// async function register(req, res) {
//   try {
//     const { username, email, password, confirmPassword } = req.body;

//     if (!username || !email || !password || !confirmPassword) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ error: "Passwords do not match" });
//     }

//     if (password.length < 8) {
//       return res
//         .status(400)
//         .json({ error: "Password must be at least 8 characters" });
//     }

//     const existing = await findUserByEmail(email);
//     if (existing) {
//       return res.status(409).json({ error: "Email already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);
//     const user = await createUser({ username, email, hashedPassword });

//     res.status(201).json({
//       message: "Account created successfully",
//       user: { id: user.id, email: user.email, username: user.username },
//     });
//   } catch (err) {
//     console.error("Register error:", err);
//     res.status(500).json({ error: "Registration failed. Please try again." });
//   }
// }

// async function login(req, res) {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     const user = await findUserByEmail(email);
//     if (!user) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     const accessToken = generateAccessToken(user.id);
//     const refreshToken = generateRefreshToken(user.id);
//     await storeRefreshToken(user.id, refreshToken);

//     setRefreshTokenCookie(res, refreshToken);

//     res.json({
//       accessToken,
//       user: { id: user.id, email: user.email, username: user.username },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ error: "Login failed. Please try again." });
//   }
// }

// async function refresh(req, res) {
//   try {
//     // Read from httpOnly cookie (preferred) or body (fallback)
//     const token = req.cookies?.refreshToken || req.body?.token;

//     if (!token) {
//       return res.status(401).json({ error: "Missing refresh token" });
//     }

//     // Verify the JWT before DB lookup to fail fast
//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
//     } catch (err) {
//       return res.status(403).json({ error: "Refresh token expired or invalid" });
//     }

//     const user = await getUserByRefreshToken(token);
//     if (!user) {
//       return res.status(403).json({ error: "Refresh token revoked" });
//     }

//     const newAccessToken = generateAccessToken(user.id);
//     const newRefreshToken = generateRefreshToken(user.id);
//     await storeRefreshToken(user.id, newRefreshToken);

//     setRefreshTokenCookie(res, newRefreshToken);

//     res.json({ accessToken: newAccessToken });
//   } catch (err) {
//     console.error("Refresh error:", err);
//     res.status(500).json({ error: "Token refresh failed" });
//   }
// }

// async function logout(req, res) {
//   try {
//     const token = req.cookies?.refreshToken || req.body?.token;

//     if (token) {
//       const user = await getUserByRefreshToken(token);
//       if (user) await storeRefreshToken(user.id, null);
//     }

//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//     });

//     res.json({ message: "Logged out successfully" });
//   } catch (err) {
//     console.error("Logout error:", err);
//     res.status(500).json({ error: "Logout failed" });
//   }
// }

// async function getMe(req, res) {
//   try {
//     const { findUserById } = require("../models/authModel.js");
//     const user = await findUserById(req.userId);
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json({ user });
//   } catch (err) {
//     console.error("GetMe error:", err);
//     res.status(500).json({ error: "Failed to fetch user" });
//   }
// }

// module.exports = { register, login, refresh, logout, getMe };

/////////////////////////////////////////////////////////////////////////////////////////////////////

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByEmail,
  findUserById, // ✅ FIX: imported at top level instead of inline require inside getMe
  storeRefreshToken,
  getUserByRefreshToken,
} = require("../models/authModel.js");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

function setRefreshTokenCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function register(req, res) {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (username.length < 2 || username.length > 50) {
      return res.status(400).json({ error: "Username must be between 2 and 50 characters" });
    }

    const existing = await findUserByEmail(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await createUser({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      hashedPassword,
    });

    res.status(201).json({
      message: "Account created successfully",
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      accessToken,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
}

async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken || req.body?.token;
    if (!token) {
      return res.status(401).json({ error: "Missing refresh token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(403).json({ error: "Refresh token expired or invalid" });
    }

    const user = await getUserByRefreshToken(token);
    if (!user) {
      return res.status(403).json({ error: "Refresh token revoked" });
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, newRefreshToken);

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ error: "Token refresh failed" });
  }
}

async function logout(req, res) {
  try {
    const token = req.cookies?.refreshToken || req.body?.token;
    if (token) {
      const user = await getUserByRefreshToken(token);
      if (user) await storeRefreshToken(user.id, null);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
}

async function getMe(req, res) {
  try {
    const user = await findUserById(req.userId); // ✅ FIX: uses top-level import
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

module.exports = { register, login, refresh, logout, getMe };