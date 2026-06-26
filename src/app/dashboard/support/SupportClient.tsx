"use client";

import React, { useState } from "react";
import {
  LifeBuoy,
  Plus,
  Send,
  MessageSquare,
  ChevronRight,
  Clock,
  CheckCircle,
  X,
  Loader,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface Message {
  sender: "user" | "admin";
  message: string;
  createdAt: string | Date;
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: "open" | "replied" | "closed";
  messages: Message[];
  createdAt: string | Date;
}

export default function SupportClient({ initialTickets }: { initialTickets: any[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // New ticket modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [creatingTicket, setCreatingTicket] = useState(false);

  const handleSelectTicket = (ticket: Ticket) => {
    setActiveTicket(ticket);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) {
      toast.error("Subject and message are required");
      return;
    }

    setCreatingTicket(true);

    try {
      const res = await fetch("/api/user/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject.trim(),
          message: newMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit ticket");
      }

      // Add to list
      const freshTicket: Ticket = {
        id: data.id,
        subject: newSubject.trim(),
        message: newMessage.trim(),
        status: "open",
        messages: [
          {
            sender: "user",
            message: newMessage.trim(),
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
      };

      setTickets([freshTicket, ...tickets]);
      toast.success("Support ticket created!");
      setIsModalOpen(false);
      setNewSubject("");
      setNewMessage("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create ticket");
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    setSendingReply(true);

    try {
      const res = await fetch("/api/user/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeTicket.id,
          message: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Append locally
      const newMsg: Message = {
        sender: "user",
        message: replyText.trim(),
        createdAt: new Date(),
      };

      const updatedTicket = {
        ...activeTicket,
        status: "open" as const,
        messages: [...activeTicket.messages, newMsg],
      };

      setActiveTicket(updatedTicket);
      setTickets(tickets.map((t) => (t.id === activeTicket.id ? updatedTicket : t)));
      setReplyText("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Toaster position="top-center" />

      {/* Action Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-black text-[var(--ink-900)] uppercase tracking-wider pl-1.5 border-l-3 border-[var(--prism-violet)]">
          My Tickets ({tickets.length})
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-prism text-[10px] py-2 px-4 font-bold flex items-center gap-1"
        >
          <Plus size={13} />
          Create Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Tickets List */}
        <div className="crystal flex flex-col divide-y divide-[rgba(91,79,207,0.12)]">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--ink-500)] font-semibold">
              No tickets filed yet.
            </div>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTicket(t)}
                className={`p-4 text-left flex items-start justify-between w-full hover:bg-[rgba(91,79,207,0.03)] transition-colors ${
                  activeTicket?.id === t.id ? "bg-[rgba(91,79,207,0.05)]" : ""
                }`}
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-black text-[var(--ink-900)] line-clamp-1">{t.subject}</h4>
                  <p className="text-[10px] text-[var(--ink-300)] font-bold mt-1.5 flex items-center gap-1">
                    <MessageSquare size={10} />
                    {t.messages.length} messages
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {t.status === "open" ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[var(--prism-violet)] bg-indigo-50 border border-indigo-200 rounded-md py-0.5 px-1.5">
                      <Clock size={8} /> Open
                    </span>
                  ) : t.status === "replied" ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[var(--prism-emerald)] bg-emerald-50 border border-emerald-200 rounded-md py-0.5 px-1.5">
                      <CheckCircle size={8} /> Replied
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[var(--ink-300)] bg-gray-50 border border-gray-200 rounded-md py-0.5 px-1.5">
                      Closed
                    </span>
                  )}
                  <ChevronRight size={12} className="text-[var(--ink-300)] mt-0.5" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right Column: Ticket Conversation details */}
        <div className="lg:col-span-2 crystal min-h-[400px] flex flex-col justify-between overflow-hidden">
          {activeTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-[rgba(91,79,207,0.04)] border-b border-[rgba(91,79,207,0.12)] flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-[var(--ink-900)] uppercase tracking-wider">
                    {activeTicket.subject}
                  </h3>
                  <p className="text-[10px] text-[var(--ink-500)] mt-1 font-semibold">
                    Ticket ID: <span className="font-mono">{activeTicket.id}</span>
                  </p>
                </div>
                <span className="text-[10px] text-[var(--ink-300)] font-bold">
                  Created on {new Date(activeTicket.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Chat Messages */}
              <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[350px] flex-1">
                {activeTicket.messages.map((m, i) => {
                  const isAdmin = m.sender === "admin";
                  return (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[75%] ${
                        isAdmin ? "self-start" : "self-end"
                      }`}
                    >
                      <span className={`text-[9px] font-bold uppercase tracking-wider mb-1 px-1 ${
                        isAdmin ? "text-[var(--prism-rose)]" : "text-[var(--prism-violet)] self-end"
                      }`}>
                        {isAdmin ? "AltarVision Support" : "You"}
                      </span>
                      <div
                        className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                          isAdmin
                            ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                            : "bg-[var(--prism-violet)] text-white rounded-tr-sm shadow-md"
                        }`}
                      >
                        {m.message}
                      </div>
                      <span className={`text-[8px] text-[var(--ink-300)] font-bold mt-1 px-1 ${
                        isAdmin ? "" : "self-end"
                      }`}>
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              {activeTicket.status !== "closed" ? (
                <form
                  onSubmit={handleSendReply}
                  className="p-4 border-t border-[rgba(91,79,207,0.12)] flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type your message reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 h-10 px-4 rounded-xl bg-white border border-white/80 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="btn-prism w-10 h-10 flex items-center justify-center p-0 shrink-0"
                  >
                    {sendingReply ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                  This support ticket is closed.
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-2 text-center">
              <LifeBuoy size={40} className="text-[var(--ink-300)] stroke-1" />
              <h3 className="text-xs font-black text-[var(--ink-900)] uppercase tracking-wider">
                No Ticket Selected
              </h3>
              <p className="text-[10px] text-[var(--ink-500)] max-w-xs font-semibold leading-relaxed">
                Click a ticket from the left panel to load your conversation or file a new ticket.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="crystal-solid w-full max-w-lg overflow-hidden relative animate-[slide-in-up_0.2s_ease-out]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--prism-violet)] to-[var(--prism-sky)]"></div>

            <div className="p-5 border-b border-[rgba(91,79,207,0.12)] flex items-center justify-between">
              <h3 className="text-xs font-black text-[var(--ink-900)] uppercase tracking-wider">
                Create Support Ticket
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/40 hover:bg-white/70 text-[var(--ink-700)] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                  Ticket Subject
                </label>
                <input
                  type="text"
                  placeholder="Summarize your issue..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                  Describe Your Inquiry
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide details about your query..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="p-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2 border-t border-[rgba(91,79,207,0.12)] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-crystal text-xs font-bold py-2.5 px-4 border-white/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket || !newSubject.trim() || !newMessage.trim()}
                  className="btn-prism text-xs font-bold py-2.5 px-5 flex items-center gap-1.5"
                >
                  {creatingTicket && <Loader size={13} className="animate-spin" />}
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
