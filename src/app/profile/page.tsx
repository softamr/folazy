
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { placeholderListings, placeholderConversations } from '@/lib/placeholder-data'; // Keep for now, will be replaced gradually
import type { Listing, Conversation, User as UserType } from '@/lib/types';
import { ListingCard } from '@/components/ListingCard';
import { User, Settings, ListChecks, LogOut, MessageSquare, Edit3, ShieldCheck, UserCircle as UserCircleIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseAuthUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setCurrentUser(userDocSnap.data() as UserType);
          } else {
            // This case should ideally not happen if signup creates the doc
            console.error("No user document found in Firestore for UID:", user.uid);
            toast({ title: "Profile Error", description: "Could not load user profile data.", variant: "destructive" });
            setCurrentUser(null); // Or a minimal user object from auth
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          toast({ title: "Profile Error", description: "Failed to fetch user details.", variant: "destructive" });
          setCurrentUser(null);
        }
      } else {
        setFirebaseAuthUser(null);
        setCurrentUser(null);
        // Optionally redirect to login if no user is found after initial check
        // router.push('/auth/login'); 
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router, toast]);

  // TODO: Replace these with actual data fetching based on currentUser.id
  const userListings = currentUser ? placeholderListings.filter(l => l.seller.id === currentUser.id) : [];
  const userConversations = currentUser ? placeholderConversations.filter(
    convo => convo.participants.some(p => p.id === currentUser!.id)
  ) : [];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      setCurrentUser(null);
      setFirebaseAuthUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: 'Logout Failed', description: 'Could not log out. Please try again.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!currentUser && !firebaseAuthUser) { // Check both to be sure, currentUser depends on Firestore doc
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <UserCircleIcon className="h-16 w-16 mb-4 text-muted-foreground" />
        <p className="text-xl font-medium mb-2">Access Denied</p>
        <p className="text-muted-foreground mb-6">Please log in to view your profile.</p>
        <Button asChild>
          <Link href="/auth/login">Login</Link>
        </Button>
      </div>
    );
  }
  
  // Fallback if Firestore doc doesn't exist but auth user does (should be rare)
  const displayName = currentUser?.name || firebaseAuthUser?.displayName || firebaseAuthUser?.email || "User";
  const displayEmail = currentUser?.email || firebaseAuthUser?.email || "No email";
  const displayAvatar = currentUser?.avatarUrl || firebaseAuthUser?.photoURL || `https://placehold.co/150x150.png`;
  const joinDate = currentUser?.joinDate || new Date().toISOString();


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={displayAvatar} alt={displayName} data-ai-hint="avatar person" />
            <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <CardTitle className="text-3xl font-bold">Welcome, {displayName}!</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Email: {displayEmail}
            </CardDescription>
            <CardDescription className="text-md text-muted-foreground">
              Joined on {new Date(joinDate).toLocaleDateString()}
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
              <CardDescription>View and manage the items you have for sale. (Placeholder data)</CardDescription>
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
              <CardDescription>Manage your messages with buyers and sellers. (Placeholder data)</CardDescription>
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
                                With: {convo.participants.find(p => p.id !== currentUser?.id)?.name || 'Unknown User'}
                              </p>
                            </div>
                            {convo.unreadCount > 0 && (
                              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                                {convo.unreadCount} new
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground mt-1 truncate">
                           <span className="font-medium">{convo.lastMessage.senderId === currentUser?.id ? "You: " : ""}</span> {convo.lastMessage.text}
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
                  <Input id="name" defaultValue={displayName} />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={displayEmail} disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                </div>
                <Button className="w-full sm:w-auto"><Edit3 className="mr-2 h-4 w-4" />Save Changes (Not implemented)</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <ShieldCheck className="h-5 w-5 mr-2" /> Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 <Button variant="outline" className="w-full" onClick={() => alert("Change Password functionality not implemented.")}>Change Password</Button>
                 <Button variant="outline" className="w-full" onClick={() => alert("Notification Preferences not implemented.")}>Notification Preferences</Button>
                 <Button variant="outline" className="w-full" onClick={() => alert("Manage Blocked Users not implemented.")}>Manage Blocked Users</Button>
                 <Button variant="destructive" className="w-full mt-4" onClick={() => alert("Delete Account functionality not implemented.")}>Delete Account</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
