/* Portfolio Manager: edit anything, press Publish, the site updates. */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = h => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };
let DATA = null, dirty = false, tab = 'Hero', db, auth, migrated = false;
const OPEN = new WeakSet(), coarse = matchMedia('(pointer:coarse)').matches;
const toast = (m, i = 'fa-circle-check', ms = 3400) => { const t = $('#toast'); t.innerHTML = `<i class="fa-solid ${i}"></i>${esc(m)}`; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), ms); };
const SYNC = { ok: '<i class="fa-solid fa-circle-check"></i><em>Published</em>', dirty: '<i class="fa-solid fa-circle"></i><em>Unpublished</em>', busy: '<i class="fa-solid fa-spinner fa-spin"></i><em>Publishing…</em>' };
const setSync = s => { const e = $('#sync'); e.className = 'sync ' + s; e.innerHTML = SYNC[s]; };
const syncAvatar = () => { const u = DATA && DATA.hero.image ? cdn(DATA.hero.image, 120) : ''; $$('.av img').forEach(i => { i.style.display = u ? '' : 'none'; if (u && i.getAttribute('src') !== u) i.src = u; }); };
const mark = () => { dirty = true; setSync('dirty'); $('#pubbar .t').textContent = 'Unpublished changes'; $('#pubbar').classList.add('show'); syncAvatar(); pvSoon(); };
const F = (t, k, l, o = {}) => Object.assign({ t, k, l }, o);

/* icon for each field */
const KI = { image: 'fa-solid fa-image', status: 'fa-solid fa-circle-dot', line1: 'fa-solid fa-signature', line2: 'fa-solid fa-signature', tagline: 'fa-solid fa-quote-left', heading: 'fa-solid fa-heading', quote: 'fa-solid fa-quote-right', stats: 'fa-solid fa-chart-simple', label: 'fa-solid fa-tag', n: 'fa-solid fa-hashtag', dev: 'fa-solid fa-code', creative: 'fa-solid fa-palette', resume: 'fa-solid fa-file-pdf', title: 'fa-solid fa-heading', url: 'fa-solid fa-link', link: 'fa-solid fa-link', projects: 'fa-solid fa-briefcase', list: 'fa-solid fa-images', instagram: 'fa-brands fa-instagram', spotify: 'fa-brands fa-spotify', website: 'fa-solid fa-globe', feed: 'fa-solid fa-rss', cat: 'fa-solid fa-folder', icon: 'fa-solid fa-icons', note: 'fa-regular fa-note-sticky', contacts: 'fa-solid fa-address-book', socials: 'fa-solid fa-share-nodes' };
const ico = k => `<i class="${(ICONS[k] || ICONS.link)[0]}"></i>`;

const NOTE = '<div class="note"><i class="fa-solid fa-triangle-exclamation"></i><div><b>One-time setup for image uploads</b><p>Cloudinary needs an <em>unsigned upload preset</em>. In Cloudinary: Settings (gear) &rarr; Upload &rarr; Upload presets &rarr; Add upload preset &rarr; Signing mode: Unsigned &rarr; Save. Then paste its name into <code>cloud-config.js</code> as <code>uploadPreset</code>.</p></div></div>';
const WH = it => ({ t: it.image ? `<img src="${esc(cdn(it.image, 100))}" alt="">` : '<i class="fa-regular fa-image"></i>', a: it.title, b: [it.tag, it.url].filter(Boolean).join(' · ') });
const WF = [F('text', 'title', 'Title'), F('text', 'tag', 'Label', { ic: 'fa-solid fa-tag', hint: 'Short word on the card, for example Book, Poster, App.' }), F('text', 'year', 'Year', { ic: 'fa-regular fa-calendar', hint: 'Optional. Shown in the details sheet.' }),
  F('text', 'url', 'Link', { hint: 'The main link. Leave empty to open the picture full size.' }), F('img', 'image', 'Cover image', { max: 1400 }),
  F('sel', 'shape', 'Card shape', { ic: 'fa-solid fa-crop-simple', opts: { wide: ['', 'Wide (16:9): websites and apps'], square: ['', 'Square (1:1): designs and posters'], portrait: ['', 'Portrait (3:4): book covers'] } }),
  F('sel', 'fit', 'Picture fit', { ic: 'fa-solid fa-expand', opts: { cover: ['', 'Fill the card (may crop the edges)'], contain: ['', 'Show the whole picture'] } }),
  F('area', 'desc', 'Description', { ic: 'fa-solid fa-align-left', hint: 'Shown when someone taps the card. Plain text; new lines are kept.' }),
  F('text', 'tags', 'Tags', { ic: 'fa-solid fa-tags', hint: 'Comma separated, for example HTML, Firebase, Poetry, Hindi.' }),
  F('imgs', 'shots', 'Screenshots or pages', { ic: 'fa-solid fa-images', max: 1400, hint: 'Extra pictures shown in the details sheet.' }),
  F('list', 'links', 'Extra buttons', { noun: 'button', ic: 'fa-solid fa-link', add: { label: 'Buy on Amazon', url: 'https://' }, head: it => ({ t: '<i class="fa-solid fa-link"></i>', a: it.label, b: it.url }), fields: [F('text', 'label', 'Button text'), F('text', 'url', 'Link')] }),
  F('file', 'video', 'Hover preview video', { ic: 'fa-solid fa-film', hint: 'A short silent loop (3 to 6 seconds, under 5 MB). It plays when someone hovers the card on a computer.' })];
/* Live preview: shows the site in a frame and sends it your unpublished data as you type */
const PAGE = { Hero: 'home', About: 'about', Work: 'work', Photos: 'frames', Music: 'sound', Contact: 'talk' }, OR = location.origin === 'null' ? '*' : location.origin;
let pvOpen = false, pvT;
const pvSend = () => { const f = $('#pvi'); if (pvOpen && f.contentWindow && DATA) f.contentWindow.postMessage({ pf: 'preview', data: DATA, page: PAGE[tab] }, OR); };
const pvSoon = () => { clearTimeout(pvT); pvT = setTimeout(pvSend, 250); };
/* What can be edited. sub = which part of the data a section edits. */
const SECTIONS = {
  Hero: { i: 'fa-house', d: 'The first screen of your site', sub: 'hero', fields: [F('img', 'image', 'Hero photo', { max: 1400 }), F('text', 'status', 'Status line (top right)'), F('text', 'line1', 'Name, first line'), F('text', 'line2', 'Name, second line'), F('area', 'tagline', 'Tagline', { hint: 'Wrap a word in *stars* to make it italic serif.' })] },
  About: { i: 'fa-user', d: 'Who you are, your numbers and skills', sub: 'about', fields: [F('area', 'heading', 'Heading', { hint: 'Wrap a word in *stars* for the serif highlight.' }), F('text', 'quote', 'Quote'),
    F('list', 'stats', 'Stats', { noun: 'stat', add: { label: 'New stat', auto: 'manual', n: 0, since: '2023-01', base: 0 },
      head: it => ({ t: '<i class="fa-solid fa-chart-simple"></i>', a: it.label, b: statVal(it, DATA.projects.length) + (it.auto === 'years' ? ' · grows every year' : it.auto === 'projects' ? ' · grows with your projects' : '') }),
      fields: [F('text', 'label', 'Label'),
        F('sel', 'auto', 'Mode', { ic: 'fa-solid fa-wand-magic-sparkles', opts: { manual: ['', 'Manual number'], years: ['', 'Years since a date (grows every year)'], projects: ['', 'Projects (grows when you add one)'] } }),
        F('num', 'n', 'Number', { when: ['auto', 'manual'] }),
        F('month', 'since', 'Since (month and year)', { when: ['auto', 'years'], ic: 'fa-regular fa-calendar', hint: 'The number goes up by itself every year on this month.' }),
        F('num', 'base', 'Other projects not listed here', { when: ['auto', 'projects'], ic: 'fa-solid fa-plus', hint: 'Total shown = this number + the projects you list in the Projects tab.' })] }),
    F('area', 'dev', 'Development & design skills', { hint: 'Comma separated.' }), F('area', 'creative', 'Creative skills', { hint: 'Comma separated.' }), F('file', 'resume', 'Resume (PDF)')] },
  Work: { i: 'fa-briefcase', d: 'Projects and creative work on the Work page', fields: [
    F('list', 'projects', 'Projects (apps, websites)', { noun: 'project', add: { title: 'New project', tag: 'Web app', url: 'https://', image: '', shape: 'wide', fit: 'cover' }, head: WH, fields: WF }),
    F('list', 'creative', 'Creativity (books, designs, anything else)', { noun: 'creative piece', add: { title: 'New piece', tag: 'Book', url: '', image: '', shape: 'square', fit: 'cover' }, head: WH, fields: WF })] },
  Photos: { i: 'fa-camera-retro', d: 'Photos that rise on the Frames page', sub: 'photos', fields: [F('imgs', 'list', 'Photography', { hint: 'Add as many as you like. They are optimised for you.' }), F('text', 'instagram', 'Instagram link')] },
  Music: { i: 'fa-music', d: 'Links used on the Sound page', sub: 'music', fields: [F('text', 'spotify', 'Spotify artist link'), F('text', 'website', 'Music website link'), F('text', 'feed', 'Songs feed link (songs.json)')] },
  Contact: { i: 'fa-paper-plane', d: 'How people reach you', fields: [
    F('list', 'contacts', 'Contact options', { noun: 'contact option', add: { cat: 'Chat', icon: 'link', title: 'New', note: '', link: 'https://' }, head: it => ({ t: ico(it.icon), a: it.title, b: it.cat }),
      fields: [F('text', 'cat', 'Category (tab name)', { dl: 1 }), F('sel', 'icon', 'Icon', { opts: ICONS, icons: 1 }), F('text', 'title', 'Title'), F('text', 'note', 'Note'), F('text', 'link', 'Link', { hint: 'Start with https://, mailto: or tel:' })] }),
    F('list', 'socials', 'Social icons', { noun: 'social icon', add: { icon: 'link', title: 'New', link: '' }, head: it => ({ t: ico(it.icon), a: it.title, b: it.link || 'No link yet (shown greyed out)' }),
      fields: [F('sel', 'icon', 'Icon', { opts: ICONS, icons: 1 }), F('text', 'title', 'Name'), F('text', 'link', 'Link', { hint: 'Leave empty to show the icon greyed out.' })] }),
    F('group', 'site', 'Share card', { ic: 'fa-solid fa-qrcode', fields: [F('text', 'url', 'Public website address', { ic: 'fa-solid fa-globe', hint: 'The address people open your site at, for example https://yourname.com. Used by the QR code, the NFC card and the Share button.' }), F('share', 'tools', 'QR code and NFC card', { ic: 'fa-solid fa-qrcode' })] })] }
};

function fields(box, fs, obj) { fs.forEach(f => { const w = field(f, obj); box.append(w); if (f.when) { const vis = () => { w.hidden = obj[f.when[0]] !== f.when[1]; }; vis(); box.addEventListener('pf-change', vis); } }); }
const lab = f => `<label><i class="${f.ic || KI[f.k] || 'fa-solid fa-pen'}"></i>${esc(f.l)}</label>`;
const stats = (file, r) => file.type.startsWith('image/') && r.before > r.after ? `Optimised <b>${kbs(r.before)} → ${kbs(r.after)}</b> (−${Math.round(100 - r.after / r.before * 100)}%) · ${r.w}×${r.h}` : `Uploaded · ${kbs(r.after)}`;

function field(f, o) {
  const w = el(`<div class="f">${lab(f)}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ''}<div class="c"></div></div>`), c = $('.c', w);
  const fire = () => w.dispatchEvent(new Event('pf-change', { bubbles: true })), set = v => { o[f.k] = v; mark(); fire(); };
  if (f.t === 'text' || f.t === 'num' || f.t === 'month') {
    const url = /^(url|link|website|spotify|instagram|feed)$/.test(f.k);
    const i = el(`<input type="${f.t === 'num' ? 'number' : f.t === 'month' ? 'month' : 'text'}"${f.dl ? ' list="dl"' : ''}${url ? ' inputmode="url"' : ''} autocapitalize="off" autocorrect="off" spellcheck="false">`);
    i.value = o[f.k] == null ? '' : o[f.k]; i.oninput = () => set(f.t === 'num' ? +i.value : i.value); c.append(i);
  } else if (f.t === 'area') {
    const i = el('<textarea rows="3"></textarea>'); i.value = o[f.k] || ''; i.oninput = () => set(i.value); c.append(i);
  } else if (f.t === 'sel') {
    const r = el(f.icons ? '<div class="sel"><span class="pvi"></span></div>' : '<div class="sel"></div>'), i = el('<select>' + Object.entries(f.opts).map(([k, v]) => `<option value="${k}">${esc(v[1])}</option>`).join('') + '</select>'), pv = $('.pvi', r);
    const show = () => { if (pv) pv.innerHTML = ico(i.value); }; i.value = o[f.k]; show(); i.onchange = () => { set(i.value); show(); }; r.append(i); c.append(r);
  } else if (f.t === 'img' || f.t === 'file') {
    const img = f.t === 'img';
    const box = el(`<div class="up"><div class="pvb"><i class="${img ? 'fa-regular fa-image' : 'fa-regular fa-file-pdf'}"></i></div><div class="upr"><div class="row"><button type="button" class="b go"><i class="fa-solid fa-cloud-arrow-up"></i><span>Upload</span></button><button type="button" class="b rm" aria-label="Remove"><i class="fa-regular fa-trash-can"></i></button></div><span class="stat">${img ? 'Optimised automatically before upload.' : 'PDF or any file.'}</span></div></div>`);
    const lk = el('<label class="link"><i class="fa-solid fa-link"></i><input type="text" placeholder="…or paste a link" inputmode="url" autocapitalize="off" spellcheck="false"></label>'), inp = $('input', lk),
      fi = el(`<input type="file" hidden accept="${img ? 'image/*' : '*/*'}">`), pvb = $('.pvb', box), go = $('.go', box), rm = $('.rm', box), stat = $('.stat', box);
    const prev = () => { const v = o[f.k] || ''; rm.style.display = v ? '' : 'none'; const old = $('img', pvb); if (old) old.remove(); if (img && v) { const m = el('<img alt="">'); m.src = cdn(v, 200); m.onerror = () => m.remove(); pvb.append(m); } };
    inp.value = o[f.k] || ''; prev();
    inp.oninput = () => { o[f.k] = inp.value; mark(); fire(); prev(); };
    rm.onclick = () => { set(''); inp.value = ''; prev(); stat.textContent = 'Removed. Publish to apply.'; };
    go.onclick = () => fi.click();
    fi.onchange = async () => {
      const file = fi.files[0]; fi.value = ''; if (!file) return;
      const lb = $('span', go), ic = $('i', go); go.disabled = true; ic.className = 'fa-solid fa-spinner fa-spin';
      try { const r = await upload(file, f.max || 1600, s => { lb.textContent = s + '…'; }); set(r.url); inp.value = r.url; prev(); stat.innerHTML = stats(file, r); toast(file.type.startsWith('image/') && r.before > r.after ? `Saved ${kbs(r.before - r.after)} (−${Math.round(100 - r.after / r.before * 100)}%)` : 'Uploaded', 'fa-compress'); }
      catch (e) { toast(e.message, 'fa-triangle-exclamation'); }
      lb.textContent = 'Upload'; ic.className = 'fa-solid fa-cloud-arrow-up'; go.disabled = false;
    };
    c.append(box, lk, fi);
  } else if (f.t === 'imgs') {
    const g = el('<div class="g"></div>'), fi = el('<input type="file" hidden multiple accept="image/*">');
    const draw = () => {
      g.innerHTML = ''; const add = el('<button type="button" class="th add"><i class="fa-solid fa-plus"></i>Add photos</button>'); add.onclick = () => fi.click(); g.append(add);
      (o[f.k] = o[f.k] || []).forEach((u, i) => { const t = el(`<div class="th"><img src="${esc(cdn(u, 200))}" alt=""><button type="button" aria-label="Remove photo"><i class="fa-regular fa-trash-can"></i></button></div>`); $('button', t).onclick = () => { o[f.k].splice(i, 1); mark(); draw(); }; g.append(t); });
    };
    draw();
    fi.onchange = async () => {
      const files = [...fi.files]; fi.value = ''; let saved = 0, done = 0;
      for (const file of files) {
        const t = el('<div class="th busy"><i class="fa-solid fa-spinner fa-spin"></i></div>'); g.append(t);
        try { const r = await upload(file, f.max || 1600); o[f.k].push(r.url); saved += Math.max(0, r.before - r.after); done++; mark(); } catch (e) { toast(e.message, 'fa-triangle-exclamation'); t.remove(); break; }
        draw();
      }
      if (done) toast(`Added ${done} photo${done > 1 ? 's' : ''}${saved > 0 ? ' · saved ' + kbs(saved) : ''}`, 'fa-compress');
    };
    c.append(g, fi);
  } else if (f.t === 'group') {
    fields(c, f.fields, o[f.k] = o[f.k] || {});
  } else if (f.t === 'share') {
    const row = el('<div class="row"><button type="button" class="b" data-a="qr"><i class="fa-solid fa-download"></i>Download QR</button><button type="button" class="b" data-a="nfc"><i class="fa-solid fa-tower-broadcast"></i>Write to NFC card</button><button type="button" class="b" data-a="copy"><i class="fa-regular fa-copy"></i>Copy link</button></div>'), note = el('<span class="stat"></span>');
    row.onclick = async e => {
      const b = e.target.closest('[data-a]'); if (!b) return; const u = (o.url || '').trim();
      if (!u) { note.textContent = 'Type your public website address above first.'; return; }
      if (b.dataset.a === 'copy') { try { await navigator.clipboard.writeText(u); note.textContent = 'Link copied.'; } catch (x) { note.textContent = u; } }
      else if (b.dataset.a === 'qr') { try { await qrDownload(u, 'portfolio-qr.png'); note.textContent = 'QR saved. Print it on your card.'; } catch (x) { note.textContent = 'Could not make the QR code (are you online?).'; } }
      else {
        if (!('NDEFReader' in window)) { note.innerHTML = 'Writing NFC cards needs Chrome on Android. Otherwise use the free "NFC Tools" app and write this link: <b>' + esc(u) + '</b>'; return; }
        try { note.textContent = 'Hold a blank NFC card or sticker against the back of your phone…'; await new NDEFReader().write({ records: [{ recordType: 'url', data: u }] }); note.textContent = 'Done. Tapping that card now opens your site.'; } catch (x) { note.textContent = 'Could not write the card: ' + x.message; }
      }
    };
    c.append(row, note);
  } else if (f.t === 'list') {
    const box = el('<div class="ls"></div>'), add = el(`<button type="button" class="addb"><i class="fa-solid fa-plus"></i>Add ${esc(f.noun || 'item')}</button>`);
    const draw = focus => {
      box.innerHTML = ''; const a = o[f.k] = o[f.k] || [];
      a.forEach((it, i) => {
        const card = el(`<div class="it${OPEN.has(it) ? ' open' : ''}"><button type="button" class="hd"><span class="tb"></span><span class="tt"><b></b><small></small></span><i class="fa-solid fa-chevron-down chev"></i></button><div class="bd"></div></div>`), bd = $('.bd', card);
        const head = () => { const x = f.head(it); $('.tb', card).innerHTML = x.t; $('.tt b', card).textContent = x.a || 'Untitled'; $('.tt small', card).textContent = x.b || ''; };
        head(); fields(bd, f.fields, it);
        bd.append(el('<div class="acts"><button type="button" class="b" data-m="-1"><i class="fa-solid fa-arrow-up"></i>Up</button><button type="button" class="b" data-m="1"><i class="fa-solid fa-arrow-down"></i>Down</button><button type="button" class="b danger" data-m="x"><i class="fa-regular fa-trash-can"></i>Delete</button></div>'));
        bd.addEventListener('pf-change', head);
        $('.hd', card).onclick = () => { card.classList.toggle('open'); if (card.classList.contains('open')) OPEN.add(it); else OPEN.delete(it); };
        $('.acts', bd).onclick = e => {
          const b = e.target.closest('[data-m]'); if (!b) return; const m = b.dataset.m;
          if (m === 'x') { if (!confirm('Delete this item?')) return; a.splice(i, 1); mark(); draw(); return; }
          const j = i + +m; if (j < 0 || j >= a.length) return;[a[i], a[j]] = [a[j], a[i]]; mark(); draw(a[j]);
        };
        box.append(card);
      });
      if (focus) { const n = box.children[a.indexOf(focus)]; if (n) n.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    };
    draw(); add.onclick = () => { const n = JSON.parse(JSON.stringify(f.add)); o[f.k].push(n); OPEN.add(n); mark(); draw(n); }; c.append(box, add);
  }
  return w;
}

function openTab(n, top) {
  tab = n; $$('.nav button').forEach(b => b.classList.toggle('on', b.dataset.t === n));
  const S = SECTIONS[n], p = $('#panels'), g = el('<div class="grp"></div>');
  p.innerHTML = `<div class="sh"><span class="ic"><i class="fa-solid ${S.i}"></i></span><div><h2>${n}</h2><p>${esc(S.d)}</p></div></div>`;
  if (!(CL.cloudinary && CL.cloudinary.uploadPreset)) p.prepend(el(NOTE));
  fields(g, S.fields, S.sub ? DATA[S.sub] : DATA); p.append(g);
  if (top) scrollTo({ top: 0, behavior: 'instant' }); pvSoon();
}
Object.keys(SECTIONS).forEach(n => { const b = el(`<button type="button" data-t="${n}"><i class="fa-solid ${SECTIONS[n].i}"></i>${n}</button>`); b.onclick = () => openTab(n, 1); $('#nav').append(b); });

const merge = c => { const d = JSON.parse(JSON.stringify(DEFAULTS)); if (c) Object.keys(d).forEach(k => { if (c[k] !== undefined) d[k] = Array.isArray(d[k]) ? c[k] : Object.assign({}, d[k], c[k]); }); migrated = fixStats(d); return d; };
async function load() {
  const s = await db.doc(CL.doc || 'portfolio/content').get();
  DATA = merge(s.exists ? JSON.parse(s.data().json) : null); dirty = false; syncAvatar(); openTab(tab);
  diagnose().then(d => { if (!d.ok && d.status !== 404) toast('Heads up: ' + d.msg, 'fa-triangle-exclamation', 11000); });
  if (s.exists) { setSync('ok'); $('#pubbar').classList.remove('show'); } else { setSync('dirty'); $('#pubbar .t').textContent = 'Not published yet'; $('#pubbar').classList.add('show'); }
  if (migrated) { mark(); toast('Your stats now grow by themselves. Press Publish to save.', 'fa-wand-magic-sparkles', 6000); }
}
const show = on => { $('#login').hidden = on; $('#shell').hidden = !on; };

/* account menu + image quality */
const menu = $('#menu'), markSeg = () => $$('#seg button').forEach(b => b.classList.toggle('on', b.dataset.q === qpref()));
$$('#seg button').forEach(b => b.onclick = () => { try { localStorage.setItem('pf-q', b.dataset.q); } catch (e) {} markSeg(); toast('Image quality: ' + b.textContent.trim(), 'fa-compress'); }); markSeg();
$$('.av img').forEach(i => { i.onerror = () => { i.style.display = 'none'; }; });
$('#av').onclick = e => { e.stopPropagation(); menu.hidden = !menu.hidden; };
document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) menu.hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') menu.hidden = true; });
$('#chk').onclick = async () => {
  menu.hidden = true; toast('Checking your site connection…', 'fa-spinner fa-spin', 1800); const d = await diagnose();
  if (d.ok) toast('Your site can read your published content' + (d.updated ? ' (published ' + new Date(d.updated).toLocaleString() + ')' : '') + '.', 'fa-circle-check', 6000); else toast(d.msg, 'fa-triangle-exclamation', 11000);
};
$('#eye').onclick = () => { const p = $('#pw'), s = p.type === 'password'; p.type = s ? 'text' : 'password'; $('#eye i').className = s ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'; };
if (coarse) {   /* phones: tuck the bottom bars away while the keyboard is open */
  const isField = a => a && a.matches && a.matches('input:not([type=file]),textarea,select');
  document.addEventListener('focusin', e => { if (isField(e.target)) document.body.classList.add('typing'); });
  document.addEventListener('focusout', () => setTimeout(() => { if (!isField(document.activeElement)) document.body.classList.remove('typing'); }, 80));
}

$('#pvb').onclick = () => { $('#pv').hidden = false; pvOpen = true; const f = $('#pvi'); if (!f.getAttribute('src')) { f.onload = pvSend; f.src = 'index.html?preview'; } else pvSend(); };
$('#pvx').onclick = () => { $('#pv').hidden = true; pvOpen = false; };
$$('.seg2 button').forEach(b => b.onclick = () => { $$('.seg2 button').forEach(x => x.classList.toggle('on', x === b)); $('#pvi').style.setProperty('--w', b.dataset.w === '0' ? '100%' : b.dataset.w + 'px'); });
/* sign in + publish */
if (!cloudReady()) { $('#err').textContent = 'Add your Firebase and Cloudinary details to cloud-config.js first (see SETUP.txt).'; $('#in').disabled = true; }
else {
  firebase.initializeApp(CL.firebase); auth = firebase.auth(); db = firebase.firestore(); $('#em').value = CL.adminEmail || '';
  $('#in').onclick = () => { $('#err').textContent = ''; auth.signInWithEmailAndPassword($('#em').value.trim(), $('#pw').value).catch(e => { $('#err').textContent = /invalid|wrong|not-found/.test(e.code) ? 'Wrong email or password.' : e.message; }); };
  $('#pw').onkeydown = e => { if (e.key === 'Enter') $('#in').click(); };
  $('#out').onclick = () => { menu.hidden = true; if (dirty && !confirm('You have unpublished changes. Sign out anyway?')) return; dirty = false; auth.signOut(); };
  auth.onAuthStateChanged(async u => {
    if (!u) { show(false); return; }
    if (CL.adminEmail && u.email !== CL.adminEmail) { $('#err').textContent = 'This account is not the portfolio owner.'; auth.signOut(); return; }
    show(true); $('#who').textContent = u.email;
    try { await load(); } catch (e) { toast(/permission/i.test(e.message) ? 'Blocked by Firestore rules (see SETUP.txt)' : 'Could not load: ' + e.message, 'fa-triangle-exclamation'); }
  });
  $('#pub').onclick = async () => {
    const b = $('#pub'), lb = $('span', b), ic = $('i', b); b.disabled = true; lb.textContent = 'Publishing…'; ic.className = 'fa-solid fa-spinner fa-spin'; setSync('busy');
    try { await db.doc(CL.doc || 'portfolio/content').set({ json: JSON.stringify(DATA), updatedAt: firebase.firestore.FieldValue.serverTimestamp() }); dirty = false; setSync('ok'); $('#pubbar').classList.remove('show'); toast('Published. Checking your site…', 'fa-rocket', 2500); const d = await diagnose(); if (d.ok) toast('Published and live: your site can read it.', 'fa-circle-check', 4500); else toast('Saved, but your site cannot read it yet. ' + d.msg, 'fa-triangle-exclamation', 12000); }
    catch (e) { setSync('dirty'); toast(/permission/i.test(e.message) ? 'Blocked by Firestore rules (see SETUP.txt)' : e.message, 'fa-triangle-exclamation'); }
    b.disabled = false; lb.textContent = 'Publish'; ic.className = 'fa-solid fa-cloud-arrow-up';
  };
  $('#reset').onclick = () => { if (confirm('Discard unpublished changes?')) load().then(() => toast('Changes discarded', 'fa-rotate-left')).catch(e => toast(e.message, 'fa-triangle-exclamation')); };
  addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
}
