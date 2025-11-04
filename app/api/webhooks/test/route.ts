import { NextRequest, NextResponse } from "next/server";

/**
 * Simple webhook test endpoint
 * Use this to test if webhooks are working properly
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Webhook test endpoint called!");
    console.log("Headers:", Object.fromEntries(request.headers.entries()));
    
    const formData = await request.formData();
    const body = Object.fromEntries(formData);
    
    console.log("📞 Webhook Body:", body);
    
    // Log the message details
    const from = body.From as string;
    const to = body.To as string;
    const messageBody = body.Body as string;
    
    console.log(`📱 Message received:`);
    console.log(`   From: ${from}`);
    console.log(`   To: ${to}`);
    console.log(`   Body: ${messageBody}`);
    
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  } catch (error) {
    console.error("❌ Webhook test error:", error);
    return NextResponse.json({ error: "Test webhook failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Webhook test endpoint is running",
    timestamp: new Date().toISOString(),
    endpoint: "/api/webhooks/test"
  });
}
