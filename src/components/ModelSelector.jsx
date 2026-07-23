import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadSimple, CheckCircle } from "@phosphor-icons/react";
import { useMotionVariants, transitions } from "../lib/motion";

const PAGE_SIZE = 15;

const ModelReferenceModal = ({ 
  isOpen, 
  onClose, 
  modelConfig, 
  selectedModelImage, 
  onModelImageChange 
}) => {
  const motionVariants = useMotionVariants();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [userImages, setUserImages] = useState([]);
  const uploadRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Reset pagination on open or model change
  React.useEffect(() => {
    if (isOpen) setVisibleCount(PAGE_SIZE);
  }, [isOpen, modelConfig?.value]);

  const handleSelect = (imagePath) => {
    onModelImageChange(imagePath);
    onClose();
  };

  const handleUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setUserImages(prev => [dataUrl, ...prev]);
      handleSelect(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const onFileInput = (e) => {
    handleUpload(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const allImages = useMemo(
    () => [...userImages, ...(modelConfig?.images ?? [])],
    [userImages, modelConfig]
  );
  
  const visibleImages = allImages.slice(0, visibleCount);
  const remaining = allImages.length - visibleCount;

  if (!isOpen || !modelConfig) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans">
        <motion.div 
          variants={motionVariants.modalOverlay}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          variants={motionVariants.modalContent}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative w-full max-w-2xl max-h-[85vh] bg-white border border-line/60 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-line/60 bg-cloud/30 shrink-0">
            <div>
              <span className="text-slate text-[10px] uppercase tracking-widest font-bold mb-1 block">Model Reference</span>
              <h2 className="text-ink text-lg font-semibold m-0 tracking-tight">Choose a {modelConfig.label} model</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-slate hover:text-ink hover:bg-black/10 transition-colors"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
            
            {/* Upload Area */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-ink">Upload Custom Reference</h3>
              <div 
                onClick={() => uploadRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex items-center justify-between p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                  isDragging ? "border-[#0f172a] bg-cloud" : "border-line hover:border-ink bg-paper"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-cloud-2 flex items-center justify-center text-ink">
                    <UploadSimple size={20} weight="bold" />
                  </div>
                  <div>
                    <strong className="text-sm font-semibold text-ink block mb-0.5">Upload your own photo</strong>
                    <span className="text-xs text-slate">JPG, PNG or WEBP — replaces the reference</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-4 py-2 bg-cloud hover:bg-line transition-colors text-ink rounded-lg border border-line-2 shadow-sm">
                  Browse
                </span>
                <input
                  ref={uploadRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileInput}
                  className="hidden"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-ink">Preset Models</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {visibleImages.map((imagePath, idx) => {
                  const isSelected = selectedModelImage === imagePath;
                  return (
                    <button
                      key={`${imagePath}-${idx}`}
                      type="button"
                      onClick={() => handleSelect(imagePath)}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden group border-2 transition-all duration-200 ${
                        isSelected ? "border-[#0f172a] shadow-[0_0_0_1px_rgba(15,23,42,0.1)]" : "border-transparent hover:border-line"
                      }`}
                    >
                      <img src={imagePath} alt="" className="w-full h-full object-cover bg-cloud" loading="lazy" />
                      
                      <div className={`absolute inset-0 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm ${
                        isSelected ? "opacity-100 bg-ink/20" : "opacity-0 group-hover:opacity-100 bg-ink/40"
                      }`}>
                        {isSelected ? (
                          <motion.div 
                            variants={motionVariants.modalContent}
                            initial="initial"
                            animate="animate"
                            className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center shadow-md"
                          >
                            <CheckCircle size={20} weight="fill" />
                          </motion.div>
                        ) : (
                          <span className="text-ink text-xs font-bold px-3 py-1.5 border border-line rounded-md bg-white/80 shadow-sm backdrop-blur-md">Select</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="w-full py-3 mt-4 rounded-xl border border-line text-xs font-semibold text-slate hover:text-ink hover:bg-cloud transition-colors"
                >
                  Load more · {remaining} remaining
                </button>
              )}
            </div>

          </div>
        </motion.div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ModelReferenceModal;
