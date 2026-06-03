import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!resendApiKey) {
      throw new Error("Variable d'environnement RESEND_API_KEY manquante.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Récupérer tous les utilisateurs premium actifs
    const { data: premiumUsers, error: dbError } = await supabase
      .from("astrology_profiles")
      .select("*")
      .eq("payment_status", "premium");

    if (dbError) {
      throw new Error(`Erreur de lecture de la base de données : ${dbError.message}`);
    }

    if (!premiumUsers || premiumUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: "Aucun utilisateur premium actif trouvé." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Envoi de guidances pour ${premiumUsers.length} utilisateur(s) premium...`);

    let successCount = 0;
    const dateStr = new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    // 2. Boucler et envoyer un email personnalisé à chacun
    for (const user of premiumUsers) {
      const email = user.email;
      const name = user.firstname || "Ami(e) Céleste";
      
      // Déterminer la couleur de son aura / profil énergétique
      const aura = user.auracolor || "Énergie Cosmique d'Alignement";
      const birthDate = user.birthdate;
      
      // Petite logique de calcul du chemin de vie pour l'email
      let lifePathNumber = 7;
      if (birthDate) {
        const digits = birthDate.replace(/\D/g, "");
        let sum = 0;
        for (const char of digits) sum += parseInt(char);
        const reduce = (num: number): number => {
          if (num === 11 || num === 22 || num === 33) return num;
          if (num < 10) return num;
          let s = 0;
          let temp = num;
          while (temp > 0) {
            s += temp % 10;
            temp = Math.floor(temp / 10);
          }
          return reduce(s);
        };
        lifePathNumber = reduce(sum);
      }

      // --- MODE SIMULATION RESEND ---
      if (resendApiKey.startsWith("re_mock")) {
        console.log(`[Simulation Resend] E-mail simulé envoyé avec succès à ${email} (Aura: ${aura}, Chemin: ${lifePathNumber})`);
        successCount++;
        continue;
      }

      // Contenu stylisé d'email Mystical Premium
      const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Votre Guidance du Jour</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #FAF8F5;
            color: #161C2E;
            margin: 0;
            padding: 40px 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border: 1px solid #E8DFD0;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(22, 28, 46, 0.03);
          }
          .email-header {
            background-color: #161C2E;
            color: #FAF8F5;
            padding: 30px;
            text-align: center;
          }
          .email-logo {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 0.1em;
            color: #D5B97C;
            text-transform: uppercase;
          }
          .email-body {
            padding: 40px 30px;
            line-height: 1.6;
          }
          .greeting {
            font-size: 20px;
            font-weight: 500;
            color: #161C2E;
            margin-bottom: 20px;
          }
          .energy-badge {
            background-color: #FAF8F5;
            border: 1px dashed #D5B97C;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
          }
          .energy-title {
            color: #6E6288;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }
          .energy-value {
            color: #D5B97C;
            font-size: 18px;
            font-weight: bold;
          }
          .horoscope-section {
            margin-top: 30px;
          }
          .horoscope-title {
            font-size: 16px;
            font-weight: bold;
            color: #161C2E;
            border-bottom: 1px solid #E8DFD0;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 11px;
            color: #6E6288;
            border-top: 1px solid #E8DFD0;
          }
          .btn {
            display: inline-block;
            background-color: #D5B97C;
            color: #161C2E;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            margin-top: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <div class="email-logo">✦ Moon Astro ✦</div>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #FAF8F5; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.1em;">${dateStr}</p>
          </div>
          <div class="email-body">
            <div class="greeting">Douce journée, ${name} ✦</div>
            <p>Le cosmos s'éveille et les positions planétaires de ce jour s'harmonisent avec votre signature vibratoire.</p>
            
            <div class="energy-badge">
              <div class="energy-title">Votre Climat Énergétique</div>
              <div class="energy-value">${aura} (Chemin ${lifePathNumber})</div>
              <div style="font-size: 13px; color: #6E6288; margin-top: 6px; font-weight: 500;">
                Soleil : ${user.sun_sign || "Non défini"} ✦ Lune : ${user.moon_sign || "Non défini"} ✦ Ascendant : ${user.ascendant || "Non défini"}
              </div>
            </div>

            <div class="horoscope-section">
              <div class="horoscope-title">🔮 Guidance de l'Oracle</div>
              <p>Aujourd'hui, votre planète régente impulse une vague d'introspection salutaire. Les transits de ce jour favorisent les alignements authentiques. Les heures qui viennent vous invitent à libérer le superflu pour accueillir le nouveau cycle de pleine lune avec sérénité.</p>
            </div>
            
            <div class="horoscope-section">
              <div class="horoscope-title">⚖️ Énergie & Alignement</div>
              <p>Prenez un instant pour respirer profondément et écouter les signaux de votre corps. Vos forces créatrices sont prêtes à éclore : posez vos limites avec bienveillance.</p>
            </div>

            <div style="text-align: center;">
              <a href="https://moonastro.life/#dashboard" class="btn">Consulter mon Dashboard Lunaire</a>
            </div>
          </div>
          <div class="footer">
            Cet email vous est envoyé dans le cadre de votre abonnement Moon Astro Premium.<br>
            Pour modifier vos préférences d'alertes ou vous désabonner, rendez-vous dans votre Profil.
          </div>
        </div>
      </body>
      </html>
      `;

      // 3. Envoyer l'email via l'API Resend
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Moon Astro <ciel@updates.moon-astro.com>",
          to: [email],
          subject: `Votre guidance stellaire du jour — ${name} ✦`,
          html: emailHtml,
        }),
      });

      if (res.ok) {
        successCount++;
        console.log(`Email envoyé avec succès à ${email}`);
      } else {
        const errText = await res.text();
        console.error(`Échec d'envoi d'email à ${email} :`, errText);
      }
    }

    return new Response(
      JSON.stringify({ message: `${successCount} email(s) envoyé(s) avec succès.` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erreur dans daily-emails:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
