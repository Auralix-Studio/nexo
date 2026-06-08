/**
 * Nexo · scripts del sitio (sin dependencias).
 *
 * Componentes:
 *   - Reveal on scroll para [data-reveal].
 *   - Auto-stagger de hijos en .grid cuando aparecen en viewport.
 *   - Typewriter rotativo para [data-typewriter] con `data-phrases` JSON.
 *   - Smooth accordion para .faq details (anima la altura del contenido).
 *   - Copy-to-clipboard en .sha con toast de confirmación.
 *
 * Respeta prefers-reduced-motion: si está activo, no anima — solo muestra
 * todo de inmediato.
 */
(function () {
  'use strict';

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
