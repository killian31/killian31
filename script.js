function setupGliderCarousel(gliderSelector, prevSelector, nextSelector, dotsSelector, slidesToShow = 2) {
    const gliderElem = document.querySelector(gliderSelector);
    if (!gliderElem) return;
    
    const prevBtn = document.querySelector(prevSelector);
    const nextBtn = document.querySelector(nextSelector);

    // Determine initial slides to show based on screen size
    const getInitialSlidesToShow = () => {
        if (window.innerWidth <= 600) return 1;
        if (window.innerWidth <= 900) return 1;
        return slidesToShow;
    };

    const glider = new Glider(gliderElem, {
        slidesToShow: getInitialSlidesToShow(),
        slidesToScroll: 1,
        draggable: true,
        dots: dotsSelector,
        arrows: {
            prev: prevSelector,
            next: nextSelector
        },
        responsive: [
            {
                breakpoint: 900,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    draggable: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    draggable: true
                }
            }
        ]
    });

    // Enhanced arrow disabling logic
    function updateArrows() {
        const currentSlide = glider.page;
        const totalSlides = glider.slides.length;
        const visibleSlides = glider.opt.slidesToShow;
        
        // Update button states
        if (prevBtn) {
            prevBtn.disabled = (currentSlide === 0);
            prevBtn.classList.toggle('disabled', currentSlide === 0);
        }
        
        if (nextBtn) {
            const isAtEnd = (currentSlide + visibleSlides) >= totalSlides;
            nextBtn.disabled = isAtEnd;
            nextBtn.classList.toggle('disabled', isAtEnd);
        }
    }

    // Event listeners for glider updates
    gliderElem.addEventListener('glider-animated', function() {
        setTimeout(updateArrows, 10);
    });

    gliderElem.addEventListener('glider-loaded', function() {
        setTimeout(updateArrows, 10);
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Force glider to recalculate
            glider.refresh(true);
            setTimeout(updateArrows, 50);
        }, 150);
    });

    // Initial setup
    setTimeout(() => {
        updateArrows();
    }, 100);

    // Touch event handling for better mobile experience
    if (window.innerWidth <= 900) {
        let startX = 0;
        let scrollLeft = 0;
        let isDown = false;

        gliderElem.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - gliderElem.offsetLeft;
            scrollLeft = gliderElem.scrollLeft;
        });

        gliderElem.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.touches[0].pageX - gliderElem.offsetLeft;
            const walk = (x - startX) * 2;
            gliderElem.scrollLeft = scrollLeft - walk;
        });

        gliderElem.addEventListener('touchend', () => {
            isDown = false;
        });

        // Prevent context menu on long press
        gliderElem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    return glider;
}

document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('navbar-toggle');
    const navLinks = document.getElementById('nav-links');
    
    toggle.addEventListener('click', function () {
        navLinks.classList.toggle('open');
        toggle.classList.toggle('active'); // Add this line for animation
    });
    
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            toggle.classList.remove('active'); // Add this line
        });
    });
    
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 900) {
            if (
                !navLinks.contains(event.target) &&
                !toggle.contains(event.target) &&
                navLinks.classList.contains('open')
            ) {
                navLinks.classList.remove('open');
                toggle.classList.remove('active'); // Add this line
            }
        }
    });

    // ------ Initialize Carousels ------
    if (window.Glider) {
        setupGliderCarousel('#research-glider', '#research-prev', '#research-next', '#research-dots', 2);
        setupGliderCarousel('#projects-glider', '#projects-prev', '#projects-next', '#projects-dots', 2);
    }

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
                updateActiveStates(sectionIndex);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Neural dots active state
    function updateActiveStates(currentSectionIndex) {
        const allDots = document.querySelectorAll('.network-dot');
        const nextSectionIndex = (currentSectionIndex + 1) % sectionNames.length;
        allDots.forEach((dot, index) => {
            const globalIndex = index % sectionNames.length;
            dot.classList.remove('active', 'next-active');
            if (globalIndex === currentSectionIndex) {
                dot.classList.add('active');
            } else if (globalIndex === nextSectionIndex) {
                dot.classList.add('next-active');
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

