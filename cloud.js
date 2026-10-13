/* Shared by the site and the Manager page: cloud helpers + the default content.
   The defaults are what the site shows until you publish something from admin.html. */
const CL = window.CLOUD || { firebase: {}, cloudinary: {} };
const cloudReady = () => !!(CL.firebase && CL.firebase.apiKey && CL.firebase.projectId);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const em = s => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');                       /* *word* = serif italic */
const safe = u => /^(https?:|mailto:|tel:|assets\/|\/|#)/i.test(u || '') ? u : '#';
const cdn = (u, w) => /res\.cloudinary\.com\/.+\/upload\//.test(u || '') && !/\/upload\/[a-z]+_/.test(u) ? u.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`) : u;

const ICONS = {
  email: ['fa-regular fa-envelope', 'Email'], whatsapp: ['fa-brands fa-whatsapp', 'WhatsApp'], telegram: ['fa-brands fa-telegram', 'Telegram'],
  instagram: ['fa-brands fa-instagram', 'Instagram'], github: ['fa-brands fa-github', 'GitHub'], spotify: ['fa-brands fa-spotify', 'Spotify'],
  globe: ['fa-solid fa-globe', 'Website'], camera: ['fa-solid fa-camera-retro', 'Photography'], resume: ['fa-solid fa-file-arrow-down', 'Resume (download)'],
  phone: ['fa-solid fa-phone', 'Phone'], linkedin: ['fa-brands fa-linkedin-in', 'LinkedIn'], youtube: ['fa-brands fa-youtube', 'YouTube'],
  x: ['fa-brands fa-x-twitter', 'X'], reddit: ['fa-brands fa-reddit-alien', 'Reddit'], facebook: ['fa-brands fa-facebook-f', 'Facebook'], link: ['fa-solid fa-link', 'Other link']
};

const DEFAULTS = {
  hero: { image: 'assets/profile.jpg', status: 'Indian from earth', line1: 'Aditya', line2: 'Raj', tagline: 'Independent creator & *musician.* Visuals, music and digital experiences.' },
  about: {
    heading: 'Developer, photographer & *musician.*', quote: 'Jack of all trades, *master of none.*',
    stats: [{ label: 'Projects', auto: 'projects', base: 52, n: 56 }, { label: 'Clients', auto: 'manual', n: 23 }, { label: 'Years', auto: 'years', since: '2023-01', n: 3 }],
    dev: 'HTML5, CSS3, JavaScript, Python, C & C++, Java, mySQL, CoralDraw, Figma, Android Dev, AOSP',
    creative: 'Graphic Design, UI/UX, Music Production, Photography, Cinematography, Video Editing',
    resume: 'assets/resume.pdf'
  },
  projects: [
    { title: 'Hunter Digit', url: 'https://hunterdigit-github-io.vercel.app/index.html', image: 'assets/projects/hunter-digit.png', tag: 'Web app', shape: 'wide', fit: 'cover' },
    { title: 'QR Studio', url: 'https://qr-studio-github-io.vercel.app/', image: 'assets/projects/qr-studio.jpg', tag: 'Web tool', shape: 'wide', fit: 'cover' },
    { title: 'Resize Studio', url: 'https://resize-studio-github-io.vercel.app/', image: 'assets/projects/resize-studio.jpg', tag: 'Web tool', shape: 'wide', fit: 'cover' },
    { title: 'Broken Melodies', url: 'https://broken-melodies.vercel.app/', image: 'assets/projects/broken-melodies.png', tag: 'Music site', shape: 'wide', fit: 'cover' }
  ],
  creative: [],
  photos: {
    list: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1554046920-90dcac823a07?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=500&auto=format&fit=crop'
    ],
    instagram: 'https://instagram.com/aadi.foto'
  },
  music: { spotify: 'https://open.spotify.com/artist/0OTaxoblHJk2crI3tZ1K1V', website: 'https://broken-melodies.vercel.app/', feed: 'https://broken-melodies.vercel.app/songs.json' },
  contacts: [
    { cat: 'Work', icon: 'email', title: 'Email', note: 'ishaan8862@gmail.com · projects & collabs', link: 'mailto:ishaan8862@gmail.com' },
    { cat: 'Work', icon: 'github', title: 'GitHub', note: 'Aditya-rajj · code & open source', link: 'https://github.com/Aditya-rajj' },
    { cat: 'Work', icon: 'resume', title: 'Resume', note: 'Download my CV (PDF)', link: 'assets/resume.pdf' },
    { cat: 'Chat', icon: 'whatsapp', title: 'WhatsApp', note: '+91 82525 84063 · quick chat', link: 'https://wa.me/918252584063' },
    { cat: 'Chat', icon: 'telegram', title: 'Telegram', note: '@ISHAAN_199 · chat & files', link: 'https://t.me/ISHAAN_199' },
    { cat: 'Chat', icon: 'instagram', title: 'Instagram', note: '@aadi.echo · say hi in the DMs', link: 'https://instagram.com/aadi.echo' },
    { cat: 'Create', icon: 'spotify', title: 'Spotify', note: 'My music, on repeat', link: 'https://open.spotify.com/artist/0OTaxoblHJk2crI3tZ1K1V' },
    { cat: 'Create', icon: 'globe', title: 'Broken Melodies', note: 'My music website', link: 'https://broken-melodies.vercel.app/' },
    { cat: 'Create', icon: 'camera', title: 'Photography', note: '@aadi.foto on Instagram', link: 'https://instagram.com/aadi.foto' }
  ],
  socials: [
    { icon: 'instagram', title: 'Instagram', link: 'https://instagram.com/aadi.echo' },
    { icon: 'github', title: 'GitHub', link: 'https://github.com/Aditya-rajj' },
    { icon: 'reddit', title: 'Reddit', link: '' },
    { icon: 'x', title: 'X', link: '' },
    { icon: 'facebook', title: 'Facebook', link: '' }
  ]
};

/* Stats can grow by themselves: "years" counts up every year from a start month, "projects" = a base number + the projects you list */
const statVal = (s, n) => s.auto === 'years' ? Math.max(0, Math.floor((Date.now() - new Date((s.since || '2023-01') + '-01')) / 31557600000)) : s.auto === 'projects' ? (+s.base || 0) + n : (+s.n || 0);
function fixStats(c) {   /* upgrades stats saved before this existed, so they grow too (true if anything changed) */
  let ch = false; const n = (c.projects || []).length, y = new Date().getFullYear();
  ((c.about || {}).stats || []).forEach(s => {
    if (s.auto !== undefined) return; ch = true;
    if (/project/i.test(s.label)) { s.auto = 'projects'; s.base = (+s.n || 0) - n; }
    else if (/year|experience/i.test(s.label)) { s.auto = 'years'; s.since = (y - (+s.n || 0)) + '-01'; }
    else s.auto = 'manual';
  });
  return ch;
}

/* Reads your published content straight from Firestore (public read, no SDK needed on the site).
   diagnose() also says WHY it fails, so a silent problem becomes a clear message. */
const docUrl = () => `https://firestore.googleapis.com/v1/projects/${CL.firebase.projectId}/databases/(default)/documents/${CL.doc || 'portfolio/content'}?key=${CL.firebase.apiKey}`;
async function diagnose() {
  if (!cloudReady()) return { ok: false, status: 0, msg: 'Firebase details are missing in cloud-config.js.' };
  let r;
  try { r = await fetch(docUrl(), { cache: 'no-store' }); }
  catch (e) { return { ok: false, status: 0, msg: 'The request was blocked or you are offline. If you are online, your Firebase API key may be blocking this website (Google Cloud > APIs & Services > Credentials).' }; }
  if (r.status === 404) return { ok: false, status: 404, msg: 'Nothing is published yet. Press Publish in the Manager.' };
  let m = ''; if (!r.ok) { try { m = (await r.clone().json()).error.message || ''; } catch (e) {} }
  if (r.status === 403 || r.status === 401) {
    return { ok: false, status: r.status, msg: /referer|api key|api_key|blocked|has not been used|disabled/i.test(m)
      ? 'Your Firebase API key blocks this website or the Firestore API. In Google Cloud > APIs & Services > Credentials, allow this domain (or remove the restriction) and allow the Cloud Firestore API. (' + m.slice(0, 90) + ')'
      : 'Firestore rules block public reads of /portfolio. Publish the rules from SETUP.txt (allow read: if true on /portfolio/{id}).' };
  }
  if (!r.ok) return { ok: false, status: r.status, msg: 'Unexpected answer from Firestore (HTTP ' + r.status + '). ' + m.slice(0, 100) };
  const j = await r.json(), s = j.fields && j.fields.json && j.fields.json.stringValue;
  if (!s) return { ok: false, status: 200, msg: 'The document exists but has no content field.' };
  try { return { ok: true, status: 200, msg: 'Your site can read the published content.', updated: j.updateTime, content: JSON.parse(s) }; }
  catch (e) { return { ok: false, status: 200, msg: 'The published content is not valid JSON.' }; }
}
async function fetchContent() {
  if (!cloudReady()) return null;
  const d = await diagnose(); window.PF_STATUS = d;
  return d.ok ? d.content : null;
}

/* Image optimiser + Cloudinary upload (unsigned).
   Photos are auto-rotated, resized, stripped of metadata (GPS/EXIF) and re-encoded as WebP (JPEG/PNG where the browser
   cannot write WebP), then tightened until they fit the size target of the chosen quality preset. All in the browser. */
const QUALITY = { small: { q: .72, kb: 220 }, balanced: { q: .82, kb: 380 }, best: { q: .92, kb: 900 } };
const qpref = () => { try { const v = localStorage.getItem('pf-q'); return QUALITY[v] ? v : 'balanced'; } catch (e) { return 'balanced'; } };
const kbs = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
async function optimize(file, max) {
  const P = QUALITY[qpref()], probe = document.createElement('canvas');
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => createImageBitmap(file));
  probe.width = probe.height = 1;
  const type = probe.toDataURL('image/webp').indexOf('data:image/webp') === 0 ? 'image/webp' : (file.type === 'image/png' ? 'image/png' : 'image/jpeg');
  let k = Math.min(1, max / Math.max(bmp.width, bmp.height)), q = P.q, w = bmp.width, h = bmp.height;
  const enc = () => new Promise(res => {
    const cv = document.createElement('canvas'); w = cv.width = Math.max(1, Math.round(bmp.width * k)); h = cv.height = Math.max(1, Math.round(bmp.height * k));
    const x = cv.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(bmp, 0, 0, w, h); cv.toBlob(b => res(b), type, q);
  });
  let blob = await enc();
  for (let i = 0; blob && blob.size > P.kb * 1024 && i < 8; i++) { if (type !== 'image/png' && q > .52) q -= .07; else k *= .85; blob = await enc(); }
  if (!blob || (k === 1 && blob.size >= file.size)) return { blob: file, w: bmp.width, h: bmp.height };
  return { blob, w, h };
}
async function upload(file, max = 1600, stage = () => {}) {
  const cd = CL.cloudinary || {};
  if (!cd.cloudName) throw new Error('Add your Cloudinary cloud name to cloud-config.js');
  if (!cd.uploadPreset) throw new Error('Add your Cloudinary unsigned upload preset name to cloud-config.js (see SETUP.txt)');
  const img = file.type.startsWith('image/'), before = file.size; let send = file, name = file.name || 'file';
  if (/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
    stage('Optimising');
    try { const o = await optimize(file, max); send = o.blob; if (send !== file) name = name.replace(/\.[^.]+$/, '') + (send.type === 'image/webp' ? '.webp' : send.type === 'image/png' ? '.png' : '.jpg'); } catch (e) { send = file; }
  }
  stage('Uploading');
  const body = new FormData(); body.append('file', send, name); body.append('upload_preset', cd.uploadPreset);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cd.cloudName}/${img ? 'image' : 'auto'}/upload`, { method: 'POST', body });
  const j = await r.json();
  if (!j.secure_url) throw new Error((j.error && j.error.message) || 'Upload failed');
  return { url: j.secure_url, before, after: j.bytes || send.size, w: j.width, h: j.height };
}
