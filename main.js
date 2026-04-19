/* ===========================================
   NINANG'S CHILDCARE — main.js
   =========================================== */


/* ------------------------------------------
   1. NAVBAR — scroll shadow + active link
   ------------------------------------------ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Add shadow when user scrolls down
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Highlight the active section link in the navbar
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function setActiveLink() {
    let currentId = '';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        currentId = section.getAttribute('id');
      }
    });

    navAnchors.forEach((anchor) => {
      anchor.classList.remove('active');
      if (anchor.getAttribute('href') === `#${currentId}`) {
        anchor.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink(); // run once on load
})();


/* ------------------------------------------
   2. MOBILE DRAWER — open / close
   ------------------------------------------ */
(function initMobileDrawer() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navDrawer    = document.getElementById('navDrawer');
  const drawerClose  = document.getElementById('drawerClose');
  const navOverlay   = document.getElementById('navOverlay');

  if (!hamburgerBtn || !navDrawer) return;

  function openDrawer() {
    navDrawer.classList.add('open');
    navOverlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeDrawer() {
    navDrawer.classList.remove('open');
    navOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  hamburgerBtn.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  navOverlay.addEventListener('click', closeDrawer);

  // Close drawer when a link inside it is clicked
  document.querySelectorAll('.drawer-link').forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });
})();


/* ------------------------------------------
   3. SCROLL ANIMATIONS — fade + slide up
      Elements with [data-animate] fade in
      when they enter the viewport.
   ------------------------------------------ */
(function initScrollAnimations() {
  const animatedEls = document.querySelectorAll('[data-animate]');
  if (!animatedEls.length) return;

  // Stagger siblings inside the same grid/list
  function applyStagger(el, index) {
    el.style.transitionDelay = `${index * 80}ms`;
  }

  // Group children of the same parent so we can stagger them
  const groups = new Map();
  animatedEls.forEach((el) => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });

  groups.forEach((children) => {
    children.forEach((child, i) => applyStagger(child, i));
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate once only
        }
      });
    },
    { threshold: 0.15 }
  );

  animatedEls.forEach((el) => observer.observe(el));
})();


/* ------------------------------------------
   4. COUNTER ANIMATION — animate numbers
      Elements with [data-count="NUMBER"]
      count up from 0 when scrolled into view.
   ------------------------------------------ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1800; // ms
    const startTime = performance.now();

    function update(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.floor(eased * target);

      el.textContent = value + '+';

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + '+';
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
})();


/* ------------------------------------------
   5. SMOOTH SCROLL — override for all
      internal anchor links (fallback for
      older browsers that ignore CSS).
   ------------------------------------------ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.getElementById('navbar')?.offsetHeight ?? 68;
      const targetTop    = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();


/* ------------------------------------------
   6. OFFER CARD TILT — subtle 3D tilt
      on mouse-move for desktop users.
   ------------------------------------------ */
(function initCardTilt() {
  // Skip on touch/mobile
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.offer-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const centerX = rect.width  / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) *  5;

      card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ------------------------------------------
   7. REVIEW FORM — star picker + Formspree
   ------------------------------------------
   HOW TO CONNECT TO FORMSPREE + GOOGLE SHEETS:
   -----------------------------------------------
   STEP 1 — Log in to formspree.io
   STEP 2 — Create a SECOND form project (e.g. "Ninang's Reviews")
   STEP 3 — Copy your unique endpoint (e.g. https://formspree.io/f/xyzabcde)
   STEP 4 — Replace the REVIEW_ENDPOINT value below with YOUR endpoint
   STEP 5 — In Formspree dashboard → Integrations → connect a second
             Google Sheet tab (e.g. "Reviews") — all submissions land there
             for you to read and approve before adding to reviews.html
   ------------------------------------------ */

(function initReviewForm() {
  const reviewForm    = document.getElementById('reviewForm');
  if (!reviewForm) return;   // not on homepage, skip

  const REVIEW_ENDPOINT = 'https://formspree.io/f/YOUR_REVIEWS_FORM_ID';
  //                                              ^^^^^^^^^^^^^^^^^^^^
  //                    Replace with your Formspree reviews form endpoint

  /* --- Star picker --- */
  const starBtns  = document.querySelectorAll('.star-btn');
  const ratingInput = document.getElementById('rRating');
  let   selectedRating = 0;

  starBtns.forEach((btn) => {
    // Hover: highlight up to hovered star
    btn.addEventListener('mouseenter', () => {
      const val = parseInt(btn.dataset.value);
      starBtns.forEach((b) => {
        b.classList.toggle('hovered', parseInt(b.dataset.value) <= val);
      });
    });

    // Mouse leave: revert to selected state
    btn.addEventListener('mouseleave', () => {
      starBtns.forEach((b) => {
        b.classList.remove('hovered');
        b.classList.toggle('selected', parseInt(b.dataset.value) <= selectedRating);
      });
    });

    // Click: lock selection
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.value);
      ratingInput.value = selectedRating;
      starBtns.forEach((b) => {
        b.classList.toggle('selected', parseInt(b.dataset.value) <= selectedRating);
      });
      // Clear rating error if present
      showReviewError('rRating', 'rRatingError', false);
    });
  });

  /* --- Helpers --- */
  function showReviewError(fieldId, errorId, show) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (!field || !error) return;
    if (show) {
      field.classList.add('error');
      error.classList.add('show');
    } else {
      field.classList.remove('error');
      error.classList.remove('show');
    }
  }

  // Clear errors on input
  ['rName', 'rReview'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => showReviewError(id, id + 'Error', false));
  });

  const rEvent = document.getElementById('rEvent');
  if (rEvent) rEvent.addEventListener('change', () => showReviewError('rEvent', 'rEventError', false));

  /* --- Submit --- */
  reviewForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name    = document.getElementById('rName').value.trim();
    const event   = document.getElementById('rEvent').value;
    const rating  = ratingInput.value;
    const review  = document.getElementById('rReview').value.trim();
    let   isValid = true;

    if (!name)   { showReviewError('rName',   'rNameError',   true); isValid = false; }
    if (!event)  { showReviewError('rEvent',  'rEventError',  true); isValid = false; }
    if (!rating) { showReviewError('rRating', 'rRatingError', true); isValid = false; }
    if (!review) { showReviewError('rReview', 'rReviewError', true); isValid = false; }

    if (!isValid) return;

    // Loading state
    const submitBtn  = document.getElementById('reviewSubmitBtn');
    const submitText = document.getElementById('reviewSubmitText');
    const spinner    = document.getElementById('reviewSpinner');
    submitBtn.disabled     = true;
    submitText.textContent = 'Submitting…';
    spinner.style.display  = 'block';

    const payload = {
      'Name'         : name,
      'Event Type'   : event,
      'Rating'       : rating + ' / 5 stars',
      'Review'       : review,
      'Submitted At' : new Date().toLocaleString('en-CA', {
                         timeZone  : 'America/Toronto',
                         dateStyle : 'medium',
                         timeStyle : 'short'
                       })
    };

    try {
      const response = await fetch(REVIEW_ENDPOINT, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body    : JSON.stringify(payload)
      });

      if (response.ok) {
        document.getElementById('reviewFormWrap').style.display  = 'none';
        document.getElementById('reviewThankYou').style.display  = 'block';
      } else {
        submitBtn.disabled     = false;
        submitText.textContent = 'Submit My Review';
        spinner.style.display  = 'none';
        alert('Something went wrong. Please try again shortly.');
      }
    } catch {
      submitBtn.disabled     = false;
      submitText.textContent = 'Submit My Review';
      spinner.style.display  = 'none';
      alert('Network error — please check your connection and try again.');
    }
  });
})();