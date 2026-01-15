
import React, { useState, useEffect } from 'react';
import { User, UserRole, Language } from '../types';
import { Shield, User as UserIcon, Sword, LogIn, Sparkles, Lock, Users } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
  lang: Language;
}

interface StoredUser extends User {
  password?: string;
}

const Auth: React.FC<Props> = ({ onLogin, lang }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('player');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ dm: 0, player: 0 });

  const t = {
    title: lang === 'tr' ? 'Efsaneler Günlüğü' : 'Legend Ledger',
    welcome: lang === 'tr' ? 'Maceraya Hazır Mısın?' : 'Ready for Adventure?',
    login: lang === 'tr' ? 'Giriş Yap' : 'Login',
    register: lang === 'tr' ? 'Kayıt Ol' : 'Sign Up',
    username: lang === 'tr' ? 'Kullanıcı Adı' : 'Username',
    password: lang === 'tr' ? 'Şifre' : 'Password',
    role: lang === 'tr' ? 'Rol Seç' : 'Choose Role',
    dm: lang === 'tr' ? 'Zindan Efendisi' : 'Dungeon Master',
    player: lang === 'tr' ? 'Oyuncu' : 'Player',
    submit: lang === 'tr' ? 'Devam Et' : 'Continue',
    switchRegister: lang === 'tr' ? 'Hesabın yok mu? Kayıt ol' : "Don't have an account? Sign up",
    switchLogin: lang === 'tr' ? 'Zaten hesabın var mı? Giriş yap' : 'Already have an account? Login',
    errorUser: lang === 'tr' ? 'Kullanıcı adı ve şifre gerekli!' : 'Username and password required!',
    userExists: lang === 'tr' ? 'Bu kullanıcı adı zaten alınmış!' : 'Username already taken!',
    invalidCreds: lang === 'tr' ? 'Hatalı kullanıcı adı veya şifre!' : 'Invalid username or password!',
    regSuccess: lang === 'tr' ? 'Kayıt başarılı! Giriş yapabilirsiniz.' : 'Registration successful! You can now login.',
    popTitle: lang === 'tr' ? 'Dünya Nüfusu' : 'World Population',
    dmCount: lang === 'tr' ? 'DM Aktif' : 'DMs Active',
    playCount: lang === 'tr' ? 'Oyuncu Kayıtlı' : 'Players Joined'
  };

  const getDatabase = (): StoredUser[] => {
    const data = localStorage.getItem('rpg_users');
    return data ? JSON.parse(data) : [];
  };

  const updateStats = () => {
    const db = getDatabase();
    const dm = db.filter(u => u.role === 'dm').length;
    const player = db.filter(u => u.role === 'player').length;
    setStats({ dm, player });
  };

  useEffect(() => {
    updateStats();
  }, [isRegister]);

  const saveToDatabase = (user: StoredUser) => {
    const db = getDatabase();
    db.push(user);
    localStorage.setItem('rpg_users', JSON.stringify(db));
    updateStats();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError(t.errorUser);
      return;
    }

    const db = getDatabase();

    if (isRegister) {
      const existing = db.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (existing) {
        setError(t.userExists);
        return;
      }

      const newUser: StoredUser = {
        id: Math.random().toString(36).substr(2, 9),
        username: username.trim(),
        password: password,
        role,
        avatar: role === 'dm' ? 'wizard' : 'knight',
        joinDate: new Date().toLocaleDateString()
      };

      saveToDatabase(newUser);
      setIsRegister(false);
      setUsername('');
      setPassword('');
      alert(t.regSuccess);
    } else {
      const user = db.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
      );

      if (user) {
        const { password: _, ...sessionUser } = user;
        onLogin(sessionUser);
      } else {
        setError(t.invalidCreds);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-700 p-8 rounded-3xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 bg-amber-600 rounded-2xl shadow-lg shadow-amber-900/40 mb-4">
            <Sword className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold fantasy-font text-amber-500 tracking-wide">{t.title}</h1>
          <p className="text-slate-400 text-sm mt-2">{t.welcome}</p>
        </div>

        {/* Population Stats */}
        <div className="flex gap-4 justify-center mb-8">
           <div className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 flex flex-col items-center min-w-[100px]">
              <span className="text-indigo-400 font-black text-xl leading-none">{stats.dm}</span>
              <span className="text-[8px] uppercase font-bold text-slate-500 mt-1">{t.dmCount}</span>
           </div>
           <div className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 flex flex-col items-center min-w-[100px]">
              <span className="text-amber-500 font-black text-xl leading-none">{stats.player}</span>
              <span className="text-[8px] uppercase font-bold text-slate-500 mt-1">{t.playCount}</span>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t.username}</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-white"
                placeholder="..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password"
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {isRegister && (
            <div className="pt-2 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t.role}</label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRole('player')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${role === 'player' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Shield className="w-3 h-3" /> {t.player}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('dm')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${role === 'dm' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Sparkles className="w-3 h-3" /> {t.dm}
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-xl text-red-400 text-xs text-center font-bold animate-in fade-in zoom-in-95">{error}</div>}

          <button 
            type="submit"
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all mt-4 ${role === 'dm' && isRegister ? 'bg-indigo-600 text-white' : 'bg-amber-600 text-white'}`}
          >
            <LogIn className="w-5 h-5" />
            {isRegister ? t.register : t.login}
          </button>
        </form>

        <button 
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
          className="w-full text-center text-xs text-slate-500 mt-6 hover:text-slate-300 transition-colors"
        >
          {isRegister ? t.switchLogin : t.switchRegister}
        </button>
      </div>
    </div>
  );
};

export default Auth;
