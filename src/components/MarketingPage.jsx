const MARKETPLACES = ["Amazon", "Etsy", "Shopify", "eBay", "TikTok Shop", "WooCommerce"];

const steps = [
  {
    num: "01",
    title: "Upload your product photo",
    body: "Drop in any clean JPG, PNG or WEBP — even a basic photo works as the starting point."
  },
  {
    num: "02",
    title: "Configure the creative",
    body: "Pick category, scene, output size, and optionally a model reference to frame the image."
  },
  {
    num: "03",
    title: "Export the payload",
    body: "Download a structured JSON file ready to feed into your image generation pipeline."
  }
];

const MarketingPage = ({ onStart }) => (
  <div className="page-body marketing-page">

    {/* Hero */}
    <section className="marketing-hero stagger">
      <p className="eyebrow">PixStall AI</p>
      <h1>Turn any product photo into a <em>marketplace-ready</em> creative</h1>
      <p>
        Upload one image, configure the scene and model, then export a ready-to-generate JSON payload — in under a minute.
      </p>
      <div className="hero-cta-row">
        <button type="button" className="generate" onClick={onStart}>
          Open Studio
        </button>
        <button type="button" className="ghost-btn" onClick={onStart}>
          See how it works ↓
        </button>
      </div>

      <div className="marketplace-strip">
        <p>Built for sellers on</p>
        <div className="marketplace-strip-logos">
          {MARKETPLACES.map(name => (
            <span key={name} className="marketplace-badge">{name}</span>
          ))}
        </div>
      </div>
    </section>

    <hr className="section-divider" />

    {/* Steps */}
    <section className="steps-section stagger">
      <header className="steps-section-header">
        <p className="eyebrow">How it works</p>
        <h2>Three steps from photo to export-ready payload</h2>
      </header>
      <div className="steps-row">
        {steps.map(step => (
          <article key={step.num}>
            <div className="step-num">{step.num}</div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>

  </div>
);

export default MarketingPage;