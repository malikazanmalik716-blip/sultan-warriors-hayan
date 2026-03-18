import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { localStore } from "../store/localStore";

interface Props {
  onLogin: (name: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const settings = localStore.getSettings();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter your name (at least 2 characters)");
      return;
    }
    setError("");
    localStore.saveUserMobile(trimmed);
    onLogin(trimmed);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary mb-4 shadow-gold">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-primary">
            {settings.teamName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cricket Team Management
          </p>
        </div>

        {/* Login card */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-display font-semibold">Login</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm text-muted-foreground mb-1.5 block"
              >
                Your Name
              </Label>
              <Input
                id="name"
                data-ocid="login.input"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input text-foreground placeholder:text-muted-foreground"
                autoComplete="name"
              />
              {error && (
                <p
                  data-ocid="login.error_state"
                  className="text-destructive text-xs mt-1"
                >
                  {error}
                </p>
              )}
            </div>
            <Button
              data-ocid="login.submit_button"
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            >
              Enter Team Portal
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
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
      </motion.div>
    </div>
  );
}
