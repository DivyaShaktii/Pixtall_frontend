import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { CircleNotch, DownloadSimple, Sparkle, TShirt, User } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import ProductImageUpload from '../ProductImageUpload';
import SegmentedControl from '../ui/SegmentedControl';
import HoverSelect from '../ui/HoverSelect';
import { generationConfig } from '../../config/generationConfig';

export function StudioSidebar({
  activeTool = "product-to-model",
  setActiveTool,
  
  productImageFile,
  setProductImageFile,
  
  model = "none",
  handleModelTypeChange,
  modelImagePath,
  setIsModelModalOpen,
  
  productCategory,
  handleCategoryChange,
  productSubcategory,
  setProductSubcategory,
  
  scene,
  setScene,
  size,
  setSize,
  setHoveredSize,
  
  numImages = 4,
  setNumImages,
  
  imageQuality = "standard",
  setImageQuality,
  
  isGenerating = false,
  generationStatus = "Rendering…",
  handleCancel,
  handleGenerate,
  handleDownloadPayload,
  
  isDemo = false,
  demoState = "upload" // 'upload' | 'configure' | 'generate'
}) {
  const [premiumHintSequence, setPremiumHintSequence] = useState(0);
  const selectedCategorySubcategories = useMemo(
    () => generationConfig.productCategories.find(c => c.value === productCategory)?.subcategories ?? [],
    [productCategory]
  );

  useEffect(() => {
    if (!premiumHintSequence) return undefined;
    const timer = window.setTimeout(() => setPremiumHintSequence(0), 4000);
    return () => window.clearTimeout(timer);
  }, [premiumHintSequence]);

  const selectCategory = categoryValue => {
    handleCategoryChange?.(categoryValue);
    if (!isDemo && categoryValue) {
      setPremiumHintSequence(sequence => sequence + 1);
    }
  };

  const selectProductImage = file => {
    setProductImageFile?.(file);
    if (!isDemo && file?.type?.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
      setPremiumHintSequence(sequence => sequence + 1);
    }
  };

  return (
    <>
    <div className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 bg-[#09090b]/80 backdrop-blur-xl flex flex-col h-auto lg:h-full relative z-10 min-h-0 font-sans">
      
      {/* Tool Switcher */}
      <div className="p-6 pb-4 shrink-0">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTool?.("product-to-model")}
            aria-pressed={activeTool === "product-to-model"}
            className={`flex items-center gap-2 flex-1 justify-center py-2 rounded-lg border font-medium text-[13px] transition-[background-color,border-color,color,box-shadow] duration-150 ${
              activeTool === "product-to-model" ? "studio-selected-control" : "border-transparent text-neutral-500 hover:text-white"
            }`}
          >
            <TShirt size={16} weight={activeTool === "product-to-model" ? "fill" : "regular"} />
            Marketplace
          </button>
          <button 
            onClick={() => setActiveTool?.("virtual-try-on")}
            aria-pressed={activeTool === "virtual-try-on"}
            className={`flex items-center gap-2 flex-1 justify-center py-2 rounded-lg border font-medium text-[13px] transition-[background-color,border-color,color,box-shadow] duration-150 ${
              activeTool === "virtual-try-on" ? "studio-selected-control" : "border-transparent text-neutral-500 hover:text-white"
            }`}
          >
            <User size={16} weight={activeTool === "virtual-try-on" ? "fill" : "regular"} />
            Personal
          </button>
        </div>
      </div>

      {/* Scrollable control content */}
      <div className="flex-1 overflow-visible lg:overflow-y-auto px-6 pb-6 flex flex-col gap-8">
        
        {/* Source Material Upload */}
        <div className="flex flex-col gap-3">
          <label className="text-white text-[11px] uppercase tracking-wider font-semibold">Source Material</label>
          <ProductImageUpload file={productImageFile} onFileChange={selectProductImage} vertical isDemo={isDemo} />
        </div>

        {/* Model Reference */}
        <div className="flex flex-col gap-3 relative">
          <label className="text-white text-[11px] uppercase tracking-wider font-semibold">Model</label>
          <SegmentedControl 
            value={model} 
            onChange={handleModelTypeChange}
            className="w-full"
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "None", value: "none" }
            ]}
          />

          {model !== "none" && (
            <button 
              onClick={() => setIsModelModalOpen?.(true)}
              className={`w-full h-12 rounded-xl border flex items-center justify-center text-neutral-400 hover:text-white transition-[background-color,border-color,color,box-shadow] duration-150 overflow-hidden group mt-1 ${
                modelImagePath ? "studio-selected-control" : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              {modelImagePath ? (
                <div className="flex items-center justify-between w-full px-3">
                  <div className="flex items-center gap-3">
                    <img src={modelImagePath} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-[13px] font-medium text-white">Change Model</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[13px] font-medium">
                  <User size={16} /> Select Reference
                </div>
              )}
            </button>
          )}
        </div>

        {/* Output Settings */}
        <div className="flex flex-col gap-5">
          <label className="text-white text-[11px] uppercase tracking-wider font-semibold">Output Settings</label>
          
          {/* Quality Switcher */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setImageQuality?.("standard")}
              aria-pressed={imageQuality === "standard"}
              className={`flex-1 justify-center py-2 rounded-lg font-medium text-[13px] transition-[background-color,border-color,color,box-shadow] duration-150 border ${
                imageQuality === "standard" 
                  ? "studio-selected-control"
                  : "border-transparent text-neutral-500 hover:text-white"
              }`}
            >
              Standard
            </button>
            <button 
              onClick={() => setImageQuality?.("premium")}
              aria-pressed={imageQuality === "premium"}
              className={`flex-1 justify-center py-2 rounded-lg font-medium text-[13px] transition-[background-color,border-color,color,box-shadow] duration-150 flex items-center gap-2 border ${
                imageQuality === "premium" 
                  ? "studio-selected-control"
                  : "border-transparent text-neutral-500 hover:text-[#84cc16]"
              }`}
            >
              <Sparkle size={14} weight={imageQuality === "premium" ? "fill" : "regular"} className={imageQuality === "premium" ? "text-[#84cc16]" : ""} />
              Premium
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Category & Details Group */}
            <div className="flex flex-col gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <HoverSelect value={productCategory} onChange={selectCategory} options={generationConfig.productCategories} placeholder="Category" />
              <div className="h-px bg-white/5 w-full" />
              <HoverSelect value={productSubcategory} onChange={setProductSubcategory} options={selectedCategorySubcategories} placeholder="Details" disabled={!productCategory} />
            </div>

            {/* Scene */}
            <div className="relative">
              <HoverSelect value={scene} onChange={setScene} options={generationConfig.scenes} placeholder="Environment Scene" />
              {isDemo && demoState === 'configure_settings' && scene && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-x-0 bottom-0 top-0 pointer-events-none ring-1 ring-[#84cc16] rounded-lg" />
              )}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-semibold text-neutral-400">Aspect ratio</p>
              <HoverSelect
                value={size}
                onChange={setSize}
                options={generationConfig.sizes}
                placeholder="Select aspect ratio"
                onOptionHover={setHoveredSize}
              />
            </div>

            <div className="flex flex-col gap-3">
              <p id="image-count-label" className="text-[11px] font-semibold text-neutral-400">Number of images</p>
              <div
                role="group"
                aria-labelledby="image-count-label"
                className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5"
              >
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumImages?.(n)}
                    aria-label={`${n} ${n === 1 ? "image" : "images"}`}
                    aria-pressed={numImages === n}
                    className={`flex-1 h-9 flex items-center justify-center rounded-lg border text-xs font-semibold transition-[background-color,border-color,color,box-shadow] duration-150 ${
                      numImages === n ? "studio-selected-control" : "border-transparent text-neutral-500 hover:text-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Generate button */}
      <div className="p-6 pt-4 border-t border-white/5 shrink-0 relative bg-[#09090b]/80 backdrop-blur-xl">
        {isGenerating ? (
          <Button 
            type="button"
            variant="outline" 
            className="w-full rounded-xl h-12 border-white/10 font-bold text-[14px] transition-all duration-300 gap-2 bg-transparent text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
            onClick={handleCancel} 
          >
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <CircleNotch size={18} weight="bold" />
            </motion.div>
            Stop Waiting · {generationStatus}
          </Button>
        ) : (
          <Button 
            type="button"
            variant="primary" 
            className={`w-full rounded-xl h-12 border-0 font-bold text-[14px] transition-all duration-300 gap-2 ${isDemo ? "pointer-events-none" : "pointer-events-auto"} ${
              isDemo && demoState === "generate" ? "bg-[#84cc16] text-black shadow-[0_0_20px_rgba(132,204,22,0.3)] ring-2 ring-[#84cc16]" : "bg-white text-black hover:bg-neutral-200"
            }`}
            onClick={handleGenerate} 
          >
            <Sparkle size={18} weight="fill" className={isDemo && demoState === "generate" ? "text-black animate-pulse" : (isDemo ? "text-[#84cc16]" : "")} />
            {isDemo && demoState === "generate" ? "Generating..." : "Generate Images"} 
          </Button>
        )}
      </div>
    </div>
    {premiumHintSequence > 0 && typeof document !== 'undefined' && createPortal(
      <motion.div
        key={premiumHintSequence}
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, x: "-50%", y: -10, scale: 0.97 }}
        animate={{ opacity: 1, x: "-50%", y: 0, scale: 1 }}
        className="fixed left-1/2 top-20 z-[70] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border border-yellow-300/40 bg-yellow-300 px-3 py-2 text-xs font-semibold text-yellow-950 shadow-lg"
      >
        <Sparkle size={15} weight="fill" aria-hidden="true" />
        <span>For watches, jewellery, and intricate products, choose Premium quality to capture finer details.</span>
      </motion.div>,
      document.body
    )}
    </>
  );
}
