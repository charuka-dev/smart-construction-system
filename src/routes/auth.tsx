import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { HardHat, Ruler } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — BuildSync-3D" },
      { name: "description", content: "Sign in or register a client account on the BuildSync-3D construction portal." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { currentUser, login, loginAs, registerClient } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");

  useEffect(() => {
    if (currentUser) navigate({ to: `/${currentUser.role}` as string, replace: true });
  }, [currentUser, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register-only fields
  const [name, setName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [siteAddress, setSiteAddress] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = login(email, password);
    if (!u) toast.error("Invalid credentials. Try a demo account.");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in your name, email, and password.");
      return;
    }
    registerClient({ name, email, password, contactNo, currentAddress, siteAddress });
    toast.success("Account created — welcome to BuildSync-3D.");
  };

  const demo = (role: Role) => {
    loginAs(role);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-background">
      {/* Left visual panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 bg-sidebar text-sidebar-foreground overflow-hidden">
        <div className="absolute inset-0 bg-blueprint-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/20" />

        <div className="relative flex items-center gap-3">
          <div className="size-10 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <HardHat className="size-5" />
          </div>
          <div>
            <div className="font-display text-xl font-semibold">BuildSync-3D</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/60">
              Construction Portal v1.0
            </div>
          </div>
        </div>

        <div className="relative space-y-5 max-w-md">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-primary">
            <Ruler className="size-3.5" />
            <span>Plan / Build / Visualize</span>
          </div>
          <h2 className="font-display text-4xl font-semibold leading-tight text-balance">
            Bring blueprints to life — and keep every trade on the same page.
          </h2>
          <p className="text-sidebar-foreground/70 leading-relaxed">
            One workspace for clients, contractors and supervisors. 3D visualization,
            daily cost tracking, quality checks and on-site safety reporting — built
            on top of your existing drawings.
          </p>
        </div>

        <div className="relative font-mono text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/40">
          Drafted on warm paper · graphite & blueprint cyan
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md p-7 border-border">
          <div className="flex gap-1 p-1 rounded-md bg-muted mb-6 font-mono text-xs uppercase tracking-wider">
            <button
              className={`flex-1 py-2 rounded ${mode === "login" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
              onClick={() => setMode("login")}
            >Sign in</button>
            <button
              className={`flex-1 py-2 rounded ${mode === "register" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
              onClick={() => setMode("register")}
            >Register (client)</button>
          </div>

          {mode === "login" ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
              <p className="text-sm text-muted-foreground -mt-2">Sign in to your BuildSync-3D account.</p>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Sign in</Button>

              <div className="pt-3 border-t border-border">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                  Demo accounts (mock auth)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => demo("client")}>Client</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => demo("contractor")}>Contractor</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => demo("supervisor")}>Supervisor</Button>
                </div>
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleRegister}>
              <h1 className="font-display text-2xl font-semibold">Create a client account</h1>
              <p className="text-sm text-muted-foreground -mt-2">
                Only client accounts can self-register. Supervisors are created by the contractor.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Contact no.</Label>
                  <Input value={contactNo} onChange={(e) => setContactNo(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Current address</Label>
                <Input value={currentAddress} onChange={(e) => setCurrentAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Site location address</Label>
                <Input value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full">Create account</Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
