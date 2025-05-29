'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Search, ChevronDown, LogIn, UserCircle, MoreHorizontal } from 'lucide-react';
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
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useState, useEffect } from 'react';
import { mainSiteCategories } from '@/lib/placeholder-data';

export function Header() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Simulate auth

  useEffect(() => {
    // Simulate checking auth state on client, replace with actual auth logic
    // setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    // localStorage.removeItem('isAuthenticated');
    // Potentially redirect or show toast
  };

  const topNavItems = mainSiteCategories.filter(cat => cat.id === 'vehicles' || cat.id === 'properties');
  const mainNavItems = mainSiteCategories.filter(cat => cat.id !== 'vehicles' && cat.id !== 'properties');


  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      {/* Top Bar */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-2 ml-4">
          {topNavItems.map((item) => {
            const Icon = item.icon as LucideIcon; // Type assertion
            return (
            <Button key={item.id} variant="ghost" asChild className="text-sm font-medium text-foreground hover:text-primary">
              <Link href={`/category/${item.id}`}>
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {item.name}
              </Link>
            </Button>
            );
          })}
        </div>

        <div className="flex-grow mx-4 hidden md:flex items-center gap-2">
           <Select defaultValue="egypt">
            <SelectTrigger className="w-[120px] h-10 text-sm focus:ring-0">
              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="egypt">Egypt</SelectItem>
              <SelectItem value="uae">UAE</SelectItem>
              {/* Add other countries */}
            </SelectContent>
          </Select>
          <div className="relative flex-grow">
            <Input
              type="search"
              placeholder="Find Cars, Mobile Phones and more..."
              className="h-10 pl-4 pr-10 w-full"
            />
            <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4 text-primary-foreground" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="text-sm hidden md:inline-flex">العربية</Button>
          {isAuthenticated ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="avatar person"/>
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">User Name</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      user@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  {/* <LogOut className="mr-2 h-4 w-4" /> */}
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" asChild size="sm" className="text-sm">
              <Link href="/auth/login">Login</Link>
            </Button>
          )}
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/listings/new">Post Your Ad</Link>
          </Button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-secondary border-t border-b border-border">
        <div className="container mx-auto px-4 h-12 flex items-center justify-start md:justify-center space-x-1 md:space-x-3 overflow-x-auto">
          {mainNavItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              asChild
              size="sm"
              className={`text-xs sm:text-sm font-medium whitespace-nowrap ${pathname === `/category/${item.id}` ? 'text-primary font-semibold' : 'text-secondary-foreground hover:text-primary'}`}
            >
              <Link href={`/category/${item.id}`}>{item.name}</Link>
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}
