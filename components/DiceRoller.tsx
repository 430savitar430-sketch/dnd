
import React, { useState } from 'react';

const diceTypes = [
  { label: 'd4', sides: 4, color: 'bg-slate-700' },
  { label: 'd6', sides: 6, color: 'bg-slate-700' },
  { label: 'd8', sides: 8, color: 'bg-slate-700' },
  { label: 'd10', sides: 10, color: 'bg-slate-700' },
  { label: 'd12', sides: 12, color: 'bg-slate-700' },
  { label: 'd20', sides: 20, color: 'bg-amber-600' }
];

const DiceRoller: React.FC = () => {
  const [history, setHistory] = useState<{ die: string, result: number, time: string }[]>([]);
  const [rolling, setRolling] = useState<string | null>(null);

  const rollDie = (die: typeof diceTypes[0]) => {
    setRolling(die.label);
    setTimeout(() => {
      const result = Math.floor(Math.random() * die.sides) + 1;
      setHistory([{ 
        die: die.label, 
        result, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
      }, ...history.slice(0, 9)]);
      setRolling(null);
    }, 400);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-700 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-6 fantasy-font text-amber-500">Zar At</h2>
      
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {diceTypes.map((die) => (
          <button
            key={die.label}
            onClick={() => rollDie(die)}
            disabled={!!rolling}
            className={`${die.color} hover:scale-105 active:scale-95 transition-all h-16 rounded-xl border border-white/10 flex items-center justify-center font-bold text-xl shadow-lg relative overflow-hidden`}
          >
            {rolling === die.label && (
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
            {die.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Son Atışlar</h3>
        {history.length === 0 ? (
          <p className="text-slate-600 italic text-sm py-4 text-center">Henüz zar atılmadı...</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scroll-hide">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${h.die === 'd20' ? 'bg-amber-600 text-white' : 'bg-slate-600 text-slate-200'}`}>{h.die}</span>
                  <span className="text-slate-400 text-xs">{h.time}</span>
                </div>
                <span className={`text-xl font-black ${h.die === 'd20' && h.result === 20 ? 'text-amber-400 animate-bounce' : 'text-white'}`}>
                  {h.result}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiceRoller;
