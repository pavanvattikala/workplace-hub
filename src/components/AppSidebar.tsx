import { LayoutDashboard, FileText, ClipboardCheck } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAppContext } from '@/hooks/useAppContext';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'My Requests', url: '/my-requests', icon: FileText },
  { title: 'Pending Approvals', url: '/approvals', icon: ClipboardCheck },
];

export function AppSidebar() {
  const { currentUser } = useAppContext();

  return (
    <aside className="hidden md:flex w-60 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Brand */}
      <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm">W</span>
          </div>
          <span className="font-semibold text-sm text-sidebar-accent-foreground tracking-tight">WorkDesk</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === '/'}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-muted truncate">{currentUser.email}</p>
        <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{currentUser.name}</p>
      </div>
    </aside>
  );
}
