import React from 'react';
import { ArrowLeft } from '@phosphor-icons/react';

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[#070707] px-5 py-24 text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-[-35vw] h-[70vw] w-[70vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(163,230,53,0.11),transparent_64%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <a href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-neutral-300 underline-offset-4 hover:text-[#a3e635] hover:underline">
          <ArrowLeft className="h-4 w-4" weight="bold" aria-hidden="true" />
          Back to Pixtall AI
        </a>

        <div className="mt-20 max-w-3xl sm:mt-28">
          <p className="font-mono text-sm tracking-[0.16em] text-[#a3e635]">404 / OUT OF FRAME</p>
          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
            This page didn’t make the final cut.
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-neutral-400 sm:text-xl">
            The address may have changed, or the page may no longer exist. Return home to explore Pixtall’s AI product photography studio.
          </p>
          <a
            href="/"
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#a3e635] px-6 text-sm font-bold text-black transition hover:bg-[#bef264] focus-visible:outline-[#a3e635]"
          >
            Go to homepage
          </a>
        </div>
      </div>
    </main>
  );
}
