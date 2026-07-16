import Sidebar from './Sidebar.jsx';
import AdminMenu from './AdminMenu.jsx';

export default function AdminLayout({ title, subtitle, headerExtra, children }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-white px-8 py-5">
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {headerExtra}
            <AdminMenu />
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
