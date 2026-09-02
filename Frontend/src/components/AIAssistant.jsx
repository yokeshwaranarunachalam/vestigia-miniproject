import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  "What's my current CGPA?",
  "List my latest certificates",
  "Show my best hackathon outcome",
  "How many credits in Sem 3?"
];

export default function AIAssistant({ isOpen, onClose, userName = "Student" }) {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: `Hi ${userName}! I'm Vestigia AI. Ask me anything about your academic profile.` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (text) => {
    const userMessage = text || inputValue.trim();
    if (!userMessage) return;

    // Add user message
    const newMsg = { id: Date.now(), type: 'user', text: userMessage };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');

    // Simulate bot reply
    setTimeout(() => {
      let reply = "I found your data. Let's keep exploring!";
      const lower = userMessage.toLowerCase();
      
      if (lower.includes('cgpa')) {
        reply = "Your current CGPA is 8.42 across 5 semesters. You're doing great!";
      } else if (lower.includes('certificate')) {
        reply = "You have 14 certificates. The latest is 'Deep Learning Specialization' from DeepLearning.AI.";
      } else if (lower.includes('hackathon')) {
        reply = "Your best outcome was 1st prize at a College Hackathon for an AI/ML project.";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: reply }]);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="w-[320px] sm:w-[400px] h-full bg-white shadow-2xl relative flex flex-col animate-slide-left">
        {/* Header */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-5 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-none">Vestigia AI</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600">Online</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-white hover:text-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-gray-50/50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.type === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                msg.type === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="p-3 border-t border-gray-100 bg-white">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                className="whitespace-nowrap px-3 py-1.5 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 text-gray-600 hover:text-purple-700 text-xs rounded-full font-medium transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" /> {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="absolute right-2 p-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
