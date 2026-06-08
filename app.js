/**
 * Nexo · pequeños scripts del sitio (sin dependencias).
 *
 * - Reveal-on-scroll para elementos [data-reveal] / [data-reveal-stagger].
 * - Typewriter rotativo para [data-typewriter] con `data-phrases` JSON.
 *
 * Respeta prefers-reduced-motion: si está activo, no anima — solo muestra
 * todo de inmediato y deja el typewriter en su frase inicial.
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
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    document
      .querySelectorAll('[data-reveal], [data-reveal-stagger]')
      .forEach(function (el) { io.observe(el); });
  }

  // ─── Typewriter rotativo ─────────────────────────────────────
  document.querySelectorAll('[data-typewriter]').forEach(function (el) {
    var phrases;
    try {
      phrases = JSON.parse(el.getAttribute('data-phrases') || '[]');
    } catch (e) { return; }
    if (!phrases.length) return;

    // Sin animación si reduceMotion: dejar la primera frase y salir.
    if (reduceMotion) {
      el.textContent = phrases[0];
      return;
    }

    var phraseIndex = 0;
    var charIndex = phrases[0].length;
    var deleting = false;
    el.textContent = phrases[0];

    // Velocidades (ms por carácter / pausas).
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

    // Esperar antes de empezar a borrar la frase inicial.
    setTimeout(function () { deleting = true; tick(); }, HOLD_FULL);
  });
})();
