"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { X, Phone, Mail, MessageCircle, User, Edit, Save, Plus, Clock } from "lucide-react";
import { Contact, Message, Note } from "@prisma/client";
import { QuickScheduler } from "./QuickScheduler";

interface ContactProfileModalProps {
  contactId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface MessageWithUser extends Message {
  sentBy?: { name: string | null; email: string };
}

interface NoteWithUser extends Note {
  user: { name: string | null; email: string };
}

export default function ContactProfileModal({ contactId, isOpen, onClose }: ContactProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState<Partial<Contact>>({});
  const [newNote, setNewNote] = useState("");
  const [notePrivate, setNotePrivate] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const queryClient = useQueryClient();

  // Fetch contact details
  const { data: contactData } = useQuery({
    queryKey: ["contact", contactId],
    queryFn: async () => {
      const res = await fetch(`/api/contacts/${contactId}`);
      if (!res.ok) throw new Error("Failed to fetch contact");
      return res.json();
    },
    enabled: isOpen && !!contactId,
  });

  // Fetch contact messages for timeline
  const { data: messagesData } = useQuery({
    queryKey: ["messages", contactId],
    queryFn: async () => {
      const res = await fetch(`/api/messages?contactId=${contactId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: isOpen && !!contactId,
  });

  // Fetch contact notes
  const { data: notesData } = useQuery({
    queryKey: ["notes", contactId],
    queryFn: async () => {
      const res = await fetch(`/api/notes?contactId=${contactId}`);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
    enabled: isOpen && !!contactId,
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async (updatedData: Partial<Contact>) => {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Failed to update contact");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", contactId] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setIsEditing(false);
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (noteData: { content: string; isPrivate: boolean }) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          content: noteData.content,
          isPrivate: noteData.isPrivate,
          title: "Note",
        }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", contactId] });
      setNewNote("");
      setNotePrivate(false);
    },
  });

  const contact = contactData?.contact;
  const messages: MessageWithUser[] = messagesData?.messages || [];
  const notes: NoteWithUser[] = notesData?.notes || [];

  // Combine messages and notes for timeline
  const timelineItems = [
    ...messages.map(msg => ({
      type: 'message' as const,
      id: msg.id,
      timestamp: msg.createdAt,
      data: msg,
    })),
    ...notes.map(note => ({
      type: 'note' as const,
      id: note.id,
      timestamp: note.createdAt,
      data: note,
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSave = () => {
    updateContactMutation.mutate(editedContact);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNoteMutation.mutate({ content: newNote, isPrivate: notePrivate });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white">
              <User className="w-6 h-6" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedContact.name || contact?.name || ""}
                  onChange={(e) => setEditedContact({ ...editedContact, name: e.target.value })}
                  className="text-xl font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <h2 className="text-xl font-semibold text-gray-900">{contact?.name || "Unknown Contact"}</h2>
              )}
              <p className="text-gray-600">{contact?.phone || contact?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                disabled={updateContactMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditedContact(contact || {});
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Contact Details */}
          <div className="w-1/3 p-6 border-r overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedContact.phone || contact?.phone || ""}
                    onChange={(e) => setEditedContact({ ...editedContact, phone: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{contact?.phone || "Not provided"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedContact.email || contact?.email || ""}
                    onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{contact?.email || "Not provided"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                {isEditing ? (
                  <select
                    value={editedContact.status || contact?.status || "LEAD"}
                    onChange={(e) => setEditedContact({ ...editedContact, status: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    style={{ color: '#000000', backgroundColor: '#ffffff' }}
                  >
                    <option value="LEAD" style={{ color: '#000000' }}>Lead</option>
                    <option value="CONTACTED" style={{ color: '#000000' }}>Contacted</option>
                    <option value="RESPONDED" style={{ color: '#000000' }}>Responded</option>
                    <option value="QUALIFIED" style={{ color: '#000000' }}>Qualified</option>
                    <option value="CLOSED" style={{ color: '#000000' }}>Closed</option>
                  </select>
                ) : (
                  <p className="mt-1 text-gray-900">{contact?.status || "Lead"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quick Notes</label>
                {isEditing ? (
                  <textarea
                    value={editedContact.quickNotes || contact?.quickNotes || ""}
                    onChange={(e) => setEditedContact({ ...editedContact, quickNotes: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{contact?.quickNotes || "No notes"}</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span>Call {contact?.phone}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span>Send SMS</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <span>Send Email</span>
                </button>
                <button 
                  onClick={() => setShowScheduler(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg"
                >
                  <Clock className="w-4 h-4 text-black" />
                  <span className="text-black">Schedule Follow-up</span>
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 flex flex-col">
            {/* Timeline Header */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {timelineItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex gap-4">
                    <div className="flex-shrink-0">
                      {item.type === 'message' ? (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Edit className="w-4 h-4 text-yellow-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white border rounded-lg p-4">
                        {item.type === 'message' ? (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">
                                {(item.data as MessageWithUser).direction === 'INBOUND' ? contact?.name : 'You'}
                              </span>
                              <span className="text-xs text-gray-500">{(item.data as MessageWithUser).channel}</span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(item.timestamp), "MMM d, h:mm a")}
                              </span>
                            </div>
                            <p className="text-gray-700">{(item.data as MessageWithUser).body}</p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">
                                {(item.data as NoteWithUser).user.name || 'User'}
                              </span>
                              <span className="text-xs text-gray-500">added a note</span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(item.timestamp), "MMM d, h:mm a")}
                              </span>
                              {(item.data as NoteWithUser).isPrivate && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Private</span>
                              )}
                            </div>
                            <p className="text-gray-700">{(item.data as NoteWithUser).content}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Note */}
            <div className="p-6 border-t bg-gray-50">
              <div className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this contact..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  rows={2}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notePrivate}
                      onChange={(e) => setNotePrivate(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Private note</span>
                  </label>
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addNoteMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Scheduler Modal */}
      {showScheduler && contact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <QuickScheduler
            contactId={contactId}
            contactName={contact.name || "Contact"}
            contactPhone={contact.phone || undefined}
            contactEmail={contact.email || undefined}
            onScheduled={() => {
              setShowScheduler(false);
              // Optionally refresh messages or show success message
              queryClient.invalidateQueries({ queryKey: ["messages", contactId] });
            }}
            onCancel={() => setShowScheduler(false)}
          />
        </div>
      )}
    </div>
  );
}
