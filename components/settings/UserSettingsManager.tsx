"use client";

import { useState, useEffect, useRef } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/demo/userSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, AlertTriangle, Users, MoreVertical, HelpCircle, ChevronDown } from "lucide-react";
import type { UserSettings, UserRole } from "@/types/pump";

const roleBadgeClass: Record<UserRole, string> = {
  admin: "bg-blue-500 text-white border-transparent",
  operator: "bg-orange-500 text-white border-transparent",
  viewer: "bg-muted text-muted-foreground border-transparent",
};

const emptyForm = {
  name: "",
  email: "",
  role: "viewer" as UserRole,
  phone: "",
  notifications_enabled: false,
  alert_email: false,
  alert_sms: false,
};

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "operator", label: "Operator" },
  { value: "viewer", label: "Viewer" },
];

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full access — manage users, pumps, and all settings",
  operator: "Can control pumps, acknowledge alerts, and view data",
  viewer: "Read-only access to dashboards and alerts",
};

function RoleSelect({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (role: UserRole) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) setTooltipOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = ROLE_OPTIONS.find((r) => r.value === value)!;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Label htmlFor="user-role">Role</Label>
        <div className="relative" ref={tooltipRef}>
          <button
            type="button"
            onClick={() => setTooltipOpen((p) => !p)}
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
          {tooltipOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 rounded-lg bg-foreground text-background text-xs p-3 shadow-lg z-[9999]">
              <div className="absolute left-3 bottom-full w-0 h-0 border-x-[6px] border-x-transparent border-b-[6px] border-b-foreground" />
              <ul className="space-y-1.5">
                {ROLE_OPTIONS.map((r) => (
                  <li key={r.value}>
                    <span className="font-semibold">{r.label}:</span>{" "}
                    {ROLE_DESCRIPTIONS[r.value]}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="relative" ref={ref}>
        <button
          type="button"
          id="user-role"
          onClick={() => setOpen((p) => !p)}
          className="flex h-9 w-full items-center justify-between rounded-xl border border-input bg-background px-3 text-sm hover:bg-accent/50 transition-colors"
        >
          <span>{selected.label}</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 w-full rounded-xl border border-input bg-background shadow-lg z-50 overflow-hidden">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => {
                  onChange(r.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-2 text-sm hover:bg-accent/50 transition-colors ${
                  r.value === value ? "bg-accent font-medium" : ""
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const UserSettingsManager = () => {
  const [users, setUsers] = useState<UserSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSettings | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserSettings | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpenId) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpenId]);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (user: UserSettings) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      notifications_enabled: user.notifications_enabled,
      alert_email: user.alert_email,
      alert_sms: user.alert_sms,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        const updated = await updateUser(editingUser.id, formData);
        if (updated) {
          setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
        }
      } else {
        const created = await createUser(formData);
        setUsers([created, ...users]);
      }
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const success = await deleteUser(deleteTarget.id);
      if (success) {
        setUsers(users.filter((u) => u.id !== deleteTarget.id));
      }
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription className="mt-1">
              Create, edit, and remove user accounts and notification preferences
            </CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No users configured</p>
              <Button size="sm" className="mt-3" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add First User
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{user.name}</span>
                      <Badge className={roleBadgeClass[user.role]}>{user.role}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5 truncate">{user.email}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {user.phone && <span>{user.phone}</span>}
                      {user.notifications_enabled && (
                        <span className="text-green-600 dark:text-green-400">Notifications on</span>
                      )}
                      {user.alert_email && <span>Email alerts</span>}
                      {user.alert_sms && <span>SMS alerts</span>}
                    </div>
                  </div>
                  <div ref={menuOpenId === user.id ? menuRef : undefined} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setMenuOpenId(menuOpenId === user.id ? null : user.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent/60 transition-colors"
                      aria-label="User actions"
                    >
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {menuOpenId === user.id && (
                      <div className="absolute right-0 top-8 z-50 min-w-[120px] rounded-md border bg-popover text-popover-foreground shadow-md p-1">
                        <button
                          type="button"
                          onClick={() => { setMenuOpenId(null); openEdit(user); }}
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => { setMenuOpenId(null); setDeleteTarget(user); }}
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit User Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingUser ? "Edit User" : "Add User"}
        description={editingUser ? "Update user details and preferences" : "Create a new user account"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                className="h-9"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <RoleSelect
              value={formData.role}
              onChange={(role) => setFormData({ ...formData, role })}
            />
            <div className="space-y-1">
              <Label htmlFor="user-phone">Phone</Label>
              <Input
                id="user-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 000-0000"
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <h3 className="text-base font-semibold">Notification Preferences</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifications_enabled}
                  onChange={(e) => setFormData({ ...formData, notifications_enabled: e.target.checked })}
                  className="rounded border-input"
                />
                Enable notifications
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.alert_email}
                  onChange={(e) => setFormData({ ...formData, alert_email: e.target.checked })}
                  className="rounded border-input"
                />
                Email alerts
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.alert_sms}
                  onChange={(e) => setFormData({ ...formData, alert_sms: e.target.checked })}
                  className="rounded border-input"
                />
                SMS alerts
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete User"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm">
              Are you sure you want to delete <span className="font-semibold">{deleteTarget?.name}</span>?
            </p>
            <p className="text-xs text-muted-foreground mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
