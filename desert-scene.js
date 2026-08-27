/* Desert sunset scene behind the hero and "Nuestro origen".
   The scene lives in .sky-stage, a wrapper around both, so one sky runs from the very
   top of the page down to the horizon. Two motions share one scroll read per frame:
     - assembly: each terrain layer enters in sequence, back to front, as #nosotros arrives
     - parallax: layers drift at speeds set by their depth
   Terrain slides up into place; cacti grow from their base, which reads more naturally
   for a cactus than drifting in. */
(function(){
  var stage   = document.getElementById('skyStage');
  var section = document.getElementById('nosotros');
  var scene   = document.getElementById('desert');
  if(!stage || !section || !scene) return;

  var layers = [].slice.call(scene.querySelectorAll('.desert-layer')).map(function(el){
    return {
      el: el,
      lag: parseFloat(el.getAttribute('data-parallax')) || 0,
      inAt: parseFloat(el.getAttribute('data-in')) || 0,
      span: parseFloat(el.getAttribute('data-span')) || 0.12,
      // Sky, stars and moon are anchored to the whole stage: they are already on screen
      // when the page loads, so they never play an entrance — only the drift.
      onStage: el.getAttribute('data-anchor') === 'stage',
      // Two ways to come up out of the ground. Scaling seals the horizon by itself — the
      // colour block a mesa band carries below its artwork always reaches the same depth
      // whatever the scale — so the big terrain gets that. But scaling squashes detail,
      // and the near dunes are nothing but detail: their character is the little shrubs
      // along the crest, which flatten into smears. Those slide up from under the ground
      // line instead, at full proportions, and the scene's own clip hides the rest.
      slides: el.getAttribute('data-rise') === 'slide',
      lift: 0,
      isCactus: el.classList.contains('desert-cactus')
    };
  });
  if(!layers.length) return;

  // Peak travel in px for a layer of lag 1.0. The terrain bands carry a matching block of
  // colour below their artwork, so they can ride this far without opening a notch at the
  // ground line.
  var TRAVEL = 840;
  // The sky layers take no fixed figure: their drift is a FRACTION of how far the stage
  // itself scrolls, so data-parallax reads directly as "how much of the scroll this layer
  // keeps". 0.80 means the moon holds 80% of the scroll and slips up the screen at the
  // remaining 20% — it stays in view the whole way down instead of leaving at the top,
  // while sinking most of the height of the sky in scene terms. A fixed pixel figure
  // could not do that: the taller the viewport, the sooner the moon would escape.

  // Slide distance has to be the layer's own height, and reading it during render would
  // force a layout on every frame.
  function measure(){
    for(var i = 0; i < layers.length; i++){
      if(layers[i].slides) layers[i].lift = layers[i].el.offsetHeight;
    }
  }

  function settle(layer){
    layer.el.style.opacity = '1';
    layer.el.style.transform = 'none';
  }

  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    layers.forEach(settle);
    return;
  }

  // Hiding the layers is gated on this attribute rather than baked into the stylesheet,
  // so if this script never runs the scene still renders assembled instead of invisible.
  scene.setAttribute('data-anim', '1');

  // Smoothstep: eases in AND out, and its peak speed is only 1.5x the average. The
  // ease-out cubic this replaced left the gate at maximum velocity, which is what made
  // every layer look like it snapped up and then crawled the last few pixels.
  function ease(t){ return t * t * (3 - 2 * t); }
  function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }

  function render(){
    var vh = window.innerHeight;

    // Stage progress: 0 with the page at the top, 1 once the stage has been scrolled
    // clear through. Measured from the top downward — not centred on the viewport like
    // the section passage — because the sky has to be settled at scroll zero, and a
    // centred reading would put it halfway through its travel before anyone scrolled.
    var sRect = stage.getBoundingClientRect();
    var stageRun = Math.max(1, sRect.height - vh);
    var stageP = clamp01(-sRect.top / stageRun);

    // Section passage drives the PARALLAX: a slow drift across the section's whole travel
    // through the viewport is what makes the depth read.
    var rect = section.getBoundingClientRect();
    var passage = clamp01((vh - rect.top) / ((vh + rect.height) || 1));
    var drift = (passage - 0.5) * 2 * TRAVEL;

    // Assembly runs on its own clock, keyed to the ground line rather than to the section.
    // The terrain sits in a band at the very foot of a section three times its height, so
    // on the section's clock it finished growing some 800px before it ever cleared the
    // bottom of the screen — the whole rise happened where nobody could see it. Measured
    // this way it starts as the horizon enters from below and completes while it is still
    // low on screen, whatever the section or the viewport happen to measure.
    // The clock starts HALF A SCREEN BEFORE the horizon reaches the bottom edge. Waiting
    // for the horizon meant nothing could stir until the reader had scrolled the hero and
    // the whole of the copy, and left barely 700px of scroll to fit eight layers into.
    // Starting early works because the mesas stand ~475px above the ground line: their
    // crests break the bottom edge while the horizon itself is still below it, so the
    // ridges are already rising by the time anything else is on screen.
    // The head start cannot go much past the height of the mesas — earlier than that and
    // the growth happens entirely below the fold, which is the bug this replaced.
    var HEAD_START = vh * 0.65;
    var RUN = vh * 1.55;
    var ground = scene.getBoundingClientRect().bottom;
    var build = clamp01((vh - ground + HEAD_START) / RUN);

    for(var i = 0; i < layers.length; i++){
      var layer = layers[i];

      if(layer.onStage){
        layer.el.style.transform =
          'translate3d(0,' + (stageP * stageRun * layer.lag).toFixed(2) + 'px,0)';
        layer.el.style.opacity = '1';
        continue;
      }

      var t = ease(clamp01((build - layer.inAt) / layer.span));
      var y = drift * layer.lag;

      // Everything anchored to the section rises out of the ground. The CSS puts
      // transform-origin on each layer's bottom edge, so scaleY(0) collapses it into the
      // horizon line and scaleY(1) stands it at full height. The mesa bands hang 260px
      // below the ground line and the scene clips there, so what shows is a ridge pushing
      // up through the horizon rather than a shape being squashed.
      if(layer.slides){
        layer.el.style.transform =
          'translate3d(0,' + (y + (1 - t) * layer.lift).toFixed(2) + 'px,0)';
      } else {
        layer.el.style.transform =
          'translate3d(0,' + y.toFixed(2) + 'px,0) scaleY(' + t.toFixed(4) + ')';
      }
      // Opaque throughout: a fade reads as materialising out of nothing, where the whole
      // point is that the terrain is coming up from below. At t=0 there is nothing to
      // see anyway — the layer has no height.
      layer.el.style.opacity = '1';
    }
  }

  function onResize(){ measure(); onScroll(); }

  var ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      render();
      ticking = false;
    });
  }

  // Only listen while the stage is anywhere near the viewport.
  var listening = false;
  function listen(on){
    if(on === listening) return;
    listening = on;
    if(on){
      window.addEventListener('scroll', onScroll, { passive:true });
      window.addEventListener('resize', onResize);
      onResize();
    } else {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    }
  }

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      listen(entries[0].isIntersecting);
    }, { rootMargin: '200px 0px' }).observe(stage);
  } else {
    listen(true);
  }

  measure();
  render();
})();
