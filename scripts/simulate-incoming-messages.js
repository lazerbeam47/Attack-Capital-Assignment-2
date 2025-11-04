#!/usr/bin/env node

/**
 * Simulate incoming SMS/WhatsApp messages to test webhook processing
 * 
 * IMPORTANT: Replace +19876543210 with YOUR actual phone number for testing
 */

async function simulateIncomingMessage(type = 'sms') {
  console.log(`🧪 Simulating incoming ${type.toUpperCase()} message...`);
  console.log('⚠️  Remember to replace +19876543210 with YOUR phone number!');
  console.log('Use curl commands to test:');
  console.log('');
  
  if (type === 'sms') {
    console.log('📱 SMS Test Command:');
    console.log('curl -X POST http://localhost:3002/api/webhooks/twilio \\');
    console.log('  -d "From=%2B19876543210" \\'); // Replace with YOUR number
    console.log('  -d "To=%2B15177439437" \\');
    console.log('  -d "Body=Hello%21%20This%20is%20a%20test%20SMS%20message." \\');
    console.log('  -d "MessageSid=SMS' + Date.now() + '" \\');
    console.log('  -d "NumMedia=0"');
  } else {
    console.log('💬 WhatsApp Test Command:');
    console.log('curl -X POST http://localhost:3002/api/webhooks/twilio \\');
    console.log('  -d "From=whatsapp%3A%2B19876543210" \\'); // Replace with YOUR number
    console.log('  -d "To=whatsapp%3A%2B14155238886" \\');
    console.log('  -d "Body=Hello%21%20This%20is%20a%20test%20WhatsApp%20message." \\');
    console.log('  -d "MessageSid=WA' + Date.now() + '" \\');
    console.log('  -d "NumMedia=0"');
  }
  console.log('');
}

async function main() {
  console.log('🚀 Webhook Message Simulator\n');
  
  // Test SMS
  await simulateIncomingMessage('sms');
  
  // Test WhatsApp
  await simulateIncomingMessage('whatsapp');
  
  console.log('📋 What to do next:');
  console.log('1. Copy and run one of the curl commands above');
  console.log('2. Check your app at http://localhost:3002/inbox');
  console.log('3. Look for the simulated messages in your contacts');
  console.log('4. If they appear, your webhook processing is working!');
  console.log('5. Configure Twilio webhooks to point to your app');
}

main();
