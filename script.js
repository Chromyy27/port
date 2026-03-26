/* ===== HERO PARTICLE MESH ANIMATION ===== */
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
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.originX = this.x;
      this.originY = this.y;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 0.8;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.008;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((w * h) / 4000), 400);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function draw(time) {
    ctx.clearRect(0, 0, w, h);

    // Bigger, brighter radial glow in center
    const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.55);
    grd.addColorStop(0, 'rgba(80, 70, 160, 0.12)');
    grd.addColorStop(0.3, 'rgba(60, 50, 130, 0.08)');
    grd.addColorStop(0.6, 'rgba(40, 40, 100, 0.04)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    const t = time * 0.001;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Gentle drift
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Mouse interaction — attract gently, repel when very close
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const force = (200 - dist) / 200;
        if (dist < 80) {
          // Repel close particles
          p.x += (dx / dist) * force * 3;
          p.y += (dy / dist) * force * 3;
        } else {
          // Attract distant particles slightly
          p.x -= (dx / dist) * force * 0.5;
          p.y -= (dy / dist) * force * 0.5;
        }
      }

      // Pulse alpha
      const pulse = Math.sin(t * p.pulseSpeed * 60 + p.pulseOffset) * 0.3 + 0.7;
      const alpha = p.alpha * pulse;

      // Draw particle with glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210, 210, 255, ${alpha})`;
      ctx.shadowColor = 'rgba(180, 180, 255, 0.4)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const ddx = p.x - p2.x;
        const ddy = p.y - p2.y;
        const d = ddx * ddx + ddy * ddy;
        const maxDist = 22000; // ~148px
        if (d < maxDist) {
          const lineAlpha = (1 - d / maxDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(160, 160, 255, ${lineAlpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Floating orbs (large, blurry) — more visible
    for (let k = 0; k < 4; k++) {
      const ox = w * 0.5 + Math.sin(t * 0.25 + k * 1.8) * w * 0.3;
      const oy = h * 0.5 + Math.cos(t * 0.18 + k * 1.4) * h * 0.25;
      const size = 160 + k * 20;
      const orbGrd = ctx.createRadialGradient(ox, oy, 0, ox, oy, size);
      orbGrd.addColorStop(0, `rgba(${90 + k * 15}, ${70 + k * 10}, ${200 - k * 15}, 0.08)`);
      orbGrd.addColorStop(0.5, `rgba(${70 + k * 10}, ${50 + k * 10}, ${160 - k * 10}, 0.03)`);
      orbGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = orbGrd;
      ctx.fillRect(ox - size, oy - size, size * 2, size * 2);
    }

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    init();
    animId = requestAnimationFrame(draw);
  });

  // Mouse events on document so it works even over hero content
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

  // Touch support
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
    // Add background on scroll
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Highlight active nav link
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
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
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ===== PARALLAX TILT ON CARDS ===== */
(function () {
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.glass-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-4px) perspective(600px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
})();

/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
