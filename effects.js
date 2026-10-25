/* EcoTrace interaction layer: cursor, scroll reveal and subtle parallax. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js-effects');
  const progress = document.createElement('div'); progress.className = 'scroll-progress'; progress.setAttribute('aria-hidden','true'); document.body.appendChild(progress);

  // Desktop-only custom cursor: warm amber point with a softly trailing sage ring.
  let dot, ring, pointerX = innerWidth/2, pointerY = innerHeight/2, ringX = pointerX, ringY = pointerY;
  if (matchMedia('(pointer:fine)').matches) {
    dot = document.createElement('div'); dot.className = 'cursor-dot'; dot.setAttribute('aria-hidden','true');
    ring = document.createElement('div'); ring.className = 'cursor-ring'; ring.setAttribute('aria-hidden','true');
    document.body.append(dot, ring);
    window.addEventListener('pointermove', e => {
      pointerX = e.clientX; pointerY = e.clientY;
      dot.style.left = pointerX + 'px'; dot.style.top = pointerY + 'px'; dot.style.opacity = '1'; ring.style.opacity = '1';
    }, {passive:true});
    const animateCursor = () => {
      ringX += (pointerX - ringX) * .16; ringY += (pointerY - ringY) * .16;
      ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px';
      requestAnimationFrame(animateCursor);
    }; if (!reduceMotion) requestAnimationFrame(animateCursor);
    document.addEventListener('pointerover', e => { if(e.target.closest('button,a,input,select,.drop-zone,.center-card')) ring.classList.add('cursor-hover'); });
    document.addEventListener('pointerout', e => { if(e.target.closest('button,a,input,select,.drop-zone,.center-card')) ring.classList.remove('cursor-hover'); });
    document.addEventListener('pointerdown', () => ring.classList.add('cursor-click'));
    document.addEventListener('pointerup', () => ring.classList.remove('cursor-click'));
    document.addEventListener('click', e => {
      if (reduceMotion || !e.isTrusted) return;
      const leaf = document.createElement('span'); leaf.className = 'cursor-leaf'; leaf.textContent = Math.random() > .5 ? '✦' : '❧';
      leaf.style.left = e.clientX + 'px'; leaf.style.top = e.clientY + 'px';
      leaf.style.setProperty('--leaf-x', (Math.random()*54-27)+'px'); leaf.style.setProperty('--leaf-y', (-22-Math.random()*42)+'px');
      document.body.appendChild(leaf); setTimeout(() => leaf.remove(), 850);
    });
  }

  // Give the home story depth without affecting the dashboard's API or routing.
  const hero = document.querySelector('.hero-panel');
  const art = document.querySelector('.hero-art');
  if (hero && art) {
    ['leaf-left','leaf-right'].forEach((name, i) => { const leaf = document.createElement('span'); leaf.className = 'parallax-leaf '+name; leaf.textContent = i ? '❧' : '✦'; leaf.setAttribute('aria-hidden','true'); hero.appendChild(leaf); });
    if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect(); const x = (e.clientX-r.left)/r.width-.5; const y=(e.clientY-r.top)/r.height-.5;
        art.style.setProperty('--art-x', (x*15).toFixed(1)+'px'); art.style.setProperty('--art-y', (y*13).toFixed(1)+'px');
      });
      hero.addEventListener('pointerleave', () => { art.style.setProperty('--art-x','0px'); art.style.setProperty('--art-y','0px'); });
    }
  }

  // Scroll reveal on sections/cards; re-check whenever app navigation switches pages.
  const selectors = '.welcome-row,.hero-panel,.section-heading,.stat-card,.home-lower-grid,.page-intro,.surface,.guide-card,.impact-hero,.app-footer';
  const revealTargets = new WeakSet();
  const observer = ('IntersectionObserver' in window) ? new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
  }), {threshold:.08, rootMargin:'0px 0px -35px 0px'}) : null;
  function prepareReveals(root=document) {
    root.querySelectorAll(selectors).forEach(el => {
      if (revealTargets.has(el)) return; revealTargets.add(el); el.classList.add('reveal');
      if (observer) observer.observe(el); else el.classList.add('in-view');
    });
  }
  prepareReveals();
  const appObserver = new MutationObserver(() => {
    document.querySelectorAll('.page.active-page').forEach(page => { prepareReveals(page); page.querySelectorAll('.reveal').forEach(el => { if(observer && !el.classList.contains('in-view')) observer.observe(el); }); });
  });
  document.querySelectorAll('.page').forEach(page => appObserver.observe(page,{attributes:true,attributeFilter:['class']}));

  let ticking = false;
  function onScroll() {
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (scrollable > 0 ? Math.min(100, scrollY/scrollable*100) : 0) + '%';
    if (hero && !reduceMotion) {
      const r = hero.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) hero.style.setProperty('--hero-scroll', ((r.top-innerHeight)*-.035).toFixed(1)+'px');
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => { if(!ticking){ticking=true;requestAnimationFrame(onScroll);} }, {passive:true}); onScroll();
})();
