(function(){
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile menu
  var burger = document.getElementById('burgerBtn');
  var closeBtn = document.getElementById('closeMenuBtn');
  var menu = document.getElementById('mobileMenu');
  function setMenu(open){
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if(open) closeBtn.focus(); else burger.focus({ preventScroll:true });
  }
  burger.setAttribute('aria-expanded', 'false');
  burger.addEventListener('click', function(){ setMenu(true); });
  closeBtn.addEventListener('click', function(){ setMenu(false); });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ setMenu(false); });
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && menu.classList.contains('open')) setMenu(false);
  });

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

  // Reveal on scroll (with stagger for siblings)
  var revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var el = entry.target;
        var parent = el.parentElement;
        var idx = parent._staggerCount || 0;
        parent._staggerCount = idx + 1;
        el.style.transitionDelay = (idx * 0.12) + 's';
        el.classList.add('is-visible');
        io.unobserve(el);
      }
    });
  }, { threshold:0.15, rootMargin:'0px 0px -60px 0px' });
  revealEls.forEach(function(el){ io.observe(el); });

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
