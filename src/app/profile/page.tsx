
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Listing, Conversation, User as UserType, NotificationPreferences } from '@/lib/types';
import { ListingCard } from '@/components/ListingCard';
import { User, Settings, ListChecks, LogOut, MessageSquare, Edit3, ShieldCheck, UserCircle as UserCircleIcon, Loader2, PackageOpen, CheckCircle, AlertTriangle, Hourglass, Save, Phone, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, query as firestoreQuery, where, onSnapshot, Timestamp, updateDoc, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';

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
    yourConversationsDesc: "Manage your messages with buyers and sellers.",
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
    saveChangesButton: "Save Changes",
    savingChangesButton: "Saving...",
    changesSavedSuccessTitle: "Changes Saved",
    changesSavedSuccessDesc: "Your profile information has been updated.",
    errorSavingChangesDesc: "Could not save your changes. Please try again.",
    securityPrivacyTitle: "Security & Privacy",
    changePasswordButton: "Change Password",
    // notificationPrefsButton: "Notification Preferences", // Removed, will be new card
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
    loadingConversations: "Loading conversations...",
    failedToLoadConversations: "Failed to load your conversations.",
    notificationSettingsTitle: "Notification Settings",
    notificationSettingsDesc: "Manage how you receive notifications.",
    emailNewMessagesLabel: "Email for New Messages",
    emailListingUpdatesLabel: "Email for Listing Status Updates",
    saveNotificationSettingsButton: "Save Notification Settings",
    savingNotificationSettingsButton: "Saving Settings...",
    notificationSettingsSavedSuccess: "Notification settings saved.",
    errorSavingNotificationSettings: "Could not save notification settings.",
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
    yourConversationsDesc: "إدارة رسائلك مع المشترين والبائعين.",
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
    saveChangesButton: "حفظ التغييرات",
    savingChangesButton: "جار الحفظ...",
    changesSavedSuccessTitle: "تم حفظ التغييرات",
    changesSavedSuccessDesc: "تم تحديث معلومات ملفك الشخصي بنجاح.",
    errorSavingChangesDesc: "لم نتمكن من حفظ تغييراتك. يرجى المحاولة مرة أخرى.",
    securityPrivacyTitle: "الأمان والخصوصية",
    changePasswordButton: "تغيير كلمة المرور",
    // notificationPrefsButton: "تفضيلات الإشعارات",
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
    loadingConversations: "جار تحميل المحادثات...",
    failedToLoadConversations: "فشل تحميل محادثاتك.",
    notificationSettingsTitle: "إعدادات الإشعارات",
    notificationSettingsDesc: "تحكم في كيفية تلقي الإشعارات.",
    emailNewMessagesLabel: "بريد إلكتروني للرسائل الجديدة",
    emailListingUpdatesLabel: "بريد إلكتروني لتحديثات حالة الإعلان",
    saveNotificationSettingsButton: "حفظ إعدادات الإشعارات",
    savingNotificationSettingsButton: "جار حفظ الإعدادات...",
    notificationSettingsSavedSuccess: "تم حفظ إعدادات الإشعارات.",
    errorSavingNotificationSettings: "لم نتمكن من حفظ إعدادات الإشعارات.",
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
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');

  const [approvedListings, setApprovedListings] = useState<Listing[]>([]);
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [rejectedListings, setRejectedListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  const [myConversations, setMyConversations] = useState<Conversation[]>([]);
  const [isLoadingMyConversations, setIsLoadingMyConversations] = useState(true);
  const [unreadConversationCount, setUnreadConversationCount] = useState(0);

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    emailNewMessages: true,
    emailListingUpdates: true,
  });
  const [isSavingNotifPrefs, setIsSavingNotifPrefs] = useState(false);


  useEffect(() => {
    setIsLoading(true);
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseAuthUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserType;
            setCurrentUser(userData);
            setEditedName(userData.name || '');
            setEditedPhone(userData.phone || '');
            setNotificationPrefs(userData.notificationPreferences || { emailNewMessages: true, emailListingUpdates: true });
          } else {
            console.error("No user document found in Firestore for UID:", user.uid);
             const basicUserData: UserType = {
              id: user.uid,
              name: user.displayName || t.defaultUserName,
              email: user.email || t.noEmail,
              phone: '',
              avatarUrl: user.photoURL || '',
              joinDate: user.metadata.creationTime || new Date().toISOString(),
              isAdmin: false,
              notificationPreferences: { emailNewMessages: true, emailListingUpdates: true },
            };
            setCurrentUser(basicUserData);
            setEditedName(basicUserData.name);
            setEditedPhone(basicUserData.phone || '');
            setNotificationPrefs(basicUserData.notificationPreferences);
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
            seller: data.seller || { 
                id: currentUser.id, 
                name: currentUser.name, 
                email: currentUser.email, 
                phone: currentUser.phone,
                joinDate: currentUser.joinDate, 
                isAdmin: currentUser.isAdmin 
            },
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
  }, [currentUser, toast, t]);


  useEffect(() => {
    if (!currentUser?.id) {
      setIsLoadingMyConversations(false);
      setMyConversations([]);
      return;
    }
    setIsLoadingMyConversations(true);
    const q = firestoreQuery(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', currentUser.id),
      orderBy('lastMessage.timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedConversations: Conversation[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedConversations.push({
          id: docSnap.id,
          listingId: data.listingId,
          listing: data.listing,
          participantIds: data.participantIds,
          participants: data.participants,
          lastMessage: {
            text: data.lastMessage.text,
            senderId: data.lastMessage.senderId,
            timestamp: (data.lastMessage.timestamp as Timestamp)?.toDate().toISOString() || new Date(0).toISOString(),
          },
        } as Conversation);
      });
      setMyConversations(fetchedConversations);
      setIsLoadingMyConversations(false);
    }, (error) => {
      console.error("Error fetching user conversations for profile:", error);
      toast({ title: t.errorTitle, description: t.failedToLoadConversations, variant: "destructive" });
      setIsLoadingMyConversations(false);
    });
    return () => unsubscribe();
  }, [currentUser?.id, toast, t]);

  useEffect(() => {
    if (currentUser?.id && myConversations.length > 0) {
      const count = myConversations.filter(
        (convo) => convo.lastMessage.senderId !== currentUser.id // Simplified: assumes last message sender determines "unread" for badge
      ).length;
      setUnreadConversationCount(count);
    } else {
      setUnreadConversationCount(0);
    }
  }, [myConversations, currentUser?.id]);


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

  const handleSaveInfoChanges = async () => {
    if (!firebaseAuthUser || !currentUser) {
      toast({ title: t.errorTitle, description: t.failedToFetchDetails, variant: 'destructive' });
      return;
    }

    const nameChanged = editedName.trim() !== (currentUser.name || '');
    const phoneChanged = editedPhone.trim() !== (currentUser.phone || '');

    if (!nameChanged && !phoneChanged) { 
      return;
    }

    setIsSavingInfo(true);
    try {
      const userDocRef = doc(db, "users", firebaseAuthUser.uid);
      const updateData: Partial<UserType> = {};
      if (nameChanged) updateData.name = editedName.trim();
      if (phoneChanged) updateData.phone = editedPhone.trim();
      
      await updateDoc(userDocRef, updateData);
      
      setCurrentUser(prev => {
        if (!prev) return null;
        const updatedUser = { ...prev };
        if (nameChanged) updatedUser.name = editedName.trim();
        if (phoneChanged) updatedUser.phone = editedPhone.trim();
        return updatedUser;
      });

      toast({ title: t.changesSavedSuccessTitle, description: t.changesSavedSuccessDesc });
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({ title: t.errorTitle, description: t.errorSavingChangesDesc, variant: "destructive" });
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleSaveNotificationPreferences = async () => {
    if (!firebaseAuthUser) {
      toast({ title: t.errorTitle, description: t.failedToFetchDetails, variant: 'destructive' });
      return;
    }
    setIsSavingNotifPrefs(true);
    try {
      const userDocRef = doc(db, "users", firebaseAuthUser.uid);
      await updateDoc(userDocRef, { notificationPreferences: notificationPrefs });
      toast({ title: t.notificationSettingsSavedSuccess });
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast({ title: t.errorTitle, description: t.errorSavingNotificationSettings, variant: "destructive" });
    } finally {
      setIsSavingNotifPrefs(false);
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
          <TabsTrigger value="messages" className="relative">
            <MessageSquare className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} />
            {t.messagesTab}
            {unreadConversationCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {unreadConversationCount}
              </span>
            )}
          </TabsTrigger>
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
              {isLoadingMyConversations ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                  <p className="text-muted-foreground">{t.loadingConversations}</p>
                </div>
              ) : myConversations.length > 0 ? (
                <div className="space-y-4">
                  {myConversations.map((convo) => {
                    const otherParticipant = convo.participantIds
                      .map(pid => convo.participants[pid])
                      .find(p => p.id !== currentUser?.id);
                    const isUnread = convo.lastMessage.senderId !== currentUser?.id;

                    return (
                    <Card key={convo.id} className={`hover:shadow-md transition-shadow ${isUnread ? 'border-primary' : ''}`}>
                      <Link href={`/messages?conversationId=${convo.id}`} className="block">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={`font-semibold text-md ${isUnread ? 'text-primary' : ''}`}>
                                {t.chatAboutLabel} <span className={isUnread ? 'font-bold' : 'text-primary'}>{convo.listing?.title || t.generalInquiry}</span>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {t.withLabel} {otherParticipant?.name || t.unknownUser}
                              </p>
                            </div>
                            {isUnread && (
                              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                                {t.newSuffix}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 truncate ${isUnread ? 'text-foreground font-medium' : 'text-foreground'}`}>
                           <span className="font-medium">{convo.lastMessage.senderId === currentUser?.id ? t.youPrefix : ""}</span> {convo.lastMessage.text}
                          </p>
                          <p className={`text-xs text-muted-foreground mt-1 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                            {new Date(convo.lastMessage.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </p>
                        </CardContent>
                      </Link>
                    </Card>
                  );
                 })}
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
                  <Input 
                    id="name" 
                    value={editedName} 
                    onChange={(e) => setEditedName(e.target.value)}
                    disabled={isSavingInfo}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t.emailAddressLabel}</Label>
                  <Input id="email" type="email" value={displayEmail} disabled />
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'} text-muted-foreground`} />
                    {t.phoneOptionalLabel}
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder={t.phonePlaceholder} 
                    value={editedPhone}
                    onChange={(e) => setEditedPhone(e.target.value)}
                    disabled={isSavingInfo}
                    dir="ltr" 
                  />
                </div>
                <Button 
                  className="w-full sm:w-auto" 
                  onClick={handleSaveInfoChanges} 
                  disabled={isSavingInfo || (editedName === (currentUser?.name || '') && editedPhone === (currentUser?.phone || ''))}
                >
                  {isSavingInfo ? (
                    <><Loader2 className={`h-4 w-4 animate-spin ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {t.savingChangesButton}</>
                  ) : (
                    <><Save className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {t.saveChangesButton}</>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Bell className={`h-5 w-5 ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {t.notificationSettingsTitle}
                </CardTitle>
                <CardDescription>{t.notificationSettingsDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2 rtl:space-x-reverse">
                  <Label htmlFor="emailNewMessages" className="flex-grow cursor-pointer">
                    {t.emailNewMessagesLabel}
                  </Label>
                  <Switch
                    id="emailNewMessages"
                    checked={notificationPrefs.emailNewMessages}
                    onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, emailNewMessages: checked }))}
                    disabled={isSavingNotifPrefs}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rtl:space-x-reverse">
                  <Label htmlFor="emailListingUpdates" className="flex-grow cursor-pointer">
                    {t.emailListingUpdatesLabel}
                  </Label>
                  <Switch
                    id="emailListingUpdates"
                    checked={notificationPrefs.emailListingUpdates}
                    onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, emailListingUpdates: checked }))}
                    disabled={isSavingNotifPrefs}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleSaveNotificationPreferences}
                  disabled={isSavingNotifPrefs}
                >
                  {isSavingNotifPrefs ? (
                    <><Loader2 className={`h-4 w-4 animate-spin ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {t.savingNotificationSettingsButton}</>
                  ) : (
                    <>{t.saveNotificationSettingsButton}</>
                  )}
                </Button>
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
                 {/* Removed Notification Preferences button from here */}
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
