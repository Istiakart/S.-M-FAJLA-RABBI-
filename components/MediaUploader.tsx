
import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Plus, ImagePlus } from 'lucide-react';
import { uploadFile } from '../services/blobService';

interface MediaUploaderProps {
  onUploadSuccess: (url: string) => void;
  initialUrl?: string;
  label?: string;
  folder?: string;
  compact?: boolean;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  onUploadSuccess, 
  initialUrl,
  label = "Add", 
  folder = "general",
  compact = false
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If an initial URL is provided (like editing a profile pic), show it.
    // Otherwise, keep it empty for the "+" button behavior.
    setPreviewUrl(initialUrl || null);
    setFile(null);
  }, [initialUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!file) return;
    
    setIsUploading(true);
    try {
      const url = await uploadFile(file, folder);
      
      // IMPORTANT: Notify parent of success
      onUploadSuccess(url);
      
      // RESET internal state so the "+" button reappears for the next image
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please check your connection or storage token.");
    } finally {
      setIsUploading(false);
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // If this was an existing image being cleared, notify parent
    if (!file) onUploadSuccess('');
  };

  const triggerFileInput = () => {
    if (!isUploading && !previewUrl) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <div 
        onClick={triggerFileInput}
        className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group
          ${compact ? 'aspect-square w-full' : 'aspect-square w-full'}
          ${previewUrl ? 'border-blue-500/50 bg-blue-50/10' : 'border-slate-700/50 bg-slate-800/50 hover:border-blue-500 hover:bg-blue-500/10 shadow-inner'}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*" 
        />

        {previewUrl ? (
          <div className="relative w-full h-full group">
            <img src={previewUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Preview" />
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={clear}
                className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-110 active:scale-90 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-blue-500 transition-all pointer-events-none">
            <div className="p-3 bg-slate-900/50 rounded-full border border-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
               <Plus size={24} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest leading-tight">{label}</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-2 text-center">
            <Loader2 size={24} className="text-blue-500 animate-spin mb-2" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest">Uploading...</span>
          </div>
        )}
      </div>

      {file && !isUploading && (
        <button 
          onClick={handleUpload} 
          className="w-full mt-3 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-500 active:scale-95 animate-fade-in-up"
        >
          Confirm & Add
        </button>
      )}
    </div>
  );
};

export default MediaUploader;
