import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
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
      setProfileMsg('Profile attributes updated successfully.');
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
      setPasswordMsg('Security credentials regenerated.');
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
    <AdminLayout title="Global Settings" subtitle="Manage administrative credentials and preferences">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-sm border border-border bg-white shadow-paper flex flex-col items-center text-center overflow-hidden h-max"
        >
          <div className="w-full bg-cream/30 border-b border-border py-8 flex flex-col items-center justify-center">
             <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-500 text-3xl font-editorial font-bold text-white shadow-md border-4 border-white">
              {initials}
            </div>
          </div>
          <div className="py-6 px-4 w-full">
            <p className="font-editorial text-2xl font-bold text-ink">{admin?.full_name}</p>
            <p className="font-functional text-xs text-muted mt-1">{admin?.email}</p>
            <div className="mt-4 border-t border-border/50 pt-4">
              <span className="inline-block rounded-sm bg-brand-50 border border-brand-500/20 px-3 py-1 font-functional text-[10px] uppercase tracking-widest font-bold text-brand-600">
                {admin?.role?.replace('_', ' ')} PRIVILEGES
              </span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6 lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-sm border border-border bg-white shadow-paper overflow-hidden"
          >
            <div className="border-b border-border bg-cream/30 px-6 py-4">
              <h3 className="font-editorial text-lg text-ink">Administrative Identity</h3>
            </div>
            
            <form onSubmit={handleProfileSave} className="p-8 space-y-8">
              {profileMsg && (
                <div className="flex items-center gap-2 rounded-sm border border-success/30 bg-success/5 px-4 py-3 font-functional text-xs text-success uppercase tracking-widest font-bold">
                  <CheckCircle2 size={16} /> {profileMsg}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block font-functional text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2">Display Name</label>
                  <input 
                    className="w-full bg-transparent border-0 border-b-2 border-border/50 pb-2 font-editorial text-xl text-ink focus:border-brand-500 focus:outline-none focus:ring-0 transition-colors px-0 placeholder:text-muted/30" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block font-functional text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2">Primary Email</label>
                  <input 
                    className="w-full bg-transparent border-0 border-b-2 border-border/20 pb-2 font-editorial text-xl text-muted/60 focus:outline-none focus:ring-0 px-0 cursor-not-allowed" 
                    value={admin?.email} 
                    disabled 
                  />
                  <p className="mt-2 font-functional text-[10px] text-muted uppercase tracking-widest">Email modifications require super admin clearance.</p>
                </div>
                <div>
                  <label className="block font-functional text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2">Direct Phone</label>
                  <input 
                    className="w-full bg-transparent border-0 border-b-2 border-border/50 pb-2 font-editorial text-xl text-ink focus:border-brand-500 focus:outline-none focus:ring-0 transition-colors px-0 placeholder:text-muted/30" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="+91..."
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <button type="submit" disabled={savingProfile} className="btn-primary w-full md:w-auto px-8 py-3 rounded-sm font-functional text-xs uppercase tracking-widest font-bold transition-all shadow-paper">
                  {savingProfile ? 'Committing...' : 'Commit Changes'}
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-sm border border-border bg-white shadow-paper overflow-hidden"
          >
            <div className="border-b border-border bg-cream/30 px-6 py-4">
              <h3 className="font-editorial text-lg text-ink">Security Credentials</h3>
            </div>
            
            <form onSubmit={handlePasswordSave} className="p-8 space-y-8">
              {passwordMsg && (
                <div className="rounded-sm border border-border bg-cream px-4 py-3 font-functional text-xs text-ink uppercase tracking-widest font-bold">
                  {passwordMsg}
                </div>
              )}

              <div>
                <label className="block font-functional text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2">New Password Key</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="w-full bg-transparent border-0 border-b-2 border-border/50 pb-2 font-editorial text-xl text-ink focus:border-ink focus:outline-none focus:ring-0 transition-colors px-0 placeholder:text-muted/30"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              
              <div className="pt-2">
                <button type="submit" disabled={savingPassword} className="bg-ink hover:bg-ink/90 text-white w-full md:w-auto px-8 py-3 rounded-sm font-functional text-xs uppercase tracking-widest font-bold transition-all shadow-paper disabled:opacity-50">
                  {savingPassword ? 'Regenerating...' : 'Regenerate Security Key'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
