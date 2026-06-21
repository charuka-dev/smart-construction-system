import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { useApp } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LogOut, HardHat } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export function RoleShell({
  role,
  title,
  nav,
  children,
}: {
  role: Role;
  title: string;
  nav: NavItem[];
  children: ReactNode;
}) {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!currentUser) navigate({ to: "/auth", replace: true });
    else if (currentUser.role !== role) {
      navigate({ to: `/${currentUser.role}` as string, replace: true });
    }
  }, [currentUser, role, navigate]);

  if (!currentUser || currentUser.role !== role) return null;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <HardHat className="size-5" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold leading-none">BuildSync-3D</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60 mt-1">
                {role} portal
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const active =
              item.to === `/${role}`
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <span className={`size-4 ${active ? "text-primary" : ""}`}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="text-sm font-medium truncate">{currentUser.name}</div>
          <div className="text-xs text-sidebar-foreground/60 truncate font-mono">{currentUser.email}</div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3 w-full"
            onClick={() => { logout(); navigate({ to: "/auth", replace: true }); }}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-border bg-card/60 backdrop-blur px-6 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              BuildSync-3D / {role}
            </div>
            <h1 className="font-display text-base font-semibold leading-tight">{title}</h1>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
