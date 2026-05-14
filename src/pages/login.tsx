import { Link, useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLogin, useGoogleAuth } from "@/lib/api";
import { Mail, Lock, Cloud, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: { client_id: string; callback: (r: { credential: string }) => void }): void;
          renderButton(el: HTMLElement, config: object): void;
        };
      };
    };
  }
}

export default function Login() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const redirect = new URLSearchParams(search).get("redirect") ?? "";
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPw, setShowPw] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        toast({ title: "Welcome back!", description: "Signed in successfully." });
        const dest = redirect?.startsWith("/") ? redirect : (data.user.role === "ADMIN" ? "/admin" : "/dashboard");
        setLocation(dest);
      },
      onError: (err: { data?: { error?: string; requiresVerification?: boolean; email?: string }; status?: number }) => {
        if (err?.data?.requiresVerification || err?.status === 403) {
          const email = err?.data?.email ?? form.getValues("email");
          toast({ title: "Verify your email", description: "A new OTP has been sent to your email." });
          setLocation(`/verify-otp?email=${encodeURIComponent(email)}`);
          return;
        }
        toast({ title: "Login failed", description: err?.data?.error ?? "Invalid credentials", variant: "destructive" });
      },
    },
  });

  const googleMutation = useGoogleAuth({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        toast({ title: "Welcome!", description: "Signed in with Google." });
        const dest = redirect?.startsWith("/") ? redirect : (data.user.role === "ADMIN" ? "/admin" : "/dashboard");
        setLocation(dest);
      },
      onError: () => toast({ title: "Google sign-in failed", variant: "destructive" }),
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  // Render Google button using renderButton (works on mobile, no popup issues)
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleBtnRef.current) return;

    const initGoogle = () => {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }) => googleMutation.mutate({ credential }),
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        text: "continue_with",
        size: "large",
        width: googleBtnRef.current.offsetWidth || 360,
        logo_alignment: "left",
      });
    };

    if (window.google) {
      initGoogle();
    } else {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener("load", initGoogle);
      } else {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.onload = initGoogle;
        document.head.appendChild(script);
      }
    }
  }, [GOOGLE_CLIENT_ID]);

  const onSubmit = (values: z.infer<typeof schema>) => loginMutation.mutate({ data: values });

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-primary p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--secondary)/0.4)_0%,_transparent_60%)]" />
        <Link href="/" className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Techofy Cloud</span>
        </Link>
        <div className="relative space-y-4">
          <p className="text-4xl font-bold leading-tight">Deploy servers<br />in seconds.</p>
          <p className="text-white/70 text-sm leading-relaxed">Instant VPS and Windows RDP with full root access. Scale on demand, pay as you go.</p>
        </div>
        <p className="relative text-white/40 text-xs">© 2026 Techofy. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        >
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Techofy Cloud</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your cloud console</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type="email" placeholder="you@example.com" className="pl-10" autoComplete="email" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type={showPw ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" autoComplete="current-password" />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-11" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
                )}
              </Button>
            </form>
          </Form>

          {GOOGLE_CLIENT_ID && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or continue with</span></div>
              </div>
              {/* Google renders its own button here — no custom click needed */}
              <div ref={googleBtnRef} className="w-full flex justify-center" style={{ minHeight: 44 }} />
            </>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">Create account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
