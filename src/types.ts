export type RoastStyle = 'corporate' | 'influencer' | 'chronically_online' | 'crypto_bro' | 'main_character';

export interface RoastFlavorDefinition {
  id: RoastStyle;
  name: string;
  emoji: string;
  description: string;
}

export interface RoastResult {
  summary5Words: string;
  personaBreakdown: string;
  biggestRedFlag: string;
  closingLine: string;
  roastScore: number;
}

export interface RoastRecord {
  id: string;
  rawInput: string;
  roastStyle: RoastStyle;
  result: RoastResult;
  createdAt: string;
  shareCount: number;
  publicOptIn: boolean;
}

export interface CreateRoastResponse {
  record: RoastRecord;
  deleteToken: string;
}
