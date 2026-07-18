/* =========================================================
   FitTrack Pro — main.js
   Nota: este archivo NO modifica css/style.css. Todo lo que
   necesita estilos nuevos (ej. el menú móvil) se aplica con
   estilos inline desde JS para no tocar el CSS existente.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =====================================================
       1) Año dinámico en el footer
       ===================================================== */
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    /* =====================================================
       2) Sombra en el header al hacer scroll
       ===================================================== */
    const header = document.querySelector("header");

    const updateHeaderShadow = () => {
        if (!header) return;
        if (window.scrollY > 12) {
            header.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.35)";
        } else {
            header.style.boxShadow = "none";
        }
    };

    updateHeaderShadow();
    window.addEventListener("scroll", updateHeaderShadow, { passive: true });

    /* =====================================================
       3) Menú móvil (hamburguesa)
       El CSS ya oculta .menu por debajo de 720px, así que
       aquí solo controlamos ese mismo breakpoint por JS para
       mostrar/ocultar el botón y desplegar el panel.
       ===================================================== */
    const navbar = document.querySelector(".navbar");
    const menuToggle = document.getElementById("menuToggle");
    const mainMenu = document.getElementById("mainMenu");
    const mobileQuery = window.matchMedia("(max-width: 720px)");

    if (navbar && menuToggle && mainMenu) {
        navbar.style.position = "relative";

        const closeMenu = () => {
            if (!mobileQuery.matches) return;
            mainMenu.style.display = "none";
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        };

        const openMenu = () => {
            mainMenu.style.display = "flex";
            mainMenu.style.flexDirection = "column";
            mainMenu.style.position = "absolute";
            mainMenu.style.top = "100%";
            mainMenu.style.left = "0";
            mainMenu.style.right = "0";
            mainMenu.style.gap = "1rem";
            mainMenu.style.padding = "1.5rem 2rem";
            mainMenu.style.textAlign = "center";
            mainMenu.style.background = "rgba(16, 19, 20, 0.98)";
            mainMenu.style.borderBottom = "1px solid rgba(241, 243, 236, 0.12)";
            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        };

        const applyResponsiveState = () => {
            if (mobileQuery.matches) {
                menuToggle.style.display = "inline-flex";
                menuToggle.style.alignItems = "center";
                menuToggle.style.justifyContent = "center";
                menuToggle.style.background = "transparent";
                menuToggle.style.border = "none";
                menuToggle.style.color = "#f1f3ec";
                menuToggle.style.fontSize = "1.3rem";
                menuToggle.style.cursor = "pointer";
                closeMenu();
            } else {
                menuToggle.style.display = "none";
                mainMenu.removeAttribute("style");
            }
        };

        menuToggle.addEventListener("click", () => {
            const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
            isOpen ? closeMenu() : openMenu();
        });

        // Cierra el menú al elegir una opción (mejor UX en mobile)
        mainMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        // Cierra el menú con Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeMenu();
        });

        applyResponsiveState();
        mobileQuery.addEventListener("change", applyResponsiveState);
    }

    /* =====================================================
       4) Marcador animado (scoreboard) para la sección numbers
       ===================================================== */
    const counters = document.querySelectorAll(".count");

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target, 10) || 0;

        if (prefersReducedMotion) {
            el.textContent = target;
            return;
        }

        const duration = 1200;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = Math.round(eased * target);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target;
            }
        };

        requestAnimationFrame(tick);
    };

    if (counters.length) {
        const counterObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.6 }
        );

        counters.forEach((counter) => counterObserver.observe(counter));
    }

    /* =====================================================
       5) Scroll reveal — aparición suave de secciones al
       entrar en pantalla, usando Web Animations API para no
       depender de clases nuevas en el CSS.
       ===================================================== */
    if (!prefersReducedMotion) {
        const revealSelectors = [
            ".card",
            ".about-image",
            ".about-text",
            ".preview-frame",
            ".hero-text",
            ".hero-image"
        ];

        const revealEls = document.querySelectorAll(revealSelectors.join(","));

        revealEls.forEach((el) => {
            el.style.opacity = "0";
        });

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.animate(
                        [
                            { opacity: 0, transform: "translateY(24px)" },
                            { opacity: 1, transform: "translateY(0)" }
                        ],
                        { duration: 650, easing: "ease-out", fill: "forwards" }
                    );

                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.15 }
        );

        revealEls.forEach((el) => revealObserver.observe(el));
    }

    /* =====================================================
       6) Resalta el link del menú según la sección visible
       ===================================================== */
    const sections = document.querySelectorAll("section[id], header[id]");
    const navLinks = document.querySelectorAll(".menu a");

    if (sections.length && navLinks.length) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    navLinks.forEach((link) => {
                        const isActive = link.getAttribute("href") === `#${entry.target.id}`;
                        link.style.color = isActive ? "#c8ff4d" : "";
                    });
                });
            },
            { threshold: 0.5 }
        );

        sections.forEach((section) => sectionObserver.observe(section));
    }
});