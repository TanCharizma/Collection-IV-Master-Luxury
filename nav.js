/**
 * Shared Navigation Component
 * Injects the global navigation into the page and handles dynamic states.
 */
(function() {
    let isNavigating = false;
    const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
    const isInternalNav = sessionStorage.getItem('internalNav_Luxury') === 'true';
    sessionStorage.removeItem('internalNav_Luxury'); // Clean up immediately after reading
    const pendingAnchor = sessionStorage.getItem('pendingAnchor_Luxury');
    sessionStorage.removeItem('pendingAnchor_Luxury');

    // Bypass Splash Screen immediately if navigating back to the home page internally
    if (isHomePage && isInternalNav) {
        document.documentElement.classList.remove('splash-active');
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) themeColor.setAttribute('content', '#FCFBF9');
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

        sessionStorage.setItem('internalNav_Luxury', 'true'); // Flag that this is an internal jump
        let navigationHref = link.href;
        try {
            const targetUrl = new URL(link.href, window.location.origin);
            const targetPath = targetUrl.pathname.split('/').pop() || 'index.html';
            if (targetUrl.hash && targetPath === 'index.html') {
                sessionStorage.setItem('pendingAnchor_Luxury', targetUrl.hash);
                targetUrl.hash = '';
                navigationHref = targetUrl.href;
            }
        } catch (err) {}

    isNavigating = true;
        curtain.style.pointerEvents = 'auto'; // Block any double-clicks instantly
        curtain.classList.add('curtain-cover');

        let navigated = false;
    const navigate = () => { 
        if (navigated) return; 
        navigated = true; 
        curtain.style.opacity = '1';
        curtain.style.transition = 'none';
        window.location.href = navigationHref;
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

    // Shared Collection IV Anchor Glide + Mobile Menu Logic
    const mobileToggle = navElement.querySelector('#mobileToggle');
    const getHeaderOffset = () => Math.ceil((navElement && navElement.getBoundingClientRect().height) || 64);
    const getAnchorTargetY = (targetElement) => {
        const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
        return Math.max(0, targetTop - getHeaderOffset() - 10);
    };
    let savedInlineScrollBehavior = null;
    const forceInstantScrollBehavior = () => {
        const root = document.documentElement;
        if (savedInlineScrollBehavior === null) savedInlineScrollBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
    };
    const restoreInstantScrollBehavior = () => {
        if (savedInlineScrollBehavior === null) return;
        const root = document.documentElement;
        if (savedInlineScrollBehavior) root.style.scrollBehavior = savedInlineScrollBehavior;
        else root.style.removeProperty('scroll-behavior');
        savedInlineScrollBehavior = null;
    };
    const instantScrollTo = (top) => {
        forceInstantScrollBehavior();
        window.scrollTo(0, top);
        restoreInstantScrollBehavior();
    };
    const closeMobileMenu = () => {
        navElement.classList.remove('nav-open');
        document.documentElement.classList.remove('scroll-locked');
        document.body.style.overflow = '';
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
    };
    const runAfterViewportSettles = (callback, delay = 0) => {
        const run = () => requestAnimationFrame(() => requestAnimationFrame(callback));
        delay > 0 ? setTimeout(run, delay) : run();
    };
    let activeAnchorScroll = 0;
    function scrollToAnchor(targetId, behavior = 'smooth') {
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;

        const scrollRun = ++activeAnchorScroll;
        history.replaceState(null, null, targetId);

        if (behavior === 'auto' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            instantScrollTo(getAnchorTargetY(target));
            return;
        }

        forceInstantScrollBehavior();
        const restoreScrollBehavior = () => {
            if (scrollRun !== activeAnchorScroll) return;
            restoreInstantScrollBehavior();
        };

        let isUserScrolling = false;
        const stopCorrection = () => {
            isUserScrolling = true;
            restoreScrollBehavior();
        };
        ['wheel', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
            window.addEventListener(evt, stopCorrection, { once: true, passive: true });
        });

        const startTime = performance.now();
        const minTrackTime = window.innerWidth <= 768 ? 1100 : 650;
        let stableFrames = 0;
        let lastTime = startTime;
        let currentY = window.scrollY;

        const scrollLoop = (time) => {
            if (isUserScrolling || scrollRun !== activeAnchorScroll) {
                restoreScrollBehavior();
                return;
            }

            const isMobileScroll = window.innerWidth <= 768;
            const dt = Math.min(isMobileScroll ? 24 : 32, time - lastTime || 16);
            lastTime = time;
            const targetY = getAnchorTargetY(target);
            const diff = targetY - currentY;
            const elapsed = time - startTime;
            const distance = Math.abs(diff);
            const stopThreshold = isMobileScroll ? 0.8 : 0.6;

            if (distance < stopThreshold) {
                stableFrames++;
                if (isMobileScroll) {
                    if (elapsed >= minTrackTime && stableFrames >= 5) {
                        restoreScrollBehavior();
                        return;
                    }
                    requestAnimationFrame(scrollLoop);
                    return;
                }

                window.scrollTo(0, targetY);
                if (elapsed >= minTrackTime && stableFrames >= 8) {
                    restoreScrollBehavior();
                    return;
                }
                requestAnimationFrame(scrollLoop);
                return;
            }

            stableFrames = 0;
            const lerpFactor = 1 - Math.exp(-0.002 * dt);
            currentY += diff * lerpFactor;
            window.scrollTo(0, currentY);
            requestAnimationFrame(scrollLoop);
        };

        requestAnimationFrame((time) => {
            lastTime = time;
            scrollLoop(time);
        });
    }
    const glideToAnchor = (targetId, delay = 0) => runAfterViewportSettles(() => scrollToAnchor(targetId), delay);
    window.FolioLabScrollToAnchor = glideToAnchor;
    window.LuxuryScrollToAnchor = glideToAnchor;

    let menuTouchStartX = 0;
    let menuTouchStartY = 0;
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

        const navLinks = navElement.querySelector('.nav-links');
        if (navLinks) {
            navLinks.addEventListener('click', (e) => {
                if (e.target.closest('a, .lang-switch, .theme-toggle')) return;
                closeMobileMenu();
            });

            navLinks.addEventListener('touchstart', (e) => {
                if (!navElement.classList.contains('nav-open') || e.touches.length !== 1) return;
                menuTouchStartX = e.touches[0].screenX;
                menuTouchStartY = e.touches[0].screenY;
            }, { passive: true });

            navLinks.addEventListener('touchend', (e) => {
                if (!navElement.classList.contains('nav-open') || !e.changedTouches.length) return;
                const deltaX = e.changedTouches[0].screenX - menuTouchStartX;
                const deltaY = e.changedTouches[0].screenY - menuTouchStartY;
                if (deltaX > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) closeMobileMenu();
            }, { passive: true });
        }

        // Close menu when a link is clicked
        navElement.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                const href = link.getAttribute('href');
                // Fix: If it's a cross-page link, DO NOT snap the menu shut. Let the curtain smoothly cover it.
                if (href && (href.startsWith('#') || (isHomePage && href.startsWith('index.html#')))) return;
                if (href && !href.startsWith('#')) return;

                closeMobileMenu();
            });
        });

        // Cleanup: Ensure body scroll is restored if window is resized while menu is open
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024 && navElement.classList.contains('nav-open')) {
                closeMobileMenu();
            }
        });
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link || link.classList.contains('back-to-top')) return;

        const href = link.getAttribute('href');
        const isSamePageHash = href && (href.startsWith('#') || (isHomePage && href.startsWith('index.html#')));
        if (!isSamePageHash) return;

        const targetId = href.substring(href.indexOf('#'));
        if (!document.querySelector(targetId)) return;

        e.preventDefault();
        const wasMenuOpen = navElement.classList.contains('nav-open');
        if (wasMenuOpen) closeMobileMenu();
        glideToAnchor(targetId, wasMenuOpen ? 320 : 0);
    });

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

    // Dynamic Layout-Aware Hash Navigation Fix (Homepage Only)
    if (isHomePage) {
        window.addEventListener('load', () => {
            const targetHash = pendingAnchor || window.location.hash;
            if (targetHash) {
                glideToAnchor(targetHash, isInternalNav || pendingAnchor ? 420 : 160);
            }
        }, { once: true });
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
