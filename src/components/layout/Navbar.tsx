import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
          <img src="/favicon.svg" alt="Techofy" className="w-7 h-7 object-contain" />
          Techofy Cloud
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-sm border border-secondary/20">
                <span className="text-muted-foreground text-xs">₹</span>
                <span className="font-semibold text-secondary text-sm">{user.walletBalance?.toFixed(2) || "0.00"}</span>
              </div>
              <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
