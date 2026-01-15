
import React, { useState, useEffect } from 'react';
import { Character, Language, User } from '../types';
import { Shield, Users, Sword, Heart, Star, User as UserIcon, Flame, Coffee } from 'lucide-react';

interface Props {
  lang: Language;
  currentUser: User;
}

const Tavern: React.FC<Props> = ({ lang, currentUser }) => {
  const [sharedCharacters, setSharedCharacters] = useState<Character[]>([]);

  useEffect(() => {
    const loadShared = () => {
      const data = localStorage.getItem('rpg_shared_characters');
      if (data) setSharedCharacters(JSON.parse(data));
    };
    loadShared();
    // In a real app we'd use a websocket, here we just poll or refresh on mount
  }, []);

  const t = {
    title: lang === 'tr' ? 'Efsaneler Hanı' : "Legend's Tavern",
    subtitle: lang === 'tr' ? 'Bütün kahramanlar burada toplanır...' : 'All heroes gather here...',
    empty: lang === 'tr' ? 'Handa henüz kimse yok. Karakterini paylaş ve buraya gel!' : 'The tavern is empty. Share your character to join!',
    owner: lang === 'tr' ? 'Oyuncu' : 'Player',
    stats: lang === 'tr' ? 'Özellikler' : 'Stats'
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="relative h-64 rounded-3xl overflow-hidden mb-8 border border-amber-900/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1543791187-df796fa11835?auto=format&fit=crop&q=80&w=1000" 
          alt="Tavern" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 hover:scale-100 transition-transform duration-1000"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-6">
          <Coffee className="w-12 h-12 text-amber-500 mb-4 animate-bounce" />
          <h1 className="text-4xl md:text-5xl font-bold fantasy-font text-amber-500 drop-shadow-lg">{t.title}</h1>
          <p className="text-slate-300 italic max-w-md">{t.subtitle}</p>
        </div>
      </div>

      {sharedCharacters.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-3xl p-20 text-center">
           <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
           <p className="text-slate-500 fantasy-font">{t.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedCharacters.map((char) => (
            <div key={char.id} className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 hover:border-amber-500/50 transition-all group relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-20 h-20" />
              </div>
              
              <div className="flex items-start gap-4 mb-4 relative z-10">
                <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-500">
                  <Flame className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white fantasy-font group-hover:text-amber-400 transition-colors">{char.name}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{char.race} • {char.class}</p>
                  <p className="text-[10px] text-amber-600 font-bold mt-1">LVL {char.level}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
                 <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase">HP</span>
                    <span className="text-red-500 font-bold">{char.hp.current}</span>
                 </div>
                 <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase">PHY</span>
                    <span className="text-blue-400 font-bold">{char.attributes.fiziksel}</span>
                 </div>
                 <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase">INT</span>
                    <span className="text-purple-400 font-bold">{char.attributes.zeka}</span>
                 </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-[10px] font-bold">
                 <div className="flex items-center gap-1 text-slate-500">
                   <UserIcon className="w-3 h-3" />
                   {t.owner}: <span className="text-slate-300 ml-1">{char.ownerName || 'Bilinmeyen'}</span>
                 </div>
                 <div className="flex items-center gap-1 text-amber-500">
                   <Star className="w-3 h-3 fill-amber-500" />
                   {lang === 'tr' ? 'Karakter' : 'Hero'}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tavern;
