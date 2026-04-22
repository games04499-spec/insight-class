/* ============================================================
   INSIGHT LEARNING — script.js
   All interactivity: loader, navbar, animations, carousel,
   countdown, form, modal, back-to-top, particles
   ============================================================ */

/* ── 1. LOADING SCREEN ─────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => { loader.style.display = 'none'; }, 600);
    }
    // Trigger entrance animations
    triggerReveal();
  }, 2200);
});

/* ── 2. SCROLL PROGRESS BAR ────────────────────────────────── */
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  const bar = document.getElementById('scroll-progress');
  if (bar) bar.style.width = progress + '%';
});

/* ── 3. STICKY NAVBAR ──────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
  handleBackToTop();
});

/* ── 4. HAMBURGER MENU ─────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});
// Close on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── 5. HERO PARTICLES ─────────────────────────────────────── */
function createParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  const count = 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('hero-particle');
    const size = Math.random() * 6 + 2;
    const left = Math.random() * 100;
    const delay = Math.random() * 8;
    const duration = Math.random() * 12 + 8;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${left}%; bottom: -10px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    container.appendChild(p);
  }
}
createParticles();

/* ── 6. COUNTER ANIMATION ──────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.round(current);
  }, 16);
}

/* ── 7. SCROLL REVEAL + COUNTER TRIGGER ────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      // Stagger delay by sibling index
      const siblings = entry.target.parentElement ? [...entry.target.parentElement.children] : [];
      const i = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${Math.min(i * 0.08, 0.5)}s`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('.stat-num');
      counters.forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

function triggerReveal() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) counterObserver.observe(statsEl);
}

// Run reveal on scroll even if loader finishes before scroll
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(triggerReveal, 100);
});

/* ── 8. COUNTDOWN TIMER ─────────────────────────────────────── */
function startCountdown() {
  // Set target date: 30 days from now
  const target = new Date();
  target.setDate(target.getDate() + 30);

  function update() {
    const now  = new Date();
    const diff = target - now;
    if (diff <= 0) return;
    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs  = Math.floor((diff % (1000 * 60)) / 1000);
    const pad = n => String(n).padStart(2, '0');
    document.getElementById('cd-days').textContent  = pad(days);
    document.getElementById('cd-hours').textContent = pad(hours);
    document.getElementById('cd-mins').textContent  = pad(mins);
    document.getElementById('cd-secs').textContent  = pad(secs);
  }
  update();
  setInterval(update, 1000);
}
startCountdown();

/* ── 9. TESTIMONIALS CAROUSEL ──────────────────────────────── */
let currentSlide = 0;
const track = document.getElementById('carousel-track');
const dotsContainer = document.getElementById('carousel-dots');
let cards, cardWidth, maxSlide, autoSlideTimer;

function initCarousel() {
  cards    = track ? track.querySelectorAll('.testimonial-card') : [];
  if (!cards.length) return;

  // Recalculate cards-per-view based on viewport
  const vw = window.innerWidth;
  const perView = vw <= 768 ? 1 : vw <= 1024 ? 2 : 3;
  maxSlide = Math.max(0, cards.length - perView);

  // Build dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxSlide; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  goToSlide(0);
  startAutoSlide();
}

function goToSlide(n) {
  currentSlide = Math.max(0, Math.min(n, maxSlide));
  const cardEl = track.querySelector('.testimonial-card');
  const gap = 24;
  const cw = cardEl ? cardEl.offsetWidth + gap : 0;
  track.style.transform = `translateX(-${currentSlide * cw}px)`;

  // Update dots
  const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

function nextSlide() {
  goToSlide(currentSlide >= maxSlide ? 0 : currentSlide + 1);
  restartAutoSlide();
}
function prevSlide() {
  goToSlide(currentSlide <= 0 ? maxSlide : currentSlide - 1);
  restartAutoSlide();
}

function startAutoSlide() {
  autoSlideTimer = setInterval(() => nextSlide(), 4500);
}
function restartAutoSlide() {
  clearInterval(autoSlideTimer);
  startAutoSlide();
}

// Expose for inline HTML calls
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;

window.addEventListener('resize', initCarousel);
document.addEventListener('DOMContentLoaded', initCarousel);

// Touch/Swipe support
let touchStartX = 0;
if (track) {
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
  });
}

/* ── 10. COURSE MODAL ──────────────────────────────────────── */
function openCourseModal(key) {
  const modal = document.getElementById('course-modal');
  const contentEl = document.getElementById('modal-content');
  const data = window.courseData[key];
  if (!data || !modal || !contentEl) return;

  const featuresHtml = data.features
    .map(f => `<li>${f}</li>`)
    .join('');

  contentEl.innerHTML = `
    <div class="modal-course-icon"><i class="${data.icon}"></i></div>
    <h3>${data.title}</h3>
    <p class="modal-boards"><i class="fas fa-check-circle"></i> ${data.boards}</p>
    <p>${data.desc}</p>
    <ul class="modal-features">${featuresHtml}</ul>
    <a href="#register" onclick="closeCourseModal()" class="btn-primary" style="width:100%;justify-content:center;">
      <i class="fas fa-rocket"></i> Enroll in This Course
    </a>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCourseModal() {
  const modal = document.getElementById('course-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function closeModal(e) {
  if (e.target === document.getElementById('course-modal')) closeCourseModal();
}

window.openCourseModal = openCourseModal;
window.closeCourseModal = closeCourseModal;
window.closeModal = closeModal;

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeCourseModal(); closePopup(); }
});

/* ── 11. ENROLLMENT FORM ───────────────────────────────────── */
async function handleFormSubmit(e) {
  e.preventDefault();
  const form     = document.getElementById('enrollment-form');
  const btnText  = document.getElementById('btn-text');
  const btnLoader= document.getElementById('btn-loader');

  // Show loader state
  btnText.style.display  = 'none';
  btnLoader.style.display = 'inline-flex';

  // Collect data
  const formData = {
    name:   form.elements['name'].value.trim(),
    phone:  form.elements['phone'].value.trim(),
    class:  form.elements['class'].value,
    school: form.elements['school'].value.trim(),
    board:  form.elements['board'].value,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };

  /* ──────────────────────────────────────────────────────────
     GOOGLE SHEETS INTEGRATION
     Step 1: Go to https://script.google.com
     Step 2: Create new project → paste this Apps Script code:

       function doPost(e) {
         const data = JSON.parse(e.postData.contents);
         const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
         sheet.appendRow([
           data.timestamp, data.name, data.phone,
           data.class, data.school, data.board
         ]);
         return ContentService.createTextOutput(
           JSON.stringify({ result: 'success' })
         ).setMimeType(ContentService.MimeType.JSON);
       }

     Step 3: Deploy → New Deployment → Web App
             Execute as: Me | Who can access: Anyone
     Step 4: Copy the Web App URL below:
  ─────────────────────────────────────────────────────────── */
  const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

  try {
    if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }
    // Log locally (remove in production)
    console.log('Form submission:', formData);
  } catch (err) {
    console.warn('Submission error (form will still show success):', err);
  }

  // Restore button
  btnText.style.display   = 'inline-flex';
  btnLoader.style.display = 'none';

  // Show success popup
  form.reset();
  showPopup();
}

window.handleFormSubmit = handleFormSubmit;

/* ── 12. SUCCESS POPUP ─────────────────────────────────────── */
function showPopup() {
  const popup = document.getElementById('success-popup');
  if (popup) {
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}
function closePopup() {
  const popup = document.getElementById('success-popup');
  if (popup) {
    popup.classList.remove('active');
    document.body.style.overflow = '';
  }
}
window.closePopup = closePopup;

/* ── 13. BACK TO TOP ───────────────────────────────────────── */
function handleBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  if (window.scrollY > 400) btn.classList.add('visible');
  else btn.classList.remove('visible');
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
window.scrollToTop = scrollToTop;

/* ── 14. SMOOTH ACTIVE NAV LINK HIGHLIGHT ──────────────────── */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a:not(.nav-cta)');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navItems.forEach(a => {
        a.classList.remove('active-nav');
        if (a.getAttribute('href') === '#' + id) a.classList.add('active-nav');
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => sectionObserver.observe(s));

// Add active nav styles dynamically
const style = document.createElement('style');
style.textContent = `.nav-links a.active-nav { color: var(--gold) !important; }`;
document.head.appendChild(style);

/* ── 15. WHATSAPP FLOAT HIDE ON FORM FOCUS ─────────────────── */
const formInputs = document.querySelectorAll('.enrollment-form input, .enrollment-form select');
const waFloat    = document.getElementById('whatsapp-float');
formInputs.forEach(input => {
  input.addEventListener('focus',  () => { if (waFloat) waFloat.style.transform = 'translateX(100px)'; });
  input.addEventListener('blur',   () => { if (waFloat) waFloat.style.transform = ''; });
});

/* ── 16. INPUT LABEL ANIMATION ─────────────────────────────── */
document.querySelectorAll('.form-group input, .form-group select').forEach(el => {
  el.addEventListener('input', function() {
    this.style.borderColor = this.value ? 'rgba(212,175,55,0.4)' : '';
  });
});

/* ── 17. DOM READY SETUP ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Init reveal for elements already in view
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }, 500);
});
