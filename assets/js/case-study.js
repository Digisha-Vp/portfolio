/**
 * Case Study Scroll Controller:
 * - Dynamic Reading Progress Indicator
 * - Precision Scroll-Spy Ambient Chapter Navigator
 * - Smooth Anchor Traversal with scroll-margin-top
 * - Next Project Portal Kinetic Scale
 */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 1. Reading Progress Bar
  const progressBar = document.getElementById('readingProgress');
  function updateProgress() {
    if (!progressBar) return;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = Math.max(0, Math.min(1, docH > 0 ? window.scrollY / docH : 0));
    progressBar.style.width = `${(scrolled * 100).toFixed(1)}%`;
  }

  // 2. Chapter Navigation & Precision Scroll-Spy
  const chapterNav = document.getElementById('chapterNav');
  const chapterLinks = chapterNav ? Array.from(chapterNav.querySelectorAll('.chapter-btn')) : [];
  const trackedSections = chapterLinks
    .map(link => {
      const id = link.getAttribute('data-target') || (link.getAttribute('href') || '').replace('#', '');
      const el = id ? document.getElementById(id) : null;
      return el ? { link, el, id } : null;
    })
    .filter(Boolean);

  let currentActive = null;

  function setActiveChapter(activeItem) {
    if (!activeItem || currentActive === activeItem.link) return;
    currentActive = activeItem.link;

    chapterLinks.forEach(l => {
      const isCurrent = l === activeItem.link;
      l.classList.toggle('active', isCurrent);
      if (isCurrent) {
        l.setAttribute('aria-current', 'true');
        // If container is horizontally scrollable on mobile/tablet, center active pill
        const navContainer = chapterNav.querySelector('.chapter-nav');
        if (navContainer && navContainer.scrollWidth > navContainer.clientWidth) {
          const pillOffset = l.offsetLeft - navContainer.clientWidth / 2 + l.clientWidth / 2;
          navContainer.scrollTo({ left: pillOffset, behavior: 'smooth' });
        }
      } else {
        l.removeAttribute('aria-current');
      }
    });
  }

  function updateScrollSpy() {
    if (trackedSections.length === 0) return;

    const scrollY = window.scrollY;
    const windowH = window.innerHeight;
    const docH = document.documentElement.scrollHeight;

    // If near bottom of the page (within 80px), activate the final item (Next Project)
    if (windowH + scrollY >= docH - 80) {
      setActiveChapter(trackedSections[trackedSections.length - 1]);
      return;
    }

    // Trigger point: 35% from the top of the viewport
    const triggerY = scrollY + windowH * 0.35;

    let activeCandidate = trackedSections[0];
    for (let i = 0; i < trackedSections.length; i++) {
      const sec = trackedSections[i];
      const secTop = sec.el.getBoundingClientRect().top + scrollY;
      if (secTop <= triggerY) {
        activeCandidate = sec;
      } else {
        break;
      }
    }

    setActiveChapter(activeCandidate);
  }

  // Smooth click handler for all chapter links
  chapterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target') || (link.getAttribute('href') || '').replace('#', '');
      const targetEl = targetId ? document.getElementById(targetId) : null;
      if (targetEl) {
        const navOffset = 70;
        const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({
          top: targetPos,
          behavior: reduced.matches ? 'auto' : 'smooth'
        });
        if (history.replaceState) {
          history.replaceState(null, null, `#${targetId}`);
        }
      }
    });
  });

  // 3. Next Project Portal Scroll Scale
  const nextPortalCard = document.querySelector('.next-portal-card');
  function updateNextPortal() {
    if (!nextPortalCard || reduced.matches) return;
    const rect = nextPortalCard.getBoundingClientRect();
    const winH = window.innerHeight;
    if (rect.top < winH && rect.bottom > 0) {
      const enterProgress = Math.min(1, Math.max(0, (winH - rect.top) / (winH * 0.6)));
      const scale = 0.94 + 0.06 * enterProgress;
      const translateY = 20 * (1 - enterProgress);
      nextPortalCard.style.transform = `scale(${scale.toFixed(3)}) translateY(${translateY.toFixed(1)}px)`;
      nextPortalCard.style.opacity = `${(0.7 + 0.3 * enterProgress).toFixed(2)}`;
    }
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateScrollSpy();
        updateNextPortal();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Initial pass on DOM ready / load
  updateProgress();
  updateScrollSpy();
  updateNextPortal();
})();
