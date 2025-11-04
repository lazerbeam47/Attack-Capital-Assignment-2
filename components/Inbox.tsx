"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Filter, MoreVertical, User, MessageSquare, Phone, Mail, MessageCircle, Kanban } from "lucide-react";
import MessageThread from "./MessageThread";
import ContactProfileModal from "./ContactProfileModal";
import { Message, Contact } from "@prisma/client";
import { Channel } from "@/lib/enums";

interface MessageWithContact extends Message {
  contact: Contact;
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
  TWITTER: MessageSquare,
  FACEBOOK: MessageSquare,
  SLACK: MessageSquare,
};

const channelColors: Record<string, string> = {
  SMS: "bg-blue-100 text-blue-800",
  WHATSAPP: "bg-green-100 text-green-800",
  EMAIL: "bg-purple-100 text-purple-800",
  TWITTER: "bg-sky-100 text-sky-800",
  FACEBOOK: "bg-blue-100 text-blue-800",
  SLACK: "bg-purple-100 text-purple-800",
};

const statusColors: Record<string, string> = {
  LEAD: "bg-gray-100 text-gray-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  RESPONDED: "bg-green-100 text-green-800",
  QUALIFIED: "bg-yellow-100 text-yellow-800",
  CLOSED: "bg-red-100 text-red-800",
};

export default function Inbox() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<"conversations" | "kanban">("conversations");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactProfile, setShowContactProfile] = useState(false);

  const queryClient = useQueryClient();

  const { data: contactsData } = useQuery({
    queryKey: ["contacts", searchQuery, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterStatus !== "all") params.append("status", filterStatus);
      
      const response = await fetch(`/api/contacts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
  });

  const contacts = contactsData?.contacts || [];

  // Get latest message for each contact for conversation view
  const contactsWithLatestMessage = contacts.map((contact: Contact) => {
    const latestMessage = contact.messages?.[0];
    return {
      ...contact,
      latestMessage,
      lastActivity: latestMessage?.createdAt || contact.updatedAt,
    };
  }).sort((a: any, b: any) => 
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  // Group contacts by status for kanban view
  const contactsByStatus = contacts.reduce((acc: any, contact: Contact) => {
    const status = contact.status || "LEAD";
    if (!acc[status]) acc[status] = [];
    acc[status].push(contact);
    return acc;
  }, {});

  const statusColumns = ["LEAD", "CONTACTED", "RESPONDED", "QUALIFIED", "CLOSED"];

  const openContactProfile = () => {
    if (selectedContactId) {
      setShowContactProfile(true);
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Inbox</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedView("conversations")}
                className={`p-2 rounded-lg ${
                  selectedView === "conversations" 
                    ? "bg-indigo-100 text-indigo-600" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Conversation View"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedView("kanban")}
                className={`p-2 rounded-lg ${
                  selectedView === "kanban" 
                    ? "bg-indigo-100 text-indigo-600" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Kanban View"
              >
                <Kanban className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            >
              <option value="all" style={{ color: '#000000' }}>All Status</option>
              <option value="LEAD" style={{ color: '#000000' }}>Lead</option>
              <option value="CONTACTED" style={{ color: '#000000' }}>Contacted</option>
              <option value="RESPONDED" style={{ color: '#000000' }}>Responded</option>
              <option value="QUALIFIED" style={{ color: '#000000' }}>Qualified</option>
              <option value="CLOSED" style={{ color: '#000000' }}>Closed</option>
            </select>
          </div>
        </div>

        {/* Contact List or Kanban */}
        <div className="flex-1 overflow-hidden">
          {selectedView === "conversations" ? (
            // Conversation View
            <div className="h-full overflow-y-auto">
              {contactsWithLatestMessage.map((contact: any) => {
                const Icon = channelIcons[contact.latestMessage?.channel] || MessageSquare;
                const isSelected = selectedContactId === contact.id;
                const hasUnread = contact.unreadCount > 0;

                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      isSelected ? "bg-indigo-50 border-r-2 border-r-indigo-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium text-gray-900 truncate ${hasUnread ? "font-semibold" : ""}`}>
                            {contact.name || contact.phone || contact.email}
                          </h3>
                          {hasUnread && (
                            <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                        
                        {contact.latestMessage && (
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <p className="text-sm text-gray-600 truncate">
                              {contact.latestMessage.body}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[contact.status || "LEAD"]}`}>
                            {contact.status || "Lead"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {contact.latestMessage
                              ? format(new Date(contact.latestMessage.createdAt), "MMM d")
                              : format(new Date(contact.createdAt), "MMM d")
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Kanban View
            <div className="h-full overflow-x-auto">
              <div className="flex gap-4 p-4 min-w-max">
                {statusColumns.map((status) => (
                  <div key={status} className="w-64 bg-gray-100 rounded-lg">
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">{status}</h3>
                      <span className="text-sm text-gray-500">
                        {contactsByStatus[status]?.length || 0} contacts
                      </span>
                    </div>
                    <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                      {(contactsByStatus[status] || []).map((contact: Contact) => (
                        <div
                          key={contact.id}
                          onClick={() => setSelectedContactId(contact.id)}
                          className={`p-3 bg-white rounded-lg border cursor-pointer hover:shadow-sm ${
                            selectedContactId === contact.id ? "ring-2 ring-indigo-500" : ""
                          }`}
                        >
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {contact.name || contact.phone || contact.email}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {contact.phone && <span>📱 {contact.phone}</span>}
                            {contact.email && <span>✉️ {contact.email}</span>}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {format(new Date(contact.updatedAt), "MMM d")}
                            </span>
                            {contact.unreadCount > 0 && (
                              <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {contact.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedContactId ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {contacts.find((c: Contact) => c.id === selectedContactId)?.name || "Unknown Contact"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {contacts.find((c: Contact) => c.id === selectedContactId)?.phone ||
                       contacts.find((c: Contact) => c.id === selectedContactId)?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={openContactProfile}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="View Profile"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageThread contactId={selectedContactId} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a contact from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Contact Profile Modal */}
      {showContactProfile && selectedContactId && (
        <ContactProfileModal
          contactId={selectedContactId}
          isOpen={showContactProfile}
          onClose={() => setShowContactProfile(false)}
        />
      )}
    </div>
  );
}