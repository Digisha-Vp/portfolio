/**
 * Case Study Scroll Controller — clodoc.html & takenright.html
 *
 * Responsibilities:
 *  1. Reading progress bar
 *  2. Precision scroll-spy chapter navigator (35% viewport trigger)
 *  3. Next-project portal kinetic scale-in
 *  4. Clodoc component kinetics:
 *       A. Hero image parallax (clodoc only)
 *       B. Pull-quote accent bar + text reveal
 *       C. Timeline vertical fill + milestone step awakening
 *       D. Contribution card focal depth
 *       E. Learning aphorisms sequential highlight
 */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ─── 1. Reading Progress Bar ──────────────────────────────────────────────

  const progressBar = document.getElementById('readingProgress');

  function updateProgress() {
    if (!progressBar) return;
    const docScrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = docScrollable > 0
      ? Math.max(0, Math.min(1, window.scrollY / docScrollable))
      : 0;
    progressBar.style.width = `${(scrolled * 100).toFixed(1)}%`;
  }

  // ─── 2. Chapter Navigator & Precision Scroll-Spy ─────────────────────────

  const chapterNav = document.getElementById('chapterNav');
  const chapterLinks = chapterNav ? Array.from(chapterNav.querySelectorAll('.chapter-btn')) : [];
  const trackedSections = chapterLinks
    .map(link => {
      const id = link.getAttribute('data-target') || (link.getAttribute('href') || '').replace('#', '');
      const el = id ? document.getElementById(id) : null;
      return el ? { link, el, id } : null;
    })
    .filter(Boolean);

  let currentActiveLink = null;

  function setActiveChapter(candidate) {
    if (!candidate || currentActiveLink === candidate.link) return;
    currentActiveLink = candidate.link;

    chapterLinks.forEach(l => {
      const isCurrent = l === candidate.link;
      l.classList.toggle('active', isCurrent);
      if (isCurrent) {
        l.setAttribute('aria-current', 'true');
        // Centre active pill when nav is horizontally scrollable (mobile/tablet)
        const navInner = chapterNav.querySelector('.chapter-nav');
        if (navInner && navInner.scrollWidth > navInner.clientWidth) {
          const pill = l.offsetLeft - navInner.clientWidth / 2 + l.clientWidth / 2;
          navInner.scrollTo({ left: pill, behavior: 'smooth' });
        }
      } else {
        l.removeAttribute('aria-current');
      }
    });
  }

  function updateScrollSpy() {
    if (trackedSections.length === 0) return;

    const scrollY = window.scrollY;
    const winH = window.innerHeight;
    const docH = document.documentElement.scrollHeight;

    // Near page bottom → always highlight last item (Next Project)
    if (winH + scrollY >= docH - 80) {
      setActiveChapter(trackedSections[trackedSections.length - 1]);
      return;
    }

    // Trigger line: 35% from the top of the viewport
    const triggerY = scrollY + winH * 0.35;
    let activeCandidate = trackedSections[0];

    for (const sec of trackedSections) {
      const secTop = sec.el.getBoundingClientRect().top + scrollY;
      if (secTop <= triggerY) {
        activeCandidate = sec;
      } else {
        break;
      }
    }

    setActiveChapter(activeCandidate);
  }

  // Smooth click handler for chapter links
  chapterLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target') || (link.getAttribute('href') || '').replace('#', '');
      const targetEl = targetId ? document.getElementById(targetId) : null;
      if (!targetEl) return;

      // Account for the floating chapter bar height + a little breathing room
      const navBar = chapterNav.querySelector('.chapter-nav');
      const navOffset = navBar ? navBar.getBoundingClientRect().height + 20 : 80;
      const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - navOffset;

      window.scrollTo({ top: targetPos, behavior: reduced.matches ? 'auto' : 'smooth' });

      if (history.replaceState) {
        history.replaceState(null, null, `#${targetId}`);
      }
    });
  });

  // ─── 3. Next-Project Portal Kinetic Scale ────────────────────────────────

  const nextPortalCard = document.querySelector('.next-portal-card');
  let isPortalHovered = false;

  if (nextPortalCard) {
    nextPortalCard.addEventListener('mouseenter', () => { isPortalHovered = true; });
    nextPortalCard.addEventListener('mouseleave', () => { isPortalHovered = false; });
  }

  function updateNextPortal() {
    if (!nextPortalCard || reduced.matches) return;
    const rect = nextPortalCard.getBoundingClientRect();
    const winH = window.innerHeight;

    if (rect.top < winH && rect.bottom > 0) {
      const progress = Math.min(1, Math.max(0, (winH - rect.top) / (winH * 0.6)));
      const scale = 0.94 + 0.06 * progress;
      const translateY = 20 * (1 - progress);
      const opacity = 0.7 + 0.3 * progress;

      // Don't override transform while hovered (CSS :hover handles lift)
      if (!isPortalHovered) {
        nextPortalCard.style.transform = `scale(${scale.toFixed(3)}) translateY(${translateY.toFixed(1)}px)`;
      }
      nextPortalCard.style.opacity = opacity.toFixed(2);
    }
  }

  // ─── 4. Clodoc Component Kinetics ────────────────────────────────────────
  // Gracefully no-ops on pages that don't have these elements (e.g. takenright.html)

  const heroImg = document.querySelector('#intro .hero');
  const quoteEl = document.querySelector('.quote');
  const tlEl = document.querySelector('.tl');
  const tlItems = tlEl ? Array.from(tlEl.querySelectorAll('li')) : [];
  const contributionCards = Array.from(document.querySelectorAll('#contributions .card'));
  const learnItems = Array.from(document.querySelectorAll('.learn > div'));

  // Pre-compute whether each element exists to avoid repeated null checks inside RAF
  const hasHero = Boolean(heroImg);
  const hasQuote = Boolean(quoteEl);
  const hasTl = Boolean(tlEl) && tlItems.length > 0;
  const hasCards = contributionCards.length > 0;
  const hasLearn = learnItems.length > 0;

  function updateClodocKinetics() {
    if (reduced.matches) return;

    const winH = window.innerHeight;
    const scrollY = window.scrollY;

    // A. Hero parallax — gentle downward drift as user scrolls away
    if (hasHero) {
      const rect = heroImg.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < winH) {
        // Clamp to prevent drift after hero leaves viewport
        const pY = Math.min(rect.height * 0.12, scrollY * 0.1);
        heroImg.style.transform = `translate3d(0, ${pY.toFixed(1)}px, 0)`;
      } else if (rect.bottom <= 0) {
        // Hero has scrolled fully out — reset so it looks correct if user scrolls back up fast
        heroImg.style.transform = '';
      }
    }

    // B. Pull-quote accent bar + text reveal
    if (hasQuote) {
      const rect = quoteEl.getBoundingClientRect();
      if (rect.top < winH && rect.bottom > 0) {
        const progress = Math.max(0, Math.min(1, (winH - rect.top) / (winH * 0.5)));
        quoteEl.style.setProperty('--quote-scale', progress.toFixed(3));
        quoteEl.style.setProperty('--quote-opacity', (0.5 + 0.5 * progress).toFixed(2));
        quoteEl.style.setProperty('--quote-y', `${((1 - progress) * 12).toFixed(1)}px`);
      }
    }

    // C. Timeline vertical fill + milestone step awakening
    if (hasTl) {
      const tlRect = tlEl.getBoundingClientRect();
      const readingLine = winH * 0.50; // Midpoint of viewport = reading line

      if (tlRect.top >= readingLine) {
        // Timeline hasn't entered reading zone yet
        tlEl.style.setProperty('--tl-progress', '0%');
      } else if (tlRect.bottom <= readingLine) {
        // Timeline is fully above reading line
        tlEl.style.setProperty('--tl-progress', '100%');
      } else {
        // Partially in view: fill proportional to how far past the reading line we are
        const filled = readingLine - tlRect.top;
        const pct = Math.max(0, Math.min(100, (filled / tlRect.height) * 100));
        tlEl.style.setProperty('--tl-progress', `${pct.toFixed(1)}%`);
      }

      // Milestone dot states: reached (past) + active (frontmost)
      let lastReachedIdx = -1;
      tlItems.forEach((li, idx) => {
        const liRect = li.getBoundingClientRect();
        const passed = liRect.top <= readingLine;
        li.classList.toggle('step-reached', passed);
        if (passed) lastReachedIdx = idx;
      });
      tlItems.forEach((li, idx) => {
        li.classList.toggle('step-active', idx === lastReachedIdx);
      });
    }

    // D. Contribution cards — highlight when occupying centre reading zone
    if (hasCards) {
      contributionCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        // Card is "in view" when it occupies a meaningful portion of the screen
        const inView = rect.top < winH * 0.80 && rect.bottom > winH * 0.15;
        card.classList.toggle('card-in-view', inView);
      });
    }

    // E. Learning aphorisms — active item straddles the 50% reading line
    if (hasLearn) {
      learnItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        // Item is focal when it surrounds the midpoint reading line
        const isFocal = rect.top <= winH * 0.60 && rect.bottom >= winH * 0.40;
        item.classList.toggle('active-learn', isFocal);
      });
    }
  }

  // ─── RAF-throttled scroll handler ────────────────────────────────────────

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateProgress();
      updateScrollSpy();
      updateNextPortal();
      updateClodocKinetics();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Initial paint pass
  updateProgress();
  updateScrollSpy();
  updateNextPortal();
  updateClodocKinetics();
})();
