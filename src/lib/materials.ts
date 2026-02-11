export const MATERIAL_CODES: Record<number, string> = {
  0x00807665: 'PLA',
  0x80698471: 'PETG',
  0x00656683: 'ABS',
  0x00848085: 'TPU',
  0x00008065: 'PA',
  0x00678069: 'CPE',
  0x00008067: 'PC',
  0x00808665: 'PVA',
  0x00658365: 'ASA',
  0x42564F48: 'BVOH',
  0x00455641: 'EVA',
  0x48495053: 'HIPS',
  0x00005050: 'PP',
  0x00505041: 'PPA',
  0x00505053: 'PPS',
};

export const MATERIAL_CODES_REVERSE: Record<string, number> = Object.entries(
  MATERIAL_CODES
).reduce((acc, [code, name]) => {
  acc[name] = parseInt(code) >>> 0; // Convert to unsigned 32-bit
  return acc;
}, {} as Record<string, number>);

export const SUBTYPE_CODES: Record<number, string> = {
  // PLA Family (0x00XX)
  0x0000: 'PLA',
  0x0001: 'PLA+',
  0x0002: 'PLA Pro',
  0x0003: 'PLA Silk',
  0x0004: 'PLA-CF',
  0x0005: 'PLA Carbon',
  0x0006: 'PLA Matte',
  0x0007: 'PLA Fluo',
  0x0008: 'PLA Wood',
  0x0009: 'PLA Basic',
  0x000A: 'RAPID PLA+',
  0x000B: 'PLA Marble',
  0x000C: 'PLA Galaxy',
  0x000D: 'PLA Red Copper',
  0x000E: 'PLA Sparkle',
  // PETG Family (0x01XX)
  0x0100: 'PETG',
  0x0101: 'PETG-CF',
  0x0102: 'PETG-GF',
  0x0103: 'PETG Pro',
  0x0104: 'PETG Translucent',
  0x0105: 'RAPID PETG',
  // ABS Family (0x02XX)
  0x0200: 'ABS',
  0x0201: 'ABS-GF',
  // TPU Family (0x03XX)
  0x0300: 'TPU',
  0x0301: 'TPU 95A',
  0x0302: 'RAPID TPU 95A',
  // PA Family (0x04XX)
  0x0400: 'PA',
  0x0401: 'PA-CF',
  0x0403: 'PAHT-CF',
  0x0404: 'PA6',
  0x0405: 'PA6-CF',
  0x0406: 'PA12',
  0x0407: 'PA12-CF',
  // Other Materials
  0x0500: 'CPE',
  0x0600: 'PC',
  0x0601: 'PCTG',
  0x0602: 'PC-FR',
  0x0700: 'PVA',
  0x0800: 'ASA',
  0x0900: 'BVOH',
  0x0A00: 'EVA',
  0x0B00: 'HIPS',
  0x0C00: 'PP',
  0x0C01: 'PP-CF',
  0x0C02: 'PP-GF',
  0x0D00: 'PPA',
  0x0D01: 'PPA-CF',
  0x0D02: 'PPA-GF',
  0x0E00: 'PPS',
  0x0E02: 'PPS-CF',
};

export const SUBTYPE_CODES_REVERSE: Record<string, number> = Object.entries(
  SUBTYPE_CODES
).reduce((acc, [code, name]) => {
  acc[name] = parseInt(code);
  return acc;
}, {} as Record<string, number>);

export const MATERIAL_FAMILIES: Record<string, number> = {
  PLA: 0x00,
  PETG: 0x01,
  ABS: 0x02,
  TPU: 0x03,
  PA: 0x04,
  CPE: 0x05,
  PC: 0x06,
  PVA: 0x07,
  ASA: 0x08,
  BVOH: 0x09,
  EVA: 0x0A,
  HIPS: 0x0B,
  PP: 0x0C,
  PPA: 0x0D,
  PPS: 0x0E,
};

export function getAllMaterials(): string[] {
  return Object.values(MATERIAL_CODES).sort();
}

export function getSubtypesForMaterial(material: string): string[] {
  const familyCode = MATERIAL_FAMILIES[material];
  if (familyCode === undefined) return [];

  return Object.entries(SUBTYPE_CODES)
    .filter(([code]) => (parseInt(code) >> 8) === familyCode)
    .map(([, name]) => name)
    .sort();
}

/**
 * Given a subtype name (e.g. "PLA Matte"), return the parent material family (e.g. "PLA").
 * Returns null if the subtype is not recognized.
 */
export function getMaterialForSubtype(subtype: string): string | null {
  const subtypeCode = SUBTYPE_CODES_REVERSE[subtype];
  if (subtypeCode === undefined) return null;
  const familyCode = subtypeCode >> 8;
  const familyEntry = Object.entries(MATERIAL_FAMILIES).find(([, code]) => code === familyCode);
  return familyEntry ? familyEntry[0] : null;
}

// --- Fuzzy matching for manufacturer catalog material names ---

/** Synonym map: catalog word → system word */
const SYNONYMS: Record<string, string> = {
  professional: 'pro',
  nylon: 'pa',
  glow: 'fluo',
  'pro+': 'pro',
};

/** Prefixes that can be stripped without changing the base material meaning */
const STRIP_PREFIXES = ['super', 'easy', 'air', 'high speed', 'rock'];

/** All known subtype names, lowercased → original name */
const SUBTYPE_LOWER_MAP: Record<string, string> = Object.keys(SUBTYPE_CODES_REVERSE).reduce(
  (acc, name) => {
    acc[name.toLowerCase()] = name;
    return acc;
  },
  {} as Record<string, string>,
);

/** All known subtype names, sorted words (lowercased) → original name */
const SUBTYPE_SORTED_MAP: Record<string, string> = Object.keys(SUBTYPE_CODES_REVERSE).reduce(
  (acc, name) => {
    const sorted = name.toLowerCase().split(/\s+/).sort().join(' ');
    acc[sorted] = name;
    return acc;
  },
  {} as Record<string, string>,
);

/** All known base material family names */
const BASE_MATERIALS = Object.keys(MATERIAL_FAMILIES);

/**
 * Helper: given a resolved subtype name, return { subtype, material } or null.
 */
function resolveSubtype(subtypeName: string): { subtype: string; material: string } | null {
  const family = getMaterialForSubtype(subtypeName);
  if (!family) return null;
  return { subtype: subtypeName, material: family };
}

/**
 * Fuzzy-match a manufacturer catalog material name to a system subtype.
 *
 * Tries progressively looser strategies:
 *   1. Exact match
 *   2. Case-insensitive match
 *   3. Word-order-insensitive match (sorted words)
 *   4. Synonym replacement + retry steps 2-3
 *   5. Strip filler prefixes + retry steps 2-3
 *   6. Base material fallback (extract PLA/PETG/ABS/etc.)
 */
export function fuzzyMatchSubtype(
  catalogMaterial: string,
): { subtype: string; material: string } | null {
  // 1. Exact match
  if (SUBTYPE_CODES_REVERSE[catalogMaterial] !== undefined) {
    return resolveSubtype(catalogMaterial);
  }

  const lower = catalogMaterial.toLowerCase();

  // 2. Case-insensitive
  if (SUBTYPE_LOWER_MAP[lower]) {
    return resolveSubtype(SUBTYPE_LOWER_MAP[lower]);
  }

  // 3. Word-order-insensitive
  const sorted = lower.split(/\s+/).sort().join(' ');
  if (SUBTYPE_SORTED_MAP[sorted]) {
    return resolveSubtype(SUBTYPE_SORTED_MAP[sorted]);
  }

  // 4. Synonym replacement
  const synonymized = lower
    .split(/\s+/)
    .map((w) => SYNONYMS[w] || w)
    .join(' ');
  if (synonymized !== lower) {
    if (SUBTYPE_LOWER_MAP[synonymized]) {
      return resolveSubtype(SUBTYPE_LOWER_MAP[synonymized]);
    }
    const synonymSorted = synonymized.split(/\s+/).sort().join(' ');
    if (SUBTYPE_SORTED_MAP[synonymSorted]) {
      return resolveSubtype(SUBTYPE_SORTED_MAP[synonymSorted]);
    }
  }

  // 5. Strip filler prefixes and retry
  let stripped = lower;
  for (const prefix of STRIP_PREFIXES) {
    if (stripped.startsWith(prefix + ' ')) {
      stripped = stripped.slice(prefix.length + 1);
    }
  }
  if (stripped !== lower) {
    if (SUBTYPE_LOWER_MAP[stripped]) {
      return resolveSubtype(SUBTYPE_LOWER_MAP[stripped]);
    }
    const strippedSorted = stripped.split(/\s+/).sort().join(' ');
    if (SUBTYPE_SORTED_MAP[strippedSorted]) {
      return resolveSubtype(SUBTYPE_SORTED_MAP[strippedSorted]);
    }
  }

  // 6. Base material fallback — find longest matching material family name
  const upperInput = catalogMaterial.toUpperCase();
  let bestBase: string | null = null;
  for (const base of BASE_MATERIALS) {
    const regex = new RegExp('\\b' + base + '\\b', 'i');
    if (regex.test(upperInput)) {
      if (!bestBase || base.length > bestBase.length) {
        bestBase = base;
      }
    }
  }
  if (bestBase) {
    // Return the base material as both the subtype and family
    return { subtype: bestBase, material: bestBase };
  }

  return null;
}
