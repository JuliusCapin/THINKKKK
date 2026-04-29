require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const mongoose = require('mongoose');
const quizRoute = require('./routes/quiz');
const authRoute = require('./routes/auth');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  hidePoweredBy: true,
  referrerPolicy: { policy: 'no-referrer' },
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/api', quizRoute);
app.use('/api/auth', authRoute);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/login.html'));
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
