import { useAppContext } from '@/hooks/useAppContext';
import { Switch } from '@/components/ui/switch';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { MobileNav } from '@/components/MobileNav';

export function AppHeader() {
  const { currentUser, toggleRole } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-accent"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold tracking-tight hidden md:block">
            Workplace Access Portal
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Requester</span>
          <Switch
            checked={currentUser.role === 'Approver'}
            onCheckedChange={toggleRole}
          />
          <span className="text-xs text-muted-foreground">Approver</span>
          <div className="ml-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-foreground">
              {currentUser.name.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
