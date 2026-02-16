
import React, { useState, useRef } from 'react';
import { Upload, X, Check, Loader2, ImageIcon, FileText } from 'lucide-react';
import { uploadFile } from '../services/blobService';

interface MediaUploaderProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
  folder?: string;
  accept?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  onUploadSuccess, 
  label = "Upload Asset", 
  folder = "general",
  accept = "image/*"
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('idle');
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFile(file, folder);
      setPreviewUrl(url);
      onUploadSuccess(url);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPreviewUrl(null);
    setStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-4">
      <div 
        className={`relative group border-2 border-dashed rounded-[2rem] p-6 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer
          ${status === 'success' ? 'border-emerald-200 bg-emerald-50/30' : 
            status === 'error' ? 'border-red-200 bg-red-50/30' : 
            'border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-white'}`}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept={accept}
        />

        {previewUrl ? (
          <div className="relative w-full max-w-[200px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white animate-fade-in">
            <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
            <button 
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-3">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-slate-400 group-hover:text-blue-500 transition-colors">
              <Upload size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{label}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Drag & Drop or Click</p>
            </div>
          </div>
        )}
      </div>

      {file && status !== 'success' && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Syncing to Cloud...
            </>
          ) : (
            <>
              <Check size={16} />
              Confirm Upload
            </>
          )}
        </button>
      )}

      {status === 'success' && (
        <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest animate-fade-in">
          <Check size={14} /> Verified in Vercel Blob
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
