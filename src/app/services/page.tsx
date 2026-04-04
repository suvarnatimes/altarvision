"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Globe, Smartphone, Code2, Megaphone, Palette,
  CheckCircle2, ArrowRight, Zap, ShieldCheck, TrendingUp,
  LayoutTemplate, ShoppingCart, Search, BarChart3, FilePen,
  Share2, Layout, Cog, Database, Lock
} from "lucide-react";

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
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const services = [
  {
    id: "web",
    icon: Globe,
    title: "Web Development",
    subtitle: "Websites that convert visitors into customers",
    color: "#5b4fcf",
    bg: "rgba(91,79,207,0.08)",
    border: "rgba(91,79,207,0.22)",
    description:
      "We engineer blazing-fast, visually stunning websites that don't just look great — they perform. From WordPress to fully custom builds, every site we create is optimized for SEO, speed, and conversions.",
    features: [
      "Custom WordPress Development",
      "E-commerce & WooCommerce",
      "Landing Page Design",
      "Progressive Web Apps (PWA)",
      "CMS Integration",
      "Performance Optimization",
    ],
    subServices: [
      { icon: LayoutTemplate, label: "WordPress Sites", desc: "Flexible, powerful, easy to manage" },
      { icon: ShoppingCart, label: "E-commerce", desc: "Stores that drive sales 24/7" },
      { icon: Layout, label: "Custom Builds", desc: "Tailored to your exact requirements" },
    ],
    benefits: ["SEO-first architecture", "Mobile-first responsive", "Sub-2s load times", "CMS training included"],
  },
  {
    id: "app",
    icon: Smartphone,
    title: "App Development",
    subtitle: "Mobile experiences users love to use",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.22)",
    description:
      "We craft native Android and iOS applications that are intuitive, performant, and scalable. Our apps are designed to solve real user problems and drive measurable results for your business.",
    features: [
      "Native Android (Kotlin/Java)",
      "Native iOS (Swift)",
      "Cross-platform (React Native/Flutter)",
      "UI/UX Design & Prototyping",
      "API Integration",
      "App Store Optimization (ASO)",
    ],
    subServices: [
      { icon: Smartphone, label: "Android Apps", desc: "Kotlin/Java native development" },
      { icon: Zap, label: "iOS Apps", desc: "Swift-powered premium experiences" },
      { icon: Share2, label: "Cross-platform", desc: "One codebase, both platforms" },
    ],
    benefits: ["Offline-first capability", "Push notifications", "Secure data handling", "App Store submission support"],
  },
  {
    id: "software",
    icon: Code2,
    title: "Software Solutions",
    subtitle: "Custom tools built for your business needs",
    color: "#e879a0",
    bg: "rgba(232,121,160,0.08)",
    border: "rgba(232,121,160,0.22)",
    description:
      "Off-the-shelf software rarely fits perfectly. We build custom business solutions — ERPs, CRMs, dashboards, and automation tools — that map directly to your workflow and scale with your growth.",
    features: [
      "ERP & CRM Systems",
      "Business Process Automation",
      "Admin Dashboards & Portals",
      "API Development & Integration",
      "Database Design & Architecture",
      "Legacy System Modernization",
    ],
    subServices: [
      { icon: Database, label: "ERP / CRM", desc: "Streamline your entire operations" },
      { icon: Cog, label: "Automation", desc: "Eliminate repetitive tasks" },
      { icon: Lock, label: "Secure Portals", desc: "Role-based access management" },
    ],
    benefits: ["100% custom logic", "Scalable architecture", "Detailed documentation", "Ongoing maintenance"],
  },
  {
    id: "marketing",
    icon: Megaphone,
    title: "Digital Marketing",
    subtitle: "Growth strategies that deliver real ROI",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.22)",
    description:
      "We combine data, creativity, and proven frameworks to grow your digital presence. From SEO to paid ads and full brand strategy, our marketing team delivers measurable results.",
    features: [
      "Search Engine Optimization (SEO)",
      "Google & Meta Ads (PPC)",
      "Social Media Management",
      "Email Marketing Campaigns",
      "Brand Strategy & Identity",
      "Analytics & Reporting",
    ],
    subServices: [
      { icon: Search, label: "SEO Services", desc: "Rank higher, attract more traffic" },
      { icon: BarChart3, label: "Paid Ads", desc: "Targeted campaigns with clear ROI" },
      { icon: TrendingUp, label: "Brand Building", desc: "Consistent, powerful brand identity" },
    ],
    benefits: ["Monthly detailed reports", "Competitor analysis included", "A/B testing strategy", "Dedicated account manager"],
  },
  {
    id: "content",
    icon: Palette,
    title: "Content Creation",
    subtitle: "Visuals that communicate your brand story",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.22)",
    description:
      "Content is what connects your brand to your audience. Our creative team delivers high-quality graphics, social media assets, video content, and comprehensive branding that makes your business memorable.",
    features: [
      "Logo & Brand Identity",
      "Social Media Graphics & Reels",
      "Marketing Collateral Design",
      "Video Editing & Animation",
      "Infographic Design",
      "Content Strategy",
    ],
    subServices: [
      { icon: Palette, label: "Branding", desc: "Identity that stands out" },
      { icon: FilePen, label: "Copywriting", desc: "Words that persuade and convert" },
      { icon: Share2, label: "Social Media", desc: "Content that goes viral" },
    ],
    benefits: ["Consistent brand voice", "Platform-optimized assets", "Unlimited revisions policy", "Brand guidelines included"],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-prism dot-matrix min-h-[70vh] relative flex items-center overflow-hidden pt-20">
        <div
          className="absolute right-0 top-0 h-full w-[50%] pointer-events-none"
          style={{
            background: "linear-gradient(145deg, rgba(91,79,207,0.06) 0%, rgba(59,130,246,0.04) 100%)",
            clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0 100%)",
          }}
        />
        <div className="wrap relative z-10 text-center">
          <FadeIn>
            <span className="badge-prism mb-5">Our Services</span>
            <h1
              className="font-[family-name:var(--font-outfit)] font-black leading-[1.1] mb-6"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", color: "var(--ink-900)" }}
            >
              Everything You Need to<br />
              <span className="text-prism">Dominate Online</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: "var(--ink-500)" }}>
              From strategy to execution — we offer end-to-end digital services that grow businesses of all sizes.
            </p>
            <Link href="/contact" className="btn-prism">
              Get a Custom Quote <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Service Navigation pills */}
      <div className="sticky top-[82px] z-40 py-4" style={{ background: "rgba(255,255,255,0.45)", backdropFilter: "blur(32px) saturate(150%)", WebkitBackdropFilter: "blur(32px) saturate(150%)", borderBottom: "1px solid rgba(91,79,207,0.12)" }}>
        <div className="wrap">
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar justify-center">
            {services.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-280 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(91,79,207,0.18)",
                  color: "var(--ink-700)",
                  boxShadow: "0 2px 10px rgba(91,79,207,0.06)",
                }}
              >
                <s.icon size={13} style={{ color: s.color }} />
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Services Detail Sections */}
      <div className="prism-scene geo-grid">
        {services.map((service, idx) => (
          <section
            key={service.id}
            id={service.id}
            className="section-pad relative"
            style={{ background: idx % 2 === 1 ? "rgba(91,79,207,0.02)" : "transparent" }}
          >
            <div className="wrap">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${idx % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                {/* Content */}
                <FadeIn direction={idx % 2 === 0 ? "left" : "right"}>
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                    style={{ background: service.bg, border: `1px solid ${service.border}`, boxShadow: `0 12px 40px ${service.color}15` }}
                  >
                    <service.icon size={28} style={{ color: service.color }} />
                  </div>
                  <span className="text-xs font-black mb-3 block uppercase tracking-[0.14em]" style={{ color: service.color }}>
                    {service.subtitle}
                  </span>
                  <h2
                    className="font-[family-name:var(--font-outfit)] font-black mb-5"
                    style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--ink-900)", lineHeight: 1.1 }}
                  >
                    {service.title}
                  </h2>
                  <p className="leading-relaxed mb-8" style={{ color: "var(--ink-500)" }}>{service.description}</p>

                  {/* Features list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {service.features.map((f) => (
                      <div key={f} className="flex items-center gap-3 text-sm font-medium" style={{ color: "var(--ink-700)" }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${service.color}18` }}>
                          <CheckCircle2 size={13} style={{ color: service.color }} />
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>

                  <Link href="/contact" className="btn-prism" style={{ background: `linear-gradient(130deg, ${service.color}, ${service.color}dd)` }}>
                    Start Your Project <ArrowRight size={18} />
                  </Link>
                </FadeIn>

                {/* Cards */}
                <FadeIn direction={idx % 2 === 0 ? "right" : "left"} delay={0.2}>
                  <div className="space-y-4">
                    {/* Sub-service cards */}
                    {service.subServices.map((sub, i) => (
                      <motion.div
                        key={sub.label}
                        className="crystal crystal-hover p-6 flex items-center gap-5"
                        style={{ background: "rgba(255,255,255,0.25)" }}
                        whileHover={{ x: 8, transition: { duration: 0.25 } }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${service.id === 'web' ? 'rgba(91,79,207,0.1)' : service.id === 'app' ? 'rgba(59,130,246,0.1)' : 'rgba(232,121,160,0.1)'}`, border: `1px solid ${service.id === 'web' ? 'rgba(91,79,207,0.2)' : service.id === 'app' ? 'rgba(59,130,246,0.2)' : 'rgba(232,121,160,0.2)'}` }}
                        >
                          <sub.icon size={22} style={{ color: service.color }} />
                        </div>
                        <div>
                          <div className="font-bold text-sm" style={{ color: "var(--ink-900)" }}>{sub.label}</div>
                          <div className="text-xs mt-1" style={{ color: "var(--ink-500)" }}>{sub.desc}</div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Key benefits */}
                    <div
                      className="crystal p-6 mt-6"
                      style={{ background: "rgba(255,255,255,0.3)", borderColor: `${service.color}30` }}
                    >
                      <div className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--ink-900)" }}>
                        <ShieldCheck size={16} style={{ color: service.color }} />
                        Operational Benefits
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {service.benefits.map((b) => (
                          <span
                            key={b}
                            className="text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider"
                            style={{
                              background: `${service.color}14`,
                              color: service.color,
                              border: `1px solid ${service.color}30`,
                            }}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <section className="section-pad prism-scene">
        <div className="wrap">
          <FadeIn>
            <div
              className="relative rounded-2xl p-12 md:p-20 text-center overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.22)",
                backdropFilter: "blur(32px) saturate(160%)",
                WebkitBackdropFilter: "blur(32px) saturate(160%)",
                border: "1.5px solid rgba(91,79,207,0.25)",
                boxShadow: "0 24px 80px rgba(91,79,207,0.1)",
              }}
            >
              {/* Razor line decoration */}
              <div className="absolute top-0 left-0 right-0 h-0.5 prism-line-h" />

              <span className="badge-prism mb-6">Ready to Start?</span>
              <h2
                className="font-[family-name:var(--font-outfit)] font-black mb-5"
                style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "var(--ink-900)", lineHeight: 1.1 }}
              >
                Ready to get started?
              </h2>
              <p className="max-w-xl mx-auto mb-10 text-lg" style={{ color: "var(--ink-500)" }}>
                Tell us about your project and we&apos;ll put together a custom plan and free quote just for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="btn-prism">
                  Request a Free Quote <ArrowRight size={18} />
                </Link>
                <a
                  href="https://wa.me/916302596477?text=Hello%20AltarVision!%20I'm%20interested%20in%20your%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-crystal"
                >
                  WhatsApp Us 💬
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
