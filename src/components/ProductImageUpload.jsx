import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadSimple, Image as ImageIcon, CheckCircle } from "@phosphor-icons/react";
import { transitions } from "../lib/motion";

const ProductImageUpload = ({ file, onFileChange, vertical }) => {
  const [preview, setPreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  /* ── vertical mode: stacked layout for narrow sidebar ── */
  if (vertical) {
    return (
      <div className="flex flex-col gap-3 w-full">
        <motion.div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={{
            borderColor: isDragging ? "var(--color-accent)" : "var(--color-line)",
            backgroundColor: isDragging ? "var(--color-cloud)" : "var(--color-paper)",
            scale: isDragging ? 1.02 : 1
          }}
          transition={transitions.micro}
          className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors hover:border-accent hover:bg-cloud"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => onFileChange(e.target.files?.[0] ?? null)}
          />
          
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={transitions.snappy}
                className="flex flex-col items-center text-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-cloud-2 flex items-center justify-center text-ink mb-1">
                  <UploadSimple size={20} weight="bold" />
                </div>
                <strong className="text-sm font-semibold text-ink">Drop product photo</strong>
                <p className="text-xs text-slate">JPG, PNG or WEBP &middot; max 10MB</p>
                <span className="mt-2 text-xs font-semibold px-3 py-1.5 bg-cloud-2 text-ink rounded-md hover:bg-line transition-colors">Choose image</span>
              </motion.div>
            ) : (
              <motion.div 
                key="filled"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={transitions.snappy}
                className="flex flex-col items-center gap-3 w-full"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden border border-line shadow-sm relative group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white text-xs font-bold px-3 py-1.5 border border-white/20 rounded-md bg-ink/60 shadow-sm">Replace</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-ink w-full justify-center">
                  <CheckCircle size={16} weight="fill" className="text-ink" />
                  <span className="truncate max-w-[120px]">{file.name}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  /* ── horizontal mode (default): dropzone left, thumbnail right ── */
  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="text-sm font-semibold text-ink">Source Material</label>
      
      <div className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-4 p-4 border border-line bg-paper rounded-2xl shadow-sm">
        <motion.div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={{
            borderColor: isDragging ? "var(--color-accent)" : "var(--color-line)",
            backgroundColor: isDragging ? "var(--color-cloud)" : "transparent",
            scale: isDragging ? 1.02 : 1
          }}
          transition={transitions.micro}
          className="relative flex flex-col items-start justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-accent hover:bg-cloud transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => onFileChange(e.target.files?.[0] ?? null)}
          />
          
          <div className="w-10 h-10 rounded-full bg-cloud-2 flex items-center justify-center text-ink mb-3 transition-transform group-hover:scale-110">
            {file ? <CheckCircle size={20} weight="fill" className="text-ink" /> : <UploadSimple size={20} weight="bold" />}
          </div>
          
          <strong className="text-sm font-semibold text-ink mb-1">
            {file ? "Image ready" : "Upload product photo"}
          </strong>
          <p className="text-xs text-slate mb-4">JPG, PNG or WEBP &middot; max 10MB</p>
          
          <span className="text-xs font-semibold px-4 py-2 bg-cloud hover:bg-line transition-colors text-ink rounded-lg border border-line-2">
            {file ? "Replace image" : "Choose image"}
          </span>
        </motion.div>

        <div className="flex items-center justify-center">
          {preview ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={transitions.snappy}
                className="w-full aspect-square rounded-xl overflow-hidden border border-line shadow-sm"
              >
                <img src={preview} alt="Product preview" className="w-full h-full object-cover" />
              </motion.div>
              <p className="text-[11px] font-medium text-slate truncate w-full text-center px-2" title={file?.name}>
                {file?.name}
              </p>
            </div>
          ) : (
            <div className="w-full aspect-square rounded-xl border border-line bg-cloud flex flex-col items-center justify-center text-slate gap-2">
              <ImageIcon size={24} weight="duotone" />
              <span className="text-xs font-medium">Preview</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImageUpload;
