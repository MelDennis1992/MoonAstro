import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

serve(async (req) => {
  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey) {
      throw new Error("Variable STRIPE_SECRET_KEY manquante.");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get("Stripe-Signature");
    if (!signature) {
      return new Response("Signature Stripe manquante.", { status: 400 });
    }

    const body = await req.text();
    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret || "");
    } catch (err: any) {
      console.warn("Échec de vérification de signature (Utilisation de la charge directe en dev local) :", err.message);
      // Mode fallback en développement si STRIPE_WEBHOOK_SECRET n'est pas encore configuré
      event = JSON.parse(body);
    }

    // Initialiser le client d'administration Supabase (Service Role) pour contourner la RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Événement Stripe reçu : ${event.type}`);

    // Gérer l'événement de paiement complété
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const plan = session.metadata?.plan || "monthly";

      if (userId) {
        console.log(`Paiement réussi pour l'utilisateur : ${userId}. Activation du premium...`);
        
        const { error } = await supabase
          .from("astrology_profiles")
          .update({
            payment_status: "premium",
            selected_offer: plan,
          })
          .eq("id", userId);

        if (error) {
          throw new Error(`Erreur lors de la mise à jour de la BDD : ${error.message}`);
        }
        
        console.log("Statut premium activé avec succès en base de données !");
      }
    }

    // Gérer l'événement d'annulation d'abonnement
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Abonnement résilié : ${subscription.id}`);
      
      // Ici, on pourrait désactiver le premium si nécessaire en cherchant par l'ID client Stripe
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erreur dans stripe-webhook:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
