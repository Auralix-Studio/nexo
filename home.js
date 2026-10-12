/* Nexo · Portada: intro, cielo del escenario y mapa de conexiones.
   Todo respeta "reducir movimiento" y se detiene cuando no se ve. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = document.querySelector('.stage');
  var header = document.querySelector('.site-header.on-stage');

  /* Partes de la app. Se usan en la intro (puntos que se unen al centro) y
     en el mapa de conexiones. */
  var MODULES = [
    {
      id: 'horario', label: 'Horario',
      title: 'Tu horario, con la próxima clase arriba',
      body: 'Ves qué clase sigue, en qué aula y cuánto falta. El día completo y la semana, ordenados.',
      items: ['Aviso 15 minutos antes de cada clase', 'Widgets en la pantalla de inicio de Android', 'Exporta el horario en PDF'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/></svg>'
    },
    {
      id: 'notas', label: 'Notas',
      title: 'Notas y promedios al día',
      body: 'Cada evaluación con su peso, el promedio de cada curso y cuánto te falta para aprobar.',
      items: ['Calculadora de la nota que necesitas', 'Aviso cuando sale una nota nueva', 'Historial de todos tus ciclos'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>'
    },
    {
      id: 'pagos', label: 'Pagos',
      title: 'Cuotas sin sorpresas',
      body: 'Lo que debes, cuándo vence y el cronograma completo del ciclo.',
      items: ['Aviso un día antes del vencimiento', 'Cronograma y constancia de matrícula en PDF', 'Total pendiente siempre visible'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5.5" width="19" height="13" rx="3"/><path d="M2.5 10h19M7 15h3"/></svg>'
    },
    {
      id: 'offline', label: 'Sin conexión',
      title: 'Funciona aunque no haya señal',
      body: 'Lo último que consultaste queda guardado en el teléfono. En el aula sin wifi, tu horario sigue ahí.',
      items: ['Se actualiza solo al volver la conexión', 'Si SIGMA falla, usa la Intranet', 'Los datos de cada cuenta quedan separados'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></svg>'
    },
    {
      id: 'cuentas', label: 'Cuentas',
      title: 'Cambia de cuenta con un toque',
      body: '¿Compartes el teléfono o eres alumno y docente a la vez? Guarda hasta cinco cuentas y pasa de una a otra sin escribir la contraseña.',
      items: ['Contraseñas en el almacén seguro del sistema', 'Español, inglés y quechua', 'Tema claro, oscuro y de colores'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M17 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/></svg>'
    },
    {
      id: 'docentes', label: 'Docentes',
      title: 'Para quien enseña',
      body: 'Con una cuenta docente aparecen tus secciones: lista, notas y marcación desde el teléfono.',
      items: ['Pasar lista con un toque', 'Notas con pegado desde Excel', 'Alumnos que necesitan atención'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.5 12 4l10 4.5-10 4.5L2 8.5Z"/><path d="M6 10.5V16c2 2 10 2 12 0v-5.5"/></svg>'
    }
  ];

  /* ── Cabecera: transparente sobre el escenario, normal al bajar ───── */
  function initHeader() {
    if (!header || !stage) return;
    var update = function () {
      var limit = stage.offsetHeight - 70;
      header.classList.toggle('scrolled', window.scrollY > limit);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ── Cielo del escenario: puntos que se conectan entre sí ─────────── */
  function initSky() {
    var canvas = stage && stage.querySelector('.stage-sky');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, points = [], pulses = [];
    var pointer = { x: -9999, y: -9999 };
    var running = false, visible = true, raf = 0, last = 0;

    function size() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(90, Math.max(34, (w * h) / 16000)));
      points = [];
      for (var i = 0; i < count; i++) {
        points.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.4 + 0.6
        });
      }
    }

    function draw(dt) {
      ctx.clearRect(0, 0, w, h);
      var max = Math.min(170, w / 6);
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        if (!reduce) {
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;
        }
      }
      for (i = 0; i < points.length; i++) {
        var a = points[i];
        for (var j = i + 1; j < points.length; j++) {
          var b = points[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < max) {
            var mx = (a.x + b.x) / 2 - pointer.x, my = (a.y + b.y) / 2 - pointer.y;
            var near = Math.max(0, 1 - Math.sqrt(mx * mx + my * my) / 220);
            var alpha = (1 - d / max) * (0.16 + near * 0.5);
            ctx.strokeStyle = near > 0.05
              ? 'rgba(34, 211, 238,' + alpha.toFixed(3) + ')'
              : 'rgba(129, 140, 248,' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < points.length; i++) {
        var q = points[i];
        ctx.fillStyle = 'rgba(199, 203, 255, 0.75)';
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.fill();
      }
      /* Pulsos: un destello que viaja por una conexión, de vez en cuando */
      if (!reduce && Math.random() < 0.02 && pulses.length < 4) {
        var s = points[(Math.random() * points.length) | 0];
        var best = null, bd = 1e9;
        for (i = 0; i < points.length; i++) {
          var t = points[i]; if (t === s) continue;
          var dd = Math.hypot(t.x - s.x, t.y - s.y);
          if (dd < max && dd < bd && dd > 40) { bd = dd; best = t; }
        }
        if (best) pulses.push({ a: s, b: best, t: 0 });
      }
      for (i = pulses.length - 1; i >= 0; i--) {
        var pu = pulses[i];
        pu.t += 0.012 * dt;
        if (pu.t >= 1) { pulses.splice(i, 1); continue; }
        var px = pu.a.x + (pu.b.x - pu.a.x) * pu.t, py = pu.a.y + (pu.b.y - pu.a.y) * pu.t;
        var g = ctx.createRadialGradient(px, py, 0, px, py, 8);
        g.addColorStop(0, 'rgba(34, 211, 238, 0.95)');
        g.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
      }
    }

    function frame(t) {
      var dt = last ? Math.min(3, (t - last) / 16.67) : 1;
      last = t;
      draw(dt);
      if (running) raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running || reduce || !visible || document.hidden) return;
      running = true; last = 0; raf = requestAnimationFrame(frame);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }

    size();
    draw(1);
    if (reduce) return;

    stage.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    });
    stage.addEventListener('pointerleave', function () { pointer.x = pointer.y = -9999; });
    window.addEventListener('resize', function () { size(); draw(1); });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        visible ? start() : stop();
      }).observe(stage);
    }
    start();
  }

  /* ── Intro: las partes de la universidad se unen y forman NEXO ────── */
  function revealStage(handoff) {
    if (!stage) return;
    if (handoff) stage.classList.add('handoff');
    root.classList.remove('intro-pending');
    requestAnimationFrame(function () { stage.classList.add('ready'); });
  }

  function initIntro() {
    if (!root.classList.contains('intro-pending')) { revealStage(false); return; }
    try { sessionStorage.setItem('nexo.intro', '1'); } catch (e) { /* sin almacenamiento */ }

    var overlay = document.createElement('div');
    overlay.className = 'intro';
    overlay.setAttribute('role', 'presentation');
    overlay.innerHTML =
      '<canvas aria-hidden="true"></canvas>' +
      '<div class="intro-word" aria-hidden="true"><span>N</span><span>E</span><span>X</span><span>O</span></div>' +
      '<button class="intro-skip" type="button">Saltar intro</button>';
    document.body.appendChild(overlay);

    var canvas = overlay.querySelector('canvas');
    var word = overlay.querySelector('.intro-word');
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var cx = W / 2, cy = H / 2;
    var R = Math.min(W, H) * 0.36;
    var nodes = MODULES.map(function (m, i) {
      var ang = -Math.PI / 2 + (i / MODULES.length) * Math.PI * 2 + 0.3;
      var rr = R * (0.92 + (i % 2) * 0.16);
      return { label: m.label, x0: cx + Math.cos(ang) * rr, y0: cy + Math.sin(ang) * rr * 0.82 };
    });
    var dust = [];
    for (var i = 0; i < 120; i++) dust.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.1 + 0.3, a: Math.random() * 0.5 + 0.1 });

    var t0 = 0, done = false, raf = 0;
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var easeIn = function (t) { return t * t * t; };
    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var fontFamily = getComputedStyle(document.body).fontFamily;

    function render(ms) {
      ctx.clearRect(0, 0, W, H);
      /* polvo de fondo */
      for (var k = 0; k < dust.length; k++) {
        var d = dust[k];
        ctx.fillStyle = 'rgba(199, 203, 255,' + (d.a * clamp(ms / 600)).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      }
      var appear = clamp(ms / 650);          // 0–650: aparecen los puntos
      var link = clamp((ms - 450) / 700);     // 450–1150: se trazan las líneas
      var pull = clamp((ms - 1000) / 600);    // 1000–1600: viajan al centro
      var burst = clamp((ms - 1550) / 900);   // 1550–2450: destello

      nodes.forEach(function (n, idx) {
        var stagger = clamp(appear * 1.6 - idx * 0.1);
        var p = easeIn(pull);
        var x = n.x0 + (cx - n.x0) * p, y = n.y0 + (cy - n.y0) * p;

        if (link > 0 && pull < 1) {
          var l = ease(clamp(link * 1.3 - idx * 0.06));
          var ex = x + (cx - x) * l, ey = y + (cy - y) * l;
          var grad = ctx.createLinearGradient(x, y, ex, ey);
          grad.addColorStop(0, 'rgba(129, 140, 248, 0.15)');
          grad.addColorStop(1, 'rgba(34, 211, 238, 0.9)');
          ctx.strokeStyle = grad; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
        }
        if (pull < 1) {
          var a = ease(stagger) * (1 - pull);
          var gl = ctx.createRadialGradient(x, y, 0, x, y, 26);
          gl.addColorStop(0, 'rgba(129, 140, 248,' + (0.55 * a).toFixed(3) + ')');
          gl.addColorStop(1, 'rgba(129, 140, 248, 0)');
          ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(238, 240, 255,' + a.toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
          ctx.font = '600 15px ' + fontFamily;
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(169, 176, 214,' + (a * (1 - link * 0.6)).toFixed(3) + ')';
          ctx.fillText(n.label, x, y - 18);
        }
      });

      if (burst > 0) {
        var b = ease(burst);
        var rad = 20 + b * Math.max(W, H) * 0.55;
        ctx.strokeStyle = 'rgba(34, 211, 238,' + (0.55 * (1 - b)).toFixed(3) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
        var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260);
        core.addColorStop(0, 'rgba(99, 102, 241,' + (0.5 * (1 - b * 0.6)).toFixed(3) + ')');
        core.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy, 260, 0, Math.PI * 2); ctx.fill();
      }
    }

    var shown = false, flown = false;
    function frame(t) {
      if (!t0) t0 = t;
      var ms = t - t0;
      render(ms);
      if (!shown && ms > 1640) { shown = true; word.classList.add('show'); }
      if (!flown && ms > 2750) { flown = true; flyToHero(); return; }
      raf = requestAnimationFrame(frame);
    }

    /* El logotipo de la intro viaja al lugar exacto del logotipo del hero */
    function flyToHero() {
      var target = stage && stage.querySelector('[data-wordmark]');
      if (target) {
        var from = word.getBoundingClientRect();
        var to = target.getBoundingClientRect();
        var s = to.height / from.height;
        word.classList.add('fly');
        word.style.transform = 'translate(' + (to.left - from.left) + 'px,' + (to.top - from.top) + 'px) scale(' + s + ')';
      }
      setTimeout(finish, target ? 700 : 0);
    }

    function finish() {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      revealStage(true);
      overlay.classList.add('leaving');
      setTimeout(function () { overlay.remove(); }, 750);
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish(); }

    overlay.addEventListener('click', finish);
    document.addEventListener('keydown', onKey);
    /* Esperar la tipografía del logotipo para que el viaje calce exacto */
    var go = function () { raf = requestAnimationFrame(frame); };
    if (document.fonts && document.fonts.load) {
      Promise.race([document.fonts.load('400 100px "Super Mindset"'), new Promise(function (r) { setTimeout(r, 700); })]).then(go, go);
    } else { go(); }
  }

  /* ── Mapa de conexiones ───────────────────────────────────────────── */
  function initHub() {
    var map = document.querySelector('[data-hub]');
    if (!map) return;
    var svg = map.querySelector('.hub-lines');
    var nodesEl = map.querySelector('.hub-nodes');
    var detail = document.querySelector('.hub-detail');
    var dTitle = detail.querySelector('.hub-detail-title');
    var dBody = detail.querySelector('.hub-detail-body');
    var dList = detail.querySelector('.hub-detail-list');
    var NS = 'http://www.w3.org/2000/svg';
    var links = [], buttons = [], current = -1, timer = 0, userTouched = false;

    MODULES.forEach(function (m, i) {
      var ang = -Math.PI / 2 + (i / MODULES.length) * Math.PI * 2;
      var x = 300 + Math.cos(ang) * 210, y = 300 + Math.sin(ang) * 210;
      var line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', 300); line.setAttribute('y1', 300);
      line.setAttribute('x2', x.toFixed(1)); line.setAttribute('y2', y.toFixed(1));
      line.setAttribute('class', 'hub-link');
      svg.appendChild(line);
      links.push(line);

      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hub-node';
      b.id = 'hub-' + m.id;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('aria-controls', 'hub-detail');
      b.style.left = (x / 6) + '%';
      b.style.top = (y / 6) + '%';
      b.innerHTML = '<span class="dot">' + m.icon + '</span><span>' + m.label + '</span>';
      b.addEventListener('click', function () { userTouched = true; stopAuto(); select(i); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, n = MODULES.length;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); userTouched = true; stopAuto(); select((i + 1) % n, true); }
        if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); userTouched = true; stopAuto(); select((i - 1 + n) % n, true); }
      });
      nodesEl.appendChild(b);
      buttons.push(b);
    });
    detail.id = 'hub-detail';
    detail.setAttribute('role', 'tabpanel');

    function select(i, focus) {
      if (i === current) return;
      current = i;
      var m = MODULES[i];
      buttons.forEach(function (b, k) {
        b.setAttribute('aria-selected', k === i ? 'true' : 'false');
        b.tabIndex = k === i ? 0 : -1;
      });
      links.forEach(function (l, k) { l.classList.toggle('on', k === i); });
      detail.setAttribute('aria-labelledby', buttons[i].id);
      dTitle.textContent = m.title;
      dBody.textContent = m.body;
      dList.innerHTML = '';
      m.items.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; dList.appendChild(li); });
      detail.classList.remove('swap'); void detail.offsetWidth; detail.classList.add('swap');
      if (focus) buttons[i].focus();
    }

    function stopAuto() { clearInterval(timer); timer = 0; }
    function startAuto() {
      if (reduce || userTouched || timer) return;
      timer = setInterval(function () { select((current + 1) % MODULES.length); }, 4200);
    }

    select(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es[0].isIntersecting ? startAuto() : stopAuto(); }, { threshold: 0.4 }).observe(map);
    }
    map.addEventListener('pointerenter', stopAuto);
  }

  function init() {
    initHeader();
    initSky();
    initHub();
    initIntro();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
