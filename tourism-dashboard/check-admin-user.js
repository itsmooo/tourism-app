const mongoose = require('mongoose');
const User = require('./tourism_app/node-server/src/models/User');
require('dotenv').config();

const checkAndCreateAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tourism_app');
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists:');
      console.log('👤 Username:', existingAdmin.username);
      console.log('📧 Email:', existingAdmin.email);
      console.log('👑 Role:', existingAdmin.role);
      console.log('🆔 ID:', existingAdmin._id);
    } else {
      console.log('❌ No admin user found. Creating one...');
      
      // Create admin user
      const adminUser = await User.create({
        username: 'admin',
        email: 'admin@tourism.com',
        password: 'admin123',
        role: 'admin'
      });

      console.log('✅ Admin user created successfully!');
      console.log('👤 Username:', adminUser.username);
      console.log('📧 Email:', adminUser.email);
      console.log('🔑 Password: admin123');
      console.log('👑 Role:', adminUser.role);
      console.log('🆔 ID:', adminUser._id);
    }

    console.log('');
    console.log('🔐 Use these credentials to login in the dashboard:');
    console.log('   Username: admin');
    console.log('   Email: admin@tourism.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run the script
checkAndCreateAdmin();
