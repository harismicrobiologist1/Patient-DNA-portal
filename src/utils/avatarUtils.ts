// Standard Professional Vector Character Avatars
// Matching the clean minimalist corporate portrait style:
// 1. Male in Suit: Sharp black blazer, crisp white collared shirt, and vibrant red tie
// 2. Female in Hijab: Graceful draped hijab framing the face with sharp professional blazer
// 3. Female in Suit: Styled dark hair, sharp black blazer with clean white inner top

export const MALE_SYMBOL_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <style>
      @keyframes breathe {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-2px); }
      }
      @keyframes auraGlow {
        0%, 100% { stroke-opacity: 0.3; }
        50% { stroke-opacity: 0.8; }
      }
      .character-group {
        transform-origin: 120px 160px;
        animation: breathe 3.6s ease-in-out infinite;
      }
      .ring-pulse {
        animation: auraGlow 3s ease-in-out infinite;
      }
    </style>
    <filter id="avatarShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Circular Avatar Badge with Clean Medical Rim -->
  <circle cx="120" cy="120" r="108" fill="#e2e8f0" stroke="#ffffff" stroke-width="4.5" filter="url(#avatarShadow)"/>
  <circle cx="120" cy="120" r="102" fill="#edf2f7"/>
  <circle cx="120" cy="120" r="102" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6 4" className="ring-pulse"/>

  <!-- Man in Suit Character -->
  <g className="character-group">
    <!-- Black Suit Blazer -->
    <path d="M 38 224 L 38 200 C 38 162, 68 144, 98 139 L 108 178 L 120 188 L 132 178 L 142 139 C 172 144, 202 162, 202 200 L 202 224 Z" fill="#18191c"/>

    <!-- White Collared Dress Shirt -->
    <polygon points="98,139 120,195 142,139 135,124 105,124" fill="#ffffff"/>

    <!-- Neck -->
    <polygon points="105,110 105,134 120,150 135,134 135,110" fill="#f5d0b5"/>
    <!-- Subtle Chin Shadow -->
    <path d="M 105 112 C 112 123, 128 123, 135 112 L 135 120 C 128 131, 112 131, 105 120 Z" fill="#e5bfa4"/>

    <!-- Red Tie Knot -->
    <polygon points="113,141 127,141 125,154 120,157 115,154" fill="#dc2626"/>
    <!-- Red Tie Blade -->
    <polygon points="115,154 125,154 130,198 120,214 110,198" fill="#ef4444"/>
    <polygon points="120,157 125,154 130,198 120,214" fill="#dc2626"/>

    <!-- White Shirt Collars -->
    <polygon points="97,139 107,123 115,145" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <polygon points="143,139 133,123 125,145" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>

    <!-- Suit Lapels -->
    <path d="M 72 152 L 98 139 L 109 178 L 88 185 Z" fill="#25272c"/>
    <path d="M 168 152 L 142 139 L 131 178 L 152 185 Z" fill="#25272c"/>

    <!-- Left Ear -->
    <path d="M 77 84 C 69 84, 69 105, 77 105 Z" fill="#f5d0b5"/>
    <path d="M 76 89 C 73 89, 73 99, 76 99" stroke="#e5bfa4" stroke-width="2" fill="none" stroke-linecap="round"/>

    <!-- Right Ear -->
    <path d="M 163 84 C 171 84, 171 105, 163 105 Z" fill="#f5d0b5"/>
    <path d="M 164 89 C 167 89, 167 99, 164 99" stroke="#e5bfa4" stroke-width="2" fill="none" stroke-linecap="round"/>

    <!-- Faceless Head Contour -->
    <path d="M 79 82 C 79 48, 161 48, 161 82 C 161 114, 143 128, 120 128 C 97 128, 79 114, 79 82 Z" fill="#f5d0b5"/>

    <!-- Styled Dark Hair with Side Parting -->
    <path d="M 76 84 C 76 42, 102 30, 128 30 C 158 30, 166 50, 166 84 C 166 94, 163 104, 160 107 C 160 82, 155 64, 144 54 C 130 44, 108 50, 90 66 C 83 73, 80 86, 80 107 C 77 104, 76 94, 76 84 Z" fill="#282a30"/>
    <!-- Sweeping Front Bangs -->
    <path d="M 86 54 C 102 44, 128 44, 146 58 C 156 66, 160 78, 160 78 C 148 66, 130 60, 112 64 C 98 68, 88 80, 88 80 C 88 80, 82 66, 86 54 Z" fill="#282a30"/>
  </g>
</svg>
`)}`;

export const FEMALE_HIJAB_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <style>
      @keyframes breatheF {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-2px); }
      }
      @keyframes auraGlowF {
        0%, 100% { stroke-opacity: 0.3; }
        50% { stroke-opacity: 0.8; }
      }
      .character-group-f {
        transform-origin: 120px 160px;
        animation: breatheF 3.6s ease-in-out infinite;
      }
      .ring-pulse-f {
        animation: auraGlowF 3s ease-in-out infinite;
      }
    </style>
    <filter id="avatarShadowF" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Circular Avatar Badge with Clean Medical Rim -->
  <circle cx="120" cy="120" r="108" fill="#e2e8f0" stroke="#ffffff" stroke-width="4.5" filter="url(#avatarShadowF)"/>
  <circle cx="120" cy="120" r="102" fill="#edf2f7"/>
  <circle cx="120" cy="120" r="102" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6 4" className="ring-pulse-f"/>

  <!-- Female in Hijab Character -->
  <g className="character-group-f">
    <!-- Black Suit Blazer -->
    <path d="M 38 224 L 38 200 C 38 162, 66 145, 96 140 L 108 178 L 120 188 L 132 178 L 144 140 C 174 145, 202 162, 202 200 L 202 224 Z" fill="#18191c"/>

    <!-- White Inner V-Top -->
    <polygon points="98,140 120,188 142,140 135,130 105,130" fill="#ffffff"/>

    <!-- Blazer Lapels -->
    <path d="M 72 154 L 98 140 L 109 178 L 88 185 Z" fill="#25272c"/>
    <path d="M 168 154 L 142 140 L 131 178 L 152 185 Z" fill="#25272c"/>

    <!-- Graceful Draped Hijab Outer Volume -->
    <path d="M 52 224 C 52 184, 70 148, 86 132 C 70 114, 68 82, 74 62 C 82 34, 106 28, 120 28 C 134 28, 158 34, 166 62 C 172 82, 170 114, 154 132 C 170 148, 188 184, 188 224 Z" fill="#282a30"/>

    <!-- Hijab Cascade Folds across Chest & Neck -->
    <path d="M 84 134 C 104 158, 136 158, 156 134 C 146 166, 94 166, 84 134 Z" fill="#1e2024"/>
    <path d="M 92 142 Q 120 160 148 142" stroke="#374151" stroke-width="2" fill="none" opacity="0.6"/>

    <!-- Faceless Head Opening Framed Gracefully by the Hijab -->
    <path d="M 90 74 C 90 56, 150 56, 150 74 C 150 108, 138 126, 120 126 C 102 126, 90 108, 90 74 Z" fill="#f5d0b5"/>

    <!-- Hijab Chin Wrap Contour with Subtle Shadow -->
    <path d="M 90 114 C 102 126, 138 126, 150 114 C 144 132, 96 132, 90 114 Z" fill="#282a30"/>
    <path d="M 92 114 C 104 124, 136 124, 148 114" stroke="#18191c" stroke-width="2.5" fill="none"/>

    <!-- Soft Forehead Undercap Band -->
    <path d="M 94 68 C 104 62, 136 62, 146 68 C 144 72, 96 72, 94 68 Z" fill="#ffffff" opacity="0.9"/>
  </g>
</svg>
`)}`;

export const FEMALE_SYMBOL_AVATAR = FEMALE_HIJAB_AVATAR;

export const FEMALE_BLAZER_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <style>
      @keyframes breatheW {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-2px); }
      }
      @keyframes auraGlowW {
        0%, 100% { stroke-opacity: 0.3; }
        50% { stroke-opacity: 0.8; }
      }
      .character-group-w {
        transform-origin: 120px 160px;
        animation: breatheW 3.6s ease-in-out infinite;
      }
      .ring-pulse-w {
        animation: auraGlowW 3s ease-in-out infinite;
      }
    </style>
    <filter id="avatarShadowW" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Circular Avatar Badge with Clean Medical Rim -->
  <circle cx="120" cy="120" r="108" fill="#e2e8f0" stroke="#ffffff" stroke-width="4.5" filter="url(#avatarShadowW)"/>
  <circle cx="120" cy="120" r="102" fill="#edf2f7"/>
  <circle cx="120" cy="120" r="102" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6 4" className="ring-pulse-w"/>

  <!-- Female in Blazer Character (Exact match to reference left avatar) -->
  <g className="character-group-w">
    <!-- Black Suit Blazer -->
    <path d="M 38 224 L 38 200 C 38 162, 68 144, 98 139 L 108 178 L 120 188 L 132 178 L 142 139 C 172 144, 202 162, 202 200 L 202 224 Z" fill="#18191c"/>

    <!-- White Inner Scoop Top -->
    <path d="M 98 139 L 120 186 L 142 139 C 136 128, 104 128, 98 139 Z" fill="#ffffff"/>

    <!-- Neck & Chest -->
    <path d="M 104 108 L 104 132 C 104 150, 136 150, 136 132 L 136 108 Z" fill="#f5d0b5"/>
    <path d="M 104 112 C 112 122, 128 122, 136 112 L 136 118 C 128 128, 112 128, 104 118 Z" fill="#e5bfa4"/>

    <!-- Blazer Lapels -->
    <path d="M 72 152 L 98 139 L 109 178 L 88 185 Z" fill="#25272c"/>
    <path d="M 168 152 L 142 139 L 131 178 L 152 185 Z" fill="#25272c"/>

    <!-- Left Ear -->
    <path d="M 77 84 C 69 84, 69 105, 77 105 Z" fill="#f5d0b5"/>
    <!-- Right Ear -->
    <path d="M 163 84 C 171 84, 171 105, 163 105 Z" fill="#f5d0b5"/>

    <!-- Faceless Head Contour -->
    <path d="M 79 82 C 79 48, 161 48, 161 82 C 161 114, 143 128, 120 128 C 97 128, 79 114, 79 82 Z" fill="#f5d0b5"/>

    <!-- Voluminous Styled Dark Hair (Framing face and shoulders exactly like reference image) -->
    <path d="M 74 84 C 74 44, 98 32, 120 32 C 142 32, 166 44, 166 84 C 174 96, 174 126, 166 142 C 160 148, 150 146, 146 136 C 146 110, 154 94, 154 78 C 154 62, 138 52, 120 52 C 102 52, 86 62, 86 78 C 86 94, 94 110, 94 136 C 90 146, 80 148, 74 142 C 66 126, 66 96, 74 84 Z" fill="#282a30"/>
    <!-- Front bangs curve -->
    <path d="M 88 56 C 104 46, 134 48, 148 62 C 144 68, 124 58, 108 62 C 96 66, 88 78, 88 78 Z" fill="#282a30"/>
  </g>
</svg>
`)}`;

/**
 * Returns the default avatar based on gender (Male or Female in Hijab)
 */
export function getDefaultAvatar(gender?: string): string {
  const g = (gender || "").toLowerCase().trim();
  if (g.startsWith("female") || g === "f") {
    return FEMALE_HIJAB_AVATAR;
  }
  return MALE_SYMBOL_AVATAR;
}

/**
 * Standard preset avatars matching the clean corporate vector aesthetic
 */
export const PRESET_SYMBOL_AVATARS = [
  {
    id: "avatar-male",
    gender: "Male",
    label: "Professional Man",
    sublabel: "Suit & Red Tie Portrait",
    url: MALE_SYMBOL_AVATAR,
    badgeColor: "bg-blue-600 text-white",
  },
  {
    id: "avatar-female-hijab",
    gender: "Female",
    label: "Female in Hijab",
    sublabel: "Graceful Hijab & Suit Portrait",
    url: FEMALE_HIJAB_AVATAR,
    badgeColor: "bg-teal-600 text-white",
  },
  {
    id: "avatar-female-suit",
    gender: "Female",
    label: "Professional Woman",
    sublabel: "Styled Hair & Suit Portrait",
    url: FEMALE_BLAZER_AVATAR,
    badgeColor: "bg-purple-600 text-white",
  },
];
