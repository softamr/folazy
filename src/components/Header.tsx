'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusSquare, UserCircle, LogIn, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useState, useEffect } from 'react';

export function Header() {
  const pathname = usePathname();
  // Simulate authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Avoid hydration mismatch by setting initial auth state on client
  useEffect(() => {
    // In a real app, you'd check localStorage or a cookie here
    // For now, we'll just keep it false or simulate a login
    // setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
  }, []);


  const handleLogout = () => {
    setIsAuthenticated(false);
    // In a real app, also clear token from localStorage/cookie
    // localStorage.removeItem('isAuthenticated');
  };
  
  // Simulate login for demonstration if on login page for easier testing
  // useEffect(() => {
  //   if (pathname === '/auth/login' || pathname === '/auth/signup') {
  //      // setIsAuthenticated(true); // Simulating login
  //      // localStorage.setItem('isAuthenticated', 'true');
  //   }
  // },[pathname]);


  const navLinks = [
    { href: '/', label: 'Browse', icon: <Home className="h-4 w-4" /> },
    { href: '/listings/new', label: 'Post Listing', icon: <PlusSquare className="h-4 w-4" /> },
  ];

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? 'secondary' : 'ghost'}
              asChild
              className="text-sm font-medium"
            >
              <Link href={link.href}>
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" />
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
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Mobile navigation (optional, could be a bottom bar for PWA feel) */}
      <div className="md:hidden border-t border-border p-2 flex justify-around">
        {navLinks.map((link) => (
          <Button
            key={link.href}
            variant={pathname === link.href ? 'secondary' : 'ghost'}
            asChild
            className="flex-col h-auto p-2"
          >
            <Link href={link.href} className="flex flex-col items-center">
              {link.icon}
              <span className="text-xs">{link.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </header>
  );
}
