import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Save, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { localStore } from "../store/localStore";
import type { TeamSettings } from "../types";

interface Props {
  isAdmin: boolean;
  userMobile: string;
  onLogout: () => void;
}

export default function SettingsPage({ isAdmin, userMobile, onLogout }: Props) {
  const [settings, setSettings] = useState<TeamSettings>(
    localStore.getSettings(),
  );
  const { login, clear, loginStatus, identity } = useInternetIdentity();

  function handleSave() {
    if (!settings.teamName.trim()) {
      toast.error("Team name cannot be empty");
      return;
    }
    localStore.saveSettings(settings);
    toast.success("Settings saved");
  }

  return (
    <div className="space-y-5 pb-4">
      <h1 className="text-xl font-display font-bold">Settings</h1>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <h2 className="font-display font-semibold mb-3">Your Profile</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">{userMobile}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isAdmin ? "Admin" : "Player"}
              {identity &&
                ` · ${identity.getPrincipal().toString().slice(0, 12)}...`}
            </div>
          </div>
          {isAdmin && <Shield className="h-5 w-5 text-primary" />}
        </div>

        {!identity ? (
          <Button
            data-ocid="settings.login_button"
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            size="sm"
            variant="outline"
            className="mt-3 border-primary/40 text-primary hover:bg-primary/10"
          >
            {loginStatus === "logging-in"
              ? "Connecting..."
              : "Connect Internet Identity (Admin)"}
          </Button>
        ) : (
          <Button
            data-ocid="settings.logout_ii_button"
            onClick={() => clear()}
            size="sm"
            variant="outline"
            className="mt-3 border-border text-muted-foreground"
          >
            Disconnect
          </Button>
        )}
      </motion.div>

      {/* Team settings — admin only */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <h2 className="font-display font-semibold mb-3">Team Settings</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Team Name</Label>
              <Input
                data-ocid="settings.team_name.input"
                value={settings.teamName}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, teamName: e.target.value }))
                }
                className="mt-1 bg-input"
                placeholder="Sultan Warriors"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Captain Mobile
              </Label>
              <Input
                data-ocid="settings.captain.input"
                value={settings.captainMobile}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, captainMobile: e.target.value }))
                }
                className="mt-1 bg-input"
                placeholder="03XXXXXXXXX"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Founded Year
              </Label>
              <Input
                value={settings.founded}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, founded: e.target.value }))
                }
                className="mt-1 bg-input"
                placeholder="2020"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Home Ground
              </Label>
              <Input
                value={settings.homeGround}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, homeGround: e.target.value }))
                }
                className="mt-1 bg-input"
                placeholder="Stadium name, City"
              />
            </div>
            <Button
              data-ocid="settings.save_button"
              onClick={handleSave}
              className="w-full bg-primary text-primary-foreground"
            >
              <Save className="h-4 w-4 mr-2" /> Save Settings
            </Button>
          </div>
        </motion.div>
      )}

      {/* Logout */}
      <Button
        data-ocid="settings.logout_button"
        variant="outline"
        onClick={onLogout}
        className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4 mr-2" /> Logout
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
