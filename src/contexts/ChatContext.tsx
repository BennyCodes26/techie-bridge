
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { toast } from "sonner";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Timestamp;
  read: boolean;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  sendMessage: (receiverId: string, text: string) => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTimestamp?: Timestamp;
  otherUserName?: string;
  otherUserPhotoURL?: string;
  otherUserId: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { currentUser, userProfile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user conversations
  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      setIsLoading(false);
      return;
    }
    
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationsList: Conversation[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const otherUserId = data.participants.find((id: string) => id !== currentUser.uid);
        
        conversationsList.push({
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          lastMessageTimestamp: data.lastMessageTimestamp,
          otherUserName: data.participants_info?.[otherUserId]?.displayName || 'Unknown',
          otherUserPhotoURL: data.participants_info?.[otherUserId]?.photoURL || null,
          otherUserId
        });
      });
      
      // Sort by most recent message
      conversationsList.sort((a, b) => {
        if (!a.lastMessageTimestamp) return 1;
        if (!b.lastMessageTimestamp) return -1;
        return b.lastMessageTimestamp.toMillis() - a.lastMessageTimestamp.toMillis();
      });
      
      setConversations(conversationsList);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser]);
  
  // Fetch messages for the current conversation
  useEffect(() => {
    if (!currentConversation) {
      setMessages([]);
      return;
    }
    
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', currentConversation.id),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList: Message[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        messagesList.push({
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          text: data.text,
          timestamp: data.timestamp,
          read: data.read
        });
      });
      
      setMessages(messagesList);
    });
    
    return () => unsubscribe();
  }, [currentConversation]);
  
  async function sendMessage(receiverId: string, text: string) {
    if (!currentUser) {
      toast.error('You must be logged in to send messages');
      return;
    }
    
    try {
      // Find or create conversation
      let conversationId = '';
      
      if (currentConversation) {
        conversationId = currentConversation.id;
      } else {
        // Check if a conversation already exists
        const existingConvo = conversations.find(c => 
          c.participants.includes(receiverId) && c.participants.includes(currentUser.uid)
        );
        
        if (existingConvo) {
          conversationId = existingConvo.id;
          setCurrentConversation(existingConvo);
        } else {
          // Create new conversation
          const conversationsRef = collection(db, 'conversations');
          const participants_info: {[key: string]: any} = {};
          
          // Add current user info
          participants_info[currentUser.uid] = {
            displayName: userProfile?.displayName || currentUser.displayName,
            photoURL: userProfile?.photoURL || currentUser.photoURL
          };
          
          // Add receiver info (would be populated from a query in a real app)
          // For now, we'll leave it empty and it would be updated when fetched
          
          const newConversationRef = await addDoc(conversationsRef, {
            participants: [currentUser.uid, receiverId],
            participants_info,
            createdAt: serverTimestamp()
          });
          
          conversationId = newConversationRef.id;
          
          // Create and set new conversation locally
          const newConvo: Conversation = {
            id: conversationId,
            participants: [currentUser.uid, receiverId],
            otherUserId: receiverId
          };
          
          setCurrentConversation(newConvo);
        }
      }
      
      // Add the message
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: currentUser.uid,
        receiverId,
        text,
        timestamp: serverTimestamp(),
        read: false
      });
      
      // Update last message in conversation
      // This would be handled by a Firestore trigger in a real app
      
      toast.success('Message sent');
    } catch (error: any) {
      toast.error(`Failed to send message: ${error.message}`);
    }
  }
  
  function selectConversation(conversation: Conversation) {
    setCurrentConversation(conversation);
  }
  
  const value = {
    conversations,
    currentConversation,
    messages,
    isLoading,
    sendMessage,
    selectConversation
  };
  
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
