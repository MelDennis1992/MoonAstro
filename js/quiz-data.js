const QUIZ_QUESTIONS = [
  // --- ÉTAPE 1 : L'IDENTITÉ CÉLESTE & SIGNATURE VIBRATOIRE ---
  {
    id: "name",
    category: "Signature Céleste",
    category_en: "Celestial Signature",
    question: "Comment doit-on vous appeler au quotidien ?",
    question_en: "What should we call you daily?",
    type: "text",
    placeholder: "Votre prénom d'usage...",
    placeholder_en: "Your preferred first name...",
    label: "Prénom",
    label_en: "First Name"
  },
  {
    id: "fullName",
    category: "Signature Céleste",
    category_en: "Celestial Signature",
    question: "Quel est votre nom de naissance complet ?",
    question_en: "What is your full birth name?",
    type: "text",
    placeholder: "Prénoms et nom de famille de naissance...",
    placeholder_en: "Middle and last names at birth...",
    label: "Nom complet de naissance",
    label_en: "Full Birth Name"
  },
  {
    id: "birthDate",
    category: "Signature Céleste",
    category_en: "Celestial Signature",
    question: "Quel jour précis êtes-vous venu(e) au monde ?",
    question_en: "On which precise day did you come into this world?",
    type: "date",
    label: "Date de Naissance",
    label_en: "Birth Date"
  },
  {
    id: "hasBirthTime",
    category: "Signature Céleste",
    category_en: "Celestial Signature",
    question: "Connaissez-vous votre heure précise de naissance ?",
    question_en: "Do you know your precise time of birth?",
    type: "choice",
    options: [
      { value: "yes", text: "Oui, je la connais précisément", text_en: "Yes, I know it precisely" },
      { value: "approx", text: "J'ai une heure approximative", text_en: "I have an approximate time" },
      { value: "no", text: "Non, je ne la connais pas", text_en: "No, I do not know it" }
    ]
  },
  {
    id: "birthTime",
    category: "Signature Céleste",
    category_en: "Celestial Signature",
    question: "Quelle est cette heure de naissance ?",
    question_en: "What is this birth time?",
    type: "time",
    label: "Heure de Naissance",
    label_en: "Birth Time",
    optional: true
  },
  {
    id: "birthPlace",
    category: "Signature Céleste",
    category_en: "Celestial Signature",
    question: "Dans quelle ville et pays êtes-vous né(e) ?",
    question_en: "In which city and country were you born?",
    type: "text",
    placeholder: "Ex: Paris, France...",
    placeholder_en: "E.g. London, UK...",
    label: "Lieu de Naissance",
    label_en: "Birth Place"
  },
  {
    id: "gender",
    category: "Signature Céleste",
    category_en: "Celestial Signature",
    question: "Quel est votre genre céleste de prédilection ?",
    question_en: "What is your preferred celestial gender?",
    type: "choice",
    options: [
      { value: "female", text: "Féminin", text_en: "Feminine" },
      { value: "male", text: "Masculin", text_en: "Masculine" },
      { value: "non-binary", text: "Non-binaire / Autre", text_en: "Non-binary / Other" },
      { value: "private", text: "Je préfère garder cela secret", text_en: "I prefer to keep it secret" }
    ]
  },
  {
    id: "mirrorHours",
    category: "Signature Céleste",
    category_en: "Celestial Signature",
    question: "Êtes-vous interpellé(e) par des heures miroirs (ex: 11:11, 22:22) ou des chiffres répétitifs ?",
    question_en: "Are you frequently drawn to mirror hours (e.g. 11:11, 22:22) or repeating numbers?",
    type: "choice",
    options: [
      { value: "daily", text: "Oui, quotidiennement", text_en: "Yes, daily" },
      { value: "sometimes", text: "Parfois, de temps en temps", text_en: "Sometimes, from time to time" },
      { value: "rarely", text: "Rarement", text_en: "Rarely" },
      { value: "never", text: "Non, je n'y prête pas attention", text_en: "No, I don't pay attention to them" }
    ]
  },
  {
    id: "attractedNumber",
    category: "Signature Céleste",
    category_en: "Celestial Signature",
    question: "Quel chiffre unique, de 1 à 9, vous attire le plus instinctivement ?",
    question_en: "Which single digit from 1 to 9 calls to you most instinctively?",
    type: "choice",
    options: [
      { value: "1", text: "Chiffre 1 (L'Élan)", text_en: "Number 1 (The Drive)" },
      { value: "2", text: "Chiffre 2 (L'Harmonie)", text_en: "Number 2 (Harmony)" },
      { value: "3", text: "Chiffre 3 (La Créativité)", text_en: "Number 3 (Creativity)" },
      { value: "4", text: "Chiffre 4 (La Stabilité)", text_en: "Number 4 (Stability)" },
      { value: "5", text: "Chiffre 5 (La Liberté)", text_en: "Number 5 (Freedom)" },
      { value: "6", text: "Chiffre 6 (L'Équilibre)", text_en: "Number 6 (Balance)" },
      { value: "7", text: "Chiffre 7 (La Sagesse)", text_en: "Number 7 (Wisdom)" },
      { value: "8", text: "Chiffre 8 (Le Pouvoir)", text_en: "Number 8 (Power)" },
      { value: "9", text: "Chiffre 9 (L'Altruisme)", text_en: "Number 9 (Altruism)" }
    ]
  },

  // --- ÉTAPE 2 : LE PAYSAGE ÉMOTIONNEL & MÉTÉO INTÉRIEURE ---
  {
    id: "dominantEmotion",
    category: "Météo Intérieure",
    category_en: "Inner Weather",
    question: "Quelle est l'émotion dominante dans votre esprit au réveil ?",
    question_en: "Which dominant emotion usually greets your mind upon waking?",
    type: "choice",
    options: [
      { value: "joy", text: "Sérénité vibrante / Enthousiasme", text_en: "Vibrant serenity / Enthusiasm" },
      { value: "tired", text: "Fatigue sourde / Manque d'élan", text_en: "Dull fatigue / Lack of drive" },
      { value: "anxiety", text: "Anxiété diffuse / Inquiétude", text_en: "Diffuse anxiety / Worry" },
      { value: "creative", text: "Élan créatif / Idées bouillonnantes", text_en: "Creative flow / Bubbling ideas" },
      { value: "nostalgia", text: "Nostalgie douce / Mélancolie", text_en: "Gentle nostalgia / Melancholy" }
    ]
  },
  {
    id: "stressLevel",
    category: "Météo Intérieure",
    category_en: "Inner Weather",
    question: "Comment évaluez-vous la tension nerveuse accumulée en vous ?",
    question_en: "How would you rate the nervous tension accumulated within you?",
    type: "choice",
    options: [
      { value: "1", text: "Calme absolu (Niveau 1)", text_en: "Absolute calm (Level 1)" },
      { value: "2", text: "Brise légère (Niveau 2)", text_en: "Gentle breeze (Level 2)" },
      { value: "3", text: "Tension modérée (Niveau 3)", text_en: "Moderate tension (Level 3)" },
      { value: "4", text: "Haute tension (Niveau 4)", text_en: "High tension (Level 4)" },
      { value: "5", text: "Tempête nerveuse (Niveau 5)", text_en: "Nervous storm (Level 5)" }
    ]
  },
  {
    id: "imprevuReaction",
    category: "Météo Intérieure",
    category_en: "Inner Weather",
    question: "Face à un obstacle imprévu, quelle est votre réaction réflexe ?",
    question_en: "Faced with an unexpected obstacle, what is your reflex reaction?",
    type: "choice",
    options: [
      { value: "logic", text: "L'analyse logique et froide", text_en: "Cold and logical analysis" },
      { value: "panic", text: "La vague d'anxiété ou de panique", text_en: "A wave of anxiety or panic" },
      { value: "action", text: "L'action impulsive et immédiate", text_en: "Impulsive and immediate action" },
      { value: "retreat", text: "Le besoin de retrait pour digérer", text_en: "A need to withdraw and digest" }
    ]
  },
  {
    id: "refugeEmotion",
    category: "Météo Intérieure",
    category_en: "Inner Weather",
    question: "Où se réfugie votre esprit quand vos émotions débordent ?",
    question_en: "Where does your mind seek refuge when your emotions overflow?",
    type: "choice",
    options: [
      { value: "solitude", text: "Dans le silence et l'isolement complet", text_en: "In silence and complete isolation" },
      { value: "friend", text: "Auprès d'une oreille attentive", text_en: "With a caring and listening ear" },
      { value: "creative", text: "Dans l'art, l'écriture ou le sport", text_en: "In art, writing, or exercise" },
      { value: "sleep", text: "Dans le sommeil ou le repli sur soi", text_en: "In sleep or turning inward" }
    ]
  },
  {
    id: "intuitionConnection",
    category: "Météo Intérieure",
    category_en: "Inner Weather",
    question: "À quel point vous sentez-vous connecté(e) à votre intuition ?",
    question_en: "How connected do you feel to your intuition?",
    type: "choice",
    options: [
      { value: "fusion", text: "Fusion totale, je la suis toujours", text_en: "Total fusion, I always follow it" },
      { value: "complicity", text: "Bonne complicité, elle m'aide souvent", text_en: "Good connection, it often guides me" },
      { value: "disconnected", text: "Déconnexion fréquente, j'intellectualise trop", text_en: "Frequent disconnect, I overthink too much" },
      { value: "rational", text: "Rationnel(le) absolu(e), je crois aux faits", text_en: "Absolutely rational, I believe in facts" }
    ]
  },
  {
    id: "sleepQuality",
    category: "Météo Intérieure",
    category_en: "Inner Weather",
    question: "Comment décririez-vous la qualité de votre sommeil récent ?",
    question_en: "How would you describe your recent sleep quality?",
    type: "choice",
    options: [
      { value: "deep", text: "Profond, réparateur et plein de rêves", text_en: "Deep, restorative, and full of dreams" },
      { value: "restless", text: "Agité, haché et interrompu", text_en: "Restless, choppy, and interrupted" },
      { value: "short", text: "Trop court par manque de temps", text_en: "Too short due to lack of time" },
      { value: "light", text: "Calme mais superficiel et peu réparateur", text_en: "Quiet but shallow and non-restorative" }
    ]
  },
  {
    id: "colorAttraction",
    category: "Signature Céleste",
    category_en: "Celestial Signature",
    question: "Quelle nuance de couleur vous appelle pour votre équilibre intérieur ?",
    question_en: "Which shade of color calls to you for your inner balance?",
    type: "choice",
    options: [
      { value: "violet", text: "Le Violet céleste (Méditation)", text_en: "Celestial Violet (Meditation)" },
      { value: "gold", text: "L'Or sablé (Éclat & Vitalité)", text_en: "Sandy Gold (Radiance & Vitality)" },
      { value: "green", text: "Le Vert émeraude (Régénération)", text_en: "Emerald Green (Regeneration)" },
      { value: "blue", text: "Le Bleu nuit (Apaisement)", text_en: "Midnight Blue (Soothing)" }
    ]
  },
  {
    id: "solitudeFreq",
    category: "Météo Intérieure",
    category_en: "Inner Weather",
    question: "À quelle fréquence vous accordez-vous un moment d'introspection ?",
    question_en: "How often do you carve out moments for introspection?",
    type: "choice",
    options: [
      { value: "daily", text: "Chaque jour sans exception", text_en: "Every single day without fail" },
      { value: "weekly", text: "Deux à trois fois par semaine", text_en: "Two to three times a week" },
      { value: "monthly", text: "Une fois par mois", text_en: "Once a month" },
      { value: "never", text: "Presque jamais, je fuis le vide", text_en: "Almost never, I avoid the void" }
    ]
  },

  // --- ÉTAPE 3 : LE COMPORTEMENT SOCIAL & LA RELATION AUX AUTRES ---
  {
    id: "groupRole",
    category: "Comportement Social",
    category_en: "Social Behavior",
    question: "Au sein d'un groupe, quel rôle adoptez-vous tout naturellement ?",
    question_en: "Within a group, which role do you naturally assume?",
    type: "choice",
    options: [
      { value: "leader", text: "Le guide ou leader inspirant", text_en: "The inspiring guide or leader" },
      { value: "mediator", text: "Le médiateur calme et harmonieux", text_en: "The calm and harmonious mediator" },
      { value: "observer", text: "L'observateur discret et analytique", text_en: "The quiet and analytical observer" },
      { value: "entertainer", text: "L'animateur chaleureux et drôle", text_en: "The warm and funny entertainer" }
    ]
  },
  {
    id: "socialBattery",
    category: "Comportement Social",
    category_en: "Social Behavior",
    question: "Quand votre batterie sociale est vide, que faites-vous ?",
    question_en: "When your social battery is empty, what do you do?",
    type: "choice",
    options: [
      { value: "slip", text: "Je m'éclipse discrètement sans prévenir", text_en: "I slip away quietly without warning" },
      { value: "silent", text: "Je deviens très silencieux(se) et distant(e)", text_en: "I become very quiet and distant" },
      { value: "forced", text: "Je me force à sourire par convenance", text_en: "I force myself to smile out of politeness" },
      { value: "irritated", text: "Je m'irrite et perds patience facilement", text_en: "I easily get irritated and lose patience" }
    ]
  },
  {
    id: "procheDistress",
    category: "Comportement Social",
    category_en: "Social Behavior",
    question: "Face à la détresse émotionnelle d'un proche, vous êtes :",
    question_en: "Faced with a loved one's emotional distress, you are:",
    type: "choice",
    options: [
      { value: "sponge", text: "L'éponge psychologique : j'absorbe sa tristesse", text_en: "The psychological sponge: I absorb their sadness" },
      { value: "solver", text: "Le solutionneur : je cherche des solutions concrètes", text_en: "The problem solver: I seek concrete solutions" },
      { value: "pillar", text: "Le pilier : je reste fort(e) et stable sans absorber", text_en: "The pillar: I stay strong and stable without absorbing" },
      { value: "distance", text: "Le recul : je me protège en mettant de la distance", text_en: "The boundary seeker: I protect myself by keeping distance" }
    ]
  },
  {
    id: "relationshipDifficulty",
    category: "Comportement Social",
    category_en: "Social Behavior",
    question: "Quelle est votre plus grande difficulté dans vos relations ?",
    question_en: "What is your greatest difficulty in relationships?",
    type: "choice",
    options: [
      { value: "boundaries", text: "Dire non et poser des limites claires", text_en: "Saying no and setting clear boundaries" },
      { value: "trust", text: "Faire confiance et baisser la garde", text_en: "Trusting others and letting my guard down" },
      { value: "expression", text: "Exprimer clairement mes besoins", text_en: "Clearly expressing my needs" },
      { value: "hypocrisy", text: "Gérer l'incohérence et la superficialité", text_en: "Dealing with inconsistency and superficiality" }
    ]
  },
  {
    id: "trustBreaker",
    category: "Comportement Social",
    category_en: "Social Behavior",
    question: "Qu'est-ce qui brise instantanément votre confiance chez autrui ?",
    question_en: "What instantly breaks your trust in someone?",
    type: "choice",
    options: [
      { value: "betrayal", text: "La trahison, le mensonge ou le secret", text_en: "Betrayal, lying, or keeping secrets" },
      { value: "disrespect", text: "Le manque de considération ou de politesse", text_en: "Lack of consideration or rudeness" },
      { value: "selfishness", text: "L'égoïsme et le manque de générosité", text_en: "Selfishness and lack of generosity" },
      { value: "inconstancy", text: "L'inconstance et l'instabilité émotionnelle", text_en: "Inconstancy and emotional instability" }
    ]
  },
  {
    id: "travelResourcing",
    category: "Exploration & Cycles",
    category_en: "Exploration & Cycles",
    question: "Quel type d'environnement de voyage ressource le plus profondément votre esprit ?",
    question_en: "What kind of travel environment deeply restores your spirit?",
    type: "choice",
    options: [
      { value: "mountain", text: "Le silence des sommets et l'isolement des montagnes", text_en: "The silence of peaks and isolation of mountains" },
      { value: "ocean", text: "Le ressac de l'océan et la chaleur du littoral", text_en: "The wash of the ocean and warmth of the shore" },
      { value: "forest", text: "La canopée forestière et l'ancrage dans la nature brute", text_en: "The forest canopy and grounding in raw nature" },
      { value: "culture", text: "L'effervescence culturelle et l'exploration de ruines sacrées", text_en: "Cultural effervescence and exploring sacred ruins" }
    ]
  },
  {
    id: "conflictManagement",
    category: "Comportement Social",
    category_en: "Social Behavior",
    question: "Comment gérez-vous un conflit ouvert avec un proche ?",
    question_en: "How do you handle an open conflict with a loved one?",
    type: "choice",
    options: [
      { value: "dialogue", text: "Je cherche le dialogue constructif immédiatement", text_en: "I seek constructive dialogue immediately" },
      { value: "silence", text: "Je me replie dans un silence protecteur ou punitif", text_en: "I withdraw into a protective or silent stance" },
      { value: "defense", text: "Je défends fermement ma position avec force", text_en: "I firmly defend my position with strength" },
      { value: "flee", text: "Je fuis la confrontation à tout prix", text_en: "I avoid confrontation at all costs" }
    ]
  },
  {
    id: "loveExpression",
    category: "Comportement Social",
    category_en: "Social Behavior",
    question: "Comment exprimez-vous le plus naturellement votre affection ?",
    question_en: "How do you most naturally express your affection?",
    type: "choice",
    options: [
      { value: "words", text: "Paroles valorisantes & encouragements", text_en: "Words of affirmation & encouragement" },
      { value: "quality", text: "Moments exclusifs de haute qualité", text_en: "Quality time of high exclusivity" },
      { value: "services", text: "Rendre des services concrets au quotidien", text_en: "Acts of service in daily life" },
      { value: "gifts", text: "Cadeaux et petites attentions physiques", text_en: "Gifts and small thoughtful physical tokens" },
      { value: "touch", text: "Le contact physique et l'étreinte chaleureuse", text_en: "Physical contact and warm embraces" }
    ]
  },
  {
    id: "circleEnergy",
    category: "Comportement Social",
    category_en: "Social Behavior",
    question: "Quelle énergie humaine cherchez-vous à attirer autour de vous ?",
    question_en: "What kind of human energy do you seek to attract around you?",
    type: "choice",
    options: [
      { value: "ambitious", text: "Des esprits ambitieux et stimulants", text_en: "Ambitious and stimulating minds" },
      { value: "spiritual", text: "Des âmes douces, créatives et intuitives", text_en: "Gentle, creative, and intuitive souls" },
      { value: "free", text: "Des esprits libres, aventureux et spontanés", text_en: "Free, adventurous, and spontaneous spirits" },
      { value: "stable", text: "Des personnes stables, ancrées et fiables", text_en: "Stable, grounded, and reliable people" }
    ]
  },

  // --- ÉTAPE 4 : L'ALIGNEMENT PROFESSIONNEL & LE RAPPORT À L'ABONDANCE ---
  {
    id: "professionalSituation",
    category: "Alignement & Carrière",
    category_en: "Alignment & Career",
    question: "Quelle est votre situation professionnelle actuelle ?",
    question_en: "What is your current professional situation?",
    type: "choice",
    options: [
      { value: "corporate", text: "Salarié(e) corporate ou institutionnel", text_en: "Corporate or institutional employee" },
      { value: "entrepreneur", text: "Entrepreneur, indépendant ou freelance", text_en: "Entrepreneur, business owner, or freelancer" },
      { value: "creative", text: "Créatif(ve) libre ou artiste", text_en: "Free creative or artist" },
      { value: "transition", text: "En transition, reconversion ou études", text_en: "In transition, career change, or studying" },
      { value: "looking", text: "En recherche active de sens ou d'emploi", text_en: "Actively seeking meaning or employment" }
    ]
  },
  {
    id: "ambitionDriver",
    category: "Alignement & Carrière",
    category_en: "Alignment & Career",
    question: "Quel est le moteur principal de votre ambition ?",
    question_en: "What is the primary driver of your ambition?",
    type: "choice",
    options: [
      { value: "impact", text: "L'impact profond et le sens de ma mission", text_en: "Deep impact and the meaning of my mission" },
      { value: "freedom", text: "La liberté totale de mon temps", text_en: "Total freedom of my time" },
      { value: "money", text: "L'abondance financière et la sécurité", text_en: "Financial abundance and security" },
      { value: "recognition", text: "La reconnaissance et l'excellence", text_en: "Recognition and excellence" }
    ]
  },
  {
    id: "lifeMissionAlign",
    category: "Alignement & Carrière",
    category_en: "Alignment & Career",
    question: "Vous sentez-vous aligné(e) avec votre mission professionnelle ?",
    question_en: "Do you feel aligned with your professional mission?",
    type: "choice",
    options: [
      { value: "aligned", text: "Parfaitement, je me sens sur mon chemin", text_en: "Perfectly, I feel on my path" },
      { value: "deviation", text: "Légère déviation, je cherche à m'ajuster", text_en: "Slight deviation, I am looking to adjust" },
      { value: "lost", text: "Perte de sens, j'ai besoin de renouveau", text_en: "Loss of meaning, I need a renewal" },
      { value: "exploring", text: "En cours d'exploration de nouvelles voies", text_en: "Currently exploring new avenues" }
    ]
  },
  {
    id: "authorityPosture",
    category: "Alignement & Carrière",
    category_en: "Alignment & Career",
    question: "Face à une figure d'autorité, quelle est votre posture instinctive ?",
    question_en: "Faced with an authority figure, what is your instinctive posture?",
    type: "choice",
    options: [
      { value: "collaboration", text: "Collaboration fluide et respectueuse", text_en: "Fluid and respectful collaboration" },
      { value: "question", text: "Remise en question et esprit critique", text_en: "Questioning and critical thinking" },
      { value: "rebellion", text: "Rébellion silencieuse ou évitement", text_en: "Silent rebellion or avoidance" },
      { value: "passive", text: "Retrait passif pour préserver ma paix", text_en: "Passive withdrawal to preserve my peace" }
    ]
  },
  {
    id: "moneyAbundance",
    category: "Alignement & Carrière",
    category_en: "Alignment & Career",
    question: "Comment décririez-vous votre relation avec l'argent ?",
    question_en: "How would you describe your relationship with money?",
    type: "choice",
    options: [
      { value: "fluid", text: "Fluide et confiante, j'attire l'abondance", text_en: "Fluid and confident, I attract abundance" },
      { value: "fear", text: "Tendue, j'ai souvent peur du manque", text_en: "Tense, I often fear scarcity" },
      { value: "detachment", text: "Détachée, ce n'est pas une priorité", text_en: "Detached, it is not a priority" },
      { value: "blocked", text: "Bloquée, je sens des plafonds de verre invisibles", text_en: "Blocked, I feel invisible glass ceilings" }
    ]
  },
  {
    id: "impostorSyndrome",
    category: "Alignement & Carrière",
    category_en: "Alignment & Career",
    question: "Ressentez-vous le syndrome de l'imposteur dans votre travail ?",
    question_en: "Do you experience impostor syndrome in your work?",
    type: "choice",
    options: [
      { value: "constantly", text: "Constamment, je doute de ma légitimité", text_en: "Constantly, I doubt my legitimacy" },
      { value: "sometimes", text: "Parfois, lors de nouveaux challenges", text_en: "Sometimes, during new challenges" },
      { value: "rarely", text: "Très rarement", text_en: "Very rarely" },
      { value: "never", text: "Jamais, je connais ma valeur", text_en: "Never, I know my worth" }
    ]
  },
  {
    id: "projectBlockage",
    category: "Alignement & Carrière",
    category_en: "Alignment & Career",
    question: "Quel est votre plus grand blocage dans l'expansion de vos projets ?",
    question_en: "What is your biggest blocker in expanding your projects?",
    type: "choice",
    options: [
      { value: "failure", text: "La peur de l'échec ou du jugement", text_en: "Fear of failure or judgment" },
      { value: "procrastination", text: "La procrastination et le manque d'énergie", text_en: "Procrastination and lack of energy" },
      { value: "dispersion", text: "La dispersion et le manque de focus", text_en: "Dispersion and lack of focus" },
      { value: "clarity", text: "Le manque de clarté sur la vision", text_en: "Lack of clarity on the vision" }
    ]
  },
  {
    id: "creativeEnvironment",
    category: "Alignement & Carrière",
    category_en: "Alignment & Career",
    question: "Quel environnement de travail nourrit le plus votre productivité ?",
    question_en: "What work environment nurtures your productivity the most?",
    type: "choice",
    options: [
      { value: "collective", text: "L'effervescence collective stimulante", text_en: "Stimulating collective effervescence" },
      { value: "silence", text: "Le silence sacré et l'isolement complet", text_en: "Sacred silence and complete isolation" },
      { value: "nature", text: "Un cadre naturel ou hautement esthétique", text_en: "A natural or highly aesthetic setting" },
      { value: "organized", text: "Une structure rigoureuse et très organisée", text_en: "A rigorous and highly organized structure" }
    ]
  },

  // --- ÉTAPE 5 : L'ESTIME DE SOI & BLESSURES DE L'ÂME ---
  {
    id: "selfLoveScore",
    category: "Estime de Soi",
    category_en: "Self-Esteem",
    question: "Sur une échelle de 1 à 10, quel est votre amour-propre actuel ?",
    question_en: "On a scale of 1 to 10, how would you rate your self-love?",
    type: "choice",
    options: [
      { value: "low", text: "Besoin de guérison (1 à 4)", text_en: "Need for healing (1 to 4)" },
      { value: "medium", text: "En cours d'harmonisation (5 à 7)", text_en: "Currently harmonizing (5 to 7)" },
      { value: "high", text: "Confiant et stable (8 à 10)", text_en: "Confident and stable (8 to 10)" }
    ]
  },
  {
    id: "soulBlessing",
    category: "Estime de Soi",
    category_en: "Self-Esteem",
    question: "Parmi ces cinq blessures de l'âme, laquelle résonne le plus en vous ?",
    question_en: "Which of these five soul wounds resonates most within you?",
    type: "choice",
    options: [
      { value: "abandonment", text: "L'Abandon (Peur d'être seul(e))", text_en: "Abandonment (Fear of being alone)" },
      { value: "rejection", text: "Le Rejet (Peur de ne pas plaire)", text_en: "Rejection (Fear of not pleasing)" },
      { value: "injustice", text: "L'Injustice (Besoin de rigidité/perfection)", text_en: "Injustice (Need for rigidity/perfection)" },
      { value: "betrayal", text: "La Trahison (Besoin de contrôle absolu)", text_en: "Betrayal (Need for absolute control)" },
      { value: "humiliation", text: "L'Humiliation (Peur de la honte/jugement)", text_en: "Humiliation (Fear of shame/judgment)" }
    ]
  },
  {
    id: "mirrorFirstFeel",
    category: "Estime de Soi",
    category_en: "Self-Esteem",
    question: "Devant le miroir, quel sentiment émerge le plus spontanément ?",
    question_en: "In front of the mirror, which feeling emerges most spontaneously?",
    type: "choice",
    options: [
      { value: "kindness", text: "La bienveillance et l'acceptation douce", text_en: "Kindness and gentle acceptance" },
      { value: "critique", text: "Une autocritique immédiate sur un détail", text_en: "Immediate self-criticism over a detail" },
      { value: "neutral", text: "Un détachement neutre et fonctionnel", text_en: "Neutral and functional detachment" },
      { value: "alignment", text: "La recherche d'un alignement de mon regard", text_en: "Searching for alignment in my look" }
    ]
  },
  {
    id: "limitingBelief",
    category: "Estime de Soi",
    category_en: "Self-Esteem",
    question: "Quelle croyance limitante sabote le plus souvent vos élans ?",
    question_en: "Which limiting belief most often sabotages your momentum?",
    type: "choice",
    options: [
      { value: "not_good", text: "\"Je ne suis pas assez bien pour cela\"", text_en: "\"I am not good enough for this\"" },
      { value: "too_late", text: "\"C'est trop tard pour moi pour changer\"", text_en: "\"It is too late for me to change\"" },
      { value: "disappointed", text: "\"Je vais finir par être déçu(e) ou abandonné(e)\"", text_en: "\"I will end up disappointed or abandoned\"" },
      { value: "deserve", text: "\"Je ne mérite pas le bonheur ou la réussite absolue\"", text_en: "\"I do not deserve happiness or absolute success\"" }
    ]
  },
  {
    id: "pastFailureReaction",
    category: "Estime de Soi",
    category_en: "Self-Esteem",
    question: "Comment réagissez-vous face à vos erreurs ou échecs passés ?",
    question_en: "How do you react to your past mistakes or failures?",
    type: "choice",
    options: [
      { value: "torture", text: "Je me torture l'esprit pendant des semaines", text_en: "I torture my mind for weeks" },
      { value: "learn", text: "J'analyse froidement pour en tirer des leçons", text_en: "I analyze coldly to draw lessons" },
      { value: "accept", text: "J'accepte avec compassion et bienveillance", text_en: "I accept with compassion and kindness" },
      { value: "forget", text: "J'essaie de tourner la page au plus vite", text_en: "I try to turn the page as fast as possible" }
    ]
  },
  {
    id: "selfAuraGoal",
    category: "Estime de Soi",
    category_en: "Self-Esteem",
    question: "Quel aspect de votre être souhaitez-vous le plus guérir ?",
    question_en: "What aspect of your being do you wish to heal most?",
    type: "choice",
    options: [
      { value: "unconditional_love", text: "Ma capacité à m'aimer sans conditions", text_en: "My ability to love myself unconditionally" },
      { value: "action_courage", text: "Mon courage pour passer à l'action sans peur", text_en: "My courage to take action without fear" },
      { value: "serenity", text: "Ma sérénité face à l'inconnu de la vie", text_en: "My serenity in the face of life's unknown" },
      { value: "connection", text: "Ma connexion aux autres sans peur d'être blessé(e)", text_en: "My connection to others without fear of being hurt" }
    ]
  },
  {
    id: "characterTrait",
    category: "Paysage Intérieur",
    category_en: "Inner Landscape",
    question: "Si vos proches devaient résumer votre tempérament profond en un mot :",
    question_en: "If your loved ones had to summarize your deep temperament in one word:",
    type: "choice",
    options: [
      { value: "courageous", text: "Déterminé(e) et courageux(se)", text_en: "Determined and courageous" },
      { value: "empathic", text: "Bienveillant(e) et empathique", text_en: "Kind and empathic" },
      { value: "analytical", text: "Calme et réfléchi(e)", text_en: "Calm and reflective" },
      { value: "creative", text: "Original(e) et libre", text_en: "Original and free" }
    ]
  },
  {
    id: "bodyLimits",
    category: "Estime de Soi",
    category_en: "Self-Esteem",
    question: "À quel point respectez-vous les limites physiques de votre corps ?",
    question_en: "How well do you respect the physical limits of your body?",
    type: "choice",
    options: [
      { value: "deferential", text: "J'écoute chaque signal avec soin", text_en: "I listen to every signal carefully" },
      { value: "sick", text: "Je ne l'écoute que lorsqu'il tombe malade", text_en: "I only listen when it falls ill" },
      { value: "push", text: "Je le pousse régulièrement au-delà de ses forces", text_en: "I regularly push it beyond its strength" },
      { value: "decode", text: "J'ai beaucoup de mal à décoder ses messages", text_en: "I have a lot of trouble decoding its messages" }
    ]
  },

  // --- ÉTAPE 6 : PARAMÈTRES DE GUIDANCE & CÉLÉBRATION ---
  {
    id: "lunarPhaseSensitivity",
    category: "Guidance & Routine",
    category_en: "Guidance & Routine",
    question: "Ressentez-vous l'influence des phases de la Lune sur vos émotions ou votre sommeil ?",
    question_en: "Do you feel the influence of the Moon's phases on your emotions or sleep?",
    type: "choice",
    options: [
      { value: "high", text: "Oui, très fortement (surtout à la Pleine Lune)", text_en: "Yes, very strongly (especially during the Full Moon)" },
      { value: "moderate", text: "Légèrement, mon sommeil est parfois perturbé", text_en: "Slightly, my sleep is sometimes disrupted" },
      { value: "curious", text: "Pas consciemment, mais je souhaite l'observer", text_en: "Not consciously, but I want to observe it" },
      { value: "none", text: "Non, je ne ressens aucun impact particulier", text_en: "No, I do not feel any particular impact" }
    ]
  },
  {
    id: "gemstoneIntention",
    category: "Guidance & Routine",
    category_en: "Guidance & Routine",
    question: "Quelle pierre ou gemme précieuse résonne le plus avec votre intention de guérison actuelle ?",
    question_en: "Which stone or gemstone resonates most with your current healing intention?",
    type: "choice",
    options: [
      { value: "amethyst", text: "L'Améthyste (Sérénité & Clarté spirituelle)", text_en: "Amethyst (Serenity & Spiritual clarity)" },
      { value: "rose_quartz", text: "Le Quartz Rose (Amour inconditionnel & Apaisement)", text_en: "Rose Quartz (Unconditional love & Soothing)" },
      { value: "citrine", text: "La Citrine (Abondance & Rayonnement personnel)", text_en: "Citrine (Abundance & Personal radiance)" },
      { value: "tiger_eye", text: "L'Œil de Tigre (Protection & Force d'action)", text_en: "Tiger's Eye (Protection & Action strength)" }
    ]
  },
  {
    id: "guidanceTime",
    category: "Guidance & Routine",
    category_en: "Guidance & Routine",
    question: "À quel moment de la journée préférez-vous recevoir votre guidance ?",
    question_en: "At what time of day do you prefer to receive your guidance?",
    type: "choice",
    options: [
      { value: "morning", text: "Au saut du lit, pour impulser ma journée", text_en: "Upon waking up, to prompt my day" },
      { value: "midday", text: "À la pause de midi, pour me recentrer", text_en: "At midday break, to recenter myself" },
      { value: "evening", text: "Au coucher, pour faire mon introspection", text_en: "At bedtime, for my introspection" },
      { value: "random", text: "Au fil de la journée, selon le mouvement des astres", text_en: "Throughout the day, as the stars move" }
    ]
  },
  {
    id: "lifePriorityTheme",
    category: "Guidance & Routine",
    category_en: "Guidance & Routine",
    question: "Quelle thématique de vie souhaitez-vous voir traitée en priorité ?",
    question_en: "Which life priority do you want addressed first?",
    type: "choice",
    options: [
      { value: "love", text: "Amour & Relations Harmonieuses", text_en: "Love & Harmonious Relationships" },
      { value: "professional", text: "Succès professionnel & Accomplissement", text_en: "Professional Success & Accomplishment" },
      { value: "peace", text: "Paix intérieure & Alignement mental", text_en: "Inner Peace & Mental Alignment" },
      { value: "lunar", text: "Cycles lunaires & Rituels spirituels", text_en: "Lunar Cycles & Spiritual Rituals" }
    ]
  },
  {
    id: "guidanceTone",
    category: "Guidance & Routine",
    category_en: "Guidance & Routine",
    question: "Quel ton de guidance attendez-vous de notre oracle ?",
    question_en: "What tone of guidance do you expect from our oracle?",
    type: "choice",
    options: [
      { value: "priestess", text: "La Prêtresse Mystique (poétique et spirituelle)", text_en: "The Mystic Priestess (poetic and spiritual)" },
      { value: "psychologist", text: "La Psychologue Astrologue (pragmatique et clinique)", text_en: "The Astrologer Psychologist (pragmatic and clinical)" },
      { value: "friend", text: "L'Amie Bienveillante (douce, à l'écoute)", text_en: "The Caring Friend (gentle, listening)" },
      { value: "mentor", text: "Le Mentor Spirituel (direct, motivant)", text_en: "The Spiritual Mentor (direct, motivating)" }
    ]
  },
  {
    id: "astralAlert",
    category: "Guidance & Routine",
    category_en: "Guidance & Routine",
    question: "Acceptez-vous des notifications lors de phases cosmiques intenses ?",
    question_en: "Do you accept notifications during intense cosmic phases?",
    type: "choice",
    options: [
      { value: "immediate", text: "Oui, je veux être alerté(e) en temps réel", text_en: "Yes, I want to be alerted in real time" },
      { value: "positive", text: "Seulement si l'impact est harmonieux", text_en: "Only if the impact is harmonious" },
      { value: "none", text: "Non, je préfère rester dans mon propre flux", text_en: "No, I prefer to stay in my own flow" }
    ]
  },
  {
    id: "transmissionChannel",
    category: "Guidance & Routine",
    category_en: "Guidance & Routine",
    question: "Quels canaux de transmission préférez-vous pour vos oracles ?",
    question_en: "What transmission channels do you prefer for your readings?",
    type: "choice",
    options: [
      { value: "push", text: "Notifications Push immersives", text_en: "Immersive Push Notifications" },
      { value: "email", text: "Emails hebdomadaires détaillés", text_en: "Detailed weekly emails" },
      { value: "both", text: "Les deux, pour une guidance continue", text_en: "Both, for continuous guidance" }
    ]
  },
  {
    id: "fullMoonCelebrate",
    category: "Guidance & Routine",
    category_en: "Guidance & Routine",
    question: "Comment préférez-vous célébrer les soirs de Pleine Lune ?",
    question_en: "How do you prefer to celebrate Full Moon nights?",
    type: "choice",
    options: [
      { value: "ritual", text: "Par un rituel d'écriture et de libération", text_en: "Through a ritual of writing and releasing" },
      { value: "meditation", text: "Par une méditation d'ancrage en silence", text_en: "Through a grounding meditation in silence" },
      { value: "connect", text: "En me connectant avec des personnes chères", text_en: "By connecting with loved ones" },
      { value: "normal", text: "C'est une nuit comme les autres pour moi", text_en: "It is just another night for me" }
    ]
  }
];
