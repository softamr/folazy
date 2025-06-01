
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Listing, Conversation, User as UserType } from '@/lib/types';
import { ListingCard } from '@/components/ListingCard';
import { User, Settings, ListChecks, LogOut, MessageSquare, Edit3, ShieldCheck, UserCircle as UserCircleIcon, Loader2, PackageOpen, CheckCircle, AlertTriangle, Hourglass } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, query as firestoreQuery, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { placeholderConversations } from '@/lib/placeholder-data';

const translations = {
  en: {
    loadingProfile: "Loading profile...",
    accessDeniedTitle: "Access Denied",
    pleaseLogin: "Please log in to view your profile.",
    loginButton: "Login",
    welcomeMessage: (name: string) => `Welcome, ${name}!`,
    emailLabel: "Email:",
    joinedOnLabel: "Joined on",
    logoutButton: "Logout",
    myListingsTab: "My Listings",
    myListingsTabDesc: "Manage your active, pending, and rejected listings.",
    messagesTab: "Messages",
    accountSettingsTab: "Account Settings",
    postNewListingButton: "Post a New Listing",
    yourConversationsTitle: "Your Conversations",
    yourConversationsDesc: "Manage your messages with buyers and sellers. (Placeholder data)",
    chatAboutLabel: "Chat about:",
    generalInquiry: "General Inquiry",
    withLabel: "With:",
    unknownUser: "Unknown User",
    youPrefix: "You: ",
    newSuffix: "new",
    noMessagesYet: "You have no messages yet.",
    goToAllMessagesButton: "Go to All Messages",
    personalInfoTitle: "Personal Information",
    fullNameLabel: "Full Name",
    emailAddressLabel: "Email Address",
    phoneOptionalLabel: "Phone Number (Optional)",
    saveChangesButton: "Save Changes (Not implemented)",
    securityPrivacyTitle: "Security & Privacy",
    changePasswordButton: "Change Password",
    notificationPrefsButton: "Notification Preferences",
    manageBlockedUsersButton: "Manage Blocked Users",
    deleteAccountButton: "Delete Account",
    profileErrorTitle: "Profile Error",
    couldNotLoadProfile: "Could not load user profile data.",
    failedToFetchDetails: "Failed to fetch user details.",
    loggedOutTitle: "Logged Out",
    loggedOutSuccess: "You have been successfully logged out.",
    logoutFailedTitle: "Logout Failed",
    logoutFailedDesc: "Could not log out. Please try again.",
    notImplemented: "(Not implemented)",
    adminSuffix: "(Admin)",
    approvedListingsTabTitle: "Approved",
    pendingListingsTabTitle: "Pending",
    rejectedListingsTabTitle: "Rejected",
    noApprovedListingsYet: "You have no listings currently approved.",
    noPendingListingsYet: "You have no listings currently pending review.",
    noRejectedListingsYet: "You have no rejected listings.",
    loadingMyListings: "Loading your listings...",
    errorLoadingMyListings: "Could not load your listings. Please try again.",
    errorTitle: "Error",
    defaultUserName: "User",
    noEmail: "No email available",
    phonePlaceholder: "+20 XXX XXX XXXX",
  },
  ar: {
    loadingProfile: "جار تحميل الملف الشخصي...",
    accessDeniedTitle: "تم رفض الوصول",
    pleaseLogin: "الرجاء تسجيل الدخول لعرض ملفك الشخصي.",
    loginButton: "تسجيل الدخول",
    welcomeMessage: (name: string) => `أهلاً بك، ${name}!`,
    emailLabel: "البريد الإلكتروني:",
    joinedOnLabel: "انضم في",
    logoutButton: "تسجيل الخروج",
    myListingsTab: "إعلاناتي",
    myListingsTabDesc: "إدارة إعلاناتك النشطة، والمعلقة، والمرفوضة.",
    messagesTab: "الرسائل",
    accountSettingsTab: "إعدادات الحساب",
    postNewListingButton: "نشر إعلان جديد",
    yourConversationsTitle: "محادثاتك",
    yourConversationsDesc: "إدارة رسائلك مع المشترين والبائعين. (بيانات مؤقتة)",
    chatAboutLabel: "محادثة بخصوص:",
    generalInquiry: "استفسار عام",
    withLabel: "مع:",
    unknownUser: "مستخدم غير معروف",
    youPrefix: "أنت: ",
    newSuffix: "جديدة",
    noMessagesYet: "ليس لديك رسائل بعد.",
    goToAllMessagesButton: "الذهاب إلى جميع الرسائل",
    personalInfoTitle: "المعلومات الشخصية",
    fullNameLabel: "الاسم الكامل",
    emailAddressLabel: "عنوان البريد الإلكتروني",
    phoneOptionalLabel: "رقم الهاتف (اختياري)",
    saveChangesButton: "حفظ التغييرات (غير مطبق)",
    securityPrivacyTitle: "الأمان والخصوصية",
    changePasswordButton: "تغيير كلمة المرور",
    notificationPrefsButton: "تفضيلات الإشعارات",
    manageBlockedUsersButton: "إدارة المستخدمين المحظورين",
    deleteAccountButton: "حذف الحساب",
    profileErrorTitle: "خطأ في الملف الشخصي",
    couldNotLoadProfile: "لم نتمكن من تحميل بيانات الملف الشخصي.",
    failedToFetchDetails: "فشل في جلب تفاصيل المستخدم.",
    loggedOutTitle: "تم تسجيل الخروج",
    loggedOutSuccess: "لقد تم تسجيل خروجك بنجاح.",
    logoutFailedTitle: "فشل تسجيل الخروج",
    logoutFailedDesc: "لم نتمكن من تسجيل الخروج. يرجى المحاولة مرة أخرى.",
    notImplemented: "(غير مطبق)",
    adminSuffix: "(مشرف)",
    approvedListingsTabTitle: "المعتمدة",
    pendingListingsTabTitle: "المعلقة",
    rejectedListingsTabTitle: "المرفوضة",
    noApprovedListingsYet: "ليس لديك إعلانات معتمدة حاليًا.",
    noPendingListingsYet: "ليس لديك إعلانات معلقة للمراجعة حاليًا.",
    noRejectedListingsYet: "ليس لديك إعلانات مرفوضة حاليًا.",
    loadingMyListings: "جار تحميل إعلاناتك...",
    errorLoadingMyListings: "لم نتمكن من تحميل إعلاناتك. يرجى المحاولة مرة أخرى.",
    errorTitle: "خطأ",
    defaultUserName: "مستخدم",
    noEmail: "لا يوجد بريد إلكتروني",
    phonePlaceholder: "+٢٠ XXX XXX XXXX",
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [approvedListings, setApprovedListings] = useState<Listing[]>([]);
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [rejectedListings, setRejectedListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseAuthUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setCurrentUser(userDocSnap.data() as UserType);
          } else {
            console.error("No user document found in Firestore for UID:", user.uid);
            toast({ title: t.profileErrorTitle, description: t.couldNotLoadProfile, variant: "destructive" });
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          toast({ title: t.profileErrorTitle, description: t.failedToFetchDetails, variant: "destructive" });
          setCurrentUser(null);
        }
      } else {
        setFirebaseAuthUser(null);
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, [router, toast, t]);

  useEffect(() => {
    if (!currentUser?.id) {
      setIsLoadingListings(false);
      return;
    }

    setIsLoadingListings(true);
    const q = firestoreQuery(collection(db, 'listings'), where('seller.id', '==', currentUser.id));
    
    const unsubscribeListings = onSnapshot(q, (querySnapshot) => {
      const allUserListings: Listing[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        let postedDate = data.postedDate;
        if (postedDate instanceof Timestamp) {
          postedDate = postedDate.toDate().toISOString();
        }
        allUserListings.push({ 
            ...data, 
            id: docSnapshot.id, 
            postedDate,
            category: data.category || { id: 'unknown', name: t.unknownUser }, 
            seller: data.seller || { id: currentUser.id, name: currentUser.name, email: currentUser.email, joinDate: currentUser.joinDate, isAdmin: currentUser.isAdmin },
        } as Listing);
      });

      setApprovedListings(allUserListings.filter(l => l.status === 'approved'));
      setPendingListings(allUserListings.filter(l => l.status === 'pending'));
      setRejectedListings(allUserListings.filter(l => l.status === 'rejected'));
      setIsLoadingListings(false);
    }, (error) => {
      console.error("Error fetching user listings:", error);
      toast({ title: t.errorTitle, description: t.errorLoadingMyListings, variant: "destructive" });
      setIsLoadingListings(false);
    });

    return () => unsubscribeListings();
  }, [currentUser?.id, toast, t]);


  const userConversations = currentUser ? placeholderConversations.filter(
    convo => convo.participants.some(p => p.id === currentUser!.id)
  ) : [];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: t.loggedOutTitle, description: t.loggedOutSuccess });
      setCurrentUser(null);
      setFirebaseAuthUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: t.logoutFailedTitle, description: t.logoutFailedDesc, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.loadingProfile}</p>
      </div>
    );
  }

  if (!currentUser && !firebaseAuthUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <UserCircleIcon className="h-16 w-16 mb-4 text-muted-foreground" />
        <p className="text-xl font-medium mb-2">{t.accessDeniedTitle}</p>
        <p className="text-muted-foreground mb-6">{t.pleaseLogin}</p>
        <Button asChild>
          <Link href="/auth/login">{t.loginButton}</Link>
        </Button>
      </div>
    );
  }
  
  const displayName = currentUser?.name || firebaseAuthUser?.displayName || firebaseAuthUser?.email || t.defaultUserName;
  const displayEmail = currentUser?.email || firebaseAuthUser?.email || t.noEmail;
  const displayAvatar = currentUser?.avatarUrl || firebaseAuthUser?.photoURL || `https://placehold.co/150x150.png`;
  const joinDate = currentUser?.joinDate || firebaseAuthUser?.metadata.creationTime || new Date().toISOString();

  const renderListingGrid = (listings: Listing[], emptyMessage: string) => {
    if (listings.length === 0) {
      return (
        <div className="py-10 text-center">
          <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    );
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={displayAvatar} alt={displayName} data-ai-hint="avatar person" />
            <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <CardTitle className="text-3xl font-bold">{t.welcomeMessage(displayName)}</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              {t.emailLabel} {displayEmail}
            </CardDescription>
            <CardDescription className="text-md text-muted-foreground">
              {t.joinedOnLabel} {new Date(joinDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
            </CardDescription>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {t.logoutButton}
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultValue="listings" className="w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="listings"><ListChecks className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} />{t.myListingsTab}</TabsTrigger>
          <TabsTrigger value="messages"><MessageSquare className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} />{t.messagesTab}</TabsTrigger>
          <TabsTrigger value="settings"><Settings className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} />{t.accountSettingsTab}</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                {t.myListingsTab}
              </CardTitle>
              <CardDescription>{t.myListingsTabDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingListings ? (
                 <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                    <p className="text-muted-foreground">{t.loadingMyListings}</p>
                </div>
              ) : (
                <Tabs defaultValue="approved" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="approved" className="gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />{t.approvedListingsTabTitle} <span className="text-xs text-muted-foreground">({approvedListings.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="gap-1">
                        <Hourglass className="h-4 w-4 text-yellow-500" />{t.pendingListingsTabTitle} <span className="text-xs text-muted-foreground">({pendingListings.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />{t.rejectedListingsTabTitle} <span className="text-xs text-muted-foreground">({rejectedListings.length})</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="approved">
                    {renderListingGrid(approvedListings, t.noApprovedListingsYet)}
                  </TabsContent>
                  <TabsContent value="pending">
                    {renderListingGrid(pendingListings, t.noPendingListingsYet)}
                  </TabsContent>
                  <TabsContent value="rejected">
                    {renderListingGrid(rejectedListings, t.noRejectedListingsYet)}
                  </TabsContent>
                </Tabs>
              )}
              <Button asChild className="mt-8 w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/listings/new">{t.postNewListingButton}</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                {t.yourConversationsTitle}
              </CardTitle>
              <CardDescription>{t.yourConversationsDesc}</CardDescription>
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
                                {t.chatAboutLabel} <span className="text-primary">{convo.listingTitle || t.generalInquiry}</span>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {t.withLabel} {convo.participants.find(p => p.id !== currentUser?.id)?.name || t.unknownUser}
                              </p>
                            </div>
                            {convo.unreadCount > 0 && (
                              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                                {convo.unreadCount} {t.newSuffix}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground mt-1 truncate">
                           <span className="font-medium">{convo.lastMessage.senderId === currentUser?.id ? t.youPrefix : ""}</span> {convo.lastMessage.text}
                          </p>
                          <p className={`text-xs text-muted-foreground mt-1 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                            {new Date(convo.lastMessage.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </p>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t.noMessagesYet}</p>
              )}
               <Button asChild className="mt-6 w-full sm:w-auto" variant="outline">
                <Link href="/messages">{t.goToAllMessagesButton}</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <User className={`h-5 w-5 ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {t.personalInfoTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">{t.fullNameLabel}</Label>
                  <Input id="name" defaultValue={displayName} />
                </div>
                <div>
                  <Label htmlFor="email">{t.emailAddressLabel}</Label>
                  <Input id="email" type="email" defaultValue={displayEmail} disabled />
                </div>
                <div>
                  <Label htmlFor="phone">{t.phoneOptionalLabel}</Label>
                  <Input id="phone" type="tel" placeholder={t.phonePlaceholder} />
                </div>
                <Button className="w-full sm:w-auto" onClick={() => toast({title: t.notImplemented}) }><Edit3 className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} />{t.saveChangesButton}</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <ShieldCheck className={`h-5 w-5 ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {t.securityPrivacyTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 <Button variant="outline" className="w-full" onClick={() => toast({title: t.notImplemented})}>{t.changePasswordButton}</Button>
                 <Button variant="outline" className="w-full" onClick={() => toast({title: t.notImplemented})}>{t.notificationPrefsButton}</Button>
                 <Button variant="outline" className="w-full" onClick={() => toast({title: t.notImplemented})}>{t.manageBlockedUsersButton}</Button>
                 <Button variant="destructive" className="w-full mt-4" onClick={() => toast({title: t.notImplemented})}>{t.deleteAccountButton}</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
