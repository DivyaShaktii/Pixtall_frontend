const icon = path => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const ICONS = {
  studio: icon(
    <>
      <path d="M11 3l1.2 2.6L15 7l-2.8 1.4L11 11l-1.2-2.6L7 7l2.8-1.4L11 3z" />
      <path d="M5 12.5l.7 1.5L7.5 15l-1.8.9L5 17.5l-.7-1.6L2.5 15l1.8-1z" />
    </>
  ),
  products: icon(
    <>
      <path d="M10 2.5l6.5 3.4V14L10 17.5 3.5 14V5.9L10 2.5z" />
      <path d="M3.5 5.9L10 9.4l6.5-3.5" />
      <path d="M10 9.4v8.1" />
    </>
  ),
  gallery: icon(
    <>
      <rect x="3" y="3" width="11" height="11" rx="1.6" />
      <path d="M6.7 17.5h8.8a1.6 1.6 0 0 0 1.6-1.6V6.7" />
    </>
  ),
  billing: icon(
    <>
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.6" />
      <path d="M2.5 8.3h15" />
    </>
  ),
  settings: icon(
    <>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 3v2.1M10 14.9V17M17 10h-2.1M5.1 10H3M14.7 5.3l-1.5 1.5M6.8 13.2l-1.5 1.5M14.7 14.7l-1.5-1.5M6.8 6.8L5.3 5.3" />
    </>
  )
};

const NAV_ITEMS = [
  { id: "studio", label: "Studio", icon: ICONS.studio },
  { id: "products", label: "My Products", icon: ICONS.products },
  { id: "gallery", label: "Gallery", icon: ICONS.gallery },
  { id: "billing", label: "Billing", icon: ICONS.billing },
  { id: "settings", label: "Settings", icon: ICONS.settings }
];

const Sidebar = ({ active, onNavigate, creditsUsed, creditsTotal }) => {
  const remaining = Math.max(creditsTotal - creditsUsed, 0);
  const percentUsed = creditsTotal > 0 ? Math.round((creditsUsed / creditsTotal) * 100) : 100;

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            type="button"
            key={item.id}
            className={`sidebar-nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
            aria-current={active === item.id ? "page" : undefined}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-credits">
        <div className="sidebar-credits-row">
          <span>Credits</span>
          <strong className={remaining === 0 ? "is-empty" : ""}>
            {remaining > 0 ? `${remaining} left` : "None left"}
          </strong>
        </div>
        <div className="sidebar-credits-track">
          <span style={{ width: `${percentUsed}%` }} className={remaining === 0 ? "is-empty" : ""} />
        </div>
        <button type="button" className="sidebar-credits-btn">Get more credits</button>
      </div>
    </aside>
  );
};

export default Sidebar;