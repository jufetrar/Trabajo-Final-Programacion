/* =========================================================
   FitTrack Pro — dashboard.js
   Todo el dashboard funciona sobre datos guardados en el
   navegador (localStorage), separados por usuario. Cada
   persona que se registra o inicia sesión ve su propio
   nombre, sus propios entrenamientos y su propio progreso.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =====================================================
       0) Sesión del usuario
       ===================================================== */
    const SESSION_KEY = "fittrack_session";
    const USERS_KEY = "fittrack_users";

    const getUsers = () => {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        } catch {
            return [];
        }
    };

    const sessionEmail = localStorage.getItem(SESSION_KEY);

    if (!sessionEmail) {
        window.location.href = "login.html";
        return;
    }

    const users = getUsers();
    const currentUser = users.find((u) => u.email === sessionEmail);

    if (!currentUser) {
        // La sesión apunta a un usuario que ya no existe: reinicia.
        localStorage.removeItem(SESSION_KEY);
        window.location.href = "login.html";
        return;
    }

    /* =====================================================
       0.1) Configuración: idioma, tema oscuro e incremento
       para sobrecarga progresiva
       ===================================================== */
    const LANG_KEY = "fittrack_lang";
    const THEME_KEY = "fittrack_theme";
    const INCREMENT_KEY = "fittrack_increment";

    let currentLang = localStorage.getItem(LANG_KEY) === "en" ? "en" : "es";
    let darkTheme = localStorage.getItem(THEME_KEY) === "dark";
    let defaultIncrement = parseFloat(localStorage.getItem(INCREMENT_KEY)) || 2.5;

    const I18N = {
        es: {
            "nav.dashboard": "Dashboard",
            "nav.gym": "Gym Tracker",
            "nav.running": "Running",
            "nav.stats": "Estadísticas",
            "nav.achievements": "Logros",
            "nav.settings": "Configuración",
            "nav.logout": "Cerrar sesión",
            "search.placeholder": "Buscar ejercicio, rutina...",
            "heading.subtitle": "Este es tu resumen de la semana.",
            "quickadd.button": "Nuevo entrenamiento",
            "quickadd.gym": "Registrar gimnasio",
            "quickadd.running": "Registrar carrera",
            "stat.workouts": "Entrenamientos esta semana",
            "stat.calories": "Calorías quemadas",
            "stat.distance": "Distancia recorrida",
            "stat.streakLabel": "Racha actual",
            "stat.days": " días",
            "stat.km": " km",
            "panel.weeklyActivity": "Actividad semanal",
            "panel.thisWeek": "Esta semana",
            "panel.weeklyGoals": "Objetivos de la semana",
            "panel.recentWorkouts": "Entrenamientos recientes",
            "panel.achievements": "Logros",
            "panel.chooseExercises": "Elige tus ejercicios",
            "panel.todayRoutine": "Tu rutina de hoy",
            "panel.registerRun": "Registrar carrera",
            "panel.runHistory": "Historial de carreras",
            "empty.routine": "Agrega ejercicios desde la izquierda para armar tu rutina.",
            "empty.workouts": "Todavía no registras entrenamientos. ¡Agrega el primero!",
            "empty.runs": "Aún no registras carreras. Cuenta tus kilómetros aquí.",
            "form.duration": "Duración (min)",
            "form.caloriesOptional": "Calorías (opcional)",
            "form.calorieAuto": "Estimado automático",
            "form.saveWorkout": "Guardar entrenamiento",
            "form.date": "Fecha",
            "form.distanceKm": "Distancia (km)",
            "form.saveRun": "Guardar carrera",
            "run.pace": "Ritmo min/km",
            "run.calories": "Kcal estimadas",
            "run.speed": "Km/h",
            "col.exercise": "Ejercicio",
            "col.sets": "Series",
            "col.reps": "Reps",
            "col.kg": "Kg",
            "goal.workouts": "Entrenamientos",
            "goal.calories": "Calorías",
            "goal.distance": "Distancia",
            "goal.loseWeight": "Perder peso",
            "goal.gainMuscle": "Ganar músculo",
            "goal.endurance": "Resistencia",
            "goal.stayActive": "Mantenerme activo",
            "badge.streak7": "Racha de 7 días",
            "badge.workouts50": "50 entrenamientos",
            "badge.earlyBird": "Madrugador",
            "badge.marathon": "Maratonista (21 km)",
            "badge.lift100": "100 kg en un ejercicio",
            "badge.streak30": "Racha de 30 días",
            "greeting.morning": "Buenos días",
            "greeting.afternoon": "Buenas tardes",
            "greeting.night": "Buenas noches",
            "toast.workoutSaved": "Entrenamiento guardado 💪",
            "toast.runSaved": "Carrera guardada 🏃",
            "toast.settingsSaved": "Cambios guardados ✅",
            "err.addExercise": "Agrega al menos un ejercicio a tu rutina.",
            "err.duration": "Ingresa una duración válida.",
            "err.distance": "Ingresa una distancia válida.",
            "err.name": "Ingresa tu nombre completo.",
            "settings.language": "Idioma",
            "settings.languageDesc": "Elige el idioma de la aplicación.",
            "settings.appearance": "Apariencia",
            "settings.darkMode": "Modo oscuro",
            "settings.darkModeDesc": "Reduce el brillo con un tema más oscuro.",
            "settings.userData": "Datos del usuario",
            "settings.name": "Nombre completo",
            "settings.email": "Correo electrónico",
            "settings.goal": "Meta principal",
            "settings.save": "Guardar cambios",
            "settings.training": "Entrenamiento",
            "settings.progressiveDesc": "Incremento por defecto (kg) que se usa al generar series con sobrecarga progresiva: si no sabes cuánto vas a levantar, la app arma tus series subiendo el peso poco a poco (ej. 20, 22, 25, 30 kg) y tú puedes ajustar cada una.",
            "settings.increment": "Incremento por serie (kg)",
            "progressive.title": "Sobrecarga progresiva",
            "progressive.regenerate": "Regenerar",
            "date.today": "Hoy",
            "date.yesterday": "Ayer",
            "date.daysAgo": "Hace {n} días",
            "cat.chest": "Pecho",
            "cat.back": "Espalda",
            "cat.legs": "Piernas",
            "cat.shoulders": "Hombros",
            "cat.arms": "Brazos",
            "cat.core": "Core",
            "cat.glutes": "Glúteos",
            "cat.calves": "Pantorrillas",
            "cat.cardio": "Cardio",
            "workout.andMore": "y más",
            "workout.run": "Carrera"
        },
        en: {
            "nav.dashboard": "Dashboard",
            "nav.gym": "Gym Tracker",
            "nav.running": "Running",
            "nav.stats": "Stats",
            "nav.achievements": "Achievements",
            "nav.settings": "Settings",
            "nav.logout": "Log out",
            "search.placeholder": "Search exercise, routine...",
            "heading.subtitle": "Here's your summary for the week.",
            "quickadd.button": "New workout",
            "quickadd.gym": "Log gym session",
            "quickadd.running": "Log a run",
            "stat.workouts": "Workouts this week",
            "stat.calories": "Calories burned",
            "stat.distance": "Distance covered",
            "stat.streakLabel": "Current streak",
            "stat.days": " days",
            "stat.km": " km",
            "panel.weeklyActivity": "Weekly activity",
            "panel.thisWeek": "This week",
            "panel.weeklyGoals": "Weekly goals",
            "panel.recentWorkouts": "Recent workouts",
            "panel.achievements": "Achievements",
            "panel.chooseExercises": "Choose your exercises",
            "panel.todayRoutine": "Today's routine",
            "panel.registerRun": "Log a run",
            "panel.runHistory": "Run history",
            "empty.routine": "Add exercises from the left to build your routine.",
            "empty.workouts": "No workouts logged yet. Add your first one!",
            "empty.runs": "No runs logged yet. Track your kilometers here.",
            "form.duration": "Duration (min)",
            "form.caloriesOptional": "Calories (optional)",
            "form.calorieAuto": "Auto-estimated",
            "form.saveWorkout": "Save workout",
            "form.date": "Date",
            "form.distanceKm": "Distance (km)",
            "form.saveRun": "Save run",
            "run.pace": "Pace min/km",
            "run.calories": "Est. kcal",
            "run.speed": "Km/h",
            "col.exercise": "Exercise",
            "col.sets": "Sets",
            "col.reps": "Reps",
            "col.kg": "Kg",
            "goal.workouts": "Workouts",
            "goal.calories": "Calories",
            "goal.distance": "Distance",
            "goal.loseWeight": "Lose weight",
            "goal.gainMuscle": "Build muscle",
            "goal.endurance": "Endurance",
            "goal.stayActive": "Stay active",
            "badge.streak7": "7-day streak",
            "badge.workouts50": "50 workouts",
            "badge.earlyBird": "Early bird",
            "badge.marathon": "Marathoner (21 km)",
            "badge.lift100": "100 kg in one lift",
            "badge.streak30": "30-day streak",
            "greeting.morning": "Good morning",
            "greeting.afternoon": "Good afternoon",
            "greeting.night": "Good evening",
            "toast.workoutSaved": "Workout saved 💪",
            "toast.runSaved": "Run saved 🏃",
            "toast.settingsSaved": "Changes saved ✅",
            "err.addExercise": "Add at least one exercise to your routine.",
            "err.duration": "Enter a valid duration.",
            "err.distance": "Enter a valid distance.",
            "err.name": "Enter your full name.",
            "settings.language": "Language",
            "settings.languageDesc": "Choose the app language.",
            "settings.appearance": "Appearance",
            "settings.darkMode": "Dark mode",
            "settings.darkModeDesc": "Dims the interface with a darker theme.",
            "settings.userData": "User data",
            "settings.name": "Full name",
            "settings.email": "Email",
            "settings.goal": "Main goal",
            "settings.save": "Save changes",
            "settings.training": "Training",
            "settings.progressiveDesc": "Default increment (kg) used to generate sets with progressive overload: if you don't know how much you'll lift, the app builds your sets raising the weight gradually (e.g. 20, 22, 25, 30 kg) and you can tweak each one.",
            "settings.increment": "Increment per set (kg)",
            "progressive.title": "Progressive overload",
            "progressive.regenerate": "Regenerate",
            "date.today": "Today",
            "date.yesterday": "Yesterday",
            "date.daysAgo": "{n} days ago",
            "cat.chest": "Chest",
            "cat.back": "Back",
            "cat.legs": "Legs",
            "cat.shoulders": "Shoulders",
            "cat.arms": "Arms",
            "cat.core": "Core",
            "cat.glutes": "Glutes",
            "cat.calves": "Calves",
            "cat.cardio": "Cardio",
            "workout.andMore": "and more",
            "workout.run": "Run"
        }
    };

    const t = (key, vars) => {
        let str = (I18N[currentLang] && I18N[currentLang][key]) || key;
        if (vars) {
            Object.keys(vars).forEach((k) => {
                str = str.replace(`{${k}}`, vars[k]);
            });
        }
        return str;
    };

    const applyStaticTranslations = () => {
        document.documentElement.lang = currentLang;

        document.querySelectorAll("[data-i18n]").forEach((el) => {
            el.textContent = t(el.dataset.i18n);
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
            el.placeholder = t(el.dataset.i18nPlaceholder);
        });

        document.querySelectorAll(".lang-btn").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.lang === currentLang);
        });
    };

    const applyTheme = () => {
        document.body.classList.toggle("theme-dark", darkTheme);
        const darkModeToggle = document.getElementById("darkModeToggle");
        if (darkModeToggle) darkModeToggle.checked = darkTheme;
    };

    const DATA_KEY = `fittrack_data_${currentUser.email}`;

    const getData = () => {
        try {
            const stored = JSON.parse(localStorage.getItem(DATA_KEY));
            if (stored && Array.isArray(stored.workouts)) return stored;
        } catch {
            /* ignora datos corruptos */
        }
        return { workouts: [] };
    };

    const saveData = (data) => {
        localStorage.setItem(DATA_KEY, JSON.stringify(data));
    };

    let appData = getData();

    /* =====================================================
       1) Saludo + identidad en la topbar
       ===================================================== */
    const greeting = document.getElementById("greeting");
    const userNameLabel = document.getElementById("userNameLabel");
    const userAvatar = document.getElementById("userAvatar");

    const updateGreeting = () => {
        const firstName = (currentUser.name || "").trim().split(" ")[0] || "Atleta";
        if (greeting) {
            const hour = new Date().getHours();
            let saludoKey = "greeting.night";
            if (hour >= 5 && hour < 12) saludoKey = "greeting.morning";
            else if (hour >= 12 && hour < 19) saludoKey = "greeting.afternoon";
            greeting.textContent = `${t(saludoKey)}, ${firstName}`;
        }
        if (userNameLabel) userNameLabel.textContent = firstName;
        if (userAvatar) userAvatar.textContent = firstName.charAt(0).toUpperCase();
    };

    updateGreeting();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem(SESSION_KEY);
        });
    }

    /* =====================================================
       2) Sidebar responsive (mobile)
       ===================================================== */
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const toggleBtn = document.getElementById("sidebarToggle");

    const closeSidebar = () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
    };

    const openSidebar = () => {
        sidebar.classList.add("open");
        overlay.classList.add("open");
        toggleBtn.setAttribute("aria-expanded", "true");
    };

    if (sidebar && overlay && toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
        });

        overlay.addEventListener("click", closeSidebar);

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeSidebar();
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 860) closeSidebar();
        });
    }

    /* =====================================================
       3) Navegación entre vistas (Dashboard / Gym / Running)
       ===================================================== */
    const navItems = document.querySelectorAll(".nav-item[data-view]");
    const views = document.querySelectorAll(".dash-view");

    const showView = (viewName, scrollToId) => {
        views.forEach((v) => v.classList.toggle("active", v.id === `view-${viewName}`));

        navItems.forEach((item) => {
            item.classList.toggle("active", item.dataset.view === viewName && !item.dataset.scrollTo);
        });

        closeSidebar();
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });

        if (scrollToId) {
            requestAnimationFrame(() => {
                const target = document.getElementById(scrollToId);
                if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
            });
        }
    };

    navItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            showView(item.dataset.view, item.dataset.scrollTo);
        });
    });

    // Menú rápido "Nuevo entrenamiento"
    const quickAddBtn = document.getElementById("quickAddBtn");
    const quickAddMenu = document.getElementById("quickAddMenu");

    if (quickAddBtn && quickAddMenu) {
        quickAddBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            quickAddMenu.classList.toggle("open");
        });

        quickAddMenu.querySelectorAll("button[data-view]").forEach((btn) => {
            btn.addEventListener("click", () => {
                quickAddMenu.classList.remove("open");
                showView(btn.dataset.view);
            });
        });

        document.addEventListener("click", (e) => {
            if (!quickAddMenu.contains(e.target) && e.target !== quickAddBtn) {
                quickAddMenu.classList.remove("open");
            }
        });
    }

    /* =====================================================
       4) Toast de confirmación
       ===================================================== */
    const toastEl = document.getElementById("toast");
    let toastTimer = null;

    const showToast = (message) => {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
    };

    /* =====================================================
       5) Contador animado reutilizable
       ===================================================== */
    const animateCounter = (el, finalValue, decimals = 0, locale = null) => {
        const format = (value) => {
            if (decimals > 0) return value.toFixed(decimals);
            return locale ? Math.round(value).toLocaleString(locale) : String(Math.round(value));
        };

        if (prefersReducedMotion) {
            el.textContent = format(finalValue);
            return;
        }

        const duration = 900;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = format(eased * finalValue);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = format(finalValue);
        };

        requestAnimationFrame(tick);
    };

    /* =====================================================
       6) Utilidades de fecha
       ===================================================== */
    const DAY_MS = 24 * 60 * 60 * 1000;

    const startOfDay = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    // Lunes como primer día de la semana
    const getWeekStart = (date) => {
        const d = startOfDay(date);
        const dow = (d.getDay() + 6) % 7; // 0 = lunes
        d.setDate(d.getDate() - dow);
        return d;
    };

    const formatRelativeDate = (isoDate) => {
        const date = new Date(isoDate);
        const today = startOfDay(new Date());
        const diffDays = Math.round((today - startOfDay(date)) / DAY_MS);
        const locale = currentLang === "en" ? "en-US" : "es-CO";
        const time = date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });

        if (diffDays === 0) return `${t("date.today")} · ${time}`;
        if (diffDays === 1) return t("date.yesterday");
        if (diffDays > 1) return t("date.daysAgo", { n: diffDays });
        return date.toLocaleDateString(locale);
    };

    /* =====================================================
       7) Cálculo de estadísticas a partir de los datos reales
       ===================================================== */
    const computeStats = () => {
        const weekStart = getWeekStart(new Date());
        const weekWorkouts = appData.workouts.filter((w) => new Date(w.date) >= weekStart);

        const workoutsCount = weekWorkouts.length;
        const calories = weekWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
        const distance = weekWorkouts
            .filter((w) => w.type === "running")
            .reduce((sum, w) => sum + (w.distance || 0), 0);

        // Racha: días consecutivos con al menos un entrenamiento, terminando hoy o ayer
        let streak = 0;
        const daysWithWorkout = new Set(
            appData.workouts.map((w) => startOfDay(new Date(w.date)).getTime())
        );
        let cursor = startOfDay(new Date());

        // Si hoy no hay entrenamiento todavía, la racha se cuenta desde ayer
        if (!daysWithWorkout.has(cursor.getTime())) {
            cursor = new Date(cursor.getTime() - DAY_MS);
        }

        while (daysWithWorkout.has(cursor.getTime())) {
            streak++;
            cursor = new Date(cursor.getTime() - DAY_MS);
        }

        return { workoutsCount, calories, distance, streak, weekWorkouts };
    };

    const GOALS = { workouts: 6, calories: 4000, distance: 25 };

    const renderStats = () => {
        const stats = computeStats();

        const statWorkouts = document.getElementById("statWorkouts");
        const statCalories = document.getElementById("statCalories");
        const statDistance = document.getElementById("statDistance");
        const statStreak = document.getElementById("statStreak");

        if (statWorkouts) animateCounter(statWorkouts, stats.workoutsCount);
        if (statCalories) animateCounter(statCalories, stats.calories, 0, currentLang === "en" ? "en-US" : "es-CO");
        if (statDistance) animateCounter(statDistance, stats.distance, 1);
        if (statStreak) animateCounter(statStreak, stats.streak);

        renderGoals(stats);
        renderChart(stats.weekWorkouts);
        renderRecentWorkouts();
        renderRunHistory();
        renderBadges(stats);
    };

    /* =====================================================
       8) Objetivos de la semana
       ===================================================== */
    const renderGoals = (stats) => {
        const goalList = document.getElementById("goalList");
        if (!goalList) return;

        const locale = currentLang === "en" ? "en-US" : "es-CO";

        const items = [
            {
                label: t("goal.workouts"),
                current: stats.workoutsCount,
                target: GOALS.workouts,
                display: `${stats.workoutsCount} / ${GOALS.workouts}`,
                cls: ""
            },
            {
                label: t("goal.calories"),
                current: stats.calories,
                target: GOALS.calories,
                display: `${Math.round(stats.calories).toLocaleString(locale)} / ${GOALS.calories.toLocaleString(locale)}`,
                cls: "coral"
            },
            {
                label: t("goal.distance"),
                current: stats.distance,
                target: GOALS.distance,
                display: `${stats.distance.toFixed(1)} / ${GOALS.distance} km`,
                cls: ""
            }
        ];

        goalList.innerHTML = items
            .map((item) => {
                const pct = Math.min(100, Math.round((item.current / item.target) * 100)) || 0;
                return `
                <li>
                    <div class="goal-head">
                        <span>${item.label}</span>
                        <span>${item.display}</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill ${item.cls}" style="width:${pct}%"></div>
                    </div>
                </li>`;
            })
            .join("");
    };

    /* =====================================================
       9) Gráfico de actividad semanal
       ===================================================== */
    const renderChart = (weekWorkouts) => {
        const bars = document.querySelectorAll("#barChart .bar");
        if (!bars.length) return;

        const minutesByDay = [0, 0, 0, 0, 0, 0, 0];
        weekWorkouts.forEach((w) => {
            const dow = (new Date(w.date).getDay() + 6) % 7;
            minutesByDay[dow] += w.duration || 0;
        });

        const maxMinutes = Math.max(...minutesByDay, 1);

        bars.forEach((bar) => {
            const dayIndex = parseInt(bar.dataset.day, 10);
            const minutes = minutesByDay[dayIndex];
            const pct = (minutes / maxMinutes) * 100;
            const fill = bar.querySelector(".bar-fill");

            bar.classList.toggle("bar-peak", minutes > 0 && minutes === maxMinutes);
            bar.title = `${minutes} min`;

            if (prefersReducedMotion) {
                fill.style.height = `${pct}%`;
            } else {
                requestAnimationFrame(() => {
                    fill.style.height = `${pct}%`;
                });
            }
        });
    };

    /* =====================================================
       10) Entrenamientos recientes
       ===================================================== */
    const ICONS = { gym: "fa-dumbbell", running: "fa-person-running" };

    const renderRecentWorkouts = () => {
        const list = document.getElementById("recentWorkouts");
        if (!list) return;

        const sorted = [...appData.workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recent = sorted.slice(0, 5);

        if (!recent.length) {
            list.innerHTML = `
                <li class="empty-state" style="width:100%;">
                    <i class="fa-solid fa-clipboard-list"></i>
                    <p>${t("empty.workouts")}</p>
                </li>`;
            return;
        }

        list.innerHTML = recent
            .map((w) => {
                const iconClass = w.type === "running" ? "icon-coral" : "icon-lime";
                const icon = ICONS[w.type] || "fa-dumbbell";
                const metaRight = w.type === "running"
                    ? `<span>${(w.distance || 0).toFixed(1)} km</span><span>${w.duration} min</span>`
                    : `<span>${w.duration} min</span><span>${Math.round(w.calories || 0)} kcal</span>`;

                return `
                <li>
                    <span class="workout-icon ${iconClass}"><i class="fa-solid ${icon}"></i></span>
                    <div class="workout-info">
                        <h3>${w.name}</h3>
                        <p>${formatRelativeDate(w.date)}</p>
                    </div>
                    <div class="workout-meta">${metaRight}</div>
                </li>`;
            })
            .join("");
    };

    /* =====================================================
       11) Historial de carreras (vista Running)
       ===================================================== */
    const renderRunHistory = () => {
        const list = document.getElementById("runHistory");
        if (!list) return;

        const runs = appData.workouts
            .filter((w) => w.type === "running")
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (!runs.length) {
            list.innerHTML = `
                <li class="empty-state" style="width:100%;">
                    <i class="fa-solid fa-person-running"></i>
                    <p>${t("empty.runs")}</p>
                </li>`;
            return;
        }

        list.innerHTML = runs
            .map((w) => `
                <li>
                    <span class="workout-icon icon-coral"><i class="fa-solid fa-person-running"></i></span>
                    <div class="workout-info">
                        <h3>${w.name}</h3>
                        <p>${formatRelativeDate(w.date)}</p>
                    </div>
                    <div class="workout-meta">
                        <span>${(w.distance || 0).toFixed(1)} km</span>
                        <span>${w.duration} min</span>
                    </div>
                </li>`)
            .join("");
    };

    /* =====================================================
       12) Logros (calculados sobre datos reales)
       ===================================================== */
    const renderBadges = (stats) => {
        const grid = document.getElementById("badgeGrid");
        if (!grid) return;

        const totalWorkouts = appData.workouts.length;
        const maxRunDistance = Math.max(
            0,
            ...appData.workouts.filter((w) => w.type === "running").map((w) => w.distance || 0)
        );
        const maxLift = Math.max(
            0,
            ...appData.workouts
                .filter((w) => w.type === "gym" && Array.isArray(w.exercises))
                .flatMap((w) =>
                    w.exercises.flatMap((ex) =>
                        Array.isArray(ex.weights) && ex.weights.length ? ex.weights : [ex.weight || 0]
                    )
                )
        );
        const earlyBird = appData.workouts.some((w) => new Date(w.date).getHours() < 7);

        const badges = [
            { icon: "fa-fire", label: t("badge.streak7"), unlocked: stats.streak >= 7 },
            { icon: "fa-dumbbell", label: t("badge.workouts50"), unlocked: totalWorkouts >= 50 },
            { icon: "fa-sun", label: t("badge.earlyBird"), unlocked: earlyBird },
            { icon: "fa-medal", label: t("badge.marathon"), unlocked: maxRunDistance >= 21 },
            { icon: "fa-weight-hanging", label: t("badge.lift100"), unlocked: maxLift >= 100 },
            { icon: "fa-calendar-check", label: t("badge.streak30"), unlocked: stats.streak >= 30 }
        ];

        grid.innerHTML = badges
            .map(
                (b) => `
                <div class="badge${b.unlocked ? "" : " locked"}">
                    <div class="badge-icon"><i class="fa-solid ${b.unlocked ? b.icon : "fa-lock"}"></i></div>
                    <p>${b.label}</p>
                </div>`
            )
            .join("");
    };

    /* =====================================================
       13) Gym Tracker — librería de ejercicios + rutina
       ===================================================== */
    const CAT_ORDER = ["chest", "back", "legs", "shoulders", "arms", "core", "glutes", "calves", "cardio"];

    const EXERCISES = [
        // Pecho / Chest
        { id: "e1", catKey: "chest", es: "Press de banca", en: "Bench press" },
        { id: "e2", catKey: "chest", es: "Press inclinado con mancuernas", en: "Incline dumbbell press" },
        { id: "e3", catKey: "chest", es: "Press declinado", en: "Decline press" },
        { id: "e4", catKey: "chest", es: "Aperturas en polea", en: "Cable flyes" },
        { id: "e5", catKey: "chest", es: "Fondos en paralelas", en: "Parallel bar dips" },
        { id: "e6", catKey: "chest", es: "Press en máquina Smith", en: "Smith machine press" },
        { id: "e7", catKey: "chest", es: "Pullover con mancuerna", en: "Dumbbell pullover" },
        { id: "e8", catKey: "chest", es: "Flexiones de pecho", en: "Push-ups" },
        // Espalda / Back
        { id: "e9", catKey: "back", es: "Dominadas", en: "Pull-ups" },
        { id: "e10", catKey: "back", es: "Remo con barra", en: "Barbell row" },
        { id: "e11", catKey: "back", es: "Jalón al pecho", en: "Lat pulldown" },
        { id: "e12", catKey: "back", es: "Peso muerto", en: "Deadlift" },
        { id: "e13", catKey: "back", es: "Remo en polea baja", en: "Seated cable row" },
        { id: "e14", catKey: "back", es: "Remo con mancuerna a un brazo", en: "One-arm dumbbell row" },
        { id: "e15", catKey: "back", es: "Hiperextensiones", en: "Back extensions" },
        { id: "e16", catKey: "back", es: "Peso muerto rumano", en: "Romanian deadlift" },
        // Piernas / Legs
        { id: "e17", catKey: "legs", es: "Sentadilla", en: "Squat" },
        { id: "e18", catKey: "legs", es: "Prensa de piernas", en: "Leg press" },
        { id: "e19", catKey: "legs", es: "Zancadas", en: "Lunges" },
        { id: "e20", catKey: "legs", es: "Curl femoral", en: "Leg curl" },
        { id: "e21", catKey: "legs", es: "Extensión de cuádriceps", en: "Leg extension" },
        { id: "e22", catKey: "legs", es: "Sentadilla búlgara", en: "Bulgarian split squat" },
        { id: "e23", catKey: "legs", es: "Sentadilla frontal", en: "Front squat" },
        { id: "e24", catKey: "legs", es: "Peso muerto a una pierna", en: "Single-leg deadlift" },
        { id: "e25", catKey: "legs", es: "Sentadilla goblet", en: "Goblet squat" },
        { id: "e26", catKey: "legs", es: "Sentadilla hack", en: "Hack squat" },
        // Hombros / Shoulders
        { id: "e27", catKey: "shoulders", es: "Press militar", en: "Overhead press" },
        { id: "e28", catKey: "shoulders", es: "Elevaciones laterales", en: "Lateral raises" },
        { id: "e29", catKey: "shoulders", es: "Pájaros con mancuernas", en: "Reverse flyes" },
        { id: "e30", catKey: "shoulders", es: "Press Arnold", en: "Arnold press" },
        { id: "e31", catKey: "shoulders", es: "Elevaciones frontales", en: "Front raises" },
        { id: "e32", catKey: "shoulders", es: "Remo al mentón", en: "Upright row" },
        { id: "e33", catKey: "shoulders", es: "Face pull", en: "Face pull" },
        // Brazos / Arms
        { id: "e34", catKey: "arms", es: "Curl de bíceps", en: "Bicep curl" },
        { id: "e35", catKey: "arms", es: "Press francés", en: "Skull crushers" },
        { id: "e36", catKey: "arms", es: "Curl martillo", en: "Hammer curl" },
        { id: "e37", catKey: "arms", es: "Extensión de tríceps en polea", en: "Triceps pushdown" },
        { id: "e38", catKey: "arms", es: "Curl concentrado", en: "Concentration curl" },
        { id: "e39", catKey: "arms", es: "Fondos de tríceps en banco", en: "Bench dips" },
        { id: "e40", catKey: "arms", es: "Curl en banco Scott", en: "Preacher curl" },
        { id: "e41", catKey: "arms", es: "Press cerrado de banca", en: "Close-grip bench press" },
        // Core
        { id: "e42", catKey: "core", es: "Plancha abdominal", en: "Plank" },
        { id: "e43", catKey: "core", es: "Crunch en polea", en: "Cable crunch" },
        { id: "e44", catKey: "core", es: "Elevación de piernas", en: "Leg raises" },
        { id: "e45", catKey: "core", es: "Abdominales bicicleta", en: "Bicycle crunch" },
        { id: "e46", catKey: "core", es: "Rueda abdominal", en: "Ab wheel rollout" },
        { id: "e47", catKey: "core", es: "Russian twist", en: "Russian twist" },
        { id: "e48", catKey: "core", es: "Plancha lateral", en: "Side plank" },
        // Glúteos / Glutes
        { id: "e49", catKey: "glutes", es: "Hip thrust con barra", en: "Barbell hip thrust" },
        { id: "e50", catKey: "glutes", es: "Patada de glúteo en polea", en: "Glute kickback" },
        { id: "e51", catKey: "glutes", es: "Puente de glúteos", en: "Glute bridge" },
        { id: "e52", catKey: "glutes", es: "Abducción de cadera en máquina", en: "Hip abduction machine" },
        { id: "e53", catKey: "glutes", es: "Peso muerto sumo", en: "Sumo deadlift" },
        { id: "e54", catKey: "glutes", es: "Step up con mancuernas", en: "Dumbbell step-up" },
        // Pantorrillas / Calves
        { id: "e55", catKey: "calves", es: "Elevación de talones de pie", en: "Standing calf raise" },
        { id: "e56", catKey: "calves", es: "Elevación de talones sentado", en: "Seated calf raise" },
        { id: "e57", catKey: "calves", es: "Elevación de talones en prensa", en: "Leg press calf raise" },
        { id: "e58", catKey: "calves", es: "Elevación de talones a una pierna", en: "Single-leg calf raise" },
        // Cardio
        { id: "e59", catKey: "cardio", es: "Cinta de correr", en: "Treadmill" },
        { id: "e60", catKey: "cardio", es: "Bicicleta estática", en: "Stationary bike" },
        { id: "e61", catKey: "cardio", es: "Remo (máquina)", en: "Rowing machine" },
        { id: "e62", catKey: "cardio", es: "Elíptica", en: "Elliptical" },
        { id: "e63", catKey: "cardio", es: "Saltar la cuerda", en: "Jump rope" },
        { id: "e64", catKey: "cardio", es: "Escaladora", en: "Stair climber" }
    ];

    const exName = (ex) => (currentLang === "en" ? ex.en : ex.es) || ex.es;
    const exFindName = (id) => {
        const ex = EXERCISES.find((e) => e.id === id);
        return ex ? exName(ex) : "";
    };

    let routine = []; // { id, catKey, sets, reps, weight, weights: [], progressive }

    const exerciseLibraryEl = document.getElementById("exerciseLibrary");
    const routineListEl = document.getElementById("routineList");
    const routineEmptyEl = document.getElementById("routineEmpty");

    const renderExerciseLibrary = () => {
        if (!exerciseLibraryEl) return;

        const categories = CAT_ORDER.filter((cat) => EXERCISES.some((ex) => ex.catKey === cat));

        exerciseLibraryEl.innerHTML = categories
            .map((cat) => {
                const items = EXERCISES.filter((ex) => ex.catKey === cat)
                    .map((ex) => {
                        const isAdded = routine.some((r) => r.id === ex.id);
                        const name = exName(ex);
                        return `
                        <div class="exercise-card${isAdded ? " added" : ""}" data-id="${ex.id}">
                            <span>${name}</span>
                            <button type="button" data-action="${isAdded ? "remove" : "add"}" data-id="${ex.id}"
                                aria-label="${name}">
                                <i class="fa-solid ${isAdded ? "fa-minus" : "fa-plus"}"></i>
                            </button>
                        </div>`;
                    })
                    .join("");

                return `
                <div class="exercise-category">
                    <h3>${t(`cat.${cat}`)}</h3>
                    <div class="exercise-grid">${items}</div>
                </div>`;
            })
            .join("");

        exerciseLibraryEl.querySelectorAll("button[data-action]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                if (btn.dataset.action === "add") {
                    addExerciseToRoutine(id);
                } else {
                    removeExerciseFromRoutine(id);
                }
            });
        });
    };

    /* ---- Sobrecarga progresiva: genera pesos ascendentes por serie ---- */
    const generateProgressiveWeights = (item) => {
        const base = item.weight > 0 ? item.weight : 20;
        const step = defaultIncrement;
        return Array.from({ length: item.sets }, (_, i) => Math.round((base + i * step) * 2) / 2);
    };

    const getSetWeights = (item) => {
        if (Array.isArray(item.weights) && item.weights.length === item.sets) {
            return item.weights;
        }
        const generated = generateProgressiveWeights(item);
        const previous = Array.isArray(item.weights) ? item.weights : [];
        item.weights = generated.map((w, i) => (previous[i] !== undefined ? previous[i] : w));
        return item.weights;
    };

    const renderRoutine = () => {
        if (!routineListEl) return;

        if (!routine.length) {
            routineEmptyEl.style.display = "block";
            routineListEl.innerHTML = "";
            return;
        }

        routineEmptyEl.style.display = "none";

        routineListEl.innerHTML =
            `<div class="routine-col-labels">
                <span>${t("col.exercise")}</span><span>${t("col.sets")}</span><span>${t("col.reps")}</span><span>${t("col.kg")}</span><span></span>
            </div>` +
            routine
                .map((r) => {
                    const name = exFindName(r.id);
                    const weightCell = r.progressive
                        ? (() => {
                              const w = getSetWeights(r);
                              const min = Math.min(...w);
                              const max = Math.max(...w);
                              return `<span class="prog-badge" title="${t("progressive.title")}">${min === max ? `${min}` : `${min}–${max}`}</span>`;
                          })()
                        : `<input type="number" min="0" value="${r.weight}" data-field="weight" data-id="${r.id}" aria-label="${t("col.kg")}">`;

                    const setsChips = r.progressive
                        ? `<div class="set-weights" data-id="${r.id}">
                            ${getSetWeights(r)
                                .map(
                                    (w, i) => `
                                <label class="set-weight">
                                    <span>${i + 1}</span>
                                    <input type="number" min="0" step="0.5" value="${w}" data-set-index="${i}" data-id="${r.id}" aria-label="${name} — ${t("col.sets")} ${i + 1}">
                                </label>`
                                )
                                .join("")}
                            <button type="button" class="regen-weights" data-id="${r.id}">
                                <i class="fa-solid fa-arrows-rotate"></i> ${t("progressive.regenerate")}
                            </button>
                        </div>`
                        : "";

                    return `
                    <div class="routine-item-wrap">
                        <div class="routine-item" data-id="${r.id}">
                            <span class="routine-name">${name}</span>
                            <input type="number" min="1" value="${r.sets}" data-field="sets" data-id="${r.id}" aria-label="${t("col.sets")}">
                            <input type="number" min="1" value="${r.reps}" data-field="reps" data-id="${r.id}" aria-label="${t("col.reps")}">
                            ${weightCell}
                            <div class="routine-actions">
                                <button type="button" class="progressive-toggle${r.progressive ? " active" : ""}" data-id="${r.id}" aria-pressed="${r.progressive}" title="${t("progressive.title")}">
                                    <i class="fa-solid fa-stairs"></i>
                                </button>
                                <button type="button" class="remove-ex" data-id="${r.id}" aria-label="${name}">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>
                        ${setsChips}
                    </div>`;
                })
                .join("");

        routineListEl.querySelectorAll("input[data-field]").forEach((input) => {
            input.addEventListener("input", () => {
                const item = routine.find((r) => r.id === input.dataset.id);
                if (!item) return;
                item[input.dataset.field] = parseFloat(input.value) || 0;

                if (input.dataset.field === "sets") {
                    item.sets = Math.max(1, Math.round(item.sets) || 1);
                    // Conserva los pesos existentes y completa el resto con sobrecarga progresiva
                    const generated = generateProgressiveWeights(item);
                    const previous = Array.isArray(item.weights) ? item.weights : [];
                    item.weights = generated.map((w, i) => (previous[i] !== undefined ? previous[i] : w));
                    renderRoutine();
                } else if (input.dataset.field === "weight" && item.progressive) {
                    item.weights = generateProgressiveWeights(item);
                    renderRoutine();
                }
            });
        });

        routineListEl.querySelectorAll("input[data-set-index]").forEach((input) => {
            input.addEventListener("input", () => {
                const item = routine.find((r) => r.id === input.dataset.id);
                if (!item) return;
                const idx = parseInt(input.dataset.setIndex, 10);
                if (!Array.isArray(item.weights)) item.weights = getSetWeights(item);
                item.weights[idx] = parseFloat(input.value) || 0;
            });
        });

        routineListEl.querySelectorAll(".progressive-toggle").forEach((btn) => {
            btn.addEventListener("click", () => {
                const item = routine.find((r) => r.id === btn.dataset.id);
                if (!item) return;
                item.progressive = !item.progressive;
                if (item.progressive) item.weights = generateProgressiveWeights(item);
                renderRoutine();
            });
        });

        routineListEl.querySelectorAll(".regen-weights").forEach((btn) => {
            btn.addEventListener("click", () => {
                const item = routine.find((r) => r.id === btn.dataset.id);
                if (!item) return;
                item.weights = generateProgressiveWeights(item);
                renderRoutine();
            });
        });

        routineListEl.querySelectorAll(".remove-ex").forEach((btn) => {
            btn.addEventListener("click", () => removeExerciseFromRoutine(btn.dataset.id));
        });
    };

    const addExerciseToRoutine = (id) => {
        const ex = EXERCISES.find((e) => e.id === id);
        if (!ex || routine.some((r) => r.id === id)) return;
        routine.push({
            id: ex.id,
            catKey: ex.catKey,
            sets: 3,
            reps: 10,
            weight: 0,
            weights: [],
            progressive: false
        });
        renderExerciseLibrary();
        renderRoutine();
    };

    const removeExerciseFromRoutine = (id) => {
        routine = routine.filter((r) => r.id !== id);
        renderExerciseLibrary();
        renderRoutine();
    };

    /* =====================================================
       13.1) Vista de Configuración
       ===================================================== */
    const refreshAll = () => {
        applyStaticTranslations();
        applyTheme();
        updateGreeting();
        renderExerciseLibrary();
        renderRoutine();
        renderStats();
    };

    document.querySelectorAll(".lang-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (btn.dataset.lang === currentLang) return;
            currentLang = btn.dataset.lang;
            localStorage.setItem(LANG_KEY, currentLang);
            refreshAll();
        });
    });

    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
        darkModeToggle.addEventListener("change", () => {
            darkTheme = darkModeToggle.checked;
            localStorage.setItem(THEME_KEY, darkTheme ? "dark" : "light");
            applyTheme();
        });
    }

    const incrementInput = document.getElementById("defaultIncrement");
    if (incrementInput) {
        incrementInput.value = defaultIncrement;
        incrementInput.addEventListener("change", () => {
            defaultIncrement = parseFloat(incrementInput.value) || 2.5;
            localStorage.setItem(INCREMENT_KEY, String(defaultIncrement));
        });
    }

    const settingsForm = document.getElementById("settingsForm");
    const settingsName = document.getElementById("settingsName");
    const settingsEmail = document.getElementById("settingsEmail");
    const settingsGoal = document.getElementById("settingsGoal");
    const settingsFormMsg = document.getElementById("settingsFormMsg");

    if (settingsName) settingsName.value = currentUser.name || "";
    if (settingsEmail) settingsEmail.value = currentUser.email || "";
    if (settingsGoal) settingsGoal.value = currentUser.goal || "ganar-musculo";

    if (settingsForm) {
        settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newName = settingsName.value.trim();

            if (!newName) {
                settingsFormMsg.textContent = t("err.name");
                return;
            }
            settingsFormMsg.textContent = "";

            currentUser.name = newName;
            currentUser.goal = settingsGoal.value;

            const idx = users.findIndex((u) => u.email === currentUser.email);
            if (idx >= 0) users[idx] = currentUser;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));

            updateGreeting();
            renderStats();
            showToast(t("toast.settingsSaved"));
        });
    }

    // Primera aplicación de idioma y tema guardados
    applyStaticTranslations();
    applyTheme();

    renderExerciseLibrary();
    renderRoutine();

    /* =====================================================
       14) Guardar entrenamiento de gimnasio
       ===================================================== */
    const gymForm = document.getElementById("gymForm");
    const gymFormError = document.getElementById("gymFormError");

    if (gymForm) {
        gymForm.addEventListener("submit", (e) => {
            e.preventDefault();
            gymFormError.textContent = "";

            if (!routine.length) {
                gymFormError.textContent = t("err.addExercise");
                return;
            }

            const duration = parseInt(document.getElementById("gymDuration").value, 10);
            if (!duration || duration <= 0) {
                gymFormError.textContent = t("err.duration");
                return;
            }

            const manualCalories = parseInt(document.getElementById("gymCalories").value, 10);
            const calories = manualCalories > 0 ? manualCalories : Math.round(duration * 7.5);

            const firstName = exFindName(routine[0].id);
            const workoutName =
                routine.length === 1 ? firstName : `${t(`cat.${routine[0].catKey}`)} ${t("workout.andMore")}`;

            appData.workouts.push({
                id: `w_${Date.now()}`,
                type: "gym",
                name: workoutName,
                date: new Date().toISOString(),
                duration,
                calories,
                exercises: routine.map((r) => ({
                    ...r,
                    name: exFindName(r.id),
                    weights: Array.isArray(r.weights) ? [...getSetWeights(r)] : []
                }))
            });

            saveData(appData);

            routine = [];
            gymForm.reset();
            renderExerciseLibrary();
            renderRoutine();
            renderStats();
            showToast(t("toast.workoutSaved"));
            showView("overview");
        });
    }

    /* =====================================================
       15) Registrar carrera (running)
       ===================================================== */
    const runForm = document.getElementById("runForm");
    const runFormError = document.getElementById("runFormError");
    const runDateInput = document.getElementById("runDate");
    const runDistanceInput = document.getElementById("runDistance");
    const runDurationInput = document.getElementById("runDuration");
    const runPaceEl = document.getElementById("runPace");
    const runCaloriesEl = document.getElementById("runCalories");
    const runSpeedEl = document.getElementById("runSpeed");

    if (runDateInput) {
        runDateInput.value = new Date().toISOString().slice(0, 10);
    }

    const updateRunSummary = () => {
        const distance = parseFloat(runDistanceInput.value) || 0;
        const duration = parseFloat(runDurationInput.value) || 0;

        if (distance > 0 && duration > 0) {
            const pace = duration / distance;
            const speed = (distance / duration) * 60;
            const calories = Math.round(distance * 62);

            runPaceEl.textContent = `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, "0")}`;
            runSpeedEl.textContent = speed.toFixed(1);
            runCaloriesEl.textContent = calories;
        } else {
            runPaceEl.textContent = "--";
            runSpeedEl.textContent = "--";
            runCaloriesEl.textContent = "--";
        }
    };

    if (runDistanceInput && runDurationInput) {
        runDistanceInput.addEventListener("input", updateRunSummary);
        runDurationInput.addEventListener("input", updateRunSummary);
    }

    if (runForm) {
        runForm.addEventListener("submit", (e) => {
            e.preventDefault();
            runFormError.textContent = "";

            const distance = parseFloat(runDistanceInput.value);
            const duration = parseFloat(runDurationInput.value);
            const date = runDateInput.value ? new Date(runDateInput.value) : new Date();

            if (!distance || distance <= 0) {
                runFormError.textContent = t("err.distance");
                return;
            }
            if (!duration || duration <= 0) {
                runFormError.textContent = t("err.duration");
                return;
            }

            const calories = Math.round(distance * 62);

            appData.workouts.push({
                id: `w_${Date.now()}`,
                type: "running",
                name: t("workout.run"),
                date: date.toISOString(),
                duration: Math.round(duration),
                distance,
                calories
            });

            saveData(appData);

            runForm.reset();
            runDateInput.value = new Date().toISOString().slice(0, 10);
            updateRunSummary();
            renderStats();
            showToast(t("toast.runSaved"));
            showView("overview");
        });
    }

    /* =====================================================
       16) Primer render
       ===================================================== */
    renderStats();
});