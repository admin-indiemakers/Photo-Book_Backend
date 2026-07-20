import { NavLink } from 'react-router-dom';
import { LayoutGrid, Package, ShoppingBag, Users, UserCircle, Images, ShoppingCart, LayoutTemplate } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/carts', label: 'Cart Management', icon: ShoppingCart },
  { to: '/orders', label: 'Order Management', icon: ShoppingBag },
  { to: '/customers', label: 'Customers Management', icon: Users },
  { to: '/products', label: 'Products Management', icon: Package },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-white">
      {/* Signature: perforated film-strip header, nodding to the photo-print product line */}
      <div className="film-edge border-b border-border px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-soft">
            <Images size={18} strokeWidth={2.25} />
          </div>
          <div>
            <p className="font-display text-base font-bold leading-tight text-ink">Offline Living</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-brand-500">Admin Studio</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-muted hover:bg-cream hover:text-ink'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-6 py-4">
        <p className="text-[11px] text-muted">Offline Living Admin v1.0</p>
      </div>
    </aside>
  );
}
