"use client";

import { useState } from "react";
import { Channel } from "@/lib/enums";
import { Send, Calendar, Image as ImageIcon, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import RichTextEditor from "./RichTextEditor";

interface MessageComposerProps {
  contactId: string;
  defaultChannel?: string;
  onSent?: () => void;
}

export default function MessageComposer({
  contactId,
  defaultChannel = Channel.SMS,
  onSent,
}: MessageComposerProps) {
  const [channel, setChannel] = useState<string>(defaultChannel || Channel.SMS);
  const [body, setBody] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState<string>("");
  const [showScheduler, setShowScheduler] = useState(false);

  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send message");
      }
      return res.json();
    },
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["messages", contactId] });
      
      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(["messages", contactId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["messages", contactId], (old: any) => {
        if (!old) return old;
        
        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          contactId: contactId,
          channel: newMessage.channel,
          direction: 'OUTBOUND',
          status: 'SENDING',
          body: newMessage.body,
          createdAt: new Date().toISOString(),
          sentBy: { name: 'You' },
          metadata: JSON.stringify({ to: 'sending...' }),
        };
        
        return {
          ...old,
          messages: [...(old.messages || []), optimisticMessage]
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["messages", contactId], context?.previousMessages);
    },
    onSuccess: (data) => {
      // Clear form immediately
      setBody("");
      setHtmlBody("");
      setMediaUrls([]);
      setScheduledFor("");
      setShowScheduler(false);
      
      // Only invalidate the specific messages query, not all queries
      queryClient.invalidateQueries({ queryKey: ["messages", contactId] });
      
      onSent?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    const messageData = {
      contactId,
      channel,
      body,
      htmlBody: htmlBody !== body ? htmlBody : undefined,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
    };

    // Clear form immediately for better UX
    setBody("");
    setHtmlBody("");
    setMediaUrls([]);
    setScheduledFor("");
    setShowScheduler(false);

    sendMutation.mutate(messageData);
  };

  const handleEditorChange = (html: string, plain: string) => {
    setHtmlBody(html);
    setBody(plain);
  };

  const handleSendFromEditor = () => {
    if (!body.trim()) return;

    const messageData = {
      contactId,
      channel,
      body,
      htmlBody: htmlBody !== body ? htmlBody : undefined,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
    };

    // Clear form immediately for better UX
    setBody("");
    setHtmlBody("");
    setMediaUrls([]);
    setScheduledFor("");
    setShowScheduler(false);

    sendMutation.mutate(messageData);
  };

  const addMediaUrl = () => {
    const url = prompt("Enter media URL:");
    if (url) {
      setMediaUrls([...mediaUrls, url]);
    }
  };

  const removeMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{ color: '#000000', backgroundColor: '#ffffff' }}
        >
          <option value="SMS" style={{ color: '#000000' }}>SMS</option>
          <option value="WHATSAPP" style={{ color: '#000000' }}>WhatsApp</option>
          <option value="EMAIL" style={{ color: '#000000' }}>Email</option>
        </select>
        <button
          type="button"
          onClick={() => setShowScheduler(!showScheduler)}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Schedule message"
        >
          <Calendar className="w-4 h-4 text-black" />
        </button>
        <button
          type="button"
          onClick={addMediaUrl}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Add media"
        >
          <ImageIcon className="w-4 h-4 text-black" />
        </button>
      </div>

      {showScheduler && (
        <div className="mb-2">
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
      )}

      {mediaUrls.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {mediaUrls.map((url, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
            >
              <span className="truncate max-w-xs">{url}</span>
              <button
                type="button"
                onClick={() => removeMediaUrl(index)}
                className="hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <RichTextEditor
        value={htmlBody}
        onChange={handleEditorChange}
        onSend={handleSendFromEditor}
        placeholder={`Type your ${channel.toLowerCase()} message...`}
        disabled={sendMutation.isPending}
        className="mb-2"
        showSendButton={false}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {body.length} characters
        </span>
        <button
          type="submit"
          disabled={!body.trim() || sendMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {sendMutation.isPending
            ? "Sending..."
            : scheduledFor
            ? "Schedule"
            : "Send"}
        </button>
      </div>

      {sendMutation.isError && (
        <div className="mt-2 text-sm text-red-600">
          {sendMutation.error instanceof Error
            ? sendMutation.error.message
            : "Failed to send message"}
        </div>
      )}
    </form>
  );
}

