import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Gérer la requête de pré-vérification CORS (Preflight)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("La variable d'environnement STRIPE_SECRET_KEY est manquante.");
    }

    const { userId, email, plan } = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "Les paramètres userId et email sont requis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- MODE SIMULATION LOCALE ---
    if (stripeSecretKey.startsWith("sk_test_mock")) {
      console.log(`[Simulation Stripe] Création d'une session de test pour l'utilisateur : ${userId}`);
      
      // En local, on redirige directement vers l'URL de succès avec des paramètres de simulation
      const successUrl = `${req.headers.get("origin") || "http://localhost:8080"}/#dashboard?payment=success&mock=true&user_id=${userId}`;
      
      return new Response(
        JSON.stringify({ url: successUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- MODE LIVE STRIPE ---
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Définir la tarification et le plan
    const planDetails = {
      weekly: { amount: 299, name: "Abonnement Hebdomadaire Moon Astro", interval: "week" },
      monthly: { amount: 999, name: "Abonnement Mensuel Moon Astro", interval: "month" },
      yearly: { amount: 4999, name: "Abonnement Annuel Moon Astro", interval: "year" },
    };

    const selectedPlan = planDetails[plan as keyof typeof planDetails] || planDetails.monthly;

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: selectedPlan.name,
              description: "Guidance spirituelle quotidienne et horoscope personnalisé.",
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: selectedPlan.interval as "week" | "month" | "year",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      client_reference_id: userId,
      success_url: `${req.headers.get("origin") || "http://localhost:8080"}/#dashboard?payment=success`,
      cancel_url: `${req.headers.get("origin") || "http://localhost:8080"}/#paywall`,
      metadata: {
        userId: userId,
        plan: plan,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erreur dans stripe-checkout:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
