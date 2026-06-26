"use client";

import React, { useState } from "react";
import {
  LifeBuoy,
  Send,
  MessageSquare,
  ChevronRight,
  Clock,
  CheckCircle,
  X,
  Loader,
  User,
  PowerOff,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface Message {
  sender: "user" | "admin";
  message: string;
  createdAt: string | Date;
}

interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  status: "open" | "replied" | "closed";
  messages: Message[];
  createdAt: string | Date;
}

export default function AdminSupportClient({ initialTickets }: { initialTickets: any[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleSelectTicket = (ticket: Ticket) => {
    setActiveTicket(ticket);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    setSendingReply(true);

    try {
      const res = await fetch("/api/admin/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeTicket.id,
          replyMessage: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reply");

      const newMsg: Message = {
        sender: "admin",
        message: replyText.trim(),
        createdAt: new Date(),
      };

      const updatedTicket = {
        ...activeTicket,
        status: "replied" as const,
        messages: [...activeTicket.messages, newMsg],
      };

      setActiveTicket(updatedTicket);
      setTickets(tickets.map((t) => (t.id === activeTicket.id ? updatedTicket : t)));
      setReplyText("");
      toast.success("Reply sent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!activeTicket) return;
    if (!window.confirm("Are you sure you want to close this support ticket?")) return;

    setClosing(true);

    try {
      const res = await fetch("/api/admin/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeTicket.id,
          status: "closed",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to close ticket");

      const updatedTicket = {
        ...activeTicket,
        status: "closed" as const,
      };

      setActiveTicket(updatedTicket);
      setTickets(tickets.map((t) => (t.id === activeTicket.id ? updatedTicket : t)));
      toast.success("Ticket closed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to close ticket");
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Toaster position="top-center" />

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
                  <p className="text-[10px] text-[var(--ink-500)] mt-1 truncate">
                    From: {t.userName}
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

        {/* Right Column: Ticket details & chat */}
        <div className="lg:col-span-2 crystal min-h-[400px] flex flex-col justify-between overflow-hidden">
          {activeTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-[rgba(91,79,207,0.04)] border-b border-[rgba(91,79,207,0.12)] flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-[var(--ink-900)] uppercase tracking-wider">
                    {activeTicket.subject}
                  </h3>
                  <p className="text-[10px] text-[var(--ink-500)] mt-1 font-semibold flex items-center gap-1.5">
                    <User size={10} className="text-[var(--prism-violet)]" />
                    {activeTicket.userName} ({activeTicket.userEmail})
                  </p>
                </div>
                
                {activeTicket.status !== "closed" && (
                  <button
                    onClick={handleCloseTicket}
                    disabled={closing}
                    className="btn-crystal text-[9px] py-1.5 px-3 border-white/60 font-bold text-[var(--prism-rose)] hover:bg-red-50 hover:border-red-200 flex items-center gap-1 shrink-0"
                  >
                    {closing ? <Loader size={11} className="animate-spin" /> : <PowerOff size={11} />}
                    Close Ticket
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[350px] flex-1">
                {activeTicket.messages.map((m, i) => {
                  const isAdmin = m.sender === "admin";
                  return (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[75%] ${
                        isAdmin ? "self-end" : "self-start"
                      }`}
                    >
                      <span className={`text-[9px] font-bold uppercase tracking-wider mb-1 px-1 ${
                        isAdmin ? "text-[var(--prism-rose)] self-end" : "text-[var(--prism-violet)]"
                      }`}>
                        {isAdmin ? "You (Admin)" : activeTicket.userName}
                      </span>
                      <div
                        className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                          isAdmin
                            ? "bg-[var(--prism-rose)] text-white rounded-tr-sm shadow-md"
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                        }`}
                      >
                        {m.message}
                      </div>
                      <span className={`text-[8px] text-[var(--ink-300)] font-bold mt-1 px-1 ${
                        isAdmin ? "self-end" : ""
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
                    placeholder="Type your support reply..."
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
                Click a ticket from the left panel to load details and respond.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
