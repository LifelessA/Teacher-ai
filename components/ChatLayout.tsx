
import React, { useState, useRef, useEffect } from 'react';
import { Content, Part } from "@google/genai";
import { Message, MessageRole, ContentPart, PartType, ChatSession } from '../types';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import Header from './Header';
import { callChatApiStream } from '../utils/api';

// --- Helper Functions ---

const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            mimeType: file.type,
            data: await base64EncodedDataPromise,
        },
    };
};

const textFileToGenerativePart = async (file: File): Promise<Part> => {
    const textPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsText(file);
    });
    const text = await textPromise;
    return { text: `\n\n--- Start of Uploaded File: ${file.name} ---\n\n${text}\n\n--- End of Uploaded File ---` };
}

const ChatLayout: React.FC = () => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    const savedChats = localStorage.getItem('teacher-ai-chats');
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      if (parsedChats.length > 0) {
        setActiveChatId(parsedChats[0].id);
      } else {
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('teacher-ai-chats', JSON.stringify(chats));
    }
  }, [chats]);

  const updateMessages = (chatId: string, updateFn: (messages: Message[]) => Message[]) => {
    setChats(prevChats => prevChats.map(chat => 
      chat.id === chatId ? { ...chat, messages: updateFn(chat.messages) } : chat
    ));
  };
  
  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatSession = {
        id: newChatId,
        title: 'New Chat',
        messages: [{
            id: 'initial-ai-message',
            role: MessageRole.MODEL,
            content: "Hello! I'm your Teacher AI. Ask me a question, and I'll break it down for you with text and visuals for each step!"
        }]
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChatId);
  };
  
  const deleteChat = (chatId: string) => {
    const remainingChats = chats.filter(c => c.id !== chatId);
    setChats(remainingChats);
    if (activeChatId === chatId) {
        if(remainingChats.length > 0) {
             setActiveChatId(remainingChats[0]?.id || null);
        } else {
             createNewChat();
        }
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string, file?: File) => {
    if (!activeChatId) return;

    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: MessageRole.USER,
      content: text,
      ...(file && { file: { name: file.name, type: file.type } })
    };
    
    const activeChat = chats.find(c => c.id === activeChatId);
    if (activeChat && activeChat.messages.length <= 1) {
      setChats(prevChats => prevChats.map(c => 
        c.id === activeChatId ? { ...c, title: text.substring(0, 40) } : c
      ));
    }

    updateMessages(activeChatId, (prev) => [...prev, userMessage]);
    setIsLoading(true);

    const streamingMessageId = `model-${Date.now()}`;
    const aiMessage: Message = {
      id: streamingMessageId,
      role: MessageRole.MODEL,
      parts: [],
    };
    updateMessages(activeChatId, (prev) => [...prev, aiMessage]);

    try {
      const history: Content[] = (activeChat?.messages || [])
          .filter(m => m.role !== MessageRole.USER || m.content)
          .map(msg => {
              const role = msg.role === MessageRole.USER ? 'user' : 'model';
              let parts: Part[] = [];
                if (msg.role === MessageRole.USER && msg.content) {
                  parts.push({ text: msg.content });
              } else if (msg.role === MessageRole.MODEL && msg.parts) {
                  const combinedText = msg.parts
                      .filter(p => p.type === PartType.EXPLANATION)
                      .map(p => (p as any).text)
                      .join('\n');
                  parts.push({ text: combinedText });
              }
              return { role, parts };
          })
          .filter(c => c.parts.length > 0);

      const messageParts: Part[] = [{ text }];
      if (file) {
        if (file.type.startsWith('image/')) {
          messageParts.push(await fileToGenerativePart(file));
        } else {
          messageParts.push(await textFileToGenerativePart(file));
        }
      }
      
      let jsonBuffer = "";
      await callChatApiStream(
        history, 
        messageParts, 
        abortControllerRef.current.signal,
        (textChunk) => {
          jsonBuffer += textChunk;
          let newlineIndex;

          while ((newlineIndex = jsonBuffer.indexOf('\n')) !== -1) {
            const line = jsonBuffer.substring(0, newlineIndex).trim();
            jsonBuffer = jsonBuffer.substring(newlineIndex + 1);

            if (line) {
              try {
                const parsedPart = JSON.parse(line);
                const validPart: ContentPart | null = 
                   (part => {
                      if (!part || typeof part !== 'object' || !part.type) return null;
                      if (part.type === PartType.EXPLANATION && typeof part.text === 'string') {
                        return { type: PartType.EXPLANATION, text: part.text };
                      }
                      if (part.type === PartType.VISUAL && typeof part.html === 'string') {
                        return { type: PartType.VISUAL, html: part.html, isSummary: !!part.isSummary };
                      }
                      return null;
                   })(parsedPart);
                
                if (validPart) {
                    setChats(prevChats => prevChats.map(chat => {
                        if (chat.id === activeChatId) {
                            const updatedMessages = chat.messages.map(msg => {
                                if (msg.id === streamingMessageId) {
                                    return { ...msg, parts: [...(msg.parts || []), validPart] };
                                }
                                return msg;
                            });
                            return { ...chat, messages: updatedMessages };
                        }
                        return chat;
                    }));
                }
              } catch (e) {
                console.warn("Failed to parse JSON line from stream:", line);
              }
            }
          }
        }
      );
      
      if (jsonBuffer.trim()) {
        console.warn("Incomplete JSON received at end of stream:", jsonBuffer.trim());
      }

    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        const cancelledMessage: Message = { id: `model-${Date.now()}-cancel`, role: MessageRole.MODEL, content: "Your request was cancelled." };
        updateMessages(activeChatId, (prev) => [...prev, cancelledMessage]);
        
        // Remove the empty streaming message
        setChats(prevChats => prevChats.map(chat => 
          chat.id === activeChatId ? { ...chat, messages: chat.messages.filter(m => m.id !== streamingMessageId) } : chat
        ));
        
        return;
      }
      let errorMessage = "An error occurred while fetching the response.";
      if (e instanceof Error) {
        errorMessage = `API Error: ${e.message}`;
      }
      const errorAiMessage: Message = {
        id: `model-${Date.now()}`, role: MessageRole.MODEL,
        content: `Sorry, something went wrong. ${errorMessage}`,
        isError: true,
      };
      updateMessages(activeChatId, (prev) => prev.filter(m => m.id !== streamingMessageId));
      updateMessages(activeChatId, (prev) => [...prev, errorAiMessage]);

    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const activeMessages = chats.find(c => c.id === activeChatId)?.messages || [];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen}
        chats={chats} 
        activeChatId={activeChatId}
        onNewChat={createNewChat}
        onSelectChat={setActiveChatId}
        onDeleteChat={deleteChat}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <ChatWindow messages={activeMessages} isLoading={isLoading} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} onCancel={handleCancelGeneration} />
      </div>
    </div>
  );
};

export default ChatLayout;
