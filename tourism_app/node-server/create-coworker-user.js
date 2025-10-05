const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

async function createCoWorkerUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourism_app', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Connected to MongoDB');

        // Check if co-worker user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: 'coworker@tourism.so' },
                { username: 'coworker' }
            ]
        });

        if (existingUser) {
            console.log('👤 Co-worker user already exists:', {
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role
            });
            
            // Update role if needed
            if (existingUser.role !== 'co-worker') {
                existingUser.role = 'co-worker';
                await existingUser.save();
                console.log('✅ Updated user role to co-worker');
            }
            
            return;
        }

        // Create co-worker user
        const coworkerUser = new User({
            username: 'coworker',
            email: 'coworker@tourism.so',
            password: 'coworker123', // This will be hashed automatically
            role: 'co-worker',
            isActive: true,
            lastActiveAt: new Date(),
            lastLoginAt: new Date(),
            loginCount: 0
        });

        await coworkerUser.save();
        
        console.log('✅ Co-worker user created successfully!');
        console.log('👤 User details:', {
            username: coworkerUser.username,
            email: coworkerUser.email,
            role: coworkerUser.role,
            isActive: coworkerUser.isActive
        });
        
        console.log('\n🔑 Login credentials:');
        console.log('Username: coworker');
        console.log('Email: coworker@tourism.so');
        console.log('Password: coworker123');
        console.log('\n📝 This user can access:');
        console.log('- Overview dashboard');
        console.log('- Tourists management');
        console.log('- Bookings management');
        console.log('- Destinations management');
        console.log('❌ Cannot access: Analytics (admin only)');

    } catch (error) {
        console.error('❌ Error creating co-worker user:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the function
createCoWorkerUser();
