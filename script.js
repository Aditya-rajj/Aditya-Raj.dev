const DATA = JSON.parse(JSON.stringify(DEFAULTS));
const PREVIEW = /[?&]preview/.test(location.search);

if (PREVIEW) {
  document.documentElement.classList.add('ready', 'pv');
  const intro = document.getElementById('in');
  if (intro) intro.remove();
}

const SKI = {
  'html5': 'fa-brands fa-html5',
  'css3': 'fa-brands fa-css3-alt',
  'javascript': 'fa-brands fa-js',
  'python': 'fa-brands fa-python',
  'c & c++': 'fa-solid fa-terminal',
  'java': 'fa-brands fa-java',
  'mysql': 'fa-solid fa-database',
  'coraldraw': 'fa-solid fa-pen-nib',
  'coreldraw': 'fa-solid fa-pen-nib',
  'figma': 'fa-brands fa-figma',
  'android dev': 'fa-brands fa-android',
  'aosp': 'fa-solid fa-microchip',
  'graphic design': 'fa-solid fa-palette',
  'ui/ux': 'fa-solid fa-vector-square',
  'music production': 'fa-solid fa-sliders',
  'photography': 'fa-solid fa-camera',
  'cinematography': 'fa-solid fa-film',
  'video editing': 'fa-solid fa-scissors'
};

const pills = csv =>
  String(csv || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(n => `<span><i class="${SKI[n.toLowerCase()] || 'fa-solid fa-bolt'}"></i>${esc(n)}</span>`)
    .join('');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const pages = $$('.page');
const links = $$('#dock a');
const pill = $('.pill');
let cur = 0;

const sprog = $('#sprog');
const showToast = msg => {
  const t = $('#ftoast');
  if (!t) return;
  t.innerHTML = `<i class="fa-solid fa-check"></i><span>${esc(msg)}</span>`;
  t.classList.add('on');
  clearTimeout(t._tm);
  t._tm = setTimeout(() => t.classList.remove('on'), 2200);
};

const updateClock = () => {
  const el = $('#lclk');
  if (!el) return;
  try {
    const t = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date());
    el.textContent = `· ${t} IST`;
  } catch (e) {}
};
updateClock();
setInterval(updateClock, 30000);

const go = (i, snap) => {
  const mv = i !== cur;
  cur = i;
  if (sprog && pages.length) {
    sprog.style.setProperty('--sp', ((i + 1) / pages.length).toFixed(4));
  }
  links.forEach((a, k) => a.classList.toggle('on', k === i));
  if (snap) pill.style.transition = 'none';
  pill.style.width = links[i].offsetWidth + 'px';
  pill.style.transform = `translateX(${links[i].offsetLeft}px)`;
  if (snap) {
    void pill.offsetWidth;
    pill.style.transition = '';
  } else if (mv) {
    pill.classList.add('mv');
    clearTimeout(pill._t);
    pill._t = setTimeout(() => pill.classList.remove('mv'), 450);
  }
};

const count = p =>
  $$('[data-n]', p).forEach(b => {
    if (b._d) return;
    b._d = 1;
    const n = +b.dataset.n;
    const t0 = performance.now();
    (function frame(t) {
      const k = Math.min(1, (t - t0) / 1200);
      b.textContent = Math.round(n * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(frame);
    })(t0);
  });

let lockNav = false;
const io = new IntersectionObserver(
  entries =>
    entries.forEach(e => {
      e.target.classList.toggle('in', e.isIntersecting);
      if (e.isIntersecting) {
        if (!lockNav) go(pages.indexOf(e.target));
        count(e.target);
        if (e.target.id === 'talk') place(1);
        if (e.target.id === 'work') {
          placeWork(1);
          arrows();
        }
      }
    }),
  { root: $('main'), threshold: 0.6 }
);

pages.forEach(p => io.observe(p));
addEventListener('resize', () => {
  go(cur, true);
  place(1);
  placeWork(1);
  arrows();
});
go(0, true);
if (document.fonts) {
  document.fonts.ready.then(() => {
    go(cur, true);
    place(1);
    placeWork(1);
    arrows();
  });
}

/* Section Renderers & Sliding Pill Controllers */
const AR = ['4/5', '1', '3/4', '5/6'];
const TT = [44, 58, 50, 54, 46];
const DD = [-8, -24, -15, -33, -4];
let tbs = [];
let tn = 0;
let cats = [];

const place = snap => {
  const b = tbs[tn];
  const tp = $('#tabs .tp');
  if (!b || !tp) return;
  if (snap) tp.style.transition = 'none';
  tp.style.width = b.offsetWidth + 'px';
  tp.style.transform = `translateX(${b.offsetLeft}px)`;
  if (snap) {
    void tp.offsetWidth;
    tp.style.transition = '';
  }
};

const isPrivateRedirect = c =>
  c && (c.icon === 'whatsapp' || c.icon === 'phone' || /wa\.me|whatsapp\.com|^tel:/i.test(c.link || ''));

const pick = (n, snap) => {
  tn = n;
  tbs.forEach((b, k) => {
    b.classList.toggle('on', k === n);
    b.setAttribute('aria-selected', k === n);
  });
  place(snap);
  $('#rows').innerHTML = DATA.contacts
    .filter(c => c.cat === cats[n])
    .map((c, k) => {
      const priv = isPrivateRedirect(c);
      const targetUrl = safe(c.link);
      const cleanTitle = maskPhoneText(c.title);
      const cleanNote = maskPhoneText(c.note);
      const hrefAttr = priv
        ? `href="#chat" data-wa="${esc(btoa(targetUrl))}"`
        : `href="${esc(targetUrl)}"${/^https?:/.test(c.link || '') ? ' target="_blank" rel="noopener"' : ''}${
            c.icon === 'resume' ? ' download' : ''
          }`;
      const isMail = /^mailto:/i.test(c.link || '');
      const rawMail = isMail ? String(c.link).replace(/^mailto:/i, '').split('?')[0] : '';
      const copyBtn = rawMail
        ? `<button type="button" class="rcopy" data-copy="${esc(rawMail)}" aria-label="Copy ${esc(cleanTitle)}" data-tip="Copy email"><i class="fa-regular fa-copy"></i></button>`
        : '';
      return `<a style="--k:${k}" ${hrefAttr}><i class="l ${
        (ICONS[c.icon] || ICONS.link)[0]
      }"></i><span>${esc(cleanTitle)}<small>${esc(cleanNote)}</small></span>${copyBtn}<i class="ar fa-solid fa-arrow-up-right-from-square"></i></a>`;
    })
    .join('');
};

$('#rows').addEventListener('click', e => {
  const cp = e.target.closest('.rcopy');
  if (cp) {
    e.preventDefault();
    e.stopPropagation();
    const val = cp.dataset.copy || '';
    if (val) {
      copyText(val)
        .then(() => showToast('Copied ' + val))
        .catch(() => {});
    }
    return;
  }
  const a = e.target.closest('a[data-wa]');
  if (!a) return;
  e.preventDefault();
  try {
    const u = atob(a.dataset.wa);
    window.open(u, '_blank', 'noopener,noreferrer');
  } catch (err) {}
});

/* Work Section: Constant-Height Animated Pill Switcher & Dual Scrollable Rails */
const wtbs = $$('#wtabs button');
const rail1 = $('#rail1');
const rail2 = $('#rail2');
let wmode = 'proj';

const hasDetails = p => !!(p && (p.desc || p.tags || p.year || (p.shots && p.shots.length) || (p.links && p.links.length)));

const getBooks = () => {
  const C = DATA.creative && DATA.creative.length ? DATA.creative : DEFAULTS.creative;
  return C && C.length ? C : [];
};

const placeWork = snap => {
  const idx = wmode === 'book' ? 1 : 0;
  const b = wtbs[idx];
  const tp = $('#wtp');
  if (!b || !tp) return;
  if (snap) tp.style.transition = 'none';
  tp.style.width = b.offsetWidth + 'px';
  tp.style.transform = `translateX(${b.offsetLeft}px)`;
  if (snap) {
    void tp.offsetWidth;
    tp.style.transition = '';
  }
};

const syncRailBar = (railEl, dotsEl, cntEl, arrEl) => {
  const cards = $$('.card', railEl);
  const total = cards.length;
  if (!total) {
    cntEl.textContent = '00 / 00';
    if (arrEl) arrEl.classList.add('off');
    return;
  }
  const center = railEl.scrollLeft + railEl.clientWidth * 0.35;
  let active = 0;
  let best = Infinity;
  cards.forEach((c, i) => {
    const dist = Math.abs(c.offsetLeft - center);
    if (dist < best) {
      best = dist;
      active = i;
    }
  });
  $$('.wdot', dotsEl).forEach((d, i) => d.classList.toggle('on', i === active));
  cntEl.textContent = `${String(active + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  if (arrEl) arrEl.classList.toggle('off', railEl.scrollWidth <= railEl.clientWidth + 4);
};

const arrows = () => {
  syncRailBar(rail1, $('#wdots'), $('#wcnt'), $('#warr'));
  syncRailBar(rail2, $('#bdots'), $('#bcnt'), $('#barr'));
};

rail1.addEventListener('scroll', () => syncRailBar(rail1, $('#wdots'), $('#wcnt'), $('#warr')), { passive: true });
rail2.addEventListener('scroll', () => syncRailBar(rail2, $('#bdots'), $('#bcnt'), $('#barr')), { passive: true });

$$('#warr button').forEach(b => {
  b.onclick = () => {
    rail1.scrollBy({ left: (b.dataset.d === '1' ? 1 : -1) * rail1.clientWidth * 0.8, behavior: 'smooth' });
  };
});

$$('#barr button').forEach(b => {
  b.onclick = () => {
    rail2.scrollBy({ left: (b.dataset.d === '1' ? 1 : -1) * rail2.clientWidth * 0.8, behavior: 'smooth' });
  };
});

const pickWork = (mode, snap) => {
  const next = mode === 'book' ? 'book' : 'proj';
  const changed = next !== wmode && !snap;
  wmode = next;
  $('#work').dataset.mode = wmode;
  wtbs.forEach(b => {
    const on = b.dataset.w === wmode;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', on);
  });
  placeWork(snap);
  const isBook = wmode === 'book';
  $('#w-proj').classList.toggle('on', !isBook);
  $('#w-proj').setAttribute('aria-hidden', String(isBook));
  $('#w-book').classList.toggle('on', isBook);
  $('#w-book').setAttribute('aria-hidden', String(!isBook));

  const ttl = $('#w-ttl');
  if (changed) {
    ttl.style.opacity = '0';
    ttl.style.transform = 'translateY(6px)';
    setTimeout(() => {
      ttl.innerHTML = isBook ? 'Selected <em>books</em>' : 'Selected <em>work</em>';
      ttl.style.opacity = '1';
      ttl.style.transform = 'none';
    }, 150);
  } else {
    ttl.innerHTML = isBook ? 'Selected <em>books</em>' : 'Selected <em>work</em>';
  }
  $('#w-sub').textContent = isBook ? 'Swipe editions →' : 'Swipe →';
  requestAnimationFrame(arrows);
};

wtbs.forEach(b => {
  b.onclick = () => pickWork(b.dataset.w);
});

const R = {
  hero() {
    const h = DATA.hero;
    const i = $('.arch img');
    if (h.image) {
      i.classList.remove('noimg');
      i.parentElement.classList.remove('noimg');
      delete i.dataset.fb;
      i.src = cdn(h.image, 900);
    }
    const ltxt = $('#ltxt');
    if (ltxt) ltxt.textContent = h.status;
    else $('.live').innerHTML = `<i></i><b id="ltxt">${esc(h.status)}</b><em id="lclk"></em>`;
    updateClock();
    const archEl = $('.arch');
    if (archEl) {
      const m1 = String(h.line1 || 'A').trim()[0] || 'A';
      const m2 = String(h.line2 || 'R').trim()[0] || 'R';
      archEl.dataset.mono = (m1 + m2).toUpperCase();
    }
    const n = $$('h1 .ln i');
    n[0].textContent = h.line1;
    n[1].textContent = h.line2;
    $('.tag').innerHTML = em(h.tagline);
    [
      ['Instagram', 'instagram'],
      ['GitHub', 'github']
    ].forEach(([label, key]) => {
      const item = DATA.socials.find(v => v.icon === key && v.link);
      const linkEl = $(`.cta a[aria-label="${label}"]`);
      if (item && linkEl) linkEl.href = safe(item.link);
    });
  },

  about() {
    const a = DATA.about;
    const st = $('.stats');
    $('#about .big').innerHTML = em(a.heading);
    $('.quote').innerHTML = '“' + em(a.quote) + '”';
    st.style.gridTemplateColumns = `repeat(${a.stats.length || 1}, 1fr)`;
    st.innerHTML = a.stats
      .map(s => `<div><b data-n="${statVal(s, DATA.projects.length)}">0</b><span>${esc(s.label)}</span></div>`)
      .join('');
    if ($('#about').classList.contains('in')) count($('#about'));
    const t = $$('.trk');
    t[0].innerHTML = pills(a.dev);
    t[1].innerHTML = pills(a.creative);
    t.forEach(x => {
      x.innerHTML += x.innerHTML;
    });
    $('#about .btn').href = safe(a.resume);
  },

  work() {
    const shapes = { wide: ['16/9', 1.7778], square: ['1/1', 1], portrait: ['3/4', 0.75] };
    const B = getBooks();

    const projCard = (p, i) => {
      const fit = p.fit === 'contain';
      const a = shapes[p.shape] || shapes.wide;
      const num = String(i + 1).padStart(2, '0');
      const bgStyle = fit && p.image ? `;--bg:url('${esc(cdn(p.image, 300))}')` : '';
      const attrs = `class="card${fit ? ' fit' : ''}${hasDetails(p) ? ' hasd' : ''}${p.image ? '' : ' noimg'}" style="--ar:${a[0]};--arn:${a[1]}${bgStyle}" data-k="p" data-i="${i}" data-num="${num}"`;
      const sub = p.desc || p.tags || '';
      const body = `<img src="${esc(cdn(p.image, 800))}" alt="" loading="lazy">${
        p.video ? `<video class="pvv" muted loop playsinline preload="none" data-src="${esc(cdn(p.video, 600))}"></video>` : ''
      }${p.tag ? `<span class="tg">${esc(p.tag)}</span>` : ''}<i class="go fa-solid ${
        p.url || hasDetails(p) ? 'fa-arrow-right' : 'fa-expand'
      }"></i><div class="cinfo"><span class="cnum">${num}${p.year ? ' · ' + esc(p.year) : ''}</span><h3 class="ct">${esc(
        p.title
      )}</h3>${sub ? `<p class="cdesc">${esc(sub)}</p>` : ''}</div>`;
      return p.url
        ? `<a ${attrs} href="${esc(safe(p.url))}" target="_blank" rel="noopener">${body}</a>`
        : `<div ${attrs} role="button" tabindex="0" data-img="${esc(cdn(p.image, 1400))}" aria-label="View ${esc(p.title)}">${body}</div>`;
    };

    const bookCard = (p, i) => {
      const fit = p.fit === 'contain';
      const shapeKey = p.shape || 'portrait';
      const a = shapes[shapeKey] || shapes.portrait;
      const num = String(i + 1).padStart(2, '0');
      const bgStyle = fit && p.image ? `;--bg:url('${esc(cdn(p.image, 300))}')` : '';
      const attrs = `class="card bcard b-${esc(shapeKey)}${fit ? ' fit' : ''}${hasDetails(p) ? ' hasd' : ''}" style="--ar:${a[0]};--arn:${a[1]}${bgStyle}" data-k="c" data-i="${i}"`;
      const sub = p.desc || p.tags || '';
      const tags = String(p.tags || '')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
        .slice(0, 3);
      const ctaLabel = hasDetails(p) ? 'Read synopsis' : p.url ? 'Open edition' : 'Inspect cover';
      const ctaIcon = hasDetails(p) ? 'fa-book-open' : p.url ? 'fa-arrow-up-right-from-square' : 'fa-expand';
      const body = `<div class="bstage"><div class="bcover${p.image ? '' : ' noimg'}"><span class="bspine" aria-hidden="true"></span><img src="${esc(
        cdn(p.image, 800)
      )}" alt="" loading="lazy">${
        p.video ? `<video class="pvv" muted loop playsinline preload="none" data-src="${esc(cdn(p.video, 600))}"></video>` : ''
      }<div class="bfoil" aria-hidden="true"><span>EDITION ${num}</span><b>${esc(p.title)}</b><small>${esc(
        p.year || 'PUBLISHED'
      )}</small></div><span class="bmark"><i class="fa-solid fa-bookmark"></i></span></div></div><div class="bfolio"><div class="bhead"><span class="btg"><i class="fa-solid fa-feather-pointed"></i>${esc(
        p.tag || 'Book'
      )}</span><span class="bvol">Vol. ${num}${p.year ? ' · ' + esc(p.year) : ''}</span></div><h3 class="btit">${esc(
        p.title
      )}</h3>${sub ? `<p class="bquote">“${esc(sub)}”</p>` : ''}${
        tags.length ? `<div class="btags">${tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''
      }<div class="bfoot"><span class="bcta"><i class="fa-solid ${ctaIcon}"></i><span>${ctaLabel}</span></span><span class="bgo"><i class="fa-solid fa-arrow-right"></i></span></div></div>`;
      return p.url
        ? `<a ${attrs} href="${esc(safe(p.url))}" target="_blank" rel="noopener">${body}</a>`
        : `<div ${attrs} role="button" tabindex="0" data-img="${esc(cdn(p.image, 1400))}" aria-label="Read ${esc(p.title)}">${body}</div>`;
    };

    rail1.innerHTML = DATA.projects.map((p, i) => projCard(p, i)).join('');
    rail2.innerHTML = B.map((p, i) => bookCard(p, i)).join('');

    const bindDots = (items, railEl, dotsEl) => {
      dotsEl.innerHTML = items
        .map((p, i) => `<button type="button" class="wdot${i === 0 ? ' on' : ''}" aria-label="Go to ${esc(p.title)}"></button>`)
        .join('');
      $$('.wdot', dotsEl).forEach((d, i) => {
        d.onclick = () => {
          const target = $$('.card', railEl)[i];
          if (target) railEl.scrollTo({ left: target.offsetLeft - 20, behavior: 'smooth' });
        };
      });
    };

    bindDots(DATA.projects, rail1, $('#wdots'));
    bindDots(B, rail2, $('#bdots'));

    $('#n1').textContent = String(DATA.projects.length).padStart(2, '0');
    $('#n2').textContent = String(B.length).padStart(2, '0');

    pickWork(wmode, 1);
    requestAnimationFrame(arrows);
  },

  frames() {
    const list = DATA.photos.list;
    const photos = list && list.length ? list : DEFAULTS.photos.list;
    $('#cols').innerHTML = [0, 1, 2, 3, 4]
      .map(k => {
        const set = [0, 1, 2]
          .map(j => {
            const pIdx = (k + 2 * j) % photos.length;
            const raw = photos[pIdx];
            const num = String(pIdx + 1).padStart(2, '0');
            return `<img src="${esc(cdn(raw, 500))}" data-zoom="${esc(cdn(raw, 1400))}" data-cap="Frame ${num} — Through My Lens" alt="Frame ${num}" style="aspect-ratio:${AR[(k + j) % 4]}">`;
          })
          .join('');
        return `<div class="col" style="--t:${TT[k]}s;--d:${DD[k]}s">${set}${set}</div>`;
      })
      .join('');
    $('#insta').href = safe(DATA.photos.instagram);
  },

  music() {
    $('#spot').href = safe(DATA.music.spotify);
    $('#web').href = safe(DATA.music.website);
    loadSongs();
  },

  talk() {
    cats = [...new Set(DATA.contacts.map(c => c.cat))];
    const tabs = $('#tabs');
    tn = Math.min(tn, Math.max(cats.length - 1, 0));
    tabs.innerHTML = '<b class="tp"></b>' + cats.map(c => `<button type="button" role="tab">${esc(c)}</button>`).join('');
    tbs = $$('button', tabs);
    tbs.forEach((b, k) => {
      b.onclick = () => pick(k);
    });
    pick(tn, 1);
    $('#soc').innerHTML = DATA.socials
      .map(s => {
        const iconClass = (ICONS[s.icon] || ICONS.link)[0];
        return s.link
          ? `<a href="${esc(safe(s.link))}" target="_blank" rel="noopener" aria-label="${esc(s.title)}" data-tip="${esc(s.title)}"><i class="${iconClass}"></i></a>`
          : `<span title="Link coming soon" aria-label="${esc(s.title)} (coming soon)" data-tip="${esc(s.title)} · Soon"><i class="${iconClass}"></i></span>`;
      })
      .join('');
  },

  seo() {
    let e = $('#ld');
    if (!e) {
      e = document.createElement('script');
      e.id = 'ld';
      e.type = 'application/ld+json';
      document.head.append(e);
    }
    e.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: DATA.hero.line1 + ' ' + DATA.hero.line2,
      description: String(DATA.hero.tagline || '').replace(/\*/g, ''),
      url: location.origin + location.pathname,
      sameAs: DATA.socials.filter(x => x.link).map(x => x.link)
    });
  }
};

const renderAll = () =>
  Object.entries(R).forEach(([k, fn]) => {
    try {
      fn();
    } catch (e) {
      console.warn('[portfolio] section error:', k, e);
    }
  });

/* Sound Player */
const BASE_MUSIC = DATA.music.website;
const ARTIST = 'Aditya Raj';
let songs = [];
let si = 0;

const FALLBACK_SONGS = [
  ['Pyar Ho Na Jaye', 'pyar_ho_na_jaye.png', 'https://open.spotify.com/album/62bTAp0y8vpAfWr1LwAreg'],
  ['Almost Yours', 'almost%20Yours.png', BASE_MUSIC],
  ['Yaadein Teri', 'yaddain%20teri.jpg', 'https://open.spotify.com/track/1jP4JquRKRq1ssiE3tHiHe'],
  ['Khwab Mere', 'khwab%20mere.jpg', 'https://open.spotify.com/track/2qvP8cmCcmN9gNSYLYJWWx'],
  ['Dil Ki Baat', 'dil%20ki%20baat.jpg', 'https://open.spotify.com/track/0H9lyaDVMOngo2z0wd4dbG']
].map(s => ({ title: s[0], artist: ARTIST, cover: BASE_MUSIC + s[1], url: s[2] }));

const deck = $('#deck');
const sl = $('#sleeve');
const prog = $('#prog i');

const tick = () => {
  prog.classList.remove('run');
  void prog.offsetWidth;
  prog.classList.add('run');
};

let soundPaused = false;

const showSong = (i, dir = 1, now) => {
  if (!songs.length) return;
  si = (i + songs.length) % songs.length;
  const s = songs[si];
  const tnum = String(si + 1).padStart(2, '0');
  const tot = String(songs.length).padStart(2, '0');
  const applySong = () => {
    sl.style.setProperty('--sx', dir > 0 ? '26px' : '-26px');
    sl.classList.remove('noimg');
    deck.classList.remove('noimg');
    delete sl.dataset.fb;
    sl.src = s.cover;
    $('#st').textContent = s.title;
    $('#stl').href = s.url || BASE_MUSIC;
    $('#sa').textContent = s.artist || ARTIST;
    if ($('#snum')) $('#snum').textContent = `TRACK ${tnum} · ORIGINAL`;
    if ($('#stit-art')) $('#stit-art').textContent = s.title;
    if ($('#scnt')) $('#scnt').textContent = `${tnum} / ${tot}`;
    $$('#thumbs button').forEach((b, k) => b.classList.toggle('on', k === si));
    sl.classList.remove('ch');
    void sl.offsetWidth;
    sl.classList.add('ch');
    deck.classList.remove('swap');
    tick();
    if (sl.complete && !sl.naturalWidth) {
      sl.classList.add('noimg');
      deck.classList.add('noimg');
    }
  };
  if (now) applySong();
  else {
    deck.classList.add('swap');
    setTimeout(applySong, 320);
  }
};

prog.addEventListener('animationend', () => {
  if (!soundPaused) showSong(si + 1);
});

if ($('#sprev')) $('#sprev').onclick = () => showSong(si - 1, -1);
if ($('#snext')) $('#snext').onclick = () => showSong(si + 1, 1);
if ($('#splay')) {
  $('#splay').onclick = () => {
    soundPaused = !soundPaused;
    $('#sound').classList.toggle('paused', soundPaused);
    $('#splay').setAttribute('aria-pressed', String(soundPaused));
    $('#splay').setAttribute('aria-label', soundPaused ? 'Resume track cycle' : 'Pause track cycle');
    $('#splay').innerHTML = `<i class="fa-solid ${soundPaused ? 'fa-play' : 'fa-pause'}"></i>`;
  };
}

const loadSongList = list => {
  songs = list.slice(0, 5);
  $('#thumbs').innerHTML = songs
    .map(s => `<button type="button" aria-label="${esc(s.title)}"><img src="${esc(s.cover)}" alt=""></button>`)
    .join('');
  showSong(0, 1, 1);
};

$('#thumbs').onclick = e => {
  const b = e.target.closest('button');
  if (!b) return;
  const k = [...$('#thumbs').children].indexOf(b);
  if (k !== si) showSong(k, k > si ? 1 : -1);
};

let sx = 0;
const stg = $('#sound .stage');
stg.onpointerdown = e => {
  sx = e.clientX;
};
stg.onpointerup = e => {
  const d = e.clientX - sx;
  if (Math.abs(d) > 45) showSong(si + (d < 0 ? 1 : -1), d < 0 ? 1 : -1);
};

if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  stg.addEventListener('pointermove', e => {
    const r = stg.getBoundingClientRect();
    deck.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 14 + 'deg');
    deck.style.setProperty('--rx', (0.5 - (e.clientY - r.top) / r.height) * 10 + 'deg');
  });
  stg.addEventListener('pointerleave', () => {
    deck.style.setProperty('--ry', '0deg');
    deck.style.setProperty('--rx', '0deg');
  });
}

loadSongList(FALLBACK_SONGS);

let lastFeed = '';
function loadSongs() {
  const u = DATA.music.feed;
  if (!u || u === lastFeed) return;
  lastFeed = u;
  fetch(u)
    .then(r => r.json())
    .then(j => {
      const list = (Array.isArray(j) ? j : j.items || []).filter(x => x.title && x.cover);
      if (list.length) loadSongList(list);
    })
    .catch(() => {});
}

/* Liquid Glass Button */
const lg = $('.lg');
if (lg) {
  ['pointermove', 'pointerdown'].forEach(t =>
    lg.addEventListener(t, e => {
      const r = lg.getBoundingClientRect();
      lg.style.setProperty('--mx', e.clientX - r.left + 'px');
      lg.style.setProperty('--my', e.clientY - r.top + 'px');
    })
  );
  const ua = navigator.userAgent;
  if (/Chrome\//.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)) {
    const buildLens = () => {
      const W = lg.offsetWidth;
      const H = lg.offsetHeight;
      if (!W || !H) return;
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const x = c.getContext('2d');
      const im = x.createImageData(W, H);
      const r = H / 2;
      const bz = r * 0.75;
      for (let j = 0; j < H; j++) {
        for (let i = 0; i < W; i++) {
          const px = i + 0.5;
          const py = j + 0.5;
          const cx = Math.min(Math.max(px, r), W - r);
          const dx = px - cx;
          const dy = py - r;
          const L = Math.hypot(dx, dy) || 1;
          const d = r - L;
          const k = d >= bz ? 0 : Math.pow(1 - Math.max(d, 0) / bz, 2);
          const o = (j * W + i) * 4;
          im.data[o] = 128 - (127 * k * dx) / L;
          im.data[o + 1] = 128 - (127 * k * dy) / L;
          im.data[o + 2] = 128;
          im.data[o + 3] = 255;
        }
      }
      x.putImageData(im, 0, 0);
      const old = $('#lgsvg');
      if (old) old.remove();
      document.body.insertAdjacentHTML(
        'beforeend',
        `<svg id="lgsvg" width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="lgf" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage href="${c.toDataURL()}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" result="m"/><feDisplacementMap in="SourceGraphic" in2="m" scale="26" xChannelSelector="R" yChannelSelector="G"/></filter></svg>`
      );
      lg.style.backdropFilter = 'url(#lgf) blur(4px) saturate(170%) brightness(1.06)';
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(buildLens);
  }
}

/* Initial Render & Cloud Sync */
renderAll();

const applyContent = c => {
  if (!c) return;
  fixStats(c);
  Object.keys(DEFAULTS).forEach(k => {
    if (c[k] !== undefined) {
      DATA[k] = Array.isArray(DEFAULTS[k]) ? c[k] : Object.assign({}, DEFAULTS[k], c[k]);
    }
  });
  renderAll();
};

if (!PREVIEW) {
  try {
    applyContent(JSON.parse(localStorage.getItem('pf-content')));
  } catch (e) {}
}

const debugChip = d => {
  if (!/[?&#]debug/.test(location.href)) return;
  let c = $('#dbg');
  if (!c) {
    c = document.createElement('div');
    c.id = 'dbg';
    c.style.cssText =
      'position:fixed;left:10px;bottom:10px;z-index:99999;max-width:92vw;padding:9px 13px;border-radius:14px;font:12px/1.45 system-ui,sans-serif;background:#111;color:#fff;border:1px solid #333';
    document.body.appendChild(c);
  }
  c.style.borderColor = d.ok ? '#7be07b' : '#ff7a7a';
  c.textContent =
    (d.ok ? 'Cloud OK: ' : 'Cloud problem: ') +
    d.msg +
    (d.updated ? ' (published ' + new Date(d.updated).toLocaleString() + ')' : '');
};

const sync = () =>
  fetchContent()
    .then(c => {
      if (window.PF_STATUS) debugChip(window.PF_STATUS);
      if (!c) return;
      const j = JSON.stringify(c);
      if (j !== localStorage.getItem('pf-content')) {
        applyContent(c);
        try {
          localStorage.setItem('pf-content', j);
        } catch (e) {}
      }
    })
    .catch(e => debugChip({ ok: false, msg: String(e) }));

const firstLoad = PREVIEW ? Promise.resolve() : sync();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !PREVIEW) sync();
});

let pvPage = '';
addEventListener('message', e => {
  const d = e.data;
  if (e.origin !== location.origin || !d || d.pf !== 'preview') return;
  applyContent(d.data);
  if (d.page && d.page !== pvPage) {
    pvPage = d.page;
    const p = document.getElementById(d.page);
    const m = $('main');
    if (p && m) {
      m.scrollTo({
        top: p.getBoundingClientRect().top - m.getBoundingClientRect().top + m.scrollTop,
        behavior: 'smooth'
      });
    }
  }
});

/* Desktop Page Glide Navigation */
const mainEl = $('main');
const idx = () => Math.round(mainEl.scrollTop / mainEl.clientHeight);
const still = matchMedia('(prefers-reduced-motion:reduce)').matches;
const desk = matchMedia('(hover:hover) and (pointer:fine)').matches && !matchMedia('(max-height:560px)').matches;
let gliding = false;
let lastWheel = 0;

const glideTo = i => {
  i = Math.max(0, Math.min(pages.length - 1, i));
  const from = mainEl.scrollTop;
  const to = pages[i].getBoundingClientRect().top - mainEl.getBoundingClientRect().top + from;
  lockNav = true;
  go(i);
  if (still || Math.abs(to - from) < 2) {
    mainEl.scrollTop = to;
    lockNav = false;
    return;
  }
  gliding = true;
  const dur = Math.min(1500, 800 + Math.abs(i - idx()) * 150);
  const t0 = performance.now();
  const step = t => {
    const k = Math.min(1, (t - t0) / dur);
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    mainEl.scrollTop = from + (to - from) * e;
    if (k < 1) requestAnimationFrame(step);
    else {
      gliding = false;
      lockNav = false;
      go(idx());
    }
  };
  requestAnimationFrame(step);
};

if (desk) {
  document.documentElement.classList.add('glide');
  document.addEventListener(
    'wheel',
    e => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || document.querySelector('.ds.on,#lb.on,#net.on')) return;
      e.preventDefault();
      const n = performance.now();
      const quiet = n - lastWheel > 140;
      lastWheel = n;
      if (gliding || !quiet || Math.abs(e.deltaY) < 6) return;
      glideTo(idx() + (e.deltaY > 0 ? 1 : -1));
    },
    { passive: false }
  );
  addEventListener('keydown', e => {
    if (
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) ||
      document.querySelector('.ds.on,#lb.on,#net.on')
    )
      return;
    const d = { ArrowDown: 1, PageDown: 1, ' ': e.shiftKey ? -1 : 1, ArrowUp: -1, PageUp: -1 }[e.key];
    if (d) {
      e.preventDefault();
      if (!gliding) glideTo(idx() + d);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      if (!gliding) glideTo(e.key === 'Home' ? 0 : pages.length - 1);
    }
  });
}

document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a || a.hasAttribute('data-wa')) return;
  const p = document.getElementById(a.getAttribute('href').slice(1));
  if (!p || !p.classList.contains('page')) return;
  const i = pages.indexOf(p);
  if (desk) {
    e.preventDefault();
    if (!gliding) glideTo(i);
  } else {
    lockNav = true;
    go(i);
    setTimeout(() => {
      lockNav = false;
      go(idx());
    }, 700 + Math.abs(i - idx()) * 200);
  }
});

/* Intro Splash Loader */
(() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const ok = p => Promise.resolve(p).then(() => 0, () => 0);
  const decodeImg = i => {
    i.loading = 'eager';
    return i.decode
      ? i.decode().catch(() => 0)
      : new Promise(r => {
          if (i.complete) r();
          else i.onload = i.onerror = r;
        });
  };
  let shown = false;
  const reveal = () => {
    if (shown) return;
    shown = true;
    const n = $('#in');
    document.documentElement.classList.add('ready');
    if (n) {
      n.classList.add('go');
      n.addEventListener('animationend', e => {
        if (e.animationName === 'fo') n.remove();
      });
      setTimeout(() => n.remove(), 2600);
    }
  };
  (async () => {
    await Promise.race([ok(firstLoad), sleep(3500)]);
    await Promise.race([
      Promise.all([ok(document.fonts && document.fonts.ready), ...$$('img[src]').map(i => ok(decodeImg(i)))]),
      sleep(5000)
    ]);
    await sleep(Math.max(0, 2300 - performance.now()));
    reveal();
  })();
  setTimeout(reveal, 7500);
})();

/* Save Contact (.vcf) — Phone Number Omitted for Privacy */
const siteUrl = () => (DATA.site && DATA.site.url) || location.origin + location.pathname.replace(/index\.html$/, '');

$('#vc').onclick = () => {
  const getLink = k => (DATA.contacts.find(c => c.icon === k) || {}).link || '';
  const mail = getLink('email').replace(/^mailto:/, '');
  const n = DATA.hero;
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${n.line2};${n.line1};;;`,
    `FN:${n.line1} ${n.line2}`,
    mail ? `EMAIL:${mail}` : '',
    'URL:' + siteUrl(),
    ...DATA.socials.filter(x => x.link).map(x => 'URL:' + x.link),
    'END:VCARD'
  ].filter(Boolean);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/vcard' }));
  a.download = (n.line1 + '-' + n.line2).replace(/\s+/g, '-') + '.vcf';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
};

/* Detail Sheets, Share Card & Lightbox */
const lb = $('#lb');
const ds = $('#ds');
const sh = $('#sh');
let lastFocus = null;

const closeSheets = () => {
  [ds, sh].forEach(x => {
    x.classList.remove('on');
    x.setAttribute('aria-hidden', 'true');
  });
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
};

const openSheet = (x, html, originEl) => {
  lastFocus = document.activeElement;
  const r = originEl && originEl.getBoundingClientRect ? originEl.getBoundingClientRect() : null;
  x.style.setProperty('--ox', r ? r.left + r.width / 2 - innerWidth / 2 + 'px' : '0px');
  x.style.setProperty('--oy', r ? r.top + r.height / 2 - innerHeight / 2 + 'px' : '0px');
  $('.dsc', x).innerHTML = html;
  x.classList.add('on');
  x.setAttribute('aria-hidden', 'false');
  $('.dsp', x).scrollTop = 0;
  setTimeout(() => $('.dsx', x).focus({ preventScroll: true }), 80);
};

const flash = (b, text) => {
  const orig = b.innerHTML;
  b.innerHTML = `<i class="fa-solid fa-check"></i><span>${text}</span>`;
  setTimeout(() => {
    b.innerHTML = orig;
  }, 1700);
};

const copyText = async text => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.append(ta);
  ta.select();
  const ok = document.execCommand('copy');
  ta.remove();
  if (!ok) throw new Error('Copy failed');
  return true;
};

const detail = p => {
  const wide = !(p.fit === 'contain' || p.shape === 'portrait');
  const tags = String(p.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const links = (p.links || []).filter(l => l.url);
  const shots = p.shots || [];
  let k = 0;
  const at = () => ` style="--k:${k++}"`;
  const jj = n => ` style="--j:${n}"`;
  const parts = [
    `<div class="meta"${at()}>${p.tag ? `<span>${esc(p.tag)}</span>` : ''}${p.year ? `<span>${esc(p.year)}</span>` : ''}</div>`,
    `<h2${at()}>${esc(p.title)}</h2>`
  ];
  if (p.desc) parts.push(`<p${at()}>${esc(p.desc)}</p>`);
  if (tags.length) parts.push(`<div class="tags"${at()}>${tags.map((t, n) => `<span${jj(n)}>${esc(t)}</span>`).join('')}</div>`);
  if (shots.length) {
    parts.push(
      `<div class="shots"${at()}>${shots
        .map((u, n) => `<img${jj(n)} src="${esc(cdn(u, 500))}" alt="" loading="lazy" data-zoom="${esc(cdn(u, 1600))}">`)
        .join('')}</div>`
    );
  }
  parts.push(
    `<div class="acts"${at()}>${
      p.url ? `<a class="btn" href="${esc(safe(p.url))}" target="_blank" rel="noopener">Open <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''
    }${links.map(l => `<a class="pillb" href="${esc(safe(l.url))}" target="_blank" rel="noopener">${esc(l.label || 'Link')}</a>`).join('')}</div>`
  );
  return `<div class="dsm${wide ? '' : ' fitm'}" style="--bg:url('${esc(cdn(p.image, 300))}')"><img src="${esc(
    cdn(p.image, 1200)
  )}" alt="" data-zoom="${esc(cdn(p.image, 1600))}"></div><div class="dsi">${parts.join('')}</div>`;
};

const shareSheet = originEl => {
  const u = siteUrl();
  openSheet(
    sh,
    `<div class="dsi shi">
      <div class="qrw" style="--k:0"><div class="qrt" id="qrt"><i class="fa-solid fa-spinner fa-spin"></i></div></div>
      <h2 style="--k:1">Scan or tap</h2>
      <p style="--k:2">Point a camera at the code, or tap my NFC card on any phone to open my portfolio.</p>
      <div class="urlc" style="--k:3"><i class="fa-solid fa-link"></i><span>${esc(u)}</span></div>
      <div class="acts" style="--k:4">
        <button type="button" class="cbtn" id="cpl"><i class="fa-regular fa-copy"></i><span>Copy link</span></button>
        <div class="sacts">
          ${navigator.share ? '<button type="button" class="pillb" id="shr"><i class="fa-solid fa-share-nodes"></i><span>Share</span></button>' : ''}
          <button type="button" class="pillb" id="qrd"><i class="fa-solid fa-download"></i><span>Save QR</span></button>
          <button type="button" class="pillb" id="vc2"><i class="fa-regular fa-address-card"></i><span>Contact</span></button>
        </div>
      </div>
    </div>`,
    originEl
  );
  qrSvg(u)
    .then(v => {
      const t = $('#qrt');
      if (t) t.innerHTML = v;
    })
    .catch(() => {
      const t = $('#qrt');
      if (t) t.textContent = 'QR code requires an internet connection';
    });
  $('#cpl').onclick = async e => {
    const b = e.currentTarget;
    try {
      await copyText(u);
      flash(b, 'Copied to clipboard');
    } catch (x) {
      prompt('Copy this link', u);
    }
  };
  const sb = $('#shr');
  if (sb) {
    sb.onclick = () =>
      navigator
        .share({
          title: DATA.hero.line1 + ' ' + DATA.hero.line2,
          text: String(DATA.hero.tagline || '').replace(/\*/g, ''),
          url: u
        })
        .catch(() => {});
  }
  $('#qrd').onclick = e => {
    const b = e.currentTarget;
    qrDownload(u, 'portfolio-qr.png')
      .then(() => flash(b, 'Saved'))
      .catch(() => {});
  };
  $('#vc2').onclick = () => $('#vc').click();
};

$('#shb').onclick = e => shareSheet(e.currentTarget);
$('#qrb').onclick = e => shareSheet(e.currentTarget);

document.addEventListener('click', e => {
  const T = e.target;
  if (!T || !T.closest) return;
  const stCard = T.closest('#about .stats > div');
  if (stCard) {
    $$('#about [data-n]').forEach(b => {
      b._d = 0;
      b.textContent = '0';
    });
    count($('#about'));
    return;
  }
  if (T.closest('#lbx')) {
    lb.classList.remove('on');
    return;
  }
  if (T.closest('#lbp')) {
    stepLb(-1);
    return;
  }
  if (T.closest('#lbn')) {
    stepLb(1);
    return;
  }
  const z = T.closest('[data-zoom]');
  if (z) {
    const scope = z.closest('.shots, #cols');
    const items = scope ? $$('[data-zoom]', scope) : [z];
    openLb(
      items.map(el => ({ src: el.dataset.zoom, cap: el.dataset.cap || el.alt || '' })),
      Math.max(0, items.indexOf(z))
    );
    return;
  }
  const c = T.closest('.card');
  if (c && c.classList.contains('hasd') && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
    e.preventDefault();
    const p = (c.dataset.k === 'c' ? getBooks() : DATA.projects)[+c.dataset.i];
    if (p) openSheet(ds, detail(p), c);
    return;
  }
  if (c && c.dataset.img) {
    openLb([{ src: c.dataset.img, cap: c.getAttribute('aria-label') || '' }], 0);
    return;
  }
  if (T.closest('.dsx,.dsb')) {
    closeSheets();
    return;
  }
  if (lb.classList.contains('on') && T.closest('#lb') && !T.closest('.lbn, .lbcap')) lb.classList.remove('on');
});

let lbList = [];
let lbIdx = 0;

const renderLb = () => {
  const item = lbList[lbIdx];
  if (!item) return;
  $('img', lb).src = item.src;
  if ($('#lbcap')) $('#lbcap').textContent = item.cap || '';
  const multi = lbList.length > 1;
  if ($('#lbp')) $('#lbp').hidden = !multi;
  if ($('#lbn')) $('#lbn').hidden = !multi;
};

const openLb = (list, startIdx = 0) => {
  lbList = list && list.length ? list : [];
  lbIdx = startIdx;
  renderLb();
  lb.classList.add('on');
};

const stepLb = dir => {
  if (lbList.length <= 1) return;
  lbIdx = (lbIdx + dir + lbList.length) % lbList.length;
  renderLb();
};

addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (lb.classList.contains('on')) lb.classList.remove('on');
    else closeSheets();
    return;
  }
  if (lb.classList.contains('on')) {
    if (e.key === 'ArrowLeft') stepLb(-1);
    else if (e.key === 'ArrowRight') stepLb(1);
    return;
  }
  if (
    !document.querySelector('.ds.on,#net.on') &&
    !/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '') &&
    (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
  ) {
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const activePage = pages[cur];
    if (activePage && activePage.id === 'work') {
      const r = wmode === 'book' ? rail2 : rail1;
      if (r) r.scrollBy({ left: dir * r.clientWidth * 0.78, behavior: 'smooth' });
    } else if (activePage && activePage.id === 'sound') {
      showSong(si + dir, dir);
    }
  }
  const a = document.activeElement;
  if (e.key === 'Enter' && a && a.matches && a.matches('.card[data-img]')) a.click();
});

$$('.grab').forEach(g => {
  const x = g.closest('.ds');
  const p = $('.dsp', x);
  const b = $('.dsb', x);
  let y0 = 0;
  let t0 = 0;
  let dy = 0;
  let on = false;
  g.addEventListener('pointerdown', e => {
    on = true;
    y0 = e.clientY;
    t0 = performance.now();
    dy = 0;
    p.style.transition = 'none';
    b.style.transition = 'none';
    g.setPointerCapture(e.pointerId);
  });
  g.addEventListener('pointermove', e => {
    if (!on) return;
    dy = Math.max(0, e.clientY - y0);
    p.style.transform = `translateY(${dy}px)`;
    b.style.opacity = Math.max(0, 1 - dy / (p.offsetHeight * 0.9));
  });
  const end = () => {
    if (!on) return;
    on = false;
    const v = dy / (performance.now() - t0 + 1);
    p.style.transition = '';
    b.style.transition = '';
    p.style.transform = '';
    b.style.opacity = '';
    if (dy > p.offsetHeight * 0.28 || v > 0.7) closeSheets();
  };
  g.addEventListener('pointerup', end);
  g.addEventListener('pointercancel', end);
});

/* Sarcastic No Internet Live Overlay & Service Worker */
const netOv = $('#net');
const netMsg = $('#net-msg');
const ROASTS = [
  'Still offline. Did the carrier pigeons go on strike?',
  'Nope, zero packets. Have you tried staring angrily at the router?',
  'Still nothing. Turning Airplane Mode on and off is free, just saying.',
  '404: Your ISP’s effort not found. Give it another second.',
  'Even smoke signals have better ping than your connection right now.'
];
let roastIdx = 0;

const showOffline = on => {
  if (!netOv) return;
  netOv.classList.toggle('on', on);
  netOv.setAttribute('aria-hidden', String(!on));
};

addEventListener('offline', () => showOffline(true));
addEventListener('online', () => {
  showOffline(false);
  if (!PREVIEW) sync();
});

if ($('#net-retry')) {
  $('#net-retry').onclick = e => {
    if (navigator.onLine) {
      flash(e.currentTarget, 'Back online!');
      setTimeout(() => showOffline(false), 500);
      if (!PREVIEW) sync();
      return;
    }
    if (netMsg) {
      netMsg.style.opacity = '0';
      setTimeout(() => {
        netMsg.textContent = ROASTS[roastIdx++ % ROASTS.length];
        netMsg.style.opacity = '1';
      }, 150);
    }
    flash(e.currentTarget, 'Still dead');
  };
}

if ($('#net-skip')) {
  $('#net-skip').onclick = () => showOffline(false);
}

if ('serviceWorker' in navigator && /^https?:/.test(location.protocol) && !PREVIEW) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

/* Progressive Image Loading & Error Fallback */
const BLANK_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

document.addEventListener(
  'load',
  e => {
    if (e.target.tagName === 'IMG') e.target.classList.add('ld');
  },
  true
);

$$('img').forEach(i => {
  if (i.complete && i.naturalWidth) i.classList.add('ld');
});

document.addEventListener(
  'error',
  e => {
    const t = e.target;
    if (t.tagName === 'IMG') {
      t.classList.add('noimg', 'ld');
      if (t.parentElement) t.parentElement.classList.add('noimg');
      if (!t.dataset.fb) {
        t.dataset.fb = '1';
        t.src = BLANK_GIF;
      }
    }
  },
  true
);

$$('img').forEach(i => {
  if (i.getAttribute('src') && i.complete && !i.naturalWidth) i.dispatchEvent(new Event('error'));
});

/* Hero Parallax & Custom Cursor */
if (desk && !still) {
  const home = $('#home');
  const img = $('.arch img');
  let tx = 0.5, ty = 0.4, cx = 0.5, cy = 0.4, on = 0;
  document.documentElement.classList.add('par');
  const loop = () => {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    home.style.setProperty('--hx', cx * 100 + '%');
    home.style.setProperty('--hy', cy * 100 + '%');
    img.style.setProperty('--px', (0.5 - cx) * 18 + 'px');
    img.style.setProperty('--py', (0.5 - cy) * 14 + 'px');
    if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002) requestAnimationFrame(loop);
    else on = 0;
  };
  home.addEventListener(
    'pointermove',
    e => {
      if (e.pointerType !== 'mouse') return;
      const r = home.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      if (!on) {
        on = 1;
        requestAnimationFrame(loop);
      }
    },
    { passive: true }
  );
}

const fine = matchMedia('(hover:hover) and (pointer:fine)').matches && !still;

if (fine) {
  const curEl = document.createElement('div');
  curEl.id = 'cur';
  document.body.append(curEl);
  document.documentElement.classList.add('cur-on');
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, run = 0;
  const moveCursor = () => {
    cx += (x - cx) * 0.14;
    cy += (y - cy) * 0.14;
    curEl.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    if (Math.abs(x - cx) + Math.abs(y - cy) > 0.15) requestAnimationFrame(moveCursor);
    else run = 0;
  };
  addEventListener(
    'pointermove',
    e => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      curEl.classList.add('on');
      if (!run) {
        run = 1;
        requestAnimationFrame(moveCursor);
      }
    },
    { passive: true }
  );
  document.addEventListener('pointerover', e =>
    curEl.classList.toggle('hot', !!(e.target.closest && e.target.closest('a,button,.card,.lg,[role=tab]')))
  );
  addEventListener('pointerdown', () => curEl.classList.add('down'));
  addEventListener('pointerup', () => curEl.classList.remove('down'));
  document.documentElement.addEventListener('mouseleave', () => curEl.classList.remove('on'));
}

/* Interactive Ripple, Glow, Card Tilt & Video Previews */
const FX = '.btn,.ic,.card,.lg,.tabs,.rows a,#soc a,.dock a,.pillb,.vc,.cbtn';

const updateGlow = (t, e) => {
  const r = t.getBoundingClientRect();
  t.style.setProperty('--mx', e.clientX - r.left + 'px');
  t.style.setProperty('--my', e.clientY - r.top + 'px');
  if (!t.matches('.lg') && !t.querySelector(':scope>.gl')) {
    t.insertAdjacentHTML('afterbegin', '<span class="gl"></span>');
  }
  return r;
};

document.addEventListener(
  'pointerdown',
  e => {
    const t = e.target.closest && e.target.closest(FX);
    if (!t) return;
    const r = updateGlow(t, e);
    const d = Math.max(r.width, r.height) * 2.2;
    const s = document.createElement('span');
    s.className = 'rp';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    t.append(s);
    s.addEventListener('animationend', () => s.remove());
    if (e.pointerType !== 'mouse' && navigator.vibrate) navigator.vibrate(8);
  },
  { passive: true }
);

document.addEventListener(
  'pointermove',
  e => {
    const t = e.target.closest && e.target.closest(FX);
    if (!t) return;
    const r = updateGlow(t, e);
    if (!fine || e.pointerType !== 'mouse') return;
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    if (t.matches('.card')) {
      t.style.setProperty('--ry', x * 9 + 'deg');
      t.style.setProperty('--rx', -y * 7 + 'deg');
    } else if (t.matches('.btn,.ic,#soc a')) {
      t.style.setProperty('--tx', x * 10 + 'px');
      t.style.setProperty('--ty', y * 8 + 'px');
    }
  },
  { passive: true }
);

document.addEventListener('mouseout', e => {
  const t = e.target.closest && e.target.closest(FX);
  if (t && !t.contains(e.relatedTarget)) {
    ['--rx', '--ry', '--tx', '--ty'].forEach(k => t.style.removeProperty(k));
  }
});

if (fine) {
  let hc = null;
  const vid = c => c && c.querySelector('.pvv');
  const stopVid = c => {
    const v = vid(c);
    if (v) {
      v.pause();
      c.classList.remove('vplay');
    }
  };
  const playVid = c => {
    const v = vid(c);
    if (!v) return;
    if (!v.getAttribute('src')) v.src = v.dataset.src;
    v.play()
      .then(() => c.classList.add('vplay'))
      .catch(() => {});
  };
  document.addEventListener('mouseover', e => {
    const c = e.target.closest && e.target.closest('.card');
    if (c === hc) return;
    stopVid(hc);
    hc = c;
    playVid(c);
  });
  document.documentElement.addEventListener('mouseleave', () => {
    stopVid(hc);
    hc = null;
  });
}
