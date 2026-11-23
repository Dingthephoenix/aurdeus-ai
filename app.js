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
  const heroSlides=[...document.querySelectorAll('.hero-track video')];
  const hero=document.querySelector('.photo-hero');
  if(heroSlides.length&&hero){
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const slats=[...document.querySelectorAll('#hero-blinds rect')];
    const slatCount=slats.length||1;
    const passMs=1000;
    const slatMs=420;
    const staggerMs=slatCount>1?(passMs-slatMs)/(slatCount-1):0;
    let index=0;
    let passing=false;
    let armTimer=0;
    let raf=0;
    const ease=t=>t<=0?0:t>=1?1:1-Math.pow(1-t,1.45);
    const playIndex=reset=>{
      const video=heroSlides[index];
      if(reset) video.currentTime=0;
      if(reduce||document.hidden) return;
      const pending=video.play();
      if(pending) pending.catch(()=>{});
    };
    const clearClip=video=>{
      video.style.clipPath='';
      video.style.webkitClipPath='';
    };
    const paintBlinds=elapsed=>{
      const band=1/slatCount;
      slats.forEach((rect,i)=>{
        const local=ease(Math.min(1,Math.max(0,(elapsed-i*staggerMs)/slatMs)));
        const y=i*band;
        rect.setAttribute('x','0');
        rect.setAttribute('y',y.toFixed(4));
        rect.setAttribute('width',local.toFixed(4));
        rect.setAttribute('height',(i===slatCount-1?1-y:band+0.004).toFixed(4));
      });
    };
    const showActive=()=>{
      heroSlides.forEach((video,i)=>{
        const on=i===index;
        video.classList.toggle('is-active',on);
        video.classList.remove('is-entering');
        clearClip(video);
        if(!on) video.pause();
      });
    };
    const schedule=()=>{
      window.clearTimeout(armTimer);
      if(reduce||passing||document.hidden) return;
      const video=heroSlides[index];
      if(!Number.isFinite(video.duration)||video.duration<=0) return;
      const ms=(video.duration-video.currentTime)*1000-1000;
      if(ms<=30) beginPass();
      else armTimer=window.setTimeout(schedule,ms);
    };
    const finishPass=()=>{
      if(!passing) return;
      passing=false;
      window.clearTimeout(armTimer);
      window.cancelAnimationFrame(raf);
      showActive();
      schedule();
    };
    const beginPass=()=>{
      if(passing||reduce||heroSlides.length<2||document.hidden) return;
      const outgoing=heroSlides[index];
      if(!Number.isFinite(outgoing.duration)) return;
      if(outgoing.duration-outgoing.currentTime>1.08){schedule();return;}
      passing=true;
      window.clearTimeout(armTimer);
      index=(index+1)%heroSlides.length;
      const incoming=heroSlides[index];
      if(Number.isFinite(incoming.duration)) incoming.currentTime=0;
      paintBlinds(0);
      incoming.classList.add('is-entering');
      const pending=incoming.play();
      if(pending) pending.catch(()=>{});
      const started=performance.now();
      const tick=now=>{
        if(!passing) return;
        const elapsed=now-started;
        paintBlinds(elapsed);
        if(elapsed<passMs) raf=window.requestAnimationFrame(tick);
        else finishPass();
      };
      raf=window.requestAnimationFrame(tick);
    };
    heroSlides.forEach(video=>{
      video.addEventListener('ended',()=>{
        if(passing||heroSlides.length<2||video!==heroSlides[index]) return;
        if(reduce){
          index=(index+1)%heroSlides.length;
          showActive();
          playIndex(true);
          schedule();
          return;
        }
        beginPass();
      });
      video.addEventListener('loadedmetadata',schedule);
      video.addEventListener('playing',schedule);
      video.addEventListener('waiting',schedule);
      video.addEventListener('seeked',schedule);
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){
        window.clearTimeout(armTimer);
        heroSlides.forEach(video=>video.pause());
        if(passing) finishPass();
      }else{
        playIndex(false);
        schedule();
      }
    });
    showActive();
    playIndex(false);
    schedule();
  }
  const lead=document.getElementById('lead');
  const leadForm=document.getElementById('lead-form');
  if(lead&&leadForm){
    const panel=lead.querySelector('.lead__panel');
    const error=document.getElementById('lead-error');
    const done=lead.querySelector('.lead__done');
    const nameLabel=leadForm.querySelector('[data-name-label]');
    const company=leadForm.elements.company;
    const person=leadForm.elements.name;
    const email=leadForm.elements.email;
    const phone=leadForm.elements.phone;
    let opener=null;
    const fields=[company,person,email,phone];
    const emailOk=value=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    const phoneOk=value=>{
      const compact=value.replace(/[\s-]/g,'');
      return /^(?:\+?86)?1[3-9]\d{9}$/.test(compact)||/^0\d{2,3}-?\d{7,8}$/.test(value.replace(/\s/g,''));
    };
    const focusables=()=>[...panel.querySelectorAll('button,input')].filter(el=>!el.disabled&&el.offsetParent!==null&&!el.closest('[hidden]'));
    const syncAudience=()=>{
      const enterprise=leadForm.audience.value==='company';
      lead.classList.toggle('is-person',!enterprise);
      nameLabel.textContent=enterprise?'联系人':'姓名';
      company.disabled=!enterprise;
    };
    const showForm=()=>{
      done.hidden=true;
      leadForm.hidden=false;
    };
    const reduceLead=window.matchMedia('(prefers-reduced-motion: reduce)');
    let closeTimer=0;
    const fieldError=field=>document.getElementById(`${field.id}-error`);
    const clearErrors=()=>{
      fields.forEach(item=>{
        item.removeAttribute('aria-invalid');
        const note=fieldError(item);
        if(note) note.textContent='';
      });
      error.textContent='';
    };
    const showErrors=problems=>{
      clearErrors();
      problems.forEach(([field,message])=>{
        field.setAttribute('aria-invalid','true');
        const note=fieldError(field);
        if(note) note.textContent=message;
      });
      if(problems.length>1) error.textContent=`还有 ${problems.length} 项需要修改`;
      problems[0][0].focus();
    };
    const openLead=()=>{
      window.clearTimeout(closeTimer);
      opener=document.activeElement;
      showForm();
      syncAudience();
      clearErrors();
      lead.classList.remove('is-closing');
      lead.hidden=false;
      document.body.classList.add('lead-open');
      void lead.offsetWidth;
      lead.classList.add('is-open');
      leadForm.querySelector(`input[value="${leadForm.audience.value}"]`).focus();
    };
    const closeLead=()=>{
      if(lead.hidden||lead.classList.contains('is-closing')) return;
      lead.classList.remove('is-open');
      lead.classList.add('is-closing');
      document.body.classList.remove('lead-open');
      closeTimer=window.setTimeout(()=>{
        lead.hidden=true;
        lead.classList.remove('is-closing');
        clearErrors();
      },reduceLead.matches?0:230);
      if(opener&&opener.focus) opener.focus({preventScroll:true});
    };
    document.querySelectorAll('[data-lead-open]').forEach(button=>button.addEventListener('click',openLead));
    lead.querySelectorAll('[data-lead-close]').forEach(button=>button.addEventListener('click',closeLead));
    leadForm.audience.forEach(input=>input.addEventListener('change',()=>{syncAudience();clearErrors();}));
    lead.addEventListener('keydown',event=>{
      if(event.key==='Escape'){closeLead();return;}
      if(event.key!=='Tab') return;
      const items=focusables();
      if(!items.length) return;
      const first=items[0];
      const last=items[items.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
    leadForm.addEventListener('submit',event=>{
      event.preventDefault();
      const enterprise=leadForm.audience.value==='company';
      const name=person.value.trim();
      const mail=email.value.trim();
      const tel=phone.value.trim();
      const org=company.value.trim();
      const problems=[];
      if(enterprise&&!org) problems.push([company,'请填写企业名称']);
      if(!name) problems.push([person,enterprise?'请填写联系人姓名':'请填写您的姓名']);
      if(!mail) problems.push([email,'请填写邮箱']);
      else if(!emailOk(mail)) problems.push([email,'请填写正确的邮箱地址']);
      if(!tel) problems.push([phone,'请填写电话号码']);
      else if(!phoneOk(tel)) problems.push([phone,'请填写正确的电话号码']);
      if(problems.length) return showErrors(problems);
      clearErrors();
      const lines=[
        `用户类型：${enterprise?'企业用户':'个人用户'}`,
        enterprise?`企业名称：${org}`:'',
        `${enterprise?'联系人':'姓名'}：${name}`,
        `邮箱：${mail}`,
        `电话号码：${tel}`
      ].filter(Boolean);
      const mailLink=document.createElement('a');
      mailLink.href=`mailto:${cfg.email}?subject=${encodeURIComponent('AURDEUS 咨询')}&body=${encodeURIComponent(lines.join('\n'))}`;
      mailLink.click();
      leadForm.reset();
      leadForm.audience.value='company';
      syncAudience();
      leadForm.hidden=true;
      done.hidden=false;
      done.querySelector('button').focus();
    });
  }
  const copyEmail=document.getElementById('copy-email');
  if(copyEmail) copyEmail.addEventListener('click',async()=>{
    const status=document.getElementById('copy-status');
    try{await navigator.clipboard.writeText(cfg.email);status.textContent='邮箱已复制';}
    catch{const range=document.createRange();range.selectNodeContents(document.querySelector('.email-link'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent='请复制选中的邮箱地址';}
  });
})();
