
import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { Shield, Sparkles, Calendar, User as UserIcon, LogOut, Award, Users, Search } from 'lucide-react';

interface Props {
  user: User;
  onLogout: () => void;
  lang: Language;
}

const Profile: React.FC<Props> = ({ user, onLogout, lang }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('rpg_users');
    if (data) {
      setAllUsers(JSON.parse(data));
    }
  }, []);

  const t = {
    profile: lang === 'tr' ? 'Profil' : 'Profile',
    joined: lang === 'tr' ? 'Katılım' : 'Joined',
    role: lang === 'tr' ? 'Üyelik Tipi' : 'Account Type',
    logout: lang === 'tr' ? 'Çıkış Yap' : 'Logout',
    stats: lang === 'tr' ? 'Başarımlar' : 'Achievements',
    dm: lang === 'tr' ? 'Zindan Efendisi' : 'Dungeon Master',
    player: lang === 'tr' ? 'Maceracı' : 'Adventurer',
    ledger: lang === 'tr' ? 'Dünya Kayıtları (DM Özel)' : 'World Ledger (DM Only)',
    username: lang === 'tr' ? 'Kullanıcı' : 'User',
    date: lang === 'tr' ? 'Tarih' : 'Date',
    noUsers: lang === 'tr' ? 'Kayıtlı kimse bulunamadı.' : 'No users found.'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          {user.role === 'dm' ? <Sparkles className="w-32 h-32" /> : <Shield className="w-32 h-32" />}
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${user.role === 'dm' ? 'border-indigo-500 bg-indigo-500/10' : 'border-amber-500 bg-amber-500/10'}`}>
            {user.role === 'dm' ? <Sparkles className="w-16 h-16 text-indigo-500" /> : <UserIcon className="w-16 h-16 text-amber-500" />}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-bold fantasy-font text-white mb-2">{user.username}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${user.role === 'dm' ? 'bg-indigo-600 text-white' : 'bg-amber-600 text-white'}`}>
                {user.role === 'dm' ? t.dm : t.player}
              </span>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Calendar className="w-4 h-4" />
                {t.joined}: {user.joinDate}
              </div>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-900/20 text-red-400 border border-red-900/30 px-6 py-2 rounded-xl hover:bg-red-900/40 transition-colors font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            {t.logout}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: lang === 'tr' ? 'Oyunlar' : 'Games', value: '12', icon: Award },
          { label: lang === 'tr' ? 'Zar Atışları' : 'Dice Throws', value: '154', icon: Shield },
          { label: lang === 'tr' ? 'Hikayeler' : 'Stories', value: '5', icon: Sparkles }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-700 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 bg-slate-800 rounded-xl">
              <stat.icon className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* DM Özel - Kullanıcı Ledger (Kayıtlar) */}
      {user.role === 'dm' && (
        <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
           <h3 className="text-xl font-bold fantasy-font text-indigo-400 mb-6 flex items-center gap-2">
             <Users className="w-5 h-5" /> {t.ledger}
           </h3>
           
           <div className="overflow-hidden border border-slate-800 rounded-xl">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">{t.username}</th>
                    <th className="px-6 py-4">{t.role}</th>
                    <th className="px-6 py-4">{t.date}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {allUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-slate-600 italic">{t.noUsers}</td>
                    </tr>
                  ) : (
                    allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${u.role === 'dm' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-amber-600/20 text-amber-400'}`}>
                              <UserIcon className="w-4 h-4" />
                           </div>
                           <span className="font-bold text-slate-200">{u.username}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${u.role === 'dm' ? 'border-indigo-900 text-indigo-500' : 'border-amber-900 text-amber-500'}`}>
                             {u.role.toUpperCase()}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{u.joinDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
