const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Score = require('../models/Score');

const JWT_SECRET = process.env.JWT_SECRET || 'thinkpp_secret';

// Middleware to verify token
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ error: 'Username already taken' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashed });

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'Invalid username or password' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Invalid username or password' });

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save score
router.post('/score', authMiddleware, async (req, res) => {
    try {
        const { score, total, difficulty } = req.body;
        await Score.create({
            userId: req.user.id,
            username: req.user.username,
            score,
            total,
            difficulty
        });
        res.json({ message: 'Score saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Leaderboard - top 10 scores
router.get('/leaderboard', async (req, res) => {
    try {
        const scores = await Score.find()
            .sort({ score: -1, createdAt: 1 })
            .limit(10)
            .select('username score total difficulty createdAt');
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;