import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CircleNotch, Sparkle, TShirt, User } from '@phosphor-icons/react';
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
  
  error = "",
  isGenerating = false,
  handleCancel,
  handleGenerate,
  
  isDemo = false,
  demoState = "upload" // 'upload' | 'configure' | 'generate'
}) {
  const selectedCategorySubcategories = useMemo(
    () => generationConfig.productCategories.find(c => c.value === productCategory)?.subcategories ?? [],
    [productCategory]
  );

  return (
    <div className="w-full lg:w-[320px] shrink-0 border-l border-white/5 bg-[#09090b]/80 backdrop-blur-xl flex flex-col h-full relative z-10 min-h-0 font-sans">
      
      {/* Tool Switcher */}
      <div className="p-6 pb-4 shrink-0">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTool?.("product-to-model")}
            className={`flex items-center gap-2 flex-1 justify-center py-2 rounded-lg font-medium text-[13px] transition-all ${
              activeTool === "product-to-model" ? "bg-white/10 text-white shadow-sm" : "text-neutral-500 hover:text-white"
            }`}
          >
            <TShirt size={16} weight={activeTool === "product-to-model" ? "fill" : "regular"} />
            Marketplace
          </button>
          <button 
            onClick={() => setActiveTool?.("virtual-try-on")}
            className={`flex items-center gap-2 flex-1 justify-center py-2 rounded-lg font-medium text-[13px] transition-all ${
              activeTool === "virtual-try-on" ? "bg-white/10 text-white shadow-sm" : "text-neutral-500 hover:text-white"
            }`}
          >
            <User size={16} weight={activeTool === "virtual-try-on" ? "fill" : "regular"} />
            Personal
          </button>
        </div>
      </div>

      {/* Scrollable control content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-8">
        
        {/* Source Material Upload */}
        <div className="flex flex-col gap-3">
          <label className="text-white text-[11px] uppercase tracking-wider font-semibold">Source Material</label>
          <ProductImageUpload file={productImageFile} onFileChange={setProductImageFile} vertical isDemo={isDemo} />
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
              className="w-full h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors overflow-hidden group mt-1"
            >
              {modelImagePath ? (
                <div className="flex items-center justify-between w-full px-3">
                  <div className="flex items-center gap-3">
                    <img src={modelImagePath} alt="Selected" className="w-8 h-8 rounded-lg object-cover" />
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
              className={`flex-1 justify-center py-2 rounded-lg font-medium text-[13px] transition-all border ${
                imageQuality === "standard" 
                  ? "border-[#84cc16]/50 bg-[#84cc16]/10 text-white shadow-[0_0_15px_rgba(132,204,22,0.2)]" 
                  : "border-transparent text-neutral-500 hover:text-white"
              }`}
            >
              Standard
            </button>
            <button 
              onClick={() => setImageQuality?.("premium")}
              className={`flex-1 justify-center py-2 rounded-lg font-medium text-[13px] transition-all flex items-center gap-2 border ${
                imageQuality === "premium" 
                  ? "border-[#84cc16]/50 bg-[#84cc16]/10 text-white shadow-[0_0_15px_rgba(132,204,22,0.2)]" 
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
              <HoverSelect value={productCategory} onChange={handleCategoryChange} options={generationConfig.productCategories} placeholder="Category" />
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

            {/* Grid for Size and Count */}
            <div className="grid grid-cols-2 gap-3 relative">
              <HoverSelect 
                value={size} 
                onChange={setSize} 
                options={generationConfig.sizes} 
                placeholder="Size" 
                onOptionHover={setHoveredSize}
              />
              
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumImages?.(n)}
                    className={`flex-1 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                      numImages === n ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 font-medium flex gap-2 items-start mt-2">
            <span className="shrink-0 pt-0.5">⚠️</span>
            {error}
          </div>
        )}
      </div>

      {/* Generate button */}
      <div className="p-6 pt-4 border-t border-white/5 shrink-0 relative bg-[#09090b]/80 backdrop-blur-xl">
        {isGenerating ? (
          <Button 
            variant="outline" 
            className="w-full rounded-xl h-12 border-white/10 font-bold text-[14px] transition-all duration-300 gap-2 bg-transparent text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
            onClick={handleCancel} 
          >
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <CircleNotch size={18} weight="bold" />
            </motion.div>
            Cancel Generation
          </Button>
        ) : (
          <Button 
            variant="primary" 
            className={`w-full rounded-xl h-12 border-0 font-bold text-[14px] transition-all duration-300 gap-2 ${
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
  );
}
