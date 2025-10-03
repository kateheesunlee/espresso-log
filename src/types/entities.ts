import { RoastLevel, TastingTag } from "./enums";

export interface User {
  id: string;
  displayName?: string;
  createdAt: string;
}

export interface Machine {
  id: string;
  userId: string;
  brand: string;
  model: string;
  nickname?: string;
  grinder?: string;
  imageUri?: string;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bean {
  id: string;
  userId: string;
  name: string;
  origin?: string;
  process?: string;
  roastLevel?: RoastLevel;
  roastDate?: string;
  aromaTags?: string[]; // Don't use AromaTag type here to allow custom tags
  notes?: string;
  imageUri?: string;
  isFavorite?: boolean;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Shot {
  id: string;
  userId: string;
  beanId?: string;
  machineId?: string;
  grindSetting: number;
  dose_g: number;
  yield_g: number;
  shotTime_s: number;
  ratio?: number;
  waterTemp_C?: number;
  preinfusion_s?: number;
  rating?: number;
  acidity?: number;
  bitterness?: number;
  body?: number;
  aftertaste?: number;
  tags?: string[];
  aromaTags?: string[]; // Don't use AromaTag type here to allow custom tags
  tastingTags?: TastingTag[];
  notes?: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}
