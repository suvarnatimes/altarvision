"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

const services = [
  "Web Development",
  "App Development",
  "Software Solutions",
  "Digital Marketing",
  "Content Creation",
];

const quickLinks = [
  { href: "/",        label: "Home"       },
  { href: "/services", label: "Services"  },
  { href: "/contact",  label: "Contact Us" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Razor gradient top border */}
      <div
        className="h-0.5 w-full"
        style={{ background: "linear-gradient(90deg, #5b4fcf, #3b82f6, #06b6d4, #e879a0, #5b4fcf)" }}
      />

      <div
        style={{
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(28px) saturate(150%)",
          WebkitBackdropFilter: "blur(28px) saturate(150%)",
          borderTop: "1px solid rgba(255,255,255,0.5)",
          paddingTop: "50px",
          paddingBottom: "40px",
        }}
      >
        <div className="wrap">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand — logo now without the white pill */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center mb-8">
                <div className="relative w-[400px] h-[110px] transition-opacity hover:opacity-85 duration-300">
                  <Image
                    src="/altarvisionlogo.png"
                    alt="AltarVision"
                    fill
                    className="object-contain object-left"
                  />
                </div>
              </Link>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--ink-500)" }}>
                Premium digital agency delivering world-class web, app &amp; software solutions
                from Machilipatnam to the globe.
              </p>
              {/* Social icons */}
              <div className="flex gap-2.5">
                {[
                  { label: "Facebook",  href: "https://www.facebook.com/altarvision", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                  { label: "Instagram", href: "https://www.instagram.com/altarvision", path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M6.5 3.5h11A3 3 0 0 1 20.5 6.5v11A3 3 0 0 1 17.5 20.5h-11A3 3 0 0 1 3.5 17.5v-11A3 3 0 0 1 6.5 3.5z" },
                  { label: "LinkedIn",  href: "https://www.linkedin.com/company/altarvision", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
                  { label: "Twitter",   href: "https://x.com/altarvision", path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
                ].map(({ label, href, path }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-250"
                    style={{
                      background: "rgba(91,79,207,0.07)",
                      border: "1px solid rgba(91,79,207,0.14)",
                      color: "var(--ink-500)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(91,79,207,0.15)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(91,79,207,0.35)";
                      (e.currentTarget as HTMLElement).style.color = "var(--prism-violet)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(91,79,207,0.07)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(91,79,207,0.14)";
                      (e.currentTarget as HTMLElement).style.color = "var(--ink-500)";
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3
                className="font-bold text-sm mb-5 pb-2"
                style={{
                  color: "var(--ink-900)",
                  borderBottom: "2px solid",
                  borderImage: "linear-gradient(90deg, #5b4fcf, transparent) 1",
                  display: "inline-block",
                }}
              >
                Services
              </h3>
              <ul className="space-y-3">
                {services.map((s) => (
                  <li key={s}>
                    <Link
                      href="/services"
                      className="text-sm flex items-center gap-2 group transition-colors duration-200"
                      style={{ color: "var(--ink-500)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--prism-violet)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink-500)"; }}
                    >
                      <span
                        className="w-1 h-1 rounded-full shrink-0 transition-all duration-300 group-hover:scale-150"
                        style={{ background: "linear-gradient(135deg, #5b4fcf, #3b82f6)" }}
                      />
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3
                className="font-bold text-sm mb-5 pb-2"
                style={{
                  color: "var(--ink-900)",
                  borderBottom: "2px solid",
                  borderImage: "linear-gradient(90deg, #3b82f6, transparent) 1",
                  display: "inline-block",
                }}
              >
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm flex items-center gap-2 group transition-colors duration-200"
                      style={{ color: "var(--ink-500)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--prism-sky)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink-500)"; }}
                    >
                      <span
                        className="w-1 h-1 rounded-full shrink-0 transition-all duration-300 group-hover:scale-150"
                        style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
                      />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3
                className="font-bold text-sm mb-5 pb-2"
                style={{
                  color: "var(--ink-900)",
                  borderBottom: "2px solid",
                  borderImage: "linear-gradient(90deg, #e879a0, transparent) 1",
                  display: "inline-block",
                }}
              >
                Contact
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm" style={{ color: "var(--ink-500)" }}>
                  <MapPin size={15} className="shrink-0 mt-0.5" style={{ color: "var(--prism-violet)" }} />
                  <span>Machilipatnam, Andhra Pradesh, India – 521001</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Phone size={15} className="shrink-0" style={{ color: "var(--prism-sky)" }} />
                  <a
                    href="tel:+916302596477"
                    className="font-semibold transition-colors"
                    style={{ color: "var(--ink-500)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--prism-sky)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink-500)"; }}
                  >
                    +91 6302596477
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Mail size={15} className="shrink-0" style={{ color: "#e879a0" }} />
                  <a
                    href="mailto:altarvision122@gmail.com"
                    className="font-semibold transition-colors"
                    style={{ color: "var(--ink-500)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e879a0"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink-500)"; }}
                  >
                    altarvision122@gmail.com
                  </a>
                </li>
              </ul>

              {/* WhatsApp quick button */}
              <a
                href="https://wa.me/916302596477?text=Hello%20AltarVision!"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center gap-2 text-sm font-semibold rounded-lg px-4 py-2.5 transition-all duration-250 hover:scale-105 w-fit"
                style={{
                  background: "linear-gradient(135deg, #25d366, #128c7e)",
                  color: "white",
                  boxShadow: "0 4px 18px rgba(37,211,102,0.3)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="mt-12 pt-7 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderTop: "1px solid rgba(91,79,207,0.1)" }}
          >
            <p className="text-sm" style={{ color: "var(--ink-300)" }}>
              © {new Date().getFullYear()} AltarVision. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm" style={{ color: "var(--ink-300)" }}>
              <Link href="/contact" className="hover:text-[--prism-violet] transition-colors" style={{ color: "var(--ink-300)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--prism-violet)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink-300)"; }}>
                Privacy Policy
              </Link>
              <Link href="/contact" className="transition-colors" style={{ color: "var(--ink-300)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--prism-violet)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink-300)"; }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
