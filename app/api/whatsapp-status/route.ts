import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if we can access Twilio
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!twilioSid || !twilioToken || !whatsappNumber) {
      return NextResponse.json({
        configured: false,
        message: "Twilio environment variables not configured",
        setup: "Check your .env.local file"
      });
    }

    return NextResponse.json({
      configured: true,
      message: "Twilio WhatsApp configuration found",
      whatsappNumber,
      isSandbox: whatsappNumber.includes('+14155238886'),
      setup: whatsappNumber.includes('+14155238886') 
        ? "Sandbox mode - recipients must join by sending 'join create-shown' to +1 415 523 8886"
        : "Business account mode"
    });

  } catch (error) {
    return NextResponse.json({
      configured: false,
      message: "Error checking WhatsApp status",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
