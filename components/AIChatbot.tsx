
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { MessageSquare, Send, X, User, Bot, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeadDetails {
  name: string;
  email?: string;
  phone?: string;
  businessName?: string;
  requirements?: string;
  timestamp: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatbotProps {
  onLeadCapture: (lead: LeadDetails) => void;
  profileImageUrl: string;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ onLeadCapture, profileImageUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm Rabbi's AI assistant. How can I help you scale your brand today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveLeadFunctionDeclaration: FunctionDeclaration = {
    name: "save_lead_details",
    parameters: {
      type: Type.OBJECT,
      description: "Save the contact details and requirements of a potential client.",
      properties: {
        name: { type: Type.STRING, description: "The name of the client" },
        email: { type: Type.STRING, description: "The email address of the client" },
        phone: { type: Type.STRING, description: "The phone number of the client" },
        businessName: { type: Type.STRING, description: "The name of the client's business or brand" },
        requirements: { type: Type.STRING, description: "What the client is looking for (e.g., Meta Ads, Web Design)" },
      },
      required: ["name"],
    },
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Use GEMINI_API_KEY for the default free-tier access
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: "gemini-flash-latest",
        config: {
          systemInstruction: `You are a professional AI Assistant for S M Fajla Rabbi, a Full-Stack Web Designer and Performance Marketer. 
          Your goal is to:
          1. Answer questions about Rabbi's services (Meta/Google Ads scaling, React/Next.js development, GTM/CAPI tracking).
          2. Provide info about his portfolio (e.g., scaling a lifestyle brand to 7.2x ROAS).
          3. Collect lead details (Name, Email/Phone, Business Name, Requirements) when a user shows interest in working together.
          4. Use the 'save_lead_details' tool as soon as you have enough information to identify a lead.
          
          Rabbi's Contact Info:
          - WhatsApp: 8801956358439
          - LinkedIn: https://www.linkedin.com/in/s-m-fajla-rabbi-0ba589367/
          - Agency: ClickNova IT Agency
          
          Be professional, helpful, and conversion-focused. If asked about pricing, mention that it depends on the project scope and suggest booking a Zoom call via the button on the site.`,
          tools: [{ functionDeclarations: [saveLeadFunctionDeclaration] }],
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message: userMessage });
      
      if (!response || !response.text && (!response.functionCalls || response.functionCalls.length === 0)) {
        throw new Error("Empty response from AI");
      }

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === 'save_lead_details') {
            const leadData = call.args as any;
            onLeadCapture({
              ...leadData,
              timestamp: new Date().toISOString()
            });
            
            // Add a friendly confirmation message to the chat
            setMessages(prev => [...prev, { 
              role: 'model', 
              text: `Got it, ${leadData.name}! I've saved your details. Rabbi will review your requirements and get back to you soon. Is there anything else I can help you with?` 
            }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm here to help!" }]);
      }
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a bit of trouble connecting right now. Please try again in a moment or reach out to Rabbi directly via WhatsApp!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white w-[350px] md:w-[400px] h-[500px] rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl overflow-hidden border-2 border-white/20">
                  <img src={profileImageUrl} alt="Rabbi" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-black text-sm uppercase tracking-widest">Rabbi's AI</div>
                  <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Always Online</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {m.role === 'model' && (
                    <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-slate-200 mt-1">
                      <img src={profileImageUrl} alt="AI" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={`max-w-[75%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-slate-200 mt-1">
                    <img src={profileImageUrl} alt="AI" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none shadow-sm">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 overflow-hidden ${
          isOpen ? 'bg-rose-500 rotate-90' : 'bg-indigo-600 hover:scale-110 border-2 border-white'
        }`}
      >
        {isOpen ? (
          <X className="text-white" size={28} />
        ) : (
          <img src={profileImageUrl} alt="Rabbi" className="w-full h-full object-cover" />
        )}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full animate-pulse z-10"></div>
        )}
      </button>
    </div>
  );
};

export default AIChatbot;
