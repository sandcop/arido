/* Destellos del menu movil. Mientras el menu esta abierto, las constelaciones de la fauna
   (las mismas del hero, ver constellations.js) se encienden un instante en lugares al azar
   del cielo: se dibujan, aparece la mascota brillando y se apagan. Sin nombres.
   El menu lo abre y cierra main.js; aqui solo se mira su clase `open`. */
(function(){
  var lib = window.AridoConstelaciones;
  var menu = document.getElementById('mobileMenu');
  var capa = document.getElementById('mmSparks');
  if(!lib || !menu || !capa) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Solo las que ya tienen ilustracion: parina y gaviotin son constelacion sin mascota (aun).
  var fauna = lib.fauna.filter(function(f){ return f.arte; });
  var MAX = 3;            // destellos a la vez
  var activos = [];       // { el, caja, t } mientras viven
  var cola = null;        // proximo destello programado
  var ultimo = null;
  var precargado = false;

  function rand(a, b){ return a + Math.random() * (b - a); }

  // Que no aparezca la misma dos veces seguidas ni una que ya esta encendida.
  function elegir(){
    var libres = fauna.filter(function(f){
      return f !== ultimo && !activos.some(function(a){ return a.f === f; });
    });
    return libres.length ? libres[Math.floor(Math.random() * libres.length)] : null;
  }

  function pisa(x, y, w, h, c, margen){
    return x < c.x + c.w + margen && x + w + margen > c.x && y < c.y + c.h + margen && y + h + margen > c.y;
  }

  // Caja (px sobre la capa) de un bloque del menu, de `desde` a `hasta` (por defecto el mismo).
  // Con offsetTop y no getBoundingClientRect: los bloques entran desplazados 34px (.mm-anim)
  // y la caja no puede depender de ese momento. Todos cuelgan de .mm-inner, que coincide con
  // la capa (ambos cubren el menu entero).
  function caja(sel, hasta){
    var el = menu.querySelector(sel);
    var fin = hasta ? menu.querySelector(hasta) : el;
    if(!el || !fin) return null;
    return { x:el.offsetLeft, y:el.offsetTop, w:el.offsetWidth, h:fin.offsetTop + fin.offsetHeight - el.offsetTop };
  }

  // Un hueco al azar para el destello. Solo en las franjas libres de la pantalla (entre el
  // logo y la lista, y entre la lista y el boton): nunca detras del texto. Si la franja es
  // baja, el destello se achica hasta caber; si ni asi cabe (con un minimo), no sale.
  function ubicar(f){
    var W = capa.clientWidth;
    var barra = caja('.mm-top');
    var lista = caja('.mm-item:first-child', '.mm-item:last-child');   // .mm-links ocupa todo el hueco, no sirve
    var boton = caja('.mm-actions');
    if(!barra || !lista || !boton) return null;
    var franjas = [
      { y0:barra.y + barra.h + 10, y1:lista.y - 10 },
      { y0:lista.y + lista.h + 10, y1:boton.y - 10 }
    ];
    // Lo que de verdad ocupa, por cada unidad de ancho: de la estrella mas alta (o el borde alto
    // del arte) a la mas baja (o el borde bajo del arte). El arte va centrado en .35 (ver --at).
    var ys = f.s.map(function(s){ return s[1] / 100; });
    var alto = Math.min(Math.min.apply(null, ys), 0.35 - 0.5 / f.ar);
    var bajo = Math.max(Math.max.apply(null, ys), 0.35 + 0.5 / f.ar);
    var k = bajo - alto;
    var base = W * (f.ar >= 2 ? 0.34 : 0.22);
    var minimo = W * 0.16;
    // Franjas en orden al azar.
    if(Math.random() < 0.5) franjas.reverse();
    for(var j = 0; j < franjas.length; j++){
      var fr = franjas[j];
      var w = Math.round(Math.min(base, (fr.y1 - fr.y0) / k));
      if(w < minimo) continue;
      var h = Math.round(w * k);
      for(var i = 0; i < 12; i++){
        var x = Math.round(rand(W * 0.04, W - w - W * 0.04));
        var y = Math.round(rand(fr.y0, fr.y1 - h));   // y = borde alto de lo visible
        if(!activos.some(function(a){ return pisa(x, y, w, h, a.caja, 10); })){
          return { x:x, y:y, w:w, h:h, top:Math.round(y - alto * w) };
        }
      }
    }
    return null;
  }

  function armar(f, caja, dur){
    var el = document.createElement('div');
    el.className = 'mm-spark';
    el.style.setProperty('--x', caja.x + 'px');
    el.style.setProperty('--y', caja.top + 'px');
    el.style.setProperty('--w', caja.w + 'px');
    el.style.setProperty('--rot', rand(-6, 6).toFixed(1) + 'deg');
    el.style.setProperty('--dur', dur + 'ms');
    var cielo = document.createElement('span');
    cielo.className = 'mm-spark-sky';
    var svg = lib.trazar(f);
    // Las estrellas se encienden una tras otra, siguiendo el trazo de las lineas.
    Array.prototype.forEach.call(svg.querySelectorAll('circle'), function(c, i){
      c.style.setProperty('--sd', (i * 45) + 'ms');
    });
    cielo.appendChild(svg);
    var img = document.createElement('img');
    img.className = 'mm-spark-art';
    img.src = f.arte; img.alt = ''; img.decoding = 'async';
    cielo.appendChild(img);
    el.appendChild(cielo);
    return el;
  }

  function quitar(a){
    var i = activos.indexOf(a);
    if(i > -1) activos.splice(i, 1);
    if(a.el.parentNode) a.el.parentNode.removeChild(a.el);
  }

  function lanzar(){
    if(activos.length >= MAX) return;
    var f = elegir();
    if(!f) return;
    var caja = ubicar(f);
    if(!caja) return;
    var dur = Math.round(rand(4200, 5600));
    var a = { f:f, el:armar(f, caja, dur), caja:caja, t:0 };
    ultimo = f;
    capa.appendChild(a.el);
    activos.push(a);
    if(reduced) return;   // con movimiento reducido quedan quietos mientras el menu siga abierto
    a.t = window.setTimeout(function(){ quitar(a); }, dur + 120);
  }

  function ciclo(){
    lanzar();
    cola = window.setTimeout(ciclo, rand(900, 1700));
  }

  function precargar(){
    if(precargado) return;
    precargado = true;
    fauna.forEach(function(f){ var i = new Image(); i.src = f.arte; });
  }

  function iniciar(){
    precargar();
    if(reduced){ for(var i = 0; i < MAX; i++) lanzar(); return; }
    ciclo();
  }
  function detener(){
    window.clearTimeout(cola); cola = null;
    activos.slice().forEach(function(a){ window.clearTimeout(a.t); quitar(a); });
    ultimo = null;
  }

  var abierto = false;
  new MutationObserver(function(){
    var ahora = menu.classList.contains('open');
    if(ahora === abierto) return;
    abierto = ahora;
    if(abierto) iniciar(); else detener();
  }).observe(menu, { attributes:true, attributeFilter:['class'] });
})();
