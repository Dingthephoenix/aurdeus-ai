(() => {
  const cfg = window.AURDEUS_CONFIG;
  const urlFor = key => {
    const u = new URL(cfg.workbenchBase, location.href);
    if (cfg.workbenchMode === 'local-demo' && key !== 'home') u.searchParams.set('view',key);
    else if (cfg.workbenchMode === 'app-routes') u.pathname = key === 'home' ? '/workspace' : '/w/'+key;
    return u.href;
  };
  document.querySelectorAll('[data-workspace]').forEach(a=>a.href=urlFor(a.dataset.workspace));
  document.querySelectorAll('.header-solutions').forEach(menu=>{
    const button=menu.querySelector('.header-workspace');
    const setOpen=open=>button.setAttribute('aria-expanded',String(open));
    menu.addEventListener('pointerenter',()=>setOpen(true));
    menu.addEventListener('pointerleave',()=>setOpen(false));
    menu.addEventListener('focusin',()=>setOpen(true));
    menu.addEventListener('focusout',e=>{if(!menu.contains(e.relatedTarget))setOpen(false);});
  });
  document.querySelectorAll('.ip-gallery').forEach(gallery=>{
    const viewport=gallery.querySelector('.ip-viewport');
    const track=gallery.querySelector('.ip-track');
    const slides=[...gallery.querySelectorAll('.ip-slide')];
    if(slides.length<2) return;
    const dots=[...gallery.querySelectorAll('[data-ip-slide]')];
    const status=gallery.querySelector('[data-ip-status]');
    const names=slides.map(slide=>slide.dataset.name||'');
    let current=0;
    function showSlide(index){
      current=(index+slides.length)%slides.length;
      track.style.transform=`translateX(-${current*100}%)`;
      slides.forEach((slide,i)=>slide.setAttribute('aria-hidden',String(i!==current)));
      dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));
      if(status) status.textContent=`第 ${current+1} 张，共 ${slides.length} 张：${names[current]}`;
    }
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>showSlide(i)));
    const prev=gallery.querySelector('[data-ip-prev]');
    const next=gallery.querySelector('[data-ip-next]');
    if(prev) prev.addEventListener('click',e=>{if(e.detail===0) showSlide(current-1);});
    if(next) next.addEventListener('click',e=>{if(e.detail===0) showSlide(current+1);});
    viewport.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      e.preventDefault();showSlide(e.key==='Home'?0:e.key==='End'?slides.length-1:current+(e.key==='ArrowRight'?1:-1));
    });
    let start=null;
    viewport.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||e.target.closest('.ip-case'))return;start={x:e.clientX,y:e.clientY,id:e.pointerId};viewport.setPointerCapture(e.pointerId);});
    viewport.addEventListener('pointerup',e=>{
      if(!start||e.pointerId!==start.id)return;
      const dx=e.clientX-start.x,dy=e.clientY-start.y;
      start=null;
      if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){showSlide(current+(dx<0?1:-1));return;}
      if(Math.abs(dx)>8||Math.abs(dy)>8)return;
      const rect=viewport.getBoundingClientRect();
      showSlide(current+(e.clientX>=rect.left+rect.width/2?1:-1));
    });
    viewport.addEventListener('pointercancel',()=>start=null);
    if(gallery.closest('#products')&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      let timer=0;
      let paused=false;
      const stop=()=>{window.clearInterval(timer);timer=0;};
      const play=()=>{if(!timer&&!paused&&!document.hidden) timer=window.setInterval(()=>showSlide(current+1),3000);};
      viewport.addEventListener('pointerenter',()=>{paused=true;stop();});
      viewport.addEventListener('pointerleave',()=>{paused=false;play();});
      document.addEventListener('visibilitychange',()=>{if(document.hidden) stop(); else play();});
      play();
    }
  });
  initBeamButtons();
  function initBeamButtons(){
    const buttons=[...document.querySelectorAll('.beam-btn')];
    if(!buttons.length) return;
    const ns='http://www.w3.org/2000/svg';
    const defs=document.createElementNS(ns,'svg');
    defs.setAttribute('class','beam-btn__defs');
    defs.setAttribute('aria-hidden','true');
    const filter=document.createElementNS(ns,'filter');
    filter.setAttribute('id','beam-glow');
    filter.setAttribute('x','-50%');
    filter.setAttribute('y','-50%');
    filter.setAttribute('width','200%');
    filter.setAttribute('height','200%');
    filter.setAttribute('color-interpolation-filters','sRGB');
    const blur=document.createElementNS(ns,'feGaussianBlur');
    blur.setAttribute('stdDeviation','1.15');
    filter.appendChild(blur);
    const defsEl=document.createElementNS(ns,'defs');
    defsEl.appendChild(filter);
    defs.appendChild(defsEl);
    document.body.prepend(defs);
    buttons.forEach(button=>{
      const svg=document.createElementNS(ns,'svg');
      svg.setAttribute('class','beam-btn__ring');
      svg.setAttribute('aria-hidden','true');
      svg.setAttribute('focusable','false');
      const rects=['beam-btn__track','beam-btn__glow','beam-btn__tail','beam-btn__mid','beam-btn__head'].map(cls=>{
        const rect=document.createElementNS(ns,'rect');
        rect.setAttribute('class',cls);
        rect.setAttribute('pathLength','100');
        rect.setAttribute('fill','none');
        if(cls==='beam-btn__glow') rect.setAttribute('filter','url(#beam-glow)');
        svg.appendChild(rect);
        return rect;
      });
      button.prepend(svg);
      const fit=()=>{
        const w=Math.max(1,button.offsetWidth);
        const h=Math.max(1,button.offsetHeight);
        const inset=0.75;
        svg.setAttribute('width',String(w));
        svg.setAttribute('height',String(h));
        svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
        rects.forEach(rect=>{
          rect.setAttribute('x',String(inset));
          rect.setAttribute('y',String(inset));
          rect.setAttribute('width',String(Math.max(0,w-inset*2)));
          rect.setAttribute('height',String(Math.max(0,h-inset*2)));
          rect.setAttribute('rx',String((h-inset*2)/2));
        });
      };
      fit();
      button.classList.add('is-ready');
      new ResizeObserver(fit).observe(button);
    });
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(entries=>{
        entries.forEach(entry=>entry.target.classList.toggle('is-paused',!entry.isIntersecting));
      });
      buttons.forEach(button=>io.observe(button));
    }
  }
  const header=document.querySelector('.immersive-page .site-header');
  const heroSection=document.querySelector('.photo-hero');
  if(header){
    let last=window.scrollY;
    const syncHeader=()=>{
      const y=window.scrollY;
      const edge=heroSection?Math.max(0,heroSection.offsetHeight-header.offsetHeight):80;
      header.classList.toggle('is-solid',y>edge);
      if(y<8)header.classList.remove('is-hidden');
      else if(y>last+6)header.classList.add('is-hidden');
      else if(y<last-6)header.classList.remove('is-hidden');
      last=y;
    };
    header.addEventListener('focusin',()=>header.classList.remove('is-hidden'));
    syncHeader();
    window.addEventListener('scroll',syncHeader,{passive:true});
  }
  const year=document.getElementById('year');
  if(year) year.textContent=new Date().getFullYear();
  const heroSlides=[...document.querySelectorAll('.hero-slide')];
  if(heroSlides.length>1&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    let index=0;
    let timer=0;
    const show=n=>{
      index=(n+heroSlides.length)%heroSlides.length;
      heroSlides.forEach((slide,i)=>slide.classList.toggle('is-active',i===index));
    };
    const stop=()=>{window.clearInterval(timer);timer=0;};
    const play=()=>{if(!timer&&!document.hidden)timer=window.setInterval(()=>show(index+1),3000);};
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else play();});
    play();
  }
  const copyEmail=document.getElementById('copy-email');
  if(copyEmail) copyEmail.addEventListener('click',async()=>{
    const status=document.getElementById('copy-status');
    try{await navigator.clipboard.writeText(cfg.email);status.textContent='邮箱已复制';}
    catch{const range=document.createRange();range.selectNodeContents(document.querySelector('.email-link'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent='请复制选中的邮箱地址';}
  });
})();
