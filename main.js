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