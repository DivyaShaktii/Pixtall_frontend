import React from 'react'
import { TwitterLogo, InstagramLogo, LinkedinLogo, YoutubeLogo } from '@phosphor-icons/react'

const columns = [
  { title: 'Product', links: ['Features', 'Pricing', 'Enterprise', 'Community Gallery'] },
  { title: 'Resources', links: ['Blog', 'Tutorials', 'Help Center', 'API Docs'] },
  { title: 'Company', links: ['About', 'Careers', 'Contact', 'Privacy'] },
]

const socials = [
  { icon: TwitterLogo, label: 'Twitter' },
  { icon: InstagramLogo, label: 'Instagram' },
  { icon: LinkedinLogo, label: 'LinkedIn' },
  { icon: YoutubeLogo, label: 'YouTube' },
]

export function Footer() {
  return (
    <footer id="footer" className="w-full border-t border-white/5 px-5 py-14">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#a3e635] text-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 4h14M5 4v16M5 12h9"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-lg font-medium tracking-tight">PixStall AI</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-neutral-500">
            AI product photoshoots for fashion brands that move fast.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {socials.map((s) => {
              const Icon = s.icon
              return (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-neutral-400 transition-colors hover:border-[#a3e635]/40 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-neutral-500 transition-colors hover:text-neutral-300">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1400px] w-full flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-neutral-600 sm:flex-row">
        <p>© {new Date().getFullYear()} PixStall AI. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-neutral-400">Terms</a>
          <a href="#" className="hover:text-neutral-400">Privacy</a>
        </div>
      </div>
    </footer>
  )
}
