/* =========================================================
   FitTrack Pro — register.js
   Validación del formulario de registro, medidor de fuerza
   de contraseña y toggles de visibilidad.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =====================================================
       1) Marcador animado del panel lateral
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
       2) Mostrar / ocultar contraseña (aplica a ambos campos)
       ===================================================== */
    document.querySelectorAll(".toggle-password").forEach((btn) => {
        const input = document.getElementById(btn.dataset.targetInput);
        if (!input) return;

        btn.addEventListener("click", () => {
            const isHidden = input.type === "password";
            input.type = isHidden ? "text" : "password";
            btn.setAttribute("aria-pressed", String(isHidden));
            btn.setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");
            btn.innerHTML = isHidden
                ? '<i class="fa-solid fa-eye-slash"></i>'
                : '<i class="fa-solid fa-eye"></i>';
        });
    });

    /* =====================================================
       3) Medidor de fuerza de contraseña
       ===================================================== */
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirmPassword");
    const termsInput = document.getElementById("terms");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmError = document.getElementById("confirmError");
    const termsError = document.getElementById("termsError");
    const formError = document.getElementById("formError");

    const strengthMeter = document.getElementById("strengthMeter");
    const strengthLabel = document.getElementById("strengthLabel");

    const scorePassword = (value) => {
        let score = 0;
        if (value.length >= 8) score++;
        if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
        if (/\d/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;
        return score;
    };

    const strengthText = ["Muy débil", "Débil", "Aceptable", "Buena", "Excelente"];

    passwordInput.addEventListener("input", () => {
        const value = passwordInput.value;
        const score = value ? scorePassword(value) : 0;

        strengthMeter.className = "strength-meter" + (score ? ` level-${score}` : "");
        strengthLabel.textContent = value
            ? strengthText[score]
            : "Usa letras, números y símbolos.";
    });

    /* =====================================================
       4) Validación
       ===================================================== */
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setFieldError = (input, errorEl, message) => {
        input.closest(".field").classList.toggle("has-error", Boolean(message));
        errorEl.textContent = message || "";
    };

    const validateName = () => {
        if (!nameInput.value.trim()) {
            setFieldError(nameInput, nameError, "Ingresa tu nombre completo.");
            return false;
        }
        setFieldError(nameInput, nameError, "");
        return true;
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
            setFieldError(passwordInput, passwordError, "Ingresa una contraseña.");
            return false;
        }
        if (value.length < 8) {
            setFieldError(passwordInput, passwordError, "Debe tener al menos 8 caracteres.");
            return false;
        }
        setFieldError(passwordInput, passwordError, "");
        return true;
    };

    const validateConfirm = () => {
        if (!confirmInput.value) {
            setFieldError(confirmInput, confirmError, "Confirma tu contraseña.");
            return false;
        }
        if (confirmInput.value !== passwordInput.value) {
            setFieldError(confirmInput, confirmError, "Las contraseñas no coinciden.");
            return false;
        }
        setFieldError(confirmInput, confirmError, "");
        return true;
    };

    const validateTerms = () => {
        if (!termsInput.checked) {
            termsError.textContent = "Debes aceptar los términos para continuar.";
            return false;
        }
        termsError.textContent = "";
        return true;
    };

    nameInput.addEventListener("blur", validateName);
    emailInput.addEventListener("blur", validateEmail);
    passwordInput.addEventListener("blur", validatePassword);
    confirmInput.addEventListener("blur", validateConfirm);
    termsInput.addEventListener("change", validateTerms);

    emailInput.addEventListener("input", () => emailError.textContent && validateEmail());
    passwordInput.addEventListener("input", () => passwordError.textContent && validatePassword());
    confirmInput.addEventListener("input", () => confirmError.textContent && validateConfirm());

    /* =====================================================
       5) Envío del formulario
       ===================================================== */
    const form = document.getElementById("registerForm");
    const submitBtn = document.getElementById("submitBtn");

    /* =====================================================
       6) Guardado del usuario (localStorage)
       No hay backend todavía, así que cada persona que se
       registra queda guardada en el navegador: así el
       dashboard puede saludar a cada quien por su nombre real
       en lugar de un nombre fijo.
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

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        formError.textContent = "";

        const checks = [
            validateName(),
            validateEmail(),
            validatePassword(),
            validateConfirm(),
            validateTerms()
        ];

        if (checks.includes(false)) {
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const goalInput = form.querySelector('input[name="goal"]:checked');
        const goal = goalInput ? goalInput.value : null;

        const users = getUsers();
        const existingIndex = users.findIndex((u) => u.email === email);
        const userRecord = { name, email, goal };

        if (existingIndex >= 0) {
            users[existingIndex] = userRecord;
        } else {
            users.push(userRecord);
        }

        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        localStorage.setItem(SESSION_KEY, email);

        // Si es la primera vez de este correo, arranca con datos vacíos.
        const dataKey = `fittrack_data_${email}`;
        if (!localStorage.getItem(dataKey)) {
            localStorage.setItem(dataKey, JSON.stringify({ workouts: [] }));
        }

        // Estado de carga (aquí iría la llamada real a tu API de registro)
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span><span class="btn-label">Creando cuenta…</span>';

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 900);
    });

    if (nameInput) nameInput.focus();
});