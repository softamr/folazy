
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conversation, Message as MessageType, User as UserType, Listing as ListingType } from '@/lib/types';
import { Send, ArrowLeft, Paperclip, Smile, MessageSquare as MessageSquareIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
  setDoc,
  limit
} from 'firebase/firestore';
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
    noConversationsYet: "No conversations yet. Start one from a listing!",
    reListingPrefix: "Re:",
    generalInquiry: "General Inquiry",
    youPrefix: "You: ",
    unreadSuffix: "new", // Placeholder, real unread count not fully implemented
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
    conversationCreated: "Conversation started.",
    messageSent: "Message sent.",
    failedToSendMessage: "Failed to send message.",
    failedToLoadMessages: "Failed to load messages for this conversation.",
    failedToLoadConversations: "Failed to load your conversations.",
  },
  ar: {
    loadingMessages: "جار تحميل الرسائل...",
    pleaseLogin: "الرجاء تسجيل الدخول لعرض رسائلك.",
    loginRequiredDesc: "يجب أن تكون مسجلاً الدخول للوصول إلى محادثاتك.",
    loginButton: "تسجيل الدخول",
    loadingConversations: "جار تحميل المحادثات...",
    yourChatsTitle: "محادثاتك",
    selectConversationDesc: "اختر محادثة لعرض الرسائل.",
    noConversationsYet: "لا توجد محادثات بعد. ابدأ واحدة من صفحة إعلان!",
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
    conversationCreated: "بدأت المحادثة.",
    messageSent: "تم إرسال الرسالة.",
    failedToSendMessage: "فشل إرسال الرسالة.",
    failedToLoadMessages: "فشل تحميل رسائل هذه المحادثة.",
    failedToLoadConversations: "فشل تحميل محادثاتك.",
  }
};

// Helper function to generate a deterministic conversation ID
const getDeterministicConversationId = (userId1: string, userId2: string, listingId: string): string => {
  const ids = [userId1, userId2].sort();
  return `${ids[0]}_${ids[1]}_${listingId}`;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    setIsLoadingAuth(true);
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setCurrentUser({ id: userDocSnap.id, ...userDocSnap.data() } as UserType);
          } else { 
            setCurrentUser({
              id: user.uid, name: user.displayName || user.email || "User",
              email: user.email || "", avatarUrl: user.photoURL || "",
              joinDate: user.metadata.creationTime || new Date().toISOString(), isAdmin: false,
            });
          }
        } catch (error) {
          console.error("Error fetching user document for messages:", error);
          toast({ title: t.errorTitle, description: t.failedToLoadProfile, variant: "destructive" });
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribeAuth();
  }, [toast, t]);


  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', currentUser.id),
      orderBy('lastMessage.timestamp', 'desc')
    );

    const unsubscribeConversations = onSnapshot(q, 
      async (querySnapshot) => {
        const fetchedConversations: Conversation[] = [];
        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          const conv: Conversation = {
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
          };
          fetchedConversations.push(conv);
        }
        setConversations(fetchedConversations);
        setIsLoadingConversations(false);
      },
      (error) => {
        console.error("Error fetching conversations: ", error);
        toast({ title: t.errorTitle, description: t.failedToLoadConversations, variant: "destructive" });
        setIsLoadingConversations(false);
      }
    );
    return () => unsubscribeConversations();
  }, [currentUser, toast, t]);


  useEffect(() => {
    if (!selectedConversation?.id) {
      setMessages([]);
      return;
    }
    setIsLoadingMessages(true);
    const messagesQuery = query(
      collection(db, 'conversations', selectedConversation.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50) 
    );
    const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
      const fetchedMessages: MessageType[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedMessages.push({
          id: docSnap.id,
          conversationId: selectedConversation.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          text: data.text,
          timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date(0).toISOString(),
          isRead: data.isRead,
        });
      });
      setMessages(fetchedMessages);
      setIsLoadingMessages(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      toast({ title: t.errorTitle, description: t.failedToLoadMessages, variant: "destructive" });
      setIsLoadingMessages(false);
    });
    return () => unsubscribeMessages();
  }, [selectedConversation, toast, t]);


  useEffect(() => {
    if (isLoadingAuth || isLoadingConversations) return;
    if (!currentUser) return;


    if (conversationIdParam) {
      const target = conversations.find(c => c.id === conversationIdParam);
      if (target && (!selectedConversation || selectedConversation.id !== target.id)) {
        setSelectedConversation(target);
      }
      return; 
    }

    if (listingIdParam && recipientIdParam) {
      const deterministicId = getDeterministicConversationId(currentUser.id, recipientIdParam, listingIdParam);
      const existingConvo = conversations.find(c => c.id === deterministicId);

      if (existingConvo) {
        if (!selectedConversation || selectedConversation.id !== existingConvo.id) {
          setSelectedConversation(existingConvo);
        }
      } else {
        
        const createNewConversation = async () => {
          try {
            const recipientDocRef = doc(db, "users", recipientIdParam);
            const listingDocRef = doc(db, "listings", listingIdParam);

            const [recipientSnap, listingSnap] = await Promise.all([
              getDoc(recipientDocRef), getDoc(listingDocRef)
            ]);

            if (!recipientSnap.exists() || !listingSnap.exists()) {
              toast({ title: t.errorTitle, description: t.failedToLoadNewChatDetails, variant: "destructive" });
              router.push('/messages');
              return;
            }
            const recipientData = { id: recipientSnap.id, ...recipientSnap.data() } as UserType;
            const listingData = { id: listingSnap.id, ...listingSnap.data() } as ListingType;

            const newConversationData: Omit<Conversation, 'id'> = {
              listingId: listingIdParam,
              listing: { 
                id: listingData.id, 
                title: listingData.title,
                imageUrl: listingData.images?.[0] 
              },
              participantIds: [currentUser.id, recipientData.id].sort(),
              participants: {
                [currentUser.id]: { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl },
                [recipientData.id]: { id: recipientData.id, name: recipientData.name, avatarUrl: recipientData.avatarUrl }
              },
              lastMessage: {
                text: t.conversationCreated,
                senderId: 'system', 
                timestamp: new Date().toISOString(),
              },
            };
            
            await setDoc(doc(db, 'conversations', deterministicId), {
              ...newConversationData,
              lastMessage: { ...newConversationData.lastMessage, timestamp: serverTimestamp() }
            });
            
            // Optimistically set the selected conversation
            const newConvObjectForState: Conversation = {
              id: deterministicId,
              ...newConversationData,
              // Use a client-side timestamp for immediate display in lastMessage
              lastMessage: { ...newConversationData.lastMessage, timestamp: new Date().toISOString() } 
            };
            setSelectedConversation(newConvObjectForState);

            router.replace(`/messages?conversationId=${deterministicId}`, undefined, { shallow: true });

          } catch (error) {
            console.error("Error creating new conversation:", error);
            toast({ title: t.errorTitle, description: t.failedToLoadNewChatDetails, variant: "destructive" });
            router.push('/messages');
          }
        };
        createNewConversation();
      }
    } else if (!conversationIdParam && !listingIdParam && selectedConversation) {
      setSelectedConversation(null);
    }

  }, [conversationIdParam, listingIdParam, recipientIdParam, currentUser, conversations, router, toast, t, isLoadingAuth, isLoadingConversations, selectedConversation]);


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;
    
    const otherParticipantId = selectedConversation.participantIds.find(id => id !== currentUser.id);
    if (!otherParticipantId) return;

    setIsSending(true);
    try {
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: currentUser.id,
        receiverId: otherParticipantId,
        text: newMessage.trim(),
        timestamp: serverTimestamp(), 
        isRead: false,
      };
      await addDoc(collection(db, 'conversations', selectedConversation.id, 'messages'), messageData);

      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        lastMessage: {
          text: newMessage.trim(),
          senderId: currentUser.id,
          timestamp: serverTimestamp(),
        },
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: t.errorTitle, description: t.failedToSendMessage, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };
  
  const getOtherParticipantInfo = (convo: Conversation | null): Conversation['participants'][string] | undefined => {
    if (!convo || !currentUser) return undefined;
    const otherId = convo.participantIds.find(id => id !== currentUser.id);
    return otherId ? convo.participants[otherId] : undefined;
  };


  if (isLoadingAuth || currentUser === undefined) { 
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
            {isLoadingConversations && (
                <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
            )}
            {!isLoadingConversations && conversations.length === 0 && (
              <p className="p-4 text-muted-foreground text-center">{t.noConversationsYet}</p>
            )}
            {conversations.map((convo) => {
              const otherParticipant = getOtherParticipantInfo(convo);
              const lastMsgTimestamp = convo.lastMessage.timestamp ? new Date(convo.lastMessage.timestamp).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }) : '';
              const isUnread = convo.lastMessage.senderId !== currentUser?.id; 
              return (
              <Button
                key={convo.id}
                variant="ghost"
                className={`w-full justify-start p-3 h-auto rounded-none border-b ${selectedConversation?.id === convo.id ? 'bg-muted' : ''}`}
                onClick={() => router.push(`/messages?conversationId=${convo.id}`)}
              >
                <Avatar className={`h-10 w-10 ${language === 'ar' ? 'ms-3' : 'me-3'}`}>
                  <AvatarImage src={otherParticipant?.avatarUrl || `https://placehold.co/100x100.png`} alt={otherParticipant?.name} data-ai-hint="avatar person" />
                  <AvatarFallback>{otherParticipant?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className={`flex-grow ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p className="font-semibold truncate">{otherParticipant?.name || t.unknownUser}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {convo.listing?.title ? `${convo.listing.title}` : t.generalInquiry}
                  </p>
                  <p className={`text-xs truncate ${isUnread ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                    {convo.lastMessage.senderId === currentUser?.id ? t.youPrefix : ""}{convo.lastMessage.text}
                  </p>
                </div>
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                  <span>{lastMsgTimestamp}</span>
                  {isUnread && (
                    <span className="mt-1 h-2 w-2 bg-primary rounded-full" title={t.unreadSuffix}></span>
                  )}
                </div>
              </Button>
              );
            })}
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
                 <Avatar className={`h-9 w-9 ${language === 'ar' ? 'ms-2' : 'me-2'}`}>
                    <AvatarImage src={getOtherParticipantInfo(selectedConversation)?.avatarUrl || `https://placehold.co/100x100.png`} alt={getOtherParticipantInfo(selectedConversation)?.name} data-ai-hint="avatar person" />
                    <AvatarFallback>{getOtherParticipantInfo(selectedConversation)?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                 </Avatar>
                 <div>
                  <CardTitle>{getOtherParticipantInfo(selectedConversation)?.name || t.chatWithPlaceholder(t.unknownUser)}</CardTitle>
                  {selectedConversation.listing?.id && (
                    <CardDescription className="truncate max-w-xs">
                      {t.regardingLabel} <Link href={`/listings/${selectedConversation.listing.id}`} className="text-primary hover:underline">{selectedConversation.listing.title || t.regardingListingPlaceholder(selectedConversation.listing.id)}</Link>
                    </CardDescription>
                  )}
                 </div>
              </div>
            </CardHeader>
            <ScrollArea className="flex-grow p-4 space-y-4">
              {isLoadingMessages && (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {!isLoadingMessages && messages.map((msg) => (
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
                      {new Date(msg.timestamp).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <CardFooter className="p-4 border-t">
              <div className="flex w-full items-center gap-2">
                <Button variant="ghost" size="icon" disabled><Paperclip className="h-5 w-5 text-muted-foreground"/></Button>
                <Button variant="ghost" size="icon" disabled><Smile className="h-5 w-5 text-muted-foreground"/></Button>
                <Input
                  type="text"
                  placeholder={t.typeYourMessagePlaceholder}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
                  className="flex-grow"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  disabled={isSending}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin"/> : <Send className={`h-5 w-5 ${language === 'ar' ? 'transform rotate-180' : ''}`} /> }
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

