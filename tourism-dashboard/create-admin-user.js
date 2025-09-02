#!/usr/bin/env node

/**
 * Create Admin User Script
 * This script creates an admin user for testing the dashboard
 */

const http = require('http');

function createAdminUser() {
  console.log('👤 Creating admin user for dashboard...\n');
  
  const userData = {
    username: 'admin',
    email: 'admin@tourism.com',
    password: 'admin123',
    full_name: 'Dashboard Admin',
    role: 'admin'
  };
  
  const postData = JSON.stringify(userData);
  
  const options = {
    hostname: 'localhost',
    port: 9000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log('✅ Admin user created successfully!');
          console.log('📋 Login credentials:');
          console.log('   Username: admin');
          console.log('   Email: admin@tourism.com');
          console.log('   Password: admin123');
          console.log('\n🔐 You can now login to the dashboard with these credentials');
        } else {
          console.log('⚠️  Response:', res.statusCode, response);
          if (response.message && response.message.includes('already exists')) {
            console.log('✅ Admin user already exists!');
            console.log('📋 Login credentials:');
            console.log('   Username: admin');
            console.log('   Email: admin@tourism.com');
            console.log('   Password: admin123');
          }
        }
      } catch (parseError) {
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your Node.js server is running:');
      console.log('   cd tourism_app/node-server');
      console.log('   npm start');
    }
  });
  
  req.write(postData);
  req.end();
}

// Run the script
createAdminUser();
