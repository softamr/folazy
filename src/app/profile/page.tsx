'use client'; // For useRouter and useState

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { placeholderListings } from '@/lib/placeholder-data';
import { ListingCard } from '@/components/ListingCard';
import { User, Settings, ListChecks, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('User'); // Default, can be fetched

  // Simulate fetching user data or checking auth status
  useEffect(() => {
    // In a real app, check if user is authenticated. If not, redirect.
    // const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    // if (!isAuthenticated) {
    //   router.push('/auth/login');
    // } else {
    //   // Fetch actual user name
    //   setUserName("Jane Doe"); // Example
    // }
    setUserName("Demo User"); // Placeholder for scaffold
  }, [router]);


  const userListings = placeholderListings.filter(l => l.seller.id === 'user1').slice(0, 2); // Example: show 2 listings for demo

  const handleLogout = () => {
    // Simulate logout
    // localStorage.removeItem('isAuthenticated');
    alert('Logged out successfully!');
    router.push('/');
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src="https://placehold.co/150x150.png" alt={userName} data-ai-hint="avatar person" />
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <CardTitle className="text-3xl font-bold">Welcome, {userName}!</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Manage your listings, account settings, and more.
            </CardDescription>
          </div>
           <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <ListChecks className="h-5 w-5 mr-2" /> My Listings
              </CardTitle>
              <CardDescription>View and manage the items you have for sale.</CardDescription>
            </CardHeader>
            <CardContent>
              {userListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">You haven't posted any listings yet.</p>
              )}
              <Button asChild className="mt-6 w-full sm:w-auto">
                <a href="/listings/new">Post a New Listing</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="h-5 w-5 mr-2" /> Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p><span className="font-medium">Email:</span> user@example.com</p>
              <p><span className="font-medium">Joined:</span> January 1, 2023</p>
              <Button variant="outline" className="w-full">Edit Profile</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Settings className="h-5 w-5 mr-2" /> Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <Button variant="outline" className="w-full">Change Password</Button>
               <Button variant="outline" className="w-full">Notification Preferences</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
