<style data-impeccable-css="9da82766">{`
  @scope ([data-impeccable-variant="1"]) {
    :scope > .dock-container {
      gap: calc(var(--p-dock-gap, 16) * 1px);
    }
    :scope > .dock-container > div {
      background-color: rgba(15, 15, 16, 0.9);
      backdrop-filter: blur(24px);
      box-shadow: 0 12px 48px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.1);
    }
  }
  @scope ([data-impeccable-variant="2"]) {
    :scope > .mono-bar {
      background-color: rgba(15, 15, 16, calc(var(--p-glass-opacity, 80) / 100));
      backdrop-filter: blur(32px);
    }
  }
  @scope ([data-impeccable-variant="3"]) {
    :scope > .vertical-panel {
      width: calc(var(--p-panel-width, 320) * 1px);
    }
  }
`}</style>

<div data-impeccable-variant="1" data-impeccable-params='[
  {"id":"dock-gap","kind":"range","min":4,"max":32,"step":4,"default":16,"label":"Dock Gap"}
]'>
  <div className="dock-container fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center z-50 w-max max-w-7xl justify-center overflow-x-auto no-scrollbar transition-all duration-500">
    <div className="flex items-center gap-2 p-1.5 rounded-2xl h-14">
      <Select value={productCategory} onChange={e => handleCategoryChange(e.target.value)} className="bg-transparent border-transparent text-white h-full hover:bg-white/10 rounded-xl px-3 text-sm font-medium"><option value="" className="text-ink">Category</option>{generationConfig.productCategories.map(c => <option key={c.value} value={c.value} className="text-ink">{c.label}</option>)}</Select>
      <Select value={productSubcategory} onChange={e => setProductSubcategory(e.target.value)} disabled={!productCategory} className="bg-transparent border-transparent text-white h-full hover:bg-white/10 rounded-xl px-3 text-sm font-medium disabled:opacity-50"><option value="" className="text-ink">Subcategory</option>{selectedCategorySubcategories.map(s => <option key={s.value} value={s.value} className="text-ink">{s.label}</option>)}</Select>
      <Select value={scene} onChange={e => setScene(e.target.value)} className="bg-transparent border-transparent text-white h-full hover:bg-white/10 rounded-xl px-3 text-sm font-medium"><option value="" className="text-ink">Scene</option>{generationConfig.scenes.map(s => <option key={s.value} value={s.value} className="text-ink">{s.label}</option>)}</Select>
    </div>
    
    <div className="flex items-center p-1.5 rounded-2xl h-14 w-[120px]">
      <HoverSelect value={size} onChange={setSize} options={generationConfig.sizes} placeholder="Size" onOptionHover={setPreviewSize} />
    </div>

    <div className="flex items-center gap-1 p-1.5 rounded-2xl h-14">
      {[1, 2, 3, 4].map(n => <button key={n} onClick={() => setNumImages(n)} className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${numImages === n ? "bg-white text-black" : "text-slate-400 hover:text-white hover:bg-white/10"}`}>{n}</button>)}
    </div>

    <div className="flex items-center p-1.5 rounded-2xl h-14 border-[#ff4d2e]/40 shadow-[0_0_20px_rgba(255,77,46,0.2)]">
      <Button variant="primary" className="rounded-xl px-8 h-full bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-all gap-2 w-full" onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Faders size={18} weight="bold" /></motion.div> : <Sparkle size={18} weight="fill" />}
        {isGenerating ? "Rendering" : "Generate"}
      </Button>
    </div>
  </div>
</div>

<div data-impeccable-variant="2" style={{ display: 'none' }} data-impeccable-params='[
  {"id":"glass-opacity","kind":"range","min":40,"max":100,"step":10,"default":80,"label":"Opacity"}
]'>
  <div className="mono-bar fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 flex items-center shadow-[0_12px_48px_rgba(0,0,0,0.5)] border border-white/5 z-50 gap-2 w-max max-w-7xl justify-center overflow-x-auto no-scrollbar transition-all duration-500 text-slate-300">
    <Select value={productCategory} onChange={e => handleCategoryChange(e.target.value)} className="bg-transparent border-transparent text-current h-10 hover:text-white hover:bg-white/5 rounded-full px-4 text-sm font-medium"><option value="" className="text-ink">Category</option>{generationConfig.productCategories.map(c => <option key={c.value} value={c.value} className="text-ink">{c.label}</option>)}</Select>
    <Select value={productSubcategory} onChange={e => setProductSubcategory(e.target.value)} disabled={!productCategory} className="bg-transparent border-transparent text-current h-10 hover:text-white hover:bg-white/5 rounded-full px-4 text-sm font-medium disabled:opacity-50"><option value="" className="text-ink">Subcategory</option>{selectedCategorySubcategories.map(s => <option key={s.value} value={s.value} className="text-ink">{s.label}</option>)}</Select>
    <Select value={scene} onChange={e => setScene(e.target.value)} className="bg-transparent border-transparent text-current h-10 hover:text-white hover:bg-white/5 rounded-full px-4 text-sm font-medium"><option value="" className="text-ink">Scene</option>{generationConfig.scenes.map(s => <option key={s.value} value={s.value} className="text-ink">{s.label}</option>)}</Select>
    <div className="w-[100px] opacity-80 hover:opacity-100 transition-opacity"><HoverSelect value={size} onChange={setSize} options={generationConfig.sizes} placeholder="Size" onOptionHover={setPreviewSize} /></div>
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map(n => <button key={n} onClick={() => setNumImages(n)} className={`w-8 h-8 rounded-full text-sm font-semibold transition-all ${numImages === n ? "bg-white text-black" : "hover:text-white hover:bg-white/10"}`}>{n}</button>)}
    </div>
    <Button variant="primary" className="ml-2 rounded-full px-8 h-10 bg-accent text-white hover:bg-accent/90 font-semibold text-sm transition-all gap-2 border-0 shadow-[0_0_15px_rgba(255,77,46,0.3)]" onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Faders size={18} weight="bold" /></motion.div> : <Sparkle size={18} weight="fill" />}
      {isGenerating ? "Rendering" : "Generate"}
    </Button>
  </div>
</div>

<div data-impeccable-variant="3" style={{ display: 'none' }} data-impeccable-params='[
  {"id":"panel-width","kind":"range","min":280,"max":400,"step":20,"default":320,"label":"Panel Width"}
]'>
  <div className="vertical-panel fixed bottom-6 left-6 bg-[#0F0F10]/95 backdrop-blur-3xl rounded-3xl p-6 flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.6)] border border-white/10 z-50 gap-5 transition-all duration-500">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-white font-display font-semibold tracking-tight text-lg">Studio Setup</h3>
      <div className="flex items-center gap-1 bg-[#1C1C1E] rounded-full p-1 border border-white/5">
        {[1, 2, 3, 4].map(n => <button key={n} onClick={() => setNumImages(n)} className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${numImages === n ? "bg-white text-black" : "text-slate-400 hover:text-white"}`}>{n}</button>)}
      </div>
    </div>
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Subject</label>
        <div className="grid grid-cols-2 gap-2">
          <Select value={productCategory} onChange={e => handleCategoryChange(e.target.value)} className="bg-[#1C1C1E] border-transparent text-white h-11 rounded-xl text-sm"><option value="" className="text-ink">Category</option>{generationConfig.productCategories.map(c => <option key={c.value} value={c.value} className="text-ink">{c.label}</option>)}</Select>
          <Select value={productSubcategory} onChange={e => setProductSubcategory(e.target.value)} disabled={!productCategory} className="bg-[#1C1C1E] border-transparent text-white h-11 rounded-xl text-sm disabled:opacity-50"><option value="" className="text-ink">Subcategory</option>{selectedCategorySubcategories.map(s => <option key={s.value} value={s.value} className="text-ink">{s.label}</option>)}</Select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Environment</label>
        <Select value={scene} onChange={e => setScene(e.target.value)} className="bg-[#1C1C1E] border-transparent text-white h-11 rounded-xl text-sm w-full"><option value="" className="text-ink">Select Scene</option>{generationConfig.scenes.map(s => <option key={s.value} value={s.value} className="text-ink">{s.label}</option>)}</Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Dimensions</label>
        <div className="h-11"><HoverSelect value={size} onChange={setSize} options={generationConfig.sizes} placeholder="Size" onOptionHover={setPreviewSize} /></div>
      </div>
    </div>
    <div className="pt-2">
      <Button variant="primary" className="rounded-xl px-8 h-12 w-full bg-accent hover:bg-accent/90 text-white font-bold text-base transition-all gap-2 shadow-[0_0_24px_rgba(255,77,46,0.3)]" onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Faders size={20} weight="bold" /></motion.div> : <Sparkle size={20} weight="fill" />}
        {isGenerating ? "Rendering Magic..." : "Generate Images"}
      </Button>
    </div>
  </div>
</div>
