
import React from 'react';
import { X, Download, FileText, AlertCircle } from 'lucide-react';

interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvUrl?: string;
}

const CVModal: React.FC<CVModalProps> = ({ isOpen, onClose, cvUrl }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (!cvUrl) return;
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = 'SM_Fajla_Rabbi_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-fade-in" 
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-4xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Professional CV</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">S M FAJLA RABBI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content / Preview */}
        <div className="flex-1 bg-slate-100 overflow-hidden relative">
          {cvUrl ? (
            <iframe 
              src={`${cvUrl}#toolbar=0`} 
              className="w-full h-full border-none"
              title="CV Preview"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <AlertCircle size={48} className="text-slate-300 mb-4" />
              <h4 className="text-lg font-bold text-slate-500">CV Not Found</h4>
              <p className="text-sm text-slate-400 max-w-xs mt-2">The CV file has not been uploaded yet. Please contact the administrator.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0 bg-white">
          <div className="text-center sm:text-left">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">File Format</div>
            <div className="text-sm font-bold text-slate-900">PDF Document (Optimized)</div>
          </div>
          
          <button 
            onClick={handleDownload}
            disabled={!cvUrl}
            className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
          >
            <Download size={20} />
            Download CV Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CVModal;
