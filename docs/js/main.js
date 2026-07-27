/* =============================================
   LOS CLANDESTINOS — Main JS
   GSAP + ScrollTrigger powered interactions
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // These run immediately — no GSAP dependency
  initCtaBanner();
  initNews();
  initHorarios();
  initLangSwitcher();
  initLogoColorSwitch();

  // Set up the map observer after the first paint, like Gusto
  requestAnimationFrame(initLazyMap);

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
  initFallbackImages();
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
  if (!hero || !orbit) return;

  // Cache elements and current dimensions once; update on resize
  pizzas.forEach(p => { p.el = document.querySelector(p.id); });
  const toRad  = (deg) => deg * Math.PI / 180;
  let hw = hero.offsetWidth;
  let hh = hero.offsetHeight;
  const onResize = () => { hw = hero.offsetWidth; hh = hero.offsetHeight; };
  window.addEventListener('resize', onResize);

  let raf;

  function animate(ts) {
    pizzas.forEach(p => {
      const el = p.el;
      if (!el) return;
      const angle = toRad(p.angle + ts * p.speed * 1000);
      const rx = (hw * p.radius / 100) * 1.1;
      const ry = (hh * p.radius / 100) * 0.7;
      const sizeW = el.offsetWidth;
      const sizeH = el.offsetHeight;
      const x  = hw / 2 + rx * Math.cos(angle) - sizeW / 2;
      const y  = hh / 2 + ry * Math.sin(angle) - sizeH / 2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    if (running) raf = requestAnimationFrame(animate);
  }

  let running = false;
  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(animate);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  start();

  // Pause when hero leaves viewport (perf)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) start();
      else stop();
    });
  });
  observer.observe(hero);

  // ── Label hover: spotlight a specific layer ──────────────────────────
  // DOP Cheese label → hover spotlights Layer 1
  // OUR NEW REFUGIO button → hover spotlights Layer 4 (same as DOP CHEESE)
}

/* =============================================
   WORD SWITCHER — JAMÓN / QUESO / ANCHOAS
   ============================================= */
function initWordSwitcher() {
  const words = document.querySelectorAll('.hero__word');
  if (!words.length) return;

  let current = 0;
  let cycleInterval;
  const INTERVAL = 2200;
  const wrap = document.getElementById('wordWrap');

  // Ensure first word is visible immediately
  words[0].classList.add('hero__word--active');
  words[0].classList.remove('hero__word--enter');

  // Size wrapper — use a probe that inherits computed styles from the real words
  function measureAndSet() {
    const probe = document.createElement('span');
    probe.style.cssText = [
      'position:fixed',
      'top:-9999px',
      'left:-9999px',
      'visibility:hidden',
      'pointer-events:none',
      'white-space:nowrap',
    ].join(';');
    document.body.appendChild(probe);

    let maxW = 0;
    let maxH = 0;
    words.forEach(w => {
      // Each word may have its own decoration (e.g. PIZZA has a white stroke)
      const wCs = window.getComputedStyle(w);
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
        '-webkit-text-stroke:' + wCs.webkitTextStroke,
        'text-shadow:' + wCs.textShadow,
      ].join(';');
      probe.textContent = w.textContent.trim();
      maxW = Math.max(maxW, probe.offsetWidth);
      maxH = Math.max(maxH, probe.offsetHeight);
    });
    document.body.removeChild(probe);

    if (maxW > 30) wrap.style.width  = maxW + 'px';
    if (maxH > 10) wrap.style.height = (maxH + 12) + 'px';
  }

  // Measure off the main thread after fonts load; start cycling once measured
  function startCycle() {
    measureAndSet();
    if (!cycleInterval) cycleInterval = setInterval(cycle, INTERVAL);
  }
  const schedule = typeof requestIdleCallback !== 'undefined'
    ? (cb) => requestIdleCallback(cb, { timeout: 250 })
    : (cb) => setTimeout(cb, 0);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => schedule(startCycle));
  } else {
    schedule(startCycle);
  }
  setTimeout(measureAndSet, 800);

  // Recalculate on viewport resize so desktop/mobile breakpoints keep the word fully visible
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measureAndSet, 150);
  });

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
  pizzaImg.src = 'images/web/pizza1-480.webp';

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

  const LOGO_WHITE = 'images/web/logo-white.svg';
  const LOGO_RED   = 'images/web/logo-red.svg';

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
    <!-- <a href="https://losclandestinos.turbopos.es/" target="_blank" rel="noopener" class="cta-banner__btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <span data-i18n="cta-btn">¡PIDE AHORA!</span>
    </a> -->
    <a href="tel:+34856941295" class="cta-banner__btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <span data-i18n="cta-btn">${t['cta-btn'] || '¡PIDE AHORA!'}</span>
    </a>
  `;
  lastRow.insertAdjacentElement('afterend', banner);
}

let newsItems = [];
let hoursData = null;

async function initNews() {
  const section = document.getElementById('news');
  const list = document.getElementById('newsList');
  if (!section || !list) return;

  try {
    const response = await fetch('data/novedades.json', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    if (!Array.isArray(data)) return;

    const today = getLocalIsoDate();
    newsItems = data
      .filter(item => isValidNewsItem(item, today))
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || a.id.localeCompare(b.id));
    renderNews();
  } catch (error) {
    section.hidden = true;
  }
}

function getLocalIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && getDateParts(date) === value;
}

function getDateParts(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidNewsItem(item, today) {
  if (!item || item.active !== true || typeof item.id !== 'string' || !item.id.trim()) return false;
  if (!item.content || !item.content.es || !item.content.en) return false;
  if (!item.content.es.title || !item.content.en.title) return false;
  if (item.startDate !== null && item.startDate !== undefined && !isValidIsoDate(item.startDate)) return false;
  if (item.endDate !== null && item.endDate !== undefined && !isValidIsoDate(item.endDate)) return false;
  if (item.startDate && item.endDate && item.startDate > item.endDate) return false;
  if (item.startDate && today < item.startDate) return false;
  if (item.endDate && today > item.endDate) return false;
  return true;
}

function isSafeNewsLink(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value, window.location.href);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

function renderNews() {
  const section = document.getElementById('news');
  const list = document.getElementById('newsList');
  if (!section || !list) return;

  list.replaceChildren();
  if (!newsItems.length) {
    section.hidden = true;
    return;
  }

  const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  newsItems.forEach(item => list.appendChild(createNewsArticle(item, lang)));
  section.hidden = false;
}

function createNewsArticle(item, lang) {
  const article = document.createElement('article');
  const images = Array.isArray(item.images)
    ? item.images.filter(image => image && typeof image.src === 'string' && image.src.trim()).slice(0, 2)
    : [];
  article.className = `news-card news-card--images-${images.length}`;

  if (images[0]) article.appendChild(createNewsImage(images[0], lang));

  const content = item.content[lang] || item.content.es;
  const copy = document.createElement('div');
  copy.className = 'news-card__copy';

  if (content.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'news-card__subtitle';
    subtitle.textContent = content.subtitle;
    copy.appendChild(subtitle);
  }

  const title = document.createElement('h3');
  title.className = 'news-card__title';
  title.textContent = content.title;
  copy.appendChild(title);

  if (content.description) {
    const description = document.createElement('p');
    description.className = 'news-card__description';
    description.textContent = content.description;
    copy.appendChild(description);
  }

  const ctaLabel = item.cta && item.cta.label && (item.cta.label[lang] || item.cta.label.es);
  if (item.cta && item.cta.active === true && ctaLabel && isSafeNewsLink(item.cta.url)) {
    const link = document.createElement('a');
    link.className = 'news-card__cta';
    link.href = item.cta.url;
    link.textContent = ctaLabel;
    if (new URL(item.cta.url, window.location.href).origin !== window.location.origin) {
      link.target = '_blank';
      link.rel = 'noopener';
    }
    copy.appendChild(link);
  }

  article.appendChild(copy);
  if (images[1]) article.appendChild(createNewsImage(images[1], lang));
  return article;
}

function createNewsImage(image, lang) {
  const wrapper = document.createElement('div');
  wrapper.className = 'news-card__image';
  const img = document.createElement('img');
  img.src = image.src;
  img.alt = image.alt && (image.alt[lang] || image.alt.es || image.alt.en) || '';
  img.loading = 'lazy';
  img.decoding = 'async';
  wrapper.appendChild(img);
  return wrapper;
}

/* =============================================
   OPENING HOURS — Load from JSON and render
   ============================================= */

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels = {
  es: { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' },
  en: { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' }
};
const slotHeaders = {
  es: { day: 'Día', lunch: 'Pranzo', dinner: 'Cena' },
  en: { day: 'Day', lunch: 'Lunch', dinner: 'Dinner' }
};

async function initHorarios() {
  await loadHorarios();
  renderHorarios(getCurrentLang());
}

async function loadHorarios() {
  try {
    const response = await fetch('data/horarios.json', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    if (!data || typeof data.weekly !== 'object' || Array.isArray(data.weekly)) return;
    const valid = dayOrder.every(day => {
      const d = data.weekly[day];
      return d && typeof d.lunch_start === 'string' && typeof d.lunch_end === 'string' && typeof d.dinner_start === 'string' && typeof d.dinner_end === 'string';
    });
    if (!valid) return;
    hoursData = data;
  } catch (error) {
    hoursData = null;
  }
}

function getCurrentLang() {
  return document.documentElement.lang === 'en' ? 'en' : 'es';
}

function to12h(time) {
  if (!time || !time.includes(':')) return time;
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, '0')}${suffix}` : `${h12}${suffix}`;
}

function formatSlot(start, end, lang) {
  if (!start || !end || typeof start !== 'string' || typeof end !== 'string' || !start.trim() || !end.trim()) return null;
  const sep = '–';
  const s = start.trim();
  const e = end.trim();
  if (lang === 'en') {
    return `<span class="time-slot"><span class="time-start">${to12h(s)}</span><span class="time-sep">${sep}</span><span class="time-end">${to12h(e)}</span></span>`;
  }
  return `${s}${sep}${e}`;
}

function closedLabel(lang) {
  return lang === 'en' ? 'Closed' : 'Cerrado';
}

function renderHorarios(lang) {
  if (!hoursData) return;
  const roots = document.querySelectorAll('[data-hours-root]');
  const fallbacks = document.querySelectorAll('[data-i18n="loc-hours-text"]');

  roots.forEach(root => {
    root.innerHTML = buildHoursHTML(hoursData, lang);
    root.hidden = false;
  });

  fallbacks.forEach(fb => { fb.hidden = true; });
}

function buildHoursHTML(data, lang) {
  const labels = dayLabels[lang] || dayLabels.es;
  const headers = slotHeaders[lang] || slotHeaders.es;
  const closed = closedLabel(lang);
  const hasLunch = dayOrder.some(day => {
    const d = data.weekly[day];
    return d.lunch_start.trim() && d.lunch_end.trim();
  });
  const hasDinner = dayOrder.some(day => {
    const d = data.weekly[day];
    return d.dinner_start.trim() && d.dinner_end.trim();
  });

  let html = '<table class="hours-table">';
  html += '<thead><tr>';
  html += `<th>${escapeHtml(headers.day)}</th>`;
  if (hasLunch) html += `<th>${escapeHtml(headers.lunch)}</th>`;
  if (hasDinner) html += `<th>${escapeHtml(headers.dinner)}</th>`;
  html += '</tr></thead><tbody>';

  dayOrder.forEach(day => {
    const d = data.weekly[day];
    html += '<tr>';
    html += `<td>${escapeHtml(labels[day])}</td>`;
    if (hasLunch) {
      const slot = formatSlot(d.lunch_start, d.lunch_end, lang);
      html += `<td>${slot ? slot : escapeHtml(closed)}</td>`;
    }
    if (hasDinner) {
      const slot = formatSlot(d.dinner_start, d.dinner_end, lang);
      html += `<td>${slot ? slot : escapeHtml(closed)}</td>`;
    }
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* =============================================
   FALLBACK IMAGES — Generate CSS gradient
   placeholders for any missing images
   ============================================= */
function initFallbackImages() {
  const gradients = {
    'images/web/pizza1-480.webp':       'radial-gradient(circle, #E8B84B 30%, #C8202A 70%, #8B1A1A 100%)',
    'images/web/pizza2-480.webp':       'radial-gradient(circle, #F5D78E 20%, #D4A030 50%, #9B6A20 100%)',
    'images/web/pizza3-480.webp':       'radial-gradient(circle, #FAC060 25%, #C84020 60%, #7A1810 100%)',
    'images/web/pizza4-480.webp':       'radial-gradient(circle, #E0C070 20%, #B83820 55%, #6A1010 100%)',
    'images/web/pizza5-480.webp':       'radial-gradient(circle, #F0D080 30%, #CC6020 65%, #882010 100%)',
    'images/web/woodboard-480.webp':    'linear-gradient(160deg, #8B6010 0%, #6A4808 60%, #4A3005 100%)',
    'images/web/foodboard-480.webp':    'linear-gradient(150deg, #7A5510 0%, #5A3808 60%, #3A2205 100%)',
    'images/web/pizza-whole-480.webp':  'radial-gradient(circle, #E8B84B 25%, #C8202A 55%, #8B1A1A 80%, #5A1010 100%)',
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
   LAZY MAP LOADING
   The Google Maps iframe is only given its src
   when the location section scrolls into view.
   Mirrors Gusto's implementation.
   ============================================= */
function initLazyMap() {
  const frame = document.getElementById('mapFrame');
  if (!frame) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      frame.src = frame.dataset.src;
      obs.unobserve(frame);
    });
  }, { rootMargin: '100px 0px', threshold: 0 });

  observer.observe(frame);
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
  // Basic pizza orbit with vanilla JS
  const pizzas = [
    { sel: '#p1', el: null, radius: 38, size: 220, speed: 0.000072, offset: 0 },
    { sel: '#p2', el: null, radius: 42, size: 180, speed: 0.000088, offset: 72 },
    { sel: '#p3', el: null, radius: 36, size: 260, speed: 0.000060, offset: 144 },
    { sel: '#p4', el: null, radius: 40, size: 200, speed: 0.000080, offset: 216 },
    { sel: '#p5', el: null, radius: 44, size: 150, speed: 0.000100, offset: 288 },
  ];
  const hero = document.getElementById('hero');
  if (!hero) return;
  pizzas.forEach(p => { p.el = document.querySelector(p.sel); });
  let hw = hero.offsetWidth;
  let hh = hero.offsetHeight;
  window.addEventListener('resize', () => { hw = hero.offsetWidth; hh = hero.offsetHeight; });

  function animate(ts) {
    pizzas.forEach((p) => {
      const el = p.el;
      if (!el) return;
      const angle = (p.offset + ts * p.speed * 1000) * Math.PI / 180;
      const rx = (hw * p.radius / 100) * 1.1;
      const ry = (hh * p.radius / 100) * 0.7;
      const sizeW = el.offsetWidth;
      const sizeH = el.offsetHeight;
      const x = hw / 2 + rx * Math.cos(angle) - sizeW / 2;
      const y = hh / 2 + ry * Math.sin(angle) - sizeH / 2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
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
    'nav-home':           'INICIO',
    'hero-static':        'QUÉ GANAS DE',
    'hero-order':         'HAZ TU PEDIDO',
    'hero-call-prefix':   'o llámanos al',
    'news-eyebrow':       'Novedades · Novità',
    'news-title':         'LO NUEVO EN LOS CLANDESTINOS',
    'word-0':             'JAMÓN',
    'word-1':             'QUESO',
    'word-2':             'ANCHOAS',
    'word-3':             'PIZZA',
    'about-eyebrow':      'La Línea · Desde 2020',
    'about-body-1':       'Los Clandestinos nace de la amistad y del deseo de crear algo especial entre La Línea de la Concepción y la comunidad fronteriza de Gibraltar. Un proyecto marcado por la frontera, el Brexit y la pandemia, donde encontramos en la pizza una forma de unir culturas y seguir adelante.',
    'about-body-2':       'Nuestras raíces vienen de Abruzzo, una tierra con un ritmo de vida muy cercano al andaluz: pasión por la buena comida, respeto por los tiempos y amor por los ingredientes. Ese saber hacer se traduce en cada detalle: la fermentación de la masa, la selección de harinas y los aceites de oliva de Málaga.',
    'about-body-3':       'Porque las recetas más sencillas son las que cuentan las mejores historias.',
    'tag-0':              'Horno de piedra',
    'tag-1':              'Masa artesanal',
    'tag-2':              'Ingredientes DOP',
    'tag-3':              'Abierto desde 2020',
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
    'reviews-title':      'valoraciones entre<br>Google y Just Eat',
    'footer-find-us':     'Encuéntranos',
    'footer-hours':       'Horario',
    'footer-mon-tue':     'Lun: Cerrado',
    'footer-wed-sun':     'Mar–Dom: 19:30–23:30',
    'footer-closed':      'Cerrado',
    'footer-cta':         'PIDE AHORA',
    'footer-bottom':      '© 2026 Los Clandestinos Pizzería Italiana · Calle Carboneros 5, La Línea',
    /* Location section */
    'loc-eyebrow':        'Encuéntranos · Find Us',
    'loc-addr-label':     'Dirección',
    'loc-hours-label':    'Horario',
    'loc-contact-label':  'Teléfono',
    'loc-social-label':   'Instagram',
    'loc-facebook-label': 'Facebook',
    'loc-facebook-link':  'Síguenos en Facebook',
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
    'prod-p4-desc':       'Los mejores embutidos encuentra en las mejores mesas de la familias italianas. Mortadella de Bologna, bresaola curada, speck di Angus y crudo di Parma. Producto auténtico, traído directamente de Italia. Los mismos que encuentras en las mejores tablas de Milán o Roma — ahora en La Línea.',
    /* CTA Banner */
    'cta-eyebrow':        'Ingredientes de Italia · Directamente a ti',
    'cta-title':          '¿Listo para saborear la autenticidad?',
    'cta-sub':            'Llámanos y disfruta de los mejores ingredientes italianos esta noche.',
    'cta-btn':            '¡PIDE AHORA!',
    'page-title-home':    'Pizzería Italiana Artesanal en La Línea | Los Clandestinos',
    'page-title-products':'Ingredientes Italianos DOP para Pizza | Los Clandestinos',
  },
  en: {
    'nav-order':          'ORDER ONLINE',
    'nav-products':       'OUR PRODUCTS',
    'nav-home':           'HOME',
    'hero-static':        'CRAVING SOME',
    'hero-order':         'ORDER NOW',
    'hero-call-prefix':   'or call us at',
    'news-eyebrow':       'News · Novità',
    'news-title':         'WHAT’S NEW AT LOS CLANDESTINOS',
    'word-0':             'HAM',
    'word-1':             'CHEESE',
    'word-2':             'ANCHOVIES',
    'word-3':             'PIZZA',
    'about-eyebrow':      'La Línea · Since 2020',
    'about-body-1':       'Los Clandestinos was born from friendship and the desire to create something special between La Línea de la Concepción and the border community of Gibraltar. A project shaped by the border, Brexit, and the pandemic—where we found in pizza a way to bring cultures together and keep moving forward.',
    'about-body-2':       'Our roots come from Abruzzo, a land with a rhythm of life close to Andalusia: passion for good food, respect for time, and love for ingredients. That know-how shows up in every detail: dough fermentation, flour selection, and olive oils from Málaga.',
    'about-body-3':       'Because the simplest recipes are the ones that tell the best stories.',
    'tag-0':              'Stone oven',
    'tag-1':              'Artisan dough',
    'tag-2':              'DOP ingredients',
    'tag-3':              'Open since 2020',
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
    'reviews-title':      'reviews between<br>Google and Just Eat',
    'footer-find-us':     'Find Us',
    'footer-hours':       'Hours',
    'footer-mon-tue':     'Mon: Closed',
    'footer-wed-sun':     'Tue–Sun: 7:30–11:30 pm',
    'footer-closed':      'Closed',
    'footer-cta':         'ORDER NOW',
    'footer-bottom':      '© 2026 Los Clandestinos Italian Pizzeria · Calle Carboneros 5, La Línea',
    /* Location section */
    'loc-eyebrow':        'Find Us · Encuéntranos',
    'loc-addr-label':     'Address',
    'loc-hours-label':    'Opening Hours',
    'loc-contact-label':  'Phone',
    'loc-social-label':   'Instagram',
    'loc-facebook-label': 'Facebook',
    'loc-facebook-link':  'Follow us on Facebook',
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
    'cta-sub':            'Call us and enjoy the finest Italian ingredients tonight.',
    'cta-btn':            'ORDER NOW!',
    'page-title-home':    'Italian Artisan Pizzeria in La Línea | Los Clandestinos',
    'page-title-products':'Italian DOP Pizza Ingredients | Los Clandestinos',
  }
};

function setLang(lang) {
  if (!i18n[lang]) return;
  try { localStorage.setItem('lc-lang', lang); } catch(e) {}
  document.documentElement.lang = lang;
  // Update page title if a translation exists
  const page = document.body.dataset.page === 'products' ? 'products' : 'home';
  const titleVal = i18n[lang][`page-title-${page}`];
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

  renderNews();
  renderHorarios(lang);
}

function initLangSwitcher() {
  let saved = 'es';
  try { saved = localStorage.getItem('lc-lang') || 'es'; } catch(e) {}

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  setLang(saved);
}
