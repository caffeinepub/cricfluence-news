import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useState } from "react";

const ADMIN_PASSWORD = "Kanaramp02@";

interface AdminLoginPageProps {
  onLogin: () => void;
}

export function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError("");
      onLogin();
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="flex items-baseline justify-center gap-0 leading-none mb-2">
          <span className="font-display font-900 text-[1.6rem] tracking-[-0.03em] text-cricket-green">
            CRIC
          </span>
          <span
            className="font-display font-900 text-[1.6rem] tracking-[-0.03em] text-influencer-amber"
            style={{ marginLeft: "-1px" }}
          >
            FLUENCE
          </span>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/10 mt-4">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-cricket-green/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-cricket-green" />
            </div>
            <h1 className="text-lg font-display font-700 text-foreground tracking-tight">
              Admin Login
            </h1>
            <p className="text-[13px] text-muted-foreground text-center">
              This area is restricted. Enter the admin password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-password" className="text-[13px] font-600">
                Password
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter admin password"
                autoComplete="current-password"
                data-ocid="admin_login.password.input"
              />
            </div>

            {error && (
              <p
                className="text-[13px] text-destructive font-500"
                role="alert"
                data-ocid="admin_login.error_state"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-cricket-green hover:bg-cricket-green/90 text-white font-600 mt-1"
              data-ocid="admin_login.submit_button"
            >
              Login
            </Button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              window.location.hash = "";
            }}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            data-ocid="admin_login.back.link"
          >
            ← Back to site
          </button>
        </div>
      </div>
    </div>
  );
}
