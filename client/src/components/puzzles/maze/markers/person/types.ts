export type HairStyle = 'short' | 'long' | 'bun' | 'ponytail' | 'bald' | 'tuft' | 'curly' | 'spiky' | 'pigtails';
export type BeardStyle = 'short' | 'full' | 'long';
export type Headwear = 'veil' | 'headcloth' | 'crown' | 'cap' | 'headband' | 'turban';
export type Outfit = 'shirt' | 'robe' | 'onesie' | 'dress' | 'hoodie';
export type Accessory =
  | 'staff'
  | 'tablets'
  | 'sling'
  | 'pacifier'
  | 'glasses'
  | 'cane'
  | 'dove'
  | 'scroll'
  | 'wheat'
  | 'fish'
  | 'key'
  | 'lion'
  | 'lamb'
  | 'backpack';

export interface PersonSpec {
  background: string;
  skin: string;
  /** Head size relative to an adult (babies and kids have bigger heads). */
  headScale?: number;
  hair?: { style: HairStyle; color: string };
  beard?: { style: BeardStyle; color: string };
  /** Light eyebrows for older people. */
  brows?: string;
  outfit: { style: Outfit; color: string; trim?: string };
  headwear?: { style: Headwear; color: string; accent?: string };
  accessories?: Accessory[];
  cheeks?: boolean;
}

export interface Head {
  cx: number;
  cy: number;
  r: number;
}
