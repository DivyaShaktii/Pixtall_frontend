import React, { useState, useEffect } from 'react';
import { CaretDown, List, X } from '@phosphor-icons/react';

const navLinks = [
  { label: 'Features' },
  { label: 'Pricing' },
  { label: 'Enterprise' },
  { label: 'Gallery' },
  { label: 'Resources', hasDropdown: true },
];

export function Navbar({ onStart }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-[#070707]/60 backdrop-blur-xl border-b border-white/5 py-2' : 'bg-transparent border-b border-transparent py-4'
      }`}
    >
      <nav
        className="mx-auto flex max-w-[1600px] items-center justify-between px-5 sm:px-8"
        aria-label="Primary"
      >
        {/* Left - Logo */}
        <a href="#" className="flex items-center gap-3 text-white" aria-label="PixStall AI home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3v18m-9-9h18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">PixStall AI</span>
        </a>

        {/* Center - Links */}
        <ul className="hidden items-center gap-8 lg:flex absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={`#${link.label.toLowerCase()}`}
                className="flex items-center gap-1 text-sm text-neutral-300 transition-colors hover:text-white"
              >
                {link.label}
                {link.hasDropdown && (
                  <CaretDown className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* Right - CTA */}
        <div className="hidden items-center gap-6 lg:flex">
          <button
            onClick={onStart}
            className="text-sm font-medium text-neutral-300 transition-colors hover:text-white"
          >
            Log In
          </button>
          <button
            onClick={onStart}
            className="rounded-lg bg-[#a3e635] px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#b6ef5c] shadow-[0_0_15px_rgba(163,230,53,0.2)] hover:shadow-[0_0_25px_rgba(163,230,53,0.4)]"
          >
            Start Creating
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#070707]/95 px-5 py-4 backdrop-blur-xl lg:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={`#${link.label.toLowerCase()}`}
                  className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                  {link.hasDropdown && <CaretDown className="h-4 w-4 text-neutral-500" />}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
            <button
              onClick={onStart}
              className="block w-full rounded-lg bg-white/5 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={onStart}
              className="block w-full rounded-lg bg-[#a3e635] px-5 py-2.5 text-center text-sm font-semibold text-black shadow-[0_0_15px_rgba(163,230,53,0.2)]"
            >
              Start Creating
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
