import { LayoutDashboard, FileText, ClipboardCheck, X } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'My Requests', url: '/my-requests', icon: FileText },
  { title: 'Pending Approvals', url: '/approvals', icon: ClipboardCheck },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col animate-in slide-in-from-left">
        <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
          <span className="font-semibold text-sm text-sidebar-accent-foreground">WorkDesk</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-sidebar-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === '/'}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              onClick={onClose}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
