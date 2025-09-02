#!/usr/bin/env node

/**
 * Tourism Dashboard Setup Script
 * This script helps you set up the dashboard to connect to your Node.js backend
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Tourism Dashboard...\n');

// Create .env.local file
const envContent = `# Tourism Dashboard Environment Configuration
NEXT_PUBLIC_API_URL=http://localhost:9000/api
NEXT_PUBLIC_DEBUG=true
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env.local');

try {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
  } else {
    console.log('⚠️  .env.local file already exists');
  }
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
}

// Check if Node.js server is running
const http = require('http');

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:9000/api/places', (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function verifyConnection() {
  console.log('\n🔍 Checking Node.js server connection...');
  
  const isServerRunning = await checkServer();
  
  if (isServerRunning) {
    console.log('✅ Node.js server is running on port 9000');
  } else {
    console.log('❌ Node.js server is not running on port 9000');
    console.log('\n📋 To start your Node.js server:');
    console.log('   cd tourism_app/node-server');
    console.log('   npm install');
    console.log('   npm start');
  }
  
  return isServerRunning;
}

// Main setup function
async function main() {
  const serverRunning = await verifyConnection();
  
  console.log('\n📋 Next steps:');
  console.log('1. Make sure your Node.js server is running on port 9000');
  console.log('2. Install dashboard dependencies: npm install');
  console.log('3. Start the dashboard: npm run dev');
  console.log('4. Open http://localhost:3000 in your browser');
  
  if (!serverRunning) {
    console.log('\n⚠️  Note: Dashboard will show connection errors until the Node.js server is running');
  }
  
  console.log('\n🎉 Setup complete!');
}

main().catch(console.error);
