
import React, { useState, useEffect } from 'react';
import { Character, TabType, Language, User } from './types';
import CharacterCard from './components/CharacterCard';
import DiceRoller from './components/DiceRoller';
import StoryPanel from './components/StoryPanel';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Tavern from './components/Tavern';
import LiveTable from './components/LiveTable';
import { Sword, BookOpen, Dice5, User as UserIcon, Menu, X, Globe, Sparkles, Coffee, Share2, Video, Save } from 'lucide-react';

const INITIAL_CHARACTER: (ownerId: string, ownerName: string) => Character = (ownerId, ownerName) => ({
  id: Math.random().toString(36).substr(2, 9),
  ownerId,
  ownerName,
  name: 'Yeni Kahraman',
  race: 'İnsan',
  class: 'Savaşçı',
  level: 1,
  hp: { current: 10, max: 10 },
  attributes: {
    can: 10,
    dayaniklik: 10,
    ceviklik: 10,
    fiziksel: 10,
    bilgelik: 10,
    zeka: 10,
    inanc: 10,
    kafirlik: 0
  },
  inventory: [],
  notes: 'Maceracı notları buraya...'
});

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('character');
  const [character, setCharacter] = useState<Character | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('tr');
  const [saveStatus, setSaveStatus] = useState(false);

  // Veri Yükleme
  useEffect(() => {
    const savedUser = localStorage.getItem('rpg_session_user');
    const savedLang = localStorage.getItem('rpg_lang');
    
    if (savedLang) setLang(savedLang as Language);

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      
      const savedChar = localStorage.getItem(`rpg_char_${user.id}`);
      if (savedChar) {
        setCharacter(JSON.parse(savedChar));
      } else {
        const newChar = INITIAL_CHARACTER(user.id, user.username);
        setCharacter(newChar);
        localStorage.setItem(`rpg_char_${user.id}`, JSON.stringify(newChar));
      }
    }
  }, []);

  // Veri Kaydetme (Karakter ve Dil Değişiklikleri)
  useEffect(() => {
    if (currentUser && character) {
      localStorage.setItem(`rpg_char_${currentUser.id}`, JSON.stringify(character));
      // Görsel kayıt göstergesi
      setSaveStatus(true);
      const timer = setTimeout(() => setSaveStatus(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [character]);

  useEffect(() => {
    localStorage.setItem('rpg_lang', lang);
  }, [lang]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('rpg_session_user', JSON.stringify(user));
    
    const savedChar = localStorage.getItem(`rpg_char_${user.id}`);
    if (savedChar) {
      setCharacter(JSON.parse(savedChar));
    } else {
      const newChar = INITIAL_CHARACTER(user.id, user.username);
      setCharacter(newChar);
      localStorage.setItem(`rpg_char_${user.id}`, JSON.stringify(newChar));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCharacter(null);
    localStorage.removeItem('rpg_session_user');
    setActiveTab('character');
  };

  const handleShareCharacter = () => {
    if (!character || !currentUser) return;
    const sharedData = localStorage.getItem('rpg_shared_characters');
    const sharedList: Character[] = sharedData ? JSON.parse(sharedData) : [];
    
    // Eski kaydı sil ve yenisini ekle (Upsert)
    const filteredList = sharedList.filter(c => c.ownerId !== currentUser.id);
    filteredList.push({ ...character, isShared: true, ownerName: currentUser.username });
    
    localStorage.setItem('rpg_shared_characters', JSON.stringify(filteredList));
    alert(lang === 'tr' ? "Karakterin Hana başarıyla gönderildi!" : "Character successfully sent to Tavern!");
    setActiveTab('tavern');
  };

  const t = {
    title: lang === 'tr' ? 'Efsaneler Günlüğü' : 'Legend Ledger',
    char: lang === 'tr' ? 'Karakter' : 'Character',
    adventure: lang === 'tr' ? 'Macera' : 'Adventure',
    dice: lang === 'tr' ? 'Zarlar' : 'Dice',
    profile: lang === 'tr' ? 'Profil' : 'Profile',
    tavern: lang === 'tr' ? 'Han' : 'Tavern',
    live: lang === 'tr' ? 'Canlı Masa' : 'Live Table',
    share: lang === 'tr' ? 'Hanla Paylaş' : 'Share with Inn',
    saved: lang === 'tr' ? 'Kaydedildi' : 'Saved'
  };

  const tabs = [
    { id: 'character', label: t.char, icon: Sword },
    { id: 'live', label: t.live, icon: Video },
    { id: 'tavern', label: t.tavern, icon: Coffee },
    { id: 'story', label: t.adventure, icon: BookOpen },
    { id: 'dice', label: t.dice, icon: Dice5 },
    { id: 'profile', label: t.profile, icon: UserIcon },
  ];

  if (!currentUser) return <Auth onLogin={handleLogin} lang={lang} />;

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-500/30">
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${currentUser.role === 'dm' ? 'bg-indigo-600' : 'bg-amber-600'}`}>
            {currentUser.role === 'dm' ? <Sparkles className="w-6 h-6 text-white" /> : <Sword className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h1 className="text-xl font-bold fantasy-font bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">{t.title}</h1>
            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-tighter">{currentUser.username} • {currentUser.role === 'dm' ? 'Zindan Efendisi' : 'Oyuncu'}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-xs ${
                  activeTab === tab.id ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Kayıt Göstergesi */}
          <div className={`flex items-center gap-1.5 transition-opacity duration-500 ${saveStatus ? 'opacity-100' : 'opacity-0'}`}>
             <Save className="w-3 h-3 text-green-500" />
             <span className="text-[10px] text-green-500 font-bold uppercase">{t.saved}</span>
          </div>
        </div>

        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-400"><Menu /></button>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/95 flex flex-col p-8 md:hidden animate-in fade-in">
           <div className="flex justify-between mb-12"><h2 className="fantasy-font text-xl text-amber-500">Menu</h2><button onClick={() => setIsMobileMenuOpen(false)}><X /></button></div>
           <div className="flex flex-col gap-4">
             {tabs.map((tab) => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id as TabType); setIsMobileMenuOpen(false); }} className={`flex items-center gap-4 p-5 rounded-2xl text-xl font-bold ${activeTab === tab.id ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}><tab.icon className="w-6 h-6" />{tab.label}</button>
              ))}
           </div>
        </div>
      )}

      <main className="flex-1 container mx-auto p-4 sm:p-8 max-w-6xl">
        {activeTab === 'character' && character && (
          <div className="space-y-6">
            <div className="flex justify-end">
               <button onClick={handleShareCharacter} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm shadow-xl transition-all"><Share2 className="w-4 h-4" /> {t.share}</button>
            </div>
            <CharacterCard character={character} updateCharacter={setCharacter} lang={lang} />
          </div>
        )}

        {activeTab === 'tavern' && <Tavern lang={lang} currentUser={currentUser} />}
        {activeTab === 'story' && <StoryPanel lang={lang} user={currentUser} />}
        {activeTab === 'dice' && <div className="max-w-2xl mx-auto"><DiceRoller /></div>}
        {activeTab === 'profile' && <Profile user={currentUser} onLogout={handleLogout} lang={lang} />}
        {activeTab === 'live' && <LiveTable lang={lang} user={currentUser} />}
      </main>

      <footer className="py-6 text-center text-slate-600 text-[10px]">&copy; 2024 {t.title} • Yapay Zeka ile Güçlendirildi</footer>
    </div>
  );
};

export default App;
