/* Vida del desierto: lo que se mueve SOLO, sin depender del scroll.
     - Cielo: estrellas fugaces cada pocos segundos y destellos que titilan.
     - Cactus de caricatura: dos asomados tras el boton del hero y los del primer plano
       del desierto. Respiran, saltan, bailan y tiemblan como gelatina.
     - Primer plano (assets/peru): rafagas con polvo que cruza el suelo y la silueta de un
       zorro que sale de la duna, mira al cursor y se esconde si te acercas.
   desert-scene.js sigue a cargo del armado por scroll; esto vive encima y no lo toca. */
(function(){
  var desert = document.getElementById('desert');
  var stage  = document.getElementById('skyStage');
  if(!desert || !stage) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  function rand(a, b){ return a + Math.random() * (b - a); }
  function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }

  // ============================================================== cielo
  var skyFx = document.getElementById('skyFx');
  var stageVisible = true;

  function sembrarDestellos(){
    if(!skyFx) return;
    var vh = window.innerHeight;
    var n = window.innerWidth < 760 ? 8 : 16;
    for(var i = 0; i < n; i++){
      var s = document.createElement('span');
      s.className = 'twinkle';
      // A los lados, no detras del titular: un destello sobre la letra distrae.
      var lado = Math.random() < 0.5 ? rand(3, 24) : rand(76, 97);
      s.style.left = lado + '%';
      s.style.top = Math.round(rand(0.06, 0.95) * vh) + 'px';
      s.style.setProperty('--s', Math.round(rand(14, 28)) + 'px');
      s.style.setProperty('--t', rand(2.6, 5.2).toFixed(2) + 's');
      s.style.setProperty('--delay', rand(0, 5).toFixed(2) + 's');
      skyFx.appendChild(s);
    }
  }

  function estrellaFugaz(){
    if(!skyFx) return;
    var r = desert.getBoundingClientRect();
    var vh = window.innerHeight;
    var visTop = Math.max(0, -r.top);
    // Solo en cielo abierto: la mitad alta de lo que se ve, y nunca a la altura de las
    // mesetas, que en el tramo final ocupan el ultimo tercio de la escena.
    var y = visTop + rand(0.04, 0.42) * vh;
    if(y > r.height - vh * 0.9) return;
    var s = document.createElement('span');
    s.className = 'shooting-star';
    var largo = rand(170, 300);
    s.style.left = rand(30, 95) + '%';
    s.style.top = Math.round(y) + 'px';
    s.style.setProperty('--len', Math.round(largo) + 'px');
    s.style.setProperty('--ang', Math.round(rand(200, 228)) + 'deg');
    s.style.setProperty('--dist', -Math.round(rand(420, 700)) + 'px');
    s.style.setProperty('--dur', rand(1.1, 1.7).toFixed(2) + 's');
    s.addEventListener('animationend', function(){ s.remove(); });
    skyFx.appendChild(s);
  }

  var fugazTimer = null;
  function programarFugaz(espera){
    window.clearTimeout(fugazTimer);
    fugazTimer = window.setTimeout(function(){
      if(stageVisible && !document.hidden){
        estrellaFugaz();
        // De vez en cuando, dos seguidas: la lluvia de estrellas tambien sorprende.
        if(Math.random() < 0.22) window.setTimeout(estrellaFugaz, rand(250, 600));
      }
      programarFugaz(rand(2600, 6500));
    }, espera);
  }

  if(!reduced){
    sembrarDestellos();
    programarFugaz(1400);
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){ stageVisible = e[0].isIntersecting; }).observe(stage);
  }


  // ============================================================== personajes
  // Cactus de caricatura. Cada uno es un juego de resortes:
  //   - inclinacion (a): brisa, rafagas, bailecito y empujones del cursor
  //   - aplastado/estirado (s): respira, se encoge antes de saltar, se estira en el
  //     aire, se aplasta al caer y tiembla como gelatina despues
  //   - salto (y): fisica real con gravedad, para que el arco se sienta de dibujo animado
  var G = 2400;                       // gravedad de los saltos, px/s2
  var puntero = { x:-1e4, y:-1e4, t:-10 };
  function ahora(){ return performance.now() / 1000; }

  function Toon(el, o){
    this.el = el;
    this.amp = o.amp == null ? 1 : o.amp;
    this.hopH = o.hopH || 34;
    this.a = 0; this.va = 0;          // inclinacion
    this.s = 0; this.vs = 0;          // aplastado (-) / estirado (+)
    this.y = 0; this.vy = 0; this.aire = false; this.v0 = 1;
    this.antic = 0; this.altoSalto = this.hopH;
    this.baile = 0;
    this.fase = rand(0, Math.PI * 2);
    this.x = 0.5;
  }
  // Salto con anticipacion: primero se agacha, despues sale disparado.
  Toon.prototype.saltar = function(alto){
    if(this.aire || this.antic > 0) return;
    this.antic = 0.13;
    this.altoSalto = alto || this.hopH;
  };
  // Sale desde abajo (escondido) y aterriza en su sitio: la entrada de los del boton.
  Toon.prototype.lanzar = function(desdeY, alto){
    this.y = desdeY; this.aire = true;
    this.v0 = Math.sqrt(2 * G * (desdeY + alto));
    this.vy = -this.v0;
    this.vs += 4;
  };
  // Empujon: se inclina hacia un lado y tiembla como gelatina.
  Toon.prototype.boing = function(dir, fuerza){
    this.va += dir * fuerza * 90;
    this.vs -= fuerza * 6;
  };
  Toon.prototype.bailar = function(dur){ this.baile = dur; };

  Toon.prototype.paso = function(dt, t, empuje){
    // --- inclinacion
    var lean = (Math.sin(t * 0.9 + this.fase) * 0.6 + Math.sin(t * 0.37 + this.fase * 2) * 0.4) * 1.6 * this.amp;
    var sT = Math.sin(t * 2.6 + this.fase) * 0.03;          // respira
    if(this.baile > 0){
      this.baile -= dt;
      // Bailecito: vaiven rapido de cadera, bajando un poco en cada golpe de ritmo.
      lean += Math.sin(t * 12) * 8;
      sT += -Math.abs(Math.sin(t * 12)) * 0.1 + 0.05;
    }
    // --- salto
    if(this.antic > 0){
      this.antic -= dt;
      sT = -0.24;
      if(this.antic <= 0){
        this.aire = true;
        this.v0 = Math.sqrt(2 * G * this.altoSalto);
        this.vy = -this.v0;
        this.vs += 6;
      }
    }
    if(this.aire){
      this.vy += G * dt;
      this.y += this.vy * dt;
      // Rapido = estirado, en la cima = normal: es la regla basica del dibujo animado.
      sT = Math.min(Math.abs(this.vy) / this.v0, 1) * 0.2;
      if(this.y >= 0 && this.vy > 0){
        this.y = 0; this.aire = false;
        this.vs -= 7 + Math.min(this.vy / 160, 4);           // aterriza aplastado
        this.va += (Math.random() - 0.5) * 30;
        this.vy = 0;
      }
    }
    var acc = 26 * (lean - this.a) - 3.4 * this.va + (empuje || 0);
    this.va += acc * dt;
    this.a = clamp(this.a + this.va * dt, -16, 16);
    // Resorte del aplastado: rigido y poco amortiguado, para que rebote como gelatina.
    var accS = 260 * (sT - this.s) - 9 * this.vs;
    this.vs += accS * dt;
    this.s = clamp(this.s + this.vs * dt, -0.38, 0.38);

    this.el.style.transform = 'translateY(' + this.y.toFixed(1) + 'px) skewX(' + (-this.a).toFixed(2) +
      'deg) scale(' + (1 - this.s * 0.6).toFixed(4) + ',' + (1 + this.s).toFixed(4) + ')';
  };


  function toonsDe(raiz, base){
    return [].slice.call(raiz.querySelectorAll('.toon')).map(function(el){
      return new Toon(el, {
        amp: el.hasAttribute('data-sway') ? parseFloat(el.getAttribute('data-sway')) : base.amp,
        hopH: base.hopH
      });
    }).map(function(tn){
      tn.puedeSaltar = tn.el.hasAttribute('data-hop');
      tn.puedeBailar = tn.el.hasAttribute('data-dance');
      return tn;
    });
  }

  // ---------------------------------------------- puntero
  var grupos = [];                    // cada grupo: { toons, activo, alPuntero }
  var ultimoX = null;
  window.addEventListener('pointermove', function(e){
    var vx = ultimoX == null ? 0 : e.clientX - ultimoX;
    ultimoX = e.clientX;
    puntero.x = e.clientX; puntero.y = e.clientY; puntero.t = ahora();
    for(var g = 0; g < grupos.length; g++){
      if(!grupos[g].activo) continue;
      var ts = grupos[g].toons;
      // Pasar el cursor por un cactus lo empuja hacia donde iba, y queda temblando.
      for(var i = 0; i < ts.length; i++){
        var r = ts[i].el.getBoundingClientRect();
        if(e.clientX > r.left && e.clientX < r.right && e.clientY > r.top + r.height * 0.1 && e.clientY < r.bottom){
          if(Math.abs(vx) > 2) ts[i].boing(vx > 0 ? 1 : -1, Math.min(Math.abs(vx) / 30, 1));
        }
      }
    }
  }, { passive:true });

  // ---------------------------------------------- motor: un solo bucle para todo
  var raf = null, tPrev = 0, reloj = 0;
  var tareas = [];                    // funciones (dt, t) que corren mientras su grupo este activo
  function motor(ts){
    var dt = tPrev ? Math.min((ts - tPrev) / 1000, 0.05) : 0.016;
    tPrev = ts;
    reloj += dt;
    var alguno = false;
    for(var i = 0; i < tareas.length; i++){
      if(tareas[i].grupo.activo){ alguno = true; tareas[i].fn(dt, reloj); }
    }
    raf = alguno && !document.hidden ? requestAnimationFrame(motor) : null;
  }
  function despertar(){
    if(!raf && !document.hidden){ tPrev = 0; raf = requestAnimationFrame(motor); }
  }
  function vigilar(grupo, el, margen){
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(e){
        grupo.activo = e[0].isIntersecting;
        if(grupo.activo) despertar();
      }, { rootMargin:(margen || 0) + 'px 0px' }).observe(el);
    } else {
      grupo.activo = true; despertar();
    }
  }
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) despertar(); });

  // ============================================================== cactus del boton
  (function(){
    var wrap = document.getElementById('ctaWrap');
    if(!wrap) return;
    var cta = wrap.querySelector('.hero-cta');
    var toons = toonsDe(wrap, { amp:0.5, hopH:22 });
    if(!toons.length) return;
    if(reduced) return;

    var grupo = { toons:toons, activo:true };
    grupos.push(grupo);
    var entro = false, inicio = null, proximo = 0, turno = 0, hover = false, sigHop = 0;

    // Escondidos tras el boton hasta su entrada.
    toons.forEach(function(tn){ tn.y = tn.el.offsetHeight || 70; tn.el.style.transform = 'translateY(' + tn.y + 'px)'; });

    if(cta){
      cta.addEventListener('pointerenter', function(){
        hover = true;
        toons.forEach(function(tn, i){ tn.saltar(16 + i * 8); });
      });
      cta.addEventListener('pointerleave', function(){ hover = false; });
      // Al hacer clic, saltan de alegria antes de que la pagina baje.
      cta.addEventListener('pointerdown', function(){
        toons.forEach(function(tn, i){ tn.antic = 0; tn.aire = false; tn.y = 0; tn.saltar(46 + i * 10); });
      });
    }

    tareas.push({ grupo:grupo, fn:function(dt, t){
      if(inicio == null) inicio = t;
      // Entran cuando el boton ya llego (ver la entrada del hero en el CSS).
      if(!entro && t - inicio > 1.9){
        entro = true;
        toons.forEach(function(tn, i){
          window.setTimeout(function(){ tn.lanzar(tn.y, 26); }, i * 260);
        });
        proximo = t + 3.5;
      }
      if(entro){
        if(hover){
          // Con el cursor encima no paran de saltar, por turnos.
          if(t > sigHop){ toons[turno % toons.length].saltar(14 + Math.random() * 10); turno++; sigHop = t + 0.32; }
        } else if(t > proximo){
          var tn = toons[turno % toons.length];
          turno++;
          // Repertorio: saltito, doble saltito o bailecito.
          var r = Math.random();
          if(r < 0.45) tn.saltar();
          else if(r < 0.75){ tn.saltar(14); window.setTimeout(function(){ tn.saltar(24); }, 420); }
          else tn.bailar(1.2);
          proximo = t + rand(2.2, 4.5);
        }
      }
      for(var i = 0; i < toons.length; i++) toons[i].paso(dt, t, 0);
    }});
    vigilar(grupo, wrap, 100);
  })();

  // ============================================================== primer plano
  var cast = document.getElementById('desertCast');
  if(!cast) return;
  var near = desert.querySelector('.d-near');
  var dustCanvas = document.getElementById('desertDust');
  var dctx = dustCanvas && dustCanvas.getContext ? dustCanvas.getContext('2d') : null;
  var foxBox = document.getElementById('foxBox');
  var foxSil = foxBox && foxBox.querySelector('.fox-sil');

  if(reduced){
    cast.classList.add('is-in');
    // Quieto, pero con el zorro sentado a la vista: sin animacion no hay escondite.
    if(foxSil) foxSil.style.transform = 'none';
    return;
  }
  cast.setAttribute('data-anim', '1');

  var plantas = toonsDe(cast, { amp:1, hopH:38 });
  var grupoDesierto = { toons:plantas, activo:false };
  grupos.push(grupoDesierto);

  function medirPlantas(){
    var cr = cast.getBoundingClientRect();
    plantas.forEach(function(p){
      var r = p.el.getBoundingClientRect();
      p.x = cr.width ? (r.left + r.width / 2 - cr.left) / cr.width : 0.5;
    });
  }

  // Rafaga: un frente que cruza de izquierda a derecha. Fuerza segun lo cerca que pase.
  var rafaga = null;            // { t0, dur, fuerza }
  var proximaRafaga = 0;
  function frenteRafaga(t){
    if(!rafaga) return -9;
    var k = (t - rafaga.t0) / rafaga.dur;
    if(k > 1){ rafaga = null; return -9; }
    return -0.2 + k * 1.4;
  }

  // ---------------------------------------------- polvo
  var motas = [];
  var DW = 0, DH = 0;
  function medirPolvo(){
    if(!dustCanvas) return;
    var r = dustCanvas.getBoundingClientRect();
    DW = dustCanvas.width  = Math.max(1, Math.round(r.width * dpr));
    DH = dustCanvas.height = Math.max(1, Math.round(r.height * dpr));
  }
  function mota(empuje){
    return {
      x: empuje ? rand(-0.15, 0.05) * DW : rand(0, DW),
      y: DH - rand(10, empuje ? 150 : 90) * dpr,
      vx: (empuje ? rand(260, 520) : rand(8, 26)) * dpr,
      vy: rand(-14, -2) * dpr,
      r: rand(1, empuje ? 3.2 : 1.8) * dpr,
      vida: 0, dura: empuje ? rand(1.6, 3) : rand(4, 8),
      fase: rand(0, 6.28),
      racha: empuje
    };
  }
  function pintarPolvo(dt){
    if(!dctx) return;
    dctx.clearRect(0, 0, DW, DH);
    // Unas pocas motas flotan siempre, cerca del suelo, a la deriva.
    while(motas.length < 18) motas.push(mota(false));
    for(var i = motas.length - 1; i >= 0; i--){
      var m = motas[i];
      m.vida += dt;
      m.x += m.vx * dt;
      m.y += (m.vy + Math.sin(m.vida * 2 + m.fase) * 10 * dpr) * dt;
      var k = m.vida / m.dura;
      if(k >= 1 || m.x > DW + 20){ motas.splice(i, 1); continue; }
      var alfa = Math.sin(Math.PI * k) * (m.racha ? 0.85 : 0.6);
      dctx.fillStyle = 'rgba(255,222,172,' + alfa.toFixed(3) + ')';
      dctx.beginPath();
      dctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      dctx.fill();
      // Las de la rafaga dejan estela: es lo que hace leer "viento" y no solo puntos.
      if(m.racha){
        var largo = m.vx * 0.06;
        var g = dctx.createLinearGradient(m.x - largo, m.y, m.x, m.y);
        g.addColorStop(0, 'rgba(255,222,172,0)');
        g.addColorStop(1, 'rgba(255,222,172,' + (alfa * 0.6).toFixed(3) + ')');
        dctx.strokeStyle = g;
        dctx.lineWidth = m.r * 1.2;
        dctx.beginPath();
        dctx.moveTo(m.x - largo, m.y);
        dctx.lineTo(m.x, m.y);
        dctx.stroke();
      }
    }
  }

  // ---------------------------------------------- zorro
  // Sale del suelo, se sienta y mira hacia el cursor; si te acercas (o le haces clic) se
  // hunde de golpe en la duna. Al rato vuelve a asomar. Es del mismo color que el suelo,
  // asi que al bajar se funde con el y no queda ningun corte a la vista.
  var zorro = { estado:'oculto', t:0, espera:1.4, alto:0, giro:0, miedo:false, rapido:false };

  function easeOutBack(k){ var c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }
  function easeIn(k){ return k * k * k; }

  function centroZorro(){
    var r = foxBox.getBoundingClientRect();
    return { x:r.left + r.width / 2, y:r.top + r.height * 0.4 };
  }

  function pasoZorro(dt, t){
    if(!foxSil) return;
    var z = zorro;
    z.t += dt;
    switch(z.estado){
      case 'oculto':
        if(z.t > z.espera){ z.estado = 'sube'; z.t = 0; }
        break;
      case 'sube':
        z.alto = easeOutBack(clamp(z.t / 0.7, 0, 1));
        if(z.t >= 0.7){ z.estado = 'sentado'; z.t = 0; z.espera = rand(5, 9); }
        break;
      case 'sentado':
        z.alto = 1;
        if(z.t > z.espera || z.miedo){ z.estado = 'baja'; z.t = 0; z.rapido = z.miedo; z.miedo = false; }
        break;
      case 'baja':
        var dur = z.rapido ? 0.25 : 0.6;
        z.alto = 1 - easeIn(clamp(z.t / dur, 0, 1));
        if(z.t >= dur){
          z.alto = 0; z.estado = 'oculto'; z.t = 0;
          // Asustado tarda mas en volver, y los cactus se sobresaltan con el.
          z.espera = z.rapido ? rand(3, 5) : rand(2, 4);
          if(z.rapido) plantas.forEach(function(p){ p.saltar(18); });
        }
        break;
    }

    // Mira hacia el cursor ladeando el cuerpo; si nadie lo mueve, otea a su ritmo.
    var objetivo;
    if(ahora() - puntero.t < 2.5){
      var c = centroZorro();
      objetivo = clamp((puntero.x - c.x) / 500, -1, 1) * 6;
      var dx = puntero.x - c.x, dy = puntero.y - c.y;
      if(z.estado === 'sentado' && dx * dx + dy * dy < 170 * 170) z.miedo = true;
    } else {
      objetivo = Math.sin(t * 0.6) * 4 + Math.sin(t * 1.7) * 1.5;
    }
    z.giro += (objetivo - z.giro) * Math.min(1, dt * 5);
    var respira = z.estado === 'sentado' ? Math.sin(t * 2.4) * 0.012 : 0;
    foxSil.style.transform = 'translateY(' + ((1 - z.alto) * 100).toFixed(2) + '%) rotate(' +
      z.giro.toFixed(2) + 'deg) scaleY(' + (1 + respira).toFixed(4) + ')';
  }

  // Clic sobre el zorro: se esconde de golpe.
  document.addEventListener('click', function(e){
    if(zorro.estado !== 'sentado' || !foxBox) return;
    var r = foxBox.getBoundingClientRect();
    if(e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom){
      zorro.miedo = true;
    }
  });

  // ---------------------------------------------- escena del desierto
  var brotado = false, proximaFuncion = 0;

  function pegarAlSuelo(){
    // Copia el desplazamiento vertical que desert-scene.js le da a las dunas cercanas.
    if(!near) return 0;
    var m = /translate3d\(\s*0(?:px)?\s*,\s*(-?[\d.]+)px/.exec(near.style.transform || '');
    var y = m ? parseFloat(m[1]) : 0;
    cast.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0)';
    return y;
  }

  tareas.push({ grupo:grupoDesierto, fn:function(dt, t){
    var falta = pegarAlSuelo();
    // Brota cuando a las dunas les queda poco por subir.
    if(!brotado && near && falta <= near.offsetHeight * 0.45){
      brotado = true;
      cast.classList.add('is-in');
      medirPlantas();
      proximaRafaga = t + 2.2;
      proximaFuncion = t + 1.4;
      zorro.espera = 1.8; zorro.t = 0;
    }
    if(!brotado) return;

    if(!rafaga && t > proximaRafaga){
      rafaga = { t0:t, dur:rand(1.5, 2.2), fuerza:rand(70, 130) };
      proximaRafaga = t + rand(7, 12);
      for(var n = 0; n < 44; n++) motas.push(mota(true));
      plantas.forEach(function(p){ p.golpeado = false; });
    }
    // Cada tanto, uno de los cactus hace su numero: salto o bailecito.
    if(t > proximaFuncion){
      var p = plantas[Math.floor(Math.random() * plantas.length)];
      if(p){
        if(p.puedeSaltar && Math.random() < 0.6){ p.saltar(); window.setTimeout(function(){ p.saltar(22); }, 480); }
        else if(p.puedeBailar) p.bailar(rand(1.2, 2));
        else p.saltar(20);
      }
      proximaFuncion = t + rand(2.5, 5);
    }

    var frente = frenteRafaga(t);
    var i;
    for(i = 0; i < plantas.length; i++){
      var pl = plantas[i];
      var golpe = 0, d = Math.abs(pl.x - frente);
      if(rafaga && d < 0.18){
        golpe = rafaga.fuerza * (1 - d / 0.18) * pl.amp;
        // Cuando la rafaga lo alcanza, ademas de inclinarse se encoge del golpe.
        if(!pl.golpeado){ pl.golpeado = true; pl.vs -= 4; }
      }
      pl.paso(dt, t, golpe);
    }

    pasoZorro(dt, t);
    pintarPolvo(dt);
  }});
  vigilar(grupoDesierto, cast, 150);

  var resizeT;
  window.addEventListener('resize', function(){
    window.clearTimeout(resizeT);
    resizeT = window.setTimeout(function(){ medirPolvo(); medirPlantas(); }, 150);
  });
  medirPolvo();
})();
