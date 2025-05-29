// src/app/admin/listings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { placeholderListings as initialListings, placeholderUsers } from '@/lib/placeholder-data';
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
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle, Hourglass, Eye, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

export default function ListingManagementPage() {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all');

  // Simulate API call for updating listing status
  const handleUpdateStatus = (listingId: string, newStatus: ListingStatus) => {
    setListings(prevListings =>
      prevListings.map(listing =>
        listing.id === listingId ? { ...listing, status: newStatus } : listing
      )
    );
    // In a real app: await api.updateListingStatus(listingId, newStatus);
    alert(`Listing ${listingId} status updated to ${newStatus}. (Simulated)`);
  };

  const handleDeleteListing = (listingId: string) => {
    if (window.confirm(`Are you sure you want to delete listing ${listingId}? This action cannot be undone.`)) {
        setListings(prevListings => prevListings.filter(listing => listing.id !== listingId));
        alert(`Listing ${listingId} deleted. (Simulated)`);
    }
  };

  const getStatusBadgeVariant = (status: ListingStatus) => {
    switch (status) {
      case 'approved': return 'default'; // Greenish or primary
      case 'pending': return 'secondary'; // Yellowish or neutral
      case 'rejected': return 'destructive'; // Reddish
      case 'sold': return 'outline'; // Bluish or distinct
      default: return 'outline';
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
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.seller.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                      src={listing.images[0] || 'https://placehold.co/100x100.png'}
                      alt={listing.title}
                      width={40}
                      height={40}
                      className="rounded object-cover aspect-square"
                      data-ai-hint="product thumbnail"
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    <Link href={`/listings/${listing.id}`} target="_blank" className="hover:underline" title={listing.title}>
                        {listing.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{listing.seller.name}</TableCell>
                  <TableCell className="text-muted-foreground">${listing.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClasses(listing.status)}>
                      {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(listing.postedDate).toLocaleDateString()}</TableCell>
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
                                <Badge className="mr-2 h-4 w-4" /> Mark as Sold
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/listings/${listing.id}?admin_view=true`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" /> View Listing
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert(`Editing listing ${listing.id} (placeholder)`)}>
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
          {filteredListings.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">No listings found matching your criteria.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
