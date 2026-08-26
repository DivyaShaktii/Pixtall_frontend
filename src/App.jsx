import { useState } from "react";
import AuthPage, { DEMO_EMAIL, SESSION_STORAGE_KEY } from "./components/AuthPage";
import GalleryPage from "./components/GalleryPage";
import ProductsPage from "./components/ProductsPage";
import Sidebar from "./components/Sidebar";
import StubPage from "./components/StubPage";
import StudioView from "./views/StudioView";
import MarketingPage from "./components/MarketingPage";
import SettingsPage from "./views/SettingsPage";
import BillingPage from "./views/BillingPage";
import AmbientBackground from "./components/AmbientBackground";
import TermsPage from "./views/legal/TermsPage";

const App = () => {
  const path = window.location.pathname;
  if (path === '/terms' || path === '/legal/terms') {
    return <TermsPage onStart={() => { window.location.href = '/'; }} />;
  }

  const [currentUser, setCurrentUser] = useState(null);

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
          <span className="font-semibold text-lg tracking-tight">Pixtall AI Pro</span>
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

      <div className="flex flex-col-reverse lg:flex-row flex-1 overflow-hidden">
        <Sidebar
          active={activeNav}
          onNavigate={setActiveNav}
          currentUser={currentUser}
          creditsUsed={4}
          creditsTotal={10}
        />

        <main className={`flex-1 relative overflow-x-hidden scroll-smooth ${activeNav === "studio" ? "overflow-y-auto lg:overflow-hidden bg-black" : "overflow-y-auto"}`}>
          {activeNav !== "studio" && <AmbientBackground variant="light" />}
          {activeNav === "studio" && <StudioView email={currentUser.email} />}
          {activeNav === "gallery" && (
            <div className="p-4 lg:p-8 w-full h-full">
              <GalleryPage email={currentUser.email} />
            </div>
          )}
          {activeNav === "products" && (
            <div className="p-4 lg:p-8 w-full h-full">
              <ProductsPage email={currentUser.email} />
            </div>
          )}
          {activeNav === "settings" && (
            <div className="p-4 lg:p-8 w-full h-full">
              <SettingsPage />
            </div>
          )}
          {activeNav === "billing" && (
            <div className="p-4 lg:p-8 w-full h-full">
              <BillingPage />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
