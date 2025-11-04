"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Message } from "@prisma/client";
import { Channel, Direction } from "@/lib/enums";
import MessageComposer from "./MessageComposer";
import { Phone, Mail, MessageCircle, Check, CheckCheck } from "lucide-react";
import { useEffect, useRef, useMemo, useCallback } from "react";

interface MessageWithUser extends Message {
  sentBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

const channelIcons: Record<string, any> = {
  SMS: Phone,
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
};

export default function MessageThread({ contactId }: { contactId: string }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ["messages", contactId],
    queryFn: async () => {
      const res = await fetch(`/api/messages?contactId=${contactId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    refetchOnWindowFocus: false, // Prevent excessive refetching
    refetchInterval: 30000, // Reduced from 5000ms to 30000ms (30 seconds)
    staleTime: 10000, // Consider data stale after 10 seconds instead of 1
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const res = await fetch("/api/messages/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });
      if (!res.ok) throw new Error("Failed to mark messages as read");
      return res.json();
    },
    onSuccess: () => {
      // Only refresh the specific messages query to reduce API calls
      queryClient.invalidateQueries({ queryKey: ["messages", contactId] });
    },
  });

  const messages: MessageWithUser[] = useMemo(() => data?.messages || [], [data?.messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when component mounts or contactId changes
  const markMessagesAsRead = useCallback(() => {
    if (contactId && messages.length > 0) {
      // Check if there are any unread inbound messages
      const hasUnreadMessages = messages.some(
        msg => msg.direction === Direction.INBOUND && msg.status !== "READ"
      );
      
      if (hasUnreadMessages) {
        markAsReadMutation.mutate(contactId);
      }
    }
  }, [contactId, messages, markAsReadMutation]);

  useEffect(() => {
    markMessagesAsRead();
  }, [markMessagesAsRead]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOutbound = message.direction === Direction.OUTBOUND;
            const ChannelIcon = channelIcons[message.channel as keyof typeof channelIcons] || Phone;

            return (
              <div
                key={message.id}
                className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOutbound
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ChannelIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{message.channel}</span>
                    {isOutbound && (
                      <div className="ml-auto">
                        {message.status === "READ" ? (
                          <CheckCheck className="w-4 h-4" />
                        ) : message.status === "DELIVERED" ? (
                          <CheckCheck className="w-4 h-4 opacity-50" />
                        ) : message.status === "SENT" ? (
                          <Check className="w-4 h-4 opacity-50" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                  {message.mediaUrls && (() => {
                    try {
                      const urls = JSON.parse(message.mediaUrls);
                      return Array.isArray(urls) && urls.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          {urls.map((url: string, idx: number) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs underline"
                            >
                              Media {idx + 1}
                            </a>
                          ))}
                        </div>
                      ) : null;
                    } catch {
                      return null;
                    }
                  })()}
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{format(new Date(message.createdAt), "MMM d, h:mm a")}</span>
                    {message.sentBy && (
                      <span className="ml-2">{message.sentBy.name || message.sentBy.email}</span>
                    )}
                  </div>
                  {message.errorMessage && (
                    <div className="mt-2 text-xs text-red-300">
                      Error: {message.errorMessage}
                    </div>
                  )}
                  {message.status === "SCHEDULED" && message.scheduledFor && (
                    <div className="mt-2 text-xs opacity-70">
                      Scheduled for {format(new Date(message.scheduledFor), "MMM d, h:mm a")}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} /> {/* Auto-scroll anchor */}
      </div>
      <MessageComposer contactId={contactId} />
    </div>
  );
}

