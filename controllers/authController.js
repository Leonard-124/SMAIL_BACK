const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {createUser, findUserByEmail, storeRefreshToken, getUserByRefreshToken} = require("../models/authModel.js")


function generateAccessToken(userId) {
    return jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "45s"})
}

function generateRefreshToken(userId) {
    return jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "20m"})
}


async function register(req, res) {
    const {username, email, password, confirmPassword} = req.body;
    if(password !== confirmPassword) return res.status(400).json({error: "Passwords do not match"})
    
    const existing = await findUserByEmail(email);
    if(existing) return res.status(400).json({error:"Email already registered"});

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({username, email, hashedPassword});

    res.status(201).json({message: 'User registered', user: {id: user.id, email: user.email}});
}

async function login(req, res) {
    const {email, password} = req.body;
    const user = await findUserByEmail(email);
    if(!user) return res.status(400).json({error: "Invalid credentials"});

    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.status(400).json({error: "Invalid credentials"});

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    res.json({accessToken, refreshToken})
}

async function refresh(req, res) {
    const {token} = req.body;
    if(!token) return res.status(401).json({error: "Missing refresh token"});

    const user = await getUserByRefreshToken(token);
    if(!user) return res.status(403).json({error: "Invalid refresh token"});

    try {
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);
        await storeRefreshToken(user.id, newRefreshToken);
        res.json({accessToken: newAccessToken, refreshToken: newRefreshToken});
    } catch (err) {
        res.status(403).json({error: "Token expired or invalid"})
    }
}

async function logout(req, res) {
    const {token} = req.body;
    if(!token) return res.status(400).json({error: "Missing token"});

    const user = await getUserByRefreshToken(token);
    if(user) await storeRefreshToken(user.id, null);

    res.json({message: "Logged out successfully"});
}

module.exports = {register, login, refresh, logout};