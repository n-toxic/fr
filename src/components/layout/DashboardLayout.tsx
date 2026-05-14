import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetWallet } from "@/lib/api";
import {
  LayoutDashboard, Server, CreditCard, PlusCircle, HelpCircle,
  LogOut, Users, Database, Ticket, ChevronRight, Menu, X, User
} from "lucide-react";
import { useState } from "react";

const userNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/instances", label: "My Servers", icon: Server },
  { href: "/dashboard/deploy", label: "Deploy Server", icon: PlusCircle },
  { href: "/dashboard/billing", label: "Billing & Wallet", icon: CreditCard },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const adminNav = [
  { href: "/admin", label: "Admin Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/instances", label: "All Servers", icon: Server },
  { href: "/admin/server-pool", label: "Server Pool", icon: Database },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: wallet } = useGetWallet({ query: { enabled: !!user } });

  const isAdmin = user?.role === "ADMIN";
  const nav = isAdmin ? adminNav : userNav;

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
            <img src="/favicon.svg" alt="Techofy" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-sm">Techofy Cloud</span>
        </Link>
      </div>

      {isAdmin && (
        <div className="px-4 py-2">
          <Badge variant="destructive" className="text-xs">Admin Panel</Badge>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/dashboard" && href !== "/admin" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        {!isAdmin && wallet && (
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Wallet Balance</p>
            <p className="text-lg font-bold text-primary">₹{wallet.balance.toFixed(2)}</p>
            <Link href="/dashboard/billing">
              <Button size="sm" variant="outline" className="w-full mt-2 text-xs h-7">Add Funds</Button>
            </Link>
          </div>
        )}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{user?.email?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.name ?? user?.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col shrink-0">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-card border-r border-border flex flex-col z-10">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 gap-4 shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
          {!isAdmin && wallet && (
            <Link href="/dashboard/billing">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-sm cursor-pointer hover:bg-primary/20 transition-colors">
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold text-primary">₹{wallet.balance.toFixed(2)}</span>
              </div>
            </Link>
          )}
          <div className="text-sm text-muted-foreground hidden sm:block">{user?.email}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/50 py-2 px-4 text-center">
          <p className="text-xs text-muted-foreground">Techofy © 2026 All rights reserved</p>
        </footer>
      </div>
    </div>
  );
}
