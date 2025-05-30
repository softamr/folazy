// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText, CheckCircle, AlertCircle, Hourglass, BarChart3, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where,getCountFromServer } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  approvedListings: number;
  rejectedListings: number;
  soldListings: number; // Added for completeness, can be displayed if needed
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalListings: 0,
    pendingListings: 0,
    approvedListings: 0,
    rejectedListings: 0,
    soldListings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const usersCollectionRef = collection(db, 'users');
        const listingsCollectionRef = collection(db, 'listings');

        const usersSnapshot = await getCountFromServer(usersCollectionRef);
        
        const allListingsSnapshot = await getCountFromServer(listingsCollectionRef);
        
        const pendingListingsQuery = query(listingsCollectionRef, where('status', '==', 'pending'));
        const pendingListingsSnapshot = await getCountFromServer(pendingListingsQuery);
        
        const approvedListingsQuery = query(listingsCollectionRef, where('status', '==', 'approved'));
        const approvedListingsSnapshot = await getCountFromServer(approvedListingsQuery);
        
        const rejectedListingsQuery = query(listingsCollectionRef, where('status', '==', 'rejected'));
        const rejectedListingsSnapshot = await getCountFromServer(rejectedListingsQuery);

        const soldListingsQuery = query(listingsCollectionRef, where('status', '==', 'sold'));
        const soldListingsSnapshot = await getCountFromServer(soldListingsQuery);

        setStats({
          totalUsers: usersSnapshot.data().count,
          totalListings: allListingsSnapshot.data().count,
          pendingListings: pendingListingsSnapshot.data().count,
          approvedListings: approvedListingsSnapshot.data().count,
          rejectedListings: rejectedListingsSnapshot.data().count,
          soldListings: soldListingsSnapshot.data().count,
        });

      } catch (error) {
        console.error("Error fetching dashboard stats: ", error);
        toast({
          title: "Error Fetching Stats",
          description: "Could not load dashboard data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex gap-2">
            <Button asChild variant="outline">
                <Link href="/admin/users"><Users className="mr-2 h-4 w-4"/>Manage Users</Link>
            </Button>
            <Button asChild>
                <Link href="/admin/listings"><FileText className="mr-2 h-4 w-4"/>Manage Listings</Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users on the platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">Across all statuses</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingListings}</div>
            <p className="text-xs text-muted-foreground">Listings awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Listings</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedListings}</div>
            <p className="text-xs text-muted-foreground">Currently live on the site</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Listings</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedListings}</div>
            <p className="text-xs text-muted-foreground">Not approved for display</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold Listings</CardTitle>
            <Badge className="h-4 w-4 text-blue-500" /> {/* Replace with appropriate icon if desired */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.soldListings}</div>
            <p className="text-xs text-muted-foreground">Listings marked as sold</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2"/>
                Platform Overview
            </CardTitle>
            <CardDescription>Key metrics and quick actions for platform management.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                This area can be expanded with more detailed statistics, charts (e.g., using ShadCN charts), and quick access tools for common administrative tasks.
            </p>
            {/* Placeholder for charts or more detailed stats */}
            <div className="mt-6 p-8 text-center border-2 border-dashed rounded-lg">
                <p className="text-lg font-medium text-muted-foreground">Analytics & Reports Section (Coming Soon)</p>
                 <p className="text-sm text-muted-foreground mt-2">Consider adding charts for listings over time, user growth, popular categories, etc.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
