import { useState } from "react";
import AuthPage, { SESSION_STORAGE_KEY } from "./components/AuthPage";
import GalleryPage from "./components/GalleryPage";
import ProductsPage from "./components/ProductsPage";
import Sidebar from "./components/Sidebar";
import StubPage from "./components/StubPage";
import StudioView from "./views/StudioView";
import MarketingPage from "./components/MarketingPage";
import SettingsPage from "./views/SettingsPage";
import BillingPage from "./views/BillingPage";
import AmbientBackground from "./components/AmbientBackground";

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
      return sessionRaw ? JSON.parse(sessionRaw) : null;
    } catch {
      return null;
    }
  });

  const [activeNav, setActiveNav] = useState("studio");
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setCurrentUser(null);
    setShowAuth(false);
  };

  if (!currentUser) {
    if (showAuth) return <AuthPage onAuthSuccess={setCurrentUser} onBack={() => setShowAuth(false)} />;
    return <MarketingPage onStart={() => setShowAuth(true)} />;
  }

  return (
    <div className="flex h-screen w-full bg-cloud font-sans text-ink overflow-hidden selection:bg-accent/20 flex-col">
      {/* Top Bar */}
      <header className="h-16 flex items-center justify-between px-6 bg-paper border-b border-line shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-accent text-paper flex items-center justify-center font-bold text-sm tracking-tighter">
            PS
          </div>
          <span className="font-semibold text-lg tracking-tight">PixStall AI Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate">
            Hi, {currentUser.name?.split(" ")[0] || currentUser.email.split("@")[0] || "User"}
          </span>
          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-slate hover:text-ink transition-colors px-3 py-1.5 rounded-md hover:bg-cloud"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          active={activeNav}
          onNavigate={setActiveNav}
          currentUser={currentUser}
          creditsUsed={4}
          creditsTotal={10}
        />

        <main className="flex-1 relative overflow-y-auto overflow-x-hidden scroll-smooth">
          <AmbientBackground variant="light" />
          {activeNav === "studio" && <StudioView />}
          {activeNav === "gallery" && (
            <div className="p-8 max-w-6xl mx-auto w-full">
              <GalleryPage email={currentUser.email} />
            </div>
          )}
          {activeNav === "products" && (
            <div className="p-8 max-w-6xl mx-auto w-full">
              <ProductsPage email={currentUser.email} />
            </div>
          )}
          {activeNav === "settings" && (
            <div className="p-8 max-w-6xl mx-auto w-full">
              <SettingsPage />
            </div>
          )}
          {activeNav === "billing" && (
            <div className="p-8 max-w-6xl mx-auto w-full">
              <BillingPage />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;