const STEPS = [
  {
    n: "01",
    title: "Upload your product photo",
    body: "Any clean shot works — jewelry, apparel, bags, beauty, food. Straight off a phone is fine.",
    img: "/examples/raw-product.png",
    alt: "Raw, unedited photo of silver jewellery held in a hand",
    caption: "Raw upload"
  },
  {
    n: "02",
    title: "Set the context",
    body: "Pick a category, a scene, and an aspect ratio. Choose one of several preset models — or upload a photo of your own.",
    img: "/examples/model-reference.png",
    alt: "Selected model reference photo, one of several preset options",
    caption: "Jewelry · outdoor · 4:5",
    pickerMock: true
  },
  {
    n: "03",
    title: "PixStall composites the shot",
    body: "The engine places your product on the model, matching light, angle, and perspective.",
    img: "/examples/model-reference.png",
    alt: "Model reference photo mid-composite with the product",
    caption: "Composing…",
    processing: true
  },
  {
    n: "04",
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

/**
 * The front-page process explainer. Every frame uses the same square,
 * contained (never cropped) treatment, so a portrait product photo, a
 * landscape model photo, and a landscape output photo all sit at equal
 * visual weight — a numbered rail ties the four steps together instead
 * of arrows wedged between mismatched cards.
 */
const ProcessShowcase = () => (
  <section className="process-section" aria-label="How PixStall AI works">
    <div className="process-inner">

      <header className="process-header">
        <p className="eyebrow">How it works</p>
        <h2>From one product photo to a marketplace-ready listing</h2>
        <p>Four steps. No studio, no shoot, no photographer to schedule.</p>
      </header>

      <div className="process-rail" aria-hidden="true">
        {STEPS.map(step => (
          <span key={step.n} className={`process-rail-node ${step.final ? "is-final" : ""}`}>
            {step.n}
          </span>
        ))}
      </div>

      <div className="process-grid">
        {STEPS.map(step => (
          <article className="process-card" key={step.n}>
            <span className={`process-card-num ${step.final ? "is-final" : ""}`}>{step.n}</span>

            <div className={`process-frame ${step.processing ? "is-processing" : ""} ${step.final ? "is-final" : ""}`}>
              {step.pickerMock ? (
                <div className="model-picker-mock">
                  <div className="model-picker-thumb">
                    <img src="/examples/model-option-a.png" alt="Alternative preset model photo, outdoors in a green saree" />
                  </div>
                  <div className="model-picker-thumb model-picker-selected">
                    <img src={step.img} alt={step.alt} />
                    <span className="model-picker-check" aria-hidden="true">✓</span>
                  </div>
                  <div className="model-picker-thumb">
                    <img src="/examples/model-option-b.png" alt="Alternative preset model photo, studio portrait" />
                  </div>
                  <div className="model-picker-thumb model-picker-upload">
                    <span aria-hidden="true">+</span>
                    <small>Upload your own</small>
                  </div>
                </div>
              ) : (
                <img src={step.img} alt={step.alt} />
              )}

              <span className="vf-corners" aria-hidden="true"><span /><span /><span /><span /></span>
            </div>

            <p className="process-caption">{step.caption}</p>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>

      <div className="process-benefits">
        {BENEFITS.map(b => (
          <div className="process-benefit" key={b.title}>
            <span className="process-benefit-icon">◆</span>
            <div>
              <strong>{b.title}</strong>
              <span>{b.body}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  </section>
);

export default ProcessShowcase;