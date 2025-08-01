import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Loader2, Upload, Image, Paperclip, RefreshCw } from 'lucide-react';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: Array<{
    type: 'image' | 'file';
    name: string;
    url: string;
    size?: number;
  }>;
}

interface ChatbotProps {
  onClose: () => void;
  isOpen: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose, isOpen }) => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachments, setAttachments] = useState<Array<{
    type: 'image' | 'file';
    name: string;
    url: string;
    size?: number;
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentMessageRef = useRef<string>('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputMessage]);

  // Clear chat history when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([]);
      setInputMessage('');
      setAttachments([]);
      setError(null);
    }
  }, [isAuthenticated]);



  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          handleFileUpload(file, 'image');
        }
      }
    }
  };

  const handleFileUpload = (file: File, type: 'image' | 'file') => {
    // For demo purposes, we'll create a local URL
    // In a real app, you'd upload to your server
    const url = URL.createObjectURL(file);
    const newAttachment = {
      type,
      name: file.name,
      url,
      size: file.size
    };
    setAttachments(prev => [...prev, newAttachment]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      handleFileUpload(file, type);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      URL.revokeObjectURL(newAttachments[index].url);
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };



  const sendMessageStream = async () => {
    if ((!inputMessage.trim() && attachments.length === 0)) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);
    setError(null);
    setIsStreaming(true);

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const conversationHistory = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Try streaming first
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/chatbot/send-message-stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            message: userMessage.content,
            conversation_history: conversationHistory,
            attachments: userMessage.attachments
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) break;
              
              const chunk = decoder.decode(value);
              
              if (chunk) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: msg.content + chunk }
                      : msg
                  )
                );
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
        
        // Reset loading states after successful streaming
        console.log('Resetting loading states after successful streaming');
        setIsStreaming(false);
        setIsLoading(false);
      } catch (streamingError) {
        console.warn('Streaming failed, falling back to regular API:', streamingError);
        // Fallback to regular API
        const response = await api.post('/chatbot/send-message', {
          message: userMessage.content,
          conversation_history: conversationHistory,
          attachments: userMessage.attachments
        });

        const finalAssistantMessage: ChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: response.data.response,
          timestamp: response.data.timestamp || new Date().toISOString()
        };

        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? finalAssistantMessage
              : msg
          )
        );
        console.log('Resetting loading states after fallback API');
        setIsStreaming(false);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.log('Resetting loading states after error:', err);
      setError(err.response?.data?.detail || 'Failed to send message');
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageStream();
    }
  };

  const resetChat = async () => {
    try {
      // Call backend to reset chat session
      await api.post('/chatbot/reset-chat');
      
      // Reset local state to empty
      setMessages([]);
      setError(null);
    } catch (error) {
      console.error('Failed to reset chat:', error);
      setError('Failed to reset chat session');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-sm text-gray-500">Ask me anything, paste images, or upload files</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={resetChat}
              disabled={messages.length <= 1}
              className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset the chat"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg px-4 py-3 ${
                message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                
                {/* Display attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {attachment.type === 'image' ? (
                          <Image className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Paperclip className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-xs opacity-75">{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {isStreaming && message.id === messages[messages.length - 1]?.id && message.role === 'assistant' && (
                  <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && !isStreaming && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="bg-red-100 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-200">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border">
                    {attachment.type === 'image' ? (
                      <Image className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Paperclip className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm text-gray-700">{attachment.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Controls */}
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                onPaste={handlePaste}
                placeholder="Type your message... (Ctrl+V to paste images)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[44px] max-h-[200px]"
                disabled={false}
                rows={1}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={false}
                className="p-3 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50"
                title="Upload file"
              >
                <Upload className="w-5 h-5" />
              </button>
              
              <button
                onClick={sendMessageStream}
                disabled={(!inputMessage.trim() && attachments.length === 0)}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 