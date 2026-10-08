/* Carrusel "conectado" de La tostadora / El perfil / Los lotes. Version en JavaScript
   simple del CalendlyCarousel (connected-carousel.tsx): la tarjeta activa, grande, con
   texto y foto; a cada lado una tarjeta angosta que solo asoma su foto, unidas a la
   central por una muesca. Avanza solo cada 6 s (la pestaña activa se llena mientras
   tanto), con flechas del teclado, tocando una tarjeta lateral o deslizando.

   Los textos salen de la grilla .roast-grid del HTML, que queda como respaldo si este
   archivo no carga. La foto de cada paso va en el atributo data-foto de su .roast-step;
   mientras este vacio se muestra un espacio reservado. */
(function(){
  var grid = document.querySelector('.roast-grid');
  if(!grid) return;
  var pasos = Array.prototype.map.call(grid.querySelectorAll('.roast-step'), function(el){
    var num = el.querySelector('.roast-num'), h = el.querySelector('h3'), p = el.querySelector('.desc');
    return {
      num: num ? num.textContent.trim() : '',
      titulo: h ? h.textContent.trim() : '',
      texto: p ? p.textContent.trim() : '',
      foto: el.getAttribute('data-foto') || '',
      alt: el.getAttribute('data-foto-alt') || (h ? h.textContent.trim() : '')
    };
  });
  var total = pasos.length;
  if(total < 2) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INTERVALO = 6000;
  var NS = 'http://www.w3.org/2000/svg';
  var MUESCA = 'M0 0C0 0 1.2422 13.5759 10 13.5759C18.7578 13.5759 20 0 20 0V37.3338C20 37.3338 18.7578 23.7578 10 23.7578C1.2422 23.7578 0 37.3338 0 37.3338V0Z';

  // ---------------------------------------------------------------- estructura
  var root = document.createElement('div');
  root.className = 'roast-carousel';
  root.setAttribute('role', 'region');
  root.setAttribute('aria-roledescription', 'carrusel');
  root.setAttribute('aria-label', 'Cómo tostamos');
  root.tabIndex = 0;
  var panel = document.createElement('div');
  panel.className = 'rc-panel';
  panel.id = 'rcPanel';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-live', 'polite');
  var tabs = document.createElement('div');
  tabs.className = 'rc-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Pasos del tueste');
  root.appendChild(panel);
  root.appendChild(tabs);
  grid.parentNode.insertBefore(root, grid.nextSibling);
  grid.classList.add('is-enhanced');   // la grilla se oculta: el carrusel la reemplaza

  var barras = [];
  pasos.forEach(function(p, i){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'rc-tab';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', 'rcPanel');
    b.setAttribute('aria-label', 'Paso ' + p.num + ': ' + p.titulo);
    var fill = document.createElement('i');
    b.appendChild(fill);
    b.addEventListener('click', function(){ irA(i); });
    tabs.appendChild(b);
    barras.push(b);
  });

  // Foto real si el paso la tiene; si no, el espacio reservado para ponerla.
  function foto(p, chica){
    var box = document.createElement('div');
    box.className = 'rc-photo';
    if(p.foto){
      var img = document.createElement('img');
      img.src = p.foto; img.alt = chica ? '' : p.alt; img.draggable = false;
      img.loading = 'lazy'; img.decoding = 'async';
      box.appendChild(img);
      return box;
    }
    box.classList.add('is-empty');
    box.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.6"/></svg>' +
      (chica ? '' : '<span>Foto: ' + p.titulo + '</span>');
    if(!chica) box.setAttribute('role', 'img'), box.setAttribute('aria-label', 'Espacio para la foto de ' + p.titulo.toLowerCase());
    else box.setAttribute('aria-hidden', 'true');
    return box;
  }

  function muesca(lado){
    var d = document.createElement('div');
    d.className = 'rc-notch rc-notch--' + lado;
    d.setAttribute('aria-hidden', 'true');
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 20 37.3338');
    svg.setAttribute('preserveAspectRatio', 'none');
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', MUESCA);
    svg.appendChild(path);
    d.appendChild(svg);
    return d;
  }

  function crearTarjeta(vi){
    var p = pasos[((vi % total) + total) % total];
    var c = document.createElement('div');
    c.className = 'rc-card';
    c.appendChild(muesca('der'));        // asoma por la derecha de la tarjeta de la izquierda
    c.appendChild(muesca('izq'));        // y por la izquierda de la de la derecha
    var clip = document.createElement('div');
    clip.className = 'rc-clip';

    var thumb = document.createElement('div');
    thumb.className = 'rc-thumb';
    thumb.appendChild(foto(p, true));
    var tn = document.createElement('span');
    tn.className = 'rc-thumb-num';
    tn.textContent = p.num;
    thumb.appendChild(tn);

    var wrap = document.createElement('div');
    wrap.className = 'rc-content-wrap';
    var content = document.createElement('div');
    content.className = 'rc-content';
    var texto = document.createElement('div');
    texto.className = 'rc-text';
    texto.innerHTML =
      '<h3></h3><p class="rc-quote"></p>' +
      '<div class="rc-pills"><span class="rc-pill rc-pill--num"></span>' +
      '<svg class="rc-pill-link" viewBox="0 -2 14 12" width="14" height="10" preserveAspectRatio="none" aria-hidden="true"><path d="M0 -2 V0 C0 0 5.09091 0.49688 5.09091 4 C5.09091 7.50312 0 8 0 8 V10 H14 V8 C14 8 8.90909 7.50312 8.90909 4 C8.90909 0.49688 14 0 14 0 V-2 Z"/></svg>' +
      '<span class="rc-pill rc-pill--tag">El tueste</span></div>';
    texto.querySelector('h3').textContent = p.titulo;
    texto.querySelector('.rc-quote').textContent = p.texto;
    texto.querySelector('.rc-pill--num').textContent = 'Paso ' + p.num + ' / ' + String(total).padStart(2, '0');
    var media = document.createElement('div');
    media.className = 'rc-media';
    media.appendChild(foto(p, false));
    content.appendChild(texto);
    content.appendChild(media);
    wrap.appendChild(content);

    clip.appendChild(thumb);
    clip.appendChild(wrap);
    c.appendChild(clip);
    c.addEventListener('click', function(){
      var off = vi - page;
      if(off !== 0 && !arrastro) mover(off);
    });
    return c;
  }

  // ---------------------------------------------------------------- geometria
  // Mismas proporciones que el original, pero medidas sobre el ancho real del panel
  // (no de la ventana) para que encajen dentro del contenedor de la seccion.
  var dim = null;
  function medir(){
    var W = panel.clientWidth;
    if(W >= 960){
      var lado = 105, gap = 20;
      var aw = Math.min(762, W - 2 * (lado + gap) - 24);
      dim = { tier:'desktop', aw:aw, ah:470, sw:lado, sh:344, gap:gap };
    } else if(W >= 760){
      dim = { tier:'tablet', aw:Math.min(560, W - 2 * (84 + 16) - 16), ah:440, sw:84, sh:330, gap:16 };
    } else {
      dim = { tier:'mobile', aw:Math.min(340, W - 56), ah:500, sw:60, sh:410, gap:14 };
    }
    // Texto y foto lado a lado solo si la tarjeta es ancha; si no, uno sobre otro.
    // Se decide por el ancho real del panel, no por el de la ventana.
    root.classList.toggle('is-stacked', dim.tier === 'mobile');
    panel.style.height = (dim.ah + 56) + 'px';   // aire para la sombra de la tarjeta
    root.style.setProperty('--rc-aw', dim.aw + 'px');
    root.style.setProperty('--rc-ah', dim.ah + 'px');
  }

  function variante(off){
    var d = dim;
    if(off === 0) return { x:-d.aw / 2, y:-d.ah / 2, w:d.aw, h:d.ah, o:1 };
    if(off === -1) return { x:-d.aw / 2 - d.gap - d.sw, y:-d.sh / 2, w:d.sw, h:d.sh, o:1 };
    if(off === 1) return { x:d.aw / 2 + d.gap, y:-d.sh / 2, w:d.sw, h:d.sh, o:1 };
    // Fuera de escena: esperan (o se van) un poco mas alla, invisibles. Con solo tres
    // pasos, mostrar mas tarjetas a los lados repetiria las mismas.
    var lejos = d.aw / 2 + d.gap + d.sw + 40 + (Math.abs(off) - 2) * 80;
    return { x: off < 0 ? -lejos - d.sw : lejos, y:-d.sh / 2, w:d.sw, h:d.sh, o:0 };
  }

  // ---------------------------------------------------------------- render
  var page = 0, cards = {};
  function aplicar(c, off){
    var v = variante(off);
    c.style.transform = 'translate3d(' + v.x.toFixed(1) + 'px,' + v.y.toFixed(1) + 'px,0)';
    c.style.width = v.w + 'px';
    c.style.height = v.h + 'px';
    c.style.opacity = v.o;
    c.classList.toggle('is-active', off === 0);
    c.classList.toggle('is-left', off === -1);
    c.classList.toggle('is-right', off === 1);
    c.classList.toggle('is-away', Math.abs(off) > 1);
    // La tarjeta central se desliza fuera hacia el lado contrario al que se va.
    c.style.setProperty('--rc-shift', (off === 0 ? 0 : off < 0 ? -1 : 1) * (dim.aw + 60) + 'px');
    c.setAttribute('aria-hidden', off === 0 ? 'false' : 'true');
  }

  function render(sinAnimar){
    for(var off = -3; off <= 3; off++){
      var vi = page + off;
      if(!cards[vi]){
        var c = crearTarjeta(vi);
        c.classList.add('no-anim');
        panel.appendChild(c);
        cards[vi] = c;
        aplicar(c, off < 0 ? -3 : off > 0 ? 3 : 0);
        void c.offsetWidth;            // fija la posicion de partida antes de animar
        if(!sinAnimar) c.classList.remove('no-anim');
      }
    }
    Object.keys(cards).forEach(function(k){
      var vi = +k, off = vi - page, c = cards[vi];
      if(Math.abs(off) > 3){ c.remove(); delete cards[vi]; return; }
      if(sinAnimar) c.classList.add('no-anim');
      aplicar(c, off);
    });
    if(sinAnimar){
      void panel.offsetWidth;
      Object.keys(cards).forEach(function(k){ cards[k].classList.remove('no-anim'); });
    }
    var activo = ((page % total) + total) % total;
    barras.forEach(function(b, i){
      var sel = i === activo;
      b.classList.toggle('is-current', sel);
      b.setAttribute('aria-selected', String(sel));
      b.tabIndex = sel ? 0 : -1;
      b.firstChild.style.transform = 'scaleX(0)';
    });
  }

  // ---------------------------------------------------------------- avance
  var elapsed = 0, last = null, raf = null, enVista = false, pausa = false;
  function mover(delta){
    elapsed = 0; last = null;
    page += delta;
    render(false);
  }
  function irA(i){
    var activo = ((page % total) + total) % total;
    var diff = i - activo;
    if(diff > total / 2) diff -= total; else if(diff < -total / 2) diff += total;
    if(diff) mover(diff);
  }

  function paso(t){
    raf = null;
    if(!puedeAvanzar()){ last = null; return; }
    if(last === null) last = t;
    elapsed += t - last;
    last = t;
    if(elapsed >= INTERVALO){ mover(1); }
    var b = barras[((page % total) + total) % total];
    if(b) b.firstChild.style.transform = 'scaleX(' + Math.min(elapsed / INTERVALO, 1).toFixed(4) + ')';
    raf = requestAnimationFrame(paso);
  }
  function puedeAvanzar(){ return !reduced && enVista && !pausa && !document.hidden; }
  function arrancar(){ if(!raf && puedeAvanzar()) raf = requestAnimationFrame(paso); }

  // Se detiene mientras el mouse esta encima o el foco esta dentro: el texto no se
  // cambia mientras alguien lo lee.
  root.addEventListener('mouseenter', function(){ pausa = true; });
  root.addEventListener('mouseleave', function(){ pausa = false; last = null; arrancar(); });
  root.addEventListener('focusin', function(){ pausa = true; });
  root.addEventListener('focusout', function(e){
    if(!root.contains(e.relatedTarget)){ pausa = false; last = null; arrancar(); }
  });
  document.addEventListener('visibilitychange', function(){ last = null; arrancar(); });
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){
      enVista = e[0].isIntersecting;
      last = null;
      arrancar();
    }, { threshold:0.35 }).observe(root);
  } else { enVista = true; }

  root.addEventListener('keydown', function(e){
    if(e.key === 'ArrowLeft'){ e.preventDefault(); mover(-1); }
    else if(e.key === 'ArrowRight'){ e.preventDefault(); mover(1); }
  });

  // ---------------------------------------------------------------- gestos
  // Deslizar con el dedo o arrastrar con el mouse cambia de paso. El scroll vertical
  // de la pagina sigue libre (touch-action: pan-y en el panel).
  var x0 = null, y0 = 0, arrastro = false, pid = null;
  panel.addEventListener('pointerdown', function(e){
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    x0 = e.clientX; y0 = e.clientY; arrastro = false; pid = e.pointerId;
  });
  panel.addEventListener('pointermove', function(e){
    if(x0 === null || e.pointerId !== pid) return;
    var dx = e.clientX - x0;
    if(!arrastro && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - y0)){
      arrastro = true;
      panel.classList.add('is-dragging');
      try{ panel.setPointerCapture(pid); }catch(_){}
    }
  });
  function soltar(e){
    if(x0 === null || e.pointerId !== pid) return;
    var dx = e.clientX - x0;
    x0 = null;
    panel.classList.remove('is-dragging');
    if(arrastro && Math.abs(dx) > 40) mover(dx < 0 ? 1 : -1);
    // El click que sigue a un arrastre no debe contar como toque en una tarjeta.
    if(arrastro) setTimeout(function(){ arrastro = false; }, 0);
  }
  panel.addEventListener('pointerup', soltar);
  panel.addEventListener('pointercancel', function(e){ if(e.pointerId === pid){ x0 = null; arrastro = false; panel.classList.remove('is-dragging'); } });
  panel.addEventListener('dragstart', function(e){ e.preventDefault(); });

  var rt = null;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(function(){ var a = dim && dim.aw; medir(); if(dim.aw !== a) render(true); }, 120);
  });

  medir();
  render(true);
  arrancar();
})();
