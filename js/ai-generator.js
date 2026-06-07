// Moteur Astrologique et de Guidance Émotionnelle de Moon Astro (Astrologie & Numérologie)

const ZODIAC_SIGNS = [
  { name: "Capricorne", name_en: "Capricorn", symbol: "♑", dates: "22 déc. - 19 jan.", dates_en: "Dec 22 - Jan 19", element: "Terre", element_en: "Earth", ruler: "Saturne", ruler_en: "Saturn" },
  { name: "Verseau", name_en: "Aquarius", symbol: "♒", dates: "20 jan. - 18 fév.", dates_en: "Jan 20 - Feb 18", element: "Air", element_en: "Air", ruler: "Uranus", ruler_en: "Uranus" },
  { name: "Poissons", name_en: "Pisces", symbol: "♓", dates: "19 fév. - 20 mars", dates_en: "Feb 19 - Mar 20", element: "Eau", element_en: "Water", ruler: "Neptune", ruler_en: "Neptune" },
  { name: "Bélier", name_en: "Aries", symbol: "♈", dates: "21 mars - 19 avr.", dates_en: "Mar 21 - Apr 19", element: "Feu", element_en: "Fire", ruler: "Mars", ruler_en: "Mars" },
  { name: "Taureau", name_en: "Taurus", symbol: "♉", dates: "20 avr. - 20 mai", dates_en: "Apr 20 - May 20", element: "Terre", element_en: "Earth", ruler: "Vénus", ruler_en: "Venus" },
  { name: "Gémeaux", name_en: "Gemini", symbol: "♊", dates: "21 mai - 20 juin", dates_en: "May 21 - Jun 20", element: "Air", element_en: "Air", ruler: "Mercure", ruler_en: "Mercury" },
  { name: "Cancer", name_en: "Cancer", symbol: "♋", dates: "21 juin - 22 juil.", dates_en: "Jun 21 - Jul 22", element: "Eau", element_en: "Water", ruler: "Lune", ruler_en: "Moon" },
  { name: "Lion", name_en: "Leo", symbol: "♌", dates: "23 juil. - 22 août", dates_en: "Jul 23 - Aug 22", element: "Feu", element_en: "Fire", ruler: "Soleil", ruler_en: "Sun" },
  { name: "Vierge", name_en: "Virgo", symbol: "♍", dates: "23 août - 22 sept.", dates_en: "Aug 23 - Sep 22", element: "Terre", element_en: "Earth", ruler: "Mercure", ruler_en: "Mercury" },
  { name: "Balance", name_en: "Libra", symbol: "♎", dates: "23 sept. - 22 oct.", dates_en: "Sep 23 - Oct 22", element: "Air", element_en: "Air", ruler: "Vénus", ruler_en: "Venus" },
  { name: "Scorpion", name_en: "Scorpio", symbol: "♏", dates: "23 oct. - 21 nov.", dates_en: "Oct 23 - Nov 21", element: "Eau", element_en: "Water", ruler: "Pluton", ruler_en: "Pluto" },
  { name: "Sagittaire", name_en: "Sagittarius", symbol: "♐", dates: "22 nov. - 21 déc.", dates_en: "Nov 22 - Dec 21", element: "Feu", element_en: "Fire", ruler: "Jupiter", ruler_en: "Jupiter" }
];

// Helper to get Zodiac Sign from date
function getZodiacInfo(dateString) {
  if (!dateString) return ZODIAC_SIGNS[5]; // Default to Gemini if error
  
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS[0];
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[1];
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return ZODIAC_SIGNS[2];
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[3];
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[4];
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS[5];
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[6];
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[7];
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[8];
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS[9];
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS[10];
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[11];
  
  return ZODIAC_SIGNS[5];
}

// Calcul du Chemin de Vie Numérologique (bilingue)
function calculateLifePath(dateString, lang = "fr") {
  if (!dateString) {
    return lang === "en" 
      ? { number: 7, name: "The Seeker / The Sage", desc: "Analytical mind, deeply connected to hidden truths." }
      : { number: 7, name: "Le Chercheur / Le Sage", desc: "Esprit analytique, profondément connecté à la vérité cachée." };
  }
  
  const digits = dateString.replace(/\D/g, "");
  let sum = 0;
  for (let char of digits) {
    sum += parseInt(char);
  }
  
  function reduce(num) {
    if (num === 11 || num === 22 || num === 33) return num;
    if (num < 10) return num;
    let s = 0;
    let temp = num;
    while (temp > 0) {
      s += temp % 10;
      temp = Math.floor(temp / 10);
    }
    return reduce(s);
  }
  
  const num = reduce(sum);
  
  const descriptions = {
    fr: {
      1: { name: "Le Leader / L'Éveilleur", desc: "Pionnier créatif, courageux et indépendant, fait pour tracer son propre chemin avec audace." },
      2: { name: "Le Médiateur / L'Harmonisateur", desc: "Sensible, intuitif et diplomate, fait pour créer l'union, la paix et l'équilibre." },
      3: { name: "Le Communicateur / Le Créatif", desc: "Expressif, enthousiaste et sociable, doté d'une superbe vibration de partage artistique et d'optimisme." },
      4: { name: "Le Bâtisseur / Le Protecteur", desc: "Méthodique, loyal, discipliné et stable, fait pour créer des fondations solides et durables." },
      5: { name: "Le Voyageur / L'Esprit Libre", desc: "Aventureux, dynamique, curieux et hautement adaptable, né pour explorer le changement et la liberté." },
      6: { name: "Le Guide / Le Guérisseur d'Âme", desc: "Chaleureux, protecteur, responsable et aimant, dévoué à l'harmonie familiale et au service des autres." },
      7: { name: "Le Chercheur / Le Sage", desc: "Analytique, contemplatif, spirituel et observateur, né pour percer les secrets ésotériques ou scientifiques." },
      8: { name: "Le Stratège / L'Alchimiste", desc: "Ambitieux, puissant, résilient et pragmatique, fait pour matérialiser la prospérité et transformer les tensions." },
      9: { name: "L'Altruiste / L'Oracle", desc: "Généreux, idéaliste, doté d'une immense compassion spirituelle globale et ouvert sur le monde." },
      11: { name: "L'Inspirateur / Le Canal de Lumière", desc: "Maître Nombre reliant le divin au terrestre, doté d'une intuition fulgurante et d'un charisme spirituel inné." },
      22: { name: "Le Visionnaire / Le Grand Bâtisseur", desc: "Maître Nombre capable de matérialiser les utopies ou grands idéaux collectifs dans la matière terrestre." },
      33: { name: "L'Éveilleur Universel / Le Guide de Sagesse", desc: "Maître Nombre d'amour pur et inconditionnel, dévoué à l'élévation vibratoire et spirituelle de l'humanité." }
    },
    en: {
      1: { name: "The Leader / The Awakener", desc: "Creative pioneer, brave and independent, made to boldly blaze their own trail." },
      2: { name: "The Mediator / The Harmonizer", desc: "Sensitive, intuitive, and diplomatic, made to create unity, peace, and balance." },
      3: { name: "The Communicator / The Creative", desc: "Expressive, enthusiastic, and social, gifted with a wonderful vibration of artistic sharing and optimism." },
      4: { name: "The Builder / The Protector", desc: "Methodical, loyal, disciplined, and stable, made to build solid and lasting foundations." },
      5: { name: "The Traveler / The Free Spirit", desc: "Adventurous, dynamic, curious, and highly adaptable, born to explore change and freedom." },
      6: { name: "The Guide / The Soul Healer", desc: "Warm, protective, responsible, and loving, dedicated to family harmony and service to others." },
      7: { name: "The Seeker / The Sage", desc: "Analytical, contemplative, spiritual, and observant, born to uncover esoteric or scientific secrets." },
      8: { name: "The Strategist / The Alchemist", desc: "Ambitious, powerful, resilient, and pragmatic, made to materialize prosperity and transform tensions." },
      9: { name: "The Altruist / The Oracle", desc: "Generous, idealistic, endowed with immense global spiritual compassion and open to the world." },
      11: { name: "The Inspirer / The Light Channel", desc: "Master Number connecting the divine to the earthly, gifted with lightning-fast intuition and innate spiritual charisma." },
      22: { name: "The Visionary / The Master Builder", desc: "Master Number capable of materializing utopian dreams or great collective ideals in physical matter." },
      33: { name: "The Universal Awakener / The Wisdom Guide", desc: "Master Number of pure and unconditional love, dedicated to the spiritual and vibrational elevation of humanity." }
    }
  };
  
  const activeDesc = descriptions[lang] || descriptions.fr;
  
  return {
    number: num,
    name: activeDesc[num] ? activeDesc[num].name : (lang === "en" ? "The Sage" : "Le Sage"),
    desc: activeDesc[num] ? activeDesc[num].desc : (lang === "en" ? "Truth seeker" : "Chercheur de vérité")
  };
}

// Calcul des Nombres d'Expression, Intime & Réalisation (nom de naissance complet)
function calculateNumerologyFromName(fullName, lang = "fr") {
  const defaultRes = lang === "en"
    ? { expression: 3, soulUrge: 3, personality: 9, expressionText: "Creative vibration.", soulUrgeText: "Desire for harmony.", personalityText: "Social warmth." }
    : { expression: 3, soulUrge: 3, personality: 9, expressionText: "Vibration créative.", soulUrgeText: "Désir d'harmonie.", personalityText: "Chaleur sociale." };

  if (!fullName) return defaultRes;
  
  const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleanName) return defaultRes;
  
  const pythagorean = {
    a:1, j:1, s:1, b:2, k:2, t:2, c:3, l:3, u:3, d:4, m:4, v:4,
    e:5, n:5, w:5, f:6, o:6, x:6, g:7, p:7, y:7, h:8, q:8, z:8, i:9, r:9
  };
  
  const vowels = "aeiouy";
  let expressionSum = 0;
  let soulUrgeSum = 0;
  let personalitySum = 0;
  
  for (let char of cleanName) {
    const val = pythagorean[char] || 0;
    expressionSum += val;
    if (vowels.includes(char)) {
      soulUrgeSum += val;
    } else {
      personalitySum += val;
    }
  }
  
  function reduce(num) {
    if (num === 11 || num === 22 || num === 33) return num;
    if (num < 10) return num;
    let s = 0;
    let temp = num;
    while (temp > 0) {
      s += temp % 10;
      temp = Math.floor(temp / 10);
    }
    return reduce(s);
  }
  
  const expression = reduce(expressionSum);
  const soulUrge = reduce(soulUrgeSum);
  const personality = reduce(personalitySum);
  
  const expressionDescriptions = {
    fr: {
      1: "Indépendance d'esprit farouche, esprit d'initiative pionnier.",
      2: "Diplomatie naturelle, art de la conciliation et de l'écoute.",
      3: "Expression créative, rayonnement joyeux et talents artistiques.",
      4: "Sens inébranlable de la rigueur, de l'organisation et de la stabilité.",
      5: "Liberté d'action, adaptabilité et soif d'explorer la vie sous toutes ses formes.",
      6: "Besoin de prendre soin, d'harmoniser son foyer et d'apporter l'équilibre.",
      7: "Grande profondeur analytique, recherche spirituelle ou philosophique.",
      8: "Autorité naturelle, sens des affaires et grande force de concrétisation matérielle.",
      9: "Idéalisme généreux, humanisme, détachement matériel et vision globale.",
      11: "Magnétisme intuitif intense, don d'inspiration pour son entourage.",
      22: "Génie bâtisseur capable de réaliser des projets ambitieux d'utilité publique.",
      33: "Vibration d'amour inconditionnel et de guidance universelle désintéressée."
    },
    en: {
      1: "Fierce independence of mind, pioneering initiative.",
      2: "Natural diplomacy, art of conciliation and listening.",
      3: "Creative expression, joyful radiance and artistic talents.",
      4: "Unwavering sense of rigor, organization, and stability.",
      5: "Freedom of action, adaptability, and thirst to explore life in all forms.",
      6: "Need to care, harmonize home, and bring balance.",
      7: "Great analytical depth, spiritual or philosophical search.",
      8: "Natural authority, business sense, and great force of material realization.",
      9: "Generous idealism, humanism, material detachment, and global vision.",
      11: "Intense intuitive magnetism, gift of inspiration for surroundings.",
      22: "Master builder genius capable of realizing ambitious public projects.",
      33: "Vibration of unconditional love and selfless universal guidance."
    }
  };

  const soulUrgeDescriptions = {
    fr: {
      1: "Le désir inconscient de mener, de briller et d'être entièrement libre.",
      2: "Une aspiration viscérale à la paix, au partage à deux et à la fusion douce.",
      3: "Un besoin vital de créer, de communiquer, d'écrire ou d'amuser les autres.",
      4: "Un besoin rassurant de sécurité, d'ordre et de méthodes concrètes.",
      5: "L'appel irrésistible de l'aventure, des voyages physiques et intellectuels.",
      6: "Une soif de beauté, d'harmonie familiale et d'aimer inconditionnellement.",
      7: "Un désir de silence sacré, de méditation profonde et de décryptage des mystères.",
      8: "Une volonté de puissance matérielle, de justice et de conquête de l'abondance.",
      9: "Une aspiration à la fraternité cosmique universelle et à l'éveil collectif.",
      11: "L'appel de l'âme à servir de canal intuitif pour de plus hautes vibrations.",
      22: "Une ambition de l'âme d'inscrire des réalisations colossales pour l'humanité.",
      33: "L'élan absolu du cœur vers la guérison spirituelle d'autrui."
    },
    en: {
      1: "The unconscious desire to lead, to shine, and to be entirely free.",
      2: "A visceral aspiration for peace, partnership, and gentle fusion.",
      3: "A vital need to create, communicate, write, or entertain others.",
      4: "A reassuring need for security, order, and concrete methods.",
      5: "The irresistible call of adventure, physical and intellectual journeys.",
      6: "A thirst for beauty, family harmony, and unconditional loving.",
      7: "A desire for sacred silence, deep meditation, and decoding mysteries.",
      8: "A drive for material power, justice, and conquering abundance.",
      9: "An aspiration for universal cosmic brotherhood and collective awakening.",
      11: "The soul's call to serve as an intuitive channel for higher vibrations.",
      22: "A soul's ambition to create colossal achievements for humanity.",
      33: "The heart's absolute drive toward the spiritual healing of others."
    }
  };
  
  const activeExpr = expressionDescriptions[lang] || expressionDescriptions.fr;
  const activeSoul = soulUrgeDescriptions[lang] || soulUrgeDescriptions.fr;
  
  return {
    expression,
    soulUrge,
    personality,
    expressionText: activeExpr[expression] || (lang === "en" ? "Creator of their own way." : "Créateur de sa propre voie."),
    soulUrgeText: activeSoul[soulUrge] || (lang === "en" ? "Deep desire for evolution." : "Désir profond d'évolution."),
    personalityText: lang === "en"
      ? `How others perceive your social aura: vibration ${personality}.`
      : `Comment l'entourage perçoit votre aura sociale : vibration ${personality}.`
  };
}

// Helper de Gemmologie Céleste : Calcule la pierre de chance (bilingue)
function getLuckyGemstone(element, lpNumber, lang = "fr") {
  const gems = {
    fr: {
      Feu: [
        { symbol: "🔥💎", name: "Rubis Impérial", desc: "Pierre de feu sacrée. Elle amplifie le courage, le charisme naturel et protège activement le chakra du cœur." },
        { symbol: "👁️💎", name: "Œil de Tigre", desc: "Bouclier protecteur terrestre. Elle renforce la confiance en soi, la concentration et dissipe les peurs limitantes." },
        { symbol: "☀️💎", name: "Cornaline", desc: "Pierre de vitalité vibrante. Elle stimule la créativité débordante, la passion saine et la force d'action." }
      ],
      Terre: [
        { symbol: "💚💎", name: "Émeraude Sacrée", desc: "Symbole de renaissance. Elle apporte l'abondance matérielle, guérit les blessures émotionnelles et favorise l'ancrage." },
        { symbol: "🟢💎", name: "Jade Céleste", desc: "Pierre d'harmonie et de chance. Elle élimine les blocages mentaux et invite la paix intérieure et la prospérité." },
        { symbol: "⚡💎", name: "Quartz Fumé", desc: "Merveilleux ancrage spirituel. Elle transmute les tensions nerveuses en force tranquille et pragmatique." }
      ],
      Air: [
        { symbol: "🌌💎", name: "Lapis-Lazuli", desc: "Pierre de vérité divine. Elle ouvre le chakra de la gorge, amplifie la communication fluide et la sagesse spirituelle." },
        { symbol: "❄️💎", name: "Aigue-Marine", desc: "Cristal d'apaisement. Elle clarifie le mental encombré, facilite l'expression honnête et adoucit la nervosité." },
        { symbol: "🔮💎", name: "Améthyste Violette", desc: "Guide de méditation. Elle purifie l'esprit, favorise les intuitions fulgurantes et calme l'agitation mentale." }
      ],
      Eau: [
        { symbol: "🌙💎", name: "Pierre de Lune", desc: "Cristal d'intuition pure. Elle se synchronise avec vos marées émotionnelles pour révéler vos talents secrets." },
        { symbol: "💙💎", name: "Saphir Mystique", desc: "Pierre de sérénité absolue. Elle renforce la paix de l'esprit, la loyauté et la connexion aux énergies subtiles." },
        { symbol: "🛡️💎", name: "Labradorite Protectrice", desc: "Bouclier des empathes. Elle absorbe les énergies négatives d'autrui pour préserver votre propre cocon vibratoire." }
      ]
    },
    en: {
      Feu: [
        { symbol: "🔥💎", name: "Imperial Ruby", desc: "Sacred fire stone. It amplifies courage, natural charisma, and actively protects the heart chakra." },
        { symbol: "👁️💎", name: "Tiger's Eye", desc: "Earthly protective shield. It strengthens self-confidence, focus, and dissipates limiting fears." },
        { symbol: "☀️💎", name: "Carnelian", desc: "Stone of vibrant vitality. It stimulates overflowing creativity, healthy passion, and active drive." }
      ],
      Terre: [
        { symbol: "💚💎", name: "Sacred Emerald", desc: "Symbol of rebirth. It brings material abundance, heals emotional wounds, and promotes grounding." },
        { symbol: "🟢💎", name: "Celestial Jade", desc: "Stone of harmony and luck. It eliminates mental blockages and invites inner peace and prosperity." },
        { symbol: "⚡💎", name: "Smoky Quartz", desc: "Wonderful spiritual grounding. It transmutes nervous tension into quiet, pragmatic strength." }
      ],
      Air: [
        { symbol: "🌌💎", name: "Lapis Lazuli", desc: "Stone of divine truth. It opens the throat chakra, amplifies fluid communication and spiritual wisdom." },
        { symbol: "❄️💎", name: "Aquamarine", desc: "Soothing crystal. It clarifies a cluttered mind, facilitates honest expression, and softens nervousness." },
        { symbol: "🔮💎", name: "Purple Amethyst", desc: "Meditation guide. It purifies the mind, promotes flashing insights, and calms mental agitation." }
      ],
      Eau: [
        { symbol: "🌙💎", name: "Moonstone", desc: "Crystal of pure intuition. It synchronizes with your emotional tides to reveal your secret talents." },
        { symbol: "💙💎", name: "Mystic Sapphire", desc: "Stone of absolute serenity. It strengthens peace of mind, loyalty, and connection to subtle energies." },
        { symbol: "🛡️💎", name: "Protective Labradorite", desc: "Shield of empathic souls. It absorbs negative energies from others to preserve your own vibrational cocoon." }
      ]
    }
  };

  const activeGems = gems[lang] || gems.fr;
  const list = activeGems[element] || activeGems.Eau;
  return list[Math.abs(lpNumber) % list.length];
}

// Smart Timezone Estimator including daylight saving time (DST) adjustments
function getTimezoneOffsetForCoordinates(lat, lon, dateStr, birthPlaceStr = "") {
  if (!dateStr) return 0;
  const dateParts = dateStr.split("-");
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]);
  const day = parseInt(dateParts[2]);

  let isSummer = false;
  if (month > 3 && month < 10) {
    isSummer = true;
  } else if (month === 3) {
    const tempDate = new Date(year, 2, 31);
    const dayOfWeek = tempDate.getDay();
    const transitionDay = 31 - dayOfWeek;
    if (day >= transitionDay) isSummer = true;
  } else if (month === 10) {
    const tempDate = new Date(year, 9, 31);
    const dayOfWeek = tempDate.getDay();
    const transitionDay = 31 - dayOfWeek;
    if (day < transitionDay) isSummer = true;
  }

  const birthPlaceLower = (birthPlaceStr || "").toLowerCase();
  const isUKOrIrelandOrPortugal = birthPlaceLower.includes("united kingdom") || 
                                  birthPlaceLower.includes("royaume-uni") || 
                                  birthPlaceLower.includes("uk") || 
                                  birthPlaceLower.includes("ireland") || 
                                  birthPlaceLower.includes("irlande") || 
                                  birthPlaceLower.includes("portugal");

  if (lat >= 35 && lat <= 70 && lon >= -5 && lon <= 30 && !isUKOrIrelandOrPortugal) {
    return isSummer ? 2 : 1;
  }

  if (isUKOrIrelandOrPortugal || (lat >= 35 && lat <= 65 && lon >= -10 && lon <= 2)) {
    return isSummer ? 1 : 0;
  }

  if (lon >= -80 && lon <= -67 && lat >= 24 && lat <= 50) {
    let isUSDST = false;
    if (month > 3 && month < 11) {
      isUSDST = true;
    } else if (month === 3) {
      const tempDate = new Date(year, 2, 1);
      const firstSunday = tempDate.getDay() === 0 ? 1 : (8 - tempDate.getDay());
      const secondSunday = firstSunday + 7;
      if (day >= secondSunday) isUSDST = true;
    } else if (month === 11) {
      const tempDate = new Date(year, 10, 1);
      const firstSunday = tempDate.getDay() === 0 ? 1 : (8 - tempDate.getDay());
      if (day < firstSunday) isUSDST = true;
    }
    return isUSDST ? -4 : -5;
  }

  if (lon >= -98 && lon <= -80 && lat >= 24 && lat <= 50) {
    let isUSDST = false;
    if (month > 3 && month < 11) {
      isUSDST = true;
    } else if (month === 3) {
      const tempDate = new Date(year, 2, 1);
      const firstSunday = tempDate.getDay() === 0 ? 1 : (8 - tempDate.getDay());
      const secondSunday = firstSunday + 7;
      if (day >= secondSunday) isUSDST = true;
    } else if (month === 11) {
      const tempDate = new Date(year, 10, 1);
      const firstSunday = tempDate.getDay() === 0 ? 1 : (8 - tempDate.getDay());
      if (day < firstSunday) isUSDST = true;
    }
    return isUSDST ? -5 : -6;
  }

  if (lon >= -115 && lon <= -98 && lat >= 24 && lat <= 50) {
    let isUSDST = false;
    if (month > 3 && month < 11) {
      isUSDST = true;
    } else if (month === 3) {
      const tempDate = new Date(year, 2, 1);
      const firstSunday = tempDate.getDay() === 0 ? 1 : (8 - tempDate.getDay());
      const secondSunday = firstSunday + 7;
      if (day >= secondSunday) isUSDST = true;
    } else if (month === 11) {
      const tempDate = new Date(year, 10, 1);
      const firstSunday = tempDate.getDay() === 0 ? 1 : (8 - tempDate.getDay());
      if (day < firstSunday) isUSDST = true;
    }
    return isUSDST ? -6 : -7;
  }

  if (lon >= -125 && lon <= -115 && lat >= 24 && lat <= 50) {
    let isUSDST = false;
    if (month > 3 && month < 11) {
      isUSDST = true;
    } else if (month === 3) {
      const tempDate = new Date(year, 2, 1);
      const firstSunday = tempDate.getDay() === 0 ? 1 : (8 - tempDate.getDay());
      const secondSunday = firstSunday + 7;
      if (day >= secondSunday) isUSDST = true;
    } else if (month === 11) {
      const tempDate = new Date(year, 10, 1);
      const firstSunday = tempDate.getDay() === 0 ? 1 : (8 - tempDate.getDay());
      if (day < firstSunday) isUSDST = true;
    }
    return isUSDST ? -7 : -8;
  }

  return Math.round(lon / 15);
}

// High-precision astronomical engine (identical math, bilingual wrapper)
function computeAstrology(birthDateStr, birthTimeStr, latitude, longitude, birthPlaceStr = "") {
  if (!birthDateStr) {
    return {
      sun: ZODIAC_SIGNS[3], // Aries
      moon: ZODIAC_SIGNS[6], // Cancer
      ascendant: ZODIAC_SIGNS[9] // Libra
    };
  }

  const dateParts = birthDateStr.split("-");
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]);
  const day = parseInt(dateParts[2]);

  let hours = 12;
  let minutes = 0;
  if (birthTimeStr) {
    const timeParts = birthTimeStr.split(":");
    hours = parseInt(timeParts[0]);
    minutes = parseInt(timeParts[1]) || 0;
  }

  const lat = typeof latitude === "number" ? latitude : 48.8566;
  const lon = typeof longitude === "number" ? longitude : 2.3522;

  const tzOffset = getTimezoneOffsetForCoordinates(lat, lon, birthDateStr, birthPlaceStr);
  
  let utHours = hours - tzOffset;
  let utMinutes = minutes;
  let utDay = day;
  let utMonth = month;
  let utYear = year;

  if (utHours < 0) {
    utHours += 24;
    utDay -= 1;
  } else if (utHours >= 24) {
    utHours -= 24;
    utDay += 1;
  }

  if (utDay < 1) {
    utMonth -= 1;
    if (utMonth < 1) {
      utMonth = 12;
      utYear -= 1;
    }
    const daysInMonth = new Date(utYear, utMonth, 0).getDate();
    utDay = daysInMonth;
  } else {
    const daysInMonth = new Date(utYear, utMonth, 0).getDate();
    if (utDay > daysInMonth) {
      utDay = 1;
      utMonth += 1;
      if (utMonth > 12) {
        utMonth = 1;
        utYear += 1;
      }
    }
  }

  let Y = utYear;
  let M = utMonth;
  const D = utDay + (utHours + utMinutes / 60) / 24;

  if (M <= 2) {
    Y -= 1;
    M += 12;
  }

  const A = Math.floor(Y / 100);
  const B = Math.floor(A / 4);
  const C = 2 - A + B;
  const E = Math.floor(365.25 * (Y + 4716));
  const F = Math.floor(30.6001 * (M + 1));
  const jd = C + D + E + F - 1524.5;

  const d = jd - 2451545.0; // days since J2000.0
  const T = d / 36525; // centuries since J2000.0

  // 1. Sun Longitude
  const L = (280.466 + 36000.770 * T) % 360;
  const g = (357.529 + 35999.050 * T) % 360;
  const gRad = (g * Math.PI) / 180;
  let sunLong = (L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad)) % 360;
  if (sunLong < 0) sunLong += 360;

  // 2. Moon Longitude
  const L_prime = (218.316 + 13.176396 * d) % 360;
  const M_prime = (134.963 + 13.064993 * d) % 360;
  const D_elong = (297.850 + 12.190749 * d) % 360;
  const M_sun = (357.529 + 0.9856003 * d) % 360;
  const F_node = (93.272 + 13.229350 * d) % 360;

  const lpRad = (L_prime * Math.PI) / 180;
  const mpRad = (M_prime * Math.PI) / 180;
  const deRad = (D_elong * Math.PI) / 180;
  const msRad = (M_sun * Math.PI) / 180;
  const fnRad = (F_node * Math.PI) / 180;

  let deltaLong = 6.289 * Math.sin(mpRad) +
                   1.274 * Math.sin(2 * deRad - mpRad) +
                   0.658 * Math.sin(2 * deRad) +
                   0.214 * Math.sin(2 * mpRad) -
                   0.186 * Math.sin(msRad) -
                   0.114 * Math.sin(2 * fnRad) +
                   0.057 * Math.sin(2 * deRad - mpRad - msRad);

  let moonLong = (L_prime + deltaLong) % 360;
  if (moonLong < 0) moonLong += 360;

  // 3. Ascendant
  const gmst = (280.46061837 + 360.98564736629 * d) % 360;
  const lst = (gmst + lon) % 360;
  const lstRad = (lst * Math.PI) / 180;
  const eps = 23.439 - 0.0000004 * d;
  const epsRad = (eps * Math.PI) / 180;
  const phiRad = (lat * Math.PI) / 180;

  const y_asc = Math.cos(lstRad);
  const x_asc = -Math.sin(lstRad) * Math.cos(epsRad) - Math.tan(phiRad) * Math.sin(epsRad);
  let ascLong = Math.atan2(y_asc, x_asc) * 180 / Math.PI;
  if (ascLong < 0) ascLong += 360;

  const getZodiacSign = (longVal) => {
    const idx = Math.floor(longVal / 30);
    const signIdx = (idx + 3) % 12;
    return ZODIAC_SIGNS[signIdx];
  };

  return {
    sun: getZodiacSign(sunLong),
    sunLong: sunLong,
    moon: getZodiacSign(moonLong),
    moonLong: moonLong,
    ascendant: getZodiacSign(ascLong),
    ascLong: ascLong
  };
}

// Generate Custom Astrological & Numerological Report (bilingue)
function generatePersonalizedReport(answers, lang = "fr") {
  const defaultName = lang === "en" ? "Cosmic Friend" : "Ami(e) Cosmique";
  const name = answers.name || defaultName;
  
  const astro = computeAstrology(answers.birthDate, answers.birthTime, answers.latitude, answers.longitude, answers.birthPlace);
  const zodiac = astro.sun;
  const moon = astro.moon;
  const ascendantObj = astro.ascendant;
  const ascendant = lang === "en" ? ascendantObj.name_en : ascendantObj.name;
  
  const lifePath = calculateLifePath(answers.birthDate, lang);
  const numerologyName = calculateNumerologyFromName(answers.fullName || name, lang);
  
  // Calculate dominant energy profile based on answers
  let energyProfile = lang === "en" ? "Cosmic Alignment Energy" : "Énergie Cosmique d'Alignement";
  let energyDescription = lang === "en"
    ? "You possess a balanced nature, gracefully oscillating between conscious action and intuitive receptivity. Your current sky invites you to harmonize your earthly desires with your spiritual aspirations."
    : "Vous possédez une nature équilibrée, oscillant avec grâce entre l'action consciente et la réceptivité intuitive. Votre ciel actuel vous invite à harmoniser vos désirs terrestres avec vos aspirations spirituelles.";
  let energyScore = 78;
  
  if (answers.currentEnergy === "explosive" || answers.mainGoal === "career") {
    energyProfile = lang === "en" ? "Creative Stellar Energy" : "Énergie Stellaire Créatrice";
    energyDescription = lang === "en"
      ? "A dynamic and solar vibration animates you. You are in a cycle of expansion, realization, and leadership. Your projects need a clear and determined push to emerge under the best auspices."
      : "Une vibration dynamique et solaire vous anime. Vous êtes dans un cycle d'expansion, de concrétisation et de leadership. Vos projets ont besoin d'une impulsion franche et déterminée pour éclore sous les meilleurs auspices.";
    energyScore = 92;
  } else if (answers.currentEnergy === "receptive" || answers.intuitionConnection === "fusion") {
    energyProfile = lang === "en" ? "Intuitive Lunar Energy" : "Énergie Lunaire Intuitive";
    energyDescription = lang === "en"
      ? "Your inner guidance is in full swing. You are extremely sensitive to surrounding vibrations and emotional tides. This is an ideal time to listen to your dreams, slow down, and cultivate your hidden wisdom."
      : "Votre guidance intérieure bat son plein. Vous êtes extrêmement sensible aux vibrations environnantes et aux marées émotionnelles. C'est une période idéale pour écouter vos rêves, ralentir et cultiver votre sagesse cachée.";
    energyScore = 84;
  } else if (answers.relationship === "healing" || answers.dominantEmotion === "anxiety") {
    energyProfile = lang === "en" ? "Astral Healing Energy" : "Énergie Astrale de Guérison";
    energyDescription = lang === "en"
      ? "You are going through an alchemical phase of purification and metamorphosis. The cosmos invites you to release old memories, heal your heart wounds, and restore your protective cocoon to emerge stronger."
      : "Vous traversez une phase alchimique de purification et de métamorphose. Le cosmos vous invite à libérer les anciennes mémoires, à guérir vos blessures de cœur et à restaurer votre cocon protecteur pour renaître plus fort(e).";
    energyScore = 65;
  }

  // Enrichissement de description via le quiz sur les voyages
  if (answers.travelResourcing === "mountain") {
    energyDescription += lang === "en"
      ? " Your attraction to the silence of peaks and mountain solitude reveals a contemplative spirit, regularly needing isolation to raise its level of consciousness."
      : " Votre attrait pour le silence des cimes et la solitude des montagnes révèle un esprit contemplatif, ayant régulièrement besoin de s'isoler pour élever son niveau de conscience.";
  } else if (answers.travelResourcing === "ocean") {
    energyDescription += lang === "en"
      ? " The wash of the ocean and marine fluidity call to you: this denotes a vital need to harmonize your emotional tides in an open and infinite setting."
      : " Le ressac de l'océan et la fluidité marine vous appellent : cela dénote un besoin vital d'harmoniser vos marées émotionnelles dans un cadre ouvert et infini.";
  } else if (answers.travelResourcing === "forest") {
    energyDescription += lang === "en"
      ? " Your attraction to the forest canopy and wild nature highlights your great need for earthly grounding and organic stability."
      : " Votre attrait pour la canopée et la nature sauvage met en lumière votre grand besoin d'ancrage terrestre et de stabilité organique.";
  } else if (answers.travelResourcing === "culture") {
    energyDescription += lang === "en"
      ? " The search for sacred ruins and historical exploration shows that your soul seeks deep meaning and spiritual teachings across eras."
      : " La quête de ruines sacrées et d'explorations historiques montre que votre âme recherche un sens profond et des enseignements spirituels à travers les époques.";
  }

  // Enrichissement via la sensibilité lunaire
  if (answers.lunarPhaseSensitivity === "high") {
    energyDescription += lang === "en"
      ? " Your high receptivity to lunations confirms a great intuition, in direct resonance with the cosmic cycles of the Full Moon."
      : " Votre très forte réceptivité aux lunaisons confirme une grande intuition, en résonance directe avec les cycles cosmiques de la Pleine Lune.";
  } else if (answers.lunarPhaseSensitivity === "moderate") {
    energyDescription += lang === "en"
      ? " Lunar phases occasionally affect your sleep and dreams, a sign of natural alignment with nature's biorhythms."
      : " Les phases lunaires influencent ponctuellement votre sommeil et vos rêves, signe d'un alignement naturel avec les biorythmes de la nature.";
  }
  
  // Calculate strengths & blockages based on profile & zodiac elements & behavior answers
  let mainStrength = lang === "en" ? "Sharp intuition and protective empathy." : "Intuition aiguisée et empathie protectrice.";
  let blocker = lang === "en" ? "Tendency to absorb surrounding energies." : "Tendance à absorber les énergies environnantes.";
  
  if (zodiac.element === "Feu") {
    mainStrength = lang === "en"
      ? "Overwhelming passion, unwavering courage, and ability to inspire others."
      : "Passion débordante, courage inébranlable et capacité à inspirer les autres.";
    blocker = lang === "en"
      ? "Chronic impatience and tendency to scatter or burn out prematurely."
      : "Impatience chronique et tendance à s'éparpiller ou à s'épuiser prématurément.";
  } else if (zodiac.element === "Terre") {
    mainStrength = lang === "en"
      ? "Absolute reliability, pragmatic grounding, and perseverance in life projects."
      : "Fiabilité absolue, ancrage pragmatique et persévérance dans les projets de vie.";
    blocker = lang === "en"
      ? "Mental rigidity and fear of change or emotional unknowns."
      : "Rigidité mentale et peur du changement ou de l'inconnu affectif.";
  } else if (zodiac.element === "Air") {
    mainStrength = lang === "en"
      ? "Intellectual clarity, social ease, and very fluid adaptability."
      : "Clarté intellectuelle, aisance sociale et esprit d'adaptation très fluide.";
    blocker = lang === "en"
      ? "Difficulty grounding in the present moment, mental scattering, and over-intellectualizing emotions."
      : "Difficulté à s'ancrer dans le moment présent, dispersion mentale et intellectualisation des émotions.";
  } else if (zodiac.element === "Eau") {
    mainStrength = lang === "en"
      ? "Unmatched emotional depth, natural empathy, and a very protective instinct."
      : "Profondeur émotionnelle hors pair, empathie naturelle et instinct très protecteur.";
    blocker = lang === "en"
      ? "Hypersensitivity to criticism and nostalgia for a bygone past."
      : "Hypersensibilité aux critiques et nostalgie d'un passé révolu.";
  }

  // Intégration du trait de caractère du quiz dans les forces
  if (answers.characterTrait === "courageous") {
    mainStrength = lang === "en"
      ? "Heroic determination, ability to act bravely and overcome obstacles."
      : "Détermination héroïque, capacité à agir avec bravoure et à surmonter les obstacles.";
  } else if (answers.characterTrait === "empathic") {
    mainStrength = lang === "en"
      ? "Universal empathy, relational softness, and a great sense of care for other souls."
      : "Empathie universelle, douceur relationnelle et grand sens du soin apporté aux autres âmes.";
  } else if (answers.characterTrait === "analytical") {
    mainStrength = lang === "en"
      ? "Rigor of mind, impeccable analytical clarity, and wisdom when facing complex situations."
      : "Rigueur d'esprit, clarté analytique impeccable et sagesse face aux situations complexes.";
  } else if (answers.characterTrait === "creative") {
    mainStrength = lang === "en"
      ? "Boundless creativity, inspiring freedom of mind, and assumed originality."
      : "Créativité sans bornes, liberté d'esprit inspirante et originalité assumée.";
  }

  // ENRICHISSEMENT COMPORTEMENTAL : Comportement social
  if (answers.procheDistress === "sponge") {
    mainStrength = lang === "en"
      ? "Alchemical empathy, great ability to listen intimately to other souls."
      : "Hyper-empathie alchimique, grande capacité à écouter intimement d'autres âmes.";
    blocker = lang === "en"
      ? "Psychological sponge: you absorb too much of others' distress at the expense of your own vibration level."
      : "Sponge psychologique : vous absorbez trop la détresse d'autrui au détriment de votre propre taux vibratoire.";
  } else if (answers.socialBattery === "irritated") {
    blocker += lang === "en"
      ? " When your social battery drains, rapid relational friction can emerge from nervous irritation."
      : " Lorsque votre batterie sociale s'épuise, des frictions relationnelles rapides peuvent émerger par irritation nerveuse.";
  }
  
  if (answers.projectBlockage === "failure") {
    blocker = lang === "en"
      ? "An unconscious fear of failure and the gaze of others temporarily paralyzes your creative momentum."
      : "La peur inconsciente de l'échec et du regard d'autrui paralyse momentanément votre élan créatif.";
  } else if (answers.relationshipDifficulty === "boundaries") {
    blocker = lang === "en"
      ? "Major difficulty setting clear boundaries and saying 'no' due to an unconscious fear of disappointing or losing the bond."
      : "Difficulté majeure à poser des limites claires et à dire 'non' par peur inconsciente de décevoir ou de perdre le lien.";
  } else if (answers.soulBlessing === "abandonment") {
    blocker = lang === "en"
      ? "A panic fear of isolation or abandonment sabotages your real romantic steps."
      : "La peur panique de l'isolement ou de l'abandon sabote vos élans amoureux réels.";
  } else if (answers.soulBlessing === "betrayal") {
    blocker = lang === "en"
      ? "An excessive need for control over your surroundings born from the fear of being betrayed."
      : "Un besoin excessif de contrôle sur votre entourage né de la peur d'être trahi(e).";
  }

  // Calculer la pierre de chance céleste
  const luckyGemstone = getLuckyGemstone(zodiac.element, lifePath.number, lang);

  // Simulated AI Texts for report
  const months_fr = ["Septembre", "Octobre", "Novembre", "Décembre", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août"];
  const months_en = ["September", "October", "November", "December", "January", "February", "March", "April", "May", "June", "July", "August"];
  const monthsList = lang === "en" ? months_en : months_fr;
  const favorableMonth = monthsList[(name.length + zodiac.name.length + 3) % 12];
  const luckyNumber = (name.length * zodiac.name.length + 7) % 99 + 1;

  // Create daily horoscope contents
  const dailyHoroscope = generateDailyHoroscope(name, zodiac, answers, lifePath, lang);
  
  return {
    name,
    zodiac, // Sun sign
    moon,   // Moon sign
    ascendant, // Ascendant string
    astro, // Raw astro object containing coordinates & signs
    energyProfile,
    energyDescription,
    energyScore,
    mainStrength,
    blocker,
    favorableMonth,
    luckyNumber,
    dailyHoroscope,
    lifePath,
    numerologyName,
    luckyGemstone
  };
}

// Generate detailed daily horoscope texts (bilingue)
function generateDailyHoroscope(name, zodiac, answers, lifePath, lang = "fr") {
  const relationship = answers.relationship || "single";
  const mainGoal = answers.mainGoal || "growth";
  const currentEnergy = answers.currentEnergy || "receptive";
  const dominantEmotion = answers.dominantEmotion || "joy";
  const lpNum = lifePath ? lifePath.number : 7;
  const activeRuler = lang === "en" ? zodiac.ruler_en : zodiac.ruler;

  // Compute a deterministic seed based on today's date and the user's name/life path
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const userName = name || "moon";
  let nameVal = 0;
  for (let i = 0; i < userName.length; i++) {
    nameVal += userName.charCodeAt(i);
  }
  const seed = daySeed + nameVal + lpNum;

  // Fluctuate daily star ratings dynamically (from 3 to 5 stars) based on seed
  const loveStars = 3 + (seed % 3);
  const careerStars = 3 + ((seed + 1) % 3);
  const wellbeingStars = 3 + ((seed + 2) % 3);

  // 1. General Section (3 variations for each case)
  let general = "";
  const varIndex = seed % 3;

  if (currentEnergy === "explosive") {
    const generalExplosive_fr = [
      `Votre ciel s'embrase d'une superbe vitalité sous l'impulsion de votre planète régente, ${activeRuler}. C'est une journée hautement magnétique, ${name}. Votre force d'attraction, portée par votre **Chemin de Vie ${lpNum}**, est décuplée : utilisez cette étincelle pour lancer des initiatives courageuses ou clarifier des non-dits persistants. Les astres conspirent en votre faveur.`,
      `Un élan cosmique puissant sous la gouverne de ${activeRuler} décuple votre enthousiasme aujourd'hui, ${name}. Porté(e) par l'énergie de votre **Chemin de Vie ${lpNum}**, vous possédez une audace naturelle pour briser les routines et franchir les barrières. C'est le moment idéal pour foncer.`,
      `Sous l'égide lumineuse de votre planète régente ${activeRuler}, cette journée s'annonce électrique et pleine de promesses pour vous, ${name}. Votre signature vibratoire du **Chemin de Vie ${lpNum}** favorise des rencontres stimulantes et des opportunités soudaines : suivez votre feu intérieur sans hésitation.`
    ];
    const generalExplosive_en = [
      `Your sky ignites with superb vitality under the impulse of your ruling planet, ${activeRuler}. It is a highly magnetic day, ${name}. Your attraction force, carried by your **Life Path ${lpNum}**, is multiplied: use this spark to launch brave initiatives or clarify persistent unspoken issues. The stars conspire in your favor.`,
      `A powerful cosmic momentum under the governance of ${activeRuler} multiplies your enthusiasm today, ${name}. Carried by the energy of your **Life Path ${lpNum}**, you possess a natural audacity to break routines and cross barriers. It is the perfect time to go for it.`,
      `Under the luminous aegis of your ruling planet ${activeRuler}, this day promises to be electrical and full of promises for you, ${name}. Your vibrational signature of **Life Path ${lpNum}** favors stimulating encounters and sudden opportunities: follow your inner fire without hesitation.`
    ];
    general = lang === "en" ? generalExplosive_en[varIndex] : generalExplosive_fr[varIndex];
  } else if (currentEnergy === "tired") {
    const generalTired_fr = [
      `Les influx cosmiques d'aujourd'hui vous invitent solennellement au repli bienveillant, ${name}. Votre planète ${activeRuler} forme un aspect de ralentissement. Ne forcez aucun événement. Utilisez ce moment pour vous régénérer, purifier vos pensées et accorder à votre esprit le repos qu'il réclame silencieusement depuis plusieurs jours. Votre vibrations de **Chemin de Vie ${lpNum}** vous soutiennent dans l'ancrage.`,
      `Votre ciel du jour suggère une pause nécessaire, ${name}. Avec le ralentissement de votre planète régente ${activeRuler}, l'heure est à l'introspection douce. Les vibrations de votre **Chemin de Vie ${lpNum}** vous invitent à vous recentrer et à recharger vos batteries loin du bruit du monde.`,
      `Une journée de ressourcement spirituel s'offre à vous sous l'influence apaisée de ${activeRuler}. ${name}, ne cherchez pas à accélérer les choses aujourd'hui. Profitez de l'ancrage procuré par votre **Chemin de Vie ${lpNum}** pour cultiver le calme intérieur et régénérer vos forces vitales.`
    ];
    const generalTired_en = [
      `Today's cosmic influxes solemnly invite you to a benevolent retreat, ${name}. Your planet ${activeRuler} forms a slowing aspect. Do not force any events. Use this moment to regenerate, purify your thoughts, and grant your mind the rest it silently craves. Your **Life Path ${lpNum}** vibrations support you in grounding.`,
      `Your sky of the day suggests a necessary pause, ${name}. With the slowing of your ruling planet ${activeRuler}, the hour is for gentle introspection. The vibrations of your **Life Path ${lpNum}** invite you to refocus and recharge your batteries far from the world's noise.`,
      `A day of spiritual rejuvenation offers itself to you under the calmed influence of ${activeRuler}. ${name}, do not seek to speed things up today. Take advantage of the grounding provided by your **Life Path ${lpNum}** to cultivate inner calm and regenerate your vital strengths.`
    ];
    general = lang === "en" ? generalTired_en[varIndex] : generalTired_fr[varIndex];
  } else {
    const generalDefault_fr = [
      `Aujourd'hui, l'influence de votre planète régente, ${activeRuler}, conjuguée à votre signature vibratoire du **Chemin de Vie ${lpNum}**, crée une atmosphère propice aux révélations personnelles. ${name}, vous ressentirez un puissant élan intérieur pour réorganiser vos priorités fondamentales et concrétiser vos aspirations d'âme.`,
      `Les transits planétaires d'aujourd'hui mettent en lumière votre planète régente ${activeRuler} en harmonie avec votre **Chemin de Vie ${lpNum}**. ${name}, c'est une excellente journée pour prendre du recul, écouter les murmures de votre intuition et poser des intentions constructives pour l'avenir.`,
      `Sous la guidance subtile de votre planète régente ${activeRuler}, la journée favorise un réalignement de vos énergies. En syntonisation avec votre **Chemin de Vie ${lpNum}**, ${name}, vous trouverez la clarté nécessaire pour harmoniser vos relations et progresser sereinement dans votre cheminement.`
    ];
    const generalDefault_en = [
      `Today, the influence of your ruling planet, ${activeRuler}, combined with your vibrational signature of **Life Path ${lpNum}**, creates an atmosphere conducive to personal revelations. ${name}, you will feel a powerful inner drive to reorganize your core priorities and realize your soul's aspirations.`,
      `Today's planetary transits bring your ruling planet ${activeRuler} into harmony with your **Life Path ${lpNum}**. ${name}, it is an excellent day to step back, listen to the whispers of your intuition, and set constructive intentions for the future.`,
      `Under the subtle guidance of your ruling planet ${activeRuler}, the day favors a realignment of your energies. In tuning with your **Life Path ${lpNum}**, ${name}, you will find the clarity needed to harmonize your relationships and progress peacefully in your journey.`
    ];
    general = lang === "en" ? generalDefault_en[varIndex] : generalDefault_fr[varIndex];
  }

  // 2. Love Section (3 variations per relationship status)
  let love = "";
  if (relationship === "single") {
    const loveSingle_fr = [
      `Célibataire, l'alignement planétaire actuel vous invite à vous aimer d'abord pleinement pour rayonner à l'extérieur. Un regard, une discussion anodine ou une synchronicité troublante au détour d'un chemin pourrait éveiller votre curiosité. Ne fermez aucune porte par peur d'être vulnérable. Vos guides vous conseillent de soigner vos blessures d'amour passées.`,
      `Célibataire, les astres soufflent aujourd'hui un vent de fraîcheur sur votre vie sociale. Une rencontre amicale pourrait prendre une tournure inattendue et spirituelle. Exprimez votre authenticité sans fard, c'est ce qui fait votre charme cosmique unique.`,
      `Célibataire, prenez aujourd'hui le temps de clarifier vos intentions amoureuses. L'univers entend vos désirs mais attend que vous fassiez de la place dans votre esprit pour accueillir le renouveau. Une synchronicité marquante se prépare.`
    ];
    const loveSingle_en = [
      `Single, the current planetary alignment invites you to love yourself fully first to radiate outward. A glance, an ordinary discussion, or a troubling synchronicity might pique your curiosity. Do not close any doors for fear of being vulnerable. Your guides advise you to heal your past love wounds.`,
      `Single, the stars blow a wind of freshness on your social life today. A friendly encounter could take an unexpected and spiritual turn. Express your authenticity without mask, this is what makes your unique cosmic charm.`,
      `Single, take time today to clarify your romantic intentions. The universe hears your desires but waits for you to make space in your mind to welcome renewal. A striking synchronicity is preparing.`
    ];
    love = lang === "en" ? loveSingle_en[varIndex] : loveSingle_fr[varIndex];
  } else if (relationship === "couple") {
    const loveCouple_fr = [
      `En couple, le climat astral est propice à une complicité renouvelée. Cependant, veillez à ne pas projeter vos attentes inexprimées sur votre partenaire. Une discussion authentique autour d'un projet commun ou d'une émotion partagée renforcera profondément vos liens d'âme.`,
      `En couple, l'heure est au partage d'activités insolites ou à des confidences sincères. Laissez de côté le quotidien pour raviver la flamme spirituelle qui vous unit. Un mot doux ou une attention délicate aujourd'hui renforcera durablement votre complicité.`,
      `En couple, des transits harmonieux facilitent la compréhension mutuelle. Si des tensions existaient, c'est le jour idéal pour les dissiper grâce à une écoute attentive. Misez sur la tendresse et la bienveillance pour embellir votre foyer.`
    ];
    const loveCouple_en = [
      `In a relationship, the astral climate is favorable for renewed intimacy. However, be careful not to project your unexpressed expectations onto your partner. An authentic discussion about a common project or shared emotion will deeply strengthen your soul connections.`,
      `In a relationship, the hour is for sharing unusual activities or sincere confidences. Leave daily life aside to revive the spiritual flame that unites you. A sweet word or delicate attention today will durably strengthen your intimacy.`,
      `In a relationship, harmonious transits facilitate mutual understanding. If tensions existed, this is the perfect day to dissipate them thanks to attentive listening. Bet on tenderness and kindness to beautify your home.`
    ];
    love = lang === "en" ? loveCouple_en[varIndex] : loveCouple_fr[varIndex];
  } else if (relationship === "complicated") {
    const loveComplicated_fr = [
      `Le flou affectif qui vous entoure commence à se dissiper doucement. Les planètes vous recommandent d'arrêter d'intellectualiser vos sentiments. Laissez parler votre corps et votre intuition. Fixez des limites saines : vous méritez une relation fluide et sereine, libre de toute ambiguïté.`,
      `Une situation confuse requiert aujourd'hui votre calme et votre recul. Ne prenez pas de décision hâtive sous le coup de l'émotion. L'univers vous conseille d'attendre que le voile du mystère se lève pour y voir plus clair. Restez centré(e).`,
      `Les astres vous invitent à faire le point sur vos besoins affectifs réels. N'acceptez pas moins que le respect et la clarté. Exprimez vos limites avec bienveillance mais fermeté. C'est en vous respectant que les autres vous respecteront.`
    ];
    const loveComplicated_en = [
      `The emotional blur surrounding you is starting to clear up gently. The planets recommend you stop over-intellectualizing your feelings. Let your body and intuition speak. Set healthy boundaries: you deserve a fluid and peaceful relation, free of any ambiguity.`,
      `A confusing situation requires your calm and stepping back today. Do not make any hasty decision under emotional pressure. The universe advises you to wait for the veil of mystery to lift to see clearer. Stay centered.`,
      `The stars invite you to assess your real emotional needs. Do not accept less than respect and clarity. Express your boundaries with kindness but firmness. It is by respecting yourself that others will respect you.`
    ];
    love = lang === "en" ? loveComplicated_en[varIndex] : loveComplicated_fr[varIndex];
  } else if (relationship === "healing") {
    const loveHealing_fr = [
      `Vous êtes dans une merveilleuse phase de reconstruction sentimentale. Le cosmos panse vos plaies affectives avec patience. Prenez le temps de savourer votre liberté et votre espace personnel. L'amour authentique arrivera naturellement lorsque vous aurez parachevé ce cycle de régénération.`,
      `Votre cœur guérit à son propre rythme. Aujourd'hui, offrez-vous un moment de douceur et de pardon envers vous-même. Le passé n'a plus d'emprise sur la personne lumineuse que vous devenez chaque jour.`,
      `Les astres soutiennent votre renaissance émotionnelle. Une paix profonde s'installe. Profitez de cette journée pour cultiver l'amour de soi en faisant des activités qui nourrissent profondément votre esprit.`
    ];
    const loveHealing_en = [
      `You are in a wonderful phase of emotional reconstruction. The cosmos heals your wounds with patience. Take time to savor your freedom and personal space. True love will arrive naturally once this cycle of regeneration is complete.`,
      `Your heart heals at its own pace. Today, offer yourself a moment of sweetness and self-forgiveness. The past no longer holds power over the luminous person you are becoming each day.`,
      `The stars support your emotional rebirth. A deep peace is settling in. Take advantage of this day to cultivate self-love by doing activities that deeply nourish your spirit.`
    ];
    love = lang === "en" ? loveHealing_en[varIndex] : loveHealing_fr[varIndex];
  }

  if (answers.relationshipDifficulty === "boundaries") {
    love += lang === "en"
      ? " Cosmic point of attention today: dare to say 'no' to preserve your precious inner space."
      : " Point d'attention céleste aujourd'hui : osez dire 'non' à votre entourage amoureux pour préserver votre précieux espace intérieur.";
  }

  // 3. Career Section (3 variations per main goal)
  let career = "";
  if (mainGoal === "career") {
    const careerJob_fr = [
      `Vos ambitions professionnelles reçoivent un coup de pouce du destin. C'est le moment idéal pour proposer vos idées créatives, solliciter un entretien ou restructurer vos priorités. Ne reculez pas devant les défis : votre ciel indique que vous disposez de toutes les ressources nécessaires pour franchir un nouveau palier.`,
      `Aujourd'hui, l'influx d'énergies créatrices favorise les initiatives audacieuses. Présentez vos projets ou organisez des réunions clés. Votre charisme professionnel est à son apogée, soutenu par votre planète régente ${activeRuler}.`,
      `Une belle opportunité de collaboration ou de reconnaissance se profile au travail. Restez attentif(ve) aux discussions informelles, car une graine de succès pourrait y être plantée aujourd'hui.`
    ];
    const careerJob_en = [
      `Your professional ambitions receive a helping hand from fate. It is the ideal time to propose your creative ideas, request a meeting, or restructure your priorities. Do not hold back, your sky indicates you have the resources to cross a new step.`,
      `Today, the influx of creative energies favors bold initiatives. Present your projects or organize key meetings. Your professional charisma is at its peak, supported by your ruling planet ${activeRuler}.`,
      `A beautiful opportunity for collaboration or recognition is emerging at work. Stay attentive to informal discussions, as a seed of success could be planted there today.`
    ];
    career = lang === "en" ? careerJob_en[varIndex] : careerJob_fr[varIndex];
  } else if (mainGoal === "love") {
    const careerLove_fr = [
      `Au travail, veillez à ne pas vous laisser déborder par vos émotions ou l'humeur de vos collaborateurs. Restez concentré(e) sur vos tâches tout en maintenant une distance saine. Votre sensibilité est une force, mais aujourd'hui, elle requiert un bouclier protecteur pour éviter de disperser votre précieuse énergie.`,
      `Une atmosphère parfois agitée au travail demande du calme. Ne prenez pas à cœur les remarques de vos collègues. Concentrez-vous sur vos tâches et offrez-vous des pauses de silence pour préserver votre paix.`,
      `Les transits du jour vous invitent à équilibrer vie professionnelle et aspirations personnelles. Ne laissez pas le travail empiéter sur votre cocon affectif. Mettez en place des limites saines.`
    ];
    const careerLove_en = [
      `At work, be careful not to let yourself be overwhelmed by your emotions or the mood of colleagues. Keep focused on tasks while maintaining a healthy distance. Your sensitivity is a strength, but today it requires a protective shield to avoid scattering your energy.`,
      `A sometimes agitated workspace demands calm. Do not take your colleagues' remarks to heart. Focus on your tasks and grant yourself silence breaks to preserve your peace.`,
      `Today's transits invite you to balance professional life and personal aspirations. Do not let work encroach on your emotional cocoon. Set up healthy boundaries.`
    ];
    career = lang === "en" ? careerLove_en[varIndex] : careerLove_fr[varIndex];
  } else if (mainGoal === "peace") {
    const careerPeace_fr = [
      `Une journée calme sur le plan professionnel. C'est l'occasion parfaite d'épurer votre espace de travail, de trier vos dossiers en cours et de planifier la suite avec détachement. Évitez les conflits stériles de bureau et privilégiez la diplomatie silencieuse pour garder votre paix intérieure.`,
      `Au bureau, optez pour la discrétion et le travail de fond aujourd'hui. Loin du tumulte et des bavardages, vous gagnerez en efficacité. C'est une excellente journée pour structurer vos idées dans l'ombre.`,
      `Votre ciel professionnel favorise la résolution sereine de vieux dossiers. Abordez vos tâches avec méthodologie et calme. Le silence sera votre meilleur allié pour avancer sans stress.`
    ];
    const careerPeace_en = [
      `A calm day professionally. It is the perfect opportunity to clean up your workspace, sort ongoing files, and plan with detachment. Avoid office conflicts and prioritize silent diplomacy to keep your inner peace.`,
      `At the office, opt for discretion and background work today. Far from noise and gossip, you will gain efficiency. It is an excellent day to structure your ideas in the shadows.`,
      `Your professional sky favors the serene resolution of old files. Approach your tasks with methodology and calm. Silence will be your best ally to progress stress-free.`
    ];
    career = lang === "en" ? careerPeace_en[varIndex] : careerPeace_fr[varIndex];
  } else { // growth / other
    const careerGrowth_fr = [
      `Vous commencez à percevoir le lien étroit entre vos peurs intérieures et vos choix professionnels. Une situation d'aujourd'hui va agir comme un miroir, vous invitant à dépasser le syndrome de l'imposteur. Relevez la tête : vos compétences sont réelles et attendent d'être pleinement assumées.`,
      `Le travail se présente aujourd'hui comme un terrain d'apprentissage personnel. Relevez les défis avec curiosité plutôt qu'avec crainte. Une discussion constructive avec un mentor ou supérieur vous ouvrira de nouveaux horizons de sagesse.`,
      `Les transits du jour stimulent vos capacités d'assimilation et d'analyse. C'est le moment parfait pour vous former, lire sur vos domaines d'intérêt professionnel, ou repenser votre cheminement de carrière à long terme.`
    ];
    const careerGrowth_en = [
      `You are beginning to perceive the close link between your inner fears and professional choices. A situation today will act as a mirror, inviting you to move past impostor syndrome. Raise your head: your skills are real and wait to be assumed.`,
      `Work presents itself today as a ground for personal learning. Meet challenges with curiosity rather than fear. A constructive discussion with a mentor or superior will open new horizons of wisdom.`,
      `Today's transits stimulate your learning and analytical skills. It is the perfect time to train, read about your professional fields of interest, or rethink your long-term career path.`
    ];
    career = lang === "en" ? careerGrowth_en[varIndex] : careerGrowth_fr[varIndex];
  }

  // 4. Wellbeing Section (3 variations based on dominantEmotion)
  let wellbeing = "";
  if (dominantEmotion === "anxiety" || answers.stressLevel >= "4") {
    const wellbeingAnxious_fr = [
      `Votre mental tourne à plein régime, créant une tension dans vos trapèzes ou votre respiration. Stoppez tout quelques minutes. Pratiquez une respiration ventrale profonde en expirant par la bouche. Hydratez-vous abondamment et éloignez-vous des écrans ce soir pour reposer vos yeux et votre esprit.`,
      `L'anxiété passagère peut être transmutée par le mouvement. Offrez-vous une marche rapide de 15 minutes, un étirement doux du dos, ou écoutez une musique relaxante. Écoutez le rythme de votre corps et ralentissez le pas aujourd'hui.`,
      `Vos énergies du jour réclament un retour au calme physique. Allégez votre programme de la soirée. Une tasse d'infusion apaisante et un coucher précoce seront essentiels pour purifier vos vibrations nerveuses.`
    ];
    const wellbeingAnxious_en = [
      `Your mind is running at full speed, creating tension in your shoulders or breathing. Stop for a few minutes. Practice deep belly breathing, expelling breath through your mouth. Hydrate well and stay away from screens tonight to rest your eyes and mind.`,
      `Passing anxiety can be transmuted through movement. Offer yourself a 15-minute brisk walk, gentle back stretches, or listen to relaxing music. Listen to your body's rhythm and slow down today.`,
      `Your energies today demand a return to physical calm. Lighten your evening schedule. A cup of soothing herbal tea and an early bedtime will be essential to purify your nervous vibrations.`
    ];
    wellbeing = lang === "en" ? wellbeingAnxious_en[varIndex] : wellbeingAnxious_fr[varIndex];
  } else if (dominantEmotion === "joy" || currentEnergy === "explosive") {
    const wellbeingJoy_fr = [
      `Votre harmonie corps-esprit est excellente aujourd'hui ! Vous rayonnez d'une vitalité saine. Profitez de ce flux pour pratiquer une activité sportive épanouissante, danser ou simplement propager vos ondes positives. Veillez toutefois à ne pas épuiser toutes vos réserves en une fois.`,
      `Une superbe vitalité physique vous accompagne. C'est le moment idéal pour vous dépenser en extérieur ou commencer une nouvelle routine bien-être stimulante. Votre force vitale est un cadeau précieux : partagez cette joie communicative.`,
      `Votre rayonnement énergétique est très élevé. Vous vous sentez léger(e) et serein(e). Profitez-en pour nourrir vos sens : un bon repas sain, des rires partagés et un contact avec la nature démultiplieront votre bien-être.`
    ];
    const wellbeingJoy_en = [
      `Your body-mind harmony is excellent today! You radiate a healthy vitality. Enjoy this flow to practice a fulfilling sport, dance, or simply spread positive vibes. Be careful not to deplete all your reserves at once.`,
      `A superb physical vitality accompanies you. It is the perfect time to exercise outdoors or start a new stimulating well-being routine. Your vital force is a precious gift: share this communicative joy.`,
      `Your energetic radiance is very high. You feel light and serene. Take advantage of it to nourish your senses: a good healthy meal, shared laughter, and contact with nature will multiply your well-being.`
    ];
    wellbeing = lang === "en" ? wellbeingJoy_en[varIndex] : wellbeingJoy_fr[varIndex];
  } else { // introspection / default
    const wellbeingIntro_fr = [
      `Une douce mélancolie ou un besoin intense de solitude vous habite. Accueillez cette météo intérieure sans jugement. Une infusion relaxante, la lecture d'un livre inspirant ou un bain chaud aromatique vous aideront à aligner vos chakras et à nourrir votre intériorité.`,
      `L'introspection est le chemin naturel vers la sagesse de votre **Chemin de Vie ${lpNum}**. Aujourd'hui, préférez le silence aux bavardages mondains. Écrire dans votre journal intime vous permettra de libérer d'importants messages de votre inconscient.`,
      `Votre corps vous demande de ralentir et de vous recentrer. Offrez-vous un rituel simple de soin : des étirements doux, de la méditation assise ou une balade contemplative. L'univers communique avec vous dans le calme.`
    ];
    const wellbeingIntro_en = [
      `A gentle melancholy or an intense need for solitude resides in you. Welcome this inner weather without judgment. A relaxing herbal tea, an inspiring book, or a warm bath will help align your chakras and nourish your interiority.`,
      `Introspection is the natural path to your **Life Path ${lpNum}** wisdom. Today, prefer silence over mundane chatter. Writing in your journal will allow you to release important messages from your unconscious.`,
      `Your body asks you to slow down and refocus. Offer yourself a simple self-care ritual: gentle stretching, seated meditation, or a contemplative walk. The universe communicates with you in the quiet.`
    ];
    wellbeing = lang === "en" ? wellbeingIntro_en[varIndex] : wellbeingIntro_fr[varIndex];
  }

  // 5. Warning Section (3 variations based on answers)
  let warning = "";
  if (answers.projectBlockage === "procrastination") {
    const warnProc_fr = [
      "Méfiez-vous de la tentation de remettre à demain ce qui peut être accompli en temps voulu. La procrastination est souvent la peur cachée de mal faire. Faites le premier pas aujourd'hui, aussi petit soit-il.",
      "Avertissement céleste : ne laissez pas la paresse ou la peur du jugement bloquer votre élan. Un projet commencé à moitié vaut mieux qu'une idée parfaite restée dans votre esprit. Agissez maintenant.",
      "Le piège du jour : repousser vos corvées ou décisions importantes. La lune vous conseille de vous atteler à votre tâche prioritaire dès ce matin pour libérer votre esprit pour le reste de la journée."
    ];
    const warnProc_en = [
      "Beware of the temptation to put off until tomorrow what can be accomplished in due time. Procrastination is often the hidden fear of doing poorly. Take the first step today, however small it may be.",
      "Celestial warning: do not let laziness or fear of judgment block your momentum. A half-started project is better than a perfect idea left in your mind. Act now.",
      "Today's trap: postponing your chores or important decisions. The moon advises you to tackle your priority task early this morning to free your mind for the rest of the day."
    ];
    warning = lang === "en" ? warnProc_en[varIndex] : warnProc_fr[varIndex];
  } else if (answers.projectBlockage === "dispersion") {
    const warnDisp_fr = [
      "Attention au piège de l'overthinking nocturne et de la dispersion. Notez vos idées sur un carnet avant de dormir pour libérer définitivement votre charge mentale.",
      "Mise en garde cosmique : vouloir tout faire en même temps va diviser votre force de réussite. Choisissez une seule priorité aujourd'hui et menez-la à bien sans regarder ailleurs.",
      "Attention aux distractions faciles (écrans, réseaux) qui vident votre batterie énergétique. Cadrez vos temps de concentration et restez imperméable aux sollicitations inutiles."
    ];
    const warnDisp_en = [
      "Watch out for night overthinking and scattering. Note your ideas down in a journal before sleeping to permanently free your mind.",
      "Cosmic warning: wanting to do everything at the same time will divide your success strength. Choose a single priority today and carry it out without looking elsewhere.",
      "Beware of easy distractions (screens, social networks) that drain your energetic battery. Frame your concentration times and remain impervious to useless solicitations."
    ];
    warning = lang === "en" ? warnDisp_en[varIndex] : warnDisp_fr[varIndex];
  } else if (answers.relationshipDifficulty === "trust") {
    const warnTrust_fr = [
      "Ne laissez pas vos peurs ou trahisons passées gâcher les opportunités de confiance d'aujourd'hui. Les astres vous poussent vers l'ouverture d'âme, tout en maintenant un discernement sain.",
      "Attention à la tentation de vous fermer ou de suspecter les intentions d'autrui sans preuve. Accordez le bénéfice du doute tout en observant avec calme. Votre intuition sait faire la différence.",
      "Le ciel vous conseille de libérer les vieux ressentiments. Garder une rancœur revient à boire du poison en espérant que l'autre en souffre. Pardonnez pour votre propre libération vibratoire."
    ];
    const warnTrust_en = [
      "Do not let your past fears or betrayals ruin today's opportunities for trust. The stars push you toward opening your soul, while maintaining healthy discernment.",
      "Beware of the temptation to shut down or suspect others' intentions without proof. Grant the benefit of the doubt while observing calmly. Your intuition knows the difference.",
      "The sky advises you to release old resentments. Keeping a grudge is like drinking poison and expecting the other to suffer. Forgive for your own vibrational liberation."
    ];
    warning = lang === "en" ? warnTrust_en[varIndex] : warnTrust_fr[varIndex];
  } else { // sponge / other default
    const warnSponge_fr = [
      "Vous absorbez trop facilement le stress ambiant de vos proches aujourd'hui. Imaginez une bulle de lumière dorée autour de vous pour filtrer leurs énergies et préserver votre cocon.",
      "Avertissement céleste : attention aux vampires énergétiques dans votre entourage. Ne vous sentez pas obligé(e) de résoudre tous les problèmes du monde. Protégez votre propre taux vibratoire.",
      "Ne vous laissez pas contaminer par les ondes négatives ou les plaintes répétatives d'autrui. Sachez écouter mais aussi écourter les discussions qui plombent votre moral. Posez vos limites."
    ];
    const warnSponge_en = [
      "You absorb surrounding stress too easily today. Imagine a bubble of golden light around you to filter out negative energies and preserve your cocoon.",
      "Celestial warning: beware of energy vampires in your surroundings. Do not feel obligated to solve all the world's problems. Protect your own vibration rate.",
      "Do not let yourself be contaminated by negative waves or repetitive complaints from others. Know how to listen but also cut short discussions that weigh on your morale. Set your boundaries."
    ];
    warning = lang === "en" ? warnSponge_en[varIndex] : warnSponge_fr[varIndex];
  }

  // 6. Affirmation Section (3 variations based on mainGoal)
  let affirmation = "";
  if (mainGoal === "love") {
    const affirmLove_fr = [
      "Je mérite d'aimer et d'être aimé(e) inconditionnellement pour qui je suis vraiment.",
      "Mon cœur est ouvert, purifié et prêt à accueillir une harmonie relationnelle sincère.",
      "Je diffuse de l'amour bienveillant et l'univers me le renvoie au centuple aujourd'hui."
    ];
    const affirmLove_en = [
      "I deserve to love and be loved unconditionally for who I truly am.",
      "My heart is open, purified, and ready to welcome a sincere relational harmony.",
      "I radiate benevolent love and the universe returns it to me a hundredfold today."
    ];
    affirmation = lang === "en" ? affirmLove_en[varIndex] : affirmLove_fr[varIndex];
  } else if (mainGoal === "career") {
    const affirmCareer_fr = [
      "J'attire l'abondance, le succès et l'accomplissement professionnel avec une facilité déconcertante.",
      "Je possède toutes les compétences nécessaires pour matérialiser mes visions les plus nobles.",
      "Chaque action professionnelle que je pose aujourd'hui me rapproche de ma liberté financière."
    ];
    const affirmCareer_en = [
      "I attract abundance, success, and professional fulfillment with disconcerting ease.",
      "I possess all the skills necessary to materialize my noblest visions.",
      "Every professional action I take today brings me closer to my financial freedom."
    ];
    affirmation = lang === "en" ? affirmCareer_en[varIndex] : affirmCareer_fr[varIndex];
  } else if (mainGoal === "peace") {
    const affirmPeace_fr = [
      "Mon esprit est un océan de calme. Je respire la sérénité et je repousse le chaos sans effort.",
      "Je lâche prise sur ce que je ne peux contrôler. J'ai une confiance absolue dans le plan de l'univers.",
      "La paix intérieure est ma boussole. Rien dans le monde extérieur ne peut perturber mon calme divin."
    ];
    const affirmPeace_en = [
      "My mind is an ocean of calm. I breathe in serenity and repel chaos effortlessly.",
      "I let go of what I cannot control. I have absolute trust in the universe's plan.",
      "Inner peace is my compass. Nothing in the outer world can disturb my divine calm."
    ];
    affirmation = lang === "en" ? affirmPeace_en[varIndex] : affirmPeace_fr[varIndex];
  } else { // growth / other
    const affirmGrowth_fr = [
      "Chaque défi est un cadeau céleste conçu pour éveiller ma force intérieure et ma sagesse divine.",
      "Je m'aligne chaque jour davantage sur mon chemin de vie et ma mission d'âme sacrée.",
      "Je remercie l'univers pour les leçons d'aujourd'hui qui font grandir ma conscience."
    ];
    const affirmGrowth_en = [
      "Every challenge is a celestial gift designed to awaken my inner strength and divine wisdom.",
      "I align myself more each day with my life path and my sacred soul mission.",
      "I thank the universe for today's lessons that expand my consciousness."
    ];
    affirmation = lang === "en" ? affirmGrowth_en[varIndex] : affirmGrowth_fr[varIndex];
  }

  return {
    general,
    love,
    loveStars,
    career,
    careerStars,
    wellbeing,
    wellbeingStars,
    warning,
    affirmation
  };
}

// Generate weekly/monthly forecasts dynamically based on calendar dates (bilingue)
function generateForecasts(report, lang = "fr") {
  const zodiac = report.zodiac;
  const lp = report.lifePath ? report.lifePath.number : 7;
  const currentDate = new Date();
  
  const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const pastDaysOfYear = (currentDate - firstDayOfYear) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  const activeZodiacName = lang === "en" ? zodiac.name_en : zodiac.name;
  const activeRuler = lang === "en" ? zodiac.ruler_en : zodiac.ruler;

  const locale = lang === "en" ? "en-US" : "fr-FR";
  const monthName = currentDate.toLocaleDateString(locale, { month: "long" });
  const monthCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  const yearNum = currentDate.getFullYear();

  // Weekly Forecast Arrays
  const weeklyIntro_fr = [
    `Pour cette semaine ${weekNum}, les natifs du ${activeZodiacName} entrent dans une phase d'alignement vibratoire favorisée par les transits de leur planète régente ${activeRuler}.`,
    `Les courants célestes de la semaine ${weekNum} vous invitent solennellement à faire le tri dans vos relations, natifs du ${activeZodiacName}.`,
    `Sous l'influence d'un aspect harmonieux de votre planète ${activeRuler}, la semaine ${weekNum} s'annonce riche en révélations intérieures pour vous.`
  ];
  const weeklyIntro_en = [
    `For this week ${weekNum}, natives of ${activeZodiacName} enter a phase of vibrational alignment favored by the transits of their ruling planet ${activeRuler}.`,
    `The celestial currents of week ${weekNum} solemnly invite you to sort through your relationships, natives of ${activeZodiacName}.`,
    `Under the influence of a harmonious aspect of your planet ${activeRuler}, week ${weekNum} promises to be rich in inner revelations for you.`
  ];

  const weeklyMid_fr = [
    `Votre Chemin de Vie ${lp} indique que le milieu de semaine sera parfait pour initier des discussions sérieuses ou concrétiser des projets professionnels mis en attente. Un élan créatif inattendu se manifestera.`,
    `Le climat de cette semaine indique un besoin urgent de poser des limites. Votre vibration de Chemin de Vie ${lp} vous aidera à dire non avec bienveillance mais fermeté face aux sollicitations excessives.`,
    `L'alignement astral actuel soutient votre sphère financière. Grâce à votre vibration active de Chemin de Vie ${lp}, une opportunité concrète ou une bonne intuition commerciale va se présenter.`
  ];
  const weeklyMid_en = [
    `Your Life Path ${lp} indicates that midweek will be perfect for initiating serious discussions or actualizing pending professional projects. An unexpected creative momentum will manifest.`,
    `This week's climate indicates an urgent need to set boundaries. Your Life Path ${lp} vibration will help you say no kindly but firmly face to excessive requests.`,
    `The current astral alignment supports your financial sphere. Thanks to your active Life Path ${lp} vibration, a concrete opportunity or good commercial intuition will present itself.`
  ];

  const weeklyEnd_fr = [
    `Le week-end se prêtera magnifiquement à un rituel de reconnexion corporelle. Ralentissez, offrez-vous du silence et laissez les réponses cosmiques venir à vous naturellement.`,
    `Profitez du week-end pour purifier votre cocon énergétique. Une marche en nature ou une déconnexion des écrans dimanche soir rechargera parfaitement vos batteries célestes.`,
    `La fin de semaine sera marquée par une belle complicité. Que vous soyez en couple ou célibataire, ouvrez votre cœur et laissez les synchronicités opérer sous la lune.`
  ];
  const weeklyEnd_en = [
    `The weekend will lend itself beautifully to a ritual of bodily reconnection. Slow down, grant yourself silence, and let cosmic answers come to you naturally.`,
    `Take advantage of the weekend to purify your energetic cocoon. A walk in nature or screen disconnect on Sunday night will perfectly recharge your celestial batteries.`,
    `The weekend will be marked by beautiful intimacy. Whether in a relationship or single, open your heart and let synchronicities operate under the moon.`
  ];

  const activeWeeklyIntro = lang === "en" ? weeklyIntro_en : weeklyIntro_fr;
  const activeWeeklyMid = lang === "en" ? weeklyMid_en : weeklyMid_fr;
  const activeWeeklyEnd = lang === "en" ? weeklyEnd_en : weeklyEnd_fr;

  const weeklyIntro = activeWeeklyIntro[(weekNum + activeZodiacName.length) % 3];
  const weeklyMid = activeWeeklyMid[(weekNum + lp) % 3];
  const weeklyEnd = activeWeeklyEnd[(weekNum) % 3];
  const weekly = `${weeklyIntro} ${weeklyMid} ${weeklyEnd}`;

  // Monthly Forecast Arrays
  const monthlyIntro_fr = [
    `Le mois de ${monthCapitalized} ${yearNum} s'annonce comme un véritable carrefour d'éveil pour les natifs du ${activeZodiacName}. Votre planète ${activeRuler} amorce un grand transit qui va illuminer votre ciel.`,
    `Une transition alchimique d'envergure marque le mois de ${monthCapitalized} ${yearNum} pour vous. Sous le regard bienveillant de ${activeRuler}, les verrous émotionnels du passé commencent à se dissoudre.`,
    `L'énergie dominante de ${monthCapitalized} ${yearNum} sera centrée sur l'expansion professionnelle et l'affirmation de soi pour les natifs du ${activeZodiacName}.`
  ];
  const monthlyIntro_en = [
    `The month of ${monthCapitalized} ${yearNum} promises to be a true crossroads of awakening for natives of ${activeZodiacName}. Your planet ${activeRuler} begins a major transit that will illuminate your sky.`,
    `A major alchemical transition marks the month of ${monthCapitalized} ${yearNum} for you. Under the benevolent gaze of ${activeRuler}, emotional blocks of the past begin to dissolve.`,
    `The dominant energy of ${monthCapitalized} ${yearNum} will center on professional expansion and self-assertion for natives of ${activeZodiacName}.`
  ];

  const monthlyCore_fr = [
    `Ce mois-ci, le cosmos vous met au défi de dépasser vos croyances limitantes. C'est le moment idéal pour lancer de nouveaux projets ambitieux ou entamer une reconversion. La chance vous accompagne.`,
    `Les astres favorisent les rituels de guérison du cœur. Vous ressentirez un besoin viscéral d'aligner vos actions extérieures avec vos désirs d'âme secrets. Écoutez votre intuition sans douter.`,
    `Votre météo astrale mensuelle indique une superbe fluidité matérielle. Les blocages récents s'estompent au profit d'une belle abondance, portée par un excellent magnétisme céleste.`
  ];
  const monthlyCore_en = [
    `This month, the cosmos challenges you to move past limiting beliefs. It is the perfect time to launch ambitious new projects or start a career change. Good luck is with you.`,
    `The stars favor heart-healing rituals. You will feel a visceral need to align your outer actions with secret soul desires. Listen to your intuition without doubting.`,
    `Your monthly astral weather indicates superb material fluidity. Recent blockages fade in favor of a beautiful abundance, carried by an excellent celestial magnetism.`
  ];

  const monthlyOutro_fr = [
    `Côté cœur, la fin du mois vous réserve des moments chaleureux et profonds. Laissez de côté le besoin de contrôle et savourez l'instant présent.`,
    `Prenez soin de votre corps tout au long du mois. C'est en respectant vos limites physiques que vous parviendrez à maintenir ce haut taux vibratoire.`,
    `La lunaison de fin de mois agira comme un projecteur sur vos ambitions secrètes. Osez briller sans excuses et accueillez le succès qui vient vers vous.`
  ];
  const monthlyOutro_en = [
    `On the relationship side, the end of the month holds warm, profound moments for you. Leave aside the need for control and savor the present moment.`,
    `Take care of your body throughout the month. It is by respecting your physical limits that you will succeed in maintaining this high vibration rate.`,
    `The lunation at the end of the month will act as a spotlight on your secret ambitions. Dare to shine without excuses and welcome the success coming your way.`
  ];

  const activeMonthlyIntro = lang === "en" ? monthlyIntro_en : monthlyIntro_fr;
  const activeMonthlyCore = lang === "en" ? monthlyCore_en : monthlyCore_fr;
  const activeMonthlyOutro = lang === "en" ? monthlyOutro_en : monthlyOutro_fr;

  const monthlyIntro = activeMonthlyIntro[(currentDate.getMonth() + activeZodiacName.length) % 3];
  const monthlyCore = activeMonthlyCore[(currentDate.getMonth() + lp) % 3];
  const monthlyOutro = activeMonthlyOutro[(currentDate.getMonth()) % 3];
  const monthly = `${monthlyIntro} ${monthlyCore} ${monthlyOutro}`;

  return { weekly, monthly };
}
