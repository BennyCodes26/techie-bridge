
import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Chat() {
  const { currentUser, userProfile } = useAuth();
  const { messages, currentConversation, sendMessage, isLoading } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentConversation) return;
    
    setIsSending(true);
    try {
      await sendMessage(currentConversation.otherUserId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
          <p className="text-muted-foreground">
            Please select a conversation from the sidebar
          </p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage 
              src={currentConversation.otherUserPhotoURL || undefined} 
              alt={currentConversation.otherUserName || 'User'} 
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {(currentConversation.otherUserName || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{currentConversation.otherUserName || 'User'}</h3>
            <p className="text-xs text-muted-foreground">
              {messages.length > 0 ? `${messages.length} messages` : 'No messages yet'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex justify-center my-8">
              <p className="text-muted-foreground text-sm">
                No messages yet. Say hello!
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((message) => {
                const isCurrentUser = message.senderId === currentUser?.uid;
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isCurrentUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      <p className="break-words">{message.text}</p>
                      <p 
                        className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                        }`}
                      >
                        {message.timestamp ? format(message.timestamp.toDate(), 'p') : 'Sending...'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
      
      {/* Message input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[44px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newMessage.trim() || isSending}
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
