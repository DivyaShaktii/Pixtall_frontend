import React from 'react';
import { Navbar } from './marketing/Navbar';
import { Hero } from './marketing/Hero';
import { BrandStrip } from './marketing/BrandStrip';
import { HowItWorks } from './marketing/HowItWorks';
import { Features } from './marketing/Features';
import { Gallery } from './marketing/Gallery';
import { Testimonials } from './marketing/Testimonials';
import { Pricing } from './marketing/Pricing';
import { CtaSection } from './marketing/CtaSection';
import { Footer } from './marketing/Footer';

const MarketingPage = ({ onStart }) => {
  return (
    <div className="min-h-full w-full bg-[#070707] font-sans text-white antialiased overflow-hidden selection:bg-[#a3e635]/20">
      {/* Cinematic Environment Background */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
        {/* Soft volumetric lighting */}
        <div className="absolute top-[-20%] left-1/2 w-[80vw] h-[80vw] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(163,230,53,0.06)_0%,transparent_60%)] blur-[80px]" />
        
        {/* Very subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
        />
        
        {/* Large vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <Navbar onStart={onStart} />
        <main className="w-full">
          <Hero onStart={onStart} />
          <BrandStrip />
          <HowItWorks />
          <Features />
          <Gallery />
          <Testimonials />
          <Pricing onStart={onStart} />
          <CtaSection onStart={onStart} />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MarketingPage;