
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
import { useLanguage } from '@/contexts/LanguageContext'; // Updated import path

const translations = {
  en: {
    verifyingAccess: "Verifying admin access...",
    accessDeniedTitle: "Access Denied",
    accessDeniedDescription: "You do not have permission to access this area. Please log in as an administrator.",
    goToHomepageButton: "Go to Homepage",
    loginButton: "Login",
    adminAccessErrorTitle: "Admin Access Error",
    couldNotVerifyStatus: "Could not verify admin status.",
    failedToVerifyStatus: "Failed to verify admin status.",
  },
  ar: {
    verifyingAccess: "جار التحقق من صلاحية المسؤول...",
    accessDeniedTitle: "تم رفض الوصول",
    accessDeniedDescription: "ليس لديك إذن للوصول إلى هذه المنطقة. يرجى تسجيل الدخول كمسؤول.",
    goToHomepageButton: "الذهاب إلى الصفحة الرئيسية",
    loginButton: "تسجيل الدخول",
    adminAccessErrorTitle: "خطأ في صلاحية المسؤول",
    couldNotVerifyStatus: "تعذر التحقق من حالة المسؤول.",
    failedToVerifyStatus: "فشل التحقق من حالة المسؤول.",
  }
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

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
            toast({ title: t.adminAccessErrorTitle, description: t.couldNotVerifyStatus, variant: "destructive" });
            setCurrentUser(null);
            setAccessDenied(true);
          }
        } catch (error) {
          console.error("Error fetching user document for admin check:", error);
          toast({ title: t.adminAccessErrorTitle, description: t.failedToVerifyStatus, variant: "destructive" });
          setCurrentUser(null);
          setAccessDenied(true);
        }
      } else {
        setFirebaseAuthUser(null);
        setCurrentUser(null);
        setAccessDenied(true); 
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast, t]);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/50 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.verifyingAccess}</p>
      </div>
    );
  }

  if (accessDenied || !currentUser || !currentUser.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/50 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-2xl text-destructive">
              <AlertTriangle className="me-2 h-8 w-8" />
              {t.accessDeniedTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              {t.accessDeniedDescription}
            </p>
            <Button asChild>
              <Link href="/">{t.goToHomepageButton}</Link>
            </Button>
             {!firebaseAuthUser && (
                <Button asChild variant="link" className="mt-2">
                  <Link href="/auth/login">{t.loginButton}</Link>
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
