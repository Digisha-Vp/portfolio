/**
 * TakenRight Interactive Experience Controller
 * 
 * Features:
 * 1. Page Entrance & Scroll Reveal Orchestration (tr-ready, IntersectionObserver)
 * 2. Hero Interactive Perspective Switcher & Ambient Reassurance Badges
 * 3. Animated Research Demographic Counters (36-43%, 65%, 70%+)
 * 4. Interactive Sketch Blueprint Hotspot Explorer (Pin 1-3 & Callouts)
 * 5. Older Adult Micro-Simulators:
 *    - Plain-language Dose Confirmation with Undo window
 *    - Regional Malayalam Audio Waveform & Pharmacist Response
 *    - Bilingual Audio Plain-Language Reassurance Toggle
 * 6. Screen Marquee Reel:
 *    - Continuous ambient drift + vertical scroll-inertia coupling
 *    - Pointer scrubbing & touch drag
 *    - Journey Phase Filter Tabs (Onboarding, Routine, Add Medicine, Voice, Sharing)
 * 7. Design Decisions Interactive Sandboxes (Simulating Before vs After UX)
 * 8. Accessible Image Lightbox Modal with Keyboard Navigation
 * 9. 3D Perspective Card Tilt & Cursor Glare
 * 10. View Transitions & Smooth Outro Navigation
 */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── 1. Page Entrance Orchestration ──────────────────────────── */
  if (reduced.matches) {
    document.body.classList.add('tr-ready');
  } else {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.body.classList.add('tr-ready');
    }));
  }

  /* ── 2. Scroll-Triggered Reveals ────────────────────────────── */
  function setupScrollReveals() {
    const targets = document.querySelectorAll('.tr-head, .tr-reveal, .tr-stagger, .num, .say, .lc, .pr, .ba, .cl, .next-portal');
    if (!targets.length) return;

    if (reduced.matches) {
      targets.forEach(el => el.classList.add('in-view'));
      return;
    }

    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

    targets.forEach(el => obs.observe(el));
  }
  setupScrollReveals();

  /* ── 3. Animated Research Demographic Counters ──────────────── */
  function setupStatCounters() {
    const statsContainer = document.getElementById('researchStats');
    if (!statsContainer) return;

    const countEls = statsContainer.querySelectorAll('.stat-count');
    let animated = false;

    function runCounterAnimation() {
      if (animated) return;
      animated = true;

      countEls.forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        if (reduced.matches) {
          el.textContent = `${prefix}${target}${suffix}`;
          return;
        }

        let start = 0;
        const duration = 1400;
        const startTime = performance.now();

        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          // Ease-out cubic
          const current = Math.floor((1 - Math.pow(1 - progress, 3)) * target);
          el.textContent = `${prefix}${current}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = `${prefix}${target}${suffix}`;
          }
        }
        requestAnimationFrame(step);
      });
    }

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        runCounterAnimation();
        obs.disconnect();
      }
    }, { threshold: 0.2 });

    obs.observe(statsContainer);
  }
  setupStatCounters();

  /* ── 4. Hero Interactive Stage & Perspective Switcher ───────── */
  function setupHeroStage() {
    const wrap = document.getElementById('heroStageWrap');
    if (!wrap) return;

    const buttons = wrap.querySelectorAll('.hero-tab-btn');
    const badges = wrap.querySelectorAll('.hero-badge');
    const noteEl = document.getElementById('heroPerspectiveNote');

    const perspectiveData = {
      all: {
        note: 'Showing how TakenRight connects all 3 roles into one supportive, non-intrusive medication experience.',
        activeBadge: null
      },
      elder: {
        note: '👴 Older Adult Perspective: Certainty that today\'s morning dose was taken, without having to guess or rely on family memory.',
        activeBadge: 'badgeElder'
      },
      caregiver: {
        note: '👨‍👧 Caregiver Perspective: Reassurance at a glance without having to call or hover over daily routines.',
        activeBadge: 'badgeCaregiver'
      },
      pharmacist: {
        note: '💊 Pharmacist Perspective: Trusted regional audio advice answering doubts like "Should I take this before or after tea?"',
        activeBadge: 'badgePharma'
      }
    };

    function selectPerspective(role) {
      buttons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-perspective') === role);
      });

      const config = perspectiveData[role] || perspectiveData.all;
      if (noteEl) {
        noteEl.style.opacity = '0';
        setTimeout(() => {
          noteEl.textContent = config.note;
          noteEl.style.opacity = '1';
        }, 150);
      }

      badges.forEach(badge => {
        if (role === 'all') {
          badge.style.opacity = '1';
          badge.style.transform = '';
        } else if (badge.id === config.activeBadge) {
          badge.style.opacity = '1';
          badge.style.transform = 'scale(1.05) translateY(-4px)';
        } else {
          badge.style.opacity = '0.35';
          badge.style.transform = 'scale(0.95)';
        }
      });
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-perspective');
        selectPerspective(role);
      });
    });

    badges.forEach(badge => {
      badge.addEventListener('click', () => {
        const role = badge.getAttribute('data-perspective');
        if (role) selectPerspective(role);
      });
      badge.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const role = badge.getAttribute('data-perspective');
          if (role) selectPerspective(role);
        }
      });
    });
  }
  setupHeroStage();

  /* ── 5. Interactive Sketch Blueprint Explorer (img2) ────────── */
  function setupSketchExplorer() {
    const explorer = document.getElementById('sketchExplorer');
    if (!explorer) return;

    const pins = explorer.querySelectorAll('.sketch-pin');
    const callouts = explorer.querySelectorAll('.sketch-callout');

    function activatePin(pinNum) {
      pins.forEach(p => {
        const isActive = p.getAttribute('data-pin') === pinNum;
        p.classList.toggle('active', isActive);
      });
      callouts.forEach(c => {
        const isActive = c.getAttribute('data-callout') === pinNum;
        c.classList.toggle('active', isActive);
      });
    }

    pins.forEach(pin => {
      pin.addEventListener('click', () => {
        const num = pin.getAttribute('data-pin');
        activatePin(num);
      });
    });

    callouts.forEach(callout => {
      callout.addEventListener('click', () => {
        const num = callout.getAttribute('data-callout');
        activatePin(num);
      });
      callout.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const num = callout.getAttribute('data-callout');
          activatePin(num);
        }
      });
    });
  }
  setupSketchExplorer();

  /* ── 6. Older Adult Micro-Simulators ─────────────────────────── */
  function setupElderSimulators() {
    // A. Dose confirmation toggle
    const confirmBtn = document.getElementById('simConfirmBtn');
    const feedback = document.getElementById('simFeedback');
    const undoBtn = document.getElementById('simUndoBtn');

    if (confirmBtn && feedback && undoBtn) {
      confirmBtn.addEventListener('click', () => {
        confirmBtn.classList.add('confirmed');
        confirmBtn.innerHTML = '<span class="btn-check">✓</span> <span>Dose Verified</span>';
        feedback.classList.remove('hidden');
      });

      undoBtn.addEventListener('click', () => {
        confirmBtn.classList.remove('confirmed');
        confirmBtn.innerHTML = '<span class="btn-check">✓</span> <span class="btn-text">Confirm Dose Taken</span>';
        feedback.classList.add('hidden');
      });
    }

    // B. Voice note waveform demo
    const voicePlayBtn = document.getElementById('voicePlayBtn');
    const waveBars = document.getElementById('voiceWaveBars');
    const voiceResponse = document.getElementById('voiceResponse');
    let isPlayingAudio = false;

    if (voicePlayBtn && waveBars && voiceResponse) {
      voicePlayBtn.addEventListener('click', () => {
        if (isPlayingAudio) return;
        isPlayingAudio = true;
        waveBars.classList.add('playing');
        voicePlayBtn.querySelector('.play-text').textContent = 'Playing...';

        setTimeout(() => {
          waveBars.classList.remove('playing');
          voicePlayBtn.querySelector('.play-text').textContent = 'Replay Note';
          voiceResponse.classList.remove('hidden');
          isPlayingAudio = false;
        }, 2200);
      });
    }

    // C. Bilingual language switcher
    const langBtns = document.querySelectorAll('.lang-tab-btn');
    const langMlView = document.getElementById('langMlView');
    const langEnView = document.getElementById('langEnView');

    if (langBtns.length && langMlView && langEnView) {
      langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          langBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const isMl = btn.getAttribute('data-lang') === 'ml';
          langMlView.classList.toggle('hidden', !isMl);
          langEnView.classList.toggle('hidden', isMl);
        });
      });
    }
  }
  setupElderSimulators();

  /* ── 7. Screen Marquee Reel with Inertia & Category Filters ─── */
  function setupScreenMarquee() {
    const marquee = document.querySelector('.marq');
    const track = document.querySelector('.mt');
    if (!marquee || !track) return;

    const firstSet = track.firstElementChild;
    if (!firstSet) return;

    // Clone set for seamless infinite wrap
    const clone = firstSet.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);

    if (reduced.matches) {
      marquee.style.overflowX = 'auto';
      return;
    }

    let offset = 0;
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let isHovered = false;
    let setWidth = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;

    function measure() {
      setWidth = firstSet.offsetWidth;
    }
    window.addEventListener('load', measure);
    window.addEventListener('resize', measure);
    measure();

    // Vertical scroll velocity coupling
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      lastScrollY = currentY;

      const rect = marquee.getBoundingClientRect();
      if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
        scrollVelocity += delta * 0.35;
        scrollVelocity = Math.max(-15, Math.min(15, scrollVelocity));
      }
    }, { passive: true });

    marquee.addEventListener('mouseenter', () => { isHovered = true; });
    marquee.addEventListener('mouseleave', () => { isHovered = false; });

    // Pointer Drag Support
    marquee.addEventListener('pointerdown', (e) => {
      // Don't drag if clicking directly on a button or link
      if (e.target.closest('button, a')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartOffset = offset;
      marquee.style.cursor = 'grabbing';
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      offset = dragStartOffset + deltaX;
    });

    window.addEventListener('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        marquee.style.cursor = '';
      }
    });

    const BASE_SPEED = 0.55;

    function animate() {
      if (!isDragging) {
        if (!isHovered) {
          scrollVelocity *= 0.93;
          offset -= (BASE_SPEED + scrollVelocity);
        } else {
          scrollVelocity *= 0.85;
          offset -= scrollVelocity;
        }

        if (setWidth > 0) {
          if (Math.abs(offset) >= setWidth) {
            offset += setWidth;
          } else if (offset > 0) {
            offset -= setWidth;
          }
        }

        track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
      }

      requestAnimationFrame(animate);
    }
    animate();

    // Category Filter Buttons
    const filterBtns = document.querySelectorAll('.marq-filter-btn');
    const images = Array.from(firstSet.querySelectorAll('img'));

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        if (filter === 'all') {
          // Ambient resume
          return;
        }

        // Find first image matching category
        const targetImg = images.find(img => img.getAttribute('data-category') === filter);
        if (targetImg && setWidth > 0) {
          const targetOffset = -(targetImg.offsetLeft);
          // Smoothly interpolate to targetOffset
          offset = targetOffset;
        }
      });
    });
  }
  setupScreenMarquee();

  /* ── 8. Design Decisions Interactive Sandboxes ──────────────── */
  function setupDecisionSandboxes() {
    // Sandbox 1: Accidental Tap vs 2-Step Confirmation
    const zone1 = document.getElementById('dsZone1');
    const toggleBtns1 = document.querySelectorAll('#decisionSandbox1 .ds-toggle-btn');

    function renderZone1(mode) {
      if (!zone1) return;
      if (mode === 'before') {
        zone1.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:10px;">
            <p style="font-size:13px;color:var(--muted);margin:0;">Simulating the <b>Before</b> experience: A casual scroll or misclick on the checkbox immediately triggers a state change.</p>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:#FAF8F5;border-radius:10px;border:1px solid var(--bd);">
              <span style="font-size:13.5px;font-weight:700;">Morning: Metformin 500mg</span>
              <button id="testTapBefore" type="button" style="padding:6px 14px;background:#F0EBE4;border:1px solid var(--bd);border-radius:8px;font-weight:700;font-size:12.5px;cursor:pointer;">
                Tap to check
              </button>
            </div>
            <div id="toastZoneBefore" class="hidden"></div>
          </div>
        `;
        const testBtn = document.getElementById('testTapBefore');
        const toastZone = document.getElementById('toastZoneBefore');
        testBtn.addEventListener('click', () => {
          toastZone.className = 'ds-toast danger';
          toastZone.innerHTML = '<span>⚠️ Marked taken immediately! Tester panicked: "Wait, I didn\'t take it yet!"</span>';
          testBtn.style.background = '#FFEBEE';
          testBtn.style.color = '#C62828';
          testBtn.textContent = 'Taken ⚠️';
        });
      } else {
        zone1.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:10px;">
            <p style="font-size:13px;color:var(--muted);margin:0;">Simulating the <b>After</b> experience: Viewing is distinct from changing. Requires a conscious confirm step and provides a safety undo window.</p>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:#FAF8F5;border-radius:10px;border:1px solid var(--bd);">
              <span style="font-size:13.5px;font-weight:700;">Morning: Metformin 500mg</span>
              <button id="testTapAfter" type="button" style="padding:6px 14px;background:#207B19;color:#FFF;border:0;border-radius:8px;font-weight:700;font-size:12.5px;cursor:pointer;">
                Review &amp; Confirm Dose
              </button>
            </div>
            <div id="toastZoneAfter" class="hidden"></div>
          </div>
        `;
        const testBtn = document.getElementById('testTapAfter');
        const toastZone = document.getElementById('toastZoneAfter');
        testBtn.addEventListener('click', () => {
          toastZone.className = 'ds-toast success';
          toastZone.innerHTML = '<span>✓ Confirmed intentionally. Undo banner available for 5 seconds.</span>';
          testBtn.textContent = 'Confirmed ✓';
        });
      }
    }
    renderZone1('after');

    toggleBtns1.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleBtns1.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderZone1(btn.getAttribute('data-flow'));
      });
    });

    // Sandbox 2: Incomplete Medication Status Obviousness
    const zone2 = document.getElementById('dsZone2');
    const toggleBtns2 = document.querySelectorAll('#decisionSandbox2 .ds-toggle-btn');

    function renderZone2(mode) {
      if (!zone2) return;
      if (mode === 'before') {
        zone2.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:10px;">
            <p style="font-size:13px;color:var(--muted);margin:0;">Before: When 2 medicines are shown in a single card, users had to decipher which one was unconfirmed.</p>
            <div style="padding:14px;background:#FAF8F5;border:1px solid var(--bd);border-radius:10px;display:flex;flex-direction:column;gap:6px;">
              <span style="font-size:12px;font-weight:700;color:var(--muted);">Morning Routine (2 medicines)</span>
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:13.5px;">1. Metformin 500mg &nbsp;·&nbsp; 2. Telmisartan 40mg</span>
                <span style="font-size:12px;padding:3px 8px;background:#FFF3E0;color:#E65100;border-radius:6px;font-weight:700;">Partially Done</span>
              </div>
            </div>
            <div class="ds-toast danger"><span>⚠️ Ambiguity: User doesn't know immediately which of the two pills is still on the table.</span></div>
          </div>
        `;
      } else {
        zone2.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:10px;">
            <p style="font-size:13px;color:var(--muted);margin:0;">After: Explicit status names each medicine directly with high-contrast color badges.</p>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#E8F5E9;border-radius:8px;border:1px solid rgba(32,123,25,0.2);">
                <span style="font-size:13px;font-weight:700;color:#1B5E20;">Metformin 500mg</span>
                <span style="font-size:11.5px;font-weight:700;color:#207B19;">✓ TAKEN (8:15 AM)</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#FFF9EB;border-radius:8px;border:1px solid #C38A21;">
                <span style="font-size:13px;font-weight:700;color:#8C4D2E;">Telmisartan 40mg</span>
                <span style="font-size:11.5px;font-weight:700;color:#C38A21;">⏳ DUE WITH BREAKFAST</span>
              </div>
            </div>
            <div class="ds-toast success"><span>✓ Zero ambiguity: Elder glances and instantly knows Telmisartan is the one left to take.</span></div>
          </div>
        `;
      }
    }
    renderZone2('after');

    toggleBtns2.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleBtns2.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderZone2(btn.getAttribute('data-flow'));
      });
    });
  }
  setupDecisionSandboxes();

  /* ── 9. Accessible Lightbox Dialog ───────────────────────────── */
  function setupLightbox() {
    const dialog = document.getElementById('takenrightLightbox');
    if (!dialog) return;

    const lbImg = document.getElementById('lbImg');
    const lbTitle = document.getElementById('lbTitle');
    const lbSubtitle = document.getElementById('lbSubtitle');
    const lbCounter = document.getElementById('lbCounter');
    const closeBtn = document.getElementById('lbCloseBtn');
    const prevBtn = document.getElementById('lbPrevBtn');
    const nextBtn = document.getElementById('lbNextBtn');

    const marqueeImgs = Array.from(document.querySelectorAll('.marq .set:first-child img'));
    let currentIdx = 0;

    function openLightbox(index) {
      if (index < 0 || index >= marqueeImgs.length) return;
      currentIdx = index;
      const img = marqueeImgs[currentIdx];
      lbImg.src = img.src;
      lbImg.alt = img.alt || 'Screen detail';
      lbTitle.textContent = img.getAttribute('data-title') || 'Screen Preview';
      lbSubtitle.textContent = img.getAttribute('data-desc') || img.alt;
      lbCounter.textContent = `Screen ${currentIdx + 1} of ${marqueeImgs.length}`;

      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    }

    function closeLightbox() {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }

    marqueeImgs.forEach((img, idx) => {
      img.addEventListener('click', () => openLightbox(idx));
    });

    closeBtn.addEventListener('click', closeLightbox);
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeLightbox();
    });

    prevBtn.addEventListener('click', () => {
      openLightbox((currentIdx - 1 + marqueeImgs.length) % marqueeImgs.length);
    });
    nextBtn.addEventListener('click', () => {
      openLightbox((currentIdx + 1) % marqueeImgs.length);
    });

    window.addEventListener('keydown', (e) => {
      if (!dialog.open) return;
      if (e.key === 'ArrowLeft') {
        openLightbox((currentIdx - 1 + marqueeImgs.length) % marqueeImgs.length);
      } else if (e.key === 'ArrowRight') {
        openLightbox((currentIdx + 1) % marqueeImgs.length);
      }
    });
  }
  setupLightbox();

  /* ── 10. 3D Perspective Card Tilt (Pointer Fine Only) ────────── */
  if (!reduced.matches && window.matchMedia('(pointer: fine)').matches) {
    const tiltCards = document.querySelectorAll('.card-tilt, .sketch-callout, .next-portal-card');
    tiltCards.forEach(card => {
      let rotX = 0, rotY = 0;
      let tRotX = 0, tRotY = 0;
      let inside = false, raf;

      function lerp(a, b, t) { return a + (b - a) * t; }

      function frame() {
        rotX = lerp(rotX, tRotX, 0.1);
        rotY = lerp(rotY, tRotY, 0.1);
        card.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
        if (inside || Math.abs(rotX) > 0.05 || Math.abs(rotY) > 0.05) {
          raf = requestAnimationFrame(frame);
        } else {
          card.style.transform = '';
        }
      }

      card.addEventListener('mousemove', e => {
        inside = true;
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        tRotX = -ny * 6;
        tRotY = nx * 6;
        cancelAnimationFrame(raf);
        frame();
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        inside = false;
        tRotX = 0;
        tRotY = 0;
        cancelAnimationFrame(raf);
        frame();
      });
    });
  }

  /* ── 11. View Transitions Navigation ─────────────────────────── */
  if (!reduced.matches && 'startViewTransition' in document) {
    const portalBack = document.querySelector('.next-portal-back');
    if (portalBack) {
      portalBack.addEventListener('click', e => {
        const href = portalBack.getAttribute('href');
        if (href && !href.startsWith('http')) {
          e.preventDefault();
          document.startViewTransition(() => {
            window.location.href = href;
          });
        }
      });
    }
  }

})();