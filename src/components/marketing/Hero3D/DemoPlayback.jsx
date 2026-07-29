import React from 'react';
import { StudioCanvasGrid } from '../../studio/StudioCanvasGrid';
import { StudioSidebar } from '../../studio/StudioSidebar';
import { Image, SquaresFour, Users, Gear, CreditCard } from '@phosphor-icons/react';

const generatedImages = [
  "/hero-demo/hero-demo-result-1.png",
  "/hero-demo/hero-demo-result-2.png",
  "/hero-demo/hero-demo-result-3.png",
  "/hero-demo/hero-demo-result-4.png"
];

export function DemoPlayback({ demoState, cursor }) {
  const step = demoState?.step || 'upload_start';
  const isGenerating = step === 'generate';
  const hasResult = step === 'result';
  const showSource = !['upload_start'].includes(step);

  let demoStateMapped = step;
  if (step.startsWith('configure_settings_')) demoStateMapped = 'configure_settings';
  if (step === 'upload_start') demoStateMapped = 'upload';
  if (step === 'upload_done') demoStateMapped = 'upload';

  const currentGenerated = hasResult ? generatedImages : [null, null, null, null];
  const sourceImage = showSource ? "/hero-demo/hero-demo-source.jpg" : null;

  return (
    <div className="flex w-[1600px] h-[900px] overflow-hidden bg-[#09090b] text-white font-sans select-none relative">
      
      {/* ── Left Icon Rail (Floating Island) ── */}
      <aside className="w-[80px] shrink-0 bg-[#09090b] border-r border-white/5 flex flex-col items-center py-6 h-full z-20 relative">
        <div className="mb-10">
          <div className="w-8 h-8 rounded-lg bg-[#84cc16] text-black flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(132,204,22,0.3)]">
            P
          </div>
        </div>

        <nav className="flex flex-col gap-6">
          {[
            { icon: <SquaresFour size={24} weight="fill" />, active: true },
            { icon: <Image size={24} />, active: false },
            { icon: <Users size={24} />, active: false },
            { icon: <CreditCard size={24} />, active: false },
          ].map((item, i) => (
            <div
              key={i}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                item.active 
                  ? 'text-white bg-white/10 shadow-sm border border-white/10' 
                  : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.active && (
                <div className="absolute left-0 w-1 h-8 bg-[#84cc16] rounded-r-full shadow-[0_0_12px_#84cc16]" />
              )}
              {item.icon}
            </div>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl text-neutral-500 hover:text-white transition-colors cursor-pointer">
            <Gear size={24} />
          </div>
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

          <div className="flex-1 min-h-0 bg-[#09090b] rounded-2xl p-16 lg:p-24 flex flex-col">
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
        
        {/* Click Ripple */}
        {cursor?.click && (
          <div 
            className="absolute rounded-full border-2 border-[#84cc16] bg-[#84cc16]/40 animate-ping"
            style={{ width: '36px', height: '36px', left: '-4px', top: '-4px' }}
          />
        )}
      </div>
    </div>
  );
}
