import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface Context {
  page_number: number | string;
  page_content: string;
}

interface Message {
  content: string;
  role: 'user' | 'assistant';
  context?: Context[];
}

const BACKEND_URL = 'http://127.0.0.1:8000';

interface ChatProps {
  onPageChange?: (page: number) => void;
}

const Chat = ({ onPageChange }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() } as Message;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({ question: userMessage.content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.[0]?.msg || 'Failed to get response from server');
      }

      const data = await response.json();
      console.log('Response from server:', data);

      const assistantMessage = {
        role: 'assistant',
        content: data.answer || 'No response content available',
        context: data.context
      } as Message;

      setMessages(prev => [...prev, assistantMessage]);

      // If there's context with page numbers, scroll to the first referenced page
      if (assistantMessage.context && assistantMessage.context.length > 0) {
        const firstPage = assistantMessage.context[0].page_number;
        if (typeof firstPage === 'number' && onPageChange) {
          onPageChange(firstPage);
        }
      }
    } catch (error) {
      console.error('Error calling chat service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response from the chat service.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message) => {
    return (
      <div className={cn(
        "max-w-[80%] rounded-lg px-4 py-2",
        message.role === 'assistant' 
          ? "bg-gray-100 text-gray-900" 
          : "bg-blue-500 text-white"
      )}>
        <div>{message.content}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-lg bg-white shadow-sm">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex w-full",
                message.role === 'assistant' ? "justify-start" : "justify-end"
              )}
            >
              {renderMessage(message)}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your PDF..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;