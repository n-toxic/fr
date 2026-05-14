/**
 * Techofy Cloud API Client
 * Self-contained replacement for @workspace/api-client-react
 * Uses @tanstack/react-query + native fetch
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";

// ─── Configuration ────────────────────────────────────────────────────────────
let baseUrl = import.meta.env.VITE_API_URL || "https://edev.fun";
let getToken: () => string | null = () => {
  try { return localStorage.getItem("techofy_token"); } catch { return null; }
};

export function setBaseUrl(url: string) { baseUrl = url.replace(/\/$/, ""); }
export function setAuthTokenGetter(fn: () => string | null) { getToken = fn; }

// ─── Fetch helper ────────────────────────────────────────────────────────────
interface ApiError extends Error { status?: number; data?: unknown; }

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/api${path}`, { ...options, headers: { ...headers, ...(options.headers as Record<string, string> || {}) } });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err: ApiError = new Error((data as { error?: string })?.error || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface User { id: string; email: string; name?: string; role: string; walletBalance: number; createdAt: string; }
export interface AuthResponse { user: User; token: string; }
export interface WalletInfo { balance: number; currency: string; }
export interface Transaction { id: string; type: "DEPOSIT" | "DEDUCTION"; amount: number; description: string; status: "PENDING" | "SUCCESS" | "FAILED"; razorpayOrderId?: string; date: string; }
export interface Instance { id: string; type: "RDP" | "VPS"; os: string; ram: number; cpu: number; storage: number; hostname?: string; status: string; monthlyCost: number; createdAt: string; location: string; }
export interface InstanceDetail extends Instance { ports: PortRule[]; }
export interface PortRule { id: string; port: number; protocol: string; description: string; direction: string; }
export interface InstanceCredentials { hostname: string; username: string; password: string; port: number; connectionString: string; }
export interface Plan { id: string; name: string; type: "RDP" | "VPS"; os: string; ram: number; cpu: number; storage: number; monthlyCost: number; features: string[]; popular: boolean; }
export interface SupportTicket { id: string; subject: string; category: string; status: string; priority: string; createdAt: string; updatedAt: string; userId: string; userEmail: string; }
export interface TicketDetail extends SupportTicket { messages: TicketMessage[]; }
export interface TicketMessage { id: string; content: string; isAdmin: boolean; createdAt: string; authorName: string; }
export interface DashboardSummary { runningInstances: number; stoppedInstances: number; pendingInstances: number; totalInstances: number; walletBalance: number; monthlySpend: number; openTickets: number; }
export interface DepositOrder { orderId: string; amount: number; currency: string; keyId: string; }
export interface AdminStats { totalUsers: number; totalInstances: number; activeInstances: number; pendingInstances: number; openTickets: number; serverPoolAvailable: number; totalRevenue: number; monthlyRevenue: number; }
export interface AdminUser { id: string; email: string; name?: string; role: string; walletBalance: number; instanceCount: number; totalSpent: number; isVerified: boolean; createdAt: string; }
export interface AdminInstance { id: string; userId: string; userEmail: string; type: string; os: string; ram: number; cpu: number; storage: number; hostname?: string; rawIp?: string; status: string; monthlyCost: number; createdAt: string; }
export interface AdminTicket extends SupportTicket {}
export interface ServerPoolEntry { id: string; ip: string; rootUsername: string; type: string; status: string; location: string; isActive: boolean; assignedInstanceId?: string; addedAt: string; }

// ─── Auth Hooks ──────────────────────────────────────────────────────────────
export function useGetMe(opts?: { query?: Partial<UseQueryOptions<User>> }) {
  return useQuery<User>({ queryKey: ["me"], queryFn: () => apiFetch<User>("/auth/me"), staleTime: 60_000, retry: false, ...opts?.query });
}

type MutOpts<TData, TVar> = { mutation?: UseMutationOptions<TData, ApiError, TVar> };

export function useLogin(opts?: MutOpts<AuthResponse, { data: { email: string; password: string } }>) {
  return useMutation<AuthResponse, ApiError, { data: { email: string; password: string } }>({
    mutationFn: ({ data }) => apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    ...opts?.mutation,
  });
}
export function useRegister(opts?: MutOpts<{ message: string }, { data: { email: string; password: string; name: string } }>) {
  return useMutation<{ message: string }, ApiError, { data: { email: string; password: string; name: string } }>({
    mutationFn: ({ data }) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    ...opts?.mutation,
  });
}
export function useVerifyOtp(opts?: MutOpts<AuthResponse, { data: { email: string; code: string } }>) {
  return useMutation<AuthResponse, ApiError, { data: { email: string; code: string } }>({
    mutationFn: ({ data }) => apiFetch<AuthResponse>("/auth/verify-otp", { method: "POST", body: JSON.stringify(data) }),
    ...opts?.mutation,
  });
}
export function useRequestOtp(opts?: MutOpts<{ message: string }, { data: { email: string } }>) {
  return useMutation<{ message: string }, ApiError, { data: { email: string } }>({
    mutationFn: ({ data }) => apiFetch("/auth/request-otp", { method: "POST", body: JSON.stringify(data) }),
    ...opts?.mutation,
  });
}
export function useForgotPassword(opts?: MutOpts<{ message: string }, { data: { email: string } }>) {
  return useMutation<{ message: string }, ApiError, { data: { email: string } }>({
    mutationFn: ({ data }) => apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify(data) }),
    ...opts?.mutation,
  });
}
export function useResetPassword(opts?: MutOpts<{ message: string }, { data: { email: string; code: string; newPassword: string } }>) {
  return useMutation<{ message: string }, ApiError, { data: { email: string; code: string; newPassword: string } }>({
    mutationFn: ({ data }) => apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),
    ...opts?.mutation,
  });
}
export function useGoogleAuth(opts?: MutOpts<AuthResponse, { credential: string }>) {
  return useMutation<AuthResponse, ApiError, { credential: string }>({
    mutationFn: (data) => apiFetch<AuthResponse>("/auth/google", { method: "POST", body: JSON.stringify(data) }),
    ...opts?.mutation,
  });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export function useGetDashboardSummary(opts?: { query?: Partial<UseQueryOptions<DashboardSummary>> }) {
  return useQuery<DashboardSummary>({ queryKey: ["dashboard-summary"], queryFn: () => apiFetch<DashboardSummary>("/dashboard/summary"), staleTime: 30_000, ...opts?.query });
}

// ─── Wallet & Transactions ───────────────────────────────────────────────────
export function useGetWallet(opts?: { query?: Partial<UseQueryOptions<WalletInfo>> }) {
  return useQuery<WalletInfo>({ queryKey: ["wallet"], queryFn: () => apiFetch<WalletInfo>("/users/wallet"), staleTime: 30_000, ...opts?.query });
}
export function useListTransactions(opts?: { query?: Partial<UseQueryOptions<Transaction[]>> }) {
  return useQuery<Transaction[]>({ queryKey: ["transactions"], queryFn: () => apiFetch<Transaction[]>("/transactions"), staleTime: 30_000, ...opts?.query });
}
export function useCreateDeposit(opts?: MutOpts<DepositOrder, { data: { amount: number } }>) {
  return useMutation<DepositOrder, ApiError, { data: { amount: number } }>({
    mutationFn: ({ data }) => apiFetch<DepositOrder>("/users/deposit", { method: "POST", body: JSON.stringify(data) }),
    ...opts?.mutation,
  });
}
export function useVerifyDeposit(opts?: MutOpts<{ message: string }, { data: { orderId: string; paymentId: string; signature: string } }>) {
  const qc = useQueryClient();
  return useMutation<{ message: string }, ApiError, { data: { orderId: string; paymentId: string; signature: string } }>({
    mutationFn: ({ data }) => apiFetch("/users/deposit/verify", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wallet"] }); qc.invalidateQueries({ queryKey: ["transactions"] }); },
    ...opts?.mutation,
  });
}
export function useUpdateProfile(opts?: MutOpts<User, { data: { name?: string; currentPassword?: string; newPassword?: string } }>) {
  const qc = useQueryClient();
  return useMutation<User, ApiError, { data: { name?: string; currentPassword?: string; newPassword?: string } }>({
    mutationFn: ({ data }) => apiFetch<User>("/users/profile", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
    ...opts?.mutation,
  });
}

// ─── Plans & Instances ───────────────────────────────────────────────────────
export function useListPlans(opts?: { query?: Partial<UseQueryOptions<Plan[]>> }) {
  return useQuery<Plan[]>({ queryKey: ["plans"], queryFn: () => apiFetch<Plan[]>("/plans"), staleTime: 300_000, ...opts?.query });
}
export function useListInstances(opts?: { query?: Partial<UseQueryOptions<Instance[]>> }) {
  return useQuery<Instance[]>({ queryKey: ["instances"], queryFn: () => apiFetch<Instance[]>("/instances"), staleTime: 30_000, ...opts?.query });
}
export function useGetInstance(id: string, opts?: { query?: Partial<UseQueryOptions<InstanceDetail>> }) {
  return useQuery<InstanceDetail>({ queryKey: ["instance", id], queryFn: () => apiFetch<InstanceDetail>(`/instances/${id}`), enabled: !!id, staleTime: 30_000, ...opts?.query });
}
export function useGetInstanceCredentials(id: string, opts?: { query?: Partial<UseQueryOptions<InstanceCredentials>> }) {
  return useQuery<InstanceCredentials>({ queryKey: ["instance-credentials", id], queryFn: () => apiFetch<InstanceCredentials>(`/instances/${id}/credentials`), enabled: !!id, ...opts?.query });
}
export function useGetInstancePorts(id: string, opts?: { query?: Partial<UseQueryOptions<PortRule[]>> }) {
  return useQuery<PortRule[]>({ queryKey: ["instance-ports", id], queryFn: () => apiFetch<PortRule[]>(`/instances/${id}/ports`), enabled: !!id, ...opts?.query });
}
export function useDeployInstance(opts?: MutOpts<Instance, { data: { planId: string; customUsername?: string; customPassword?: string; location?: string } }>) {
  const qc = useQueryClient();
  return useMutation<Instance, ApiError, { data: { planId: string; customUsername?: string; customPassword?: string; location?: string } }>({
    mutationFn: ({ data }) => apiFetch<Instance>("/instances", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instances"] }); qc.invalidateQueries({ queryKey: ["wallet"] }); qc.invalidateQueries({ queryKey: ["dashboard-summary"] }); },
    ...opts?.mutation,
  });
}
export function useStartInstance(opts?: MutOpts<{ message: string }, string>) {
  const qc = useQueryClient();
  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: (id) => apiFetch(`/instances/${id}/start`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
    ...opts?.mutation,
  });
}
export function useStopInstance(opts?: MutOpts<{ message: string }, string>) {
  const qc = useQueryClient();
  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: (id) => apiFetch(`/instances/${id}/stop`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
    ...opts?.mutation,
  });
}
export function useRebootInstance(opts?: MutOpts<{ message: string }, string>) {
  const qc = useQueryClient();
  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: (id) => apiFetch(`/instances/${id}/reboot`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
    ...opts?.mutation,
  });
}
export function useAddInstancePort(instanceId: string, opts?: MutOpts<PortRule, { data: { port: number; protocol?: string; direction?: string; description?: string } }>) {
  const qc = useQueryClient();
  return useMutation<PortRule, ApiError, { data: { port: number; protocol?: string; direction?: string; description?: string } }>({
    mutationFn: ({ data }) => apiFetch<PortRule>(`/instances/${instanceId}/ports`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instance-ports", instanceId] }),
    ...opts?.mutation,
  });
}
export function useDeleteInstancePort(instanceId: string, opts?: MutOpts<{ message: string }, string>) {
  const qc = useQueryClient();
  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: (portId) => apiFetch(`/instances/${instanceId}/ports/${portId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instance-ports", instanceId] }),
    ...opts?.mutation,
  });
}

// ─── Support ─────────────────────────────────────────────────────────────────
export function useListSupportTickets(opts?: { query?: Partial<UseQueryOptions<SupportTicket[]>> }) {
  return useQuery<SupportTicket[]>({ queryKey: ["tickets"], queryFn: () => apiFetch<SupportTicket[]>("/support/tickets"), staleTime: 30_000, ...opts?.query });
}
export function useGetSupportTicket(id: string, opts?: { query?: Partial<UseQueryOptions<TicketDetail>> }) {
  return useQuery<TicketDetail>({ queryKey: ["ticket", id], queryFn: () => apiFetch<TicketDetail>(`/support/tickets/${id}`), enabled: !!id, staleTime: 15_000, ...opts?.query });
}
export function useCreateSupportTicket(opts?: MutOpts<SupportTicket, { data: { subject: string; message: string; priority?: string; category?: string } }>) {
  const qc = useQueryClient();
  return useMutation<SupportTicket, ApiError, { data: { subject: string; message: string; priority?: string; category?: string } }>({
    mutationFn: ({ data }) => apiFetch<SupportTicket>("/support/tickets", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
    ...opts?.mutation,
  });
}
export function useReplyToTicket(ticketId: string, opts?: MutOpts<{ message: string }, { data: { message: string } }>) {
  const qc = useQueryClient();
  return useMutation<{ message: string }, ApiError, { data: { message: string } }>({
    mutationFn: ({ data }) => apiFetch(`/support/tickets/${ticketId}/reply`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ticket", ticketId] }),
    ...opts?.mutation,
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export function useGetAdminStats(opts?: { query?: Partial<UseQueryOptions<AdminStats>> }) {
  return useQuery<AdminStats>({ queryKey: ["admin-stats"], queryFn: () => apiFetch<AdminStats>("/admin/stats"), staleTime: 30_000, ...opts?.query });
}
export function useGetAdminUsers(opts?: { query?: Partial<UseQueryOptions<AdminUser[]>> }) {
  return useQuery<AdminUser[]>({ queryKey: ["admin-users"], queryFn: () => apiFetch<AdminUser[]>("/admin/users"), staleTime: 30_000, ...opts?.query });
}
export function useAdjustUserWallet(opts?: MutOpts<{ message: string }, { userId: string; data: { amount: number; reason: string } }>) {
  const qc = useQueryClient();
  return useMutation<{ message: string }, ApiError, { userId: string; data: { amount: number; reason: string } }>({
    mutationFn: ({ userId, data }) => apiFetch(`/admin/users/${userId}/wallet`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
    ...opts?.mutation,
  });
}
export function useResetUserPassword(opts?: MutOpts<{ message: string }, { userId: string; data: { newPassword: string } }>) {
  return useMutation<{ message: string }, ApiError, { userId: string; data: { newPassword: string } }>({
    mutationFn: ({ userId, data }) => apiFetch(`/admin/users/${userId}/password`, { method: "PUT", body: JSON.stringify(data) }),
    ...opts?.mutation,
  });
}
export function useGetAdminInstances(opts?: { query?: Partial<UseQueryOptions<AdminInstance[]>> }) {
  return useQuery<AdminInstance[]>({ queryKey: ["admin-instances"], queryFn: () => apiFetch<AdminInstance[]>("/admin/instances"), staleTime: 30_000, ...opts?.query });
}
export function useAssignInstance(opts?: MutOpts<{ message: string; hostname: string }, { instanceId: string; data: { ip: string; username: string; password: string; hostname?: string } }>) {
  const qc = useQueryClient();
  return useMutation<{ message: string; hostname: string }, ApiError, { instanceId: string; data: { ip: string; username: string; password: string; hostname?: string } }>({
    mutationFn: ({ instanceId, data }) => apiFetch(`/admin/instances/${instanceId}/assign`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-instances"] }),
    ...opts?.mutation,
  });
}
export function useGetAdminTickets(opts?: { query?: Partial<UseQueryOptions<AdminTicket[]>> }) {
  return useQuery<AdminTicket[]>({ queryKey: ["admin-tickets"], queryFn: () => apiFetch<AdminTicket[]>("/admin/tickets"), staleTime: 30_000, ...opts?.query });
}
export function useGetAdminServerPool(opts?: { query?: Partial<UseQueryOptions<ServerPoolEntry[]>> }) {
  return useQuery<ServerPoolEntry[]>({ queryKey: ["admin-server-pool"], queryFn: () => apiFetch<ServerPoolEntry[]>("/admin/server-pool"), staleTime: 30_000, ...opts?.query });
}
export function useAddServerToPool(opts?: MutOpts<ServerPoolEntry, { data: { ip: string; rootUsername: string; rootPassword: string; type: string; location?: string } }>) {
  const qc = useQueryClient();
  return useMutation<ServerPoolEntry, ApiError, { data: { ip: string; rootUsername: string; rootPassword: string; type: string; location?: string } }>({
    mutationFn: ({ data }) => apiFetch<ServerPoolEntry>("/admin/server-pool", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-server-pool"] }),
    ...opts?.mutation,
  });
}
export function useAdminReplyTicket(opts?: MutOpts<{ message: string }, { ticketId: string; data: { message: string } }>) {
  const qc = useQueryClient();
  return useMutation<{ message: string }, ApiError, { ticketId: string; data: { message: string } }>({
    mutationFn: ({ ticketId, data }) => apiFetch(`/admin/tickets/${ticketId}/reply`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tickets"] }),
    ...opts?.mutation,
  });
}
export function useUpdateTicketStatus(opts?: MutOpts<{ message: string }, { ticketId: string; status: string }>) {
  const qc = useQueryClient();
  return useMutation<{ message: string }, ApiError, { ticketId: string; status: string }>({
    mutationFn: ({ ticketId, status }) => apiFetch(`/admin/tickets/${ticketId}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tickets"] }),
    ...opts?.mutation,
  });
}
