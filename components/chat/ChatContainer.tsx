import React, { useState } from 'react';
import AIChatMessage from './AIChatMessage';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  // Simulate sending a message and getting a response
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Simulate AI thinking
    setIsAIThinking(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: `Here's my response to "${inputText}". I can help you create and manage your ProcessFlow workflows efficiently.`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsAIThinking(false);
    }, 2000); // Simulate 2 second thinking time
  };
  
  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-medium">ProcessFlow AI Assistant</h3>
        <p className="text-sm text-gray-500">Ask me anything about your processes</p>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.sender === 'ai' && (
              <AIChatMessage message={message.text} isLoading={false} />
            )}
            
            {message.sender === 'user' && (
              <div className="bg-blue-500 text-white rounded-lg p-3 max-w-md">
                <p className="m-0">{message.text}</p>
              </div>
            )}
          </div>
        ))}
        
        {isAIThinking && (
          <div className="flex justify-start">
            <AIChatMessage isLoading={true} />
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask ProcessFlow AI..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
