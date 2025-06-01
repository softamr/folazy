
// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, ShieldCheck, ListOrdered, MapPinned, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/Logo';
import { useLanguage } from '@/contexts/LanguageContext'; // Updated import path

const translations = {
  en: {
    dashboard: 'Dashboard',
    userManagement: 'User Management',
    listingManagement: 'Listing Management',
    categoryManagement: 'Category Management',
    locationManagement: 'Location Management',
    heroSettings: 'Hero Banner Settings',
    adminSettings: 'Admin Settings', // Kept for completeness if added back
    adminArea: 'Admin',
    exitAdminView: 'Exit Admin View',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    userManagement: 'إدارة المستخدمين',
    listingManagement: 'إدارة الإعلانات',
    categoryManagement: 'إدارة الفئات',
    locationManagement: 'إدارة المواقع',
    heroSettings: 'إعدادات بانر الصفحة الرئيسية',
    adminSettings: 'إعدادات المسؤول',
    adminArea: 'المسؤول',
    exitAdminView: 'الخروج من عرض المسؤول',
  }
};

export function AdminSidebar() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language];

  const adminNavItems = [
    { href: '/admin/dashboard', label: t.dashboard, icon: LayoutDashboard },
    { href: '/admin/users', label: t.userManagement, icon: Users },
    { href: '/admin/listings', label: t.listingManagement, icon: FileText },
    { href: '/admin/categories', label: t.categoryManagement, icon: ListOrdered },
    { href: '/admin/locations', label: t.locationManagement, icon: MapPinned },
    { href: '/admin/hero-settings', label: t.heroSettings, icon: ImageIcon },
    // { href: '/admin/settings', label: t.adminSettings, icon: Settings },
  ];

  return (
    <aside className={`w-64 bg-muted/40 ${language === 'ar' ? 'border-l' : 'border-r'} flex flex-col`}>
      <div className="h-16 flex items-center justify-center border-b px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo />
          <span className="ms-1 text-lg">{t.adminArea}</span>
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
                <Icon className={`${language === 'ar' ? 'ms-2' : 'me-2'} h-4 w-4`} />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Button variant="outline" asChild className="w-full justify-start">
            <Link href="/">
                <ShieldCheck className={`${language === 'ar' ? 'ms-2' : 'me-2'} h-4 w-4 transform ${language === 'ar' ? '' : 'rotate-180 scale-x-[-1]'}`} /> 
                {t.exitAdminView}
            </Link>
        </Button>
      </div>
    </aside>
  );
}
