const THEME_KEY = "ks-theme";

function getPreferredTheme() {
  const storedTheme = window.localStorage.getItem(THEME_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  const resolvedTheme = theme === "dark" ? "dark" : "light";
  const root = document.documentElement;
  const body = document.body;

  root.dataset.theme = resolvedTheme;

  if (body) {
    body.classList.toggle("dark-mode", resolvedTheme === "dark");
    body.classList.toggle("light-mode", resolvedTheme === "light");
  }

  document.querySelectorAll("#theme-toggle").forEach((button) => {
    button.textContent = resolvedTheme === "dark" ? "Light" : "Dark";
    button.setAttribute(
      "aria-label",
      resolvedTheme === "dark"
        ? "Switch to light theme"
        : "Switch to dark theme",
    );
    button.setAttribute(
      "aria-pressed",
      String(resolvedTheme === "dark"),
    );
    button.setAttribute(
      "title",
      resolvedTheme === "dark"
        ? "Switch to light theme"
        : "Switch to dark theme",
    );
  });
}

applyTheme(getPreferredTheme());

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;
  const nav = document.querySelector(".navbar");
  const navToggle = document.getElementById("navbar-toggle");
  const navLinks = document.getElementById("nav-links");
  const themeButtons = document.querySelectorAll("#theme-toggle");
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const colorSchemeQuery =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)");

  let currentTheme = root.dataset.theme || getPreferredTheme();

  const setTheme = (theme, persist = true) => {
    currentTheme = theme === "dark" ? "dark" : "light";
    applyTheme(currentTheme);
    if (persist) {
      window.localStorage.setItem(THEME_KEY, currentTheme);
    }
  };

  const hasStoredTheme = () => {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark";
  };

  const syncNavHeight = () => {
    if (!nav) {
      return;
    }

    root.style.setProperty("--nav-height", `${nav.offsetHeight}px`);
  };

  const syncNavState = () => {
    if (!nav) {
      return;
    }

    nav.classList.toggle("scrolled", window.scrollY > 12);
  };

  const closeMenu = () => {
    if (!navToggle || !navLinks) {
      return;
    }

    navToggle.classList.remove("active");
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    body.classList.remove("nav-open");
  };

  const openMenu = () => {
    if (!navToggle || !navLinks) {
      return;
    }

    navToggle.classList.add("active");
    navLinks.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    body.classList.add("nav-open");
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      if (navLinks.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    document.addEventListener("click", (event) => {
      if (
        !navLinks.classList.contains("open") ||
        navLinks.contains(event.target) ||
        navToggle.contains(event.target)
      ) {
        return;
      }

      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      syncNavHeight();
      if (window.innerWidth > 980) {
        closeMenu();
      }
    });
  }

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(currentTheme === "dark" ? "light" : "dark");
    });
  });

  if (colorSchemeQuery) {
    const handleColorSchemeChange = (event) => {
      if (!hasStoredTheme()) {
        applyTheme(event.matches ? "dark" : "light");
        currentTheme = root.dataset.theme;
      }
    };

    if (typeof colorSchemeQuery.addEventListener === "function") {
      colorSchemeQuery.addEventListener("change", handleColorSchemeChange);
    } else if (typeof colorSchemeQuery.addListener === "function") {
      colorSchemeQuery.addListener(handleColorSchemeChange);
    }
  }

  const getSamePageHashTarget = (link) => {
    try {
      const url = new URL(link.getAttribute("href"), window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) {
        return null;
      }

      const targetId = decodeURIComponent(url.hash.slice(1));
      return document.getElementById(targetId);
    } catch {
      return null;
    }
  };

  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    const target = getSamePageHashTarget(link);
    if (!target) {
      return;
    }

    link.addEventListener("click", (event) => {
      event.preventDefault();
      closeMenu();

      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        (nav ? nav.offsetHeight + 16 : 0);

      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });

      window.history.replaceState(null, "", `#${target.id}`);
    });
  });

  const navAnchors = Array.from(
    document.querySelectorAll(".nav-links a"),
  );

  const clearCurrentLinks = () => {
    navAnchors.forEach((link) => link.classList.remove("is-current"));
  };

  const samePageSections = navAnchors
    .map((link) => {
      const target = getSamePageHashTarget(link);
      return target ? { link, section: target } : null;
    })
    .filter(Boolean);

  if (samePageSections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) {
          return;
        }

        const activeSection = samePageSections.find(
          ({ section }) => section === visibleEntries[0].target,
        );

        if (!activeSection) {
          return;
        }

        clearCurrentLinks();
        activeSection.link.classList.add("is-current");
      },
      {
        rootMargin: "-42% 0px -42% 0px",
        threshold: [0.18, 0.36, 0.6],
      },
    );

    samePageSections.forEach(({ section }) => sectionObserver.observe(section));

    if (!window.location.hash) {
      const heroLink =
        samePageSections.find(({ section }) => section.id === "hero") ||
        samePageSections[0];
      clearCurrentLinks();
      heroLink.link.classList.add("is-current");
    }
  } else {
    navAnchors.forEach((link) => {
      try {
        const url = new URL(link.href, window.location.href);
        if (url.pathname === window.location.pathname && !url.hash) {
          link.classList.add("is-current");
        }
      } catch {
        // Ignore malformed links.
      }
    });
  }

  const revealElements = document.querySelectorAll(".reveal");
  if (!prefersReducedMotion && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("revealed"));
  }

  syncNavHeight();
  syncNavState();

  window.addEventListener("scroll", syncNavState, { passive: true });
  window.addEventListener("resize", syncNavHeight);

  // ------ Back to Top Button ------
  const backToTopBtn = document.createElement("button");
  backToTopBtn.type = "button";
  backToTopBtn.id = "back-to-top-btn";
  backToTopBtn.innerHTML = "↑";
  backToTopBtn.setAttribute("aria-label", "Back to top");
  document.body.appendChild(backToTopBtn);

  window.addEventListener("scroll", () => {
    backToTopBtn.classList.toggle("visible", window.scrollY > 300);
  }, { passive: true });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ------ Neural Network Particle Canvas ------
  if (!prefersReducedMotion) {
    const canvas = document.getElementById("neural-bg");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      let particles = [];
      let animId = null;
      const PARTICLE_COUNT = 75;
      const CONNECTION_DIST = 130;
      const dpr = window.devicePixelRatio || 1;

      function resizeCanvas() {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function createParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            r: Math.random() * 1.8 + 1.2,
          });
        }
      }

      function getColors() {
        const isDark = root.dataset.theme === "dark";
        return {
          // terracotta nodes, sage lines
          node: isDark ? "rgba(209,132,104," : "rgba(182,93,72,",
          line: isDark ? "rgba(165,180,158," : "rgba(141,160,134,",
        };
      }

      function drawParticles() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        const c = getColors();
        const w = window.innerWidth;
        const h = window.innerHeight;

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECTION_DIST) {
              const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = c.line + alpha.toFixed(3) + ")";
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }
          }
        }

        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = c.node + "0.3)";
          ctx.fill();
        }

        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }

        animId = requestAnimationFrame(drawParticles);
      }

      resizeCanvas();
      createParticles();
      drawParticles();

      window.addEventListener("resize", () => {
        if (animId) cancelAnimationFrame(animId);
        resizeCanvas();
        createParticles();
        drawParticles();
      });
    }
  }
});
