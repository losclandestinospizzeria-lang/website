/* =============================================
   LOS CLANDESTINOS — Main JS
   GSAP + ScrollTrigger powered interactions
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // These run immediately — no GSAP dependency
  initCtaBanner();
  initLangSwitcher();
  initLogoColorSwitch();

  // Wait for GSAP to load (deferred scripts)
  const waitForGSAP = setInterval(() => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      clearInterval(waitForGSAP);
      init();
    }
  }, 50);

  // Fallback if GSAP takes too long
  setTimeout(() => {
    clearInterval(waitForGSAP);
    if (typeof gsap === 'undefined') initWithoutGSAP();
  }, 3000);

});

function init() {
  gsap.registerPlugin(ScrollTrigger);

  initPizzaOrbit();
  initWordSwitcher();
  initMarqueeParallax();
  initWoodPanel();
  initCrunchParallax();
  initProductSection();
  initCocktailCarousel();
  initLogoColorSwitch();
  initFallbackImages();
  initLangSwitcher();
}

/* =============================================
   PIZZA ORBIT — Hero
   5 pizzas orbit a central circular path
   ============================================= */
function initPizzaOrbit() {
  // Speeds reduced a further 50% — sizes increased ~40%
  const pizzas = [
    { id: '#p1', layer: 1, radius: 38, angle: 0,    size: 310, speed: 0.000036 },
    { id: '#p2', layer: 2, radius: 42, angle: 72,   size: 255, speed: 0.000044 },
    { id: '#p3', layer: 3, radius: 36, angle: 144,  size: 365, speed: 0.000030 },
    { id: '#p4', layer: 4, radius: 40, angle: 216,  size: 280, speed: 0.000040 },
    { id: '#p5', layer: 5, radius: 44, angle: 288,  size: 210, speed: 0.000050 },
  ];

  const hero   = document.getElementById('hero');
  const orbit  = document.querySelector('.pizza-orbit');
  const cx = () => hero.offsetWidth  / 2;
  const cy = () => hero.offsetHeight / 2;
  const toRad  = (deg) => deg * Math.PI / 180;

  let raf;

  function animate(ts) {
    pizzas.forEach(p => {
      const el = document.querySelector(p.id);
      if (!el) return;
      const angle = toRad(p.angle + ts * p.speed * 1000);
      const hw = hero.offsetWidth;
      const hh = hero.offsetHeight;
      const rx = (hw * p.radius / 100) * 1.1;
      const ry = (hh * p.radius / 100) * 0.7;
      const x  = cx() + rx * Math.cos(angle) - p.size / 2;
      const y  = cy() + ry * Math.sin(angle) - p.size / 2;
      el.style.left = x + 'px';
      el.style.top  = y + 'px';
    });
    raf = requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // Pause when hero leaves viewport (perf)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) requestAnimationFrame(animate);
      else cancelAnimationFrame(raf);
    });
  });
  observer.observe(hero);

  // ── Label hover: spotlight a specific layer ──────────────────────────
  function spotlight(layerNum) {
    orbit.classList.add('pizza-orbit--hovering');
    document.querySelectorAll('.pizza-item').forEach(el => {
      el.classList.remove('pizza-item--spotlight');
      if (parseInt(el.dataset.layer) === layerNum) {
        el.classList.add('pizza-item--spotlight');
      }
    });
  }

  function clearSpotlight() {
    orbit.classList.remove('pizza-orbit--hovering');
    document.querySelectorAll('.pizza-item').forEach(el => {
      el.classList.remove('pizza-item--spotlight');
    });
  }

  // DOP Cheese label → hover spotlights Layer 1
  const dopLabel = document.querySelector('.label-dop');
  if (dopLabel) {
    dopLabel.addEventListener('mouseenter', () => spotlight(1));
    dopLabel.addEventListener('mouseleave', clearSpotlight);
  }

  // OUR NEW REFUGIO button → hover spotlights Layer 4 (same as DOP CHEESE)
  const refugioBtn = document.getElementById('btnRefugio');
  if (refugioBtn) {
    refugioBtn.addEventListener('mouseenter', () => spotlight(4));
    refugioBtn.addEventListener('mouseleave', () => clearSpotlight());
  }
}

/* =============================================
   WORD SWITCHER — JAMÓN / QUESO / ANCHOAS
   ============================================= */
function initWordSwitcher() {
  const words = document.querySelectorAll('.hero__word');
  if (!words.length) return;

  let current = 0;
  const INTERVAL = 2200;
  const wrap = document.getElementById('wordWrap');

  // Ensure first word is visible immediately
  words[0].classList.add('hero__word--active');
  words[0].classList.remove('hero__word--enter');

  // Size wrapper — use a probe that inherits computed styles from the real words
  function measureAndSet() {
    const probe = document.createElement('span');
    // Copy computed style from first word so font/size/spacing are identical
    const wCs = window.getComputedStyle(words[0]);
    probe.style.cssText = [
      'position:fixed',
      'top:-9999px',
      'left:-9999px',
      'visibility:hidden',
      'pointer-events:none',
      'white-space:nowrap',
      'font-family:' + wCs.fontFamily,
      'font-size:'   + wCs.fontSize,
      'font-weight:' + wCs.fontWeight,
      'letter-spacing:' + wCs.letterSpacing,
      'line-height:' + wCs.lineHeight,
      'text-transform:' + wCs.textTransform,
    ].join(';');
    document.body.appendChild(probe);

    let maxW = 0;
    let maxH = 0;
    words.forEach(w => {
      probe.textContent = w.textContent.trim();
      maxW = Math.max(maxW, probe.offsetWidth);
      maxH = Math.max(maxH, probe.offsetHeight);
    });
    document.body.removeChild(probe);

    if (maxW > 30) wrap.style.width  = maxW + 'px';
    if (maxH > 10) wrap.style.height = (maxH + 4) + 'px';
  }

  // Run after fonts confirmed loaded, then again for safety
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measureAndSet);
  }
  setTimeout(measureAndSet, 300);
  setTimeout(measureAndSet, 800);

  function cycle() {
    const prev = words[current];
    current = (current + 1) % words.length;
    const next = words[current];

    // Exit current
    prev.classList.remove('hero__word--active');
    prev.classList.add('hero__word--exit');

    // Enter next
    next.classList.remove('hero__word--enter');
    next.classList.add('hero__word--active');

    // Reset exit after animation
    setTimeout(() => {
      prev.classList.remove('hero__word--exit');
      prev.classList.add('hero__word--enter');
    }, 700);
  }

  setInterval(cycle, INTERVAL);
}

/* =============================================
   MARQUEE PARALLAX
   Lines move in opposite directions on scroll
   Line 1: left-to-right, Line 2: right-to-left
   ============================================= */
function initMarqueeParallax() {
  const lineTop = document.getElementById('marqueeLineTop');
  const lineBot = document.getElementById('marqueeLineBot');
  if (!lineTop || !lineBot) return;

  // Line 1: slides LEFT → RIGHT on scroll
  gsap.fromTo(lineTop,
    { x: '-12%' },
    {
      x: '12%',
      ease: 'none',
      scrollTrigger: {
        trigger: '#marquee',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      }
    }
  );

  // Line 2: slides RIGHT → LEFT on scroll
  gsap.fromTo(lineBot,
    { x: '12%' },
    {
      x: '-12%',
      ease: 'none',
      scrollTrigger: {
        trigger: '#marquee',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      }
    }
  );
}

/* =============================================
   WOOD PANEL — Slide in from left on scroll
   ============================================= */
function initWoodPanel() {
  const panel = document.getElementById('woodPanel');
  if (!panel) return;

  gsap.to(panel, {
    x: '28%',
    ease: 'none',
    scrollTrigger: {
      trigger: '#marquee',
      start: 'top 80%',
      end: 'center center',
      scrub: 1.5,
    }
  });
}

/* =============================================
   CRUNCH SECTION — Board slides in + text parallax
   ============================================= */
function initCrunchParallax() {
  const board = document.getElementById('crunchBoard');
  const line1 = document.getElementById('crunchLine1');
  const line2 = document.getElementById('crunchLine2');

  if (board) {
    // Board starts off-screen left (CSS: translate(-70%,-50%))
    // GSAP moves it rightward into view — bigger board needs more travel
    gsap.to(board, {
      x: '15%',
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#crunch',
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 1.5,
      }
    });
  }

  // Text lines move in opposite directions (parallax skew)
  if (line1) {
    gsap.fromTo(line1,
      { x: '20%' },
      {
        x: '-5%',
        ease: 'none',
        scrollTrigger: {
          trigger: '#crunch',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      }
    );
  }

  if (line2) {
    gsap.fromTo(line2,
      { x: '5%' },
      {
        x: '-15%',
        ease: 'none',
        scrollTrigger: {
          trigger: '#crunch',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        }
      }
    );
  }
}

/* =============================================
   PIZZA REVEAL — Canvas crack animation
   Pizza image drawn on canvas, then wedge slices
   spread apart on scroll to reveal text beneath
   ============================================= */
function initPizzaReveal() {
  const canvas = document.getElementById('pizzaCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const container = document.getElementById('pizzaReveal');
  const NUM_SLICES = 8;

  let pizzaImg = new Image();
  // Use a data URI pizza placeholder until real image loads
  pizzaImg.crossOrigin = 'anonymous';
  pizzaImg.src = 'images/pizza-whole.jpg';

  // Resize canvas to container
  function resize() {
    canvas.width  = container.offsetWidth;
    canvas.height = container.offsetHeight;
    drawSlices(0);
  }
  resize();
  window.addEventListener('resize', resize);

  function drawSlices(progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const r  = Math.min(w, h) * 0.44;
    const angleStep = (Math.PI * 2) / NUM_SLICES;
    const maxSpread = r * 0.65; // spread relative to pizza radius

    for (let i = 0; i < NUM_SLICES; i++) {
      const startAngle = i * angleStep - Math.PI / 2;
      const endAngle   = startAngle + angleStep;
      const midAngle   = (startAngle + endAngle) / 2;

      const dx = Math.cos(midAngle) * maxSpread * progress;
      const dy = Math.sin(midAngle) * maxSpread * progress;

      ctx.save();
      ctx.translate(cx + dx, cy + dy);

      // Draw wedge relative to translated origin (cx=0,cy=0 in local space)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, startAngle, endAngle);
      ctx.closePath();

      if (pizzaImg.complete && pizzaImg.naturalWidth > 0) {
        // Clip and draw image
        ctx.save();
        ctx.clip();
        ctx.drawImage(pizzaImg, -r, -r, r * 2, r * 2);
        ctx.restore();
      } else {
        // Placeholder: tomato/cheese layers
        const topping = `hsl(${28 + i * 4}, 72%, ${42 + i}%)`;
        ctx.fillStyle = topping;
        ctx.fill();
        // Inner cheese ring
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r * 0.72, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = '#E8C060';
        ctx.fill();
        // Tomato centre
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r * 0.42, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = '#C83028';
        ctx.fill();
        // Crust (outer arc)
        ctx.beginPath();
        ctx.arc(0, 0, r, startAngle, endAngle);
        ctx.strokeStyle = '#7A4010';
        ctx.lineWidth = 10;
        ctx.stroke();
      }

      // Cut-line between slices
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(startAngle) * r * 1.02,
        Math.sin(startAngle) * r * 1.02
      );
      const crackAlpha = Math.min(1, progress * 3);
      const crackWidth = 2 + progress * 10;
      ctx.strokeStyle = `rgba(242, 234, 216, ${crackAlpha})`;
      ctx.lineWidth = crackWidth;
      ctx.stroke();

      ctx.restore();
    }
  }

  // Load image then re-render
  pizzaImg.onload = () => drawSlices(0);

  // ScrollTrigger to drive the split
  let prog = { val: 0 };
  ScrollTrigger.create({
    trigger: '#reveal',
    start: 'top bottom',
    end: 'bottom bottom',
    scrub: 1.5,
    onUpdate: (self) => {
      drawSlices(self.progress);
    }
  });
}

/* =============================================
   LOGO COLOR SWITCH
   Red logo on bright (cream/white) backgrounds,
   white/cream logo on red or dark backgrounds
   ============================================= */
let _logoSwitchInited = false;
function initLogoColorSwitch() {
  // Guard: only init once — this function is called both at DOMContentLoaded
  // and inside init() after GSAP loads. Running it twice creates two observers
  // that fight each other and cause the logo to flicker to red on first load.
  if (_logoSwitchInited) return;
  _logoSwitchInited = true;

  const logo  = document.getElementById('navLogo');
  const navEl = document.querySelector('.nav');
  if (!logo) return;

  const LOGO_WHITE = 'images/logo-white.svg';
  const LOGO_RED   = 'images/logo-red.svg';

  // Force white immediately — page always starts at the top (dark hero).
  logo.src = LOGO_WHITE;
  navEl && navEl.classList.remove('nav--light');

  const darkSections = [
    document.querySelector('.hero'),
    document.querySelector('.productos-hero'),
    document.querySelector('.ticker-section'),
    document.querySelector('.site-footer'),
    document.querySelector('.footer'),
  ].filter(Boolean);

  // Use a Set so each section counts once regardless of observer firing order.
  const visibleDark = new Set();

  function update() {
    if (visibleDark.size > 0) {
      logo.src = LOGO_WHITE;
      navEl && navEl.classList.remove('nav--light');
    } else {
      logo.src = LOGO_RED;
      navEl && navEl.classList.add('nav--light');
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleDark.add(entry.target);
      } else {
        visibleDark.delete(entry.target);
      }
    });
    update();
  }, {
    rootMargin: '0px 0px -85% 0px',
    threshold: 0,
  });

  darkSections.forEach(s => observer.observe(s));
}

/* =============================================
   PRODUCT SECTION — Scroll-triggered slide-in
   Each row: image slides from one side, title from the other
   ============================================= */
function initProductSection() {
  const rows = document.querySelectorAll('.product-row');
  if (!rows.length) return;

  rows.forEach((row, i) => {
    const imgWrap = row.querySelector('.product-img-wrap');
    const text    = row.querySelector('.product-text');
    if (!imgWrap || !text) return;

    const isReverse = row.classList.contains('product-row--reverse');

    // Normal rows (1 & 3): text left slides from left, image right slides from right
    // Reverse row (2): image left slides from left, text right slides from right
    const textX = isReverse ?  120 : -120;
    const imgX  = isReverse ? -120 :  120;

    gsap.fromTo(
      text,
      { x: textX, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 82%',
          toggleActions: 'play none none none',
        }
      }
    );

    gsap.fromTo(
      imgWrap,
      { x: imgX, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1.1,
        delay: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 82%',
          toggleActions: 'play none none none',
        }
      }
    );

    // Subtle vertical parallax on the image as user scrolls
    const img = imgWrap.querySelector('img');
    if (img) {
      gsap.fromTo(
        img,
        { y: -18 },
        {
          y: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          }
        }
      );
    }
  });

  // Fade-in animation for the banner (GSAP available here)
  const ctaBanner = document.querySelector('.cta-banner');
  if (ctaBanner) {
    gsap.fromTo(
      ctaBanner,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ctaBanner,
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      }
    );
  }
}

/* =============================================
   CTA BANNER — injected after product row 3
   Runs immediately, no GSAP needed
   ============================================= */
function initCtaBanner() {
  const rows = document.querySelectorAll('.product-row');
  const lastRow = rows[rows.length - 1];
  if (!lastRow || document.querySelector('.cta-banner')) return;

  const lang = document.documentElement.lang || 'es';
  const t = i18n[lang] || i18n['es'];

  const banner = document.createElement('div');
  banner.className = 'cta-banner';
  banner.innerHTML = `
    <span class="cta-banner__eyebrow" data-i18n="cta-eyebrow">${t['cta-eyebrow'] || 'Ingredientes de Italia · Directamente a ti'}</span>
    <h2 class="cta-banner__title" data-i18n="cta-title">${t['cta-title'] || '¿Listo para saborear la autenticidad?'}</h2>
    <p class="cta-banner__sub" data-i18n="cta-sub">${t['cta-sub'] || 'Pide online y disfruta de los mejores ingredientes italianos esta noche.'}</p>
    <a href="https://losclandestinos.turbopos.es/" target="_blank" rel="noopener" class="cta-banner__btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <span data-i18n="cta-btn">${t['cta-btn'] || '¡PIDE AHORA!'}</span>
    </a>
  `;
  lastRow.insertAdjacentElement('afterend', banner);
}

/* =============================================
   FALLBACK IMAGES — Generate CSS gradient
   placeholders for any missing images
   ============================================= */
function initFallbackImages() {
  const gradients = {
    'images/pizza1.jpg':      'radial-gradient(circle, #E8B84B 30%, #C8202A 70%, #8B1A1A 100%)',
    'images/pizza2.jpg':      'radial-gradient(circle, #F5D78E 20%, #D4A030 50%, #9B6A20 100%)',
    'images/pizza3.jpg':      'radial-gradient(circle, #FAC060 25%, #C84020 60%, #7A1810 100%)',
    'images/pizza4.jpg':      'radial-gradient(circle, #E0C070 20%, #B83820 55%, #6A1010 100%)',
    'images/pizza5.jpg':      'radial-gradient(circle, #F0D080 30%, #CC6020 65%, #882010 100%)',
    'images/woodboard.jpg':   'linear-gradient(160deg, #8B6010 0%, #6A4808 60%, #4A3005 100%)',
    'images/foodboard.jpg':   'linear-gradient(150deg, #7A5510 0%, #5A3808 60%, #3A2205 100%)',
    'images/pizza-whole.jpg': 'radial-gradient(circle, #E8B84B 25%, #C8202A 55%, #8B1A1A 80%, #5A1010 100%)',
    'images/pizzahands.jpg':  'linear-gradient(180deg, #1C1008 0%, #2A1810 50%, #1A0C04 100%)',
  };

  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      const src = this.getAttribute('src');
      const gradient = gradients[src] || 'linear-gradient(135deg, #1A1A1A, #333)';
      const parent = this.parentElement;
      if (parent && (parent.classList.contains('pizza-item') || this.style.borderRadius === '50%')) {
        parent.style.background = gradient;
        parent.style.borderRadius = '50%';
      } else {
        parent.style.background = gradient;
        parent.style.backgroundSize = 'cover';
      }
      this.style.display = 'none';
    });
  });
}

/* =============================================
   COCKTAIL CAROUSEL — mobile swipe + arrows
   Desktop: CSS grid (all 4 visible)
   Mobile: JS carousel with translateX
   ============================================= */
function initCocktailCarousel() {
  const track = document.getElementById('cocktailsTrack');
  const prevBtn = document.getElementById('cocktailPrev');
  const nextBtn = document.getElementById('cocktailNext');
  const dotsContainer = document.getElementById('cocktailDots');

  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const cards = track.querySelectorAll('.cocktail-card');
  const total = cards.length;
  let current = 0;

  // Create dots
  dotsContainer.innerHTML = '';
  const dots = [];
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'cocktail-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
    dots.push(dot);
  }

  function updateUI() {
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    prevBtn.style.opacity = current === 0 ? '0.3' : '1';
    nextBtn.style.opacity = current === total - 1 ? '0.3' : '1';
  }

  function goTo(index) {
    current = Math.max(0, Math.min(total - 1, index));
    updateUI();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch / swipe support
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = false;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
      isDragging = true;
    }
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      goTo(dx < 0 ? current + 1 : current - 1);
    }
  });

  // Init
  updateUI();
}

/* =============================================
   FALLBACK — if GSAP fails to load
   ============================================= */
function initWithoutGSAP() {
  initCtaBanner();
  initWordSwitcher();
  initCocktailCarousel();
  initFallbackImages();
  initLangSwitcher();
  initLogoColorSwitch();
  // Basic pizza orbit with vanilla JS
  const pizzas = ['#p1','#p2','#p3','#p4','#p5'];
  const hero = document.getElementById('hero');
  const radii = [38, 42, 36, 40, 44];
  const sizes = [220, 180, 260, 200, 150];
  const speeds = [0.000072, 0.000088, 0.000060, 0.000080, 0.000100]; // 60% slower
  const offsets = [0, 72, 144, 216, 288];

  function animate(ts) {
    pizzas.forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const angle = (offsets[i] + ts * speeds[i] * 1000) * Math.PI / 180;
      const hw = hero.offsetWidth, hh = hero.offsetHeight;
      const rx = (hw * radii[i] / 100) * 1.1;
      const ry = (hh * radii[i] / 100) * 0.7;
      el.style.left = (hw/2 + rx * Math.cos(angle) - sizes[i]/2) + 'px';
      el.style.top  = (hh/2 + ry * Math.sin(angle) - sizes[i]/2) + 'px';
    });
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/* =============================================
   LANGUAGE SWITCHER — EN / ES
   ============================================= */
const i18n = {
  es: {
    'nav-order':          'PIDE AHORA',
    'nav-products':       'NUESTROS PRODUCTOS',
    'hero-static':        'QUÉ GANAS DE',
    'word-0':             'JAMÓN',
    'word-1':             'QUESO',
    'word-2':             'ANCHOAS',
    'label-refugio-text': 'NUEVA PIZZA REFUGIO',
    'about-eyebrow':      'La Línea · Desde 2023',
    'about-body-1':       'Los Clandestinos nace de la amistad y del deseo de crear algo especial entre La Línea de la Concepción y la comunidad fronteriza de Gibraltar. Un proyecto marcado por la frontera, el Brexit y la pandemia, donde encontramos en la pizza una forma de unir culturas y seguir adelante.',
    'about-body-2':       'Nuestras raíces vienen de Abruzzo, una tierra con un ritmo de vida muy cercano al andaluz: pasión por la buena comida, respeto por los tiempos y amor por los ingredientes. Ese saber hacer se traduce en cada detalle: la fermentación de la masa, la selección de harinas y los aceites de oliva de Málaga.',
    'about-body-3':       'Porque las recetas más sencillas son las que cuentan las mejores historias.',
    'tag-0':              'Horno de piedra',
    'tag-1':              'Masa artesanal',
    'tag-2':              'Ingredientes DOP',
    'tag-3':              'Abierto desde 2023',
    'products-eyebrow':   'Dal forno · Desde el horno',
    'prod-1-desc':        'Prosciutto di Parma que se deshace en la boca, mozzarella di bufala de cremosidad delicada, rúcula fresca con su punto amargo justo, y tomates cherry que estallan dulcemente en cada bocado.',
    'prod-2-desc':        'Capas de pasta fresca, ragú de cocción lenta y bechamel cremosa. La lasaña como debe ser: generosa, honesta y sin atajos. El plato que te reconcilia con el mundo.',
    'prod-3-desc':        'Cinco quesos con denominación de origen, seleccionados para recorrer Italia en un solo bocado. Los acompañamos con nueces tostadas, miel artesanal y tomates cherry desecados que aportan ese punto dulce y concentrado que lo cambia todo. Para compartir — o no.',
    'prod-4-title':       'Cannoli<br>Siciliani',
    'prod-4-desc':        'Crocante exterior que cede ante un corazón de ricotta artesanal, suave y aterciopelado. Pepitas de chocolate y pistacho tostado completan esta oda a la tradición siciliana. Un final irresistible que merece su propio espacio.',
    'cocktails-eyebrow':  'Cocktail bar · Bebidas',
    'cocktail-1-desc':    'Aperol, prosecco, soda, naranja. El brindis perfecto antes de la pizza.',
    'cocktail-2-desc':    'Gin, Campari, vermut rojo. Amargo, elegante, sin compromiso.',
    'cocktail-3-desc':    'Campari, vermut rojo, soda. Refrescante y con carácter italiano.',
    'cocktail-4-desc':    'Vodka, licor de café, espresso doble. El final perfecto de la noche.',
    'reviews-eyebrow':    'Reseñas · Rankings',
    'reviews-title':      'Valorada por quienes siempre vuelven',
    'reviews-google':     'Ranking Google',
    'reviews-justeat':    'Ranking Just Eat',
    'footer-find-us':     'Encuéntranos',
    'footer-hours':       'Horario',
    'footer-mon-tue':     'Lun: Cerrado',
    'footer-wed-sun':     'Dom / Jue–Sáb: 13:00–15:30, 19:30–23:30 · Mar: 19:00–23:00 · Mié: 19:30–23:30',
    'footer-closed':      'Cerrado',
    'footer-cta':         'PIDE AHORA',
    'footer-bottom':      '© 2026 Los Clandestinos Pizzería Italiana · Calle Carboneros 5, La Línea',
    /* Location section */
    'loc-eyebrow':        'Encuéntranos · Find Us',
    'loc-addr-label':     'Dirección',
    'loc-hours-label':    'Horario',
    'loc-hours-text':     'Dom: 13:00–15:30, 19:30–23:30<br>Lun: Cerrado<br>Mar: 19:00–23:00<br>Mié: 19:30–23:30<br>Jue: 13:00–15:30, 19:30–23:30<br>Vie: 13:00–15:30, 19:30–23:30<br>Sáb: 13:00–15:30, 19:30–23:30',
    'loc-contact-label':  'Teléfono',
    'loc-social-label':   'Instagram',
    'loc-btn-call':       'Llamar ahora',
    'loc-btn-maps':       'Cómo llegar',
    'loc-btn-insta':      'Instagram',
    'loc-btn-order':      'PIDE AHORA',
    /* Productos page */
    'page-hero-title-1':  'NUESTROS',
    'page-hero-title-2':  'PRODUCTOS',
    'page-hero-eyebrow':  'Ingredientes Italianos · Ingredientes de alta calidad',
    'page-hero-sub':      'Seleccionamos los mejores ingredientes italianos y locales para traerlos directamente a tu mesa, para que puedas saborear una pizza incredibilmente autentica.',
    'page-back':          '← Volver al inicio',
    'page-sec-eyebrow':   'Importado directamente · Straight from Italy',
    'prod-p1-title':      'Harina<br>Maestra',
    'prod-p1-desc':       'La auténtica harina Pizzajuolo, aprobada por la AVPN (Associazione Verace Pizza Napoletana), realza las excelencias de la pizza napolitana, ofreciendo una corteza perfectamente desarrollada y dorada, una masa suave, elástica y fácilmente plegable, además de realzar el sabor de los ingredientes. como el tomate, la mozzarella y el aceite de oliva. Producido por la reconocida marca DallaGiovanna, es la elección favorita de los maestros pizzeros que buscan autenticidad y calidad para crear auténticas experiencias culinarias napolitanas.',
    'prod-p2-title':      'Aceite<br>de Oliva Olvera',
    'prod-p2-desc':       'De la provincia de Málaga, con el carácter del sur. Prensado en frío, de cosecha propia, con una acidez mínima que realza sin tapar. El acabado perfecto para cualquier pizza o tabla — y la razón por la que el primer bocado siempre sorprende.',
    'prod-p3-title':      'Quesos<br>DOP',
    'prod-p3-desc':       'Bufala Campana, Parmigiano Reggiano, Gorgonzola. Tres denominaciones de origen que no necesitan presentación. Los seleccionamos en origen, en su punto exacto de maduración. Porque en una buena pizza, el queso no es un ingrediente más: es el argumento.',
    'prod-p4-title':      'Embutidos<br>Italianos',
    'prod-p4-desc':       'Los mejores embutidos encuentra en las mejores mesas de la familias italianas. Mortadella de Bolonia, bresaola curada, speck di Angus y crudo di Parma. Producto auténtico, traído directamente de Italia. Los mismos que encuentras en las mejores tablas de Milán o Roma — ahora en La Línea.',
    /* CTA Banner */
    'cta-eyebrow':        'Ingredientes de Italia · Directamente a ti',
    'cta-title':          '¿Listo para saborear la autenticidad?',
    'cta-sub':            'Pide online y disfruta de los mejores ingredientes italianos esta noche.',
    'cta-btn':            '¡PIDE AHORA!',
    'page-title':         'Los Clandestinos Pizzería Italiana - La verdadera pizza en el campo de gibraltar',
  },
  en: {
    'nav-order':          'ORDER ONLINE',
    'nav-products':       'OUR PRODUCTS',
    'hero-static':        'CRAVING SOME',
    'word-0':             'HAM',
    'word-1':             'CHEESE',
    'word-2':             'ANCHOVIES',
    'label-refugio-text': 'OUR NEW PIZZA REFUGIO',
    'about-eyebrow':      'La Línea · Since 2023',
    'about-body-1':       'Los Clandestinos was born from friendship and the desire to create something special between La Línea de la Concepción and the border community of Gibraltar. A project shaped by the border, Brexit, and the pandemic—where we found in pizza a way to bring cultures together and keep moving forward.',
    'about-body-2':       'Our roots come from Abruzzo, a land with a rhythm of life close to Andalusia: passion for good food, respect for time, and love for ingredients. That know-how shows up in every detail: dough fermentation, flour selection, and olive oils from Málaga.',
    'about-body-3':       'Because the simplest recipes are the ones that tell the best stories.',
    'tag-0':              'Stone oven',
    'tag-1':              'Artisan dough',
    'tag-2':              'DOP ingredients',
    'tag-3':              'Open since 2023',
    'products-eyebrow':   'Dal forno · From the oven',
    'prod-1-desc':        'Prosciutto di Parma, fior di latte mozzarella, fresh rocket, cherry tomatoes.',
    'prod-2-desc':        'Slow-cooked bolognese ragù, homemade béchamel, parmigiano reggiano DOP, oven-baked.',
    'prod-3-desc':        'Selection of DOP Italian cheeses, cured meats, nuts and artisan jam.',
    'prod-4-title':       'Cannoli<br>Siciliani',
    'prod-4-desc':        'A crisp shell that yields to a heart of artisan ricotta — smooth and velvety. Chocolate chips and toasted pistachio complete this ode to Sicilian tradition. An irresistible finale that deserves its own moment.',
    'cocktails-eyebrow':  'Cocktail bar · Drinks',
    'cocktail-1-desc':    'Aperol, prosecco, soda, orange. The perfect toast before the pizza.',
    'cocktail-2-desc':    'Gin, Campari, red vermouth. Bitter, elegant, uncompromising.',
    'cocktail-3-desc':    'Campari, red vermouth, soda. Refreshing with real Italian character.',
    'cocktail-4-desc':    'Vodka, coffee liqueur, double espresso. The perfect end of the night.',
    'reviews-eyebrow':    'Reviews · Rankings',
    'reviews-title':      'Rated by the people who come back',
    'reviews-google':     'Google ranking',
    'reviews-justeat':    'Just Eat ranking',
    'footer-find-us':     'Find Us',
    'footer-hours':       'Hours',
    'footer-mon-tue':     'Mon: Closed',
    'footer-wed-sun':     'Sun / Thu–Sat: 1:00–3:30 pm, 7:30–11:30 pm · Tue: 7:00–11:00 pm · Wed: 7:30–11:30 pm',
    'footer-closed':      'Closed',
    'footer-cta':         'ORDER NOW',
    'footer-bottom':      '© 2026 Los Clandestinos Italian Pizzeria · Calle Carboneros 5, La Línea',
    /* Location section */
    'loc-eyebrow':        'Find Us · Encuéntranos',
    'loc-addr-label':     'Address',
    'loc-hours-label':    'Opening Hours',
    'loc-hours-text':     'Sun: 1–3:30 pm, 7:30–11:30 pm<br>Mon: Closed<br>Tue: 7–11 pm<br>Wed: 7:30–11:30 pm<br>Thu: 1–3:30 pm, 7:30–11:30 pm<br>Fri: 1–3:30 pm, 7:30–11:30 pm<br>Sat: 1–3:30 pm, 7:30–11:30 pm',
    'loc-contact-label':  'Phone',
    'loc-social-label':   'Instagram',
    'loc-btn-call':       'Call now',
    'loc-btn-maps':       'Get directions',
    'loc-btn-insta':      'Instagram',
    'loc-btn-order':      'ORDER NOW',
    /* Productos page */
    'page-hero-title-1':  'OUR',
    'page-hero-title-2':  'PRODUCTS',
    'page-hero-eyebrow':  'Italian ingredients · Imported directly from Italy',
    'page-hero-sub':      'We source the finest Italian ingredients and bring them straight to your table. No middlemen, no compromises.',
    'page-back':          '← Back to home',
    'page-sec-eyebrow':   'Imported directly · Straight from Italy',
    'prod-p1-title':      'Italian<br>Flours',
    'prod-p1-desc':       'Type 00 and durum wheat semolina from Italian mills. The foundation of our perfect pizza: open crumb, light texture, unmistakable quality.',
    'prod-p2-title':      'Olive<br>Oil Olvera',
    'prod-p2-desc':       'Single-varietal extra virgin olive oil from small producers in southern Italy. Intense, fruity, with the Mediterranean character every dish deserves.',
    'prod-p3-title':      'DOP<br>Cheeses',
    'prod-p3-desc':       'Parmigiano Reggiano, Grana Padano, Pecorino Romano and fior di latte mozzarella. All protected designation of origin — because we accept no imitations.',
    'prod-p4-title':      'Italian<br>Cured Meats',
    'prod-p4-desc':       'Prosciutto di Parma, Speck dell\'Alto Adige, \'Nduja Calabrese and Mortadella di Bologna. Italian salumeria at its finest, straight to your table.',
    /* CTA Banner */
    'cta-eyebrow':        'Ingredients from Italy · Straight to you',
    'cta-title':          'Ready to taste authenticity?',
    'cta-sub':            'Order online and enjoy the finest Italian ingredients tonight.',
    'cta-btn':            'ORDER NOW!',
    'page-title':         'Our Products — Los Clandestinos Italian Pizzeria',
  }
};

function setLang(lang) {
  if (!i18n[lang]) return;
  try { localStorage.setItem('lc-lang', lang); } catch(e) {}
  document.documentElement.lang = lang;
  // Update page title if a translation exists
  const titleVal = i18n[lang]['page-title'];
  if (titleVal) document.title = titleVal;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = i18n[lang][key];
    if (val === undefined) return;
    if (val.includes('<')) {
      el.innerHTML = val;
    } else {
      el.textContent = val;
    }
  });

  /* Word switcher: update text + data-word so word-size probe re-measures */
  document.querySelectorAll('.hero__word').forEach((el, idx) => {
    const val = i18n[lang]['word-' + idx];
    if (!val) return;
    el.textContent = val;
    el.dataset.word = val;
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('lang-btn--active', btn.dataset.lang === lang);
  });
}

function initLangSwitcher() {
  let saved = 'es';
  try { saved = localStorage.getItem('lc-lang') || 'es'; } catch(e) {}

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  setLang(saved);
}
