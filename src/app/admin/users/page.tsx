
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
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  en: {
    pageTitle: "User Management",
    pageDescription: "View, manage, and edit user accounts.",
    addNewUserButton: "Add New User",
    allUsersCardTitle: "All Users",
    allUsersCardDesc: (count: number) => `A list of all users in the system. Found ${count} users matching criteria.`,
    searchPlaceholder: "Search users by name, email, or ID...",
    noUsersInSystem: "No users in the system yet.",
    noUsersMatchSearch: "No users found matching your search.",
    tableHeadAvatar: "Avatar",
    tableHeadName: "Name",
    tableHeadEmail: "Email",
    tableHeadUserId: "User ID",
    tableHeadRole: "Role",
    tableHeadJoinDate: "Join Date",
    tableHeadActions: "Actions",
    roleAdmin: "Admin",
    roleUser: "User",
    userActionsSr: "User Actions",
    editUserAction: "Edit User (Not implemented)",
    revokeAdminAction: "Revoke Admin",
    makeAdminAction: "Make Admin",
    deleteUserAction: "Delete User",
    loadingUsers: "Loading users...",
    notImplementedToast: "Not Implemented",
    addUserNotAvailable: "Adding users directly is not yet available.",
    roleUpdatedTitle: "Role Updated",
    userIsNowAdmin: (id: string) => `User ${id} is now an admin.`,
    userNoLongerAdmin: (id: string) => `User ${id} is no longer an admin.`,
    errorTitle: "Error",
    couldNotUpdateRoleError: "Could not update user role.",
    deleteConfirm: (name: string, id: string) => `Are you sure you want to delete user "${name}" (ID: ${id})? This action cannot be undone.`,
    userDeletedTitle: "User Deleted",
    userDeletedSuccess: (name: string) => `User "${name}" has been deleted.`,
    couldNotDeleteUserError: "Could not delete user.",
    notApplicable: "N/A",
    unknownUser: "Unknown User",
  },
  ar: {
    pageTitle: "إدارة المستخدمين",
    pageDescription: "عرض وإدارة وتعديل حسابات المستخدمين.",
    addNewUserButton: "إضافة مستخدم جديد",
    allUsersCardTitle: "جميع المستخدمين",
    allUsersCardDesc: (count: number) => `قائمة بجميع المستخدمين في النظام. تم العثور على ${count} مستخدمين يطابقون المعايير.`,
    searchPlaceholder: "بحث عن مستخدمين بالاسم أو البريد الإلكتروني أو المعرف...",
    noUsersInSystem: "لا يوجد مستخدمون في النظام بعد.",
    noUsersMatchSearch: "لم يتم العثور على مستخدمين يطابقون بحثك.",
    tableHeadAvatar: "الصورة الرمزية",
    tableHeadName: "الاسم",
    tableHeadEmail: "البريد الإلكتروني",
    tableHeadUserId: "معرف المستخدم",
    tableHeadRole: "الدور",
    tableHeadJoinDate: "تاريخ الانضمام",
    tableHeadActions: "الإجراءات",
    roleAdmin: "مسؤول",
    roleUser: "مستخدم",
    userActionsSr: "إجراءات المستخدم",
    editUserAction: "تعديل المستخدم (غير مطبق)",
    revokeAdminAction: "إلغاء صلاحيات المسؤول",
    makeAdminAction: "جعله مسؤولاً",
    deleteUserAction: "حذف المستخدم",
    loadingUsers: "جار تحميل المستخدمين...",
    notImplementedToast: "غير مطبق",
    addUserNotAvailable: "إضافة المستخدمين مباشرة غير متاحة بعد.",
    roleUpdatedTitle: "تم تحديث الدور",
    userIsNowAdmin: (id: string) => `المستخدم ${id} هو الآن مسؤول.`,
    userNoLongerAdmin: (id: string) => `المستخدم ${id} لم يعد مسؤولاً.`,
    errorTitle: "خطأ",
    couldNotUpdateRoleError: "لم نتمكن من تحديث دور المستخدم.",
    deleteConfirm: (name: string, id: string) => `هل أنت متأكد أنك تريد حذف المستخدم "${name}" (المعرف: ${id})؟ لا يمكن التراجع عن هذا الإجراء.`,
    userDeletedTitle: "تم حذف المستخدم",
    userDeletedSuccess: (name: string) => `تم حذف المستخدم "${name}".`,
    couldNotDeleteUserError: "لم نتمكن من حذف المستخدم.",
    notApplicable: "غير متاح",
    unknownUser: "مستخدم غير معروف",
  }
};

export default function UserManagementPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
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
        toast({ title: t.errorTitle, description: t.couldNotUpdateRoleError, variant: "destructive" });
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [toast, t]);

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    setIsProcessing(true);
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, { isAdmin: !currentIsAdmin });
      toast({ 
        title: t.roleUpdatedTitle, 
        description: !currentIsAdmin ? t.userIsNowAdmin(userId) : t.userNoLongerAdmin(userId)
      });
    } catch (error) {
      console.error("Error updating user role: ", error);
      toast({ title: t.errorTitle, description: t.couldNotUpdateRoleError, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(t.deleteConfirm(userName, userId))) {
      setIsProcessing(true);
      const userRef = doc(db, 'users', userId);
      try {
        await deleteDoc(userRef);
        toast({ title: t.userDeletedTitle, description: t.userDeletedSuccess(userName) });
      } catch (error) {
        console.error("Error deleting user: ", error);
        toast({ title: t.errorTitle, description: t.couldNotDeleteUserError, variant: "destructive" });
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
        <p className="text-muted-foreground">{t.loadingUsers}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center"><UsersIcon className="me-2 h-7 w-7"/>{t.pageTitle}</h1>
            <p className="text-muted-foreground">{t.pageDescription}</p>
        </div>
        <Button disabled={true} onClick={() => toast({title: t.notImplementedToast, description: t.addUserNotAvailable})}>
            <UserPlus className="me-2 h-4 w-4"/> {t.addNewUserButton}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t.allUsersCardTitle}</CardTitle>
          <CardDescription>
            {t.allUsersCardDesc(filteredUsers.length)}
          </CardDescription>
           <div className="relative mt-4">
            <Search className={`absolute ${language === 'ar' ? 'right-2.5' : 'left-2.5'} top-2.5 h-4 w-4 text-muted-foreground`} />
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${language === 'ar' ? 'pr-8' : 'pl-8'} sm:w-1/2 md:w-1/3`}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
             <p className="p-4 text-center text-muted-foreground">
              {users.length === 0 ? t.noUsersInSystem : t.noUsersMatchSearch}
             </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">{t.tableHeadAvatar}</TableHead>
                  <TableHead>{t.tableHeadName}</TableHead>
                  <TableHead>{t.tableHeadEmail}</TableHead>
                  <TableHead>{t.tableHeadUserId}</TableHead>
                  <TableHead>{t.tableHeadRole}</TableHead>
                  <TableHead>{t.tableHeadJoinDate}</TableHead>
                  <TableHead className={language === 'ar' ? 'text-left' : 'text-right'}>{t.tableHeadActions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl || 'https://placehold.co/100x100.png'} alt={user.name || ''} data-ai-hint="avatar person" />
                        <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name || t.notApplicable}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email || t.notApplicable}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[100px] truncate" title={user.id}>{user.id}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge variant="destructive"><Shield className="h-3 w-3 me-1" />{t.roleAdmin}</Badge>
                      ) : (
                        <Badge variant="secondary"><UserCheck className="h-3 w-3 me-1" />{t.roleUser}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.joinDate ? new Date(user.joinDate).toLocaleDateString() : t.notApplicable}</TableCell>
                    <TableCell className={language === 'ar' ? 'text-left' : 'text-right'}>
                      <DropdownMenu dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <MoreHorizontal className="h-4 w-4" />}
                            <span className="sr-only">{t.userActionsSr}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={language === 'ar' ? 'start' : 'end'}>
                          <DropdownMenuItem onClick={() => toast({ title: t.editUserAction, description: `Editing user ${user.id}` })} disabled={isProcessing}>
                            <Edit className="me-2 h-4 w-4" /> {t.editUserAction}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleAdmin(user.id, user.isAdmin || false)} disabled={isProcessing}>
                            {user.isAdmin ? (
                              <><UserCheck className="me-2 h-4 w-4" /> {t.revokeAdminAction}</>
                            ) : (
                              <><Shield className="me-2 h-4 w-4" /> {t.makeAdminAction}</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id, user.name || t.unknownUser)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
                            disabled={isProcessing}
                          >
                            <Trash2 className="me-2 h-4 w-4" /> {t.deleteUserAction}
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
