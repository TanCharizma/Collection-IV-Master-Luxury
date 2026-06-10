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
            if (window.FolioLabScrollToAnchor) {
                window.FolioLabScrollToAnchor('#hero');
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
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
    let scrollLockState = null;
    const lockScroll = () => {
        if (scrollLockState) return;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        const body = document.body;
        const root = document.documentElement;
        scrollLockState = {
            scrollY: window.scrollY,
            rootOverflow: root.style.overflow,
            rootScrollBehavior: root.style.scrollBehavior,
            bodyPosition: body.style.position,
            bodyTop: body.style.top,
            bodyLeft: body.style.left,
            bodyRight: body.style.right,
            bodyWidth: body.style.width,
            bodyOverflow: body.style.overflow,
            bodyPaddingRight: body.style.paddingRight
        };
        document.documentElement.classList.add('scroll-locked');
        root.style.overflow = 'hidden';
        root.style.scrollBehavior = 'auto';
        body.style.position = 'fixed';
        body.style.top = `-${scrollLockState.scrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.width = '100%';
        body.style.overflow = 'hidden';
        body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
    };
    const unlockScroll = () => {
        if (!scrollLockState) return;
        const body = document.body;
        const root = document.documentElement;
        const scrollY = scrollLockState.scrollY;
        const rootScrollBehavior = scrollLockState.rootScrollBehavior;
        document.documentElement.classList.remove('scroll-locked');
        root.style.overflow = scrollLockState.rootOverflow;
        root.style.scrollBehavior = 'auto';
        body.style.position = scrollLockState.bodyPosition;
        body.style.top = scrollLockState.bodyTop;
        body.style.left = scrollLockState.bodyLeft;
        body.style.right = scrollLockState.bodyRight;
        body.style.width = scrollLockState.bodyWidth;
        body.style.overflow = scrollLockState.bodyOverflow;
        body.style.paddingRight = scrollLockState.bodyPaddingRight;
        scrollLockState = null;
        window.scrollTo(0, scrollY);
        if (rootScrollBehavior) root.style.scrollBehavior = rootScrollBehavior;
        else root.style.removeProperty('scroll-behavior');
    };
    const attachSwipeDownToClose = ({ modalElement, dragElement, closeModal, ignoreElement, allowHorizontalSwipe = false, onHorizontalSwipe, getDragCenterY = () => '-50%' }) => {
        if (!modalElement || !dragElement) return;
        let touchStartX = 0;
        let touchStartY = 0;
        let activeGesture = null;
        let isDragging = false;
        const closeThreshold = 95;
        const horizontalThreshold = 50;
        modalElement.addEventListener('touchstart', e => {
            if (e.touches.length > 1) return;
            if (ignoreElement && e.target.closest && e.target.closest(ignoreElement)) return;
            touchStartX = e.touches[0].screenX;
            touchStartY = e.touches[0].screenY;
            activeGesture = null;
            isDragging = true;
            dragElement.style.transition = 'none';
        }, { passive: true });
        modalElement.addEventListener('touchmove', e => {
            e.preventDefault();
            if (!isDragging || e.touches.length > 1) return;
            const deltaX = e.touches[0].screenX - touchStartX;
            const deltaY = e.touches[0].screenY - touchStartY;
            if (!activeGesture) {
                if (Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12) return;
                if (deltaY > 18 && Math.abs(deltaY) > Math.abs(deltaX) * 1.8) activeGesture = 'vertical';
                else if (Math.abs(deltaX) > 16 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) activeGesture = 'horizontal';
                else return;
            }
            if (activeGesture === 'vertical') {
                const dragY = Math.max(0, deltaY);
                const scale = Math.max(0.94, 1 - dragY / 1800);
                dragElement.style.transform = `translate(-50%, calc(${getDragCenterY()} + ${dragY * 0.72}px)) scale(${scale})`;
                dragElement.style.opacity = `${Math.max(0.35, 1 - dragY / 260)}`;
                return;
            }
            if (allowHorizontalSwipe) {
                dragElement.style.transform = `translate(calc(-50% + ${deltaX * 0.6}px), ${getDragCenterY()})`;
                dragElement.style.opacity = `${Math.max(0.3, 1 - Math.abs(deltaX) / window.innerWidth)}`;
            }
        }, { passive: false });
        modalElement.addEventListener('touchend', e => {
            if (!isDragging) return;
            isDragging = false;
            const touch = e.changedTouches[0];
            const deltaX = touch.screenX - touchStartX;
            const deltaY = touch.screenY - touchStartY;
            const wasVertical = activeGesture === 'vertical';
            activeGesture = null;
            if (wasVertical && deltaY > closeThreshold && Math.abs(deltaY) > Math.abs(deltaX)) {
                dragElement.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
                dragElement.style.transform = 'translate(-50%, 35%) scale(0.96)';
                dragElement.style.opacity = '0';
                setTimeout(closeModal, 160);
                return;
            }
            if (!wasVertical && allowHorizontalSwipe && typeof onHorizontalSwipe === 'function' && Math.abs(deltaX) > horizontalThreshold) {
                onHorizontalSwipe(deltaX);
                return;
            }
            dragElement.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease';
            dragElement.style.transform = `translate(-50%, ${getDragCenterY()})`;
            dragElement.style.opacity = '1';
        }, { passive: true });
    };

    const modal = document.getElementById("imageModal");
    if (modal) {
        const modalImg = document.getElementById("img01");
        const modalCaption = document.getElementById("imageModalCaption");
        const modalCaptionKicker = document.getElementById("imageModalCaptionKicker");
        const modalCaptionEn = document.getElementById("imageModalCaptionEn");
        const modalCaptionTh = document.getElementById("imageModalCaptionTh");
        const modalCaptionToggle = document.getElementById("imageModalCaptionToggle");
        const modalCaptionToggleEn = document.getElementById("imageModalCaptionToggleEn");
        const modalCaptionToggleTh = document.getElementById("imageModalCaptionToggleTh");
        const modalFullscreenToggle = document.getElementById("imageModalFullscreenToggle");
        const modalFullscreenToggleEn = document.getElementById("imageModalFullscreenToggleEn");
        const modalFullscreenToggleTh = document.getElementById("imageModalFullscreenToggleTh");
        const modalPrev = document.querySelector('.modal-prev');
        const modalNext = document.querySelector('.modal-next');
        let currentSectionImages = [];
        let currentImgIndex = 0;
        let visitorCaptionsEnabled = localStorage.getItem('imageCaptionsVisible') !== 'false';
        let currentCaptionSrc = '';
        let modalIsImmersive = false;
        const getModalCenterY = () => (modal.classList.contains('has-caption') && window.innerWidth <= 768 ? '-52%' : '-50%');
        const getModalRestTransform = (scale = '') => `translate(-50%, ${getModalCenterY()})${scale}`;
        const getModalOffsetTransform = (offsetX) => `translate(calc(-50% + ${offsetX}px), ${getModalCenterY()})`;
        const normalizeCaptionPath = (src) => {
            try { return new URL(src, window.location.href).pathname.replace(/^\/+/, ''); }
            catch (error) { return src.replace(/^\/+/, ''); }
        };
        const updateCaption = (src) => {
            if (!modalCaption) return;
            const captionsEnabled = window.CLIENT_CONFIG && window.CLIENT_CONFIG.showImageCaptions === true;
            const captions = (window.CLIENT_CONFIG && window.CLIENT_CONFIG.imageCaptions) || {};
            const caption = captions[normalizeCaptionPath(src)];
            const hasCaptionData = !!(caption && ((caption.en && caption.en.trim()) || (caption.th && caption.th.trim())));
            const shouldShowCaption = captionsEnabled && visitorCaptionsEnabled && hasCaptionData;
            currentCaptionSrc = src;
            if (modalCaptionToggle) {
                modalCaptionToggle.classList.toggle('visible', captionsEnabled && hasCaptionData);
                modalCaptionToggle.setAttribute('aria-pressed', visitorCaptionsEnabled ? 'true' : 'false');
            }
            if (modalCaptionToggleEn) modalCaptionToggleEn.textContent = visitorCaptionsEnabled ? 'Captions: On' : 'Captions: Off';
            if (modalCaptionToggleTh) modalCaptionToggleTh.textContent = visitorCaptionsEnabled ? 'คำบรรยาย: เปิด' : 'คำบรรยาย: ปิด';
            modal.classList.toggle('has-caption-controls', captionsEnabled && hasCaptionData);
            modal.classList.toggle('has-caption', shouldShowCaption);
            modalCaption.classList.toggle('visible', shouldShowCaption);
            modalCaption.setAttribute('aria-hidden', shouldShowCaption ? 'false' : 'true');
            if (modal.classList.contains('show-modal')) modalImg.style.transform = getModalRestTransform();
            if (!shouldShowCaption) {
                if (modalCaptionKicker) modalCaptionKicker.textContent = '';
                if (modalCaptionEn) modalCaptionEn.textContent = '';
                if (modalCaptionTh) modalCaptionTh.textContent = '';
                return;
            }
            if (modalCaptionKicker) modalCaptionKicker.textContent = caption.kicker || '';
            if (modalCaptionEn) modalCaptionEn.textContent = caption.en || '';
            if (modalCaptionTh) modalCaptionTh.textContent = caption.th || caption.en || '';
        };
        const syncFullscreenToggle = () => {
            modalIsImmersive = !!document.fullscreenElement || modal.classList.contains('is-immersive');
            if (!modalFullscreenToggle) return;
            modalFullscreenToggle.classList.toggle('visible', modal.classList.contains('show-modal') && !modalIsImmersive);
            modalFullscreenToggle.setAttribute('aria-pressed', modalIsImmersive ? 'true' : 'false');
            if (modalFullscreenToggleEn) modalFullscreenToggleEn.textContent = modalIsImmersive ? 'Exit Fullscreen' : 'Fullscreen';
            if (modalFullscreenToggleTh) modalFullscreenToggleTh.textContent = modalIsImmersive ? 'ออกจากเต็มจอ' : 'เต็มจอ';
        };
        const enterImmersiveMode = async () => {
            modal.classList.add('is-immersive');
            syncFullscreenToggle();
            if (modal.requestFullscreen) {
                try { await modal.requestFullscreen({ navigationUI: 'hide' }); } catch (error) {}
            }
        };
        const exitImmersiveMode = async () => {
            modal.classList.remove('is-immersive');
            if (document.fullscreenElement && document.exitFullscreen) {
                try { await document.exitFullscreen(); } catch (error) {}
            }
            syncFullscreenToggle();
        };
        const updateModal = (index, direction = 0, isOpening = false) => {
            const finalizeUpdate = () => {
                currentImgIndex = index;
                const newSrc = currentSectionImages[currentImgIndex].src;
                updateCaption(newSrc);
                const playAnimation = () => {
                    if (modalPrev) modalPrev.style.visibility = currentImgIndex === 0 ? 'hidden' : 'visible';
                    if (modalNext) modalNext.style.visibility = currentImgIndex === currentSectionImages.length - 1 ? 'hidden' : 'visible';
                    modalImg.style.transition = direction !== 0 || isOpening ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease' : 'none';
                    modalImg.style.transform = getModalRestTransform();
                    modalImg.style.opacity = '1';
                };
                if (modalImg.src !== newSrc) {
                    modalImg.src = newSrc;
                    modalImg.alt = currentSectionImages[currentImgIndex].alt || 'Expanded portfolio image';
                    modalImg.decode().then(playAnimation).catch(playAnimation);
                } else {
                    playAnimation();
                }
            };
            if (direction !== 0) {
                modalImg.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
                modalImg.style.transform = getModalOffsetTransform(direction * -100);
                modalImg.style.opacity = '0';
                setTimeout(finalizeUpdate, 200);
            } else {
                finalizeUpdate();
            }
        };
        const galleryImages = Array.from(document.querySelectorAll('section img')).filter(img => !img.classList.contains('brand-logo') && !img.src.includes('brand_icons'));
        galleryImages.forEach((img) => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
                img.classList.add('freeze-hover');
                setTimeout(() => img.classList.remove('freeze-hover'), 600);
                const parentSection = img.closest('section');
                currentSectionImages = Array.from(parentSection.querySelectorAll('img')).filter(i => !i.classList.contains('brand-logo') && !i.src.includes('brand_icons'));
                if (window.innerWidth > 768) {
                    currentSectionImages.sort((a, b) => Math.abs(a.getBoundingClientRect().top - b.getBoundingClientRect().top) > 100 ? a.getBoundingClientRect().top - b.getBoundingClientRect().top : a.getBoundingClientRect().left - b.getBoundingClientRect().left);
                }
                modalImg.style.transition = 'none';
                modalImg.style.transform = getModalRestTransform(' scale(0.95)');
                modalImg.style.opacity = '0';
                modal.classList.add('show-modal');
                if (modalFullscreenToggle) modalFullscreenToggle.classList.add('visible');
                syncFullscreenToggle();
                updateModal(currentSectionImages.indexOf(img), 0, true);
                lockScroll();
            });
        });
        if (modalPrev) modalPrev.onclick = (e) => { e.stopPropagation(); updateModal(currentImgIndex - 1, -1); };
        if (modalNext) modalNext.onclick = (e) => { e.stopPropagation(); updateModal(currentImgIndex + 1, 1); };
        if (modalImg) modalImg.onclick = (e) => { e.stopPropagation(); if (modalIsImmersive) exitImmersiveMode(); };
        if (modalCaption) modalCaption.onclick = (e) => e.stopPropagation();
        if (modalCaptionToggle) modalCaptionToggle.onclick = (e) => {
            e.stopPropagation();
            visitorCaptionsEnabled = !visitorCaptionsEnabled;
            localStorage.setItem('imageCaptionsVisible', visitorCaptionsEnabled ? 'true' : 'false');
            updateCaption(currentCaptionSrc);
        };
        if (modalFullscreenToggle) modalFullscreenToggle.onclick = (e) => {
            e.stopPropagation();
            modalIsImmersive ? exitImmersiveMode() : enterImmersiveMode();
        };
        const closeModal = () => {
            exitImmersiveMode();
            modal.classList.remove('show-modal', 'has-caption', 'has-caption-controls');
            document.querySelectorAll('.freeze-hover').forEach(el => el.classList.remove('freeze-hover'));
            if (modalCaption) modalCaption.classList.remove('visible');
            if (modalCaptionToggle) modalCaptionToggle.classList.remove('visible');
            if (modalFullscreenToggle) modalFullscreenToggle.classList.remove('visible');
            unlockScroll();
        };
        modal.onclick = () => modalIsImmersive ? exitImmersiveMode() : closeModal();
        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('show-modal')) {
                if (e.key === 'Escape') modalIsImmersive ? exitImmersiveMode() : closeModal();
                if (e.key === 'ArrowLeft' && currentImgIndex > 0) updateModal(currentImgIndex - 1, -1);
                if (e.key === 'ArrowRight' && currentImgIndex < currentSectionImages.length - 1) updateModal(currentImgIndex + 1, 1);
            }
        });
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) modal.classList.remove('is-immersive');
            syncFullscreenToggle();
        });
        attachSwipeDownToClose({
            modalElement: modal,
            dragElement: modalImg,
            closeModal,
            ignoreElement: '.modal-caption, .modal-caption-toggle, .modal-fullscreen-toggle, .modal-nav',
            allowHorizontalSwipe: true,
            getDragCenterY: getModalCenterY,
            onHorizontalSwipe: (deltaX) => {
                if (deltaX < 0 && currentImgIndex < currentSectionImages.length - 1) updateModal(currentImgIndex + 1, 1);
                else if (deltaX > 0 && currentImgIndex > 0) updateModal(currentImgIndex - 1, -1);
                else {
                    modalImg.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease';
                    modalImg.style.transform = getModalRestTransform();
                    modalImg.style.opacity = '1';
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

        if (compCardContainer && compCardBtn && compCardModal && compCardImg && compCardDownload) {
            const closeCompCardModal = () => {
                compCardModal.classList.remove('show-modal');
                unlockScroll();
                setTimeout(() => {
                    if (!compCardModal.classList.contains('show-modal')) {
                        compCardImg.style.transition = 'none';
                        compCardImg.style.transform = 'translate(-50%, -50%)';
                        compCardImg.style.opacity = '1';
                    }
                }, 250);
            };

            attachSwipeDownToClose({
                modalElement: compCardModal,
                dragElement: compCardImg,
                closeModal: closeCompCardModal,
                ignoreElement: '#compCardDownload'
            });

            if (window.CLIENT_CONFIG.compCardUrl && window.CLIENT_CONFIG.compCardUrl.trim() !== "") {
                compCardBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    compCardImg.src = window.CLIENT_CONFIG.compCardUrl;
                    compCardDownload.href = window.CLIENT_CONFIG.compCardDownloadUrl || window.CLIENT_CONFIG.compCardUrl;
                    const downloadUrl = compCardDownload.href || '';
                    const extension = (downloadUrl.split('?')[0].match(/\.([a-z0-9]+)$/i) || [])[1] || 'png';
                    compCardDownload.download = `${(window.CLIENT_CONFIG.name || 'client').trim().replace(/\s+/g, '-')}-comp-card.${extension}`;
                    compCardImg.style.transition = 'none';
                    compCardImg.style.transform = 'translate(-50%, -50%) scale(0.95)';
                    compCardImg.style.opacity = '0';
                    compCardModal.classList.add('show-modal');
                    lockScroll(); // Stop background scrolling

                    const playCompCardAnimation = () => {
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                compCardImg.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease';
                                compCardImg.style.transform = 'translate(-50%, -50%) scale(1)';
                                compCardImg.style.opacity = '1';
                            });
                        });
                    };
                    compCardImg.decode().then(playCompCardAnimation).catch(playCompCardAnimation);
                });

                compCardModal.onclick = (e) => {
                    // Close if clicking the background, but don't close if clicking the image or download button
                    if (e.target !== compCardImg && !compCardDownload.contains(e.target)) {
                        closeCompCardModal();
                    }
                };
            } else {
                compCardContainer.style.display = "none"; // Hide if client has no comp card
            }
        }
    }

    document.addEventListener('keydown', (e) => {
        const compModal = document.getElementById('compCardModal');
        if (e.key === 'Escape' && compModal && compModal.classList.contains('show-modal')) {
            compModal.classList.remove('show-modal');
            unlockScroll();
        }
    });

    // --- 7. SERVICE WORKER REGISTRATION ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(err => {
                console.log('Service Worker registration failed: ', err);
            });
        });
    }
});
