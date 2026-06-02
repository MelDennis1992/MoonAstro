// Moonly Webapp — SPA Core Controller

document.addEventListener("DOMContentLoaded", () => {
  
  // --- APPLICATION STATE ---
  let state = {
    isLoggedIn: false,
    isPremium: false,
    currentQuizStep: 0,
    answers: {},
    report: null,
    selectedPlan: "monthly", // Default
    history: []
  };

  // --- HTML ELEMENTS SELECTIONS ---
  const pages = document.querySelectorAll(".page");
  const navBar = document.getElementById("app-nav-bar");
  const premiumBadgeContainer = document.getElementById("premium-badge-container");
  
  // Toast
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  // Load from localStorage if exists
  function loadState() {
    const saved = localStorage.getItem("moonly_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
        
        // If we have answers, generate report automatically
        if (state.answers && state.answers.birthDate) {
          state.report = generatePersonalizedReport(state.answers);
        }
      } catch (e) {
        console.error("Erreur de chargement du statut local:", e);
      }
    }
  }

  // Save to localStorage
  function saveState() {
    localStorage.setItem("moonly_state", JSON.stringify({
      isLoggedIn: state.isLoggedIn,
      isPremium: state.isPremium,
      answers: state.answers,
      history: state.history
    }));
  }

  // Show toast notification
  function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add("active");
    setTimeout(() => {
      toast.classList.remove("active");
    }, 3000);
  }

  // --- SPA ROUTER ---
  function router() {
    const hash = window.location.hash || "#landing";
    
    // Auth Guard: redirect to landing if attempting premium pages without answers
    const privatePages = ["#dashboard", "#history", "#settings"];
    if (privatePages.includes(hash) && (!state.answers || !state.answers.name)) {
      window.location.hash = "#landing";
      return;
    }

    // Toggle pages visibility
    pages.forEach(page => {
      if (`#${page.id}` === hash) {
        page.classList.add("active");
      } else {
        page.classList.remove("active");
      }
    });

    // Update Bottom Navigation Bar
    if (state.isLoggedIn && state.answers && state.answers.name) {
      navBar.classList.add("active");
      
      // Update Active Navigation Item
      const navItems = document.querySelectorAll(".nav-item");
      navItems.forEach(item => {
        if (item.getAttribute("href") === hash) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
    } else {
      navBar.classList.remove("active");
    }

    // Update Premium Badge Visibility
    if (state.isPremium) {
      premiumBadgeContainer.style.display = "block";
    } else {
      premiumBadgeContainer.style.display = "none";
    }

    // Page Specific Initializations
    if (hash === "#landing") {
      // Clear quiz step
      state.currentQuizStep = 0;
    } else if (hash === "#quiz") {
      renderQuizStep();
    } else if (hash === "#register") {
      const regEmailInput = document.getElementById("reg-email");
      if (regEmailInput && state.answers.email) {
        regEmailInput.value = state.answers.email;
      }
    } else if (hash === "#result") {
      populateResultPage();
    } else if (hash === "#dashboard") {
      populateDashboard();
    } else if (hash === "#history") {
      populateHistory();
    } else if (hash === "#settings") {
      populateSettings();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.addEventListener("hashchange", router);

  // --- LANDING PAGE LOGIC ---
  const btnStartQuiz = document.getElementById("btn-start-quiz");
  btnStartQuiz.addEventListener("click", () => {
    window.location.hash = "#quiz";
  });

  // --- ONBOARDING QUIZ ENGINE ---
  const quizContent = document.getElementById("quiz-content");
  const quizBtnBack = document.getElementById("quiz-btn-back");
  const quizBtnNext = document.getElementById("quiz-btn-next");
  const quizProgress = document.getElementById("quiz-progress");
  const quizStepIndicator = document.getElementById("quiz-step-indicator");

  // Dynamic Skip Logic for birthTime question
  function getNextStepIndex(currentIndex) {
    let nextIndex = currentIndex + 1;
    if (nextIndex < QUIZ_QUESTIONS.length) {
      const nextQ = QUIZ_QUESTIONS[nextIndex];
      if (nextQ.id === "birthTime" && state.answers.hasBirthTime === "no") {
        return getNextStepIndex(nextIndex);
      }
    }
    return nextIndex;
  }

  function getPrevStepIndex(currentIndex) {
    let prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const prevQ = QUIZ_QUESTIONS[prevIndex];
      if (prevQ.id === "birthTime" && state.answers.hasBirthTime === "no") {
        return getPrevStepIndex(prevIndex);
      }
    }
    return prevIndex;
  }

  quizBtnBack.addEventListener("click", () => {
    const prevStep = getPrevStepIndex(state.currentQuizStep);
    if (prevStep >= 0) {
      state.currentQuizStep = prevStep;
      renderQuizStep();
    } else {
      window.location.hash = "#landing";
    }
  });

  quizBtnNext.addEventListener("click", () => {
    const currentQuestion = QUIZ_QUESTIONS[state.currentQuizStep];
    const value = getQuizInputValue(currentQuestion);

    // Validation
    if (!value && !currentQuestion.optional) {
      showToast("Veuillez répondre ou compléter ce champ avant de continuer.");
      return;
    }

    // Save answer
    state.answers[currentQuestion.id] = value;
    saveState();

    // Advance
    const nextStep = getNextStepIndex(state.currentQuizStep);
    if (nextStep < QUIZ_QUESTIONS.length) {
      state.currentQuizStep = nextStep;
      renderQuizStep();
    } else {
      // Quiz finished -> Go to account creation
      window.location.hash = "#register";
    }
  });

  function getQuizInputValue(q) {
    if (q.type === "text" || q.type === "date" || q.type === "time") {
      const input = document.getElementById(`q-input-${q.id}`);
      return input ? input.value.trim() : "";
    } else if (q.type === "choice") {
      const selected = document.querySelector(`.quiz-option.selected`);
      return selected ? selected.getAttribute("data-value") : "";
    }
    return "";
  }

  function renderQuizStep() {
    const q = QUIZ_QUESTIONS[state.currentQuizStep];
    
    // Update step text and progress
    const progressPercent = ((state.currentQuizStep + 1) / QUIZ_QUESTIONS.length) * 100;
    quizProgress.style.width = `${progressPercent}%`;
    quizStepIndicator.textContent = `${state.currentQuizStep + 1} / ${QUIZ_QUESTIONS.length}`;

    // Render question layout
    let html = `
      <span class="quiz-category">${q.category}</span>
      <h2 class="quiz-question-title serif-font">${q.question}</h2>
    `;

    if (q.type === "text") {
      html += `
        <div class="quiz-input-group" style="margin-top: 10px;">
          <input type="${q.id === 'email' ? 'email' : 'text'}" id="q-input-${q.id}" class="quiz-input" placeholder="${q.placeholder || ''}" value="${state.answers[q.id] || ''}">
        </div>
      `;
    } else if (q.type === "date") {
      html += `
        <div class="quiz-input-group" style="margin-top: 10px;">
          <input type="date" id="q-input-${q.id}" class="quiz-input" value="${state.answers[q.id] || ''}">
        </div>
      `;
    } else if (q.type === "time") {
      html += `
        <div class="quiz-input-group" style="margin-top: 10px;">
          <input type="time" id="q-input-${q.id}" class="quiz-input" value="${state.answers[q.id] || ''}">
        </div>
      `;
    } else if (q.type === "choice") {
      html += `<div class="quiz-options" style="margin-top: 10px;">`;
      q.options.forEach(opt => {
        const isSelected = state.answers[q.id] === opt.value ? "selected" : "";
        html += `
          <div class="quiz-option ${isSelected}" data-value="${opt.value}">
            <div class="quiz-option-bullet">
              <div class="quiz-option-bullet-inner"></div>
            </div>
            <span>${opt.text}</span>
          </div>
        `;
      });
      html += `</div>`;
    }

    quizContent.innerHTML = html;

    // Attach choice listeners
    if (q.type === "choice") {
      const options = quizContent.querySelectorAll(".quiz-option");
      options.forEach(opt => {
        opt.addEventListener("click", () => {
          options.forEach(o => o.classList.remove("selected"));
          opt.classList.add("selected");
          
          // Auto advance on choices to make onboarding feel extremely fluid & premium!
          setTimeout(() => {
            quizBtnNext.click();
          }, 350);
        });
      });
    }

    // Input Enter listener
    const txtInput = quizContent.querySelector(".quiz-input");
    if (txtInput) {
      txtInput.focus();
      txtInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          quizBtnNext.click();
        }
      });
    }
  }

  // --- ACCOUNT CREATION FORM ---
  const formRegister = document.getElementById("form-register");
  formRegister.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const consent = document.getElementById("reg-consent");

    if (!consent || !consent.checked) {
      showToast("Veuillez consentir au traitement de vos données pour continuer.");
      return;
    }

    if (email && password) {
      // Simulate auth success
      state.isLoggedIn = true;
      state.answers.email = email;
      saveState();

      // Trigger Astrolabe calculations
      window.location.hash = "#loading-scene";
      runLoadingSequence();
    }
  });

  // --- RUN LOADING SEQUENCE ---
  const loadingStatusTitle = document.getElementById("loading-title");
  const loadingStatusText = document.getElementById("loading-text");
  
  const loadingSteps = [
    { title: "Connexion céleste...", desc: "Alignement des étoiles à votre date de naissance." },
    { title: "Calcul des éphémérides...", desc: "Détermination exacte de votre signe Solaire et Ascendant." },
    { title: "Analyse émotionnelle...", desc: "Cartographie de vos énergies émotionnelles dominantes." },
    { title: "Guidance par IA...", desc: "Création de vos conseils personnalisés d'amour et de carrière." },
    { title: "Prêt !", desc: "Harmonisation complète établie." }
  ];

  function runLoadingSequence() {
    let index = 0;
    
    // Interval to change titles & text beautifully
    const interval = setInterval(() => {
      index++;
      if (index < loadingSteps.length) {
        loadingStatusTitle.style.opacity = 0;
        loadingStatusText.style.opacity = 0;
        
        setTimeout(() => {
          loadingStatusTitle.textContent = loadingSteps[index].title;
          loadingStatusText.textContent = loadingSteps[index].desc;
          loadingStatusTitle.style.opacity = 1;
          loadingStatusText.style.opacity = 1;
        }, 300);
      } else {
        clearInterval(interval);
        
        // Generate personalized calculations!
        state.report = generatePersonalizedReport(state.answers);
        
        // Generate mock history representing past readings to populate history screen immediately
        generateMockHistory();
        
        saveState();
        
        // Redirect to results!
        window.location.hash = "#result";
      }
    }, 1500); // Total 6-7 seconds of stunning mystique transition
  }

  // Mock History Generator for perfect experience
  function generateMockHistory() {
    const zodiac = getZodiacInfo(state.answers.birthDate);
    const dateToday = new Date();
    
    state.history = [];
    
    // 3 past days
    for (let i = 1; i <= 3; i++) {
      const pastDate = new Date(dateToday);
      pastDate.setDate(dateToday.getDate() - i);
      
      const dayName = pastDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      
      let ratingSymbol = "✦ Harmonieux";
      let summaryText = `Vos énergies du ${dayName} ont favorisé l'introspection spirituelle. Votre planète régente ${zodiac.ruler} vous a invité(e) à assainir vos priorités professionnelles.`;
      
      if (i === 1) {
        ratingSymbol = "✦ Magnétique";
        summaryText = `Guidance d'amour : les transits vous invitaient à exprimer sereinement vos sentiments secrets. Une opportunité inattendue s'est matérialisée.`;
      } else if (i === 2) {
        ratingSymbol = "✦ Alchimique";
        summaryText = `Point de vigilance : protégez activement votre bulle énergétique contre la surcharge mentale et les émotions partagées.`;
      }
      
      state.history.push({
        date: pastDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
        displayDate: dayName,
        rating: ratingSymbol,
        text: summaryText
      });
    }
  }

  // --- POPULATE PERSONALIZED RESULT PAGE (FREE) ---
  const resUsername = document.getElementById("res-username");
  const resProfileName = document.getElementById("res-profile-name");
  const resSun = document.getElementById("res-sun");
  const resAscendant = document.getElementById("res-ascendant");
  const resEnergyDesc = document.getElementById("res-energy-desc");
  const resStrength = document.getElementById("res-strength");
  const resBlocker = document.getElementById("res-blocker");

  // Nouveaux éléments de numérologie
  const resLifepathVal = document.getElementById("res-lifepath-val");
  const resLifepathDesc = document.getElementById("res-lifepath-desc");
  const resNumExpression = document.getElementById("res-num-expression");
  const resNumIntime = document.getElementById("res-num-intime");

  function populateResultPage() {
    if (!state.report) return;
    
    const r = state.report;
    resUsername.textContent = r.name;
    resProfileName.textContent = r.energyProfile;
    resSun.textContent = `${r.zodiac.name} ${r.zodiac.symbol}`;
    resAscendant.textContent = `${r.ascendant} ✦`;
    resEnergyDesc.textContent = r.energyDescription;
    resStrength.textContent = r.mainStrength;
    resBlocker.textContent = r.blocker;

    // Remplir la numérologie
    if (r.lifePath) {
      resLifepathVal.textContent = `${r.lifePath.number} — ${r.lifePath.name}`;
      resLifepathDesc.textContent = r.lifePath.desc;
    }
    if (r.numerologyName) {
      resNumExpression.textContent = r.numerologyName.expressionText;
      resNumIntime.textContent = r.numerologyName.soulUrgeText;
    }
  }

  // Results Paywall link
  const btnGoToPaywall = document.getElementById("btn-go-to-paywall");
  btnGoToPaywall.addEventListener("click", () => {
    window.location.hash = "#paywall";
  });

  // --- PAYWALL PREMIUM & STRIPE MODAL ---
  const subOptions = document.querySelectorAll(".sub-option");
  const btnSubscribe = document.getElementById("btn-subscribe");
  const btnSkipPaywall = document.getElementById("btn-skip-paywall");
  
  // Stripe Elements
  const stripeModal = document.getElementById("stripe-modal");
  const stripeClose = document.getElementById("stripe-modal-close");
  const stripePlanTitle = document.getElementById("stripe-plan-title");
  const stripePlanPrice = document.getElementById("stripe-plan-price");
  const formStripe = document.getElementById("form-stripe");
  const btnStripeSubmit = document.getElementById("btn-stripe-submit");

  // Selection of Subscription
  subOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      subOptions.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      state.selectedPlan = opt.getAttribute("data-plan");
      
      // Update main subscription CTA label
      if (state.selectedPlan === "weekly") {
        btnSubscribe.textContent = "Commencer mon abonnement hebdomadaire";
      } else if (state.selectedPlan === "monthly") {
        btnSubscribe.textContent = "Commencer mon essai gratuit";
      } else {
        btnSubscribe.textContent = "S'abonner annuellement (Réduction 60%)";
      }
    });
  });

  // Open Checkout Modal
  btnSubscribe.addEventListener("click", () => {
    // Fill Stripe pricing summary based on active plan selection
    if (state.selectedPlan === "weekly") {
      stripePlanTitle.textContent = "Abonnement Hebdomadaire Moonly";
      stripePlanPrice.textContent = "2,99 €";
      btnStripeSubmit.textContent = "S'abonner (2,99 € / semaine)";
    } else if (state.selectedPlan === "monthly") {
      stripePlanTitle.textContent = "Abonnement Mensuel (3 jours d'essai)";
      stripePlanPrice.textContent = "9,99 €";
      btnStripeSubmit.textContent = "Activer mon essai & payer (9,99 € / mois)";
    } else {
      stripePlanTitle.textContent = "Abonnement Annuel Moonly";
      stripePlanPrice.textContent = "49,99 €";
      btnStripeSubmit.textContent = "S'abonner annuellement (49,99 € / an)";
    }

    stripeModal.classList.add("active");
  });

  // Close Checkout Modal
  stripeClose.addEventListener("click", () => {
    stripeModal.classList.remove("active");
  });

  // Stripe Inputs Formatting & UX Enhancement
  const cardNumberInput = document.getElementById("stripe-card-number");
  const cardExpiryInput = document.getElementById("stripe-card-expiry");
  const cardCvcInput = document.getElementById("stripe-card-cvc");

  cardNumberInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.match(/.{1,4}/g)?.join(" ") || value;
    e.target.value = value.substring(0, 19);
  });

  cardExpiryInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    e.target.value = value;
  });

  cardCvcInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 3);
  });

  // Stripe simulated checkout logic
  formStripe.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Change button state to elegant loading spinner
    btnStripeSubmit.disabled = true;
    btnStripeSubmit.style.opacity = 0.8;
    btnStripeSubmit.innerHTML = `<span style="display:inline-block; animation: rotate-cw 1s linear infinite; margin-right: 8px;">✦</span> Traitement sécurisé...`;
    
    setTimeout(() => {
      // Payment Successful
      state.isPremium = true;
      saveState();
      
      // Close Stripe Modal
      stripeModal.classList.remove("active");
      
      // Reset button
      btnStripeSubmit.disabled = false;
      btnStripeSubmit.style.opacity = 1;
      btnStripeSubmit.textContent = "Activer mon essai & payer";
      
      // Show success feedback
      showToast("Abonnement activé ! Bienvenue sur Moonly Premium.");
      
      // Redirect to Dashboard
      window.location.hash = "#dashboard";
    }, 2200);
  });

  // Skip paywall (retains free restricted state)
  btnSkipPaywall.addEventListener("click", () => {
    state.isPremium = false;
    saveState();
    showToast("Version gratuite active — Contenus limités.");
    window.location.hash = "#dashboard";
  });

  // --- PREMIUM DASHBOARD ---
  const dashUsername = document.getElementById("dash-username");
  const dashDate = document.getElementById("dash-date");
  const dashZodiacName = document.getElementById("dash-zodiac-name");
  const dashZodiacIcon = document.getElementById("dash-zodiac-icon");
  const dashGaugeFill = document.getElementById("dash-gauge-fill");
  const dashGaugeText = document.getElementById("dash-gauge-text");
  const dashEnergyProfile = document.getElementById("dash-energy-profile");
  
  // Dashboard Daily Fields
  const dashDailyGeneral = document.getElementById("dash-daily-general");
  const dashDailyLove = document.getElementById("dash-daily-love");
  const dashDailyCareer = document.getElementById("dash-daily-career");
  const dashDailyWellbeing = document.getElementById("dash-daily-wellbeing");
  const dashDailyWarning = document.getElementById("dash-daily-warning");
  const dashDailyAffirmation = document.getElementById("dash-daily-affirmation");
  
  const starsLove = document.getElementById("stars-love");
  const starsCareer = document.getElementById("stars-career");
  const starsWellbeing = document.getElementById("stars-wellbeing");
  
  const dashLuckyNumber = document.getElementById("dash-lucky-number");
  const dashLuckyMonth = document.getElementById("dash-lucky-month");
  const dashAscendant = document.getElementById("dash-ascendant");
  const dashLifepath = document.getElementById("dash-lifepath");
  
  // Dashboard Forecast Tabs
  const dashTabButtons = document.querySelectorAll(".dash-tab");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const dashWeeklyText = document.getElementById("dash-weekly-text");
  const dashMonthlyText = document.getElementById("dash-monthly-text");

  // Dashboard Tabs Switch Logic
  dashTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      dashTabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));
      
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      document.getElementById(targetId).classList.add("active");
    });
  });

  function populateDashboard() {
    if (!state.report) return;
    const r = state.report;
    const isPrem = state.isPremium;

    // Direct profile properties
    dashUsername.textContent = r.name;
    
    // Set formatted date
    const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    dashDate.textContent = new Date().toLocaleDateString("fr-FR", options);
    
    dashZodiacName.textContent = r.zodiac.name;
    
    // Inject Custom Zodiac Icon SVG
    dashZodiacIcon.outerHTML = `
      <svg class="dash-zodiac-icon" viewBox="0 0 24 24" id="dash-zodiac-icon">
        <text x="50%" y="65%" text-anchor="middle" font-size="14" font-family="sans-serif">${r.zodiac.symbol}</text>
      </svg>
    `;

    // Dynamic Circular Energy Gauge Chart
    const score = r.energyScore;
    dashGaugeText.textContent = `${score}%`;
    dashEnergyProfile.textContent = r.energyProfile;
    
    // SVG DashOffset animation: length is 251.2
    const offset = 251.2 - (251.2 * score) / 100;
    dashGaugeFill.style.strokeDashoffset = offset;

    // Alimenter le Chemin de Vie
    if (r.lifePath) {
      dashLifepath.textContent = r.lifePath.number;
    } else {
      dashLifepath.textContent = "✦";
    }

    // --- DAILY TEMPLATE INJECTS ---
    dashDailyGeneral.textContent = r.dailyHoroscope.general;
    
    // Premium restrictions check
    if (isPrem) {
      // Premium is fully active
      dashDailyLove.textContent = r.dailyHoroscope.love;
      dashDailyCareer.textContent = r.dailyHoroscope.career;
      dashDailyWellbeing.textContent = r.dailyHoroscope.wellbeing;
      dashDailyWarning.textContent = r.dailyHoroscope.warning;
      dashDailyAffirmation.textContent = `"${r.dailyHoroscope.affirmation}"`;

      // Build category rating stars
      renderStars(starsLove, r.dailyHoroscope.loveStars);
      renderStars(starsCareer, r.dailyHoroscope.careerStars);
      renderStars(starsWellbeing, r.dailyHoroscope.wellbeingStars);

      // Lucky details
      dashLuckyNumber.textContent = r.luckyNumber;
      dashLuckyMonth.textContent = r.favorableMonth;
      dashAscendant.textContent = `${r.ascendant} ${getZodiacSymbolByName(r.ascendant)}`;
      
      // Weekly and Monthly Forecasts
      const forecasts = generateForecasts(r);
      dashWeeklyText.innerHTML = `<p>${forecasts.weekly}</p>`;
      dashMonthlyText.innerHTML = `<p>${forecasts.monthly}</p>`;

    } else {
      // Free User is limited
      const lockedHTML = `
        <span style="filter: blur(4px); opacity: 0.35; user-select: none;">
          Cette guidance sentimentale requiert un statut premium pour décrypter vos cycles amoureux d'aujourd'hui.
        </span>
        <div style="margin-top: 8px; font-size: 12px;">
          <a href="#paywall" style="color: var(--accent-gold-dark); font-weight: 600; text-decoration: none;">✦ Débloquer avec Premium &rarr;</a>
        </div>
      `;
      dashDailyLove.innerHTML = lockedHTML;
      dashDailyCareer.innerHTML = lockedHTML;
      dashDailyWellbeing.innerHTML = lockedHTML;
      
      dashDailyWarning.innerHTML = `
        <span style="filter: blur(4px); opacity: 0.35; user-select: none;">
          Attention particulière quant à vos astres aujourd'hui...
        </span>
        <div style="margin-top: 4px; font-size: 11px;">
          <a href="#paywall" style="color: #BA554A; font-weight: 600; text-decoration: none;">Débloquer mon alerte de vigilance &rarr;</a>
        </div>
      `;
      dashDailyAffirmation.textContent = `"Je m'ouvre doucement aux guidances que m'offre le cosmos."`;
      
      renderStars(starsLove, 0);
      renderStars(starsCareer, 0);
      renderStars(starsWellbeing, 0);

      dashLuckyNumber.textContent = "✦";
      dashLuckyMonth.textContent = "✦";
      dashAscendant.textContent = `${r.ascendant}`;

      // Locked Weekly & Monthly tabs text
      const lockedTabHTML = `
        <div style="text-align: center; padding: 20px 0;">
          <svg viewBox="0 0 24 24" style="width: 44px; height: 44px; fill: var(--accent-gold); margin-bottom: 12px;">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
          <h3 class="serif-font" style="font-size: 18px; margin-bottom: 4px;">Guidance Cosmique Premium</h3>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 80%; margin: 0 auto 16px;">
            Accédez aux bilans astrologiques de la semaine et aux grandes prévisions mensuelles de votre signe.
          </p>
          <a href="#paywall" class="btn btn-gold" style="display:inline-flex; width:auto; padding: 10px 24px; font-size:13px; border-radius:12px;">Débloquer les prévisions</a>
        </div>
      `;
      dashWeeklyText.innerHTML = lockedTabHTML;
      dashMonthlyText.innerHTML = lockedTabHTML;
    }
  }

  function renderStars(container, count) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= count) {
        stars += `<svg class="star-mini" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
      } else {
        stars += `<svg class="star-mini empty" viewBox="0 0 24 24"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03z"/></svg>`;
      }
    }
    container.innerHTML = stars;
  }

  function getZodiacSymbolByName(name) {
    const found = ZODIAC_SIGNS.find(z => z.name.toLowerCase() === name.toLowerCase());
    return found ? found.symbol : "✦";
  }

  // --- PERSONAL HISTORY PAGE ---
  const historyList = document.getElementById("history-list");
  
  function populateHistory() {
    if (!state.history || state.history.length === 0) {
      historyList.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          Aucun historique d'horoscope disponible. Votre journal se complétera de jour en jour.
        </div>
      `;
      return;
    }

    let html = "";
    
    // Add today as premium lock or text in timeline
    const zodiac = getZodiacInfo(state.answers.birthDate);
    const todayName = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    const todayShort = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    
    html += `
      <div class="history-item">
        <div class="history-card" style="border-left: 3px solid var(--accent-gold);">
          <div class="history-date">Aujourd'hui — ${todayShort}</div>
          <strong style="font-size:12px; color: var(--primary-midnight); display:block; margin-bottom:4px;">✦ Énergie du jour active</strong>
          <p class="history-summary">
            ${state.report ? state.report.dailyHoroscope.general.substring(0, 100) + "..." : "Consultez votre dashboard de guidance active."}
          </p>
          <a href="#dashboard" style="display:inline-block; font-size:12px; color: var(--accent-gold-dark); text-decoration:none; margin-top:8px; font-weight:600;">Consulter ma guidance &rarr;</a>
        </div>
      </div>
    `;

    // Past items
    state.history.forEach(item => {
      html += `
        <div class="history-item">
          <div class="history-card">
            <div class="history-date">${item.date}</div>
            <strong style="font-size:12px; color: var(--primary-midnight); display:block; margin-bottom:4px;">${item.rating}</strong>
            <p class="history-summary">${item.text}</p>
          </div>
        </div>
      `;
    });

    historyList.innerHTML = html;
  }

  // --- USER PROFILE & SETTINGS ---
  const setUsernameInput = document.getElementById("set-username");
  const setBirthdateInput = document.getElementById("set-birthdate");
  const setBirthtimeInput = document.getElementById("set-birthtime");
  const setBirthplaceInput = document.getElementById("set-birthplace");
  const formSettings = document.getElementById("form-settings-profile");
  const setStatusText = document.getElementById("set-status-text");
  const btnToggleDemoPremium = document.getElementById("btn-toggle-demo-premium");
  const btnLogout = document.getElementById("btn-logout");
  const btnResetData = document.getElementById("btn-reset-data");

  function populateSettings() {
    if (!state.answers) return;
    
    // Natal Info filling
    setUsernameInput.value = state.answers.name || "";
    setBirthdateInput.value = state.answers.birthDate || "";
    setBirthtimeInput.value = state.answers.birthTime || "";
    setBirthplaceInput.value = state.answers.birthPlace || "";

    // Status rendering
    if (state.isPremium) {
      setStatusText.textContent = "Abonnement Premium Actif 👑";
      setStatusText.style.color = "var(--accent-gold-dark)";
      btnToggleDemoPremium.innerHTML = `
        <button id="demo-premium-trigger" class="btn btn-secondary" style="padding: 10px 14px; font-size: 11px; border-radius: 8px; flex: 1;">
          Simuler mode Gratuit
        </button>
      `;
    } else {
      setStatusText.textContent = "Version Gratuite Limitée ✦";
      setStatusText.style.color = "var(--text-muted)";
      btnToggleDemoPremium.innerHTML = `
        <button id="demo-premium-trigger" class="btn btn-gold" style="padding: 10px 14px; font-size: 11px; border-radius: 8px; flex: 1;">
          Simuler/Activer Premium
        </button>
      `;
    }

    // Attach simulation trigger listener
    const demoTrigger = document.getElementById("demo-premium-trigger");
    if (demoTrigger) {
      demoTrigger.addEventListener("click", () => {
        state.isPremium = !state.isPremium;
        saveState();
        showToast(state.isPremium ? "Premium activé (Simulation) !" : "Premium désactivé (Simulation) !");
        
        // Refresh routing / state
        populateSettings();
        router();
      });
    }
  }

  // Update Settings Profile Form
  formSettings.addEventListener("submit", (e) => {
    e.preventDefault();
    
    state.answers.name = setUsernameInput.value.trim();
    state.answers.birthDate = setBirthdateInput.value;
    state.answers.birthTime = setBirthtimeInput.value;
    state.answers.birthPlace = setBirthplaceInput.value.trim();

    // Recalculate Astro theme!
    state.report = generatePersonalizedReport(state.answers);
    saveState();
    
    showToast("Votre thème astral natal a été recalculé avec succès ✦");
    router();
  });

  // Logout
  btnLogout.addEventListener("click", () => {
    state.isLoggedIn = false;
    saveState();
    showToast("Déconnexion réussie. À bientôt sous les étoiles.");
    window.location.hash = "#landing";
  });

  // Reset/Delete
  btnResetData.addEventListener("click", () => {
    if (confirm("Voulez-vous vraiment supprimer définitivement votre profil et toutes vos lectures ?")) {
      localStorage.removeItem("moonly_state");
      state = {
        isLoggedIn: false,
        isPremium: false,
        currentQuizStep: 0,
        answers: {},
        report: null,
        selectedPlan: "monthly",
        history: []
      };
      showToast("Toutes vos données ont été définitivement effacées.");
      window.location.hash = "#landing";
    }
  });

  // Header Logo click routing help
  const logoLink = document.getElementById("logo-link");
  logoLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (state.isLoggedIn && state.answers && state.answers.name) {
      window.location.hash = "#dashboard";
    } else {
      window.location.hash = "#landing";
    }
  });

  // --- TERMS & PRIVACY LINKS HELP ---
  const linkTermsLanding = document.getElementById("link-terms-landing");
  const linkPrivacyLanding = document.getElementById("link-privacy-landing");
  
  if (linkTermsLanding) linkTermsLanding.addEventListener("click", () => window.location.hash = "#terms");
  if (linkPrivacyLanding) linkPrivacyLanding.addEventListener("click", () => window.location.hash = "#terms");

  // --- INITIALIZE APPLICATION STATE ---
  loadState();
  router(); // Run routing immediately on load
});
