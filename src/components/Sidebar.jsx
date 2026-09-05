import React from "react";
import { Sparkle, Tag, Images, CreditCard, Gear, CaretUpDown } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { id: "studio", label: "Studio", icon: Sparkle },
  { id: "products", label: "My Products", icon: Tag },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Gear }
];

const Sidebar = ({ active, onNavigate, currentUser, wallet, walletError }) => {
  const remaining = wallet?.available_credits;
  const reserved = wallet?.reserved_credits ?? 0;
  const consumed = wallet?.lifetime_consumed_credits ?? 0;
  const trackedTotal = (remaining ?? 0) + reserved + consumed;
  const percentUsed = trackedTotal > 0 ? Math.round(((reserved + consumed) / trackedTotal) * 100) : 0;
  const workspaceName = currentUser?.workspace || "Personal Workspace";

  return (
    <aside className="w-full lg:w-[220px] bg-cloud border-t lg:border-t-0 lg:border-r border-line flex flex-row lg:flex-col h-[72px] lg:h-full flex-shrink-0 transition-all duration-300 z-20 shadow-[4px_-4px_24px_rgba(0,0,0,0.02)] lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      
      {/* Workspace Selector (Visual Only) */}
      <div className="p-4 shrink-0 hidden lg:block">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-paper hover:shadow-sm transition-all duration-200 border border-transparent hover:border-line group">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent text-white flex items-center justify-center font-bold text-xs">
              {workspaceName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-ink leading-tight truncate max-w-[100px]">{workspaceName}</span>
              <span className="text-[10px] uppercase font-bold text-slate tracking-wider">Secure account</span>
            </div>
          </div>
          <CaretUpDown size={14} className="text-slate group-hover:text-ink transition-colors" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-row lg:flex-col px-2 lg:px-3 py-2 space-x-2 lg:space-x-0 lg:space-y-1.5 overflow-x-auto lg:overflow-y-auto items-center justify-around lg:justify-start">
        <div className="mb-2 px-3 text-xs font-semibold text-slate uppercase tracking-wider hidden lg:block">Main</div>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              type="button"
              key={item.id}
              className={`flex-1 lg:w-full flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 px-1 lg:px-3 py-2 lg:py-2.5 rounded-lg text-[10px] lg:text-sm font-medium transition-colors duration-200 relative group ${
                isActive 
                  ? "text-ink font-semibold" 
                  : "text-slate hover:text-ink"
              }`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-paper rounded-lg shadow-sm border border-line"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-line/0 rounded-lg transition-colors group-hover:bg-line/50" />
              )}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-indicator"
                  className="absolute bottom-0 lg:bottom-auto lg:left-0 top-auto lg:top-1/2 lg:-translate-y-1/2 w-[20px] lg:w-[4px] h-[3px] lg:h-3/5 bg-accent rounded-t-md lg:rounded-r-md lg:rounded-t-none z-10 shadow-[0_0_8px_var(--color-accent)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={20} weight={isActive ? "fill" : "regular"} className={`relative z-10 transition-colors ${isActive ? "text-accent" : "group-hover:text-ink"}`} />
              <span className="inline lg:inline relative z-10 truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Credits Widget */}
      <div className="p-4 shrink-0 hidden lg:block">
        <div className="bg-paper border border-line rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-end mb-2 relative z-10">
            <span className="text-[11px] font-bold text-slate uppercase tracking-wider">Credits</span>
            <span className={`text-sm font-bold ${remaining === 0 ? "text-danger" : "text-ink"}`}>
              {walletError || (remaining == null ? "Loading…" : `${remaining} left`)}
            </span>
          </div>
          {reserved > 0 && (
            <p className="text-[11px] text-slate mb-3 relative z-10">
              {reserved} reserved for active jobs
            </p>
          )}
          <div className="h-1.5 w-full bg-cloud-2 rounded-full overflow-hidden mb-3 relative z-10 shadow-inner border border-line-2">
            <div 
              className={`h-full transition-all duration-500 ease-out ${remaining === 0 ? "bg-danger" : "bg-accent"}`} 
              style={{ width: `${percentUsed}%` }} 
            />
          </div>
          <button
            type="button"
            onClick={() => onNavigate("billing")}
            className="w-full text-xs font-bold bg-accent hover:bg-accent-ink text-paper py-2 rounded-lg transition-all active:scale-95 border border-transparent relative z-10"
          >
            Manage billing
          </button>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
