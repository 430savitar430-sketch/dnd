
export type Language = 'tr' | 'en';
export type UserRole = 'player' | 'dm';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  avatar: string;
  joinDate: string;
}

export interface CharacterAttributes {
  can: number;
  dayaniklik: number;
  ceviklik: number;
  fiziksel: number;
  bilgelik: number;
  zeka: number;
  inanc: number;
  kafirlik: number;
}

export interface Character {
  id: string;
  ownerId: string;
  ownerName?: string;
  name: string;
  race: string;
  class: string;
  level: number;
  hp: { current: number; max: number };
  attributes: CharacterAttributes;
  inventory: string[];
  notes: string;
  isShared?: boolean;
}

export interface Quest {
  id?: string;
  title: string;
  description: string;
  reward: string;
  difficulty: string;
  isManual?: boolean;
}

export interface NPC {
  id?: string;
  name: string;
  role: string;
  personality: string;
  secret: string;
  isManual?: boolean;
}

export type TabType = 'character' | 'story' | 'dice' | 'profile' | 'tavern' | 'live';
