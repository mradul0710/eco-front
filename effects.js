/* EcoTrace interaction engine: scroll progress, pinned horizontal storytelling, cursor, and parallax. */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  document.documentElement.classList.add('js-effects');

  // Top-of-page progress bar.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress'; progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  // Smooth trailing cursor on desktop; never blocks clicks or text selection.
  if (finePointer) {
    const dot = document.createElement('span'); dot.className = 'cursor-dot'; dot.setAttribute('aria-hidden', 'true');
    const ring = document.createElement('span'); ring.className = 'cursor-ring'; ring.setAttribute('aria-hidden', 'true');
    document.body.append(dot, ring);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    document.addEventListener('pointermove', e => { x=e.clientX; y=e.clientY; dot.style.left=x+'px'; dot.style.top=y+'px'; dot.style.opacity='1'; ring.style.opacity='1'; }, {passive:true});
    const tickCursor = () => { rx += (x-rx)*.16; ry += (y-ry)*.16; ring.style.left=rx+'px'; ring.style.top=ry+'px'; if(!reduceMotion) requestAnimationFrame(tickCursor); };
    if(!reduceMotion) requestAnimationFrame(tickCursor);
    document.addEventListener('pointerover', e => { if(e.target.closest('button,a,input,select,.drop-zone,.center-card')) ring.classList.add('is-hover'); });
    document.addEventListener('pointerout', e => { if(e.target.closest('button,a,input,select,.drop-zone,.center-card')) ring.classList.remove('is-hover'); });
    document.addEventListener('pointerdown', () => ring.classList.add('is-down'));
    document.addEventListener('pointerup', () => ring.classList.remove('is-down'));
    document.addEventListener('click', e => {
      if(reduceMotion || !e.isTrusted) return;
      for(let i=0;i<3;i++){const petal=document.createElement('span');petal.className='cursor-petal';petal.textContent=i===1?'✦':'❧';petal.style.left=e.clientX+'px';petal.style.top=e.clientY+'px';petal.style.setProperty('--dx',(Math.random()*58-29)+'px');petal.style.setProperty('--dy',(-20-Math.random()*48)+'px');document.body.appendChild(petal);setTimeout(()=>petal.remove(),950);}
    });
  }

  // Reveal content on entry. Fallback leaves everything visible if IntersectionObserver is unavailable.
  const revealSelector = '.welcome-row,.hero-panel,.section-heading,.stat-card,.home-lower-grid,.page-intro,.surface,.guide-card,.impact-hero,.app-footer';
  const seen = new WeakSet();
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}
  }), {threshold:.08, rootMargin:'0px 0px -25px 0px'}) : null;
  function prepare(root=document){root.querySelectorAll(revealSelector).forEach(el=>{if(seen.has(el))return;seen.add(el);el.classList.add('reveal');if(observer)observer.observe(el);else el.classList.add('in-view');});}
  prepare();
  if('MutationObserver' in window){const mo=new MutationObserver(()=>document.querySelectorAll('.page.active-page').forEach(prepare));document.querySelectorAll('.page').forEach(page=>mo.observe(page,{attributes:true,attributeFilter:['class']}));}

  // VOID-style pinned horizontal scroll: three scenes advance as the user scrolls through the tall story section.
  const story = document.getElementById('ecoStory');
  const track = document.getElementById('storyTrack');
  const storyProgress = document.getElementById('storyProgress');
  const storyNumber = document.getElementById('storyNumber');
  const storyArts = story ? [...story.querySelectorAll('[data-depth]')] : [];
  let rafPending = false;
  function clamp(v,min,max){return Math.min(max,Math.max(min,v));}
  function updateScroll(){
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (maxScroll>0 ? clamp(scrollY/maxScroll*100,0,100) : 0)+'%';
    if(story && track && innerWidth>900 && !reduceMotion){
      const rect=story.getBoundingClientRect();
      const travel=Math.max(1,story.offsetHeight-innerHeight+32);
      const passed=clamp((innerHeight-rect.top-32)/travel,0,1);
      track.style.transform=`translate3d(${-passed*66.6667}%,0,0)`;
      if(storyProgress) storyProgress.style.width=(passed*100)+'%';
      if(storyNumber) storyNumber.textContent=String(Math.min(3,Math.floor(passed*3)+1)).padStart(2,'0');
      storyArts.forEach(el=>{const depth=Number(el.dataset.depth)||0;el.style.setProperty('--story-y',`${(passed-.5)*depth}px`);el.style.setProperty('--story-x',`${(passed-.5)*depth*.4}px`);});
    } else if(story && innerWidth<=900){if(storyProgress)storyProgress.style.width='100%';}
    const hero=document.querySelector('.hero-panel');
    if(hero && !reduceMotion){const r=hero.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const amount=clamp((innerHeight-r.top)/(innerHeight+r.height),0,1);hero.style.setProperty('--hero-scroll',`${(amount-.5)*-18}px`);const art=hero.querySelector('.hero-art');if(art)art.style.transform=`translate3d(0,${(amount-.5)*-24}px,0)`;}}
    rafPending=false;
  }
  function onScroll(){if(!rafPending){rafPending=true;requestAnimationFrame(updateScroll);}}
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});updateScroll();

  // Pointer parallax on the hero and story illustrations.
  if(finePointer && !reduceMotion){document.addEventListener('pointermove',e=>{
    const hero=document.querySelector('.hero-panel');if(hero){const r=hero.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;hero.style.setProperty('--pointer-x',(px*8).toFixed(1)+'px');hero.style.setProperty('--pointer-y',(py*8).toFixed(1)+'px');}}
  },{passive:true});}

  // If navigation swaps a hidden app page, reveal its content again and restart its viewport checks.
  document.addEventListener('click',e=>{if(e.target.closest('[data-route]'))setTimeout(()=>{const active=document.querySelector('.page.active-page');if(active){prepare(active);if(observer)active.querySelectorAll('.reveal:not(.in-view)').forEach(el=>observer.observe(el));}onScroll();},80);});
})();
