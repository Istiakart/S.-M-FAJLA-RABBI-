
import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { FAQData } from '../types';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-b border-slate-100 transition-all ${isOpen ? 'bg-blue-50/30' : ''}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className={`text-sm md:text-lg font-bold transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`}>
          {question}
        </span>
        <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="pb-8 text-sm md:text-base text-slate-500 font-medium leading-relaxed pr-12">
          {answer}
        </p>
      </div>
    </div>
  );
};

interface FAQProps {
  faqs: FAQData[];
}

const FAQ: React.FC<FAQProps> = ({ faqs }) => {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="text-blue-600" size={20} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Direct Answers</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">
            Strategic <span className="text-blue-600">Clarification.</span>
          </h2>
        </div>

        <div className="bg-white rounded-[2.5rem] p-4 md:p-10 border border-slate-100 shadow-sm">
          {faqs.map((faq) => (
            <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Have a specific project in mind? <a href="#contact" className="text-blue-600 font-bold hover:underline">Let's talk logistics.</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
