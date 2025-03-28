
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, Conversation } from '@/contexts/ChatContext';
import { ProtectedLayout } from '@/components/Layout';
import { Chat as ChatComponent } from '@/components/Chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageSquare, 
  Clock, 
  Loader2, 
  MessagesSquare 
} from 'lucide-react';

export default function Chat() {
  const { userProfile } = useAuth();
  const { conversations, currentConversation, selectConversation, isLoading } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter(
    (conversation) => 
      conversation.otherUserName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      searchTerm === ''
  );
  
  // Set first conversation as current if none is selected
  useEffect(() => {
    if (!currentConversation && conversations.length > 0) {
      selectConversation(conversations[0]);
    }
  }, [conversations, currentConversation, selectConversation]);
  
  return (
    <ProtectedLayout>
      <div className="container mx-auto p-0 pt-16 h-screen flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full md:w-80 border-r bg-muted/10 flex flex-col"
          >
            <div className="p-4">
              <h1 className="text-xl font-bold">Messages</h1>
              <p className="text-muted-foreground text-sm">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
              
              <div className="relative mt-3">
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading conversations...</span>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">No conversations yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userProfile?.role === 'customer'
                      ? 'Find a technician to start chatting'
                      : 'Respond to service requests to chat with customers'}
                  </p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">No matches found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try a different search term
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={currentConversation?.id === conversation.id}
                      onClick={() => selectConversation(conversation)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex-1 flex flex-col bg-background overflow-hidden"
          >
            {currentConversation ? (
              <ChatComponent />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessagesSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-medium mb-2">Your Messages</h2>
                <p className="text-muted-foreground text-center max-w-sm">
                  Select a conversation from the sidebar or find a
                  {userProfile?.role === 'customer' ? ' technician' : ' customer'} to start chatting
                </p>
                <Button className="mt-6" asChild>
                  <a href={userProfile?.role === 'customer' ? '/discover' : '/requests'}>
                    {userProfile?.role === 'customer' ? 'Find Technicians' : 'View Requests'}
                  </a>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  // Format the last message timestamp
  const formattedTime = conversation.lastMessageTimestamp 
    ? new Date(conversation.lastMessageTimestamp.toDate()).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : '';
  
  return (
    <div 
      className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
        isActive ? 'bg-muted/50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar>
            <AvatarImage 
              src={conversation.otherUserPhotoURL || undefined} 
              alt={conversation.otherUserName || 'User'} 
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {(conversation.otherUserName || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {conversation.unreadCount && conversation.unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className={`truncate ${conversation.unreadCount && conversation.unreadCount > 0 ? 'font-bold' : 'font-medium'}`}>
              {conversation.otherUserName || 'User'}
            </h3>
            {formattedTime && (
              <span className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formattedTime}
              </span>
            )}
          </div>
          
          <p className={`text-sm truncate ${
            conversation.unreadCount && conversation.unreadCount > 0 
              ? 'text-foreground font-medium' 
              : 'text-muted-foreground'
          }`}>
            {conversation.lastMessage || 'No messages yet'}
          </p>
        </div>
      </div>
    </div>
  );
}
