
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
import { Send, ArrowLeft, Paperclip, Smile, MessageSquare as MessageSquareIcon } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

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
  }
};

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const t = translations[language];

  const conversationIdParam = searchParams.get('conversationId');
  const listingIdParam = searchParams.get('listingId');
  const recipientIdParam = searchParams.get('recipientId');

  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(placeholderConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const user = placeholderUsers.find(u => u.id === 'user1'); 
    setCurrentUser(user || null);
  }, []);

  useEffect(() => {
    if (!currentUser && !isLoading && placeholderUsers.length === 0) {
        setIsLoading(false);
        return;
    }
    if (!currentUser && placeholderUsers.length > 0 && !isLoading) {
        return;
    }

    setIsLoading(true);
    let activeConversation: Conversation | undefined;

    if (conversationIdParam) {
      activeConversation = conversations.find(c => c.id === conversationIdParam);
    } else if (listingIdParam && recipientIdParam && currentUser) {
      activeConversation = conversations.find(c => 
        c.listingId === listingIdParam && 
        c.participants.some(p => p.id === recipientIdParam) &&
        c.participants.some(p => p.id === currentUser.id)
      );
      
      if (!activeConversation) {
        const recipient = placeholderUsers.find(u => u.id === recipientIdParam);
        const listing = placeholderListings.find(l => l.id === listingIdParam);
        if (recipient && listing && currentUser) {
           const newConvoId = `convo${conversations.length + 1}`;
           activeConversation = {
             id: newConvoId,
             listingId: listingIdParam,
             listingTitle: listing.title,
             participants: [currentUser, recipient],
             lastMessage: { 
                id: 'temp', 
                conversationId: newConvoId,
                senderId: currentUser.id, 
                receiverId: recipient.id, 
                text: `${t.reListingPrefix} ${listing.title}...`, 
                timestamp: new Date().toISOString(),
                isRead: false,
            },
             unreadCount: 0,
           };
           setConversations(prev => [...prev, activeConversation!]);
           const updatedMessagesForConvo = { ...placeholderMessagesForConversation };
           updatedMessagesForConvo[newConvoId] = [activeConversation!.lastMessage]; 
        }
      }
    }

    if (activeConversation) {
      setSelectedConversation(activeConversation);
      setMessages(placeholderMessagesForConversation[activeConversation.id] || []);
    } else if (conversations.length > 0 && !conversationIdParam && !listingIdParam) {
      setSelectedConversation(conversations[0]);
      setMessages(placeholderMessagesForConversation[conversations[0].id] || []);
    }
    setIsLoading(false);
  }, [conversationIdParam, listingIdParam, recipientIdParam, currentUser, conversations, isLoading, t.reListingPrefix]);

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
    
    const updatedMessagesForConvo = { ...placeholderMessagesForConversation };
    updatedMessagesForConvo[selectedConversation.id] = [...(updatedMessagesForConvo[selectedConversation.id] || []), msg];

    setNewMessage('');
  };
  
  const getOtherParticipant = (convo: Conversation | null): UserType | undefined => {
    if (!convo || !currentUser) return undefined;
    return convo.participants.find(p => p.id !== currentUser.id);
  };

  if (isLoading && !currentUser && placeholderUsers.length === 0 ) {
     return <div className="flex justify-center items-center h-[calc(100vh-200px)]">{t.loadingMessages}</div>;
  }
  
  if (!currentUser && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center border rounded-lg shadow-lg">
        <MessageSquareIcon className="h-16 w-16 mb-4 text-muted-foreground" />
        <p className="text-xl font-medium">{t.pleaseLogin}</p>
        <p className="text-muted-foreground mb-6">{t.loginRequiredDesc}</p>
        <Button asChild className="mt-4">
          <Link href="/auth/login">{t.loginButton}</Link>
        </Button>
      </div>
    );
  }
  
  if (isLoading) {
     return <div className="flex justify-center items-center h-[calc(100vh-200px)]">{t.loadingConversations}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-10rem)] border rounded-lg shadow-lg overflow-hidden">
      <Card className={`w-full md:w-1/3 ${language === 'ar' ? 'border-l' : 'border-r'} rounded-none ${language === 'ar' ? 'md:rounded-r-lg md:rounded-l-none' : 'md:rounded-l-lg md:rounded-r-none'}`}>
        <CardHeader>
          <CardTitle>{t.yourChatsTitle}</CardTitle>
          <CardDescription>{t.selectConversationDesc}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-18rem)]">
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
                  setSelectedConversation(convo);
                  setMessages(placeholderMessagesForConversation[convo.id] || []);
                }}
              >
                <Avatar className={`h-10 w-10 ${language === 'ar' ? 'ms-3' : 'me-3'}`}>
                  <AvatarImage src={getOtherParticipant(convo)?.avatarUrl || `https://placehold.co/100x100.png`} alt={getOtherParticipant(convo)?.name} data-ai-hint="avatar person" />
                  <AvatarFallback>{getOtherParticipant(convo)?.name.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
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

      <div className={`flex-grow flex flex-col bg-background ${language === 'ar' ? 'md:rounded-l-lg' : 'md:rounded-r-lg'}`}>
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
              <div>
                <CardTitle>{getOtherParticipant(selectedConversation)?.name || 'Chat'}</CardTitle>
                {selectedConversation.listingTitle && (
                  <CardDescription className="truncate">
                    {t.regardingLabel} <Link href={`/listings/${selectedConversation.listingId}`} className="text-primary hover:underline">{selectedConversation.listingTitle}</Link>
                  </CardDescription>
                )}
              </div>
               <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)} className="md:hidden">
                 <ArrowLeft className="h-5 w-5"/>
               </Button>
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
                    <p className="text-sm">{msg.text}</p>
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
                  <Send className="h-5 w-5" />
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
