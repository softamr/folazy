// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { placeholderUsers } from '@/lib/placeholder-data';
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
import { MoreHorizontal, Edit, Trash2, Shield, UserCheck, Search, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(placeholderUsers);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulate API calls for actions - in a real app, these would interact with a backend
  const handleToggleAdmin = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, isAdmin: !user.isAdmin } : user
      )
    );
    // In a real app: await api.updateUserRole(userId, newRole);
    alert(`Admin status for user ${userId} ${users.find(u=>u.id===userId)?.isAdmin ? 'removed' : 'granted'}. (Simulated)`);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      // In a real app: await api.deleteUser(userId);
      alert(`User ${userId} deleted. (Simulated)`);
    }
  };
  
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">View, manage, and edit user accounts.</p>
        </div>
        <Button>
            <UserPlus className="mr-2 h-4 w-4"/> Add New User
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users in the system. Found {filteredUsers.length} users.
          </CardDescription>
           <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:w-1/2 md:w-1/3"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
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
                      <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="avatar person" />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.id}</TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
                    ) : (
                      <Badge variant="secondary"><UserCheck className="h-3 w-3 mr-1" />User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">User Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alert(`Editing user ${user.id} (placeholder)`)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleAdmin(user.id)}>
                          {user.isAdmin ? (
                            <><UserCheck className="mr-2 h-4 w-4" /> Revoke Admin</>
                          ) : (
                            <><Shield className="mr-2 h-4 w-4" /> Make Admin</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
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
          {filteredUsers.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">No users found matching your search.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
