/* Nexo · scripts del sitio. Respeta prefers-reduced-motion. */
(function () {
  'use strict';

  const NexoApp = {
    init: function () {
      this.setupPolyfills();
      this.initAnimations();
      this.initTypewriter();
      this.initAccordion();
      this.initClipboard();
      this.initDrawer();
      this.initDynamicDownloads();
    },

    setupPolyfills: function () {
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
    },

    initAnimations: function () {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Elementos individuales
      if (!('IntersectionObserver' in window) || reduceMotion) {
        document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(el => el.classList.add('revealed'));
      } else {
        const revealIO = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              revealIO.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
        document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(el => revealIO.observe(el));
      }

      // Grillas escalonadas (Stagger)
      document.querySelectorAll('.grid').forEach(grid => {
        Array.from(grid.children).forEach(child => child.classList.add('stagger-item'));
      });

      if (!('IntersectionObserver' in window) || reduceMotion) {
        document.querySelectorAll('.stagger-item').forEach(el => el.classList.add('show'));
      } else {
        const gridIO = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              Array.from(entry.target.children).forEach((child, i) => {
                setTimeout(() => child.classList.add('show'), i * 80);
              });
              gridIO.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.grid').forEach(g => gridIO.observe(g));
      }

      // Fallback de seguridad
      setTimeout(() => {
        document.querySelectorAll('[data-reveal]:not(.revealed), [data-reveal-stagger]:not(.revealed)').forEach(el => el.classList.add('revealed'));
        document.querySelectorAll('.stagger-item:not(.show)').forEach(el => el.classList.add('show'));
      }, 600);
    },

    initTypewriter: function () {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      document.querySelectorAll('[data-typewriter]').forEach(el => {
        let phrases;
        try {
          phrases = JSON.parse(el.getAttribute('data-phrases') || '[]');
        } catch (e) { return; }
        
        if (!phrases.length) return;
        if (reduceMotion) {
          el.textContent = phrases[0];
          return;
        }

        let phraseIndex = 0;
        let charIndex = phrases[0].length;
        let deleting = false;
        el.textContent = phrases[0];

        const TYPE_SPEED = 70, DELETE_SPEED = 35, HOLD_FULL = 2200, HOLD_EMPTY = 280;

        function tick() {
          const current = phrases[phraseIndex];
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
        setTimeout(() => { deleting = true; tick(); }, HOLD_FULL);
      });
    },

    initAccordion: function () {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;

      document.querySelectorAll('.faq details').forEach(details => {
        const summary = details.querySelector('summary');
        const body = details.querySelector('.faq-body');
        if (!summary || !body) return;

        summary.addEventListener('click', (e) => {
          e.preventDefault();
          if (details.open) {
            body.style.height = body.scrollHeight + 'px';
            body.offsetHeight; // Forzar reflow
            body.style.height = '0px';
            body.addEventListener('transitionend', function handler() {
              body.removeEventListener('transitionend', handler);
              details.open = false;
              body.style.height = '';
            });
          } else {
            details.open = true;
            const target = body.scrollHeight;
            body.style.height = '0px';
            body.offsetHeight; 
            body.style.height = target + 'px';
            body.addEventListener('transitionend', function handler() {
              body.removeEventListener('transitionend', handler);
              body.style.height = '';
            });
          }
        });
      });
    },

    initClipboard: function () {
      let toast = null;
      function showToast(message, isError) {
        if (!toast) {
          toast = document.createElement('div');
          toast.className = 'toast';
          document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.className = 'toast show' + (isError ? ' toast-error' : '');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
      }

      document.querySelectorAll('.sha').forEach(sha => {
        sha.style.cursor = 'pointer';
        sha.setAttribute('title', 'Click para copiar al portapapeles');
        sha.setAttribute('role', 'button');
        sha.setAttribute('tabindex', '0');

        const copy = () => {
          const text = (sha.textContent || '').trim();
          if (!navigator.clipboard) {
            showToast('Tu navegador no soporta copiar al portapapeles', true);
            return;
          }
          navigator.clipboard.writeText(text).then(
            () => showToast('Hash copiado'),
            () => showToast('No se pudo copiar', true)
          );
        };

        sha.addEventListener('click', copy);
        sha.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copy(); }
        });
      });
    },

    initDrawer: function () {
      const navs = document.querySelectorAll('.nav');
      const menuBtns = document.querySelectorAll('.mobile-menu-btn');
      let overlay = document.querySelector('.nav-overlay');

      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        const headerInner = document.querySelector('.site-header-inner');
        if (headerInner) headerInner.appendChild(overlay);
        else document.body.appendChild(overlay);
      }

      menuBtns.forEach(btn => {
        btn.innerHTML = '<span class="menu-bar"></span><span class="menu-bar"></span><span class="menu-bar"></span>';
        btn.setAttribute('aria-expanded', 'false');
      });

      navs.forEach(nav => {
        if (!nav.querySelector('.nav-drawer-header')) {
          const header = document.createElement('div');
          header.className = 'nav-drawer-header';

          const pageBrand = nav.closest('.site-header-inner');
          const brandEl = pageBrand ? pageBrand.querySelector('.brand') : null;
          if (brandEl) header.appendChild(brandEl.cloneNode(true));

          const closeBtn = document.createElement('button');
          closeBtn.className = 'nav-close-btn';
          closeBtn.setAttribute('aria-label', 'Cerrar menú');
          closeBtn.innerHTML = '✕';
          closeBtn.addEventListener('click', () => closeDrawer(nav));
          header.appendChild(closeBtn);
          nav.insertBefore(header, nav.firstChild);
        }

        if (!nav.querySelector('.nav-links-wrapper')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'nav-links-wrapper';
          Array.from(nav.children).filter(child => child.tagName === 'A').forEach(link => wrapper.appendChild(link));
          nav.appendChild(wrapper);
        }
      });

      const openDrawer = (nav) => {
        nav.classList.add('nav-open');
        overlay.classList.add('show');
        document.body.classList.add('nav-drawer-open');
        menuBtns.forEach(btn => {
          if (btn.parentElement.querySelector('.nav') === nav) {
            btn.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
        overlay.style.display = 'block';
        requestAnimationFrame(() => overlay.style.opacity = '1');
      };

      const closeDrawer = (nav) => {
        nav.classList.remove('nav-open');
        overlay.style.opacity = '0';
        document.body.classList.remove('nav-drawer-open');
        menuBtns.forEach(btn => {
          if (btn.parentElement.querySelector('.nav') === nav) {
            btn.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
          }
        });
        setTimeout(() => {
          overlay.classList.remove('show');
          overlay.style.display = '';
        }, 350);
      };

      const getActiveNav = () => Array.from(navs).find(nav => nav.classList.contains('nav-open'));

      menuBtns.forEach(btn => {
        btn.addEventListener('click', function () {
          const nav = this.parentElement.querySelector('.nav');
          if (!nav) return;
          nav.classList.contains('nav-open') ? closeDrawer(nav) : openDrawer(nav);
        });
      });

      overlay.addEventListener('click', () => {
        const active = getActiveNav();
        if (active) closeDrawer(active);
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          const active = getActiveNav();
          if (active) closeDrawer(active);
        }
      });
    },

    /* Descargas: cada botón con data-dynamic-dl="clave" apunta al archivo
       real de la última versión, nunca a la página de releases.
       1) Se pide la última versión a la API de GitHub (con caché de 10 min,
          porque GitHub limita a 60 consultas por hora sin sesión).
       2) Si la API no responde, se usan los enlaces estables
          /releases/latest/download/nexo-<plataforma>.* que publica el CI. */
    initDynamicDownloads: function () {
      const REPO = 'Auralix-Studio/nexo';
      const LATEST = `https://github.com/${REPO}/releases/latest/download/`;
      const ASSETS = {
        'android':        { stable: 'nexo-android.apk',          end: '-universal.apk',     kind: 'APK' },
        'android-arm64':  { stable: 'nexo-android-arm64.apk',    end: '-arm64.apk',         kind: 'APK' },
        'android-armv7':  { stable: 'nexo-android-armv7.apk',    end: '-armv7.apk',         kind: 'APK' },
        'android-x86_64': { stable: 'nexo-android-x86_64.apk',   end: '-x86_64.apk',        kind: 'APK' },
        'windows':        { stable: 'nexo-windows-setup.exe',    end: '-setup-x64.exe',     kind: 'Instalador' },
        'windows-zip':    { stable: 'nexo-windows-x64.zip',      end: '-windows-x64.zip',   kind: 'ZIP portable' },
        'macos':          { stable: 'nexo-macos.zip',            end: '-macos.zip',         kind: 'ZIP' },
        'linux':          { stable: 'nexo-linux-x64.tar.gz',     end: '-linux-x64.tar.gz',  kind: 'tar.gz' }
      };
      const formatBytes = (bytes) => {
        if (!+bytes) return '';
        const mb = bytes / 1048576;
        return (mb >= 10 ? Math.round(mb) : mb.toFixed(1)) + ' MB';
      };

      this.os = this.detectOS();
      this.renderPlatformButtons();

      const apply = (release) => {
        const assets = (release && release.assets) || [];
        Object.keys(ASSETS).forEach((key) => {
          const def = ASSETS[key];
          const asset = assets.find(a => a.name.toLowerCase().endsWith(def.end) && /^nexo-v\d/i.test(a.name));
          const href = asset ? asset.browser_download_url : LATEST + def.stable;
          document.querySelectorAll(`[data-dynamic-dl="${key}"]`).forEach(el => {
            el.href = href;
            el.setAttribute('download', '');
          });
          if (!asset) return;
          const size = formatBytes(asset.size);
          document.querySelectorAll(`[data-dynamic-name="${key}"]`).forEach(el => el.textContent = asset.name);
          document.querySelectorAll(`[data-dynamic-size="${key}"]`).forEach(el => el.textContent = size);
          document.querySelectorAll(`[data-dynamic-downloads="${key}"]`).forEach(el => el.textContent = asset.download_count.toLocaleString('es-PE'));
          document.querySelectorAll(`[data-dynamic-meta="${key}"]`).forEach(el => el.textContent = `${size} · ${def.kind}`);
        });
        if (release && release.tag_name) {
          document.querySelectorAll('[data-dynamic-version]').forEach(el => el.textContent = release.tag_name);
        }
      };

      // Enlaces estables desde el primer momento: ningún botón lleva a la
      // página de GitHub aunque la API tarde o falle.
      apply(null);

      const CACHE = 'nexo.release.v1';
      try {
        const cached = JSON.parse(sessionStorage.getItem(CACHE) || 'null');
        if (cached && Date.now() - cached.at < 10 * 60 * 1000) { apply(cached.data); return; }
      } catch (e) { /* sin almacenamiento */ }

      fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
        .then(res => res.ok ? res.json() : Promise.reject(new Error('GitHub ' + res.status)))
        .then(data => {
          const slim = {
            tag_name: data.tag_name,
            assets: (data.assets || []).map(a => ({ name: a.name, size: a.size, download_count: a.download_count, browser_download_url: a.browser_download_url }))
          };
          try { sessionStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), data: slim })); } catch (e) { /* sin almacenamiento */ }
          apply(slim);
        })
        .catch(err => console.warn('No se pudo consultar la última versión; se usan los enlaces estables.', err));
    },

    detectOS: function () {
      const ua = navigator.userAgent || '';
      const touchMac = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1; // iPad con iPadOS
      if (/iPhone|iPad|iPod/i.test(ua) || touchMac) return 'ios';
      if (/Android/i.test(ua) || /CrOS/i.test(ua)) return 'android';
      if (/Windows/i.test(ua)) return 'windows';
      if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
      if (/Linux|X11/i.test(ua)) return 'linux';
      return 'unknown';
    },

    /* Botones según el sistema de quien visita. */
    renderPlatformButtons: function () {
      const os = this.os;
      const PLATFORM = {
        android: { key: 'android', text: 'Descargar para Android', meta: 'APK' },
        windows: { key: 'windows', text: 'Descargar para Windows', meta: 'Instalador' },
        macos:   { key: 'macos',   text: 'Descargar para macOS',   meta: 'ZIP' },
        linux:   { key: 'linux',   text: 'Descargar para Linux',   meta: 'tar.gz' }
      };
      const SECOND = { android: 'windows', windows: 'android', macos: 'windows', linux: 'android', unknown: 'windows' };

      // Botón "Descargar" de la cabecera en todas las páginas
      document.querySelectorAll('.nav-cta').forEach(a => {
        if (os === 'ios') { a.setAttribute('href', 'downloads.html'); a.removeAttribute('data-dynamic-dl'); }
        else if (PLATFORM[os]) a.setAttribute('data-dynamic-dl', PLATFORM[os].key);
      });

      const box = document.getElementById('hero-download-actions');
      if (!box) return;
      const [first, second] = box.querySelectorAll('a.btn');
      if (!first || !second) return;

      if (os === 'ios') {
        const note = document.createElement('p');
        note.className = 'platform-note';
        note.textContent = 'Nexo todavía no está disponible para iPhone ni iPad. Puedes usarlo en Android, Windows, macOS o Linux.';
        box.insertBefore(note, first);
        first.remove();
        second.removeAttribute('data-dynamic-dl');
        second.setAttribute('href', 'downloads.html');
        second.innerHTML = 'Ver todas las descargas';
        return;
      }

      const set = (a, p) => {
        a.setAttribute('data-dynamic-dl', p.key);
        a.innerHTML = `${p.text}\n<span class="btn-meta" data-dynamic-meta="${p.key}">${p.meta}</span>`;
      };
      const main = PLATFORM[os] || PLATFORM.android;
      set(first, main);
      set(second, PLATFORM[SECOND[os] || 'windows']);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NexoApp.init());
  } else {
    NexoApp.init();
  }
})();
