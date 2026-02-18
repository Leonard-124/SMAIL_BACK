// const jwt = require("jsonwebtoken");

// function verifyToken(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if(!authHeader) return res.status(401).json({error: "Missing token"});

//     const token = authHeader.split(" ")[1];
//     try{
//         const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//         req.userId = decoded.userId;
//         next();
//     } catch (err) {
//         res.status(403).json({error: "Invalid or expired token"})
//     }
// }

// module.exports = {verifyToken};

///////////////////////////////////

const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
}

module.exports = { verifyToken };

