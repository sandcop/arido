/* Constelaciones de la fauna de Árido. Cada animal es un dibujo de estrellas unidas por
   lineas; al pasar el cursor (o tocar, en pantallas tactiles) se ilumina, se dibuja de
   nuevo y muestra el valor que representa.
   En escritorio viven a los costados del cielo (hero y "Nuestro origen"); en pantallas
   angostas no hay costados libres, asi que se reunen en una franja propia bajo "Llegamos a". */
(function(){
  var NS = 'http://www.w3.org/2000/svg';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Coordenadas en un lienzo de 100 x 76. s = estrellas [x, y, brillo 1-3]; l = lineas entre
  // indices de estrellas. donde/slot = lugar en escritorio; m = lugar en movil, disperso
  // (l/r en % del ancho, t en px, rot = giro del dibujo).
  var FAUNA = [
    { id:'zorro', arte:'assets/fauna/zorro.webp', nombre:'Zorro Chilla', valor:'Resiliencia', donde:'hero', slot:{ l:'4%', t:'22%' }, m:{ l:2, t:0, rot:-8 },
      s:[[24,20,2],[36,16,3],[30,8,1],[40,6,1],[40,28,2],[60,34,1],[72,48,2],[86,46,1],[96,58,2],[38,44,1],[40,64,1],[66,64,1]],
      l:[[0,1],[1,2],[1,3],[1,4],[4,5],[5,6],[6,7],[7,8],[4,9],[9,10],[6,11]] },
    { id:'vizcacha', arte:'assets/fauna/vizcacha.webp', nombre:'Vizcacha', valor:'Serenidad', donde:'hero', slot:{ l:'8%', t:'60%' }, m:{ l:36, t:96, rot:6 },
      s:[[24,22,1],[34,18,3],[30,4,1],[38,6,1],[50,26,1],[66,36,2],[60,58,1],[36,52,1],[84,40,1],[94,24,2]],
      l:[[0,1],[1,2],[1,3],[1,4],[4,5],[5,6],[6,7],[7,1],[5,8],[8,9]] },
    { id:'vicuna', arte:'assets/fauna/vicuna.webp', nombre:'Vicuña', valor:'Pureza', donde:'hero', slot:{ r:'5%', t:'52%' }, m:{ r:3, t:14, rot:-4 },
      s:[[6,10,1],[14,6,3],[18,1,1],[24,30,1],[66,28,2],[73,33,1],[26,44,1],[26,70,1],[62,44,1],[64,70,1]],
      l:[[0,1],[1,2],[1,3],[3,4],[4,5],[3,6],[6,7],[6,8],[8,4],[8,9]] },
    { id:'parina', nombre:'Parina', valor:'Equilibrio', donde:'nos', slot:{ l:'0', t:'20px' }, m:{ l:4, t:0, rot:5 },
      s:[[12,12,1],[20,6,2],[28,18,1],[20,30,1],[30,38,1],[54,34,3],[66,40,1],[44,46,1],[44,58,1],[44,74,2],[54,62,1]],
      l:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,4],[7,8],[8,9],[8,10]] },
    { id:'gaviotin', nombre:'Gaviotín Chico', valor:'Libertad', donde:'nos', slot:{ r:'0', t:'0px' }, m:{ r:2, t:70, rot:-10 },
      s:[[4,20,2],[28,30,1],[46,34,3],[56,32,1],[40,40,1],[26,52,1],[34,56,1],[52,22,1],[78,6,2]],
      l:[[0,1],[1,4],[2,3],[2,4],[4,5],[4,6],[2,7],[7,8]] },
    { id:'chungungo', arte:'assets/fauna/chungungo.webp', nombre:'Chungungo', valor:'Alegría', donde:'nos', slot:{ l:'0', t:'640px' }, m:{ l:10, t:250, rot:-6 },
      s:[[6,32,1],[14,30,3],[30,26,1],[32,14,2],[52,28,1],[70,32,1],[82,22,2],[96,36,1]],
      l:[[0,1],[1,2],[2,3],[2,4],[4,5],[5,6],[5,7]] },
    { id:'ballena', arte:'assets/fauna/ballena.webp', nombre:'Ballena Fin', valor:'Trascendencia', donde:'nos', slot:{ r:'0', t:'740px' }, m:{ r:0, t:330, rot:4 },
      s:[[4,34,2],[18,42,1],[26,28,1],[60,26,1],[64,18,2],[68,26,1],[50,44,1],[84,32,1],[96,22,3],[96,42,1]],
      l:[[0,2],[2,3],[3,4],[4,5],[5,7],[0,1],[1,6],[6,7],[7,8],[7,9]] }
  ];

  var hero = document.querySelector('.hero');
  var nosC = document.querySelector('#nosotros .container');
  var aboutGrid = document.querySelector('#nosotros .about-grid');
  if(!hero || !nosC || !aboutGrid) return;

  function rand(a, b){ return a + Math.random() * (b - a); }

  function crear(f){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'const';
    b.setAttribute('aria-label', f.nombre + ': ' + f.valor);
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 76');
    svg.setAttribute('aria-hidden', 'true');
    f.l.forEach(function(par, i){
      var a = f.s[par[0]], c = f.s[par[1]];
      var ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', a[0]); ln.setAttribute('y1', a[1]);
      ln.setAttribute('x2', c[0]); ln.setAttribute('y2', c[1]);
      ln.setAttribute('pathLength', '1');
      ln.style.setProperty('--i', i);
      svg.appendChild(ln);
    });
    f.s.forEach(function(st){
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', st[0]); c.setAttribute('cy', st[1]);
      c.setAttribute('r', [0, 1.1, 1.5, 2.1][st[2]]);
      c.style.setProperty('--tw', rand(2.4, 5).toFixed(2) + 's');
      c.style.setProperty('--td', (-rand(0, 5)).toFixed(2) + 's');
      svg.appendChild(c);
    });
    b.appendChild(svg);
    // Arte real de la mascota (assets/fauna, del "El norte es fauna"): aparece sobre las
    // estrellas al activar la constelacion. Parina y gaviotin aun no tienen ilustracion.
    if(f.arte){
      var art = document.createElement('img');
      art.className = 'const-art';
      art.src = f.arte; art.alt = ''; art.loading = 'lazy'; art.decoding = 'async';
      b.appendChild(art);
      b.classList.add('has-art');
    }
    var tip = document.createElement('span');
    tip.className = 'const-tip';
    tip.innerHTML = '<span class="const-name"></span><span class="const-val"></span>';
    tip.firstChild.textContent = f.nombre;
    tip.lastChild.textContent = f.valor;
    b.appendChild(tip);
    // Tocar/clic: abre y cierra (en tactil no hay hover). Solo una abierta a la vez.
    b.addEventListener('click', function(){
      var abrir = !b.classList.contains('is-open');
      todas.forEach(function(o){ o.el.classList.remove('is-open'); });
      if(abrir) b.classList.add('is-open');
    });
    return b;
  }

  var todas = FAUNA.map(function(f){ return { f:f, el:crear(f) }; });

  // Franja para pantallas angostas, bajo "Llegamos a".
  var franja = document.createElement('div');
  franja.className = 'const-band';
  franja.innerHTML = '<p class="const-hint">Toca una constelación para descubrir su valor.</p><div class="const-band-grid"></div>';
  var grilla = franja.querySelector('.const-band-grid');
  aboutGrid.parentNode.insertBefore(franja, aboutGrid.nextSibling);

  // Las del hero, en angosto, van en una fila bajo el boton: ahi queda cielo libre entre
  // el hero y "Nuestro origen".
  var franjaHero = document.createElement('div');
  franjaHero.className = 'const-band const-band--hero';
  franjaHero.innerHTML = '<div class="const-band-grid"></div>';
  var grillaHero = franjaHero.firstChild;
  var heroInner = hero.querySelector('.hero-inner') || hero;
  heroInner.appendChild(franjaHero);

  var ancho = window.matchMedia('(min-width: 1180px)');
  function ubicar(){
    todas.forEach(function(o){
      var el = o.el, f = o.f;
      el.classList.remove('is-open');
      if(ancho.matches){
        el.classList.add('const--abs');
        el.style.setProperty('--l', f.slot.l || 'auto');
        el.style.setProperty('--r', f.slot.r || 'auto');
        el.style.setProperty('--t', f.slot.t);
        (f.donde === 'hero' ? hero : nosC).appendChild(el);
      } else {
        el.classList.remove('const--abs');
        // Disperso, con un pequeno desvio al azar en cada carga: un cielo, no una fila.
        var m = f.m;
        el.style.setProperty('--l', m.l != null ? (m.l + rand(-2, 2)).toFixed(1) + '%' : 'auto');
        el.style.setProperty('--r', m.r != null ? (m.r + rand(-2, 2)).toFixed(1) + '%' : 'auto');
        el.style.setProperty('--t', Math.round(m.t + rand(-10, 10)) + 'px');
        el.style.setProperty('--rot', (m.rot + rand(-3, 3)).toFixed(1) + 'deg');
        (f.donde === 'hero' ? grillaHero : grilla).appendChild(el);
      }
    });
    franja.hidden = ancho.matches;
    franjaHero.hidden = ancho.matches;
  }
  ubicar();
  if(ancho.addEventListener) ancho.addEventListener('change', ubicar); else ancho.addListener(ubicar);

  // Cerrar al tocar fuera.
  document.addEventListener('click', function(e){
    if(!e.target.closest || !e.target.closest('.const')){
      todas.forEach(function(o){ o.el.classList.remove('is-open'); });
    }
  });

  // Cada tanto una constelacion visible "despierta" sola: se redibuja y brilla un momento.
  // Es la pista de que se puede interactuar con ellas.
  if(reduced) return;
  function enPantalla(el){
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  }
  function despertar(){
    if(!document.hidden){
      var vis = todas.filter(function(o){ return enPantalla(o.el) && !o.el.matches(':hover') && !o.el.classList.contains('is-open'); });
      if(vis.length){
        var o = vis[Math.floor(Math.random() * vis.length)];
        o.el.classList.remove('is-shimmer');
        void o.el.offsetWidth;
        o.el.classList.add('is-shimmer');
        window.setTimeout(function(){ o.el.classList.remove('is-shimmer'); }, 1800);
      }
    }
    window.setTimeout(despertar, rand(4500, 8000));
  }
  window.setTimeout(despertar, 3200);
})();
