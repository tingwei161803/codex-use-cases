/* ============================================================
   Codex Use Cases — prompt cookbook
   Renders the hero prompt terminal, the category bar, the
   category index and the grouped list (prompts / index view),
   plus search, detail drawer, copy-prompt, theme and deep links.
   The same renderers produce the static HTML stored in
   index.html and en/index.html, so no-JS visitors and crawlers
   see the full content.
   ============================================================ */
(() => {
  'use strict';

  const CATS = window.CODEX_CATEGORIES || [];
  const CAT_ORDER = Object.fromEntries(CATS.map((c, i) => [c.key, i]));
  const DATA = (window.USE_CASES || []).map((d, i) => ({ ...d, n: i + 1 }));
  /* Visual order: grouped by category, then by the official numbering. */
  const ORDERED = DATA.slice().sort((a, b) =>
    (CAT_ORDER[a.category] - CAT_ORDER[b.category]) || (a.n - b.n));

  /* Prompts shown in the hero terminal: short, varied, easy to try. */
  const FEATURED = ['manage-your-inbox', 'deploy-app-or-website', 'codebase-onboarding',
    'qa-your-app-with-computer-use', 'analyze-data-export', 'idea-to-proof-of-concept']
    .map((s) => DATA.find((d) => d.slug === s)).filter(Boolean);

  /* ---- Icons (inline SVG, stroke-based) ---- */
  const svg = (p, extra = '') => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${extra}>${p}</svg>`;
  const ICON = {
    copy: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>'),
    close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    left: svg('<path d="m15 18-6-6 6-6"/>'),
    right: svg('<path d="m9 18 6-6-6-6"/>'),
    external: svg('<path d="M14 4h6v6M10 14 20 4M19 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5H10"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: svg('<path d="M20.5 14.1A8.5 8.5 0 1 1 9.9 3.5a6.6 6.6 0 0 0 10.6 10.6Z"/>'),
  };

  /* ---- i18n ---- */
  const I18N = {
    zh: {
      brand: 'Codex 使用情境圖鑑', skip: '跳到情境列表',
      heroTitle: (n) => `${n} 件事，<br>交給 Codex`,
      heroDesc: 'OpenAI 官方整理的全部 Codex 使用情境，中英對照。每個情境都附一段範例 prompt，複製後直接貼進 Codex 就能開始。',
      heroSource: '內容整理自 <a href="https://developers.openai.com/codex/use-cases" target="_blank" rel="noopener">OpenAI Codex Use Cases</a>，非官方中文翻譯。',
      termLabel: '範例 prompt',
      termPos: (i, n) => `${i} / ${n}`,
      prevPrompt: '上一個範例', nextPrompt: '下一個範例',
      copyPrompt: '複製 prompt', copied: '已複製', copiedToast: '已複製 prompt',
      details: '完整說明',
      distLabel: (n) => `${n} 個分類，點一下只看該分類`,
      searchLabel: '搜尋情境', searchPlaceholder: '搜尋情境或工具',
      searchClear: '清除搜尋',
      viewLabel: '檢視方式', viewPrompts: '食譜', viewIndex: '索引',
      catsLabel: '分類', all: '全部',
      results: (n) => `顯示 ${n} 個情境`,
      countIn: (n) => `${n} 個情境`,
      emptyTitle: '沒有符合的情境',
      emptyDesc: '換個關鍵字，或清除搜尋與分類篩選。',
      clearAll: '清除搜尋與篩選',
      secOverview: '這是什麼', secWhen: '什麼時候用', secSteps: '怎麼運作', secPrompt: '範例 prompt',
      noPrompt: '這個情境沒有提供範例 prompt。',
      original: '看官方原文', prev: '上一個', next: '下一個', close: '關閉',
      themeDark: '切換深色', themeLight: '切換淺色',
      footer: '內容整理自 <a href="https://developers.openai.com/codex/use-cases" target="_blank" rel="noopener">OpenAI Codex Use Cases</a>。本頁為非官方的中英對照學習用整理。',
      altLang: 'English version',
      home: '回到 peteraim.com', star: 'Star',
    },
    en: {
      brand: 'Codex Use Cases', skip: 'Skip to the use cases',
      heroTitle: (n) => `${n} jobs you can hand to Codex`,
      heroDesc: 'Every official OpenAI Codex use case, in English and Chinese. Each one comes with an example prompt you can copy and paste straight into Codex.',
      heroSource: 'Adapted from <a href="https://developers.openai.com/codex/use-cases" target="_blank" rel="noopener">OpenAI Codex Use Cases</a>. Unofficial companion.',
      termLabel: 'Example prompt',
      termPos: (i, n) => `${i} / ${n}`,
      prevPrompt: 'Previous example', nextPrompt: 'Next example',
      copyPrompt: 'Copy prompt', copied: 'Copied', copiedToast: 'Prompt copied',
      details: 'Full details',
      distLabel: (n) => `${n} categories. Select one to show only that category`,
      searchLabel: 'Search use cases', searchPlaceholder: 'Search use cases or tools',
      searchClear: 'Clear search',
      viewLabel: 'View', viewPrompts: 'Prompts', viewIndex: 'Index',
      catsLabel: 'Categories', all: 'All',
      results: (n) => `Showing ${n} use case${n === 1 ? '' : 's'}`,
      countIn: (n) => `${n} use case${n === 1 ? '' : 's'}`,
      emptyTitle: 'No matching use cases',
      emptyDesc: 'Try another keyword, or clear the search and category filter.',
      clearAll: 'Clear search and filter',
      secOverview: 'What it is', secWhen: 'When to use it', secSteps: 'How it works', secPrompt: 'Example prompt',
      noPrompt: 'No example prompt is provided for this use case.',
      original: 'Read the original', prev: 'Previous', next: 'Next', close: 'Close',
      themeDark: 'Switch to dark', themeLight: 'Switch to light',
      footer: 'Content adapted from <a href="https://developers.openai.com/codex/use-cases" target="_blank" rel="noopener">OpenAI Codex Use Cases</a>. An unofficial bilingual study companion.',
      altLang: '中文版',
      home: 'Back to peteraim.com', star: 'Star',
    },
  };

  /* The URL decides the language: each language has its own page, and the page
     declares it in <html lang>. Never read it back from storage — a visitor
     landing on /en/ must get English even if they once chose 中文, and crawlers
     have no storage at all. */
  const pageLang = (document.documentElement.getAttribute('lang') || 'en')
    .toLowerCase().startsWith('zh') ? 'zh' : 'en';

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* private mode */ } },
  };

  const state = {
    lang: pageLang,
    theme: document.documentElement.dataset.theme ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    view: store.get('codex.view') === 'index' ? 'index' : 'prompts',
    cat: 'all',
    q: '',
    feat: 0,
  };
  let filtered = ORDERED.slice();

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const t = (k, ...a) => { const v = I18N[state.lang][k]; return typeof v === 'function' ? v(...a) : v; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = (n) => String(n).padStart(2, '0');
  const catLabel = (key) => { const c = CATS.find((x) => x.key === key); return c ? c[state.lang] : key; };
  const promptOf = (d) => d.prompt[state.lang] || d.prompt.en || '';
  const counts = {};
  DATA.forEach((d) => { counts[d.category] = (counts[d.category] || 0) + 1; });

  /* ============================================================
     Theme
     ============================================================ */
  function applyTheme() {
    const dark = state.theme === 'dark';
    document.documentElement.dataset.theme = state.theme;
    const btn = $('#theme-toggle');
    btn.innerHTML = dark ? ICON.sun : ICON.moon;
    btn.title = dark ? t('themeLight') : t('themeDark');
    btn.setAttribute('aria-label', btn.title);
  }
  $('#theme-toggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    store.set('codex.theme', state.theme);
    applyTheme();
  });

  /* ============================================================
     Static strings
     ============================================================ */
  function applyStaticI18n() {
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml, DATA.length); });
    $$('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $('#search').placeholder = t('searchPlaceholder');
    $('#lang-zh').setAttribute('aria-current', state.lang === 'zh' ? 'page' : 'false');
    $('#lang-en').setAttribute('aria-current', state.lang === 'en' ? 'page' : 'false');
    applyTheme();
  }

  /* ============================================================
     Hero terminal — one real prompt at a time
     ============================================================ */
  function renderTerm() {
    const d = FEATURED[state.feat];
    if (!d) return;
    $('#term').innerHTML = `
      <div class="term__bar">
        <span class="term__label">${t('termLabel')}</span>
        <span class="term__pos" aria-live="polite">${t('termPos', state.feat + 1, FEATURED.length)}</span>
        <button class="term__step" type="button" data-feat="-1" aria-label="${t('prevPrompt')}">${ICON.left}</button>
        <button class="term__step" type="button" data-feat="1" aria-label="${t('nextPrompt')}">${ICON.right}</button>
      </div>
      <a class="term__title" href="#${d.slug}" data-open="${d.slug}" style="--cat:var(--c-${d.category})">
        <span class="sw" aria-hidden="true"></span><span class="term__num">#${num(d.n)}</span>${esc(d.title[state.lang])}
      </a>
      <pre class="term__body"><span class="term__caret" aria-hidden="true">›</span>${esc(promptOf(d))}<span class="term__cursor" aria-hidden="true"></span></pre>
      <div class="term__foot">
        <button class="btn btn--go needs-js" type="button" data-copy="${d.slug}">${ICON.copy}<span>${t('copyPrompt')}</span></button>
        <a class="btn btn--ghost" href="#${d.slug}" data-open="${d.slug}">${t('details')}</a>
      </div>`;
  }

  /* ============================================================
     Category bar (hero) + category index (sidebar)
     ============================================================ */
  function renderDist() {
    $('#dist-label').textContent = t('distLabel', CATS.length);
    $('#dist').innerHTML = CATS.map((c) => `
      <button class="dist__seg" type="button" data-cat="${c.key}" aria-pressed="${state.cat === c.key}"
        style="--cat:var(--c-${c.key}); flex-grow:${counts[c.key] || 0}">
        <span class="dist__fill" aria-hidden="true"></span>
        <span class="dist__txt"><span class="dist__name">${esc(c[state.lang])}</span> <span class="dist__n">${counts[c.key] || 0}</span></span>
      </button>`).join('');
  }

  function renderCats() {
    const items = [{ key: 'all', label: t('all'), count: DATA.length }]
      .concat(CATS.map((c) => ({ key: c.key, label: c[state.lang], count: counts[c.key] || 0 })));
    $('#cats').innerHTML = items.map((it) => `
      <li><button class="cat" type="button" data-cat="${it.key}" aria-pressed="${state.cat === it.key}"
        ${it.key === 'all' ? '' : `style="--cat:var(--c-${it.key})"`}>
        <span class="sw${it.key === 'all' ? ' sw--all' : ''}" aria-hidden="true"></span>
        <span class="cat__name">${esc(it.label)}</span>
        <span class="cat__n">${it.count}</span>
      </button></li>`).join('');
  }

  /* ============================================================
     List — grouped by category, two densities
     ============================================================ */
  function matches(d, q) {
    if (!q) return true;
    const hay = [
      d.title.en, d.title.zh, d.summary.en, d.summary.zh,
      d.overview.en, d.overview.zh, (d.tags || []).join(' '), d.slug,
    ].join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).every((term) => hay.includes(term));
  }

  function computeFiltered() {
    filtered = ORDERED.filter((d) =>
      (state.cat === 'all' || d.category === state.cat) && matches(d, state.q));
  }

  function entryHTML(d) {
    const lang = state.lang;
    const tags = (d.tags || []).slice(0, 3).map(esc).join(', ');
    return `
      <article class="uc">
        <p class="uc__meta"><span class="uc__num">#${num(d.n)}</span><span class="uc__tags">${tags}</span></p>
        <h3 class="uc__title"><a href="#${d.slug}" data-open="${d.slug}">${esc(d.title[lang])}</a></h3>
        <p class="uc__sum">${esc(d.summary[lang])}</p>
        <a class="uc__prompt" href="#${d.slug}" data-open="${d.slug}" tabindex="-1" aria-hidden="true"><span class="uc__ptext"><span class="uc__caret">›</span>${esc(promptOf(d))}</span></a>
        <div class="uc__act">
          <button class="btn btn--line needs-js" type="button" data-copy="${d.slug}">${ICON.copy}<span>${t('copyPrompt')}</span></button>
          <a class="btn btn--text" href="#${d.slug}" data-open="${d.slug}">${t('details')}</a>
        </div>
      </article>`;
  }

  function rowHTML(d) {
    const lang = state.lang;
    return `
      <li class="row">
        <span class="row__num">${num(d.n)}</span>
        <a class="row__title" href="#${d.slug}" data-open="${d.slug}">${esc(d.title[lang])}</a>
        <span class="row__sum">${esc(d.summary[lang])}</span>
        <button class="row__copy needs-js" type="button" data-copy="${d.slug}" aria-label="${t('copyPrompt')}: ${esc(d.title[lang])}" title="${t('copyPrompt')}">${ICON.copy}</button>
      </li>`;
  }

  function renderList() {
    computeFiltered();
    const list = $('#list');
    list.dataset.view = state.view;
    $('#results').textContent = t('results', filtered.length);
    $$('[data-view]', $('#viewtoggle')).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
    if (!filtered.length) {
      list.innerHTML = `<div class="empty">
        <h2>${t('emptyTitle')}</h2><p>${t('emptyDesc')}</p>
        <button class="btn btn--line" type="button" data-clear>${t('clearAll')}</button></div>`;
      return;
    }
    const groups = CATS.map((c) => ({ c, items: filtered.filter((d) => d.category === c.key) }))
      .filter((g) => g.items.length);
    list.innerHTML = groups.map(({ c, items }) => `
      <section class="group" id="cat-${c.key}" style="--cat:var(--c-${c.key})" aria-labelledby="h-${c.key}">
        <header class="group__head">
          <h2 id="h-${c.key}"><span class="sw sw--lg" aria-hidden="true"></span>${esc(c[state.lang])}</h2>
          <span class="group__n">${t('countIn', items.length)}</span>
        </header>
        ${state.view === 'index'
          ? `<ol class="rows">${items.map(rowHTML).join('')}</ol>`
          : `<div class="ucs">${items.map(entryHTML).join('')}</div>`}
      </section>`).join('');
  }

  function setCat(cat, scroll) {
    state.cat = state.cat === cat && cat !== 'all' ? 'all' : cat;
    renderDist(); renderCats(); renderList();
    if (scroll) {
      const top = $('#browse').getBoundingClientRect().top + scrollY - 72;
      if (scrollY > top || scroll === 'force') scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }

  /* ============================================================
     Search
     ============================================================ */
  const searchEl = $('#search');
  const clearEl = $('#search-clear');
  let searchTimer;
  searchEl.addEventListener('input', () => {
    clearEl.hidden = !searchEl.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.q = searchEl.value.trim(); renderList(); }, 110);
  });
  clearEl.addEventListener('click', () => {
    searchEl.value = ''; state.q = ''; clearEl.hidden = true; renderList(); searchEl.focus();
  });

  /* ============================================================
     Copy
     ============================================================ */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  async function onCopy(btn) {
    const d = DATA.find((x) => x.slug === btn.dataset.copy);
    if (!d) return;
    await copyText(promptOf(d));
    const label = btn.querySelector('span');
    const before = btn.innerHTML;
    btn.classList.add('is-copied');
    if (label) btn.innerHTML = `${ICON.check}<span>${t('copied')}</span>`;
    else btn.innerHTML = ICON.check;
    toast(t('copiedToast'));
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.classList.remove('is-copied'); btn.innerHTML = before; }, 1600);
  }

  /* ============================================================
     Detail drawer
     ============================================================ */
  const scrim = $('#scrim');
  const dialog = $('#dialog');
  let nav = [];
  let openIndex = -1;
  let lastFocus = null;

  function listItems(arr) { return (arr || []).map((x) => `<li>${esc(x)}</li>`).join(''); }

  function renderDialog() {
    const d = nav[openIndex];
    if (!d) return;
    const lang = state.lang;
    const altLang = lang === 'zh' ? 'en' : 'zh';
    const prompt = promptOf(d);
    dialog.innerHTML = `
      <div class="dlg__head" style="--cat:var(--c-${d.category})">
        <p class="dlg__cat"><span class="sw" aria-hidden="true"></span>${esc(catLabel(d.category))}<span class="dlg__num">#${num(d.n)}</span></p>
        <h2 id="dlg-title">${esc(d.title[lang])}</h2>
        <p class="dlg__alt" lang="${altLang === 'zh' ? 'zh-Hant' : 'en'}">${esc(d.title[altLang])}</p>
        <button class="icon-btn dlg__close" type="button" id="dlg-close" aria-label="${t('close')}">${ICON.close}</button>
      </div>
      <div class="dlg__body">
        <section class="dlg__sec">
          <h3>${t('secOverview')}</h3>
          <p class="dlg__lead">${esc(d.overview[lang])}</p>
        </section>
        <section class="dlg__sec">
          <h3>${t('secPrompt')}</h3>
          ${prompt.trim() ? `<div class="term term--inline">
              <pre class="term__body"><span class="term__caret" aria-hidden="true">›</span>${esc(prompt)}</pre>
              <div class="term__foot"><button class="btn btn--go" type="button" data-copy="${d.slug}">${ICON.copy}<span>${t('copyPrompt')}</span></button></div>
            </div>` : `<p class="dlg__lead">${t('noPrompt')}</p>`}
        </section>
        <div class="dlg__cols">
          <section class="dlg__sec">
            <h3>${t('secWhen')}</h3>
            <ul class="dlg__when">${listItems(d.when[lang])}</ul>
          </section>
          <section class="dlg__sec">
            <h3>${t('secSteps')}</h3>
            <ol class="dlg__steps">${listItems(d.steps[lang])}</ol>
          </section>
        </div>
      </div>
      <div class="dlg__foot">
        <a class="btn btn--line" href="${esc(d.url)}" target="_blank" rel="noopener">${ICON.external}<span>${t('original')}</span></a>
        <span class="dlg__nav">
          <button class="btn btn--text" type="button" id="dlg-prev">${ICON.left}<span>${t('prev')}</span></button>
          <button class="btn btn--text" type="button" id="dlg-next"><span>${t('next')}</span>${ICON.right}</button>
        </span>
      </div>`;
    $('#dlg-close').addEventListener('click', closeDialog);
    $('#dlg-prev').addEventListener('click', () => step(-1));
    $('#dlg-next').addEventListener('click', () => step(1));
    dialog.scrollTop = 0;
  }

  function step(dir) { openAt((openIndex + dir + nav.length) % nav.length); }

  function openSlug(slug) {
    /* Navigate within what is on screen; fall back to everything. */
    nav = filtered.some((d) => d.slug === slug) ? filtered : ORDERED;
    openAt(nav.findIndex((d) => d.slug === slug));
  }

  function openAt(index) {
    if (index < 0 || index >= nav.length) return;
    const firstOpen = openIndex < 0;
    openIndex = index;
    renderDialog();
    history.replaceState(null, '', '#' + nav[openIndex].slug);
    if (firstOpen) {
      lastFocus = document.activeElement;
      scrim.hidden = false;
      requestAnimationFrame(() => scrim.classList.add('open'));
      document.documentElement.classList.add('locked');
    }
    $('#dlg-close').focus({ preventScroll: true });
  }

  function closeDialog() {
    if (openIndex < 0) return;
    openIndex = -1;
    scrim.classList.remove('open');
    document.documentElement.classList.remove('locked');
    history.replaceState(null, '', location.pathname + location.search);
    setTimeout(() => { if (openIndex < 0) scrim.hidden = true; }, 260);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  scrim.addEventListener('click', (e) => { if (e.target === scrim) closeDialog(); });
  document.addEventListener('keydown', (e) => {
    if (openIndex < 0) return;
    if (e.key === 'Escape') closeDialog();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Tab') {
      /* Keep focus inside the drawer. */
      const f = $$('a[href], button:not([disabled])', dialog);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ============================================================
     Delegated clicks
     ============================================================ */
  document.addEventListener('click', (e) => {
    const copy = e.target.closest('[data-copy]');
    if (copy) { e.preventDefault(); onCopy(copy); return; }
    const open = e.target.closest('[data-open]');
    if (open) { e.preventDefault(); openSlug(open.dataset.open); return; }
    const cat = e.target.closest('[data-cat]');
    if (cat) { setCat(cat.dataset.cat, cat.classList.contains('dist__seg') ? 'force' : true); return; }
    const view = e.target.closest('#viewtoggle [data-view]');
    if (view) { state.view = view.dataset.view; store.set('codex.view', state.view); renderList(); return; }
    const feat = e.target.closest('[data-feat]');
    if (feat) {
      state.feat = (state.feat + Number(feat.dataset.feat) + FEATURED.length) % FEATURED.length;
      renderTerm();
      $(`#term [data-feat="${feat.dataset.feat}"]`).focus();
      return;
    }
    if (e.target.closest('[data-clear]')) {
      searchEl.value = ''; state.q = ''; clearEl.hidden = true; setCat('all');
    }
  });

  /* ============================================================
     Toast
     ============================================================ */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  /* ============================================================
     GitHub star count — cached per session, hidden unless > 0
     ============================================================ */
  function showStars(n) {
    const el = $('#gh-count');
    if (!(n > 0)) { el.hidden = true; return; }
    el.textContent = n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
    el.hidden = false;
  }
  (function loadStars() {
    const KEY = 'codex.gh.stars';
    let cached = null;
    try { cached = sessionStorage.getItem(KEY); } catch (_) { /* ignore */ }
    if (cached !== null) { showStars(Number(cached)); return; }
    const remember = (n) => { try { sessionStorage.setItem(KEY, String(n)); } catch (_) { /* ignore */ } };
    fetch('https://api.github.com/repos/tingwei161803/codex-use-cases')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const n = j && typeof j.stargazers_count === 'number' ? j.stargazers_count : 0;
        remember(n); showStars(n);
      })
      .catch(() => { remember(0); showStars(0); });
  })();

  /* ============================================================
     Init
     ============================================================ */
  applyStaticI18n();
  renderTerm();
  renderDist();
  renderCats();
  renderList();

  /* Deep link: open a use case if the URL hash names a slug. */
  function openFromHash() {
    const slug = decodeURIComponent(location.hash.replace('#', ''));
    if (!slug || !DATA.some((d) => d.slug === slug)) { if (!slug && openIndex >= 0) closeDialog(); return; }
    if (openIndex >= 0 && nav[openIndex] && nav[openIndex].slug === slug) return;
    openSlug(slug);
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})();
