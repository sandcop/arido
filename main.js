(function(){
  document.getElementById('year').textContent = new Date().getFullYear();

  // Rendimiento: las animaciones CSS infinitas de cada zona grande (estrellas que titilan,
  // la luna, el lema que corre, la galería de eventos…) se congelan mientras esa zona no
  // está en pantalla (.en-pausa en styles.css) y siguen donde quedaron al volver. Con un
  // margen de 150 px, para que ya estén en marcha cuando asoman.
  if('IntersectionObserver' in window){
    var ioPausa = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ e.target.classList.toggle('en-pausa', !e.isIntersecting); });
    }, { rootMargin:'150px 0px' });
    document.querySelectorAll('.hero, #nosotros, #desert, #tueste, #especial').forEach(function(z){ ioPausa.observe(z); });
  }

  // Menu movil. Al abrir, una curva (#menuOverlay, un path SVG) sube desde abajo y cubre la
  // pantalla; detras aparece el menu y la curva sigue de largo hacia arriba descubriendolo.
  // Al cerrar, lo mismo de arriba hacia abajo. Sin animaciones si el dispositivo lo pide.
  var burger = document.getElementById('burgerBtn');
  var closeBtn = document.getElementById('closeMenuBtn');
  var menu = document.getElementById('mobileMenu');
  var overlayPath = document.querySelector('#menuOverlay path');
  var menuReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var menuOpen = false, menuBusy = false;
  var P = {
    abajo:     'M 0 100 V 100 Q 50 100 100 100 V 100 z',
    subeCurva: 'M 0 100 V 50 Q 50 0 100 50 V 100 z',
    llenoB:    'M 0 100 V 0 Q 50 0 100 0 V 100 z',
    llenoT:    'M 0 0 V 100 Q 50 100 100 100 V 0 z',
    sigue:     'M 0 0 V 50 Q 50 0 100 50 V 0 z',
    arriba:    'M 0 0 V 0 Q 50 0 100 0 V 0 z',
    bajaCurva: 'M 0 0 V 50 Q 50 100 100 50 V 0 z',
    sale:      'M 0 100 V 50 Q 50 100 100 50 V 100 z'
  };
  function nums(d){ return d.match(/-?\d+(\.\d+)?/g).map(Number); }
  function dibujar(n){
    overlayPath.setAttribute('d', 'M ' + n[0] + ' ' + n[1] + ' V ' + n[2] + ' Q ' + n[3] + ' ' + n[4] + ' ' + n[5] + ' ' + n[6] + ' V ' + n[7] + ' z');
  }
  var easeIn = function(t){ return t * t * t; };
  var easeOut = function(t){ return 1 - Math.pow(1 - t, 3); };
  // Recorre una lista de tramos [desde, hasta, ms, curva] y luego llama a `fin`.
  function morph(tramos, fin){
    if(!tramos.length){ if(fin) fin(); return; }
    var t = tramos[0], a = nums(t[0]), b = nums(t[1]), t0 = null;
    requestAnimationFrame(function paso(ts){
      if(t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / t[2]), e = t[3](k);
      dibujar(a.map(function(v, i){ return v + (b[i] - v) * e; }));
      if(k < 1) requestAnimationFrame(paso); else morph(tramos.slice(1), fin);
    });
  }
  function mostrarMenu(si){
    menu.classList.toggle('open', si);
    document.body.classList.toggle('menu-open', si);
    burger.setAttribute('aria-expanded', si ? 'true' : 'false');
  }
  function abrir(){
    if(menuOpen || menuBusy) return;
    menuOpen = true;
    if(menuReduced || !overlayPath){ mostrarMenu(true); menu.classList.add('is-shown'); closeBtn.focus(); return; }
    menuBusy = true;
    morph([[P.abajo, P.subeCurva, 280, easeIn], [P.subeCurva, P.llenoB, 220, easeOut]], function(){
      mostrarMenu(true);
      dibujar(nums(P.llenoT));
      morph([[P.llenoT, P.sigue, 280, easeIn], [P.sigue, P.arriba, 220, easeOut]], function(){
        menuBusy = false;
      });
      menu.classList.add('is-shown');
      closeBtn.focus();
    });
  }
  // `despues` corre con la pantalla tapada: ahi se salta a la seccion elegida.
  function cerrar(despues, sinAnimar){
    if(!menuOpen || menuBusy) return;
    menuOpen = false;
    if(sinAnimar || menuReduced || !overlayPath){
      menu.classList.remove('is-shown'); mostrarMenu(false);
      if(despues) despues(); else burger.focus({ preventScroll:true });
      return;
    }
    menuBusy = true;
    morph([[P.arriba, P.bajaCurva, 280, easeIn], [P.bajaCurva, P.llenoT, 220, easeOut]], function(){
      menu.classList.remove('is-shown');
      mostrarMenu(false);
      if(despues) despues();
      dibujar(nums(P.llenoB));
      morph([[P.llenoB, P.sale, 280, easeIn], [P.sale, P.abajo, 220, easeOut]], function(){
        menuBusy = false;
        if(!despues) burger.focus({ preventScroll:true });
      });
    });
  }
  burger.setAttribute('aria-expanded', 'false');
  burger.addEventListener('click', abrir);
  closeBtn.addEventListener('click', function(){ cerrar(); });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(e){
      var href = a.getAttribute('href') || '';
      if(href.charAt(0) !== '#'){ cerrar(null, true); return; }   // externos: se van ya
      var destino = document.querySelector(href);
      if(!destino) return;
      e.preventDefault();
      cerrar(function(){
        destino.scrollIntoView({ behavior:'instant', block:'start' });
        if(history.pushState) history.pushState(null, '', href);
      });
    });
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && menuOpen) cerrar();
  });
  // Si la pantalla se ensancha con el menu abierto (girar el telefono), se cierra sin mas.
  var anchoMenu = window.matchMedia('(min-width: 761px)');
  var alAnchoMenu = function(){ if(anchoMenu.matches && menuOpen){ menuBusy = false; dibujar(nums(P.abajo)); cerrar(null, true); } };
  if(anchoMenu.addEventListener) anchoMenu.addEventListener('change', alAnchoMenu); else anchoMenu.addListener(alAnchoMenu);

  // Nav sits low (aligned with the hero frame) at the top, then tucks up higher once scrolled.
  // It only hides once you've scrolled past the hero, sliding away (not fading);
  // scrolling up brings it back immediately.
  var navEl = document.getElementById('nav');
  var navHeroSection = document.getElementById('top');
  var lastScrollY = window.scrollY;
  // Al recargar a media pagina la barra debe nacer ya condensada, no esperar al primer scroll.
  navEl.classList.toggle('nav-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', function(){
    var currentScrollY = window.scrollY;
    navEl.classList.toggle('nav-scrolled', currentScrollY > 40);
    var pastHero = currentScrollY > navHeroSection.offsetHeight;
    if(pastHero && currentScrollY > lastScrollY){
      navEl.classList.add('nav-hidden');
    } else {
      navEl.classList.remove('nav-hidden');
    }
    lastScrollY = currentScrollY;
  }, { passive:true });

  // "¿Qué es cada tipo?": desplegable del filtro de cafes. Cerrado por defecto; se cierra
  // al tocar fuera o con Escape, como cualquier menu desplegable.
  var tipos = document.querySelector('.type-info');
  if(tipos){
    document.addEventListener('click', function(e){
      if(tipos.open && !tipos.contains(e.target)) tipos.open = false;
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && tipos.open){ tipos.open = false; tipos.querySelector('summary').focus(); }
    });
  }

  // Aparecer al hacer scroll, de abajo hacia arriba, y volver a hacerlo cada vez que el
  // elemento reentra: al bajar, al subir y al retroceder. Al salir por completo de la
  // pantalla se esconde de nuevo (ya no se ve, asi que no hay parpadeo) y queda listo para
  // la proxima entrada. Los hermanos que entran juntos salen en cascada.
  var revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lote = 0;
  var io = null;
  if(reducedMotion || !('IntersectionObserver' in window)){
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  } else {
    io = new IntersectionObserver(function(entries){
      lote++;
      entries.forEach(function(entry){
        var el = entry.target;
        if(entry.intersectionRatio >= 0.15){
          if(el.classList.contains('is-visible')) return;
          var parent = el.parentElement;
          if(parent._lote !== lote){ parent._lote = lote; parent._n = 0; }
          el.style.transitionDelay = (parent._n++ * 0.12) + 's';
          el.classList.add('is-visible');
        } else if(!entry.isIntersecting && el.classList.contains('is-visible')){
          el.style.transitionDelay = '0s';
          el.classList.remove('is-visible');
        }
      });
    }, { threshold:[0, 0.15], rootMargin:'0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  }
  // Para los elementos que se crean despues con JS (p. ej. el carrusel del tueste).
  window.observarReveal = function(el){
    el.classList.add('reveal');
    if(io) io.observe(el); else el.classList.add('is-visible');
  };

  // Counter animation
  var counters = document.querySelectorAll('[data-count]');
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var startTime = null;
        var duration = 1200;
        function step(ts){
          if(!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if(progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      }
    });
  }, { threshold:0.5 });
  counters.forEach(function(el){ cio.observe(el); });

})();
