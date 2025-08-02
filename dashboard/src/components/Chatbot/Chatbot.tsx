'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatbotStore } from '@/store/chatbotStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const quickSuggestions = [
  "¿Qué corral está peor?",
  "¿Qué variables necesitan atención?",
  "¿Hay alguna alerta?",
  "¿Cómo está la salud general?"
];

export function Chatbot() {
  const { 
    messages, 
    isLoading, 
    error, 
    isOpen, 
    selectedFieldId,
    sendMessage, 
    clearMessages, 
    setIsOpen 
  } = useChatbotStore();
  
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    console.log('Sending message:', message, 'isLoading:', isLoading);
    setInputValue('');
    await sendMessage(message);
    console.log('Message sent, isLoading should be false now');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickSuggestion = async (suggestion: string) => {
    // Send the suggestion immediately without setting inputValue
    await sendMessage(suggestion);
  };

  // Only show chatbot if a field is selected
  if (!selectedFieldId) {
    return null;
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-96 h-[600px] shadow-xl border-green-200">
        <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg font-semibold text-green-800">
                Asistente IA
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-green-600 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-full flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 max-h-[400px]" ref={scrollAreaRef}>
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Bot className="h-12 w-12 mx-auto mb-3 text-green-300" />
                <p className="text-sm">¡Hola! Soy tu asistente de salud ganadera.</p>
                <p className="text-xs mt-1">Pregúntame sobre el campo seleccionado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    {!message.isUser && (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        message.isUser
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        message.isUser ? "text-green-100" : "text-gray-500"
                      )}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>

                    {message.isUser && (
                      <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                        <span className="text-sm text-gray-600">Escribiendo...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Quick Suggestions */}
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 mb-2">Sugerencias rápidas:</p>
            <div className="flex flex-wrap gap-1">
              {quickSuggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
                  onClick={() => handleQuickSuggestion(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-4 pb-2">
              <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded">
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                className="flex-1 text-sm border-2 border-gray-300 focus:border-green-500"
                disabled={isLoading}
                onFocus={() => console.log('Input focused, isLoading:', isLoading, 'inputValue:', inputValue)}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="h-10 w-10 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 