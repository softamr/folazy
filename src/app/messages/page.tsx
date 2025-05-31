
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { placeholderConversations, placeholderUsers, placeholderMessagesForConversation, placeholderListings } from '@/lib/placeholder-data';
import type { Conversation, Message as MessageType, User as UserType, Listing } from '@/lib/types';
import { Send, ArrowLeft, Paperclip, Smile, MessageSquare as MessageSquareIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const translations = {
  en: {
    loadingMessages: "Loading messages...",
    pleaseLogin: "Please log in to view your messages.",
    loginRequiredDesc: "You need to be signed in to access your conversations.",
    loginButton: "Login",
    loadingConversations: "Loading conversations...",
    yourChatsTitle: "Your Chats",
    selectConversationDesc: "Select a conversation to view messages.",
    noConversationsYet: "No conversations yet.",
    reListingPrefix: "Re:",
    generalInquiry: "General Inquiry",
    youPrefix: "You: ",
    unreadSuffix: "new",
    selectConversationPrompt: "Select a conversation",
    startNewConversationPrompt: "Or start a new one by contacting a seller on a listing page.",
    browseListingsButton: "Browse Listings",
    regardingLabel: "Regarding:",
    typeYourMessagePlaceholder: "Type your message...",
    sendSr: "Send",
    unknownUser: "Unknown User",
    errorTitle: "Error",
    failedToLoadProfile: "Failed to load your profile for messaging.",
    chatWithPlaceholder: (name: string) => `Chat with ${name}`,
    regardingListingPlaceholder: (title: string) => `Regarding: ${title}`,
    startTyping: "Start typing to chat...",
  },
  ar: {
    loadingMessages: "جار تحميل الرسائل...",
    pleaseLogin: "الرجاء تسجيل الدخول لعرض رسائلك.",
    loginRequiredDesc: "يجب أن تكون مسجلاً الدخول للوصول إلى محادثاتك.",
    loginButton: "تسجيل الدخول",
    loadingConversations: "جار تحميل المحادثات...",
    yourChatsTitle: "محادثاتك",
    selectConversationDesc: "اختر محادثة لعرض الرسائل.",
    noConversationsYet: "لا توجد محادثات بعد.",
    reListingPrefix: "بخصوص:",
    generalInquiry: "استفسار عام",
    youPrefix: "أنت: ",
    unreadSuffix: "جديدة",
    selectConversationPrompt: "اختر محادثة",
    startNewConversationPrompt: "أو ابدأ محادثة جديدة عن طريق الاتصال بالبائع في صفحة الإعلان.",
    browseListingsButton: "تصفح الإعلانات",
    regardingLabel: "بخصوص:",
    typeYourMessagePlaceholder: "اكتب رسالتك...",
    sendSr: "إرسال",
    unknownUser: "مستخدم غير معروف",
    errorTitle: "خطأ",
    failedToLoadProfile: "فشل تحميل ملفك الشخصي للرسائل.",
    chatWithPlaceholder: (name: string) => `محادثة مع ${name}`,
    regardingListingPlaceholder: (title: string) => `بخصوص: ${title}`,
    startTyping: "ابدأ الكتابة للدردشة...",
  }
};

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();

  const conversationIdParam = searchParams.get('conversationId');
  const listingIdParam = searchParams.get('listingId');
  const recipientIdParam = searchParams.get('recipientId');

  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined); // undefined means auth state not yet determined
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(placeholderConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Global loading for the page
  
  useEffect(() => {
    // This effect handles Firebase authentication state
    setIsLoading(true); // Start loading when checking auth
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseAuthUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setCurrentUser({ id: userDocSnap.id, ...userDocSnap.data() } as UserType);
          } else {
            setCurrentUser({
              id: user.uid,
              name: user.displayName || user.email || "User",
              email: user.email || "",
              avatarUrl: user.photoURL || "",
              joinDate: user.metadata.creationTime || new Date().toISOString(),
              isAdmin: false,
            });
            console.warn("User document not found for UID:", user.uid, "Using basic auth data for messages.");
          }
        } catch (error) {
          console.error("Error fetching user document for messages:", error);
          toast({ title: t.errorTitle, description: t.failedToLoadProfile, variant: "destructive" });
          setCurrentUser(null); // Explicitly null on error
        }
      } else {
        setFirebaseAuthUser(null);
        setCurrentUser(null); // Explicitly null if no user
      }
      // setIsLoading(false); // Auth check done, conversation logic will handle final isLoading
    });
    return () => unsubscribeAuth();
  }, [toast, t]);


  useEffect(() => {
    // This effect handles conversation selection and creation based on URL params and currentUser
    // It should only run meaningfully after currentUser state is determined.

    if (currentUser === undefined) { // Auth state still being determined
      // setIsLoading(true); // already true from auth effect or initial state
      return;
    }

    if (currentUser === null) { // User is not logged in
      setIsLoading(false); // Stop loading, UI will show login prompt
      setSelectedConversation(null); // Ensure no conversation is selected
      return;
    }

    // At this point, currentUser is a UserType object (user is logged in)
    let targetConversation: Conversation | null = null;

    if (conversationIdParam) {
      targetConversation = conversations.find(c => c.id === conversationIdParam) || null;
      // TODO: If not found in local state, fetch from Firestore if this page should support deep-linking to any convo
    } else if (listingIdParam && recipientIdParam && currentUser) {
      const existingConvo = conversations.find(c => 
        c.listingId === listingIdParam && 
        c.participants.some(p => p.id === recipientIdParam) &&
        c.participants.some(p => p.id === currentUser.id)
      );

      if (existingConvo) {
        targetConversation = existingConvo;
      } else {
        // Create a shell for a new conversation to "open the form"
        const tempRecipient: UserType = { 
            id: recipientIdParam, 
            name: t.unknownUser, // Will be placeholder, real data fetch is a TODO
            email: '', avatarUrl: '', joinDate: new Date().toISOString(), isAdmin: false 
        };
        // Fetching actual listing title is a TODO, using placeholder for now
        const tempListingTitle = `${t.reListingPrefix} ${listingIdParam.substring(0,10)}...`; 
        const newConvoId = `new_${currentUser.id}_${recipientIdParam}_${listingIdParam}`; // Unique temp ID

        targetConversation = {
            id: newConvoId,
            listingId: listingIdParam,
            listingTitle: tempListingTitle,
            participants: [currentUser, tempRecipient],
            lastMessage: { 
               id: `system_init_${newConvoId}`, 
               conversationId: newConvoId,
               senderId: 'system', // Indicates a system-generated message or placeholder
               receiverId: currentUser.id, 
               text: t.startTyping,
               timestamp: new Date().toISOString(),
               isRead: true, // No actual message from other user yet
           },
            unreadCount: 0,
        };
        
        // Add this new shell conversation to the main list if it's not already there by ID
        if (!conversations.find(c => c.id === targetConversation!.id)) {
            setConversations(prevConvos => [targetConversation!, ...prevConvos.filter(c => c.id !== targetConversation!.id)]);
        }
        // Ensure messages for this new convo are initialized (likely empty or with a system message)
        if (!placeholderMessagesForConversation[targetConversation.id]) {
            placeholderMessagesForConversation[targetConversation.id] = targetConversation.lastMessage.senderId === 'system' ? [targetConversation.lastMessage] : [];
        }
      }
    }

    if (targetConversation) {
      setSelectedConversation(targetConversation);
      setMessages(placeholderMessagesForConversation[targetConversation.id] || []);
    } else if (!conversationIdParam && !listingIdParam && !recipientIdParam) {
      // If navigating to /messages without specific params, and a convo was previously selected,
      // clear it to show the "Select a conversation" prompt.
      // However, if user just sent a message and URL didn't change, keep it selected.
      // This needs careful handling based on router.push behavior.
      // For now, if no params to define a convo, we don't auto-select or clear explicitly here.
      // Let the UI show "Select conversation" if selectedConversation is null.
    }
    
    setIsLoading(false); // All conversation setup logic for this render is done

  }, [conversationIdParam, listingIdParam, recipientIdParam, currentUser, conversations, t]);
  // Note: `conversations` is a dependency. Adding a new shell conversation to it will trigger this effect again.
  // This is generally okay as it should stabilize.

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;
    const recipient = selectedConversation.participants.find(p => p.id !== currentUser.id);
    if (!recipient) return;

    const msg: MessageType = {
      id: `msg${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: currentUser.id,
      receiverId: recipient.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages(prev => [...prev, msg]);
    
    const updatedConvo = { ...selectedConversation, lastMessage: msg };
    setSelectedConversation(updatedConvo); // Keep current convo selected
    setConversations(prevConvos => prevConvos.map(c => c.id === updatedConvo.id ? updatedConvo : c));
    
    // Update placeholder global store (for demo persistence across selections)
    const currentMessagesForThisConvo = placeholderMessagesForConversation[selectedConversation.id] || [];
    placeholderMessagesForConversation[selectedConversation.id] = [...currentMessagesForThisConvo, msg];

    setNewMessage('');
  };
  
  const getOtherParticipant = (convo: Conversation | null): UserType | undefined => {
    if (!convo || !currentUser) return undefined;
    return convo.participants.find(p => p.id !== currentUser?.id); // currentUser could be undefined during initial renders
  };


  if (isLoading || currentUser === undefined) { 
     return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.loadingMessages}</p>
      </div>
     );
  }
  
  if (!currentUser) { // Check after loading and currentUser determination is complete
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center border rounded-lg shadow-lg min-h-[calc(100vh-15rem)]">
        <MessageSquareIcon className="h-16 w-16 mb-4 text-muted-foreground" />
        <p className="text-xl font-medium">{t.pleaseLogin}</p>
        <p className="text-muted-foreground mb-6">{t.loginRequiredDesc}</p>
        <Button asChild className="mt-4">
          <Link href="/auth/login">{t.loginButton}</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col md:flex-row h-[calc(100vh-10rem)] border rounded-lg shadow-lg overflow-hidden ${language === 'ar' ? 'md:flex-row-reverse' : ''}`}>
      {/* Sidebar for conversations */}
      <Card className={`w-full md:w-1/3 ${selectedConversation && 'hidden md:flex'} md:flex flex-col rounded-none ${language === 'ar' ? 'md:border-l md:rounded-r-lg md:rounded-l-none' : 'md:border-r md:rounded-l-lg md:rounded-r-none'}`}>
        <CardHeader>
          <CardTitle>{t.yourChatsTitle}</CardTitle>
          <CardDescription>{t.selectConversationDesc}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-grow">
          <ScrollArea className="h-[calc(100vh-18rem)] md:h-full">
            {conversations.length === 0 && (
              <p className="p-4 text-muted-foreground text-center">{t.noConversationsYet}</p>
            )}
            {conversations.map((convo) => (
              <Button
                key={convo.id}
                variant="ghost"
                className={`w-full justify-start p-3 h-auto rounded-none border-b ${selectedConversation?.id === convo.id ? 'bg-muted' : ''}`}
                onClick={() => {
                  // setSelectedConversation(null); // Clear selection first if it helps trigger UI update
                  // setTimeout(() => { // Delay to ensure UI can react if needed
                    router.push(`/messages?conversationId=${convo.id}`);
                  // }, 0);
                }}
              >
                <Avatar className={`h-10 w-10 ${language === 'ar' ? 'ms-3' : 'me-3'}`}>
                  <AvatarImage src={getOtherParticipant(convo)?.avatarUrl || `https://placehold.co/100x100.png`} alt={getOtherParticipant(convo)?.name} data-ai-hint="avatar person" />
                  <AvatarFallback>{getOtherParticipant(convo)?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className={`flex-grow ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p className="font-semibold truncate">{getOtherParticipant(convo)?.name || t.unknownUser}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {convo.listingTitle ? `${t.reListingPrefix} ${convo.listingTitle}` : t.generalInquiry}
                  </p>
                  <p className={`text-xs truncate ${convo.unreadCount > 0 && convo.lastMessage.senderId !== currentUser?.id ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                    {convo.lastMessage.senderId === currentUser?.id ? t.youPrefix : ""}{convo.lastMessage.text}
                  </p>
                </div>
                {convo.unreadCount > 0 && convo.lastMessage.senderId !== currentUser?.id && (
                  <span className={`${language === 'ar' ? 'me-2' : 'ms-2'} text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5`}>
                    {convo.unreadCount}
                  </span>
                )}
              </Button>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main chat area */}
      <div className={`flex-grow flex-col bg-background ${!selectedConversation && 'hidden md:flex'} ${selectedConversation && 'flex'} ${language === 'ar' ? 'md:rounded-l-lg' : 'md:rounded-r-lg'}`}>
        {!selectedConversation ? (
          <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <MessageSquareIcon className="h-16 w-16 mb-4" />
            <p className="text-xl font-medium">{t.selectConversationPrompt}</p>
            <p>{t.startNewConversationPrompt}</p>
             <Button asChild className="mt-4" variant="outline">
                <Link href="/"><ArrowLeft className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {t.browseListingsButton}</Link>
            </Button>
          </div>
        ) : (
          <>
            <CardHeader className="border-b flex-row items-center justify-between p-4">
              <div className="flex items-center">
                 <Button variant="ghost" size="icon" onClick={() => {
                    setSelectedConversation(null); // This will hide the chat area on mobile
                    // router.push('/messages'); // Optionally clear query params
                  }} className="md:hidden me-2">
                   <ArrowLeft className="h-5 w-5"/>
                 </Button>
                 <div>
                  <CardTitle>{getOtherParticipant(selectedConversation)?.name || t.chatWithPlaceholder(t.unknownUser)}</CardTitle>
                  {selectedConversation.listingId && (
                    <CardDescription className="truncate">
                      {t.regardingLabel} <Link href={`/listings/${selectedConversation.listingId}`} className="text-primary hover:underline">{selectedConversation.listingTitle || t.regardingListingPlaceholder(selectedConversation.listingId)}</Link>
                    </CardDescription>
                  )}
                 </div>
              </div>
            </CardHeader>
            <ScrollArea className="flex-grow p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === currentUser?.id ? (language === 'ar' ? 'justify-start' : 'justify-end') : (language === 'ar' ? 'justify-end' : 'justify-start')}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow ${
                      msg.senderId === currentUser?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === currentUser?.id ? (language === 'ar' ? 'text-primary-foreground/70 text-left' : 'text-primary-foreground/70 text-right') : (language === 'ar' ? 'text-muted-foreground/70 text-left' : 'text-muted-foreground/70 text-right')}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <CardFooter className="p-4 border-t">
              <div className="flex w-full items-center gap-2">
                <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5 text-muted-foreground"/></Button>
                <Button variant="ghost" size="icon"><Smile className="h-5 w-5 text-muted-foreground"/></Button>
                <Input
                  type="text"
                  placeholder={t.typeYourMessagePlaceholder}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-grow"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className={`h-5 w-5 ${language === 'ar' ? 'transform rotate-180' : ''}`} />
                  <span className="sr-only">{t.sendSr}</span>
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </div>
    </div>
  );
}

