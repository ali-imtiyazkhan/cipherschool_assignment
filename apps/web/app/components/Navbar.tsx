"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`nav-wrapper${scrolled ? " scrolled" : ""}`}
      id="nav-wrapper"
    >
      <div className="nav-inner">
        {/* Logo */}
        <Link href="/" className="nav-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span>LLD Arena</span>
        </Link>

        {/* Center nav links */}
        <nav className="nav-links">
          <Link href="/">Problems</Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--color-green-500)",
                display: "inline-block",
              }}
            />
            Engine Active
          </a>
        </nav>

        {/* Right CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/" className="btn btn-ghost btn-sm">
            Catalog
          </Link>
        </div>
      </div>
    </header>
  );
}
