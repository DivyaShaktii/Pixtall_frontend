import React, { useMemo, useState } from "react";
import ModelSelector from "../components/ModelSelector";
import ProductImageUpload from "../components/ProductImageUpload";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import { generationConfig } from "../config/generationConfig";
import { fileToBase64 } from "../utils/fileToBase64";
import { urlToBase64 } from "../utils/urlToBase64";
import { API_BASE_URL } from "../utils/apiConfig";
import { motion, AnimatePresence } from "framer-motion";
import { useMotionVariants } from "../lib/motion";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import HoverSelect from "../components/ui/HoverSelect";
import SegmentedControl from "../components/ui/SegmentedControl";
import { Image, Sparkle, DownloadSimple, CircleNotch, TShirt, User } from "@phosphor-icons/react";
import { downloadImage } from "../utils/downloadImage";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const GENERATE_IMAGE_ENDPOINT = `${API_BASE_URL}/generate_image`;

const isAllowedModelPath = path =>
  typeof path === "string" && (
    (/^\/models\/(male|female)\//.test(path) && !path.includes("..")) ||
    path.startsWith("data:image/")
  );

export default function StudioView() {
  const motionVariants = useMotionVariants();
  
  // Tools
  const [activeTool, setActiveTool] = useState("product-to-model");
  
  // Form State
  const [productImageFile, setProductImageFile] = useState(null);
  const [productCategory, setProductCategory] = useState("");
  const [productSubcategory, setProductSubcategory] = useState("");
  const [scene, setScene] = useState("");
  const [size, setSize] = useState("");
  const [model, setModel] = useState("none");
  const [modelImagePath, setModelImagePath] = useState("");
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [numImages, setNumImages] = useState(4);
  
  // Generation State
  const [generatedImages, setGeneratedImages] = useState([null, null, null, null]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleModelTypeChange = (value) => {
    setModel(value);
    if (value === "none") {
      setModelImagePath("");
      setIsModelModalOpen(false);
    } else {
      setIsModelModalOpen(true);
    }
  };

  const selectedModelConfig = useMemo(
    () => generationConfig.models.find(option => option.value === model),
    [model]
  );

  const selectedCategorySubcategories = useMemo(
    () => generationConfig.productCategories.find(c => c.value === productCategory)?.subcategories ?? [],
    [productCategory]
  );

  const handleCategoryChange = categoryValue => {
    setProductCategory(categoryValue);
    setProductSubcategory("");
  };

  const validateForm = () => {
    if (!productImageFile) return "Product image is required.";
    if (!productImageFile.type.startsWith("image/")) return "Only image files are allowed.";
    if (productImageFile.size > MAX_UPLOAD_SIZE_BYTES) return "Product image must be 10MB or smaller.";
    if (!productCategory) return "Product category is required.";
    if (!productSubcategory) return "Product subcategory is required.";
    if (!scene) return "Scene is required.";
    if (!size) return "Output size is required.";
    if (!model) return "Model type is required.";
    if (model !== "none" && !modelImagePath) return "Select a model image for male or female model type.";
    if (model !== "none" && !isAllowedModelPath(modelImagePath)) return "Selected model image path is not allowed.";
    return "";
  };

  const handleGenerate = async () => {
    setError("");
    setSuccessMessage("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([null, null, null, null]);

    try {
      const productImageBase64 = await fileToBase64(productImageFile);
      let modelImageBase64 = "";
      if (model !== "none") {
        if (modelImagePath.startsWith("data:image/")) {
          modelImageBase64 = modelImagePath;
        } else {
          modelImageBase64 = await urlToBase64(modelImagePath);
        }
      }

      const response = await fetch(GENERATE_IMAGE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productImage: productImageBase64,
          productCategory,
          productSubcategory,
          scene,
          size,
          model,
          modelImage: modelImageBase64,
          intendUse: "marketplace",
          numImages
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned ${response.status}`);
      }

      if (!response.body) throw new Error("No response body returned from server.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let newlyGeneratedCount = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.error) {
              setError(parsed.error);
            } else if (parsed.image && typeof parsed.index === "number") {
              setGeneratedImages(prev => {
                const updated = [...prev];
                updated[parsed.index] = parsed.image;
                return updated;
              });
              newlyGeneratedCount++;
            }
          } catch (e) {
            console.warn("Failed to parse NDJSON line:", line, e);
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.image && typeof parsed.index === "number") {
            setGeneratedImages(prev => {
              const updated = [...prev];
              updated[parsed.index] = parsed.image;
              return updated;
            });
            newlyGeneratedCount++;
          }
        } catch (e) {
          // ignore
        }
      }
      
      setSuccessMessage(`Successfully generated ${newlyGeneratedCount} image(s).`);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const productImageUrl = useMemo(() => {
    return productImageFile ? URL.createObjectURL(productImageFile) : null;
  }, [productImageFile]);

  return (
    <motion.div 
      variants={motionVariants.pageEntrance}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full font-sans bg-transparent relative"
    >
      {/* ═══════════════════════════════════════════════
          LEFT: Canvas Panel (flex-1, full height)
          ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col p-4 lg:p-6 min-h-0 overflow-hidden">
        <Card className="flex-1 w-full overflow-hidden flex flex-col bg-paper border border-line shadow-sm rounded-2xl min-h-0">
          {/* Canvas header */}
          <div className="flex items-center justify-between p-4 border-b border-line bg-paper shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/20 text-accent">
                <Sparkle weight="fill" size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-ink m-0 tracking-tight">
                  {activeTool === "product-to-model" ? "Marketplace Studio" : "Personal Studio"}
                </h3>
                <p className="text-xs text-slate m-0">
                  {isGenerating ? "Rendering..." : "Generate and compare."}
                </p>
              </div>
            </div>
            {!isGenerating && generatedImages.some(Boolean) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  generatedImages.forEach((img, i) => {
                    if (img) setTimeout(() => downloadImage(img, `pixtall-${i + 1}.png`), i * 150);
                  });
                }}
                className="gap-2 font-bold h-9 text-xs rounded-xl border-line hover:bg-cloud hover:text-ink text-slate"
              >
                <DownloadSimple size={14} weight="bold" />
                Download All
              </Button>
            )}
          </div>
          
          {/* Canvas content */}
          <div className="flex-1 p-4 lg:p-8 bg-cloud flex flex-col min-h-0 overflow-y-auto">
            <div className={`w-full max-w-5xl mx-auto flex-1 min-h-0 grid gap-4 ${
              numImages === 1 ? "grid-cols-1 grid-rows-1" : 
              numImages === 2 ? "grid-cols-2 grid-rows-1" : 
              "grid-cols-2 grid-rows-2"
            }`}>
              {Array.from({ length: numImages }).map((_, i) => {
                const imageSrc = generatedImages[i];
                
                const [w, h] = size ? size.split(':').map(Number) : [1, 1];

                return (
                  <div key={`slot-wrapper-${i}`} className="w-full h-full flex items-center justify-center min-h-0 min-w-0 p-2">
                    <div className="relative flex items-center justify-center max-w-full max-h-full">
                      {/* Invisible SVG to force perfect aspect ratio scaling */}
                      <svg 
                        viewBox={`0 0 ${w} ${h}`} 
                        width={w * 1000} 
                        height={h * 1000} 
                        className="max-w-full max-h-full w-auto h-auto opacity-0 pointer-events-none" 
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
                              <BeforeAfterSlider 
                                beforeSrc={productImageUrl || "https://picsum.photos/seed/placeholder/800/800"} 
                                afterSrc={imageSrc} 
                                beforeLabel="Source" 
                                afterLabel={`Result ${i + 1}`} 
                              />
                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button 
                                  variant="primary" 
                                  className="shadow-lg gap-2 font-medium text-xs h-8 bg-ink text-paper hover:bg-cloud-2" 
                                  onClick={() => downloadImage(imageSrc, `pixtall-${i + 1}.png`)}
                                >
                                  <DownloadSimple size={14} weight="bold" /> Save
                                </Button>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key={`slot-empty-${i}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="w-full h-full rounded-2xl border-2 border-dashed border-line bg-paper flex flex-col items-center justify-center text-slate gap-4"
                            >
                              {isGenerating ? (
                                <div className="flex flex-col items-center gap-3">
                                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="text-accent">
                                    <CircleNotch size={32} weight="bold" />
                                  </motion.div>
                                  <span className="font-semibold text-sm text-ink">Rendering...</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Image size={32} weight="light" className="opacity-50" />
                                  <span className="font-medium text-sm">Slot {["One", "Two", "Three", "Four"][i]}</span>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT: Control Panel (full height, scrollable)
          All controls merged into one continuous panel.
          ═══════════════════════════════════════════════ */}
      <div className="w-full lg:w-[360px] shrink-0 p-4 lg:p-6 lg:pl-0 overflow-y-auto">
        <Card className="rounded-2xl border border-line shadow-lg bg-paper flex flex-col h-full">
          
          {/* Tool Switcher — now inside the panel */}
          <div className="p-4 border-b border-line shrink-0">
            <div className="flex items-center gap-2 bg-cloud border border-line rounded-xl p-1">
              <button 
                onClick={() => setActiveTool("product-to-model")}
                className={`flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTool === "product-to-model" ? "bg-accent text-paper shadow-sm" : "text-slate hover:text-ink hover:bg-paper"
                }`}
              >
                <TShirt size={16} weight={activeTool === "product-to-model" ? "fill" : "regular"} />
                Marketplace
              </button>
              <button 
                onClick={() => setActiveTool("virtual-try-on")}
                className={`flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTool === "virtual-try-on" ? "bg-accent text-paper shadow-sm" : "text-slate hover:text-ink hover:bg-paper"
                }`}
              >
                <User size={16} weight={activeTool === "virtual-try-on" ? "fill" : "regular"} />
                Personal
              </button>
            </div>
          </div>

          {/* Scrollable control content */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            
            {/* Source Material Upload */}
            <div>
              <label className="text-slate text-[11px] uppercase tracking-[0.05em] font-semibold px-1 mb-2 block">Source Material</label>
              <ProductImageUpload file={productImageFile} onFileChange={setProductImageFile} vertical />
            </div>

            {/* Model Reference */}
            <div className="flex flex-col gap-2">
              <label className="text-slate text-[11px] uppercase tracking-[0.05em] font-semibold px-1">Model Reference</label>
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
                  onClick={() => setIsModelModalOpen(true)}
                  className="w-full h-[60px] rounded-xl bg-cloud border border-line flex items-center justify-center text-slate hover:text-ink hover:bg-line/50 transition-colors overflow-hidden group"
                >
                  {modelImagePath ? (
                    <div className="flex items-center gap-3 w-full px-4">
                      <img src={modelImagePath} alt="Selected" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                      <span className="text-sm font-medium text-ink">Change Model</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <User size={16} /> Select Model
                    </div>
                  )}
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-line" />

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate text-[11px] uppercase tracking-[0.05em] font-semibold px-1">Category</label>
              <HoverSelect value={productCategory} onChange={handleCategoryChange} options={generationConfig.productCategories} placeholder="Category" />
            </div>

            {/* Details */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate text-[11px] uppercase tracking-[0.05em] font-semibold px-1">Details</label>
              <HoverSelect value={productSubcategory} onChange={setProductSubcategory} options={selectedCategorySubcategories} placeholder="Details" disabled={!productCategory} />
            </div>

            {/* Scene */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate text-[11px] uppercase tracking-[0.05em] font-semibold px-1">Scene</label>
              <HoverSelect value={scene} onChange={setScene} options={generationConfig.scenes} placeholder="Scene" />
            </div>

            {/* Size + Count side by side */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-slate text-[11px] uppercase tracking-[0.05em] font-semibold px-1">Size</label>
                <HoverSelect value={size} onChange={setSize} options={generationConfig.sizes} placeholder="Size" />
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <label className="text-slate text-[11px] uppercase tracking-[0.05em] font-semibold px-1">Count</label>
                <div className="flex items-center gap-1 bg-cloud rounded-xl p-1 border border-line">
                  {[1, 2, 3, 4].map(n => (
                    <button
                      key={n}
                      onClick={() => setNumImages(n)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 border border-transparent ${
                        numImages === n ? "bg-accent text-paper shadow-sm" : "text-slate hover:bg-cloud-2 hover:text-ink"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="p-3 bg-danger-soft text-danger text-xs rounded-xl border border-danger-line font-medium flex gap-2 items-start shadow-sm">
                <span className="shrink-0 pt-0.5">⚠️</span>
                {error}
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-success-soft text-success text-xs rounded-xl border border-success-line font-medium flex gap-2 items-start shadow-sm">
                <span className="shrink-0 pt-0.5">✅</span>
                {successMessage}
              </div>
            )}
          </div>

          {/* Generate button — anchored at bottom of panel */}
          <div className="p-4 border-t border-line shrink-0">
            <Button 
              variant="primary" 
              className="w-full rounded-xl h-12 border-0 font-bold text-base transition-all duration-300 gap-2 bg-accent text-paper hover:bg-accent-ink hover:scale-[1.01] active:scale-[0.98]"
              onClick={handleGenerate} 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <CircleNotch size={18} weight="bold" />
                </motion.div>
              ) : <Sparkle size={18} weight="fill" />}
              {isGenerating ? "Rendering..." : "Generate"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Model Selector Modal */}
      <ModelSelector 
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        modelConfig={selectedModelConfig}
        selectedModelImage={modelImagePath}
        onModelImageChange={setModelImagePath}
      />
    </motion.div>
  );
}
