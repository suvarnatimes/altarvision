"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-0" : "py-1"
      }`}
    >
      <div className="wrap">
        <div
          className={`flex items-center justify-between px-5 rounded-xl h-[78px] transition-all duration-500 shadow-sm ${
            scrolled
              ? "bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_4px_32px_rgba(91,79,207,0.12)]"
              : "bg-white/40 backdrop-blur-xl border border-white/30"
          }`}
        >
          {/* Logo — massively larger now */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="relative w-[380px] h-[68px] transition-transform hover:scale-[1.02] duration-300">
              <Image
                src="/altarvisionlogo.png"
                alt="AltarVision Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-250 ${
                  pathname === link.href
                    ? "bg-[rgba(91,79,207,0.1)] text-[#5b4fcf]"
                    : "text-[#2d2b5e] hover:text-[#5b4fcf] hover:bg-[rgba(91,79,207,0.06)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <Link href="/contact" className="btn-prism text-xs py-2.5 px-5">
              Start a Project ↗
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
            style={{
              background: "rgba(91,79,207,0.07)",
              border: "1px solid rgba(91,79,207,0.15)",
            }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={19} color="#5b4fcf" /> : <Menu size={19} color="#5b4fcf" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.94 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.94 }}
            transition={{ duration: 0.22 }}
            style={{
              transformOrigin: "top",
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 16px 48px rgba(91,79,207,0.16)",
            }}
            className="md:hidden mx-4 mt-2 rounded-xl overflow-hidden"
          >
            <div className="p-5 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`py-3 px-4 rounded-lg text-sm font-semibold transition-colors ${
                      pathname === link.href
                        ? "bg-[rgba(91,79,207,0.1)] text-[#5b4fcf]"
                        : "text-[#2d2b5e] hover:bg-[rgba(91,79,207,0.07)] hover:text-[#5b4fcf]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="btn-prism text-center justify-center mt-2"
                >
                  Start a Project ↗
                </Link>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
