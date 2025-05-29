'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { placeholderListings, placeholderUsers, placeholderConversations } from '@/lib/placeholder-data';
import type { Listing, Conversation } from '@/lib/types';
import { ListingCard } from '@/components/ListingCard';
import { User, Settings, ListChecks, LogOut, MessageSquare, Edit3, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(placeholderUsers[0]); // Simulate logged-in user
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user data or checking auth status
    // In a real app, you'd fetch the current user or redirect if not authenticated.
    const loggedInUser = placeholderUsers.find(u => u.id === 'user1'); // Example
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
    } else {
      // router.push('/auth/login'); // Uncomment in a real app
    }
    setIsLoading(false);
  }, [router]);

  const userListings = placeholderListings.filter(l => l.seller.id === currentUser.id);
  const userConversations = placeholderConversations.filter(
    convo => convo.participants.some(p => p.id === currentUser.id)
  );

  const handleLogout = () => {
    alert('Logged out successfully!');
    router.push('/');
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading profile...</div>;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={currentUser.avatarUrl || `https://placehold.co/150x150.png`} alt={currentUser.name} data-ai-hint="avatar person" />
            <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <CardTitle className="text-3xl font-bold">Welcome, {currentUser.name}!</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Joined on {new Date(currentUser.joinDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="listings"><ListChecks className="mr-2 h-4 w-4" />My Listings</TabsTrigger>
          <TabsTrigger value="messages"><MessageSquare className="mr-2 h-4 w-4" />Messages</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Account Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                My Active Listings
              </CardTitle>
              <CardDescription>View and manage the items you have for sale.</CardDescription>
            </CardHeader>
            <CardContent>
              {userListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">You haven't posted any listings yet.</p>
              )}
              <Button asChild className="mt-6 w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/listings/new">Post a New Listing</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                Your Conversations
              </CardTitle>
              <CardDescription>Manage your messages with buyers and sellers.</CardDescription>
            </CardHeader>
            <CardContent>
              {userConversations.length > 0 ? (
                <div className="space-y-4">
                  {userConversations.map((convo) => (
                    <Card key={convo.id} className="hover:shadow-md transition-shadow">
                      <Link href={`/messages?conversationId=${convo.id}`} className="block">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-md">
                                Chat about: <span className="text-primary">{convo.listingTitle || 'General Inquiry'}</span>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                With: {convo.participants.find(p => p.id !== currentUser.id)?.name || 'Unknown User'}
                              </p>
                            </div>
                            {convo.unreadCount > 0 && (
                              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                                {convo.unreadCount} new
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground mt-1 truncate">
                           <span className="font-medium">{convo.lastMessage.senderId === currentUser.id ? "You: " : ""}</span> {convo.lastMessage.text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {new Date(convo.lastMessage.timestamp).toLocaleString()}
                          </p>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">You have no messages yet.</p>
              )}
               <Button asChild className="mt-6 w-full sm:w-auto" variant="outline">
                <Link href="/messages">Go to All Messages</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <User className="h-5 w-5 mr-2" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={currentUser.name} />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={`${currentUser.id}@example.com`} disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                </div>
                <Button className="w-full sm:w-auto"><Edit3 className="mr-2 h-4 w-4" />Save Changes</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <ShieldCheck className="h-5 w-5 mr-2" /> Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 <Button variant="outline" className="w-full">Change Password</Button>
                 <Button variant="outline" className="w-full">Notification Preferences</Button>
                 <Button variant="outline" className="w-full">Manage Blocked Users</Button>
                 <Button variant="destructive" className="w-full mt-4">Delete Account</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
