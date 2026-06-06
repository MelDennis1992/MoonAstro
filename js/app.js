// Moon Astro Webapp — SPA Core Controller

document.addEventListener("DOMContentLoaded", () => {
  
  // --- SUPABASE INITIALIZATION ---
  const SUPABASE_URL = "https://oorlsqxfwhozmciktljf.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcmxzcXhmd2hvem1jaWt0bGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjgyMDIsImV4cCI6MjA5NTkwNDIwMn0.LyyeYMpg1WFX6fsx_VY1qdy_qeO29luRlc12ZojAG2s";
  const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
  
  if (!supabase) {
    console.warn("Supabase SDK non détecté. Fonctionnement en mode local dégradé.");
  }

  // --- APPLICATION STATE ---
  let state = {
    isLoggedIn: false,
    isPremium: false,
    currentQuizStep: 0,
    answers: {},
    report: null,
    selectedPlan: "monthly", // Default
    history: [],
    isPasswordRecoveryMode: false,
    lang: "fr",
    midQuizSynthesisConfirmed: false
  };
 
  // --- HTML ELEMENTS SELECTIONS ---
  const pages = document.querySelectorAll(".page");
  const navBar = document.getElementById("app-nav-bar");
  const premiumBadgeContainer = document.getElementById("premium-badge-container");
  
  // Toast
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
 
  // Load from localStorage & Sync with Supabase Database
  function loadState() {
    // 1. Load local state first
    const saved = localStorage.getItem("moon_astro_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
        if (state.answers && state.answers.birthDate) {
          state.report = generatePersonalizedReport(state.answers, state.lang);
        }
      } catch (e) {
        console.error("Erreur de chargement du statut local:", e);
      }
    }
 
    // 2. Fetch and sync from Supabase
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          const user = session.user;
          state.isLoggedIn = true;
 
          // Fetch profile data from db
          supabase.from("astrology_profiles").select("*").eq("id", user.id).maybeSingle().then(({ data, error }) => {
            if (error) {
              console.error("Erreur de chargement du profil distant:", error);
              return;
            }
 
            if (data) {
              // Update state with live DB data
              state.answers.name = data.firstname || state.answers.name || "";
              state.answers.birthDate = data.birthdate || state.answers.birthDate || "";
              state.answers.birthTime = data.birthtime || state.answers.birthTime || "";
              state.answers.birthPlace = data.birthplace || state.answers.birthPlace || "";
              state.answers.latitude = typeof data.latitude === "number" ? data.latitude : state.answers.latitude;
              state.answers.longitude = typeof data.longitude === "number" ? data.longitude : state.answers.longitude;
              state.answers.email = data.email || user.email;
              state.isPremium = (data.payment_status === "premium" || data.payment_status === "active");
              
              if (state.answers.birthDate) {
                state.report = generatePersonalizedReport(state.answers, state.lang);
              }
              
              generateMockHistory();
              saveState();
              router(); // Update page views
            }
          });
        }
      });
 
      // Handle real-time auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          state.isLoggedIn = true;
          saveState();
          router();
        } else if (event === "SIGNED_OUT") {
          state.isLoggedIn = false;
          state.isPremium = false;
          state.answers = {};
          state.report = null;
          state.history = [];
          saveState();
          router();
        }
      });
    }
  }
 
  // Save to localStorage
  function saveState() {
    localStorage.setItem("moon_astro_state", JSON.stringify({
      isLoggedIn: state.isLoggedIn,
      isPremium: state.isPremium,
      answers: state.answers,
      history: state.history,
      lang: state.lang
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
    let hash = window.location.hash || "#landing";
    
    // 1. Handle Supabase Auth redirect hashes (e.g. recovery / access_token)
    if (hash.includes("access_token=") || hash.includes("type=recovery") || hash.includes("error_description=")) {
      const isRecovery = hash.includes("type=recovery") || hash.includes("recovery");
      if (isRecovery) {
        state.isPasswordRecoveryMode = true;
        window.location.hash = "#settings";
      } else {
        window.location.hash = "#dashboard";
      }
      return;
    }

    // 2. Auth Guard: redirect to landing if attempting premium pages without answers
    const privatePages = ["#dashboard", "#history", "#settings", "#oracle"];
    if (privatePages.includes(hash) && (!state.answers || !state.answers.name)) {
      window.location.hash = "#landing";
      return;
    }

    // 3. Redirect logged-in users from landing to dashboard (or settings if recovering)
    if (hash === "#landing" && state.isLoggedIn && state.answers && state.answers.name) {
      if (state.isPasswordRecoveryMode) {
        window.location.hash = "#settings";
      } else {
        window.location.hash = "#dashboard";
      }
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

    // Update Header Profile Link & Text
    const headerProfileLink = document.getElementById("header-profile-link");
    const headerProfileText = document.getElementById("header-profile-text");
    if (headerProfileLink && headerProfileText) {
      const lang = state.lang || "fr";
      if (state.isLoggedIn) {
        headerProfileLink.setAttribute("href", "#settings");
        headerProfileText.textContent = getTranslation(lang, "nav.my_profile") || "Mon Profil";
        headerProfileText.setAttribute("data-i18n", "nav.my_profile");
      } else {
        headerProfileLink.setAttribute("href", "#register");
        headerProfileText.textContent = getTranslation(lang, "nav.client_space") || "Espace Client";
        headerProfileText.setAttribute("data-i18n", "nav.client_space");
      }
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
      state.midQuizSynthesisConfirmed = false;
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
    } else if (hash === "#oracle") {
      initOracleChat();
    } else if (hash === "#settings") {
      populateSettings();
      if (state.isPasswordRecoveryMode) {
        state.isPasswordRecoveryMode = false;
        setTimeout(() => {
          showToast("Session de récupération active. Veuillez définir votre nouveau mot de passe ci-dessous.");
          const setPasswordInput = document.getElementById("set-password");
          if (setPasswordInput) setPasswordInput.focus();
        }, 500);
      }
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
    if (state.currentQuizStep === 10 && state.midQuizSynthesisConfirmed) {
      state.midQuizSynthesisConfirmed = false;
      renderQuizStep();
      return;
    }
    const prevStep = getPrevStepIndex(state.currentQuizStep);
    if (prevStep >= 0) {
      state.currentQuizStep = prevStep;
      if (state.currentQuizStep < 10) {
        state.midQuizSynthesisConfirmed = false;
      }
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
    const lang = state.lang || "fr";

    // Intercept at step index 10 (after 10 questions) to show the mid-quiz celestial trinity synthesis
    if (state.currentQuizStep === 10 && !state.midQuizSynthesisConfirmed) {
      if (quizBtnNext && quizBtnNext.parentElement) {
        quizBtnNext.parentElement.style.display = "none";
      }
      
      const astro = computeAstrology(
        state.answers.birthDate,
        state.answers.birthTime,
        state.answers.latitude,
        state.answers.longitude,
        state.answers.birthPlace
      );
      
      const sunSign = lang === "en" ? (astro.sun.name_en || astro.sun.name) : astro.sun.name;
      const moonSign = lang === "en" ? (astro.moon.name_en || astro.moon.name) : astro.moon.name;
      const ascSign = lang === "en" ? (astro.ascendant.name_en || astro.ascendant.name) : astro.ascendant.name;
      
      const sunSymbol = astro.sun.symbol || "";
      const moonSymbol = astro.moon.symbol || "";
      const ascSymbol = astro.ascendant.symbol || "";
      
      const title = getTranslation(lang, "quiz.synthesis.title");
      const sub = getTranslation(lang, "quiz.synthesis.sub");
      const sunLabel = getTranslation(lang, "quiz.synthesis.sun");
      const moonLabel = getTranslation(lang, "quiz.synthesis.moon");
      const ascLabel = getTranslation(lang, "quiz.synthesis.asc");
      const desc = getTranslation(lang, "quiz.synthesis.desc");
      const btnText = getTranslation(lang, "quiz.synthesis.btn");
      
      let html = `
        <div class="synthesis-container">
          <h2 class="synthesis-title serif-font">${title}</h2>
          <p class="synthesis-subtitle">${sub}</p>
          
          <div class="synthesis-grid">
            <div class="synthesis-card">
              <div class="synthesis-icon">☉</div>
              <div>
                <span class="synthesis-label">${sunLabel}</span>
                <span class="synthesis-value">${sunSign} ${sunSymbol}</span>
              </div>
            </div>
            
            <div class="synthesis-card">
              <div class="synthesis-icon">☽</div>
              <div>
                <span class="synthesis-label">${moonLabel}</span>
                <span class="synthesis-value">${moonSign} ${moonSymbol}</span>
              </div>
            </div>
            
            <div class="synthesis-card">
              <div class="synthesis-icon">▲</div>
              <div>
                <span class="synthesis-label">${ascLabel}</span>
                <span class="synthesis-value">${ascSign} ${ascSymbol}</span>
              </div>
            </div>
          </div>
          
          <p class="synthesis-desc">${desc}</p>
          
          <button id="synthesis-continue-btn" class="btn btn-gold" style="width: auto; padding: 12px 32px; font-weight: 600; border-radius: 14px;">
            ${btnText}
          </button>
        </div>
      `;
      
      quizContent.innerHTML = html;
      
      const synthBtn = document.getElementById("synthesis-continue-btn");
      if (synthBtn) {
        synthBtn.addEventListener("click", () => {
          state.midQuizSynthesisConfirmed = true;
          renderQuizStep();
        });
      }
      
      quizProgress.style.width = `20%`;
      quizStepIndicator.textContent = lang === "en" ? "Cosmic Pause" : "Pause Cosmique";
      return;
    }

    const q = QUIZ_QUESTIONS[state.currentQuizStep];
    
    // Show Next button only for manual input questions (text, date, time), hide it for choices
    if (quizBtnNext && quizBtnNext.parentElement) {
      quizBtnNext.parentElement.style.display = q.type === "choice" ? "none" : "block";
      quizBtnNext.textContent = getTranslation(lang, "quiz.btn.next") || "Continuer";
    }
    
    // Update step text and progress
    const progressPercent = ((state.currentQuizStep + 1) / QUIZ_QUESTIONS.length) * 100;
    quizProgress.style.width = `${progressPercent}%`;
    quizStepIndicator.textContent = `${state.currentQuizStep + 1} / ${QUIZ_QUESTIONS.length}`;
 
    // Get translated category & question
    const category = lang === "en" ? (q.category_en || q.category) : q.category;
    const question = lang === "en" ? (q.question_en || q.question) : q.question;
 
    // Render question layout
    let html = `
      <span class="quiz-category">${category}</span>
      <h2 class="quiz-question-title serif-font">${question}</h2>
    `;
 
    if (q.type === "text") {
      const placeholder = lang === "en" ? (q.placeholder_en || q.placeholder || '') : (q.placeholder || '');
      html += `
        <div class="quiz-input-group" style="margin-top: 10px; position: relative;">
          <input type="${q.id === 'email' ? 'email' : 'text'}" id="q-input-${q.id}" class="quiz-input" placeholder="${placeholder}" value="${state.answers[q.id] || ''}">
          ${q.id === "birthPlace" ? `
            <div id="birthplace-suggestions" class="autocomplete-suggestions" style="display: none;"></div>
            <div id="birthplace-coordinates" style="margin-top: 10px; font-size: 13px; color: var(--accent-gold-dark); text-align: center; font-weight: 500; display: none;"></div>
            <div id="birthplace-map" style="height: 160px; margin-top: 15px; border-radius: 16px; border: 1px solid rgba(197, 160, 89, 0.2); display: none;"></div>
          ` : ""}
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
      const symbols = ["✦", "☽", "★", "✨", "☄", "☉", "🪐", "⚜"];
      html += `<div class="quiz-options-grid">`;
      q.options.forEach((opt, idx) => {
        const isSelected = state.answers[q.id] === opt.value ? "selected" : "";
        const optionText = lang === "en" ? (opt.text_en || opt.text) : opt.text;
        const symbol = symbols[idx % symbols.length];
        
        html += `
          <div class="quiz-option quiz-option-card ${isSelected}" data-value="${opt.value}">
            <div class="quiz-card-decor">${symbol}</div>
            <div class="quiz-card-text">${optionText}</div>
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

    // Geocoding & Mapping Autocomplete for Birth Place
    if (q.id === "birthPlace") {
      const birthPlaceInput = document.getElementById("q-input-birthPlace");
      const suggestionsContainer = document.getElementById("birthplace-suggestions");
      const coordsContainer = document.getElementById("birthplace-coordinates");
      const mapContainer = document.getElementById("birthplace-map");
      let map = null;
      let marker = null;

      const initMap = (lat, lon) => {
        if (!mapContainer) return;
        if (coordsContainer) {
          coordsContainer.style.display = "block";
          coordsContainer.innerHTML = `📍 Coordonnées exactes : ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`;
        }
        if (!window.L) return; // Skip map rendering if Leaflet is not loaded yet
        mapContainer.style.display = "block";
        try {
          if (map) {
            try {
              map.remove();
            } catch (err) {
              console.warn("Error removing old onboarding map:", err);
            }
            map = null;
          }
          map = window.L.map('birthplace-map', {
            center: [lat, lon],
            zoom: 11,
            zoomControl: false,
            attributionControl: false
          });
          window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
          }).addTo(map);
          marker = window.L.marker([lat, lon]).addTo(map);
          setTimeout(() => map.invalidateSize(), 200);
        } catch (e) {
          console.error("Map rendering error:", e);
        }
      };

      if (state.answers.latitude && state.answers.longitude) {
        setTimeout(() => initMap(state.answers.latitude, state.answers.longitude), 100);
      }

      let debounceTimeout;
      birthPlaceInput.addEventListener("input", (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimeout);
        if (query.length < 3) {
          suggestionsContainer.style.display = "none";
          return;
        }

        debounceTimeout = setTimeout(() => {
          searchCitySuggestions(query, (suggestions) => {
            suggestionsContainer.innerHTML = "";
            if (suggestions && suggestions.length > 0) {
              suggestionsContainer.style.display = "block";
              suggestions.forEach(item => {
                const div = document.createElement("div");
                div.className = "autocomplete-suggestion-item";
                div.textContent = item.display_name;
                div.addEventListener("click", () => {
                  birthPlaceInput.value = item.display_name;
                  state.answers.birthPlace = item.display_name;
                  state.answers.latitude = item.lat;
                  state.answers.longitude = item.lon;
                  saveState();
                  suggestionsContainer.style.display = "none";
                  initMap(item.lat, item.lon);
                });
                suggestionsContainer.appendChild(div);
              });
            } else {
              suggestionsContainer.style.display = "none";
            }
          });
        }, 400);
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (evt) => {
        if (evt.target !== birthPlaceInput && evt.target !== suggestionsContainer) {
          suggestionsContainer.style.display = "none";
        }
      });
    }
  }

  // --- ACCOUNT CREATION & LOGIN FORM ---
  const formRegister = document.getElementById("form-register");
  const toggleAuthMode = document.getElementById("toggle-auth-mode");
  const registerTitle = document.querySelector(".register-title");
  const registerSub = document.querySelector(".register-sub");
  const regConsentInput = document.getElementById("reg-consent");
  const consentGroup = regConsentInput ? regConsentInput.parentElement : null;
  const btnRegisterSubmit = document.getElementById("btn-register-submit");

  let authMode = "signup";

  const forgotPasswordLink = document.getElementById("forgot-password-link");

  // --- SHOW / HIDE PASSWORD TOGGLES ---
  function setupPasswordToggle(btnId, inputId, eyeOnId, eyeOffId) {
    const btn    = document.getElementById(btnId);
    const input  = document.getElementById(inputId);
    const eyeOn  = document.getElementById(eyeOnId);
    const eyeOff = document.getElementById(eyeOffId);
    if (!btn || !input) return;
    btn.addEventListener("click", () => {
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      if (eyeOn)  eyeOn.style.display  = isHidden ? "none" : "";
      if (eyeOff) eyeOff.style.display = isHidden ? ""     : "none";
    });
  }
  setupPasswordToggle("toggle-reg-password", "reg-password", "eye-icon-reg", "eye-off-icon-reg");
  setupPasswordToggle("toggle-set-password", "set-password", "eye-icon-set", "eye-off-icon-set");


  if (toggleAuthMode) {
    toggleAuthMode.addEventListener("click", handleAuthToggleClick);
  }

  // Mot de passe oublié (Supabase Auth reset)
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      const email = document.getElementById("reg-email").value.trim();
      if (!email) {
        showToast(getTranslation(state.lang, "auth.forgot.email_required") || "Veuillez saisir votre adresse email pour réinitialiser votre mot de passe.");
        return;
      }
      
      if (supabase) {
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '#settings'
        }).then(({ error }) => {
          if (error) {
            const errPrefix = state.lang === "en" ? "Error: " : "Erreur : ";
            showToast(`${errPrefix}${error.message}`);
          } else {
            showToast(getTranslation(state.lang, "auth.forgot.email_sent") || "Un e-mail de réinitialisation de mot de passe vous a été envoyé ✦");
          }
        });
      } else {
        showToast(getTranslation(state.lang, "auth.forgot.email_sent") || "Simulation : E-mail de réinitialisation envoyé ! (Mode hors-ligne)");
      }
    });
  }

  // Accès direct Espace Client (Landing CTA & Header User Profile)
  const btnClientAccess = document.getElementById("btn-client-access");
  if (btnClientAccess) {
    btnClientAccess.addEventListener("click", () => {
      setAuthMode("signin");
      window.location.hash = "#register";
    });
  }

  const headerProfileLink = document.getElementById("header-profile-link");
  if (headerProfileLink) {
    headerProfileLink.addEventListener("click", (e) => {
      if (!state.isLoggedIn) {
        setAuthMode("signin");
      }
    });
  }

  formRegister.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const consent = document.getElementById("reg-consent");

    if (authMode === "signup") {
      if (!consent || !consent.checked) {
        showToast("Veuillez consentir au traitement de vos données pour continuer.");
        return;
      }

      if (email && password) {
        const btn = btnRegisterSubmit || formRegister.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `✦ Création du thème...`;

        if (supabase) {
          // 1. S'inscrire sur Supabase Auth
          supabase.auth.signUp({
            email: email,
            password: password
          }).then(({ data, error }) => {
            if (error) {
              showToast(`Erreur d'inscription: ${error.message}`);
              btn.disabled = false;
              btn.innerHTML = originalText;
              return;
            }

            const user = data.user;
            if (!user) {
              showToast("Une erreur de communication est survenue.");
              btn.disabled = false;
              btn.innerHTML = originalText;
              return;
            }

            state.isLoggedIn = true;
            state.answers.email = email;
            saveState();

            // 2. Calculer le profil énergétique astrologique
            const report = generatePersonalizedReport(state.answers, state.lang);
            state.report = report;

            // Déterminer les éléments scores pour la BDD
            const element = report.zodiac.element;
            let score_fire = 25, score_earth = 25, score_air = 25, score_water = 25;
            if (element === "Feu") score_fire = 60;
            else if (element === "Terre") score_earth = 60;
            else if (element === "Air") score_air = 60;
            else if (element === "Eau") score_water = 60;

            // 3. Insérer les coordonnées natales en base de données
            supabase.from("astrology_profiles").insert({
              id: user.id,
              email: email,
              firstname: state.answers.name || "Ami(e)",
              birthdate: state.answers.birthDate || null,
              birthtime: state.answers.birthTime || "",
              birthplace: state.answers.birthPlace || "",
              latitude: state.answers.latitude || null,
              longitude: state.answers.longitude || null,
              sun_sign: report.zodiac.name,
              moon_sign: report.moon ? report.moon.name : "",
              ascendant: report.ascendant,
              score_fire: score_fire,
              score_earth: score_earth,
              score_air: score_air,
              score_water: score_water,
              auracolor: report.energyProfile,
              payment_status: "free",
              selected_offer: "monthly"
            }).then(({ error: dbError }) => {
              btn.disabled = false;
              btn.innerHTML = originalText;

              if (dbError) {
                console.error("Erreur de sauvegarde de profil:", dbError);
                showToast("Profil créé, mais erreur de synchronisation base de données.");
              }

              // Redirection et chargement visuel
              window.location.hash = "#loading-scene";
              runLoadingSequence();
            });
          });
        } else {
          // Fallback local en l'absence de Supabase SDK
          state.isLoggedIn = true;
          state.answers.email = email;
          saveState();
          window.location.hash = "#loading-scene";
          runLoadingSequence();
        }
      }
    } else {
      // Sign In Flow
      if (email && password) {
        const btn = btnRegisterSubmit || formRegister.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `✦ Connexion...`;

        if (supabase) {
          supabase.auth.signInWithPassword({
            email: email,
            password: password
          }).then(({ data, error }) => {
            btn.disabled = false;
            btn.innerHTML = originalText;

            if (error) {
              showToast(`Erreur de connexion: ${error.message}`);
              return;
            }

            const user = data.user;
            if (!user) {
              showToast("Une erreur de communication est survenue.");
              return;
            }

            state.isLoggedIn = true;
            state.answers.email = email;
            saveState();

            // Fetch profile data from db to update local state
            supabase.from("astrology_profiles").select("*").eq("id", user.id).maybeSingle().then(({ data: profileData, error: dbError }) => {
              if (profileData) {
                state.answers.name = profileData.firstname || state.answers.name || "";
                state.answers.birthDate = profileData.birthdate || state.answers.birthDate || "";
                state.answers.birthTime = profileData.birthtime || state.answers.birthTime || "";
                state.answers.birthPlace = profileData.birthplace || state.answers.birthPlace || "";
                state.answers.latitude = typeof profileData.latitude === "number" ? profileData.latitude : state.answers.latitude;
                state.answers.longitude = typeof profileData.longitude === "number" ? profileData.longitude : state.answers.longitude;
                state.isPremium = (profileData.payment_status === "premium" || profileData.payment_status === "active");
                
                if (state.answers.birthDate) {
                  state.report = generatePersonalizedReport(state.answers, state.lang);
                }
                generateMockHistory();
                saveState();
              }
              window.location.hash = "#dashboard";
              showToast("Bienvenue sur votre espace Moon Astro ! ✦");
            });
          });
        } else {
          // Local fallback
          state.isLoggedIn = true;
          state.answers.email = email;
          state.answers.name = state.answers.name || "Ami(e) Stellaire";
          state.answers.birthDate = state.answers.birthDate || "1992-11-12";
          state.answers.birthTime = state.answers.birthTime || "12:00";
          state.answers.birthPlace = state.answers.birthPlace || "Paris, France";
          state.answers.latitude = state.answers.latitude || 48.8566;
          state.answers.longitude = state.answers.longitude || 2.3522;
          state.report = generatePersonalizedReport(state.answers, state.lang);
          generateMockHistory();
          saveState();
          window.location.hash = "#dashboard";
          showToast("Bienvenue (Mode local) ! ✦");
        }
      }
    }
  });

  // --- RUN LOADING SEQUENCE ---
  const loadingStatusTitle = document.getElementById("loading-title");
  const loadingStatusText = document.getElementById("loading-text");
  
  const loadingSteps = [
    { titleKey: "loading.step0.title", descKey: "loading.step0.desc" },
    { titleKey: "loading.step1.title", descKey: "loading.step1.desc" },
    { titleKey: "loading.step2.title", descKey: "loading.step2.desc" },
    { titleKey: "loading.step3.title", descKey: "loading.step3.desc" },
    { titleKey: "loading.step4.title", descKey: "loading.step4.desc" }
  ];

  function runLoadingSequence() {
    let index = 0;
    
    // Set initial text
    if (loadingStatusTitle && loadingStatusText) {
      loadingStatusTitle.textContent = getTranslation(state.lang, loadingSteps[0].titleKey);
      loadingStatusText.textContent = getTranslation(state.lang, loadingSteps[0].descKey);
    }
    
    // Interval to change titles & text beautifully
    const interval = setInterval(() => {
      index++;
      if (index < loadingSteps.length) {
        loadingStatusTitle.style.opacity = 0;
        loadingStatusText.style.opacity = 0;
        
        setTimeout(() => {
          loadingStatusTitle.textContent = getTranslation(state.lang, loadingSteps[index].titleKey);
          loadingStatusText.textContent = getTranslation(state.lang, loadingSteps[index].descKey);
          loadingStatusTitle.style.opacity = 1;
          loadingStatusText.style.opacity = 1;
        }, 300);
      } else {
        clearInterval(interval);
        
        // Generate personalized calculations!
        state.report = generatePersonalizedReport(state.answers, state.lang);
        
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
    const dateLocale = state.lang === "en" ? "en-US" : "fr-FR";
    const rulerName = state.lang === "en" ? (zodiac.ruler_en || zodiac.ruler) : zodiac.ruler;
    
    // 3 past days
    for (let i = 1; i <= 3; i++) {
      const pastDate = new Date(dateToday);
      pastDate.setDate(dateToday.getDate() - i);
      
      const dayName = pastDate.toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" });
      
      let ratingSymbol = state.lang === "en" ? "✦ Harmonious" : "✦ Harmonieux";
      let summaryText = state.lang === "en"
        ? `Your energies for ${dayName} favored spiritual introspection. Your ruling planet ${rulerName} invited you to clarify your professional priorities.`
        : `Vos énergies du ${dayName} ont favorisé l'introspection spirituelle. Votre planète régente ${rulerName} vous a invité(e) à assainir vos priorités professionnelles.`;
      
      if (i === 1) {
        ratingSymbol = state.lang === "en" ? "✦ Magnetic" : "✦ Magnétique";
        summaryText = state.lang === "en"
          ? `Love guidance: the transits invited you to express your secret feelings peacefully. An unexpected opportunity materialized.`
          : `Guidance d'amour : les transits vous invitaient à exprimer sereinement vos sentiments secrets. Une opportunité inattendue s'est matérialisée.`;
      } else if (i === 2) {
        ratingSymbol = state.lang === "en" ? "✦ Alchemical" : "✦ Alchimique";
        summaryText = state.lang === "en"
          ? `Warning: actively protect your energetic bubble against mental overload and shared emotions.`
          : `Point de vigilance : protégez activement votre bulle énergétique contre la surcharge mentale et les émotions partagées.`;
      }
      
      state.history.push({
        date: pastDate.toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" }),
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
  const resMoon = document.getElementById("res-moon");
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
    
    const sunName = state.lang === "en" ? (r.zodiac.name_en || r.zodiac.name) : r.zodiac.name;
    resSun.textContent = `${sunName} ${r.zodiac.symbol}`;
    if (resMoon && r.moon) {
      const moonName = state.lang === "en" ? (r.moon.name_en || r.moon.name) : r.moon.name;
      resMoon.textContent = `${moonName} ${r.moon.symbol}`;
    }
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
 
    // Remplir la gemmologie (Pierre de Chance)
    if (r.luckyGemstone) {
      const gemIcon = document.getElementById("res-gem-icon");
      const gemName = document.getElementById("res-gem-name");
      const gemDesc = document.getElementById("res-gem-desc");
      if (gemIcon) gemIcon.textContent = r.luckyGemstone.symbol;
      if (gemName) {
        gemName.textContent = state.lang === "en" ? r.luckyGemstone.name : `${r.luckyGemstone.name} Sacrée`;
      }
      if (gemDesc) gemDesc.textContent = r.luckyGemstone.desc;
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

  function getStripeSubmitBtnText() {
    const lang = state.lang || "fr";
    if (state.selectedPlan === "weekly") {
      return getTranslation(lang, "stripe.btn.weekly") || "S'abonner (2,99 € / semaine)";
    } else if (state.selectedPlan === "monthly") {
      return getTranslation(lang, "stripe.btn.monthly") || "Activer mon essai & payer (9,99 € / mois)";
    } else {
      return getTranslation(lang, "stripe.btn.yearly") || "S'abonner annuellement (49,99 € / an)";
    }
  }

  function updateSubscribeButtonText() {
    const lang = state.lang || "fr";
    if (state.selectedPlan === "weekly") {
      btnSubscribe.textContent = getTranslation(lang, "paywall.btn.weekly") || "Commencer mon abonnement hebdomadaire";
    } else if (state.selectedPlan === "monthly") {
      btnSubscribe.textContent = getTranslation(lang, "paywall.btn.monthly") || "Commencer mon essai gratuit";
    } else {
      btnSubscribe.textContent = getTranslation(lang, "paywall.btn.yearly") || "S'abonner annuellement (Réduction 60%)";
    }
  }

  // Selection of Subscription
  subOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      subOptions.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      state.selectedPlan = opt.getAttribute("data-plan");
      
      updateSubscribeButtonText();
    });
  });

  // Open Checkout Modal
  btnSubscribe.addEventListener("click", () => {
    const lang = state.lang || "fr";
    // Fill Stripe pricing summary based on active plan selection
    if (state.selectedPlan === "weekly") {
      stripePlanTitle.textContent = getTranslation(lang, "stripe.plan.weekly") || "Abonnement Hebdomadaire Moon Astro";
      stripePlanPrice.textContent = "2,99 €";
      btnStripeSubmit.textContent = getTranslation(lang, "stripe.btn.weekly") || "S'abonner (2,99 € / semaine)";
    } else if (state.selectedPlan === "monthly") {
      stripePlanTitle.textContent = getTranslation(lang, "stripe.plan.monthly") || "Abonnement Mensuel (3 jours d'essai)";
      stripePlanPrice.textContent = "9,99 €";
      btnStripeSubmit.textContent = getTranslation(lang, "stripe.btn.monthly") || "Activer mon essai & payer (9,99 € / mois)";
    } else {
      stripePlanTitle.textContent = getTranslation(lang, "stripe.plan.yearly") || "Abonnement Annuel Moon Astro";
      stripePlanPrice.textContent = "49,99 €";
      btnStripeSubmit.textContent = getTranslation(lang, "stripe.btn.yearly") || "S'abonner annuellement (49,99 € / an)";
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

  // Stripe simulated and live checkout logic
  formStripe.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Change button state to elegant loading spinner
    btnStripeSubmit.disabled = true;
    btnStripeSubmit.style.opacity = 0.8;
    const processingText = getTranslation(state.lang, "stripe.processing") || "Traitement sécurisé...";
    btnStripeSubmit.innerHTML = `<span style="display:inline-block; animation: rotate-cw 1s linear infinite; margin-right: 8px;">✦</span> ${processingText}`;
    
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const user = session?.user;
        if (!user) {
          showToast(getTranslation(state.lang, "stripe.error.auth") || "Vous devez être connecté pour vous abonner.");
          btnStripeSubmit.disabled = false;
          btnStripeSubmit.style.opacity = 1;
          btnStripeSubmit.textContent = getStripeSubmitBtnText();
          return;
        }

        // Call the Supabase Edge Function 'stripe-checkout'
        const functionUrl = `${SUPABASE_URL}/functions/v1/stripe-checkout`;
        
        fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            plan: state.selectedPlan
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            // Redirect user directly to the real Stripe Checkout page
            window.location.href = data.url;
          } else {
            throw new Error(data.error || "Erreur de création de session de paiement");
          }
        })
        .catch(err => {
          console.warn("Erreur de connexion Stripe Live, activation du mode Démo :", err);
          
          // Fallback on error or local testing: simulate payment success in dev
          setTimeout(() => {
            state.isPremium = true;
            saveState();
            stripeModal.classList.remove("active");
            btnStripeSubmit.disabled = false;
            btnStripeSubmit.style.opacity = 1;
            btnStripeSubmit.textContent = getStripeSubmitBtnText();
            showToast(getTranslation(state.lang, "stripe.success.demo") || "Mode Démo : Abonnement activé ! Bienvenue sur Moon Astro Premium.");
            window.location.hash = "#dashboard";
          }, 2000);
        });
      });
    } else {
      // Fallback local simulation
      setTimeout(() => {
        state.isPremium = true;
        saveState();
        stripeModal.classList.remove("active");
        btnStripeSubmit.disabled = false;
        btnStripeSubmit.style.opacity = 1;
        btnStripeSubmit.textContent = getStripeSubmitBtnText();
        showToast(getTranslation(state.lang, "stripe.success.sim") || "Abonnement activé ! Bienvenue sur Moon Astro Premium (Simulation).");
        window.location.hash = "#dashboard";
      }, 2200);
    }
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
  const dashSunSign = document.getElementById("dash-sun-sign");
  const dashMoonSign = document.getElementById("dash-moon-sign");
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
    dashDate.textContent = new Date().toLocaleDateString(state.lang === "en" ? "en-US" : "fr-FR", options);
    
    const sunName = state.lang === "en" ? (r.zodiac.name_en || r.zodiac.name) : r.zodiac.name;
    dashZodiacName.textContent = sunName;
    
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
      if (dashSunSign) {
        const sunName = state.lang === "en" ? (r.zodiac.name_en || r.zodiac.name) : r.zodiac.name;
        dashSunSign.textContent = `${sunName} ${r.zodiac.symbol}`;
      }
      if (dashMoonSign && r.moon) {
        const moonName = state.lang === "en" ? (r.moon.name_en || r.moon.name) : r.moon.name;
        dashMoonSign.textContent = `${moonName} ${r.moon.symbol}`;
      }
      dashAscendant.textContent = `${r.ascendant} ${getZodiacSymbolByName(r.ascendant)}`;
      
      // Weekly and Monthly Forecasts
      const forecasts = generateForecasts(r, state.lang);
      dashWeeklyText.innerHTML = `<p>${forecasts.weekly}</p>`;
      dashMonthlyText.innerHTML = `<p>${forecasts.monthly}</p>`;
 
    } else {
      // Free User is limited
      const getLockedHTML = (textKey) => `
        <span style="filter: blur(4px); opacity: 0.35; user-select: none;">
          ${getTranslation(state.lang, textKey)}
        </span>
        <div style="margin-top: 8px; font-size: 12px;">
          <a href="#paywall" style="color: var(--accent-gold-dark); font-weight: 600; text-decoration: none;">${getTranslation(state.lang, "dash.locked.btn")}</a>
        </div>
      `;
      dashDailyLove.innerHTML = getLockedHTML("dash.locked.love");
      dashDailyCareer.innerHTML = getLockedHTML("dash.locked.career");
      dashDailyWellbeing.innerHTML = getLockedHTML("dash.locked.wellbeing");
      
      dashDailyWarning.innerHTML = `
        <span style="filter: blur(4px); opacity: 0.35; user-select: none;">
          ${getTranslation(state.lang, "dash.locked.warning")}
        </span>
        <div style="margin-top: 4px; font-size: 11px;">
          <a href="#paywall" style="color: #BA554A; font-weight: 600; text-decoration: none;">${getTranslation(state.lang, "dash.locked.warning.btn")}</a>
        </div>
      `;
      
      const defaultAffirmation = state.lang === "en" 
        ? "I gently open myself to the guidance offered by the cosmos." 
        : "Je m'ouvre doucement aux guidances que m'offre le cosmos.";
      dashDailyAffirmation.textContent = `"${getTranslation(state.lang, "dash.locked.affirmation.default") || defaultAffirmation}"`;
      
      renderStars(starsLove, 0);
      renderStars(starsCareer, 0);
      renderStars(starsWellbeing, 0);
 
      dashLuckyNumber.textContent = "✦";
      dashLuckyMonth.textContent = "✦";
      if (dashSunSign) {
        const sunName = state.lang === "en" ? (r.zodiac.name_en || r.zodiac.name) : r.zodiac.name;
        dashSunSign.textContent = sunName;
      }
      if (dashMoonSign && r.moon) {
        const moonName = state.lang === "en" ? (r.moon.name_en || r.moon.name) : r.moon.name;
        dashMoonSign.textContent = moonName;
      }
      dashAscendant.textContent = `${r.ascendant}`;
 
      // Locked Weekly & Monthly tabs text
      const lockedTabHTML = `
        <div style="text-align: center; padding: 20px 0;">
          <svg viewBox="0 0 24 24" style="width: 44px; height: 44px; fill: var(--accent-gold); margin-bottom: 12px;">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
          <h3 class="serif-font" style="font-size: 18px; margin-bottom: 4px;">${getTranslation(state.lang, "dash.locked.forecast.title")}</h3>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 80%; margin: 0 auto 16px;">
            ${getTranslation(state.lang, "dash.locked.forecast.desc")}
          </p>
          <a href="#paywall" class="btn btn-gold" style="display:inline-flex; width:auto; padding: 10px 24px; font-size:13px; border-radius:12px;">${getTranslation(state.lang, "dash.locked.forecast.btn")}</a>
        </div>
      `;
      dashWeeklyText.innerHTML = lockedTabHTML;
      dashMonthlyText.innerHTML = lockedTabHTML;
    }
 
    // Remplir la gemmologie sur le Dashboard
    if (r.luckyGemstone) {
      const gemIcon = document.getElementById("dash-gem-icon");
      const gemName = document.getElementById("dash-gem-name");
      const gemDesc = document.getElementById("dash-gem-desc");
      if (gemIcon) gemIcon.textContent = r.luckyGemstone.symbol;
      if (gemName) {
        gemName.textContent = state.lang === "en" ? r.luckyGemstone.name : `${r.luckyGemstone.name} Sacrée`;
      }
      if (gemDesc) {
        if (isPrem) {
          gemDesc.textContent = r.luckyGemstone.desc;
        } else {
          gemDesc.innerHTML = `
            <span style="filter: blur(4px); opacity: 0.35; user-select: none;">
              ${getTranslation(state.lang, "dash.locked.gem.desc")}
            </span>
            <div style="margin-top: 4px; font-size: 11px;">
              <a href="#paywall" style="color: var(--accent-gold-dark); font-weight: 600; text-decoration: none;">${getTranslation(state.lang, "dash.locked.gem.btn")}</a>
            </div>
          `;
        }
      }
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
    if (!name) return "✦";
    const found = ZODIAC_SIGNS.find(z => 
      z.name.toLowerCase() === name.toLowerCase() || 
      (z.name_en && z.name_en.toLowerCase() === name.toLowerCase())
    );
    return found ? found.symbol : "✦";
  }

  // Dual geocoding helper (Photon with Nominatim fallback)
  function searchCitySuggestions(query, callback) {
    const queryLang = state.lang || "fr";
    fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=${queryLang}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.features && data.features.length > 0) {
          const suggestions = data.features.map(feat => {
            const props = feat.properties;
            let label = props.name || "";
            if (props.postcode) label += ` (${props.postcode})`;
            if (props.state && props.state !== props.name) label += `, ${props.state}`;
            if (props.country) label += `, ${props.country}`;
            return {
              display_name: label,
              lat: feat.geometry.coordinates[1],
              lon: feat.geometry.coordinates[0]
            };
          });
          callback(suggestions);
        } else {
          queryNominatim(query, callback);
        }
      })
      .catch(err => {
        console.warn("Photon geocoding failed, trying Nominatim fallback...", err);
        queryNominatim(query, callback);
      });
  }

  function queryNominatim(query, callback) {
    const queryLang = state.lang || "fr";
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=${queryLang}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const suggestions = data.map(item => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon)
          }));
          callback(suggestions);
        } else {
          callback([]);
        }
      })
      .catch(err => {
        console.error("Nominatim geocoding failed:", err);
        callback([]);
      });
  }

  // --- PERSONAL HISTORY PAGE ---
  const historyList = document.getElementById("history-list");
  
  function populateHistory() {
    if (!state.history || state.history.length === 0) {
      historyList.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          ${getTranslation(state.lang, "history.empty")}
        </div>
      `;
      return;
    }
 
    let html = "";
    
    // Add today as premium lock or text in timeline
    const zodiac = getZodiacInfo(state.answers.birthDate);
    const dateLocale = state.lang === "en" ? "en-US" : "fr-FR";
    const todayName = new Date().toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" });
    const todayShort = new Date().toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" });
    
    const todayLabel = state.lang === "en" ? "Today" : "Aujourd'hui";
    const activeEnergyLabel = state.lang === "en" ? "✦ Active daily energy" : "✦ Énergie du jour active";
    const checkGuidanceLabel = state.lang === "en" ? "View my guidance &rarr;" : "Consulter ma guidance &rarr;";
    const fallbackDesc = state.lang === "en" ? "Check your active guidance dashboard." : "Consultez votre dashboard de guidance active.";

    html += `
      <div class="history-item">
        <div class="history-card" style="border-left: 3px solid var(--accent-gold);">
          <div class="history-date">${todayLabel} — ${todayShort}</div>
          <strong style="font-size:12px; color: var(--primary-midnight); display:block; margin-bottom:4px;">${activeEnergyLabel}</strong>
          <p class="history-summary">
            ${state.report ? state.report.dailyHoroscope.general.substring(0, 100) + "..." : fallbackDesc}
          </p>
          <a href="#dashboard" style="display:inline-block; font-size:12px; color: var(--accent-gold-dark); text-decoration:none; margin-top:8px; font-weight:600;">${checkGuidanceLabel}</a>
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

  let settingsMap = null;
  let settingsMarker = null;

  function initSettingsMap(lat, lon) {
    const mapContainer = document.getElementById("settings-birthplace-map");
    const coordsContainer = document.getElementById("settings-birthplace-coordinates");
    if (!mapContainer) return;
    mapContainer.style.display = "block";
    if (coordsContainer) {
      coordsContainer.style.display = "block";
      coordsContainer.innerHTML = `📍 Coordonnées exactes : ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`;
    }
    try {
      if (settingsMap) {
        try {
          settingsMap.remove();
        } catch (err) {
          console.warn("Error removing old settings map:", err);
        }
        settingsMap = null;
      }
      if (window.L) {
        settingsMap = window.L.map('settings-birthplace-map', {
          center: [lat, lon],
          zoom: 11,
          zoomControl: false,
          attributionControl: false
        });
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(settingsMap);
        settingsMarker = window.L.marker([lat, lon]).addTo(settingsMap);
        setTimeout(() => settingsMap.invalidateSize(), 200);
      }
    } catch (e) {
      console.error("Settings Map rendering error:", e);
    }
  }

  const settingsSuggestions = document.getElementById("settings-birthplace-suggestions");
  let settingsDebounce;
  if (setBirthplaceInput) {
    setBirthplaceInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      clearTimeout(settingsDebounce);
      if (query.length < 3) {
        if (settingsSuggestions) settingsSuggestions.style.display = "none";
        return;
      }
      settingsDebounce = setTimeout(() => {
        searchCitySuggestions(query, (suggestions) => {
          if (!settingsSuggestions) return;
          settingsSuggestions.innerHTML = "";
          if (suggestions && suggestions.length > 0) {
            settingsSuggestions.style.display = "block";
            suggestions.forEach(item => {
              const div = document.createElement("div");
              div.className = "autocomplete-suggestion-item";
              div.textContent = item.display_name;
              div.addEventListener("click", () => {
                setBirthplaceInput.value = item.display_name;
                state.answers.birthPlace = item.display_name;
                state.answers.latitude = item.lat;
                state.answers.longitude = item.lon;
                saveState();
                settingsSuggestions.style.display = "none";
                initSettingsMap(item.lat, item.lon);
              });
              settingsSuggestions.appendChild(div);
            });
          } else {
            settingsSuggestions.style.display = "none";
          }
        });
      }, 400);
    });
  }

  document.addEventListener("click", (evt) => {
    if (evt.target !== setBirthplaceInput && evt.target !== settingsSuggestions) {
      if (settingsSuggestions) settingsSuggestions.style.display = "none";
    }
  });

  function populateSettings() {
    if (!state.answers) return;
    
    // Natal Info filling
    setUsernameInput.value = state.answers.name || "";
    setBirthdateInput.value = state.answers.birthDate || "";
    setBirthtimeInput.value = state.answers.birthTime || "";
    setBirthplaceInput.value = state.answers.birthPlace || "";
 
    // Update settings map coordinates
    if (state.answers.latitude && state.answers.longitude && window.L) {
      setTimeout(() => initSettingsMap(state.answers.latitude, state.answers.longitude), 100);
    } else {
      const mapContainer = document.getElementById("settings-birthplace-map");
      const coordsContainer = document.getElementById("settings-birthplace-coordinates");
      if (mapContainer) mapContainer.style.display = "none";
      if (coordsContainer) coordsContainer.style.display = "none";
    }
 
    // Status rendering
    if (state.isPremium) {
      setStatusText.textContent = getTranslation(state.lang, "settings.status.premium.full") || "Abonnement Premium Actif 👑";
      setStatusText.style.color = "var(--accent-gold-dark)";
      btnToggleDemoPremium.innerHTML = `
        <button id="demo-premium-trigger" class="btn btn-secondary" style="padding: 10px 14px; font-size: 11px; border-radius: 8px; flex: 1;">
          ${getTranslation(state.lang, "settings.demo.free") || "Simuler mode Gratuit"}
        </button>
      `;
    } else {
      setStatusText.textContent = getTranslation(state.lang, "settings.status.free.full") || "Version Gratuite Limitée ✦";
      setStatusText.style.color = "var(--text-muted)";
      btnToggleDemoPremium.innerHTML = `
        <button id="demo-premium-trigger" class="btn btn-gold" style="padding: 10px 14px; font-size: 11px; border-radius: 8px; flex: 1;">
          ${getTranslation(state.lang, "settings.demo.premium") || "Simuler/Activer Premium"}
        </button>
      `;
    }
 
    // Attach simulation trigger listener
    const demoTrigger = document.getElementById("demo-premium-trigger");
    if (demoTrigger) {
      demoTrigger.addEventListener("click", () => {
        state.isPremium = !state.isPremium;
        saveState();
        const toastMsg = state.isPremium 
          ? (getTranslation(state.lang, "settings.demo.toast.premium") || "Premium activé (Simulation) !")
          : (getTranslation(state.lang, "settings.demo.toast.free") || "Premium désactivé (Simulation) !");
        showToast(toastMsg);
        
        // Refresh routing / state
        populateSettings();
        router();
      });
    }
  }

  // Geocoding helper on submit
  async function geocodeCityName(query) {
    const queryLang = state.lang || "fr";
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1&lang=${queryLang}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          const feat = data.features[0];
          return {
            lat: feat.geometry.coordinates[1],
            lon: feat.geometry.coordinates[0]
          };
        }
      }
    } catch (e) {
      console.warn("Komoot Photon geocoding on submit failed, trying Nominatim fallback...", e);
    }
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=${queryLang}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          };
        }
      }
    } catch (e) {
      console.error("Nominatim fallback geocoding on submit failed:", e);
    }
    return null;
  }

  // Update Settings Profile Form
  formSettings.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const newPlace = setBirthplaceInput.value.trim();
    const oldPlace = state.answers.birthPlace || "";
    
    state.answers.name = setUsernameInput.value.trim();
    state.answers.birthDate = setBirthdateInput.value;
    state.answers.birthTime = setBirthtimeInput.value;
    
    const submitBtn = formSettings.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;

    try {
      // If the birthplace text was changed, geocode it on the fly to get coordinates
      if (newPlace !== oldPlace) {
        state.answers.birthPlace = newPlace;
        const coords = await geocodeCityName(newPlace);
        if (coords) {
          state.answers.latitude = coords.lat;
          state.answers.longitude = coords.lon;
          console.log("Geocoded on submit:", coords);
        } else {
          console.warn("Geocoding failed for:", newPlace);
        }
      } else {
        state.answers.birthPlace = newPlace;
      }

      // Recalculate Astro theme!
      const report = generatePersonalizedReport(state.answers, state.lang);
      state.report = report;
      saveState();
      
      // Update settings coordinates map rendering
      if (state.answers.latitude && state.answers.longitude && window.L) {
        setTimeout(() => initSettingsMap(state.answers.latitude, state.answers.longitude), 100);
      }
      
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const element = report.zodiac.element;
          let score_fire = 25, score_earth = 25, score_air = 25, score_water = 25;
          if (element === "Feu") score_fire = 60;
          else if (element === "Terre") score_earth = 60;
          else if (element === "Air") score_air = 60;
          else if (element === "Eau") score_water = 60;

          const { error } = await supabase.from("astrology_profiles").update({
            firstname: state.answers.name,
            birthdate: state.answers.birthDate,
            birthtime: state.answers.birthTime,
            birthplace: state.answers.birthPlace || "",
            latitude: state.answers.latitude || null,
            longitude: state.answers.longitude || null,
            sun_sign: report.zodiac.name,
            moon_sign: report.moon ? report.moon.name : "",
            ascendant: report.ascendant,
            score_fire: score_fire,
            score_earth: score_earth,
            score_air: score_air,
            score_water: score_water,
            auracolor: report.energyProfile
          }).eq("id", user.id);

          if (error) {
            console.error("Erreur de synchronisation BDD:", error);
            showToast("Modifié localement, mais erreur de synchronisation en ligne.");
          } else {
            showToast("Votre thème astral natal a été mis à jour et synchronisé ✦");
          }
          populateSettings();
          router();
        } else {
          showToast("Votre thème astral natal a été recalculé avec succès ✦");
          populateSettings();
          router();
        }
      } else {
        showToast("Votre thème astral natal a été recalculé avec succès ✦");
        populateSettings();
        router();
      }
    } catch (err) {
      console.error(err);
      showToast("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  // Update Settings Password Form
  const formSettingsPassword = document.getElementById("form-settings-password");
  const btnUpdatePassword = document.getElementById("btn-update-password");
  if (formSettingsPassword) {
    formSettingsPassword.addEventListener("submit", (e) => {
      e.preventDefault();
      const newPassword = document.getElementById("set-password").value;
      if (newPassword.length < 6) {
        showToast("Le mot de passe doit faire au moins 6 caractères.");
        return;
      }
      
      if (btnUpdatePassword) {
        btnUpdatePassword.disabled = true;
        btnUpdatePassword.innerHTML = "✦ Mise à jour...";
      }

      if (supabase) {
        supabase.auth.updateUser({ password: newPassword }).then(({ error }) => {
          if (btnUpdatePassword) {
            btnUpdatePassword.disabled = false;
            btnUpdatePassword.innerHTML = "Changer mon mot de passe";
          }
          if (error) {
            showToast(`Erreur: ${error.message}`);
          } else {
            showToast("Votre mot de passe a été mis à jour avec succès ✦");
            document.getElementById("set-password").value = "";
          }
        });
      } else {
        setTimeout(() => {
          if (btnUpdatePassword) {
            btnUpdatePassword.disabled = false;
            btnUpdatePassword.innerHTML = "Changer mon mot de passe";
          }
          showToast("Simulation : Mot de passe mis à jour ! (Mode hors-ligne)");
          document.getElementById("set-password").value = "";
        }, 800);
      }
    });
  }

  // Logout
  btnLogout.addEventListener("click", () => {
    if (supabase) {
      supabase.auth.signOut().then(() => {
        state.isLoggedIn = false;
        state.isPremium = false;
        state.answers = {};
        state.report = null;
        state.history = [];
        saveState();
        showToast("Déconnexion réussie. À bientôt sous les étoiles.");
        window.location.hash = "#landing";
      });
    } else {
      state.isLoggedIn = false;
      saveState();
      showToast("Déconnexion réussie. À bientôt sous les étoiles.");
      window.location.hash = "#landing";
    }
  });

  // Reset/Delete
  btnResetData.addEventListener("click", () => {
    if (confirm("Voulez-vous vraiment supprimer définitivement votre profil et toutes vos lectures ?")) {
      const performLocalReset = () => {
        localStorage.removeItem("moon_astro_state");
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
      };

      if (supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.from("astrology_profiles").delete().eq("id", user.id).then(({ error }) => {
              if (error) console.error("Erreur lors de la suppression de la BDD:", error);
              supabase.auth.signOut().then(() => {
                performLocalReset();
              });
            });
          } else {
            performLocalReset();
          }
        });
      } else {
        performLocalReset();
      }
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

  // --- TRANSLATION & I18N ENGINE ---
  function getTranslation(lang, key) {
    const dict = window.TRANSLATIONS || (typeof TRANSLATIONS !== "undefined" ? TRANSLATIONS : null);
    if (dict && dict[lang] && dict[lang][key]) {
      return dict[lang][key];
    }
    // Fallback to fr
    if (dict && dict["fr"] && dict["fr"][key]) {
      return dict["fr"][key];
    }
    return "";
  }

  function translatePage(lang) {
    state.lang = lang;
    localStorage.setItem("moon_astro_lang", lang);
    oracleChatInitialized = false; // Reset chat initialization to force translation of welcome message
    
    // Update active class on buttons
    document.querySelectorAll(".lang-switcher .lang-btn").forEach(btn => {
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Translate DOM elements with data-i18n
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
      const key = el.getAttribute("data-i18n");
      const translation = getTranslation(lang, key);
      if (translation) {
        if (el.tagName === "INPUT" && (el.type === "text" || el.type === "email" || el.type === "password")) {
          el.placeholder = translation;
        } else if (el.tagName === "INPUT" && el.type === "submit") {
          el.value = translation;
        } else {
          el.innerHTML = translation;
        }
      }
    });

    // Regenerate report if birthDate exists
    if (state.answers && state.answers.birthDate) {
      state.report = generatePersonalizedReport(state.answers, lang);
      generateMockHistory();
    }

    // Update authentication toggle text
    updateAuthToggleUI();

    // Update subscription CTA text for currently selected plan
    updateSubscribeButtonText();

    // Re-run router to populate updated page contents
    router();
  }

  // --- AUTH DYNAMIC TOGGLING WITH I18N ---
  function setAuthMode(mode) {
    authMode = mode;
    if (authMode === "signin") {
      if (registerTitle) registerTitle.textContent = getTranslation(state.lang, "auth.title.signin");
      if (registerSub) registerSub.textContent = getTranslation(state.lang, "auth.sub.signin");
      if (consentGroup) consentGroup.style.display = "none";
      if (regConsentInput) regConsentInput.required = false;
      if (btnRegisterSubmit) btnRegisterSubmit.textContent = getTranslation(state.lang, "auth.btn.signin");
      if (forgotPasswordLink) {
        forgotPasswordLink.style.display = "block";
        forgotPasswordLink.textContent = getTranslation(state.lang, "auth.forgot");
      }
    } else {
      if (registerTitle) registerTitle.textContent = getTranslation(state.lang, "auth.title.signup");
      if (registerSub) registerSub.textContent = getTranslation(state.lang, "auth.sub.signup");
      if (consentGroup) consentGroup.style.display = "flex";
      if (regConsentInput) regConsentInput.required = true;
      if (btnRegisterSubmit) btnRegisterSubmit.textContent = getTranslation(state.lang, "auth.btn.signup");
      if (forgotPasswordLink) forgotPasswordLink.style.display = "none";
    }
    updateAuthToggleUI();
  }

  function updateAuthToggleUI() {
    const container = document.getElementById("auth-toggle-container");
    if (!container) return;
    if (authMode === "signup") {
      const text = state.lang === "en" ? "Already have an account? " : "Déjà un compte ? ";
      const linkText = state.lang === "en" ? "Sign In" : "Se connecter";
      container.innerHTML = `${text}<a href="#" id="toggle-auth-mode" style="color: var(--accent-gold-dark); font-weight: 600; text-decoration: none;">${linkText}</a>`;
    } else {
      const text = state.lang === "en" ? "Don't have an account? " : "Nouveau ici ? ";
      const linkText = state.lang === "en" ? "Sign Up" : "Créer un compte";
      container.innerHTML = `${text}<a href="#" id="toggle-auth-mode" style="color: var(--accent-gold-dark); font-weight: 600; text-decoration: none;">${linkText}</a>`;
    }
    
    // Re-attach listener
    const newToggle = document.getElementById("toggle-auth-mode");
    if (newToggle) {
      newToggle.addEventListener("click", handleAuthToggleClick);
    }
  }

  function handleAuthToggleClick(e) {
    if (e) e.preventDefault();
    setAuthMode(authMode === "signup" ? "signin" : "signup");
  }

  // --- CELESTIAL ORACLE CHATBOT LOGIC ---
  let oracleChatInitialized = false;
  let chatMessagesHistory = [];

  function initOracleChat() {
    const lang = state.lang || "fr";
    const container = document.getElementById("oracle-chat-container");
    const messagesEl = document.getElementById("oracle-chat-messages");
    const suggestionsEl = document.querySelector(".chat-suggestions-container");
    const inputForm = document.getElementById("oracle-chat-form");
    const chatInput = document.getElementById("oracle-chat-input");

    if (!container || !messagesEl) return;

    // 1. Guard check: Premium is required
    if (!state.isPremium) {
      // Show locked overlay
      suggestionsEl.style.display = "none";
      inputForm.style.display = "none";
      
      const lockTitle = getTranslation(lang, "oracle.error.premium");
      const ctaBtnText = getTranslation(lang, "dash.locked.btn");
      
      messagesEl.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; gap: 16px; padding: 20px;">
          <div style="font-size: 48px; filter: drop-shadow(0 0 10px rgba(197, 160, 89, 0.3));">🔒</div>
          <h3 class="serif-font" style="color: var(--accent-gold); font-size: 20px; max-width: 400px; margin: 0; line-height: 1.5;">${lockTitle}</h3>
          <a href="#paywall" class="btn btn-gold" style="width: auto; padding: 12px 32px; font-weight: 600; border-radius: 14px; text-decoration: none;">
            ✦ ${ctaBtnText}
          </a>
        </div>
      `;
      oracleChatInitialized = false;
      return;
    }

    // Restore controls for premium
    suggestionsEl.style.display = "block";
    inputForm.style.display = "flex";

    // 2. Initialize if not already initialized
    if (!oracleChatInitialized) {
      messagesEl.innerHTML = "";
      chatMessagesHistory = [];

      // Add dynamic translated welcome message
      const userName = state.answers.name || (lang === "en" ? "Cosmic Friend" : "Ami(e) Cosmique");
      const sunSignName = state.report && state.report.zodiac ? (lang === "en" ? (state.report.zodiac.name_en || state.report.zodiac.name) : state.report.zodiac.name) : (lang === "en" ? "Aries" : "Bélier");
      const moonSignName = state.report && state.report.moon ? (lang === "en" ? (state.report.moon.name_en || state.report.moon.name) : state.report.moon.name) : (lang === "en" ? "Cancer" : "Cancer");
      const ascSignName = state.report ? (lang === "en" ? (state.report.ascendant_en || state.report.ascendant) : state.report.ascendant) : (lang === "en" ? "Libra" : "Balance");

      let welcomeText = getTranslation(lang, "oracle.welcome");
      welcomeText = welcomeText
        .replace("{name}", userName)
        .replace("{sun}", `${sunSignName} ${state.report?.zodiac?.symbol || "♈"}`)
        .replace("{moon}", `${moonSignName} ${state.report?.moon?.symbol || "♋"}`)
        .replace("{ascendant}", `${ascSignName}`);

      addChatBubble("oracle", welcomeText);
      oracleChatInitialized = true;

      // Bind suggestions clicks
      document.querySelectorAll(".chat-suggest-btn").forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          const suggestKey = btn.getAttribute("data-suggest-key");
          const suggestText = getTranslation(state.lang, suggestKey);
          if (suggestText) {
            handleUserMessageSend(suggestText);
          }
        };
      });

      // Bind send message
      inputForm.onsubmit = (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text) {
          chatInput.value = "";
          handleUserMessageSend(text);
        }
      };
    }
  }

  function addChatBubble(sender, text) {
    const messagesEl = document.getElementById("oracle-chat-messages");
    if (!messagesEl) return;

    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    
    // Parse formatting like **bold text** to HTML
    let formattedText = text;
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formattedText = formattedText.replace(/\n/g, "<br>");
    
    bubble.innerHTML = formattedText;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    // Store in history
    chatMessagesHistory.push({ sender, text });
  }

  async function handleUserMessageSend(text) {
    addChatBubble("user", text);
    
    const typingIndicator = document.getElementById("oracle-typing-indicator");
    const messagesEl = document.getElementById("oracle-chat-messages");
    if (typingIndicator) {
      typingIndicator.style.display = "flex";
      messagesEl.appendChild(typingIndicator); // move typing indicator to the bottom
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    try {
      let reply = "";
      let session = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        session = data?.session;
      }

      if (session) {
        // Real Edge Function request
        const token = session.access_token;
        
        // Prepare astrology data to pass to edge function
        const astrologyData = {
          blocker: (state.report && state.report.blocker) ? state.report.blocker : "",
          gemstone: (state.report && state.report.luckyGemstone) ? state.report.luckyGemstone.name : "",
          gemstoneDesc: (state.report && state.report.luckyGemstone) ? state.report.luckyGemstone.desc : "",
          lifePath: (state.report && state.report.lifePath) ? String(state.report.lifePath) : ""
        };

        const response = await fetch(`${SUPABASE_URL}/functions/v1/oracle-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            message: text,
            history: chatMessagesHistory.slice(0, -1), // exclude the one we just added
            astrologyData: astrologyData
          })
        });

        if (response.ok) {
          const resData = await response.json();
          reply = resData.reply;
        } else {
          const errData = await response.json().catch(() => ({}));
          console.error("Edge function error:", errData);
          throw new Error("Function error");
        }
      } else {
        // Fallback Mock Mode (offline simulation)
        reply = await simulateOracleResponse(text);
      }

      if (typingIndicator) typingIndicator.style.display = "none";
      addChatBubble("oracle", reply);
    } catch (e) {
      if (typingIndicator) typingIndicator.style.display = "none";
      const errMsg = state.lang === "en" 
        ? "The stars are currently clouded. Please try again in a few moments."
        : "Les cieux sont temporairement voilés. Veuillez réessayer dans quelques instants.";
      addChatBubble("oracle", errMsg);
    }
  }

  // Smart Offline Oracle Response Simulator based on user's chart
  async function simulateOracleResponse(userMessage) {
    const lang    = state.lang || "fr";
    const msgLower = userMessage.toLowerCase();

    const name      = (state.answers && state.answers.name)           ? state.answers.name           : (lang === "fr" ? "Âme Céleste" : "Celestial Soul");
    const sun       = (state.report  && state.report.zodiac)          ? state.report.zodiac.name      : "Bélier";
    const moon      = (state.report  && state.report.moon)            ? state.report.moon.name        : "Cancer";
    const asc       = (state.report  && state.report.ascendant)       ? state.report.ascendant        : "Balance";
    const blocker   = (state.report  && state.report.blocker)         ? state.report.blocker          : (lang === "fr" ? "la peur du changement" : "fear of change");
    const gem       = (state.report  && state.report.luckyGemstone)   ? state.report.luckyGemstone.name : "Améthyste";
    const gemDesc   = (state.report  && state.report.luckyGemstone)   ? state.report.luckyGemstone.desc : (lang === "fr" ? "apporte clarté et protection" : "brings clarity and protection");
    const lifeNum   = (state.report  && state.report.lifePath)        ? state.report.lifePath         : "7";

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    const followUp = lang === "fr"
      ? pick([
          "\n\n*Souhaitez-vous explorer votre **vie amoureuse**, votre **chemin de vie** ou votre **gemme céleste** ?*",
          "\n\n*N'hésitez pas à m'interroger sur votre **potentiel professionnel** ou vos **blocages énergétiques**.*",
          "\n\n*Votre thème recèle encore bien des révélations… Quelle facette souhaitez-vous illuminer ?*"
        ])
      : pick([
          "\n\n*Would you like to explore your **love life**, **life path**, or **celestial gemstone**?*",
          "\n\n*Feel free to ask me about your **career potential** or **energetic blockages**.*",
          "\n\n*Your chart holds many more revelations… Which aspect shall we illuminate next?*"
        ]);

    let response = "";

    // AMOUR
    if (msgLower.includes("amour") || msgLower.includes("love") || msgLower.includes("relation") || msgLower.includes("couple") || msgLower.includes("rencontre")) {
      response = lang === "fr"
        ? pick([
            `**✨ Guidance de l'Oracle — Amour & Connexion**\n\nCher(ère) ${name}, votre Soleil en **${sun}** vous confère une capacité d'aimer profondément, parfois au risque de vous oublier. Votre Lune en **${moon}** teinte vos émotions d'une sensibilité rare.\n\nVénus transit actuellement votre Ascendant **${asc}**, ouvrant une fenêtre d'authenticité émotionnelle. C'est le moment de :\n1. Exprimer ce que vous n'osiez pas dire.\n2. Attirer en étant pleinement vous-même.\n3. Lâcher une attente qui bloque votre cœur.\n\nLe cosmos vous dit : l'amour ne vous cherche pas, il vous *reconnaît*.`,
            `**🌙 Guidance de l'Oracle — Le Cœur Étoilé**\n\n${name}, votre Soleil **${sun}** / Lune **${moon}** crée une nature ardente et protectrice. Le vrai blocage dans votre ciel : **« ${blocker} »** — cette peur crée un mur autour de votre cœur que votre Ascendant **${asc}** tente pourtant de franchir.\n\nActions immédiates :\n- 🌹 Une conversation honnête avec quelqu'un de cher cette semaine.\n- 💎 Portez votre **${gem}** près du cœur.\n- 🌑 À la Nouvelle Lune : écrivez 3 qualités que vous apportez en amour.`,
            `**💫 Guidance de l'Oracle — Vibrations Amoureuses**\n\nSous votre Soleil **${sun}**, vous aimez avec intensité mais parfois avec impatience. La Lune en **${moon}** vous demande de *ressentir avant d'agir*. Vénus forme un aspect favorable à votre Ascendant **${asc}** — vos vibrations sont attractives en ce moment.\n\nLa question des astres : *« Cherchez-vous un(e) partenaire ou votre propre complétude ? »*\n\nCette réponse changera tout.`
          ])
        : pick([
            `**✨ Oracle Guidance — Love & Connection**\n\nDear ${name}, Venus is transiting your **${asc}** Ascendant — a rare window of emotional authenticity. Express what you've been afraid to say. The cosmos tells you: love doesn't search for you, it *recognizes* you.`,
            `**🌙 Oracle Guidance — The Starlit Heart**\n\n${name}, your blockage **"${blocker}"** builds an invisible wall around your heart. Wear your **${gem}** close to your heart and allow yourself one honest conversation this week.`
          ]);
    }

    // CARRIÈRE
    else if (msgLower.includes("travail") || msgLower.includes("carrière") || msgLower.includes("career") || msgLower.includes("professionnel") || msgLower.includes("job") || msgLower.includes("boulot") || msgLower.includes("argent") || msgLower.includes("money")) {
      response = lang === "fr"
        ? pick([
            `**⭐ Guidance de l'Oracle — Carrière & Mission**\n\n${name}, votre Soleil en **${sun}** vous destine à briller dans des rôles où votre individualité est une force. Votre Ascendant **${asc}** détermine *comment* les autres vous perçoivent professionnellement.\n\nJupiter stimule actuellement votre secteur professionnel — mais votre blocage **« ${blocker} »** risque de vous empêcher de saisir cette opportunité.\n\nStratégies cosmiques :\n1. Identifiez une compétence sous-évaluée et mettez-la en avant cette semaine.\n2. Dites *oui* à une opportunité que vous auriez normalement déclinée.\n3. Méditez avec votre **${gem}** avant chaque décision importante.`,
            `**🔮 Guidance de l'Oracle — L'Abondance Méritée**\n\nVotre chemin de vie **${lifeNum}** révèle une âme faite pour *créer*, pas seulement exécuter. Avec votre Soleil en **${sun}**, votre vraie richesse vient de l'authenticité de votre contribution.\n\nLe paradoxe dans votre ciel : vous avez peur de demander ce que vous méritez. La Lune en **${moon}** crée cette retenue émotionnelle.\n\nDéfi des 7 prochains jours : formulez clairement votre valeur professionnelle à quelqu'un qui peut l'entendre. Saturne récompense le courage, pas la patience passive.`
          ])
        : pick([
            `**⭐ Oracle Guidance — Career & Mission**\n\n${name}, Jupiter is stimulating your career sector. But your blockage **"${blocker}"** may stop you. Identify a skill you undervalue, highlight it this week. Meditate with your **${gem}** before every key decision.`,
            `**🔮 Oracle Guidance — Earned Abundance**\n\nYour life path **${lifeNum}** reveals a soul made to *create*. Your Moon in **${moon}** creates emotional restraint around asking what you deserve. Articulate your professional value to someone who can hear it. Saturn rewards courage.`
          ]);
    }

    // BLOCAGES
    else if (msgLower.includes("blocage") || msgLower.includes("obstacle") || msgLower.includes("peur") || msgLower.includes("fear") || msgLower.includes("difficile") || msgLower.includes("aide") || msgLower.includes("surmonter")) {
      response = lang === "fr"
        ? pick([
            `**🌑 Guidance de l'Oracle — Transmutation des Ombres**\n\n${name}, votre blocage **« ${blocker} »** n'est pas une faiblesse — c'est le reflet de votre zone de croissance la plus puissante. Votre Ascendant **${asc}** a construit des défenses qui vous ont protégé(e) autrefois, mais qui vous retiennent aujourd'hui.\n\nProtocole de transmutation :\n1. **Nommez-le** : Écrivez-le sur papier à la pleine lune.\n2. **Ancrez-le** : Portez votre **${gem}** (${gemDesc}) quotidiennement.\n3. **Libérez-le** : Chaque matin : *« Je choisis la croissance plutôt que la protection. »*`,
            `**💎 Guidance de l'Oracle — La Clé Cachée**\n\nLe blocage **« ${blocker} »**, ${name}, est lié à une leçon que Saturne vous enseigne depuis plusieurs années. Votre Soleil en **${sun}** possède la force exacte pour dissoudre ce schéma. Il vous manque simplement la *permission* de vous-même.\n\nTenez votre **${gem}** dans la main gauche et posez-vous : *« Qu'est-ce que je gagnerais si je n'avais plus cette peur ? »*\n\nLa première réponse est votre prochaine direction.`
          ])
        : pick([
            `**🌑 Oracle Guidance — Shadow Transmutation**\n\n${name}, your blockage **"${blocker}"** is your most powerful growth zone in disguise. Protocol: name it, ground it with your **${gem}**, say each morning: *"I choose growth over protection."*`,
            `**💎 Oracle Guidance — The Hidden Key**\n\nYour Sun in **${sun}** has the exact strength to dissolve **"${blocker}"**. Hold your **${gem}** in your left hand and ask: *"What would I gain without this fear?"* The first answer is your next direction.`
          ]);
    }

    // PIERRE / GEMME
    else if (msgLower.includes("pierre") || msgLower.includes("gem") || msgLower.includes("cristal") || msgLower.includes("crystal") || msgLower.includes("minéral")) {
      response = lang === "fr"
        ? pick([
            `**💠 Guidance de l'Oracle — Sagesse des Gemmes**\n\nVotre pierre céleste, ${name}, est le **${gem}**.\n\n*Vertus* : ${gemDesc}\n\nSpécifiquement choisie pour votre Soleil **${sun}** / Lune **${moon}**, elle amplifie vos énergies lumineuses et filtre vos tensions.\n\nRitual 🌑 : Placez-la sur votre chakra du cœur 11 minutes à la Nouvelle Lune. Chaque matin, tenez-la et répétez : *« Je reçois la lumière de mon âme. »*`,
            `**🔮 Guidance de l'Oracle — L'Alliance Cristalline**\n\nLe **${gem}** a été tissé dans votre thème pour une raison précise : ${gemDesc}. Votre Ascendant **${asc}** réagit particulièrement bien à son énergie.\n\nPortez-la côté gauche pour attirer ses qualités. Posez-la à droite de votre espace de travail pour projeter sa fréquence. Rechargez-la sous la pleine lune chaque mois.`
          ])
        : `**💠 Oracle Guidance — Gemstone Wisdom**\n\nYour celestial stone is **${gem}** — ${gemDesc}. Ritual: hold it on your heart chakra for 11 minutes at the New Moon. Each morning repeat: *"I receive the light of my soul."*`;
    }

    // SANTÉ / ÉNERGIE
    else if (msgLower.includes("santé") || msgLower.includes("énergie") || msgLower.includes("fatigue") || msgLower.includes("corps") || msgLower.includes("health") || msgLower.includes("energy")) {
      response = lang === "fr"
        ? `**🌿 Guidance de l'Oracle — Vitalité & Harmonie**\n\n${name}, votre corps parle un langage astral. Sous votre Soleil **${sun}**, votre énergie suit des cycles que la société ignore souvent. Votre Lune en **${moon}** régit votre système émotionnel — le conflit intérieur se ressent dans le corps avant d'être compris par l'esprit.\n\nRitual de recharge :\n1. 🌊 Buvez de l'eau avec intention chaque matin.\n2. 🌿 10 minutes dans la nature par jour (pieds nus si possible).\n3. 💎 Portez votre **${gem}** lors de vos moments de récupération.\n\nMessage des astres : *votre fatigue est une invitation à rentrer chez vous intérieurement.*`
        : `**🌿 Oracle Guidance — Vitality & Harmony**\n\n${name}, your Moon in **${moon}** means inner conflict shows up in the body before the mind understands it. Ground yourself: 10 minutes in nature daily, water with intention, and your **${gem}** during recovery moments.`;
    }

    // SPIRITUALITÉ / ÂME
    else if (msgLower.includes("spirit") || msgLower.includes("âme") || msgLower.includes("chemin") || msgLower.includes("destin") || msgLower.includes("soul") || msgLower.includes("mission")) {
      response = lang === "fr"
        ? `**🌌 Guidance de l'Oracle — Chemin de l'Âme**\n\n${name}, votre chemin de vie **${lifeNum}** révèle votre mission profonde sur Terre. Ce n'est pas une destination — c'est une orientation permanente.\n\nSoleil **${sun}** : votre boussole consciente. Lune **${moon}** : votre moteur inconscient. Ascendant **${asc}** : le véhicule de cette incarnation.\n\nAlignés, ces trois éléments créent une puissance créatrice rare. Les astres observent que vous n'en utilisez qu'une fraction.\n\nLa question de l'Oracle : *« Qu'est-ce que vous feriez si vous saviez que vous ne pouvez pas échouer ? »*\n\nLa réponse est votre prochain pas cosmique.`
        : `**🌌 Oracle Guidance — Soul Path**\n\n${name}, your life path **${lifeNum}** is a permanent orientation. Sun **${sun}**, Moon **${moon}**, Ascendant **${asc}** — aligned, they create rare power. The Oracle asks: *"What would you do if you knew you couldn't fail?"* That answer is your next cosmic step.`;
    }

    // RÉPONSE GÉNÉRALE
    else {
      response = lang === "fr"
        ? pick([
            `**🔮 Guidance de l'Oracle**\n\n${name}, les astres reçoivent votre question avec bienveillance. Votre triade — Soleil **${sun}**, Lune **${moon}**, Ascendant **${asc}** — m'indique que vous traversez un cycle d'intégration profonde.\n\nCe que les cieux voient en vous :\n- Une puissance qui attend d'être reconnue.\n- Un schéma **« ${blocker} »** prêt à être transmué.\n- Une intuition qui mérite d'être davantage écoutée.\n\nInterrogez-moi sur votre **vie amoureuse**, votre **potentiel professionnel**, votre **blocage principal** ou votre **pierre céleste**.`,
            `**✨ L'Oracle vous parle, ${name}**\n\nJe lis dans votre thème une âme en mouvement. Votre Soleil **${sun}** vous pousse vers la lumière ; votre Lune **${moon}** vous rappelle parfois vers vos eaux intérieures. Cette tension est votre plus grande richesse. Votre **${gem}** est votre allié pour naviguer cette dualité avec grâce.\n\nSur quel aspect souhaitez-vous que l'Oracle aille plus loin ?`
          ])
        : pick([
            `**🔮 Oracle Guidance**\n\n${name}, your triad — Sun **${sun}**, Moon **${moon}**, Ascendant **${asc}** — tells me you're in a deep integration cycle. Ask me about your **love life**, **career potential**, **main blockage**, or **celestial stone**.`,
            `**✨ The Oracle speaks, ${name}**\n\nSun **${sun}** pushes you toward light; Moon **${moon}** calls you inward. This tension is your greatest richness. Your **${gem}** helps you navigate both worlds.`
          ]);
    }

    // Realistic typing delay: 2.5s base + ~4ms per character, capped at 5s
    const typingDelay = Math.min(2500 + response.length * 4, 5000);
    await new Promise(resolve => setTimeout(resolve, typingDelay));

    return response + followUp;
  }


  // --- INITIALIZE APPLICATION STATE ---
  loadState();
  state.lang = "fr";
  translatePage("fr"); // Run translation and routing immediately on load in French
});
