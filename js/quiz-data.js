const QUIZ_QUESTIONS = [
  // --- ÉTAPE 1 : L'IDENTITÉ CÉLESTE & SIGNATURE VIBRATOIRE ---
  {
    id: "name",
    category: "Signature Céleste",
    question: "Comment doit-on vous appeler au quotidien ?",
    type: "text",
    placeholder: "Votre prénom d'usage...",
    label: "Prénom"
  },
  {
    id: "fullName",
    category: "Signature Céleste",
    question: "Quel est votre nom de naissance complet ?",
    type: "text",
    placeholder: "Prénoms et nom de famille de naissance...",
    label: "Nom complet de naissance"
  },
  {
    id: "birthDate",
    category: "Signature Céleste",
    question: "Quel jour précis êtes-vous venu(e) au monde ?",
    type: "date",
    label: "Date de Naissance"
  },
  {
    id: "hasBirthTime",
    category: "Signature Céleste",
    question: "Connaissez-vous votre heure précise de naissance ?",
    type: "choice",
    options: [
      { value: "yes", text: "Oui, je la connais précisément" },
      { value: "approx", text: "J'ai une heure approximative" },
      { value: "no", text: "Non, je ne la connais pas" }
    ]
  },
  {
    id: "birthTime",
    category: "Signature Céleste",
    question: "Quelle est cette heure de naissance ?",
    type: "time",
    label: "Heure de Naissance",
    optional: true // Only displayed conditionally or optional
  },
  {
    id: "birthPlace",
    category: "Signature Céleste",
    question: "Dans quelle ville et pays êtes-vous né(e) ?",
    type: "text",
    placeholder: "Ex: Paris, France...",
    label: "Lieu de Naissance"
  },
  {
    id: "gender",
    category: "Signature Céleste",
    question: "Quel est votre genre céleste de prédilection ?",
    type: "choice",
    options: [
      { value: "female", text: "Féminin" },
      { value: "male", text: "Masculin" },
      { value: "non-binary", text: "Non-binaire / Autre" },
      { value: "private", text: "Je préfère garder cela secret" }
    ]
  },
  {
    id: "mirrorHours",
    category: "Signature Céleste",
    question: "Êtes-vous interpellé(e) par des heures miroirs (ex: 11:11, 22:22) ou des chiffres répétitifs ?",
    type: "choice",
    options: [
      { value: "daily", text: "Oui, quotidiennement" },
      { value: "sometimes", text: "Parfois, de temps en temps" },
      { value: "rarely", text: "Rarement" },
      { value: "never", text: "Non, je n'y prête pas attention" }
    ]
  },
  {
    id: "attractedNumber",
    category: "Signature Céleste",
    question: "Quel chiffre unique, de 1 à 9, vous attire le plus instinctivement ?",
    type: "choice",
    options: [
      { value: "1", text: "Chiffre 1 (L'Élan)" },
      { value: "2", text: "Chiffre 2 (L'Harmonie)" },
      { value: "3", text: "Chiffre 3 (La Créativité)" },
      { value: "4", text: "Chiffre 4 (La Stabilité)" },
      { value: "5", text: "Chiffre 5 (La Liberté)" },
      { value: "6", text: "Chiffre 6 (L'Équilibre)" },
      { value: "7", text: "Chiffre 7 (La Sagesse)" },
      { value: "8", text: "Chiffre 8 (Le Pouvoir)" },
      { value: "9", text: "Chiffre 9 (L'Altruisme)" }
    ]
  },

  // --- ÉTAPE 2 : LE PAYSAGE ÉMOTIONNEL & MÉTÉO INTÉRIEURE ---
  {
    id: "dominantEmotion",
    category: "Météo Intérieure",
    question: "Quelle est l'émotion dominante dans votre esprit au réveil ?",
    type: "choice",
    options: [
      { value: "joy", text: "Sérénité vibrante / Enthousiasme" },
      { value: "tired", text: "Fatigue sourde / Manque d'élan" },
      { value: "anxiety", text: "Anxiété diffuse / Inquiétude" },
      { value: "creative", text: "Élan créatif / Idées bouillonnantes" },
      { value: "nostalgia", text: "Nostalgie douce / Mélancolie" }
    ]
  },
  {
    id: "stressLevel",
    category: "Météo Intérieure",
    question: "Comment évaluez-vous la tension nerveuse accumulée en vous ?",
    type: "choice",
    options: [
      { value: "1", text: "Calme absolu (Niveau 1)" },
      { value: "2", text: "Brise légère (Niveau 2)" },
      { value: "3", text: "Tension modérée (Niveau 3)" },
      { value: "4", text: "Haute tension (Niveau 4)" },
      { value: "5", text: "Tempête nerveuse (Niveau 5)" }
    ]
  },
  {
    id: "imprevuReaction",
    category: "Météo Intérieure",
    question: "Face à un obstacle imprévu, quelle est votre réaction réflexe ?",
    type: "choice",
    options: [
      { value: "logic", text: "L'analyse logique et froide" },
      { value: "panic", text: "La vague d'anxiété ou de panique" },
      { value: "action", text: "L'action impulsive et immédiate" },
      { value: "retreat", text: "Le besoin de retrait pour digérer" }
    ]
  },
  {
    id: "refugeEmotion",
    category: "Météo Intérieure",
    question: "Où se réfugie votre esprit quand vos émotions débordent ?",
    type: "choice",
    options: [
      { value: "solitude", text: "Dans le silence et l'isolement complet" },
      { value: "friend", text: "Auprès d'une oreille attentive" },
      { value: "creative", text: "Dans l'art, l'écriture ou le sport" },
      { value: "sleep", text: "Dans le sommeil ou le repli sur soi" }
    ]
  },
  {
    id: "intuitionConnection",
    category: "Météo Intérieure",
    question: "À quel point vous sentez-vous connecté(e) à votre intuition ?",
    type: "choice",
    options: [
      { value: "fusion", text: "Fusion totale, je la suis toujours" },
      { value: "complicity", text: "Bonne complicité, elle m'aide souvent" },
      { value: "disconnected", text: "Déconnexion fréquente, j'intellectualise trop" },
      { value: "rational", text: "Rationnel(le) absolu(e), je crois aux faits" }
    ]
  },
  {
    id: "sleepQuality",
    category: "Météo Intérieure",
    question: "Comment décririez-vous la qualité de votre sommeil récent ?",
    type: "choice",
    options: [
      { value: "deep", text: "Profond, réparateur et plein de rêves" },
      { value: "restless", text: "Agité, haché et interrompu" },
      { value: "short", text: "Trop court par manque de temps" },
      { value: "light", text: "Calme mais superficiel et peu réparateur" }
    ]
  },
  {
    id: "colorAttraction",
    category: "Signature Céleste",
    question: "Quelle nuance de couleur vous appelle pour votre équilibre intérieur ?",
    type: "choice",
    options: [
      { value: "violet", text: "Le Violet céleste (Méditation)" },
      { value: "gold", text: "L'Or sablé (Éclat & Vitalité)" },
      { value: "green", text: "Le Vert émeraude (Régénération)" },
      { value: "blue", text: "Le Bleu nuit (Apaisement)" }
    ]
  },
  {
    id: "solitudeFreq",
    category: "Météo Intérieure",
    question: "À quelle fréquence vous accordez-vous un moment d'introspection ?",
    type: "choice",
    options: [
      { value: "daily", text: "Chaque jour sans exception" },
      { value: "weekly", text: "Deux à trois fois par semaine" },
      { value: "monthly", text: "Une fois par mois" },
      { value: "never", text: "Presque jamais, je fuis le vide" }
    ]
  },

  // --- ÉTAPE 3 : LE COMPORTEMENT SOCIAL & LA RELATION AUX AUTRES ---
  {
    id: "groupRole",
    category: "Comportement Social",
    question: "Au sein d'un groupe, quel rôle adoptez-vous tout naturellement ?",
    type: "choice",
    options: [
      { value: "leader", text: "Le guide ou leader inspirant" },
      { value: "mediator", text: "Le médiateur calme et harmonieux" },
      { value: "observer", text: "L'observateur discret et analytique" },
      { value: "entertainer", text: "L'animateur chaleureux et drôle" }
    ]
  },
  {
    id: "socialBattery",
    category: "Comportement Social",
    question: "Quand votre batterie sociale est vide, que faites-vous ?",
    type: "choice",
    options: [
      { value: "slip", text: "Je m'éclipse discrètement sans prévenir" },
      { value: "silent", text: "Je deviens très silencieux(se) et distant(e)" },
      { value: "forced", text: "Je me force à sourire par convenance" },
      { value: "irritated", text: "Je m'irrite et perds patience facilement" }
    ]
  },
  {
    id: "procheDistress",
    category: "Comportement Social",
    question: "Face à la détresse émotionnelle d'un proche, vous êtes :",
    type: "choice",
    options: [
      { value: "sponge", text: "L'éponge psychologique : j'absorbe sa tristesse" },
      { value: "solver", text: "Le solutionneur : je cherche des solutions concrètes" },
      { value: "pillar", text: "Le pilier : je reste fort(e) et stable sans absorber" },
      { value: "distance", text: "Le recul : je me protège en mettant de la distance" }
    ]
  },
  {
    id: "relationshipDifficulty",
    category: "Comportement Social",
    question: "Quelle est votre plus grande difficulté dans vos relations ?",
    type: "choice",
    options: [
      { value: "boundaries", text: "Dire non et poser des limites claires" },
      { value: "trust", text: "Faire confiance et baisser la garde" },
      { value: "expression", text: "Exprimer clairement mes besoins" },
      { value: "hypocrisy", text: "Gérer l'incohérence et la superficialité" }
    ]
  },
  {
    id: "trustBreaker",
    category: "Comportement Social",
    question: "Qu'est-ce qui brise instantanément votre confiance chez autrui ?",
    type: "choice",
    options: [
      { value: "betrayal", text: "La trahison, le mensonge ou le secret" },
      { value: "disrespect", text: "Le manque de considération ou de politesse" },
      { value: "selfishness", text: "L'égoïsme et le manque de générosité" },
      { value: "inconstancy", text: "L'inconstance et l'instabilité émotionnelle" }
    ]
  },
  {
    id: "travelResourcing",
    category: "Exploration & Cycles",
    question: "Quel type d'environnement de voyage ressource le plus profondément votre esprit ?",
    type: "choice",
    options: [
      { value: "mountain", text: "Le silence des sommets et l'isolement des montagnes" },
      { value: "ocean", text: "Le ressac de l'océan et la chaleur du littoral" },
      { value: "forest", text: "La canopée forestière et l'ancrage dans la nature brute" },
      { value: "culture", text: "L'effervescence culturelle et l'exploration de ruines sacrées" }
    ]
  },
  {
    id: "conflictManagement",
    category: "Comportement Social",
    question: "Comment gérez-vous un conflit ouvert avec un proche ?",
    type: "choice",
    options: [
      { value: "dialogue", text: "Je cherche le dialogue constructif immédiatement" },
      { value: "silence", text: "Je me replie dans un silence protecteur ou punitif" },
      { value: "defense", text: "Je défends fermement ma position avec force" },
      { value: "flee", text: "Je fuis la confrontation à tout prix" }
    ]
  },
  {
    id: "loveExpression",
    category: "Comportement Social",
    question: "Comment exprimez-vous le plus naturellement votre affection ?",
    type: "choice",
    options: [
      { value: "words", text: "Paroles valorisantes & encouragements" },
      { value: "quality", text: "Moments exclusifs de haute qualité" },
      { value: "services", text: "Rendre des services concrets au quotidien" },
      { value: "gifts", text: "Cadeaux et petites attentions physiques" },
      { value: "touch", text: "Le contact physique et l'étreinte chaleureuse" }
    ]
  },
  {
    id: "circleEnergy",
    category: "Comportement Social",
    question: "Quelle énergie humaine cherchez-vous à attirer autour de vous ?",
    type: "choice",
    options: [
      { value: "ambitious", text: "Des esprits ambitieux et stimulants" },
      { value: "spiritual", text: "Des âmes douces, créatives et intuitives" },
      { value: "free", text: "Des esprits libres, aventureux et spontanés" },
      { value: "stable", text: "Des personnes stables, ancrées et fiables" }
    ]
  },

  // --- ÉTAPE 4 : L'ALIGNEMENT PROFESSIONNEL & LE RAPPORT À L'ABONDANCE ---
  {
    id: "professionalSituation",
    category: "Alignement & Carrière",
    question: "Quelle est votre situation professionnelle actuelle ?",
    type: "choice",
    options: [
      { value: "corporate", text: "Salarié(e) corporate ou institutionnel" },
      { value: "entrepreneur", text: "Entrepreneur, indépendant ou freelance" },
      { value: "creative", text: "Créatif(ve) libre ou artiste" },
      { value: "transition", text: "En transition, reconversion ou études" },
      { value: "looking", text: "En recherche active de sens ou d'emploi" }
    ]
  },
  {
    id: "ambitionDriver",
    category: "Alignement & Carrière",
    question: "Quel est le moteur principal de votre ambition ?",
    type: "choice",
    options: [
      { value: "impact", text: "L'impact profond et le sens de ma mission" },
      { value: "freedom", text: "La liberté totale de mon temps" },
      { value: "money", text: "L'abondance financière et la sécurité" },
      { value: "recognition", text: "La reconnaissance et l'excellence" }
    ]
  },
  {
    id: "lifeMissionAlign",
    category: "Alignement & Carrière",
    question: "Vous sentez-vous aligné(e) avec votre mission professionnelle ?",
    type: "choice",
    options: [
      { value: "aligned", text: "Parfaitement, je me sens sur mon chemin" },
      { value: "deviation", text: "Légère déviation, je cherche à m'ajuster" },
      { value: "lost", text: "Perte de sens, j'ai besoin de renouveau" },
      { value: "exploring", text: "En cours d'exploration de nouvelles voies" }
    ]
  },
  {
    id: "authorityPosture",
    category: "Alignement & Carrière",
    question: "Face à une figure d'autorité, quelle est votre posture instinctive ?",
    type: "choice",
    options: [
      { value: "collaboration", text: "Collaboration fluide et respectueuse" },
      { value: "question", text: "Remise en question et esprit critique" },
      { value: "rebellion", text: "Rébellion silencieuse ou évitement" },
      { value: "passive", text: "Retrait passif pour préserver ma paix" }
    ]
  },
  {
    id: "moneyAbundance",
    category: "Alignement & Carrière",
    question: "Comment décririez-vous votre relation avec l'argent ?",
    type: "choice",
    options: [
      { value: "fluid", text: "Fluide et confiante, j'attire l'abondance" },
      { value: "fear", text: "Tendue, j'ai souvent peur du manque" },
      { value: "detachment", text: "Détachée, ce n'est pas une priorité" },
      { value: "blocked", text: "Bloquée, je sens des plafonds de verre invisibles" }
    ]
  },
  {
    id: "impostorSyndrome",
    category: "Alignement & Carrière",
    question: "Ressentez-vous le syndrome de l'imposteur dans votre travail ?",
    type: "choice",
    options: [
      { value: "constantly", text: "Constamment, je doute de ma légitimité" },
      { value: "sometimes", text: "Parfois, lors de nouveaux challenges" },
      { value: "rarely", text: "Très rarement" },
      { value: "never", text: "Jamais, je connais ma valeur" }
    ]
  },
  {
    id: "projectBlockage",
    category: "Alignement & Carrière",
    question: "Quel est votre plus grand blocage dans l'expansion de vos projets ?",
    type: "choice",
    options: [
      { value: "failure", text: "La peur de l'échec ou du jugement" },
      { value: "procrastination", text: "La procrastination et le manque d'énergie" },
      { value: "dispersion", text: "La dispersion et le manque de focus" },
      { value: "clarity", text: "Le manque de clarté sur la vision" }
    ]
  },
  {
    id: "creativeEnvironment",
    category: "Alignement & Carrière",
    question: "Quel environnement de travail nourrit le plus votre productivité ?",
    type: "choice",
    options: [
      { value: "collective", text: "L'effervescence collective stimulante" },
      { value: "silence", text: "Le silence sacré et l'isolement complet" },
      { value: "nature", text: "Un cadre naturel ou hautement esthétique" },
      { value: "organized", text: "Une structure rigoureuse et très organisée" }
    ]
  },

  // --- ÉTAPE 5 : L'ESTIME DE SOI & BLESSURES DE L'ÂME ---
  {
    id: "selfLoveScore",
    category: "Estime de Soi",
    question: "Sur une échelle de 1 à 10, quel est votre amour-propre actuel ?",
    type: "choice",
    options: [
      { value: "low", text: "Besoin de guérison (1 à 4)" },
      { value: "medium", text: "En cours d'harmonisation (5 à 7)" },
      { value: "high", text: "Confiant et stable (8 à 10)" }
    ]
  },
  {
    id: "soulBlessing",
    category: "Estime de Soi",
    question: "Parmi ces cinq blessures de l'âme, laquelle résonne le plus en vous ?",
    type: "choice",
    options: [
      { value: "abandonment", text: "L'Abandon (Peur d'être seul(e))" },
      { value: "rejection", text: "Le Rejet (Peur de ne pas plaire)" },
      { value: "injustice", text: "L'Injustice (Besoin de rigidité/perfection)" },
      { value: "betrayal", text: "La Trahison (Besoin de contrôle absolu)" },
      { value: "humiliation", text: "L'Humiliation (Peur de la honte/jugement)" }
    ]
  },
  {
    id: "mirrorFirstFeel",
    category: "Estime de Soi",
    question: "Devant le miroir, quel sentiment émerge le plus spontanément ?",
    type: "choice",
    options: [
      { value: "kindness", text: "La bienveillance et l'acceptation douce" },
      { value: "critique", text: "Une autocritique immédiate sur un détail" },
      { value: "neutral", text: "Un détachement neutre et fonctionnel" },
      { value: "alignment", text: "La recherche d'un alignement de mon regard" }
    ]
  },
  {
    id: "limitingBelief",
    category: "Estime de Soi",
    question: "Quelle croyance limitante sabote le plus souvent vos élans ?",
    type: "choice",
    options: [
      { value: "not_good", text: "\"Je ne suis pas assez bien pour cela\"" },
      { value: "too_late", text: "\"C'est trop tard pour moi pour changer\"" },
      { value: "disappointed", text: "\"Je vais finir par être déçu(e) ou abandonné(e)\"" },
      { value: "deserve", text: "\"Je ne mérite pas le bonheur ou la réussite absolue\"" }
    ]
  },
  {
    id: "pastFailureReaction",
    category: "Estime de Soi",
    question: "Comment réagissez-vous face à vos erreurs ou échecs passés ?",
    type: "choice",
    options: [
      { value: "torture", text: "Je me torture l'esprit pendant des semaines" },
      { value: "learn", text: "J'analyse froidement pour en tirer des leçons" },
      { value: "accept", text: "J'accepte avec compassion et bienveillance" },
      { value: "forget", text: "J'essaie de tourner la page au plus vite" }
    ]
  },
  {
    id: "selfAuraGoal",
    category: "Estime de Soi",
    question: "Quel aspect de votre être souhaitez-vous le plus guérir ?",
    type: "choice",
    options: [
      { value: "unconditional_love", text: "Ma capacité à m'aimer sans conditions" },
      { value: "action_courage", text: "Mon courage pour passer à l'action sans peur" },
      { value: "serenity", text: "Ma sérénité face à l'inconnu de la vie" },
      { value: "connection", text: "Ma connexion aux autres sans peur d'être blessé(e)" }
    ]
  },
  {
    id: "characterTrait",
    category: "Paysage Intérieur",
    question: "Si vos proches devaient résumer votre tempérament profond en un mot :",
    type: "choice",
    options: [
      { value: "courageous", text: "Déterminé(e) et courageux(se)" },
      { value: "empathic", text: "Bienveillant(e) et empathique" },
      { value: "analytical", text: "Calme et réfléchi(e)" },
      { value: "creative", text: "Original(e) et libre" }
    ]
  },
  {
    id: "bodyLimits",
    category: "Estime de Soi",
    question: "À quel point respectez-vous les limites physiques de votre corps ?",
    type: "choice",
    options: [
      { value: "deferential", text: "J'écoute chaque signal avec soin" },
      { value: "sick", text: "Je ne l'écoute que lorsqu'il tombe malade" },
      { value: "push", text: "Je le pousse régulièrement au-delà de ses forces" },
      { value: "decode", text: "J'ai beaucoup de mal à décoder ses messages" }
    ]
  },

  // --- ÉTAPE 6 : PARAMÈTRES DE GUIDANCE & CÉLÉBRATION ---
  {
    id: "lunarPhaseSensitivity",
    category: "Guidance & Routine",
    question: "Ressentez-vous l'influence des phases de la Lune sur vos émotions ou votre sommeil ?",
    type: "choice",
    options: [
      { value: "high", text: "Oui, très fortement (surtout à la Pleine Lune)" },
      { value: "moderate", text: "Légèrement, mon sommeil est parfois perturbé" },
      { value: "curious", text: "Pas consciemment, mais je souhaite l'observer" },
      { value: "none", text: "Non, je ne ressens aucun impact particulier" }
    ]
  },
  {
    id: "gemstoneIntention",
    category: "Guidance & Routine",
    question: "Quelle pierre ou gemme précieuse résonne le plus avec votre intention de guérison actuelle ?",
    type: "choice",
    options: [
      { value: "amethyst", text: "L'Améthyste (Sérénité & Clarté spirituelle)" },
      { value: "rose_quartz", text: "Le Quartz Rose (Amour inconditionnel & Apaisement)" },
      { value: "citrine", text: "La Citrine (Abondance & Rayonnement personnel)" },
      { value: "tiger_eye", text: "L'Œil de Tigre (Protection & Force d'action)" }
    ]
  },
  {
    id: "guidanceTime",
    category: "Guidance & Routine",
    question: "À quel moment de la journée préférez-vous recevoir votre guidance ?",
    type: "choice",
    options: [
      { value: "morning", text: "Au saut du lit, pour impulser ma journée" },
      { value: "midday", text: "À la pause de midi, pour me recentrer" },
      { value: "evening", text: "Au coucher, pour faire mon introspection" },
      { value: "random", text: "Au fil de la journée, selon le mouvement des astres" }
    ]
  },
  {
    id: "lifePriorityTheme",
    category: "Guidance & Routine",
    question: "Quelle thématique de vie souhaitez-vous voir traitée en priorité ?",
    type: "choice",
    options: [
      { value: "love", text: "Amour & Relations Harmonieuses" },
      { value: "professional", text: "Succès professionnel & Accomplissement" },
      { value: "peace", text: "Paix intérieure & Alignement mental" },
      { value: "lunar", text: "Cycles lunaires & Rituels spirituels" }
    ]
  },
  {
    id: "guidanceTone",
    category: "Guidance & Routine",
    question: "Quel ton de guidance attendez-vous de notre oracle ?",
    type: "choice",
    options: [
      { value: "priestess", text: "La Prêtresse Mystique (poétique et spirituelle)" },
      { value: "psychologist", text: "La Psychologue Astrologue (pragmatique et clinique)" },
      { value: "friend", text: "L'Amie Bienveillante (douce, à l'écoute)" },
      { value: "mentor", text: "Le Mentor Spirituel (direct, motivant)" }
    ]
  },
  {
    id: "astralAlert",
    category: "Guidance & Routine",
    question: "Acceptez-vous des notifications lors de phases cosmiques intenses ?",
    type: "choice",
    options: [
      { value: "immediate", text: "Oui, je veux être alerté(e) en temps réel" },
      { value: "positive", text: "Seulement si l'impact est harmonieux" },
      { value: "none", text: "Non, je préfère rester dans mon propre flux" }
    ]
  },
  {
    id: "transmissionChannel",
    category: "Guidance & Routine",
    question: "Quels canaux de transmission préférez-vous pour vos oracles ?",
    type: "choice",
    options: [
      { value: "push", text: "Notifications Push immersives" },
      { value: "email", text: "Emails hebdomadaires détaillés" },
      { value: "both", text: "Les deux, pour une guidance continue" }
    ]
  },
  {
    id: "fullMoonCelebrate",
    category: "Guidance & Routine",
    question: "Comment préférez-vous célébrer les soirs de Pleine Lune ?",
    type: "choice",
    options: [
      { value: "ritual", text: "Par un rituel d'écriture et de libération" },
      { value: "meditation", text: "Par une méditation d'ancrage en silence" },
      { value: "connect", text: "En me connectant avec des personnes chères" },
      { value: "normal", text: "C'est une nuit comme les autres pour moi" }
    ]
  }
];
