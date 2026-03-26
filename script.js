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
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2.2 + 0.6;
      this.alpha = Math.random() * 0.5 + 0.15;
      this.pulseSpeed = Math.random() * 0.015 + 0.005;
      this.pulseOffset = Math.random() * Math.PI * 2;
      // Color variation — slight blue/purple/cyan tints
      const hue = 220 + Math.random() * 60;
      this.color = `hsla(${hue}, 60%, 80%,`;
    }
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((w * h) / 4500), 350);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function draw(time) {
    ctx.clearRect(0, 0, w, h);
    const t = time * 0.001;

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Mouse interaction
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        const force = (180 - dist) / 180;
        if (dist < 70) {
          p.x += (dx / dist) * force * 2.5;
          p.y += (dy / dist) * force * 2.5;
        } else {
          p.x -= (dx / dist) * force * 0.4;
          p.y -= (dy / dist) * force * 0.4;
        }
      }

      const pulse = Math.sin(t * p.pulseSpeed * 60 + p.pulseOffset) * 0.3 + 0.7;
      const alpha = p.alpha * pulse;

      // Draw with soft glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + alpha + ')';
      ctx.shadowColor = p.color + '0.3)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const ddx = p.x - p2.x;
        const ddy = p.y - p2.y;
        const d = ddx * ddx + ddy * ddy;
        const maxDist = 20000;
        if (d < maxDist) {
          const lineAlpha = (1 - d / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(160, 170, 255, ${lineAlpha})`;
          ctx.lineWidth = 0.5;
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
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

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
        }, idx * 90);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ===== LIQUID GLASS MOUSE REFRACTION ===== */
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('.liquid-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotX = (y - 0.5) * -6;
      const rotY = (x - 0.5) * 6;

      card.style.transform = `translateY(-6px) scale(1.01) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

      // Move the specular highlight to follow cursor
      const shine = card.querySelector('.liquid-card-shine');
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%,
          rgba(255,255,255,0.12) 0%,
          rgba(255,255,255,0.04) 30%,
          transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      const shine = card.querySelector('.liquid-card-shine');
      if (shine) {
        shine.style.background = `linear-gradient(180deg,
          rgba(255,255,255,0.08) 0%,
          rgba(255,255,255,0.02) 40%,
          transparent 100%)`;
      }
    });
  });
})();

/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
