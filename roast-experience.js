/* "El tueste" — narrativa del tueste + exploración de producto.
   Sin dependencias nuevas: mismo stack que el resto del sitio (JS plano y canvas 2D).

   ┌──────────────────────────────────────────────────────────────────────────┐
   │  EDITA AQUÍ LOS TRES CAFÉS. Es el único sitio donde vive esta            │
   │  información: el HTML no la repite en ningún lado.                       │
   └──────────────────────────────────────────────────────────────────────────┘

   Convención del proyecto: un texto entre corchetes — "[ALGO — PENDIENTE]" — se pinta
   en el estilo de dato pendiente, igual que en la sección Contacto. Sustituye el
   corchete por el texto real y el estilo desaparece solo.

   packageImage / backgroundImage aceptan null. Con null se dibuja una bolsa vectorial
   y un fondo degradado a partir de `accent`. En cuanto pongas la ruta de un render
   ("assets/packs/colombia.png") se usa esa imagen sin tocar nada más.

   meters: valores de 0 a 5, o null si aún no están definidos. Con null se pintan los
   cinco puntos huecos y la etiqueta "por definir" — nunca un número inventado.
   Ejemplo cuando los tengas:  meters: { tueste: 3, acidez: 4, cuerpo: 3 }
*/
(function(){

  var COFFEES = [
    {
      // Datos tomados literalmente de la etiqueta de cada bolsa. Nada inferido: lo que la
      // etiqueta no dice queda entre corchetes.
      id: 'peru',
      name: 'Perú',
      subtitle: 'Panela · Manzana roja · Chocolate',
      description: 'Caturra-Catuai de la finca Kivinaki, en Chanchamayo. Proceso lavado, con notas de panela, manzana roja y chocolate.',
      tastingNotes: ['Panela', 'Manzana roja', 'Chocolate'],
      facts: [
        { label: 'Región',   value: 'Chanchamayo, Perú' },
        { label: 'Finca',    value: 'Kivinaki' },
        { label: 'Cultivar', value: 'Caturra-Catuai' },
        { label: 'Proceso',  value: 'Lavado' },
        { label: 'Tipo',     value: 'Café tipo 1' },
        { label: 'Altitud',  value: '[ALTITUD — PENDIENTE]' }
      ],
      meters: { tueste: null, acidez: null, cuerpo: null },
      accent: '#E4611E',
      packageImage: 'assets/peru/bolsa.webp',
      backgroundImage: null,
      scene: {
        // Fondo y bolsa van en dos PNG separados del mismo lienzo (1672x941, igual que
        // la escena anterior): bolsa-roca.png es solo el recorte de la bolsa sobre su
        // roca, transparente en el resto. Al compartir lienzo, la capa de la bolsa
        // (.scene-bag) usa el mismo --scene-size/--scene-pos que el fondo y se recorta
        // y reposiciona exactamente igual en cualquier ancho, sin coordenadas propias.
        image: 'assets/peru/fondo.png',
        bagImage: 'assets/peru/bolsa-roca.png',
        size: 'cover',
        focus: '0% 50%',
        // Silueta de la roca medida sobre el render actual (bolsa-roca.png), columna a
        // columna por transparencia: sube desde el suelo a la izquierda (0.478, donde
        // empieza a haber algo pintado) hasta la meseta donde se apoyan el zorro y la
        // bolsa. Entre 0.574 y 0.716 el zorro tapa la roca (se ve su cabeza, no la
        // piedra); esos dos puntos intermedios estan interpolados a ojo entre lo que se
        // ve justo antes y justo despues del zorro, no medidos pixel a pixel.
        surface: [[0.478,0.990],[0.520,0.952],[0.550,0.901],[0.574,0.876],[0.650,0.855],
                  [0.716,0.825],[0.833,0.830],[0.950,0.859],[0.975,0.867],[0.999,0.876]],
        // Medida sobre el render actual: la bolsa ocupa de 71.6% a 95% del ancho del
        // lienzo (pegada al canto derecho a proposito) y su pie se apoya sobre la roca
        // a una altura de, aprox., 83-86% del alto del lienzo.
        bag: { x0:0.716, x1:0.950, y:0.84 },
        // Antes de 0.478 no hay roca (el recorte quedo transparente ahi, se ve el
        // desierto de fondo.png): sin sentido dejar caer granos mas alla de donde
        // arranca la piedra.
        flat: [0.541, 1.00]
      }
    },
    {
      id: 'bolivia',
      name: 'Bolivia',
      subtitle: 'Huesillo · Cacao nibs · Té negro',
      description: 'Caturra y Pache de Caramani. Proceso lavado, con notas de huesillo, cacao nibs y té negro.',
      tastingNotes: ['Huesillo', 'Cacao nibs', 'Té negro'],
      facts: [
        { label: 'Región',   value: 'Caramani, Bolivia' },
        { label: 'Cultivar', value: 'Caturra & Pache' },
        { label: 'Proceso',  value: 'Lavado' },
        { label: 'Tipo',     value: 'Café tipo 1' },
        { label: 'Finca',    value: '[FINCA — PENDIENTE]' },
        { label: 'Altitud',  value: '[ALTITUD — PENDIENTE]' }
      ],
      meters: { tueste: null, acidez: null, cuerpo: null },
      accent: '#A9633F',
      packageImage: 'assets/bolivia/bolsa.webp',
      backgroundImage: null,
      scene: {
        image: 'assets/bolivia/escena.webp',
        size: 'cover',
        focus: '0% 50%',
        surface: [[0.00,0.940],[0.12,0.910],[0.20,0.875],[0.29,0.846],[0.38,0.832],
                  [0.55,0.828],[0.72,0.826],[0.82,0.838],[0.92,0.872],[1.00,0.905]],
        bag: { x0:0.400, x1:0.685, y:0.832 },
        flat: [0.30, 0.82]
      }
    },
    {
      id: 'brasil',
      name: 'Brasil',
      subtitle: 'Chocolate · Miel · Caramelo',
      description: 'Catuai amarillo de Minas Gerais. Proceso natural, con notas de chocolate, miel y caramelo.',
      tastingNotes: ['Chocolate', 'Miel', 'Caramelo'],
      facts: [
        { label: 'Región',   value: 'Minas Gerais, Brasil' },
        { label: 'Cultivar', value: 'Catuai amarillo' },
        { label: 'Proceso',  value: 'Natural' },
        { label: 'Tipo',     value: 'Café tipo 1' },
        { label: 'Finca',    value: '[FINCA — PENDIENTE]' },
        { label: 'Altitud',  value: '[ALTITUD — PENDIENTE]' }
      ],
      meters: { tueste: null, acidez: null, cuerpo: null },
      accent: '#C9992B',
      packageImage: 'assets/brasil/bolsa.webp',
      backgroundImage: null,
      scene: {
        image: 'assets/brasil/escena.webp',
        size: 'cover',
        focus: '0% 50%',
        surface: [[0.00,0.915],[0.12,0.890],[0.22,0.865],[0.32,0.850],[0.42,0.844],
                  [0.60,0.841],[0.74,0.844],[0.85,0.862],[0.94,0.892],[1.00,0.915]],
        bag: { x0:0.420, x1:0.685, y:0.844 },
        flat: [0.31, 0.82]
      }
    },
    {
      // OJO: la etiqueta de este render trae los datos de Brasil —dice "Región: Minas
      // Gerais" y repite sus mismas notas—, asi que esos campos NO se han copiado: poner
      // Minas Gerais bajo Colombia seria publicar un dato falso. Quedan pendientes hasta
      // que llegue la etiqueta corregida. La descripcion y las notas son las que la propia
      // web ya usaba para este cafe.
      id: 'colombia',
      name: 'Colombia',
      subtitle: 'Dulce · Equilibrado · Final limpio',
      description: 'Notas dulces y equilibradas de los valles cafeteros colombianos, con cuerpo suave y un final limpio.',
      tastingNotes: ['Dulce', 'Equilibrado', 'Cuerpo suave', 'Final limpio'],
      facts: [
        { label: 'Origen',   value: 'Colombia' },
        { label: 'Tipo',     value: 'Café tipo 1' },
        { label: 'Región',   value: '[REGIÓN — PENDIENTE]' },
        { label: 'Cultivar', value: '[CULTIVAR — PENDIENTE]' },
        { label: 'Proceso',  value: '[PROCESO — PENDIENTE]' },
        { label: 'Altitud',  value: '[ALTITUD — PENDIENTE]' }
      ],
      meters: { tueste: null, acidez: null, cuerpo: null },
      accent: '#C4552B',
      packageImage: 'assets/colombia/bolsa.webp',
      backgroundImage: null,
      scene: {
        image: 'assets/colombia/escena.webp',
        size: 'cover',
        focus: '0% 50%',
        // Trazadas sobre el render del 10-09 (1536x1024), que no lleva lienzo anadido.
        // OJO con la cota: el detector de nitidez encuentra la cresta de roca en 0.71,
        // pero esa es un risco del fondo. La bolsa apoya en 0.802, casi un 10% mas abajo,
        // sobre una repisa mas cercana. La superficie tiene que seguir ESE plano —el de
        // apoyo—, no la cresta, o los granos se posan flotando muy por encima de la bolsa.
        surface: [[0.00,0.845],[0.10,0.818],[0.20,0.800],[0.30,0.792],[0.40,0.793],
                  [0.50,0.799],[0.60,0.802],[0.70,0.803],[0.80,0.800],[0.90,0.796],
                  [1.00,0.800]],
        bag: { x0:0.502, x1:0.745, y:0.802 },
        // Arranca en 0.15: por la izquierda de ahi ya es vegetacion desenfocada, no piedra.
        flat: [0.15, 0.93]
      }
    },
    {
      id: 'costa-rica',
      name: 'Costa Rica',
      subtitle: 'Caña de azúcar · Frutos secos',
      description: 'Caturra y Catuai del Valle Occidental. Proceso lavado, con notas de caña de azúcar y frutos secos.',
      tastingNotes: ['Caña de azúcar', 'Frutos secos'],
      facts: [
        { label: 'Región',   value: 'Valle Occidental, Costa Rica' },
        { label: 'Cultivar', value: 'Caturra · Catuai' },
        { label: 'Proceso',  value: 'Lavado' },
        { label: 'Tipo',     value: 'Café tipo 1' },
        { label: 'Finca',    value: '[FINCA — PENDIENTE]' },
        { label: 'Altitud',  value: '[ALTITUD — PENDIENTE]' }
      ],
      meters: { tueste: null, acidez: null, cuerpo: null },
      accent: '#2E7A8C',
      packageImage: 'assets/costa-rica/bolsa.webp',
      backgroundImage: null,
      scene: {
        image: 'assets/costa-rica/escena.webp',
        size: 'cover',
        focus: '0% 50%',
        surface: [[0.00,0.825],[0.10,0.798],[0.20,0.778],[0.32,0.766],[0.46,0.759],
                  [0.58,0.756],[0.72,0.760],[0.84,0.776],[0.94,0.802],[1.00,0.825]],
        bag: { x0:0.535, x1:0.805, y:0.758 },
        flat: [0.26, 0.85]
      }
    }
  ];

  // ---------------------------------------------------------------- utilidades
  var section = document.getElementById('tueste');
  if(!section) return;

  var stage    = document.getElementById('productStage');
  var backBtn  = document.getElementById('prodBack');
  if(!stage) return;

  // El marcado trae hidden para que sin JS la ficha no se vea. A partir de aquí la
  // visibilidad la gobierna la clase is-open y el hueco se conserva siempre, así la
  // sección no cambia de alto al abrir ni al cerrar.
  stage.removeAttribute('hidden');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PENDING = /^\[.*\]$/;

  function isPending(v){ return typeof v === 'string' && PENDING.test(v.trim()); }

  // Escribe un valor aplicando el estilo de pendiente cuando toca.
  function put(el, value){
    if(!el) return;
    el.textContent = value == null ? '' : value;
    el.classList.toggle('is-pending', isPending(value));
  }

  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  }

  // Bolsa vectorial de reserva: se usa mientras no haya render del packaging. Toma el
  // color de `accent`, así cada café se distingue sin necesidad de imagen.
  function bagSVG(c){
    var label = isPending(c.name) ? '' : c.name;
    return '<svg class="pack-svg" viewBox="0 0 220 300" role="img" aria-label="Bolsa de café ' + esc(label) + '">' +
      '<defs>' +
        '<linearGradient id="pg-' + c.id + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#2A211B"/>' +
          '<stop offset="0.5" stop-color="#141010"/>' +
          '<stop offset="1" stop-color="#0B0908"/>' +
        '</linearGradient>' +
        '<linearGradient id="pl-' + c.id + '" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="' + c.accent + '" stop-opacity="0.16"/>' +
          '<stop offset="1" stop-color="' + c.accent + '" stop-opacity="0.42"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path d="M28 44h164v226a14 14 0 0 1-14 14H42a14 14 0 0 1-14-14z" fill="url(#pg-' + c.id + ')"/>' +
      '<path d="M28 44h164v18H28z" fill="#000" opacity="0.45"/>' +
      '<rect x="46" y="22" width="128" height="26" rx="5" fill="#1B1512"/>' +
      '<rect x="46" y="22" width="128" height="26" rx="5" fill="' + c.accent + '" opacity="0.22"/>' +
      '<rect x="28" y="108" width="164" height="96" fill="url(#pl-' + c.id + ')"/>' +
      '<rect x="28" y="108" width="164" height="1.5" fill="' + c.accent + '" opacity="0.55"/>' +
      '<rect x="28" y="202" width="164" height="1.5" fill="' + c.accent + '" opacity="0.55"/>' +
      '<text x="110" y="150" text-anchor="middle" fill="#FDFBF4" opacity="0.92" font-family="Merriweather, serif" font-size="26">ÁRIDO</text>' +
      '<text x="110" y="180" text-anchor="middle" fill="' + c.accent + '" font-family="Montserrat, sans-serif" font-size="13" letter-spacing="3">' +
        esc(isPending(c.name) ? 'CAFÉ' : c.name.toUpperCase()) + '</text>' +
      '<ellipse cx="110" cy="286" rx="88" ry="9" fill="#000" opacity="0.30"/>' +
    '</svg>';
  }

  function packMarkup(c, cls){
    if(c.packageImage){
      return '<img src="' + esc(c.packageImage) + '" alt="Bolsa de café ' +
             esc(isPending(c.name) ? '' : c.name) + '" class="' + cls +
             '" loading="lazy" decoding="async">';
    }
    return bagSVG(c);
  }

  function bgValue(c){
    if(c.backgroundImage) return 'url("' + c.backgroundImage + '")';
    // Reserva: un halo cálido del color del café sobre el fondo del sitio.
    return 'radial-gradient(120% 90% at 72% 18%, ' + c.accent + '2E 0%, ' +
           c.accent + '10 38%, rgba(255,255,255,0) 72%)';
  }

  // ------------------------------------------------------------- estado actual
  var current = 0;

  // ------------------------------------------------------------- grilla de cafés
  var gridTrack   = document.getElementById('coffeeGridTrack');
  var gridDots    = document.getElementById('coffeeGridDots');
  var cards = [];

  function buildGrid(){
    if(!gridTrack) return;
    gridTrack.innerHTML = COFFEES.map(function(c, i){
      return '<button type="button" class="coffee-card" data-i="' + i + '" aria-pressed="false">' +
        '<span class="coffee-card-thumb">' + packMarkup(c, 'coffee-card-thumb-img') +
          '<span class="coffee-card-quickview" aria-hidden="true">Vista rápida</span>' +
        '</span>' +
        '<span class="coffee-card-name' + (isPending(c.name) ? ' is-pending' : '') + '">' + esc(c.name) + '</span>' +
        '<span class="coffee-card-sub' + (isPending(c.subtitle) ? ' is-pending' : '') + '">' + esc(c.subtitle) + '</span>' +
      '</button>';
    }).join('');
    cards = [].slice.call(gridTrack.querySelectorAll('.coffee-card'));
    cards.forEach(function(btn){
      btn.addEventListener('click', function(){
        var i = +btn.getAttribute('data-i');
        // Clic en la ya activa: cierra. En cualquier otra: abre/cambia.
        if(showing && i === current) closeDetail();
        else openDetail(i);
      });
    });
  }
  buildGrid();

  // -------------------------------------------------- puntos del carrusel movil
  var dotButtons = [];
  function buildDots(){
    if(!gridDots) return;
    gridDots.innerHTML = COFFEES.map(function(c, i){
      return '<button type="button" data-i="' + i + '" aria-label="Ver café ' +
        esc(isPending(c.name) ? '' : c.name) + '"></button>';
    }).join('');
    dotButtons = [].slice.call(gridDots.querySelectorAll('button'));
    dotButtons.forEach(function(btn){
      btn.addEventListener('click', function(){
        var card = cards[+btn.getAttribute('data-i')];
        if(card) card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      });
    });
    actualizarDots();
  }

  // Marca activo el punto de la tarjeta mas centrada en el carril visible.
  var dotsTimer = null;
  function actualizarDots(){
    if(!gridTrack || !dotButtons.length || !cards.length) return;
    var centro = gridTrack.getBoundingClientRect().left + gridTrack.clientWidth / 2;
    var masCerca = 0, distMin = Infinity;
    cards.forEach(function(card, i){
      var r = card.getBoundingClientRect();
      var d = Math.abs((r.left + r.width / 2) - centro);
      if(d < distMin){ distMin = d; masCerca = i; }
    });
    dotButtons.forEach(function(btn, i){ btn.classList.toggle('is-on', i === masCerca); });
  }
  if(gridTrack){
    gridTrack.addEventListener('scroll', function(){
      window.clearTimeout(dotsTimer);
      dotsTimer = window.setTimeout(actualizarDots, 80);
    });
  }
  window.addEventListener('resize', function(){
    window.clearTimeout(dotsTimer);
    dotsTimer = window.setTimeout(actualizarDots, 150);
  });

  buildDots();

  // Flechas izquierda/derecha para recorrer las tarjetas (mismo patron que
  // ya usaban arriba/abajo en el panel viejo).
  if(gridTrack){
    gridTrack.addEventListener('keydown', function(e){
      var i = cards.indexOf(document.activeElement);
      if(i < 0) return;
      if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
        e.preventDefault();
        var next = (i + (e.key === 'ArrowRight' ? 1 : cards.length - 1)) % cards.length;
        cards[next].focus();
      }
    });
  }

  // ------------------------------------------------------------ ficha producto
  var elOrigin = document.getElementById('prodOrigin');
  var elName   = document.getElementById('prodName');
  var elSub    = document.getElementById('prodSubtitle');
  var elDesc   = document.getElementById('prodDesc');
  var elNotes  = document.getElementById('prodNotes');
  var elMeters = document.getElementById('prodMeters');
  var elFacts  = document.getElementById('prodFacts');
  var elPack   = document.getElementById('prodPack');
  var elScene  = document.getElementById('prodScene');
  var copy     = document.getElementById('prodCopy');
  var bgLayers = [].slice.call(stage.querySelectorAll('.prod-bg-layer'));
  var bgTurn   = 0;

  // ------------------------------------------------------ formato + WhatsApp
  // Las dos presentaciones son las mismas para los cinco cafés (dato real, no
  // por-café), así que el marcado ya viene escrito en el HTML: aquí solo se
  // cablea el clic y se arma el link de WhatsApp con el café y el tamaño
  // elegidos.
  var elSizeBtns  = [].slice.call(stage.querySelectorAll('.prod-size'));
  var elWhatsapp  = document.getElementById('prodWhatsapp');
  var selectedSize = elSizeBtns.length ? elSizeBtns[0].getAttribute('data-size') : '';

  function actualizarWhatsapp(){
    if(!elWhatsapp) return;
    var c = COFFEES[current];
    var nombre = isPending(c.name) ? 'café' : c.name;
    var texto = '¡Hola! Quiero consultar stock del café ' + nombre + ' (' + selectedSize + ').';
    elWhatsapp.href = 'https://wa.me/56972497925?text=' + encodeURIComponent(texto);
  }

  elSizeBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      selectedSize = btn.getAttribute('data-size');
      elSizeBtns.forEach(function(b){ b.classList.toggle('is-current', b === btn); });
      actualizarWhatsapp();
    });
  });

  function meterMarkup(label, value){
    var dots = '';
    for(var i = 1; i <= 5; i++){
      dots += '<span class="dot' + (value != null && i <= value ? ' is-on' : '') + '"></span>';
    }
    return '<div class="meter">' +
      '<span class="meter-label">' + label + '</span>' +
      '<span class="meter-dots" role="img" aria-label="' + label + ': ' +
        (value == null ? 'por definir' : value + ' de 5') + '">' + dots + '</span>' +
      (value == null ? '<span class="meter-todo">por definir</span>' : '') +
    '</div>';
  }

  function factsMarkup(list){
    return (list || []).map(function(f){
      return '<div class="fact"><dt>' + esc(f.label) + '</dt>' +
             '<dd class="' + (isPending(f.value) ? 'is-pending' : '') + '">' + esc(f.value) + '</dd></div>';
    }).join('');
  }

  // ---------------------------------------------------------------- escena
  // Decorado por capas: cada elemento entra en su propio momento, del fondo al
  // primer plano, y luego deriva con el scroll a la velocidad que le marque su
  // profundidad. Es el mismo principio que la escena del desierto de "Nuestro
  // origen", pero disparado por la selección de café en vez de por el scroll.
  var sceneOn = false;

  // ------------------------------------------------------- granos sobre la escena
  // Caen alrededor de la bolsa y se posan en el canto de la roca del render. La
  // superficie no se adivina: viene del perfil trazado sobre la imagen, y se traduce a
  // pixeles reproduciendo en JS el mismo recorte `cover` que hace el CSS con el fondo.
  var sceneBeans = (function(){
    var canvas = null, ctx = null, raf = null, ro = null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, geo = null;
    var ultimoW = 0, ultimoH = 0;   // para que medir() sepa si de verdad cambio el tamano
    var granos = [], cubos = [];
    // Columnas anchas a proposito: con muchas y estrechas cada grano caia en la suya y
    // sobre piedra plana quedaban todos a la misma cota, en fila. Anchas, se apilan.
    var COLS = 34, TOTAL = 0;
    var suelo = null;          // altura de reposo por columna, en pixeles de canvas
    var bandas = [];           // tramos de x donde puede caer un grano
    var bagPx = null;          // huella de la bolsa en pixeles de canvas, o null
    var minX = 0;              // ningun grano a la izquierda de aqui (columna de texto)
    var terminado = false;
    var mCache = null;         // el `mapa()` de la ultima vez que se calculo el suelo

    // El mismo render 3D que se usa en las fases: nada de elipses dibujadas a mano.
    var sprite = new Image();
    var spriteOk = false;
    sprite.onload = function(){ spriteOk = true; };
    sprite.src = 'assets/grano.webp';

    // Reproduce background-size:cover + background-position para pasar de coordenadas
    // de imagen (0-1) a pixeles del contenedor.
    function mapa(pos){
      // Medida real de cada render: Colombia viene en 1536x1024 y el resto en 1672x941.
      // Con el numero fijo el mapa de la roca salia desplazado justo en esa.
      var IW = (geo && geo.iw) || 1672, IH = (geo && geo.ih) || 941;
      var k = Math.max(W / IW, H / IH);
      var rw = IW * k, rh = IH * k;
      var p = String(pos || 'center').split(/\s+/);
      function frac(v){
        if(v == null) return 0.5;
        if(v === 'left' || v === 'top') return 0;
        if(v === 'right' || v === 'bottom') return 1;
        if(v === 'center') return 0.5;
        var n = parseFloat(v);
        return isNaN(n) ? 0.5 : n / 100;
      }
      return { x0:(W - rw) * frac(p[0]), y0:(H - rh) * frac(p[1] != null ? p[1] : p[0]),
               rw:rw, rh:rh };
    }

    function interp(pts, u){
      if(u <= pts[0][0]) return pts[0][1];
      for(var i = 1; i < pts.length; i++){
        if(u <= pts[i][0]){
          var a = pts[i-1], b = pts[i];
          var t = (u - a[0]) / ((b[0] - a[0]) || 1);
          return a[1] + (b[1] - a[1]) * t;
        }
      }
      return pts[pts.length-1][1];
    }

    // Desde que la ficha vive en su propia columna (.prod-copy), separada de la caja
    // de imagen (.prod-media), el texto nunca se superpone al escenario -ni apilado
    // en movil ni al lado en escritorio-, asi que no hay nada de lo que esquivar los
    // granos. Se deja la funcion (en vez de quitar la llamada) por si algun dia vuelve
    // a haber una composicion con texto superpuesto.
    function limiteTexto(){
      return 0;
    }

    function calcularSuelo(){
      // La roca, la piedra plana y la bolsa son parte del render de la bolsa
      // (--bag-pos), no del fondo suelto: si el fondo se desplaza mas despacio para dar
      // sensacion de profundidad, los granos tienen que seguir midiendose contra la capa
      // que de verdad pisan.
      var pos = getComputedStyle(elScene).getPropertyValue('--bag-pos').trim();
      var m = mapa(pos);
      mCache = m;   // lo reusa posar() (al asentarse) y reencajarGranos() (al redimensionar)
      suelo = new Float32Array(COLS);
      for(var i = 0; i < COLS; i++){
        var u = (i + 0.5) / COLS;
        var ui = (u * W - m.x0) / m.rw;
        suelo[i] = m.y0 + interp(geo.surface, ui) * m.rh;
      }
      // De imagen a contenedor: la piedra plana menos la huella de la bolsa.
      function aX(ui){ return (m.x0 + ui * m.rw) / W; }
      var f = geo.flat || [0, 1];
      var b = geo.bag;
      var i0 = Math.max(0, aX(f[0])), i1 = Math.min(1, aX(f[1]));
      // Ningun grano debajo de la columna de texto. `flat` va en coordenadas de IMAGEN,
      // y cada render se recorta con una escala distinta, asi que una misma fraccion cae
      // en un sitio u otro de la pantalla: por eso ajustarlo cafe a cafe no aguantaba (en
      // Colombia y Costa Rica el reguero acababa metido bajo la ficha). Este limite se
      // mide en PANTALLA, sobre la caja real del texto, y por tanto vale para los cinco
      // y a cualquier ancho.
      i0 = Math.max(i0, limiteTexto());
      minX = i0 * W;
      bandas = [];
      if(b){
        var b0 = aX(b.x0), b1 = aX(b.x1);
        // cerca: 1 si la bolsa queda al final de la banda (banda izquierda), 0 si queda
        // al principio (banda derecha). Es el extremo hacia el que se apinan.
        var izq, der;
        if(i0 < b0){ izq = [i0, Math.min(b0, i1)]; izq.cerca = 1; bandas.push(izq); }
        if(i1 > b1){ der = [Math.max(b1, i0), i1]; der.cerca = 0; bandas.push(der); }
        // Tercera banda, POR DELANTE de la bolsa. Antes su hueco quedaba excluido y el
        // grano se partia en dos grupos con un vacio en medio, justo donde esta el
        // producto. Los que caen aqui se posan mas abajo (ver DELANTE en reposo) y el
        // canvas va por encima del render, asi que tapan el pie de la bolsa: se leen
        // delante, no detras. Sin sesgo hacia ningun extremo, que aqui reparte parejo.
        var fr = [Math.max(b0, i0), Math.min(b1, i1)];
        fr.cerca = 0.5;
        fr.frente = true;
        if(fr[1] > fr[0]) bandas.push(fr);
        bagPx = [b0 * W, b1 * W];
      } else { bagPx = null; if(i1 > i0){ var u = [i0, i1]; u.cerca = 0; bandas.push(u); } }
      bandas = bandas.filter(function(t){ return t[1] - t[0] > 0.01; });
      if(!bandas.length) bandas = [[0.05, 0.95]];
    }

    // Reparto pegado a la bolsa. Uniforme sobre toda la piedra los granos salian
    // desperdigados y no formaban nada; con este sesgo caen casi todos junto al paquete
    // y se van espaciando hacia fuera, que es como se amontona el grano suelto.
    // Math.pow con exponente > 1 concentra el sorteo cerca de 0, o sea del borde de la
    // bolsa: 0.35 de los casos caen en el primer 12% de la banda.
    var SESGO = 1.7;
    function sorteoX(){
      var total = 0, i;
      for(i = 0; i < bandas.length; i++) total += bandas[i][1] - bandas[i][0];
      if(total <= 0) return W * 0.5;
      var r = Math.random() * total;
      for(i = 0; i < bandas.length; i++){
        var b = bandas[i], ancho = b[1] - b[0];
        if(r < ancho){
          // cerca 0.5 marca la banda de delante: ahi no hay un extremo "pegado a la
          // bolsa" hacia el que apinarse, la bolsa es el fondo entero del tramo.
          if(b.cerca === 0.5) return (b[0] + Math.random() * ancho) * W;
          var t = Math.pow(Math.random(), SESGO);       // 0 = junto a la bolsa
          // b.cerca dice cual de los dos extremos de la banda toca la bolsa.
          return (b.cerca === 1 ? b[1] - t * ancho : b[0] + t * ancho) * W;
        }
        r -= ancho;
      }
      return bandas[0][0] * W;
    }

    function columna(x){
      var i = Math.floor(x / W * COLS);
      return i < 0 ? 0 : i > COLS - 1 ? COLS - 1 : i;
    }
    // Un grano mide una fraccion fija DEL RENDER, no de la pantalla. Atado a pixeles de
    // pantalla salia igual de grande en una banda movil de 390px que en una de 1900, o
    // sea cuatro veces mas grande en proporcion: parecian piedras al lado de la bolsa.
    // El divisor 60 sale de la proporcion real —una bolsa mide unos quince granos de
    // ancho— y reproduce el tamano que ya tenia en escritorio.
    var GRANO = 30;              // lado del grano en pixeles de canvas; lo fija medir()
    var MAX_PILA = 44;           // altura maxima del monton, unas tres capas
    function escalarAlRender(){
      var m = mapa(getComputedStyle(elScene).getPropertyValue('--scene-pos').trim());
      GRANO = Math.max(4, m.rw / 60);
      // Todo lo que depende del grosor del grano se recalcula con el: si no, en movil el
      // tope del monton valia tres capas de escritorio, o sea seis de las de alli.
      MAX_PILA = GRANO * 1.35;
    }
    function enFrente(x){ return bagPx && x > bagPx[0] && x < bagPx[1]; }
    function reposo(x){
      var i = columna(x);
      var frente = enFrente(x);
      // Delante de la bolsa el monton se queda bajo a proposito: creciendo como a los
      // lados treparia por el paquete y taparia la etiqueta.
      var pila = Math.min(cubos[i] || 0, frente ? MAX_PILA * 0.55 : MAX_PILA);
      // Los granos se dibujan por su centro: se hunden media altura para apoyarse en la
      // piedra en lugar de quedar posados sobre una linea invisible.
      var y = suelo[i] - pila + GRANO * 0.4;
      // DELANTE: un escalon hacia abajo, o sea hacia el espectador. Sin el se posan en la
      // misma linea que el pie de la bolsa y no se sabe si estan delante o detras.
      return frente ? y + GRANO * 0.9 : y;
    }

    function nuevo(orden){
      // Se guarda aparte del `s` final: al reencajar tras un resize, GRANO ya es otro y
      // hay que recalcular s = (GRANO/61.6)*sFactor con el GRANO nuevo, no volver a
      // sortear el factor (cada grano tiene que conservar SU tamano relativo de siempre).
      var sFactor = 0.85 + Math.random() * 0.3;
      return {
        x: sorteoX(),
        y: -40 * dpr - Math.random() * H * 0.5,
        vy: (0.8 + Math.random() * 0.9) * dpr,
        vx: (Math.random() - 0.5) * 0.14 * dpr,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.055,
        sFactor: sFactor,
        // 61.6 = sprite.width * 0.14, que es como lo usa dibujar(). Asi `s` acaba
        // valiendo lo que haga falta para que el grano mida GRANO pixeles.
        s: (GRANO / 61.6) * sFactor,
        // El intervalo se DERIVA de TOTAL, no es una constante: asi el reparto de
        // salidas ocupa siempre unos 3,4s caigan 28 granos o 300. Con un intervalo fijo
        // se alargaba solo cada vez que subia la cantidad y habia que reajustarlo a mano.
        // El total hasta que se posa el ultimo es mayor —unos 7s, medidos— porque a eso
        // se suma la caida del ultimo grano, que entra desde bastante arriba del lienzo.
        espera: 200 + orden * (3200 / TOTAL) * (0.6 + Math.random() * 0.8),
        botes: 0,
        posado: false
      };
    }

    // Al tocar, rueda un poco cuesta abajo antes de asentarse: en la parte plana casi no
    // se mueve, pero basta para que no queden todos clavados a la misma altura.
    function rodar(b){
      // Los de delante no ruedan: el escalon de DELANTE es un truco de profundidad, no
      // una cuesta de la piedra, y rodando se escapaban todos a los lados por ella.
      if(enFrente(b.x)) return;
      var paso = Math.max(3, W / COLS * 0.5);
      for(var n = 0; n < 8; n++){
        var y = reposo(b.x);
        var izq = reposo(Math.max(0, b.x - paso));
        var der = reposo(Math.min(W - 1, b.x + paso));
        var mIzq = (izq - y) / paso, mDer = (der - y) / paso;
        if(mIzq > 0.16 && mIzq >= mDer) b.x = Math.max(minX, b.x - paso);
        else if(mDer > 0.16)            b.x = Math.min(W - 1, b.x + paso);
        else break;
      }
    }

    function posar(b){
      rodar(b);
      // Desparrame horizontal ANTES de calcular la altura. Sin esto cada grano se posaba
      // exactamente en su x y el siguiente de esa columna se le ponia justo encima: el
      // monton salia como una fila de torres verticales en vez de grano amontonado.
      // Se mueve del orden de una columna, que es poco mas de un grano de ancho.
      b.x += (Math.random() - 0.5) * (W / COLS) * 1.8;
      // El desparrame llega a media columna y pico —a 1920 son unos 50px—, asi que un
      // grano sorteado justo en el borde se colaba bajo el texto. Se sujeta aqui, con un
      // grano de holgura para que el corte no quede en linea recta.
      if(b.x < minX) b.x = minX + Math.random() * GRANO;
      if(b.x < 0) b.x = 0; else if(b.x > W - 1) b.x = W - 1;
      var i = columna(b.x);
      // Sobre piedra plana todos caerian a la misma cota y se leerian como una linea
      // pintada. El desorden vertical y el apilado por columna los reparten.
      b.y = reposo(b.x) + (Math.random() - 0.5) * GRANO * 0.22;
      b.rot = (Math.random() - 0.5) * 1.1;       // quedan tumbados, en cualquier angulo
      b.posado = true;
      // El monton se reparte tambien a los lados: un grano que cae encima de otros empuja
      // un poco a las columnas vecinas, que es lo que le da forma de monte en vez de
      // torre. Sin esto la pila crecia recta hacia arriba en una sola columna.
      // Aporte por grano, rebajado al subir la cantidad: con 150 granos y el valor
      // anterior toda columna llegaba al tope enseguida y el monton salia con la parte
      // de arriba plana, como una meseta. Asi crece progresivamente y queda redondeado.
      cubos[i] = (cubos[i] || 0) + GRANO * 0.064;
      if(i > 0)        cubos[i-1] = (cubos[i-1] || 0) + GRANO * 0.034;
      if(i < COLS - 1) cubos[i+1] = (cubos[i+1] || 0) + GRANO * 0.034;
      // Posicion GUARDADA EN RELATIVO a la roca (fraccion de imagen + altura sobre el
      // suelo en "granos"), no en pixeles sueltos: reencajarGranos() usa esto para
      // recolocar el grano ya posado cuando cambia el tamano de ventana, sin volver a
      // simular ninguna caida. Es la misma idea que `surface`/`bag`: todo en fraccion de
      // la imagen, no en pixeles de una pantalla concreta.
      b.imgU = mCache ? (b.x - mCache.x0) / mCache.rw : null;
      b.offGranos = (suelo[i] - b.y) / GRANO;
    }

    function dibujar(b){
      if(!spriteOk) return;
      var w = sprite.width * b.s * 0.14, h = sprite.height * b.s * 0.14;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.drawImage(sprite, -w/2, -h/2, w, h);
      ctx.restore();
    }

    // Recoloca los granos YA POSADOS sobre la roca nueva (tras un resize) sin volver a
    // tirarlos ni a simular ninguna caida: una vez asentado, un grano real no cambia de
    // sitio solo porque la ventana cambie de tamano. Cada uno vuelve a su mismo punto de
    // la roca (imgU) a la misma altura relativa sobre el suelo (offGranos), asi que se
    // mueve y escala CON la roca en vez de quedarse clavado en un pixel que ya no
    // corresponde a nada.
    function reencajarGranos(){
      if(!mCache) return;
      for(var k = 0; k < granos.length; k++){
        var b = granos[k];
        if(!b.posado || b.imgU == null) continue;
        var sueloAqui = mCache.y0 + interp(geo.surface, b.imgU) * mCache.rh;
        b.x = mCache.x0 + b.imgU * mCache.rw;
        b.y = sueloAqui - b.offGranos * GRANO;
        b.s = (GRANO / 61.6) * b.sFactor;
      }
    }

    function medir(){
      var r = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width))  * dpr;
      var h = Math.max(1, Math.round(r.height)) * dpr;
      // ResizeObserver dispara siempre una vez nada mas empezar a observar, aunque el
      // tamano no haya cambiado un pixel, y buildScene()/probe.onload pueden llamar
      // aqui otra vez por el mismo motivo (ver attach()). Sin este freno, cada una de
      // esas llamadas de mas tiraba los granos que ya estaban cayendo o posados y
      // arrancaba un lote nuevo desde cero: la escena parecia "reiniciarse" sola. Si el
      // lienzo mide lo mismo que la ultima vez, no hay nada que rehacer.
      var huboAntes = granos.length > 0;
      var sinCambios = (w === ultimoW && h === ultimoH && huboAntes);
      var wAnterior = W;
      W = canvas.width  = w;
      H = canvas.height = h;
      ultimoW = w; ultimoH = h;
      calcularSuelo();
      escalarAlRender();
      if(sinCambios) return;
      if(huboAntes){
        // El tamano SI cambio de verdad (no es el disparo de mas de ResizeObserver ni
        // del probe): reubicar el monton existente sobre la roca ya redimensionada, no
        // volver a soltarlo desde arriba. Los que todavia estan cayendo (raro, solo si
        // el resize pilla la caida inicial a medio hacer) se reescalan en X para no
        // quedar apuntando a una columna que ya no existe; su Y la corrige sola
        // reposo() cuadro a cuadro, contra el suelo ya actualizado.
        var rx = wAnterior ? (W / wAnterior) : 1;
        for(var k = 0; k < granos.length; k++){
          if(!granos[k].posado) granos[k].x *= rx;
        }
        reencajarGranos();
        return;
      }
      cubos = []; granos = []; terminado = false;
      // Cantidad por cobertura, no a ojo: los que caben en una fila a lo ancho del canvas,
      // por tres capas. Asi la densidad se ve igual en cualquier pantalla en vez de
      // depender de un numero fijo que en movil sobraba y en pantalla grande se quedaba
      // corto. Con tope, que son objetos baratos pero no gratis.
      TOTAL = Math.max(28, Math.min(300, Math.round((W / GRANO) * 3.6)));
      for(var i = 0; i < TOTAL; i++) granos.push(nuevo(i));
    }

    var t0 = 0;
    function cuadro(t){
      if(!t0) t0 = t;
      var trans = t - t0;
      ctx.clearRect(0, 0, W, H);
      var vivos = 0;
      for(var i = 0; i < granos.length; i++){
        var b = granos[i];
        if(b.posado){ dibujar(b); continue; }
        if(trans < b.espera){ vivos++; continue; }
        vivos++;
        b.vy += 0.05 * dpr;
        b.y += b.vy;
        b.x += b.vx;
        b.rot += b.vr;
        var suelo_y = reposo(b.x);
        if(b.y >= suelo_y){
          // Un par de botes cortos antes de asentarse. Clavarse en seco al tocar es lo
          // que hacia que la caida no pareciera peso, sino desaparicion.
          if(b.botes < 2 && b.vy > 1.1 * dpr){
            b.botes++;
            b.y = suelo_y;
            b.vy = -b.vy * (0.32 - b.botes * 0.08);
            b.vx *= 0.5;
            b.vr *= 0.45;
          } else {
            posar(b);
          }
        }
        dibujar(b);
      }
      // Caen una sola vez: cuando el ultimo se ha posado el bucle se apaga y el monton
      // se queda quieto. Nada de reciclar granos, que convertia la escena en una lluvia
      // continua.
      var quedan = false;
      for(i = 0; i < granos.length; i++) if(!granos[i].posado){ quedan = true; break; }
      if(!quedan){ terminado = true; raf = null; return; }
      raf = requestAnimationFrame(cuadro);
    }

    function quieto(){
      ctx.clearRect(0, 0, W, H);
      // arrancar() vuelve a llamar aqui en cada resize (con reduced-motion no hay
      // cuadro() que lo haga por animacion). Si ya se habian colocado, un segundo
      // sorteoX()+posar() les tocaria una x al azar distinta cada vez: recolocar sobre
      // la roca nueva, no volver a sortear sitio.
      var yaColocado = granos.length > 0 && granos[0].posado;
      if(yaColocado){
        reencajarGranos();
      } else {
        cubos = [];
        for(var i = 0; i < granos.length; i++){
          granos[i].x = sorteoX();
          posar(granos[i]);
        }
      }
      for(var i = 0; i < granos.length; i++) dibujar(granos[i]);
      terminado = true;
    }

    function arrancar(){
      if(reduced){ if(spriteOk) quieto(); else sprite.onload = function(){ spriteOk = true; quieto(); }; return; }
      t0 = 0;
      if(!raf) raf = requestAnimationFrame(cuadro);
    }

    return {
      attach: function(sc){
        canvas = elScene.querySelector('.scene-beans');
        if(!canvas || !canvas.getContext || !sc.surface) return;
        ctx = canvas.getContext('2d');
        geo = sc;
        // Cada attach() es un cafe (y un <canvas> del DOM) distinto, aunque mida lo
        // mismo en pantalla que el anterior. Dos cosas a limpiar antes de medir():
        // - ultimoW/H a 0, para que el freno de "sinCambios" no se crea que aqui no hay
        //   nada que hacer solo porque el lienzo mida lo mismo que el del cafe anterior.
        // - granos/cubos vacios, para que "huboAntes" de false y el primer medir() haga
        //   un lote nuevo -a juego con la roca de ESTE cafe- en vez de reencajar el
        //   monton del cafe anterior (que vive en otra roca, con otra bolsa) sobre este.
        ultimoW = 0; ultimoH = 0;
        granos = []; cubos = []; terminado = false;
        // El tamano natural se lee de la propia imagen en cuanto carga.
        var probe = new Image();
        // Respaldo con el que ya arranco medir() mas abajo, sin esperar a la red (ver
        // mapa()). Si el tamano real coincide -que es el caso de todos menos Colombia-
        // rehacer medir() aqui es puro ruido: tira los granos que ya estaban cayendo o
        // posados y arranca un lote nuevo de cero, y eso se ve como que el monton
        // "desaparece" y vuelve a caer solo. Antes no se notaba porque sc.image solia
        // estar ya en cache; con una foto nueva cargando por red, el hueco entre los dos
        // arranques se hizo visible.
        var RESPALDO_IW = 1672, RESPALDO_IH = 941;
        probe.onload = function(){
          var cambia = probe.naturalWidth !== RESPALDO_IW || probe.naturalHeight !== RESPALDO_IH;
          geo.iw = probe.naturalWidth; geo.ih = probe.naturalHeight;
          // El encuadre movil depende del tamano natural, asi que se rehace aqui y no
          // despues de medir: si no, los granos usarian el encuadre de respaldo.
          if(typeof reencuadrar === 'function') reencuadrar();
          if(cambia && canvas && canvas.isConnected){
            // El tamano real no era el de respaldo (caso Colombia): lo que ya habia
            // caido se genero con una escala equivocada, asi que aqui SI toca tirarlo y
            // arrancar un lote nuevo de cero -no reencajarlo, que solo reposiciona
            // granos ya posados y estos, recien nacidos, casi seguro siguen cayendo.
            // Se fuerza limpiando granos/ultimoW-H para que medir() no lo tome por un
            // "sinCambios" solo porque el lienzo en pantalla mide igual que antes.
            granos = []; cubos = []; terminado = false;
            ultimoW = 0; ultimoH = 0;
            medir(); arrancar();
          }
        };
        probe.src = sc.image;
        medir();
        arrancar();
        if(!ro && 'ResizeObserver' in window){
          ro = new ResizeObserver(function(){
            if(!canvas || !canvas.isConnected) return;
            medir();
            arrancar();
          });
        }
        if(ro) ro.observe(canvas);
      },
      stop: function(){
        if(raf){ cancelAnimationFrame(raf); raf = null; }
        if(ro) ro.disconnect();
      },
      // Al volver a la seccion no se relanza la lluvia si ya cayo: se repinta el monton.
      resume: function(){
        if(!canvas || !ctx || raf) return;
        if(terminado){
          ctx.clearRect(0, 0, W, H);
          for(var i = 0; i < granos.length; i++) if(granos[i].posado) dibujar(granos[i]);
          return;
        }
        if(!reduced) raf = requestAnimationFrame(cuadro);
      }
    };
  })();

  // ---------------------------------------------------------------- encuadre del render
  // Un unico sitio decide el encuadre. Antes lo decidian dos —el JS escribia --scene-pos
  // en .prod-scene y una media query lo redefinia en .scene-backdrop— y no coincidian: el
  // fondo se pintaba con 'center 56%' mientras los granos calculaban el perfil de la roca
  // con '0% 50%', asi que en movil se posaban sobre una parte de la piedra que no era la
  // que se veia. Ademas 'center' recortaba la bolsa de Costa Rica, que no esta centrada
  // en su render. Calculandolo aqui, el fondo lo hereda y los granos leen lo mismo.
  var MOVIL = '(max-width: 900px)';   // el mismo corte en el que la escena pasa a banda

  // Cuanto se queda atras el fondo respecto a la bolsa al deslizar el encuadre: 0 lo
  // dejaria clavado en su encuadre fijo (maxima profundidad, pero puede recortar mal en
  // extremos raros), 1 lo pegaria a la bolsa (el efecto de un solo plano, como hasta
  // ahora). 0.4 lo mueve, solo que mas lento, para que se lean como dos distancias.
  var PROFUNDIDAD_FONDO = 0.4;

  // Aire entre el borde derecho de la bolsa y el borde derecho de la pantalla, en
  // fraccion de la banda visible: 0 la pegaria al pixel exacto del canto (demasiado
  // justo), 1 la sacaria de cuadro. 0.04 deja un margen pequeno y se lee "pegada a la
  // derecha" sin recortarse contra el borde de la ventana.
  var MARGEN_BOLSA = 0.04;

  // Primer token de un valor "X% Y%"/"center"/"left"/"right" pasado a fraccion 0-1.
  function xFrac(pos){
    var tok = String(pos || 'center').split(/\s+/)[0];
    if(tok === 'left') return 0;
    if(tok === 'right') return 1;
    if(tok === 'center') return 0.5;
    var n = parseFloat(tok);
    return isNaN(n) ? 0.5 : n / 100;
  }

  // Devuelve el encuadre de cada capa por separado. Con escena de una sola imagen (sin
  // bagImage) las dos salen iguales, igual que antes de separar fondo y bolsa.
  function encuadre(sc){
    if(!sc) return { fondo:'center', bolsa:'center' };
    var movil = window.matchMedia(MOVIL).matches;
    // Encuadre fijo de cada modo: en escritorio el que trae el dato del cafe (0% 50% en
    // Peru, pensado para dejar sitio al texto a la izquierda); en la banda movil, 56%
    // ajustado a mano. Es lo que se usa mientras no sobre nada que recortar.
    var fijo = movil ? 'center 56%' : (sc.focus || 'center');
    var caja = elScene.getBoundingClientRect();
    // iw/ih las cachea sceneBeans sobre el propio objeto scene al cargar la imagen; el
    // respaldo es el mismo que usa mapa(), para que los dos coincidan antes de esa carga.
    var iw = sc.iw || 1672, ih = sc.ih || 941;
    if(!caja.width || !caja.height || !sc.bag) return { fondo:fijo, bolsa:fijo };
    var k = Math.max(caja.width / iw, caja.height / ih);
    var visible = caja.width / (iw * k);        // fraccion del ancho que sobrevive al recorte
    // Antes esto solo se calculaba en la banda movil, asi que en escritorio la bolsa se
    // quedaba quieta en el 0% del focus y, al estrechar la ventana antes de llegar a los
    // 900px, el recorte por la derecha se la iba comiendo sin que se desplazara nada. Al
    // no cortar por ancho de ventana sino por si de verdad sobra imagen que recortar, el
    // mismo calculo desliza el encuadre en cualquier ancho —tambien en escritorio— para
    // mantener la bolsa a la vista, y solo se queda quieto en el fijo cuando cabe entera.
    if(visible >= 0.999) return { fondo:fijo, bolsa:fijo };   // no sobra nada que encuadrar
    // Con bolsa aparte, se ancla su BORDE DERECHO (no el centro) a un punto cerca del
    // borde derecho de la banda visible: mientras el ANCHO de la bolsa quepa en lo
    // visible, queda garantizado que se ve entera, y siempre pegada a la derecha. Las
    // escenas de una sola imagen siguen centrando la bolsa, como antes de separar capas.
    var p;
    if(sc.bagImage){
      var borde = 1 - MARGEN_BOLSA;
      p = (sc.bag.x1 - borde * visible) / (1 - visible);
    } else {
      var centro = (sc.bag.x0 + sc.bag.x1) / 2;
      p = (centro - visible / 2) / (1 - visible);
    }
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    // El eje Y se mantiene igual al del encuadre fijo de cada modo: solo se desliza el X.
    var y = movil ? 56 : (parseFloat(fijo.split(/\s+/)[1]) || 50);
    var bolsa = (p * 100).toFixed(1) + '% ' + y + '%';
    if(!sc.bagImage) return { fondo:bolsa, bolsa:bolsa };
    // El fondo es un plano mas lejano: no persigue la bolsa al milimetro, se desplaza
    // hacia el mismo objetivo pero amortiguado, para leerse mas atras y mas despacio.
    var pFondo = xFrac(fijo) + (p - xFrac(fijo)) * PROFUNDIDAD_FONDO;
    var fondo = (pFondo * 100).toFixed(1) + '% ' + y + '%';
    return { fondo:fondo, bolsa:bolsa };
  }

  function aplicarEncuadre(){
    if(!sceneOn && !elScene) return;
    var sc = COFFEES[current] && COFFEES[current].scene;
    if(!sc) return;
    var enc = encuadre(sc);
    // --scene-pos pinta el fondo (mas lento). --bag-pos pinta la bolsa Y es lo que leen
    // los granos: la roca, la piedra plana y la bolsa viven en esa capa, no en el fondo.
    elScene.style.setProperty('--scene-pos', enc.fondo);
    elScene.style.setProperty('--bag-pos', enc.bolsa);
  }
  // Sin rebote: el ResizeObserver del canvas de granos vuelve a leer --bag-pos despues
  // del layout, asi que el valor tiene que estar ya puesto cuando ese observer dispare.
  window.addEventListener('resize', aplicarEncuadre);

  function reencuadrar(){ aplicarEncuadre(); }

  function buildScene(c){
    sceneOn = false;
    sceneBeans.stop();
    if(!c.scene || !c.scene.image){
      if(elScene){ elScene.hidden = true; elScene.innerHTML = ''; }
      stage.classList.remove('has-scene');
      return false;
    }
    elScene.innerHTML =
      '<div class="scene-backdrop" style="background-image:url(\'' + c.scene.image + '\')"></div>' +
      // Capa de la bolsa: mismo lienzo que el fondo, así que hereda --scene-size/
      // --scene-pos y no necesita su propio calculo de encuadre.
      (c.scene.bagImage ? '<div class="scene-bag" style="background-image:url(\'' + c.scene.bagImage + '\')"></div>' : '') +
      (c.scene.surface ? '<canvas class="scene-beans"></canvas>' : '');
    // El encuadre va como variables en el CONTENEDOR, no como background-* sobre la capa
    // que las usa: escrito en linea sobre la propia capa ganaria a cualquier media query.
    elScene.style.setProperty('--scene-size', c.scene.size || 'cover');
    aplicarEncuadre();
    elScene.hidden = false;
    stage.classList.add('has-scene');
    sceneOn = true;
    sceneBeans.attach(c.scene);
    return true;
  }

  // La entrada la marca una clase en la seccion: el fondo entra primero y los bloques de
  // texto van detras en cascada, con los retardos escalonados en el CSS.
  function playScene(){
    if(!sceneOn) return;
    stage.classList.remove('scene-in');
    if(reduced){ stage.classList.add('scene-in'); return; }
    // Dos fotogramas: uno para que el navegador registre el estado de partida y otro para
    // que la transicion arranque desde el en vez de saltarsela.
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ stage.classList.add('scene-in'); });
    });
  }

  function paint(i){
    var c = COFFEES[i];

    var first = (c.facts && c.facts[0]) || null;
    put(elOrigin, first ? (isPending(first.value) ? first.value : first.label + ' · ' + first.value) : '');
    put(elName, c.name);
    put(elSub, c.subtitle);
    put(elDesc, c.description);

    elNotes.innerHTML = c.tastingNotes.length
      ? c.tastingNotes.map(function(n){ return '<li>' + esc(n) + '</li>'; }).join('')
      : '<li class="is-pending">[NOTAS DE CATA — PENDIENTE]</li>';

    elMeters.innerHTML =
      meterMarkup('Tueste', c.meters.tueste) +
      meterMarkup('Acidez', c.meters.acidez) +
      meterMarkup('Cuerpo', c.meters.cuerpo);

    elFacts.innerHTML = factsMarkup(c.facts);

    // Cada café abre con el formato mas chico elegido por defecto.
    if(elSizeBtns.length){
      selectedSize = elSizeBtns[0].getAttribute('data-size');
      elSizeBtns.forEach(function(b, k){ b.classList.toggle('is-current', k === 0); });
    }
    actualizarWhatsapp();

    var conEscena = buildScene(c);
    // Con decorado, la bolsa es una capa más de la escena y los granos sobran: la
    // referencia de marca no los lleva. Sin decorado se mantiene la composición
    // anterior de bolsa suelta sobre el montón de granos.
    elPack.innerHTML = conEscena ? '' : packMarkup(c, 'pack-img');
    if(conEscena){ beans.stop(); } else if(showing){ beans.start(); }
    stage.style.setProperty('--accent', c.accent);
    if(conEscena) playScene();

    // Crossfade del fondo: se pinta en la capa que está oculta y luego se cambia cuál
    // manda, para que nunca haya un fotograma sin fondo.
    var incoming = bgLayers[bgTurn % 2];
    var outgoing = bgLayers[(bgTurn + 1) % 2];
    if(incoming){ incoming.style.backgroundImage = bgValue(c); incoming.classList.add('is-on'); }
    if(outgoing){ outgoing.classList.remove('is-on'); }
    bgTurn++;
  }

  // ------------------------------------------------------------ abrir / cerrar
  // Un unico estado: `showing`. La ficha es un popup ("vista rápida") con velo
  // detras; ya no comparte celda con la narrativa ni con la grilla.
  var showing = false;
  var closeTimer = null;
  var scrim = document.getElementById('quickviewScrim');

  function openDetail(i){
    var cambiaDeCafe = showing && i !== current;
    current = i;
    if(cambiaDeCafe && !reduced){
      // Mismo fundido de salida/entrada que ya usaba select() al cambiar de
      // cafe con el panel viejo.
      copy.classList.add('is-swapping');
      elPack.classList.add('is-swapping');
      window.setTimeout(function(){
        paint(i);
        copy.classList.remove('is-swapping');
        elPack.classList.remove('is-swapping');
      }, 220);
    } else {
      paint(i);
    }
    if(!showing){
      showing = true;
      window.clearTimeout(closeTimer);
      document.body.classList.add('has-quickview');
      if(scrim) scrim.hidden = false;
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          stage.classList.add('is-open');
          if(scrim) scrim.classList.add('is-open');
        });
      });
      if(!COFFEES[current].scene) beans.start();
    }
    cards.forEach(function(btn, j){
      var on = j === i;
      btn.classList.toggle('is-current', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    // Foco al encabezado de la ficha: quien navega con teclado aterriza donde
    // empieza el contenido nuevo, no se queda perdido en la tarjeta.
    if(elName) elName.setAttribute('tabindex', '-1');
    window.setTimeout(function(){ if(elName) elName.focus({ preventScroll:true }); }, reduced ? 0 : 340);
  }

  function closeDetail(){
    if(!showing) return;
    showing = false;
    stage.classList.remove('is-open');
    if(scrim) scrim.classList.remove('is-open');
    document.body.classList.remove('has-quickview');
    cards.forEach(function(btn){
      btn.classList.remove('is-current');
      btn.setAttribute('aria-pressed', 'false');
    });
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(function(){
      if(showing) return;
      beans.stop();
      sceneBeans.stop();
      if(scrim) scrim.hidden = true;
    }, reduced ? 0 : 320);
    // Devuelve el foco a la tarjeta que se acaba de cerrar.
    var btn = cards[current];
    if(btn) btn.focus({ preventScroll:true });
  }

  if(backBtn) backBtn.addEventListener('click', closeDetail);
  if(scrim) scrim.addEventListener('click', closeDetail);

  // ESC cierra el detalle si esta abierto.
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && showing) closeDetail();
  });

  // ------------------------------------------------------------ granos que caen
  // Canvas 2D con una población pequeña y reutilizada: nada de cientos de nodos DOM.
  // Los que caen giran y, al tocar la base, se suman al montón que rodea la bolsa.
  var beans = (function(){
    var canvas = document.getElementById('prodBeans');
    if(!canvas || !canvas.getContext) return { start:function(){}, stop:function(){} };

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, raf = null, ro = null;
    var falling = [], pile = [], buckets = [];
    var PILE_CAP = 0, FALL_MAX = 0, COLS = 14;

    // Reparto uniforme a lo ancho. Concentrarlos en el centro parecía lo lógico —es
    // donde apoya la bolsa— pero ahí es justo donde la bolsa los tapa: el montón crecía
    // entero detrás del paquete y en pantalla no se veía ni un grano.
    function spawnX(){ return W * (0.04 + Math.random() * 0.92); }

    function make(y){
      return {
        x: spawnX(),
        y: y != null ? y : -40 * dpr - Math.random() * H * 0.55,
        vy: (0.95 + Math.random() * 0.95) * dpr,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.018,
        s: (0.72 + Math.random() * 0.5) * dpr,
        tone: Math.random()
      };
    }

    function resize(){
      var r = canvas.getBoundingClientRect();
      W = canvas.width  = Math.max(1, Math.round(r.width))  * dpr;
      H = canvas.height = Math.max(1, Math.round(r.height)) * dpr;
      var wide = r.width > 700;
      FALL_MAX = wide ? 9 : 5;
      PILE_CAP = wide ? 26 : 14;
      falling = []; pile = []; buckets = [];
      // Se siembra parte del montón antes de empezar: cayendo de uno en uno, la base
      // tardaba más de diez segundos en formarse y quien mirase dos segundos solo veía
      // granos sueltos en el aire, no una composición.
      var seed = Math.round(PILE_CAP * 0.45);
      for(var i = 0; i < seed; i++) settle(make(0));
      for(i = 0; i < FALL_MAX; i++) falling.push(make());
    }

    // Coloca un grano en reposo y sube la columna correspondiente.
    function settle(b){
      b.y = restY(b.x);
      b.rot = (Math.random() - 0.5) * 0.6;      // reposan casi horizontales
      pile.push(b);
      var col = Math.max(0, Math.min(COLS - 1, Math.floor((b.x / W) * COLS)));
      buckets[col] = (buckets[col] || 0) + 5 * dpr;
    }

    // Un grano: elipse con el surco central. Dibujado, no cargado — un sprite costaría
    // una petición más y a este tamaño no se vería mejor.
    function draw(b){
      var rx = 13 * b.s, ry = 9 * b.s;
      var light = 0.5 + b.tone * 0.5;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.fillStyle = 'rgba(' + Math.round(58 + light * 42) + ',' +
                                Math.round(33 + light * 26) + ',' +
                                Math.round(20 + light * 16) + ',0.95)';
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,12,8,0.75)';
      ctx.lineWidth = 1.5 * b.s;
      ctx.beginPath();
      ctx.moveTo(-rx * 0.78, 0);
      ctx.bezierCurveTo(-rx * 0.3, ry * 0.55, rx * 0.3, -ry * 0.55, rx * 0.78, 0);
      ctx.stroke();
      ctx.restore();
    }

    // Altura de reposo en esa columna: el montón crece hacia el centro, donde apoya la
    // bolsa, y sube según lo que ya se haya acumulado en la columna.
    function restY(x){
      // Loma suave: el montón se levanta un poco hacia el centro sin llegar a esconderse
      // tras la bolsa, y deja que los bordes se lean como granos sueltos sobre la mesa.
      var t = Math.abs(x / W - 0.5) * 2;           // 0 en el centro, 1 en los bordes
      var mound = (1 - t * t) * 13 * dpr;
      var col = Math.max(0, Math.min(COLS - 1, Math.floor((x / W) * COLS)));
      return H - 14 * dpr - mound - (buckets[col] || 0);
    }

    function frame(){
      ctx.clearRect(0, 0, W, H);
      var i;
      for(i = 0; i < pile.length; i++) draw(pile[i]);
      for(i = 0; i < falling.length; i++){
        var b = falling[i];
        b.y += b.vy;
        b.rot += b.vr;
        var rest = restY(b.x);
        if(b.y >= rest){
          if(pile.length < PILE_CAP) settle(b);
          falling[i] = make();
          continue;
        }
        draw(b);
      }
      raf = requestAnimationFrame(frame);
    }

    // Fotograma único para prefers-reduced-motion: el montón, sin nada cayendo.
    function still(){
      ctx.clearRect(0, 0, W, H);
      pile = []; buckets = [];
      for(var i = 0; i < PILE_CAP; i++) settle(make(0));
      for(i = 0; i < pile.length; i++) draw(pile[i]);
    }

    return {
      start: function(){
        resize();
        if(reduced){ still(); return; }
        if(!raf) raf = requestAnimationFrame(frame);
        if(!ro && 'ResizeObserver' in window){
          ro = new ResizeObserver(function(){
            resize();
            if(reduced) still();
          });
          ro.observe(canvas);
        }
      },
      stop: function(){ if(raf){ cancelAnimationFrame(raf); raf = null; } }
    };
  })();

  // Si la sección sale de pantalla con el detalle abierto, la animación (escena o
  // granos sueltos) se para sola y se reanuda al volver a entrar.

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){
      var dentro = e[0].isIntersecting;
      if(!showing) return;
      if(dentro){
        if(COFFEES[current].scene) sceneBeans.resume(); else beans.start();
      } else {
        beans.stop(); sceneBeans.stop();
      }
    }, { rootMargin: '120px 0px' }).observe(section);
  }

  paint(0);
})();
