import React, { useState } from 'react';

/**
 * Small "Request admin access" link + form. Requests stay pending until the
 * super admin approves them in the Admin Control Panel → Admins tab.
 */
export function AdminAccessRequest() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', note: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admins/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Request failed. Please try again.');
      setDone(data.message || 'Request sent.');
      setForm({ name: '', username: '', email: '', password: '', note: '' });
    } catch (err: any) {
      setError(err?.message || 'Request failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-sm font-sans focus:outline-none focus:border-[#d0fe1d]';
  const label = 'block text-neutral-400 mb-1 font-mono uppercase text-[10px]';

  return (
    <>
      <p className="text-center text-[11px] text-neutral-500">
        Tournament staff?{' '}
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setDone(null);
            setError(null);
          }}
          className="text-[#d0fe1d] hover:underline cursor-pointer font-bold"
        >
          Request admin access
        </button>
      </p>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#141612] border border-[#d0fe1d]/40 rounded-3xl p-6 text-left space-y-4 my-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#d0fe1d] block">GDSL Secretariat</span>
                <h3 className="text-lg font-orbitron font-black text-white uppercase">Request Admin Access</h3>
                <p className="text-xs text-neutral-400 mt-1">The super admin must approve your request before you can sign in.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {done ? (
              <div className="space-y-4">
                <div role="status" className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-sm text-emerald-200">
                  {done}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black font-orbitron font-black uppercase text-xs cursor-pointer"
                >
                  OK
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <label className={label} htmlFor="req-name">Full name</label>
                  <input id="req-name" required className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className={label} htmlFor="req-username">Username</label>
                  <input
                    id="req-username"
                    required
                    pattern="[A-Za-z0-9._-]{3,40}"
                    title="3–40 characters: letters, numbers, dot, dash or underscore"
                    className={input}
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="req-email">Email</label>
                  <input id="req-email" required type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className={label} htmlFor="req-password">Password (min 10 characters)</label>
                  <input
                    id="req-password"
                    required
                    type="password"
                    minLength={10}
                    autoComplete="new-password"
                    className={input}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="req-note">Role / reason (optional)</label>
                  <input id="req-note" maxLength={300} className={input} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
                {error && (
                  <p role="alert" className="text-xs font-bold text-red-300">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] disabled:opacity-50 text-black font-orbitron font-black uppercase text-xs cursor-pointer"
                >
                  {busy ? 'Sending…' : 'Send Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
