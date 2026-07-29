import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, CircleNotch, DownloadSimple } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import BeforeAfterSlider from '../BeforeAfterSlider';
import { downloadImage } from '../../utils/downloadImage';

export function StudioCanvasGrid({
  numImages = 4,
  generatedImages = [],
  size = "1:1",
  hoveredSize = null,
  productImageUrl = null,
  isGenerating = false,
  isDemo = false
}) {
  return (
    <div className={`w-full mx-auto flex-1 min-h-0 grid gap-4 transition-all duration-500 ease-out ${
      numImages === 1 ? "grid-cols-1 grid-rows-1" : 
      numImages === 2 ? "grid-cols-2 grid-rows-1" : 
      "grid-cols-2 grid-rows-2"
    }`}>
      {Array.from({ length: numImages }).map((_, i) => {
        const imageSrc = generatedImages[i];
        
        // Use hovered size for live preview, fall back to selected size
        const activeSize = hoveredSize || size || "1:1";
        const [w, h] = activeSize.split(':').map(Number);

        return (
          <motion.div 
            key={`slot-wrapper-${i}`} 
            className="w-full h-full flex items-center justify-center min-h-0 min-w-0 p-2"
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div 
              className="relative flex items-center justify-center max-w-full max-h-full"
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ aspectRatio: `${w} / ${h}` }}
            >
              {/* Invisible SVG to force perfect aspect ratio scaling */}
              <svg 
                viewBox={`0 0 ${w} ${h}`} 
                width={w * 1000} 
                height={h * 1000} 
                className="max-w-full max-h-full w-auto h-auto opacity-0 pointer-events-none transition-all duration-500 ease-out" 
              />
              
              {/* Actual Content */}
              <div className="absolute inset-0 w-full h-full">
                <AnimatePresence mode="wait">
                  {imageSrc ? (
                    <motion.div 
                      key={`slot-filled-${i}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full rounded-2xl overflow-hidden border border-line shadow-lg relative group"
                    >
                      {isDemo ? (
                        <img src={imageSrc} className="w-full h-full object-cover" alt={`Result ${i + 1}`} />
                      ) : (
                        <BeforeAfterSlider 
                          beforeSrc={productImageUrl || "https://picsum.photos/seed/placeholder/800/800"} 
                          afterSrc={imageSrc} 
                          beforeLabel="Source" 
                          afterLabel={`Result ${i + 1}`} 
                        />
                      )}
                      {!isDemo && (
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button 
                            variant="primary" 
                            className="shadow-lg gap-2 font-medium text-xs h-8 bg-ink text-paper hover:bg-cloud-2" 
                            onClick={() => downloadImage(imageSrc, `pixtall-${i + 1}.png`)}
                          >
                            <DownloadSimple size={14} weight="bold" /> Save
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key={`slot-empty-${i}-${productImageUrl ? 'preview' : 'empty'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full rounded-3xl border border-white/[0.03] bg-white/[0.01] shadow-[inset_0_0_40px_rgba(255,255,255,0.01)] backdrop-blur-md flex flex-col items-center justify-center text-neutral-500 gap-4 overflow-hidden relative"
                    >
                      {isGenerating ? (
                        <div className="flex flex-col items-center gap-4">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="text-[#84cc16]">
                            <CircleNotch size={32} weight="bold" />
                          </motion.div>
                          <span className="font-medium text-sm text-white/80">Rendering...</span>
                        </div>
                      ) : productImageUrl ? (
                        <>
                          <img 
                            src={productImageUrl} 
                            alt="Product preview" 
                            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md scale-110" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                              <img src={productImageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium text-sm text-white/70">Ready to Generate</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Image size={32} weight="light" className="opacity-30" />
                          <span className="font-medium text-sm opacity-50">Slot {["One", "Two", "Three", "Four"][i]}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
