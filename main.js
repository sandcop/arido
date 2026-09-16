(function(){
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile menu
  var burger = document.getElementById('burgerBtn');
  var closeBtn = document.getElementById('closeMenuBtn');
  var menu = document.getElementById('mobileMenu');
  burger.addEventListener('click', function(){ menu.classList.add('open'); });
  closeBtn.addEventListener('click', function(){ menu.classList.remove('open'); });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ menu.classList.remove('open'); });
  });

  // Nav sits low (aligned with the hero frame) at the top, then tucks up higher once scrolled.
  // It only hides once you've scrolled past the hero, sliding away (not fading);
  // scrolling up brings it back immediately.
  var navEl = document.getElementById('nav');
  var navHeroSection = document.getElementById('top');
  var lastScrollY = window.scrollY;
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

  // Contact form -> mailto fallback. La sección "Hablemos" ya no lleva formulario
  // (se simplificó a solo título + playa), así que el elemento puede no existir.
  var form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('name').value;
      var email = document.getElementById('email').value;
      var message = document.getElementById('message').value;
      var subject = encodeURIComponent('Consulta desde la web — ' + name);
      var body = encodeURIComponent(message + '\n\nEmail de contacto: ' + email);
      window.location.href = 'mailto:david@aridocafe.cl?subject=' + subject + '&body=' + body;
    });
  }
})();
