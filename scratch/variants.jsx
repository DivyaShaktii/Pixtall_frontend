<style data-impeccable-css="221b9eeb">{`
  @scope ([data-impeccable-variant="1"]) {
    :scope > .compact-bar {
      padding: var(--p-padding, 12px) 24px;
      border-radius: calc(var(--p-radius, 100) * 1px);
    }
  }
  @scope ([data-impeccable-variant="2"]) {
    :scope > .split-container {
      gap: calc(var(--p-split, 16) * 1px);
    }
    :scope[data-p-accent="true"] .gen-btn {
      background-color: var(--accent);
      color: white;
    }
    :scope[data-p-accent="false"] .gen-btn {
      background-color: white;
      color: black;
    }
  }
  @scope ([data-impeccable-variant="3"]) {
    :scope > .glow-bar {
      box-shadow: 0 0 calc(var(--p-glow, 20) * 1px) rgba(255, 77, 46, calc(var(--p-glow, 20) / 100));
      border-color: rgba(255, 77, 46, calc(var(--p-glow, 20) / 50));
    }
  }
`}</style>
<div data-impeccable-variant="1" data-impeccable-params='[
  {"id":"padding","kind":"range","min":8,"max":24,"step":4,"default":12,"label":"Padding"},
  {"id":"radius","kind":"range","min":12,"max":100,"step":4,"default":100,"label":"Rounding"}
]'>
  <div className="compact-bar fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0F0F10] backdrop-blur-xl flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-start shadow-[0_12px_48px_rgba(0,0,0,0.5)] z-50 gap-3 border border-white/5 w-[92vw] lg:w-max max-w-7xl overflow-x-auto no-scrollbar">
    <Select value={productCategory} onChange={e => handleCategoryChange(e.target.value)} className="bg-transparent border-transparent hover:bg-white/5 text-white h-10 rounded-full px-4 text-sm font-medium">
      <option value="" className="text-ink">Category</option>
      {generationConfig.productCategories.map(c => <option key={c.value} value={c.value} className="text-ink">{c.label}</option>)}
    </Select>
    <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
    <Select value={productSubcategory} onChange={e => setProductSubcategory(e.target.value)} disabled={!productCategory} className="bg-transparent border-transparent hover:bg-white/5 text-white h-10 rounded-full px-4 text-sm font-medium disabled:opacity-50">
      <option value="" className="text-ink">Subcategory</option>
      {selectedCategorySubcategories.map(s => <option key={s.value} value={s.value} className="text-ink">{s.label}</option>)}
    </Select>
    <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
    <Select value={scene} onChange={e => setScene(e.target.value)} className="bg-transparent border-transparent hover:bg-white/5 text-white h-10 rounded-full px-4 text-sm font-medium">
      <option value="" className="text-ink">Scene</option>
      {generationConfig.scenes.map(s => <option key={s.value} value={s.value} className="text-ink">{s.label}</option>)}
    </Select>
    <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
    <div className="w-24"><HoverSelect value={size} onChange={setSize} options={generationConfig.sizes} placeholder="Size" onOptionHover={setPreviewSize} /></div>
    <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
    <div className="flex items-center gap-1 bg-[#1C1C1E] rounded-full p-1 border border-white/5">
      {[1, 2, 3, 4].map(n => (
        <button key={n} onClick={() => setNumImages(n)} className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-all ${numImages === n ? "bg-white text-black" : "text-slate-300 hover:text-white"}`}>{n}</button>
      ))}
    </div>
    <Button variant="primary" className="ml-2 rounded-full px-8 h-10 bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-all gap-2" onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Faders size={18} weight="bold" /></motion.div> : <Sparkle size={18} weight="fill" />}
      {isGenerating ? "Rendering..." : "Generate"}
    </Button>
  </div>
</div>

<div data-impeccable-variant="2" style={{ display: 'none' }} data-impeccable-params='[
  {"id":"split","kind":"range","min":8,"max":48,"step":8,"default":16,"label":"Split Gap"},
  {"id":"accent","kind":"toggle","default":true,"label":"Accent Button"}
]'>
  <div className="split-container fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center z-50 w-[92vw] lg:w-max max-w-7xl justify-center">
    <div className="bg-[#0F0F10] backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center shadow-[0_12px_48px_rgba(0,0,0,0.5)] border border-white/5 gap-4 overflow-x-auto no-scrollbar">
      <div className="flex flex-col gap-1 min-w-[120px]">
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
        <Select value={productCategory} onChange={e => handleCategoryChange(e.target.value)} className="bg-[#1C1C1E] border-transparent text-white h-9 text-sm rounded-lg"><option value="" className="text-ink">Select</option>{generationConfig.productCategories.map(c => <option key={c.value} value={c.value} className="text-ink">{c.label}</option>)}</Select>
      </div>
      <div className="flex flex-col gap-1 min-w-[120px]">
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Details</label>
        <Select value={productSubcategory} onChange={e => setProductSubcategory(e.target.value)} disabled={!productCategory} className="bg-[#1C1C1E] border-transparent text-white h-9 text-sm rounded-lg disabled:opacity-50"><option value="" className="text-ink">Select</option>{selectedCategorySubcategories.map(s => <option key={s.value} value={s.value} className="text-ink">{s.label}</option>)}</Select>
      </div>
      <div className="flex flex-col gap-1 min-w-[100px]">
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Scene</label>
        <Select value={scene} onChange={e => setScene(e.target.value)} className="bg-[#1C1C1E] border-transparent text-white h-9 text-sm rounded-lg"><option value="" className="text-ink">Select</option>{generationConfig.scenes.map(s => <option key={s.value} value={s.value} className="text-ink">{s.label}</option>)}</Select>
      </div>
      <div className="flex flex-col gap-1 min-w-[90px]">
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Size</label>
        <HoverSelect value={size} onChange={setSize} options={generationConfig.sizes} placeholder="Size" onOptionHover={setPreviewSize} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Count</label>
        <div className="flex items-center gap-1 bg-[#1C1C1E] rounded-lg p-0.5 border border-white/5">
          {[1, 2, 3, 4].map(n => <button key={n} onClick={() => setNumImages(n)} className={`w-8 h-8 rounded-md text-sm font-semibold transition-all ${numImages === n ? "bg-white text-black shadow-sm" : "text-slate-400 hover:text-white"}`}>{n}</button>)}
        </div>
      </div>
    </div>
    <Button variant="primary" className="gen-btn rounded-2xl px-8 h-[74px] shadow-[0_12px_48px_rgba(0,0,0,0.5)] border-0 font-semibold text-base transition-all gap-2" onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Faders size={20} weight="bold" /></motion.div> : <Sparkle size={20} weight="fill" />}
      {isGenerating ? "Rendering" : "Generate"}
    </Button>
  </div>
</div>

<div data-impeccable-variant="3" style={{ display: 'none' }} data-impeccable-params='[
  {"id":"glow","kind":"range","min":0,"max":60,"step":10,"default":20,"label":"Accent Glow"}
]'>
  <div className="glow-bar fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0F0F10]/90 backdrop-blur-2xl rounded-xl px-4 py-3 flex items-center shadow-[0_12px_48px_rgba(0,0,0,0.5)] border z-50 gap-4 w-[92vw] lg:w-max max-w-7xl justify-center overflow-x-auto no-scrollbar transition-all duration-500">
    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
      <Select value={productCategory} onChange={e => handleCategoryChange(e.target.value)} className="bg-transparent border-transparent text-white h-9 hover:bg-white/10 rounded-md text-sm"><option value="" className="text-ink">Category</option>{generationConfig.productCategories.map(c => <option key={c.value} value={c.value} className="text-ink">{c.label}</option>)}</Select>
      <Select value={productSubcategory} onChange={e => setProductSubcategory(e.target.value)} disabled={!productCategory} className="bg-transparent border-transparent text-white h-9 hover:bg-white/10 rounded-md text-sm disabled:opacity-50"><option value="" className="text-ink">Subcategory</option>{selectedCategorySubcategories.map(s => <option key={s.value} value={s.value} className="text-ink">{s.label}</option>)}</Select>
      <Select value={scene} onChange={e => setScene(e.target.value)} className="bg-transparent border-transparent text-white h-9 hover:bg-white/10 rounded-md text-sm"><option value="" className="text-ink">Scene</option>{generationConfig.scenes.map(s => <option key={s.value} value={s.value} className="text-ink">{s.label}</option>)}</Select>
    </div>
    <div className="w-px h-8 bg-white/10" />
    <div className="w-[100px]"><HoverSelect value={size} onChange={setSize} options={generationConfig.sizes} placeholder="Size" onOptionHover={setPreviewSize} /></div>
    <div className="w-px h-8 bg-white/10" />
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
      {[1, 2, 3, 4].map(n => <button key={n} onClick={() => setNumImages(n)} className={`w-8 h-8 rounded-md text-sm font-semibold transition-all ${numImages === n ? "bg-white text-black" : "text-white/50 hover:text-white hover:bg-white/10"}`}>{n}</button>)}
    </div>
    <div className="w-px h-8 bg-white/10" />
    <Button variant="primary" className="rounded-lg px-8 h-[42px] bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-all gap-2" onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Faders size={18} weight="bold" /></motion.div> : <Sparkle size={18} weight="fill" />}
      {isGenerating ? "Rendering..." : "Generate"}
    </Button>
  </div>
</div>
