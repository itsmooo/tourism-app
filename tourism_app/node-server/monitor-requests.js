require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./src/config/connectDB');

const app = express();

// Connect to MongoDB
connectDB();

// Enhanced logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`🕐 ${timestamp} - ${req.method} ${req.url}`);
    console.log(`📡 Headers:`, req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`📤 Body:`, req.body);
    }
    next();
});

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes with detailed logging
app.use('/api/auth', (req, res, next) => {
    console.log('🔐 AUTH REQUEST RECEIVED');
    next();
}, require('./src/routes/authRoutes'));

app.use('/api/users', (req, res, next) => {
    console.log('👥 USERS REQUEST RECEIVED');
    next();
}, require('./src/routes/userRoutes'));

app.use('/api/places', (req, res, next) => {
    console.log('🏖️ PLACES REQUEST RECEIVED');
    next();
}, require('./src/routes/placeRoutes'));

app.use('/api/bookings', (req, res, next) => {
    console.log('🎫 BOOKINGS REQUEST RECEIVED - THIS IS WHAT WE\'RE LOOKING FOR!');
    console.log('🎯 Method:', req.method);
    console.log('🎯 URL:', req.url);
    console.log('🎯 Body:', req.body);
    console.log('🎯 Auth Header:', req.headers.authorization);
    next();
}, require('./src/routes/bookingRoutes'));

app.use('/api/favorites', (req, res, next) => {
    console.log('❤️ FAVORITES REQUEST RECEIVED');
    next();
}, require('./src/routes/favoritesRoutes'));

app.use('/api/payments', (req, res, next) => {
    console.log('💳 PAYMENTS REQUEST RECEIVED');
    next();
}, require('./src/routes/paymentRoutes'));

// Basic route
app.get('/', (req, res) => {
    console.log('🏠 HOME REQUEST RECEIVED');
    res.send('Tourism App API is running - Monitoring requests...');
});

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
    console.log('🚀 MONITORING SERVER STARTED');
    console.log(`📡 Server running on port ${PORT}`);
    console.log('👀 Watching for Flutter booking requests...');
    console.log('');
    console.log('='.repeat(60));
    console.log('NOW TRY MAKING A BOOKING FROM FLUTTER');
    console.log('='.repeat(60));
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Monitoring server stopped');
    process.exit(0);
});
