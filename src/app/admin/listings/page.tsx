
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
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle, Hourglass, Eye, Search, Filter, Loader2, PackageOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ListingManagementPage() {
  const { toast } = useToast();
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
          // Convert Firestore Timestamps to string if necessary, or handle as Date objects
          // For simplicity, assuming postedDate is stored as ISO string or can be converted
          let postedDate = data.postedDate;
          if (postedDate instanceof Timestamp) {
            postedDate = postedDate.toDate().toISOString();
          }

          fetchedListings.push({ 
            ...data, 
            id: docSnapshot.id,
            postedDate: postedDate,
            // Ensure category and seller objects are correctly formed if they were stored differently
            category: data.category || { id: 'unknown', name: 'Unknown' },
            seller: data.seller || { id: 'unknown', name: 'Unknown Seller', email: '', joinDate: new Date().toISOString() },
           } as Listing);
        });
        setListings(fetchedListings);
        setIsLoading(false);
      }, 
      (error) => {
        console.error("Error fetching listings: ", error);
        toast({ title: "Error", description: "Could not fetch listings.", variant: "destructive" });
        setIsLoading(false);
      }
    );
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [toast]);

  const handleUpdateStatus = async (listingId: string, newStatus: ListingStatus) => {
    const listingRef = doc(db, 'listings', listingId);
    try {
      await updateDoc(listingRef, { status: newStatus });
      toast({ title: "Status Updated", description: `Listing status changed to ${newStatus}.` });
    } catch (error) {
      console.error("Error updating status: ", error);
      toast({ title: "Error", description: "Could not update listing status.", variant: "destructive" });
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm(`Are you sure you want to delete listing ${listingId}? This action cannot be undone.`)) {
      const listingRef = doc(db, 'listings', listingId);
      try {
        await deleteDoc(listingRef);
        toast({ title: "Listing Deleted", description: `Listing ${listingId} has been deleted.` });
      } catch (error) {
        console.error("Error deleting listing: ", error);
        toast({ title: "Error", description: "Could not delete listing.", variant: "destructive" });
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
        <p className="text-muted-foreground">Loading listings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Listing Management</h1>
            <p className="text-muted-foreground">Review, approve, or reject user-submitted listings.</p>
        </div>
         <Button asChild>
             <Link href="/listings/new">
                <Filter className="mr-2 h-4 w-4"/> Add New Listing (Admin)
             </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Listings</CardTitle>
          <CardDescription>
            A list of all listings in the system. Found {filteredListings.length} listings.
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title, ID, seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ListingStatus | 'all')}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredListings.length === 0 ? (
            <div className="py-10 text-center">
              <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {listings.length === 0 ? "No listings in the system yet." : "No listings found matching your criteria."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <Image
                        src={(listing.images && listing.images.length > 0 && listing.images[0]) || 'https://placehold.co/100x100.png'}
                        alt={listing.title || 'Listing image'}
                        width={40}
                        height={40}
                        className="rounded object-cover aspect-square"
                        data-ai-hint="product thumbnail"
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      <Link href={`/listings/${listing.id}`} target="_blank" className="hover:underline" title={listing.title}>
                          {listing.title || 'Untitled Listing'}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{listing.seller?.name || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">${listing.price?.toLocaleString() || '0'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClasses(listing.status)}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{listing.postedDate ? new Date(listing.postedDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                             <span className="sr-only">Listing Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Manage Listing</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {listing.status !== 'approved' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(listing.id, 'approved')}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                            </DropdownMenuItem>
                          )}
                          {listing.status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(listing.id, 'rejected')}>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                            </DropdownMenuItem>
                          )}
                          {listing.status !== 'pending' && listing.status !== 'sold' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(listing.id, 'pending')}>
                                  <Hourglass className="mr-2 h-4 w-4 text-yellow-500" /> Mark as Pending
                              </DropdownMenuItem>
                          )}
                           {listing.status !== 'sold' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(listing.id, 'sold')}>
                                  <Badge className="mr-2 h-4 w-4" /> Mark as Sold {/* Consider a more distinct icon for sold */}
                              </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/listings/${listing.id}?admin_view=true`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" /> View Listing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: "Edit Action", description: `Editing listing ${listing.id} (not implemented)` })}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Listing
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteListing(listing.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
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

    