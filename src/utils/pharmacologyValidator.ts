import {
  PHARMACEUTICAL_DICTIONARY,
  OFFICIAL_DRUG_STEMS,
  NON_PHARMACEUTICAL_COMMON_WORDS,
  KNOWN_DRUG_SHORTCUTS,
  PharmacologicalEntity,
} from "../data/pharmaceuticalDictionary";

export interface DrugValidationResult {
  isValid: boolean;
  isShortcut?: boolean;
  shortcutDetected?: string;
  expandedFullName?: string;
  matchedEntity?: PharmacologicalEntity;
  detectedName: string;
  genericName?: string;
  activeIngredient?: string;
  drugClass?: string;
  category?: string;
  rejectionReason?: string;
  suggestedDrugs: string[];
  isStemMatch?: boolean;
}

export function validatePharmaceuticalEntity(query: string): DrugValidationResult {
  const clean = (query || "").trim().toLowerCase();
  
  if (!clean || clean.length < 2) {
    return {
      isValid: false,
      isShortcut: false,
      detectedName: query,
      rejectionReason: "Search input is empty or too short. Please type the full name of a medication.",
      suggestedDrugs: [
        "Amoxicillin (Beta-Lactam Antibiotic)",
        "Paracetamol (Analgesic & Antipyretic)",
        "Metformin (Biguanide Antidiabetic)",
        "Atorvastatin (HMG-CoA Statin)",
        "Ciprofloxacin (Fluoroquinolone)",
        "Augmentin (Penicillin + Clavulanate)"
      ],
    };
  }

  // 1. Direct Non-Medical / Non-Drug word check
  if (NON_PHARMACEUTICAL_COMMON_WORDS.has(clean)) {
    return {
      isValid: false,
      isShortcut: false,
      detectedName: query,
      rejectionReason: `"${query}" is an everyday word/object or symptom, not a registered pharmaceutical medication or active pharmacological ingredient.`,
      suggestedDrugs: [
        "Amoxicillin (Beta-Lactam Antibiotic)",
        "Paracetamol (Analgesic & Antipyretic)",
        "Metformin (Biguanide Antidiabetic)",
        "Atorvastatin (HMG-CoA Statin)",
        "Ciprofloxacin (Fluoroquinolone)",
        "Augmentin (Penicillin + Clavulanate)"
      ],
    };
  }

  // 2. Explicit Drug Shortcut / Abbreviation Check
  if (KNOWN_DRUG_SHORTCUTS[clean]) {
    const shortcutEntry = KNOWN_DRUG_SHORTCUTS[clean];
    return {
      isValid: false,
      isShortcut: true,
      shortcutDetected: clean,
      expandedFullName: shortcutEntry.primaryFullName,
      detectedName: query,
      rejectionReason: `Shortcut/abbreviation "${query}" detected. Clinical pharmacology diagnostics require the full official generic name or full brand name (e.g., "${shortcutEntry.primaryFullName}" instead of "${query}").`,
      suggestedDrugs: shortcutEntry.expandedNames,
    };
  }

  // 3. Exact Full Match in Verified PHARMACEUTICAL_DICTIONARY
  for (const drug of PHARMACEUTICAL_DICTIONARY) {
    // Exact match on Full Name
    if (drug.name.toLowerCase() === clean) {
      return {
        isValid: true,
        isShortcut: false,
        matchedEntity: drug,
        detectedName: drug.name,
        genericName: drug.genericName,
        activeIngredient: drug.activeIngredient,
        drugClass: drug.drugClass,
        category: drug.category,
        suggestedDrugs: [],
      };
    }

    // Exact match on Full Generic Name
    if (drug.genericName.toLowerCase() === clean) {
      return {
        isValid: true,
        isShortcut: false,
        matchedEntity: drug,
        detectedName: drug.name,
        genericName: drug.genericName,
        activeIngredient: drug.activeIngredient,
        drugClass: drug.drugClass,
        category: drug.category,
        suggestedDrugs: [],
      };
    }

    // Exact match on Full Active Ingredient
    if (drug.activeIngredient.toLowerCase() === clean) {
      return {
        isValid: true,
        isShortcut: false,
        matchedEntity: drug,
        detectedName: drug.name,
        genericName: drug.genericName,
        activeIngredient: drug.activeIngredient,
        drugClass: drug.drugClass,
        category: drug.category,
        suggestedDrugs: [],
      };
    }

    // Exact match on Full Brand Name
    const exactBrandMatch = drug.brandNames.find((b) => b.toLowerCase() === clean);
    if (exactBrandMatch) {
      return {
        isValid: true,
        isShortcut: false,
        matchedEntity: drug,
        detectedName: `${exactBrandMatch} (${drug.genericName})`,
        genericName: drug.genericName,
        activeIngredient: drug.activeIngredient,
        drugClass: drug.drugClass,
        category: drug.category,
        suggestedDrugs: [],
      };
    }
  }

  // 4. Check if query is a Stem-Only input (e.g. user typed "cillin", "statin", "prazole")
  const exactStem = OFFICIAL_DRUG_STEMS.find((s) => s.stem.toLowerCase() === clean);
  if (exactStem) {
    return {
      isValid: false,
      isShortcut: true,
      shortcutDetected: clean,
      detectedName: query,
      rejectionReason: `"${query}" is a pharmacological suffix/class stem (${exactStem.class}), not a complete drug name. Please enter a specific complete medication name.`,
      suggestedDrugs: PHARMACEUTICAL_DICTIONARY.filter(d => d.drugClass.toLowerCase().includes(exactStem.stem) || d.name.toLowerCase().includes(exactStem.stem))
        .map(d => `${d.name} (${d.drugClass})`)
        .slice(0, 5),
    };
  }

  // 5. Partial Prefix / Substring Check -> Flag as Incomplete Shortcut / Fragment
  const partialMatches = PHARMACEUTICAL_DICTIONARY.filter((d) => {
    const nameMatch = d.name.toLowerCase().startsWith(clean);
    const genericMatch = d.genericName.toLowerCase().startsWith(clean);
    const brandMatch = d.brandNames.some((b) => b.toLowerCase().startsWith(clean));
    return nameMatch || genericMatch || brandMatch;
  });

  if (partialMatches.length > 0) {
    const primaryMatch = partialMatches[0];
    return {
      isValid: false,
      isShortcut: true,
      shortcutDetected: clean,
      expandedFullName: primaryMatch.name,
      detectedName: query,
      rejectionReason: `Incomplete drug name "${query}" detected. Please search or select the complete full pharmaceutical name (e.g., "${primaryMatch.name}").`,
      suggestedDrugs: partialMatches.map((d) => `${d.name} (${d.drugClass})`).slice(0, 6),
    };
  }

  // 6. Check Official Pharmacological INN/USAN Stems for full unlisted molecules (must be >= 7 chars and end with stem)
  for (const stemObj of OFFICIAL_DRUG_STEMS) {
    if (clean.endsWith(stemObj.stem) && clean.length >= stemObj.stem.length + 3) {
      // Must be a complete compound word, not purely digits or shortcut
      const capitalized = query.charAt(0).toUpperCase() + query.slice(1);
      return {
        isValid: true,
        isShortcut: false,
        detectedName: capitalized,
        genericName: capitalized,
        activeIngredient: capitalized,
        drugClass: stemObj.class,
        category: stemObj.isAntibiotic ? "Antibiotic / Antimicrobial" : "Other Therapeutic",
        isStemMatch: true,
        suggestedDrugs: [],
      };
    }
  }

  // 7. General Rejection for unverified / non-full input
  return {
    isValid: false,
    isShortcut: false,
    detectedName: query,
    rejectionReason: `"${query}" is not recognized as a registered full pharmaceutical generic or brand medication. Please enter the complete official medicine name.`,
    suggestedDrugs: [
      "Amoxicillin (Beta-Lactam Antibiotic)",
      "Paracetamol (Analgesic & Antipyretic)",
      "Metformin (Biguanide Antidiabetic)",
      "Atorvastatin (HMG-CoA Statin)",
      "Ciprofloxacin (Fluoroquinolone Antimicrobial)",
      "Augmentin (Penicillin + Clavulanate)",
    ],
  };
}

export function getAutocompleteSuggestions(input: string): PharmacologicalEntity[] {
  const clean = (input || "").trim().toLowerCase();
  if (!clean || clean.length < 2) return [];

  return PHARMACEUTICAL_DICTIONARY.filter(
    (drug) =>
      drug.name.toLowerCase().startsWith(clean) ||
      drug.genericName.toLowerCase().startsWith(clean) ||
      drug.brandNames.some((b) => b.toLowerCase().startsWith(clean)) ||
      drug.name.toLowerCase().includes(clean) ||
      drug.genericName.toLowerCase().includes(clean) ||
      drug.brandNames.some((b) => b.toLowerCase().includes(clean)) ||
      drug.drugClass.toLowerCase().includes(clean)
  ).slice(0, 8);
}
