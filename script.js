/* Aditya Raj, portfolio. Content comes from your Manager page (admin.html); the defaults in cloud.js show until you publish. */
const DATA = JSON.parse(JSON.stringify(DEFAULTS));
const PREVIEW = /[?&]preview/.test(location.search);   /* the Manager shows the site in a frame with ?preview */
if (PREVIEW) { document.documentElement.classList.add('ready', 'pv'); const n0 = document.getElementById('in'); if (n0) n0.remove(); }
const SKI = { 'html5': 'fa-brands fa-html5', 'css3': 'fa-brands fa-css3-alt', 'javascript': 'fa-brands fa-js', 'python': 'fa-brands fa-python', 'c & c++': 'fa-solid fa-terminal', 'java': 'fa-brands fa-java', 'mysql': 'fa-solid fa-database', 'coraldraw': 'fa-solid fa-pen-nib', 'figma': 'fa-brands fa-figma', 'android dev': 'fa-brands fa-android', 'aosp': 'fa-solid fa-microchip', 'graphic design': 'fa-solid fa-palette', 'ui/ux': 'fa-solid fa-vector-square', 'music production': 'fa-solid fa-sliders', 'photography': 'fa-solid fa-camera', 'cinematography': 'fa-solid fa-film', 'video editing': 'fa-solid fa-scissors' };
const pills = csv => String(csv || '').split(',').map(s => s.trim()).filter(Boolean).map(n => `<span><i class="${SKI[n.toLowerCase()] || 'fa-solid fa-bolt'}"></i>${esc(n)}</span>`).join('');

const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const pages=$$('.page'),links=$$('#dock a'),pill=$('.pill');let cur=0;
const go=i=>{const mv=i!==cur;cur=i;links.forEach((a,k)=>a.classList.toggle('on',k===i));pill.style.width=links[i].offsetWidth+'px';pill.style.transform=`translateX(${links[i].offsetLeft}px)`;if(mv){pill.classList.add('mv');clearTimeout(pill._t);pill._t=setTimeout(()=>pill.classList.remove('mv'),450)}};
const count=p=>$$('[data-n]',p).forEach(b=>{if(b._d)return;b._d=1;const n=+b.dataset.n,t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/1200);b.textContent=Math.round(n*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0)});
let lockNav=false;const io=new IntersectionObserver(es=>es.forEach(e=>{e.target.classList.toggle('in',e.isIntersecting);if(e.isIntersecting){if(!lockNav)go(pages.indexOf(e.target));count(e.target);if(e.target.id==='talk')place(1)}}),{root:$('main'),threshold:.6});
pages.forEach(p=>io.observe(p));addEventListener('resize',()=>{go(cur);place(1)});go(0);
if(document.fonts)document.fonts.ready.then(()=>{go(cur);place(1)});

/* About: duplicate each skills row so the loop is seamless */
$$('.trk').forEach(t=>t.innerHTML+=t.innerHTML);


/* Renderers: each one redraws a part of the page from DATA (static HTML stays as the fallback if the cloud is empty or offline) */
const AR=['4/5','1','3/4','5/6'],TT=[44,58,50,54,46],DD=[-8,-24,-15,-33,-4];
let tbs=[],tn=0,cats=[];
const place=snap=>{const b=tbs[tn],tp=$('.tp');if(!b||!tp)return;if(snap)tp.style.transition='none';tp.style.width=b.offsetWidth+'px';tp.style.transform=`translateX(${b.offsetLeft}px)`;if(snap){void tp.offsetWidth;tp.style.transition=''}};
const pick=(n,snap)=>{tn=n;tbs.forEach((b,k)=>{b.classList.toggle('on',k===n);b.setAttribute('aria-selected',k===n)});place(snap);
 $('#rows').innerHTML=DATA.contacts.filter(c=>c.cat===cats[n]).map((c,k)=>`<a style="--k:${k}" href="${esc(safe(c.link))}"${/^https?:/.test(c.link||'')?' target="_blank" rel="noopener"':''}${c.icon==='resume'?' download':''}><i class="l ${(ICONS[c.icon]||ICONS.link)[0]}"></i><span>${esc(c.title)}<small>${esc(c.note)}</small></span><i class="ar fa-solid fa-arrow-up-right-from-square"></i></a>`).join('')};
const arrows=()=>$$('#work .grp2').forEach(g=>{const r=$('.rail',g),a=$('.arr',g);if(a&&r)a.hidden=r.scrollWidth<=r.clientWidth+4});
$$('#work .arr button').forEach(b=>b.onclick=()=>{const r=b.closest('.grp2').querySelector('.rail');r.scrollBy({left:(b.dataset.d==='1'?1:-1)*r.clientWidth*.8,behavior:'smooth'})});
addEventListener('resize',arrows);
const R={
 hero(){const h=DATA.hero,i=$('.arch img');
  if(h.image){i.classList.remove('noimg');i.parentElement.classList.remove('noimg');i.src=cdn(h.image,900)}
  $('.live').innerHTML='<i></i>'+esc(h.status);const n=$$('h1 .ln i');n[0].textContent=h.line1;n[1].textContent=h.line2;$('.tag').innerHTML=em(h.tagline);
  [['Instagram','instagram'],['GitHub','github']].forEach(([l,k])=>{const x=DATA.socials.find(v=>v.icon===k&&v.link),a=$(`.cta a[aria-label="${l}"]`);if(x&&a)a.href=safe(x.link)})},
 about(){const a=DATA.about,st=$('.stats');
  $('#about .big').innerHTML=em(a.heading);$('.quote').innerHTML='“'+em(a.quote)+'”';
  st.style.gridTemplateColumns=`repeat(${a.stats.length||1},1fr)`;st.innerHTML=a.stats.map(s=>`<div><b data-n="${statVal(s,DATA.projects.length)}">0</b><span>${esc(s.label)}</span></div>`).join('');
  const t=$$('.trk');t[0].innerHTML=pills(a.dev);t[1].innerHTML=pills(a.creative);t.forEach(x=>x.innerHTML+=x.innerHTML);$('#about .btn').href=safe(a.resume)},
 work(){const AR={wide:['16/9',1.7778],square:['1/1',1],portrait:['3/4',.75]},C=DATA.creative||[];
  const card=(p,d)=>{const fit=p.fit==='contain',a=AR[p.shape]||AR[d],at=`class="card${fit?' fit':''}" style="--ar:${a[0]};--arn:${a[1]}"`,
   body=`<img src="${esc(cdn(p.image,800))}" alt="" loading="lazy">${p.tag?`<span class="tg">${esc(p.tag)}</span>`:''}<i class="go fa-solid ${p.url?'fa-arrow-right':'fa-expand'}"></i><h3 class="ct">${esc(p.title)}</h3>`;
   return p.url?`<a ${at} href="${esc(safe(p.url))}" target="_blank" rel="noopener">${body}</a>`:`<div ${at} role="button" tabindex="0" data-img="${esc(cdn(p.image,1400))}" aria-label="View ${esc(p.title)}">${body}</div>`};
  $('#rail1').innerHTML=DATA.projects.map(p=>card(p,'wide')).join('');$('#rail2').innerHTML=C.map(p=>card(p,'square')).join('');
  $('#w2').hidden=!C.length;$('#n1').textContent=String(DATA.projects.length).padStart(2,'0');$('#n2').textContent=String(C.length).padStart(2,'0');
  $('#work').style.setProperty('--rows',C.length?2:1);arrows()},
 frames(){const L=DATA.photos.list,P=L&&L.length?L:DEFAULTS.photos.list;
  $('#cols').innerHTML=[0,1,2,3,4].map(k=>{const set=[0,1,2].map(j=>`<img src="${esc(cdn(P[(k+2*j)%P.length],500))}" alt="" style="aspect-ratio:${AR[(k+j)%4]}">`).join('');return `<div class="col" style="--t:${TT[k]}s;--d:${DD[k]}s">${set}${set}</div>`}).join('');
  $('#insta').href=safe(DATA.photos.instagram)},
 music(){$('#spot').href=safe(DATA.music.spotify);$('#web').href=safe(DATA.music.website);loadSongs()},
 talk(){cats=[...new Set(DATA.contacts.map(c=>c.cat))];const tabs=$('#tabs');tn=Math.min(tn,Math.max(cats.length-1,0));
  tabs.innerHTML='<b class="tp"></b>'+cats.map(c=>`<button role="tab">${esc(c)}</button>`).join('');tbs=$$('button',tabs);tbs.forEach((b,k)=>b.onclick=()=>pick(k));pick(tn,1);
  $('#soc').innerHTML=DATA.socials.map(s=>{const i=(ICONS[s.icon]||ICONS.link)[0];return s.link?`<a href="${esc(safe(s.link))}" target="_blank" rel="noopener" aria-label="${esc(s.title)}"><i class="${i}"></i></a>`:`<span title="Link coming soon" aria-label="${esc(s.title)} (coming soon)"><i class="${i}"></i></span>`}).join('')}
};
R.seo=()=>{let e=$('#ld');if(!e){e=document.createElement('script');e.id='ld';e.type='application/ld+json';document.head.append(e)}
 e.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Person',name:DATA.hero.line1+' '+DATA.hero.line2,description:String(DATA.hero.tagline||'').replace(/\*/g,''),url:location.origin+location.pathname,sameAs:DATA.socials.filter(x=>x.link).map(x=>x.link)})};
const renderAll=()=>Object.entries(R).forEach(([k,f])=>{try{f()}catch(e){console.warn('[portfolio] section failed:',k,e)}});

/* Sound: reads songs.json from your music site, falls back to this list */
const B=DATA.music.website,A='Aditya Raj';let songs=[],si=0;
const FALL=[['Pyar Ho Na Jaye','pyar_ho_na_jaye.png','https://open.spotify.com/album/62bTAp0y8vpAfWr1LwAreg'],['Almost Yours','almost%20Yours.png',B],['Yaadein Teri','yaddain%20teri.jpg','https://open.spotify.com/track/1jP4JquRKRq1ssiE3tHiHe'],['Khwab Mere','khwab%20mere.jpg','https://open.spotify.com/track/2qvP8cmCcmN9gNSYLYJWWx'],['Dil Ki Baat','dil%20ki%20baat.jpg','https://open.spotify.com/track/0H9lyaDVMOngo2z0wd4dbG']].map(s=>({title:s[0],artist:A,cover:B+s[1],url:s[2]}));

const deck=$('#deck'),sl=$('#sleeve'),prog=$('#prog i');
const tick=()=>{prog.classList.remove('run');void prog.offsetWidth;prog.classList.add('run')};
const show=(i,dir=1,now)=>{si=(i+songs.length)%songs.length;const s=songs[si];
 const apply=()=>{sl.style.setProperty('--sx',dir>0?'26px':'-26px');sl.src=s.cover;$('#st').textContent=s.title;$('#stl').href=s.url||B;$('#sa').textContent=s.artist||A;
  $$('#thumbs button').forEach((b,k)=>b.classList.toggle('on',k===si));
  sl.classList.remove('ch');void sl.offsetWidth;sl.classList.add('ch');deck.classList.remove('swap');tick()};
 if(now)apply();else{deck.classList.add('swap');setTimeout(apply,320)}};
prog.addEventListener('animationend',()=>show(si+1));
const load=l=>{songs=l.slice(0,5);$('#thumbs').innerHTML=songs.map(s=>`<button aria-label="${s.title}"><img src="${s.cover}" alt=""></button>`).join('');show(0,1,1)};
$('#thumbs').onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=[...$('#thumbs').children].indexOf(b);if(k!==si)show(k,k>si?1:-1)};
let sx=0;const stg=$('.stage');stg.onpointerdown=e=>sx=e.clientX;stg.onpointerup=e=>{const d=e.clientX-sx;if(Math.abs(d)>45)show(si+(d<0?1:-1),d<0?1:-1)};
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
 stg.addEventListener('pointermove',e=>{const r=stg.getBoundingClientRect();deck.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*14+'deg');deck.style.setProperty('--rx',(.5-(e.clientY-r.top)/r.height)*10+'deg')});
 stg.addEventListener('pointerleave',()=>{deck.style.setProperty('--ry','0deg');deck.style.setProperty('--rx','0deg')})}
load(FALL);
let lastFeed='';const loadSongs=()=>{const u=DATA.music.feed;if(!u||u===lastFeed)return;lastFeed=u;fetch(u).then(r=>r.json()).then(j=>{const l=(Array.isArray(j)?j:j.items||[]).filter(x=>x.title&&x.cover);if(l.length)load(l)}).catch(()=>{})};

/* Liquid glass button: light follows the pointer; Chromium browsers also get real edge refraction */
const lg=$('.lg');
if(lg){
 ['pointermove','pointerdown'].forEach(t=>lg.addEventListener(t,e=>{const r=lg.getBoundingClientRect();lg.style.setProperty('--mx',e.clientX-r.left+'px');lg.style.setProperty('--my',e.clientY-r.top+'px')}));
 const ua=navigator.userAgent;
 if(/Chrome\//.test(ua)&&!/CriOS|FxiOS|EdgiOS/.test(ua)){
  const lens=()=>{const W=lg.offsetWidth,H=lg.offsetHeight;if(!W||!H)return;
   const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),im=x.createImageData(W,H),r=H/2,bz=r*.75;
   for(let j=0;j<H;j++)for(let i=0;i<W;i++){const px=i+.5,py=j+.5,cx=Math.min(Math.max(px,r),W-r),dx=px-cx,dy=py-r,L=Math.hypot(dx,dy)||1,d=r-L,k=d>=bz?0:Math.pow(1-Math.max(d,0)/bz,2),o=(j*W+i)*4;
    im.data[o]=128-127*k*dx/L;im.data[o+1]=128-127*k*dy/L;im.data[o+2]=128;im.data[o+3]=255}
   x.putImageData(im,0,0);
   const old=$('#lgsvg');if(old)old.remove();
   document.body.insertAdjacentHTML('beforeend',`<svg id="lgsvg" width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="lgf" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage href="${c.toDataURL()}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" result="m"/><feDisplacementMap in="SourceGraphic" in2="m" scale="26" xChannelSelector="R" yChannelSelector="G"/></filter></svg>`);
   lg.style.backdropFilter='url(#lgf) blur(4px) saturate(170%) brightness(1.06)'};
  (document.fonts?document.fonts.ready:Promise.resolve()).then(lens)}}


/* Start: the JS-built sections first, then your saved cloud content (cached copy at once, fresh copy right after) */
R.frames();R.talk();R.music();R.about();R.work();R.seo();
const apply=c=>{if(!c)return;fixStats(c);Object.keys(DEFAULTS).forEach(k=>{if(c[k]!==undefined)DATA[k]=Array.isArray(DEFAULTS[k])?c[k]:Object.assign({},DEFAULTS[k],c[k])});renderAll()};
if(!PREVIEW)try{apply(JSON.parse(localStorage.getItem('pf-content')))}catch(e){}
/* Add ?debug to your site address to see whether the cloud content is loading (and why not) */
const debugChip=d=>{if(!/[?&#]debug/.test(location.href))return;let c=$('#dbg');if(!c){c=document.createElement('div');c.id='dbg';c.style.cssText='position:fixed;left:10px;bottom:10px;z-index:99999;max-width:92vw;padding:9px 13px;border-radius:14px;font:12px/1.45 system-ui,sans-serif;background:#111;color:#fff;border:1px solid #333';document.body.appendChild(c)}c.style.borderColor=d.ok?'#7be07b':'#ff7a7a';c.textContent=(d.ok?'Cloud OK: ':'Cloud problem: ')+d.msg+(d.updated?' (published '+new Date(d.updated).toLocaleString()+')':'')};
const sync=()=>fetchContent().then(c=>{if(window.PF_STATUS)debugChip(window.PF_STATUS);if(!c)return;const j=JSON.stringify(c);if(j!==localStorage.getItem('pf-content')){apply(c);try{localStorage.setItem('pf-content',j)}catch(e){}}}).catch(e=>debugChip({ok:false,msg:String(e)}));
const first=PREVIEW?Promise.resolve():sync();document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!PREVIEW)sync()});
/* Live preview: the Manager sends its unpublished data to this page and tells it which page to show */
let pvPage='';
addEventListener('message',e=>{const d=e.data;if(e.origin!==location.origin||!d||d.pf!=='preview')return;apply(d.data);
 if(d.page&&d.page!==pvPage){pvPage=d.page;const p=document.getElementById(d.page),m=$('main');if(p&&m)m.scrollTo({top:p.getBoundingClientRect().top-m.getBoundingClientRect().top+m.scrollTop,behavior:'smooth'})}});

/* Desktop: glide from page to page with the mouse wheel, keys and the navbar (phones keep their own snap scrolling) */
const mainEl=$('main'),idx=()=>Math.round(mainEl.scrollTop/mainEl.clientHeight),still=matchMedia('(prefers-reduced-motion:reduce)').matches;
const desk=matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(max-height:560px)').matches;
let gliding=false,lastWheel=0;
const glideTo=i=>{i=Math.max(0,Math.min(pages.length-1,i));const from=mainEl.scrollTop,to=pages[i].getBoundingClientRect().top-mainEl.getBoundingClientRect().top+from;
 lockNav=true;go(i);if(still||Math.abs(to-from)<2){mainEl.scrollTop=to;lockNav=false;return}
 gliding=true;const dur=Math.min(1500,800+Math.abs(i-idx())*150),t0=performance.now();
 const step=t=>{const k=Math.min(1,(t-t0)/dur),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;mainEl.scrollTop=from+(to-from)*e;
  if(k<1)requestAnimationFrame(step);else{gliding=false;lockNav=false;go(idx())}};requestAnimationFrame(step)};
if(desk){
 document.documentElement.classList.add('glide');
 document.addEventListener('wheel',e=>{if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;e.preventDefault();const n=performance.now(),quiet=n-lastWheel>140;lastWheel=n;if(gliding||!quiet||Math.abs(e.deltaY)<6)return;glideTo(idx()+(e.deltaY>0?1:-1))},{passive:false});
 addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
  const d={ArrowDown:1,PageDown:1,' ':e.shiftKey?-1:1,ArrowUp:-1,PageUp:-1}[e.key];
  if(d){e.preventDefault();if(!gliding)glideTo(idx()+d)}else if(e.key==='Home'||e.key==='End'){e.preventDefault();if(!gliding)glideTo(e.key==='Home'?0:pages.length-1)}});
}
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;const p=document.getElementById(a.getAttribute('href').slice(1));if(!p||!p.classList.contains('page'))return;
 const i=pages.indexOf(p);if(desk){e.preventDefault();if(!gliding)glideTo(i)}else{lockNav=true;go(i);setTimeout(()=>{lockNav=false;go(idx())},700+Math.abs(i-idx())*200)}});

/* Loading: the intro waits for your content, fonts and images (7 s at most), then reveals the site */
(()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms)),ok=p=>Promise.resolve(p).then(()=>0,()=>0);
 const pic=i=>{i.loading='eager';return i.decode?i.decode().catch(()=>0):new Promise(r=>{if(i.complete)r();else i.onload=i.onerror=r})};
 let shown=false;
 const reveal=()=>{if(shown)return;shown=true;const n=$('#in');document.documentElement.classList.add('ready');
  if(n){n.classList.add('go');n.addEventListener('animationend',e=>{if(e.animationName==='fo')n.remove()});setTimeout(()=>n.remove(),2600)}};
 (async()=>{
  await Promise.race([ok(first),sleep(3500)]);
  await Promise.race([Promise.all([ok(document.fonts&&document.fonts.ready),...$$('img[src]').map(i=>ok(pic(i)))]),sleep(5000)]);
  await sleep(Math.max(0,2300-performance.now()));
  reveal()})();
 setTimeout(reveal,7500);
})();

/* Save contact: builds a .vcf from your Manager data (name, phone, email, links) */
$('#vc').onclick=()=>{const g=k=>(DATA.contacts.find(c=>c.icon===k)||{}).link||'',tel=(g('whatsapp').match(/wa\.me\/(\d+)/)||[])[1],mail=g('email').replace(/^mailto:/,''),n=DATA.hero;
 const L=['BEGIN:VCARD','VERSION:3.0',`N:${n.line2};${n.line1};;;`,`FN:${n.line1} ${n.line2}`,tel?`TEL;TYPE=CELL:+${tel}`:'',mail?`EMAIL:${mail}`:'',...DATA.socials.filter(x=>x.link).map(x=>'URL:'+x.link),'END:VCARD'].filter(Boolean);
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([L.join('\r\n')],{type:'text/vcard'}));a.download=(n.line1+'-'+n.line2).replace(/\s+/g,'-')+'.vcf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)};

/* Creativity pieces without a link open the picture full size */
const lb=$('#lb');
document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('.card[data-img]');if(c){$('img',lb).src=c.dataset.img;lb.classList.add('on');return}if(lb.classList.contains('on')&&e.target.closest&&e.target.closest('#lb'))lb.classList.remove('on')});
addEventListener('keydown',e=>{if(e.key==='Escape')lb.classList.remove('on');const a=document.activeElement;if(e.key==='Enter'&&a&&a.matches&&a.matches('.card[data-img]'))a.click()});

/* Custom cursor: a transparent ring that follows the mouse and grows over things you can press (mouse only) */
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
 const cur=document.createElement('div');cur.id='cur';document.body.append(cur);document.documentElement.classList.add('cur-on');
 let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y,run=0;
 const tick=()=>{cx+=(x-cx)*.14;cy+=(y-cy)*.14;cur.style.transform=`translate3d(${cx}px,${cy}px,0)`;if(Math.abs(x-cx)+Math.abs(y-cy)>.15)requestAnimationFrame(tick);else run=0};
 addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;x=e.clientX;y=e.clientY;cur.classList.add('on');if(!run){run=1;requestAnimationFrame(tick)}},{passive:true});
 document.addEventListener('pointerover',e=>cur.classList.toggle('hot',!!(e.target.closest&&e.target.closest('a,button,.card,.lg,[role=tab]'))));
 addEventListener('pointerdown',()=>cur.classList.add('down'));addEventListener('pointerup',()=>cur.classList.remove('down'));
 document.documentElement.addEventListener('mouseleave',()=>cur.classList.remove('on'));
}

/* Ripple on press (mouse + touch) and a glow that follows the pointer, on everything pressable */
const FX='.btn,.ic,.card,.lg,.tabs,.rows a,.soc a,.dock a';
const glow=(t,e)=>{const r=t.getBoundingClientRect();t.style.setProperty('--mx',e.clientX-r.left+'px');t.style.setProperty('--my',e.clientY-r.top+'px');
 if(!t.matches('.lg')&&!t.querySelector(':scope>.gl'))t.insertAdjacentHTML('afterbegin','<span class="gl"></span>');return r};
document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest(FX);if(!t)return;
 const r=glow(t,e),d=Math.max(r.width,r.height)*2.2,s=document.createElement('span');
 s.className='rp';s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;
 t.append(s);s.addEventListener('animationend',()=>s.remove());
 if(e.pointerType!=='mouse'&&navigator.vibrate)navigator.vibrate(8)},{passive:true});
document.addEventListener('pointermove',e=>{const t=e.target.closest&&e.target.closest(FX);if(t)glow(t,e)},{passive:true});

/* If an image file is missing, hide it so the placeholder shows instead of a broken icon */
document.addEventListener('error',e=>{const t=e.target;if(t.tagName==='IMG'){t.classList.add('noimg');t.parentElement.classList.add('noimg')}},true);
$$('img').forEach(i=>{if(i.getAttribute('src')&&i.complete&&!i.naturalWidth)i.dispatchEvent(new Event('error'))});
