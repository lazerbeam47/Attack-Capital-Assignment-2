#!/usr/bin/env node

// Test WhatsApp integration after sandbox setup
// Using Node.js built-in fetch (Node 18+)

async function testWhatsApp() {
  console.log('🧪 Testing WhatsApp integration...\n');
  
  try {
    const response = await fetch('http://localhost:3002/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactId: 'contact-1',
        channel: 'whatsapp',
        body: '🎉 WhatsApp test message - setup successful!'
      }),
    });

    if (response.ok) {
      console.log('✅ WhatsApp test successful!');
      console.log('📱 Check your WhatsApp for the test message');
    } else {
      const error = await response.text();
      console.log('❌ WhatsApp test failed:');
      console.log(error);
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    console.log('💡 Make sure the dev server is running on port 3002');
  }
}

testWhatsApp();
