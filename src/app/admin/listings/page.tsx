
// src/app/admin/listings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Listing, ListingStatus } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle, Hourglass, Eye, Search, Filter, Loader2, PackageOpen, Package, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  en: {
    pageTitle: "Listing Management",
    pageDescription: "Review, approve, or reject user-submitted listings. Mark listings as featured.",
    addNewListingButton: "Add New Listing (Admin)",
    allListingsCardTitle: "All Listings",
    allListingsCardDesc: (count: number) => `A list of all listings in the system. Found ${count} listings.`,
    searchPlaceholder: "Search by title, ID, seller...",
    filterByStatusPlaceholder: "Filter by status",
    allStatuses: "All Statuses",
    statusPending: "Pending",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusSold: "Sold",
    noListingsInSystem: "No listings in the system yet.",
    noListingsMatchCriteria: "No listings found matching your criteria.",
    tableHeadImage: "Image",
    tableHeadTitle: "Title",
    tableHeadSeller: "Seller",
    tableHeadPrice: "Price",
    tableHeadStatus: "Status",
    tableHeadFeatured: "Featured",
    tableHeadPostedDate: "Posted Date",
    tableHeadActions: "Actions",
    listingActionsSr: "Listing Actions",
    manageListingLabel: "Manage Listing",
    approveAction: "Approve",
    rejectAction: "Reject",
    markAsPendingAction: "Mark as Pending",
    markAsSoldAction: "Mark as Sold",
    markAsFeaturedAction: "Mark as Featured",
    removeFeaturedAction: "Remove Featured",
    viewListingAction: "View Listing",
    editListingAction: "Edit Listing",
    deleteListingAction: "Delete Listing",
    loadingListings: "Loading listings...",
    errorTitle: "Error",
    couldNotFetchListingsError: "Could not fetch listings.",
    statusUpdatedTitle: "Status Updated",
    listingUpdatedTitle: "Listing Updated",
    statusChangedSuccess: (status: string) => `Listing status changed to ${status}.`,
    listingFeaturedSuccess: "Listing marked as featured.",
    listingUnfeaturedSuccess: "Listing removed from featured.",
    couldNotUpdateStatusError: "Could not update listing status.",
    couldNotUpdateFeaturedError: "Could not update listing's featured status.",
    deleteConfirm: (id: string) => `Are you sure you want to delete listing ${id}? This action cannot be undone.`,
    listingDeletedTitle: "Listing Deleted",
    listingDeletedSuccess: (id: string) => `Listing ${id} has been deleted.`,
    couldNotDeleteListingError: "Could not delete listing.",
    editActionToastTitle: "Edit Action",
    editActionToastDesc: (id: string) => `Editing listing ${id} (not implemented)`,
    untitledListing: "Untitled Listing",
    notApplicable: "N/A",
  },
  ar: {
    pageTitle: "إدارة الإعلانات",
    pageDescription: "مراجعة واعتماد ورفض الإعلانات المقدمة من المستخدمين. تحديد الإعلانات كمميزة.",
    addNewListingButton: "إضافة إعلان جديد (مسؤول)",
    allListingsCardTitle: "جميع الإعلانات",
    allListingsCardDesc: (count: number) => `قائمة بجميع الإعلانات في النظام. تم العثور على ${count} إعلانات.`,
    searchPlaceholder: "بحث بالعنوان، المعرف، البائع...",
    filterByStatusPlaceholder: "تصفية حسب الحالة",
    allStatuses: "جميع الحالات",
    statusPending: "قيد الانتظار",
    statusApproved: "معتمد",
    statusRejected: "مرفوض",
    statusSold: "مباع",
    noListingsInSystem: "لا توجد إعلانات في النظام بعد.",
    noListingsMatchCriteria: "لم يتم العثور على إعلانات تطابق معاييرك.",
    tableHeadImage: "الصورة",
    tableHeadTitle: "العنوان",
    tableHeadSeller: "البائع",
    tableHeadPrice: "السعر",
    tableHeadStatus: "الحالة",
    tableHeadFeatured: "مميز",
    tableHeadPostedDate: "تاريخ النشر",
    tableHeadActions: "الإجراءات",
    listingActionsSr: "إجراءات الإعلان",
    manageListingLabel: "إدارة الإعلان",
    approveAction: "اعتماد",
    rejectAction: "رفض",
    markAsPendingAction: "تحديد كقيد الانتظار",
    markAsSoldAction: "تحديد كمباع",
    markAsFeaturedAction: "تحديد كمميز",
    removeFeaturedAction: "إزالة من المميزة",
    viewListingAction: "عرض الإعلان",
    editListingAction: "تعديل الإعلان",
    deleteListingAction: "حذف الإعلان",
    loadingListings: "جار تحميل الإعلانات...",
    errorTitle: "خطأ",
    couldNotFetchListingsError: "لم نتمكن من جلب الإعلانات.",
    statusUpdatedTitle: "تم تحديث الحالة",
    listingUpdatedTitle: "تم تحديث الإعلان",
    statusChangedSuccess: (status: string) => `تم تغيير حالة الإعلان إلى ${status}.`,
    listingFeaturedSuccess: "تم تحديد الإعلان كمميز.",
    listingUnfeaturedSuccess: "تمت إزالة الإعلان من المميزة.",
    couldNotUpdateStatusError: "لم نتمكن من تحديث حالة الإعلان.",
    couldNotUpdateFeaturedError: "لم نتمكن من تحديث حالة تمييز الإعلان.",
    deleteConfirm: (id: string) => `هل أنت متأكد أنك تريد حذف الإعلان ${id}؟ لا يمكن التراجع عن هذا الإجراء.`,
    listingDeletedTitle: "تم حذف الإعلان",
    listingDeletedSuccess: (id: string) => `تم حذف الإعلان ${id}.`,
    couldNotDeleteListingError: "لم نتمكن من حذف الإعلان.",
    editActionToastTitle: "إجراء التعديل",
    editActionToastDesc: (id: string) => `تعديل الإعلان ${id} (غير مطبق)`,
    untitledListing: "إعلان بدون عنوان",
    notApplicable: "غير متاح",
  }
};

export default function ListingManagementPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all');

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'listings'), orderBy('postedDate', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const fetchedListings: Listing[] = [];
        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          let postedDate = data.postedDate;
          if (postedDate instanceof Timestamp) {
            postedDate = postedDate.toDate().toISOString();
          }
          fetchedListings.push({ 
            ...data, 
            id: docSnapshot.id,
            postedDate: postedDate,
            category: data.category || { id: 'unknown', name: 'Unknown' },
            seller: data.seller || { id: 'unknown', name: 'Unknown Seller', email: '', joinDate: new Date().toISOString() },
            isFeatured: data.isFeatured || false,
           } as Listing);
        });
        setListings(fetchedListings);
        setIsLoading(false);
      }, 
      (error) => {
        console.error("Error fetching listings: ", error);
        toast({ title: t.errorTitle, description: t.couldNotFetchListingsError, variant: "destructive" });
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [toast, t]);

  const handleUpdateStatus = async (listingId: string, newStatus: ListingStatus) => {
    const listingRef = doc(db, 'listings', listingId);
    try {
      await updateDoc(listingRef, { status: newStatus });
      toast({ title: t.statusUpdatedTitle, description: t.statusChangedSuccess(newStatus) });
    } catch (error) {
      console.error("Error updating status: ", error);
      toast({ title: t.errorTitle, description: t.couldNotUpdateStatusError, variant: "destructive" });
    }
  };

  const handleToggleFeatured = async (listingId: string, newIsFeatured: boolean) => {
    const listingRef = doc(db, 'listings', listingId);
    try {
      await updateDoc(listingRef, { isFeatured: newIsFeatured });
      toast({ 
        title: t.listingUpdatedTitle, 
        description: newIsFeatured ? t.listingFeaturedSuccess : t.listingUnfeaturedSuccess 
      });
    } catch (error) {
      console.error("Error updating featured status: ", error);
      toast({ title: t.errorTitle, description: t.couldNotUpdateFeaturedError, variant: "destructive" });
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm(t.deleteConfirm(listingId))) {
      const listingRef = doc(db, 'listings', listingId);
      try {
        await deleteDoc(listingRef);
        toast({ title: t.listingDeletedTitle, description: t.listingDeletedSuccess(listingId) });
      } catch (error) {
        console.error("Error deleting listing: ", error);
        toast({ title: t.errorTitle, description: t.couldNotDeleteListingError, variant: "destructive" });
      }
    }
  };

  const getStatusBadgeClasses = (status: ListingStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700';
      case 'sold': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700';
      default: return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500';
    }
  };
  
  const getStatusText = (status: ListingStatus) => {
    switch (status) {
        case 'approved': return t.statusApproved;
        case 'pending': return t.statusPending;
        case 'rejected': return t.statusRejected;
        case 'sold': return t.statusSold;
        default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = (listing.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (listing.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (listing.seller?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.loadingListings}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.pageTitle}</h1>
            <p className="text-muted-foreground">{t.pageDescription}</p>
        </div>
         <Button asChild>
             <Link href="/listings/new">
                <Filter className="me-2 h-4 w-4"/> {t.addNewListingButton}
             </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t.allListingsCardTitle}</CardTitle>
          <CardDescription>
            {t.allListingsCardDesc(filteredListings.length)}
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="relative flex-grow">
              <Search className={`absolute ${language === 'ar' ? 'right-2.5' : 'left-2.5'} top-2.5 h-4 w-4 text-muted-foreground`} />
              <Input
                type="search"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${language === 'ar' ? 'pr-8' : 'pl-8'} w-full`}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ListingStatus | 'all')}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t.filterByStatusPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatuses}</SelectItem>
                <SelectItem value="pending">{t.statusPending}</SelectItem>
                <SelectItem value="approved">{t.statusApproved}</SelectItem>
                <SelectItem value="rejected">{t.statusRejected}</SelectItem>
                <SelectItem value="sold">{t.statusSold}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredListings.length === 0 ? (
            <div className="py-10 text-center">
              <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {listings.length === 0 ? t.noListingsInSystem : t.noListingsMatchCriteria}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">{t.tableHeadImage}</TableHead>
                  <TableHead>{t.tableHeadTitle}</TableHead>
                  <TableHead>{t.tableHeadSeller}</TableHead>
                  <TableHead>{t.tableHeadPrice}</TableHead>
                  <TableHead>{t.tableHeadStatus}</TableHead>
                  <TableHead>{t.tableHeadFeatured}</TableHead>
                  <TableHead>{t.tableHeadPostedDate}</TableHead>
                  <TableHead className={language === 'ar' ? 'text-left' : 'text-right'}>{t.tableHeadActions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <Image
                        src={(listing.images && listing.images.length > 0 && listing.images[0]) || 'https://placehold.co/100x100.png'}
                        alt={listing.title || t.untitledListing}
                        width={40}
                        height={40}
                        className="rounded object-cover aspect-square"
                        data-ai-hint="product thumbnail"
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      <Link href={`/listings/${listing.id}`} target="_blank" className="hover:underline" title={listing.title}>
                          {listing.title || t.untitledListing}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{listing.seller?.name || t.notApplicable}</TableCell>
                    <TableCell className="text-muted-foreground">${listing.price?.toLocaleString() || '0'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClasses(listing.status)}>
                        {getStatusText(listing.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {listing.isFeatured && <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{listing.postedDate ? new Date(listing.postedDate).toLocaleDateString() : t.notApplicable}</TableCell>
                    <TableCell className={language === 'ar' ? 'text-left' : 'text-right'}>
                      <DropdownMenu dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                             <span className="sr-only">{t.listingActionsSr}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={language === 'ar' ? 'start' : 'end'}>
                          <DropdownMenuLabel>{t.manageListingLabel}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {listing.status !== 'approved' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(listing.id, 'approved')}>
                              <CheckCircle className="me-2 h-4 w-4 text-green-500" /> {t.approveAction}
                            </DropdownMenuItem>
                          )}
                          {listing.status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(listing.id, 'rejected')}>
                              <XCircle className="me-2 h-4 w-4 text-red-500" /> {t.rejectAction}
                            </DropdownMenuItem>
                          )}
                          {listing.status !== 'pending' && listing.status !== 'sold' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(listing.id, 'pending')}>
                                  <Hourglass className="me-2 h-4 w-4 text-yellow-500" /> {t.markAsPendingAction}
                              </DropdownMenuItem>
                          )}
                           {listing.status !== 'sold' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(listing.id, 'sold')}>
                                  <Package className="me-2 h-4 w-4 text-blue-500" /> {t.markAsSoldAction}
                              </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {listing.isFeatured ? (
                            <DropdownMenuItem onClick={() => handleToggleFeatured(listing.id, false)}>
                              <Star className="me-2 h-4 w-4 text-muted-foreground" /> {t.removeFeaturedAction}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleToggleFeatured(listing.id, true)}>
                              <Star className="me-2 h-4 w-4 text-yellow-500" /> {t.markAsFeaturedAction}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/listings/${listing.id}?admin_view=true`} target="_blank">
                              <Eye className="me-2 h-4 w-4" /> {t.viewListingAction}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: t.editActionToastTitle, description: t.editActionToastDesc(listing.id) })}>
                            <Edit className="me-2 h-4 w-4" /> {t.editListingAction}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteListing(listing.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
                          >
                            <Trash2 className="me-2 h-4 w-4" /> {t.deleteListingAction}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
