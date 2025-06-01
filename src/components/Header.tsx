'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MapPin, Search, ChevronDown, LogIn, UserCircle, MoreHorizontal, Menu, X, MessageSquare, ListChecks, Settings, ShieldCheck, Globe, LogOut as LogOutIcon, HelpCircle, LayoutGrid } from 'lucide-react';
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
import React, { useState, useEffect, useCallback } from 'react';
import type { Category, User as UserType } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext'; // Updated import path
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query as firestoreQuery, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import * as Icons from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; 

// Simple translation dictionary
const translations = {
  en: {
    login: 'Login',
    logout: 'Log out',
    postYourAd: 'Post Your Ad',
    findPlaceholder: 'Find Cars, Mobile Phones and more...',
    egypt: 'Egypt',
    uae: 'UAE',
    more: 'More',
    topCategories: 'Top Categories',
    allCategories: 'All Categories',
    browseAllListings: 'Browse All Listings',
    arabic: 'العربية',
    english: 'English',
    profile: 'Profile',
    myListings: 'My Listings',
    messages: 'Messages',
    settings: 'Settings',
    adminDashboard: 'Admin Dashboard',
    viewProfile: 'View Profile',
    loginSignUp: 'Login / Sign Up',
    loading: 'Loading...',
  },
  ar: {
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    postYourAd: 'أضف إعلانك',
    findPlaceholder: 'ابحث عن سيارات، هواتف والمزيد...',
    egypt: 'مصر',
    uae: 'الإمارات',
    more: 'المزيد',
    topCategories: 'أهم الفئات',
    allCategories: 'جميع الفئات',
    browseAllListings: 'تصفح كل الإعلانات',
    arabic: 'العربية',
    english: 'English',
    profile: 'الملف الشخصي',
    myListings: 'إعلاناتي',
    messages: 'الرسائل',
    settings: 'الإعدادات',
    adminDashboard: 'لوحة تحكم المشرف',
    viewProfile: 'عرض الملف الشخصي',
    loginSignUp: 'تسجيل الدخول / إنشاء حساب',
    loading: 'جار التحميل...',
  }
};

const PREDEFINED_MAIN_SITE_CATEGORY_IDS = ['vehicles', 'properties']; 
const MAX_SECONDARY_NAV_CATEGORIES = 7; 

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [mainSiteCategories, setMainSiteCategories] = useState<Category[]>([]);
  const [secondaryNavCategories, setSecondaryNavCategories] = useState<Category[]>([]);
  const [moreCategories, setMoreCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const t = translations[language];

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const categoriesRef = collection(db, 'categories');
        const q = firestoreQuery(categoriesRef, orderBy('name'));
        const querySnapshot = await getDocs(q);
        const fetchedCategories: Category[] = [];
        querySnapshot.forEach((docSnapshot) => {
          fetchedCategories.push({ id: docSnapshot.id, ...docSnapshot.data() } as Category);
        });
        setAllCategories(fetchedCategories);

        const mainCategories = fetchedCategories.filter(cat => PREDEFINED_MAIN_SITE_CATEGORY_IDS.includes(cat.id));
        setMainSiteCategories(mainCategories);

        const remainingCategories = fetchedCategories.filter(cat => !PREDEFINED_MAIN_SITE_CATEGORY_IDS.includes(cat.id));
        if (remainingCategories.length > MAX_SECONDARY_NAV_CATEGORIES) {
            setSecondaryNavCategories(remainingCategories.slice(0, MAX_SECONDARY_NAV_CATEGORIES -1)); 
            setMoreCategories(remainingCategories.slice(MAX_SECONDARY_NAV_CATEGORIES -1));
        } else {
            setSecondaryNavCategories(remainingCategories);
            setMoreCategories([]);
        }

      } catch (error) {
        console.error("Error fetching categories for header:", error);
        toast({ title: "Error", description: "Could not load site categories.", variant: "destructive" });
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [toast]);


  useEffect(() => {
    setIsLoadingAuth(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setCurrentUser(userDocSnap.data() as UserType);
            setIsAuthenticated(true);
          } else {
            setCurrentUser({
              id: user.uid, name: user.displayName || user.email || "User",
              email: user.email || "", avatarUrl: user.photoURL || "",
              joinDate: user.metadata.creationTime || new Date().toISOString(), isAdmin: false,
            });
            setIsAuthenticated(true);
            console.warn("User document not found in Firestore for UID:", user.uid, "Using basic auth data.");
          }
        } catch (error) {
          console.error("Error fetching user document for header:", error);
          setCurrentUser({
            id: user.uid, name: user.displayName || user.email || "User",
            email: user.email || "", avatarUrl: user.photoURL || "",
            joinDate: user.metadata.creationTime || new Date().toISOString(), isAdmin: false,
          });
          setIsAuthenticated(true);
          // toast({ title: "Profile Error", description: "Could not load full user details for header.", variant: "destructive" });
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [toast]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: t.logout, description: 'You have been successfully logged out.' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: 'Logout Failed', description: 'Could not log out. Please try again.', variant: 'destructive' });
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      router.push(`/s/all-listings?query=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push(`/s/all-listings`);
    }
    // setSearchQuery(''); // Clear search after submission - keeping it might be better UX
  };

  const getCategoryName = useCallback((category: Category): string => {
    if (language === 'ar') {
        const arNames: Record<string, string> = {
            // Main Categories
            'electronics': 'إلكترونيات',
            'vehicles': 'مركبات',
            'properties': 'عقارات',
            'jobs': 'وظائف',
            'furniture & home decor': 'أثاث وديكور منزلي',
            'furniture & decor': 'أثاث وديكور',
            'fashion & beauty': 'أزياء وجمال',
            'pets': 'حيوانات أليفة',
            'kids & babies': 'مستلزمات أطفال ورضع',
            'books, sports & hobbies': 'كتب، رياضة وهوايات',
            'services': 'خدمات',
            'business & industrial': 'أعمال وصناعة',
            'businesses & industrial': 'أعمال وصناعة',

            // Subcategories (by ID or English name as fallback)
            'mobiles': 'هواتف محمولة', 
            'mobile phones': 'هواتف محمولة',
            'tablets': 'أجهزة لوحية',
            'laptops': 'لابتوبات',
            'cameras': 'كاميرات',
            'phones & tablets': 'الهواتف والأجهزة اللوحية',

            'cars': 'سيارات',
            'cars for sale': 'سيارات للبيع',
            'cars for rent': 'سيارات للإيجار',
            'motorcycles': 'دراجات نارية',
            'auto accessories': 'اكسسوارات سيارات',
            'heavy vehicles': 'مركبات ثقيلة',

            'apartments for rent': 'شقق للإيجار',
            'villas for sale': 'فلل للبيع',
            'commercial for rent': 'تجاري للإيجار',
            'properties for rent': 'عقارات للإيجار',
            'properties for sale': 'عقارات للبيع',

            'accounting': 'محاسبة',
            'sales': 'مبيعات',
            'it': 'تكنولوجيا المعلومات', 

            'sofas': 'أرائك',
            'beds': 'أسرة',
            'home accessories': 'اكسسوارات منزلية',

            'clothing': 'ملابس',
            'shoes': 'أحذية',
            'jewelry': 'مجوهرات',

            'dogs': 'كلاب',
            'cats': 'قطط',
            'birds': 'طيور',

            'toys': 'ألعاب',
            'strollers': 'عربات أطفال',
            'baby gear': 'مستلزمات أطفال',

            'books': 'كتب',
            'sports equipment': 'معدات رياضية',
            'musical instruments': 'آلات موسيقية',

            'cleaning': 'تنظيف',
            'tutoring': 'دروس خصوصية',
            'repair': 'تصليح',

            'office equipment': 'معدات مكتبية',
            'heavy machinery': 'معدات ثقيلة',
            'supplies': 'لوازم أعمال',
        };
        const categoryIdLower = category.id.toLowerCase();
        const categoryNameLower = category.name.toLowerCase();

        if (arNames[categoryIdLower]) {
            return arNames[categoryIdLower];
        }
        if (arNames[categoryNameLower]) {
            return arNames[categoryNameLower];
        }
        return category.name; 
    }
    return category.name;
  }, [language]);


  const NavLink = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => (
    <Link href={href} passHref>
      <Button
        variant="ghost"
        size="sm"
        className={`text-xs sm:text-sm font-medium whitespace-nowrap ${pathname === href ? 'text-primary font-semibold' : 'text-secondary-foreground hover:bg-accent hover:text-accent-foreground'} ${className || ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {children}
      </Button>
    </Link>
  );

  const renderCategoryWithSubcategories = (item: Category, isMobile: boolean = false) => {
    const categoryName = getCategoryName(item);
    const categoryHref = item.href || `/s/${item.id}`;
    const IconComponent = item.iconName ? (Icons as any)[item.iconName] || HelpCircle : HelpCircle;

    if (!item.subcategories || item.subcategories.length === 0) {
      return (
        <NavLink key={item.id} href={categoryHref} className={`${isMobile ? "w-full justify-start" : ""} ${pathname === categoryHref ? 'text-primary font-semibold' : 'text-secondary-foreground hover:text-accent-foreground hover:bg-accent'}`}>
           {isMobile && <IconComponent className="h-4 w-4 me-2" />}
           {categoryName}
        </NavLink>
      );
    }

    const TriggerComponent = (
      <Button
        variant="ghost"
        size="sm"
        className={`text-xs sm:text-sm font-medium whitespace-nowrap ${pathname.startsWith(categoryHref) ? 'text-primary font-semibold' : 'text-secondary-foreground hover:bg-accent hover:text-accent-foreground'} flex items-center ${isMobile ? "w-full justify-between" : ""}`}
        onClick={isMobile ? (e) => e.preventDefault() : undefined}
      >
        <div className="flex items-center">
            {isMobile && <IconComponent className="h-4 w-4 me-2" />}
            {categoryName}
        </div>
        <ChevronDown className="h-3 w-3 ms-1" />
      </Button>
    );

    return (
      <DropdownMenu key={item.id}>
        <DropdownMenuTrigger asChild>{TriggerComponent}</DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56" sideOffset={isMobile ? 0 : 5}>
          <DropdownMenuItem asChild onClick={isMobile ? () => setIsMobileMenuOpen(false) : undefined}>
            <Link href={categoryHref} className="font-semibold">
              {language === 'ar' ? `كل ${categoryName}` : `All ${categoryName}`}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {item.subcategories.map((subItem) => (
            <DropdownMenuItem key={subItem.id} asChild onClick={isMobile ? () => setIsMobileMenuOpen(false) : undefined}>
              <Link href={subItem.href || `/s/${item.id}/${subItem.id}`}>{getCategoryName(subItem)}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const UserMenu = () => {
    if (isLoadingAuth) {
        return (
             <Button variant="ghost" size="sm" className="text-sm hidden md:inline-flex">{t.loading}</Button>
        );
    }
    if (!isAuthenticated || !currentUser) {
        return (
            <Button variant="ghost" asChild size="sm" className="text-sm hidden md:inline-flex">
                <Link href="/auth/login">{t.login}</Link>
            </Button>
        );
    }
    return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-auto px-2 py-1.5 rounded-md flex flex-col items-center space-y-0.5 group hover:bg-transparent">
            <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.avatarUrl || "https://placehold.co/100x100.png"} alt={currentUser?.name || "User"} data-ai-hint="avatar person"/>
                <AvatarFallback>{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-[10px] leading-tight text-muted-foreground group-hover:text-primary group-hover:underline">{t.profile}</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                {currentUser?.email} {currentUser?.isAdmin && (language === 'ar' ? "(مشرف)" : "(Admin)")}
                </p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            <DropdownMenuItem asChild><Link href="/profile"><UserCircle className="me-2 h-4 w-4" /> {t.profile}</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/profile?tab=listings"><ListChecks className="me-2 h-4 w-4" /> {t.myListings}</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/messages"><MessageSquare className="me-2 h-4 w-4" /> {t.messages}</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/profile?tab=settings"><Settings className="me-2 h-4 w-4" /> {t.settings}</Link></DropdownMenuItem>
            {currentUser?.isAdmin && (<DropdownMenuItem asChild><Link href="/admin/dashboard"><ShieldCheck className="me-2 h-4 w-4" /> {t.adminDashboard}</Link></DropdownMenuItem>)}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}><LogOutIcon className="me-2 h-4 w-4" /> {t.logout}</DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    );
  };
  
  const MobileNav = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" /> <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-[280px] p-0 flex flex-col">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}><Logo /></Link>
        </div>
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          <NavLink href="/s/all-listings" className="w-full justify-start">
            <LayoutGrid className="h-4 w-4 me-2" /> {t.browseAllListings}
          </NavLink>
          <DropdownMenuSeparator className="my-2"/>
          <h3 className="font-semibold text-sm px-2 text-muted-foreground">{t.topCategories}</h3>
          {isLoadingCategories ? Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-8 w-full my-1"/>) : 
            mainSiteCategories.map((item) => renderCategoryWithSubcategories(item, true))
          }
          <DropdownMenuSeparator className="my-2"/>
          <h3 className="font-semibold text-sm px-2 text-muted-foreground pt-1">{t.allCategories}</h3>
          {isLoadingCategories ? Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-8 w-full my-1"/>) : 
            <>
              {secondaryNavCategories.map((item) => renderCategoryWithSubcategories(item, true))}
              {moreCategories.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between text-sm items-center">
                      <div className="flex items-center"> <MoreHorizontal className="h-4 w-4 me-2"/> {t.more} </div>
                      <ChevronDown className="h-3 w-3 ms-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={0} align="start" className="w-[245px]">
                    {moreCategories.map(item => (
                        renderCategoryWithSubcategories(item, true)
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          }
          <DropdownMenuSeparator className="my-2"/>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sm" onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false);}}>
              <Globe className="me-2 h-4 w-4" /> {language === 'en' ? t.arabic : t.english}
          </Button>
        </nav>
        <div className="p-4 border-t mt-auto">
          {isLoadingAuth ? <Skeleton className="h-10 w-full mb-2"/> :
           isAuthenticated && currentUser ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-9 w-9"><AvatarImage src={currentUser.avatarUrl || "https://placehold.co/100x100.png"} alt={currentUser.name} data-ai-hint="avatar person"/><AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                <div>
                  <p className="text-sm font-medium">{currentUser.name} {currentUser?.isAdmin && <span className="text-xs text-primary">({language === 'ar' ? "مشرف" : "Admin"})</span>}</p>
                  <Link href="/profile" className="text-xs text-primary hover:underline" onClick={() => setIsMobileMenuOpen(false)}>{t.viewProfile}</Link>
                </div>
              </div>
              {currentUser?.isAdmin && (<Button variant="outline" asChild className="w-full mb-2" onClick={() => setIsMobileMenuOpen(false)}><Link href="/admin/dashboard">{t.adminDashboard}</Link></Button>)}
              <Button variant="ghost" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full mt-1"><LogOutIcon className="me-2 h-4 w-4" /> {t.logout}</Button>
            </>
          ) : (
            <Button variant="outline" asChild className="w-full mb-2" onClick={() => setIsMobileMenuOpen(false)}><Link href="/auth/login">{t.loginSignUp}</Link></Button>
          )}
          <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2" onClick={() => setIsMobileMenuOpen(false)}><Link href="/listings/new">{t.postYourAd}</Link></Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      {/* Top Bar */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2 shrink-0"><Logo /></Link>
        </div>

        <div className="hidden md:flex items-center gap-1 ms-4">
          {isLoadingCategories ? Array.from({length:2}).map((_,i)=><Skeleton key={i} className="h-8 w-24"/>) :
            mainSiteCategories.map((item) => {
            const Icon = item.iconName ? (Icons as any)[item.iconName] || HelpCircle : HelpCircle;
            return (
            <Button key={item.id} variant="ghost" asChild className="text-sm font-medium text-foreground hover:text-primary">
              <Link href={item.href || `/s/${item.id}`}>
                <Icon className="h-4 w-4 me-1" /> {getCategoryName(item)}
              </Link>
            </Button>
            );
          })}
        </div>

        <form onSubmit={handleSearch} className="flex-grow mx-4 hidden md:flex items-center gap-2">
           <Select defaultValue="egypt">
            <SelectTrigger className="w-[120px] h-10 text-sm focus:ring-0">
              <MapPin className="h-4 w-4 me-1 text-muted-foreground" /><SelectValue />
            </SelectTrigger>
            <SelectContent><SelectItem value="egypt">{t.egypt}</SelectItem><SelectItem value="uae">{t.uae}</SelectItem></SelectContent>
          </Select>
          <div className="relative flex-grow">
            <Input 
              type="search" 
              placeholder={t.findPlaceholder} 
              className="h-10 ps-4 pe-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4 text-primary-foreground" />
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="text-sm hidden md:inline-flex" onClick={toggleLanguage}><Globe className="me-1 h-4 w-4" />{language === 'en' ? t.arabic : t.english}</Button>
          <UserMenu />
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground hidden md:inline-flex"><Link href="/listings/new">{t.postYourAd}</Link></Button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-secondary border-t border-b border-border hidden md:block">
        <div className="container mx-auto px-4 h-12 flex items-center justify-start md:justify-center space-x-1 md:space-x-3 overflow-x-auto">
           {isLoadingCategories ? <Skeleton className="h-8 w-36"/> : (
            <NavLink href="/s/all-listings" className="flex items-center">
              <LayoutGrid className="h-4 w-4 me-1" /> {t.browseAllListings}
            </NavLink>
           )}
          {isLoadingCategories ? Array.from({length:MAX_SECONDARY_NAV_CATEGORIES -1}).map((_,i)=><Skeleton key={i} className="h-8 w-28"/>) :
          <>
            {secondaryNavCategories.map((item) => renderCategoryWithSubcategories(item, false))}
            {moreCategories.length > 0 && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs sm:text-sm font-medium whitespace-nowrap text-secondary-foreground hover:bg-accent hover:text-accent-foreground flex items-center">
                            {t.more} <ChevronDown className="h-3 w-3 ms-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                    {moreCategories.map((item) => (
                        renderCategoryWithSubcategories(item, false) 
                    ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
          </>
          }
        </div>
      </div>
    </header>
  );
}
