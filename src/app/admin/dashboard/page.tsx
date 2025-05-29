// src/app/admin/dashboard/page.tsx
'use client';

import { placeholderListings, placeholderUsers } from '@/lib/placeholder-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText, CheckCircle, AlertCircle, Hourglass, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  // Simulating data fetching - in a real app, these would be API calls
  const totalUsers = placeholderUsers.length;
  const totalListings = placeholderListings.length;
  const pendingListings = placeholderListings.filter(l => l.status === 'pending').length;
  const approvedListings = placeholderListings.filter(l => l.status === 'approved').length;
  const rejectedListings = placeholderListings.filter(l => l.status === 'rejected').length;

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
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users on the platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalListings}</div>
            <p className="text-xs text-muted-foreground">Across all statuses</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingListings}</div>
            <p className="text-xs text-muted-foreground">Listings awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Listings</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedListings}</div>
            <p className="text-xs text-muted-foreground">Currently live on the site</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Listings</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedListings}</div>
            <p className="text-xs text-muted-foreground">Not approved for display</p>
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
                This area can be expanded with more detailed statistics, charts, and quick access tools for common administrative tasks.
            </p>
            {/* Placeholder for charts or more detailed stats */}
            <div className="mt-6 p-8 text-center border-2 border-dashed rounded-lg">
                <p className="text-lg font-medium text-muted-foreground">Analytics & Reports Section (Coming Soon)</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
