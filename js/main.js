/**
 * VOIDSTORE public site controller.
 * Order: config → i18n → templates → SEO → page controllers → effects → boot.
 * Data comes only from `VS` (data.js); helpers come from `VSU` (utils.js).
 */
(() => {
  'use strict';
  const { $, $$, esc, hue, reduced, toast, theme } = VSU;

  /* ------------------------------ config ------------------------------ */
  const PAGE_SIZE = 8;
  const SORTS = {
    new: (a, b) => b.updated.localeCompare(a.updated),
    az: (a, b) => a.name.localeCompare(b.name),
    views: (a, b) => b.views - a.views,
  };
  const page = document.body.dataset.page;
  const query = new URLSearchParams(location.search);
  const ui = { q: query.get('q') || '', cat: query.get('cat') || '', sort: 'new', page: 1, view: 'grid' };
  let lang = localStorage.getItem('vs_lang') || 'en';

  /* ------------------------------- i18n ------------------------------- */
  const I18N = {
    en: {
      home: 'Home', apps: 'Apps', games: 'Games', theme: 'Switch theme',
      h1: 'Android apps worth installing', sub: 'Browse apps and games, check version and size, then download from the official source.',
      search: 'Search apps and games', exA: 'Explore apps', exG: 'Explore games',
      feat: 'Editor’s choice', latest: 'Latest', pop: 'Most viewed', fg: 'Featured games', cats: 'Categories', all: 'All categories', all2: 'See all',
      new: 'Newest', az: 'A to Z', views: 'Most popular', empty: 'No results. Try another word or clear the filters.', res: 'results',
      dl: 'Download from official source', desc: 'Description', whats: 'What’s new', info: 'Details', sim: 'Similar',
      report: 'Report a problem', sent: 'Report sent. Thank you.', prev: 'Previous', next: 'Next', nf: 'This app is not available.',
      foot: 'Links go to official publisher pages. VOIDSTORE does not host APK files.',
      h1a: 'Android apps', ia: 'Browse Android apps by category, compare versions and sizes, then open the official download page.',
      h1g: 'Android games', ig: 'Browse Android games, compare versions and sizes, then open the official download page.',
    },
    ar: {
      home: 'الرئيسية', apps: 'التطبيقات', games: 'الألعاب', theme: 'تغيير الألوان',
      h1: 'تطبيقات أندرويد تستحق التثبيت', sub: 'تصفح التطبيقات والألعاب وتحقق من الإصدار والحجم ثم حمّل من المصدر الرسمي.',
      search: 'ابحث عن تطبيق أو لعبة', exA: 'استكشف التطبيقات', exG: 'استكشف الألعاب',
      feat: 'اختيار المحرر', latest: 'الأحدث', pop: 'الأكثر مشاهدة', fg: 'ألعاب مميزة', cats: 'التصنيفات', all: 'كل التصنيفات', all2: 'عرض الكل',
      new: 'الأحدث', az: 'أبجدياً', views: 'الأشهر', empty: 'لا توجد نتائج. جرّب كلمة أخرى.', res: 'نتيجة',
      dl: 'تحميل من المصدر الرسمي', desc: 'الوصف', whats: 'الجديد', info: 'التفاصيل', sim: 'مشابهة',
      report: 'الإبلاغ عن مشكلة', sent: 'تم إرسال البلاغ. شكراً.', prev: 'السابق', next: 'التالي', nf: 'هذا التطبيق غير متاح.',
      foot: 'الروابط تؤدي إلى صفحات الناشر الرسمية. VOIDSTORE لا يستضيف ملفات APK.',
      h1a: 'تطبيقات أندرويد', ia: 'تصفح تطبيقات أندرويد حسب التصنيف، وقارن الإصدارات والأحجام، ثم افتح صفحة التحميل الرسمية.',
      h1g: 'ألعاب أندرويد', ig: 'تصفح ألعاب أندرويد، وقارن الإصدارات والأحجام، ثم افتح صفحة التحميل الرسمية.',
    },
  };
  const t = (key) => I18N[lang][key] ?? I18N.en[key] ?? key;

  /* ----------------------------- templates ---------------------------- */
  const detailHref = (a) => `app-details.html?id=${encodeURIComponent(a.id)}`;
  const listHref = (type) => (type === 'game' ? 'games.html' : 'apps.html');

  const icon = (a, big = false) => a.icon
    ? `<img class="ico${big ? ' big' : ''}" src="${esc(a.icon)}" alt="${esc(a.name)} icon" loading="lazy">`
    : `<span class="ico${big ? ' big' : ''}" style="--h:${hue(a.name)}">${esc(a.name[0])}</span>`;

  const card = (a) => `
    <a class="card${a.type === 'game' ? ' game' : ''}${a.thumb ? ' wcv' : ''}" style="--h:${hue(a.name)}" href="${detailHref(a)}">
      ${a.thumb ? `<img class="cv" src="${esc(a.thumb)}" alt="${esc(a.name)} preview" loading="lazy">` : ''}
      ${icon(a)}
      <div><h3>${esc(a.name)}</h3><p>${esc(a.short)}</p>
        <small><span>${esc(VS.catName(a.cat))}</span><span>v${esc(a.ver)}</span>${a.rating ? `<span>★ ${esc(a.rating)}</span>` : ''}</small>
      </div>
    </a>`;

  const section = (title, items, link) => `
    <section class="s wrap">
      <div class="sh"><h2>${title}</h2>${link ? `<a href="${link}">${t('all2')}</a>` : ''}</div>
      <div class="grid">${items.map(card).join('')}</div>
    </section>`;

  const headerView = () => {
    const links = [['index', 'home'], ['apps', 'apps'], ['games', 'games']].map(([file, key]) => {
      const active = location.pathname.endsWith(`${file}.html`) || (file === 'index' && page === 'home');
      return `<a href="${file}.html" class="${active ? 'on' : ''}">${t(key)}</a>`;
    }).join('');
    return `<header class="top"><div class="wrap nav">
      <a class="logo" href="index.html">VOID<b>STORE</b></a>
      <button class="burger" aria-label="Menu">☰</button>
      <nav>${links}<a href="#" id="lang">${lang === 'en' ? 'العربية' : 'English'}</a></nav>
      <button class="tg" id="theme" aria-label="${t('theme')}" title="${t('theme')}"></button>
    </div></header>`;
  };
  const footerView = () => `<footer><div class="wrap">© 2026 VOIDSTORE. ${t('foot')} <a href="admin/index.html">Admin</a></div></footer>`;

  /* -------------------------------- SEO ------------------------------- */
  const setMeta = (key, value, attr = 'name') => {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.append(el); }
    el.content = value;
  };
  const setJsonLd = (data) => {
    let el = document.getElementById('ld');
    if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = 'ld'; document.head.append(el); }
    el.textContent = JSON.stringify(data);
  };
  const seo = (title, description, jsonLd) => {
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', 'VOIDSTORE', 'property');
    setMeta('twitter:card', 'summary');
    let link = document.head.querySelector('link[rel=canonical]');
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.append(link); }
    link.href = location.href.split('#')[0];
    if (jsonLd) setJsonLd(jsonLd);
  };
  const absolute = (path) => new URL(path, location.href).href;

  const seoList = (items, type, cat) => {
    const k = type === 'game' ? 'g' : 'a';
    seo(`${cat ? cat.name + ' – ' : ''}${t('h1' + k)} | VOIDSTORE`, `${cat ? cat.desc + '. ' : ''}${t('i' + k)}`, {
      '@context': 'https://schema.org', '@type': 'ItemList',
      itemListElement: items.slice(0, 20).map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a.name, url: absolute(detailHref(a)) })),
    });
  };
  const seoDetail = (a) => {
    seo(a.metaTitle || `${a.name} for Android | VOIDSTORE`, a.metaDesc || a.short, {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'SoftwareApplication', name: a.name, applicationCategory: a.type === 'game' ? 'GameApplication' : 'MobileApplication',
          operatingSystem: `Android ${a.android}`, softwareVersion: a.ver, description: a.short, datePublished: a.updated, author: { '@type': 'Organization', name: a.dev } },
        { '@type': 'BreadcrumbList', itemListElement: [['Home', 'index.html'], [a.type === 'game' ? 'Games' : 'Apps', listHref(a.type)], [a.name, detailHref(a)]]
          .map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })) },
      ],
    });
    setMeta('keywords', a.keywords || '');
  };

  /* ------------------------------ effects ----------------------------- */
  const fx = {
    /** Hero glow follows the pointer; background orbs drift in opposite directions. */
    hero() {
      const el = $('.hero');
      if (!el || reduced()) return;
      let frame = 0;
      el.addEventListener('pointermove', (e) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
          el.style.setProperty('--mx', `${x}px`); el.style.setProperty('--my', `${y}px`);
          el.style.setProperty('--dx', (x / r.width - 0.5) * 2); el.style.setProperty('--dy', (y / r.height - 0.5) * 2);
        });
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--dx', 0); el.style.setProperty('--dy', 0); });
    },
    /** Cursor-tracking spotlight on cards (registered once, delegated). */
    spotlight() {
      if (reduced()) return;
      document.addEventListener('pointermove', (e) => {
        const el = e.target.closest?.('.card, .cat');
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--cx', `${e.clientX - r.left}px`); el.style.setProperty('--cy', `${e.clientY - r.top}px`);
      }, { passive: true });
    },
    /** Staggered reveal as elements enter the viewport. */
    reveal() {
      if (reduced() || !('IntersectionObserver' in window)) return;
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('show'); io.unobserve(en.target); }
      }), { threshold: 0.08 });
      $$('.card, .cat, .sh').forEach((el, i) => {
        if (el.classList.contains('show')) return;
        el.classList.add('rv'); el.style.setProperty('--d', `${(i % 4) * 70}ms`); io.observe(el);
      });
    },
  };

  /* ----------------------------- home page ---------------------------- */
  const heroView = () => `
    <div class="hero"><i class="orb o1"></i><i class="orb o2"></i>
      <div class="wrap">
        <h1>${t('h1')}</h1><p>${t('sub')}</p>
        <div class="sbox"><input id="hs" class="in" placeholder="${t('search')}" aria-label="${t('search')}" autocomplete="off"><div id="sg" class="sug" hidden></div></div>
        <div class="btns"><a class="btn p" href="apps.html">${t('exA')}</a><a class="btn" href="games.html">${t('exG')}</a></div>
      </div>
    </div>`;

  const categoriesView = () => `
    <section class="s wrap"><div class="sh"><h2>${t('cats')}</h2></div><div class="cats">
      ${VS.cats.map((c) => `<a class="cat" href="${listHref(c.id === 'games' ? 'game' : 'app')}?cat=${c.id}"><b>${esc(c.name)}</b><p>${esc(c.desc)} (${VS.pub().filter((a) => a.cat === c.id).length})</p></a>`).join('')}
    </div></section>`;

  const homeView = () => {
    const apps = VS.pub().filter((a) => a.type === 'app');
    return heroView()
      + section(t('feat'), apps.filter((a) => a.featured).slice(0, 4), 'apps.html')
      + section(t('latest'), [...apps].sort(SORTS.new).slice(0, 6), 'apps.html')
      + section(t('pop'), VS.pub().sort(SORTS.views).slice(0, 4), 'apps.html')
      + section(t('fg'), VS.pub().filter((a) => a.type === 'game').slice(0, 4), 'games.html')
      + categoriesView();
  };

  const bindHome = () => {
    seo('VOIDSTORE: Android apps and games', t('sub'), { '@context': 'https://schema.org', '@type': 'WebSite', name: 'VOIDSTORE', url: location.href.split('?')[0] });
    const input = $('#hs'), box = $('#sg');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      const hits = q ? VS.pub().filter((a) => `${a.name} ${VS.catName(a.cat)}`.toLowerCase().includes(q)).slice(0, 5) : [];
      box.hidden = !hits.length;
      box.innerHTML = hits.map((a) => `<a href="${detailHref(a)}">${esc(a.name)}</a>`).join('');
    });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') location.href = `apps.html?q=${encodeURIComponent(input.value)}`; });
    document.addEventListener('click', (e) => { if (!e.target.closest('.sbox')) box.hidden = true; });
    fx.hero(); fx.reveal();
  };

  /* ---------------------------- list pages ---------------------------- */
  const listType = () => (page === 'games' ? 'game' : 'app');

  const listView = () => {
    const cats = VS.cats.filter((c) => (c.id === 'games') === (listType() === 'game'));
    return `<div class="wrap">
      <div class="intro"><h1 id="h1"></h1><p class="mu" id="ip"></p></div>
      <div class="bar">
        <input id="q" class="in" value="${esc(ui.q)}" placeholder="${t('search')}" aria-label="${t('search')}">
        <select id="c" class="in" aria-label="${t('cats')}"><option value="">${t('all')}</option>${cats.map((c) => `<option value="${c.id}" ${c.id === ui.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
        <select id="o" class="in" aria-label="Sort">${Object.keys(SORTS).map((k) => `<option value="${k}">${t(k)}</option>`).join('')}</select>
        <button class="btn" id="v" aria-label="Toggle layout">▦ / ☰</button>
      </div>
      <p class="mu" id="n"></p><div id="r"></div></div>`;
  };

  const bindList = () => {
    const type = listType(), k = type === 'game' ? 'g' : 'a';
    const draw = () => {
      const cat = VS.cats.find((c) => c.id === ui.cat);
      $('#h1').textContent = `${cat ? cat.name + ' – ' : ''}${t('h1' + k)}`;
      $('#ip').textContent = `${cat ? cat.desc + '. ' : ''}${t('i' + k)}`;
      const needle = ui.q.toLowerCase();
      const items = VS.pub()
        .filter((a) => a.type === type && (!ui.cat || a.cat === ui.cat) && `${a.name} ${VS.catName(a.cat)}`.toLowerCase().includes(needle))
        .sort(SORTS[ui.sort]);
      const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
      ui.page = Math.min(ui.page, pages);
      $('#n').textContent = `${items.length} ${t('res')}`;
      const slice = items.slice((ui.page - 1) * PAGE_SIZE, ui.page * PAGE_SIZE);
      const pager = pages > 1 ? `<div class="pg">${Array.from({ length: pages }, (_, i) => `<button class="btn ${i + 1 === ui.page ? 'on' : ''}" data-page="${i + 1}">${i + 1}</button>`).join('')}</div>` : '';
      $('#r').innerHTML = items.length ? `<div class="grid ${ui.view === 'list' ? 'list' : ''}">${slice.map(card).join('')}</div>${pager}` : `<div class="empty">${t('empty')}</div>`;
      seoList(items, type, cat); fx.reveal();
    };
    $('#q').addEventListener('input', (e) => { ui.q = e.target.value; ui.page = 1; draw(); });
    $('#c').addEventListener('change', (e) => { ui.cat = e.target.value; ui.page = 1; draw(); });
    $('#o').addEventListener('change', (e) => { ui.sort = e.target.value; draw(); });
    $('#v').addEventListener('click', () => { ui.view = ui.view === 'grid' ? 'list' : 'grid'; draw(); });
    $('#r').addEventListener('click', (e) => { const b = e.target.closest('[data-page]'); if (b) { ui.page = +b.dataset.page; draw(); } });
    draw();
  };

  /* --------------------------- details page --------------------------- */
  const detailView = () => {
    const a = VS.get(query.get('id') || '');
    if (!a || a.status !== 'published') return `<div class="wrap"><div class="empty" style="margin-top:40px">${t('nf')}</div></div>`;
    let host = '';
    try { host = new URL(a.url).hostname; } catch { /* invalid URL: hide host */ }
    const h2 = (text) => `<h2 style="margin:24px 0 8px">${text}</h2>`;
    const rows = [['Developer', a.dev], ['Version', a.ver], ['Size', a.size], ['Android', a.android], ['Package', a.pkg], ['Updated', a.updated]];
    const similar = VS.pub().filter((x) => x.cat === a.cat && x.id !== a.id).slice(0, 3);
    const chips = (a.keywords || '').split(',').map((s) => s.trim()).filter(Boolean)
      .map((s) => `<a class="btn sm" href="apps.html?q=${encodeURIComponent(s)}">${esc(s)}</a>`).join('');
    const gallery = (a.shots || []).length
      ? `<img class="shot simg" id="shot" alt="${esc(a.name)} screenshot" tabindex="0">`
      : `<div class="shot" id="shot" style="--h:${hue(a.name)}" tabindex="0"></div>`;
    const download = /^https?:\/\//.test(a.url)
      ? `<div class="btns"><a class="btn p" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">${t('dl')}</a><span class="mu" style="align-self:center">${esc(host)}</span></div>` : '';
    return `<div class="wrap">
      <p class="mu" style="margin-top:20px"><a href="index.html">${t('home')}</a> / <a href="${listHref(a.type)}">${t(a.type === 'game' ? 'games' : 'apps')}</a> / ${esc(a.name)}</p>
      <div class="dh">${icon(a, true)}<div><h1>${esc(a.name)}</h1>
        <p class="mu">${esc(a.dev)} · ${esc(VS.catName(a.cat))} · v${esc(a.ver)} · ${esc(a.size)}${a.rating ? ` · ★ ${esc(a.rating)}` : ''}</p>${download}</div></div>
      <div class="two"><div>${gallery}
        <div class="gal"><button class="btn sm" id="sp">${t('prev')}</button><button class="btn sm" id="sn">${t('next')}</button></div>
        ${h2(t('desc'))}<p>${esc(a.desc)}</p>${h2(t('whats'))}<p>${esc(a.changelog)}</p>
        ${h2(t('report'))}<div class="btns"><input id="rp" class="in" style="max-width:340px" aria-label="${t('report')}"><button class="btn" id="rb">${t('report')}</button></div></div>
        <aside><h2 style="margin-bottom:8px">${t('info')}</h2><table>${rows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('')}</table>
          <h2 style="margin:20px 0 8px">${t('cats')}</h2>
          <div class="btns" style="margin:0"><a class="btn sm" href="${listHref(a.type)}?cat=${a.cat}">${esc(VS.catName(a.cat))}</a>${chips}</div></aside></div>
      ${similar.length ? `<h2 style="margin:32px 0 12px">${t('sim')}</h2><div class="grid">${similar.map(card).join('')}</div>` : ''}</div>`;
  };

  const bindDetail = () => {
    const shot = $('#shot');
    if (!shot) { document.title = 'Not found | VOIDSTORE'; setMeta('robots', 'noindex'); return; }
    const app = VS.get(query.get('id'));
    seoDetail(app); fx.reveal();
    const shots = app.shots || [], count = shots.length || 3;
    let index = 0;
    const show = () => { if (shots.length) shot.src = shots[index]; else shot.textContent = `Screenshot ${index + 1} / 3`; };
    $('#sp').addEventListener('click', () => { index = (index + count - 1) % count; show(); });
    $('#sn').addEventListener('click', () => { index = (index + 1) % count; show(); });
    shot.addEventListener('click', () => shot.requestFullscreen?.());
    $('#rb').addEventListener('click', () => {
      const field = $('#rp');
      if (!field.value.trim()) return toast('Describe the problem first.', true);
      field.value = ''; toast(t('sent'));
    });
    show();
  };

  /* -------------------------------- boot ------------------------------ */
  const VIEWS = { home: homeView, apps: listView, games: listView, details: detailView };
  const BINDERS = { home: bindHome, apps: bindList, games: bindList, details: bindDetail };

  function render() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.innerHTML = `${headerView()}<main>${VIEWS[page]()}</main>${footerView()}`;
    $('.burger').addEventListener('click', () => $('.nav nav').classList.toggle('open'));
    $('#theme').addEventListener('click', () => theme.toggle());
    $('#lang').addEventListener('click', (e) => {
      e.preventDefault();
      lang = lang === 'en' ? 'ar' : 'en';
      localStorage.setItem('vs_lang', lang);
      render();
    });
    BINDERS[page]();
  }

  fx.spotlight();
  render();
})();
