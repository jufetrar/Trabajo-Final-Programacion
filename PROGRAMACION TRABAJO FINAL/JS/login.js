/* =========================================================
   FitTrack Pro — login.js
   Validación de formulario, toggle de contraseña y
   micro-interacciones de la pantalla de inicio de sesión.
   No depende de main.js: cada página carga solo lo que usa.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =====================================================
       1) Marcador animado del panel lateral (mismo patrón
       que en la home, aquí solo hay un contador)
       ===================================================== */
    const counters = document.querySelectorAll(".count");

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target, 10) || 0;

        if (prefersReducedMotion) {
            el.textContent = target;
            return;
        }

        const duration = 1000;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        };

        requestAnimationFrame(tick);
    };

    counters.forEach((counter) => animateCounter(counter));

    /* =====================================================
       2) Mostrar / ocultar contraseña
       ===================================================== */
    const passwordInput = document.getElementById("password");
    const toggleBtn = document.getElementById("togglePassword");

    if (passwordInput && toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const isHidden = passwordInput.type === "password";
            passwordInput.type = isHidden ? "text" : "password";
            toggleBtn.setAttribute("aria-pressed", String(isHidden));
            toggleBtn.setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");
            toggleBtn.innerHTML = isHidden
                ? '<i class="fa-solid fa-eye-slash"></i>'
                : '<i class="fa-solid fa-eye"></i>';
        });
    }

    /* =====================================================
       3) Validación del formulario
       ===================================================== */
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const formError = document.getElementById("formError");
    const submitBtn = document.getElementById("submitBtn");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setFieldError = (input, errorEl, message) => {
        input.closest(".field").classList.toggle("has-error", Boolean(message));
        errorEl.textContent = message || "";
    };

    const validateEmail = () => {
        const value = emailInput.value.trim();
        if (!value) {
            setFieldError(emailInput, emailError, "Ingresa tu correo electrónico.");
            return false;
        }
        if (!emailPattern.test(value)) {
            setFieldError(emailInput, emailError, "Ingresa un correo válido.");
            return false;
        }
        setFieldError(emailInput, emailError, "");
        return true;
    };

    const validatePassword = () => {
        const value = passwordInput.value;
        if (!value) {
            setFieldError(passwordInput, passwordError, "Ingresa tu contraseña.");
            return false;
        }
        if (value.length < 6) {
            setFieldError(passwordInput, passwordError, "Debe tener al menos 6 caracteres.");
            return false;
        }
        setFieldError(passwordInput, passwordError, "");
        return true;
    };

    emailInput.addEventListener("blur", validateEmail);
    passwordInput.addEventListener("blur", validatePassword);
    emailInput.addEventListener("input", () => emailError.textContent && validateEmail());
    passwordInput.addEventListener("input", () => passwordError.textContent && validatePassword());

    /* =====================================================
       4) Usuario registrado (localStorage)
       No hay backend todavía: se busca el correo entre las
       cuentas creadas en register.html para que cada persona
       entre a su propio dashboard con su propio nombre y datos.
       ===================================================== */
    const USERS_KEY = "fittrack_users";
    const SESSION_KEY = "fittrack_session";

    const getUsers = () => {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        } catch {
            return [];
        }
    };

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            formError.textContent = "";

            const isEmailValid = validateEmail();
            const isPasswordValid = validatePassword();

            if (!isEmailValid || !isPasswordValid) {
                return;
            }

            const email = emailInput.value.trim().toLowerCase();
            const users = getUsers();
            const user = users.find((u) => u.email === email);

            if (!user) {
                formError.textContent = "No encontramos una cuenta con ese correo. Regístrate primero.";
                return;
            }

            localStorage.setItem(SESSION_KEY, user.email);

            const dataKey = `fittrack_data_${user.email}`;
            if (!localStorage.getItem(dataKey)) {
                localStorage.setItem(dataKey, JSON.stringify({ workouts: [] }));
            }

            // Estado de carga (aquí iría la llamada real a tu API de login)
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span><span class="btn-label">Ingresando…</span>';

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 900);
        });
    }

    /* =====================================================
       4) Enfoque automático en el primer campo
       ===================================================== */
    if (emailInput) emailInput.focus();
});