
(() => {
  const hero = document.getElementById('paintHero');
  const canvas = document.getElementById('paintCanvas');
  if (!hero || !canvas) return;

  const ctx = canvas.getContext('2d');
  const colors = ['#E58B8B','#E4B45E','#72B89A','#78A3D8','#A58BC7','#E39963'];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let points = [];
  let colorIndex = 0;
  let lastPoint = null;
  let raf;

  const rgb = hex => {
    const h = hex.slice(1);
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  };

  function resize(){
    const r = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width*dpr);
    canvas.height = Math.round(r.height*dpr);
    canvas.style.width = r.width+'px';
    canvas.style.height = r.height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    draw();
  }

  function addPoint(x,y){
    const last = points[points.length-1];
    if(!last || Math.hypot(x-last.x,y-last.y)>3){
      points.push({x,y,age:0,color:colors[colorIndex%colors.length],tilt:(Math.random()-.5)*.2});
      colorIndex++;
    }
    if(points.length>900) points.splice(0,100);
  }

  function draw(){
    const w=hero.clientWidth,h=hero.clientHeight;
    ctx.clearRect(0,0,w,h);
    if(points.length<2) return;

    ctx.lineCap='round';
    ctx.lineJoin='round';

    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i];
      const life=Math.max(0,1-a.age);
      const [r,g,bl]=rgb(a.color);
      // soft brush under-stroke
      ctx.strokeStyle=`rgba(${r},${g},${bl},${0.055*life})`;
      ctx.lineWidth=8.5;
      ctx.beginPath();
      ctx.moveTo(a.x,a.y);
      ctx.quadraticCurveTo((a.x+b.x)/2+a.tilt*8,(a.y+b.y)/2-a.tilt*8,b.x,b.y);
      ctx.stroke();

      // main paint stroke
      ctx.strokeStyle=`rgba(${r},${g},${bl},${0.46*life})`;
      ctx.lineWidth=3.2;
      ctx.beginPath();
      ctx.moveTo(a.x,a.y);
      ctx.quadraticCurveTo((a.x+b.x)/2+a.tilt*5,(a.y+b.y)/2-a.tilt*5,b.x,b.y);
      ctx.stroke();

      // tiny dry-brush texture
      ctx.strokeStyle=`rgba(255,255,255,${0.11*life})`;
      ctx.lineWidth=.8;
      ctx.beginPath();
      ctx.moveTo(a.x+.8,a.y-.6);
      ctx.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2,b.x+.8,b.y-.6);
      ctx.stroke();
    }
  }

  function animate(){
    points.forEach(p=>p.age += reduced.matches ? .02 : .008);
    points=points.filter(p=>p.age<1);
    draw();
    raf=requestAnimationFrame(animate);
  }

  function move(e){
    if(e.pointerType==='touch') return;
    const r=hero.getBoundingClientRect();
    const x=e.clientX-r.left,y=e.clientY-r.top;
    if(x<0||y<0||x>r.width||y>r.height) return;

    addPoint(x,y);
    hero.classList.add('has-paint');
    lastPoint={x,y};
  }

  hero.addEventListener('pointermove',move,{passive:true});
  hero.addEventListener('pointerleave',()=>{
    lastPoint=null;
  });
  window.addEventListener('resize',resize);
  resize();
  cancelAnimationFrame(raf);
  animate();
})();

// --- Scroll Interactions & Stacking Physics Controller ---
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const heroCopy = document.querySelector('.hero-copy');
  const scrollCue = document.getElementById('scrollCue');
  const workSection = document.getElementById('work');
  const tiles = Array.from(document.querySelectorAll('.work .tile'));
  const activeIdxEl = document.getElementById('activeWorkIdx');

  if (scrollCue && workSection) {
    scrollCue.addEventListener('click', (e) => {
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
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;

    // 1. Hero Parallax & Fade
    if (heroCopy && scrollY < windowH) {
      const heroProgress = Math.min(scrollY / 450, 1);
      const translateY = scrollY * 0.28;
      const opacity = Math.max(0, 1 - heroProgress * 1.05);
      heroCopy.style.transform = `translateY(${translateY.toFixed(1)}px)`;
      heroCopy.style.opacity = opacity.toFixed(3);
    } else if (heroCopy && heroCopy.style.opacity !== '') {
      heroCopy.style.transform = '';
      heroCopy.style.opacity = '';
    }

    // 2. Card Stacking Depth & Active Index Update
    if (window.innerWidth > 768) {
      let currentActive = 1;

      tiles.forEach((tile, idx) => {
        const nextTile = tiles[idx + 1];
        if (nextTile) {
          const nextRect = nextTile.getBoundingClientRect();
          const tileRect = tile.getBoundingClientRect();
          const overlap = tileRect.bottom - nextRect.top;
          if (overlap > 0 && nextRect.top <= tileRect.bottom) {
            const overlapProgress = Math.min(Math.max(overlap / (tileRect.height * 0.8), 0), 1);
            const scale = 1 - 0.05 * overlapProgress;
            const brightness = 1 - 0.08 * overlapProgress;
            const shiftY = -14 * overlapProgress;
            tile.style.transform = `scale(${scale.toFixed(3)}) translateY(${shiftY.toFixed(1)}px)`;
            tile.style.filter = `brightness(${brightness.toFixed(3)})`;
          } else {
            tile.style.transform = '';
            tile.style.filter = '';
          }
        }

        const rect = tile.getBoundingClientRect();
        if (rect.top <= windowH * 0.45) {
          currentActive = idx + 1;
        }
      });

      if (activeIdxEl) {
        const formatted = String(currentActive).padStart(2, '0');
        if (activeIdxEl.textContent !== formatted) {
          activeIdxEl.textContent = formatted;
        }
      }
    } else {
      tiles.forEach(tile => {
        tile.style.transform = '';
        tile.style.filter = '';
      });
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateScroll();
})();
