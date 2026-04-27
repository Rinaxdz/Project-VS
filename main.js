/* ===========================================
   NINANG'S ON-THE-GO TOTS — main.js
   =========================================== */


/* ------------------------------------------
   1. NAVBAR — scroll shadow + active link
   ------------------------------------------ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function setActiveLink() {
    let currentId = '';
    sections.forEach((s) => {
      if (window.scrollY >= s.offsetTop - 100) currentId = s.getAttribute('id');
    });
    navAnchors.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();
})();


/* ------------------------------------------
   2. MOBILE DRAWER
   ------------------------------------------ */
(function initMobileDrawer() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navDrawer    = document.getElementById('navDrawer');
  const drawerClose  = document.getElementById('drawerClose');
  const navOverlay   = document.getElementById('navOverlay');
  if (!hamburgerBtn || !navDrawer) return;

  const open  = () => { navDrawer.classList.add('open'); navOverlay.classList.add('show'); document.body.style.overflow = 'hidden'; };
  const close = () => { navDrawer.classList.remove('open'); navOverlay.classList.remove('show'); document.body.style.overflow = ''; };

  hamburgerBtn.addEventListener('click', open);
  drawerClose.addEventListener('click', close);
  navOverlay.addEventListener('click', close);
  document.querySelectorAll('.drawer-link').forEach(l => l.addEventListener('click', close));
})();


/* ------------------------------------------
   3. SCROLL ANIMATIONS
   ------------------------------------------ */
(function initScrollAnimations() {
  const els = document.querySelectorAll('[data-animate]');
  if (!els.length) return;

  const groups = new Map();
  els.forEach((el) => {
    const p = el.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(el);
  });
  groups.forEach((children) => {
    children.forEach((child, i) => { child.style.transitionDelay = `${i * 80}ms`; });
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });

  els.forEach((el) => obs.observe(el));
})();


/* ------------------------------------------
   4. COUNTER ANIMATION
   ------------------------------------------ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const start  = performance.now();
    function update(now) {
      const p = Math.min((now - start) / 1800, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target) + '+';
      if (p < 1) requestAnimationFrame(update);
      else el.textContent = target + '+';
    }
    requestAnimationFrame(update);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => obs.observe(el));
})();


/* ------------------------------------------
   5. SMOOTH SCROLL
   ------------------------------------------ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.getElementById(this.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight ?? 68;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    });
  });
})();


/* ------------------------------------------
   6. CARD TILT (desktop only)
   ------------------------------------------ */
(function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.offer-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const rx = (((e.clientY - r.top)  / r.height) - 0.5) * -10;
      const ry = (((e.clientX - r.left) / r.width)  - 0.5) *  10;
      card.style.transform = `translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();


/* ------------------------------------------
   7. REVIEW FORM
   ─────────────────────────────────────────
   Submits to Supabase → review instantly
   visible on reviews.html for ALL visitors
   on any device worldwide.

   PASTE YOUR SUPABASE VALUES HERE:
   (same values you put in reviews.html)
   ------------------------------------------ */
(function initReviewForm() {
  const reviewForm = document.getElementById('reviewForm');
  if (!reviewForm) return;

  /* ── Supabase config — paste your values here ── */
  const SUPABASE_URL     = 'YOUR_SUPABASE_URL';
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
  /* ─────────────────────────────────────────────── */

  const API     = `${SUPABASE_URL}/rest/v1/reviews`;
  const HEADERS = {
    'apikey'        : SUPABASE_ANON_KEY,
    'Authorization' : `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type'  : 'application/json',
    'Prefer'        : 'return=representation'
  };

  /* ── Star picker ── */
  const starBtns    = document.querySelectorAll('.star-btn');
  const ratingInput = document.getElementById('rRating');
  let   selectedRating = 0;

  starBtns.forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      const v = parseInt(btn.dataset.value);
      starBtns.forEach(b => b.classList.toggle('hovered', parseInt(b.dataset.value) <= v));
    });
    btn.addEventListener('mouseleave', () => {
      starBtns.forEach(b => {
        b.classList.remove('hovered');
        b.classList.toggle('selected', parseInt(b.dataset.value) <= selectedRating);
      });
    });
    btn.addEventListener('click', () => {
      selectedRating    = parseInt(btn.dataset.value);
      ratingInput.value = selectedRating;
      starBtns.forEach(b => b.classList.toggle('selected', parseInt(b.dataset.value) <= selectedRating));
      showErr('rRating', 'rRatingError', false);
    });
  });

  /* ── Error helpers ── */
  function showErr(fieldId, errorId, show) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (!field || !error) return;
    field.classList.toggle('error', show);
    error.classList.toggle('show', show);
  }

  ['rName','rReview'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => showErr(id, id + 'Error', false));
  });
  const rEvent = document.getElementById('rEvent');
  if (rEvent) rEvent.addEventListener('change', () => showErr('rEvent', 'rEventError', false));

  /* ── Initials helper ── */
  function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    return parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /* ── Submit ── */
  reviewForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name   = document.getElementById('rName').value.trim();
    const event  = document.getElementById('rEvent').value;
    const rating = ratingInput.value;
    const text   = document.getElementById('rReview').value.trim();
    let   valid  = true;

    if (!name)   { showErr('rName',   'rNameError',   true); valid = false; }
    if (!event)  { showErr('rEvent',  'rEventError',  true); valid = false; }
    if (!rating) { showErr('rRating', 'rRatingError', true); valid = false; }
    if (!text)   { showErr('rReview', 'rReviewError', true); valid = false; }
    if (!valid) return;

    /* Loading state */
    const submitBtn  = document.getElementById('reviewSubmitBtn');
    const submitText = document.getElementById('reviewSubmitText');
    const spinner    = document.getElementById('reviewSpinner');
    submitBtn.disabled     = true;
    submitText.textContent = 'Posting your review…';
    spinner.style.display  = 'block';

    /* Build the review row to insert into Supabase */
    const review = {
      name        : name,
      initials    : getInitials(name),
      event_type  : event,
      rating      : Number(rating),
      review_text : text,
      date_label  : new Date().toLocaleDateString('en-CA', { month: 'long', year: 'numeric' }),
      submitted_at: new Date().toISOString(),
      verified    : true
    };

    try {
      const res = await fetch(API, {
        method  : 'POST',
        headers : HEADERS,
        body    : JSON.stringify(review)
      });

      if (res.ok) {
        /* ✅ Saved to Supabase — show thank you */
        spinner.style.display = 'none';
        document.getElementById('reviewFormWrap').style.display = 'none';
        document.getElementById('reviewThankYou').style.display = 'block';
      } else {
        const err = await res.json();
        console.error('Supabase error:', err);
        showSubmitError('Something went wrong saving your review. Please try again.');
        submitBtn.disabled     = false;
        submitText.textContent = 'Submit My Review';
        spinner.style.display  = 'none';
      }

    } catch (networkErr) {
      console.error('Network error:', networkErr);
      showSubmitError('Unable to connect. Please check your internet and try again.');
      submitBtn.disabled     = false;
      submitText.textContent = 'Submit My Review';
      spinner.style.display  = 'none';
    }
  });

  function showSubmitError(msg) {
    let el = document.getElementById('reviewGeneralError');
    if (!el) {
      el = document.createElement('p');
      el.id = 'reviewGeneralError';
      el.style.cssText = 'color:#c0392b;font-size:0.82rem;margin-top:0.75rem;text-align:center;line-height:1.5;';
      document.getElementById('reviewSubmitBtn').insertAdjacentElement('afterend', el);
    }
    el.textContent = msg;
  }
})();