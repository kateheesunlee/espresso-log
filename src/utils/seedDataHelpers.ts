import { Brand, Grinder, MachineModel, Producer, Roaster } from '@types';

/**
 * Convert a name to a kebab-case ID
 * @param name - The name to convert
 * @returns A kebab-case ID string
 */
export const nameToId = (name: string): string => {
  return (
    name
      .toLowerCase()
      .trim()
      // Replace spaces and common separators with hyphens
      .replace(/[\s_]+/g, '-')
      // Remove special characters except hyphens
      .replace(/[^a-z0-9-]/g, '')
      // Remove multiple consecutive hyphens
      .replace(/-+/g, '-')
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, '')
  );
};

/**
 * Find a brand by name (case-insensitive)
 * @param brands - Array of brands to search
 * @param name - The name to search for
 * @returns The matching brand or null
 */
export const findBrandByName = (
  brands: Brand[],
  name: string
): Brand | null => {
  const normalizedName = name.toLowerCase().trim();
  return (
    brands.find(
      b =>
        b.name.toLowerCase() === normalizedName ||
        b.aliases.some(alias => alias.toLowerCase() === normalizedName)
    ) || null
  );
};

/**
 * Find a grinder by name (case-insensitive)
 * @param grinders - Array of grinders to search
 * @param name - The name to search for
 * @returns The matching grinder or null
 */
export const findGrinderByName = (
  grinders: Grinder[],
  name: string
): Grinder | null => {
  const normalizedName = name.toLowerCase().trim();
  return (
    grinders.find(
      g =>
        g.name.toLowerCase() === normalizedName ||
        g.aliases.some(alias => alias.toLowerCase() === normalizedName)
    ) || null
  );
};

/**
 * Find a machine model by brand and name (case-insensitive)
 * @param models - Array of models to search
 * @param brandId - The brand ID
 * @param name - The model name to search for
 * @returns The matching model or null
 */
export const findMachineModelByName = (
  models: MachineModel[],
  brandId: string,
  name: string
): MachineModel | null => {
  const normalizedName = name.toLowerCase().trim();
  return (
    models.find(
      m =>
        m.brandId === brandId &&
        (m.name.toLowerCase() === normalizedName ||
          m.aliases.some(alias => alias.toLowerCase() === normalizedName))
    ) || null
  );
};

/**
 * Create a new user-entered brand
 * @param name - The brand name
 * @returns A new Brand object
 */
export const createUserBrand = (name: string): Brand => {
  const now = new Date().toISOString();
  return {
    id: `user-brand-${nameToId(name)}-${Date.now()}`,
    name,
    aliases: [],
    userEntered: true,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Create a new user-entered grinder
 * @param name - The grinder name
 * @returns A new Grinder object
 */
export const createUserGrinder = (name: string): Grinder => {
  const now = new Date().toISOString();
  return {
    id: `user-grinder-${nameToId(name)}-${Date.now()}`,
    name,
    aliases: [],
    userEntered: true,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Create a new user-entered machine model
 * @param brandId - The brand ID
 * @param name - The model name
 * @returns A new MachineModel object
 */
export const createUserMachineModel = (
  brandId: string,
  name: string
): MachineModel => {
  const now = new Date().toISOString();
  return {
    id: `user-model-${nameToId(name)}-${Date.now()}`,
    brandId,
    name,
    aliases: [],
    userEntered: true,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Create a new user-entered producer
 * @param name - The producer name
 * @returns A new Producer object
 */
export const createUserProducer = (name: string): Producer => {
  const now = new Date().toISOString();
  return {
    id: `user-producer-${nameToId(name)}-${Date.now()}`,
    name,
    aliases: [],
    userEntered: true,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Create a new user-entered roaster
 * @param name - The roaster name
 * @returns A new Roaster object
 */
export const createUserRoaster = (name: string): Roaster => {
  const now = new Date().toISOString();
  return {
    id: `user-roaster-${nameToId(name)}-${Date.now()}`,
    name,
    aliases: [],
    userEntered: true,
    createdAt: now,
    updatedAt: now,
  };
};
