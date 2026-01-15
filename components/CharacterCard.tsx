
import React from 'react';
import { Character, Language, CharacterAttributes } from '../types';
import { Shield, Heart, Zap, Brain, Eye, User, Sparkles, Flame, Cross, Edit3 } from 'lucide-react';

interface Props {
  character: Character;
  updateCharacter: (char: Character) => void;
  lang: Language;
}

const CharacterCard: React.FC<Props> = ({ character, updateCharacter, lang }) => {
  const handleStatChange = (stat: keyof CharacterAttributes, val: number) => {
    updateCharacter({
      ...character,
      attributes: { ...character.attributes, [stat]: val }
    });
  };

  const calculateModifier = (val: number) => Math.floor((val - 10) / 2);

  const stats = [
    { label: { tr: 'CAN', en: 'VIT' }, key: 'can', icon: Heart, color: 'text-red-500' },
    { label: { tr: 'DAYANIKLIK', en: 'END' }, key: 'dayaniklik', icon: Shield, color: 'text-orange-400' },
    { label: { tr: 'ÇEVİKLİK', en: 'AGI' }, key: 'ceviklik', icon: Zap, color: 'text-blue-400' },
    { label: { tr: 'FİZİKSEL', en: 'PHY' }, key: 'fiziksel', icon: Flame, color: 'text-rose-600' },
    { label: { tr: 'BİLGELİK', en: 'WIS' }, key: 'bilgelik', icon: Eye, color: 'text-green-400' },
    { label: { tr: 'ZEKA', en: 'INT' }, key: 'zeka', icon: Brain, color: 'text-purple-400' },
    { label: { tr: 'İNANÇ', en: 'FTH' }, key: 'inanc', icon: Cross, color: 'text-amber-400' },
    { label: { tr: 'KAFİRLİK', en: 'HER' }, key: 'kafirlik', icon: Sparkles, color: 'text-emerald-500' }
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-700 p-8 rounded-3xl shadow-2xl backdrop-blur-sm animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="flex-1 space-y-4">
          <input 
            className="text-4xl font-bold text-amber-500 fantasy-font bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-500 focus:outline-none w-full"
            value={character.name}
            onChange={e => updateCharacter({...character, name: e.target.value})}
            placeholder="İsim"
          />
          <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
            <input className="bg-slate-950/50 border border-slate-700 rounded px-2 py-1 w-24" value={character.race} onChange={e => updateCharacter({...character, race: e.target.value})} placeholder="Irk" />
            <input className="bg-slate-950/50 border border-slate-700 rounded px-2 py-1 w-24" value={character.class} onChange={e => updateCharacter({...character, class: e.target.value})} placeholder="Sınıf" />
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-slate-500">LVL</span>
               <input type="number" className="bg-slate-950/50 border border-slate-700 rounded px-2 py-1 w-16" value={character.level} onChange={e => updateCharacter({...character, level: parseInt(e.target.value) || 1})} />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-6 bg-slate-950/50 border border-slate-800 rounded-2xl min-w-[180px]">
           <Heart className="w-8 h-8 text-red-500 mb-2 animate-pulse" />
           <div className="flex items-center gap-2 text-3xl font-black">
              <input type="number" className="bg-transparent w-16 text-center border-b border-slate-700 focus:border-red-500 outline-none" value={character.hp.current} onChange={e => updateCharacter({...character, hp: {...character.hp, current: parseInt(e.target.value) || 0}})} />
              <span className="text-slate-600">/</span>
              <input type="number" className="bg-transparent w-16 text-center text-slate-400 outline-none" value={character.hp.max} onChange={e => updateCharacter({...character, hp: {...character.hp, max: parseInt(e.target.value) || 0}})} />
           </div>
           <span className="text-[10px] uppercase font-bold text-slate-500 mt-2 tracking-widest">Can Puanı</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.key} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700 hover:border-amber-500/30 transition-all flex flex-col items-center">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <span className="text-[10px] font-bold text-slate-500 uppercase mb-2">{stat.label[lang]}</span>
            <input 
              type="number"
              className="bg-slate-950/50 w-16 text-center text-xl font-bold py-1 rounded-lg border border-slate-800 focus:outline-none"
              value={(character.attributes as any)[stat.key === 'int' ? 'zeka' : stat.key]}
              onChange={(e) => handleStatChange((stat.key === 'int' ? 'zeka' : stat.key) as keyof CharacterAttributes, parseInt(e.target.value) || 0)}
            />
            <span className="text-[10px] text-slate-500 mt-2">
              MOD: {calculateModifier((character.attributes as any)[stat.key === 'int' ? 'zeka' : stat.key]) >= 0 ? '+' : ''}
              {calculateModifier((character.attributes as any)[stat.key === 'int' ? 'zeka' : stat.key])}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
          <Edit3 className="w-4 h-4" /> Hikaye & Envanter
        </label>
        <textarea 
          className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl p-4 text-sm text-slate-300 min-h-[150px] focus:ring-1 focus:ring-amber-500/50 outline-none leading-relaxed"
          placeholder="Kahramanının eşyalarını ve geçmişini buraya yaz..."
          value={character.notes}
          onChange={e => updateCharacter({...character, notes: e.target.value})}
        />
      </div>
    </div>
  );
};

export default CharacterCard;
