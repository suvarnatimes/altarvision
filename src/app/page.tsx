"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Globe, Smartphone, Code2, Megaphone, Palette,
  ArrowRight, CheckCircle2, Star, ExternalLink,
  Users, Award, TrendingUp, Clock, Zap, Sparkles,
  Phone, Mail
} from "lucide-react";

/* ── Scroll-triggered fade ── */
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
        y: direction === "up" ? 30 : 0,
        x: direction === "left" ? -30 : direction === "right" ? 30 : 0,
      }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Data ── */
const services = [
  { icon: Globe,      title: "Web Development",    color: "#5b4fcf", bg: "rgba(91,79,207,0.08)",   border: "rgba(91,79,207,0.2)",
    desc: "Blazing-fast WordPress, custom & e-commerce websites engineered for conversions." },
  { icon: Smartphone, title: "App Development",    color: "#3b82f6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)",
    desc: "Native Android & iOS apps that delight users and drive real business results." },
  { icon: Code2,       title: "Software Solutions", color: "#e879a0", bg: "rgba(232,121,160,0.08)", border: "rgba(232,121,160,0.2)",
    desc: "Custom business software that automates operations and scales with your growth." },
  { icon: Megaphone,  title: "Digital Marketing",  color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)",
    desc: "SEO, paid ads & branding strategies that bring qualified leads and real ROI." },
  { icon: Palette,    title: "Content Creation",   color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",
    desc: "High-impact graphics, social media assets & branding that make you unforgettable." },
];

const portfolio = [
  { title: "APBC India",                url: "http://apbc.in/",                                    tag: "Web Design",      color: "#5b4fcf", desc: "Professional business website for APBC India" },
  { title: "Janatha Trust",             url: "http://janathatrust.com/",                            tag: "Web Development", color: "#3b82f6", desc: "Non-profit organisation digital presence" },
  { title: "John Balcony Safety Nets",  url: "https://www.johnbalconysafetynets.com/",             tag: "E-commerce",      color: "#10b981", desc: "Lead generation website for safety solutions" },
  { title: "Tamizha Balcony Nets",      url: "http://tamizhabalconypigeonsafetynets.in/",          tag: "SEO + Web",       color: "#f59e0b", desc: "Regional business with strong local SEO" },
];

const stats = [
  { value: "150+", label: "Projects Delivered", icon: Award,      color: "#5b4fcf" },
  { value: "80+",  label: "Happy Clients",       icon: Users,      color: "#3b82f6" },
  { value: "5+",   label: "Years Excellence",    icon: Clock,      color: "#e879a0" },
  { value: "99%",  label: "Client Satisfaction", icon: TrendingUp, color: "#10b981" },
];

const testimonials = [
  { name: "John",           role: "Co-Founder", color: "#5b4fcf", rating: 5,
    text: "Our mission at AltarVision is to bridge the gap between complex technology and real business growth. We're committed to excellence in every line of code we write." },
  { name: "Shanthi Raju",   role: "Co-Founder", color: "#3b82f6", rating: 5,
    text: "We believe in building digital products that aren't just functional, but truly impactful. Our client-centric approach ensures your vision is always our top priority." },
  { name: "David Paul",     role: "Co-Founder", color: "#e879a0", rating: 5,
    text: "Innovation is at the heart of everything we do. We strive to provide world-class software solutions from Machilipatnam to the global market." },
];

const whyUs = [
  "Cutting-edge tech stack for future-proof solutions",
  "Dedicated project managers for seamless communication",
  "Agile development with weekly progress updates",
  "Post-launch support and maintenance included",
  "Global clients across 15+ countries",
  "100% transparent pricing — no hidden costs",
];

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBand />
      <ServicesSection />
      <PortfolioSection />
      <WhyUsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}

/* ── HERO ── */
function HeroSection() {
  return (
    <section className="hero-prism dot-matrix min-h-screen relative flex items-center overflow-hidden">

      {/* Angular background accent — large tilted prism shape */}
      <div
        className="absolute right-0 top-0 h-full w-[55%] pointer-events-none"
        style={{
          background: "linear-gradient(145deg, rgba(91,79,207,0.06) 0%, rgba(59,130,246,0.05) 50%, rgba(6,182,212,0.04) 100%)",
          clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />
      {/* Second prism layer */}
      <div
        className="absolute right-0 top-0 h-full w-[40%] pointer-events-none"
        style={{
          background: "linear-gradient(160deg, rgba(91,79,207,0.05) 0%, transparent 80%)",
          clipPath: "polygon(25% 0, 100% 0, 100% 100%, 8% 100%)",
        }}
      />

      {/* Floating geometric shapes */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none"
        style={{ top: "12%", right: "18%", width: 180, height: 180,
          border: "1.5px solid rgba(91,79,207,0.12)", borderRadius: "32px",
          transform: "rotate(20deg)" }}
      />
      <motion.div
        animate={{ rotate: [0, -360] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none"
        style={{ top: "18%", right: "14%", width: 100, height: 100,
          border: "1px solid rgba(59,130,246,0.15)", borderRadius: "16px",
          transform: "rotate(-10deg)" }}
      />
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute pointer-events-none"
        style={{ bottom: "20%", right: "10%", width: 60, height: 60,
          background: "rgba(91,79,207,0.07)", borderRadius: "12px",
          border: "1px solid rgba(91,79,207,0.15)", transform: "rotate(20deg)" }}
      />
      <motion.div
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute pointer-events-none"
        style={{ top: "35%", left: "8%", width: 40, height: 40,
          background: "rgba(6,182,212,0.06)", borderRadius: "8px",
          border: "1px solid rgba(6,182,212,0.18)", transform: "rotate(-15deg)" }}
      />
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute pointer-events-none"
        style={{ top: "60%", left: "5%", width: 28, height: 28,
          background: "rgba(232,121,160,0.08)", borderRadius: "6px",
          border: "1px solid rgba(232,121,160,0.2)", transform: "rotate(35deg)" }}
      />

      {/* Content */}
      <div className="wrap relative z-10 pt-36 pb-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left col — 7 cols */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-7 flex justify-center lg:justify-start"
            >
              <span className="badge-prism text-[10px] sm:text-xs">✦ Global Digital Agency — Machilipatnam, India</span>
            </motion.div>

            <motion.h1
              className="font-[family-name:var(--font-outfit)] font-black leading-[1.05] mb-7 text-center lg:text-left"
              style={{ fontSize: "clamp(2.4rem, 8vw, 4.2rem)", color: "var(--ink-900)" }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              We Craft{" "}
              <span className="text-prism">Digital</span>
              <br />
              Experiences That
              <br />
              <span className="text-prism-warm">Drive Growth</span>
            </motion.h1>

            <motion.p
              className="text-lg mb-10 leading-relaxed max-w-lg text-center lg:text-left mx-auto lg:mx-0"
              style={{ color: "var(--ink-500)" }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
            >
              From stunning websites to powerful mobile apps and data-driven digital marketing —
              AltarVision is your all-in-one partner for digital success.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.26 }}
            >
              <Link href="/contact" className="btn-prism justify-center">
                Start Your Project <ArrowRight size={17} />
              </Link>
              <Link href="/services" className="btn-crystal justify-center">
                Explore Services
              </Link>
            </motion.div>

            {/* Contact quick-access */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a
                href="tel:+916302596477"
                className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-250 hover:scale-105 shrink-0"
                style={{
                  background: "rgba(91,79,207,0.07)",
                  border: "1px solid rgba(91,79,207,0.18)",
                  color: "var(--prism-violet)",
                }}
              >
                <Phone size={15} />
                +91 6302596477
              </a>
              <a
                href="mailto:altarvision122@gmail.com"
                className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-250 hover:scale-105 shrink-0"
                style={{
                  background: "rgba(59,130,246,0.07)",
                  border: "1px solid rgba(59,130,246,0.18)",
                  color: "var(--prism-sky)",
                }}
              >
                <Mail size={15} />
                <span className="truncate max-w-[200px]">altarvision122@gmail.com</span>
              </a>
            </motion.div>
          </div>

          {/* Right col — 5 cols: floating crystal dashboard */}
          <motion.div
            className="lg:col-span-5 relative hidden lg:block"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Main card */}
            <div
              className="relative rounded-2xl p-7 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.22)",
                backdropFilter: "blur(32px) saturate(160%)",
                WebkitBackdropFilter: "blur(32px) saturate(160%)",
                border: "1px solid rgba(255,255,255,0.45)",
                boxShadow: "0 24px 72px rgba(91,79,207,0.1), 0 4px 16px rgba(91,79,207,0.06)",
              }}
            >
              {/* Corner accent */}
              <div
                className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                style={{
                  background: "linear-gradient(225deg, rgba(91,79,207,0.12) 0%, transparent 70%)",
                  borderRadius: "0 20px 0 0",
                }}
              />

              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #5b4fcf, #3b82f6)" }}
                >
                  <Sparkles size={20} color="white" />
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: "var(--ink-900)" }}>AltarVision Dashboard</div>
                  <div className="text-xs" style={{ color: "var(--ink-300)" }}>Live performance metrics</div>
                </div>
                {/* Status dot */}
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-600 font-semibold">Active</span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-4 mb-6">
                {[
                  { label: "Project Delivery Rate", pct: 98, color: "#5b4fcf" },
                  { label: "Client Satisfaction",   pct: 99, color: "#3b82f6" },
                  { label: "On-Time Delivery",      pct: 96, color: "#10b981" },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium" style={{ color: "var(--ink-700)" }}>{label}</span>
                      <span className="font-bold" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "rgba(91,79,207,0.08)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.4, delay: 0.7, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini stats row */}
              <div
                className="grid grid-cols-3 gap-3 pt-5"
                style={{ borderTop: "1px solid rgba(91,79,207,0.1)" }}
              >
                {[
                  { val: "150+", label: "Projects" },
                  { val: "80+",  label: "Clients"  },
                  { val: "5★",   label: "Rating"   },
                ].map(({ val, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-xl font-extrabold text-prism">{val}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--ink-300)" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating chip 1 */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-5 -left-6 flex items-center gap-2.5 rounded-xl px-4 py-3 z-10"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 8px 28px rgba(91,79,207,0.12)",
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>
                <Zap size={15} color="white" />
              </div>
              <div>
                <div className="font-bold text-xs" style={{ color: "var(--ink-900)" }}>2× Faster</div>
                <div className="text-[10px]" style={{ color: "var(--ink-300)" }}>Delivery speed</div>
              </div>
            </motion.div>

            {/* Floating chip 2 */}
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute -bottom-4 -right-5 flex items-center gap-2.5 rounded-xl px-4 py-3 z-10"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 8px 28px rgba(91,79,207,0.12)",
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e879a0, #5b4fcf)" }}>
                <Award size={15} color="white" />
              </div>
              <div>
                <div className="font-bold text-xs" style={{ color: "var(--ink-900)" }}>Top Rated</div>
                <div className="text-[10px]" style={{ color: "var(--ink-300)" }}>5★ Reviews</div>
              </div>
            </motion.div>

            {/* Decorative rings */}
            <div
              className="absolute -bottom-14 -right-14 rounded-full pointer-events-none"
              style={{
                width: 220, height: 220,
                border: "1.5px dashed rgba(91,79,207,0.12)",
                animation: "prism-rotate 24s linear infinite",
              }}
            />
            <div
              className="absolute -bottom-7 -right-7 rounded-full pointer-events-none"
              style={{
                width: 100, height: 100,
                border: "1px solid rgba(59,130,246,0.18)",
                animation: "prism-counter 16s linear infinite",
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: "var(--ink-300)" }}>Scroll</span>
        <div className="w-px h-7" style={{ background: "linear-gradient(to bottom, rgba(91,79,207,0.5), transparent)" }} />
      </motion.div>
    </section>
  );
}

/* ── STATS BAND ── */
function StatsBand() {
  return (
    <section className="py-6 relative z-10">
      <div className="wrap">
        <div
          className="rounded-2xl px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(28px) saturate(150%)",
            WebkitBackdropFilter: "blur(28px) saturate(150%)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 8px 40px rgba(91,79,207,0.08)",
          }}
        >
          {stats.map(({ value, label, icon: Icon, color }, i) => (
            <FadeIn key={label} delay={i * 0.08} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 py-4 px-2 sm:px-6">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}14`, border: `1px solid ${color}28` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-extrabold" style={{ color: "var(--ink-900)" }}>{value}</div>
                <div className="text-[10px] sm:text-xs font-medium" style={{ color: "var(--ink-300)" }}>{label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── SERVICES ── */
function ServicesSection() {
  return (
    <section className="section-pad prism-scene geo-grid">
      <div className="wrap">
        <FadeIn className="text-center mb-16">
          <span className="badge-prism mb-5">What We Do</span>
          <h2
            className="font-[family-name:var(--font-outfit)] font-extrabold mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--ink-900)", lineHeight: 1.1 }}
          >
            Services Built for{" "}
            <span className="text-prism">Results</span>
          </h2>
          <p className="max-w-lg mx-auto" style={{ color: "var(--ink-500)" }}>
            Every service is engineered for performance, scalability, and measurable business outcomes.
          </p>
        </FadeIn>

        {/* 3-col grid with a CTA card at end */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.09}>
              <Link href="/services" className="block h-full group">
                <div
                  className="crystal crystal-hover h-full p-7 relative overflow-hidden cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.18)" }}
                >
                  {/* Top accent razor line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }}
                  />

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-105 duration-300"
                    style={{ background: s.bg, border: `1px solid ${s.border}` }}
                  >
                    <s.icon size={22} style={{ color: s.color }} />
                  </div>

                  <h3 className="text-lg font-bold mb-2.5" style={{ color: "var(--ink-900)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--ink-500)" }}>{s.desc}</p>

                  <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: s.color }}>
                    Learn more <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 duration-300" />
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}

          {/* CTA card */}
          <FadeIn delay={0.5}>
            <div
              className="crystal h-full p-7 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(91,79,207,0.12) 0%, rgba(59,130,246,0.07) 100%)",
                borderColor: "rgba(91,79,207,0.25)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, #5b4fcf, #3b82f6, transparent)" }} />
              <div>
                <div className="w-11 h-11 rounded-xl mb-5 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #5b4fcf, #3b82f6)" }}>
                  <Sparkles size={20} color="white" />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "var(--ink-900)" }}>Not sure what you need?</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--ink-500)" }}>
                  Let our experts analyze your business and recommend the best strategy — completely free.
                </p>
              </div>
              <Link href="/contact" className="btn-prism text-center justify-center">
                Free Consultation
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ── PORTFOLIO ── */
function PortfolioSection() {
  return (
    <section className="section-pad section-night clip-wedge-down relative overflow-hidden">
      {/* Geometric lines on dark bg */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(91,79,207,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(91,79,207,0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glowing orbs on dark */}
      <div className="absolute top-[-60px] left-[20%] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(91,79,207,0.2) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="absolute bottom-[-40px] right-[15%] w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)", filter: "blur(36px)" }} />

      <div className="wrap relative z-10">
        <FadeIn className="text-center mb-14">
          <span className="badge-prism-dark mb-5">Our Work</span>
          <h2
            className="font-[family-name:var(--font-outfit)] font-extrabold mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "white", lineHeight: 1.1 }}
          >
            Projects We&apos;re{" "}
            <span className="text-prism-light">Proud Of</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>
            Real results for real clients — from local businesses to growing enterprises.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {portfolio.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.1}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="crystal-dark crystal-dark-hover group block overflow-hidden"
              >
                {/* Colored razor line */}
                <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${p.color}, transparent)` }} />
                <div className="p-7">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.12em] rounded-md px-3 py-1 mb-3 inline-block"
                        style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}35` }}
                      >
                        {p.tag}
                      </span>
                      <h3 className="text-lg font-bold text-white">{p.title}</h3>
                    </div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 shrink-0"
                      style={{ background: `${p.color}20` }}
                    >
                      <ExternalLink size={16} style={{ color: p.color }} />
                    </div>
                  </div>
                  <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>{p.desc}</p>
                  <div className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{p.url}</div>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── WHY US ── */
function WhyUsSection() {
  return (
    <section className="section-pad prism-scene">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="left" className="text-center lg:text-left">
            <span className="badge-prism mb-5">Why AltarVision</span>
            <h2
              className="font-[family-name:var(--font-outfit)] font-extrabold mb-5"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--ink-900)", lineHeight: 1.1 }}
            >
              The Partner You{" "}
              <span className="text-prism">Can Trust</span>
            </h2>
            <p className="leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0" style={{ color: "var(--ink-500)", fontSize: "1.05rem" }}>
              We&apos;re not just another development agency. We&apos;re your long-term digital growth partner —
              combining technology, creativity, and strategy to deliver outcomes that matter.
            </p>
            <div className="space-y-3.5 mb-8 flex flex-col items-center lg:items-start">
              {whyUs.map((point, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 justify-center lg:justify-start"
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #5b4fcf, #3b82f6)" }}
                  >
                    <CheckCircle2 size={12} color="white" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: "var(--ink-700)" }}>{point}</span>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center lg:justify-start">
              <Link href="/contact" className="btn-prism">
                Let&apos;s Work Together <ArrowRight size={17} />
              </Link>
            </div>
          </FadeIn>

          <FadeIn direction="right">
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "24/7", label: "Support",         icon: "🛡️", color: "#5b4fcf" },
                { val: "2×",   label: "Faster Delivery", icon: "⚡", color: "#3b82f6" },
                { val: "₹0",   label: "Hidden Charges",  icon: "💎", color: "#e879a0" },
                { val: "∞",    label: "Scalability",     icon: "🚀", color: "#10b981" },
              ].map(({ val, label, icon, color }) => (
                <motion.div
                  key={label}
                  className="crystal p-6 text-center relative overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.22)" }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  {/* Corner accent */}
                  <div
                    className="absolute top-0 left-0 w-12 h-12 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${color}18 0%, transparent 70%)`, borderRadius: "18px 0 0 0" }}
                  />
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-2xl font-extrabold mb-1" style={{ color }}>{val}</div>
                  <div className="text-xs font-medium" style={{ color: "var(--ink-300)" }}>{label}</div>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ── TESTIMONIALS ── */
function TestimonialsSection() {
  return (
    <section className="section-pad section-night clip-wedge-up relative overflow-hidden">
      {/* Geometric decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(91,79,207,0.2) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-[-80px] right-[10%] w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,121,160,0.12) 0%, transparent 70%)", filter: "blur(50px)" }} />

      <div className="wrap relative z-10">
        <FadeIn className="text-center mb-14">
          <span className="badge-prism-dark mb-5">Leadership</span>
          <h2
            className="font-[family-name:var(--font-outfit)] font-extrabold mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "white", lineHeight: 1.1 }}
          >
            Meet Our{" "}
            <span className="text-prism-light">Founders</span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.14}>
              <div
                className="crystal-dark h-full p-7 flex flex-col relative overflow-hidden"
                style={{ borderTop: `2px solid ${t.color}` }}
              >
                {/* Subtle corner glow */}
                <div
                  className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
                  style={{ background: `radial-gradient(circle at top right, ${t.color}20 0%, transparent 70%)` }}
                />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1 mb-5 italic" style={{ color: "rgba(255,255,255,0.65)" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}70)` }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTASection() {
  return (
    <section className="section-pad prism-scene">
      <div className="wrap">
        <FadeIn>
          <div
            className="relative rounded-2xl p-8 sm:p-12 md:p-20 text-center overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.22)",
              backdropFilter: "blur(32px) saturate(160%)",
              WebkitBackdropFilter: "blur(32px) saturate(160%)",
              border: "1.5px solid rgba(91,79,207,0.25)",
              boxShadow: "0 24px 80px rgba(91,79,207,0.1)",
            }}
          >
            {/* Razor top line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 prism-line-h" />

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(91,79,207,0.1) 0%, transparent 70%)", borderRadius: "20px 0 0 0" }} />
            <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none"
              style={{ background: "linear-gradient(315deg, rgba(59,130,246,0.08) 0%, transparent 70%)", borderRadius: "0 0 20px 0" }} />

            <div className="relative z-10">
              <span className="badge-prism mb-6">Ready to Start?</span>
              <h2
                className="font-[family-name:var(--font-outfit)] font-extrabold mb-5"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--ink-900)", lineHeight: 1.1 }}
              >
                Ready to Elevate Your
                <br />
                <span className="text-prism">Digital Presence?</span>
              </h2>
              <p className="max-w-lg mx-auto mb-10" style={{ color: "var(--ink-500)", fontSize: "1.05rem" }}>
                Let&apos;s build something extraordinary together. Get a free consultation and tailored quote today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/contact" className="btn-prism">
                  Get Free Quote <ArrowRight size={17} />
                </Link>
                <a
                  href="https://wa.me/916302596477?text=Hello%20AltarVision!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-crystal"
                >
                  WhatsApp Us 💬
                </a>
              </div>
              {/* Contact row */}
              <div className="flex flex-wrap gap-5 justify-center">
                <a href="tel:+916302596477" className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--prism-violet)" }}>
                  <Phone size={15} /> +91 6302596477
                </a>
                <span style={{ color: "var(--ink-300)" }}>·</span>
                <a href="mailto:altarvision122@gmail.com" className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--prism-sky)" }}>
                  <Mail size={15} /> altarvision122@gmail.com
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
