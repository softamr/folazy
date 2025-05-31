
// src/app/listings/[id]/edit/page.tsx
'use client';

import { ListingForm } from '@/components/ListingForm';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Listing as ListingType, User } from '@/lib/types';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const translations = {
  en: {
    loadingListing: "Loading listing for editing...",
    verifyingPermissions: "Verifying permissions...",
    listingNotFoundOrNoPermission: "Listing not found or you don't have permission to edit it.",
    editListingTitle: "Edit Listing", 
    loginRequired: "You must be logged in to edit a listing.",
    goToHomepageButton: "Go to Homepage",
    loginButton: "Login",
    errorTitle: "Error",
  },
  ar: {
    loadingListing: "جار تحميل الإعلان للتعديل...",
    verifyingPermissions: "جار التحقق من الأذونات...",
    listingNotFoundOrNoPermission: "الإعلان غير موجود أو ليس لديك إذن لتعديله.",
    editListingTitle: "تعديل الإعلان",
    loginRequired: "يجب تسجيل الدخول لتعديل الإعلان.",
    goToHomepageButton: "الذهاب إلى الصفحة الرئيسية",
    loginButton: "تسجيل الدخول",
    errorTitle: "خطأ",
  }
};

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  const { language } = useLanguage();
  const t = translations[language];

  const [listingToEdit, setListingToEdit] = useState<ListingType | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      let fetchedLocalUser: User | null = null;
      let userIsAdmin = false;

      if (authUser) {
        setFirebaseAuthUser(authUser);
        try {
          const userDocRef = doc(db, "users", authUser.uid);
          const userDocSnapInstance = await getDoc(userDocRef); // Renamed for clarity
          if (userDocSnapInstance.exists()) {
            fetchedLocalUser = { id: userDocSnapInstance.id, ...userDocSnapInstance.data() } as User;
            userIsAdmin = fetchedLocalUser.isAdmin || false;
            setCurrentUser(fetchedLocalUser);
          } else {
            fetchedLocalUser = { 
              id: authUser.uid, 
              name: authUser.displayName || "User", 
              email: authUser.email || "", 
              joinDate: new Date().toISOString(), 
              isAdmin: false 
            };
            userIsAdmin = false;
            setCurrentUser(fetchedLocalUser);
            console.warn("User document not found for UID:", authUser.uid, "Using basic auth data for edit permission check.");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError(t.listingNotFoundOrNoPermission); // Generic error
          setIsLoading(false);
          return;
        }
      } else {
        setFirebaseAuthUser(null);
        setCurrentUser(null);
        setError(t.loginRequired);
        setIsLoading(false);
        return;
      }

      // Proceed to fetch listing only if authenticated and listingId is present
      if (listingId && authUser) { // authUser is guaranteed non-null if we reached here
        try {
          const listingDocRef = doc(db, 'listings', listingId);
          const listingDocSnap = await getDoc(listingDocRef);

          if (listingDocSnap.exists()) {
            const listingData = listingDocSnap.data() as Omit<ListingType, 'id' | 'postedDate'> & { postedDate: Timestamp | string };
            
            // Permission Check
            const sellerId = listingData.seller.id;
            // Use userIsAdmin (derived from userDocSnapInstance) and authUser.uid from the outer scope
            if (authUser.uid !== sellerId && !userIsAdmin) {
              setError(t.listingNotFoundOrNoPermission);
              setListingToEdit(null);
              setIsLoading(false);
              return;
            }
            
            let postedDate = listingData.postedDate;
            if (postedDate instanceof Timestamp) {
              postedDate = postedDate.toDate().toISOString();
            }
            
            setListingToEdit({ 
                ...listingData, 
                id: listingDocSnap.id, 
                postedDate: postedDate as string,
                category: listingData.category || { id: 'unknown', name: 'Unknown' },
                seller: listingData.seller || { id: 'unknown', name: 'Unknown Seller', email: '', joinDate: new Date().toISOString() },
            } as ListingType);

          } else {
            setError(t.listingNotFoundOrNoPermission);
          }
        } catch (err) {
          console.error("Error fetching listing for edit:", err);
          setError(t.listingNotFoundOrNoPermission);
        }
      } else if (!listingId) {
         setError(t.listingNotFoundOrNoPermission); // No ID, so not found
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, [listingId, t]);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
            {!firebaseAuthUser ? t.loadingListing : 
             !currentUser && firebaseAuthUser ? t.verifyingPermissions : 
             t.loadingListing 
            }
        </p>
      </div>
    );
  }

  if (error || !listingToEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/50 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-2xl text-destructive">
              <AlertTriangle className="me-2 h-8 w-8" />
              {t.errorTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              {error || t.listingNotFoundOrNoPermission}
            </p>
            <Button asChild>
              <Link href="/">{t.goToHomepageButton}</Link>
            </Button>
             {!firebaseAuthUser && error === t.loginRequired && (
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
    <div className="max-w-5xl mx-auto py-8">
      <ListingForm listingToEdit={listingToEdit} />
    </div>
  );
}

