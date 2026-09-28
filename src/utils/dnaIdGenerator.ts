/**
 * Universal Health DNA Passport Identifier System
 * Format: DNA-[COUNTRY]-[YEAR]-[SEQUENCE]
 * Sequence starts at 10025 and increments forward: 10026, 10027, 10028...
 * Example: DNA-PK-26-10025, DNA-PK-26-10026, DNA-US-26-10027
 */

export interface CountryOption {
  code: string;       // 2-3 letter ISO country code
  name: string;       // Full country name
  flag: string;       // Flag emoji
  dialCode: string;   // International dial code
  region: string;     // Geographic region
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dialCode: "+92", region: "South Asia" },
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1", region: "North America" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44", region: "Europe" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1", region: "North America" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dialCode: "+971", region: "Middle East" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966", region: "Middle East" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49", region: "Europe" },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33", region: "Europe" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91", region: "South Asia" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61", region: "Oceania" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dialCode: "+65", region: "Southeast Asia" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dialCode: "+60", region: "Southeast Asia" },
  { code: "JP", name: "Japan", flag: "🇯🇵", dialCode: "+81", region: "East Asia" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", dialCode: "+82", region: "East Asia" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", dialCode: "+41", region: "Europe" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", dialCode: "+90", region: "Eurasia" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dialCode: "+55", region: "South America" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", dialCode: "+27", region: "Africa" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", dialCode: "+20", region: "North Africa" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", dialCode: "+974", region: "Middle East" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", dialCode: "+965", region: "Middle East" },
  { code: "OM", name: "Oman", flag: "🇴🇲", dialCode: "+968", region: "Middle East" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", dialCode: "+31", region: "Europe" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dialCode: "+34", region: "Europe" },
  { code: "IT", name: "Italy", flag: "🇮🇹", dialCode: "+39", region: "Europe" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", dialCode: "+46", region: "Europe" },
  { code: "NO", name: "Norway", flag: "🇳🇴", dialCode: "+47", region: "Europe" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", dialCode: "+64", region: "Oceania" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", dialCode: "+353", region: "Europe" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", dialCode: "+52", region: "North America" },
  { code: "INT", name: "International (WHO / UN)", flag: "🌐", dialCode: "+1", region: "Global" },
];

const SEQUENCE_STORAGE_KEY = "health_dna_id_sequence_counter";
export const DEFAULT_STARTING_BASE_SEQUENCE = 10024; // Base: first increment yields 10025

/**
 * Extracts the maximum sequence number (>= 10024) from an array of patient DNA IDs.
 */
export function extractMaxSequenceFromIds(ids: string[]): number {
  let max = DEFAULT_STARTING_BASE_SEQUENCE;
  if (!ids || !Array.isArray(ids)) return max;

  for (const id of ids) {
    if (!id) continue;
    // Matches 5+ digit sequence numbers like DNA-PK-26-10025, DNA-US-26-10026
    const match = id.match(/(?:-|_|^)(\d{5,})(?:-|_|$)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num >= DEFAULT_STARTING_BASE_SEQUENCE && num > max) {
        max = num;
      }
    }
  }
  return max;
}

/**
 * Syncs the local sequence counter with existing patient IDs or server state.
 */
export function syncSequenceWithExisting(existingIds?: string[]) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(SEQUENCE_STORAGE_KEY);
    let currentStored = raw ? parseInt(raw, 10) : DEFAULT_STARTING_BASE_SEQUENCE;
    if (isNaN(currentStored) || currentStored < DEFAULT_STARTING_BASE_SEQUENCE) {
      currentStored = DEFAULT_STARTING_BASE_SEQUENCE;
    }

    let highestKnown = currentStored;
    if (existingIds && existingIds.length > 0) {
      const maxFromIds = extractMaxSequenceFromIds(existingIds);
      if (maxFromIds > highestKnown) {
        highestKnown = maxFromIds;
      }
    }

    localStorage.setItem(SEQUENCE_STORAGE_KEY, highestKnown.toString());
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Gets and persists the next incrementing sequence number for patient DNA identity.
 * Strictly starts at 10025, and continues forward: 10026, 10027, etc.
 */
export function getNextDnaSequence(existingIds?: string[]): number {
  try {
    let current = DEFAULT_STARTING_BASE_SEQUENCE;
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(SEQUENCE_STORAGE_KEY);
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed) && parsed >= DEFAULT_STARTING_BASE_SEQUENCE) {
          current = parsed;
        }
      }
    }

    if (existingIds && existingIds.length > 0) {
      const maxFromIds = extractMaxSequenceFromIds(existingIds);
      if (maxFromIds > current) {
        current = maxFromIds;
      }
    }

    const nextSeq = current + 1;
    if (typeof window !== "undefined") {
      localStorage.setItem(SEQUENCE_STORAGE_KEY, nextSeq.toString());
    }
    return nextSeq;
  } catch {
    return 10025;
  }
}

/**
 * Peeks at the next sequence number without incrementing (useful for real-time live preview).
 * Returns 10025 for first patient, 10026 for next, 10027, etc.
 */
export function peekNextDnaSequence(existingIds?: string[]): number {
  try {
    let current = DEFAULT_STARTING_BASE_SEQUENCE;
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(SEQUENCE_STORAGE_KEY);
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed) && parsed >= DEFAULT_STARTING_BASE_SEQUENCE) {
          current = parsed;
        }
      }
    }

    if (existingIds && existingIds.length > 0) {
      const maxFromIds = extractMaxSequenceFromIds(existingIds);
      if (maxFromIds > current) {
        current = maxFromIds;
      }
    }

    return current + 1;
  } catch {
    return 10025;
  }
}

/**
 * Formats a DNA identity string from country code, sequence number, and 2-digit year.
 * e.g. "DNA-PK-26-10025" or "DNA-US-26-10026"
 */
export function formatDnaId(
  countryCode: string,
  sequenceNumber: number,
  yearShort?: number
): string {
  const cleanCode = (countryCode || "PK").trim().toUpperCase().replace(/[^A-Z]/g, "") || "PK";
  const yy = yearShort !== undefined ? yearShort : (new Date().getFullYear() % 100);
  const paddedYear = yy.toString().padStart(2, "0");
  const formattedSeq = sequenceNumber.toString();
  return `DNA-${cleanCode}-${paddedYear}-${formattedSeq}`;
}

/**
 * Generates and increments a new official DNA ID based on selected country code.
 * Guarantees sequence starts at 10025 and increments forward: 10026, 10027, etc.
 */
export function generateNewDnaId(countryCode: string, existingIds?: string[]): string {
  const seq = getNextDnaSequence(existingIds);
  return formatDnaId(countryCode, seq);
}

/**
 * Returns a live preview string of the DNA ID for UI display before submission.
 */
export function previewDnaId(countryCode: string, existingIds?: string[]): string {
  const seq = peekNextDnaSequence(existingIds);
  return formatDnaId(countryCode, seq);
}

/**
 * Finds country metadata by code or name.
 */
export function getCountryByCode(code: string): CountryOption {
  const clean = (code || "PK").trim().toUpperCase();
  const match = SUPPORTED_COUNTRIES.find((c) => c.code === clean);
  return (
    match || {
      code: clean || "PK",
      name: clean || "Pakistan",
      flag: "🌐",
      dialCode: "+92",
      region: "Global",
    }
  );
}

// Background sync on module load to fetch the latest server sequence if available
if (typeof window !== "undefined") {
  fetch("/api/patients/next-sequence")
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && data.success && typeof data.currentMaxSequence === "number") {
        const stored = localStorage.getItem(SEQUENCE_STORAGE_KEY);
        const storedNum = stored ? parseInt(stored, 10) : DEFAULT_STARTING_BASE_SEQUENCE;
        if (data.currentMaxSequence > storedNum) {
          localStorage.setItem(SEQUENCE_STORAGE_KEY, data.currentMaxSequence.toString());
        }
      }
    })
    .catch(() => {});
}
