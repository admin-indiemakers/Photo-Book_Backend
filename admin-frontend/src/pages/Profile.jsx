import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';

export default function Profile() {
  const { admin, setAdmin } = useAuth();
  const [fullName, setFullName] = useState(admin?.full_name || '');
  const [phone, setPhone] = useState(admin?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  async function handleProfileSave(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const res = await api.patch('/auth/profile', { full_name: fullName, phone });
      setAdmin(res.data.admin);
      localStorage.setItem('photolab_admin', JSON.stringify(res.data.admin));
      setProfileMsg('Profile updated.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMsg('');
    try {
      await api.post('/auth/change-password', { new_password: newPassword });
      setNewPassword('');
      setPasswordMsg('Password changed successfully.');
    } catch (err) {
      setPasswordMsg(err.response?.data?.error || 'Could not change password.');
    } finally {
      setSavingPassword(false);
    }
  }

  const initials = (admin?.full_name || 'A')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <AdminLayout title="Profile" subtitle="Manage your admin account.">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-600">
            {initials}
          </div>
          <p className="mt-3 font-display text-lg font-bold">{admin?.full_name}</p>
          <p className="text-sm text-muted">{admin?.email}</p>
          <span className="mt-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold capitalize text-brand-600">
            {admin?.role?.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <form onSubmit={handleProfileSave} className="card space-y-4">
            <h3 className="text-sm font-semibold text-ink">Profile details</h3>

            {profileMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-3.5 py-2.5 text-sm text-success">
                <CheckCircle2 size={16} /> {profileMsg}
              </div>
            )}

            <div>
              <label className="label-text">Full name</label>
              <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label-text">Email</label>
              <input className="input-field bg-cream" value={admin?.email} disabled />
              <p className="mt-1 text-xs text-muted">Email cannot be changed here — contact a super admin.</p>
            </div>
            <div>
              <label className="label-text">Phone</label>
              <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          <form onSubmit={handlePasswordSave} className="card space-y-4">
            <h3 className="text-sm font-semibold text-ink">Change password</h3>

            {passwordMsg && (
              <div className="rounded-xl border border-border bg-cream px-3.5 py-2.5 text-sm text-ink">{passwordMsg}</div>
            )}

            <div>
              <label className="label-text">New password</label>
              <input
                type="password"
                required
                minLength={8}
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <button type="submit" disabled={savingPassword} className="btn-primary">
              {savingPassword ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
