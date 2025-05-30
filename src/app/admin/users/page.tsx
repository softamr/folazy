// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Shield, UserCheck, Search, UserPlus, Loader2, UsersIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // For actions like delete/toggle admin
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'users'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const fetchedUsers: User[] = [];
        querySnapshot.forEach((docSnapshot) => {
          fetchedUsers.push({ id: docSnapshot.id, ...docSnapshot.data() } as User);
        });
        setUsers(fetchedUsers);
        setIsLoading(false);
      }, 
      (error) => {
        console.error("Error fetching users: ", error);
        toast({ title: "Error", description: "Could not fetch users.", variant: "destructive" });
        setIsLoading(false);
      }
    );
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [toast]);

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    setIsProcessing(true);
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, { isAdmin: !currentIsAdmin });
      toast({ 
        title: "Role Updated", 
        description: `User ${userId} is ${!currentIsAdmin ? 'now an admin.' : 'no longer an admin.'}` 
      });
    } catch (error) {
      console.error("Error updating user role: ", error);
      toast({ title: "Error", description: "Could not update user role.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}" (ID: ${userId})? This action cannot be undone.`)) {
      setIsProcessing(true);
      const userRef = doc(db, 'users', userId);
      try {
        // Note: In a real app, consider implications of deleting a user,
        // e.g., what happens to their listings, messages, etc.
        // This might require Firebase Functions for cascading deletes or cleanup.
        await deleteDoc(userRef);
        toast({ title: "User Deleted", description: `User "${userName}" has been deleted.` });
      } catch (error) {
        console.error("Error deleting user: ", error);
        toast({ title: "Error", description: "Could not delete user.", variant: "destructive" });
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center"><UsersIcon className="mr-2 h-7 w-7"/>User Management</h1>
            <p className="text-muted-foreground">View, manage, and edit user accounts.</p>
        </div>
        <Button disabled={true} onClick={() => toast({title: "Not Implemented", description: "Adding users directly is not yet available."})}>
            <UserPlus className="mr-2 h-4 w-4"/> Add New User
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users in the system. Found {filteredUsers.length} users matching criteria.
          </CardDescription>
           <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:w-1/2 md:w-1/3"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
             <p className="p-4 text-center text-muted-foreground">
              {users.length === 0 ? "No users in the system yet." : "No users found matching your search."}
             </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl || 'https://placehold.co/100x100.png'} alt={user.name} data-ai-hint="avatar person" />
                        <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[100px] truncate" title={user.id}>{user.id}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
                      ) : (
                        <Badge variant="secondary"><UserCheck className="h-3 w-3 mr-1" />User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <MoreHorizontal className="h-4 w-4" />}
                            <span className="sr-only">User Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast({ title: "Edit Action", description: `Editing user ${user.id} (not implemented)` })} disabled={isProcessing}>
                            <Edit className="mr-2 h-4 w-4" /> Edit User (Not implemented)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleAdmin(user.id, user.isAdmin || false)} disabled={isProcessing}>
                            {user.isAdmin ? (
                              <><UserCheck className="mr-2 h-4 w-4" /> Revoke Admin</>
                            ) : (
                              <><Shield className="mr-2 h-4 w-4" /> Make Admin</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id, user.name || 'Unknown User')}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
                            disabled={isProcessing}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
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

