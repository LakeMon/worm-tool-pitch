(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const morph = $('story-morph');
  const phases = [
    ['01 / 原始对话', '“那就让它开吧。”', '原始对话'],
    ['02 / 理解故事', '留下，才是故事的转折。', '理解故事'],
    ['03 / 收藏漫画', '同一句对白，终于有了画面。', '收藏漫画']
  ];
  function setMorph(value) {
    morph.value = value;
    const phase = value < 34 ? 0 : value < 75 ? 1 : 2;
    $('specimen').dataset.phase = phase;
    $('morph-output').textContent = phases[phase][0];
    $('specimen-tag').textContent = phases[phase][1];
    morph.setAttribute('aria-valuetext', phases[phase][2]);
    morph.style.setProperty('--morph', `${value}%`);
    document.querySelectorAll('[data-morph]').forEach((b,i) => b.setAttribute('aria-pressed', String(i === phase)));
  }
  morph.addEventListener('input', () => setMorph(Number(morph.value)));
  document.querySelectorAll('[data-morph]').forEach(b => b.addEventListener('click', () => setMorph(Number(b.dataset.morph))));
  const cases = [
    { type:'THE MOMENT / 留住名场面', lines:['“那次告别，','我还想再看一遍。”'], description:'一段持续很久的角色剧情，终于走到告白、重逢或告别。用户把那段对话交给 Worm，留下一篇属于这段关系的漫画。', outcome:'为已经发生的情感，留一份纪念。' },
    { type:'THE CONNECTION / 让朋友读懂', lines:['“终于能解释，','我为什么这么喜欢他。”'], description:'想向同好分享这段关系，却不想发几十张截图。选出一个名场面，变成朋友能直接读完的漫画。', outcome:'把只有自己懂的情感，变成同好读得懂的故事。' },
    { type:'THE CHARACTERS / 让原创角色出场', lines:['“这一次，我的角色','真的站在了一起。”'], description:'已经有角色设定、形象参考和 RP 剧情的创作者，用一个完整片段，让自己的角色在画面里相遇。', outcome:'从人设与文字，到属于自己角色的第一本漫画。' }
  ];
  const tabs = [...document.querySelectorAll('[data-case]')];
  function selectCase(index, focus=false) {
    const item = cases[index];
    tabs.forEach((tab,i) => { tab.setAttribute('aria-selected',String(i===index)); tab.tabIndex=i===index?0:-1; if(focus && i===index) tab.focus(); });
    $('case-panel').setAttribute('aria-labelledby',`case-tab-${index}`);
    $('case-number').textContent = `0${index+1}`;
    $('case-type').textContent = item.type;
    $('case-title').replaceChildren(document.createTextNode(item.lines[0]),document.createElement('br'),document.createTextNode(item.lines[1]));
    $('case-description').textContent = item.description;
    $('case-outcome').textContent = item.outcome;
  }
  tabs.forEach((tab,i) => {
    tab.addEventListener('click', () => selectCase(i));
    tab.addEventListener('keydown', event => {
      const next = ({ArrowRight:(i+1)%3, ArrowDown:(i+1)%3, ArrowLeft:(i+2)%3, ArrowUp:(i+2)%3, Home:0, End:2})[event.key];
      if(next!==undefined){event.preventDefault();selectCase(next,true);}
    });
  });
  const traceButtons = [...document.querySelectorAll('[data-trace]')];
  const speech = [...document.querySelectorAll('#story-comic .speech')];
  traceButtons.forEach((button,index) => button.addEventListener('click', () => {
    const selected = button.getAttribute('aria-pressed') !== 'true';
    traceButtons.forEach((b,i) => b.setAttribute('aria-pressed', String(selected && i === index)));
    speech.forEach((bubble,i) => bubble.classList.toggle('is-traced', selected && i === index));
    $('story-comic').classList.toggle('is-tracing', selected);
    $('trace-status').textContent = selected ? `对白 0${index+1} / 已保留原句` : '概念样例 · 01';
  }));
  const compact = matchMedia('(max-width:600px)');
  const machineCompact = matchMedia('(max-width:900px)');
  function orientations() {
    document.querySelector('.case-tabs').setAttribute('aria-orientation', compact.matches?'horizontal':'vertical');
    document.querySelector('.demo-steps').setAttribute('aria-orientation', machineCompact.matches?'horizontal':'vertical');
  }
  compact.addEventListener('change', orientations);
  machineCompact.addEventListener('change', orientations);
  orientations();
  // Observe the existing step state; all buttons, arrows and next actions stay in sync.
  const stepObserver = new MutationObserver(() => {
    const active = document.querySelector('[data-step][aria-selected="true"]');
    const index = Number(active.dataset.step);
    $('reactor-number').textContent = `0${index+1}`;
    document.querySelector('.reactor-dial i').style.transform = `rotate(${index*90}deg) translateY(-${innerWidth<=1150?65:72}px)`;
  });
  document.querySelectorAll('[data-step]').forEach(step => stepObserver.observe(step,{attributes:true,attributeFilter:['aria-selected']}));
})();
