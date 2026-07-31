(function(){
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

      fadeEdges(ctx, canvas);
    }

    resize();
    var resizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });
  }

  function initSandTrail(canvas){
    if(!canvas || !canvas.getContext || prefersReduced) return;
    var ctx = canvas.getContext('2d');

    function resize(){
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width)) * dpr;
      canvas.height = Math.max(1, Math.round(rect.height)) * dpr;
    }
    resize();
    var resizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    var points = [];
    var rafId = null;
    var DURATION = 8000;  // mark lingers, then the sand "fills back in"
    var HOLD = 0.7;       // fraction of the life held at full strength before fading

    // A point is gone once the water is over it. Checked against the live waterline
    // rather than the high-water mark, so a stretch the sea has given back can be drawn
    // on again — it only stays erased while the water is actually there.
    function washedAway(p){
      var shore = window.AridoShore;
      if(!shore) return false;
      var shoreH = shore.height();
      if(!shoreH) return false;
      // Both canvases are pinned to the same section and share width and dpr, so they
      // differ only by the gap between their top edges.
      return p.y > shore.waterTopAt(p.x) + (canvas.height - shoreH);
    }

    function loop(){
      var now = performance.now();
      points = points.filter(function(p){ return now - p.t < DURATION && !washedAway(p); });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // butt caps: consecutive segments share exact endpoints, so this gives one
      // continuous clean line instead of round-cap overlaps beading up at each point
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'round';

      for(var i = 1; i < points.length - 1; i++){
        var p0 = points[i - 1], p1 = points[i], p2 = points[i + 1];
        var life = (now - p1.t) / DURATION;
        var alpha = life < HOLD ? 1 : Math.max(0, 1 - (life - HOLD) / (1 - HOLD));
        if(alpha <= 0) continue;

        var startX = (p0.x + p1.x) / 2, startY = (p0.y + p1.y) / 2;
        var endX = (p1.x + p2.x) / 2, endY = (p1.y + p2.y) / 2;

        // bright ridge of sand pushed up along one side of the groove
        ctx.strokeStyle = 'rgba(255,248,224,' + (alpha * 0.75) + ')';
        ctx.lineWidth = 5 * dpr;
        ctx.beginPath();
        ctx.moveTo(startX + 3 * dpr, startY - 3 * dpr);
        ctx.quadraticCurveTo(p1.x + 3 * dpr, p1.y - 3 * dpr, endX + 3 * dpr, endY - 3 * dpr);
        ctx.stroke();

        // the groove itself: soft shadowed walls, dark gray-brown recessed core
        ctx.strokeStyle = 'rgba(151,120,78,' + (alpha * 0.6) + ')';
        ctx.lineWidth = 11 * dpr;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(p1.x, p1.y, endX, endY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(78,66,52,' + (alpha * 0.62) + ')';
        ctx.lineWidth = 4.5 * dpr;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(p1.x, p1.y, endX, endY);
        ctx.stroke();
      }

      fadeEdges(ctx, canvas);

      rafId = points.length > 1 ? requestAnimationFrame(loop) : null;
    }

    var lastX = null, lastY = null;
    function handleMove(clientX, clientY){
      var rect = canvas.getBoundingClientRect();
      if(clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom){
        lastX = null;
        return;
      }
      var x = (clientX - rect.left) * dpr;
      var y = (clientY - rect.top) * dpr;
      if(lastX === null){ lastX = x; lastY = y; }
      var dx = x - lastX, dy = y - lastY;
      if(Math.sqrt(dx * dx + dy * dy) > 6 * dpr){
        points.push({ x: x, y: y, t: performance.now() });
        if(points.length > 500) points.shift();
        lastX = x; lastY = y;
        if(!rafId) rafId = requestAnimationFrame(loop);
      }
    }

    window.addEventListener('mousemove', function(e){
      handleMove(e.clientX, e.clientY);
    }, { passive:true });

    window.addEventListener('touchmove', function(e){
      if(e.touches && e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive:true });
  }

  // Only "Hablemos" carries sand now — "Nuestro origen" has the desert scene instead.
  initSandGrain(document.getElementById('sandContacto'));
  initSandTrail(document.getElementById('sandContactoTrail'));
})();
