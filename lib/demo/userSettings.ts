import type { UserSettings } from "@/types/pump";

let demoUsers: UserSettings[] = [
  {
    id: "user-1",
    name: "Admin User",
    email: "admin@hydroworks.local",
    role: "admin",
    phone: "(555) 100-0001",
    notifications_enabled: true,
    alert_email: true,
    alert_sms: true,
    created_at: "2025-12-01T08:00:00Z",
    updated_at: "2026-01-15T10:30:00Z",
  },
  {
    id: "user-2",
    name: "Field Operator",
    email: "operator@hydroworks.local",
    role: "operator",
    phone: "(555) 200-0002",
    notifications_enabled: true,
    alert_email: true,
    alert_sms: false,
    created_at: "2026-01-05T09:00:00Z",
    updated_at: "2026-01-20T14:00:00Z",
  },
  {
    id: "user-3",
    name: "Dashboard Viewer",
    email: "viewer@hydroworks.local",
    role: "viewer",
    phone: "",
    notifications_enabled: false,
    alert_email: false,
    alert_sms: false,
    created_at: "2026-02-01T12:00:00Z",
    updated_at: "2026-02-01T12:00:00Z",
  },
];

const delay = (ms: number = 150) => new Promise((r) => setTimeout(r, ms));

export async function getUsers(): Promise<UserSettings[]> {
  await delay();
  return [...demoUsers];
}

export async function getUser(id: string): Promise<UserSettings | null> {
  await delay();
  return demoUsers.find((u) => u.id === id) ?? null;
}

export async function createUser(
  data: Omit<UserSettings, "id" | "created_at" | "updated_at">
): Promise<UserSettings> {
  await delay();
  const now = new Date().toISOString();
  const user: UserSettings = {
    ...data,
    id: `user-${Date.now()}`,
    created_at: now,
    updated_at: now,
  };
  demoUsers = [user, ...demoUsers];
  return user;
}

export async function updateUser(
  id: string,
  data: Partial<Omit<UserSettings, "id" | "created_at" | "updated_at">>
): Promise<UserSettings | null> {
  await delay();
  const idx = demoUsers.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  demoUsers[idx] = {
    ...demoUsers[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return { ...demoUsers[idx] };
}

export async function deleteUser(id: string): Promise<boolean> {
  await delay();
  const before = demoUsers.length;
  demoUsers = demoUsers.filter((u) => u.id !== id);
  return demoUsers.length < before;
}
