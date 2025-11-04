/**
 * Type-safe enums for database string values
 * 
 * SQLite doesn't support native enums, so we use const objects
 * with string literals to ensure type safety and consistency
 * 
 * @module enums
 * @example
 * ```typescript
 * import { MessageStatus, Channel } from '@/lib/enums';
 * 
 * const status: MessageStatus = MessageStatus.SENT;
 * const channel: Channel = Channel.WHATSAPP;
 * ```
 */

/**
 * User roles for access control
 * 
 * - VIEWER: Can view messages and contacts (read-only)
 * - EDITOR: Can send messages and update contacts
 * - ADMIN: Full access including settings and team management
 * 
 * @constant
 */
export const Role = {
  VIEWER: "VIEWER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
} as const;

/**
 * Contact lifecycle status
 * 
 * Tracks the progression of a contact through the sales funnel:
 * - LEAD: Initial contact, not yet engaged
 * - CONTACTED: Outreach initiated
 * - RESPONDED: Contact has replied
 * - QUALIFIED: Contact meets criteria for conversion
 * - CLOSED: Deal completed or contact archived
 * 
 * @constant
 */
export const ContactStatus = {
  LEAD: "LEAD",
  CONTACTED: "CONTACTED",
  RESPONDED: "RESPONDED",
  QUALIFIED: "QUALIFIED",
  CLOSED: "CLOSED",
} as const;

/**
 * Communication channels
 * 
 * Supported messaging platforms:
 * - SMS: Traditional text messaging
 * - WHATSAPP: WhatsApp Business messages
 * - EMAIL: Transactional and marketing emails
 * - TWITTER: Twitter Direct Messages (planned)
 * - FACEBOOK: Facebook Messenger (planned)
 * - SLACK: Slack messages (planned)
 * 
 * @constant
 */
export const Channel = {
  SMS: "SMS",
  WHATSAPP: "WHATSAPP",
  EMAIL: "EMAIL",
  TWITTER: "TWITTER",
  FACEBOOK: "FACEBOOK",
  SLACK: "SLACK",
} as const;

/**
 * Message direction
 * 
 * - INBOUND: Message received from contact (via webhook)
 * - OUTBOUND: Message sent to contact (via API)
 * 
 * @constant
 */
export const Direction = {
  INBOUND: "INBOUND",
  OUTBOUND: "OUTBOUND",
} as const;

/**
 * Message delivery status
 * 
 * Tracks the lifecycle of a message:
 * - PENDING: Queued for sending
 * - SENT: Accepted by provider but not yet delivered
 * - DELIVERED: Confirmed delivery to recipient's device
 * - READ: Recipient has opened/read the message
 * - FAILED: Delivery failed (e.g., invalid number, blocked)
 * - SCHEDULED: Waiting for scheduled send time
 * 
 * @constant
 */
export const MessageStatus = {
  PENDING: "PENDING",
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
  FAILED: "FAILED",
  SCHEDULED: "SCHEDULED",
} as const;

/**
 * User role type
 */
export type Role = typeof Role[keyof typeof Role];

/**
 * Contact status type
 */
export type ContactStatus = typeof ContactStatus[keyof typeof ContactStatus];

/**
 * Communication channel type
 */
export type Channel = typeof Channel[keyof typeof Channel];

/**
 * Message direction type
 */
export type Direction = typeof Direction[keyof typeof Direction];

/**
 * Message status type
 */
export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];

