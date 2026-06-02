// Moteur Astrologique et de Guidance Émotionnelle de Moonly (Astrologie & Numérologie)

const ZODIAC_SIGNS = [
  { name: "Capricorne", symbol: "♑", dates: "22 déc. - 19 jan.", element: "Terre", ruler: "Saturne" },
  { name: "Verseau", symbol: "♒", dates: "20 jan. - 18 fév.", element: "Air", ruler: "Uranus" },
  { name: "Poissons", symbol: "♓", dates: "19 fév. - 20 mars", element: "Eau", ruler: "Neptune" },
  { name: "Bélier", symbol: "♈", dates: "21 mars - 19 avr.", element: "Feu", ruler: "Mars" },
  { name: "Taureau", symbol: "♉", dates: "20 avr. - 20 mai", element: "Terre", ruler: "Vénus" },
  { name: "Gémeaux", symbol: "♊", dates: "21 mai - 20 juin", element: "Air", ruler: "Mercure" },
  { name: "Cancer", symbol: "♋", dates: "21 juin - 22 juil.", element: "Eau", ruler: "Lune" },
  { name: "Lion", symbol: "♌", dates: "23 juil. - 22 août", element: "Feu", ruler: "Soleil" },
  { name: "Vierge", symbol: "♍", dates: "23 août - 22 sept.", element: "Terre", ruler: "Mercure" },
  { name: "Balance", symbol: "♎", dates: "23 sept. - 22 oct.", element: "Air", ruler: "Vénus" },
  { name: "Scorpion", symbol: "♏", dates: "23 oct. - 21 nov.", element: "Eau", ruler: "Pluton" },
  { name: "Sagittaire", symbol: "♐", dates: "22 nov. - 21 déc.", element: "Feu", ruler: "Jupiter" }
];

// Helper to get Zodiac Sign from date
function getZodiacInfo(dateString) {
  if (!dateString) return ZODIAC_SIGNS[5]; // Default to Gémeaux if error
  
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS[0]; // Capricorne
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[1]; // Verseau
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return ZODIAC_SIGNS[2]; // Poissons
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[3]; // Bélier
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[4]; // Taureau
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS[5]; // Gémeaux
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[6]; // Cancer
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[7]; // Lion
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[8]; // Vierge
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS[9]; // Balance
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS[10]; // Scorpion
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[11]; // Sagittaire
  
  return ZODIAC_SIGNS[5];
}

// ----------------------------------------------------
// NOUVEAUTÉ : ALGORITHMES DE CALCUL DE NUMÉROLOGIE
// ----------------------------------------------------

// Calcul du Chemin de Vie (date de naissance)
function calculateLifePath(dateString) {
  if (!dateString) return { number: 7, name: "Le Chercheur / Le Sage", desc: "Esprit analytique, profondément connecté à la vérité cachée." };
  
  // Remplacer tout caractère non numérique pour avoir le format YYYYMMDD
  const digits = dateString.replace(/\D/g, "");
  let sum = 0;
  for (let char of digits) {
    sum += parseInt(char);
  }
  
  // Fonction récursive de réduction numérologique
  function reduce(num) {
    if (num === 11 || num === 22 || num === 33) return num; // Maîtres Nombres non réduits
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
  };
  
  return {
    number: num,
    name: descriptions[num] ? descriptions[num].name : "Le Sage",
    desc: descriptions[num] ? descriptions[num].desc : "Chercheur de vérité"
  };
}

// Calcul des Nombres d'Expression, Intime & Réalisation (nom de naissance complet)
function calculateNumerologyFromName(fullName) {
  if (!fullName) return { expression: 3, soulUrge: 3, personality: 9, expressionText: "Vibration créative.", soulUrgeText: "Désir d'harmonie.", personalityText: "Chaleur sociale." };
  
  const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleanName) return { expression: 3, soulUrge: 3, personality: 9, expressionText: "Vibration créative.", soulUrgeText: "Désir d'harmonie.", personalityText: "Chaleur sociale." };
  
  // Grille de Pythagore
  const pythagorean = {
    a:1, j:1, s:1,
    b:2, k:2, t:2,
    c:3, l:3, u:3,
    d:4, m:4, v:4,
    e:5, n:5, w:5,
    f:6, o:6, x:6,
    g:7, p:7, y:7,
    h:8, q:8, z:8,
    i:9, r:9
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
  };

  const soulUrgeDescriptions = {
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
  };
  
  return {
    expression,
    soulUrge,
    personality,
    expressionText: expressionDescriptions[expression] || "Créateur de sa propre voie.",
    soulUrgeText: soulUrgeDescriptions[soulUrge] || "Désir profond d'évolution.",
    personalityText: `Comment l'entourage perçoit votre aura sociale : vibration ${personality}.`
  };
}

// --- FIN DU NOUVEAU MODULE DE NUMÉROLOGIE ---

// Generate Custom Astrological & Numerological Report
function generatePersonalizedReport(answers) {
  const name = answers.name || "Ami(e) Cosmique";
  const zodiac = getZodiacInfo(answers.birthDate);
  
  // Calculate dynamic Chemin de Vie
  const lifePath = calculateLifePath(answers.birthDate);
  
  // Calculate name numerology
  const numerologyName = calculateNumerologyFromName(answers.fullName || name);
  
  // Calculate dominant energy profile based on answers
  let energyProfile = "Énergie Cosmique d'Alignement";
  let energyDescription = "Vous possédez une nature équilibrée, oscillant avec grâce entre l'action consciente et la réceptivité intuitive. Votre ciel actuel vous invite à harmoniser vos désirs terrestres avec vos aspirations spirituelles.";
  let energyScore = 78;
  
  if (answers.currentEnergy === "explosive" || answers.mainGoal === "career") {
    energyProfile = "Énergie Stellaire Créatrice";
    energyDescription = "Une vibration dynamique et solaire vous anime. Vous êtes dans un cycle d'expansion, de concrétisation et de leadership. Vos projets ont besoin d'une impulsion franche et déterminée pour éclore sous les meilleurs auspices.";
    energyScore = 92;
  } else if (answers.currentEnergy === "receptive" || answers.intuitionConnection === "fusion") {
    energyProfile = "Énergie Lunaire Intuitive";
    energyDescription = "Votre guidance intérieure bat son plein. Vous êtes extrêmement sensible aux vibrations environnantes et aux marées émotionnelles. C'est une période idéale pour écouter vos rêves, ralentir et cultiver votre sagesse cachée.";
    energyScore = 84;
  } else if (answers.relationship === "healing" || answers.dominantEmotion === "anxiety") {
    energyProfile = "Énergie Astrale de Guérison";
    energyDescription = "Vous traversez une phase alchimique de purification et de métamorphose. Le cosmos vous invite à libérer les anciennes mémoires, à guérir vos blessures de cœur et à restaurer votre cocon protecteur pour renaître plus fort(e).";
    energyScore = 65;
  }
  
  // Calculate strengths & blockages based on profile & zodiac elements & behavior answers
  let mainStrength = "Intuition aiguisée et empathie protectrice.";
  let blocker = "Tendance à absorber les énergies environnantes.";
  
  if (zodiac.element === "Feu") {
    mainStrength = "Passion débordante, courage inébranlable et capacité à inspirer les autres.";
    blocker = "Impatience chronique et tendance à s'éparpiller ou à s'épuiser prématurément.";
  } else if (zodiac.element === "Terre") {
    mainStrength = "Fiabilité absolue, ancrage pragmatique et persévérance dans les projets de vie.";
    blocker = "Rigidité mentale et peur du changement ou de l'inconnu affectif.";
  } else if (zodiac.element === "Air") {
    mainStrength = "Clarté intellectuelle, aisance sociale et esprit d'adaptation très fluide.";
    blocker = "Difficulté à s'ancrer dans le moment présent, dispersion mentale et intellectualisation des émotions.";
  } else if (zodiac.element === "Eau") {
    mainStrength = "Profondeur émotionnelle hors pair, empathie naturelle et instinct très protecteur.";
    blocker = "Hypersensibilité aux critiques et nostalgie d'un passé révolu.";
  }

  // ENRICHISSEMENT COMPORTEMENTAL : Comportement social
  if (answers.procheDistress === "sponge") {
    mainStrength = "Hyper-empathie alchimique, grande capacité à écouter intimement d'autres âmes.";
    blocker = "Sponge psychologique : vous absorbez trop la détresse d'autrui au détriment de votre propre taux vibratoire.";
  } else if (answers.socialBattery === "irritated") {
    blocker += " Lorsque votre batterie sociale s'épuise, des frictions relationnelles rapides peuvent émerger par irritation nerveuse.";
  }
  
  // Specific blocker based on answers.biggestBlockage or past issues
  if (answers.projectBlockage === "failure") {
    blocker = "La peur inconsciente de l'échec et du regard d'autrui paralyse momentanément votre élan créatif.";
  } else if (answers.relationshipDifficulty === "boundaries") {
    blocker = "Difficulté majeure à poser des limites claires et à dire 'non' par peur inconsciente de décevoir ou de perdre le lien.";
  } else if (answers.soulBlessing === "abandonment") {
    blocker = "La peur panique de l'isolement ou de l'abandon sabote vos élans amoureux réels.";
  } else if (answers.soulBlessing === "betrayal") {
    blocker = "Un besoin excessif de contrôle sur votre entourage né de la peur d'être trahi(e).";
  }

  // Astrological Ascendant calculation logic simulation
  let ascendant = "Balance";
  if (answers.birthTime) {
    const hours = parseInt(answers.birthTime.split(":")[0]);
    if (hours >= 6 && hours < 10) ascendant = "Lion";
    else if (hours >= 10 && hours < 14) ascendant = "Scorpion";
    else if (hours >= 14 && hours < 18) ascendant = "Verseau";
    else if (hours >= 18 && hours < 22) ascendant = "Taureau";
    else ascendant = "Poissons";
  } else {
    // Generate one pseudo-randomly based on name length
    const signs = ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"];
    ascendant = signs[(name.length + zodiac.name.length) % 12];
  }

  // Simulated AI Texts for report
  const favorableMonth = ["Septembre", "Octobre", "Novembre", "Décembre", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août"][(name.length + zodiac.name.length + 3) % 12];
  const luckyNumber = (name.length * zodiac.name.length + 7) % 99 + 1;

  // Create beautiful Daily Horoscope Contents
  const dailyHoroscope = generateDailyHoroscope(name, zodiac, answers, lifePath);
  
  return {
    name,
    zodiac,
    ascendant,
    energyProfile,
    energyDescription,
    energyScore,
    mainStrength,
    blocker,
    favorableMonth,
    luckyNumber,
    dailyHoroscope,
    lifePath,
    numerologyName
  };
}

// Generate detailed daily horoscope texts (incorporating Life Path)
function generateDailyHoroscope(name, zodiac, answers, lifePath) {
  const relationship = answers.relationship || "single";
  const mainGoal = answers.mainGoal || "growth";
  const currentEnergy = answers.currentEnergy || "receptive";
  const dominantEmotion = answers.dominantEmotion || "joy";
  
  const lpNum = lifePath ? lifePath.number : 7;

  // Templetized creative generation for premium effect
  let general = `Aujourd'hui, l'influence de votre planète régente, ${zodiac.ruler}, conjuguée à votre signature vibratoire du **Chemin de Vie ${lpNum}**, crée une atmosphère propice aux révélations personnelles. ${name}, vous ressentirez un puissant élan intérieur pour réorganiser vos priorités fondamentales et concrétiser vos aspirations d'âme.`;
  
  if (currentEnergy === "explosive") {
    general = `Votre ciel s'embrase d'une superbe vitalité sous l'impulsion de votre planète régente, ${zodiac.ruler}. C'est une journée hautement magnétique, ${name}. Votre force d'attraction, portée par votre **Chemin de Vie ${lpNum}**, est décuplée : utilisez cette étincelle pour lancer des initiatives courageuses ou clarifier des non-dits persistants. Les astres conspirent en votre faveur.`;
  } else if (currentEnergy === "tired") {
    general = `Les influx cosmiques d'aujourd'hui vous invitent solennellement au repli bienveillant, ${name}. Votre planète ${zodiac.ruler} forme un aspect de ralentissement. Ne forcez aucun événement. Utilisez ce moment pour vous régénérer, purifier vos pensées et accorder à votre esprit le repos qu'il réclame silencieusement depuis plusieurs jours. Votre vibrations de **Chemin de Vie ${lpNum}** vous soutiennent dans l'ancrage.`;
  }
  
  // Love Section based on relationship and social behaviors
  let love = "Vos relations sont placées sous le signe de la douceur et du dialogue constructif. Ouvrez votre cœur aux opportunités inattendues.";
  let loveStars = 4;
  if (relationship === "single") {
    love = `Célibataire, l'alignement planétaire actuel vous invite à vous aimer d'abord pleinement pour rayonner à l'extérieur. Un regard, une discussion anodine ou une synchronicité troublante au détour d'un chemin pourrait éveiller votre curiosité. Ne fermez aucune porte par peur d'être vulnérable. Vos guides vous conseillent de soigner vos blessures d'amour passées.`;
    loveStars = 4;
  } else if (relationship === "couple") {
    love = `En couple, le climat astral est propice à une complicité renouvelée. Cependant, veillez à ne pas projeter vos attentes inexprimées sur votre partenaire. Une discussion authentique autour d'un projet commun ou d'une émotion partagée renforcera profondément vos liens d'âme.`;
    loveStars = 5;
  } else if (relationship === "complicated") {
    love = `Le flou affectif qui vous entoure commence à se dissiper doucement. Les planètes vous recommandent d'arrêter d'intellectualiser vos sentiments. Laissez parler votre corps et votre intuition. Fixez des limites saines : vous méritez une relation fluide et sereine, libre de toute ambiguïté.`;
    loveStars = 3;
  } else if (relationship === "healing") {
    love = `Vous êtes dans une merveilleuse phase de reconstruction sentimentale. Le cosmos panse vos plaies affectives avec patience. Prenez le temps de savourer votre liberté et votre espace personnel. L'amour authentique arrivera naturellement lorsque vous aurez parachevé ce cycle de régénération.`;
    loveStars = 3;
  }

  // Behavior specifics in love
  if (answers.relationshipDifficulty === "boundaries") {
    love += " Point d'attention céleste aujourd'hui : osez dire 'non' à votre entourage amoureux pour préserver votre précieux espace intérieur.";
  }

  // Career Section based on mainGoal
  let career = "Une belle opportunité d'organisation s'offre à vous. Concentrez-vous sur l'essentiel et laissez de côté le superflu.";
  let careerStars = 4;
  if (mainGoal === "career") {
    career = `Vos ambitions professionnelles reçoivent un coup de pouce du destin. C'est le moment idéal pour proposer vos idées créatives, solliciter un entretien ou restructurer vos priorités. Ne reculez pas devant les défis : votre ciel indique que vous disposez de toutes les ressources nécessaires pour franchir un nouveau palier.`;
    careerStars = 5;
  } else if (mainGoal === "love") {
    career = `Au travail, veillez à ne pas vous laisser déborder par vos émotions ou l'humeur de vos collaborateurs. Restez concentré(e) sur vos tâches tout en maintenant une distance saine. Votre sensibilité est une force, mais aujourd'hui, elle requiert un bouclier protecteur pour éviter de disperser votre précieuse énergie.`;
    careerStars = 4;
  } else if (mainGoal === "peace") {
    career = `Une journée calme sur le plan professionnel. C'est l'occasion parfaite d'épurer votre espace de travail, de trier vos dossiers en cours et de planifier la suite avec détachement. Évitez les conflits stériles de bureau et privilégiez la diplomatie silencieuse pour garder votre paix intérieure.`;
    careerStars = 4;
  } else if (mainGoal === "growth") {
    career = `Vous commencez à percevoir le lien étroit entre vos peurs intérieures et vos choix professionnels. Une situation d'aujourd'hui va agir comme un miroir, vous invitant à dépasser le syndrome de l'imposteur. Relevez la tête : vos compétences sont réelles et attendent d'être pleinement assumées.`;
    careerStars = 4;
  }

  // Wellbeing Section based on dominantEmotion
  let wellbeing = "Votre corps vous parle, sachez l'écouter. Une marche en nature ou une séance d'étirements doux fera des miracles.";
  let wellbeingStars = 4;
  if (dominantEmotion === "anxiety" || answers.stressLevel >= "4") {
    wellbeing = `Votre mental tourne à plein régime, créant une tension dans vos trapèzes ou votre respiration. Stoppez tout quelques minutes. Pratiquez une respiration ventrale profonde en expirant par la bouche. Hydratez-vous abondamment et éloignez-vous des écrans ce soir pour reposer vos yeux et votre esprit.`;
    wellbeingStars = 3;
  } else if (dominantEmotion === "joy" || currentEnergy === "explosive") {
    wellbeing = `Votre harmonie corps-esprit est excellente aujourd'hui ! Vous rayonnez d'une vitalité saine. Profitez de ce flux pour pratiquer une activité sportive épanouissante, danser ou simplement propager vos ondes positives. Veillez toutefois à ne pas épuiser toutes vos réserves en une fois.`;
    wellbeingStars = 5;
  } else if (dominantEmotion === "introspection") {
    wellbeing = `Une douce mélancolie ou un besoin intense de solitude vous habite. Accueillez cette météo intérieure sans jugement. Une infusion relaxante, la lecture d'un livre inspirant ou un bain chaud aromatique vous aideront à aligner vos chakras et à nourrir votre intériorité.`;
    wellbeingStars = 4;
  }

  // Warning Section based on blockage
  let warning = "Attention à ne pas absorber la colère ou le stress d'autrui aujourd'hui. Fixez des limites claires et bienveillantes.";
  if (answers.projectBlockage === "procrastination") {
    warning = "Méfiez-vous de la tentation de remettre à demain ce qui peut être accompli en cinq minutes. La procrastination est souvent la peur cachée de mal faire.";
  } else if (answers.projectBlockage === "dispersion") {
    warning = "Attention au piège de l'overthinking nocturne et de la dispersion. Notez vos idées sur un carnet avant de dormir pour libérer définitivement votre charge mentale.";
  } else if (answers.relationshipDifficulty === "trust") {
    warning = "Ne laissez pas vos peurs ou trahisons passées gâcher les opportunités de confiance d'aujourd'hui. Les astres vous poussent vers l'ouverture d'âme.";
  } else if (answers.procheDistress === "sponge") {
    warning = "Vous absorbez trop facilement le stress ambiant de vos collaborateurs. Imaginez une bulle de lumière dorée autour de vous pour filtrer leurs énergies.";
  }

  // Affirmation
  let affirmation = "Je suis centré(e), aligné(e) et je fais pleinement confiance au déroulement parfait de ma vie.";
  if (mainGoal === "love") {
    affirmation = "Je mérite d'aimer et d'être aimé(e) inconditionnellement pour qui je suis vraiment.";
  } else if (mainGoal === "career") {
    affirmation = "J'attire l'abondance, le succès et l'accomplissement professionnel avec une facilité déconcertante.";
  } else if (mainGoal === "peace") {
    affirmation = "Mon esprit est un océan de calme. Je respire la sérénité et je repousse le chaos sans effort.";
  } else if (mainGoal === "growth") {
    affirmation = "Chaque défi est un cadeau céleste conçu pour éveiller ma force intérieure et ma sagesse divine.";
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

// Generate weekly/monthly forecasts for Premium Dashboard
function generateForecasts(report) {
  const zodiac = report.zodiac;
  const name = report.name;

  const weekly = `Cette semaine s'annonce riche en synchronicités pour les natifs du ${zodiac.name}. Les premiers jours seront axés sur la restructuration de vos finances ou de votre lieu de vie. Le milieu de semaine verra un rapprochement affectif majeur, facilité par un bel aspect protecteur de Vénus. Dimanche, profitez d'une lune introspective pour méditer et poser vos intentions pour le cycle à venir.`;
  const monthly = `Le mois de juin 2026 sera marqué par une transition alchimique d'envergure. Votre planète régente, ${zodiac.ruler}, entame un transit harmonieux qui va débloquer des situations professionnelles en suspens depuis le printemps. C'est le moment d'oser prendre des risques mesurés et de faire confiance à votre intuition. Côté cœur, l'été s'annonce chaleureux et passionné.`;

  return { weekly, monthly };
}
