import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminMenu() {
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = (admin?.full_name || 'A')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2 transition hover:border-brand-300"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
          {initials}
        </div>
        <span className="text-sm font-medium">{admin?.full_name}</span>
        <ChevronDown size={16} className="text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-white shadow-card">
            <button
              onClick={() => navigate('/profile')}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-cream"
            >
              View profile
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/5"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
