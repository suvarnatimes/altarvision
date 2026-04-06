"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2, ArrowRight } from "lucide-react";

function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: direction === "up" ? 28 : 0,
        x: direction === "left" ? -28 : direction === "right" ? 28 : 0,
      }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "+91 6302596477",
    href: "tel:+916302596477",
    color: "#5b4fcf",
    bg: "rgba(91,79,207,0.08)",
  },
  {
    icon: Mail,
    label: "Email",
    value: "altarvision122@gmail.com",
    href: "mailto:altarvision122@gmail.com",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Machilipatnam, Andhra Pradesh, India",
    href: "https://maps.google.com/?q=Machilipatnam,Andhra+Pradesh,India",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with us now",
    href: "https://wa.me/916302596477?text=Hello%20AltarVision!",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
  },
];

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "10px",
  fontSize: "0.875rem",
  color: "var(--ink-900)" as string,
  outline: "none",
  transition: "all 0.25s ease",
  background: "rgba(255,255,255,0.55)",
  border: "1.5px solid rgba(91,79,207,0.18)",
  backdropFilter: "blur(10px)",
};

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = typeof result.error === 'object' ? result.error.message : result.error;
        throw new Error(errorMsg || "Something went wrong. Please try again.");
      }

      setStatus("sent");
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMessage(err.message || "Failed to send message. Please try again later.");
      setStatus("error");
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="hero-prism dot-matrix relative pt-48 pb-20 overflow-hidden">
        {/* Geometric prism accents */}
        <div
          className="absolute right-0 top-0 h-full w-[45%] pointer-events-none"
          style={{
            background: "linear-gradient(145deg, rgba(91,79,207,0.06) 0%, rgba(59,130,246,0.04) 100%)",
            clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0 100%)",
          }}
        />
        <div className="absolute top-[-60px] left-[15%] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(91,79,207,0.1) 0%, transparent 70%)", filter: "blur(50px)" }} />
        <div className="absolute bottom-[-40px] right-[10%] w-60 h-60 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="wrap relative z-10 text-center">
          <FadeIn>
            <span className="badge-prism mb-5">Get In Touch</span>
            <h1
              className="font-[family-name:var(--font-outfit)] font-black mb-5"
              style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", color: "var(--ink-900)", lineHeight: 1.08 }}
            >
              Let&apos;s Build Something
              <br />
              <span className="text-prism">Extraordinary</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--ink-500)" }}>
              Ready to start your digital journey? Fill out the form below and our team will respond within 24 hours.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Main content */}
      <section className="section-pad prism-scene">
        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Contact Info sidebar */}
            <div className="lg:col-span-2 space-y-5">
              <FadeIn direction="left" className="text-center lg:text-left">
                <h2 className="text-2xl font-extrabold text-[#0f0e2a] mb-2 font-[family-name:var(--font-outfit)]">
                  Contact Information
                </h2>
                <p className="text-[#5a5886] text-sm leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
                  We&apos;re available Monday–Saturday, 9am–7pm IST. For urgent queries, WhatsApp us directly.
                </p>
              </FadeIn>

              {contactInfo.map((info, i) => (
                <FadeIn key={info.label} delay={i * 0.1} direction="left">
                  <a
                    href={info.href}
                    target={info.label === "Address" || info.label === "WhatsApp" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 crystal crystal-hover group"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300"
                      style={{ background: info.bg, border: `1px solid ${info.color}30` }}
                    >
                      <info.icon size={19} style={{ color: info.color }} />
                    </div>
                    <div>
                      <div className="text-xs mb-0.5 font-semibold uppercase tracking-wider" style={{ color: "var(--ink-300)" }}>{info.label}</div>
                      <div className="text-sm font-semibold" style={{ color: "var(--ink-900)" }}>{info.value}</div>
                    </div>
                    <ArrowRight size={15} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "var(--ink-300)" }} />
                  </a>
                </FadeIn>
              ))}

              {/* WhatsApp CTA */}
              <FadeIn delay={0.45} direction="left">
                <a
                  href="https://wa.me/916302596477?text=Hello%20AltarVision!%20I%27m%20interested%20in%20your%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-6 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #25d366, #128c7e)",
                    boxShadow: "0 8px 30px rgba(37,211,102,0.35)",
                  }}
                >
                  <MessageCircle size={22} />
                  Chat on WhatsApp
                  <ArrowRight size={16} className="ml-auto" />
                </a>
              </FadeIn>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <FadeIn direction="right" className="text-center sm:text-left">
                <div
                  className="crystal p-6 sm:p-8 md:p-10"
                  style={{ background: "rgba(255,255,255,0.22)" }}
                >
                  <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-extrabold mb-2" style={{ color: "var(--ink-900)" }}>
                    Send Us a Message
                  </h2>
                  <p className="text-sm mb-8 max-w-md mx-auto sm:mx-0" style={{ color: "var(--ink-500)" }}>
                    We&apos;ll get back to you within 24 hours with a tailored plan and quote.
                  </p>

                  {status === "sent" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                        style={{ background: "rgba(91,79,207,0.1)", border: "1px solid rgba(91,79,207,0.22)" }}
                      >
                        <CheckCircle2 size={38} style={{ color: "#5b4fcf" }} />
                      </div>
                      <h3 className="text-2xl font-extrabold mb-2" style={{ color: "var(--ink-900)" }}>Message Sent! 🎉</h3>
                      <p style={{ color: "var(--ink-500)" }}>
                        Thank you! Our team will reach out to you within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {status === "error" && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                          {errorMessage}
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--ink-500)" }} htmlFor="name">
                            Full Name *
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = "rgba(91,79,207,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(91,79,207,0.08)"; }}
                            onBlur={e => { e.target.style.borderColor = "rgba(91,79,207,0.18)"; e.target.style.boxShadow = "none"; }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--ink-500)" }} htmlFor="email">
                            Email Address *
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@company.com"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = "rgba(91,79,207,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(91,79,207,0.08)"; }}
                            onBlur={e => { e.target.style.borderColor = "rgba(91,79,207,0.18)"; e.target.style.boxShadow = "none"; }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--ink-500)" }} htmlFor="phone">
                            Phone Number
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 6302596477"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = "rgba(91,79,207,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(91,79,207,0.08)"; }}
                            onBlur={e => { e.target.style.borderColor = "rgba(91,79,207,0.18)"; e.target.style.boxShadow = "none"; }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--ink-500)" }} htmlFor="service">
                            Service Required
                          </label>
                          <select
                            id="service"
                            name="service"
                            value={formData.service}
                            onChange={handleChange}
                            style={{ ...inputStyle, cursor: "pointer", appearance: "none" } as React.CSSProperties}
                            onFocus={e => { (e.target as HTMLElement).style.borderColor = "rgba(91,79,207,0.5)"; (e.target as HTMLElement).style.boxShadow = "0 0 0 3px rgba(91,79,207,0.08)"; }}
                            onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(91,79,207,0.18)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
                          >
                            <option value="">Select a service</option>
                            <option value="web">Web Development</option>
                            <option value="app">App Development</option>
                            <option value="software">Software Solutions</option>
                            <option value="marketing">Digital Marketing</option>
                            <option value="content">Content Creation</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--ink-500)" }} htmlFor="message">
                          Your Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          placeholder="Tell us about your project, goals, and timeline..."
                          style={{ ...inputStyle, resize: "none" } as React.CSSProperties}
                          onFocus={e => { e.target.style.borderColor = "rgba(91,79,207,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(91,79,207,0.08)"; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(91,79,207,0.18)"; e.target.style.boxShadow = "none"; }}
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={status === "sending"}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full btn-prism justify-center py-3.5 text-sm"
                      >
                        {status === "sending" ? (
                          <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message <Send size={17} />
                          </>
                        )}
                      </motion.button>
                    </form>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="pb-20 prism-scene">
        <div className="wrap">
          <FadeIn className="text-center sm:text-left">
            <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-extrabold mb-6" style={{ color: "var(--ink-900)" }}>
              Find Us in Machilipatnam
            </h2>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1.5px solid rgba(91,79,207,0.18)",
                height: "380px",
                boxShadow: "0 16px 48px rgba(91,79,207,0.1)",
              }}
            >
              <iframe
                title="AltarVision Location - Machilipatnam, Andhra Pradesh"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61335.96!2d80.9!3d16.17!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35d5a56f8b3a4d%3A0xa76e0e1c8ef2f0b8!2sMachilipatnam%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
