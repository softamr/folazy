// src/app/admin/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { placeholderUsers } from '@/lib/placeholder-data';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching current user or auth status
    // In a real app, this would come from your auth context/hook
    const user = placeholderUsers.find(u => u.id === 'user1'); // Assuming user1 is the potential admin
    setCurrentUser(user || null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && (!currentUser || !currentUser.isAdmin)) {
      // router.push('/'); // Or a dedicated access denied page
      // For now, we'll let the page component handle the "Access Denied" message
      // to avoid layout shift before page content check.
    }
  }, [isLoading, currentUser, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading admin area...</p>
      </div>
    );
  }

  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/50 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-2xl text-destructive">
              <AlertTriangle className="mr-2 h-8 w-8" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              You do not have permission to access this area.
            </p>
            <Button asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
