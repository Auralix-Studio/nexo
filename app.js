/**
 * Nexo · scripts del sitio (sin dependencias).
 *
 * Componentes:
 *   - Reveal on scroll para [data-reveal].
 *   - Auto-stagger de hijos en .grid cuando aparecen en viewport.
 *   - Typewriter rotativo para [data-typewriter] con `data-phrases` JSON.
 *   - Smooth accordion para .faq details (anima la altura del contenido).
 *   - Copy-to-clipboard en .sha con toast de confirmación.
 *   - Mobile side drawer (hamburger menu).
 *
 * Respeta prefers-reduced-motion: si está activo, no anima — solo muestra
 * todo de inmediato.
 */
(function () {
  'use strict';

  // Polyfills for older browsers / Android WebView compatibility
  if (typeof NodeList !== 'undefined' && NodeList.prototype && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }
  if (typeof Element !== 'undefined' && Element.prototype && !Element.prototype.closest) {
    Element.prototype.closest = function (s) {
      var el = this;
      do {
        if (typeof el.matches === 'function' && el.matches(s)) return el;
        if (typeof el.msMatchesSelector === 'function' && el.msMatchesSelector(s)) return el;
        if (typeof el.webkitMatchesSelector === 'function' && el.webkitMatchesSelector(s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }

  var reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── Reveal on scroll ─────────────────────────────────────────
  if (!('IntersectionObserver' in window) || reduceMotion) {
    document
      .querySelectorAll('[data-reveal], [data-reveal-stagger]')
      .forEach(function (el) { el.classList.add('revealed'); });
  } else {
    var revealIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    document
      .querySelectorAll('[data-reveal], [data-reveal-stagger]')
      .forEach(function (el) { revealIO.observe(el); });
  }

  // Safety fallback: force reveal all elements after 600ms in case observer fails to trigger (e.g. WebView issues)
  setTimeout(function () {
    document
      .querySelectorAll('[data-reveal]:not(.revealed), [data-reveal-stagger]:not(.revealed)')
      .forEach(function (el) { el.classList.add('revealed'); });
    document
      .querySelectorAll('.stagger-item:not(.show)')
      .forEach(function (el) { el.classList.add('show'); });
  }, 600);

  // ─── Auto-stagger en .grid ────────────────────────────────────
  // Aplica fade-up secuencial a los hijos directos de cada grid cuando
  // entran en viewport. No requiere markup extra en HTML.
  document.querySelectorAll('.grid').forEach(function (grid) {
    Array.prototype.forEach.call(grid.children, function (child) {
      child.classList.add('stagger-item');
    });
  });

  if (!('IntersectionObserver' in window) || reduceMotion) {
    document.querySelectorAll('.stagger-item').forEach(function (el) {
      el.classList.add('show');
    });
  } else {
    var gridIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            Array.prototype.forEach.call(
              entry.target.children,
              function (child, i) {
                setTimeout(function () {
                  child.classList.add('show');
                }, i * 80);
              }
            );
            gridIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.grid').forEach(function (g) {
      gridIO.observe(g);
    });
  }

  // ─── Typewriter rotativo ─────────────────────────────────────
  document.querySelectorAll('[data-typewriter]').forEach(function (el) {
    var phrases;
    try {
      phrases = JSON.parse(el.getAttribute('data-phrases') || '[]');
    } catch (e) { return; }
    if (!phrases.length) return;

    if (reduceMotion) {
      el.textContent = phrases[0];
      return;
    }

    var phraseIndex = 0;
    var charIndex = phrases[0].length;
    var deleting = false;
    el.textContent = phrases[0];

    var TYPE_SPEED = 70;
    var DELETE_SPEED = 35;
    var HOLD_FULL = 2200;
    var HOLD_EMPTY = 280;

    function tick() {
      var current = phrases[phraseIndex];
      if (deleting) {
        charIndex--;
        el.textContent = current.substring(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(tick, HOLD_EMPTY);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      } else {
        charIndex++;
        el.textContent = current.substring(0, charIndex);
        if (charIndex >= current.length) {
          deleting = true;
          setTimeout(tick, HOLD_FULL);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      }
    }
    setTimeout(function () { deleting = true; tick(); }, HOLD_FULL);
  });

  // ─── Smooth accordion (FAQ) ──────────────────────────────────
  // El elemento <details> nativo no anima el open/close. Interceptamos
  // el click en <summary> y animamos manualmente la altura del body.
  document.querySelectorAll('.faq details').forEach(function (details) {
    var summary = details.querySelector('summary');
    var body = details.querySelector('.faq-body');
    if (!summary || !body) return;

    if (reduceMotion) return; // Comportamiento nativo, sin animación.

    summary.addEventListener('click', function (e) {
      e.preventDefault();

      if (details.open) {
        // Cerrar: medir altura actual, transicionar a 0, luego cerrar.
        var h = body.scrollHeight;
        body.style.height = h + 'px';
        // Forzar reflow para que la transición tome efecto.
        body.offsetHeight; // eslint-disable-line no-unused-expressions
        body.style.height = '0px';
        body.addEventListener('transitionend', function handler() {
          body.removeEventListener('transitionend', handler);
          details.open = false;
          body.style.height = '';
        });
      } else {
        // Abrir: setear open, medir altura, transicionar de 0 a esa altura.
        details.open = true;
        var target = body.scrollHeight;
        body.style.height = '0px';
        body.offsetHeight; // eslint-disable-line no-unused-expressions
        body.style.height = target + 'px';
        body.addEventListener('transitionend', function handler() {
          body.removeEventListener('transitionend', handler);
          body.style.height = '';
        });
      }
    });
  });

  // ─── Copy SHA-256 al portapapeles ────────────────────────────
  var toast = null;
  function showToast(message, isError) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast show' + (isError ? ' toast-error' : '');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2400);
  }

  document.querySelectorAll('.sha').forEach(function (sha) {
    sha.style.cursor = 'pointer';
    sha.setAttribute('title', 'Click para copiar al portapapeles');
    sha.setAttribute('role', 'button');
    sha.setAttribute('tabindex', '0');

    function copy() {
      var text = (sha.textContent || '').trim();
      if (!navigator.clipboard) {
        showToast('Tu navegador no soporta copiar al portapapeles', true);
        return;
      }
      navigator.clipboard.writeText(text).then(
        function () { showToast('Hash copiado'); },
        function () { showToast('No se pudo copiar', true); }
      );
    }

    sha.addEventListener('click', copy);
    sha.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copy(); }
    });
  });
})();

// ─── Mobile side drawer ─────────────────────────────────────
(function () {
  function initDrawer() {
    var navs = document.querySelectorAll('.nav');
    var menuBtns = document.querySelectorAll('.mobile-menu-btn');

    // Create overlay (shared) if it doesn't exist yet
    var overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      var headerInner = document.querySelector('.site-header-inner');
      if (headerInner) {
        headerInner.appendChild(overlay);
      } else {
        document.body.appendChild(overlay);
      }
    }

    // Upgrade menu buttons to animated bars
    menuBtns.forEach(function(btn) {
      btn.innerHTML = '<span class="menu-bar"></span><span class="menu-bar"></span><span class="menu-bar"></span>';
      btn.setAttribute('aria-expanded', 'false');
    });

    navs.forEach(function(nav) {
      // Inject drawer header inside nav if not already there
      if (!nav.querySelector('.nav-drawer-header')) {
        var header = document.createElement('div');
        header.className = 'nav-drawer-header';

        // Clone brand from the page header
        var pageBrand = nav.closest('.site-header-inner');
        var brandEl = pageBrand ? pageBrand.querySelector('.brand') : null;
        if (brandEl) {
          var brandClone = brandEl.cloneNode(true);
          header.appendChild(brandClone);
        }

        // Close button
        var closeBtn = document.createElement('button');
        closeBtn.className = 'nav-close-btn';
        closeBtn.setAttribute('aria-label', 'Cerrar menú');
        closeBtn.innerHTML = '✕';
        closeBtn.addEventListener('click', function() { closeDrawer(nav); });
        header.appendChild(closeBtn);

        nav.insertBefore(header, nav.firstChild);
      }

      // Wrap links in a container for flex layout
      if (!nav.querySelector('.nav-links-wrapper')) {
        var wrapper = document.createElement('div');
        wrapper.className = 'nav-links-wrapper';
        var links = Array.prototype.slice.call(nav.children).filter(function(child) {
          return child.tagName === 'A';
        });
        links.forEach(function(link) {
          wrapper.appendChild(link);
        });
        nav.appendChild(wrapper);
      }
    });

    function openDrawer(nav) {
      nav.classList.add('nav-open');
      overlay.classList.add('show');
      document.body.classList.add('nav-drawer-open');

      menuBtns.forEach(function(btn) {
        var siblingNav = btn.parentElement.querySelector('.nav');
        if (siblingNav === nav) {
          btn.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      // Animate overlay from hidden
      overlay.style.display = 'block';
      requestAnimationFrame(function() {
        overlay.style.opacity = '1';
      });
    }

    function closeDrawer(nav) {
      nav.classList.remove('nav-open');
      overlay.style.opacity = '0';
      document.body.classList.remove('nav-drawer-open');

      menuBtns.forEach(function(btn) {
        var siblingNav = btn.parentElement.querySelector('.nav');
        if (siblingNav === nav) {
          btn.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });

      // Wait for transition then hide
      setTimeout(function() {
        overlay.classList.remove('show');
        overlay.style.display = '';
      }, 350);
    }

    function getActiveNav() {
      for (var i = 0; i < navs.length; i++) {
        if (navs[i].classList.contains('nav-open')) return navs[i];
      }
      return null;
    }

    menuBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var nav = this.parentElement.querySelector('.nav');
        if (!nav) return;
        if (nav.classList.contains('nav-open')) {
          closeDrawer(nav);
        } else {
          openDrawer(nav);
        }
      });
    });

    // Close on overlay click
    overlay.addEventListener('click', function() {
      var active = getActiveNav();
      if (active) closeDrawer(active);
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var active = getActiveNav();
        if (active) closeDrawer(active);
      }
    });

    // Close drawer when clicking a nav link (mobile UX)
    navs.forEach(function(nav) {
      nav.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && nav.classList.contains('nav-open')) {
          closeDrawer(nav);
        }
      });
    });
  }

  // Safe instantiation: run immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDrawer);
  } else {
    initDrawer();
  }
})();
