// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/Logo';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/listings', label: 'Listing Management', icon: FileText },
  // { href: '/admin/settings', label: 'Admin Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-muted/40 border-r flex flex-col">
      <div className="h-16 flex items-center justify-center border-b px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo />
          <span className="ml-1 text-lg">Admin</span>
        </Link>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start', isActive && 'font-semibold')}
            >
              <Link href={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Button variant="outline" asChild className="w-full justify-start">
            <Link href="/">
                <ShieldCheck className="mr-2 h-4 w-4 transform rotate-180 scale-x-[-1]" /> 
                Exit Admin View
            </Link>
        </Button>
      </div>
    </aside>
  );
}
