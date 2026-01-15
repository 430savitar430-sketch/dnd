
import React, { useState } from 'react';
import { generateQuest, generateNPC, askGameMaster } from '../services/geminiService';
import { Quest, NPC, Language, User } from '../types';
// Fixed missing Sparkles icon in imports
import { Scroll, Users, MessageCircle, Send, Wand2, Loader2, Lock, Plus, Save, Trash2, Sparkles } from 'lucide-react';

interface Props {
  lang: Language;
  user: User;
}

const StoryPanel: React.FC<Props> = ({ lang, user }) => {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [npc, setNpc] = useState<NPC | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{ role: string, text: string }[]>([]);
  const [showManualForm, setShowManualForm] = useState<'quest' | 'npc' | null>(null);

  const t = {
    dmTools: lang === 'tr' ? 'DM Atölyesi' : 'DM Workshop',
    genQuest: lang === 'tr' ? 'Yapay Zeka Görev' : 'AI Quest',
    genNPC: lang === 'tr' ? 'Yapay Zeka NPC' : 'AI NPC',
    manualQuest: lang === 'tr' ? 'Kendin Yaz: Görev' : 'Write Own: Quest',
    manualNPC: lang === 'tr' ? 'Kendin Yaz: NPC' : 'Write Own: NPC',
    title: lang === 'tr' ? 'Başlık' : 'Title',
    desc: lang === 'tr' ? 'Açıklama' : 'Description',
    reward: lang === 'tr' ? 'Ödül' : 'Reward',
    diff: lang === 'tr' ? 'Zorluk' : 'Difficulty',
    save: lang === 'tr' ? 'Kaydet' : 'Save',
    cancel: lang === 'tr' ? 'İptal' : 'Cancel',
    dmOnly: lang === 'tr' ? 'Bu bölge Zindan Efendisi tapınağıdır' : 'This region is the DM Sanctuary',
    askDM: lang === 'tr' ? 'Gruba Duyuru / Bilgi' : 'Announcement / Info'
  };

  const [manualQuest, setManualQuest] = useState<Quest>({ title: '', description: '', reward: '', difficulty: 'Normal' });
  const [manualNPC, setManualNPC] = useState<NPC>({ name: '', role: '', personality: '', secret: '' });

  const handleGenerateQuest = async () => {
    setLoading(true);
    try {
      const q = await generateQuest(lang === 'tr' ? "Karanlık Zindan" : "Dark Dungeon", lang);
      setQuest(q);
      setNpc(null);
      setShowManualForm(null);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleGenerateNPC = async () => {
    setLoading(true);
    try {
      const n = await generateNPC(lang === 'tr' ? "Yol Kenarı Hanı" : "Roadside Inn", lang);
      setNpc(n);
      setQuest(null);
      setShowManualForm(null);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSaveManualQuest = () => {
    setQuest({ ...manualQuest, isManual: true });
    setNpc(null);
    setShowManualForm(null);
  };

  const handleSaveManualNPC = () => {
    setNpc({ ...manualNPC, isManual: true });
    setQuest(null);
    setShowManualForm(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="flex flex-col gap-6">
        <div className="bg-slate-900/60 border border-slate-700 p-6 rounded-2xl shadow-xl relative overflow-hidden">
          {user.role !== 'dm' && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center">
              <Lock className="w-16 h-16 text-slate-700 mb-4" />
              <h2 className="fantasy-font text-xl text-slate-500">{t.dmOnly}</h2>
            </div>
          )}

          <h2 className="text-xl font-bold mb-6 fantasy-font text-amber-500 flex items-center gap-2">
            <Wand2 className="w-5 h-5" /> {t.dmTools}
          </h2>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <button onClick={handleGenerateQuest} className="flex items-center justify-center gap-2 p-3 text-xs rounded-xl bg-amber-600/20 text-amber-500 border border-amber-600/30 hover:bg-amber-600 hover:text-white transition-all">
              <Sparkles className="w-4 h-4" /> {t.genQuest}
            </button>
            <button onClick={handleGenerateNPC} className="flex items-center justify-center gap-2 p-3 text-xs rounded-xl bg-indigo-600/20 text-indigo-500 border border-indigo-600/30 hover:bg-indigo-600 hover:text-white transition-all">
              <Users className="w-4 h-4" /> {t.genNPC}
            </button>
            <button onClick={() => setShowManualForm('quest')} className="flex items-center justify-center gap-2 p-3 text-xs rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all">
              <Plus className="w-4 h-4" /> {t.manualQuest}
            </button>
            <button onClick={() => setShowManualForm('npc')} className="flex items-center justify-center gap-2 p-3 text-xs rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all">
              <Plus className="w-4 h-4" /> {t.manualNPC}
            </button>
          </div>

          <div className="min-h-[300px] border-t border-slate-700 pt-6">
            {showManualForm === 'quest' ? (
              <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                <input placeholder={t.title} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm" onChange={e => setManualQuest({...manualQuest, title: e.target.value})} />
                <textarea placeholder={t.desc} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm h-24" onChange={e => setManualQuest({...manualQuest, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder={t.reward} className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm" onChange={e => setManualQuest({...manualQuest, reward: e.target.value})} />
                  <input placeholder={t.diff} className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm" onChange={e => setManualQuest({...manualQuest, difficulty: e.target.value})} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveManualQuest} className="flex-1 bg-green-600 py-2 rounded-lg font-bold text-xs"><Save className="inline w-3 h-3 mr-1" /> {t.save}</button>
                  <button onClick={() => setShowManualForm(null)} className="flex-1 bg-slate-700 py-2 rounded-lg font-bold text-xs">{t.cancel}</button>
                </div>
              </div>
            ) : showManualForm === 'npc' ? (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <input placeholder="NPC Adı" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm" onChange={e => setManualNPC({...manualNPC, name: e.target.value})} />
                <input placeholder="Rol / Sınıf" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm" onChange={e => setManualNPC({...manualNPC, role: e.target.value})} />
                <textarea placeholder="Kişilik Özellikleri" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm h-20" onChange={e => setManualNPC({...manualNPC, personality: e.target.value})} />
                <input placeholder="Gizli Sır" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm" onChange={e => setManualNPC({...manualNPC, secret: e.target.value})} />
                <div className="flex gap-2">
                  <button onClick={handleSaveManualNPC} className="flex-1 bg-green-600 py-2 rounded-lg font-bold text-xs"><Save className="inline w-3 h-3 mr-1" /> {t.save}</button>
                  <button onClick={() => setShowManualForm(null)} className="flex-1 bg-slate-700 py-2 rounded-lg font-bold text-xs">{t.cancel}</button>
                </div>
              </div>
            ) : (
              <div>
                {loading && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}
                {!loading && quest && (
                  <div className="animate-in fade-in zoom-in-95">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white uppercase mb-2 inline-block">GÖREV</span>
                    <h3 className="text-2xl font-bold fantasy-font mb-2">{quest.title}</h3>
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">{quest.description}</p>
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700 text-xs space-y-1">
                      <p><span className="text-slate-500 font-bold">ÖDÜL:</span> <span className="text-green-400 font-bold">{quest.reward}</span></p>
                      <p><span className="text-slate-500 font-bold">ZORLUK:</span> <span className="text-amber-400 font-bold">{quest.difficulty}</span></p>
                    </div>
                  </div>
                )}
                {!loading && npc && (
                   <div className="animate-in fade-in zoom-in-95">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white uppercase mb-2 inline-block">NPC</span>
                    <h3 className="text-2xl font-bold fantasy-font mb-1">{npc.name}</h3>
                    <p className="text-indigo-400 text-xs font-bold mb-4">{npc.role}</p>
                    <div className="space-y-3">
                      <p className="text-slate-300 text-sm italic">"{npc.personality}"</p>
                      <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-xs">
                        <span className="text-red-500 font-bold uppercase block mb-1">GİZLİ GERÇEK</span>
                        <p className="text-red-200">{npc.secret}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl flex flex-col shadow-2xl relative overflow-hidden h-[600px]">
        <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-bold fantasy-font text-amber-500">Grup Günlüğü / DM İletişimi</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {chatLog.length === 0 && <p className="text-slate-600 text-center text-sm py-20 italic">Macera henüz başlamadı...</p>}
           {chatLog.map((msg, i) => (
             <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                 <p className="text-sm">{msg.text}</p>
               </div>
             </div>
           ))}
        </div>
        <form onSubmit={e => {
          e.preventDefault();
          if (!chatInput) return;
          setChatLog([...chatLog, { role: user.role === 'dm' ? 'dm' : 'user', text: chatInput }]);
          setChatInput('');
        }} className="p-4 border-t border-slate-700 bg-slate-900/40 flex gap-2">
           <input className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm" placeholder="Mesajını yaz..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
           <button className="p-2 bg-amber-600 rounded-xl"><Send className="w-5 h-5" /></button>
        </form>
      </div>
    </div>
  );
};

export default StoryPanel;
