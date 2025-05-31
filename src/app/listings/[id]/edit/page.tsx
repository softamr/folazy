
// src/app/listings/[id]/edit/page.tsx
'use client';

import { ListingForm } from '@/components/ListingForm';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Listing as ListingType } from '@/lib/types';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  en: {
    loadingListing: "Loading listing for editing...",
    listingNotFound: "Listing not found or you don't have permission to edit it.",
    editListingTitle: "Edit Listing", // This might be used if page had its own title
  },
  ar: {
    loadingListing: "جار تحميل الإعلان للتعديل...",
    listingNotFound: "الإعلان غير موجود أو ليس لديك إذن لتعديله.",
    editListingTitle: "تعديل الإعلان",
  }
};

export default function EditListingPage() {
  const params = useParams();
  const listingId = params.id as string;
  const { language } = useLanguage();
  const t = translations[language];

  const [listingToEdit, setListingToEdit] = useState<ListingType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (listingId) {
      const fetchListing = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const listingDocRef = doc(db, 'listings', listingId);
          const listingDocSnap = await getDoc(listingDocRef);
          if (listingDocSnap.exists()) {
            const data = listingDocSnap.data();
            let postedDate = data.postedDate;
            if (postedDate instanceof Timestamp) {
              postedDate = postedDate.toDate().toISOString();
            }
            const sellerData = data.seller || { id: 'unknown', name: 'Unknown Seller', email: '', joinDate: new Date().toISOString(), isAdmin: false };
            const categoryData = data.category || { id: 'unknown', name: 'Unknown' };
            
            setListingToEdit({ 
                ...data, 
                id: listingDocSnap.id, 
                postedDate,
                seller: sellerData,
                category: categoryData,
            } as ListingType);

          } else {
            setError(t.listingNotFound);
          }
        } catch (err) {
          console.error("Error fetching listing for edit:", err);
          setError(t.listingNotFound);
        } finally {
          setIsLoading(false);
        }
      };
      fetchListing();
    } else {
      setIsLoading(false);
      setError(t.listingNotFound); 
    }
  }, [listingId, t]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.loadingListing}</p>
      </div>
    );
  }

  if (error || !listingToEdit) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-destructive">{error || t.listingNotFound}</h1>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ListingForm listingToEdit={listingToEdit} />
    </div>
  );
}
