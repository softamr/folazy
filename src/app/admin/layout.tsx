// src/app/admin/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseAuthUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as User;
            setCurrentUser(userData);
            if (!userData.isAdmin) {
              setAccessDenied(true);
            } else {
              setAccessDenied(false);
            }
          } else {
            console.error("No user document found in Firestore for admin check:", user.uid);
            toast({ title: "Admin Access Error", description: "Could not verify admin status.", variant: "destructive" });
            setCurrentUser(null);
            setAccessDenied(true);
          }
        } catch (error) {
          console.error("Error fetching user document for admin check:", error);
          toast({ title: "Admin Access Error", description: "Failed to verify admin status.", variant: "destructive" });
          setCurrentUser(null);
          setAccessDenied(true);
        }
      } else {
        setFirebaseAuthUser(null);
        setCurrentUser(null);
        setAccessDenied(true); // No user logged in, so deny access
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/50 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  if (accessDenied || !currentUser || !currentUser.isAdmin) {
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
              You do not have permission to access this area. Please log in as an administrator.
            </p>
            <Button asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
             {!firebaseAuthUser && (
                <Button asChild variant="link" className="mt-2">
                  <Link href="/auth/login">Login</Link>
                </Button>
            )}
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
