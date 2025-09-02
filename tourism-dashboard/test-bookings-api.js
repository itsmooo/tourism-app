#!/usr/bin/env node

/**
 * Test script to debug the bookings API
 * Run this to see what data is being returned from your backend
 */

const http = require('http');

async function testBookingsAPI() {
  console.log('🧪 Testing Bookings API...\n');
  
  try {
    // Test the bookings endpoint
    const response = await fetch('http://localhost:9000/api/bookings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Total Bookings:', data.length);
    
    if (data.length > 0) {
      console.log('\n🔍 First Booking Details:');
      const firstBooking = data[0];
      
      console.log('- Booking ID:', firstBooking._id);
      console.log('- User:', firstBooking.user);
      console.log('- Place:', firstBooking.place);
      console.log('- Place Type:', typeof firstBooking.place);
      
      if (firstBooking.place && typeof firstBooking.place === 'object') {
        console.log('- Place ID:', firstBooking.place._id);
        console.log('- Place Name (eng):', firstBooking.place.name_eng);
        console.log('- Place Name (som):', firstBooking.place.name_som);
        console.log('- Place Location:', firstBooking.place.location);
      } else {
        console.log('- Place is not populated properly');
        console.log('- Place value:', firstBooking.place);
      }
      
      console.log('- Number of People:', firstBooking.numberOfPeople);
      console.log('- Total Price:', firstBooking.totalPrice);
      console.log('- Status:', firstBooking.status);
      console.log('- Payment Status:', firstBooking.paymentStatus);
      console.log('- Booking Date:', firstBooking.bookingDate);
      console.log('- Created At:', firstBooking.createdAt);
    } else {
      console.log('⚠️  No bookings found in database');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your Node.js server is running:');
      console.log('   cd tourism_app/node-server');
      console.log('   npm start');
    }
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('⚠️  Fetch not available, using http module...');
  
  const http = require('http');
  
  function testWithHttp() {
    const options = {
      hostname: 'localhost',
      port: 9000,
      path: '/api/bookings',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const bookings = JSON.parse(data);
          console.log('✅ API Response Status:', res.statusCode);
          console.log('📊 Total Bookings:', bookings.length);
          
          if (bookings.length > 0) {
            console.log('\n🔍 First Booking Details:');
            const firstBooking = bookings[0];
            
            console.log('- Booking ID:', firstBooking._id);
            console.log('- User:', firstBooking.user);
            console.log('- User Type:', typeof firstBooking.user);
            console.log('- Place:', firstBooking.place);
            console.log('- Place Type:', typeof firstBooking.place);
            
            if (firstBooking.place && typeof firstBooking.place === 'object') {
              console.log('- Place ID:', firstBooking.place._id);
              console.log('- Place Name (eng):', firstBooking.place.name_eng);
              console.log('- Place Name (som):', firstBooking.place.name_som);
              console.log('- Place Location:', firstBooking.place.location);
            } else {
              console.log('- Place is not populated properly');
              console.log('- Place value:', firstBooking.place);
            }
            
            console.log('- Number of People:', firstBooking.numberOfPeople);
            console.log('- Total Price:', firstBooking.totalPrice);
            console.log('- Status:', firstBooking.status);
            console.log('- Payment Status:', firstBooking.paymentStatus);
            console.log('- Booking Date:', firstBooking.bookingDate);
            console.log('- Created At:', firstBooking.createdAt);
          }
        } catch (parseError) {
          console.error('❌ Error parsing response:', parseError.message);
          console.log('Raw response:', data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Make sure your Node.js server is running:');
        console.log('   cd tourism_app/node-server');
        console.log('   npm start');
      }
    });
    
    req.end();
  }
  
  testWithHttp();
} else {
  testBookingsAPI();
}
