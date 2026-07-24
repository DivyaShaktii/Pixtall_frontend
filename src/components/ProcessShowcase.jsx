/**
 * Process explainer section — shows the 4-step flow from upload to export.
 * Stripped of numbered "01/02/03" scaffolding and "eyebrow" labels.
 * Uses a clean card grid with step titles and descriptions instead.
 */
const STEPS = [
  {
    title: "Upload your product photo",
    body: "Any clean shot works — jewelry, apparel, bags, beauty, food. Straight off a phone is fine.",
    img: "/examples/raw-product.png",
    alt: "Raw, unedited photo of silver jewellery held in a hand",
    caption: "Raw upload"
  },
  {
    title: "Set the context",
    body: "Pick a category, a scene, and an aspect ratio. Choose one of several preset models — or upload a photo of your own.",
    img: "/examples/model-reference.png",
    alt: "Selected model reference photo, one of several preset options",
    caption: "Jewelry · outdoor · 4:5",
    pickerMock: true
  },
  {
    title: "Pixtall composites the shot",
    body: "The engine places your product on the model, matching light, angle, and perspective.",
    img: "/examples/model-reference.png",
    alt: "Model reference photo mid-composite with the product",
    caption: "Composing…",
    processing: true
  },
  {
    title: "Export, ready to list",
    body: "Download a listing photo sized for Amazon, Flipkart, Etsy, and more.",
    img: "/examples/studio-output.png",
    alt: "Final marketplace-ready product photo on a model",
    caption: "Marketplace ready",
    final: true
  }
];

const BENEFITS = [
  { title: "Higher conversion", body: "Model-worn photos engage more than a flat product shot." },
  { title: "Time saving", body: "Generate a listing photo in seconds, not a studio day." },
  { title: "Cost effective", body: "No studio, no shoot, no stylist to book." },
  { title: "Marketplace ready", body: "Sized correctly for every platform you sell on." }
];

const ProcessShowcase = () => (
  <section className="max-w-7xl mx-auto px-6 mb-32" aria-label="How Pixtall AI works">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100 mb-4">
        From one product photo to a marketplace-ready listing
      </h2>
      <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
        Four steps. No studio, no shoot, no photographer to schedule.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {STEPS.map((step, index) => (
        <article 
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-accent/30 transition-colors group" 
          key={step.title}
        >
          <div className={`aspect-square relative overflow-hidden bg-zinc-800/50 ${step.processing ? "animate-pulse" : ""}`}>
            {step.pickerMock ? (
              <div className="grid grid-cols-2 gap-1 p-3 h-full">
                <div className="rounded-lg overflow-hidden border border-zinc-700">
                  <img src="/examples/model-option-a.png" alt="Alternative preset model" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-lg overflow-hidden border-2 border-accent relative">
                  <img src={step.img} alt={step.alt} className="w-full h-full object-cover" />
                  <span className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-[10px] text-[#0a0a0a] font-bold">✓</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-zinc-700">
                  <img src="/examples/model-option-b.png" alt="Alternative preset model" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-lg border border-dashed border-zinc-600 flex flex-col items-center justify-center text-zinc-500">
                  <span className="text-lg">+</span>
                  <small className="text-[10px]">Upload your own</small>
                </div>
              </div>
            ) : (
              <img src={step.img} alt={step.alt} className="w-full h-full object-contain p-4" />
            )}
            
            {step.final && (
              <div className="absolute inset-0 ring-2 ring-inset ring-accent/30 rounded-t-2xl pointer-events-none" />
            )}
          </div>

          <div className="p-5">
            <p className="text-xs font-semibold text-accent mb-2 uppercase tracking-wider">{step.caption}</p>
            <h3 className="text-base font-bold text-zinc-100 mb-2">{step.title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{step.body}</p>
          </div>
        </article>
      ))}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {BENEFITS.map(b => (
        <div className="flex items-start gap-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5" key={b.title}>
          <span className="text-accent text-sm mt-0.5 shrink-0">◆</span>
          <div>
            <strong className="text-zinc-200 text-sm block mb-1">{b.title}</strong>
            <span className="text-zinc-500 text-sm">{b.body}</span>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ProcessShowcase;