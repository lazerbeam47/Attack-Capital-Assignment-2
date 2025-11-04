// WhatsApp Channel Status Check
// This utility helps check if WhatsApp is properly configured

export async function checkWhatsAppStatus(): Promise<{ isConfigured: boolean; message: string }> {
  try {
    // Quick test to see if WhatsApp channel is working
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'test-whatsapp',
        to: 'whatsapp:+15005550006', // Twilio test number
        body: 'Test message'
      }),
    });

    if (response.ok) {
      return { isConfigured: true, message: 'WhatsApp is configured and ready' };
    }

    const errorData = await response.json().catch(() => ({}));
    if (errorData.error?.includes('Channel with the specified From address')) {
      return { 
        isConfigured: false, 
        message: 'WhatsApp channel not configured. Check WHATSAPP_SETUP.md for setup instructions.' 
      };
    }

    return { isConfigured: false, message: 'WhatsApp configuration issue detected' };
  } catch (error) {
    return { isConfigured: false, message: 'Unable to check WhatsApp status' };
  }
}
