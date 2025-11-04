#!/usr/bin/env node
/**
 * Quick test script to send a test message
 * Usage: node scripts/test-message.js
 */

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🧪 Twilio Message Test Script\n');

// Check if Twilio is configured
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.log('❌ Twilio credentials not found in environment');
  console.log('   Make sure .env.local is loaded');
  process.exit(1);
}

console.log('✅ Twilio credentials found');
console.log(`   Account SID: ${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}...`);
console.log(`   Phone Number: ${process.env.TWILIO_PHONE_NUMBER}\n`);

rl.question('Enter recipient phone number (E.164 format, e.g., +1234567890): ', (to) => {
  rl.question('Enter message text: ', (body) => {
    rl.close();
    
    console.log('\n📤 Sending test message...\n');
    
    // Simple test - you can enhance this to use the actual API
    console.log(`To: ${to}`);
    console.log(`From: ${process.env.TWILIO_PHONE_NUMBER}`);
    console.log(`Message: ${body}\n`);
    console.log('💡 To send via the app:');
    console.log('   1. Sign in at http://localhost:3000');
    console.log('   2. Create a contact with phone: ' + to);
    console.log('   3. Send message from the inbox UI\n');
    console.log('Or test directly via API after creating a contact.');
  });
});

