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

const Sidebar = ({ active, onNavigate, currentUser, creditsUsed, creditsTotal }) => {
  const remaining = Math.max(creditsTotal - creditsUsed, 0);
  const percentUsed = creditsTotal > 0 ? Math.round((creditsUsed / creditsTotal) * 100) : 100;
  const workspaceName = currentUser?.workspace || "Personal Workspace";

  return (
    <aside className="w-[72px] lg:w-[220px] bg-cloud border-r border-line flex flex-col h-full flex-shrink-0 transition-all duration-300 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      
      {/* Workspace Selector (Visual Only) */}
      <div className="p-4 shrink-0 hidden lg:block">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-paper hover:shadow-sm transition-all duration-200 border border-transparent hover:border-line group">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent text-white flex items-center justify-center font-bold text-xs">
              {workspaceName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-ink leading-tight truncate max-w-[100px]">{workspaceName}</span>
              <span className="text-[10px] uppercase font-bold text-slate tracking-wider">Pro Plan</span>
            </div>
          </div>
          <CaretUpDown size={14} className="text-slate group-hover:text-ink transition-colors" />
        </button>
      </div>

      <div className="p-4 shrink-0 lg:hidden flex justify-center">
        <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center font-bold text-sm">
          {workspaceName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        <div className="mb-2 px-3 text-xs font-semibold text-slate uppercase tracking-wider hidden lg:block">Main</div>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              type="button"
              key={item.id}
              className={`w-full flex items-center justify-center lg:justify-start gap-3 lg:px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 relative group ${
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-3/5 bg-accent rounded-r-md z-10 shadow-[0_0_8px_var(--color-accent)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={20} weight={isActive ? "fill" : "regular"} className={`relative z-10 transition-colors ${isActive ? "text-accent" : "group-hover:text-ink"}`} />
              <span className="hidden lg:inline relative z-10">{item.label}</span>
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
              {remaining} left
            </span>
          </div>
          <div className="h-1.5 w-full bg-cloud-2 rounded-full overflow-hidden mb-3 relative z-10 shadow-inner border border-line-2">
            <div 
              className={`h-full transition-all duration-500 ease-out ${remaining === 0 ? "bg-danger" : "bg-accent"}`} 
              style={{ width: `${percentUsed}%` }} 
            />
          </div>
          <button className="w-full text-xs font-bold bg-accent hover:bg-accent-ink text-white py-2 rounded-lg transition-all shadow-sm active:scale-95 border border-transparent relative z-10 hover:shadow-md">
            Upgrade Plan
          </button>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;