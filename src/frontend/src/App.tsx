import { Toaster } from "@/components/ui/sonner";
import { Calendar, DollarSign, Home, Settings, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useIsAdmin } from "./hooks/useQueries";
import Dashboard from "./pages/Dashboard";
import FinancePage from "./pages/FinancePage";
import LoginPage from "./pages/LoginPage";
import MatchesPage from "./pages/MatchesPage";
import PlayersPage from "./pages/PlayersPage";
import SettingsPage from "./pages/SettingsPage";
import { localStore } from "./store/localStore";

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "matches", label: "Matches", icon: Calendar },
  { id: "players", label: "Players", icon: Users },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function App() {
  const [userMobile, setUserMobile] = useState<string>(() =>
    localStore.getUserMobile(),
  );
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const { data: isAdmin = false } = useIsAdmin();
  const settings = localStore.getSettings();

  useEffect(() => {
    document.title = `${settings.teamName} - Cricket Team`;
  }, [settings.teamName]);

  function handleLogin(mobile: string) {
    setUserMobile(mobile);
  }

  function handleLogout() {
    localStore.clearUserMobile();
    setUserMobile("");
    setActiveTab("home");
  }

  if (!userMobile) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="top-center" />
      </>
    );
  }

  const captainMobile = settings.captainMobile;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-primary text-lg leading-tight">
              {settings.teamName}
            </h1>
            <p className="text-xs text-muted-foreground">Hayan Cricket Team</p>
          </div>
          {isAdmin && (
            <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-semibold">
              Admin
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "home" && (
              <Dashboard
                isAdmin={isAdmin}
                userMobile={userMobile}
                onNavigate={(tab) => setActiveTab(tab as TabId)}
              />
            )}
            {activeTab === "matches" && (
              <MatchesPage isAdmin={isAdmin} settings={settings} />
            )}
            {activeTab === "players" && (
              <PlayersPage isAdmin={isAdmin} captainMobile={captainMobile} />
            )}
            {activeTab === "finance" && (
              <FinancePage isAdmin={isAdmin} userMobile={userMobile} />
            )}
            {activeTab === "settings" && (
              <SettingsPage
                isAdmin={isAdmin}
                userMobile={userMobile}
                onLogout={handleLogout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur border-t border-border">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                type="button"
                key={id}
                data-ocid={`nav.${id}.link`}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                <span
                  className={`text-[10px] font-medium ${active ? "text-primary" : ""}`}
                >
                  {label}
                </span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <Toaster position="top-center" />
    </div>
  );
}
