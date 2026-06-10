/**
 * Shared Main JavaScript
 * Handles global reveal animations, modals, booking integrations, and homepage interactions.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // Cache viewport height globally for scroll calculations
    let vh = window.innerHeight;
    window.addEventListener('resize', () => vh = window.innerHeight, { passive: true });
    
    // --- 1. GLOBAL REVEAL ANIMATIONS ---
    const revealOptions = {
        threshold: 0,
        rootMargin: "0px 0px -200px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        let toReveal = entries.filter(e => e.isIntersecting && !e.target.classList.contains('active'));

        if (toReveal.length > 1) {
            toReveal.sort((a, b) => {
                const rectA = a.boundingClientRect;
                const rectB = b.boundingClientRect;
                if (Math.abs(rectA.top - rectB.top) > 100) {
                    return rectA.top - rectB.top;
                }
                return rectA.left - rectB.left;
            });
        }

        toReveal.forEach((entry, index) => {
            const el = entry.target;
            if (!Array.from(el.classList).some(cls => cls.startsWith('delay-'))) {
                el.style.transitionDelay = `${index * 0.1}s`;
            }

            const images = el.tagName === 'IMG' ? [el] : Array.from(el.querySelectorAll('img'));
            const pendingImages = images.filter(img => !img.complete);

            const triggerActive = () => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => el.classList.add('active'));
                });
                revealObserver.unobserve(el);
            };

            if (pendingImages.length > 0) {
                let loadedCount = 0;
                pendingImages.forEach(img => {
                    const checkLoad = () => {
                        loadedCount++;
                        if (loadedCount === pendingImages.length) triggerActive();
                    };
                    img.addEventListener('load', checkLoad, { once: true });
                    img.addEventListener('error', checkLoad, { once: true });
                    if (img.complete) {
                        img.removeEventListener('load', checkLoad);
                        img.removeEventListener('error', checkLoad);
                        checkLoad();
                    }
                });
            } else {
                triggerActive();
            }
        });
    }, revealOptions);

    // Select reveal targets (exclude hero reveals if on homepage to let hero loader handle them)
    const isHomePage = document.getElementById('hero') !== null;
    document.querySelectorAll('.reveal').forEach(el => {
        if (isHomePage && el.closest('.hero')) return;
        revealObserver.observe(el);
    });


    // --- 2. HOMEPAGE SPECIFIC LOGIC ---
    if (isHomePage) {
        // Navigation Active State Observer
        const navOptions = { root: null, threshold: 0, rootMargin: "-80px 0px -80% 0px" };
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    if (['hero', 'highlights', 'portfolio', 'motion', 'measurements', 'digitals'].includes(id)) {
                        document.querySelectorAll('.nav-links a, .dropdown-trigger').forEach(el => el.classList.remove('active'));
                        const trigger = document.querySelector('.dropdown-trigger');
                        if (trigger) trigger.classList.add('active');
                        const subLink = document.querySelector(`.dropdown-content a[href="#${id}"], .dropdown-content a[href="index.html#${id}"]`);
                        if (subLink) subLink.classList.add('active');
                    }
                }
            });
        }, navOptions);
        document.querySelectorAll('header[id], section[id]').forEach(section => navObserver.observe(section));

        // Hero Entrance & Parallax
        const heroSection = document.getElementById('hero');
        const heroBg = document.querySelector('.hero-bg');
        const heroContent = document.querySelector('.hero-content');
        
        // Automatically extract the image URL defined in the HTML inline style
        const bgUrlMatch = heroBg.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
        const heroImgUrl = bgUrlMatch ? bgUrlMatch[1] : 'image/hero/hero.webp';
            
        const heroImgLoader = new Image();

        // Gatekeeper: Wait for a minimum time AND for the hero image to load before dismissing splash
        const splashScreen = document.getElementById('splash-screen');
        const minSplashTime = new Promise(resolve => setTimeout(resolve, 2000));
        const heroImageLoad = new Promise(resolve => {
            heroImgLoader.addEventListener('load', resolve, { once: true });
            heroImgLoader.addEventListener('error', resolve, { once: true });
            heroImgLoader.src = heroImgUrl;
            if (heroImgLoader.complete) resolve();
        });

        const triggerHeroEntrance = () => {
            heroSection.classList.add('loaded');
            document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('active'));
        };

        if (splashScreen) {
            Promise.all([minSplashTime, heroImageLoad]).then(() => {
                splashScreen.classList.add('hidden');
                document.documentElement.classList.remove('scroll-locked');
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                triggerHeroEntrance(); // Trigger hero animations AFTER splash is hidden
            });
        } else { // If splashScreen is null (internal nav), still trigger hero entrance
            heroImageLoad.then(triggerHeroEntrance);
        }

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollOffset = window.scrollY;
                    if (scrollOffset <= vh) {
                        if (scrollOffset > 0 && heroBg.style.animation !== 'none') { heroBg.style.animation = 'none'; }
                        if (window.innerWidth > 768) {
                            const scale = 1 + (scrollOffset / vh) * 0.4; 
                            const parallax = scrollOffset * 0.15;
                            heroBg.style.transform = `scale(${scale}) translate3d(0, ${parallax}px, 0)`;
                        } else {
                            const scale = 1 + (scrollOffset / vh) * 0.15;
                            heroBg.style.transform = `scale(${scale}) translateZ(0)`;
                        }
                        heroContent.style.opacity = Math.max(0, 1 - (scrollOffset / (vh * 0.6)));
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // --- 3. BACK TO TOP LOGIC ---
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        let isScrollingToTop = false;
        let scrollCheckInterval = null;
        let scrollTimeout = null;

        const evaluateBackToTop = () => {
            if (!backToTop || isScrollingToTop) return;
            if (window.scrollY > (vh * 0.5)) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        };

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            isScrollingToTop = true;
            backToTop.style.opacity = '0';
            backToTop.style.pointerEvents = 'none';
            backToTop.classList.remove('visible');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            clearInterval(scrollCheckInterval);
            clearTimeout(scrollTimeout);

            const unlockButton = () => {
                isScrollingToTop = false;
                backToTop.style.opacity = '';
                backToTop.style.pointerEvents = '';
                evaluateBackToTop();
            };

            scrollCheckInterval = setInterval(() => {
                if (window.scrollY <= 0) {
                    clearInterval(scrollCheckInterval);
                    clearTimeout(scrollTimeout);
                    unlockButton();
                }
            }, 100);

            scrollTimeout = setTimeout(() => {
                clearInterval(scrollCheckInterval);
                unlockButton();
            }, 2000);
        });

        const interruptScroll = () => {
            if (isScrollingToTop) {
                clearInterval(scrollCheckInterval);
                clearTimeout(scrollTimeout);
                isScrollingToTop = false;
                backToTop.style.opacity = '';
                backToTop.style.pointerEvents = '';
                evaluateBackToTop();
            }
        };

        window.addEventListener('touchstart', interruptScroll, { passive: true });
        window.addEventListener('wheel', interruptScroll, { passive: true });
        window.addEventListener('scroll', () => window.requestAnimationFrame(evaluateBackToTop), { passive: true });
    }

    // --- 4. IMAGE MODAL LOGIC (With Keyboard Support) ---
    const lockScroll = () => {
        document.documentElement.classList.add('scroll-locked');
        document.body.style.overflow = 'hidden';
    };
    const unlockScroll = () => {
        document.documentElement.classList.remove('scroll-locked');
        document.body.style.overflow = '';
    };

    const modal = document.getElementById("imageModal");
    if (modal) {
        const modalImg = document.getElementById("img01");
        let currentSectionImages = [];
        let currentImgIndex = 0;
        
        const updateModal = (index) => {
            currentImgIndex = index;
            const targetSrc = currentSectionImages[currentImgIndex].src;
            
            // Use modern decode API to pre-calculate image dimensions in memory
            const tempImg = new Image();
            tempImg.src = targetSrc;
            tempImg.decode().then(() => {
                modalImg.src = targetSrc;
                modalImg.alt = currentSectionImages[currentImgIndex].alt || 'Expanded portfolio image';
            }).catch(() => {
                modalImg.src = targetSrc;
            });

            document.querySelector('.modal-prev').style.visibility = currentImgIndex === 0 ? 'hidden' : 'visible';
            document.querySelector('.modal-next').style.visibility = currentImgIndex === currentSectionImages.length - 1 ? 'hidden' : 'visible';
        };

        // Filter out any image that is a brand logo (by class or by folder path)
        const galleryImages = Array.from(document.querySelectorAll('section img')).filter(img => {
            return !img.classList.contains('brand-logo') && !img.src.includes('brand_icons');
        });

        galleryImages.forEach((img) => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', (e) => {
                const parentSection = img.closest('section');
                currentSectionImages = Array.from(parentSection.querySelectorAll('img'))
                    .filter(i => !i.classList.contains('brand-logo') && !i.src.includes('brand_icons'))
                    .sort((a, b) => Math.abs(a.getBoundingClientRect().top - b.getBoundingClientRect().top) > 100 
                        ? a.getBoundingClientRect().top - b.getBoundingClientRect().top 
                        : a.getBoundingClientRect().left - b.getBoundingClientRect().left);
                modal.classList.add('show-modal');
                e.target.classList.add('freeze-hover');
                updateModal(currentSectionImages.indexOf(img));
                lockScroll();
            });
        });

        document.querySelector('.modal-prev').onclick = (e) => { e.stopPropagation(); updateModal(currentImgIndex - 1); };
        document.querySelector('.modal-next').onclick = (e) => { e.stopPropagation(); updateModal(currentImgIndex + 1); };
        modalImg.onclick = (e) => e.stopPropagation();
        
        const closeModal = () => {
            modal.classList.remove('show-modal');
            document.querySelectorAll('.freeze-hover').forEach(el => el.classList.remove('freeze-hover'));
            unlockScroll();
        };
        
        modal.onclick = closeModal;

        // Mobile Swipe Gestures
        let touchStartX = 0;
        let touchEndX = 0;

        modal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        modal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold && currentImgIndex < currentSectionImages.length - 1) {
                updateModal(currentImgIndex + 1); // Swipe Left
            }
            if (touchEndX > touchStartX + swipeThreshold && currentImgIndex > 0) {
                updateModal(currentImgIndex - 1); // Swipe Right
            }
        }, { passive: true });

        // Unified Keyboard Event Listener
        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('show-modal')) {
                if (e.key === 'Escape') closeModal();
                else if (e.key === 'ArrowLeft' && currentImgIndex > 0) updateModal(currentImgIndex - 1);
                else if (e.key === 'ArrowRight' && currentImgIndex < currentSectionImages.length - 1) updateModal(currentImgIndex + 1);
            } else {
                const compModal = document.getElementById('compCardModal');
                if (e.key === 'Escape' && compModal && compModal.classList.contains('show-modal')) {
                    compModal.classList.remove('show-modal');
                    unlockScroll();
                }
            }
        });
    }

    // --- 5. BOOKING CONFIG LINKS ---
    if (window.CLIENT_CONFIG) {
        const lnkLine = document.getElementById('link-line');
        const lnkEmail = document.getElementById('link-email');
        const lnkWa = document.getElementById('link-wa');
        const lnkIg = document.getElementById('link-ig');
        
        const setupLink = (el, url, prefix = "") => {
            if (el) {
                if (url && url.trim() !== "") {
                    el.href = prefix + url;
                } else {
                    el.style.display = "none"; // Automatically hide if client leaves it blank
                }
            }
        };

        setupLink(lnkLine, window.CLIENT_CONFIG.line);
        setupLink(lnkEmail, window.CLIENT_CONFIG.email, "mailto:");
        setupLink(lnkWa, window.CLIENT_CONFIG.whatsapp);
        setupLink(lnkIg, window.CLIENT_CONFIG.instagram);
        
        // --- 6. COMP CARD LOGIC ---
        const compCardContainer = document.getElementById('compCardContainer');
        const compCardBtn = document.getElementById('compCardBtn');
        const compCardModal = document.getElementById('compCardModal');
        const compCardImg = document.getElementById('compCardImg');
        const compCardDownload = document.getElementById('compCardDownload');

        if (compCardContainer && compCardBtn && compCardModal) {
            if (window.CLIENT_CONFIG.compCardUrl && window.CLIENT_CONFIG.compCardUrl.trim() !== "") {
                compCardBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    compCardImg.src = window.CLIENT_CONFIG.compCardUrl;
                    compCardDownload.href = window.CLIENT_CONFIG.compCardDownloadUrl || window.CLIENT_CONFIG.compCardUrl;
                    compCardModal.classList.add('show-modal');
                    lockScroll(); // Stop background scrolling
                });

                compCardModal.onclick = (e) => {
                    // Close if clicking the background, but don't close if clicking the image or download button
                    if (e.target !== compCardImg && !compCardDownload.contains(e.target)) {
                        compCardModal.classList.remove('show-modal');
                        unlockScroll();
                    }
                };
            } else {
                compCardContainer.style.display = "none"; // Hide if client has no comp card
            }
        }
    }

    // --- 7. SERVICE WORKER REGISTRATION ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(err => {
                console.log('Service Worker registration failed: ', err);
            });
        });
    }
});