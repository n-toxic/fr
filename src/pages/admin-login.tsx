import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLogin } from "@/lib/api";
import { Shield, Lock, Mail } from "lucide-react";

const ADMIN_EMAIL = "whytoxicz@gmail.com";
const ADMIN_PANEL_PASSWORD = import.meta.env.VITE_ADMIN_PANEL_PASSWORD || "Toxic";

const schema = z.object({
  panelPassword: z.string().min(1, "Panel password required"),
  email: z.string().email(),
  password: z.string().min(1),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [panelUnlocked, setPanelUnlocked] = useState(false);
  const [panelPw, setPanelPw] = useState("");

  const loginMut = useLogin({
    mutation: {
      onSuccess: (data) => {
        if (data.user.role !== "ADMIN") {
          toast({ title: "Access denied", description: "This account does not have admin privileges.", variant: "destructive" });
          return;
        }
        login(data.token);
        toast({ title: "Admin access granted", description: "Welcome to the admin panel." });
        setLocation("/admin");
      },
      onError: (err: { data?: { error?: string } }) => {
        toast({ title: "Login failed", description: err?.data?.error ?? "Invalid credentials", variant: "destructive" });
      },
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { panelPassword: "", email: ADMIN_EMAIL, password: "" },
  });

  const handlePanelUnlock = () => {
    if (panelPw === ADMIN_PANEL_PASSWORD) {
      setPanelUnlocked(true);
      toast({ title: "Panel unlocked", description: "Enter your admin credentials." });
    } else {
      toast({ title: "Wrong panel password", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      >
        <div className="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-gray-400 mt-1">Restricted Access · Techofy Cloud</p>
          </div>

          {!panelUnlocked ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">Panel Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 text-sm"
                    placeholder="Enter panel password"
                    value={panelPw}
                    onChange={(e) => setPanelPw(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePanelUnlock()}
                  />
                </div>
              </div>
              <button
                onClick={handlePanelUnlock}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
              >
                Unlock Panel
              </button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(({ email, password }) => loginMut.mutate({ data: { email, password } }))} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-xs">Admin Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input {...field} type="email" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 text-sm" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-xs">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input {...field} type="password" placeholder="••••••••" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 text-sm" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <button
                  type="submit"
                  disabled={loginMut.isPending}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {loginMut.isPending ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>
                  ) : <><Shield className="w-4 h-4" />Access Admin Panel</>}
                </button>
              </form>
            </Form>
          )}

          <p className="text-center text-xs text-gray-600 mt-6">Techofy © 2026 All rights reserved</p>
        </div>
      </motion.div>
    </div>
  );
}
