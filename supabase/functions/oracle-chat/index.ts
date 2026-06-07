import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // User key falls back to the verified valid key
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "AQ.Ab8RN6LiyEoM6Z1ZQ2Z7FCudd6xINJR5hwBT6U6JRLi6Z6mvjg";
    const tavilyApiKey = Deno.env.get("TAVILY_API_KEY");

    // 1. Authenticate user from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "En-tête d'autorisation manquant." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Session non autorisée ou expirée." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Retrieve user's astrology profile
    const { data: profile, error: dbError } = await supabase
      .from("astrology_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (dbError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profil astrologique introuvable." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Verify active Premium status
    const isPremium = profile.payment_status === "premium" || profile.payment_status === "active";
    if (!isPremium) {
      return new Response(
        JSON.stringify({ error: "Statut Premium requis pour accéder à l'Oracle." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Parse request payload
    const { message, history, astrologyData } = await req.json();
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Le paramètre 'message' est obligatoire." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4.5 Tavily Web Search Integration
    let searchContext = "";
    if (tavilyApiKey) {
      const msgLower = message.toLowerCase();
      // Search keywords indicating real-time / astrology queries
      const searchKeywords = [
        "aujourd", "ce jour", "cette semaine", "ce mois", "actuel", "today", "now", "current",
        "transit", "planète", "position", "conjonction", "alignement", "éclips", "lune", "soleil",
        "ciel", "météo astro", "météo", "horoscope"
      ];
      
      const shouldSearch = searchKeywords.some(keyword => msgLower.includes(keyword));
      
      if (shouldSearch) {
        console.log(`[Tavily] Executing search for user query: "${message}"`);
        const searchQuery = `${message} transits astrologie`;
        const searchResults = await fetchTavilySearch(searchQuery, tavilyApiKey);
        searchContext = `\n\n[CONTEXTE DE RECHERCHE WEB TEMPS RÉEL (TAVILY AI)]\nLes résultats suivants proviennent d'une recherche en temps réel sur le web concernant la question de l'utilisateur :\n${searchResults}\n\nRÈGLES SUPPLÉMENTAIRES :\nUtilise ces résultats de recherche en temps réel pour enrichir ta réponse et fournir des détails précis et actuels sur les transits planétaires. Cite les éléments importants si nécessaire.`;
      }
    }

    // 5. Build dynamic system prompt based on user's birth chart & client calculated details
    const name = profile.firstname || "Ami(e) Céleste";
    const sun = profile.sun_sign || "Bélier";
    const moon = profile.moon_sign || "Cancer";
    const asc = profile.ascendant || "Balance";
    const place = profile.birthplace || "Inconnu";
    const birthDate = profile.birthdate || "Inconnue";

    const blocker = astrologyData?.blocker || "";
    const gemstone = astrologyData?.gemstone || "";
    const gemstoneDesc = astrologyData?.gemstoneDesc || "";
    const lifePath = astrologyData?.lifePath || "";

    let personalization = "";
    if (lifePath) personalization += `- Chemin de Vie : ${lifePath}\n`;
    if (blocker) personalization += `- Blocage Majeur à transmuter : "${blocker}"\n`;
    if (gemstone) personalization += `- Pierre Céleste de protection : ${gemstone} (${gemstoneDesc})\n`;

    const systemPrompt = `Tu es l'Oracle Céleste Suprême de l'application Moon Astro, un astrologue de renommée mondiale, expert en astrologie védique et occidentale, psychologie jungienne (shadow work) et spiritualité holistique.
    Tu t'adresses directement à ${name}. Coordonnées de naissance : né(e) le ${birthDate} à ${place}.
    Voici sa Trinité Céleste Sacrée (Big Three) et son alignement cosmique :
    - Signe Solaire (Essence, Vitalité) : ${sun}
    - Signe Lunaire (Émotions, Inconscient) : ${moon}
    - Ascendant (Masque Social, Véhicule physique) : ${asc}
    ${personalization}

    L'utilisateur te pose une question. Tu dois y répondre avec une expertise astrologique absolue et une profondeur spirituelle digne d'une consultation payante premium.
    
    RÈGLES STRICTES DE RÉPONSE :
    1. STRUCTURE PREMIUM : Organise ta réponse en 3 parties claires avec des émojis et des titres poétiques inspirants :
       - 🌌 PARTIE 1 : RÉVÉLATION STELLAIRE ET TRANSITS (Analyse psychologique et spirituelle poussée en reliant sa question à son Soleil ${sun}, sa Lune ${moon} et son Ascendant ${asc}).
       - 🔮 PARTIE 2 : CONSEILS TERRESTRES ET TRANSMUTATION (Réponse directe et constructive à sa question, en identifiant les forces à activer et comment surmonter son blocage principal : "${blocker}").
       - 💎 PARTIE 3 : RITUEL D'ALIGNEMENT ET ACTIONS CONCRÈTES (Donne un rituel précis, une méditation ou un exercice de shadow work à faire, en utilisant sa pierre céleste : "${gemstone}" - ${gemstoneDesc}, et comment l'intégrer au quotidien).
    2. LONGUEUR ET RICHESSE : La réponse doit être extrêmement riche, détaillée et développée, faisant entre 500 et 750 mots. Évite les réponses courtes ou génériques. Va au fond des choses, comme une consultation professionnelle payante.
    3. STYLE ET TON : Reste chaleureux, mystique, enveloppant et hautement poétique. Utilise un vocabulaire astrologique et psychologique riche (transits, aspects célestes, maisons, résonance vibratoire).
    4. LANGUE : Rédige exclusivement en français. Utilise le gras (**texte**) pour mettre en valeur les concepts et mots-clés spirituels cruciaux. Rends les paragraphes bien espacés pour une lecture fluide.${searchContext}`;

    // 6. Execute model query
    let reply = "";
    if (geminiApiKey) {
      // Map chat history to Gemini structure (alternate user / model roles)
      const contents = [];
      
      if (history && history.length > 0) {
        for (const msg of history) {
          contents.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        }
      }

      // Append current message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Call Gemini API (gemini-flash-latest)
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`;
      
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: contents,
          generationConfig: {
            maxOutputTokens: 1500,
            temperature: 0.7
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        console.error("Gemini API Error:", await response.text());
        throw new Error("Gemini call failed");
      }
    }

    // Fallback if no reply was generated or no API key is present (simulation mode)
    if (!reply) {
      reply = await generateMockReplyInEdge(profile, message, astrologyData);
    }

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur interne du serveur." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Edge function mock reply fallback (mirrors the client simulator to ensure offline testing works seamlessly)
async function generateMockReplyInEdge(profile: any, message: string, astrologyData: any): Promise<string> {
  // Simulate database / network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const name = profile.firstname || "Ami(e) Céleste";
  const sun = profile.sun_sign || "Bélier";
  const moon = profile.moon_sign || "Cancer";
  const asc = profile.ascendant || "Balance";
  const msgLower = message.toLowerCase();

  const blocker = astrologyData?.blocker || "la peur du changement";
  const gemstone = astrologyData?.gemstone || "Améthyste";

  if (msgLower.includes("amour") || msgLower.includes("love") || msgLower.includes("relation")) {
    return `**Guidance de l'Oracle — Amour & Relations**\n\nCher(ère) **${name}**, votre Soleil en **${sun}** et votre Lune en **${moon}** créent une signature d'une grande sensibilité affective. Actuellement, les mouvements planétaires stimulent votre Ascendant **${asc}**, vous incitant à exprimer vos désirs profonds. \n\nEn amour, l'Oracle vous conseille d'ouvrir doucement votre cœur sans craindre d'être blessé(e). Vos blocages actuels (comme **« ${blocker} »**) se dissiperont si vous restez centré(e) sur vos vérités sacrées en portant votre pierre **${gemstone}**.`;
  }
  
  if (msgLower.includes("travail") || msgLower.includes("carrière") || msgLower.includes("career") || msgLower.includes("job")) {
    return `**Guidance de l'Oracle — Carrière & Abondance**\n\nVotre Soleil en **${sun}** anime votre feu créatif et votre Ascendant **${asc}** guide votre action matérielle. \n\nLes astres indiquent une opportunité de leadership ou d'expression personnelle forte dans les semaines à venir. Pour capter cette abondance, libérez-vous des doutes liés à votre Lune en **${moon}** et surmontez l'obstacle : **« ${blocker} »**. Reste audacieux(se), le cosmos vous soutient.`;
  }

  return `Cher(ère) **${name}**, l'Oracle cosmique a bien reçu votre question. Vos alignements sacrés (Soleil en **${sun}**, Lune en **${moon}**, et Ascendant **${asc}**) indiquent un transit propice à l'introspection et à l'ancrage spirituel.\n\nFaites confiance au tempo divin. Pour approfondir, n'hésitez pas à me questionner sur votre **vie amoureuse**, votre **blocage : ${blocker}**, ou l'impact de votre pierre **${gemstone}**.`;
}

// Fetch results from Tavily Search API
async function fetchTavilySearch(query: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        max_results: 3
      })
    });

    if (response.ok) {
      const data = await response.json();
      const results = data.results || [];
      if (results.length === 0) return "Aucun résultat trouvé.";
      return results
        .map((r: any, idx: number) => `[Résultat ${idx + 1}] Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`)
        .join("\n\n");
    } else {
      console.error("Tavily API error status:", response.status, await response.text());
      return "Erreur lors de la récupération de la recherche Tavily.";
    }
  } catch (e) {
    console.error("Tavily fetch error:", e);
    return "Erreur de connexion avec le moteur de recherche Tavily.";
  }
}
