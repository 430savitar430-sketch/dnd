
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { User, Language } from '../types';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Sparkles, Loader2, User as UserIcon, Shield } from 'lucide-react';

interface Props {
  user: User;
  lang: Language;
}

const LiveTable: React.FC<Props> = ({ user, lang }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const t = {
    start: lang === 'tr' ? 'Masaya Katıl' : 'Join Table',
    stop: lang === 'tr' ? 'Ayrıl' : 'Leave',
    mute: lang === 'tr' ? 'Sessiz' : 'Mute',
    unmute: lang === 'tr' ? 'Sesi Aç' : 'Unmute',
    videoOff: lang === 'tr' ? 'Kamera Kapat' : 'Camera Off',
    videoOn: lang === 'tr' ? 'Kamera Aç' : 'Camera On',
    connecting: lang === 'tr' ? 'Zindan Efendisiyle Bağlantı Kuruluyor...' : 'Connecting to DM...',
    status: lang === 'tr' ? 'Canlı Oturum' : 'Live Session',
    welcome: lang === 'tr' ? 'Canlı masaya hoş geldin! DM her an seni duyabilir ve görebilir.' : 'Welcome to the live table! The DM can hear and see you.',
    instruction: lang === 'tr' ? 'Sen bir D&D Zindan Efendisisin. Oyuncunla gerçek zamanlı sesli sohbettesin. Onu kameradan görebilirsin. Macera dolu ve yaratıcı ol.' : 'You are a D&D Dungeon Master. You are in a real-time voice chat with your player. You can see them via camera. Be adventurous and creative.'
  };

  // Base64 helpers
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
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
  };

  const startSession = async () => {
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Session opened');
            setIsActive(true);
            setLoading(false);

            // Stream Audio
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);

            // Stream Video Frames
            const interval = setInterval(() => {
              if (isVideoOff || !videoRef.current || !canvasRef.current) return;
              const ctx = canvasRef.current.getContext('2d');
              if (!ctx) return;
              canvasRef.current.width = videoRef.current.videoWidth || 320;
              canvasRef.current.height = videoRef.current.videoHeight || 240;
              ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
              const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } }));
            }, 2000);

            (sessionRef.current as any) = { stop: () => { clearInterval(interval); stream.getTracks().forEach(t => t.stop()); } };
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev.slice(-10), `DM: ${message.serverContent?.outputTranscription?.text}`]);
            }
            
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsActive(false);
            setLoading(false);
          },
          onerror: (e) => console.error('Live Error:', e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: t.instruction,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          outputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current.stop?.();
    }
    setIsActive(false);
    setTranscription([]);
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900/60 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-600 rounded-lg">
                <Video className="w-5 h-5 text-white" />
             </div>
             <div>
                <h2 className="fantasy-font text-lg text-amber-500">{t.status}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isActive ? 'Bağlantı Kuruldu' : 'Çevrimdışı'}</p>
             </div>
           </div>
           
           {isActive && (
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">Live</span>
             </div>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[600px]">
          {/* Video Feeds */}
          <div className="lg:col-span-2 bg-slate-950 relative overflow-hidden group">
            {isActive ? (
              <div className="h-full w-full relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {isVideoOff && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-700">
                      <VideoOff className="w-20 h-20 mb-4 opacity-20" />
                      <p className="fantasy-font text-xl opacity-30">{user.username}</p>
                   </div>
                )}

                {/* Local User Badge */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-slate-950/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                   <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center font-bold">
                      {user.username[0].toUpperCase()}
                   </div>
                   <div>
                      <p className="text-xs font-bold text-white">{user.username}</p>
                      <p className="text-[8px] text-amber-500 font-bold uppercase">{user.role === 'dm' ? 'Master' : 'Hero'}</p>
                   </div>
                </div>

                {/* AI Overlay */}
                <div className="absolute top-6 right-6 flex items-center gap-3 bg-indigo-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-indigo-500/30">
                   <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                   </div>
                   <div className="text-xs font-bold text-white">Gemini DM</div>
                </div>
              </div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center bg-slate-900/40">
                <div className="p-8 bg-slate-800 rounded-full mb-6 border border-slate-700">
                   <Video className="w-20 h-20 text-slate-600" />
                </div>
                <h3 className="text-2xl font-bold fantasy-font text-slate-300 mb-2">{t.welcome}</h3>
                <p className="text-slate-500 text-sm max-w-sm">Yapay zeka zindan efendisiyle göz göze gelip maceranı gerçek sesinle anlatmaya hazır mısın?</p>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                 <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                 <p className="fantasy-font text-amber-500">{t.connecting}</p>
              </div>
            )}
          </div>

          {/* Transcription / Chat Area */}
          <div className="bg-slate-900/40 border-l border-slate-800 flex flex-col">
             <div className="p-4 bg-slate-950/20 border-b border-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sohbet Kaydı</span>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
                {transcription.length === 0 ? (
                  <p className="text-slate-700 italic text-center py-20">Ses algılandığında döküm burada görünecek...</p>
                ) : (
                  transcription.map((t, i) => (
                    <div key={i} className="animate-in slide-in-from-bottom-2 duration-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                       {t}
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-slate-950/60 border-t border-slate-800 flex flex-wrap justify-center items-center gap-4">
           {!isActive ? (
             <button 
              onClick={startSession}
              disabled={loading}
              className="px-10 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-amber-900/20 transition-all flex items-center gap-3 hover:scale-105"
             >
                <Video className="w-6 h-6" />
                {t.start}
             </button>
           ) : (
             <>
               <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-2xl transition-all ${isMuted ? 'bg-red-900/40 text-red-500 border-red-900/50' : 'bg-slate-800 text-white border-slate-700'} border shadow-lg`}
               >
                 {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
               </button>
               <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-4 rounded-2xl transition-all ${isVideoOff ? 'bg-red-900/40 text-red-500 border-red-900/50' : 'bg-slate-800 text-white border-slate-700'} border shadow-lg`}
               >
                 {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
               </button>
               <button 
                onClick={stopSession}
                className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-xl shadow-red-900/20 transition-all flex items-center gap-3"
               >
                 <PhoneOff className="w-6 h-6" />
                 {t.stop}
               </button>
             </>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700">
            <h4 className="fantasy-font text-amber-500 mb-2 flex items-center gap-2">
               <Shield className="w-4 h-4" /> Masadaki Kahramanlar
            </h4>
            <div className="flex flex-wrap gap-2">
               <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-slate-300">{user.username} (Sen)</span>
               </div>
               {isActive && (
                 <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-indigo-900/50">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    <span className="text-xs text-indigo-300">Gemini (DM)</span>
                 </div>
               )}
            </div>
         </div>
         <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
            <div className="p-3 bg-indigo-600/20 rounded-xl">
               <Sparkles className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Yapay Zeka Görüşü</p>
               <p className="text-sm text-slate-300 italic">"Gözlerim açık, her hamleni izliyorum maceracı..."</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LiveTable;
