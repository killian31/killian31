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

    // Click handlers for neural dots
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('network-dot')) {
            const sectionName = e.target.dataset.section;
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
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
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.9)';
        }
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
        btn.style.background = "linear-gradient(45deg,#00f5ff,#ff00ff)";
        btn.style.color = "#fff";
        btn.style.fontSize = "2rem";
        btn.style.padding = "0.7em 1em";
        btn.style.borderRadius = "50%";
        btn.style.boxShadow = "0 4px 32px #00f5ff77";
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
});
