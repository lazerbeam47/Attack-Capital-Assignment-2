/**
 * Integration factory pattern for channel senders
 * 
 * This module provides a unified interface for sending messages across multiple channels:
 * - SMS via Twilio
 * - WhatsApp via Twilio
 * - Email via Resend
 * - Twitter DM (planned)
 * - Facebook Messenger (planned)
 * 
 * @module integrations
 * @example
 * ```typescript
 * import { sendMessage } from '@/lib/integrations';
 * 
 * // Send SMS
 * await sendMessage('SMS', {
 *   to: '+1234567890',
 *   body: 'Hello from Attack Capital!'
 * });
 * 
 * // Send WhatsApp
 * await sendMessage('WHATSAPP', {
 *   to: '+1234567890',
 *   body: 'Hello via WhatsApp!',
 *   mediaUrls: ['https://example.com/image.jpg']
 * });
 * ```
 */
import { Channel, MessageStatus } from "./enums";
import twilio from "twilio";
import { z } from "zod";

/**
 * Message payload schema for validation
 * Ensures all required fields are present and properly formatted
 */
const MessagePayloadSchema = z.object({
  /** Recipient identifier (phone number in E.164 format or email) */
  to: z.string(),
  /** Message content (plain text or HTML for email) */
  body: z.string(),
  /** Optional array of media URLs for MMS/WhatsApp */
  mediaUrls: z.array(z.string()).optional(),
  /** Optional scheduled delivery time */
  scheduledFor: z.date().optional(),
  /** Optional additional metadata (e.g., subject for email) */
  metadata: z.record(z.any()).optional(),
});

export type MessagePayload = z.infer<typeof MessagePayloadSchema>;

/**
 * Base sender interface that all channel implementations must follow
 * Ensures consistent behavior across different communication channels
 */
interface Sender {
  /**
   * Send a message via the channel
   * @param payload - The message payload
   * @returns Object containing the message ID and status
   * @throws Error if validation fails or sending fails
   */
  send(payload: MessagePayload): Promise<{ id: string; status: string }>;
  
  /**
   * Validate the recipient format for this channel
   * @param payload - The message payload to validate
   * @returns true if valid, false otherwise
   */
  validate(payload: MessagePayload): boolean;
}

/**
 * Twilio SMS Sender
 * 
 * Sends SMS messages using Twilio's Programmable SMS API
 * Supports both standard SMS and MMS (with media attachments)
 * 
 * @implements {Sender}
 * @example
 * ```typescript
 * const sender = new TwilioSMSSender();
 * const result = await sender.send({
 *   to: '+1234567890',
 *   body: 'Hello!'
 * });
 * ```
 */
class TwilioSMSSender implements Sender {
  private client: twilio.Twilio;
  private phoneNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || "";

    if (!accountSid || !authToken) {
      throw new Error("Twilio credentials not configured");
    }

    this.client = twilio(accountSid, authToken);
  }

  validate(payload: MessagePayload): boolean {
    const isValidE164 = /^\+[1-9]\d{1,14}$/.test(payload.to);
    if (!isValidE164) {
      console.error(`Invalid phone format: ${payload.to}. Must be E.164 format (e.g., +1234567890)`);
    }
    return isValidE164;
  }

  async send(payload: MessagePayload): Promise<{ id: string; status: MessageStatus }> {
    if (!this.validate(payload)) {
      throw new Error(`Invalid 'To' Phone Number: ${payload.to}. Must be E.164 format (e.g., +1234567890). For Twilio trial accounts, the number must also be verified in Twilio Console.`);
    }

    try {
      const message = await this.client.messages.create({
        body: payload.body,
        to: payload.to,
        from: this.phoneNumber,
        mediaUrl: payload.mediaUrls,
      });

      return {
        id: message.sid,
        status:
          message.status === "queued" || message.status === "sending"
            ? MessageStatus.PENDING
            : message.status === "sent"
            ? MessageStatus.SENT
            : message.status === "delivered"
            ? MessageStatus.DELIVERED
            : message.status === "failed"
            ? MessageStatus.FAILED
            : MessageStatus.SENT,
      };
    } catch (error) {
      console.error("Twilio SMS error:", error);
      throw error;
    }
  }
}

/**
 * Twilio WhatsApp Sender
 * 
 * Sends WhatsApp messages using Twilio's WhatsApp API
 * Supports both sandbox (for testing) and production WhatsApp Business accounts
 * 
 * @implements {Sender}
 * @see https://www.twilio.com/docs/whatsapp
 * @example
 * ```typescript
 * const sender = new TwilioWhatsAppSender();
 * const result = await sender.send({
 *   to: '+1234567890',
 *   body: 'Hello via WhatsApp!',
 *   mediaUrls: ['https://example.com/image.jpg']
 * });
 * ```
 */
class TwilioWhatsAppSender implements Sender {
  private client: twilio.Twilio;
  private whatsappNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

    if (!accountSid || !authToken) {
      throw new Error("Twilio credentials not configured");
    }

    this.client = twilio(accountSid, authToken);
  }

  validate(payload: MessagePayload): boolean {
    // WhatsApp uses same E.164 format but can start with whatsapp:
    return /^(whatsapp:)?\+[1-9]\d{1,14}$/.test(payload.to);
  }

  async send(payload: MessagePayload): Promise<{ id: string; status: MessageStatus }> {
    if (!this.validate(payload)) {
      throw new Error("Invalid WhatsApp number format");
    }

    try {
      const to = payload.to.startsWith("whatsapp:") ? payload.to : `whatsapp:${payload.to}`;
      
      // Check if WhatsApp channel is properly configured
      if (!this.whatsappNumber || this.whatsappNumber === "whatsapp:+14155238886") {
        console.warn("⚠️  Using WhatsApp Sandbox. Recipients must join first by sending a code to +1 415 523 8886");
        console.warn("📱 Instructions: https://www.twilio.com/docs/whatsapp/sandbox");
      }
      
      const message = await this.client.messages.create({
        body: payload.body,
        to,
        from: this.whatsappNumber,
        mediaUrl: payload.mediaUrls,
      });

      return {
        id: message.sid,
        status:
          message.status === "queued" || message.status === "sending"
            ? MessageStatus.PENDING
            : message.status === "sent"
            ? MessageStatus.SENT
            : message.status === "delivered"
            ? MessageStatus.DELIVERED
            : message.status === "failed"
            ? MessageStatus.FAILED
            : MessageStatus.SENT,
      } as { id: string; status: string };
    } catch (error: any) {
      console.error("Twilio WhatsApp error:", error);
      
      // Provide specific error messages for common WhatsApp issues
      if (error.code === 63007) {
        const helpMessage = `
❌ WhatsApp Channel Error (63007): The WhatsApp number '${this.whatsappNumber}' is not configured in your Twilio account.

🔧 To fix this:
1. If using Sandbox: Recipients must first send a join code to +1 415 523 8886
2. If using Business number: Verify it's approved in your Twilio Console
3. Check your TWILIO_WHATSAPP_NUMBER environment variable

📚 Help: https://www.twilio.com/docs/whatsapp/tutorial/send-and-receive-media-messages-whatsapp-nodejs
        `;
        console.error(helpMessage);
        throw new Error("WhatsApp channel not configured. Check console for setup instructions.");
      }
      
      throw error;
    }
  }
}

/**
 * Email Sender using Resend API
 * 
 * Sends transactional and marketing emails via Resend
 * Supports HTML content and attachments
 * 
 * @implements {Sender}
 * @see https://resend.com/docs
 * @example
 * ```typescript
 * const sender = new EmailSender();
 * const result = await sender.send({
 *   to: 'user@example.com',
 *   body: '<h1>Welcome!</h1>',
 *   metadata: { subject: 'Welcome to Attack Capital' }
 * });
 * ```
 */
class EmailSender implements Sender {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("Resend API key not configured");
    }
  }

  validate(payload: MessagePayload): boolean {
    // Simple email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.to);
  }

  async send(payload: MessagePayload): Promise<{ id: string; status: MessageStatus }> {
    if (!this.validate(payload)) {
      throw new Error("Invalid email format");
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev", // Update with your domain
          to: payload.to,
          subject: payload.metadata?.subject || "Message",
          html: payload.body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send email");
      }

      return {
        id: data.id,
        status: MessageStatus.SENT,
      };
    } catch (error) {
      console.error("Email send error:", error);
      throw error;
    }
  }
}

/**
 * Factory function to create channel-specific senders
 * 
 * Implements the Factory pattern to instantiate the appropriate sender
 * based on the communication channel
 * 
 * @param channel - The communication channel (SMS, WHATSAPP, EMAIL, etc.)
 * @returns A sender instance implementing the Sender interface
 * @throws Error if channel is not supported
 * @example
 * ```typescript
 * const smsSender = createSender('SMS');
 * const whatsappSender = createSender('WHATSAPP');
 * ```
 */
export function createSender(channel: string): Sender {
  switch (channel) {
    case "SMS":
      return new TwilioSMSSender();
    case "WHATSAPP":
      return new TwilioWhatsAppSender();
    case "EMAIL":
      return new EmailSender();
    case "TWITTER":
      // TODO: Implement Twitter sender
      throw new Error("Twitter integration not yet implemented");
    case "FACEBOOK":
      // TODO: Implement Facebook sender
      throw new Error("Facebook integration not yet implemented");
    default:
      throw new Error(`Unsupported channel: ${channel}`);
  }
}

/**
 * Send a message via the appropriate communication channel
 * 
 * Main entry point for sending messages. Validates the payload,
 * creates the appropriate sender, and dispatches the message.
 * 
 * @param channel - The communication channel (SMS, WHATSAPP, EMAIL, etc.)
 * @param payload - The message payload containing recipient, body, etc.
 * @returns Promise resolving to message ID and status
 * @throws Error if validation fails or sending fails
 * @example
 * ```typescript
 * // Send SMS
 * const result = await sendMessage('SMS', {
 *   to: '+1234567890',
 *   body: 'Hello!'
 * });
 * console.log(result); // { id: 'SM...', status: 'SENT' }
 * 
 * // Send WhatsApp with media
 * await sendMessage('WHATSAPP', {
 *   to: '+1234567890',
 *   body: 'Check this out!',
 *   mediaUrls: ['https://example.com/image.jpg']
 * });
 * 
 * // Send email
 * await sendMessage('EMAIL', {
 *   to: 'user@example.com',
 *   body: '<p>Welcome!</p>',
 *   metadata: { subject: 'Welcome' }
 * });
 * ```
 */
export async function sendMessage(
  channel: string,
  payload: MessagePayload
): Promise<{ id: string; status: string }> {
  const sender = createSender(channel);
  const validatedPayload = MessagePayloadSchema.parse(payload);
  return sender.send(validatedPayload);
}

