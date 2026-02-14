
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from "@google/genai";

const AILab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'creative' | 'motion' | 'voice'>('insights');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Live API State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // --- Helpers ---
  const blobToBase64 = (blob: window.Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Manual implementation of decode for Base64 as required by Live API guidelines.
  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Manual implementation of encode for Base64 as required by Live API guidelines.
  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Optimized decodeAudioData according to Live API guidelines
  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  // --- Feature Implementations ---

  const handleInsightsSearch = async (useMaps: boolean = false) => {
    if (!prompt) return;
    setIsLoading(true);
    setGroundingLinks([]);
    try {
      // Create new GoogleGenAI instance right before the call to ensure correct API key usage
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Maps grounding is only supported in Gemini 2.5 series models.
      const modelName = useMaps ? 'gemini-2.5-flash' : 'gemini-3-flash-preview';
      
      const config: any = {
        tools: useMaps ? [{ googleMaps: {} }] : [{ googleSearch: {} }],
      };

      if (useMaps) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: 23.8103,
              longitude: 90.4125
            }
          }
        };
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config
      });

      // Extract generated text directly from response property (not a method)
      setOutput(response.text || "Analysis complete.");
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      setGroundingLinks(chunks);
    } catch (error) {
      console.error(error);
      setOutput("Insight generation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageGeneration = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
      // API Key Selection check for high-quality pro models as per guidelines
      if (!(await (window as any).aistudio.hasSelectedApiKey())) {
        await (window as any).aistudio.openSelectKey();
      }

      // Always create a new instance to pick up the updated key from the selection dialog
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: imageSize
          }
        },
      });

      // Find the image part in response candidates, do not assume it is the first part
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error: any) {
      console.error(error);
      alert("Image generation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnimateImage = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      // API Key Selection check for Veo models as per guidelines
      if (!(await (window as any).aistudio.hasSelectedApiKey())) {
        await (window as any).aistudio.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = await blobToBase64(selectedFile);
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this creative professionally',
        image: {
          imageBytes: base64Data,
          mimeType: selectedFile.type,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: videoAspectRatio
        }
      });

      // Polling for video generation operation completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      // Fetch video bytes with API key appended to the URL as required for public links
      const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const videoBlob = await res.blob();
      setGeneratedVideoUrl(URL.createObjectURL(videoBlob));
    } catch (error: any) {
      console.error(error);
      alert("Animation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const startLiveConversation = async () => {
    setIsLiveActive(true);
    setTranscription([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              // Ensure sendRealtimeInput is called only after sessionPromise resolves to prevent race conditions
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle audio output transcription for real-time brand feedback
            if (msg.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev, `Gemini: ${msg.serverContent!.outputTranscription!.text}`]);
            } else if (msg.serverContent?.inputTranscription) {
              setTranscription(prev => [...prev, `You: ${msg.serverContent!.inputTranscription!.text}`]);
            }

            // Process audio bytes for low-latency playback
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle interruption signal from the model
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsLiveActive(false),
          onerror: () => setIsLiveActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are a professional growth marketing consultant brainstorm strategist.',
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
    } catch (error) {
      console.error(error);
      setIsLiveActive(false);
    }
  };

  return (
    <section id="ai-lab" className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
            AI-POWERED GROWTH SUITE
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">The Growth AI Lab</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Experience the future of marketing strategy. I use cutting-edge Generative AI to optimize every aspect of your brand's digital presence.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { id: 'insights', label: 'Market Insights', icon: '🔍' },
            { id: 'creative', label: 'Creative Studio', icon: '🎨' },
            { id: 'motion', label: 'Motion Lab', icon: '🎥' },
            { id: 'voice', label: 'Voice Strategy', icon: '🎙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 bg-slate-800/50 p-8 md:p-12 rounded-[3rem] border border-slate-700/50 backdrop-blur-xl">
          <div className="flex flex-col gap-8">
            {activeTab === 'insights' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <h3 className="text-2xl font-bold">Strategy & Research</h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask about competitors, trends, or Dhaka-based opportunities..."
                  className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => handleInsightsSearch(false)}
                    disabled={isLoading}
                    className="flex-1 bg-indigo-600 py-4 rounded-xl font-bold hover:bg-indigo-500 transition-all disabled:opacity-50"
                  >
                    Google Search
                  </button>
                  <button
                    onClick={() => handleInsightsSearch(true)}
                    disabled={isLoading}
                    className="flex-1 bg-emerald-600 py-4 rounded-xl font-bold hover:bg-emerald-500 transition-all disabled:opacity-50"
                  >
                    Local Dhaka Insight
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'creative' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <h3 className="text-2xl font-bold">Ad Creative Studio</h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the ad creative you want to generate with AI..."
                  className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Resolution (3 Pro)</label>
                  <select 
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none text-sm"
                  >
                    <option value="1K">1K Standard</option>
                    <option value="2K">2K High-Res</option>
                    <option value="4K">4K Ultra-Res</option>
                  </select>
                </div>
                <button
                  onClick={handleImageGeneration}
                  disabled={isLoading}
                  className="w-full bg-indigo-600 py-5 rounded-2xl font-bold text-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                >
                  Generate Growth Asset (3 Pro)
                </button>
              </div>
            )}

            {activeTab === 'motion' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <h3 className="text-2xl font-bold">Motion Lab (Veo)</h3>
                <p className="text-slate-400 text-sm">Create high-impact video ads from product photos. (Limit: 3/day)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Aspect Ratio</label>
                    <select 
                      value={videoAspectRatio}
                      onChange={(e) => setVideoAspectRatio(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none"
                    >
                      <option value="16:9">16:9</option>
                      <option value="9:16">9:16</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Source Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAnimateImage}
                  disabled={isLoading || !selectedFile}
                  className="w-full bg-indigo-600 py-5 rounded-2xl font-bold text-xl hover:bg-indigo-500 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Animating with Veo...' : 'Animate with Veo'}
                </button>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <h3 className="text-2xl font-bold">Voice Strategy Session</h3>
                <p className="text-slate-400 text-sm">Real-time brainstorming. Gemini understands your brand context through voice.</p>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 min-h-[150px] max-h-[300px] overflow-y-auto">
                  {transcription.length === 0 && <span className="text-slate-600 italic text-sm">Ready to listen...</span>}
                  {transcription.map((line, i) => (
                    <div key={i} className={`mb-2 text-sm ${line.startsWith('You') ? 'text-indigo-400 font-bold' : 'text-slate-300'}`}>
                      {line}
                    </div>
                  ))}
                </div>
                <button
                  onClick={isLiveActive ? () => window.location.reload() : startLiveConversation}
                  className={`w-full py-5 rounded-2xl font-bold text-xl transition-all ${
                    isLiveActive ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                >
                  {isLiveActive ? 'End Session' : '🎙️ Start Session'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-[2rem] border border-slate-700/50 flex flex-col items-center justify-center p-8 min-h-[400px] relative">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20 rounded-[2rem]">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="font-bold text-indigo-400">Processing AI Data...</span>
              </div>
            )}

            {!isLoading && !output && !generatedImageUrl && !generatedVideoUrl && (
              <div className="text-center text-slate-500 p-8">
                <div className="text-6xl mb-6">🎯</div>
                <h4 className="text-xl font-bold mb-2">Data Ready</h4>
                <p className="text-sm">Initiate an AI workflow to see result preview.</p>
              </div>
            )}

            {output && activeTab === 'insights' && (
              <div className="w-full animate-fade-in overflow-y-auto max-h-[500px] pr-2">
                <h4 className="font-bold text-indigo-400 mb-4 text-xs uppercase tracking-widest">Growth Intelligence</h4>
                <div className="text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap text-sm">
                  {output}
                </div>
                {groundingLinks.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Validation Data</h5>
                    <div className="flex flex-wrap gap-3">
                      {groundingLinks.map((link, i) => {
                        const source = link.search?.entry || link.web || link.maps;
                        if (!source) return null;
                        return (
                          <a
                            key={i}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                          >
                            {source.title || 'Data Source'}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {generatedImageUrl && activeTab === 'creative' && (
              <div className="w-full h-full flex flex-col items-center">
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                  <img src={generatedImageUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <a 
                  href={generatedImageUrl} 
                  download="creative_asset.png"
                  className="mt-6 text-sm font-bold text-indigo-400 hover:underline"
                >
                  Download Asset
                </a>
              </div>
            )}

            {generatedVideoUrl && activeTab === 'motion' && (
              <div className="w-full h-full flex flex-col items-center">
                <div className={`w-full ${videoAspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'} rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black`}>
                  <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full object-contain" />
                </div>
                <a 
                  href={generatedVideoUrl} 
                  download="motion_ad.mp4"
                  className="mt-6 text-sm font-bold text-indigo-400 hover:underline"
                >
                  Download Video
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AILab;
