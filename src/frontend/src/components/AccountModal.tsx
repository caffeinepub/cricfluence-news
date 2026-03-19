import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { User } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useUserAuth } from "../hooks/useUserAuth";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: (user: User) => void;
}

export function AccountModal({
  open,
  onOpenChange,
  onLoginSuccess,
}: AccountModalProps) {
  const { actor } = useActor();
  const { login } = useUserAuth();

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInPending, setSignInPending] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState("");
  const [regPending, setRegPending] = useState(false);

  const resetAll = () => {
    setSignInEmail("");
    setSignInPassword("");
    setSignInError("");
    setRegName("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirm("");
    setRegError("");
  };

  const handleClose = (val: boolean) => {
    if (!val) resetAll();
    onOpenChange(val);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    if (!signInEmail || !signInPassword) {
      setSignInError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(signInEmail)) {
      setSignInError("Please enter a valid email address.");
      return;
    }
    if (!actor) {
      setSignInError("Connection not ready. Please try again.");
      return;
    }
    setSignInPending(true);
    try {
      const hash = await hashPassword(signInPassword);
      const result = (await (actor as any).loginUser(
        signInEmail,
        hash,
      )) as import("../backend.d").LoginResult;
      if (result.__kind__ === "ok") {
        login(result.value);
        onLoginSuccess?.(result.value);
        toast.success(`Welcome back, ${result.value.name.split(" ")[0]}!`);
        handleClose(false);
      } else if (result.__kind__ === "notFound") {
        setSignInError("No account found with this email.");
      } else if (result.__kind__ === "wrongPassword") {
        setSignInError("Incorrect password.");
      }
    } catch {
      setSignInError("Something went wrong. Please try again.");
    } finally {
      setSignInPending(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setRegError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(regEmail)) {
      setRegError("Please enter a valid email address.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Passwords do not match.");
      return;
    }
    if (!actor) {
      setRegError("Connection not ready. Please try again.");
      return;
    }
    setRegPending(true);
    try {
      const hash = await hashPassword(regPassword);
      const createdAt = new Date().toISOString();
      const result = await (actor as any).registerUser(
        regName,
        regEmail,
        hash,
        createdAt,
      );
      if (result.__kind__ === "emailTaken") {
        setRegError("Email already registered. Please sign in.");
      } else if (result.__kind__ === "ok") {
        // Now login to get full user object
        const loginResult = (await (actor as any).loginUser(
          regEmail,
          hash,
        )) as import("../backend.d").LoginResult;
        if (loginResult.__kind__ === "ok") {
          login(loginResult.value);
          onLoginSuccess?.(loginResult.value);
          toast.success(`Welcome to CricFluence, ${regName.split(" ")[0]}!`);
          handleClose(false);
        } else {
          toast.success("Account created! Please sign in.");
          handleClose(false);
        }
      }
    } catch {
      setRegError("Something went wrong. Please try again.");
    } finally {
      setRegPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-ocid="account.modal">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Your Account
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="signin">
          <TabsList className="w-full mb-4">
            <TabsTrigger
              value="signin"
              className="flex-1"
              data-ocid="account.signin.tab"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="flex-1"
              data-ocid="account.register.tab"
            >
              Register
            </TabsTrigger>
          </TabsList>

          {/* ── Sign In ── */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  autoComplete="email"
                  data-ocid="account.signin.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  autoComplete="current-password"
                  data-ocid="account.password.input"
                />
              </div>
              {signInError && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="account.signin.error_state"
                >
                  {signInError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={signInPending}
                data-ocid="account.signin.submit_button"
              >
                {signInPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {signInPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          {/* ── Register ── */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  autoComplete="name"
                  data-ocid="account.register.name.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="email"
                  data-ocid="account.register.email.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  data-ocid="account.register.password.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-confirm">Confirm Password</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  placeholder="Repeat password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  autoComplete="new-password"
                  data-ocid="account.register.confirm.input"
                />
              </div>
              {regError && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="account.register.error_state"
                >
                  {regError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={regPending}
                data-ocid="account.register.submit_button"
              >
                {regPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {regPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
