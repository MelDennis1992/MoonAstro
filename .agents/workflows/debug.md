---
description: C'est un workflow pour auditer les applications 
---

L’audit vérifie :

* qualité visuelle premium ;
* parcours landing → quiz → résultat → paywall → dashboard ;
* fiabilité technique ;
* cohérence IA ;
* confiance utilisateur ;
* conformité RGPD ;
* expérience mobile.

---

## Étape 1 — Vérification de l’environnement

1. Ouvrir l’URL locale de développement.
2. Vérifier que la webapp charge correctement.
3. Confirmer que Next.js a terminé le rendu initial.
4. Vérifier l’absence :

   * d’erreurs bloquantes console ;
   * d’erreurs d’hydratation ;
   * de page blanche ;
   * de composants cassés.
5. Vérifier la connectivité :

   * base de données ;
   * authentification ;
   * API IA ;
   * Stripe ;
   * emails ;
   * notifications ;
   * sauvegarde du quiz ;
   * dashboard utilisateur.
6. Vérifier le responsive desktop, tablette et mobile.

---

## Étape 2 — Audit Visuel Moonly

Analyser l’interface selon l’identité **Mystical Premium**.

### Identité visuelle

Vérifier :

* Light Mode lunaire ;
* fond blanc, crème ou pastel doux ;
* violet doux, bleu nuit, doré subtil, rose poudré ;
* ambiance spirituelle, moderne, rassurante ;
* absence de couleurs agressives ;
* design premium, non caricatural ;
* symboles astrologiques subtils ;
* illustrations lunaires cohérentes.

### Architecture de l’information

Vérifier :

* promesse comprise en moins de 3 secondes ;
* CTA principal immédiatement visible ;
* accès évident au quiz ;
* bénéfices premium clairs ;
* textes courts et engageants ;
* sections organisées autour des objectifs utilisateur.

Objectifs prioritaires :

* découvrir son profil ;
* comprendre son énergie ;
* recevoir un horoscope personnalisé ;
* débloquer l’analyse complète ;
* revenir chaque jour.

### Layout & cartes

Vérifier :

* grille claire et responsive ;
* cartes bien espacées ;
* hiérarchie nette ;
* dashboard lisible ;
* aucun bloc trop dense ;
* aucun désalignement ;
* aucune rupture mobile.

Auditer les cartes :

* Énergie du jour ;
* Horoscope quotidien ;
* Amour ;
* Carrière ;
* Bien-être ;
* Point de vigilance ;
* Affirmation ;
* Guidance hebdomadaire ;
* Cycle lunaire.

Chaque carte doit avoir :

* titre clair ;
* contenu lisible ;
* iconographie cohérente ;
* loading state ;
* empty state ;
* texte court ;
* CTA pertinent si nécessaire.

### Typographie & interactions

Vérifier :

* titres lisibles et premium ;
* hiérarchie H1/H2/H3 claire ;
* corps confortable ;
* contraste suffisant ;
* mobile lisible ;
* hover subtil ;
* transitions douces ;
* feedback au clic ;
* animations cohérentes avec l’univers lunaire.

---

## Étape 3 — Audit du Parcours Utilisateur

### Landing Page

Vérifier :

* promesse claire ;
* CTA visible ;
* design premium ;
* ton rassurant ;
* absence de jargon ;
* accès immédiat au quiz ;
* affichage mobile correct.

Question clé : l’utilisateur comprend-il Moonly et a-t-il envie de commencer ?

### Quiz d’onboarding

Auditer le quiz complet :

* une question par écran ;
* progression claire ;
* sauvegarde automatique ;
* navigation fluide ;
* retour possible ;
* réponses compréhensibles ;
* données personnelles justifiées ;
* aucune perte après refresh ;
* mobile parfait ;
* ton doux, non médical.

Le quiz ne doit pas sembler trop long. Chaque question doit paraître utile.

### Résultat personnalisé

Vérifier :

* génération IA fonctionnelle ;
* loading state rassurant ;
* résultat clair et structuré ;
* personnalisation visible ;
* ton positif ;
* aucune affirmation anxiogène ;
* aucune promesse excessive ;
* aperçu gratuit engageant ;
* transition naturelle vers paywall.

Objectif émotionnel : “Moonly m’a compris.”

### Paywall

Vérifier :

* offre claire ;
* bénéfices premium visibles ;
* prix lisibles ;
* CTA clair ;
* pas de pression excessive ;
* annulation expliquée ;
* confidentialité mentionnée ;
* Stripe fonctionnel.

### Dashboard

Vérifier :

* contenu du jour prioritaire ;
* navigation simple ;
* cartes cohérentes ;
* historique accessible ;
* abonnement visible mais non intrusif ;
* chargement fluide ;
* responsive mobile parfait.

---

## Étape 4 — Audit Fonctionnel

### Authentification

Vérifier :

* création de compte ;
* connexion ;
* déconnexion ;
* récupération de session ;
* routes protégées ;
* redirections post-login et post-paiement ;
* erreurs utilisateur claires.

### Quiz & stockage

Vérifier :

* réponses sauvegardées ;
* données liées au bon utilisateur ;
* aucune perte de données ;
* calcul du profil fonctionnel ;
* questions conditionnelles fonctionnelles ;
* quiz terminé non relancé par erreur ;
* modification possible du profil.

### Génération IA

Vérifier :

* prompt système cohérent avec Moonly ;
* réponses personnalisées ;
* ton positif ;
* pas de contenu médical, juridique ou financier ;
* pas de prédictions dangereuses ;
* pas de contenu culpabilisant ;
* fallback en cas d’erreur API ;
* limites de génération ;
* contenu sauvegardé ;
* absence de génération infinie/coûteuse.

### Horoscope quotidien

Vérifier :

* génération quotidienne unique ;
* récupération si déjà généré ;
* personnalisation selon profil ;
* cohérence avec la date ;
* affichage dashboard ;
* historique sauvegardé.

### Paiement & abonnement

Vérifier :

* checkout Stripe ;
* redirection post-paiement ;
* activation premium ;
* gestion abonnement actif ;
* annulation ;
* protection contenus premium ;
* aucun accès premium non autorisé.

### Notifications

Vérifier :

* opt-in explicite ;
* préférences utilisateur ;
* fréquence non intrusive ;
* contenu positif ;
* fallback email ;
* désactivation possible ;
* aucune notification sans consentement.

---

## Étape 5 — Audit Interaction & Confiance

### Feedback immédiat

Toutes les interactions doivent réagir visuellement en moins de 100 ms :

* démarrage quiz ;
* sélection réponse ;
* question suivante ;
* génération résultat ;
* ouverture paywall ;
* paiement ;
* sauvegarde préférences ;
* notifications.

### États système obligatoires

Vérifier :

* loading page ;
* loading génération IA ;
* loading paiement ;
* loading sauvegarde quiz ;
* loading dashboard ;
* empty state horoscope ;
* empty state historique ;
* empty state abonnement ;
* error state clair et récupérable ;
* success state après sauvegarde, paiement et activation.

Les erreurs doivent être claires, non techniques et non accusatrices.

Exemple :

> “Nous n’avons pas pu générer ton horoscope pour le moment. Réessaie dans quelques instants.”

### Vérification d’intention

Les modales sont réservées aux actions sensibles :

* suppression compte ;
* annulation abonnement ;
* réinitialisation quiz ;
* suppression données ;
* désactivation notifications.

Actions simples :

* popovers ;
* inline edits ;
* toasts ;
* confirmations légères.

---

## Étape 6 — Responsible App

Moonly traite des données personnelles et émotionnelles. Vérifier :

### Confidentialité

* politique de confidentialité visible ;
* consentement avant collecte ;
* usage des données expliqué ;
* suppression compte possible ;
* modification préférences possible ;
* aucune donnée sensible dans les URLs ;
* aucune fuite dans la console.

### Sécurité du contenu IA

Moonly ne doit jamais générer :

* diagnostic médical ;
* conseil psychologique clinique ;
* décision financière ;
* prédiction alarmiste ;
* phrase fataliste ;
* injonction culpabilisante ;
* contenu manipulateur ;
* promesse irréaliste.

Le contenu doit rester dans le cadre :

* bien-être ;
* introspection ;
* divertissement ;
* développement personnel doux ;
* guidance non déterministe.

### Disclaimers

Vérifier que Moonly précise :

* ne remplace pas un professionnel de santé ;
* ne donne pas de conseil médical, juridique ou financier ;
* contenus à but bien-être/divertissement ;
* l’utilisateur reste libre de ses décisions.

### Confiance commerciale

Vérifier :

* prix clairement affichés ;
* renouvellement expliqué ;
* annulation expliquée ;
* aucun dark pattern ;
* aucune fausse urgence ;
* conditions générales accessibles.

---

## Étape 7 — Rapport d’Audit

Générer le rapport suivant :

### Squad Status

* **Score Visuel :** [1–10]
* **Score Fonctionnel :** [1–10]
* **Score Confiance :** [1–10]
* **Score Produit :** [1–10]
* **Score Mobile :** [1–10]
* **Statut global :** `Production-ready` / `Needs Fixes` / `Blocked`

### Visual Wins

Lister :

* identité Moonly réussie ;
* cohérence des cartes ;
* fluidité du quiz ;
* beauté du dashboard ;
* qualité du paywall ;
* lisibilité mobile ;
* micro-interactions réussies.

### Critical Fails

Lister :

* navigation cassée ;
* page blanche ;
* layout cassé ;
* quiz incomplet ;
* paywall non fonctionnel ;
* dashboard illisible ;
* génération IA non fiable ;
* absence de loading/error state ;
* problème RGPD ;
* contenu IA dangereux.

### Bugs Logiques & Confiance

Lister :

* endpoints cassés ;
* erreurs API ;
* réponses quiz non sauvegardées ;
* premium non reconnu ;
* contenus premium accessibles gratuitement ;
* notification sans consentement ;
* perte de session ;
* redirection incorrecte ;
* erreur Stripe ;
* historique non sauvegardé.

### Recommandations

Classer les corrections :

* **P0 — Bloquant**
* **P1 — Critique**
* **P2 — Important**
* **P3 — Polish**

---

## Étape 8 — Boucle d’Auto-Correction

Seuil requis : **9/10 minimum partout**.

Scores nécessaires :

* Visuel ≥ 9
* Fonctionnel ≥ 9
* Confiance ≥ 9
* Produit ≥ 9
* Mobile ≥ 9

Si score < 9 :

### Visuel < 9

Rôle : **Design Lead Moonly**

Corriger :

* layout ;
* hiérarchie ;
* couleurs ;
* typographie ;
* spacing ;
* cartes ;
* responsive ;
* micro-interactions.

### Fonctionnel < 9

Rôle : **Builder Moonly**

Corriger :

* routes ;
* API ;
* quiz ;
* auth ;
* paiement ;
* génération IA ;
* dashboard ;
* sauvegarde données.

### Confiance < 9

Rôle : **Product Engineer Responsible App**

Corriger :

* loading states ;
* error states ;
* success states ;
* consentements ;
* RGPD ;
* disclaimers ;
* messages IA ;
* transparence commerciale.

### Produit < 9

Rôle : **Product Lead Moonly**

Corriger :

* proposition de valeur ;
* conversion quiz → résultat ;
* conversion résultat → paywall ;
* utilité dashboard ;
* rétention quotidienne ;
* cohérence freemium/premium.

### Mobile < 9

Rôle : **Mobile UX Lead**

Corriger :

* responsive ;
* lisibilité ;
* navigation mobile ;
* taille boutons ;
* confort quiz ;
* dashboard mobile ;
* performance petit écran.

Après correction :

1. Relancer l’audit.
2. Régénérer le rapport.
3. Comparer les scores.
4. Répéter jusqu’à scores ≥ 9 ou 3 tentatives.

Si échec après 3 tentatives :

* statut : `Blocked`
* escalade humaine requise ;
* expliquer le blocage ;
* proposer les décisions nécessaires.

---

## Étape 9 — Synchronisation Finale

Lorsque tous les scores ≥ 9 :

Mettre à jour `PLAN.md` :

```md
Status: Verified & Polished
Product: Moonly
Quality Gate: Passed
Ready for Production: Yes
```

Préparer le commit :

```bash
[AUTO-HEALED] Moonly production-ready quality gate
```

Valider :

```md
Production-ready
```

Ajouter au rapport final :

* date de validation ;
* scores finaux ;
* corrections effectuées ;
* risques restants ;
* recommandations post-lancement.

---

## Mode d’Exécution

Exécuter ce workflow :

* après toute génération IA ;
* après chaque refactor majeur ;
* après modification du quiz ;
* après modification du paywall ;
* après modification Stripe ;
* après modification dashboard ;
* après modification prompts IA ;
* avant mise en production.

---

## Prompt court d’exécution

```md
Exécute le workflow d’audit Moonly.

Analyse :
- qualité visuelle Mystical Premium ;
- parcours landing → quiz → résultat → paywall → dashboard ;
- quiz ;
- génération IA ;
- paiement ;
- abonnement ;
- notifications ;
- responsive mobile ;
- RGPD ;
- loading, empty, error, success states ;
- confiance utilisateur ;
- absence de dette UX, produ