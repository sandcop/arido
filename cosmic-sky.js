/* Cielo cosmico del hero y "Nuestro origen": estrellas de colores que titilan, destellos
   de cuatro puntas, un leve desplazamiento con el mouse y estrellas fugaces. Version en
   JavaScript simple del CosmicStarfield de space-login.tsx.

   Un solo <canvas> del alto de la ventana, no del alto de todo el cielo (que mide varias
   pantallas): se mantiene a la vista desplazandolo dentro de #desert y dibuja solo las
   estrellas que caen en ese tramo. Las estrellas avanzan al 55% del scroll, como la capa
   de estrellas que reemplaza, para que se lean lejanas; y se apagan hacia el horizonte,
   donde el cielo se aclara. */
(function(){
  var canvas = document.getElementById('cosmicSky');
  var stage  = document.getElementById('skyStage');
  if(!canvas || !stage || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var PARALLAX = 0.55;                // fraccion del scroll que recorren las estrellas
  var COLORS = ['#ffffff', '#e0f2fe', '#fdf4ff', '#fbcfe8', '#bae6fd'];

  var W = 0, VH = 0, stageH = 0, campoH = 0;
  var stars = [], shooting = [];
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  var tick = 0, raf = null, visible = true, offset = 0;

  function medir(){
    W = window.innerWidth;
    VH = window.innerHeight;
    stageH = stage.offsetHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(VH * dpr);
    canvas.style.height = VH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Alto del campo de estrellas: lo que se ve al empezar + lo que recorren con el scroll.
    var nuevoCampo = VH + Math.max(0, stageH - VH) * PARALLAX;
    if(Math.abs(nuevoCampo - campoH) > 40 || !stars.length) sembrar(nuevoCampo);
  }

  // Misma densidad que el original (una estrella cada 3200 px2), sobre todo el campo.
  function sembrar(h){
    campoH = h;
    stars = [];
    var n = Math.floor((W * campoH) / 3200);
    for(var i = 0; i < n; i++){
      var sparkle = Math.random() < 0.08;
      var base = sparkle ? 0.6 + Math.random() * 0.4 : 0.2 + Math.random() * 0.7;
      stars.push({
        x: Math.random() * W,
        y: Math.random() * campoH,
        size: sparkle ? Math.random() * 1.8 + 1.2 : Math.random() * 1.3 + 0.5,
        base: base,
        speed: 0.008 + Math.random() * 0.02,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        sparkle: sparkle
      });
    }
  }

  // Posicion del cielo respecto de la ventana: el lienzo se queda pegado arriba de la
  // pantalla mientras el cielo este a la vista, sin salirse de el por abajo.
  function seguirScroll(){
    var top = stage.getBoundingClientRect().top;
    offset = Math.max(0, Math.min(-top, stageH - VH));
    canvas.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
  }

  // Las estrellas se apagan en el ultimo tramo, donde el cielo se aclara hacia el horizonte.
  function brilloAltura(yEnCielo){
    var k = yEnCielo / stageH;
    return k <= 0.58 ? 1 : k >= 0.86 ? 0 : 1 - (k - 0.58) / 0.28;
  }

  function dibujarEstrella(s, x, y, alpha){
    ctx.globalAlpha = alpha;
    ctx.fillStyle = s.color;
    if(s.sparkle){
      var r = s.size * 2.2;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r * 0.25, y - r * 0.25);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x + r * 0.25, y + r * 0.25);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r * 0.25, y + r * 0.25);
      ctx.lineTo(x - r, y);
      ctx.lineTo(x - r * 0.25, y - r * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, s.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function quizasFugaz(){
    if(Math.random() < 0.012 && shooting.length < 2){
      var y = Math.random() * VH * 0.5;
      // Solo en cielo oscuro: nunca sobre el resplandor del horizonte.
      if(brilloAltura(offset + y) < 0.6) return;
      shooting.push({
        x: Math.random() * W, y: y,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 9 + 7,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        life: 1
      });
    }
  }

  function dibujar(animar){
    if(animar){
      tick++;
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;
    }
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, VH);
    var desde = offset * PARALLAX;     // tramo del campo que cae en pantalla
    for(var i = 0; i < stars.length; i++){
      var s = stars[i];
      var y = s.y - desde;
      if(y < -10 || y > VH + 10) continue;
      var luz = brilloAltura(offset + y);
      if(luz <= 0) continue;
      var a = animar ? s.base + Math.sin(tick * s.speed + i) * 0.35 : s.base;
      a = Math.max(0.1, Math.min(1, a)) * luz;
      dibujarEstrella(s, s.x + mx * s.size * 0.8, y + my * s.size * 0.8, a);
    }
    if(!animar) return;
    quizasFugaz();
    ctx.lineWidth = 1.4;
    for(var j = shooting.length - 1; j >= 0; j--){
      var f = shooting[j];
      f.x += Math.cos(f.angle) * f.speed;
      f.y += Math.sin(f.angle) * f.speed;
      f.life -= 0.015;
      if(f.life <= 0 || f.x > W + 100 || f.y > VH + 100){ shooting.splice(j, 1); continue; }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,' + (f.life * 0.8).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.lineTo(f.x - Math.cos(f.angle) * f.length, f.y - Math.sin(f.angle) * f.length);
      ctx.stroke();
    }
  }

  function cuadro(){
    seguirScroll();
    dibujar(true);
    raf = (visible && !document.hidden) ? requestAnimationFrame(cuadro) : null;
  }
  function arrancar(){ if(!reduced && !raf && visible && !document.hidden) raf = requestAnimationFrame(cuadro); }

  window.addEventListener('mousemove', function(e){
    tmx = (e.clientX - W / 2) * 0.03;
    tmy = (e.clientY - VH / 2) * 0.03;
  }, { passive:true });

  var rt = null;
  function alCambiarTamano(){
    window.clearTimeout(rt);
    rt = window.setTimeout(function(){ medir(); seguirScroll(); if(reduced) dibujar(false); }, 120);
  }
  window.addEventListener('resize', alCambiarTamano);
  if('ResizeObserver' in window) new ResizeObserver(alCambiarTamano).observe(stage);

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){
      visible = e[0].isIntersecting;
      if(visible) arrancar();
    }).observe(stage);
  }
  document.addEventListener('visibilitychange', arrancar);

  medir();
  seguirScroll();
  if(reduced){
    // Sin animacion: un cielo quieto, redibujado solo al hacer scroll.
    dibujar(false);
    window.addEventListener('scroll', function(){ seguirScroll(); dibujar(false); }, { passive:true });
  } else {
    arrancar();
  }
})();
