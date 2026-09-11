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

    initDynamicDownloads: function () {
      const REPO = 'Auralix-Studio/nexo';
      const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;

      const formatBytes = (bytes, decimals = 1) => {
        if (!+bytes) return '0 B';
        const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
      };

      fetch(API_URL)
        .then(res => res.json())
        .then(data => {
          if (!data || !data.tag_name) return;
          
          document.querySelectorAll('[data-dynamic-version]').forEach(el => el.textContent = data.tag_name);

          const assets = data.assets || [];
          const getAsset = (keyword, ignore) => assets.find(a => {
            const name = a.name.toLowerCase();
            return name.includes(keyword) && (!ignore || !name.includes(ignore));
          });

          // Buscar assets principales
          const universalApk = getAsset('universal.apk');
          const androidAsset = universalApk || getAsset('.apk');
          const windowsAsset = getAsset('.exe') || getAsset('windows.zip');

          // Función helper para rellenar datos en el DOM
          const fillData = (key, asset, type) => {
            if (!asset) return;
            document.querySelectorAll(`[data-dynamic-dl="${key}"]`).forEach(el => el.href = asset.browser_download_url);
            document.querySelectorAll(`[data-dynamic-name="${key}"]`).forEach(el => el.textContent = asset.name);
            document.querySelectorAll(`[data-dynamic-size="${key}"]`).forEach(el => el.textContent = formatBytes(asset.size));
            document.querySelectorAll(`[data-dynamic-downloads="${key}"]`).forEach(el => el.textContent = asset.download_count.toLocaleString());
            document.querySelectorAll(`[data-dynamic-meta="${key}"]`).forEach(el => el.textContent = `${formatBytes(asset.size)} · ${type}`);
          };

          fillData('android', androidAsset, 'APK');
          fillData('windows', windowsAsset, windowsAsset ? windowsAsset.name.split('.').pop().toUpperCase() : 'EXE');

          this.renderHeroActions(assets, formatBytes);
        })
        .catch(err => console.warn('Error obteniendo la última release:', err));
    },

    renderHeroActions: function (assetsList, formatBytes) {
      const container = document.getElementById('hero-download-actions');
      if (!container) return;

      const ua = navigator.userAgent;
      let os = 'Unknown';
      
      if (/Windows/i.test(ua)) os = 'Windows';
      else if (/Macintosh|Mac OS X/i.test(ua)) os = 'Mac';
      else if (/Android/i.test(ua)) os = 'Android';
      else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
      else if (/Linux/i.test(ua)) os = 'Linux';

      let bestAsset = null;
      let btnText = '';
      let btnMeta = '';

      if (os === 'Android') {
        bestAsset = assetsList.find(a => a.name.toLowerCase().includes('.apk'));
        if (bestAsset) {
          btnText = 'Descargar para Android'; // <-- Texto limpio, sin "(Universal)"
          btnMeta = `${formatBytes(bestAsset.size)} · APK`;
        }
      } else if (os === 'Windows') {
        bestAsset = assetsList.find(a => a.name.toLowerCase().match(/\.exe|\.msix/));
        if (bestAsset) {
          btnText = 'Descargar para Windows';
          btnMeta = `${formatBytes(bestAsset.size)} · ${bestAsset.name.split('.').pop().toUpperCase()}`;
        }
      } else if (os === 'Linux') {
        bestAsset = assetsList.find(a => a.name.toLowerCase().match(/linux|\.appimage|\.deb/));
        if (bestAsset) {
          btnText = 'Descargar para Linux';
          btnMeta = `${formatBytes(bestAsset.size)} · ${bestAsset.name.split('.').pop().toUpperCase()}`;
        }
      }

      container.innerHTML = '';

      if (bestAsset) {
        const a = document.createElement('a');
        a.href = bestAsset.browser_download_url;
        a.className = 'btn btn-primary';
        a.innerHTML = `${btnText}\n<span class="btn-meta">${btnMeta}</span>`;
        container.appendChild(a);
      } else {
        const p = document.createElement('p');
        p.style.color = 'var(--text-muted)';
        p.style.marginBottom = '1rem';
        p.style.gridColumn = '1 / -1';
        p.textContent = `Aplicación no disponible para tu dispositivo (${os}).`;
        container.appendChild(p);
      }

      const other = document.createElement('a');
      other.href = 'downloads.html';
      other.className = 'btn btn-secondary';
      other.style.cssText = 'border-color:transparent; background:transparent; text-decoration:underline;';
      other.textContent = 'Otras plataformas';
      container.appendChild(other);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NexoApp.init());
  } else {
    NexoApp.init();
  }
})();
