/**
 * index.js — Homepage Interactions
 *
 * 1. Paint canvas (cursor brush strokes in hero)
 * 2. Scroll physics: hero parallax, sticky card stacking
 * 3. Magnetic custom cursor
 * 4. 3D perspective tilt on work tiles
 * 5. Cursor-tracked hero spotlight
 * 6. Magnetic snap on nav links & card-action buttons
 * 7. Tile hover: floating project discipline tooltip
 */

/* ─── 1. PAINT CANVAS ───────────────────────────────────────────────────── */
(() => {
  const hero = document.getElementById('paintHero');
  const canvas = document.getElementById('paintCanvas');
  if (!hero || !canvas) return;

  const ctx = canvas.getContext('2d');
  const colors = ['#E58B8B', '#E4B45E', '#72B89A', '#78A3D8', '#A58BC7', '#E39963'];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let points = [];
  let colorIndex = 0;
  let raf;

  const rgb = hex => {
    const h = hex.slice(1);
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };

  function resize() {
    const r = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    canvas.style.width  = r.width + 'px';
    canvas.style.height = r.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function addPoint(x, y) {
    const last = points[points.length - 1];
    if (!last || Math.hypot(x - last.x, y - last.y) > 3) {
      points.push({ x, y, age: 0, color: colors[colorIndex % colors.length], tilt: (Math.random() - .5) * .2 });
      colorIndex++;
    }
    if (points.length > 900) points.splice(0, 100);
  }

  function draw() {
    const w = hero.clientWidth, h = hero.clientHeight;
    ctx.clearRect(0, 0, w, h);
    if (points.length < 2) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      const life = Math.max(0, 1 - a.age);
      const [r, g, bl] = rgb(a.color);
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;

      ctx.strokeStyle = `rgba(${r},${g},${bl},${0.055 * life})`;
      ctx.lineWidth = 8.5;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(mx + a.tilt * 8, my - a.tilt * 8, b.x, b.y); ctx.stroke();

      ctx.strokeStyle = `rgba(${r},${g},${bl},${0.46 * life})`;
      ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(mx + a.tilt * 5, my - a.tilt * 5, b.x, b.y); ctx.stroke();

      ctx.strokeStyle = `rgba(255,255,255,${0.11 * life})`;
      ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(a.x + .8, a.y - .6); ctx.quadraticCurveTo(mx, my, b.x + .8, b.y - .6); ctx.stroke();
    }
  }

  function animate() {
    points.forEach(p => p.age += reduced.matches ? .02 : .008);
    points = points.filter(p => p.age < 1);
    draw();
    raf = requestAnimationFrame(animate);
  }

  const heroCopy = hero.querySelector('.hero-copy');

  function move(e) {
    if (e.pointerType === 'touch') return;
    const r = hero.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (x < 0 || y < 0 || x > r.width || y > r.height) return;

    // Skip painting when cursor is over the text card
    if (heroCopy) {
      const cr = heroCopy.getBoundingClientRect();
      if (e.clientX >= cr.left && e.clientX <= cr.right &&
          e.clientY >= cr.top  && e.clientY <= cr.bottom) return;
    }

    addPoint(x, y);
    hero.classList.add('has-paint');
  }

  hero.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('resize', resize);
  resize();
  cancelAnimationFrame(raf);
  animate();
})();


/* ─── 2. SCROLL PHYSICS ─────────────────────────────────────────────────── */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const heroCopy  = document.querySelector('.hero-copy');
  const scrollCue = document.getElementById('scrollCue');
  const workSection = document.getElementById('work');
  const tiles = Array.from(document.querySelectorAll('.work .tile'));
  const activeIdxEl = document.getElementById('activeWorkIdx');

  if (scrollCue && workSection) {
    scrollCue.addEventListener('click', e => {
      e.preventDefault();
      const nav = document.querySelector('.nav');
      const navOffset = nav ? nav.offsetHeight + 24 : 80;
      const targetPos = workSection.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  }

  if (reduced.matches || tiles.length === 0) return;

  let ticking = false;

  function updateScroll() {
    const scrollY  = window.scrollY;
    const windowH  = window.innerHeight;

    // Hero copy parallax & fade
    if (heroCopy && scrollY < windowH) {
      const progress   = Math.min(scrollY / 450, 1);
      heroCopy.style.transform = `translateY(${(scrollY * 0.28).toFixed(1)}px)`;
      heroCopy.style.opacity   = Math.max(0, 1 - progress * 1.05).toFixed(3);
    } else if (heroCopy && heroCopy.style.opacity !== '') {
      heroCopy.style.transform = '';
      heroCopy.style.opacity   = '';
    }

    // Stacking depth + active counter
    if (window.innerWidth > 768) {
      let currentActive = 1;
      tiles.forEach((tile, idx) => {
        const next = tiles[idx + 1];
        if (next) {
          const tRect = tile.getBoundingClientRect();
          const nRect = next.getBoundingClientRect();
          const overlap = tRect.bottom - nRect.top;
          if (overlap > 0 && nRect.top <= tRect.bottom) {
            const p = Math.min(Math.max(overlap / (tRect.height * 0.8), 0), 1);
            tile.style.setProperty('--stack-scale', (1 - 0.05 * p).toFixed(3));
            tile.style.setProperty('--stack-shift', `${(-14 * p).toFixed(1)}px`);
            tile.style.filter = `brightness(${(1 - 0.08 * p).toFixed(3)})`;
          } else {
            tile.style.removeProperty('--stack-scale');
            tile.style.removeProperty('--stack-shift');
            tile.style.filter = '';
          }
        }
        if (tile.getBoundingClientRect().top <= windowH * 0.45) currentActive = idx + 1;
      });

      if (activeIdxEl) {
        const fmt = String(currentActive).padStart(2, '0');
        if (activeIdxEl.textContent !== fmt) activeIdxEl.textContent = fmt;
      }
    } else {
      tiles.forEach(t => { t.style.filter = ''; });
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateScroll();
})();


/* ─── 3. MAGNETIC CUSTOM CURSOR ────────────────────────────────────────── */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Only on pointer devices
  if (reduced.matches || !window.matchMedia('(pointer: fine)').matches) return;

  const cursor = document.getElementById('dvpCursor');
  const dot    = document.getElementById('dvpCursorDot');
  if (!cursor || !dot) return;

  let mx = -200, my = -200;   // raw mouse position
  let cx = -200, cy = -200;   // blob smoothed position
  let dx = -200, dy = -200;   // dot smoothed position
  let scale = 1, targetScale = 1;
  let isDown = false;
  let raf;

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Collect magnetic targets
  const magnets = () => Array.from(
    document.querySelectorAll('a, button, .tile, .scroll-cue, .card-action')
  );

  function getMagnet(mx, my) {
    for (const el of magnets()) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dist = Math.hypot(mx - cx, my - cy);
      const radius = Math.min(r.width, r.height) * 0.65 + 20;
      if (dist < radius) return { el, cx, cy, dist, radius };
    }
    return null;
  }

  function tick() {
    const magnet = getMagnet(mx, my);

    let tx = mx, ty = my;
    if (magnet) {
      const pull = 1 - magnet.dist / magnet.radius;
      const strength = 0.35;
      tx = mx + (magnet.cx - mx) * pull * strength;
      ty = my + (magnet.cy - my) * pull * strength;
      targetScale = 1.9;
    } else {
      targetScale = isDown ? 0.7 : 1;
    }

    cx = lerp(cx, tx, 0.12);
    cy = lerp(cy, ty, 0.12);
    dx = lerp(dx, mx, 0.5);
    dy = lerp(dy, my, 0.5);
    scale = lerp(scale, targetScale, 0.14);

    cursor.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px) scale(${scale.toFixed(3)})`;
    dot.style.transform    = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;

    raf = requestAnimationFrame(tick);
  }

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  document.addEventListener('mousedown', () => { isDown = true; });
  document.addEventListener('mouseup',   () => { isDown = false; });

  // State classes for styling cursor colour
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('a, button, .tile, .card-action');
    if (el) {
      cursor.dataset.type = el.closest('.tile') ? 'tile'
        : el.closest('.card-action') ? 'action'
        : 'link';
    } else {
      delete cursor.dataset.type;
    }
  });

  cancelAnimationFrame(raf);
  tick();
})();


/* ─── 4. TILE 3D PERSPECTIVE TILT ───────────────────────────────────────── */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !window.matchMedia('(pointer: fine)').matches) return;

  const tiles = Array.from(document.querySelectorAll('.work .tile'));

  tiles.forEach(tile => {
    let raf;
    let rotX = 0, rotY = 0, glowX = 50, glowY = 50;
    let targetRotX = 0, targetRotY = 0, targetGX = 50, targetGY = 50;
    let inside = false;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function frame() {
      rotX  = lerp(rotX,  targetRotX, 0.1);
      rotY  = lerp(rotY,  targetRotY, 0.1);
      glowX = lerp(glowX, targetGX,   0.1);
      glowY = lerp(glowY, targetGY,   0.1);

      tile.style.transform = `
        scale(var(--stack-scale, 1))
        translateY(var(--stack-shift, 0px))
        perspective(900px)
        rotateX(${rotX.toFixed(2)}deg)
        rotateY(${rotY.toFixed(2)}deg)
      `;
      tile.style.setProperty('--glow-x', `${glowX.toFixed(1)}%`);
      tile.style.setProperty('--glow-y', `${glowY.toFixed(1)}%`);

      if (inside || Math.abs(rotX) > 0.05 || Math.abs(rotY) > 0.05) {
        raf = requestAnimationFrame(frame);
      } else {
        tile.style.transform = '';
      }
    }

    tile.addEventListener('mousemove', e => {
      inside = true;
      const r = tile.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - 0.5;  // -0.5 → +0.5
      const ny = (e.clientY - r.top)  / r.height - 0.5;
      targetRotX = -ny * 5;   // max ±2.5 deg
      targetRotY =  nx * 6;
      targetGX = (nx + 0.5) * 100;
      targetGY = (ny + 0.5) * 100;
      cancelAnimationFrame(raf);
      frame();
    }, { passive: true });

    tile.addEventListener('mouseleave', () => {
      inside = false;
      targetRotX = 0; targetRotY = 0;
      targetGX = 50;  targetGY = 50;
      cancelAnimationFrame(raf);
      frame();
    });
  });
})();


/* ─── 5. HERO CURSOR SPOTLIGHT ──────────────────────────────────────────── */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !window.matchMedia('(pointer: fine)').matches) return;

  const hero = document.getElementById('paintHero');
  if (!hero) return;

  let sx = 50, sy = 50, tx = 50, ty = 50;
  let active = false;
  let raf;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function frame() {
    sx = lerp(sx, tx, 0.08);
    sy = lerp(sy, ty, 0.08);
    hero.style.setProperty('--spotlight-x', `${sx.toFixed(1)}%`);
    hero.style.setProperty('--spotlight-y', `${sy.toFixed(1)}%`);
    raf = requestAnimationFrame(frame);
  }

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width)  * 100;
    ty = ((e.clientY - r.top)  / r.height) * 100;
    if (!active) { active = true; hero.classList.add('spotlight-active'); }
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    active = false;
    hero.classList.remove('spotlight-active');
  });

  cancelAnimationFrame(raf);
  frame();
})();


/* ─── 6. MAGNETIC SNAP: nav & footer links ───────────────────────────────── */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !window.matchMedia('(pointer: fine)').matches) return;

  const targets = document.querySelectorAll('.nav nav a, .foot a, .brand');

  targets.forEach(el => {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let raf;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function frame() {
      cx = lerp(cx, tx, 0.18);
      cy = lerp(cy, ty, 0.18);
      el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      if (Math.abs(cx) > 0.05 || Math.abs(cy) > 0.05) raf = requestAnimationFrame(frame);
    }

    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width  / 2)) * 0.3;
      const ny = (e.clientY - (r.top  + r.height / 2)) * 0.3;
      tx = Math.max(-6, Math.min(6, nx));
      ty = Math.max(-4, Math.min(4, ny));
      cancelAnimationFrame(raf); frame();
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
      tx = 0; ty = 0;
      cancelAnimationFrame(raf); frame();
    });
  });
})();


/* ─── 7. TILE FLOATING DISCIPLINE TOOLTIP ───────────────────────────────── */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !window.matchMedia('(pointer: fine)').matches) return;

  const tooltip = document.getElementById('tileTooltip');
  if (!tooltip) return;

  const tiles = document.querySelectorAll('.work .tile');
  let mx = 0, my = 0, tx = 0, ty = 0, raf;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function frame() {
    tx = lerp(tx, mx + 20, 0.14);
    ty = lerp(ty, my - 14, 0.14);
    tooltip.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
    raf = requestAnimationFrame(frame);
  }

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  tiles.forEach(tile => {
    const label = tile.dataset.discipline || '';
    tile.addEventListener('mouseenter', () => {
      tooltip.textContent = label;
      tooltip.classList.add('visible');
    });
    tile.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  });

  cancelAnimationFrame(raf);
  frame();
})();


/* ═══════════════════════════════════════════════════════════════════════════
   INTRO & OUTRO ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── A. PAGE LOAD ENTRANCE SEQUENCE ────────────────────────────────────── */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (reduced.matches) {
    // Reduced motion: show everything instantly, no animations
    document.body.classList.add('page-ready');
    return;
  }

  // Trigger the CSS cascade by adding .page-ready on next frame
  // (gives browser one frame to paint the initial "invisible" state first)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add('page-ready');
    });
  });
})();


/* ─── B. PAINT SPLASH BURST ON FIRST LOAD ──────────────────────────────── */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  // Only play once per session
  if (sessionStorage.getItem('dvp-splash')) return;
  sessionStorage.setItem('dvp-splash', '1');

  const hero   = document.getElementById('paintHero');
  const canvas = document.getElementById('paintCanvas');
  if (!hero || !canvas) return;

  // Wait until paint canvas is initialised (canvas resized on load)
  setTimeout(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = hero.clientWidth;
    const h = hero.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    const colors = ['#E58B8B', '#E4B45E', '#72B89A', '#78A3D8', '#A58BC7', '#E39963'];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rays = 18;

    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2;
      const len   = 60 + Math.random() * 90;
      const steps = Math.floor(len / 4);
      const color = colors[i % colors.length];
      const [r, g, bl] = [
        parseInt(color.slice(1, 3), 16),
        parseInt(color.slice(3, 5), 16),
        parseInt(color.slice(5, 7), 16),
      ];

      for (let s = 0; s < steps; s++) {
        const dist  = (s / steps) * len;
        const jitter = (Math.random() - 0.5) * 12;
        const px = (cx + Math.cos(angle) * dist + jitter) * dpr;
        const py = (cy + Math.sin(angle) * dist + jitter) * dpr;

        const life = 1 - s / steps;
        // soft halo
        ctx.strokeStyle = `rgba(${r},${g},${bl},${0.06 * life})`;
        ctx.lineWidth   = 9 * dpr;
        ctx.beginPath(); ctx.arc(px / dpr, py / dpr, 1, 0, Math.PI * 2); ctx.stroke();
        // main stroke dot
        ctx.strokeStyle = `rgba(${r},${g},${bl},${0.5 * life})`;
        ctx.lineWidth   = 3 * dpr;
        ctx.beginPath(); ctx.arc(px / dpr, py / dpr, 0.5, 0, Math.PI * 2); ctx.stroke();
      }
    }
  }, 350); // slight delay so canvas has resized first
})();


/* ─── C. WORK TILES CASCADE IN ─────────────────────────────────────────── */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const tiles = Array.from(document.querySelectorAll('.tile[data-cascade]'));
  if (tiles.length === 0) return;

  if (reduced.matches) {
    tiles.forEach(t => t.classList.add('cascade-in'));
    return;
  }

  // threshold: 0 — fires as soon as even 1px enters viewport.
  // This correctly handles sticky tiles that may already be partially visible.
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger via the CSS transition-delay already set by data-cascade
        entry.target.classList.add('cascade-in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

  tiles.forEach(t => obs.observe(t));
})();


/* ─── D. COUNTER DIGIT FLIP ─────────────────────────────────────────────── */
// Patches the existing scroll controller's counter update with a flip animation.
// We intercept by overriding the element's textContent setter indirectly via a
// MutationObserver watching the counter span.
(() => {
  const el = document.getElementById('activeWorkIdx');
  if (!el) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  let pending = false;

  const mo = new MutationObserver(() => {
    if (pending) return;
    pending = true;

    // The text just changed. Play flip animation.
    el.classList.remove('flip-out', 'flip-in');

    // frame 1: flip out upward
    el.classList.add('flip-out');

    setTimeout(() => {
      // frame 2: reset to bottom instantly (no transition)
      el.classList.remove('flip-out');
      el.classList.add('flip-in');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // frame 3: slide up to resting position
          el.classList.remove('flip-in');
          pending = false;
        });
      });
    }, 150);
  });

  mo.observe(el, { childList: true, characterData: true, subtree: true });
})();


/* ─── E. FOOTER REVEAL ───────────────────────────────────────────────────── */
(() => {
  const footer  = document.getElementById('siteFooter');
  if (!footer) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) { footer.classList.add('footer-revealed'); return; }

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      footer.classList.add('footer-revealed');
      obs.disconnect();
    }
  }, { threshold: 0, rootMargin: '0px 0px 60px 0px' });

  obs.observe(footer);
})();


/* ─── F. PAGE-EXIT CURTAIN ───────────────────────────────────────────────── */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Use View Transitions API if available (Chrome 111+) — prettier & native.
  // Curtain is the fallback for browsers without VT support.
  if (reduced.matches) return;

  const curtain = document.getElementById('exitCurtain');
  if (!curtain) return;

  const tileColors = {
    't1': '#D3CCFF',
    't2': '#C2F6C5',
    't3': '#CBE3FF',
  };

  // View Transitions API — if supported, let it handle the transition natively.
  const hasVT = 'startViewTransition' in document;

  document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', e => {
      const href = tile.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;

      if (hasVT) {
        // Native View Transition — intercept navigation
        e.preventDefault();
        document.startViewTransition(() => {
          window.location.href = href;
        });
        return;
      }

      // Fallback: coloured curtain wipe
      e.preventDefault();
      const color = tileColors[
        tile.classList.contains('t1') ? 't1' :
        tile.classList.contains('t2') ? 't2' : 't3'
      ] || '#F0EBE4';

      curtain.style.background = color;
      curtain.classList.add('curtain-active');

      setTimeout(() => {
        window.location.href = href;
      }, 440);
    });
  });
})();
