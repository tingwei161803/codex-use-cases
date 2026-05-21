/* ============================================================
   Codex Use Cases — interactivity
   i18n toggle · search · category filter · detail dialog ·
   copy prompt · ripple · theme · shareable deep links
   ============================================================ */
(() => {
  'use strict';

  const DATA = (window.USE_CASES || []).map((d, i) => ({ ...d, n: i + 1 }));
  const CATS = window.CODEX_CATEGORIES || [];

  /* Per-category Material Symbol + CSS accent variable. */
  const CAT_META = {
    productivity: { icon: 'bolt' },
    coding:       { icon: 'code' },
    frontend:     { icon: 'palette' },
    mobile:       { icon: 'smartphone' },
    data:         { icon: 'bar_chart' },
    knowledge:    { icon: 'school' },
    quality:      { icon: 'verified' },
    finance:      { icon: 'payments' },
  };
  const catLabel = (key, lang) => {
    const c = CATS.find((x) => x.key === key);
    return c ? c[lang] : key;
  };

  /* ---- i18n: static UI strings ---- */
  const I18N = {
    zh: {
      brand: 'Codex 使用情境圖鑑', brandSub: '52 個情境 · 中英對照',
      eyebrow: '取材自 OpenAI 官方文件',
      heroTitle: '用 <span class="grad">Codex</span> 能做的每一件事',
      heroDesc: '把 OpenAI 官方的全部 Codex 使用情境整理成一份可互動、可搜尋的中英對照圖鑑。點開任一張卡片，看它怎麼用、適合什麼時候用，以及可以照抄的範例 prompt。',
      statCases: '使用情境', statCats: '分類領域', statLang: '語言對照',
      footer: '內容整理自 <a href="https://developers.openai.com/codex/use-cases" target="_blank" rel="noopener">OpenAI Codex Use Cases</a>。本頁為非官方的中英對照學習用整理。',
      searchPlaceholder: '搜尋使用情境、工具或關鍵字…',
      all: '全部', cardCta: '查看細節',
      secOverview: '這是什麼', secWhen: '什麼時候用', secSteps: '怎麼運作', secPrompt: '範例 Prompt',
      copy: '複製', copied: '已複製', noPrompt: '此情境沒有提供範例 prompt。',
      original: '看官方原文', prev: '上一個', next: '下一個',
      emptyTitle: '找不到符合的情境', emptyDesc: '換個關鍵字，或清除篩選條件試試。',
      results: (n) => `${n} 個情境`,
      themeDark: '切換深色', themeLight: '切換淺色',
    },
    en: {
      brand: 'Codex Use Cases', brandSub: '52 use cases · bilingual',
      eyebrow: 'Sourced from OpenAI docs',
      heroTitle: 'Everything you can do with <span class="grad">Codex</span>',
      heroDesc: 'Every official OpenAI Codex use case, gathered into one interactive, searchable, bilingual (中 / EN) gallery. Open any card to see what it does, when to reach for it, and a copy-ready example prompt.',
      statCases: 'Use cases', statCats: 'Categories', statLang: 'Languages',
      footer: 'Content adapted from <a href="https://developers.openai.com/codex/use-cases" target="_blank" rel="noopener">OpenAI Codex Use Cases</a>. An unofficial bilingual study companion.',
      searchPlaceholder: 'Search use cases, tools or keywords…',
      all: 'All', cardCta: 'View details',
      secOverview: 'What it is', secWhen: 'When to use it', secSteps: 'How it works', secPrompt: 'Example prompt',
      copy: 'Copy', copied: 'Copied', noPrompt: 'No example prompt provided for this use case.',
      original: 'Read the original', prev: 'Previous', next: 'Next',
      emptyTitle: 'No matching use cases', emptyDesc: 'Try a different keyword or clear the filters.',
      results: (n) => `${n} use case${n === 1 ? '' : 's'}`,
      themeDark: 'Switch to dark', themeLight: 'Switch to light',
    },
  };

  /* ---- state ---- */
  const state = {
    lang: localStorage.getItem('codex.lang') || 'zh',
    theme: localStorage.getItem('codex.theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    cat: 'all',
    q: '',
  };
  let filtered = DATA.slice();

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const t = (k) => I18N[state.lang][k];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ============================================================
     Ripple (Material signature)
     ============================================================ */
  function attachRipple(el) {
    el.addEventListener('pointerdown', (e) => {
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - r.left - size / 2) + 'px';
      span.style.top = (e.clientY - r.top - size / 2) + 'px';
      el.appendChild(span);
      span.addEventListener('animationend', () => span.remove());
    });
  }

  /* ============================================================
     Theme
     ============================================================ */
  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    const dark = state.theme === 'dark';
    $('#theme-icon').textContent = dark ? 'light_mode' : 'dark_mode';
    $('#theme-toggle').title = dark ? t('themeLight') : t('themeDark');
  }
  $('#theme-toggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('codex.theme', state.theme);
    applyTheme();
  });

  /* ============================================================
     Language
     ============================================================ */
  function applyStaticI18n() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-Hant' : 'en';
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    $('#search').placeholder = t('searchPlaceholder');
    $('#lang-zh').setAttribute('aria-pressed', String(state.lang === 'zh'));
    $('#lang-en').setAttribute('aria-pressed', String(state.lang === 'en'));
    applyTheme();
  }
  function setLang(lang) {
    if (lang === state.lang) return;
    state.lang = lang;
    localStorage.setItem('codex.lang', lang);
    applyStaticI18n();
    renderChips();
    renderCards();
    if (openIndex >= 0) renderDialog();
  }
  $('#lang-zh').addEventListener('click', () => setLang('zh'));
  $('#lang-en').addEventListener('click', () => setLang('en'));

  /* ============================================================
     Chips (category filter)
     ============================================================ */
  function renderChips() {
    const wrap = $('#chips');
    const counts = {};
    DATA.forEach((d) => { counts[d.category] = (counts[d.category] || 0) + 1; });
    const items = [{ key: 'all', label: t('all'), count: DATA.length, icon: 'apps' }]
      .concat(CATS.map((c) => ({
        key: c.key, label: c[state.lang], count: counts[c.key] || 0, icon: (CAT_META[c.key] || {}).icon || 'label',
      })));
    wrap.innerHTML = items.map((it) => `
      <button class="chip ripple-host" data-cat="${it.key}" aria-pressed="${state.cat === it.key}"
        ${it.key === 'all' ? '' : `style="--cat:var(--c-${it.key})"`}>
        <span class="leadcheck"><span class="material-symbols-rounded">check</span></span>
        <span class="material-symbols-rounded" style="font-size:18px">${it.icon}</span>
        ${esc(it.label)} <span class="count">${it.count}</span>
      </button>`).join('');
    $$('.chip', wrap).forEach((b) => {
      attachRipple(b);
      b.addEventListener('click', () => {
        state.cat = b.dataset.cat;
        renderChips();
        renderCards();
      });
    });
  }

  /* ============================================================
     Cards
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
    filtered = DATA.filter((d) =>
      (state.cat === 'all' || d.category === state.cat) && matches(d, state.q));
  }

  function cardHTML(d, i) {
    const lang = state.lang;
    const tags = (d.tags || []).slice(0, 3).map((tg) => `<span class="tag">${esc(tg)}</span>`).join('');
    return `
      <button class="card" data-slug="${d.slug}" style="--cat:var(--c-${d.category}); animation-delay:${Math.min(i, 12) * 28}ms">
        <div class="card__top">
          <span class="cat-pill"><span class="ic"></span>${esc(catLabel(d.category, lang))}</span>
          <span class="card__num">#${String(d.n).padStart(2, '0')}</span>
        </div>
        <h3>${esc(d.title[lang])}</h3>
        <p>${esc(d.summary[lang])}</p>
        <div class="card__tags">${tags}</div>
        <span class="card__cta">${t('cardCta')}<span class="material-symbols-rounded">arrow_forward</span></span>
      </button>`;
  }

  function renderCards() {
    computeFiltered();
    const grid = $('#grid');
    if (!filtered.length) {
      grid.innerHTML = `<div class="empty">
        <span class="material-symbols-rounded">search_off</span>
        <h3>${t('emptyTitle')}</h3><p>${t('emptyDesc')}</p></div>`;
      return;
    }
    grid.innerHTML = filtered.map(cardHTML).join('');
    $$('.card', grid).forEach((c) => {
      c.addEventListener('click', () => {
        const idx = filtered.findIndex((d) => d.slug === c.dataset.slug);
        openDialog(idx);
      });
    });
  }

  /* ============================================================
     Search
     ============================================================ */
  const searchEl = $('#search');
  const clearEl = $('#search-clear');
  let searchTimer;
  searchEl.addEventListener('input', () => {
    clearEl.classList.toggle('show', !!searchEl.value);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.q = searchEl.value.trim(); renderCards(); }, 110);
  });
  clearEl.addEventListener('click', () => {
    searchEl.value = ''; state.q = ''; clearEl.classList.remove('show'); renderCards(); searchEl.focus();
  });

  /* ============================================================
     Dialog (detail)
     ============================================================ */
  const scrim = $('#scrim');
  const dialog = $('#dialog');
  let openIndex = -1;
  let lastFocus = null;

  function listItems(arr) {
    return (arr || []).map((x) => `<li>${esc(x)}</li>`).join('');
  }
  function stepItems(arr) {
    return (arr || []).map((x) => `<li>${esc(x)}</li>`).join('');
  }

  function renderDialog() {
    const d = filtered[openIndex];
    if (!d) return;
    const lang = state.lang;
    const altLang = lang === 'zh' ? 'en' : 'zh';
    const prompt = d.prompt[lang] || d.prompt.en || '';
    const hasPrompt = !!prompt.trim();
    dialog.innerHTML = `
      <div class="dialog__head" style="--cat:var(--c-${d.category})">
        <div class="dialog__title">
          <span class="cat-pill"><span class="ic"></span>${esc(catLabel(d.category, lang))}</span>
          <h2 id="dlg-title">${esc(d.title[lang])}</h2>
          <p class="alt">${esc(d.title[altLang])}</p>
        </div>
        <button class="icon-btn ripple-host dialog__close" id="dlg-close" aria-label="Close">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>
      <div class="dialog__body">
        <section>
          <h4><span class="material-symbols-rounded">info</span>${t('secOverview')}</h4>
          <p class="lead">${esc(d.overview[lang])}</p>
        </section>
        <section>
          <h4><span class="material-symbols-rounded">target</span>${t('secWhen')}</h4>
          <ul>${listItems(d.when[lang])}</ul>
        </section>
        <section>
          <h4><span class="material-symbols-rounded">account_tree</span>${t('secSteps')}</h4>
          <ol class="steps">${stepItems(d.steps[lang])}</ol>
        </section>
        <section>
          <h4><span class="material-symbols-rounded">chat_paste_go</span>${t('secPrompt')}</h4>
          ${hasPrompt ? `<div class="prompt">
              <button class="copy-btn ripple-host" id="copy-btn"><span class="material-symbols-rounded">content_copy</span>${t('copy')}</button>
              <pre id="prompt-text">${esc(prompt)}</pre>
            </div>` : `<p class="lead" style="color:var(--on-surface-variant)">${t('noPrompt')}</p>`}
        </section>
        <div class="dialog__foot">
          <a class="btn-filled ripple-host" href="${esc(d.url)}" target="_blank" rel="noopener">
            <span class="material-symbols-rounded">open_in_new</span>${t('original')}
          </a>
          <div class="dialog__nav">
            <button class="btn-text ripple-host" id="dlg-prev"><span class="material-symbols-rounded">arrow_back</span>${t('prev')}</button>
            <button class="btn-text ripple-host" id="dlg-next">${t('next')}<span class="material-symbols-rounded">arrow_forward</span></button>
          </div>
        </div>
      </div>`;

    $$('.ripple-host', dialog).forEach(attachRipple);
    $('#dlg-close').addEventListener('click', closeDialog);
    $('#dlg-prev').addEventListener('click', () => openDialog((openIndex - 1 + filtered.length) % filtered.length));
    $('#dlg-next').addEventListener('click', () => openDialog((openIndex + 1) % filtered.length));
    const copyBtn = $('#copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText($('#prompt-text').textContent);
        } catch (_) {
          const r = document.createRange(); r.selectNode($('#prompt-text'));
          const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
          try { document.execCommand('copy'); } catch (e) {}
          sel.removeAllRanges();
        }
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `<span class="material-symbols-rounded">check</span>${t('copied')}`;
        toast(t('copied'));
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = `<span class="material-symbols-rounded">content_copy</span>${t('copy')}`;
        }, 1600);
      });
    }
    dialog.scrollTop = 0;
  }

  function openDialog(index) {
    if (index < 0 || index >= filtered.length) return;
    const firstOpen = openIndex < 0;
    openIndex = index;
    renderDialog();
    history.replaceState(null, '', '#' + filtered[openIndex].slug);
    if (firstOpen) {
      lastFocus = document.activeElement;
      scrim.hidden = false;
      requestAnimationFrame(() => scrim.classList.add('open'));
      document.body.style.overflow = 'hidden';
    }
    $('#dlg-close').focus();
  }

  function closeDialog() {
    if (openIndex < 0) return;
    openIndex = -1;
    scrim.classList.remove('open');
    document.body.style.overflow = '';
    history.replaceState(null, '', location.pathname + location.search);
    setTimeout(() => { scrim.hidden = true; }, 280);
    if (lastFocus) lastFocus.focus();
  }

  scrim.addEventListener('click', (e) => { if (e.target === scrim) closeDialog(); });
  document.addEventListener('keydown', (e) => {
    if (openIndex < 0) return;
    if (e.key === 'Escape') closeDialog();
    else if (e.key === 'ArrowLeft') openDialog((openIndex - 1 + filtered.length) % filtered.length);
    else if (e.key === 'ArrowRight') openDialog((openIndex + 1) % filtered.length);
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
     Init
     ============================================================ */
  $$('.ripple-host').forEach(attachRipple);
  $('#stat-total').textContent = DATA.length;
  $('#stat-cats').textContent = CATS.length;
  applyStaticI18n();
  renderChips();
  renderCards();

  /* Deep link: open a card if the URL hash names a slug. */
  function openFromHash() {
    const slug = decodeURIComponent(location.hash.replace('#', ''));
    if (!slug) { if (openIndex >= 0) closeDialog(); return; }
    if (openIndex >= 0 && filtered[openIndex] && filtered[openIndex].slug === slug) return;
    const idx = filtered.findIndex((d) => d.slug === slug);
    if (idx >= 0) openDialog(idx);
  }
  openFromHash();
  /* Honour same-document hash changes (shared links pasted in place, back/forward). */
  window.addEventListener('hashchange', openFromHash);
})();
