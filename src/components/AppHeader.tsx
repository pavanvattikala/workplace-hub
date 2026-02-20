import { useAppContext, ALL_USERS } from '@/hooks/useAppContext';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { MobileNav } from '@/components/MobileNav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AppHeader() {
  const { currentUser, setCurrentUser } = useAppContext();
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
          <span className="text-xs text-muted-foreground hidden sm:inline-block">Logged in as:</span>
          
          {/* --- NEW FEATURE: User Switcher Dropdown --- */}
          <Select
            value={currentUser.id}
            onValueChange={(userId) => {
              const selectedUser = ALL_USERS.find((u) => u.id === userId);
              if (selectedUser) setCurrentUser(selectedUser);
            }}
          >
            <SelectTrigger className="w-[200px] h-8 text-xs bg-background">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {ALL_USERS.map((user) => (
                <SelectItem key={user.id} value={user.id} className="text-xs">
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* User Avatar */}
          <div className="ml-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary-foreground">
              {currentUser.name.charAt(0)}
            </span>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}