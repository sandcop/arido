(function(){
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  // How far the sand fades out at the top edge of its canvas, so it melts into the
  // page above instead of ending on a hard horizontal line. There is no bottom fade:
  // the foot of the section is the shoreline now, and it needs solid sand to wash over.
  var FADE_TOP = 90 * dpr;
  var FADE_BOTTOM = 0;

  function fadeEdges(ctx, canvas){
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';

    var top = ctx.createLinearGradient(0, 0, 0, FADE_TOP);
    top.addColorStop(0, 'rgba(0,0,0,1)');
    top.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, canvas.width, FADE_TOP);

    if(FADE_BOTTOM > 0){
      var bottom = ctx.createLinearGradient(0, canvas.height - FADE_BOTTOM, 0, canvas.height);
      bottom.addColorStop(0, 'rgba(0,0,0,0)');
      bottom.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = bottom;
      ctx.fillRect(0, canvas.height - FADE_BOTTOM, canvas.width, FADE_BOTTOM);
    }

    ctx.restore();
  }

  // A tile of true per-pixel sand grain: mostly fine light/dark yellow speckle,
  // plus scattered black mineral pixels and bright quartz glints. Built once and
  // repeat-tiled — 1px noise is far too fine for the repetition to be perceptible.
  var grainPattern = (function(){
    var SIZE = 512;
    var tile = document.createElement('canvas');
    tile.width = tile.height = SIZE;
    var tctx = tile.getContext('2d');
    var img = tctx.createImageData(SIZE, SIZE);
    var d = img.data;
    for(var i = 0; i < d.length; i += 4){
      var kind = Math.random();
      if(kind < 0.008){
        // black mineral grains
        d[i] = 16; d[i+1] = 13; d[i+2] = 10;
        d[i+3] = 190 + Math.random() * 65;
      } else if(kind < 0.026){
        // bright quartz glints (the "brillante" sparkle)
        d[i] = 255; d[i+1] = 251; d[i+2] = 232;
        d[i+3] = 170 + Math.random() * 85;
      } else {
        // ordinary sand grain: half catching light, half in shade
        if(Math.random() < 0.5){
          d[i] = 255; d[i+1] = 241; d[i+2] = 196;
        } else {
          d[i] = 146; d[i+1] = 116; d[i+2] = 70;
        }
        d[i+3] = 22 + Math.random() * 62;
      }
    }
    tctx.putImageData(img, 0, 0);
    return tctx.createPattern(tile, 'repeat');
  })();

  function initSandGrain(canvas){
    if(!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    // marca data-dark: misma arena, con un velo oscuro encima. Se usa detrás de
    // secciones con contenido claro (p.ej. "Edición especial"), donde la arena
    // clara de siempre lavaría el texto.
    var dark = canvas.hasAttribute('data-dark');

    function resize(){
      var rect = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(rect.width));
      var h = Math.max(1, Math.round(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      paint();
    }

    function paint(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // warm sand base
      ctx.fillStyle = '#EBDBB4';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // rolling dune relief: low-res random height field, smoothly upscaled into
      // soft organic swells (the browser's own bilinear smoothing does the blurring)
      var cellsX = 9 + Math.round(Math.random() * 3);
      var cellsY = 6 + Math.round(Math.random() * 2);
      var noise = document.createElement('canvas');
      noise.width = cellsX; noise.height = cellsY;
      var nctx = noise.getContext('2d');
      for(var gy = 0; gy < cellsY; gy++){
        for(var gx = 0; gx < cellsX; gx++){
          var v = Math.random();
          var r = Math.round(215 + v * 37);
          nctx.fillStyle = 'rgb(' + r + ',' + Math.round(r * 0.895) + ',' + Math.round(r * 0.685) + ')';
          nctx.fillRect(gx, gy, 1, 1);
        }
      }
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(noise, 0, 0, cellsX, cellsY, 0, 0, canvas.width, canvas.height);

      // fine grain, black specks and glints on top
      ctx.fillStyle = grainPattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Velo oscuro: misma arena, mas oscura para que el texto claro de encima
      // se lea bien. Translucido y no un color solido, para que la textura de
      // grano siga asomando debajo.
      if(dark){
        ctx.fillStyle = 'rgba(8,6,4,0.62)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      fadeEdges(ctx, canvas);
    }

    resize();
    var resizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });
  }

  // El rastro que dejaba el cursor sobre la arena (la marca que se iba
  // rellenando sola) se quitó por pedido: ahora la arena solo tiene su
  // textura fija, sin reaccionar al mouse/dedo.

  // Cada sección con su propia franja de arena (Hablemos, clara; Edición
  // especial, oscura vía data-dark) — nada de un unico canvas fijo por id.
  [].slice.call(document.querySelectorAll('.sand-layer')).forEach(initSandGrain);
})();
