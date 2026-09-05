import { useCallback, useEffect, useMemo, useState } from "react";
import AuthPage from "./components/AuthPage";
import GalleryPage from "./components/GalleryPage";
import ProductsPage from "./components/ProductsPage";
import Sidebar from "./components/Sidebar";
import StudioView from "./views/StudioView";
import MarketingPage from "./components/MarketingPage";
import SettingsPage from "./views/SettingsPage";
import BillingPage from "./views/BillingPage";
import AmbientBackground from "./components/AmbientBackground";
import TermsPage from "./views/legal/TermsPage";
import { SYSTEM_API_BASE_URL } from "./utils/apiConfig";
import { authenticatedFetch, jsonOrError } from "./lib/api";
import { readCheckoutIntent, saveCheckoutIntent } from "./lib/checkoutIntent";
import { clearAuthSession, readAuthSession } from "./lib/auth";

const checkoutFromLocation = () => {
  const fromQuery = new URLSearchParams(window.location.search).get("checkout");
  return fromQuery || readCheckoutIntent()?.planCode || "";
};

const App = () => {
  const path = window.location.pathname;
  const isStudioPath = path === "/studio" || path === "/studio/";
  const initialCheckoutPlan = useMemo(checkoutFromLocation, []);
  const storedSession = useMemo(readAuthSession, []);
  const [currentUser, setCurrentUser] = useState(storedSession?.user || null);
  const [authLoading, setAuthLoading] = useState(Boolean(storedSession));
  const [authError, setAuthError] = useState("");
  const [activeNav, setActiveNav] = useState(initialCheckoutPlan ? "billing" : "studio");
  const [showAuth, setShowAuth] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [walletError, setWalletError] = useState("");

  const bootstrapSession = useCallback(async session => {
    if (!session) {
      setCurrentUser(null);
      return;
    }
    setCurrentUser(session.user);
    try {
      await jsonOrError(await authenticatedFetch(`${SYSTEM_API_BASE_URL}/v1/account/bootstrap`, {
        method: "POST",
      }));
      setAuthError("");
    } catch (error) {
      setAuthError(error.message || "Could not prepare your account.");
    }
  }, []);

  useEffect(() => {
    if (!storedSession) {
      setAuthLoading(false);
      return undefined;
    }
    let mounted = true;
    bootstrapSession(storedSession)
      .catch(error => {
        if (mounted) setAuthError(error.message || "Could not restore your session.");
      })
      .finally(() => {
        if (mounted) setAuthLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [bootstrapSession, storedSession]);

  const refreshWallet = useCallback(async () => {
    if (!currentUser || !isStudioPath) return;
    try {
      const response = await authenticatedFetch(`${SYSTEM_API_BASE_URL}/v1/wallet`);
      setWallet(await jsonOrError(response));
      setWalletError("");
    } catch (error) {
      console.error("Could not load wallet", error);
      setWalletError("Credits unavailable");
    }
  }, [currentUser, isStudioPath]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const enterStudio = planCode => {
    const selectedPlan = typeof planCode === "string" ? planCode : "";
    if (selectedPlan) saveCheckoutIntent(selectedPlan);
    if (currentUser) {
      const query = selectedPlan ? `?checkout=${encodeURIComponent(selectedPlan)}` : "";
      window.location.href = `/studio${query}`;
      return;
    }
    setShowAuth(true);
  };

  const handleAuthSuccess = async session => {
    await bootstrapSession(session);
    const intent = readCheckoutIntent();
    const query = intent?.planCode ? `?checkout=${encodeURIComponent(intent.planCode)}` : "";
    window.location.href = `/studio${query}`;
  };

  const handleLogout = async () => {
    clearAuthSession();
    window.location.href = "/";
  };

  if (path === "/terms" || path === "/legal/terms") {
    return <TermsPage onStart={() => { window.location.href = "/"; }} />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center">
        <p className="text-sm text-slate">Restoring your secure session…</p>
      </div>
    );
  }

  if (!isStudioPath) {
    if (showAuth) {
      return <AuthPage onAuthSuccess={handleAuthSuccess} onBack={() => setShowAuth(false)} />;
    }
    return <MarketingPage onStart={enterStudio} />;
  }

  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} onBack={() => { window.location.href = "/"; }} />;
  }

  return (
    <div className="flex h-screen w-full bg-cloud font-sans text-ink overflow-hidden selection:bg-accent/20 flex-col">
      <header className="h-16 flex items-center justify-between px-6 bg-paper border-b border-line shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent text-paper flex items-center justify-center font-bold text-sm tracking-tighter">
            PS
          </div>
          <span className="font-semibold text-lg tracking-tight">Pixtall AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate">
            Hi, {currentUser.name?.split(" ")[0] || currentUser.email.split("@")[0] || "User"}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium text-slate hover:text-ink px-3 py-1.5 rounded-md hover:bg-cloud"
          >
            Log out
          </button>
        </div>
      </header>

      {authError && (
        <div role="alert" className="bg-red-950 text-red-200 border-b border-red-900 px-6 py-2 text-sm">
          {authError}
        </div>
      )}

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
          {activeNav === "gallery" && <div className="p-4 lg:p-8 w-full h-full"><GalleryPage /></div>}
          {activeNav === "products" && <div className="p-4 lg:p-8 w-full h-full"><ProductsPage /></div>}
          {activeNav === "settings" && <div className="p-4 lg:p-8 w-full h-full"><SettingsPage /></div>}
          {activeNav === "billing" && (
            <div className="p-4 lg:p-8 w-full h-full">
              <BillingPage
                initialPlanCode={initialCheckoutPlan}
                onWalletChange={refreshWallet}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
