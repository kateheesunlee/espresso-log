import { Bean } from '@types';
import roastersSeed from '../data/roasters.json';
import { database } from '../database/UniversalDatabase';

/**
 * Formats a bean name for display.
 * - If bean has a roaster, formats as "roaster name"
 * - If bean is deleted, appends " (deleted)"
 * - If bean is null/undefined, returns "Unknown Bean"
 * - Uses roaster aliases from seed and local DB when available
 */
let cachedAliasMap: Record<string, string[]> | null = null;
let isLoadingAliases = false;

const buildAliasMap = (
  items: Array<{
    name: string;
    aliases: string[];
  }>
): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  for (const r of items) {
    if (!r?.name) continue;
    const key = r.name.toLowerCase();
    if (Array.isArray(r.aliases) && r.aliases.length > 0) {
      map[key] = r.aliases;
    }
  }
  return map;
};

// Initialize cache from seed data synchronously
const initCacheFromSeed = () => {
  if (cachedAliasMap) return;
  const seedItems = roastersSeed as Array<{
    name: string;
    aliases: string[];
  }>;
  cachedAliasMap = buildAliasMap(seedItems);
};

// Initialize cache immediately
initCacheFromSeed();

export const loadRoasterAliases = async (): Promise<void> => {
  if (isLoadingAliases) return;
  isLoadingAliases = true;
  try {
    // Seed data is already loaded synchronously in initCacheFromSeed
    // Only load additional data from database
    let dbItems: Array<{ name: string; aliases: string[] }> = [];
    try {
      dbItems = await database.getRoasters();
    } catch {
      dbItems = [];
    }

    // Merge database items with existing cache
    if (dbItems.length > 0) {
      const dbMap = buildAliasMap(dbItems);
      cachedAliasMap = { ...cachedAliasMap, ...dbMap };
    }
  } finally {
    isLoadingAliases = false;
  }
};

export const formatBeanName = (bean: Bean | null | undefined): string => {
  if (!bean) {
    return 'Unknown Bean';
  }

  // Lazy-load database aliases in background (seed data is already loaded)
  if (!isLoadingAliases) {
    // Fire-and-forget; callers can also call loadRoasterAliases() explicitly
    // to ensure database aliases are loaded
    setTimeout(() => {
      loadRoasterAliases().catch(() => {});
    }, 0);
  }

  let roasterDisplay = bean.roaster;
  if (bean.roaster && cachedAliasMap) {
    const key = bean.roaster.toLowerCase();
    const aliases = cachedAliasMap[bean.roaster] || cachedAliasMap[key];

    if (aliases && aliases.length > 0 && aliases[0]) {
      roasterDisplay = aliases[0];
    }
  }

  let name = roasterDisplay ? `${roasterDisplay} · ${bean.name}` : bean.name;

  if (bean.deleted) {
    name += ' (deleted)';
  }

  return name;
};
