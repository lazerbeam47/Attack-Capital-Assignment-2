#!/usr/bin/env node

/**
 * Twilio Webhook Configuration Script
 * 
 * This script helps configure Twilio webhooks for SMS and WhatsApp
 * to receive incoming messages in your Attack Capital CRM.
 */

console.log('🔧 Twilio Webhook Configuration Guide\n');

// Get environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const smsNumber = process.env.TWILIO_PHONE_NUMBER;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

console.log('📋 Current Configuration:');
console.log(`Account SID: ${accountSid ? '✅ Set' : '❌ Missing'}`);
console.log(`Auth Token: ${authToken ? '✅ Set' : '❌ Missing'}`);
console.log(`SMS Number: ${smsNumber || '❌ Missing'}`);
console.log(`WhatsApp Number: ${whatsappNumber || '❌ Missing'}`);
console.log('');

// Webhook URLs (you'll need to expose these publicly)
const baseUrl = 'https://your-app-domain.com'; // Replace with your actual domain
const webhookUrl = `${baseUrl}/api/webhooks/twilio`;

console.log('🌐 Webhook Configuration Needed:');
console.log(`Webhook URL: ${webhookUrl}`);
console.log('');

console.log('📝 Manual Configuration Steps:');
console.log('');

console.log('1️⃣  SMS Webhook Configuration:');
console.log('   - Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming');
console.log(`   - Find your SMS number: ${smsNumber}`);
console.log('   - Click on the number');
console.log(`   - Set "A message comes in" webhook to: ${webhookUrl}`);
console.log('   - Set HTTP method to: POST');
console.log('');

console.log('2️⃣  WhatsApp Webhook Configuration:');
if (whatsappNumber?.includes('+14155238886')) {
  console.log('   - Go to: https://console.twilio.com/us1/develop/sms/whatsapp/sandbox');
  console.log(`   - Set "When a message comes in" webhook to: ${webhookUrl}`);
  console.log('   - Set HTTP method to: POST');
} else {
  console.log('   - Go to: https://console.twilio.com/us1/develop/sms/whatsapp/senders');
  console.log(`   - Find your WhatsApp number: ${whatsappNumber}`);
  console.log('   - Click on the number');
  console.log(`   - Set webhook URL to: ${webhookUrl}`);
  console.log('   - Set HTTP method to: POST');
}
console.log('');

console.log('🚀 For Local Development (Using ngrok):');
console.log('');
console.log('Since you\'re running locally, you need to expose your app to the internet:');
console.log('');
console.log('1. Install ngrok: npm install -g ngrok');
console.log('2. Run ngrok: ngrok http 3002');
console.log('3. Copy the https:// URL from ngrok');
console.log('4. Use that URL + /api/webhooks/twilio as your webhook URL');
console.log('');
console.log('Example: https://abc123.ngrok.io/api/webhooks/twilio');
console.log('');

console.log('✅ After Configuration:');
console.log('- Send a test SMS to your Twilio number');
console.log('- Send a test WhatsApp message');
console.log('- Check your app to see if messages appear');
console.log('');

console.log('🐛 Debugging:');
console.log('- Check Twilio Console Logs: https://console.twilio.com/us1/monitor/logs/errors');
console.log('- Check your app server logs for webhook calls');
console.log('- Verify webhook URL is publicly accessible');
