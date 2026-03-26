/* ===== HERO PARTICLE MESH ANIMATION — BOOSTED ===== */
(function () {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles, mouse, animId;

  mouse = { x: -9999, y: -9999 };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2.5 + 1;
      this.alpha = Math.random() * 0.45 + 0.15;
      this.pulseSpeed = Math.random() * 0.015 + 0.005;
      this.pulseOffset = Math.random() * Math.PI * 2;
      const hue = 220 + Math.random() * 50;
      const sat = 40 + Math.random() * 35;
      const light = 35 + Math.random() * 25;
      this.color = `hsla(${hue}, ${sat}%, ${light}%,`;
    }
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((w * h) / 3500), 400);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function draw(time) {
    ctx.clearRect(0, 0, w, h);
    const t = time * 0.001;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const force = (200 - dist) / 200;
        if (dist < 80) {
          p.x += (dx / dist) * force * 3;
          p.y += (dy / dist) * force * 3;
        } else {
          p.x -= (dx / dist) * force * 0.6;
          p.y -= (dy / dist) * force * 0.6;
        }
      }

      const pulse = Math.sin(t * p.pulseSpeed * 60 + p.pulseOffset) * 0.3 + 0.7;
      const alpha = p.alpha * pulse;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + alpha + ')';
      ctx.shadowColor = p.color + '0.3)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const ddx = p.x - p2.x;
        const ddy = p.y - p2.y;
        const d = ddx * ddx + ddy * ddy;
        const maxDist = 22000;
        if (d < maxDist) {
          const lineAlpha = (1 - d / maxDist) * 0.14;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(80, 80, 160, ${lineAlpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    init();
    animId = requestAnimationFrame(draw);
  });

  document.addEventListener('mousemove', (e) => {
    const heroRect = canvas.getBoundingClientRect();
    if (e.clientY < heroRect.bottom) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    } else {
      mouse.x = -9999;
      mouse.y = -9999;
    }
  });

  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const heroRect = canvas.getBoundingClientRect();
      if (e.touches[0].clientY < heroRect.bottom) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }
  }, { passive: true });
  document.addEventListener('touchend', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  init();
  animId = requestAnimationFrame(draw);
})();

/* ===== NAV SCROLL EFFECT ===== */
(function () {
  const nav = document.getElementById('nav');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 100) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ===== SCROLL REVEAL ===== */
(function () {
  const els = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const parent = entry.target.parentElement;
        const siblings = Array.from(parent.querySelectorAll('[data-reveal]'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('revealed'), idx * 90);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
})();

/* ===== 3D COVERFLOW CAROUSEL ===== */
(function () {
  const rotor = document.getElementById('carousel-rotor');
  const cards = rotor.querySelectorAll('.c3d-card');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const scene = rotor.closest('.carousel-3d');
  const total = cards.length;
  let current = 0;
  let autoTimer = null;
  const AUTO_INTERVAL = 3500;

  // Create dots
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }
  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  // Position all cards with CSS transitions
  cards.forEach(card => {
    card.style.transition = 'transform 0.8s cubic-bezier(0.23,1,0.32,1), opacity 0.6s ease';
    card.style.position = 'absolute';
    card.style.left = '0';
    card.style.top = '0';
  });

  function layout() {
    cards.forEach((card, i) => {
      const diff = i - current;
      const absD = Math.abs(diff);
      const sign = diff > 0 ? 1 : -1;

      let tx, tz, ry, opacity;

      if (diff === 0) {
        tx = 0; tz = 0; ry = 0; opacity = 1;
      } else if (absD <= 2) {
        tx = diff * 200;
        tz = -absD * 140;
        ry = sign * -32;
        opacity = absD === 1 ? 0.65 : 0.35;
      } else {
        tx = sign * 480;
        tz = -400;
        ry = sign * -45;
        opacity = 0;
      }

      card.style.transform = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg)`;
      card.style.opacity = opacity;
      card.style.zIndex = total - absD;
      card.style.pointerEvents = diff === 0 ? 'auto' : 'none';
    });
  }

  function goTo(index) {
    current = ((index % total) + total) % total;
    layout();
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    resetAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Swipe
  let startX = 0, swiping = false;
  scene.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    swiping = true;
  }, { passive: true });
  scene.addEventListener('touchend', (e) => {
    if (!swiping) return;
    swiping = false;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
  });

  // Click side cards to navigate
  cards.forEach((card, i) => {
    card.addEventListener('click', () => { if (i !== current) goTo(i); });
  });

  function resetAuto() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(next, AUTO_INTERVAL);
  }

  scene.addEventListener('mouseenter', () => clearTimeout(autoTimer));
  scene.addEventListener('mouseleave', resetAuto);

  layout();
  resetAuto();
})();

/* ===== PROJECT DETAIL MODAL ===== */
(function () {
  const overlay = document.getElementById('modal-overlay');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close');

  // Placeholder details — replace with real content later
  const details = {
    blocksmith: {
      title: 'Blocksmith Labs',
      tag: 'Solana',
      text: `<p>Helped with the core foundation of the Blocksmith Labs product library including Atlas3, Aurus, Raven & More.</p><p>Key contributions:</p><p>• Managing the BSL, Smyths & Meegos NFT communities</p><p>• Handling X / Twitter operations for each page</p><p>• Partnerships with core Solana NFT and DeFi projects</p><p>• Running strategy and marketing for the products</p>`
    },
    skyrise: {
      title: 'SkyRise Labs',
      tag: 'Marketing',
      text: `<p>Detailed breakdown of work coming soon. This section will cover the marketing campaigns, brand positioning strategy, content creation, and measurable results delivered for SkyRise Labs.</p>`
    },
    flashtrade: {
      title: 'Flash Trade',
      tag: 'DeFi',
      text: `<p>Detailed breakdown of work coming soon. This section will outline the user acquisition funnels, growth marketing tactics, partnership activations, and KPIs achieved for Flash Trade.</p>`
    },
    atlas3: {
      title: 'Atlas3',
      tag: 'Tooling',
      text: `<p>Detailed breakdown of work coming soon. This section will detail the community growth strategy, engagement frameworks, and platform adoption metrics delivered for Atlas3.</p>`
    },
    aurus: {
      title: 'Aurus',
      tag: 'NFT',
      text: `<p>Detailed breakdown of work coming soon. This section will cover brand development, marketing execution, launch strategy, and the results achieved for Aurus.</p>`
    },
    hoopas: {
      title: 'The Hoopas',
      tag: 'NFT',
      text: `<p>Detailed breakdown of work coming soon. This section will include the full-cycle marketing plan, community management approach, content strategy, and growth metrics for The Hoopas.</p>`
    },
    degods: {
      title: 'DeGods',
      tag: 'Blue Chip',
      text: `<p>Detailed breakdown of work coming soon. This section will describe the growth initiatives contributed to, community engagement strategies, and impact on one of Web3's most recognized NFT brands.</p>`
    },
    meegos: {
      title: 'Meegos',
      tag: 'NFT',
      text: `<p>Detailed breakdown of work coming soon. This section will cover the growth and marketing support provided, community engagement tactics, and results delivered for the Meegos project.</p>`
    },
    exotic: {
      title: 'Exotic Markets',
      tag: 'DeFi',
      text: `<p>Detailed breakdown of work coming soon. This section will outline the marketing and growth strategy executed for Exotic Markets, a structured products protocol in DeFi.</p>`
    }
  };

  document.querySelectorAll('.detail-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.project;
      const data = details[key];
      if (!data) return;
      modalBody.innerHTML = `
        <h3>${data.title}</h3>
        <span class="modal-tag">${data.tag}</span>
        ${data.text}
      `;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
})();


/* ===== CIPHER / ENCRYPTION TEXT EFFECT ===== */
(function () {
  const el = document.getElementById('hero-name');
  if (!el) return;
  const original = el.dataset.text;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>{}[]=/\\';
  const SCRAMBLE_SPEED = 30;
  const DECODE_DELAY = 40;
  const HOLD_TIME = 5000;
  const ENCRYPT_DURATION = 1200;

  function scrambleText(callback) {
    let iterations = 0;
    const maxIterations = original.length;
    const interval = setInterval(() => {
      el.textContent = original
        .split('')
        .map((char, i) => {
          if (i < iterations) return original[i];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      iterations += 1 / 3;
      if (iterations >= maxIterations) {
        clearInterval(interval);
        el.textContent = original;
        if (callback) callback();
      }
    }, DECODE_DELAY);
  }

  function encryptText(callback) {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / ENCRYPT_DURATION, 1);
      const scrambledCount = Math.floor(progress * original.length);
      el.textContent = original
        .split('')
        .map((char, i) => {
          if (i < original.length - scrambledCount) return original[i];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      if (progress >= 1) {
        clearInterval(interval);
        if (callback) callback();
      }
    }, SCRAMBLE_SPEED);
  }

  function loop() {
    // Decrypt in
    scrambleText(() => {
      // Hold readable
      setTimeout(() => {
        // Encrypt out
        encryptText(() => {
          // Brief scramble pause then restart
          setTimeout(loop, 400);
        });
      }, HOLD_TIME);
    });
  }

  // Start with scrambled text immediately
  el.textContent = Array.from(original).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  setTimeout(loop, 300);
})();

/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
