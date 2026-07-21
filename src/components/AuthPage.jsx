import { useState } from "react";
import BeforeAfterSlider from "./BeforeAfterSlider";
import BrandWordmark from "./BrandMark";
import ProcessShowcase from "./ProcessShowcase";

const DEFAULT_PASSWORD = "123456";
const USERS_STORAGE_KEY = "ready2marketplace_users";
const SESSION_STORAGE_KEY = "ready2marketplace_session";

const createUserId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `user-${Date.now()}`;
};

const readUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

const writeUsers = users => localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

const FEATURES = [
  { icon: "01", title: "One photo is all you need", desc: "Upload any clean product image to get started instantly." },
  { icon: "02", title: "Scene & model control", desc: "Choose background, lighting, and an optional model reference." },
  { icon: "03", title: "Export in one click", desc: "Download a structured JSON payload for your AI pipeline." }
];

const MARKETS = ["Amazon", "Etsy", "Shopify", "eBay", "TikTok Shop", "WooCommerce"];

const CATEGORIES = ["Fashion", "Jewelry", "Footwear", "Beauty", "Accessories", "Food"];

const AuthPage = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [error, setError] = useState("");

  const handleSubmit = event => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) { setError("Email is required."); return; }
    if (!password) { setError("Password is required."); return; }

    const users = readUsers();

    if (mode === "signup") {
      if (!name.trim()) { setError("Name is required."); return; }
      if (users.some(u => u.email === normalizedEmail)) {
        setError("An account with this email already exists.");
        return;
      }
      const nextUser = { id: createUserId(), name: name.trim(), email: normalizedEmail, password };
      writeUsers([...users, nextUser]);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
      onAuthSuccess(nextUser);
      return;
    }

    const fallback = {
      id: "default-demo-user",
      name: "Demo User",
      email: "admin@pixstall.ai",
      password: DEFAULT_PASSWORD
    };
    const existing =
      users.find(u => u.email === normalizedEmail) ||
      (normalizedEmail === fallback.email ? fallback : null);

    if (!existing) { setError("Account not found. Sign up to create one."); return; }
    if (existing.password !== password) { setError("Incorrect password."); return; }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(existing));
    onAuthSuccess(existing);
  };

  return (
    <>
    <div className="landing-shell">

      {/* ── Left panel ── */}
      <div className="landing-left">
        <div className="landing-left-inner">

          {/* Brand */}
          <div className="landing-brand">
            <div className="landing-brand-mark">PS</div>
            <BrandWordmark />
          </div>

          {/* Headline */}
          <div className="landing-hero">
            <p className="landing-eyebrow eyebrow">AI product studio</p>
            <h1>One product photo becomes a <em>marketplace-ready</em> listing image</h1>
            <p>PixStall AI composites your raw product shot onto a professional model reference to generate high-converting listing photos for Amazon, Flipkart, Etsy, and more — no studio, no shoot.</p>
          </div>

          {/* Signature before / after — the product's whole thesis in one interaction */}
          <BeforeAfterSlider
            beforeSrc="/examples/raw-product.png"
            afterSrc="/examples/studio-output.png"
            beforeLabel="Raw upload"
            afterLabel="PixStall output"
            beforeAlt="A raw, unedited photo of silver jewellery held in a hand"
            afterAlt="The same jewellery generated on a model in a studio-quality photo"
          />

          {/* Category chips */}
          <div className="landing-cats">
            {CATEGORIES.map(c => (
              <span key={c} className="cat-chip">{c}</span>
            ))}
          </div>

          {/* Features */}
          <ul className="landing-features">
            {FEATURES.map(f => (
              <li key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <div>
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </li>
            ))}
          </ul>

          {/* Marketplace strip */}
          <div className="landing-markets">
            <span className="markets-label">For sellers on</span>
            <div className="markets-row">
              {MARKETS.map(m => (
                <span key={m} className="marketplace-badge">{m}</span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Right panel: auth form ── */}
      <div className="landing-right">

        <div className="auth-logo-cap">
          <div className="auth-logo-mark">PS</div>
          <BrandWordmark />
        </div>

        <div className="auth-card stagger">
          <div className="auth-card-header">
            <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p>Build listing-ready product creatives in minutes.</p>
          </div>

          <div className="auth-tab-row">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Log in
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => { setMode("signup"); setError(""); }}
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label>
                Full name
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Morgan"
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
              />
            </label>

            <p className="auth-hint">Demo account · admin@pixstall.ai · 123456</p>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="generate generate-primary auth-submit-btn">
              {mode === "login" ? "Enter studio →" : "Create account"}
            </button>
          </form>
        </div>

        <p className="auth-footer-note">
          No credit card required · Cancel anytime
        </p>

      </div>

    </div>

    <ProcessShowcase />

    {/* ── About PixStall AI — SEO section ── */}
    <section className="landing-about" id="about" aria-label="About PixStall AI">
      <div className="about-inner">

        <header className="about-header">
          <span className="about-eyebrow">About PixStall AI</span>
          <h2>AI product image generator for Amazon, Flipkart &amp; every major marketplace</h2>
          <p>
            PixStall AI is an intelligent product image generation engine built for ecommerce sellers.
            Upload your product photo and a model reference — our AI creates professional, conversion-ready
            listing images in seconds. No photography studio required.
          </p>
        </header>

        <div className="about-cards">
          <article className="about-card">
            <span className="about-card-icon">◆</span>
            <h3>AI-powered product photography</h3>
            <p>
              Our engine understands product context — clothing, jewelry, beauty products, footwear, and
              accessories — to generate studio-quality images that meet Amazon and Flipkart listing standards
              automatically.
            </p>
          </article>
          <article className="about-card">
            <span className="about-card-icon">◆</span>
            <h3>Real model integration</h3>
            <p>
              Select a male or female model reference image. PixStall AI composites your product onto the
              model to create authentic, human-led marketplace visuals that drive higher click-through
              rates on product listings.
            </p>
          </article>
          <article className="about-card">
            <span className="about-card-icon">◆</span>
            <h3>Marketplace-ready output</h3>
            <p>
              Generate images in the exact aspect ratios required by Amazon India, Flipkart, Meesho, Etsy,
              Shopify, TikTok Shop, and WooCommerce — 1:1, 9:16, 4:5, 3:4, and 16:9 formats supported
              out of the box.
            </p>
          </article>
        </div>

        <div className="about-seo-text">
          <p>
            PixStall AI is the smart product photography solution for Indian and global ecommerce sellers
            looking to scale their marketplace listings without expensive studio shoots. Whether you sell
            fashion, ethnic wear, sneakers, handbags, cosmetics, or packaged food on <strong>Amazon India,
            Flipkart, Meesho, Myntra, Nykaa, Shopify</strong>, or international platforms like <strong>Etsy,
            eBay, and TikTok Shop</strong> — our AI product image generator creates visuals that convert.
            PixStall AI supports all major ecommerce categories including fashion &amp; apparel,
            accessories, beauty &amp; skincare, jewelry, footwear, and food products. Powered by
            advanced generative AI, it replaces traditional product photography workflows and delivers
            marketplace-compliant images in a fraction of the time and cost.
          </p>
        </div>

      </div>
    </section>
    </>
  );
};

export default AuthPage;
export { SESSION_STORAGE_KEY };