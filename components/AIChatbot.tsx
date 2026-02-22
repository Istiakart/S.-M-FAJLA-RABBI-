import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration, ThinkingLevel } from "@google/genai";
import { Send, X, Loader2, ChevronDown } from 'lucide-react';
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
  projects: any[];
  tools: any[];
}

const AIChatbot: React.FC<AIChatbotProps> = ({ onLeadCapture, profileImageUrl, projects, tools }) => {
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

  // Lead capture tool definition
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
      // 1. API Key Setup
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "AIzaSyA3g0Tnvt521GczxaOBNVYo8l3l2mjOARY";
      
      if (!apiKey) {
        throw new Error("API Key is missing");
      }

      console.log("Initializing Gemini with Key length:", apiKey.length); // Debug log
      const ai = new GoogleGenAI({ apiKey });
      
      // 2. Chat Configuration - Using Gemini 3 Flash (Latest)
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction: `You are a professional AI Assistant for S M Fajla Rabbi, a Full-Stack Web Designer and Performance Marketer. You are powered by Gemini 3 Flash.
          
          CONTEXT ABOUT RABBI:
          - Services: Meta & Google Ads Scaling, Full-Stack Web Design (React/Next.js), GTM/CAPI Tracking.
          - Projects: ${projects.slice(0, 5).map(p => `${p.title} (${p.results})`).join(', ')}.
          - Tech Stack: ${tools.slice(0, 8).map(t => t.name).join(', ')}.
          - Contact: WhatsApp (8801956358439), LinkedIn (https://www.linkedin.com/in/s-m-fajla-rabbi-0ba589367/), Agency (ClickNova IT Agency).
          
          YOUR GOALS:
          1. Answer questions about Rabbi's services using the context above.
          2. Collect lead details: Name, Email/Phone, and Requirements.
          3. Use the 'save_lead_details' tool IMMEDIATELY once you have the user's name and at least one contact method.
          
          CRITICAL INSTRUCTION:
          - ALWAYS reply in ENGLISH.
          - Keep responses professional, concise, and conversion-focused.`,
          tools: [{ functionDeclarations: [saveLeadFunctionDeclaration] }],
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      // 3. Send Message
      console.log("Sending message to Gemini...");
      const response = await chat.sendMessage({ message: userMessage });
      console.log("Received response from Gemini");
      
      // 4. Handle Response
      const functionCalls = response.functionCalls;
      const text = response.text;
      
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === 'save_lead_details') {
            const leadData = call.args as any;
            onLeadCapture({
              ...leadData,
              timestamp: new Date().toISOString()
            });
            
            setMessages(prev => [...prev, { 
              role: 'model', 
              text: `Thank you ${leadData.name}! I have saved your information. Rabbi will contact you shortly. Is there anything else I can help you with?` 
            }]);
          }
        }
      } else if (text) {
        setMessages(prev => [...prev, { role: 'model', text: text }]);
      } else {
        throw new Error("No response from AI");
      }

    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "Sorry, I can't connect right now. Please try again later or contact Rabbi directly on WhatsApp (8801956358439)." 
      }]);
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

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 no-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {m.role === 'model' && (
                    <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-slate-200 mt-1">
                      <img src={profileImageUrl} alt="AI" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={`max-w-[75%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
                    m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={profileImageUrl} alt="AI" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything..."
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

      {/* Toggle Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 overflow-hidden ${
            isOpen ? 'bg-rose-500 rotate-90' : 'bg-indigo-600 hover:scale-110 border-2 border-white'
          }`}
        >
          {isOpen ? <X className="text-white" size={28} /> : <img src={profileImageUrl} alt="Rabbi" className="w-full h-full object-cover" />}
        </button>
        
        {/* Online Indicator */}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white"></span>
          </span>
        )}
      </div>
    </div>
  );
};

export default AIChatbot;
