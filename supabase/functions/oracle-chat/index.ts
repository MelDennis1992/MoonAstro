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

    const systemPrompt = `Tu es l'Oracle Céleste de l'application Moon Astro. Tu es un astrologue de renom, sage, bienveillant et mystique.
    Tu t'adresses directement à ${name}. Coordonnées de naissance : né(e) le ${birthDate} à ${place}.
    Voici sa Trinité Céleste (Big Three) et ses alignements cosmiques :
    - Signe Solaire : ${sun}
    - Signe Lunaire : ${moon}
    - Ascendant : ${asc}
    ${personalization}

    Réponds à sa question en utilisant ces coordonnées natales uniques et alignements pour lui fournir des conseils éclairés, constructifs et spirituels. Reste chaleureux, utilise des formulations poétiques et des métaphores célestes en français. 
    Fournis une réponse très approfondie, riche en révélations et structurée, d'environ 300 à 450 mots. Divise ton analyse en 3 parties claires avec des titres poétiques (ex: 🌌 Analyse Astrale Céleste, 🔮 Conseils Pratiques Terrestres, 💎 Alignement de l'Âme). Utilise des paragraphes bien espacés et le gras pour mettre en valeur les mots-clés spirituels et astrologiques (ex: **comme ceci**). Ne mentionne pas de concepts que l'utilisateur n'a pas demandés, mais centre tes conseils sur sa question en tissant son profil de manière naturelle.`;

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
            maxOutputTokens: 1200,
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
