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
    isPasswordRecoveryMode: false
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
          state.report = generatePersonalizedReport(state.answers);
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
                state.report = generatePersonalizedReport(state.answers);
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
    const privatePages = ["#dashboard", "#history", "#settings"];
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
    
    // Show Next button only for manual input questions (text, date, time), hide it for choices
    if (quizBtnNext && quizBtnNext.parentElement) {
      quizBtnNext.parentElement.style.display = q.type === "choice" ? "none" : "block";
    }
    
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
        <div class="quiz-input-group" style="margin-top: 10px; position: relative;">
          <input type="${q.id === 'email' ? 'email' : 'text'}" id="q-input-${q.id}" class="quiz-input" placeholder="${q.placeholder || ''}" value="${state.answers[q.id] || ''}">
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
          if (!map) {
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
          } else {
            map.setView([lat, lon], 11);
            marker.setLatLng([lat, lon]);
          }
          // Invalidate size to prevent Leaflet rendering issues in hidden elements
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

  if (toggleAuthMode) {
    toggleAuthMode.addEventListener("click", (e) => {
      e.preventDefault();
      if (authMode === "signup") {
        authMode = "signin";
        if (registerTitle) registerTitle.textContent = "Se connecter";
        if (registerSub) registerSub.textContent = "Connectez-vous pour retrouver votre thème astral et vos guidances quotidiennes.";
        if (consentGroup) consentGroup.style.display = "none";
        if (regConsentInput) regConsentInput.required = false;
        if (btnRegisterSubmit) btnRegisterSubmit.textContent = "Se connecter & voir mon thème";
        if (forgotPasswordLink) forgotPasswordLink.style.display = "block";
        toggleAuthMode.textContent = "Créer un compte (S'inscrire)";
      } else {
        authMode = "signup";
        if (registerTitle) registerTitle.textContent = "Créer votre profil";
        if (registerSub) registerSub.textContent = "Afin de sauvegarder vos calculs astrologiques et de générer votre premier rapport d'énergie.";
        if (consentGroup) consentGroup.style.display = "flex";
        if (regConsentInput) regConsentInput.required = true;
        if (btnRegisterSubmit) btnRegisterSubmit.textContent = "Calculer mon thème astral";
        if (forgotPasswordLink) forgotPasswordLink.style.display = "none";
        toggleAuthMode.textContent = "Se connecter";
      }
    });
  }

  // Mot de passe oublié (Supabase Auth reset)
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      const email = document.getElementById("reg-email").value.trim();
      if (!email) {
        showToast("Veuillez saisir votre adresse email pour réinitialiser votre mot de passe.");
        return;
      }
      
      if (supabase) {
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '#settings'
        }).then(({ error }) => {
          if (error) {
            showToast(`Erreur: ${error.message}`);
          } else {
            showToast("Un e-mail de réinitialisation de mot de passe vous a été envoyé ✦");
          }
        });
      } else {
        showToast("Simulation : E-mail de réinitialisation envoyé ! (Mode hors-ligne)");
      }
    });
  }

  // Accès direct Espace Client (Landing CTA)
  const btnClientAccess = document.getElementById("btn-client-access");
  if (btnClientAccess) {
    btnClientAccess.addEventListener("click", () => {
      if (authMode === "signup" && toggleAuthMode) {
        toggleAuthMode.click();
      }
      window.location.hash = "#register";
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
            const report = generatePersonalizedReport(state.answers);
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
                  state.report = generatePersonalizedReport(state.answers);
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
          state.report = generatePersonalizedReport(state.answers);
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
    { title: "Connexion céleste...", desc: "Alignement des étoiles à votre date de naissance." },
    { title: "Calcul des éphémérides...", desc: "Détermination exacte de votre signe Solaire et Ascendant." },
    { title: "Analyse émotionnelle...", desc: "Cartographie de vos énergies émotionnelles dominantes." },
    { title: "Guidance de l'Oracle...", desc: "Création de vos conseils personnalisés d'amour et de carrière." },
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
    resSun.textContent = `${r.zodiac.name} ${r.zodiac.symbol}`;
    if (resMoon && r.moon) {
      resMoon.textContent = `${r.moon.name} ${r.moon.symbol}`;
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
      if (gemName) gemName.textContent = `${r.luckyGemstone.name} Sacrée`;
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
      stripePlanTitle.textContent = "Abonnement Hebdomadaire Moon Astro";
      stripePlanPrice.textContent = "2,99 €";
      btnStripeSubmit.textContent = "S'abonner (2,99 € / semaine)";
    } else if (state.selectedPlan === "monthly") {
      stripePlanTitle.textContent = "Abonnement Mensuel (3 jours d'essai)";
      stripePlanPrice.textContent = "9,99 €";
      btnStripeSubmit.textContent = "Activer mon essai & payer (9,99 € / mois)";
    } else {
      stripePlanTitle.textContent = "Abonnement Annuel Moon Astro";
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

  // Stripe simulated and live checkout logic
  formStripe.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Change button state to elegant loading spinner
    btnStripeSubmit.disabled = true;
    btnStripeSubmit.style.opacity = 0.8;
    btnStripeSubmit.innerHTML = `<span style="display:inline-block; animation: rotate-cw 1s linear infinite; margin-right: 8px;">✦</span> Traitement sécurisé...`;
    
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const user = session?.user;
        if (!user) {
          showToast("Vous devez être connecté pour vous abonner.");
          btnStripeSubmit.disabled = false;
          btnStripeSubmit.style.opacity = 1;
          btnStripeSubmit.innerHTML = "Activer mon essai & payer";
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
            btnStripeSubmit.textContent = "Activer mon essai & payer";
            showToast("Mode Démo : Abonnement activé ! Bienvenue sur Moon Astro Premium.");
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
        btnStripeSubmit.textContent = "Activer mon essai & payer";
        showToast("Abonnement activé ! Bienvenue sur Moon Astro Premium (Simulation).");
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
      if (dashSunSign) dashSunSign.textContent = `${r.zodiac.name} ${r.zodiac.symbol}`;
      if (dashMoonSign && r.moon) dashMoonSign.textContent = `${r.moon.name} ${r.moon.symbol}`;
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
      if (dashSunSign) dashSunSign.textContent = `${r.zodiac.name}`;
      if (dashMoonSign && r.moon) dashMoonSign.textContent = `${r.moon.name}`;
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

    // Remplir la gemmologie sur le Dashboard
    if (r.luckyGemstone) {
      const gemIcon = document.getElementById("dash-gem-icon");
      const gemName = document.getElementById("dash-gem-name");
      const gemDesc = document.getElementById("dash-gem-desc");
      if (gemIcon) gemIcon.textContent = r.luckyGemstone.symbol;
      if (gemName) gemName.textContent = `${r.luckyGemstone.name} Sacrée`;
      if (gemDesc) {
        if (isPrem) {
          gemDesc.textContent = r.luckyGemstone.desc;
        } else {
          gemDesc.innerHTML = `
            <span style="filter: blur(4px); opacity: 0.35; user-select: none;">
              Débloquez l'analyse complète de votre pierre céleste et ses vertus d'harmonisation énergétique.
            </span>
            <div style="margin-top: 4px; font-size: 11px;">
              <a href="#paywall" style="color: var(--accent-gold-dark); font-weight: 600; text-decoration: none;">Débloquer ma gemme &rarr;</a>
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
    const found = ZODIAC_SIGNS.find(z => z.name.toLowerCase() === name.toLowerCase());
    return found ? found.symbol : "✦";
  }

  // Dual geocoding helper (Photon with Nominatim fallback)
  function searchCitySuggestions(query, callback) {
    fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=fr`)
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
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=fr`)
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
      if (!settingsMap) {
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
      } else {
        settingsMap.setView([lat, lon], 11);
        settingsMarker.setLatLng([lat, lon]);
      }
      setTimeout(() => settingsMap.invalidateSize(), 200);
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
    const report = generatePersonalizedReport(state.answers);
    state.report = report;
    saveState();
    
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const element = report.zodiac.element;
          let score_fire = 25, score_earth = 25, score_air = 25, score_water = 25;
          if (element === "Feu") score_fire = 60;
          else if (element === "Terre") score_earth = 60;
          else if (element === "Air") score_air = 60;
          else if (element === "Eau") score_water = 60;

          supabase.from("astrology_profiles").update({
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
          }).eq("id", user.id).then(({ error }) => {
            if (error) {
              console.error("Erreur de synchronisation BDD:", error);
              showToast("Modifié localement, mais erreur de synchronisation en ligne.");
            } else {
              showToast("Votre thème astral natal a été mis à jour et synchronisé ✦");
            }
            router();
          });
        } else {
          showToast("Votre thème astral natal a été recalculé avec succès ✦");
          router();
        }
      });
    } else {
      showToast("Votre thème astral natal a été recalculé avec succès ✦");
      router();
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

  // --- INITIALIZE APPLICATION STATE ---
  loadState();
  router(); // Run routing immediately on load
});
