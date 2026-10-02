/* Curva de tostado (seccion "El tueste"). Un punto recorre la curva y va encendiendo
   los hitos; primero la zona endotermica y, desde el primer crack, la exotermica.
   Corre en bucle: completa, se queda quieta un momento, se desvanece y vuelve a empezar.
   Fuera de pantalla se pausa. */
(function () {
  /* Hitos: posicion sobre el path (atX = x en el viewBox; 'min' = punto mas bajo).
     lx/ly = posicion de la etiqueta; t = segundo (de 8.7) en que el punto llega. */
  var HITOS = [
    { name: 'GRANO VERDE',   at: 'start', t: 0,   lx: 120, ly: 136, anchor: 'start' },
    { name: 'TURNING POINT', at: 'min',   t: 1.2, lx: 222, ly: 436, anchor: 'middle' },
    { name: 'SECADO',        atX: 383,    t: 2.6, lx: 362, ly: 262, anchor: 'end' },
    { name: 'MAILLARD', sub: 'Reacción de Maillard', atX: 495, t: 4.2, lx: 516, ly: 222, anchor: 'start' },
    { name: 'PRIMER CRACK',  atX: 671,    t: 6.2, lx: 684, ly: 150, anchor: 'start' },
    { name: 'DESARROLLO',    atX: 845,    t: 7.5, lx: 845, ly: 208, anchor: 'middle', leader: true },
    { name: 'CAFÉ TOSTADO',  at: 'end',   t: 8.7, lx: 940, ly: 264, anchor: 'end', leader: true }
  ];
  var EXO_INDEX = 4, NS = 'http://www.w3.org/2000/svg';
  // Bajo este ancho las etiquetas quedarian ilegibles (movil): numeros sobre la curva +
  // leyenda. En escritorio y tablet se ven los nombres escritos, como el original.
  var ANGOSTO = 520;

  [].slice.call(document.querySelectorAll('.roast')).forEach(function (root) {
    var path = root.querySelector('.roast__curve'), dot = root.querySelector('.roast__dot'),
        halo = root.querySelector('.roast__halo'), layer = root.querySelector('.roast__hitos'),
        list = root.querySelector('.roast__list'), svg = root.querySelector('svg');
    if (!path || !path.getTotalLength) return;
    var duration = parseFloat(root.getAttribute('data-duration')) || 8.5, L = path.getTotalLength(), raf;
    var PAUSA = 2600, FUNDIDO = 700;   // ms con la curva completa y ms del desvanecido
    var visible = false, esperas = [];
    function esperar(fn, ms){ var id = window.setTimeout(fn, ms); esperas.push(id); }
    function cancelar(){ cancelAnimationFrame(raf); esperas.forEach(window.clearTimeout); esperas = []; }

    function el(tag, attrs, text) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (text) n.textContent = text;
      return n;
    }
    function lenAtX(x) {
      var a = 0, b = L;
      for (var i = 0; i < 40; i++) { var m = (a + b) / 2; if (path.getPointAtLength(m).x < x) a = m; else b = m; }
      return b;
    }
    var minL = 0, minY = -1;
    for (var i = 0; i <= 600; i++) {
      var l = L * i / 600, p = path.getPointAtLength(l);
      if (p.y > minY) { minY = p.y; minL = l; }
    }

    HITOS.forEach(function (h, i) {
      h.len = h.at === 'start' ? 0 : h.at === 'end' ? L : h.at === 'min' ? minL : lenAtX(h.atX);
      var p = path.getPointAtLength(h.len), g = el('g', { 'class': 'fade' });
      if (h.leader) g.appendChild(el('line', { 'class': 'leader', x1: p.x, y1: p.y + 13, x2: p.x, y2: h.ly - 22, stroke: 'var(--rule)', 'stroke-width': 1.5, 'stroke-linecap': 'round' }));
      g.appendChild(el('circle', { 'class': 'ring', cx: p.x, cy: p.y, r: 7, fill: 'var(--bg)', stroke: 'var(--accent)', 'stroke-width': 3 }));
      g.appendChild(el('circle', { 'class': 'ring-big', cx: p.x, cy: p.y, r: 21, fill: 'var(--bg)', stroke: 'var(--accent)', 'stroke-width': 4 }));
      g.appendChild(el('text', { 'class': 'num', x: p.x, y: p.y + 8.5 }, String(i + 1)));
      g.appendChild(el('text', { 'class': 'lbl', x: h.lx, y: h.ly, 'text-anchor': h.anchor }, h.name));
      if (h.sub) g.appendChild(el('text', { 'class': 'sub', x: h.lx, y: h.ly + 20, 'text-anchor': h.anchor }, h.sub));
      layer.appendChild(g); h.g = g;
      var li = document.createElement('li'); li.className = 'fade';
      li.innerHTML = '<span>' + (i + 1) + '</span>' + h.name; list.appendChild(li); h.li = li;
    });

    var T = HITOS.map(function (h) { return h.t; }), total = T[T.length - 1];
    function lenAt(t) {
      if (t <= 0) return 0;
      if (t >= total) return L;
      var i = 0; while (t > T[i + 1]) i++;
      var u = (t - T[i]) / (T[i + 1] - T[i]);
      if (i === T.length - 2) u = 1 - Math.pow(1 - u, 2.2); // desacelera al final
      return HITOS[i].len + (HITOS[i + 1].len - HITOS[i].len) * u;
    }
    function setDot(len) { var q = path.getPointAtLength(len); dot.setAttribute('transform', 'translate(' + q.x + ' ' + q.y + ')'); }
    function toggle(nodes, on) { nodes.forEach(function (n) { n.classList.toggle('on', on); }); }
    var endo = [].slice.call(root.querySelectorAll('[data-zone="endo"]')),
        exo = [].slice.call(root.querySelectorAll('[data-zone="exo"]'));

    function reset() {
      path.style.strokeDasharray = L; path.style.strokeDashoffset = L; setDot(0); dot.style.opacity = 0;
      HITOS.forEach(function (h) { toggle([h.g, h.li], false); });
      toggle(endo, false); toggle(exo, false);
      svg.style.opacity = 1; list.style.opacity = 1;
    }
    function play() {
      cancelar(); reset();
      dot.style.opacity = 1; toggle(endo, true);
      var t0 = performance.now(), k = total / duration;
      (function tick(now) {
        var t = (now - t0) / 1000 * k, len = lenAt(t), ph = Math.sin(now / 260);
        path.style.strokeDashoffset = L - len; setDot(len);
        halo.setAttribute('r', 13 + 2.5 * ph); halo.setAttribute('opacity', 0.16 + 0.06 * ph);
        HITOS.forEach(function (h) { if (h.len <= len + 0.5) toggle([h.g, h.li], true); });
        if (len >= HITOS[EXO_INDEX].len - 0.5) toggle(exo, true);
        // Al llegar se apaga el punto: tapaba el ultimo hito.
        if (t < total) { raf = requestAnimationFrame(tick); return; }
        // Bucle: quieta un momento, se desvanece y arranca de nuevo.
        esperar(function () {
          svg.style.opacity = 0; list.style.opacity = 0;
          esperar(function () { if (visible) play(); }, FUNDIDO);
        }, PAUSA);
      })(t0);
    }
    function showFinal() {
      path.style.strokeDashoffset = 0; setDot(L); dot.style.opacity = 1;
      HITOS.forEach(function (h) { toggle([h.g, h.li], true); });
      toggle(endo, true); toggle(exo, true);
    }

    function medir() { root.classList.toggle('is-narrow', root.getBoundingClientRect().width < ANGOSTO); }
    medir();
    if ('ResizeObserver' in window) new ResizeObserver(medir).observe(root);
    else window.addEventListener('resize', medir);

    reset();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { showFinal(); return; }
    // Corre mientras se ve; al salir de pantalla se detiene y al volver arranca de cero.
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      if (visible) play(); else { cancelar(); reset(); }
    }, { threshold: 0.35 }).observe(root);
  });
})();
