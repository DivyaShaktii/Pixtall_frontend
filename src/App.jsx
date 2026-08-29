import { useCallback, useEffect, useState } from "react";
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
import { SYSTEM_API_BASE_URL } from "./utils/apiConfig";

const readStoredSession = () => {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "null");
    return session && typeof session.email === "string" ? session : null;
  } catch {
    return null;
  }
};

const App = () => {
  const path = window.location.pathname;
  if (path === '/terms' || path === '/legal/terms') {
    return <TermsPage onStart={() => { window.location.href = '/'; }} />;
  }

  const [currentUser, setCurrentUser] = useState(readStoredSession);

  const [activeNav, setActiveNav] = useState("studio");
  const [showAuth, setShowAuth] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [walletError, setWalletError] = useState("");

  const refreshWallet = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${SYSTEM_API_BASE_URL}/v1/wallet`);
      if (!response.ok) throw new Error(`Wallet request returned ${response.status}`);
      setWallet(await response.json());
      setWalletError("");
    } catch (error) {
      console.error("Could not load wallet", error);
      setWalletError("Credits unavailable");
    }
  }, [currentUser]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const handleLogout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setCurrentUser(null);
    setWallet(null);
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
          wallet={wallet}
          walletError={walletError}
        />

        <main className={`flex-1 relative overflow-x-hidden scroll-smooth ${activeNav === "studio" ? "overflow-y-auto lg:overflow-hidden bg-black" : "overflow-y-auto"}`}>
          {activeNav !== "studio" && <AmbientBackground variant="light" />}
          {activeNav === "studio" && <StudioView onWalletChange={refreshWallet} />}
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
