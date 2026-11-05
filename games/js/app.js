(function(){
  const $ = id => document.getElementById(id);
  let cat = 'all', cur = null, ctx = null;
  const cats = $('cats');
  [['all','全部']].concat(Object.entries(CATS)).forEach(([k,v]) => {
    const b = document.createElement('button'); b.className = 'chip' + (k==='all'?' on':''); b.textContent = v + (k==='all' ? ` (${GAMES.length})` : ` (${GAMES.filter(x=>x.cat===k).length})`);
    b.onclick = () => { cat = k; [...cats.children].forEach(c=>c.classList.remove('on')); b.classList.add('on'); render(); }; cats.appendChild(b); });
  function render(){
    const q = $('q').value.trim(); const list = $('list'); list.innerHTML = '';
    const items = GAMES.filter(x => (cat==='all'||x.cat===cat) && (!q || (x.name+x.desc).includes(q)));
    $('count').textContent = `共 ${items.length} 個遊戲`;
    items.forEach((x,i) => { const b = document.createElement('button'); b.className = 'gc';
      b.innerHTML = `<div class="ic">${x.icon}</div><b>${x.name}</b><small>${CATS[x.cat]}</small>`; b.onclick = () => location.hash = x.id; list.appendChild(b); });
  }
  $('q').oninput = render;
  function start(){
    if(ctx) ctx.stop(); const st = $('stage'); st.innerHTML = '';
    ['score','best','info'].forEach(i => $(i).textContent = '');
    ctx = makeCtx(cur, st, start);
    try { cur.run(ctx); } catch(e){ console.error(e); st.textContent = '遊戲載入失敗：' + e.message; }
  }
  function route(){
    const id = location.hash.slice(1); const gm = GAMES.find(x => x.id === id);
    if(!gm){ if(ctx){ ctx.stop(); ctx = null; } $('stage').innerHTML=''; $('player').hidden = true; $('hub').hidden = false; document.title = '200 個小遊戲'; return; }
    cur = gm; $('hub').hidden = true; $('player').hidden = false;
    $('gname').textContent = gm.icon + ' ' + gm.name; $('gdesc').textContent = gm.desc; document.title = gm.name;
    scrollTo(0,0); start();
  }
  $('back').onclick = () => { location.hash = ''; };
  $('restart').onclick = () => start();
  addEventListener('hashchange', route);
  render(); route();
})();
