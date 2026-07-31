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

  // Hero logo moves up and fades as the hero is scrolled past;
  // the navbar brand lockup crossfades in right as it finishes disappearing
  var heroLogo = document.getElementById('heroLogo');
  var heroSection = document.getElementById('top');
  var navBrandWord = document.getElementById('navBrandWord');
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(heroLogo && heroSection && !prefersReduced){
    var heroTicking = false;
    function updateHeroLogo(){
      var progress = Math.min(Math.max(window.scrollY / (heroSection.offsetHeight * 0.35), 0), 1);
      var scale = 1 + progress * 0.6;
      heroLogo.style.transform = 'translateY(' + (progress * -260) + 'px) scale(' + scale + ')';
      heroLogo.style.opacity = String(1 - progress * 1.3);
      if(navBrandWord){
        var brandProgress = Math.min(Math.max((progress - 0.8) / 0.2, 0), 1);
        navBrandWord.classList.toggle('is-visible', brandProgress > 0.5);
      }
      heroTicking = false;
    }
    window.addEventListener('scroll', function(){
      if(!heroTicking){
        requestAnimationFrame(updateHeroLogo);
        heroTicking = true;
      }
    }, { passive:true });
    updateHeroLogo();
  } else if(navBrandWord){
    navBrandWord.classList.add('is-visible');
  }

  // Contact form -> mailto fallback
  var form = document.getElementById('contactForm');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var message = document.getElementById('message').value;
    var subject = encodeURIComponent('Consulta desde la web — ' + name);
    var body = encodeURIComponent(message + '\n\nEmail de contacto: ' + email);
    window.location.href = 'mailto:david@aridocafe.cl?subject=' + subject + '&body=' + body;
  });
})();
