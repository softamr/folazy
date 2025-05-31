
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
    failedToLoadNewChatDetails: "Failed to load details for the new chat.",
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
    failedToLoadNewChatDetails: "فشل تحميل تفاصيل المحادثة الجديدة.",
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

  const [currentUser, setCurrentUser] = useState<UserType | null | undefined>(undefined);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(placeholderConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNewConvoDetails, setIsFetchingNewConvoDetails] = useState(false);
  
  useEffect(() => {
    setIsLoading(true);
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
          setCurrentUser(null);
        }
      } else {
        setFirebaseAuthUser(null);
        setCurrentUser(null);
      }
      // setIsLoading(false); // Defer to conversation logic
    });
    return () => unsubscribeAuth();
  }, [toast, t]);


  useEffect(() => {
    if (currentUser === undefined) { // Auth state still being determined
      setIsLoading(true);
      return;
    }
    if (currentUser === null) { // User is not logged in
      setIsLoading(false);
      setSelectedConversation(null);
      return;
    }

    // At this point, currentUser is a UserType object (user is logged in)
    
    if (conversationIdParam) {
      const target = conversations.find(c => c.id === conversationIdParam);
      if (target) {
        setSelectedConversation(target);
        setMessages(placeholderMessagesForConversation[target.id] || []);
      } else {
        // If conversationIdParam is present but not found, clear selection or fetch if that's desired.
        // For now, clearing selection if not found in local placeholder.
        setSelectedConversation(null);
      }
      setIsLoading(false);
      return;
    }
    
    if (listingIdParam && recipientIdParam && currentUser) {
      const existingConvo = conversations.find(c => 
        c.listingId === listingIdParam && 
        c.participants.some(p => p.id === recipientIdParam) &&
        c.participants.some(p => p.id === currentUser.id)
      );

      if (existingConvo) {
        setSelectedConversation(existingConvo);
        setMessages(placeholderMessagesForConversation[existingConvo.id] || []);
        setIsLoading(false);
        return;
      } else {
        // New conversation: Fetch details
        const fetchNewConvoDetails = async () => {
          setIsFetchingNewConvoDetails(true);
          setIsLoading(true); // Ensure global loading is active
          try {
            const recipientDocRef = doc(db, "users", recipientIdParam);
            const listingDocRef = doc(db, "listings", listingIdParam);

            const [recipientSnap, listingSnap] = await Promise.all([
              getDoc(recipientDocRef),
              getDoc(listingDocRef),
            ]);

            const recipientData = recipientSnap.exists()
              ? { id: recipientSnap.id, ...recipientSnap.data() } as UserType
              : { id: recipientIdParam, name: t.unknownUser, email: '', avatarUrl: '', joinDate: new Date().toISOString(), isAdmin: false };
            
            const listingData = listingSnap.exists()
              ? { id: listingSnap.id, ...listingSnap.data() } as Listing
              : null;

            const convoTitle = listingData ? listingData.title : `${t.reListingPrefix} ${listingIdParam.substring(0,10)}...`;
            const newConvoId = `new_${currentUser.id}_${recipientIdParam}_${listingIdParam}`;
            
            const newConversation: Conversation = {
              id: newConvoId,
              listingId: listingIdParam,
              listingTitle: convoTitle,
              participants: [currentUser, recipientData],
              lastMessage: {
                id: `system_init_${newConvoId}`,
                conversationId: newConvoId,
                senderId: 'system',
                receiverId: currentUser.id,
                text: t.startTyping,
                timestamp: new Date().toISOString(),
                isRead: true,
              },
              unreadCount: 0,
            };
            
            setConversations(prevConvos => {
                if (!prevConvos.find(c => c.id === newConversation.id)) {
                    return [newConversation, ...prevConvos.filter(c => c.id !== newConversation.id)];
                }
                return prevConvos;
            });
            setSelectedConversation(newConversation);
            if (!placeholderMessagesForConversation[newConversation.id]) {
                 placeholderMessagesForConversation[newConversation.id] = newConversation.lastMessage.senderId === 'system' ? [newConversation.lastMessage] : [];
            }
            setMessages(placeholderMessagesForConversation[newConversation.id] || []);

          } catch (error) {
            console.error("Error fetching details for new conversation:", error);
            toast({ title: t.errorTitle, description: t.failedToLoadNewChatDetails, variant: "destructive" });
            setSelectedConversation(null); // Clear selection on error
          } finally {
            setIsFetchingNewConvoDetails(false);
            setIsLoading(false);
          }
        };
        
        fetchNewConvoDetails();
        return; // Return here as fetchNewConvoDetails handles setting isLoading to false
      }
    }
    
    // If no specific conversation is targeted by params, clear selection
    // This helps when navigating to /messages directly after being in a specific chat.
    if (!conversationIdParam && !listingIdParam && !recipientIdParam) {
      setSelectedConversation(null);
    }
    setIsLoading(false);

  }, [conversationIdParam, listingIdParam, recipientIdParam, currentUser, toast, t]);


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
    setSelectedConversation(updatedConvo);
    setConversations(prevConvos => prevConvos.map(c => c.id === updatedConvo.id ? updatedConvo : c));
    
    const currentMessagesForThisConvo = placeholderMessagesForConversation[selectedConversation.id] || [];
    placeholderMessagesForConversation[selectedConversation.id] = [...currentMessagesForThisConvo, msg];

    setNewMessage('');
  };
  
  const getOtherParticipant = (convo: Conversation | null): UserType | undefined => {
    if (!convo || !currentUser) return undefined;
    return convo.participants.find(p => p.id !== currentUser?.id);
  };

  if (isLoading || currentUser === undefined || isFetchingNewConvoDetails) { 
     return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.loadingMessages}</p>
      </div>
     );
  }
  
  if (!currentUser) {
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
                    router.push(`/messages?conversationId=${convo.id}`);
                }}
              >
                <Avatar className={`h-10 w-10 ${language === 'ar' ? 'ms-3' : 'me-3'}`}>
                  <AvatarImage src={getOtherParticipant(convo)?.avatarUrl || `https://placehold.co/100x100.png`} alt={getOtherParticipant(convo)?.name} data-ai-hint="avatar person" />
                  <AvatarFallback>{getOtherParticipant(convo)?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className={`flex-grow ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p className="font-semibold truncate">{getOtherParticipant(convo)?.name || t.unknownUser}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {convo.listingTitle ? `${convo.listingTitle}` : t.generalInquiry}
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
                    setSelectedConversation(null);
                    router.push('/messages');
                  }} className="md:hidden me-2">
                   <ArrowLeft className="h-5 w-5"/>
                 </Button>
                 <div>
                  <CardTitle>{getOtherParticipant(selectedConversation)?.name || t.chatWithPlaceholder(t.unknownUser)}</CardTitle>
                  {selectedConversation.listingId && (
                    <CardDescription className="truncate">
                      {t.regardingLabel} <Link href={`/listings/${selectedConversation.listingId}`} className="text-primary hover:underline">{selectedConversation.listingTitle || t.regardingListingPlaceholder(selectedConversation.listingId || 'listing')}</Link>
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
