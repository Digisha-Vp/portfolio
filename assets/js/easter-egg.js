/**
 * Digisha V P — Portfolio Console Easter Egg 🎨
 * Dedicated to curious developers, designers, and inspectors looking under the hood.
 */
(function () {
  'use strict';

  // Prevent multiple initializations if script is loaded more than once
  if (window.__DVP_EASTER_EGG_LOADED__) return;
  window.__DVP_EASTER_EGG_LOADED__ = true;

  const PALETTE = ['#E58B8B', '#E4B45E', '#72B89A', '#78A3D8', '#A58BC7', '#E39963'];

  // High-contrast badge styles that look gorgeous in both Light and Dark DevTools themes
  const brandBadge = 'background: #1D1D1F; color: #F9F8F3; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 4px 0 0 4px; font-family: monospace;';
  const roleBadge = 'background: #E58B8B; color: #1D1D1F; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 0 4px 4px 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; letter-spacing: 0.05em;';
  const cmdBadge = 'background: #4E3EAF; color: #FFFFFF; font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 3px; font-family: monospace;';
  const tagGreen = 'background: #207B19; color: #FFFFFF; font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 3px; font-family: monospace;';
  const tagBlue = 'background: #394FBA; color: #FFFFFF; font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 3px; font-family: monospace;';
  const tipBadge = 'background: #E4B45E; color: #1D1D1F; font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 3px; font-family: sans-serif;';
  const quoteStyle = 'color: #A58BC7; font-style: italic; font-size: 12px; font-weight: 600;';

  function printBanner() {
    console.log(
      '%c D V P %c DIGISHA V P  •  UX/UI DESIGNER %c\n\n' +
      '%c"Curiosity is where every thoughtful design begins."%c\n\n' +
      'Hey there, fellow explorer! 👋\n' +
      'You just peeked under the hood of my portfolio.\n\n' +
      'I\'m Digisha — an engineer by training (B.Tech ECE), a UX/UI designer\n' +
      'by craft, and an artist at heart. Currently designing simpler,\n' +
      'clearer healthcare experiences at Clodoc.\n\n' +
      'Since you opened the console, feel free to try these commands:\n\n' +
      '  %cdvp.help()%c       📋  See all available console commands\n' +
      '  %cdvp.skills()%c     ✨  View design & engineering skill matrix\n' +
      '  %cdvp.projects()%c   📂  Overview of featured case studies\n' +
      '  %cdvp.art()%c        🎨  An ASCII sketch & thoughts on craft\n' +
      '  %cdvp.secret()%c     🤫  Behind-the-scenes portfolio trivia\n' +
      '  %cdvp.paint()%c      🖌️  Draw a colorful swirl on the canvas\n' +
      '  %cdvp.confetti()%c   🎉  Throw some color onto the page\n' +
      '  %cdvp.contact()%c    💌  Say hello or discuss an opportunity\n\n' +
      '%c TIP %c Press the Konami Code on your keyboard (↑ ↑ ↓ ↓ ← → ← → B A) for a surprise!',
      brandBadge, roleBadge, '',
      quoteStyle, '',
      cmdBadge, '',
      cmdBadge, '',
      cmdBadge, '',
      cmdBadge, '',
      cmdBadge, '',
      cmdBadge, '',
      cmdBadge, '',
      cmdBadge, '',
      tipBadge, 'font-style: italic; font-size: 11px;'
    );
  }

  // Confetti / Paint Particles System
  let confettiCanvas = null;
  let confettiAnimId = null;
  let particles = [];

  function triggerConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('%c[Confetti motion reduced based on system preferences] ✨', 'color: #A58BC7; font-style: italic;');
      return '✨ Respecting reduced-motion settings!';
    }

    if (!confettiCanvas) {
      confettiCanvas = document.createElement('canvas');
      confettiCanvas.setAttribute('aria-hidden', 'true');
      confettiCanvas.style.position = 'fixed';
      confettiCanvas.style.inset = '0';
      confettiCanvas.style.width = '100vw';
      confettiCanvas.style.height = '100vh';
      confettiCanvas.style.pointerEvents = 'none';
      confettiCanvas.style.zIndex = '99999';
      document.body.appendChild(confettiCanvas);
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    confettiCanvas.width = Math.round(window.innerWidth * dpr);
    confettiCanvas.height = Math.round(window.innerHeight * dpr);
    const ctx = confettiCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Spawn 70 particles using Digisha's brand palette
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: w * (0.2 + Math.random() * 0.6),
        y: h * 0.35 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 1.2) * 11 - 2,
        size: 5 + Math.random() * 8,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'circle' : 'rect',
        gravity: 0.32 + Math.random() * 0.18
      });
    }

    if (!confettiAnimId) {
      function animate() {
        ctx.clearRect(0, 0, w, h);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= 0.985;
          p.rotation += p.rotationSpeed;
          p.opacity -= 0.009;

          if (p.opacity <= 0 || p.y > h + 30) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;

          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          }
          ctx.restore();
        }

        if (particles.length > 0) {
          confettiAnimId = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(confettiAnimId);
          confettiAnimId = null;
          if (confettiCanvas && confettiCanvas.parentNode) {
            confettiCanvas.parentNode.removeChild(confettiCanvas);
            confettiCanvas = null;
          }
        }
      }
      confettiAnimId = requestAnimationFrame(animate);
    }

    return '🎨 Confetti launched! Leave a little color wherever you go.';
  }

  // Paint swirl effect on homepage canvas if present
  function triggerPaintSwirl() {
    const hero = document.getElementById('paintHero');
    if (hero) {
      const r = hero.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const radius = Math.min(r.width, r.height) * 0.3;

      let angle = 0;
      const step = 0.22;
      const timer = setInterval(() => {
        angle += step;
        const currentRadius = radius * (1 - angle / 22);
        if (currentRadius <= 6 || angle >= 22) {
          clearInterval(timer);
          return;
        }
        const px = cx + Math.cos(angle) * currentRadius;
        const py = cy + Math.sin(angle) * currentRadius;
        hero.dispatchEvent(new PointerEvent('pointermove', {
          clientX: px,
          clientY: py,
          pointerType: 'mouse',
          bubbles: true
        }));
      }, 16);
    }
    return triggerConfetti();
  }

  // Interactive console object
  const dvp = {
    about: 'UX/UI Designer making complex healthcare experiences simpler, clearer, and more human.',
    status: 'Product Designer at Clodoc • Open to design discussions & new opportunities.',
    email: 'digisha.vp@gmail.com',

    help: function () {
      console.log(
        '%cAvailable DVP Console Commands:%c\n\n' +
        '  %cdvp.help()%c      - Display this command index\n' +
        '  %cdvp.skills()%c    - Structured table of design & technical skills\n' +
        '  %cdvp.projects()%c  - Quick summary and links to case studies\n' +
        '  %cdvp.art()%c       - An ASCII sketch & reflection on craftsmanship\n' +
        '  %cdvp.secret()%c    - Behind-the-scenes portfolio secrets\n' +
        '  %cdvp.paint()%c     - Paint an automatic color swirl on the hero canvas\n' +
        '  %cdvp.confetti()%c  - Unleash a burst of colorful pastel confetti\n' +
        '  %cdvp.contact()%c   - Direct contact links (Email, LinkedIn, Behance)\n',
        'font-weight: 700; font-size: 13px; color: #E58B8B;', '',
        cmdBadge, '',
        cmdBadge, '',
        cmdBadge, '',
        cmdBadge, '',
        cmdBadge, '',
        cmdBadge, '',
        cmdBadge, '',
        cmdBadge, ''
      );
      return '✨ Type any command above to run it!';
    },

    skills: function () {
      console.log('%cDigisha\'s Skill Matrix:%c', 'font-weight: 700; font-size: 13px; color: #78A3D8;', '');
      console.table([
        { Domain: '🎨 Product & UX', Focus: 'User Research, Journey Mapping, Wireframing, Interactive Prototyping, Design Systems' },
        { Domain: '🩺 Healthcare UX', Focus: 'Doctor & Patient Workflows, Pharmacy Modules, Prescription Safety, High-Stakes UX' },
        { Domain: '⚡ Engineering Core', Focus: 'B.Tech ECE, HTML5/CSS3/JS, Web Accessibility, Bridging Design & Engineering' },
        { Domain: '🖌️ Visual & Fine Art', Focus: 'Hyperrealistic Graphite Portraits, Digital Art, Visual Storytelling, Fine Details' }
      ]);
      return '📊 "T-shaped designer with an engineering root and an artist heart."';
    },

    projects: function () {
      console.log(
        '%cFeatured Projects:%c\n\n' +
        '1. %cClodoc%c (Healthcare Platform)\n' +
        '   Connecting doctors, patients, & pharmacists. Reducing cognitive load in medical care.\n' +
        '   🔗 View on this site: clodoc.html\n\n' +
        '2. %cTakenRight%c (Independent Project)\n' +
        '   Medication certainty for older adults & reassurance for caregivers.\n' +
        '   🔗 View on this site: takenright.html\n\n' +
        '3. %cDoorCare%c (UX Case Study)\n' +
        '   Home healthcare made simpler and more dignified.\n' +
        '   🔗 View on Behance: https://www.behance.net/gallery/248913789/DoorCare-Home-Healthcare-UX-Case-Study\n',
        'font-weight: 700; font-size: 13px; color: #E4B45E;', '',
        tagBlue, '',
        tagGreen, '',
        tagBlue, ''
      );
      return '📂 Have questions about a project? Type dvp.contact() to connect!';
    },

    art: function () {
      const sketch = [
        "           .-.",
        "          /   \\",
        "         | ()  |    .-------------------------------------------.",
        "          \\ _ /    |  \"Art is how we decorate space;            |",
        "           | |     |   design is how we decorate time and       |",
        "         .-' '-.   |   make everyday life a little gentler.\"     |",
        "        /   🎨  \\   '-------------------------------------------'",
        "       /         \\",
        "      '-----------'"
      ].join('\n');

      console.log('%c' + sketch, 'color: #A58BC7; font-family: monospace; font-weight: bold;');
      console.log(
        'Digisha is also a self-taught artist specializing in hyperrealistic graphite portraits\n' +
        '(spending up to 40-50 hours on a single portrait to capture raw human expression).\n' +
        'Take a look at the artwork gallery on about.html or on Instagram @geethstories!'
      );
      return '🎨 "Every detail is something a real person will experience."';
    },

    secret: function () {
      console.log(
        '%c🤫 Behind-the-Scenes Portfolio Secrets:%c\n\n' +
        '1. %cThe Custom Brush Cursor%c\n' +
        '   On the homepage, your cursor turns into an authentic paintbrush icon (`assets/images/index/img1.png`).\n\n' +
        '2. %cWatercolor Stroke Physics%c\n' +
        '   The homepage paint strokes use quadratic Bézier curves with a soft under-stroke, main color stroke,\n' +
        '   and a subtle white dry-brush highlight that tapers gracefully as it fades.\n\n' +
        '3. %cDesign Rule #1%c\n' +
        '   "Write the problem, not the solution. A clear problem statement holds no suggestions — just what\'s wrong."\n\n' +
        '4. %cOff-Screen Rituals%c\n' +
        '   Deep focus is fueled by masala chai, quiet books, and food documentaries.\n',
        'font-weight: 700; font-size: 13px; color: #72B89A;', '',
        'font-weight: bold; color: #E58B8B;', '',
        'font-weight: bold; color: #72B89A;', '',
        'font-weight: bold; color: #78A3D8;', '',
        'font-weight: bold; color: #E4B45E;', ''
      );
      return '✨ You found the secret notes!';
    },

    paint: function () {
      return triggerPaintSwirl();
    },

    confetti: function () {
      return triggerConfetti();
    },

    contact: function () {
      console.log(
        '%cLet\'s talk design, healthcare, or art:%c\n\n' +
        '  📧 Email:     digisha.vp@gmail.com\n' +
        '  💼 LinkedIn:  https://www.linkedin.com/in/digisha-v-p/\n' +
        '  🎨 Behance:   https://www.behance.net/digishavp\n' +
        '  📸 Instagram: https://www.instagram.com/geethstories\n',
        'font-weight: 700; font-size: 13px; color: #E58B8B;', ''
      );
      return '💌 Looking forward to hearing from you!';
    },

    hireMe: function () {
      return dvp.contact();
    }
  };

  // Expose dvp globally
  window.dvp = dvp;

  // Print welcome banner on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', printBanner);
  } else {
    printBanner();
  }

  // Easter egg: Konami code detector (↑ ↑ ↓ ↓ ← → ← → B A)
  const konamiSequence = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];
  let konamiIndex = 0;

  window.addEventListener('keydown', function (e) {
    const expected = konamiSequence[konamiIndex];
    const match = (e.code === expected) || (e.key === expected) ||
      (expected === 'KeyB' && (e.key === 'b' || e.key === 'B')) ||
      (expected === 'KeyA' && (e.key === 'a' || e.key === 'A'));

    if (match) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiIndex = 0;
        console.log(
          '%c 🎮 KONAMI CODE UNLOCKED! 🌟 %c\n' +
          'You are a true explorer! Unleashing a celebration shower across the screen...',
          'background: #78A3D8; color: #FFFFFF; font-weight: bold; font-size: 13px; padding: 4px 10px; border-radius: 4px;',
          'font-weight: 600; font-size: 12px; margin-top: 4px;'
        );
        dvp.confetti();
      }
    } else {
      konamiIndex = 0;
    }
  });
})();
