/**
 * Shared Navigation Component
 * Injects the global navigation into the page and handles dynamic states.
 */
(function() {
    let isNavigating = false;
    const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
    const isInternalNav = sessionStorage.getItem('internalNav') === 'true';
    sessionStorage.removeItem('internalNav'); // Clean up immediately after reading

    // Bypass Splash Screen immediately if navigating back to the home page internally
    if (isHomePage && isInternalNav) {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.removeAttribute('id'); // Disconnect from main.js timer
            splash.style.display = 'none'; // Hide visually
        }
    }

    // --- 0. SPLASH SCREEN CLEANUP ---
    // Physically remove the scrollbar so the splash screen reaches absolute edge-to-edge
    if (isHomePage && !isInternalNav) {
        document.documentElement.classList.add('scroll-locked');
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    }

    // --- 1. INJECT TRANSITION CURTAIN ---
    const startClass = (!isHomePage || isInternalNav) ? 'start-covered' : '';
    const curtainHTML = `<div id="appCurtain" class="app-transition-curtain ${startClass} curtain-cover"></div>`;
    document.currentScript.insertAdjacentHTML('beforebegin', curtainHTML);

    window.addEventListener('pageshow', (e) => {
        const curtain = document.getElementById('appCurtain');
        if (curtain) {
            isNavigating = false;
            curtain.style.opacity = '';
            curtain.style.transition = '';
            // Step 1: Remove hard animation lock
            curtain.classList.remove('start-covered');
            // Step 2: Force DOM reflow so the browser guarantees the CSS transition plays
            void curtain.offsetWidth; 
            // Step 3: Trigger the elegant fade reveal
            curtain.classList.remove('curtain-cover');
            curtain.style.pointerEvents = 'none';
        }
    });

    setTimeout(() => {
        if (isNavigating) return;
        const curtain = document.getElementById('appCurtain');
        if (curtain) {
            curtain.classList.remove('start-covered', 'curtain-cover');
            curtain.style.pointerEvents = 'none';
        }
    }, 2500); // Failsafe timeout to prevent permanent blocking

    // --- 2. LINK INTERCEPTION (HYBRID TIMEOUT STRATEGY) ---
    document.addEventListener('click', (e) => {
        if (isNavigating) { e.preventDefault(); return; }

        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Guard clauses for native OS behavior
        if (
            e.ctrlKey || 
            e.shiftKey || 
            e.metaKey || 
            e.altKey ||
            link.getAttribute('target') === '_blank' ||
            link.hasAttribute('download') ||
            href.includes('mailto:') || 
            href.includes('tel:') ||
            href === '#' // Catches comp card modals
        ) return;

        // Guard clause for on-page hash routing (lets smooth scroll handle it)
        try {
            const targetUrl = new URL(link.href, window.location.origin);
            const currentUrl = new URL(window.location.href);
            if (targetUrl.pathname === currentUrl.pathname && targetUrl.hash) return;
        } catch (err) {
            return; // Fallback failsafe
        }

        // Intercept navigation
        e.preventDefault();
        const curtain = document.getElementById('appCurtain');
        if (!curtain) { window.location.href = link.href; return; }

        sessionStorage.setItem('internalNav', 'true'); // Flag that this is an internal jump

    isNavigating = true;
        curtain.style.pointerEvents = 'auto'; // Block any double-clicks instantly
        curtain.classList.add('curtain-cover');

        let navigated = false;
    const navigate = () => { 
        if (navigated) return; 
        navigated = true; 
        curtain.style.opacity = '1';
        curtain.style.transition = 'none';
        window.location.href = link.href; 
    };

    curtain.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity') navigate();
    });
        setTimeout(navigate, 1250); // 1.2s fade + 50ms buffer for absolute certainty
    });

    const currentPage = window.location.pathname.split('/').pop(); // e.g., "about.html"

    let navClass = '';
    let logoHref = 'index.html'; // Default for non-homepage

    if (isHomePage) { // Homepage specific setup
        navClass = 'on-hero'; // Apply on-hero class for transparent state
        logoHref = '#hero'; // Logo scrolls to hero section on homepage
    } else { // Non-homepage setup
        navClass = 'scrolled';
    }

    // Automatically format the document title
    const currentTitle = document.title;
    if (currentTitle.includes('|')) {
        document.title = currentTitle.split('|')[0].trim() + ' | ' + window.CLIENT_CONFIG.name;
    } else {
        document.title = currentTitle + ' | ' + window.CLIENT_CONFIG.name;
    }

    const navHTML = `
    <nav class="${navClass}">
        <a href="${logoHref}" class="logo">${window.CLIENT_CONFIG.name}</a>
        <div class="nav-links">
            <div class="dropdown">
                <a href="${logoHref}" class="dropdown-trigger">
                    <span lang="en">Home</span>
                    <span lang="th">หน้าหลัก</span>
                </a>
                <div class="dropdown-content">
                    <a href="${isHomePage ? '#highlights' : '/#highlights'}">
                        <span lang="en">Highlights</span>
                        <span lang="th">ไฮไลต์</span>
                    </a>
                    <a href="${isHomePage ? '#portfolio' : '/#portfolio'}">
                        <span lang="en">Portfolio</span>
                        <span lang="th">ผลงาน</span>
                    </a>
                    <a href="${isHomePage ? '#motion' : '/#motion'}">
                        <span lang="en">Videos</span>
                        <span lang="th">วิดีโอ</span>
                    </a>
                    <a href="${isHomePage ? '#measurements' : '/#measurements'}">
                        <span lang="en">Measurements</span>
                        <span lang="th">สัดส่วน</span>
                    </a>
                    <a href="${isHomePage ? '#digitals' : '/#digitals'}">
                        <span lang="en">Digitals</span>
                        <span lang="th">สแนปช็อต</span>
                    </a>
                </div>
            </div>
            <a href="/about.html">
                <span lang="en">About</span>
                <span lang="th">เกี่ยวกับฉัน</span>
            </a>
            <a href="/booking.html">
                <span lang="en">Booking</span>
                <span lang="th">จองคิว</span> 
            </a>
            <span class="lang-switch" id="langToggle">
                <span class="en">EN</span> / 
                <span class="th">TH</span>
            </span>
            <span class="theme-toggle" id="themeToggle">
                <span lang="en">Dark</span>
                <span lang="th">โหมดมืด</span>
            </span>
        </div>
        <div class="mobile-toggle" id="mobileToggle" role="button" aria-label="Toggle navigation" aria-expanded="false" tabindex="0">
            <span></span>
            <span></span>
        </div>
    </nav>`;

    // Inject the navigation HTML
    document.currentScript.insertAdjacentHTML('beforebegin', navHTML);

    // After injection, get the nav element
    const navElement = document.querySelector('nav');

    // Handle active class for non-homepage links
    if (!isHomePage) {
        const currentLink = navElement.querySelector(`a[href="${currentPage}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }
    }

    // Handle scroll-triggered 'scrolled' class for homepage
    if (isHomePage) {
        window.addEventListener('scroll', () => {
            window.scrollY > 50 ? navElement.classList.add('scrolled') : navElement.classList.remove('scrolled');
        }, { passive: true }); /* Unblocks iOS scrolling thread */
    }

    // Mobile Menu Logic
    const mobileToggle = navElement.querySelector('#mobileToggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navElement.classList.toggle('nav-open');
            const isOpen = navElement.classList.contains('nav-open');
            if (isOpen) {
                document.documentElement.classList.add('scroll-locked');
                document.body.style.overflow = 'hidden';
            } else {
                document.documentElement.classList.remove('scroll-locked');
                document.body.style.overflow = '';
            }
            mobileToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when a link is clicked
        navElement.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                const href = link.getAttribute('href');
                // Fix: If it's a cross-page link, DO NOT snap the menu shut. Let the curtain smoothly cover it.
                if (href && !href.startsWith('#')) return;

                navElement.classList.remove('nav-open');
                document.documentElement.classList.remove('scroll-locked');
                document.body.style.overflow = '';
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Cleanup: Ensure body scroll is restored if window is resized while menu is open
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024 && navElement.classList.contains('nav-open')) {
                navElement.classList.remove('nav-open');
                document.documentElement.classList.remove('scroll-locked');
                document.body.style.overflow = '';
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Theme Switching Logic
    const themeToggle = navElement.querySelector('#themeToggle');
    const updateThemeUI = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        const enSpan = themeToggle.querySelector('[lang="en"]');
        const thSpan = themeToggle.querySelector('[lang="th"]');
        if (theme === 'dark') {
            enSpan.textContent = 'Light';
            thSpan.textContent = 'โหมดสว่าง';
        } else {
            enSpan.textContent = 'Dark';
            thSpan.textContent = 'โหมดมืด';
        }
        localStorage.setItem('preferredTheme', theme);
    };

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        updateThemeUI(isDark ? 'light' : 'dark');
    });

    // Initialize theme on load
    updateThemeUI(localStorage.getItem('preferredTheme') || 'light');

    // Language Switching Logic
    const setLanguage = (lang) => {
        if (lang === 'th') {
            document.body.classList.add('lang-th');
        } else {
            document.body.classList.remove('lang-th');
        }
        localStorage.setItem('preferredLang', lang);
    };

    navElement.querySelector('.lang-switch .en').addEventListener('click', () => setLanguage('en'));
    navElement.querySelector('.lang-switch .th').addEventListener('click', () => setLanguage('th'));

    // Initialize language on load
    setLanguage(localStorage.getItem('preferredLang') || 'en');

    // Custom Editorial Cursor
    if (window.matchMedia("(hover: hover)").matches) {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-dot';
        document.body.appendChild(cursor);

        let cursorVisible = false;
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;
        let isCursorClicked = false;
        let currentScale = 1;

        window.addEventListener('mousemove', (e) => {
            if (!cursorVisible) {
                cursor.style.opacity = '1';
                cursorVisible = true;
            }
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        document.addEventListener('mousedown', () => isCursorClicked = true);
        document.addEventListener('mouseup', () => isCursorClicked = false);

        const renderCursor = () => {
            cursorX += (mouseX - cursorX) * 0.6; // Smoother, more elegant gliding
            cursorY += (mouseY - cursorY) * 0.6; // Smoother, more elegant gliding
            currentScale += ((isCursorClicked ? 0.7 : 1) - currentScale) * 0.4; // Softer scaling
            
            // Split translations to completely avoid calc() lag in Safari
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%) scale(${currentScale})`;
            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);

        // Event delegation for hover states
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('a, button, .dropdown-trigger, .lang-switch span, .theme-toggle, .back-to-top, .modal-nav, img:not(.brand-logo):not([src*="brand_icons"]), .mobile-toggle')) {
                cursor.classList.add('hover');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            // Only remove hover if we are actually leaving the interactive element entirely
            if (!e.relatedTarget || !e.relatedTarget.closest('a, button, .dropdown-trigger, .lang-switch span, .theme-toggle, .back-to-top, .modal-nav, img:not(.brand-logo):not([src*="brand_icons"]), .mobile-toggle')) {
                cursor.classList.remove('hover');
            }
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            cursorVisible = false;
        });
        
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            cursorVisible = true;
        });
    }

    // Dynamic Layout-Aware Smooth Scroll & Hash Navigation Fix (Homepage Only)
    if (isHomePage) {
        document.addEventListener('DOMContentLoaded', () => {
            // 1. Intercept standard on-page clicks
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                if (anchor.classList.contains('back-to-top')) return;
                
                anchor.addEventListener('click', function(e) {
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        e.preventDefault();
                        
                        const executeScroll = () => {
                            history.replaceState(null, null, targetId);

                            // Actively track and seamlessly correct the scroll destination if lazy images push the layout down
                            let isUserScrolling = false;
                            const stopCorrection = () => isUserScrolling = true;
                            ['wheel', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
                                window.addEventListener(evt, stopCorrection, { once: true, passive: true });
                            });

                            let currentY = window.scrollY;
                            let lastTime = performance.now();

                            const scrollLoop = (time) => {
                                if (isUserScrolling) return;

                                const dt = time - lastTime;
                                lastTime = time;

                                // Continuously calculate the target destination in case lazy images expand above it
                                const targetY = targetElement.getBoundingClientRect().top + window.scrollY - 64;
                                const diff = targetY - currentY;

                                if (Math.abs(diff) < 1) {
                                    window.scrollTo(0, targetY);
                                    return;
                                }

                                // Framerate-independent lerp (Linear Interpolation) for buttery smooth gliding
                                // This natively absorbs layout shifts without glitching the native scrolling engine
                                const lerpFactor = 1 - Math.exp(-0.002 * dt); // Optimized sweet spot for smooth but responsive gliding
                                currentY += diff * lerpFactor;
                                
                                window.scrollTo(0, currentY);

                                requestAnimationFrame(scrollLoop);
                            };

                            requestAnimationFrame((time) => {
                                lastTime = time;
                                scrollLoop(time);
                            });
                        };

                        if (navElement.classList.contains('nav-open')) {
                            navElement.classList.remove('nav-open');
                            document.documentElement.classList.remove('scroll-locked');
                            document.body.style.overflow = '';
                            // Delay scroll by 100ms to prevent iOS Safari compositor crash after body unlock reflow
                            setTimeout(executeScroll, 100);
                        } else {
                            executeScroll();
                        }
                    }
                });
            });

            // 2. Fix cross-page navigation when arriving with a hash (e.g. index.html#motion)
            if (window.location.hash) {
                const targetElement = document.querySelector(window.location.hash);
                
                if (targetElement) {
                    let isUserScrolling = false;
                    
                    // Stop correcting if the user manually tries to scroll
                    const stopCorrection = () => isUserScrolling = true;
                    ['wheel', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
                        window.addEventListener(evt, stopCorrection, { once: true, passive: true });
                    });

                    let trackingActive = true;
                    
                    const trackTarget = () => {
                        if (isUserScrolling || !trackingActive) return;
                        
                        const rectTop = targetElement.getBoundingClientRect().top;
                        
                        // If layout shifts push the target away from the header, immediately correct it
                        if (Math.abs(rectTop - 64) > 2) {
                            window.scrollTo(0, rectTop + window.scrollY - 64);
                        }
                        
                        if (trackingActive) {
                            requestAnimationFrame(trackTarget);
                        }
                    };

                    // Start stapling the viewport to the target immediately
                    trackTarget();

                    // Safely disconnect the tracker once the page fully resolves
                    window.addEventListener('load', () => { 
                        setTimeout(() => trackingActive = false, 500); // Allow brief buffer for final renders
                    });
                    
                    // Failsafe disconnect after 3 seconds
                    setTimeout(() => trackingActive = false, 3000);
                }
            }
        });
    }

    // Auto-inject Config Data into HTML placeholders
    document.addEventListener('DOMContentLoaded', () => {
        const inject = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        inject('clientNameHero', window.CLIENT_CONFIG.name);
        inject('splashClientName', window.CLIENT_CONFIG.name);
        inject('taglineEn', window.CLIENT_CONFIG.taglineEn);
        inject('taglineTh', window.CLIENT_CONFIG.taglineTh);
        
        if (window.CLIENT_CONFIG.measurements) {
            inject('val-height', window.CLIENT_CONFIG.measurements.height);
            inject('val-bust', window.CLIENT_CONFIG.measurements.bust);
            inject('val-waist', window.CLIENT_CONFIG.measurements.waist);
            inject('val-hips', window.CLIENT_CONFIG.measurements.hips);
            inject('val-shoes', window.CLIENT_CONFIG.measurements.shoes);
            inject('val-hairEn', window.CLIENT_CONFIG.measurements.hairEn);
            inject('val-hairTh', window.CLIENT_CONFIG.measurements.hairTh);
            inject('val-eyesEn', window.CLIENT_CONFIG.measurements.eyesEn);
            inject('val-eyesTh', window.CLIENT_CONFIG.measurements.eyesTh);
        }
    });
})();