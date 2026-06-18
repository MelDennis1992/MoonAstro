// Moon Astro Webapp — SPA Core Controller

document.addEventListener("DOMContentLoaded", () => {
  
  // --- GLOBAL ERROR HANDLER FOR MOBILE DEBUGGING ---
  window.addEventListener("error", (e) => {
    const errorDiv = document.createElement("div");
    errorDiv.style.position = "fixed";
    errorDiv.style.bottom = "80px";
    errorDiv.style.left = "20px";
    errorDiv.style.right = "20px";
    errorDiv.style.background = "rgba(186, 85, 74, 0.95)";
    errorDiv.style.color = "white";
    errorDiv.style.padding = "12px";
    errorDiv.style.borderRadius = "8px";
    errorDiv.style.zIndex = "10000";
    errorDiv.style.fontSize = "12px";
    errorDiv.textContent = "🚨 JS Error: " + e.message + " at " + (e.filename ? e.filename.split('/').pop() : 'unknown') + ":" + e.lineno;
    document.body.appendChild(errorDiv);
    setTimeout(() => {
      if (errorDiv.parentNode) errorDiv.parentNode.removeChild(errorDiv);
    }, 10000);
  });

  // --- SUPABASE INITIALIZATION ---
  const SUPABASE_URL = "https://oorlsqxfwhozmciktljf.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcmxzcXhmd2hvem1jaWt0bGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjgyMDIsImV4cCI6MjA5NTkwNDIwMn0.LyyeYMpg1WFX6fsx_VY1qdy_qeO29luRlc12ZojAG2s";
  const GOOGLE_API_KEY = "AQ.Ab8RN6LiyEoM6Z1ZQ2Z7FCudd6xINJR5hwBT6U6JRLi6Z6mvjg";
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

  // --- STORAGE COMPATIBILITY FOR PRIVATE MODE / INCOGNITO ---
  const memoryStorage = {};
  const safeStorage = {
    getItem(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn("Storage warning: localStorage is blocked in private/incognito mode.", e);
        return memoryStorage[key] || null;
      }
    },
    setItem(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn("Storage warning: localStorage is blocked in private/incognito mode.", e);
        memoryStorage[key] = String(value);
      }
    },
    removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn("Storage warning: localStorage is blocked in private/incognito mode.", e);
        delete memoryStorage[key];
      }
    }
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
    const saved = safeStorage.getItem("moon_astro_state");
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
              state.answers.relationship = data.relationship_status || "";
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
    safeStorage.setItem("moon_astro_state", JSON.stringify({
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
    const privatePages = ["#dashboard", "#history", "#settings", "#oracle", "#carte"];
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
    } else if (hash === "#carte") {
      initCarteDuJour();
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

  // --- LANGUAGE SWITCHER BINDINGS ---
  const langBtns = document.querySelectorAll(".lang-switcher .lang-btn");
  langBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetLang = btn.getAttribute("data-lang");
      translatePage(targetLang);
    });
  });

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
            <div id="birthplace-map" style="height: 280px; margin-top: 15px; border-radius: 16px; border: 1px solid rgba(197, 160, 89, 0.2); display: none;"></div>
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

      // Google Places Autocomplete binding
      const hasGoogleMaps = window.google && window.google.maps && window.google.maps.places && GOOGLE_API_KEY.startsWith("AIzaSy");
      if (hasGoogleMaps) {
        setupGoogleAutocomplete(birthPlaceInput, (place) => {
          birthPlaceInput.value = place.formatted_address || place.name;
          state.answers.birthPlace = place.formatted_address || place.name;
          state.answers.latitude = place.geometry.location.lat();
          state.answers.longitude = place.geometry.location.lng();
          saveState();
          initMap(state.answers.latitude, state.answers.longitude);
        });
      }

      let debounceTimeout;
      birthPlaceInput.addEventListener("input", (e) => {
        if (hasGoogleMaps) {
          return; // Let Google handle it!
        }
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
                state.answers.relationship = profileData.relationship_status || "";
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
    if (dashZodiacIcon) {
      dashZodiacIcon.innerHTML = `
        <text x="50%" y="65%" text-anchor="middle" font-size="14" font-family="sans-serif">${r.zodiac.symbol}</text>
      `;
    }
 
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

  function getFlagEmoji(countryCode) {
    if (!countryCode) return "";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map(char => 127397 + char.charCodeAt(0));
    try {
      return String.fromCodePoint(...codePoints);
    } catch (e) {
      return "";
    }
  }

  // Dual geocoding helper (Photon with Nominatim fallback)
  function searchCitySuggestions(query, callback) {
    const queryLang = state.lang || "fr";
    // Fetch up to 15 candidates to ensure we have enough results after filtering
    fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=15&lang=${queryLang}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.features && data.features.length > 0) {
          const validTypes = new Set(['city', 'town', 'village', 'municipality', 'locality', 'district', 'state', 'country', 'administrative', 'region']);
          const validKeys = new Set(['place', 'boundary']);

          const filtered = data.features.filter(feat => {
            const props = feat.properties || {};
            const osmKey = props.osm_key;
            const osmValue = props.osm_value;
            const type = props.type;
            return validKeys.has(osmKey) || validTypes.has(osmValue) || validTypes.has(type);
          });

          const seen = new Set();
          const suggestions = [];

          for (const feat of filtered) {
            const props = feat.properties;
            let label = props.name || "";
            if (props.postcode) label += ` (${props.postcode})`;
            if (props.state && props.state !== props.name) label += `, ${props.state}`;
            if (props.country) {
              const flag = getFlagEmoji(props.countrycode);
              label += `, ${props.country}${flag ? ' ' + flag : ''}`;
            }

            if (!seen.has(label)) {
              seen.add(label);
              suggestions.push({
                display_name: label,
                lat: feat.geometry.coordinates[1],
                lon: feat.geometry.coordinates[0]
              });
            }

            if (suggestions.length >= 5) break; // limit to top 5 unique suggestions
          }

          if (suggestions.length > 0) {
            callback(suggestions);
          } else {
            queryNominatim(query, callback);
          }
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
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&accept-language=${queryLang}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const seen = new Set();
          const suggestions = [];
          
          for (const item of data) {
            if (!seen.has(item.display_name)) {
              seen.add(item.display_name);
              suggestions.push({
                display_name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon)
              });
            }
            if (suggestions.length >= 5) break;
          }
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
    if (!state.report) {
      historyList.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
          <p data-i18n="history.empty">Complétez le questionnaire pour générer votre thème astral.</p>
        </div>
      `;
      return;
    }

    const r = state.report;
    const lang = state.lang || "fr";

    // 1. Calculate Planet Longitudes deterministically
    const ascLong = (r.astro && typeof r.astro.ascLong === 'number') ? r.astro.ascLong : 270;
    const sunLong = (r.astro && typeof r.astro.sunLong === 'number') ? r.astro.sunLong : 0;
    const moonLong = (r.astro && typeof r.astro.moonLong === 'number') ? r.astro.moonLong : 90;

    // Outer planets deterministic distribution based on Sun longitude
    const mercLong = (sunLong + 24 * Math.sin(sunLong * Math.PI / 180 + 1.2)) % 360;
    const venLong = (sunLong + 42 * Math.sin(sunLong * Math.PI / 180 + 2.5)) % 360;
    const marsLong = (sunLong * 1.45 + 85) % 360;
    const jupLong = (sunLong * 0.75 + 195) % 360;
    const satLong = (sunLong * 0.35 + 285) % 360;

    // Get Zodiac signs for each planet
    const getZodiacSign = (longVal) => {
      const idx = Math.floor(longVal / 30);
      const signIdx = (idx + 3) % 12;
      return ZODIAC_SIGNS[signIdx];
    };

    const sunSign = r.zodiac || getZodiacSign(sunLong);
    const moonSign = r.moon || getZodiacSign(moonLong);
    const ascSign = getZodiacSign(ascLong);
    const mercSign = getZodiacSign(mercLong);
    const venSign = getZodiacSign(venLong);
    const marsSign = getZodiacSign(marsLong);
    const jupSign = getZodiacSign(jupLong);
    const satSign = getZodiacSign(satLong);

    // Formatter helper for coordinates
    const formatCoordinate = (longVal, sign) => {
      const deg = Math.floor(longVal % 30);
      const signSymbol = sign.symbol;
      const signName = lang === "en" ? sign.name_en : sign.name;
      return `${deg}° ${signSymbol} ${signName}`;
    };

    // Calculate element values
    const sunElement = sunSign.element || "Feu";
    let fireVal = 25, earthVal = 25, airVal = 25, waterVal = 25;
    if (sunElement === "Feu") fireVal = 55;
    else if (sunElement === "Terre") earthVal = 55;
    else if (sunElement === "Air") airVal = 55;
    else if (sunElement === "Eau") waterVal = 55;

    if (moonSign.element === "Feu") fireVal += 15;
    else if (moonSign.element === "Terre") earthVal += 15;
    else if (moonSign.element === "Air") airVal += 15;
    else if (moonSign.element === "Eau") waterVal += 15;

    // Adjust sum to 100%
    const sum = fireVal + earthVal + airVal + waterVal;
    fireVal = Math.round((fireVal / sum) * 100);
    earthVal = Math.round((earthVal / sum) * 100);
    airVal = Math.round((airVal / sum) * 100);
    waterVal = 100 - (fireVal + earthVal + airVal);

    // Rotate outer signs wheel so ASC is at 180° (horizontal left)
    const rotationAngle = 180 - ascLong;

    const getXY = (angle, radius) => {
      const rad = (angle * Math.PI) / 180;
      return {
        x: 150 + radius * Math.cos(rad),
        y: 150 + radius * Math.sin(rad)
      };
    };

    // Render coordinate grid lines (faint lines radiating from center)
    let gridLinesHtml = "";
    // Concentric circle grids
    gridLinesHtml += `<circle cx="150" cy="150" r="135" class="constellation-grid-line" />`;
    gridLinesHtml += `<circle cx="150" cy="150" r="105" class="constellation-grid-line" />`;
    gridLinesHtml += `<circle cx="150" cy="150" r="75" class="constellation-grid-line" />`;
    gridLinesHtml += `<circle cx="150" cy="150" r="45" class="constellation-grid-line" />`;

    // Radiating lines
    for (let angle = 0; angle < 360; angle += 30) {
      const p1 = getXY(angle, 15);
      const p2 = getXY(angle, 135);
      gridLinesHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="constellation-grid-line" />`;
    }

    // Outer ticks
    let ticksHtml = "";
    for (let angle = 0; angle < 360; angle += 5) {
      const isMajor = angle % 30 === 0;
      const rInner = isMajor ? 132 : 134;
      const p1 = getXY(angle, rInner);
      const p2 = getXY(angle, 136);
      ticksHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="rgba(255, 255, 255, ${isMajor ? 0.15 : 0.06})" stroke-width="0.5" />`;
    }

    // Faint zodiac abbreviations around the ring
    const ZODIAC_ABBRS = [
      { symbol: "♈", name: "Ari" },
      { symbol: "♉", name: "Tau" },
      { symbol: "♊", name: "Gem" },
      { symbol: "♋", name: "Can" },
      { symbol: "♌", name: "Leo" },
      { symbol: "♍", name: "Vir" },
      { symbol: "♎", name: "Lib" },
      { symbol: "♏", name: "Sco" },
      { symbol: "♐", name: "Sag" },
      { symbol: "♑", name: "Cap" },
      { symbol: "♒", name: "Aqu" },
      { symbol: "♓", name: "Pis" }
    ];

    let zodiacLabelsHtml = "";
    for (let i = 0; i < 12; i++) {
      const startLong = ((i - 3) * 30 + 360) % 360;
      const midAngle = (startLong + 15 + rotationAngle) % 360;
      const pText = getXY(midAngle, 144);
      zodiacLabelsHtml += `<text x="${pText.x}" y="${pText.y + 3}" text-anchor="middle" font-size="7" fill="rgba(255, 255, 255, 0.25)" font-family="Cinzel, serif">${ZODIAC_SIGNS[i].symbol} ${ZODIAC_ABBRS[i].name}</text>`;
    }

    // Twinkling stars inside map
    let starsHtml = "";
    for (let i = 0; i < 35; i++) {
      const starX = Math.random() * 260 + 20;
      const starY = Math.random() * 260 + 20;
      const dist = Math.sqrt(Math.pow(starX - 150, 2) + Math.pow(starY - 150, 2));
      if (dist < 92) {
        const starRadius = Math.random() * 1.3 + 0.4;
        const delay = Math.random() * 4;
        starsHtml += `<circle cx="${starX}" cy="${starY}" r="${starRadius}" fill="#FAF9F6" class="star-particle" style="animation-delay: ${delay}s;" />`;
      }
    }

    // Coordinates of planet nodes
    const getPlanetCoord = (long, radius) => {
      const angle = (long + rotationAngle) % 360;
      return getXY(angle, radius);
    };

    const pSun = getPlanetCoord(sunLong, 80);
    const pMoon = getPlanetCoord(moonLong, 80);
    const pAsc = getPlanetCoord(ascLong, 80);
    const pMerc = getPlanetCoord(mercLong, 64);
    const pVen = getPlanetCoord(venLong, 64);
    const pMars = getPlanetCoord(marsLong, 48);
    const pJup = getPlanetCoord(jupLong, 48);
    const pSat = getPlanetCoord(satLong, 48);

    // Planet data array for rendering cards & bindings
    const planetDataList = [
      {
        name: "sun",
        label: lang === "en" ? "Sun" : "Soleil",
        glyph: "☀️",
        coord: formatCoordinate(sunLong, sunSign),
        desc: lang === "en" 
          ? "The Sun represents your core essence, conscious will, and vitality. It illuminates who you are born to become and how you express your unique creative spark."
          : "Le Soleil représente votre essence fondamentale, votre volonté consciente et votre vitalité. Il éclaire ce que vous êtes né pour incarner et comment vous rayonnez.",
        p: pSun
      },
      {
        name: "moon",
        label: lang === "en" ? "Moon" : "Lune",
        glyph: "🌙",
        coord: formatCoordinate(moonLong, moonSign),
        desc: lang === "en"
          ? "The Moon rules your emotions, subconscious desires, and intuitive reactions. It represents your emotional secret garden and how you seek safety."
          : "La Lune régit vos émotions, votre inconscient et vos réactions intuitives. Elle représente votre jardin secret émotionnel et votre besoin inné de sécurité.",
        p: pMoon
      },
      {
        name: "asc",
        label: lang === "en" ? "Ascendant" : "Ascendant",
        glyph: "🌌",
        coord: formatCoordinate(ascLong, ascSign),
        desc: lang === "en"
          ? "The Ascendant (Rising sign) describes your social mask, outer appearance, and physical vehicle. It is the filter through which you view and interact with the world."
          : "L'Ascendant décrit votre masque social, votre apparence extérieure et votre véhicule physique. C'est le filtre à travers lequel vous interagissez avec le monde.",
        p: pAsc
      },
      {
        name: "merc",
        label: lang === "en" ? "Mercury" : "Mercure",
        glyph: "☿",
        coord: formatCoordinate(mercLong, mercSign),
        desc: lang === "en"
          ? "Mercury governs your intellect, logic, communication style, and curiosity. It shapes how you process daily thoughts and express your ideas to others."
          : "Mercure gouverne votre intellect, votre logique, votre style de communication et votre curiosité. Il façonne votre pensée et votre transmission d'idées.",
        p: pMerc
      },
      {
        name: "ven",
        label: lang === "en" ? "Venus" : "Vénus",
        glyph: "♀",
        coord: formatCoordinate(venLong, venSign),
        desc: lang === "en"
          ? "Venus embodies your capacity for love, relationships, aesthetic taste, and values. It shows how you express affection and attract harmony and abundance."
          : "Vénus incarne votre capacité d'amour, votre style relationnel, votre sens esthétique et vos valeurs. Elle régit l'attraction, l'harmonie et l'abondance.",
        p: pVen
      },
      {
        name: "mars",
        label: lang === "en" ? "Mars" : "Mars",
        glyph: "♂",
        coord: formatCoordinate(marsLong, marsSign),
        desc: lang === "en"
          ? "Mars rules your drive, energy, physical courage, and assertiveness. It is the raw ambition and action principle that pushes you to conquer challenges."
          : "Mars régit votre force de volonté, votre ambition, votre courage physique et votre combativité. C'est le principe d'action pure qui vous pousse à conquérir.",
        p: pMars
      },
      {
        name: "jup",
        label: lang === "en" ? "Jupiter" : "Jupiter",
        glyph: "♃",
        coord: formatCoordinate(jupLong, jupSign),
        desc: lang === "en"
          ? "Jupiter symbolizes expansion, luck, higher wisdom, and spiritual abundance. It reveals how you find meaning, cultivate optimism, and attract prosperity."
          : "Jupiter symbolise l'expansion, la chance, la sagesse supérieure et l'abondance spirituelle. Il indique comment vous développez l'optimisme et prospérez.",
        p: pJup
      },
      {
        name: "sat",
        label: lang === "en" ? "Saturn" : "Saturne",
        glyph: "♄",
        coord: formatCoordinate(satLong, satSign),
        desc: lang === "en"
          ? "Saturn represents structure, discipline, boundaries, and karmic lessons. It points to where you must work hard, establish authority, and build lasting foundations."
          : "Saturne représente la discipline, la structure, les limites et les leçons karmiques. Il indique où vous devez travailler dur pour bâtir des fondations durables.",
        p: pSat
      }
    ];

    // Generate Aspect lines (dashed constellation links in the center)
    const aspectLines = [
      { p1: pSun, p2: pMoon, pNames: "sun-moon" },
      { p1: pMerc, p2: pVen, pNames: "merc-ven" },
      { p1: pMars, p2: pJup, pNames: "mars-jup" },
      { p1: pSun, p2: pJup, pNames: "sun-jup" },
      { p1: pMoon, p2: pSat, pNames: "moon-sat" }
    ];

    let aspectsHtml = "";
    aspectLines.forEach(line => {
      aspectsHtml += `<line x1="${line.p1.x}" y1="${line.p1.y}" x2="${line.p2.x}" y2="${line.p2.y}" class="constellation-aspect-line" data-aspect="${line.pNames}" />`;
    });

    // Make Element Row Helper (Minimalist style)
    const makeElementRow = (name, val, color, symbol) => {
      return `
        <div class="minimalist-element-row">
          <span class="minimalist-element-name">${symbol} ${name}</span>
          <div class="minimalist-element-bar-bg">
            <div class="minimalist-element-bar-fill" style="width: ${val}%; background: ${color};"></div>
          </div>
          <span class="minimalist-element-val" style="color: ${color};">${val}%</span>
        </div>
      `;
    };

    const elLabels = lang === "en" 
      ? { fire: "Fire", earth: "Earth", air: "Air", water: "Water" }
      : { fire: "Feu", earth: "Terre", air: "Air", water: "Eau" };

    // Construct full Page HTML
    let html = `
      <!-- Premium Celestial Interactive Wheel -->
      <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 28px; background: radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 80%); padding: 10px 0; border-radius: 30px;">
        <svg id="interactive-astral-svg" width="280" height="280" viewBox="0 0 300 300" style="background: transparent; overflow: visible;">
          <defs>
            <radialGradient id="space-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#14192d" />
              <stop offset="70%" stop-color="#0b0e1d" />
              <stop offset="100%" stop-color="#04060b" />
            </radialGradient>
            <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(255, 255, 255, 0.2)" />
              <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
            </radialGradient>
          </defs>

          <!-- Cosmic Ambient Glow -->
          <circle cx="150" cy="150" r="140" fill="url(#star-glow)" />

          <!-- Star particles -->
          ${starsHtml}

          <!-- Outer Slow-Rotating Deco Rings -->
          <circle cx="150" cy="150" r="138" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" stroke-dasharray="2, 6" class="celestial-spin" />
          <circle cx="150" cy="150" r="143" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.5" stroke-dasharray="1, 12" class="celestial-spin" style="animation-direction: reverse; animation-duration: 90s;" />

          <!-- Celestial Grid Lines -->
          ${gridLinesHtml}
          ${ticksHtml}
          ${zodiacLabelsHtml}

          <!-- Dynamic Aspect Lines -->
          ${aspectsHtml}

          <!-- ASC Line (Sleek minimalist indicator) -->
          <line x1="150" y1="150" x2="45" y2="150" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1" stroke-dasharray="2, 2" />
          <polygon points="45,150 51,147 51,153" fill="rgba(255, 255, 255, 0.5)" />

          <!-- Center star point -->
          <circle cx="150" cy="150" r="3.5" fill="#FAF9F6" stroke="rgba(255, 255, 255, 0.5)" stroke-width="1" />

          <!-- Interactive Constellation Star Nodes -->
          ${planetDataList.map(p => {
            const dx = p.p.x > 150 ? 10 : -10;
            const textAnchor = p.p.x > 150 ? "start" : "end";
            return `
              <circle cx="${p.p.x}" cy="${p.p.y}" r="4.5" fill="#FAF9F6" class="constellation-star-node" id="node-${p.name}" />
              <text x="${p.p.x + dx}" y="${p.p.y + 3}" text-anchor="${textAnchor}" class="constellation-label">${p.glyph} ${p.label}</text>
            `;
          }).join("")}
        </svg>
        <span style="font-size: 11px; color: var(--text-muted); margin-top: 10px; font-style: italic; letter-spacing: 0.02em;" data-i18n="history.chart.hint">
          ✦ Touchez une planète pour tracer ses aspects et afficher les détails
        </span>
      </div>

      <!-- Co-Star Styled Planet Cards -->
      <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
        ${planetDataList.map(p => `
          <div class="astral-card" id="astral-card-${p.name}">
            <div class="astral-card-header">
              <div class="astral-card-title">
                <span class="astral-card-glyph">${p.glyph}</span>
                <strong>${p.label}</strong>
              </div>
              <span class="astral-card-coordinate">${p.coord}</span>
            </div>
            <div class="astral-card-body">
              ${p.desc}
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Numeric Life Path Card -->
      <div class="astral-card" style="border-color: rgba(255, 255, 255, 0.1);">
        <div class="astral-card-header">
          <div class="astral-card-title">
            <span class="astral-card-glyph">✦</span>
            <strong data-i18n="history.lifepath.title">Chemin de Vie</strong>
          </div>
          <span class="astral-card-coordinate" style="border-color: rgba(255, 255, 255, 0.2); color: #FAF9F6;">
            Nombre ${r.lifePath?.number || '7'}
          </span>
        </div>
        <div class="astral-card-body">
          <p>${lang === "en" ? "Your life path reveals your primary spiritual mission." : "Votre chemin de vie révèle votre mission spirituelle d'incarnation."} ${lang === "en" ? "Number" : "Le nombre"} <strong>${r.lifePath?.number || '7'} - ${r.lifePath?.name || (lang === "en" ? "The Sage" : "Le Sage")}</strong> ${lang === "en" ? "indicates a destiny of inner wisdom, introspection, and spiritual connection." : "indique une destinée d'évolution personnelle forte et un besoin inné d'introspection, de sagesse et de connexion spirituelle."}</p>
          <p style="margin-top: 8px; font-size: 12.5px; color: rgba(250, 249, 246, 0.5);">${r.lifePath?.desc || ''}</p>
        </div>
      </div>

      <!-- Cosmic Blockage Card -->
      <div class="astral-card" style="border-color: rgba(186, 85, 74, 0.25);">
        <div class="astral-card-header">
          <div class="astral-card-title">
            <span class="astral-card-glyph" style="background: rgba(186, 85, 74, 0.08); color: #BA554A;">🛡️</span>
            <strong style="color: #BA554A;" data-i18n="history.blocker.title">Défi Céleste (Blocage)</strong>
          </div>
          <span class="astral-card-coordinate" style="background: rgba(186, 85, 74, 0.08); border-color: rgba(186, 85, 74, 0.3); color: #BA554A;" data-i18n="history.blocker.status">À transmuter</span>
        </div>
        <div class="astral-card-body">
          <p>${lang === "en" ? "Your primary energetic blockage identified in this cycle is:" : "Le blocage énergétique majeur identifié dans votre thème est :"} <strong style="color: #BA554A;">« ${r.blocker || (lang === "en" ? "fear of change" : "la peur du changement")} »</strong>.</p>
          <p style="margin-top: 8px; font-size: 12.5px; color: rgba(250, 249, 246, 0.5); font-style: italic;">
            ${lang === "en" ? "Oracle Advice: Connect with your lucky gemstone to help balance this vibration daily." : "Conseil de l'Oracle : Pour dissoudre ce schéma obsolète, pratiquez la pleine conscience et portez votre pierre céleste près de vous pour transmuter ces craintes."}
          </p>
        </div>
      </div>

      <!-- Protection Gemstone Card -->
      <div class="astral-card" style="border-color: rgba(255, 255, 255, 0.1);">
        <div class="astral-card-header">
          <div class="astral-card-title">
            <span class="astral-card-glyph">${r.luckyGemstone ? r.luckyGemstone.symbol : '💎'}</span>
            <strong data-i18n="history.gem.title">Pierre de Protection</strong>
          </div>
          <span class="astral-card-coordinate" style="border-color: rgba(255, 255, 255, 0.2); color: #FAF9F6;">
            ${r.luckyGemstone ? r.luckyGemstone.name : 'Améthyste'}
          </span>
        </div>
        <div class="astral-card-body">
          <p>${lang === "en" ? "Your sacred resonance crystal is the" : "Votre cristal vibratoire de résonance céleste est l'"} <strong>${r.luckyGemstone ? r.luckyGemstone.name : 'Améthyste'}</strong>.</p>
          <p style="margin-top: 8px; font-size: 12.5px; color: rgba(250, 249, 246, 0.5);">${r.luckyGemstone ? r.luckyGemstone.desc : (lang === "en" ? 'Brings clarity and protects from negative energy.' : 'Apporte la clarté mentale et protège des énergies négatives.')}</p>
        </div>
      </div>

      <!-- Elements Minimalist Panel -->
      <div class="astral-card" style="margin-bottom: 30px;">
        <div class="astral-card-header" style="border-bottom: none; margin-bottom: 8px;">
          <div class="astral-card-title">
            <span class="astral-card-glyph">🌀</span>
            <strong data-i18n="history.elements.title">Équilibre des 4 Éléments</strong>
          </div>
        </div>
        <div class="minimalist-element-container">
          ${makeElementRow(elLabels.fire, fireVal, "#E2583E", "🔥")}
          ${makeElementRow(elLabels.earth, earthVal, "#5A8C43", "🌱")}
          ${makeElementRow(elLabels.air, airVal, "#4A90E2", "💨")}
          ${makeElementRow(elLabels.water, waterVal, "#9b59b6", "💧")}
        </div>
      </div>
    `;

    historyList.innerHTML = html;

    // 2. Bind JavaScript Click events for Bi-directional highlights
    const planetNames = ["sun", "moon", "asc", "merc", "ven", "mars", "jup", "sat"];

    planetNames.forEach(name => {
      // Node Click
      const nodeEl = document.getElementById(`node-${name}`);
      if (nodeEl) {
        nodeEl.addEventListener("click", (e) => {
          e.stopPropagation();
          highlightPlanet(name);
        });
      }

      // Card Click
      const cardEl = document.getElementById(`astral-card-${name}`);
      if (cardEl) {
        cardEl.addEventListener("click", () => {
          // Highlight SVG node & aspects
          document.querySelectorAll(".constellation-star-node").forEach(node => node.classList.remove("active"));
          const node = document.getElementById(`node-${name}`);
          if (node) node.classList.add("active");

          document.querySelectorAll(".constellation-aspect-line").forEach(line => line.classList.remove("active"));
          document.querySelectorAll(`.constellation-aspect-line[data-aspect*="${name}"]`).forEach(line => {
            line.classList.add("active");
          });
        });
      }
    });

    // Reset highlights on background click
    const svgEl = document.getElementById("interactive-astral-svg");
    if (svgEl) {
      svgEl.addEventListener("click", () => {
        document.querySelectorAll(".constellation-star-node").forEach(node => node.classList.remove("active"));
        document.querySelectorAll(".constellation-aspect-line").forEach(line => line.classList.remove("active"));
        document.querySelectorAll(".astral-card").forEach(c => c.classList.remove("highlighted"));
      });
    }

    // 3. GSAP Entrance Animations (if GSAP is loaded)
    if (window.gsap) {
      // Prevent running multiple overlapping tweens
      gsap.killTweensOf("#interactive-astral-svg *");
      gsap.killTweensOf(".astral-card");

      const tl = gsap.timeline();

      // Faint grids scale up and fade in
      tl.fromTo(".constellation-grid-line", 
        { scale: 0.8, opacity: 0, transformOrigin: "center" },
        { scale: 1, opacity: 1, duration: 1.0, ease: "power2.out", stagger: 0.05 }
      );

      // Star nodes pop in with a bounce
      tl.fromTo(".constellation-star-node",
        { scale: 0, opacity: 0, transformOrigin: "center" },
        { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(2)", stagger: 0.04 },
        "-=0.5"
      );

      // Labels fade in gently from left/right depending on their alignment
      tl.fromTo(".constellation-label",
        { opacity: 0, x: (i, el) => el.getAttribute("text-anchor") === "start" ? -6 : 6 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power1.out", stagger: 0.03 },
        "-=0.3"
      );

      // Aspect lines fade and trace in
      tl.fromTo(".constellation-aspect-line",
        { opacity: 0, strokeDasharray: "3, 20" },
        { opacity: 1, strokeDasharray: "3, 4", duration: 1.0, ease: "power1.inOut", stagger: 0.08 },
        "-=0.5"
      );

      // Cards slide up and fade in
      tl.fromTo(".astral-card",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.06 },
        "-=0.7"
      );
    }
  }

  // Helper function for planet highlighting
  window.highlightPlanet = function(name) {
    // 1. Highlight Node on SVG
    document.querySelectorAll(".constellation-star-node").forEach(node => node.classList.remove("active"));
    const activeNode = document.getElementById(`node-${name}`);
    if (activeNode) activeNode.classList.add("active");

    // 2. Highlight Aspect Lines
    document.querySelectorAll(".constellation-aspect-line").forEach(line => line.classList.remove("active"));
    document.querySelectorAll(`.constellation-aspect-line[data-aspect*="${name}"]`).forEach(line => {
      line.classList.add("active");
    });

    // 3. Highlight Details Card
    const card = document.getElementById(`astral-card-${name}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      document.querySelectorAll(".astral-card").forEach(c => c.classList.remove("highlighted"));
      card.classList.add("highlighted");
      
      // Auto-remove card glow after 2.5 seconds
      setTimeout(() => {
        card.classList.remove("highlighted");
      }, 2500);
    }
  };

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
      const hasGoogleMaps = window.google && window.google.maps && window.google.maps.places && GOOGLE_API_KEY.startsWith("AIzaSy");
      if (hasGoogleMaps) {
        return; // Let Google handle it!
      }
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

    const setRelationshipSelect = document.getElementById("set-relationship");
    if (setRelationshipSelect) {
      setRelationshipSelect.value = state.answers.relationship || "single";
    }
 
    // Setup Google Autocomplete in settings if available
    const hasGoogleMapsSettings = window.google && window.google.maps && window.google.maps.places && GOOGLE_API_KEY.startsWith("AIzaSy");
    if (hasGoogleMapsSettings && setBirthplaceInput) {
      setupGoogleAutocomplete(setBirthplaceInput, (place) => {
        setBirthplaceInput.value = place.formatted_address || place.name;
        state.answers.birthPlace = place.formatted_address || place.name;
        state.answers.latitude = place.geometry.location.lat();
        state.answers.longitude = place.geometry.location.lng();
        saveState();
        initSettingsMap(state.answers.latitude, state.answers.longitude);
      });
    }
 
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

        // Synchronize with Supabase database if logged in
        if (supabase) {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              const targetStatus = state.isPremium ? "premium" : "free";
              supabase
                .from("astrology_profiles")
                .update({ payment_status: targetStatus })
                .eq("id", session.user.id)
                .then(({ error }) => {
                  if (error) {
                    console.error("Error updating payment status in DB:", error);
                  } else {
                    console.log("Database payment_status updated to:", targetStatus);
                  }
                });
            }
          });
        }

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
    
    const setRelationshipSelect = document.getElementById("set-relationship");
    state.answers.relationship = setRelationshipSelect ? setRelationshipSelect.value : "single";
    
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
          showToast(state.lang === "en" ? "Could not verify birth coordinates. Please check spelling." : "Coordonnées de naissance introuvables. Veuillez vérifier l'orthographe.");
          if (submitBtn) submitBtn.disabled = false;
          return;
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
            relationship_status: state.answers.relationship || "",
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
        safeStorage.removeItem("moon_astro_state");
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
    safeStorage.setItem("moon_astro_lang", lang);
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
    
    // Parse formatting like **bold text** to HTML
    let formattedText = text;
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formattedText = formattedText.replace(/\n/g, "<br>");
    
    if (sender === "oracle") {
      bubble.className = "chat-bubble oracle tarot-card";
      const cardTitle = getTranslation(state.lang || "fr", "oracle.card.title") || "L'Oracle du Ciel";
      bubble.innerHTML = `
        <div class="tarot-card-inner">
          <div class="tarot-card-header">
            <span class="tarot-arcana-symbol">✦</span>
            <span class="tarot-card-title">${cardTitle}</span>
            <span class="tarot-arcana-symbol">✦</span>
          </div>
          <div class="tarot-card-body">
            ${formattedText}
          </div>
        </div>
      `;
    } else {
      bubble.className = "chat-bubble user";
      bubble.innerHTML = formattedText;
    }
    
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
            astrologyData: astrologyData,
            lang: state.lang || "fr"
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
      console.warn("Oracle Edge Function error, falling back to client simulator:", e);
      try {
        const fallbackReply = await simulateOracleResponse(text);
        if (typingIndicator) typingIndicator.style.display = "none";
        addChatBubble("oracle", fallbackReply);
      } catch (fallbackErr) {
        console.error("Oracle fallback simulator failed:", fallbackErr);
        if (typingIndicator) typingIndicator.style.display = "none";
        const errMsg = state.lang === "en" 
          ? "The stars are currently clouded. Please try again in a few moments."
          : "Les cieux sont temporairement voilés. Veuillez réessayer dans quelques instants.";
        addChatBubble("oracle", errMsg);
      }
    }
  }

  // Smart Offline Oracle Response Simulator — Version enrichie avec toutes les données client
  async function simulateOracleResponse(userMessage) {
    const lang     = state.lang || "fr";
    const msgLower = userMessage.toLowerCase();

    // ── Données fondamentales du client ──
    const name        = (state.answers?.name)                          ? state.answers.name                          : (lang === "fr" ? "Âme Céleste" : "Celestial Soul");
    const birthPlace  = (state.answers?.birthPlace)                    ? state.answers.birthPlace                    : "";
    const relationship= (state.answers?.relationship)                  ? state.answers.relationship                  : "";
    const sun         = (state.report?.zodiac)                         ? state.report.zodiac.name                    : "Bélier";
    const sunSymbol   = (state.report?.zodiac)                         ? (state.report.zodiac.symbol || "♈")         : "♈";
    const moon        = (state.report?.moon)                           ? state.report.moon.name                      : "Cancer";
    const moonSymbol  = (state.report?.moon)                           ? (state.report.moon.symbol || "♋")           : "♋";
    const asc         = (state.report?.ascendant)                      ? state.report.ascendant                      : "Balance";
    const element     = (state.report?.zodiac?.element)                ? state.report.zodiac.element                 : "Eau";
    const blocker     = (state.report?.blocker)                        ? state.report.blocker                        : (lang === "fr" ? "la peur du changement" : "fear of change");
    const strength    = (state.report?.strength)                       ? state.report.strength                       : "";
    const gem         = (state.report?.luckyGemstone)                  ? state.report.luckyGemstone.name             : "Améthyste";
    const gemDesc     = (state.report?.luckyGemstone)                  ? state.report.luckyGemstone.desc             : (lang === "fr" ? "apporte clarté et protection" : "brings clarity and protection");
    const lifeNum     = (state.report?.lifePath)                       ? String(state.report.lifePath)               : "7";
    const energyProf  = (state.report?.energyProfile)                  ? state.report.energyProfile                  : "";

    // ── Contexte relationnel traduit ──
    const relCtx = (() => {
      if (!relationship || lang !== "fr") return "";
      const map = { single: "célibataire", couple: "en couple", married: "marié(e)", divorced: "divorcé(e)", widowed: "veuf(ve)", complicated: "dans une situation amoureuse complexe" };
      return map[relationship] || "";
    })();

    // ── Contexte lieu de naissance ──
    const birthCtx = birthPlace ? (lang === "fr" ? `né(e) à **${birthPlace}**` : `born in **${birthPlace}**`) : "";

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    // ── Follow-up questions variées ──
    const followUp = lang === "fr"
      ? pick([
          `\n\n*Souhaitez-vous explorer votre **vie amoureuse**, votre **chemin de vie** ou votre **gemme céleste** ?*`,
          `\n\n*N'hésitez pas à m'interroger sur votre **potentiel professionnel** ou vos **blocages énergétiques**.*`,
          `\n\n*Votre thème recèle encore bien des révélations… Quelle facette souhaitez-vous que l'Oracle illumine davantage ?*`,
          `\n\n*Votre énergie **${energyProf || sun}** porte encore bien des secrets. Posez-moi une autre question pour aller plus loin.*`,
          `\n\n*L'Oracle est là pour vous. Explorez vos **forces**, vos **blocages** ou votre **mission de vie** selon votre ressenti du moment.*`
        ])
      : pick([
          `\n\n*Want to explore your **love life**, **life path**, or **celestial stone**?*`,
          `\n\n*Ask me about your **career potential**, **main blockage**, or **spiritual mission**.*`,
          `\n\n*Your ${sun} energy holds more secrets. Ask another question to go deeper.*`
        ]);

    let response = "";

    // ══════════════════════════════════════════
    // AMOUR & RELATIONS
    // ══════════════════════════════════════════
    if (msgLower.includes("amour") || msgLower.includes("love") || msgLower.includes("relation") || msgLower.includes("couple") || msgLower.includes("rencontre") || msgLower.includes("cœur") || msgLower.includes("coeur") || msgLower.includes("partner") || msgLower.includes("romance")) {
      response = lang === "fr"
        ? pick([
            `**🌌 Révélation de l'Oracle — Amour & Union Sacrée**\n\nCher(ère) **${name}**${birthCtx ? `, ${birthCtx}` : ""}, votre Soleil en **${sun} ${sunSymbol}** insuffle une énergie vibrante à votre sphère relationnelle.${relCtx ? ` En tant qu'âme **${relCtx}**, vous traversez une phase particulière de votre parcours amoureux.` : ""} Votre Lune en **${moon} ${moonSymbol}** révèle un monde émotionnel profond — vous aimez avec une intensité que peu comprennent.\n\n**🔮 Analyse de votre Trinité Astrale**\n\nVotre blocage majeur **« ${blocker} »** agit comme un bouclier autour de votre cœur. Sous l'influence de votre Ascendant **${asc}**, vous projetez parfois une image d'indépendance alors qu'au fond, vous aspirez à une connexion totale. Votre élément **${element}** colore chaque échange émotionnel d'une intensité rare.\n\n**💎 Rituel de Guérison Amoureuse**\n\nL'Oracle vous recommande de vous connecter à votre pierre sacrée **${gem}** — ${gemDesc}. Placez-la sur votre chakra du cœur 11 minutes chaque soir et répétez : *« Je m'ouvre à l'amour authentique. Je mérite une connexion vraie. »*`,

            `**🌙 Guidance Cosmique — Le Cœur Étoilé de ${name}**\n\nL'alliance de votre Soleil **${sun} ${sunSymbol}** et de votre Lune **${moon} ${moonSymbol}** vous dote d'une sensibilité hors du commun.${relCtx ? ` Votre position **${relCtx}** actuelle cache des opportunités de transformation profonde.` : ""} Vous ressentez tout avec une acuité que peu d'êtres possèdent — c'est votre don et parfois votre fardeau.\n\n**🔮 Lecture de vos Nœuds Karmiques**\n\nLe défi karmique **« ${blocker} »** bloque la libre circulation de l'amour. Vénus, active dans le secteur de votre Ascendant **${asc}**, vous invite à poser des limites saines.${strength ? ` Votre force **${strength}** est votre plus grand atout pour aimer sans vous perdre.` : ""}\n\n**💎 Action Concrète de l'Oracle**\n\nVotre pierre **${gem}** amplifie vos capacités de connexion. Cette semaine, ayez une conversation honnête sur vos besoins réels — Vénus récompense le courage émotionnel.`
          ])
        : pick([
            `**✨ Oracle Guidance — Love & Sacred Union**\n\nDear **${name}**, Venus is transiting your **${asc}** Ascendant — a rare window of emotional authenticity.${relCtx ? ` As someone ${relCtx}, this transit holds special meaning for you.` : ""} Your Sun in **${sun}** craves genuine connection while your Moon in **${moon}** protects your inner world.\n\n**🔮 Cosmic Reading**\n\nYour blockage **"${blocker}"** builds an invisible wall. Your element **${element}** means love, when it flows, transforms everything. Wear your **${gem}** close to your heart this week.\n\n*The cosmos tells you: love doesn't search for you — it recognizes you.*`
          ]);
    }

    // ══════════════════════════════════════════
    // CARRIÈRE & ARGENT
    // ══════════════════════════════════════════
    else if (msgLower.includes("travail") || msgLower.includes("carrière") || msgLower.includes("career") || msgLower.includes("professionnel") || msgLower.includes("job") || msgLower.includes("boulot") || msgLower.includes("argent") || msgLower.includes("money") || msgLower.includes("réussite") || msgLower.includes("success")) {
      response = lang === "fr"
        ? pick([
            `**⭐ Guidance de l'Oracle — Carrière & Mission d'Incarnation**\n\nCher(ère) **${name}**${birthCtx ? `, ${birthCtx}` : ""}, votre Soleil en **${sun} ${sunSymbol}** est votre boussole de réussite. Votre Ascendant **${asc}** définit la façon dont le monde professionnel vous perçoit, tandis que votre chemin de vie **${lifeNum}** révèle votre destination ultime. Votre élément **${element}** oriente votre style de travail : ${element === "Feu" ? "vous êtes fait(e) pour initier, créer et inspirer" : element === "Terre" ? "vous excellez dans la construction et la matérialisation" : element === "Air" ? "votre intelligence et votre communication sont vos superpouvoirs" : "votre intuition et votre empathie sont vos dons professionnels"}.\n\n**🔮 Analyse Astrale Complète**\n\nJupiter favorise votre expansion, mais votre défi **« ${blocker} »** freine votre pleine expression.${strength ? ` Pourtant votre force **${strength}** est un levier puissant que vous sous-estimez.` : ""} Votre Lune en **${moon}** vous pousse parfois au doute — c'est un signal de croissance, non de limite.\n\n**💎 Rituel de Manifestation Professionnelle**\n\nChaque matin, tenez votre **${gem}** dans la main gauche, visualisez votre succès concret pendant 3 minutes, puis posez UNE action audacieuse dans les 48h. Jupiter récompense ceux qui osent.`,

            `**🌟 Révélation de l'Oracle — Votre Potentiel Caché**\n\n**${name}**, votre chemin de vie **${lifeNum}** révèle une âme née pour laisser une empreinte.${energyProf ? ` Votre profil **${energyProf}** porte une puissance créatrice rare.` : ""} Votre Soleil **${sun}** brûle d'ambition, mais votre Lune **${moon}** vous ramène parfois à la prudence — cette tension est votre richesse.\n\n**🔮 Les Obstacles selon votre Thème**\n\nLe blocage **« ${blocker} »** est votre épreuve initiatique professionnelle. Il n'est pas là pour vous arrêter, mais pour vous forcer à développer votre version la plus forte. Votre Ascendant **${asc}** vous donne les outils pour incarner cette version dès maintenant.\n\n**💎 Message de l'Oracle**\n\nPortez votre **${gem}** lors de vos moments de décision importants. Posez-vous cette question chaque matin : *« Quelle action, si je l'accomplissais aujourd'hui, changerait tout ? »* La réponse est votre prochaine étape.`
          ])
        : `**⭐ Oracle Guidance — Career & Soul Mission**\n\n**${name}**, your life path **${lifeNum}** reveals a soul built to create impact. Sun **${sun}**, Ascendant **${asc}** — you have rare leadership energy. Your blockage **"${blocker}"** is the final test before your breakthrough.\n\n**Action**: Meditate with your **${gem}** before every key decision. Jupiter rewards the brave.`;
    }

    // ══════════════════════════════════════════
    // BLOCAGES & PEURS
    // ══════════════════════════════════════════
    else if (msgLower.includes("blocage") || msgLower.includes("obstacle") || msgLower.includes("peur") || msgLower.includes("fear") || msgLower.includes("difficile") || msgLower.includes("aide") || msgLower.includes("surmonter") || msgLower.includes("stuck") || msgLower.includes("bloqué")) {
      response = lang === "fr"
        ? pick([
            `**🌑 Guidance de l'Oracle — Transmutation des Ombres**\n\nCher(ère) **${name}**${birthCtx ? `, ${birthCtx}` : ""}, le défi majeur inscrit dans votre thème natal est : **« ${blocker} »**. Ce n'est pas une faiblesse — c'est la clé de voûte de votre évolution. Votre Soleil **${sun} ${sunSymbol}** possède exactement la lumière nécessaire pour dissoudre cette ombre.\n\n**🔮 Lecture des Corps Subtils**\n\nVotre Lune en **${moon} ${moonSymbol}** conserve des mémoires émotionnelles qui alimentent ce blocage. Votre Ascendant **${asc}** a érigé des défenses pour vous protéger — mais ces murs sont devenus des prisons. Votre élément **${element}** vous donne la capacité naturelle de vous régénérer : ${element === "Feu" ? "utilisez cette force pour brûler ce qui vous retient" : element === "Terre" ? "ancrée-vous dans le concret pour dépasser l'abstrait de la peur" : element === "Air" ? "utilisez votre mental pour observer la peur sans vous identifier à elle" : "plongez dans vos émotions pour les traverser plutôt que les fuir"}.\n\n**💎 Protocole de Shadow Work**\n\nÀ la prochaine lune décroissante : écrivez votre blocage sur papier, brûlez-le avec intention. Portez votre **${gem}** — ${gemDesc} — quotidiennement pour stabiliser votre taux vibratoire pendant cette transition.`,

            `**💫 Message Profond de l'Oracle — La Clé Cachée**\n\n**${name}**, votre blocage **« ${blocker} »** est le déguisement de votre plus grande force.${strength ? ` Et votre force **${strength}** est la réponse directe à cette peur — elles sont les deux faces d'une même médaille.` : ""} L'univers n'a pas mis cette épreuve sur votre chemin par hasard.\n\n**🔮 Votre Triade de Puissance**\n\nSoleil **${sun}** + Lune **${moon}** + Ascendant **${asc}** : cette combinaison vous donne des ressources uniques pour traverser cette période. Votre chemin de vie **${lifeNum}** confirme que vous avez déjà surmonté des défis similaires dans d'autres cycles.\n\n**💎 Action Immédiate**\n\nTenez votre **${gem}** dans la main gauche. Posez-vous : *« Qu'est-ce que je gagnerais si cette peur n'existait plus ? »* La première réponse qui surgit est votre prochaine direction. L'Oracle vous confirme : vous en êtes capable.`
          ])
        : pick([
            `**🌑 Oracle — Shadow Transmutation**\n\n**${name}**, your blockage **"${blocker}"** is your most powerful growth zone in disguise. Sun **${sun}**, Moon **${moon}**, Ascendant **${asc}** — you have everything needed to overcome this.\n\n**Protocol**: Name it → ground with your **${gem}** → say daily: *"I choose growth over protection."* Saturn rewards persistence.`,
            `**💎 Oracle — The Hidden Key**\n\nYour Sun **${sun}** has the exact strength to dissolve **"${blocker}"**. Hold your **${gem}** and ask: *"What would I gain without this fear?"* The first answer is your next step. Trust it.`
          ]);
    }

    // ══════════════════════════════════════════
    // PIERRE / GEMME
    // ══════════════════════════════════════════
    else if (msgLower.includes("pierre") || msgLower.includes("gem") || msgLower.includes("cristal") || msgLower.includes("crystal") || msgLower.includes("minéral") || msgLower.includes("stone")) {
      response = lang === "fr"
        ? `**💠 Sagesse des Gemmes — Votre Alliance Minérale**\n\nCher(ère) **${name}**, le cosmos a associé à votre signature astrale — Soleil **${sun} ${sunSymbol}**, Lune **${moon} ${moonSymbol}**, Ascendant **${asc}** — la pierre sacrée du **${gem}**. Cette alliance n'est pas fortuite : ses vibrations entrent en résonance directe avec votre élément **${element}**.\n\n**🔮 Propriétés Spirituelles Spécifiques**\n\nLe **${gem}** ${gemDesc}. Pour vous en particulier, il agit comme un bouclier contre votre blocage **« ${blocker} »** et amplifie votre force **${strength || "naturelle"}**. Son énergie est parfaitement calibrée pour votre chemin de vie **${lifeNum}**.\n\n**💎 Rituel d'Activation Personnalisé**\n\nPlacez votre **${gem}** sous la Pleine Lune une nuit pour le recharger. Le matin, tenez-le contre votre plexus solaire 11 minutes en répétant : *« Je canalise la lumière du cosmos à travers mon être. Je suis aligné(e) avec ma mission. »*`
        : `**💠 Oracle — Gemstone Wisdom**\n\nYour celestial stone **${gem}** — ${gemDesc} — was chosen by the cosmos to match your Sun **${sun}**, Moon **${moon}**, Ascendant **${asc}** signature. It's your direct shield against **"${blocker}"** and amplifier of your natural gifts.\n\n**Ritual**: Hold it on your heart chakra for 11 minutes at each New Moon. Repeat: *"I receive the light of my soul."*`;
    }

    // ══════════════════════════════════════════
    // SANTÉ & ÉNERGIE
    // ══════════════════════════════════════════
    else if (msgLower.includes("santé") || msgLower.includes("énergie") || msgLower.includes("fatigue") || msgLower.includes("corps") || msgLower.includes("health") || msgLower.includes("energy") || msgLower.includes("sommeil") || msgLower.includes("sleep") || msgLower.includes("stress")) {
      response = lang === "fr"
        ? `**🌿 Guidance de l'Oracle — Vitalité Céleste & Corps Sacré**\n\nCher(ère) **${name}**${birthCtx ? `, ${birthCtx}` : ""}, votre corps est le temple de votre incarnation. Votre Soleil **${sun} ${sunSymbol}** gouverne votre vitalité globale, votre Lune **${moon} ${moonSymbol}** gère votre équilibre émotionnel et psychosomatique. Les tensions que vous ressentez sont des messages de votre âme — pas des faiblesses.\n\n**🔮 Diagnostic Énergétique**\n\nVotre blocage **« ${blocker} »** crée des stagnations dans vos corps subtils. Votre élément **${element}** indique que vous vous ressourcez particulièrement : ${element === "Feu" ? "au soleil, dans le mouvement et la créativité" : element === "Terre" ? "dans la nature, le contact avec la terre et les routines stables" : element === "Air" ? "dans l'échange, la lecture et les espaces ouverts" : "près de l'eau, dans le silence et la méditation"}. Honorez ce besoin.\n\n**💎 Protocole de Soin Holistique**\n\nBain de sel une fois par semaine pour libérer les énergies accumulées. Portez votre **${gem}** lors de vos temps de repos — ${gemDesc}. 10 minutes chaque matin les pieds sur la terre nue si possible, pour réaligner vos biorhythmes avec ceux de Gaïa.`
        : `**🌿 Oracle — Vitality & Sacred Body**\n\n**${name}**, your Moon **${moon}** means inner conflict manifests physically before the mind understands it. Your element **${element}** shows how you recharge. Your **${gem}** is your ally during recovery.\n\n**Protocol**: 10 minutes in nature daily, water with intention, and wear your **${gem}** during rest. The body speaks in whispers before it screams.`;
    }

    // ══════════════════════════════════════════
    // SPIRITUALITÉ & ÂME
    // ══════════════════════════════════════════
    else if (msgLower.includes("spirit") || msgLower.includes("âme") || msgLower.includes("chemin") || msgLower.includes("destin") || msgLower.includes("soul") || msgLower.includes("mission") || msgLower.includes("éveil") || msgLower.includes("karma") || msgLower.includes("purpose")) {
      response = lang === "fr"
        ? `**🌌 Guidance Profonde — Alignement Céleste & Mission de l'Âme**\n\nCher(ère) **${name}**${birthCtx ? `, ${birthCtx}` : ""}${energyProf ? ` — profil **${energyProf}**` : ""}, votre chemin de vie **${lifeNum}** est la signature sacrée de votre incarnation. Il révèle pourquoi vous êtes ici. Votre Soleil **${sun} ${sunSymbol}** est votre boussole de lumière, votre Lune **${moon} ${moonSymbol}** votre source d'intuition divine, et votre Ascendant **${asc}** la façon dont vous incarnez votre mission aux yeux du monde.\n\n**🔮 L'Épreuve Initiatique**\n\nPour avancer sur cette voie sacrée, vous devez transmuter : **« ${blocker} »**. Ce n'est pas un obstacle — c'est le portail.${strength ? ` Votre force **${strength}** est la lanterne pour traverser ce tunnel.` : ""} Votre élément **${element}** vous donne la capacité de renaître : chaque fin de cycle est une invitation à votre prochaine version.\n\n**💎 Pratique de Centrage**\n\nAsseyez-vous en silence, votre **${gem}** dans les mains. Visualisez une colonne de lumière dorée qui vous traverse de la couronne jusqu'au centre de la Terre. Répétez : *« Je suis aligné(e) avec mon plan divin originel. Ma présence sur Terre a un sens. »*`
        : `**🌌 Oracle — Soul Path & Mission**\n\n**${name}**, life path **${lifeNum}** is permanent. Sun **${sun}**, Moon **${moon}**, Ascendant **${asc}** — aligned, they create a rare spiritual signature. Your blockage **"${blocker}"** is the initiatory test before your true mission unfolds.\n\n*The Oracle asks: What would you do if you knew you couldn't fail? That answer is your next cosmic step.*\n\nHold your **${gem}** and let the answer come.`;
    }

    // ══════════════════════════════════════════
    // RÉPONSE GÉNÉRALE ENRICHIE
    // ══════════════════════════════════════════
    else {
      response = lang === "fr"
        ? pick([
            `**🔮 Révélation de l'Oracle — Votre Portrait Cosmique Complet**\n\nCher(ère) **${name}**${birthCtx ? `, ${birthCtx}` : ""}${relCtx ? `, actuellement **${relCtx}**` : ""}, les gardiens du ciel entendent votre appel. Votre triade sacrée — Soleil **${sun} ${sunSymbol}**, Lune **${moon} ${moonSymbol}**, Ascendant **${asc}** — dessine une âme en plein portail de transformation. Votre élément **${element}** et votre chemin de vie **${lifeNum}** confirment que vous êtes exactement où vous devez être.\n\n**🔮 Ce que l'Oracle lit dans votre Thème**\n\nVotre défi actuel : **« ${blocker} »**. Votre force naturelle : **${strength || "votre intuition et votre résilience"}**. Ces deux polarités coexistent en vous — l'une pousse, l'autre retient. La maîtrise de votre vie commence quand vous apprenez à les réconcilier.\n\n**💎 Guidance Immédiate**\n\nVotre pierre céleste **${gem}** — ${gemDesc} — est votre alliée de transition. Portez-la, méditez avec elle. Posez-moi une question sur votre **amour**, votre **carrière**, votre **santé** ou votre **chemin spirituel** — l'Oracle est là pour vous éclairer.`,

            `**✨ L'Oracle Parle — Message Personnel pour ${name}**\n\nJe lis dans votre signature astrale${energyProf ? ` **${energyProf}**` : ""} une âme d'une profondeur rare. Votre Soleil **${sun}** vous pousse vers l'affirmation de votre unicité. Votre Lune **${moon}** vous enveloppe d'une richesse émotionnelle que peu comprennent.${birthCtx ? ` L'énergie de **${birthPlace}** a marqué votre âme.` : ""} Trouver l'équilibre entre ces forces est votre œuvre de vie.\n\n**🔮 Le Message Essentiel**\n\nLe blocage **« ${blocker} »** est l'épreuve choisie par votre âme pour ce cycle terrestre. En le traversant grâce à la lumière de votre Ascendant **${asc}**, vous débloquez un potentiel de manifestation insoupçonné — spirituel ET matériel.\n\n**💎 Action Concrète**\n\nPortez votre **${gem}** sur vous cette semaine. Quel aspect de votre vie souhaitez-vous que l'Oracle éclaire ? L'**amour**, la **carrière**, la **santé** ou votre **mission d'âme** ?`
          ])
        : pick([
            `**🔮 Oracle Reading — ${name}'s Cosmic Portrait**\n\nYour triad — Sun **${sun}**, Moon **${moon}**, Ascendant **${asc}** — tells me you're in a deep integration portal. Element **${element}**, life path **${lifeNum}**. Your blockage **"${blocker}"** is the final test. Your **${gem}** is your bridge.\n\nAsk me about your **love life**, **career**, **health**, or **soul mission**.`,
            `**✨ The Oracle speaks to ${name}**\n\nSun **${sun}** pushes you toward light. Moon **${moon}** calls you inward. Ascendant **${asc}** shows the world your potential. This tension is your greatest richness.\n\nYour **${gem}** — ${gemDesc} — helps you navigate both worlds. What do you want to explore?`
          ]);
    }

    // Délai réaliste selon la longueur de la réponse (2s–5s)
    const typingDelay = Math.min(2000 + response.length * 3, 5000);
    await new Promise(resolve => setTimeout(resolve, typingDelay));

    return response + followUp;
  }

  function setupGoogleAutocomplete(inputElement, onSelectCallback) {
    if (!window.google || !window.google.maps || !window.google.maps.places) return;
    
    // Prevent default submission when pressing enter key in Google Autocomplete input
    inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    });

    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      types: ['(cities)']
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place && place.geometry && place.geometry.location) {
        onSelectCallback(place);
      }
    });
  }

  // --- CARTE DU JOUR ---
  // 36 oracle cards with French + English affirmations, symbol, name, keywords
  const ORACLE_CARDS = [
    { symbol: "🌕", name_fr: "La Pleine Lune", name_en: "The Full Moon", affirmation_fr: "Je libère ce qui ne me sert plus. Ma lumière intérieure brille sans retenue.", affirmation_en: "I release what no longer serves me. My inner light shines without restraint.", keywords_fr: ["Libération", "Lumière", "Plénitude"], keywords_en: ["Release", "Light", "Fullness"] },
    { symbol: "🌑", name_fr: "La Nouvelle Lune", name_en: "The New Moon", affirmation_fr: "Je plante les graines de mes désirs. Un nouveau cycle commence.", affirmation_en: "I plant the seeds of my desires. A new cycle begins.", keywords_fr: ["Nouveau départ", "Intention", "Création"], keywords_en: ["New start", "Intention", "Creation"] },
    { symbol: "⭐", name_fr: "L'Étoile Guide", name_en: "The Guiding Star", affirmation_fr: "Je suis guidé(e) par la lumière de mon âme. Mon chemin s'illumine devant moi.", affirmation_en: "I am guided by the light of my soul. My path illuminates before me.", keywords_fr: ["Guidance", "Espoir", "Direction"], keywords_en: ["Guidance", "Hope", "Direction"] },
    { symbol: "☀️", name_fr: "Le Soleil Radieux", name_en: "The Radiant Sun", affirmation_fr: "Je rayonne d'énergie positive. Ma joie est contagieuse et transformatrice.", affirmation_en: "I radiate positive energy. My joy is contagious and transformative.", keywords_fr: ["Joie", "Énergie", "Vitalité"], keywords_en: ["Joy", "Energy", "Vitality"] },
    { symbol: "🌊", name_fr: "Les Eaux Sacrées", name_en: "The Sacred Waters", affirmation_fr: "Je flue avec la vie. Mes émotions sont ma force et mon intelligence.", affirmation_en: "I flow with life. My emotions are my strength and my intelligence.", keywords_fr: ["Fluidité", "Émotion", "Intuition"], keywords_en: ["Flow", "Emotion", "Intuition"] },
    { symbol: "🔥", name_fr: "La Flamme Sacrée", name_en: "The Sacred Flame", affirmation_fr: "Je brûle d'une passion qui me propulse vers mon but. Mon feu intérieur est inextinguible.", affirmation_en: "I burn with a passion that propels me toward my purpose. My inner fire is inextinguishable.", keywords_fr: ["Passion", "Courage", "Transformation"], keywords_en: ["Passion", "Courage", "Transformation"] },
    { symbol: "🌿", name_fr: "La Nature Vivante", name_en: "Living Nature", affirmation_fr: "Je m'ancre dans le présent. Je grandis naturellement vers la lumière.", affirmation_en: "I am rooted in the present. I grow naturally toward the light.", keywords_fr: ["Ancrage", "Croissance", "Patience"], keywords_en: ["Grounding", "Growth", "Patience"] },
    { symbol: "🦋", name_fr: "La Métamorphose", name_en: "The Metamorphosis", affirmation_fr: "Je suis en pleine transformation. Ce changement me révèle ma vraie beauté.", affirmation_en: "I am in full transformation. This change reveals my true beauty.", keywords_fr: ["Changement", "Beauté", "Renouveau"], keywords_en: ["Change", "Beauty", "Renewal"] },
    { symbol: "💎", name_fr: "Le Cristal de Clarté", name_en: "The Crystal of Clarity", affirmation_fr: "Ma vision est claire. Je prends mes décisions avec sagesse et discernement.", affirmation_en: "My vision is clear. I make my decisions with wisdom and discernment.", keywords_fr: ["Clarté", "Sagesse", "Décision"], keywords_en: ["Clarity", "Wisdom", "Decision"] },
    { symbol: "🌈", name_fr: "L'Arc-en-Ciel de l'Espoir", name_en: "The Rainbow of Hope", affirmation_fr: "Après chaque tempête, la lumière revient. Mon avenir est radieux.", affirmation_en: "After every storm, the light returns. My future is radiant.", keywords_fr: ["Espoir", "Promesse", "Joie"], keywords_en: ["Hope", "Promise", "Joy"] },
    { symbol: "🕊️", name_fr: "La Paix Intérieure", name_en: "Inner Peace", affirmation_fr: "Je choisis la paix. Mon calme intérieur est ma force la plus puissante.", affirmation_en: "I choose peace. My inner calm is my most powerful strength.", keywords_fr: ["Paix", "Sérénité", "Harmonie"], keywords_en: ["Peace", "Serenity", "Harmony"] },
    { symbol: "🦅", name_fr: "L'Aigle Royal", name_en: "The Royal Eagle", affirmation_fr: "Je prends de la hauteur. Je vois les choses dans leur totalité avec lucidité.", affirmation_en: "I rise above. I see things in their entirety with clarity.", keywords_fr: ["Perspective", "Liberté", "Vision"], keywords_en: ["Perspective", "Freedom", "Vision"] },
    { symbol: "🌸", name_fr: "La Fleur de l'Éveil", name_en: "The Awakening Flower", affirmation_fr: "Je m'ouvre doucement à ce que la vie m'offre. Je mérite la douceur.", affirmation_en: "I gently open to what life offers me. I deserve gentleness.", keywords_fr: ["Ouverture", "Douceur", "Grâce"], keywords_en: ["Openness", "Gentleness", "Grace"] },
    { symbol: "⚡", name_fr: "L'Éclair de l'Intuition", name_en: "The Lightning of Intuition", affirmation_fr: "Mon intuition est un GPS cosmique. Je fais confiance à mes premières impressions.", affirmation_en: "My intuition is a cosmic GPS. I trust my first impressions.", keywords_fr: ["Intuition", "Rapidité", "Révélation"], keywords_en: ["Intuition", "Speed", "Revelation"] },
    { symbol: "🌺", name_fr: "L'Amour en Bloom", name_en: "Love in Bloom", affirmation_fr: "Je suis un être d'amour. Je donne et je reçois l'amour librement.", affirmation_en: "I am a being of love. I give and receive love freely.", keywords_fr: ["Amour", "Ouverture", "Réciprocité"], keywords_en: ["Love", "Openness", "Reciprocity"] },
    { symbol: "🔮", name_fr: "La Boule de Cristal", name_en: "The Crystal Ball", affirmation_fr: "Je vois au-delà des apparences. Le mystère de demain m'inspire, pas m'effraie.", affirmation_en: "I see beyond appearances. The mystery of tomorrow inspires me, not frightens me.", keywords_fr: ["Mystère", "Prescience", "Confiance"], keywords_en: ["Mystery", "Foresight", "Trust"] },
    { symbol: "🌙", name_fr: "Le Croissant Magique", name_en: "The Magic Crescent", affirmation_fr: "Je cultive ma magie intérieure. La nuit est mon espace de sagesse et de rêve.", affirmation_en: "I cultivate my inner magic. The night is my space of wisdom and dreams.", keywords_fr: ["Magie", "Rêve", "Féminité"], keywords_en: ["Magic", "Dream", "Femininity"] },
    { symbol: "🏔️", name_fr: "La Montagne Sacrée", name_en: "The Sacred Mountain", affirmation_fr: "Je suis solide comme la montagne. Ma détermination surmonte tous les obstacles.", affirmation_en: "I am solid as the mountain. My determination overcomes all obstacles.", keywords_fr: ["Force", "Stabilité", "Persévérance"], keywords_en: ["Strength", "Stability", "Perseverance"] },
    { symbol: "🐺", name_fr: "Le Loup de Minuit", name_en: "The Midnight Wolf", affirmation_fr: "J'honore mon instinct. Ma nature sauvage est ma vérité la plus profonde.", affirmation_en: "I honor my instinct. My wild nature is my deepest truth.", keywords_fr: ["Instinct", "Loyauté", "Authenticité"], keywords_en: ["Instinct", "Loyalty", "Authenticity"] },
    { symbol: "🌟", name_fr: "L'Étoile Filante", name_en: "The Shooting Star", affirmation_fr: "Mon désir le plus profond est en route de se réaliser. Je reste ouvert(e) aux miracles.", affirmation_en: "My deepest desire is on its way to materializing. I remain open to miracles.", keywords_fr: ["Vœu", "Manifestation", "Miracle"], keywords_en: ["Wish", "Manifestation", "Miracle"] },
    { symbol: "🧿", name_fr: "L'Œil de Protection", name_en: "The Eye of Protection", affirmation_fr: "Je suis protégé(e) par l'univers. Je libère mes peurs et avance confiant(e).", affirmation_en: "I am protected by the universe. I release my fears and move forward confident.", keywords_fr: ["Protection", "Confiance", "Libération"], keywords_en: ["Protection", "Confidence", "Release"] },
    { symbol: "🌀", name_fr: "La Spirale de l'Évolution", name_en: "The Spiral of Evolution", affirmation_fr: "Chaque expérience me fait grandir. Je tourne en spirale vers ma meilleure version.", affirmation_en: "Every experience makes me grow. I spiral toward my best version.", keywords_fr: ["Évolution", "Croissance", "Sagesse"], keywords_en: ["Evolution", "Growth", "Wisdom"] },
    { symbol: "🦁", name_fr: "Le Lion du Courage", name_en: "The Lion of Courage", affirmation_fr: "Je porte en moi une force extraordinaire. J'agis avec courage et bienveillance.", affirmation_en: "I carry extraordinary strength within me. I act with courage and kindness.", keywords_fr: ["Courage", "Leadership", "Noblesse"], keywords_en: ["Courage", "Leadership", "Nobility"] },
    { symbol: "🌊", name_fr: "Le Flux de l'Abondance", name_en: "The Flow of Abundance", affirmation_fr: "L'abondance coule naturellement dans ma vie. Je reçois avec gratitude.", affirmation_en: "Abundance flows naturally into my life. I receive with gratitude.", keywords_fr: ["Abondance", "Gratitude", "Prospérité"], keywords_en: ["Abundance", "Gratitude", "Prosperity"] },
    { symbol: "🦉", name_fr: "La Sagesse du Hibou", name_en: "The Owl's Wisdom", affirmation_fr: "Je possède la sagesse pour naviguer dans l'obscurité. Je vois la vérité clairement.", affirmation_en: "I possess the wisdom to navigate darkness. I see truth clearly.", keywords_fr: ["Sagesse", "Perspicacité", "Vérité"], keywords_en: ["Wisdom", "Insight", "Truth"] },
    { symbol: "🌱", name_fr: "La Graine de Potentiel", name_en: "The Seed of Potential", affirmation_fr: "En moi sommeille un potentiel immense. Ce moment est parfait pour commencer.", affirmation_en: "Immense potential sleeps within me. This moment is perfect to begin.", keywords_fr: ["Potentiel", "Commencement", "Possibilité"], keywords_en: ["Potential", "Beginning", "Possibility"] },
    { symbol: "🕯️", name_fr: "La Flamme de l'Espoir", name_en: "The Flame of Hope", affirmation_fr: "Même dans l'obscurité, je garde ma flamme allumée. Mon espoir est indéfectible.", affirmation_en: "Even in darkness, I keep my flame lit. My hope is unwavering.", keywords_fr: ["Espoir", "Résilience", "Lumière"], keywords_en: ["Hope", "Resilience", "Light"] },
    { symbol: "🐬", name_fr: "La Joie du Dauphin", name_en: "The Dolphin's Joy", affirmation_fr: "Je me permets de jouer et de rire. La légèreté est une forme de sagesse.", affirmation_en: "I allow myself to play and laugh. Lightness is a form of wisdom.", keywords_fr: ["Joie", "Légèreté", "Playfulness"], keywords_en: ["Joy", "Lightness", "Playfulness"] },
    { symbol: "🏺", name_fr: "Le Vase de l'Âme", name_en: "The Vessel of the Soul", affirmation_fr: "Je prends soin de mon intérieur. Je remplis mon vase de ce qui me nourrit vraiment.", affirmation_en: "I take care of my inner self. I fill my vessel with what truly nourishes me.", keywords_fr: ["Soin de soi", "Nourriture", "Intériorité"], keywords_en: ["Self-care", "Nourishment", "Interiority"] },
    { symbol: "🌤️", name_fr: "L'Après-Tempête", name_en: "After the Storm", affirmation_fr: "Le ciel s'éclaircit après chaque épreuve. La clarté arrive à qui sait attendre.", affirmation_en: "The sky clears after every trial. Clarity comes to those who know how to wait.", keywords_fr: ["Patience", "Clarté", "Renouveau"], keywords_en: ["Patience", "Clarity", "Renewal"] },
    { symbol: "🎴", name_fr: "La Carte du Destin", name_en: "The Card of Destiny", affirmation_fr: "Mon destin se construit à chaque choix. Aujourd'hui, je choisis consciemment.", affirmation_en: "My destiny is built with every choice. Today, I choose consciously.", keywords_fr: ["Destin", "Choix", "Conscience"], keywords_en: ["Destiny", "Choice", "Consciousness"] },
    { symbol: "✨", name_fr: "La Pluie d'Étoiles", name_en: "The Stardust Rain", affirmation_fr: "Je suis fait(e) de poussière d'étoiles. Ma nature cosmique me connecte à l'infini.", affirmation_en: "I am made of stardust. My cosmic nature connects me to infinity.", keywords_fr: ["Cosmique", "Connexion", "Infini"], keywords_en: ["Cosmic", "Connection", "Infinity"] },
    { symbol: "🌺", name_fr: "Le Lotus de la Renaissance", name_en: "The Lotus of Rebirth", affirmation_fr: "Je renais de mes propres cendres, plus fort(e) et plus sage. Chaque fin est un nouveau départ.", affirmation_en: "I rise from my own ashes, stronger and wiser. Every ending is a new beginning.", keywords_fr: ["Renaissance", "Résilience", "Force"], keywords_en: ["Rebirth", "Resilience", "Strength"] },
    { symbol: "🌙", name_fr: "Le Voile du Mystère", name_en: "The Veil of Mystery", affirmation_fr: "Ce que je ne comprends pas encore me sera révélé au bon moment. Je fais confiance au timing divin.", affirmation_en: "What I do not yet understand will be revealed at the right moment. I trust divine timing.", keywords_fr: ["Mystère", "Confiance", "Timing"], keywords_en: ["Mystery", "Trust", "Timing"] },
    { symbol: "💫", name_fr: "Le Tourbillon Cosmique", name_en: "The Cosmic Whirl", affirmation_fr: "Je suis au centre de ma propre galaxie. Tout gravite autour de mon énergie.", affirmation_en: "I am at the center of my own galaxy. Everything revolves around my energy.", keywords_fr: ["Énergie", "Centre", "Magnétisme"], keywords_en: ["Energy", "Center", "Magnetism"] },
    { symbol: "🌴", name_fr: "La Palme de la Victoire", name_en: "The Palm of Victory", affirmation_fr: "J'ai tout ce qu'il me faut pour réussir. Ma persévérance porte ses fruits aujourd'hui.", affirmation_en: "I have everything I need to succeed. My perseverance bears fruit today.", keywords_fr: ["Victoire", "Réussite", "Persévérance"], keywords_en: ["Victory", "Success", "Perseverance"] }
  ];

  function getTodayKey() {
    const d = new Date();
    return `carte_du_jour_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
  }

  function getTodayCardIndex() {
    // Deterministic daily card: derive from date + user name for personalisation
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const name = (state.answers && state.answers.name) ? state.answers.name : "moon";
    let nameVal = 0;
    for (let i = 0; i < name.length; i++) nameVal += name.charCodeAt(i);
    return (seed + nameVal) % ORACLE_CARDS.length;
  }

  function formatDateFr(d) {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function formatDateEn(d) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function initCarteDuJour() {
    const lang = state.lang || "fr";
    const today = new Date();
    const dateEl = document.getElementById("carte-date-display");
    const todayKey = getTodayKey();
    const journalKey = `${todayKey}_journal`;

    // Fill date
    if (dateEl) {
      dateEl.textContent = lang === "en" ? formatDateEn(today) : formatDateFr(today);
    }

    const cardIndex = getTodayCardIndex();
    const card = ORACLE_CARDS[cardIndex];

    // Helper to fill card data
    const fillCardData = (container) => {
      if (!container) return;
      const symbolEl = container.querySelector(".carte-symbol");
      const nameEl = container.querySelector(".carte-name");
      const affirmEl = container.querySelector(".carte-affirmation");
      const keywordRow = container.querySelector(".carte-keyword-row");

      if (symbolEl) symbolEl.textContent = card.symbol;
      if (nameEl) nameEl.textContent = lang === "en" ? card.name_en : card.name_fr;
      if (affirmEl) affirmEl.textContent = lang === "en" ? card.affirmation_en : card.affirmation_fr;
      if (keywordRow) {
        keywordRow.innerHTML = "";
        const keywords = lang === "en" ? card.keywords_en : card.keywords_fr;
        keywords.forEach(kw => {
          const pill = document.createElement("span");
          pill.className = "carte-keyword-pill";
          pill.textContent = kw;
          keywordRow.appendChild(pill);
        });
      }
    };

    // Fill all cards (main one + the 3 deck cards)
    fillCardData(document.getElementById("carte-card"));
    document.querySelectorAll(".carte-deck-scene").forEach(fillCardData);

    // Clone interactive elements to clear existing listeners
    const deckEl = document.getElementById("carte-deck");
    let newDeck = null;
    if (deckEl) {
      newDeck = deckEl.cloneNode(true);
      deckEl.parentNode.replaceChild(newDeck, deckEl);
    }

    const sceneEl = document.getElementById("carte-scene");
    let newScene = null;
    if (sceneEl) {
      newScene = sceneEl.cloneNode(true);
      sceneEl.parentNode.replaceChild(newScene, sceneEl);
    }

    const btnDraw = document.getElementById("btn-draw-carte");
    let newBtn = null;
    if (btnDraw) {
      newBtn = btnDraw.cloneNode(true);
      btnDraw.parentNode.replaceChild(newBtn, btnDraw);
    }

    const btnSave = document.getElementById("btn-save-carte-journal");
    let newSaveBtn = null;
    if (btnSave) {
      newSaveBtn = btnSave.cloneNode(true);
      btnSave.parentNode.replaceChild(newSaveBtn, btnSave);
    }

    // Now query the active DOM elements after replacements
    const currentDeckEl = document.getElementById("carte-deck");
    const currentCardEl = document.getElementById("carte-card");
    const currentSceneEl = document.getElementById("carte-scene");
    const currentActionsEl = document.getElementById("carte-actions");
    const currentReflectionEl = document.getElementById("carte-reflection-panel");
    const currentAlreadyEl = document.getElementById("carte-already-drawn");
    const currentNavDot = document.getElementById("nav-carte-dot");

    // Check if already drawn today
    const alreadyDrawn = !!safeStorage.getItem(todayKey);

    if (alreadyDrawn) {
      // Show card flipped, hide deck, hide button, show already drawn notice and reflection
      if (currentCardEl) currentCardEl.classList.add("flipped");
      if (currentSceneEl) currentSceneEl.style.display = "block";
      if (currentDeckEl) currentDeckEl.style.display = "none";
      if (currentActionsEl) currentActionsEl.style.display = "none";
      if (currentAlreadyEl) currentAlreadyEl.style.display = "block";
      if (currentReflectionEl) {
        currentReflectionEl.style.display = "block";
        const savedJournal = safeStorage.getItem(journalKey) || "";
        const textarea = document.getElementById("carte-journal-entry");
        if (textarea && savedJournal) textarea.value = savedJournal;
      }
      if (currentNavDot) currentNavDot.classList.remove("visible");
    } else {
      // Show deck, hide single card scene, show draw button
      if (currentCardEl) currentCardEl.classList.remove("flipped");
      if (currentSceneEl) currentSceneEl.style.display = "none";
      if (currentDeckEl) {
        currentDeckEl.style.display = "flex";
        // Reset styles for all deck scenes in case they were animated
        const deckScenes = currentDeckEl.querySelectorAll(".carte-deck-scene");
        deckScenes.forEach(scene => {
          scene.style.opacity = "";
          scene.style.transform = "";
          scene.style.pointerEvents = "";
          const innerCard = scene.querySelector(".carte-card");
          if (innerCard) innerCard.style.transform = "";
        });
      }
      if (currentActionsEl) currentActionsEl.style.display = "flex";
      if (currentAlreadyEl) currentAlreadyEl.style.display = "none";
      if (currentReflectionEl) currentReflectionEl.style.display = "none";
      if (currentNavDot) currentNavDot.classList.add("visible");
    }

    // Interactive card pull handler (shared function)
    const pullCardAnimation = (chosenSceneIndex) => {
      if (!currentDeckEl) return;
      const scenes = Array.from(currentDeckEl.querySelectorAll(".carte-deck-scene"));
      const chosenScene = scenes[chosenSceneIndex] || scenes[1]; // default to center card if index is invalid
      const otherScenes = scenes.filter((_, idx) => idx !== chosenSceneIndex);

      showToast("Tirage en cours... 🌌");
      
      // Store drawn today
      safeStorage.setItem(todayKey, "1");

      if (window.gsap) {
        // Step 1: Fade out unchosen cards and slide them down
        gsap.to(otherScenes, {
          opacity: 0,
          y: 100,
          scale: 0.7,
          duration: 0.5,
          ease: "power2.in",
          pointerEvents: "none"
        });

        // Step 2: Animate chosen card to the center and rotate to 0deg, and scale it up
        const chosenCardInner = chosenScene.querySelector(".carte-card");
        
        // Disable pointer events to prevent double click
        scenes.forEach(s => s.style.pointerEvents = "none");
        if (currentActionsEl) currentActionsEl.style.display = "none";

        const tl = gsap.timeline({
          onComplete: () => {
            // After flip animation completes, show popup and reflection
            setTimeout(() => {
              showCartePopup(card, lang);
              initCarteDuJour();
            }, 600);
          }
        });

        // Animate chosen scene to center
        tl.to(chosenScene, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1.15,
          zIndex: 10,
          duration: 0.7,
          ease: "power2.out"
        });

        // Flip the chosen card
        tl.to(chosenCardInner, {
          rotationY: 180,
          duration: 0.8,
          ease: "back.out(1.2)"
        }, "-=0.2");

      } else {
        // Fallback if GSAP is not loaded
        if (currentCardEl) currentCardEl.classList.add("flipped");
        if (currentSceneEl) currentSceneEl.style.display = "block";
        if (currentDeckEl) currentDeckEl.style.display = "none";
        if (currentActionsEl) currentActionsEl.style.display = "none";
        setTimeout(() => {
          showCartePopup(card, lang);
          initCarteDuJour();
        }, 850);
      }
    };

    // Attach listeners to all deck scenes
    if (newDeck) {
      const scenes = newDeck.querySelectorAll(".carte-deck-scene");
      scenes.forEach((scene, index) => {
        scene.addEventListener("click", (e) => {
          e.stopPropagation();
          pullCardAnimation(index);
        });
      });
    }

    // Draw button handler
    if (newBtn) {
      newBtn.addEventListener("click", () => {
        // Pull center card (index 1)
        pullCardAnimation(1);
      });
    }

    // Save journal entry
    if (newSaveBtn) {
      newSaveBtn.addEventListener("click", () => {
        const textarea = document.getElementById("carte-journal-entry");
        if (!textarea) return;
        safeStorage.setItem(journalKey, textarea.value);
        showToast(getTranslation(lang, "carte.saved"));
      });
    }
  }

  // --- POPUP CARTE DU JOUR ---
  function showCartePopup(card, lang) {
    const overlay   = document.getElementById("carte-popup-overlay");
    const symbolEl  = document.getElementById("carte-popup-symbol");
    const nameEl    = document.getElementById("carte-popup-card-name");
    const affirmEl  = document.getElementById("carte-popup-affirmation");
    const keywordsEl= document.getElementById("carte-popup-keywords");
    const closeBtn  = document.getElementById("carte-popup-close");
    const ctaBtn    = document.getElementById("carte-popup-btn");
    const labelEl   = overlay ? overlay.querySelector(".carte-popup-label") : null;

    if (!overlay || !card) return;

    // Populate content
    if (symbolEl)  symbolEl.textContent  = card.symbol;
    if (nameEl)    nameEl.textContent    = lang === "en" ? card.name_en    : card.name_fr;
    if (affirmEl)  affirmEl.textContent  = lang === "en" ? card.affirmation_en : card.affirmation_fr;
    if (labelEl)   labelEl.textContent   = lang === "en" ? "✦ Your Message of the Day ✦" : "✦ Votre Message du Jour ✦";
    if (ctaBtn)    ctaBtn.textContent    = lang === "en" ? "Receive this message" : "Recevoir ce message";

    if (keywordsEl) {
      keywordsEl.innerHTML = "";
      const kws = lang === "en" ? card.keywords_en : card.keywords_fr;
      kws.forEach(kw => {
        const pill = document.createElement("span");
        pill.className = "carte-keyword-pill";
        pill.textContent = kw;
        keywordsEl.appendChild(pill);
      });
    }

    // Show overlay
    overlay.style.display = "flex";
    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Close handlers
    const closePopup = () => {
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.25s ease";
      setTimeout(() => {
        overlay.style.display  = "none";
        overlay.style.opacity  = "";
        overlay.style.transition = "";
        document.body.style.overflow = "";
      }, 250);
    };

    if (closeBtn) {
      const newClose = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newClose, closeBtn);
      newClose.addEventListener("click", closePopup);
    }

    if (ctaBtn) {
      const newCta = ctaBtn.cloneNode(true);
      ctaBtn.parentNode.replaceChild(newCta, ctaBtn);
      newCta.addEventListener("click", closePopup);
    }

    // Close on overlay click (outside modal)
    const newOverlay = overlay.cloneNode(false);
    // Instead of replacing the overlay, just add a one-time click handler
    overlay.addEventListener("click", function handleOverlayClick(e) {
      if (e.target === overlay) {
        closePopup();
        overlay.removeEventListener("click", handleOverlayClick);
      }
    });

    // Close on Escape key
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closePopup();
        document.removeEventListener("keydown", handleEsc);
      }
    };
    document.addEventListener("keydown", handleEsc);
  }


  // Check nav dot on init
  function updateCarteDot() {
    const navDot = document.getElementById("nav-carte-dot");
    if (!navDot) return;
    const todayKey = getTodayKey();
    const drawn = !!safeStorage.getItem(todayKey);
    if (!drawn && state.isLoggedIn && state.answers && state.answers.name) {
      navDot.classList.add("visible");
    } else {
      navDot.classList.remove("visible");
    }
  }

  // --- INITIALIZE APPLICATION STATE ---
  loadState();
  const initialLang = safeStorage.getItem("moon_astro_lang") || "fr";
  state.lang = initialLang;
  updateCarteDot();
  translatePage(initialLang); // Run translation and routing immediately on load
  
  setTimeout(() => {
    showToast("Application MoonAstro chargée (v1.0.2) 🌙");
  }, 1000);
});
