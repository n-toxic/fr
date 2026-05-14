import React from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";

import Home from "@/pages/home";
import About from "@/pages/about";
import Terms from "@/pages/terms";
import Refund from "@/pages/refund";
import Login from "@/pages/login";
import Register from "@/pages/register";
import VerifyOtp from "@/pages/verify-otp";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard/index";
import Instances from "@/pages/dashboard/instances";
import InstanceDetail from "@/pages/dashboard/instance-detail";
import Billing from "@/pages/dashboard/billing";
import Deploy from "@/pages/dashboard/deploy";
import Support from "@/pages/dashboard/support";
import TicketDetail from "@/pages/dashboard/ticket-detail";
import AdminDashboard from "@/pages/admin/index";
import AdminUsers from "@/pages/admin/users";
import AdminInstances from "@/pages/admin/instances";
import AdminServerPool from "@/pages/admin/server-pool";
import AdminTickets from "@/pages/admin/tickets";
import AdminTicketDetail from "@/pages/admin/ticket-detail";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";
import Profile from "@/pages/dashboard/profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        if ((error as { status?: number })?.status === 401) return false;
        return failureCount < 2;
      },
      staleTime: 30_000,
    },
  },
});

// iOS-style loading spinner
function IOSSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="ios-spinner">
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1="18" y1="4" x2="18" y2="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-primary"
              style={{
                transform: `rotate(${i * 30}deg)`,
                transformOrigin: "18px 18px",
                opacity: (i + 1) / 12,
              }}
            />
          ))}
        </svg>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (isLoading) return <IOSSpinner />;
  if (!isAuthenticated) return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  if (adminOnly && user?.role !== "ADMIN") return <Redirect to="/dashboard" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/terms" component={Terms} />
      <Route path="/refund" component={Refund} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-otp" component={VerifyOtp} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/admin-login">{() => <AdminLogin />}</Route>

      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/dashboard/instances">{() => <ProtectedRoute component={Instances} />}</Route>
      <Route path="/dashboard/instances/:id">{() => <ProtectedRoute component={InstanceDetail} />}</Route>
      <Route path="/dashboard/billing">{() => <ProtectedRoute component={Billing} />}</Route>
      <Route path="/dashboard/deploy">{() => <ProtectedRoute component={Deploy} />}</Route>
      <Route path="/dashboard/support">{() => <ProtectedRoute component={Support} />}</Route>
      <Route path="/dashboard/support/:id">{() => <ProtectedRoute component={TicketDetail} />}</Route>
      <Route path="/dashboard/profile">{() => <ProtectedRoute component={Profile} />}</Route>

      <Route path="/admin">{() => <ProtectedRoute component={AdminDashboard} adminOnly />}</Route>
      <Route path="/admin/users">{() => <ProtectedRoute component={AdminUsers} adminOnly />}</Route>
      <Route path="/admin/instances">{() => <ProtectedRoute component={AdminInstances} adminOnly />}</Route>
      <Route path="/admin/server-pool">{() => <ProtectedRoute component={AdminServerPool} adminOnly />}</Route>
      <Route path="/admin/tickets">{() => <ProtectedRoute component={AdminTickets} adminOnly />}</Route>
      <Route path="/admin/tickets/:id">{() => <ProtectedRoute component={AdminTicketDetail} adminOnly />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={(import.meta.env.BASE_URL ?? "/").replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
