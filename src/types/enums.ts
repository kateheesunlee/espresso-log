export const TASTE_BALANCE_LABELS = [
  'Acidity',
  'Bitterness',
  'Body',
  'Aftertaste',
] as const;

export type TasteBalanceLabel = (typeof TASTE_BALANCE_LABELS)[number];

export const ROAST_LEVELS = [
  'Light',
  'Medium Light',
  'Medium',
  'Medium Dark',
  'Dark',
] as const;

export type RoastLevel = (typeof ROAST_LEVELS)[number];

export const AROMA_TAGS = [
  'dark chocolate',
  'milk chocolate',
  'cocoa',
  'caramel',
  'toffee',
  'molasses',
  'brown sugar',
  'almond',
  'hazelnut',
  'peanut',
  'walnut',
  'lemon',
  'orange',
  'grapefruit',
  'strawberry',
  'raspberry',
  'blueberry',
  'blackberry',
  'peach',
  'apricot',
  'plum',
  'mango',
  'pineapple',
  'papaya',
  'apple',
  'pear',
  'grape',
  'jasmine',
  'rose',
  'bergamot',
  'cinnamon',
  'clove',
  'cardamom',
  'honey',
  'vanilla',
  'smoky',
  'tobacco',
] as const;

export type AromaTag = (typeof AROMA_TAGS)[number];

export const TASTING_TAGS = [
  'balanced',
  'clean',
  'juicy',
  'sweet',
  'silky',
  'syrupy',
  'chocolatey',
  'caramelly',
  'fruity',
  'nutty',
  'under',
  'over',
  'sour',
  'sharp',
  'bitter',
  'burnt',
  'astringent',
  'harsh',
  'hollow',
  'thin',
  'watery',
  'thick',
  'heavy',
  'short finish',
  'long finish',
  'clean finish',
  'fast',
  'slow',
  'fine',
  'coarse',
  'high temp',
  'low temp',
] as const;

export type TastingTag = (typeof TASTING_TAGS)[number];
