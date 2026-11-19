import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../services/apiClient';

/**
 * Super admin only: register admins, approve or reject access requests,
 * disable / re-enable accounts, reset passwords and remove admins.
 */

interface AdminAccount {
  id: string;
  username: string;
  email: string;
  name: string;
  status: 'pending' | 'active' | 'disabled';
  createdAt: string;
  createdBy: 'super_admin' | 'request';
  requestNote?: string;
  approvedAt?: string;
  lastLoginAt?: string;
}

const MIN_PASSWORD = 6;

function formatDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

const inputClass =
  'w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white text-sm font-sans focus:outline-none focus:border-[#d0fe1d]';
const labelClass = 'block text-neutral-400 mb-1 font-mono uppercase text-[10px]';

export function AdminAccountsView() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admins');
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not load admin accounts.');
      setAdmins(data.admins);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load admin accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 4000);
  };

  const call = async (id: string, method: 'PATCH' | 'DELETE', body?: object, successMessage?: string) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await apiFetch(`/api/admins/${encodeURIComponent(id)}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Action failed.');
      if (successMessage) flash(successMessage);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Action failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await apiFetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not create admin.');
      flash(`Admin "${data.admin.username}" registered. Share the password with them securely.`);
      setForm({ name: '', username: '', email: '', password: '' });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not create admin.');
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = (admin: AdminAccount) => {
    const password = window.prompt(`New password for ${admin.username} (at least ${MIN_PASSWORD} characters):`);
    if (!password) return;
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    void call(admin.id, 'PATCH', { password }, `Password reset for ${admin.username}.`);
  };

  const handleRemove = (admin: AdminAccount, verb: 'Reject' | 'Remove') => {
    if (!window.confirm(`${verb} ${admin.name} (${admin.username})? This cannot be undone.`)) return;
    void call(admin.id, 'DELETE', undefined, `${admin.username} ${verb === 'Reject' ? 'rejected' : 'removed'}.`);
  };

  const pending = admins.filter((a) => a.status === 'pending');
  const others = admins.filter((a) => a.status !== 'pending');

  const statusBadge = (status: AdminAccount['status']) =>
    status === 'active'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
      : status === 'pending'
      ? 'bg-amber-400/15 text-amber-300 border-amber-400/40'
      : 'bg-red-500/15 text-red-300 border-red-500/40';

  const btn = 'px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase border transition-all cursor-pointer disabled:opacity-50';

  return (
    <div className="space-y-6">
      <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#d0fe1d] block">Super Admin</span>
        <h3 className="text-lg font-orbitron font-black text-white uppercase mt-1">Admin Accounts</h3>
        <p className="text-xs text-neutral-400 mt-1">
          Only admins you register here, or whose access request you approve, can sign in to the control panel. Disabling or
          removing an admin signs them out immediately.
        </p>
      </div>

      {notice && (
        <div role="status" className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200">
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Pending requests */}
      <div className="bg-[#141612] border border-white/10 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-orbitron font-bold text-white uppercase">
          Access Requests {pending.length > 0 && <span className="text-amber-300">({pending.length})</span>}
        </h4>
        {pending.length === 0 ? (
          <p className="text-xs text-neutral-500 font-mono">No pending requests.</p>
        ) : (
          pending.map((a) => (
            <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-black/40 border border-amber-400/30">
              <div className="text-xs space-y-0.5 min-w-0">
                <div className="text-white font-bold">
                  {a.name} <span className="text-neutral-400 font-mono">@{a.username}</span>
                </div>
                <div className="text-neutral-400 font-mono break-all">{a.email}</div>
                {a.requestNote && <div className="text-neutral-300 italic">&ldquo;{a.requestNote}&rdquo;</div>}
                <div className="text-neutral-500 font-mono">Requested {formatDate(a.createdAt)}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={() => call(a.id, 'PATCH', { status: 'active' }, `${a.username} approved and can now sign in.`)}
                  className={`${btn} bg-[#d0fe1d] text-black border-[#d0fe1d] hover:bg-[#e2ff54]`}
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={() => handleRemove(a, 'Reject')}
                  className={`${btn} bg-transparent text-red-300 border-red-500/40 hover:bg-red-500/10`}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Existing admins */}
      <div className="bg-[#141612] border border-white/10 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-orbitron font-bold text-white uppercase">Admins</h4>
        {loading ? (
          <p className="text-xs text-neutral-500 font-mono">Loading…</p>
        ) : others.length === 0 ? (
          <p className="text-xs text-neutral-500 font-mono">No admins yet. Register one below.</p>
        ) : (
          others.map((a) => (
            <div key={a.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="text-xs space-y-0.5 min-w-0">
                <div className="text-white font-bold flex items-center gap-2 flex-wrap">
                  {a.name} <span className="text-neutral-400 font-mono">@{a.username}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase ${statusBadge(a.status)}`}>{a.status}</span>
                </div>
                <div className="text-neutral-400 font-mono break-all">{a.email}</div>
                <div className="text-neutral-500 font-mono">
                  {a.createdBy === 'request' ? 'Approved request' : 'Registered by super admin'} · Last sign-in {formatDate(a.lastLoginAt)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {a.status === 'active' ? (
                  <button
                    type="button"
                    disabled={busyId === a.id}
                    onClick={() => call(a.id, 'PATCH', { status: 'disabled' }, `${a.username} disabled and signed out.`)}
                    className={`${btn} bg-transparent text-amber-300 border-amber-400/40 hover:bg-amber-400/10`}
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === a.id}
                    onClick={() => call(a.id, 'PATCH', { status: 'active' }, `${a.username} re-enabled.`)}
                    className={`${btn} bg-transparent text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/10`}
                  >
                    Enable
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={() => handleResetPassword(a)}
                  className={`${btn} bg-white/5 text-white border-white/20 hover:bg-white/10`}
                >
                  Reset password
                </button>
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={() => handleRemove(a, 'Remove')}
                  className={`${btn} bg-transparent text-red-300 border-red-500/40 hover:bg-red-500/10`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Register new admin */}
      <form onSubmit={handleCreate} className="bg-[#141612] border border-white/10 rounded-2xl p-5 space-y-4">
        <h4 className="text-sm font-orbitron font-bold text-white uppercase">Register an Admin</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="new-admin-name">Full name</label>
            <input id="new-admin-name" required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="new-admin-username">Username</label>
            <input
              id="new-admin-username"
              required
              pattern="[A-Za-z0-9._-]{3,40}"
              title="3–40 characters: letters, numbers, dot, dash or underscore"
              className={inputClass}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="new-admin-email">Email</label>
            <input id="new-admin-email" required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="new-admin-password">Password (min {MIN_PASSWORD} characters)</label>
            <input
              id="new-admin-password"
              required
              type="password"
              minLength={MIN_PASSWORD}
              autoComplete="new-password"
              className={inputClass}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="px-5 py-2.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] disabled:opacity-50 text-black font-orbitron font-black uppercase text-xs tracking-wider cursor-pointer"
        >
          {creating ? 'Registering…' : 'Register Admin'}
        </button>
      </form>
    </div>
  );
}
