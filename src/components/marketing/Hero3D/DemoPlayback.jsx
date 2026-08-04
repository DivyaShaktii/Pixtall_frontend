import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudioCanvasGrid } from '../../studio/StudioCanvasGrid';
import { StudioSidebar } from '../../studio/StudioSidebar';
import { Image, SquaresFour, Users, Gear, CreditCard } from '@phosphor-icons/react';
import ModelReferenceModal from '../../ModelSelector';
import { generationConfig } from '../../../config/generationConfig';

const generatedImages = [
  "/hero-demo/hero-demo-result-1.png",
  "/hero-demo/hero-demo-result-2.png",
  "/hero-demo/hero-demo-result-3.png",
  "/hero-demo/hero-demo-result-4.png"
];

export function DemoPlayback({ demoState, cursor, ripples }) {
  const step = demoState?.step || 'upload_start';
  const isGenerating = step === 'generate';
  const hasResult = step === 'result';
  const showSource = !['upload_start'].includes(step);
  const isModelModalOpen = step === 'show_model_modal';
  const maleModelConfig = generationConfig.models.find(m => m.value === 'male');

  let demoStateMapped = step;
  if (step.startsWith('configure_settings_')) demoStateMapped = 'configure_settings';
  if (step === 'upload_start') demoStateMapped = 'upload';
  if (step === 'upload_done') demoStateMapped = 'upload';

  const currentGenerated = hasResult ? generatedImages : [null, null, null, null];
  const sourceImage = showSource ? "/hero-demo/hero-demo-source.jpg" : null;

  return (
    <div className="flex w-[1600px] h-[900px] overflow-hidden bg-[#09090b] text-white font-sans select-none relative">
      
      {/* ── Left Sidebar (Nav) ── */}
      <aside className="w-[260px] shrink-0 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-6 h-full z-20 relative font-sans">
        
        {/* Workspace */}
        <div className="flex items-center gap-3 mb-10 px-1 mt-2">
          <div className="w-9 h-9 bg-[#84cc16]/20 rounded-lg text-[#84cc16] flex items-center justify-center text-sm font-bold">P</div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-white tracking-wide">Personal Wor...</span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-0.5">Pro Plan</span>
          </div>
          <div className="ml-auto text-neutral-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 9 12 5 16 9"/><polyline points="16 15 12 19 8 15"/></svg>
          </div>
        </div>

        <div className="text-xs text-neutral-500 uppercase tracking-widest mb-4 px-2 font-semibold">Main</div>
        
        <nav className="flex flex-col gap-2">
          <div className="flex items-center gap-4 bg-white/5 text-white px-3 py-3 rounded-xl cursor-pointer relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#84cc16]" />
            <div className="w-5 h-5 rounded-full bg-[#84cc16]/20 flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#84cc16]" />
            </div>
            <span className="text-[15px] font-medium">Studio</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 hover:text-white hover:bg-white/5 px-3 py-3 rounded-xl transition-colors cursor-pointer">
            <SquaresFour size={20} className="shrink-0" />
            <span className="text-[15px] font-medium">My Products</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 hover:text-white hover:bg-white/5 px-3 py-3 rounded-xl transition-colors cursor-pointer">
            <Image size={20} className="shrink-0" />
            <span className="text-[15px] font-medium">Gallery</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 hover:text-white hover:bg-white/5 px-3 py-3 rounded-xl transition-colors cursor-pointer">
            <CreditCard size={20} className="shrink-0" />
            <span className="text-[15px] font-medium">Billing</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 hover:text-white hover:bg-white/5 px-3 py-3 rounded-xl transition-colors cursor-pointer">
            <Gear size={20} className="shrink-0" />
            <span className="text-[15px] font-medium">Settings</span>
          </div>
        </nav>

        <div className="mt-auto px-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Credits</span>
            <span className="text-sm font-bold text-white">6 left</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#84cc16] w-[40%] rounded-full" />
          </div>

          <button className="w-full py-3.5 bg-[#84cc16] hover:bg-[#94dc26] text-black text-sm font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(132,204,22,0.2)]">
            Upgrade Plan
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Center Canvas Grid - The Hero */}
        <div className="flex-1 flex flex-col min-w-0 p-8 pt-12 z-10 relative">
          <div className="mb-8 flex items-center gap-3">
            <h2 className="text-white font-serif italic text-3xl tracking-tight">Marketplace Studio</h2>
            <div className="h-px bg-white/10 flex-1 ml-4" />
          </div>

          <div className="flex-1 min-h-0 bg-[#09090b] rounded-2xl p-4 lg:p-8 flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center max-w-[900px]">
              <div className="h-full w-full aspect-[4/5] max-w-full flex flex-col">
                <StudioCanvasGrid
                  numImages={4}
                  generatedImages={currentGenerated}
                  size={demoState?.size || "4:5"}
                  productImageUrl={sourceImage}
                  isGenerating={isGenerating}
                  isDemo={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Configuration Sidebar - Inspector Panel */}
        <div className="w-[320px] shrink-0 h-full overflow-hidden flex flex-col relative z-20 border-l border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
          <StudioSidebar
            activeTool="product-to-model"
            model={demoState?.model || 'male'}
            productCategory={demoState?.category || ''}
            productSubcategory={demoState?.category ? 'bag' : ''}
            scene={demoState?.scene || ''}
            size={demoState?.size || ''}
            numImages={4}
            isGenerating={isGenerating}
            isDemo={true}
            demoState={demoStateMapped}
            productImageFile={showSource ? new File([], "demo.jpg") : null}
          />
        </div>
      </div>

      {/* ── Synthetic Pointer Cursor Overlay ── */}
      <div
        className="absolute z-50 pointer-events-none transition-all duration-500 ease-out"
        style={{
          left: cursor?.x || '50%',
          top: cursor?.y || '110%',
          opacity: cursor?.opacity ?? 0,
          transform: `scale(${cursor?.click ? 0.75 : 1})`,
          marginLeft: '-4px',
          marginTop: '-4px',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] origin-top-left">
          <path d="M5.5 2.5L20 12L12 14L9 22L5.5 2.5Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        
        <AnimatePresence>
          {ripples?.map(id => (
            <motion.div
              key={id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute rounded-full border-2 border-[#84cc16] bg-[#84cc16]/30 pointer-events-none"
              style={{ width: '40px', height: '40px', left: '-6px', top: '-6px' }}
            />
          ))}
        </AnimatePresence>
      </div>

      <ModelReferenceModal
        isOpen={isModelModalOpen}
        onClose={() => {}}
        modelConfig={maleModelConfig}
        selectedModelImage={maleModelConfig?.images[0]}
        onModelImageChange={() => {}}
        usePortal={false}
      />
    </div>
  );
}
