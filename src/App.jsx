import { useMemo, useState } from "react";
import AuthPage, { SESSION_STORAGE_KEY } from "./components/AuthPage";
import BrandWordmark from "./components/BrandMark";
import GalleryPage from "./components/GalleryPage";
import GenerateButton from "./components/GenerateButton";
import ModelSelector from "./components/ModelSelector";
import ProductImageUpload from "./components/ProductImageUpload";
import ProductsPage from "./components/ProductsPage";
import Sidebar from "./components/Sidebar";
import StubPage from "./components/StubPage";
import { generationConfig } from "./config/generationConfig";
import { fileToBase64 } from "./utils/fileToBase64";
import { urlToBase64 } from "./utils/urlToBase64";
import { downloadImage } from "./utils/downloadImage";
import { API_BASE_URL } from "./utils/apiConfig";

const STUB_PAGES = {
  billing: {
    title: "Billing",
    description: "Plans, invoices, and payment methods will show up here once billing is connected."
  },
  settings: {
    title: "Settings",
    description: "Account, workspace, and notification preferences will live here."
  }
};

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

// The server streams images back one at a time as newline-delimited JSON
// (NDJSON): one JSON object per line, e.g. {"index":0,"image":"data:image/png;base64,..."}
// Each object is "accepted" (parsed) and rendered into its grid slot as soon
// as it arrives, rather than waiting for the whole response to finish.
const GENERATE_IMAGE_ENDPOINT = `${API_BASE_URL}/generate_image`;

const isAllowedModelPath = path =>
  typeof path === "string" && (
    (/^\/models\/(male|female)\//.test(path) && !path.includes("..")) ||
    path.startsWith("data:image/")
  );

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
      return sessionRaw ? JSON.parse(sessionRaw) : null;
    } catch {
      return null;
    }
  });
  const [productImageFile, setProductImageFile] = useState(null);
  const [productCategory, setProductCategory] = useState("");
  const [productSubcategory, setProductSubcategory] = useState("");
  const [scene, setScene] = useState("");
  const [size, setSize] = useState("");
  const [model, setModel] = useState("");
  const [modelImagePath, setModelImagePath] = useState("");
  const [intendUse, setIntendUse] = useState("marketplace");
  const [numImages, setNumImages] = useState(1);
  const [generatedImages, setGeneratedImages] = useState([null, null, null, null]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeNav, setActiveNav] = useState("studio");

  const selectedModelConfig = useMemo(
    () => generationConfig.models.find(option => option.value === model),
    [model]
  );

  const selectedCategorySubcategories = useMemo(
    () => generationConfig.productCategories.find(c => c.value === productCategory)?.subcategories ?? [],
    [productCategory]
  );

  const completedSteps = [
    Boolean(productImageFile),
    Boolean(productCategory && productSubcategory),
    Boolean(scene),
    Boolean(size),
    Boolean(model && (model === "none" || modelImagePath))
  ].filter(Boolean).length;

  const progressPercent = Math.round((completedSteps / 5) * 100);

  const handleCategoryChange = categoryValue => {
    setProductCategory(categoryValue);
    setProductSubcategory("");
  };

  const handleModelChange = modelValue => {
    setModel(modelValue);
    setModelImagePath("");
  };

  const resetGeneratorForm = () => {
    setProductImageFile(null);
    setProductCategory("");
    setProductSubcategory("");
    setScene("");
    setSize("");
    setModel("");
    setModelImagePath("");
    setIntendUse("marketplace");
    setNumImages(1);
    setGeneratedImages([null, null, null, null]);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setCurrentUser(null);
    setError("");
    setSuccessMessage("");
    resetGeneratorForm();
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
    if (model !== "none" && !modelImagePath) {
      return "Select a model image for male or female model type.";
    }
    if (model !== "none" && !isAllowedModelPath(modelImagePath)) {
      return "Selected model image path is not allowed.";
    }

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
      const modelImageBase64 = model === "none" ? null : await urlToBase64(modelImagePath);

      const payload = {
        productImageBase64,
        modelImageBase64,
        productCategory,
        productSubcategory,
        scene,
        size,
        model,
        intendUse,
        numImages,
        email: currentUser?.email ?? ""
      };

      const response = await fetch(GENERATE_IMAGE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedCount = 0;

      // Accept and render each image as its line arrives, instead of
      // waiting for the full response body to close.
      const acceptChunk = rawLine => {
        const trimmed = rawLine.trim();
        if (!trimmed) return;

        let parsed;
        try {
          parsed = JSON.parse(trimmed);
        } catch {
          return; // skip a malformed/partial chunk
        }

        if (parsed.error) throw new Error(parsed.error);

        const imageSrc = parsed.image || parsed.imageUrl || parsed.imageBase64;
        if (!imageSrc) return;

        const slotIndex = typeof parsed.index === "number" ? parsed.index : receivedCount;
        setGeneratedImages(prev => {
          const next = [...prev];
          next[slotIndex] = imageSrc;
          return next;
        });
        receivedCount += 1;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep the trailing partial line for next chunk

        lines.forEach(acceptChunk);
      }

      if (buffer.trim()) acceptChunk(buffer);

      if (receivedCount === 0) {
        setError("No images were returned by the generation service.");
      } else {
        setSuccessMessage(`${receivedCount} of ${numImages} image${numImages > 1 ? "s" : ""} received.`);
      }
    } catch (generationError) {
      setError(`Image generation failed: ${generationError.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentUser) {
    return <AuthPage onAuthSuccess={setCurrentUser} />;
  }

  const userInitials = (currentUser.name || currentUser.email || "?")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="layout app-shell">
      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-brand-mark">PS</div>
          <h2><BrandWordmark /></h2>
        </div>
        <div className="topbar-actions">
          <span className="topbar-avatar">{userInitials}</span>
          <span className="topbar-user">Hi, {currentUser.name?.split(" ")[0] || currentUser.email}</span>
          <button type="button" className="nav-btn nav-btn-muted" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="app-body">
        <Sidebar
          active={activeNav}
          onNavigate={setActiveNav}
          creditsUsed={4}
          creditsTotal={10}
        />

        <div className="app-main">

          {activeNav === "studio" && (
            <div className="page-body">

              {/* ── 2-column workspace ── */}
              <div className="studio-dashboard">

                {/* CENTER — generated image canvas */}
                <main className="dash-panel canvas-panel">
                  <div className="canvas-panel-header">
                    <div className="gen-icon">✨</div>
                    <div>
                      <strong>
                        {isGenerating
                          ? "Generating your images…"
                          : generatedImages.some(Boolean)
                            ? "Generated images"
                            : "Generated images will appear here"}
                      </strong>
                      <p>
                        {isGenerating
                          ? "Images will fill in below as each one finishes."
                          : `${numImages} image${numImages > 1 ? "s" : ""} will be generated in this layout. Configure the options below, then generate.`}
                      </p>
                    </div>
                    {!isGenerating && generatedImages.some(Boolean) && (
                      <button
                        type="button"
                        className="nav-btn canvas-download-all-btn"
                        onClick={() => {
                          generatedImages.forEach((imageSrc, i) => {
                            if (!imageSrc) return;
                            setTimeout(() => downloadImage(imageSrc, `pixstall-generated-${i + 1}.png`), i * 150);
                          });
                        }}
                      >
                        ⬇ Download all
                      </button>
                    )}
                  </div>

                  <div className="canvas-grid">
                    {[0, 1, 2, 3].map(i => {
                      const isSlotActive = i < numImages;
                      const imageSrc = generatedImages[i];
                      return (
                        <div
                          key={i}
                          className={`canvas-grid-cell ${isSlotActive ? "is-active" : "is-inactive"} ${imageSrc ? "has-image" : ""}`}
                        >
                          {imageSrc ? (
                            <>
                              <img
                                src={imageSrc}
                                alt={`Generated result ${i + 1}`}
                                className="canvas-grid-image"
                                onClick={() => downloadImage(imageSrc, `pixstall-generated-${i + 1}.png`)}
                              />
                              <button
                                type="button"
                                className="canvas-grid-image-download"
                                aria-label={`Download generated image ${i + 1}`}
                                onClick={() => downloadImage(imageSrc, `pixstall-generated-${i + 1}.png`)}
                              >
                                ⬇
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="vf-corners" aria-hidden="true"><span /><span /><span /><span /></span>
                              {isSlotActive && isGenerating ? (
                                <span className="canvas-grid-cell-spinner" aria-hidden="true" />
                              ) : (
                                <span className="canvas-grid-cell-num">{i + 1}</span>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </main>

                {/* RIGHT — product upload */}
                <aside className="dash-panel upload-panel">
                  <p className="upload-panel-label">Product photo</p>
                  <ProductImageUpload file={productImageFile} onFileChange={setProductImageFile} vertical />
                </aside>

              </div>

              {/* ── Bottom config toolbar ── */}
              <div className="studio-config-bar stagger">

                <div className="config-fields-strip">

                  {/* Category */}
                  <div className="config-field-item">
                    <label htmlFor="cfg-cat">Category</label>
                    <select
                      id="cfg-cat"
                      value={productCategory}
                      onChange={e => handleCategoryChange(e.target.value)}
                    >
                      <option value="">Select…</option>
                      {generationConfig.productCategories.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="config-v-divider" />

                  {/* Subcategory */}
                  <div className="config-field-item">
                    <label htmlFor="cfg-sub">Subcategory</label>
                    <select
                      id="cfg-sub"
                      value={productSubcategory}
                      onChange={e => setProductSubcategory(e.target.value)}
                      disabled={!productCategory}
                    >
                      <option value="">Select…</option>
                      {selectedCategorySubcategories.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="config-v-divider" />

                  {/* Scene */}
                  <div className="config-field-item">
                    <label htmlFor="cfg-scene">Scene</label>
                    <select
                      id="cfg-scene"
                      value={scene}
                      onChange={e => setScene(e.target.value)}
                    >
                      <option value="">Select…</option>
                      {generationConfig.scenes.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="config-v-divider" />

                  {/* Size */}
                  <div className="config-field-item">
                    <label htmlFor="cfg-size">Output size</label>
                    <select
                      id="cfg-size"
                      value={size}
                      onChange={e => setSize(e.target.value)}
                    >
                      <option value="">Select…</option>
                      {generationConfig.sizes.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="config-v-divider" />

                  {/* Model — compact inline */}
                  <ModelSelector
                    models={generationConfig.models}
                    selectedModel={model}
                    selectedModelImage={modelImagePath}
                    onModelChange={handleModelChange}
                    onModelImageChange={setModelImagePath}
                    compact
                  />

                  <div className="config-v-divider" />

                  {/* Intended use */}
                  <div className="config-field-item">
                    <label>
                      Use
                      <span className="info-tip">
                        <span className="info-tip-icon" tabIndex={0} aria-label="What does 'Use' mean?">i</span>
                        <span className="info-tip-bubble">
                          <strong>Marketplace</strong> — Amazon, Flipkart, etc.
                          <br />
                          <strong>Personal</strong> — website, Insta, etc.
                        </span>
                      </span>
                    </label>
                    <div className="model-compact-controls">
                      <button
                        type="button"
                        className={`model-compact-btn ${intendUse === "marketplace" ? "active" : ""}`}
                        onClick={() => setIntendUse("marketplace")}
                      >
                        Marketplace
                      </button>
                      <button
                        type="button"
                        className={`model-compact-btn ${intendUse === "website" ? "active" : ""}`}
                        onClick={() => setIntendUse("website")}
                      >
                        Personal
                      </button>
                    </div>
                  </div>

                  <div className="config-v-divider" />

                  {/* Number of images */}
                  <div className="config-field-item">
                    <label>No. of images</label>
                    <div className="model-compact-controls">
                      {[1, 2, 3, 4].map(n => (
                        <button
                          key={n}
                          type="button"
                          className={`model-compact-btn num-btn ${numImages === n ? "active" : ""}`}
                          onClick={() => setNumImages(n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Export zone */}
                <div className="config-export-zone">
                  <GenerateButton
                    onClick={handleGenerate}
                    label={isGenerating ? "Generating…" : "Generate images"}
                    disabled={isGenerating}
                  />
                  <div className="config-status-pills">
                    {selectedModelConfig && (
                      <span className="pill">Model: {selectedModelConfig.label}</span>
                    )}
                    {productImageFile && (
                      <span className="pill pill-light">✓ Image</span>
                    )}
                  </div>
                </div>

              </div>

              {error && <p className="error">{error}</p>}
              {successMessage && <p className="success">{successMessage}</p>}

            </div>
          )}

          {activeNav === "gallery" && (
            <div className="page-body">
              <GalleryPage email={currentUser.email} />
            </div>
          )}

          {activeNav === "products" && (
            <div className="page-body">
              <ProductsPage email={currentUser.email} />
            </div>
          )}

          {STUB_PAGES[activeNav] && (
            <div className="page-body">
              <StubPage title={STUB_PAGES[activeNav].title} description={STUB_PAGES[activeNav].description} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;