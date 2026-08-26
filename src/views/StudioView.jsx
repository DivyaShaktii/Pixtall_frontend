import React, { useMemo, useState, useEffect, useRef } from "react";
import ModelSelector from "../components/ModelSelector";
import { StudioCanvasGrid } from "../components/studio/StudioCanvasGrid";
import { StudioSidebar } from "../components/studio/StudioSidebar";
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
import { Image, Sparkle, DownloadSimple, CircleNotch, TShirt, User, CheckCircle, X } from "@phosphor-icons/react";
import { downloadImage } from "../utils/downloadImage";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const GENERATE_IMAGE_ENDPOINT = `${API_BASE_URL}/generate_image`;
const LEGACY_DEMO_EMAIL = "admin@pixtall.ai";
const BACKEND_DEMO_EMAIL = "admin@pixstall.ai";

const getBackendError = payload => {
  if (!payload || typeof payload !== "object") return "";
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.detail === "string") return payload.detail;
  if (payload.success === false && typeof payload.message === "string") return payload.message;
  if (payload.status === "failed" && typeof payload.message === "string") return payload.message;
  if (typeof payload.message === "string" && /fail|error|unable/i.test(payload.message)) return payload.message;
  return "";
};

const isAllowedModelPath = path =>
  typeof path === "string" && (
    (/^\/models\/(male|female)\//.test(path) && !path.includes("..")) ||
    path.startsWith("data:image/")
  );

export default function StudioView({ email }) {
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
  const [numImages, setNumImages] = useState(1);
  const [imageQuality, setImageQuality] = useState("standard");
  
  // Generation State
  const [generatedImages, setGeneratedImages] = useState([null, null, null, null]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Refactor State
  const [showToast, setShowToast] = useState(false);
  const [hoveredSize, setHoveredSize] = useState(null);
  const abortControllerRef = useRef(null);

  // Harden: Global Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isGenerating && !validateForm()) {
          handleGenerate();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGenerating, productImageFile, productCategory, productSubcategory, scene, size, model, modelImagePath, activeTool, numImages, imageQuality, email]);

  // Polish: Toast timeout
  useEffect(() => {
    if (successMessage) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleModelTypeChange = (value) => {
    if (value !== model) {
      setModelImagePath("");
    }
    setModel(value);
    if (value === "none") {
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

  const createGenerationPayload = async () => {
    const productImageBase64 = await fileToBase64(productImageFile);
    let modelImageBase64 = null;

    if (model !== "none") {
      modelImageBase64 = modelImagePath.startsWith("data:image/")
        ? modelImagePath
        : await urlToBase64(modelImagePath);
    }

    const backendEmail = email === LEGACY_DEMO_EMAIL ? BACKEND_DEMO_EMAIL : (email || "");

    return {
      productImageBase64,
      modelImageBase64,
      productCategory,
      productSubcategory,
      scene: "studio",
      size,
      model,
      intendUse: activeTool === "product-to-model" ? "marketplace" : "website",
      numImages,
      email: backendEmail
    };
  };

  const handleDownloadPayload = async () => {
    setError("");
    setSuccessMessage("");
    setShowToast(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const payload = await createGenerationPayload();
      const payloadBlob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json"
      });
      const downloadUrl = URL.createObjectURL(payloadBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = `pixtall-request-payload-${Date.now()}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(downloadUrl);
      setSuccessMessage("Payload downloaded for Postman testing.");
    } catch (err) {
      setError(err.message || "Could not create the payload file.");
    }
  };

  const handleGenerate = async () => {
    setError("");
    setSuccessMessage("");
    setShowToast(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([null, null, null, null]);
    
    // Setup abort controller
    abortControllerRef.current = new AbortController();

    try {
      const payload = await createGenerationPayload();

      const response = await fetch(GENERATE_IMAGE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(getBackendError(errData) || `Server returned ${response.status}`);
      }

      if (!response.body) throw new Error("No response body returned from server.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let newlyGeneratedCount = 0;
      const backendErrors = [];

      const processPayload = parsed => {
        const backendError = getBackendError(parsed);
        if (backendError) {
          backendErrors.push(backendError);
          return;
        }

        const imageSrc = parsed?.image || parsed?.imageUrl || parsed?.imageBase64;
        if (!imageSrc) return;

        const slotIndex = typeof parsed.index === "number" ? parsed.index : newlyGeneratedCount;
        setGeneratedImages(prev => {
          const updated = [...prev];
          updated[slotIndex] = imageSrc;
          return updated;
        });
        newlyGeneratedCount++;
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            processPayload(JSON.parse(line));
          } catch (e) {
            console.warn("Failed to parse NDJSON line:", line, e);
            backendErrors.push("The server returned an unreadable response.");
          }
        }
      }

      buffer += decoder.decode();
      if (buffer.trim()) {
        try {
          processPayload(JSON.parse(buffer));
        } catch (e) {
          console.warn("Failed to parse NDJSON final buffer:", buffer, e);
          backendErrors.push("The server returned an unreadable response.");
        }
      }

      if (newlyGeneratedCount === 0) {
        throw new Error(backendErrors[0] || "The backend completed the request but returned no images.");
      }

      if (backendErrors.length > 0) {
        setError(`${newlyGeneratedCount} image(s) generated; ${backendErrors.length} failed: ${backendErrors[0]}`);
      }
      setSuccessMessage(`Successfully generated ${newlyGeneratedCount} image(s).`);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log("Generation cancelled by user.");
      } else {
        console.error(err);
        setError(err.message || "An error occurred during generation.");
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
      className="flex flex-col lg:flex-row h-auto min-h-full lg:h-full w-full font-sans relative bg-black overflow-visible lg:overflow-hidden"
    >
      {/* Cinematic Studio Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Primary lime glow — top center */}
        <div className="absolute top-0 left-1/2 w-[90vw] h-[70vh] -translate-x-1/2 -translate-y-[15%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(163,230,53,0.12)_0%,rgba(100,200,50,0.04)_40%,transparent_70%)] blur-[60px]" />
        {/* Secondary warm glow — bottom right */}
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vh] translate-x-[10%] translate-y-[10%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(180,230,80,0.06)_0%,transparent_65%)] blur-[80px]" />
        {/* Tertiary cool accent — left edge */}
        <div className="absolute top-1/2 left-0 w-[30vw] h-[40vh] -translate-x-[20%] -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(130,200,60,0.04)_0%,transparent_60%)] blur-[60px]" />
        {/* Subtle grid texture */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(163,230,53,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        {/* Film grain noise */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
        />
      </div>

      {/* ═══════════════════════════════════════════════
          LEFT: Canvas Panel (flex-1, full height)
          ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-[50vh] lg:min-h-0 overflow-hidden relative z-10">
        <div className="flex-1 w-full overflow-hidden flex flex-col bg-transparent min-h-0">
          {/* Canvas header */}
          <div className="flex items-center justify-between p-4 border-b border-line bg-paper/40 backdrop-blur-md shrink-0">
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
          <div className="flex-1 p-4 lg:p-8 bg-transparent flex flex-col min-h-0 overflow-y-auto">
            <StudioCanvasGrid 
              numImages={numImages}
              generatedImages={generatedImages}
              size={size}
              hoveredSize={hoveredSize}
              productImageUrl={productImageUrl}
              isGenerating={isGenerating}
              isDemo={false}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT: Control Panel (full height, scrollable)
          All controls merged into one continuous panel.
          ═══════════════════════════════════════════════ */}
      <StudioSidebar 
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        productImageFile={productImageFile}
        setProductImageFile={setProductImageFile}
        model={model}
        handleModelTypeChange={handleModelTypeChange}
        modelImagePath={modelImagePath}
        setIsModelModalOpen={setIsModelModalOpen}
        productCategory={productCategory}
        handleCategoryChange={handleCategoryChange}
        productSubcategory={productSubcategory}
        setProductSubcategory={setProductSubcategory}
        scene={scene}
        setScene={setScene}
        size={size}
        setSize={setSize}
        setHoveredSize={setHoveredSize}
        numImages={numImages}
        setNumImages={setNumImages}
        imageQuality={imageQuality}
        setImageQuality={setImageQuality}
        error={error}
        isGenerating={isGenerating}
        handleCancel={handleCancel}
        handleGenerate={handleGenerate}
        handleDownloadPayload={handleDownloadPayload}
        isDemo={false}
      />

      {/* Model Selector Modal */}
      <ModelSelector 
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        modelConfig={selectedModelConfig}
        selectedModelImage={modelImagePath}
        onModelImageChange={setModelImagePath}
      />

      {/* Floating Toast for Success */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 p-4 bg-paper text-ink rounded-2xl border border-line shadow-2xl flex items-center gap-3"
          >
            <div className="text-success"><CheckCircle size={24} weight="fill" /></div>
            <span className="font-medium text-sm pr-4">{successMessage}</span>
            <button onClick={() => setShowToast(false)} className="text-slate hover:text-ink p-1">
              <X size={16} weight="bold" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
