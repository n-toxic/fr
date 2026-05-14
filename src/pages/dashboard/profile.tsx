import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useUpdateProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { User, Mail, Lock, Save } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateMut = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        toast({ title: "Profile updated!", description: "Your changes have been saved." });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      },
      onError: (err: { data?: { error?: string } }) => {
        toast({ title: "Update failed", description: err?.data?.error ?? "Please try again.", variant: "destructive" });
      },
    },
  });

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    if (newPassword && newPassword.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters", variant: "destructive" }); return;
    }
    updateMut.mutate({
      data: {
        name: name.trim() || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-lg pb-4">
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account information and security.</p>
        </div>

        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="font-semibold">{user?.name ?? "No name set"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"}</p>
            </div>
          </div>
        </motion.div>

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="pl-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={user?.email ?? ""} disabled className="pl-10 opacity-60 cursor-not-allowed" />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
            </div>
            <p className="text-xs text-muted-foreground">Leave password fields blank to keep your current password.</p>
          </CardContent>
        </Card>

        <Button className="w-full bg-primary text-white" onClick={handleSave} disabled={updateMut.isPending}>
          {updateMut.isPending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving...
            </span>
          ) : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
        </Button>
      </div>
    </DashboardLayout>
  );
}
