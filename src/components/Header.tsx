
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MapPin, Search, ChevronDown, LogIn, UserCircle, MoreHorizontal, Menu, X, MessageSquare, ListChecks, Settings, ShieldCheck, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/Logo';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useState, useEffect } from 'react';
import { mainSiteCategories, secondaryNavCategories, placeholderUsers, placeholderCategories } from '@/lib/placeholder-data';
import type { Category, User as UserType } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useLanguage, type Language as AppLanguage } from '@/hooks/useLanguage';

// Simple translation dictionary
const translations = {
  en: {
    login: 'Login',
    postYourAd: 'Post Your Ad',
    findPlaceholder: 'Find Cars, Mobile Phones and more...',
    egypt: 'Egypt',
    uae: 'UAE',
    vehicles: 'Vehicles',
    properties: 'Properties',
    electronics: 'Electronics',
    jobs: 'Jobs',
    furniture: 'Furniture & Decor',
    fashion: 'Fashion & Beauty',
    pets: 'Pets',
    kids: 'Kids & Babies',
    more: 'More',
    topCategories: 'Top Categories',
    allCategories: 'All Categories',
    arabic: 'العربية',
    english: 'English',
    profile: 'Profile',
    myListings: 'My Listings',
    messages: 'Messages',
    settings: 'Settings',
    adminDashboard: 'Admin Dashboard',
    logout: 'Log out',
    viewProfile: 'View Profile',
    loginSignUp: 'Login / Sign Up',
  },
  ar: {
    login: 'تسجيل الدخول',
    postYourAd: 'أضف إعلانك',
    findPlaceholder: 'ابحث عن سيارات، هواتف والمزيد...',
    egypt: 'مصر',
    uae: 'الإمارات',
    vehicles: 'مركبات',
    properties: 'عقارات',
    electronics: 'إلكترونيات',
    jobs: 'وظائف',
    furniture: 'أثاث وديكور',
    fashion: 'أزياء وجمال',
    pets: 'حيوانات أليفة',
    kids: 'أطفال ورضع',
    more: 'المزيد',
    topCategories: 'أهم الفئات',
    allCategories: 'جميع الفئات',
    arabic: 'العربية',
    english: 'English',
    profile: 'الملف الشخصي',
    myListings: 'إعلاناتي',
    messages: 'الرسائل',
    settings: 'الإعدادات',
    adminDashboard: 'لوحة تحكم المشرف',
    logout: 'تسجيل الخروج',
    viewProfile: 'عرض الملف الشخصي',
    loginSignUp: 'تسجيل الدخول / إنشاء حساب',
  }
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const t = translations[language];

  useEffect(() => {
    // Simulate fetching the current user.
    // In a real app, this would be an API call or auth context.
    const potentialUser = placeholderUsers.find(u => u.id === 'user1'); // Attempt to find a specific user (e.g., user1)

    if (potentialUser) {
      setIsAuthenticated(true);
      setCurrentUser(potentialUser);
    } else {
      // If no specific user found (e.g., placeholderUsers is empty or user1 doesn't exist)
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, []); // Runs once on mount


  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    router.push('/');
    alert('Logged out successfully');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const getCategoryName = (categoryId: string) => {
    const category = placeholderCategories.find(c => c.id === categoryId);
    if (!category) return categoryId; // fallback
    if (language === 'ar') {
      // This is a simplified mapping. A more robust solution would involve dedicated translation keys for categories.
      const arNames: Record<string, string> = {
        'vehicles': 'مركبات',
        'properties': 'عقارات',
        'electronics': 'إلكترونيات',
        'jobs': 'وظائف',
        'furniture': 'أثاث وديكور',
        'fashion': 'أزياء وجمال',
        'pets': 'حيوانات أليفة',
        'kids': 'أطفال ورضع',
        'more_categories': 'المزيد',
        // Add subcategories if needed
        'mobiles': 'هواتف محمولة',
        'cars-for-sale': 'سيارات للبيع',
        'hobbies': 'هوايات',
        'industrial': 'أعمال وصناعة',
        'services': 'خدمات',
      };
      return arNames[categoryId] || category.name;
    }
    return category.name;
  };


  const NavLink = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => (
    <Link href={href} passHref>
      <Button
        variant="ghost"
        size="sm"
        className={`text-xs sm:text-sm font-medium whitespace-nowrap ${pathname === href ? 'text-primary font-semibold' : 'text-secondary-foreground'} ${className || ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {children}
      </Button>
    </Link>
  );

  const renderCategoryWithSubcategories = (item: Category, isMobile: boolean = false) => {
    const categoryName = getCategoryName(item.id);
    if (!item.subcategories || item.subcategories.length === 0) {
      return <NavLink key={item.id} href={item.href || `/s/${item.id}`}>{categoryName}</NavLink>;
    }

    const TriggerComponent = (
      <Button
        variant="ghost"
        size="sm"
        className={`text-xs sm:text-sm font-medium whitespace-nowrap ${pathname.startsWith(item.href || `/s/${item.id}`) ? 'text-primary font-semibold' : 'text-secondary-foreground'} flex items-center`}
        onClick={isMobile ? (e) => e.preventDefault() : undefined}
      >
        {categoryName} <ChevronDown className="h-3 w-3 ms-1" />
      </Button>
    );

    return (
      <DropdownMenu key={item.id}>
        <DropdownMenuTrigger asChild>{TriggerComponent}</DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem asChild>
            <Link href={item.href || `/s/${item.id}`} className="font-semibold">
              {language === 'ar' ? `الكل في ${categoryName}` : `All in ${categoryName}`}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {item.subcategories.map((subItem) => (
            <DropdownMenuItem key={subItem.id} asChild>
              <Link href={subItem.href || `/s/${item.id}/${subItem.id}`}>{getCategoryName(subItem.id)}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser?.avatarUrl || "https://placehold.co/100x100.png"} alt="User Avatar" data-ai-hint="avatar person"/>
            <AvatarFallback>{currentUser?.name.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser?.id ? `${currentUser.id}@example.com` : 'guest@example.com'} {currentUser?.isAdmin && (language === 'ar' ? "(مشرف)" : "(Admin)")}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserCircle className="me-2 h-4 w-4" /> {t.profile}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile?tab=listings">
              <ListChecks className="me-2 h-4 w-4" /> {t.myListings}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/messages">
              <MessageSquare className="me-2 h-4 w-4" /> {t.messages}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile?tab=settings">
              <Settings className="me-2 h-4 w-4" /> {t.settings}
            </Link>
          </DropdownMenuItem>
          {currentUser?.isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">
                <ShieldCheck className="me-2 h-4 w-4" /> {t.adminDashboard}
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
           {t.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MobileNav = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-[280px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
              <Logo />
            </Link>
          </div>
          <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
            <h3 className="font-semibold text-sm px-2 text-muted-foreground">{t.topCategories}</h3>
            {mainSiteCategories.map((item) => {
              const Icon = item.icon as LucideIcon;
              return (
              <Button key={item.id} variant="ghost" asChild className="w-full justify-start text-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                <Link href={item.href || `/s/${item.id}`}>
                  {Icon && <Icon className="h-4 w-4 me-2" />}
                  {getCategoryName(item.id)}
                </Link>
              </Button>
              );
            })}
            <DropdownMenuSeparator/>
            <h3 className="font-semibold text-sm px-2 text-muted-foreground pt-2">{t.allCategories}</h3>
             {secondaryNavCategories.map((item) => (
               renderCategoryWithSubcategories(item, true)
            ))}

            <DropdownMenuSeparator/>
             <Button variant="ghost" size="sm" className="w-full justify-start text-sm" onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false);}}>
                <Globe className="me-2 h-4 w-4" /> {language === 'en' ? t.arabic : t.english}
             </Button>

          </nav>
          <div className="p-4 border-t mt-auto">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={currentUser.avatarUrl || "https://placehold.co/100x100.png"} alt={currentUser.name} data-ai-hint="avatar person"/>
                  <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{currentUser.name} {currentUser?.isAdmin && <span className="text-xs text-primary">({language === 'ar' ? "مشرف" : "Admin"})</span>}</p>
                  <Link href="/profile" className="text-xs text-primary hover:underline" onClick={() => setIsMobileMenuOpen(false)}>{t.viewProfile}</Link>
                </div>
              </div>
            ) : (
              <Button variant="outline" asChild className="w-full mb-2" onClick={() => setIsMobileMenuOpen(false)}>
                <Link href="/auth/login">{t.loginSignUp}</Link>
              </Button>
            )}
             {currentUser?.isAdmin && (
                 <Button variant="outline" asChild className="w-full mb-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <Link href="/admin/dashboard">{t.adminDashboard}</Link>
                 </Button>
            )}
            <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsMobileMenuOpen(false)}>
              <Link href="/listings/new">{t.postYourAd}</Link>
            </Button>
             {isAuthenticated && (
                <Button variant="ghost" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full mt-2">
                  {t.logout}
                </Button>
              )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );


  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      {/* Top Bar */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <MobileNav />
          </div>
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2 ms-4">
          {mainSiteCategories.map((item) => {
            const Icon = item.icon as LucideIcon;
            return (
            <Button key={item.id} variant="ghost" asChild className="text-sm font-medium text-foreground hover:text-primary">
              <Link href={item.href || `/s/${item.id}`}>
                {Icon && <Icon className="h-4 w-4 me-1" />}
                {getCategoryName(item.id)}
              </Link>
            </Button>
            );
          })}
        </div>

        <div className="flex-grow mx-4 hidden md:flex items-center gap-2">
           <Select defaultValue="egypt">
            <SelectTrigger className="w-[120px] h-10 text-sm focus:ring-0">
              <MapPin className="h-4 w-4 me-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="egypt">{t.egypt}</SelectItem>
              <SelectItem value="uae">{t.uae}</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-grow">
            <Input
              type="search"
              placeholder={t.findPlaceholder}
              className="h-10 ps-4 pe-10 w-full"
            />
            <Button type="submit" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4 text-primary-foreground" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="text-sm hidden md:inline-flex" onClick={toggleLanguage}>
            <Globe className="me-1 h-4 w-4" />
            {language === 'en' ? t.arabic : t.english}
          </Button>
          {isAuthenticated && currentUser ? (
             <UserMenu />
          ) : (
            <Button variant="ghost" asChild size="sm" className="text-sm hidden md:inline-flex">
              <Link href="/auth/login">{t.login}</Link>
            </Button>
          )}
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground hidden md:inline-flex">
            <Link href="/listings/new">{t.postYourAd}</Link>
          </Button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-secondary border-t border-b border-border hidden md:block">
        <div className="container mx-auto px-4 h-12 flex items-center justify-start md:justify-center space-x-1 md:space-x-3 overflow-x-auto">
          {secondaryNavCategories.map((item) => (
            renderCategoryWithSubcategories(item, false)
          ))}
        </div>
      </div>
    </header>
  );
}
