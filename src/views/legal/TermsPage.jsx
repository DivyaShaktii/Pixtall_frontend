import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/marketing/Navbar';
import { Footer } from '../../components/marketing/Footer';
import { 
  ShieldCheck, 
  FileText, 
  Sparkle, 
  Image as ImageIcon, 
  Lock, 
  Database, 
  CreditCard, 
  Scales, 
  WarningCircle, 
  Gear, 
  Envelope 
} from '@phosphor-icons/react';

const sections = [
  { id: 'introduction', label: 'Introduction', icon: Sparkle },
  { id: 'eligibility', label: 'Eligibility', icon: ShieldCheck },
  { id: 'accounts', label: 'Accounts', icon: Lock },
  { id: 'acceptable-use', label: 'Acceptable Use', icon: Scales },
  { id: 'ai-generated', label: 'AI Generated Content', icon: Sparkle },
  { id: 'user-uploads', label: 'User Uploads', icon: ImageIcon },
  { id: 'ip', label: 'Intellectual Property', icon: FileText },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'third-party', label: 'Third Party Services', icon: Database },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'disclaimers', label: 'Disclaimers', icon: WarningCircle },
  { id: 'liability', label: 'Limitation of Liability', icon: Scales },
  { id: 'termination', label: 'Termination', icon: ShieldCheck },
  { id: 'changes', label: 'Changes', icon: Gear },
  { id: 'contact', label: 'Contact', icon: Envelope },
];

const GlassCard = ({ children, id }) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="bg-white/[0.03] border border-white/[0.08] rounded-[24px] p-9 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] scroll-mt-24"
  >
    {children}
  </motion.div>
);

const SectionHeading = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-6">
    {Icon && (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.1] text-[#a3e635]">
        <Icon size={20} weight="fill" />
      </div>
    )}
    <h2 className="text-2xl font-semibold tracking-tight text-white">{children}</h2>
  </div>
);

const Paragraph = ({ children }) => (
  <p className="text-[#a1a1aa] leading-[1.8] mb-4 last:mb-0">
    {children}
  </p>
);

const List = ({ items }) => (
  <ul className="space-y-3 my-4">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3 text-[#a1a1aa] leading-[1.8]">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#a3e635]/10 text-[#a3e635] mt-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#a3e635]" />
        </span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Divider = () => (
  <div className="w-full flex items-center justify-center py-8">
    <div className="h-px w-full max-w-[200px] bg-gradient-to-r from-transparent via-[#a3e635]/20 to-transparent" />
  </div>
);

const FloatingGlassDocument = () => {
  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto flex items-center justify-center pointer-events-none mt-12 mb-8 perspective-[1000px]">
      {/* Back glowing card */}
      <motion.div 
        animate={{ 
          y: [0, -10, 0], 
          rotateX: [15, 20, 15],
          rotateZ: [-5, -8, -5]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[70%] h-[80%] bg-[#a3e635]/5 border border-[#a3e635]/20 rounded-2xl backdrop-blur-md -z-10 shadow-[0_0_50px_rgba(163,230,53,0.1)]"
      />
      
      {/* Middle glass card */}
      <motion.div 
        animate={{ 
          y: [0, -15, 0], 
          rotateX: [10, 15, 10],
          rotateZ: [2, 5, 2]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute w-[75%] h-[85%] bg-white/[0.03] border border-white/[0.1] rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col p-6 gap-3"
      >
        <div className="w-1/3 h-2 bg-white/10 rounded-full" />
        <div className="w-full h-2 bg-white/10 rounded-full" />
        <div className="w-5/6 h-2 bg-white/10 rounded-full" />
        <div className="w-full h-2 bg-white/10 rounded-full mt-4" />
        <div className="w-4/5 h-2 bg-white/10 rounded-full" />
      </motion.div>

      {/* Front primary card */}
      <motion.div 
        animate={{ 
          y: [0, -8, 0],
          rotateX: [5, 8, 5],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute w-[80%] h-[90%] bg-white/[0.05] border border-white/[0.2] rounded-2xl backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#a3e635] flex items-center justify-center text-black">
            <Scales size={16} weight="bold" />
          </div>
          <div className="w-16 h-3 bg-white/20 rounded-full" />
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full mb-3" />
        <div className="w-11/12 h-2 bg-white/20 rounded-full mb-3" />
        <div className="w-full h-2 bg-white/20 rounded-full mb-3" />
        <div className="w-4/5 h-2 bg-white/20 rounded-full mb-8" />
        
        <div className="w-1/2 h-2 bg-[#a3e635]/40 rounded-full mb-3 mt-auto" />
        <div className="w-1/3 h-2 bg-[#a3e635]/40 rounded-full" />
      </motion.div>
    </div>
  );
};

const TermsPage = ({ onStart }) => {
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200; // offset for navbar
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-full w-full bg-[#070707] font-sans text-white antialiased overflow-x-hidden selection:bg-[#a3e635]/20">
      {/* Cinematic Environment Background */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 w-[80vw] h-[80vw] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(163,230,53,0.06)_0%,transparent_60%)] blur-[80px]" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
        />
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <Navbar onStart={onStart} />
        
        <main className="w-full pt-32 pb-24 px-5">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16 relative">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white backdrop-blur-md mb-6"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-[#a3e635]" />
              Legal
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent"
            >
              Terms of Service
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-6"
            >
              These Terms govern your use of PixStall AI, our AI-powered platform for virtual try-on, AI-generated fashion imagery, product visualization, and ecommerce-ready marketing assets.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-medium text-[#a3e635]"
            >
              Last Updated: July 2026
            </motion.div>

            <FloatingGlassDocument />
          </div>

          {/* Layout: Sidebar + Content */}
          <div className="w-full max-w-full px-2 md:px-8 lg:px-16 mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
            
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-[280px] shrink-0 sticky top-32 flex-col gap-2">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-3">Sections</h3>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    const el = document.getElementById(section.id);
                    if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                    activeSection === section.id 
                      ? 'bg-white/10 text-white shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  <section.icon size={18} weight={activeSection === section.id ? "fill" : "regular"} />
                  {section.label}
                </button>
              ))}
            </aside>

            {/* Mobile Sidebar (Horizontal Scroll) */}
            <aside className="lg:hidden w-full overflow-x-auto pb-4 sticky top-20 z-30 bg-[#070707]/80 backdrop-blur-xl border-b border-white/5 -mx-5 px-5">
              <div className="flex gap-2 w-max py-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      const el = document.getElementById(section.id);
                      if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
                    }}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-colors border ${
                      activeSection === section.id 
                        ? 'bg-[#a3e635]/10 border-[#a3e635]/30 text-[#a3e635]' 
                        : 'bg-white/5 border-white/5 text-neutral-400'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 w-full flex flex-col gap-10">
              
              <GlassCard id="introduction">
                <SectionHeading icon={Sparkle}>Introduction</SectionHeading>
                <Paragraph>
                  Welcome to PixStall AI. These Terms of Service ("Terms") constitute a legally binding agreement between you and PixStall AI regarding your use of our platform. By accessing or using our services, you agree to be bound by these Terms.
                </Paragraph>
                <Paragraph>
                  PixStall AI provides a suite of advanced generative tools, including but not limited to:
                </Paragraph>
                <List items={[
                  "AI Virtual Try-On",
                  "AI Fashion Generation",
                  "AI Product Photography",
                  "AI Product Visualization",
                  "AI Image Editing",
                  "Catalog Generation",
                  "Marketing Asset Creation"
                ]} />
              </GlassCard>

              <Divider />

              <GlassCard id="eligibility">
                <SectionHeading icon={ShieldCheck}>Eligibility</SectionHeading>
                <Paragraph>
                  To use PixStall AI, you must meet one of the following criteria:
                </Paragraph>
                <List items={[
                  "Be at least 18 years of age and capable of forming a binding contract.",
                  "Represent a legally registered business and have the authority to bind that business to these Terms."
                ]} />
                <Paragraph>
                  If you are using the platform on behalf of an organization, "you" refers to the organization.
                </Paragraph>
              </GlassCard>

              <Divider />

              <GlassCard id="accounts">
                <SectionHeading icon={Lock}>Account Responsibilities</SectionHeading>
                <Paragraph>
                  When creating an account, you must provide accurate and complete information. You are solely responsible for:
                </Paragraph>
                <List items={[
                  "Maintaining the confidentiality of your account credentials and password.",
                  "All activity that occurs under your account.",
                  "Ensuring uploaded assets comply with our acceptable use policies.",
                  "Preventing unauthorized access to your account."
                ]} />
                <Paragraph>
                  You must notify us immediately if you suspect any security breaches or unauthorized use of your account.
                </Paragraph>
              </GlassCard>

              <Divider />

              <GlassCard id="acceptable-use">
                <SectionHeading icon={Scales}>Acceptable Use</SectionHeading>
                <Paragraph>
                  Our platform empowers creativity, but we enforce strict guidelines to ensure a safe environment. You agree that you will **NOT**:
                </Paragraph>
                <List items={[
                  "Upload illegal, defamatory, or harmful content.",
                  "Upload copyrighted material, trademarks, or IP for which you do not hold the rights or a valid license.",
                  "Upload or generate adult, explicit, or excessively violent material.",
                  "Generate misleading advertisements or deepfakes intended to deceive.",
                  "Upload malware, viruses, or disruptive code.",
                  "Reverse engineer, decompile, or extract the source code or AI models.",
                  "Abuse our APIs, bypass rate limits, or engage in unauthorized scraping.",
                  "Use the platform for spam or to impersonate individuals or entities.",
                  "Violate any applicable local, state, national, or international laws."
                ]} />
              </GlassCard>

              <Divider />

              <GlassCard id="ai-generated">
                <SectionHeading icon={Sparkle}>AI Generated Content</SectionHeading>
                <Paragraph>
                  Our platform utilizes advanced generative artificial intelligence to create visuals. Due to the probabilistic nature of AI models, please be aware of the following:
                </Paragraph>
                <List items={[
                  "AI outputs may vary and are never guaranteed to be 100% physically accurate.",
                  "You must review all AI-generated content before utilizing it for commercial or marketing purposes.",
                  "You remain solely responsible for the legal compliance of the generated assets you choose to publish.",
                  "PixStall AI cannot guarantee identical outputs for repeated prompts or identical inputs.",
                  "Generated images may inadvertently resemble existing visual styles, real-world locations, or entities due to the training data behavior of the underlying AI models."
                ]} />
              </GlassCard>

              <Divider />

              <GlassCard id="user-uploads">
                <SectionHeading icon={ImageIcon}>User Uploads & Content</SectionHeading>
                <Paragraph>
                  **You retain full ownership** of any original images, product photos, or assets you upload to PixStall AI.
                </Paragraph>
                <Paragraph>
                  By uploading content, you grant PixStall AI a limited, worldwide, non-exclusive, royalty-free license solely for the purpose of operating the platform and processing your specific requests (e.g., generating a virtual try-on output).
                </Paragraph>
                <List items={[
                  "Your uploaded assets are NEVER sold to third parties.",
                  "Your uploaded assets are NOT used by PixStall AI for external advertising without explicit consent.",
                  "We implement strict data isolation to ensure your private product catalogs remain confidential."
                ]} />
              </GlassCard>

              <Divider />

              <GlassCard id="ip">
                <SectionHeading icon={FileText}>Intellectual Property</SectionHeading>
                <Paragraph>
                  PixStall AI retains all rights, title, and interest in the platform itself. This includes, but is not limited to:
                </Paragraph>
                <List items={[
                  "The underlying source code and infrastructure.",
                  "Our proprietary algorithms and fine-tuned AI models.",
                  "The user interface, design system, and visual branding.",
                  "Documentation, logos, and trademarks."
                ]} />
                <Paragraph>
                  You may not copy, redistribute, modify, or create derivative works of the platform's software or interface.
                </Paragraph>
              </GlassCard>

              <Divider />

              <GlassCard id="subscriptions">
                <SectionHeading icon={CreditCard}>Subscriptions</SectionHeading>
                <Paragraph>
                  PixStall AI offers both free and paid subscription plans to suit different operational scales.
                </Paragraph>
                <List items={[
                  "Free plans and trial plans are subject to strict usage limits and are intended for evaluation purposes.",
                  "Paid plans are billed on recurring cycles (monthly or annually) as selected during checkout.",
                  "You may upgrade or downgrade your plan at any time; changes take effect at the start of the next billing cycle.",
                  "Usage limits (such as generation credits or API calls) reset according to your billing cycle.",
                  "We enforce a fair usage policy to prevent platform abuse and ensure stability for all users."
                ]} />
              </GlassCard>

              <Divider />

              <GlassCard id="payments">
                <SectionHeading icon={CreditCard}>Payments</SectionHeading>
                <Paragraph>
                  All payments are processed securely through certified third-party payment providers (e.g., Stripe). 
                </Paragraph>
                <List items={[
                  "You are responsible for all applicable taxes associated with your purchase.",
                  "Subscription renewals are processed automatically unless canceled prior to the renewal date.",
                  "In the event of a failed payment, your account may be temporarily downgraded to a free tier until payment is resolved.",
                  "Refunds are evaluated on a case-by-case basis in accordance with our Refund Policy, typically granted only in cases of severe service outages."
                ]} />
              </GlassCard>

              <Divider />

              <GlassCard id="third-party">
                <SectionHeading icon={Database}>Third-Party Services</SectionHeading>
                <Paragraph>
                  To provide a seamless experience, PixStall AI integrates with industry-leading third-party services. These may include:
                </Paragraph>
                <List items={[
                  "AI Providers (OpenAI, Anthropic, Google AI)",
                  "Infrastructure (AWS, Cloudflare)",
                  "Payment Processors (Stripe)",
                  "Authentication and Secure Storage Providers"
                ]} />
                <Paragraph>
                  While using PixStall AI, your data may be processed by these sub-processors. You must also comply with any applicable third-party terms of service that govern the specific integrations you utilize.
                </Paragraph>
              </GlassCard>

              <Divider />

              <GlassCard id="privacy">
                <SectionHeading icon={Lock}>Privacy</SectionHeading>
                <Paragraph>
                  Your privacy is critically important to us. The collection, use, and handling of your personal data and uploaded assets are detailed comprehensively in our Privacy Policy.
                </Paragraph>
                <Paragraph>
                  By agreeing to these Terms, you also acknowledge that you have read and understood our Privacy Policy.
                </Paragraph>
              </GlassCard>

              <Divider />

              <GlassCard id="disclaimers">
                <SectionHeading icon={WarningCircle}>Disclaimers</SectionHeading>
                <Paragraph>
                  The PixStall AI service is provided on an **"AS IS"** and **"AS AVAILABLE"** basis. 
                </Paragraph>
                <List items={[
                  "We make no guarantee of uninterrupted availability or zero latency.",
                  "We do not warrant that the platform will be entirely error-free.",
                  "We make no guarantee that AI outputs will always perfectly meet your expectations or artistic intent."
                ]} />
              </GlassCard>

              <Divider />

              <GlassCard id="liability">
                <SectionHeading icon={Scales}>Limitation of Liability</SectionHeading>
                <Paragraph>
                  To the maximum extent permitted by applicable law, PixStall AI and its affiliates, directors, or employees shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
                </Paragraph>
                <Paragraph>
                  This includes loss of profits, data, goodwill, or other intangible losses resulting from your use of, or inability to use, the service. In no event shall our total liability exceed the amount you paid us over the past twelve (12) months.
                </Paragraph>
              </GlassCard>

              <Divider />

              <GlassCard id="termination">
                <SectionHeading icon={ShieldCheck}>Termination</SectionHeading>
                <Paragraph>
                  We reserve the right to suspend, restrict, or permanently terminate your account and access to the platform without prior notice if you violate these Terms, specifically the Acceptable Use policy.
                </Paragraph>
                <Paragraph>
                  Upon termination, your right to use the service will immediately cease, and all outstanding subscription fees remain payable.
                </Paragraph>
              </GlassCard>

              <Divider />

              <GlassCard id="changes">
                <SectionHeading icon={Gear}>Changes to Terms</SectionHeading>
                <Paragraph>
                  PixStall AI may modify or update these Terms of Service at any time. We will notify you of any material changes via email or an explicit notification within the platform where legally required.
                </Paragraph>
                <Paragraph>
                  Your continued use of the platform after changes have been published constitutes your acceptance of the updated Terms.
                </Paragraph>
              </GlassCard>

              <Divider />

              <div id="contact" className="bg-[#a3e635]/10 border border-[#a3e635]/20 rounded-[24px] p-9 text-center backdrop-blur-md">
                <div className="flex justify-center mb-4 text-[#a3e635]">
                  <Envelope size={32} weight="fill" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white mb-3">Contact Us</h2>
                <Paragraph>
                  Have questions about these terms? Our legal and support teams are here to help.
                </Paragraph>
                <a href="mailto:support@pixstall.ai" className="inline-block mt-4 text-[#a3e635] font-medium hover:text-white transition-colors text-lg">
                  support@pixstall.ai
                </a>
              </div>
              
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default TermsPage;
