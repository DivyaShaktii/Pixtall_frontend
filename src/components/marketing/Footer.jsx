import React from 'react'
import { EnterpriseButton } from './EnterpriseButton'
import { scrollToMarketingSection } from '../../lib/marketingNavigation'
import { CONTACT_PAGE_URL, SUPPORT_EMAIL, SUPPORT_MAILTO } from '../../config/contact'

const columns = [
  { title: 'Product', links: ['Features', 'Pricing', 'Enterprise', 'Community Gallery'] },
  { title: 'Legal', links: ['Terms'] },
]

export function Footer() {
  return (
    <footer id="footer" className="w-full border-t border-white/5 px-5 py-14">
      <div className="mx-auto flex w-full flex-col gap-12 md:flex-row md:justify-between">
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
            <span className="text-lg font-medium tracking-tight">Pixtall AI</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-neutral-500">
            AI product photoshoots for fashion brands that move fast.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 lg:gap-14">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    {link === 'Enterprise' ? <EnterpriseButton className="inline-flex min-h-11 items-center text-sm text-neutral-400 hover:text-white" /> : <a href={link === 'Terms' ? '/terms' : `/#${link.toLowerCase().replace('community ', '')}`} onClick={event => {
                      const section = { Features: 'features', Pricing: 'pricing', 'Community Gallery': 'gallery' }[link];
                      if (section) { event.preventDefault(); scrollToMarketingSection(section); }
                    }} className="text-sm text-neutral-500 transition-colors hover:text-neutral-300">
                      {link}
                    </a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-sm">
          <h3 className="text-sm font-medium text-white">Contact</h3>
          <div className="mt-4 space-y-5 text-sm">
            <div>
              <p className="text-neutral-500">Custom plans, upgrades, or tailored software</p>
              <a href={CONTACT_PAGE_URL} className="mt-1 inline-flex min-h-11 items-center text-neutral-300 underline decoration-neutral-700 underline-offset-4 transition-colors hover:text-[#a3e635] hover:decoration-[#a3e635]">
                Contact AI Vatika
              </a>
            </div>
            <div>
              <p className="text-neutral-500">Product issues, quality concerns, or grievances</p>
              <a href={SUPPORT_MAILTO} className="mt-1 inline-flex min-h-11 items-center text-neutral-300 underline decoration-neutral-700 underline-offset-4 transition-colors hover:text-[#a3e635] hover:decoration-[#a3e635]">
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex w-full flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-neutral-600 sm:flex-row">
        <p>© {new Date().getFullYear()} Pixtall AI. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="/terms" className="hover:text-[#a3e635] transition-colors">Terms</a>
          <a href={CONTACT_PAGE_URL} className="hover:text-[#a3e635] transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
