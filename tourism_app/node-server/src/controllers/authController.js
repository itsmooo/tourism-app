const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'mySecretKey', {
        expiresIn: '7d', // Token expires in 7 days
    });
};

exports.registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Check if email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists', field: 'email' });
        }

        // Check if username already exists
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username already exists', field: 'username' });
        }

        const user = await User.create({
            username,
            email,
            password,
            role: role || 'tourist' // Default to tourist if not specified
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, username, password } = req.body;

    console.log('🔐 Login attempt:', { email, username, hasPassword: !!password });

    try {
        // Allow login by email or username
        const user = await User.findOne({
            $or: [
                { email: email },
                { username: username },
            ],
        });

        console.log('👤 User found:', user ? { id: user._id, username: user.username, email: user.email, role: user.role } : 'No user found');

        if (user && (await user.matchPassword(password))) {
            console.log('✅ Password match successful');
            
            // Update user activity tracking
            user.isActive = true;
            user.lastActiveAt = new Date();
            user.lastLoginAt = new Date();
            user.loginCount = (user.loginCount || 0) + 1;
            await user.save();
            
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                lastActiveAt: user.lastActiveAt,
                token: generateToken(user._id),
            });
        } else {
            console.log('❌ Password match failed or user not found');
            res.status(401).json({ message: 'Invalid email/username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add this endpoint for token verification
exports.verifyToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mySecretKey');
        res.status(200).json({ valid: true, userId: decoded.id });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Update user activity endpoint
exports.updateUserActivity = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update activity status
        user.isActive = true;
        user.lastActiveAt = new Date();
        await user.save();
        
        res.json({ 
            message: 'Activity updated successfully',
            isActive: user.isActive,
            lastActiveAt: user.lastActiveAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin endpoint to update any user
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, email, full_name, role, isActive } = req.body;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if username or email already exists (excluding current user)
        if (username || email) {
            const existingUser = await User.findOne({
                $and: [
                    { _id: { $ne: userId } },
                    { $or: [
                        ...(username ? [{ username }] : []),
                        ...(email ? [{ email }] : [])
                    ]}
                ]
            });
            
            if (existingUser) {
                if (existingUser.email === email) {
                    return res.status(400).json({ message: 'Email already exists' });
                }
                if (existingUser.username === username) {
                    return res.status(400).json({ message: 'Username already exists' });
                }
            }
        }
        
        // Update user fields
        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (full_name !== undefined) updateData.full_name = full_name;
        if (role !== undefined) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Refresh token endpoint
exports.refreshToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mySecretKey');
        
        // Generate new token with extended expiration
        const newToken = generateToken(decoded.id);
        
        res.status(200).json({ 
            token: newToken,
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mySecretKey');
        const userId = decoded.id;
        
        const { email, username } = req.body;
        
        // Check if username or email already exists (excluding current user)
        const existingUser = await User.findOne({
            $and: [
                { _id: { $ne: userId } },
                { $or: [{ email }, { username }] }
            ]
        });
        
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ message: 'Username already exists' });
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { email, username },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(updatedUser);
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: error.message });
    }
};