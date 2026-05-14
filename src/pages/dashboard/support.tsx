import { motion } from "framer-motion";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListSupportTickets, useCreateSupportTicket } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { HelpCircle, Plus, X, ChevronRight } from "lucide-react";

const CATEGORIES = ["General", "Billing", "Technical", "Server Issue", "Account", "Other"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

function statusColor(s: string) {
  if (s === "OPEN") return "bg-blue-100 text-blue-700 border-blue-200";
  if (s === "IN_PROGRESS") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (s === "RESOLVED") return "bg-green-100 text-green-700 border-green-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function IOSSpinner() {
  return (
    <div className="flex justify-center py-8">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="14" y1="3" x2="14" y2="8" stroke="hsl(var(--primary))"
            strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: `rotate(${i * 30}deg)`, transformOrigin: "14px 14px", opacity: (i + 1) / 12 }} />
        ))}
      </svg>
    </div>
  );
}

export default function Support() {
  const { data: tickets = [], isLoading, refetch } = useListSupportTickets();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<typeof PRIORITIES[number]>("MEDIUM");
  const [category, setCategory] = useState("General");

  const createMut = useCreateSupportTicket({
    mutation: {
      onSuccess: () => {
        toast({ title: "Ticket created!", description: "Our team will respond shortly." });
        setShowForm(false);
        setSubject(""); setMessage(""); setPriority("MEDIUM"); setCategory("General");
        refetch();
      },
      onError: (err: { data?: { error?: string } }) => {
        toast({ title: "Failed to create ticket", description: err?.data?.error ?? "Please try again.", variant: "destructive" });
      },
    },
  });

  const handleSubmit = () => {
    if (!subject.trim() || subject.trim().length < 5) { toast({ title: "Subject too short", variant: "destructive" }); return; }
    if (!message.trim() || message.trim().length < 10) { toast({ title: "Message too short", variant: "destructive" }); return; }
    createMut.mutate({ data: { subject: subject.trim(), message: message.trim(), priority, category } });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Support Center</h1>
            <p className="text-sm text-muted-foreground mt-1">{tickets.length} tickets total</p>
          </div>
          <Button className="bg-primary text-white" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Ticket
          </Button>
        </div>

        {/* New Ticket Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Open a Support Ticket</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Category</Label>
                    <select
                      className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={category} onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Priority</Label>
                    <select
                      className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={priority} onChange={(e) => setPriority(e.target.value as typeof PRIORITIES[number])}
                    >
                      {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Subject</Label>
                  <Input placeholder="Brief description of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Message</Label>
                  <textarea
                    className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    rows={4}
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button className="w-full bg-primary text-white" onClick={handleSubmit} disabled={createMut.isPending}>
                  {createMut.isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Submitting...
                    </span>
                  ) : "Submit Ticket"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Ticket List */}
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">No support tickets yet</p>
              <Button variant="link" className="text-primary mt-2" onClick={() => setShowForm(true)}>Open your first ticket</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket, i) => (
              <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/dashboard/support/${ticket.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {ticket.category} · {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={`text-xs ${statusColor(ticket.status)}`}>{ticket.status.replace("_", " ")}</Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
