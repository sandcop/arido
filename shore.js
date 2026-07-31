/* Shoreline swash at the foot of "Hablemos".
   The sea lies past the bottom edge; each wave runs up over the sand and drains back.
   What sells it as water is not the shape of the water but the timing: real swash rushes
   up in about a second and takes three or four to drain away. Every wave draws a fresh
   reach, duration and pause, so the cycle never reads as a loop. */
(function(){
  var canvas = document.getElementById('shoreCanvas');
  if(!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var section = canvas.parentElement;
  var W = 0, H = 0;
  var band = 0;              // the beach proper; the canvas extends above it for surges
  var COLS = 170;            // sampling resolution of the water edge and the wet sand
  var colW = 0;
  var seaBase = 0;           // the sea never drains away entirely; swash rises off this
  var wetY = null;           // highest point each column has been wetted to
  var wetT = null;           // when that happened, for the drying fade
  var DRY_MS = 9000;

  function resetWet(){
    wetY = new Float32Array(COLS);
    wetT = new Float64Array(COLS);
    for(var i = 0; i < COLS; i++){ wetY[i] = H; wetT[i] = -1e9; }
  }

  function resize(){
    var rect = canvas.getBoundingClientRect();
    W = canvas.width = Math.max(1, Math.round(rect.width)) * dpr;
    H = canvas.height = Math.max(1, Math.round(rect.height)) * dpr;
    colW = W / COLS;
    // Read the beach band off the section's own padding rather than the custom property:
    // padding resolves to a plain px value in computed style, whereas a clamp() inside a
    // custom property comes back as an unresolved token.
    band = (parseFloat(getComputedStyle(section).paddingBottom) || (H * 0.6)) * dpr;
    seaBase = band * 0.13;
    resetWet();
  }

  function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
  function easeInQuad(t){ return t * t; }

  // ---- wave cycle ---------------------------------------------------------
  function newWave(now){
    // Real swell arrives in sets: mostly ordinary swash, regularly a bigger one, and
    // once in a while a surge that runs clear past the beach and up among the cards.
    var r = Math.random();
    var reach, surge = false;
    // Roughly one surge every seven waves. Rarer than this and a visitor who only pauses
    // here for half a minute would never see one.
    if(r < 0.15){
      reach = band + (H - band) * (0.58 + Math.random() * 0.38);
      surge = true;
    } else if(r < 0.30){
      reach = band * (0.74 + Math.random() * 0.26);
    } else {
      reach = band * (0.30 + Math.random() * 0.34);
    }
    // The further it runs, the longer it takes to get there and to drain back.
    var weight = reach / band;
    return {
      t0: now,
      reach: reach,
      surge: surge,
      up: 820 + Math.random() * 520 + weight * 420,
      hold: 140 + Math.random() * 280 + (surge ? 320 : 0),
      down: 2300 + Math.random() * 1700 + weight * 1100,
      pause: 600 + Math.random() * 2100,
      seed: Math.random() * 1000
    };
  }

  var wave = null;

  // Advance of the water as a fraction of this wave's reach: quick up, brief stall,
  // long drain. Returns 0 once the wave is spent and during the pause that follows.
  function advance(w, now){
    var t = now - w.t0;
    if(t < w.up) return easeOutCubic(t / w.up);
    t -= w.up;
    if(t < w.hold) return 1;
    t -= w.hold;
    if(t < w.down) return 1 - easeInQuad(t / w.down);
    return 0;
  }

  function spent(w, now){
    return (now - w.t0) > (w.up + w.hold + w.down + w.pause);
  }

  // Irregular edge: three sines at unrelated frequencies, drifting against each other
  // so the profile never repeats. Flattened while the sheet is thin.
  function edgeOffset(x, w, now, amp){
    var t = now * 0.001;
    return amp * (
      0.55 * Math.sin(x * 0.0041 + w.seed + t * 0.65) +
      0.30 * Math.sin(x * 0.0093 + w.seed * 1.7 - t * 1.05) +
      0.15 * Math.sin(x * 0.0204 + w.seed * 2.3 + t * 1.85)
    );
  }

  // ---- foam ---------------------------------------------------------------
  var foam = [];
  function spawnFoam(x, y, now, vigour){
    foam.push({
      x: x + (Math.random() - 0.5) * 26 * dpr,
      y: y + (Math.random() - 0.5) * 9 * dpr,
      r: (1.1 + Math.random() * 3.4) * dpr,
      vx: (Math.random() - 0.5) * 0.22 * dpr,
      vy: (Math.random() - 0.35) * 0.30 * dpr,
      born: now,
      life: 420 + Math.random() * 900,
      a: 0.35 + Math.random() * 0.5 * vigour
    });
  }

  // ---- drawing ------------------------------------------------------------
  // Height of the water at this column. Floored at the standing sea level so the strip
  // never goes bone dry between waves — the sea is simply beyond the bottom edge.
  function levelOf(w, adv){
    return Math.max(seaBase, adv * w.reach);
  }

  function edgeYAt(i, w, adv, now){
    var x = i * colW;
    var base = H - levelOf(w, adv);
    return base + edgeOffset(x, w, now, 17 * dpr * (0.55 + 0.45 * adv));
  }

  // Last frame's state, so the sand trail can ask where the water currently is.
  var lastAdv = 0, lastNow = 0;

  function draw(now){
    ctx.clearRect(0, 0, W, H);

    var adv = wave ? advance(wave, now) : 0;
    lastAdv = adv; lastNow = now;
    var i, x, y;

    // wet sand: darkened where the water has been, drying off column by column.
    // Columns high up the beach are only reached by the rare big wave, so they carry an
    // older timestamp and dry out first — the tide line recedes on its own.
    for(i = 0; i < COLS; i++){
      var age = now - wetT[i];
      if(age > DRY_MS) continue;
      var wetness = 1 - clamp01(age / DRY_MS);
      var top = wetY[i];
      // Integer, non-overlapping bounds. Letting adjacent columns overlap even a single
      // pixel doubles the alpha along every seam and stripes the whole band vertically —
      // and the semi-transparent water above shows those stripes straight through.
      var x0 = Math.round(i * colW);
      var x1 = Math.round((i + 1) * colW);
      ctx.fillStyle = 'rgba(92,62,26,' + (0.34 * wetness).toFixed(3) + ')';
      ctx.fillRect(x0, top, x1 - x0, H - top);
    }

    // the sheet of water itself
    if(wave){
      ctx.beginPath();
      ctx.moveTo(0, H);
      for(i = 0; i <= COLS; i++){
        var ii = Math.min(i, COLS - 1);
        y = edgeYAt(ii, wave, adv, now);
        ctx.lineTo(i * colW, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();

      var top2 = H - levelOf(wave, adv);
      var g = ctx.createLinearGradient(0, top2, 0, H);
      g.addColorStop(0, 'rgba(146,196,170,0.20)');   // thin film, mostly wet sand showing
      g.addColorStop(0.28, 'rgba(74,158,148,0.44)'); // shallow green over lit sand
      g.addColorStop(1, 'rgba(22,86,104,0.70)');     // deeper toward the sea
      ctx.fillStyle = g;
      ctx.fill();

      // A slack sheen a little behind the front, where the returning film catches the
      // light. Keeps the body from reading as one flat wash of colour.
      ctx.save();
      ctx.clip();
      var sheenY = top2 + levelOf(wave, adv) * 0.22;
      var sg = ctx.createLinearGradient(0, sheenY - 26 * dpr, 0, sheenY + 34 * dpr);
      sg.addColorStop(0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.5, 'rgba(255,255,255,' + (0.10 * adv).toFixed(3) + ')');
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, sheenY - 26 * dpr, W, 60 * dpr);
      ctx.restore();

      // light catching the leading film
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.30 * Math.min(1, adv * 1.6)).toFixed(3) + ')';
      ctx.lineWidth = 1.6 * dpr;
      ctx.beginPath();
      for(i = 0; i <= COLS; i++){
        var jj = Math.min(i, COLS - 1);
        y = edgeYAt(jj, wave, adv, now);
        if(i === 0) ctx.moveTo(0, y); else ctx.lineTo(i * colW, y);
      }
      ctx.stroke();

      // record the high-water mark
      for(i = 0; i < COLS; i++){
        y = edgeYAt(i, wave, adv, now);
        if(y < wetY[i]){ wetY[i] = y; wetT[i] = now; }
        else if(y < wetY[i] + 4 * dpr){ wetT[i] = now; }
      }
    }

    // foam along the front, thrown hardest while the wave is still running up and never
    // stopping entirely — the standing sea keeps working at the sand between waves
    if(wave){
      var rushing = (now - wave.t0) < (wave.up + wave.hold);
      var rate = rushing ? 22 : (adv > 0.06 ? 7 : 3);
      for(var k = 0; k < rate; k++){
        var ci = (Math.random() * COLS) | 0;
        spawnFoam(ci * colW, edgeYAt(ci, wave, adv, now), now, rushing ? 1 : 0.5);
      }
    }

    for(i = foam.length - 1; i >= 0; i--){
      var p = foam[i];
      var lt = (now - p.born) / p.life;
      if(lt >= 1){ foam.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy;
      ctx.fillStyle = 'rgba(255,253,248,' + (p.a * (1 - lt) * (1 - lt)).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1 - 0.45 * lt), 0, Math.PI * 2);
      ctx.fill();
    }
    if(foam.length > 900) foam.splice(0, foam.length - 900);
  }

  // ---- loop ---------------------------------------------------------------
  var rafId = null;
  function frame(){
    var now = performance.now();
    if(!wave || spent(wave, now)) wave = newWave(now);
    draw(now);
    rafId = requestAnimationFrame(frame);
  }

  function start(){ if(!rafId) rafId = requestAnimationFrame(frame); }
  function stop(){ if(rafId){ cancelAnimationFrame(rafId); rafId = null; } }

  resize();
  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){ resize(); if(prefersReduced) still(); }, 200);
  });

  // A single resting frame: damp sand and the sea just short of the beach.
  function still(){
    var now = performance.now();
    wave = newWave(now);
    wave.reach = H * 0.30;
    for(var i = 0; i < COLS; i++){ wetY[i] = H - H * 0.34; wetT[i] = now; }
    draw(now);
  }

  // Published so the finger-trail layer can rub out whatever the water is currently
  // covering. Coordinates are this canvas's own device pixels; the caller offsets by the
  // difference in canvas heights, since both are pinned to the same section.
  window.AridoShore = {
    height: function(){ return H; },
    waterTopAt: function(x){
      if(!wave) return Infinity;
      var i = Math.round(x / colW);
      if(i < 0) i = 0; else if(i > COLS - 1) i = COLS - 1;
      return edgeYAt(i, wave, lastAdv, lastNow);
    }
  };

  if(prefersReduced){ still(); return; }

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting) start(); else stop();
    }, { rootMargin: '120px 0px' }).observe(canvas.parentElement);
  } else {
    start();
  }
})();
