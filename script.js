function setupCarousel(container) {
    const track = container.querySelector('.glider');
    if (!track) return;

    const cards = Array.from(track.querySelectorAll('.carousel-item'));
    if (!cards.length) return;

    const statusEl = container.querySelector('.carousel-status');
    const prevBtn = container.querySelector('.carousel-button.prev');
    const nextBtn = container.querySelector('.carousel-button.next');
    const dotsWrapper = container.querySelector('.dots');
    const label = (statusEl?.dataset.label || container.dataset.carouselLabel || 'Item').trim() || 'Item';

    const dots = [];
    const scrollToIndex = (index) => {
        const clampedIndex = Math.min(cards.length - 1, Math.max(0, index));
        currentIndex = clampedIndex;
        updateStatus();
        updateDots();
        const target = cards[clampedIndex];
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        }
        requestAnimationFrame(updateButtons);
    };

    if (dotsWrapper) {
        dotsWrapper.setAttribute('role', dotsWrapper.getAttribute('role') || 'tablist');
        dotsWrapper.innerHTML = '';
        cards.forEach((card, idx) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', `Show ${label} ${idx + 1}`);
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
            dot.addEventListener('click', () => scrollToIndex(idx));
            dotsWrapper.appendChild(dot);
            dots.push(dot);
        });
    }

    let currentIndex = 0;

    const updateStatus = () => {
        if (statusEl) {
            statusEl.textContent = `${label} ${currentIndex + 1} of ${cards.length}`;
        }
    };

    const updateDots = () => {
        dots.forEach((dot, idx) => {
            const isActive = idx === currentIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    };

    const updateButtons = () => {
        const maxScroll = track.scrollWidth - track.clientWidth - 5;
        const scrollLeft = track.scrollLeft;
        if (prevBtn) {
            prevBtn.disabled = scrollLeft <= 0;
        }
        if (nextBtn) {
            nextBtn.disabled = scrollLeft >= maxScroll;
        }
    };

    prevBtn?.addEventListener('click', () => scrollToIndex(currentIndex - 1));
    nextBtn?.addEventListener('click', () => scrollToIndex(currentIndex + 1));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
                const idx = cards.indexOf(entry.target);
                if (idx !== -1 && idx !== currentIndex) {
                    currentIndex = idx;
                    updateStatus();
                    updateDots();
                }
            }
        });
    }, {
        root: track,
        threshold: 0.45
    });

    cards.forEach(card => observer.observe(card));
    track.addEventListener('scroll', () => {
        updateButtons();
    });
    window.addEventListener('resize', updateButtons);

    updateStatus();
    updateDots();
    updateButtons();
}

document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('navbar-toggle');
    const navLinks = document.getElementById('nav-links');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const navbar = document.querySelector('.navbar');
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const THEME_KEY = 'ks-theme';
    const prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
    let currentTheme = localStorage.getItem(THEME_KEY) || (prefersDark ? 'dark' : 'light');
    const toggleViewButtons = document.querySelectorAll('.toggle-view-btn');
    const forms = document.querySelectorAll('.neural-form');
    const sendAnalyticsEvent = (action, label) => {
        if (typeof gtag !== 'function' || !action) return;
        gtag('event', action, {
            event_category: 'interaction',
            event_label: label || action
        });
    };
    
    if (toggle && navLinks) {
        const setExpanded = (isOpen) => toggle.setAttribute('aria-expanded', String(isOpen));

        toggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            toggle.classList.toggle('active');
            setExpanded(navLinks.classList.contains('open'));
        });
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                toggle.classList.remove('active');
                setExpanded(false);
            });
        });
        
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 900 && navLinks.classList.contains('open')) {
                if (!navLinks.contains(event.target) && !toggle.contains(event.target)) {
                    navLinks.classList.remove('open');
                    toggle.classList.remove('active');
                    setExpanded(false);
                }
            }
        });
    }

    function applyNavBackground() {
        if (!navbar) return;
        const scrolled = window.scrollY > 100;
        if (currentTheme === 'light') {
            navbar.style.background = scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)';
        } else {
            navbar.style.background = scrolled ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.9)';
        }
    }

    function applyTheme(mode) {
        currentTheme = mode === 'light' ? 'light' : 'dark';
        document.body.classList.toggle('light-mode', currentTheme === 'light');
        document.body.classList.toggle('dark-mode', currentTheme === 'dark');
        const carbonBadge = document.getElementById('wcb');
        if (carbonBadge) {
            carbonBadge.classList.remove('wcb-d');
            if (currentTheme === 'dark') {
                carbonBadge.classList.add('wcb-d');
            }
        }
        if (themeToggleBtn) {
            themeToggleBtn.textContent = currentTheme === 'light' ? '☀️' : '🌙';
            themeToggleBtn.setAttribute('aria-label', currentTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
            themeToggleBtn.setAttribute('aria-pressed', currentTheme === 'light' ? 'true' : 'false');
        }
        localStorage.setItem(THEME_KEY, currentTheme);
        applyNavBackground();
    }

    applyTheme(currentTheme);

    themeToggleBtn?.addEventListener('click', () => {
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    window.addEventListener('scroll', applyNavBackground);

    // ------ Initialize Carousels ------
    document.querySelectorAll('.glider-contain.neural-carousel').forEach(setupCarousel);

    // ------ Neural dots and smooth scrolling ------
    const sections = document.querySelectorAll('.section');
    const sectionNames = ['hero', 'about', 'experience', 'education', 'research', 'projects', 'contact'];

    // Intersection Observer for active section
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                const sectionIndex = sectionNames.indexOf(sectionId);
                if (sectionIndex !== -1) {
                    updateActiveStates(sectionIndex);
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Neural dots active state
    function updateActiveStates(currentSectionIndex) {
        if (currentSectionIndex < 0) {
            return;
        }
        const allDots = document.querySelectorAll('.network-dot');
        const nextSectionIndex = (currentSectionIndex + 1) % sectionNames.length;
        allDots.forEach((dot, index) => {
            const globalIndex = index % sectionNames.length;
            dot.classList.remove('active', 'next-active');
            if (globalIndex === currentSectionIndex) {
                dot.classList.add('active');
                dot.setAttribute('aria-pressed', 'true');
            } else if (globalIndex === nextSectionIndex) {
                dot.classList.add('next-active');
                dot.setAttribute('aria-pressed', 'false');
            } else {
                dot.setAttribute('aria-pressed', 'false');
            }
        });
    }

    const getOffset = () => (navbar ? navbar.offsetHeight + 12 : 0);
    const scrollToTarget = (target) => {
        if (!target) return;
        const top = target.getBoundingClientRect().top + window.scrollY - getOffset();
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    // Click handlers for neural dots
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('network-dot')) {
            const sectionName = e.target.dataset.section;
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                e.preventDefault();
                scrollToTarget(targetSection);
            }
        }
    });

    // Smooth scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                e.preventDefault();
                scrollToTarget(targetSection);
            }
        });
    });

    // ------ Back to Top Button ------
    // Insert the button if not already present
    if (!document.getElementById('back-to-top-btn')) {
        const btn = document.createElement('button');
        btn.id = "back-to-top-btn";
        btn.innerHTML = "↑";
        btn.type = "button";
        btn.style.position = "fixed";
        btn.style.bottom = "30px";
        btn.style.right = "30px";
        btn.style.display = "none";
        btn.style.zIndex = "9999";
        btn.style.border = "none";
        btn.style.background = "linear-gradient(45deg,#7776bc,#eb5e28)";
        btn.style.color = "#fff";
        btn.style.fontSize = "2rem";
        btn.style.padding = "0.7em 1em";
        btn.style.borderRadius = "50%";
        btn.style.boxShadow = "0 4px 32px #7776bc77";
        btn.style.cursor = "pointer";
        btn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(btn);
    }

    const backToTopBtn = document.getElementById("back-to-top-btn");
    window.addEventListener('scroll', function () {
        if (window.scrollY > 120) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    });
    backToTopBtn.onclick = function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ------ Neural connection lines (if needed) ------
    function createConnectionLines() {
        const networkSvgs = document.querySelectorAll('.network-svg');
        networkSvgs.forEach((svg, sectionIndex) => {
            svg.innerHTML = ''; // Clear existing lines
        const dots = svg.parentElement.querySelectorAll('.network-dot');
        if (!dots.length) {
            return;
        }
            const svgRect = svg.getBoundingClientRect();
            const dotsContainer = svg.parentElement.querySelector('.network-dots');
            const dotsRect = dotsContainer.getBoundingClientRect();
            // Calculate positions relative to SVG
            const dotPositions = Array.from(dots).map((dot, index) => {
                const dotRect = dot.getBoundingClientRect();
                return {
                    x: dotRect.left - svgRect.left + dotRect.width / 2,
                    y: dotsRect.top - svgRect.top + dotRect.height / 2
                };
            });
            // Create connections from current section to next section
            const currentDotIndex = sectionIndex;
            const nextSectionIndex = (sectionIndex + 1) % sectionNames.length;
            if (currentDotIndex !== nextSectionIndex) {
                for (let i = 0; i < 3; i++) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const startX = dotPositions[currentDotIndex].x;
                    const startY = dotPositions[currentDotIndex].y;
                    const endX = dotPositions[nextSectionIndex].x;
                    const endY = dotPositions[nextSectionIndex].y;
                    const controlY = startY - 60 - (i * 20);
                    const pathData = `M ${startX} ${startY} Q ${(startX + endX) / 2} ${controlY} ${endX} ${endY}`;
                    line.setAttribute('d', pathData);
                    line.classList.add('connection-line');
                    if (i === 1) {
                        line.classList.add('active');
                    }
                    svg.appendChild(line);
                }
            }
        });
    }
    window.addEventListener('load', createConnectionLines);
    window.addEventListener('resize', () => setTimeout(createConnectionLines, 100));

    // Compact view toggles
    toggleViewButtons.forEach(btn => {
        const targetId = btn.dataset.target;
        const target = document.getElementById(targetId);
        if (!target) return;
        btn.addEventListener('click', () => {
            const isCompact = target.classList.toggle('compact-list');
            btn.setAttribute('aria-pressed', String(isCompact));
            btn.textContent = isCompact ? 'Carousel view' : 'Compact list';
            if (btn.dataset.analytics) {
                sendAnalyticsEvent(btn.dataset.analytics, isCompact ? 'compact' : 'carousel');
            }
        });
    });

    // Inline form validation
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const setError = (field, msg) => {
        const group = field.closest('.form-group') || field.parentElement;
        let errorEl = group.querySelector('.form-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'form-error';
            group.appendChild(errorEl);
        }
        errorEl.textContent = msg;
        field.classList.toggle('input-error', Boolean(msg));
    };

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const requiredFields = form.querySelectorAll('input[required], textarea[required]');
            let hasError = false;
            requiredFields.forEach(field => {
                const value = field.value.trim();
                let msg = '';
                if (!value) {
                    msg = 'Required';
                } else if (field.type === 'email' && !emailRegex.test(value)) {
                    msg = 'Enter a valid email';
                } else if (field.name === 'subject' && value.length < 3) {
                    msg = 'Subject is too short';
                } else if (field.name === 'message' && value.length < 5) {
                    msg = 'Message is too short';
                }
                setError(field, msg);
                if (msg) {
                    hasError = true;
                }
            });
            if (hasError) {
                e.preventDefault();
                return;
            }
            sendAnalyticsEvent('contact_form_submit', 'contact form');
        });
    });

    // Generic click analytics (buttons/links with data-analytics)
    document.addEventListener('click', (event) => {
        const target = event.target.closest('[data-analytics]');
        if (!target) return;
        const action = target.dataset.analytics;
        const label = target.dataset.analyticsLabel || target.textContent.trim().slice(0, 80);
        sendAnalyticsEvent(action, label);
    });

    // ------ Scroll Progress Bar ------
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    if (scrollProgressBar && !prefersReducedMotion) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            scrollProgressBar.style.width = scrollPercent + '%';
        });
    }

    // ------ Custom Scroll Reveal Animations ------
    if (!prefersReducedMotion) {
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting) {
                    el.classList.add('revealed');
                    // Handle stagger children
                    if (el.dataset.reveal === 'stagger') {
                        const children = Array.from(el.children);
                        children.forEach((child, i) => {
                            child.style.transitionDelay = (i * 100) + 'ms';
                        });
                    }
                } else {
                    // Bidirectional: remove revealed when out of view
                    el.classList.remove('revealed');
                    if (el.dataset.reveal === 'stagger') {
                        const children = Array.from(el.children);
                        children.forEach(child => {
                            child.style.transitionDelay = '0ms';
                        });
                    }
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // If reduced motion, make everything visible immediately
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('revealed');
        });
    }

    // ====== EASTER EGGS ======

    // --- Console Easter Egg ---
    console.log('%c🧠 Hey, fellow developer! Looking under the hood?', 'font-size: 16px; color: #7776bc; font-weight: bold;');
    console.log('%cThis site was built with vanilla HTML/CSS/JS — no frameworks needed.', 'font-size: 12px; color: #689d71;');
    console.log('%c' + [
        '    ○───○───○',
        '   /|\\  |  /|\\',
        '  ○ ○ ○ ○ ○ ○ ○',
        '   \\|/ \\|/ \\|/',
        '    ○───○───○',
        '       |',
        '       ○  output',
    ].join('\n'), 'font-family: monospace; color: #d9d0de; font-size: 11px;');

    // --- Konami Code Easter Egg ---
    const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let konamiIndex = 0;
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiSequence[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiSequence.length) {
                konamiIndex = 0;
                triggerKonami();
            }
        } else {
            konamiIndex = e.key === konamiSequence[0] ? 1 : 0;
        }
    });

    function triggerKonami() {
        let overlay = document.querySelector('.konami-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'konami-overlay';
            overlay.innerHTML = '<div class="konami-msg">You found a secret! 🧠<br><span style="font-size:1rem;opacity:0.7;">↑↑↓↓←→←→BA</span></div>';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', () => overlay.classList.remove('active'));
        }
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            setTimeout(() => overlay.classList.remove('active'), 3000);
        });
    }

    // --- Profile Picture Easter Egg (5 rapid clicks) ---
    const profilePic = document.getElementById('profile-pic');
    if (profilePic) {
        let clickCount = 0;
        let clickTimer = null;
        profilePic.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { clickCount = 0; }, 800);
            if (clickCount >= 5) {
                clickCount = 0;
                profilePic.classList.add('profile-pic-spin');
                profilePic.addEventListener('animationend', () => {
                    profilePic.classList.remove('profile-pic-spin');
                }, { once: true });
            }
        });
    }

    // --- Logo Hover Secret (3+ seconds) ---
    const logoImg = document.getElementById('navbar-logo-img');
    if (logoImg) {
        let hoverTimer = null;
        logoImg.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(() => {
                logoImg.classList.add('logo-glitch');
                logoImg.addEventListener('animationend', () => {
                    logoImg.classList.remove('logo-glitch');
                }, { once: true });
            }, 3000);
        });
        logoImg.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
        });
    }

    // ====== NEURAL NETWORK PARTICLE CANVAS ======
    if (!prefersReducedMotion) {
        const canvas = document.getElementById('neural-bg');
        const heroSection = document.getElementById('hero');
        if (canvas && heroSection) {
            const ctx = canvas.getContext('2d');
            let particles = [];
            let animId = null;
            let isVisible = false;
            const PARTICLE_COUNT = 50;
            const CONNECTION_DIST = 120;

            function resizeCanvas() {
                canvas.width = heroSection.offsetWidth;
                canvas.height = heroSection.offsetHeight;
            }

            function createParticles() {
                particles = [];
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        vx: (Math.random() - 0.5) * 0.5,
                        vy: (Math.random() - 0.5) * 0.5,
                        r: Math.random() * 2 + 1.5
                    });
                }
            }

            function getColors() {
                const isLight = document.body.classList.contains('light-mode');
                return {
                    node: isLight ? 'rgba(102, 101, 168, 0.6)' : 'rgba(119, 118, 188, 0.6)',
                    line: isLight ? 'rgba(102, 101, 168, 0.12)' : 'rgba(217, 208, 222, 0.1)'
                };
            }

            function drawParticles() {
                if (!isVisible) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const colors = getColors();

                // Draw connections
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < CONNECTION_DIST) {
                            const alpha = 1 - dist / CONNECTION_DIST;
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.strokeStyle = colors.line.replace(/[\d.]+\)$/, (alpha * 0.15).toFixed(2) + ')');
                            ctx.lineWidth = 0.8;
                            ctx.stroke();
                        }
                    }
                }

                // Draw nodes
                for (const p of particles) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = colors.node;
                    ctx.fill();
                }

                // Update positions
                for (const p of particles) {
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                }

                animId = requestAnimationFrame(drawParticles);
            }

            // Only animate when hero is in viewport
            const canvasObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isVisible = entry.isIntersecting;
                    if (isVisible && !animId) {
                        drawParticles();
                    } else if (!isVisible && animId) {
                        cancelAnimationFrame(animId);
                        animId = null;
                    }
                });
            }, { threshold: 0.05 });

            canvasObserver.observe(heroSection);

            resizeCanvas();
            createParticles();

            window.addEventListener('resize', () => {
                resizeCanvas();
                createParticles();
            });
        }
    }
});
