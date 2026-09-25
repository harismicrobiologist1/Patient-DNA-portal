/**
 * Universal Health DNA Passport Identifier System
 * Format: DNA-[COUNTRY]-[YEAR]-[SEQUENCE]
 * Example: DNA-US-26-10026, DNA-PK-26-10026, DNA-GB-26-10026
 */

export interface CountryOption {
  code: string;       // 2-3 letter ISO country code
  name: string;       // Full country name
  flag: string;       // Flag emoji
  dialCode: string;   // International dial code
  region: string;     // Geographic region
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1", region: "North America" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44", region: "Europe" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dialCode: "+92", region: "South Asia" },
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
const DEFAULT_STARTING_SEQUENCE = 10024; // Starts from 10025 next

/**
 * Gets and persists the next incrementing sequence number for patient DNA identity.
 */
export function getNextDnaSequence(): number {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(SEQUENCE_STORAGE_KEY) : null;
    let current = raw ? parseInt(raw, 10) : DEFAULT_STARTING_SEQUENCE;
    if (isNaN(current) || current < DEFAULT_STARTING_SEQUENCE) {
      current = DEFAULT_STARTING_SEQUENCE;
    }
    const nextSeq = current + 1;
    if (typeof window !== "undefined") {
      localStorage.setItem(SEQUENCE_STORAGE_KEY, nextSeq.toString());
    }
    return nextSeq;
  } catch {
    return Math.floor(10025 + Math.random() * 9000);
  }
}

/**
 * Peeks at the next sequence number without incrementing (useful for real-time live preview).
 */
export function peekNextDnaSequence(): number {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(SEQUENCE_STORAGE_KEY) : null;
    let current = raw ? parseInt(raw, 10) : DEFAULT_STARTING_SEQUENCE;
    if (isNaN(current) || current < DEFAULT_STARTING_SEQUENCE) {
      current = DEFAULT_STARTING_SEQUENCE;
    }
    return current + 1;
  } catch {
    return DEFAULT_STARTING_SEQUENCE + 1;
  }
}

/**
 * Formats a DNA identity string from country code, sequence number, and 2-digit year.
 * e.g. "DNA-PK-26-10025" or "DNA-US-26-10025"
 */
export function formatDnaId(
  countryCode: string,
  sequenceNumber: number,
  yearShort?: number
): string {
  const cleanCode = (countryCode || "US").trim().toUpperCase().replace(/[^A-Z]/g, "") || "US";
  const yy = yearShort !== undefined ? yearShort : (new Date().getFullYear() % 100);
  const paddedYear = yy.toString().padStart(2, "0");
  const formattedSeq = sequenceNumber.toString().padStart(5, "0");
  return `DNA-${cleanCode}-${paddedYear}-${formattedSeq}`;
}

/**
 * Generates and increments a new official DNA ID based on selected country code.
 */
export function generateNewDnaId(countryCode: string): string {
  const seq = getNextDnaSequence();
  return formatDnaId(countryCode, seq);
}

/**
 * Returns a live preview string of the DNA ID for UI display before submission.
 */
export function previewDnaId(countryCode: string): string {
  const seq = peekNextDnaSequence();
  return formatDnaId(countryCode, seq);
}

/**
 * Finds country metadata by code or name.
 */
export function getCountryByCode(code: string): CountryOption {
  const clean = code.trim().toUpperCase();
  const match = SUPPORTED_COUNTRIES.find((c) => c.code === clean);
  return (
    match || {
      code: clean || "US",
      name: clean || "United States",
      flag: "🌐",
      dialCode: "+1",
      region: "Global",
    }
  );
}
