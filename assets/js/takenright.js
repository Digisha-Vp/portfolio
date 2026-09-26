/**
 * TakenRight Interactive Screen Marquee:
 * - Ambient continuous drift with seamless infinite wrap
 * - Scroll-velocity momentum coupling (scrolling vertically nudges horizontal reel)
 * - Hover pause for detailed inspection
 * - Hardware accelerated translate3d
 */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const marquee = document.querySelector('.marq');
  const track = document.querySelector('.mt');
  if (!marquee || !track) return;

  const firstSet = track.firstElementChild;
  if (!firstSet) return;

  // Clone set for seamless infinite wrap
  const clone = firstSet.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.querySelectorAll('img').forEach(img => { img.alt = ''; });
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
  let rafId = null;

  function measure() {
    setWidth = firstSet.offsetWidth;
  }

  // Ensure images are measured after loading
  window.addEventListener('load', measure);
  window.addEventListener('resize', measure);
  measure();

  // Scroll velocity tracker
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;
    lastScrollY = currentY;

    // Check if marquee is near the viewport
    const rect = marquee.getBoundingClientRect();
    if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
      // Direct inertia injection
      scrollVelocity += delta * 0.35;
      // Cap maximum scroll-boost to keep it readable and smooth
      scrollVelocity = Math.max(-15, Math.min(15, scrollVelocity));
    }
  }, { passive: true });

  marquee.addEventListener('mouseenter', () => { isHovered = true; });
  marquee.addEventListener('mouseleave', () => { isHovered = false; });

  // Touch drag support
  let isDragging = false;
  let dragStartX = 0;
  let dragStartOffset = 0;

  marquee.addEventListener('pointerdown', (e) => {
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

  const BASE_SPEED = 0.55; // Pixels per frame

  function animate() {
    if (!isDragging) {
      if (!isHovered) {
        // Friction decay on scroll velocity
        scrollVelocity *= 0.93;
        offset -= (BASE_SPEED + scrollVelocity);
      } else {
        // When hovered, decay velocity quickly to stop
        scrollVelocity *= 0.85;
        offset -= scrollVelocity;
      }

      // Infinite seamless wrap
      if (setWidth > 0) {
        if (Math.abs(offset) >= setWidth) {
          offset += setWidth;
        } else if (offset > 0) {
          offset -= setWidth;
        }
      }

      track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
    }

    rafId = requestAnimationFrame(animate);
  }

  // Cancel any old CSS animation classes to avoid conflicts
  track.classList.remove('on');
  animate();
})();