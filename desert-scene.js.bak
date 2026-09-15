/* Desert sunset scene for #nosotros.
   Two motions share one scroll read per frame:
     - assembly: each layer enters in sequence, back to front, as the section scrolls in
     - parallax: once assembled, layers drift at speeds set by their depth
   Terrain and sky slide up into place; cacti grow from their base, which reads more
   naturally for a cactus than drifting in. */
(function(){
  var section = document.getElementById('nosotros');
  var scene = document.getElementById('desert');
  if(!section || !scene) return;

  var layers = [].slice.call(scene.querySelectorAll('.desert-layer')).map(function(el){
    return {
      el: el,
      lag: parseFloat(el.getAttribute('data-parallax')) || 0,
      inAt: parseFloat(el.getAttribute('data-in')) || 0,
      span: parseFloat(el.getAttribute('data-span')) || 0.12,
      isCactus: el.classList.contains('desert-cactus')
    };
  });
  if(!layers.length) return;

  // Peak travel in px for a layer of lag 1.0, reached at either end of the passage.
  // The terrain bands carry a matching block of colour below their artwork, so they can
  // ride up this far without opening a notch at the ground line.
  var TRAVEL = 840;

  function settle(layer){
    layer.el.style.opacity = '1';
    layer.el.style.transform = 'none';
  }

  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    layers.forEach(settle);
    return;
  }

  // Hiding the layers is gated on this attribute rather than baked into the
  // stylesheet, so if this script never runs the scene still renders assembled
  // instead of staying invisible.
  scene.setAttribute('data-anim', '1');

  function ease(t){ return 1 - Math.pow(1 - t, 3); }

  function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }

  function render(){
    var rect = section.getBoundingClientRect();
    var vh = window.innerHeight;

    // passage: 0 -> 1 across the section's whole travel through the viewport. Both the
    // assembly and the drift key off it, so each layer's entrance can be placed anywhere
    // along the scroll rather than being crowded into the moment the section appears.
    var passage = clamp01((vh - rect.top) / ((vh + rect.height) || 1));
    var drift = (passage - 0.5) * 2 * TRAVEL;

    for(var i = 0; i < layers.length; i++){
      var layer = layers[i];
      var t = ease(clamp01((passage - layer.inAt) / layer.span));

      var y = drift * layer.lag;
      if(layer.isCactus){
        // sprout from the ground: the CSS puts transform-origin at the bottom edge
        layer.el.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0) scaleY(' + t.toFixed(4) + ')';
      } else {
        layer.el.style.transform = 'translate3d(0,' + (y + (1 - t) * 70).toFixed(2) + 'px,0)';
      }
      layer.el.style.opacity = t.toFixed(3);
    }
  }

  var ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      render();
      ticking = false;
    });
  }

  // Only listen while the scene is anywhere near the viewport.
  var listening = false;
  function listen(on){
    if(on === listening) return;
    listening = on;
    if(on){
      window.addEventListener('scroll', onScroll, { passive:true });
      window.addEventListener('resize', onScroll);
      onScroll();
    } else {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  }

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      listen(entries[0].isIntersecting);
    }, { rootMargin: '200px 0px' }).observe(section);
  } else {
    listen(true);
  }

  render();
})();
