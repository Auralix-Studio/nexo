/* Nexo · scripts del sitio (sin dependencias). Respeta prefers-reduced-motion. */
(function () {
  'use strict';

  // Polyfills para WebView de Android viejo / IE legacy.
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

  // Fallback: si el IntersectionObserver no dispara (visto en WebView viejo),
  // forzamos visible a los 600 ms para no dejar contenido oculto.
  setTimeout(function () {
    document
      .querySelectorAll('[data-reveal]:not(.revealed), [data-reveal-stagger]:not(.revealed)')
      .forEach(function (el) { el.classList.add('revealed'); });
    document
      .querySelectorAll('.stagger-item:not(.show)')
      .forEach(function (el) { el.classList.add('show'); });
  }, 600);

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

  // <details> nativo no anima open/close: interceptamos el click en <summary>
  // y transicionamos la altura manualmente.
  document.querySelectorAll('.faq details').forEach(function (details) {
    var summary = details.querySelector('summary');
    var body = details.querySelector('.faq-body');
    if (!summary || !body) return;

    if (reduceMotion) return;

    summary.addEventListener('click', function (e) {
      e.preventDefault();

      if (details.open) {
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

(function () {
  function initDrawer() {
    var navs = document.querySelectorAll('.nav');
    var menuBtns = document.querySelectorAll('.mobile-menu-btn');

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

    menuBtns.forEach(function (btn) {
      btn.innerHTML = '<span class="menu-bar"></span><span class="menu-bar"></span><span class="menu-bar"></span>';
      btn.setAttribute('aria-expanded', 'false');
    });

    navs.forEach(function (nav) {
      if (!nav.querySelector('.nav-drawer-header')) {
        var header = document.createElement('div');
        header.className = 'nav-drawer-header';

        var pageBrand = nav.closest('.site-header-inner');
        var brandEl = pageBrand ? pageBrand.querySelector('.brand') : null;
        if (brandEl) {
          var brandClone = brandEl.cloneNode(true);
          header.appendChild(brandClone);
        }

        var closeBtn = document.createElement('button');
        closeBtn.className = 'nav-close-btn';
        closeBtn.setAttribute('aria-label', 'Cerrar menú');
        closeBtn.innerHTML = '✕';
        closeBtn.addEventListener('click', function () { closeDrawer(nav); });
        header.appendChild(closeBtn);

        nav.insertBefore(header, nav.firstChild);
      }

      if (!nav.querySelector('.nav-links-wrapper')) {
        var wrapper = document.createElement('div');
        wrapper.className = 'nav-links-wrapper';
        var links = Array.prototype.slice.call(nav.children).filter(function (child) {
          return child.tagName === 'A';
        });
        links.forEach(function (link) {
          wrapper.appendChild(link);
        });
        nav.appendChild(wrapper);
      }
    });

    function openDrawer(nav) {
      nav.classList.add('nav-open');
      overlay.classList.add('show');
      document.body.classList.add('nav-drawer-open');

      menuBtns.forEach(function (btn) {
        var siblingNav = btn.parentElement.querySelector('.nav');
        if (siblingNav === nav) {
          btn.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      overlay.style.display = 'block';
      requestAnimationFrame(function () {
        overlay.style.opacity = '1';
      });
    }

    function closeDrawer(nav) {
      nav.classList.remove('nav-open');
      overlay.style.opacity = '0';
      document.body.classList.remove('nav-drawer-open');

      menuBtns.forEach(function (btn) {
        var siblingNav = btn.parentElement.querySelector('.nav');
        if (siblingNav === nav) {
          btn.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });

      // Esperar a que el overlay termine el fade antes de ocultarlo.
      setTimeout(function () {
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

    menuBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var nav = this.parentElement.querySelector('.nav');
        if (!nav) return;
        if (nav.classList.contains('nav-open')) {
          closeDrawer(nav);
        } else {
          openDrawer(nav);
        }
      });
    });

    overlay.addEventListener('click', function () {
      var active = getActiveNav();
      if (active) closeDrawer(active);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var active = getActiveNav();
        if (active) closeDrawer(active);
      }
    });

    navs.forEach(function (nav) {
      nav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A' && nav.classList.contains('nav-open')) {
          closeDrawer(nav);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDrawer);
  } else {
    initDrawer();
  }
})();

// --- DYNAMIC DOWNLOAD SCRIPT ---
(function () {
  var REPO = 'Auralix-Studio/nexo';
  var API_URL = 'https://api.github.com/repos/' + REPO + '/releases/latest';

  function formatBytes(bytes, decimals) {
    if (!+bytes) return '0 B';
    var k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  fetch(API_URL)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data || !data.tag_name) return;
      var version = data.tag_name;

      document.querySelectorAll('[data-dynamic-version]').forEach(function (el) {
        el.textContent = version;
      });

      var assets = data.assets || [];
      var androidAsset = null;
      var windowsAsset = null;
      var specificAssets = {
        'android-arm64': null,
        'android-armv7': null,
        'android-x86_64': null
      };

      for (var i = 0; i < assets.length; i++) {
        var name = assets[i].name.toLowerCase();
        if (name.indexOf('.apk') !== -1) {
          if (name.indexOf('arm64') !== -1) specificAssets['android-arm64'] = assets[i];
          if (name.indexOf('armv7') !== -1) specificAssets['android-armv7'] = assets[i];
          if (name.indexOf('x86_64') !== -1) specificAssets['android-x86_64'] = assets[i];

          if (name.indexOf('universal') !== -1) {
             androidAsset = assets[i];
          } else if (!androidAsset) {
             androidAsset = assets[i];
          }
        } else if (name.indexOf('windows') !== -1 || name.indexOf('.exe') !== -1 || name.indexOf('.msix') !== -1 || name.indexOf('.zip') !== -1) {
          if (name.indexOf('mac') === -1 && name.indexOf('linux') === -1) {
            if (!windowsAsset || name.indexOf('.exe') !== -1 || name.indexOf('.msix') !== -1) {
              windowsAsset = assets[i];
            }
          }
        }
      }

      if (androidAsset) {
        document.querySelectorAll('[data-dynamic-dl="android"]').forEach(function (el) {
          el.href = androidAsset.browser_download_url;
        });
        document.querySelectorAll('[data-dynamic-meta="android"]').forEach(function (el) {
          el.textContent = formatBytes(androidAsset.size, 1) + ' · APK';
        });
        document.querySelectorAll('[data-dynamic-name="android"]').forEach(function (el) {
          el.textContent = androidAsset.name;
        });
        document.querySelectorAll('[data-dynamic-size="android"]').forEach(function (el) {
          el.textContent = formatBytes(androidAsset.size, 1);
        });
      }

      if (windowsAsset) {
        document.querySelectorAll('[data-dynamic-dl="windows"]').forEach(function (el) {
          el.href = windowsAsset.browser_download_url;
        });
        document.querySelectorAll('[data-dynamic-meta="windows"]').forEach(function (el) {
          var ext = windowsAsset.name.split('.').pop().toUpperCase();
          el.textContent = formatBytes(windowsAsset.size, 1) + ' · ' + ext;
        });
        document.querySelectorAll('[data-dynamic-name="windows"]').forEach(function (el) {
          el.textContent = windowsAsset.name;
        });
        document.querySelectorAll('[data-dynamic-size="windows"]').forEach(function (el) {
          el.textContent = formatBytes(windowsAsset.size, 1);
        });
      }

      for (var key in specificAssets) {
        var asset = specificAssets[key];
        if (asset) {
          document.querySelectorAll('[data-dynamic-dl="' + key + '"]').forEach(function (el) { el.href = asset.browser_download_url; });
          document.querySelectorAll('[data-dynamic-name="' + key + '"]').forEach(function (el) { el.textContent = asset.name; });
          document.querySelectorAll('[data-dynamic-size="' + key + '"]').forEach(function (el) { el.textContent = formatBytes(asset.size, 1); });
        }
      }

      renderHeroActions(assets);

      function renderHeroActions(assetsList) {
        var container = document.getElementById('hero-download-actions');
        if (!container) return;

        var device = { os: 'Unknown', arch: 'Unknown' };
        var ua = navigator.userAgent;

        if (/Windows/i.test(ua)) device.os = 'Windows';
        else if (/Macintosh|Mac OS X/i.test(ua)) device.os = 'Mac';
        else if (/Android/i.test(ua)) device.os = 'Android';
        else if (/iPhone|iPad|iPod/i.test(ua)) device.os = 'iOS';
        else if (/Linux/i.test(ua)) device.os = 'Linux';

        if (/aarch64|arm64/i.test(ua)) device.arch = 'arm64';
        else if (/armv7/i.test(ua)) device.arch = 'armv7';
        else if (/x86_64|x64|Win64|WOW64/i.test(ua)) device.arch = 'x86_64';
        else if (/i386|i686|x86/i.test(ua)) device.arch = 'x86';

        function buildUI(dev) {
          var bestAsset = null;
          var found = false;
          var btnText = '';
          var btnMeta = '';

          if (dev.os === 'Android') {
            var badge = document.getElementById('recommended-badge');
            if (badge) {
              var targetArch = dev.arch === 'Unknown' ? 'universal' : dev.arch;
              var targetRow = document.querySelector('tr[data-arch-row="' + targetArch + '"]');
              if (targetRow) {
                var firstCell = targetRow.querySelector('td');
                if (firstCell && badge.parentElement !== firstCell) {
                  firstCell.appendChild(document.createTextNode(' '));
                  firstCell.appendChild(badge);
                }
                document.querySelectorAll('tr[data-arch-row] .btn-primary').forEach(function(btn) {
                   btn.className = 'btn btn-secondary btn-sm';
                });
                var targetBtn = targetRow.querySelector('.btn');
                if (targetBtn) targetBtn.className = 'btn btn-primary btn-sm';
              }
            }

            var archAsset = null;
            var universalAsset = null;
            for (var i = 0; i < assetsList.length; i++) {
               var name = assetsList[i].name.toLowerCase();
               if (name.indexOf('.apk') !== -1) {
                 if (name.indexOf('universal') !== -1) universalAsset = assetsList[i];
                 if (dev.arch !== 'Unknown' && name.indexOf(dev.arch) !== -1) archAsset = assetsList[i];
               }
            }
            bestAsset = archAsset || universalAsset;
            if (bestAsset) {
              found = true;
              btnText = 'Descargar para Android';
              if (bestAsset === archAsset && dev.arch !== 'Unknown') {
                 btnText += ' (' + dev.arch + ')';
              } else {
                 btnText += ' (Universal)';
              }
              btnMeta = formatBytes(bestAsset.size, 1) + ' · APK';
            }
          } else if (dev.os === 'Windows') {
            for (var i = 0; i < assetsList.length; i++) {
               var name = assetsList[i].name.toLowerCase();
               if ((name.indexOf('windows') !== -1 || name.indexOf('.exe') !== -1 || name.indexOf('.msix') !== -1 || name.indexOf('.zip') !== -1) && name.indexOf('mac') === -1 && name.indexOf('linux') === -1) {
                 if (!bestAsset || name.indexOf('.exe') !== -1 || name.indexOf('.msix') !== -1) {
                   bestAsset = assetsList[i];
                 }
               }
            }
            if (bestAsset) {
              found = true;
              var ext = bestAsset.name.split('.').pop().toUpperCase();
              btnText = 'Descargar para Windows';
              btnMeta = formatBytes(bestAsset.size, 1) + ' · ' + ext;
            }
          } else if (dev.os === 'Linux') {
            for (var i = 0; i < assetsList.length; i++) {
               var name = assetsList[i].name.toLowerCase();
               if (name.indexOf('linux') !== -1 || name.indexOf('.appimage') !== -1 || name.indexOf('.deb') !== -1) {
                 bestAsset = assetsList[i];
                 break;
               }
            }
            if (bestAsset) {
              found = true;
              var ext = bestAsset.name.split('.').pop().toUpperCase();
              btnText = 'Descargar para Linux';
              btnMeta = formatBytes(bestAsset.size, 1) + ' · ' + ext;
            }
          }

          container.innerHTML = '';

          if (found && bestAsset) {
            var a = document.createElement('a');
            a.href = bestAsset.browser_download_url;
            a.className = 'btn btn-primary';
            a.innerHTML = btnText + '\n<span class="btn-meta">' + btnMeta + '</span>';
            container.appendChild(a);
          } else {
            var p = document.createElement('p');
            p.style.color = 'var(--text-muted)';
            p.style.marginBottom = '1rem';
            p.style.width = '100%';
            p.style.gridColumn = '1 / -1';
            p.textContent = 'Aplicación no disponible para tu dispositivo (' + (dev.os !== 'Unknown' ? dev.os : 'Sistema desconocido') + ').';
            container.appendChild(p);
          }

          var other = document.createElement('a');
          other.href = 'downloads.html';
          other.className = 'btn btn-secondary';
          other.style.borderColor = 'transparent';
          other.style.background = 'transparent';
          other.style.textDecoration = 'underline';
          other.textContent = 'Otras plataformas';
          container.appendChild(other);
        }

        if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
          navigator.userAgentData.getHighEntropyValues(['architecture', 'bitness', 'platform'])
            .then(function(uaData) {
              if (uaData.platform) {
                var plat = uaData.platform.toLowerCase();
                if (plat.indexOf('win') !== -1) device.os = 'Windows';
                else if (plat.indexOf('mac') !== -1) device.os = 'Mac';
                else if (plat.indexOf('linux') !== -1) device.os = 'Linux';
                else if (plat.indexOf('android') !== -1) device.os = 'Android';
                else if (plat.indexOf('ios') !== -1) device.os = 'iOS';
              }
              if (uaData.architecture) {
                var a = uaData.architecture.toLowerCase();
                if (a === 'x86') device.arch = (uaData.bitness === '64') ? 'x86_64' : 'x86';
                else if (a === 'arm') device.arch = (uaData.bitness === '64') ? 'arm64' : 'armv7';
              }
              buildUI(device);
            })
            .catch(function() {
              buildUI(device);
            });
        } else {
          buildUI(device);
        }
      }

    })
    .catch(function (err) {
      console.warn('Error fetching latest release:', err);
    });
})();
