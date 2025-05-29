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
import { Send, ArrowLeft, Paperclip, Smile } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdParam = searchParams.get('conversationId');
  const listingIdParam = searchParams.get('listingId');
  const recipientIdParam = searchParams.get('recipientId');

  const [currentUser] = useState<UserType>(placeholderUsers[0]); // Simulate current user
  const [conversations, setConversations] = useState<Conversation[]>(placeholderConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Effect to load or select conversation
  useEffect(() => {
    setIsLoading(true);
    let activeConversation: Conversation | undefined;

    if (conversationIdParam) {
      activeConversation = conversations.find(c => c.id === conversationIdParam);
    } else if (listingIdParam && recipientIdParam) {
      // Try to find an existing conversation for this listing and recipient
      activeConversation = conversations.find(c => 
        c.listingId === listingIdParam && 
        c.participants.some(p => p.id === recipientIdParam) &&
        c.participants.some(p => p.id === currentUser.id)
      );
      
      // If no existing conversation, create a new one (simulated)
      if (!activeConversation) {
        const recipient = placeholderUsers.find(u => u.id === recipientIdParam);
        const listing = placeholderListings.find(l => l.id === listingIdParam);
        if (recipient && listing) {
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
                text: `Starting chat about ${listing.title}...`, 
                timestamp: new Date().toISOString(),
                isRead: false,
            },
             unreadCount: 0,
           };
           setConversations(prev => [...prev, activeConversation!]);
           placeholderMessagesForConversation[newConvoId] = [activeConversation!.lastMessage]; // Add placeholder initial message
        }
      }
    }

    if (activeConversation) {
      setSelectedConversation(activeConversation);
      setMessages(placeholderMessagesForConversation[activeConversation.id] || []);
    } else if (conversations.length > 0 && !conversationIdParam && !listingIdParam) {
      // Default to first conversation if no params and conversations exist
      setSelectedConversation(conversations[0]);
      setMessages(placeholderMessagesForConversation[conversations[0].id] || []);
    }
    setIsLoading(false);
  }, [conversationIdParam, listingIdParam, recipientIdParam, currentUser, conversations]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
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
    
    // Update last message in conversation list (simulation)
    const updatedConvo = { ...selectedConversation, lastMessage: msg };
    setSelectedConversation(updatedConvo);
    setConversations(prevConvos => prevConvos.map(c => c.id === updatedConvo.id ? updatedConvo : c));
    placeholderMessagesForConversation[selectedConversation.id] = [...(placeholderMessagesForConversation[selectedConversation.id] || []), msg];

    setNewMessage('');
  };
  
  const getOtherParticipant = (convo: Conversation | null): UserType | undefined => {
    if (!convo) return undefined;
    return convo.participants.find(p => p.id !== currentUser.id);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-10rem)] border rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar for conversations list (visible on larger screens) */}
      <Card className="w-full md:w-1/3 border-r rounded-none md:rounded-l-lg md:rounded-r-none">
        <CardHeader>
          <CardTitle>Your Chats</CardTitle>
          <CardDescription>Select a conversation to view messages.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-18rem)]">
            {conversations.length === 0 && (
              <p className="p-4 text-muted-foreground text-center">No conversations yet.</p>
            )}
            {conversations.map((convo) => (
              <Button
                key={convo.id}
                variant="ghost"
                className={`w-full justify-start p-3 h-auto rounded-none border-b ${selectedConversation?.id === convo.id ? 'bg-muted' : ''}`}
                onClick={() => {
                  router.push(`/messages?conversationId=${convo.id}`); // Navigate to keep URL in sync
                  setSelectedConversation(convo);
                  setMessages(placeholderMessagesForConversation[convo.id] || []);
                }}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={getOtherParticipant(convo)?.avatarUrl || `https://placehold.co/100x100.png`} alt={getOtherParticipant(convo)?.name} data-ai-hint="avatar person" />
                  <AvatarFallback>{getOtherParticipant(convo)?.name.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-grow text-left">
                  <p className="font-semibold truncate">{getOtherParticipant(convo)?.name || 'Unknown User'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {convo.listingTitle ? `Re: ${convo.listingTitle}` : 'General Inquiry'}
                  </p>
                  <p className={`text-xs truncate ${convo.unreadCount > 0 && convo.lastMessage.senderId !== currentUser.id ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                    {convo.lastMessage.senderId === currentUser.id ? "You: " : ""}{convo.lastMessage.text}
                  </p>
                </div>
                {convo.unreadCount > 0 && convo.lastMessage.senderId !== currentUser.id && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                    {convo.unreadCount}
                  </span>
                )}
              </Button>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main chat area */}
      <div className="flex-grow flex flex-col bg-background md:rounded-r-lg">
        {!selectedConversation ? (
          <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <MessageSquare className="h-16 w-16 mb-4" />
            <p className="text-xl font-medium">Select a conversation</p>
            <p>Or start a new one by contacting a seller on a listing page.</p>
             <Button asChild className="mt-4" variant="outline">
                <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Browse Listings</Link>
            </Button>
          </div>
        ) : (
          <>
            <CardHeader className="border-b flex-row items-center justify-between p-4">
              <div>
                <CardTitle>{getOtherParticipant(selectedConversation)?.name || 'Chat'}</CardTitle>
                {selectedConversation.listingTitle && (
                  <CardDescription className="truncate">
                    Regarding: <Link href={`/listings/${selectedConversation.listingId}`} className="text-primary hover:underline">{selectedConversation.listingTitle}</Link>
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
                  className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow ${
                      msg.senderId === currentUser.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === currentUser.id ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>
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
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-grow"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </div>
    </div>
  );
}
