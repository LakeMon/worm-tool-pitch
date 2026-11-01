(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const personas = [
    { index:'A / START HERE', title:'“我想把我们那次告别画出来。”', description:'有原创角色或自设人物，长期进行双人剧情扮演，已经保存过对白或分享过名场面。', points:['已有一个完整片段：告白、和解、重逢或冒险。','能提供两位角色的形象参考或具体描述。','愿意提交素材，并为确认后的成品付费。'], insight:'优先筛选标准：有素材 + 有还原要求 + 有完成作品的意愿。分享意愿用于分层，不作为购买门槛。' },
    { index:'B / PRIVATE COLLECTORS', title:'“这本漫画，我想只留给自己。”', description:'与角色建立了长期关系，愿意收藏重要时刻，但不愿公开私人对白。这是分享意愿分层，可以与双人 RP 人群重叠。', points:['可能有较强纪念价值，但制作频率需要观察。','提供脱敏与私密交付，不要求公开分享。','验证不依赖传播，工具本身是否值得购买。'], insight:'不要用分享率筛掉有付费意愿的客户。收藏与传播应分层统计，复购比公开表达更能说明私密用户价值。' },
    { index:'C / NOT YET', title:'“把我半年的全部聊天都画出来。”', description:'多角色、跨世界的超长群像，或没有完整事件的日常陪伴聊天，都不适合作为第一版主要输入。', points:['长历史与多角色显著增加整理和一致性难度。','普通闲聊需要额外编剧，容易偏离忠实改编。','可以帮助截取双人片段，但不承诺全历史成书。'], insight:'这是制作范围选择，不是判断这些用户没有价值。待固定规格的付费交付成立后，再决定扩展。' }
  ];
  function activatePersona(index, focus = false) {
    const data = personas[index];
    document.querySelectorAll('[data-persona]').forEach((button, i) => {
      button.classList.toggle('active', i === index);
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
      if (focus && i === index) button.focus();
    });
    $('persona-panel').setAttribute('aria-labelledby', `persona-tab-${index}`);
    $('persona-index').textContent = data.index;
    $('persona-title').textContent = data.title;
    $('persona-description').textContent = data.description;
    $('persona-insight').textContent = data.insight;
    $('persona-points').replaceChildren(...data.points.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  }
  function activateStep(index, focus = false) {
    document.querySelectorAll('[data-step]').forEach((button, i) => {
      button.classList.toggle('active', i === index);
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
      $(`demo-panel-${i}`).hidden = i !== index;
      if (focus && i === index) button.focus();
    });
  }
  function bindTabs(selector, activate) {
    const tabs = [...document.querySelectorAll(selector)];
    tabs.forEach((button, index) => {
      button.addEventListener('click', () => activate(index));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); activate(next, true); }
      });
    });
  }
  bindTabs('[data-persona]', activatePersona);
  bindTabs('[data-step]', activateStep);
  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => activateStep(Number(button.dataset.next), true)));
  $('share-consent').addEventListener('change', event => {
    const visible = event.target.checked;
    $('share-demo').classList.toggle('private', !visible);
    $('share-lock').hidden = visible;
    $('share-badge').textContent = visible ? 'EXCERPT PREVIEW' : 'PRIVATE';
    $('share-demo-cta').disabled = !visible;
    $('privacy-state').textContent = visible ? '演示预览：只展示已选漫画摘录；原始对话不公开。' : '当前：私密收藏。分享页尚未开放。';
  });
  $('share-demo-cta').addEventListener('click', () => activateStep(0, true));
  const growthIds = ['share-rate','share-visitors','submit-rate','pay-rate'];
  function updateGrowth() {
    const [s,v,u,p] = growthIds.map(id => Number($(id).value));
    growthIds.forEach((id, i) => $(`${id}-value`).textContent = `${$(id).value}${i === 1 ? ' 人' : '%'}`);
    const k = (s / 100) * v * (u / 100) * (p / 100);
    $('growth-k').textContent = k.toFixed(2);
    $('growth-verdict').textContent = k === 0 ? '在这组假设下，分享链路没有带来新增付费客户。先定位哪一步没有发生。' : k < 1 ? '在这组假设下，它是一条补充获客渠道，尚不能自我维持增长。' : '这组假设达到 K ≥ 1；需要用真实去重队列验证，不能据此宣称已形成病毒增长。';
  }
  growthIds.forEach(id => $(id).addEventListener('input', updateGrowth));
  const costIds = ['price','generation','retry','minutes','hourly','fee','overhead','cac'];
  function readNumber(id) { const input = $(id); const number = Number(input.value); return Number.isFinite(number) ? Math.min(Number(input.max), Math.max(0, number)) : 0; }
  const money = number => `${number < 0 ? '− ' : ''}¥${Math.abs(number).toFixed(2)}`;
  function updateEconomics() {
    const [price,generation,retry,minutes,hourly,fee,overhead,cac] = costIds.map(readNumber);
    const cost = generation * (1 + retry / 100) + minutes / 60 * hourly + price * fee / 100 + overhead;
    const beforeCAC = price - cost;
    const contribution = beforeCAC - cac;
    $('revenue-value').textContent = money(price);
    $('cost-value').textContent = `− ${money(cost)}`;
    $('cac-value').textContent = `− ${money(cac)}`;
    $('margin-value').textContent = money(contribution);
    $('cac-ceiling').textContent = beforeCAC > 0 ? money(beforeCAC) : '无正值空间';
    document.querySelector('.economics-output').classList.toggle('negative', contribution < 0);
    $('margin-verdict').textContent = contribution > 0 ? '在这组假设下首单贡献为正；尚不等于整体盈利。' : contribution === 0 ? '在这组假设下首单贡献持平，尚未覆盖固定研发与管理费用。' : '在这组假设下首单贡献为负，需要调整价格、制作成本或获客方式。';
  }
  costIds.forEach(id => { $(id).addEventListener('input', updateEconomics); $(id).addEventListener('change', () => { $(id).value = readNumber(id); updateEconomics(); }); });
  // Navigation uses the same anchors on desktop and mobile.
  const menu = document.querySelector('.menu-toggle');
  const navigation = $('main-nav');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
  });
  const personaHorizontal = matchMedia('(min-width: 541px) and (max-width: 800px)');
  function updatePersonaOrientation() { document.querySelector('.persona-tabs').setAttribute('aria-orientation', 'vertical'); }
  personaHorizontal.addEventListener('change', updatePersonaOrientation);
  updatePersonaOrientation();
  const mobileQuery = matchMedia('(max-width: 600px)');
  mobileQuery.addEventListener('change', closeMenu);
  const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
  const activeChapters = new Set();
  const chapterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? activeChapters.add(entry.target.id) : activeChapters.delete(entry.target.id));
    const current = navLinks.find(link => activeChapters.has(link.hash.slice(1)));
    navLinks.forEach(link => current === link ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
  }, { rootMargin: '-15% 0px -55% 0px' });
  navLinks.forEach(link => { const target = document.querySelector(link.hash); if (target) chapterObserver.observe(target); });

  // Native dialog provides focus containment, Escape and return to the opener.
  const reader = document.querySelector('.reader');
  document.querySelectorAll('[data-open-reader]').forEach(button => button.addEventListener('click', () => { reader.showModal(); reader.scrollTop = 0; }));
  document.querySelector('.reader-close').addEventListener('click', () => reader.close());
  reader.addEventListener('click', event => {
    const bounds = reader.getBoundingClientRect();
    if (event.target === reader && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) reader.close();
  });

  // Reveal the closing thought by Chinese phrase; never hide content without JS.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const tagline = document.querySelector('.tagline');
  let taglineTimer;
  const taglineObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      const parts = [...tagline.querySelectorAll('span')];
      let index = 0;
      const revealNext = () => {
        if (index >= parts.length) return;
        parts[index++].classList.add('is-visible');
        taglineTimer = setTimeout(revealNext, 180);
      };
      revealNext(); taglineObserver.disconnect();
    }
  }, { threshold: .6 });
  if (!reducedMotion.matches) { tagline.classList.add('is-observed'); taglineObserver.observe(tagline); }
  reducedMotion.addEventListener('change', event => {
    if (event.matches) { clearTimeout(taglineTimer); taglineObserver.disconnect(); tagline.classList.remove('is-observed'); }
  });

  let progressFrame = 0;
  function updateProgress() {
    progressFrame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    $('progress-bar').style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
  }
  function queueProgress() { if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress); }
  window.addEventListener('scroll', queueProgress, { passive:true });
  window.addEventListener('resize', queueProgress);
  document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', queueProgress));
  updateGrowth(); updateEconomics(); updateProgress();
})();
