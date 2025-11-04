/**
 * Quick Message Scheduler Component
 * Provides easy scheduling for common follow-up patterns
 */
"use client";

import { useState } from "react";
import { Clock, Send, Calendar, X } from "lucide-react";

interface QuickSchedulerProps {
  contactId: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  onScheduled?: () => void;
  onCancel?: () => void;
}

const QUICK_TEMPLATES = [
  { label: "Follow-up in 1 day", days: 1, template: "Hi {name}, just following up on our conversation. Do you have any questions?" },
  { label: "Follow-up in 3 days", days: 3, template: "Hello {name}, checking in to see if you need any additional information from us." },
  { label: "Follow-up in 1 week", days: 7, template: "Hi {name}, hope you're doing well! Just wanted to circle back on our discussion." },
  { label: "Follow-up in 2 weeks", days: 14, template: "Hello {name}, it's been a couple weeks since we last spoke. How are things going?" },
  { label: "Monthly check-in", days: 30, template: "Hi {name}, monthly check-in! How can we help you this month?" },
];

const CHANNELS = [
  { value: "SMS", label: "SMS", icon: "📱" },
  { value: "EMAIL", label: "Email", icon: "📧" },
  { value: "WHATSAPP", label: "WhatsApp", icon: "💬" },
];

export function QuickScheduler({ 
  contactId, 
  contactName, 
  contactPhone, 
  contactEmail,
  onScheduled,
  onCancel 
}: QuickSchedulerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>("SMS");
  const [customMessage, setCustomMessage] = useState("");
  const [customDays, setCustomDays] = useState(1);
  const [isCustom, setIsCustom] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleQuickSchedule = async (templateIndex: number) => {
    const template = QUICK_TEMPLATES[templateIndex];
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + template.days);

    const message = template.template.replace("{name}", contactName || "there");

    await scheduleMessage(message, scheduledFor);
  };

  const handleCustomSchedule = async () => {
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + customDays);

    await scheduleMessage(customMessage, scheduledFor);
  };

  const scheduleMessage = async (message: string, scheduledFor: Date) => {
    setIsScheduling(true);
    
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          contactId,
          channel: selectedChannel,
          body: message,
          scheduledFor: scheduledFor.toISOString(),
        }),
      });

      if (response.ok) {
        onScheduled?.();
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (selectedChannel === 'whatsapp' && errorData.error?.includes('Channel with the specified From address')) {
          throw new Error("WhatsApp is not configured. Please check the WHATSAPP_SETUP.md guide for setup instructions.");
        }
        throw new Error(errorData.error || "Failed to schedule message");
      }
    } catch (error) {
      console.error("Error scheduling message:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to schedule message. Please try again.";
      alert(errorMessage);
    } finally {
      setIsScheduling(false);
    }
  };

  // Check if contact has required info for selected channel
  const canUseChannel = (channel: string) => {
    switch (channel) {
      case "SMS":
      case "WHATSAPP":
        return !!contactPhone;
      case "EMAIL":
        return !!contactEmail;
      default:
        return false;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-black">
          <Clock className="w-5 h-5 text-black" />
          Schedule Follow-up
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-black mb-2">Scheduling for: <strong className="text-black">{contactName}</strong></p>
        
        {/* Channel Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-black">Channel:</label>
          <div className="flex gap-2">
            {CHANNELS.map((channel) => (
              <button
                key={channel.value}
                onClick={() => setSelectedChannel(channel.value)}
                disabled={!canUseChannel(channel.value)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${
                  selectedChannel === channel.value
                    ? "bg-blue-500"
                    : canUseChannel(channel.value)
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "bg-gray-50 cursor-not-allowed"
                }`}
                style={{ color: '#000000' }}
              >
                <span style={{ color: '#000000' }}>{channel.icon}</span>
                <span style={{ color: '#000000' }}>
                  {channel.label}
                </span>
              </button>
            ))}
          </div>
          {!canUseChannel(selectedChannel) && (
            <p className="text-xs text-red-500 mt-1">
              Contact missing {selectedChannel === "EMAIL" ? "email" : "phone number"}
            </p>
          )}
        </div>
      </div>

      {!isCustom ? (
        <div>
          <h4 className="font-medium mb-3 text-black">Quick Templates:</h4>
          <div className="space-y-2 mb-4">
            {QUICK_TEMPLATES.map((template, index) => (
              <button
                key={index}
                onClick={() => handleQuickSchedule(index)}
                disabled={isScheduling || !canUseChannel(selectedChannel)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium text-sm text-black">{template.label}</div>
                <div className="text-xs text-black mt-1">
                  &ldquo;{template.template.replace("{name}", contactName || "there").substring(0, 50)}...&rdquo;
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCustom(true)}
            className="w-full p-2 border border-dashed border-gray-300 rounded-lg text-sm text-black hover:border-gray-400"
          >
            + Custom Message & Timing
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-black">Days to wait:</label>
            <input
              type="number"
              min="1"
              max="365"
              value={customDays}
              onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-black">Message:</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={`Hi ${contactName || "there"}, ...`}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none text-black placeholder-gray-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsCustom(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-black"
            >
              Back
            </button>
            <button
              onClick={handleCustomSchedule}
              disabled={isScheduling || !customMessage.trim() || !canUseChannel(selectedChannel)}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isScheduling ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Schedule
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {isScheduling && (
        <div className="mt-4 text-center text-sm text-black">
          Scheduling message...
        </div>
      )}
    </div>
  );
}
