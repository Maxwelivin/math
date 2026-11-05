// 共用引擎：遊戲註冊、計時、輸入、畫布與格子工具
const GAMES = [];
const CATS = {math:'🔢 數學', puzzle:'🧩 益智', board:'♟️ 棋牌', arcade:'🕹️ 動作', reflex:'⚡ 反應', word:'📚 知識'};
function add(id, name, cat, icon, desc, run){ GAMES.push({id, name, cat, icon, desc, run}); }
const R = n => Math.floor(Math.random()*n);
const RR = (a,b) => a + R(b-a+1);
const pick = a => a[R(a.length)];
const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){const j=R(i+1);[a[i],a[j]]=[a[j],a[i]];} return a; };
const range = (n,s=0) => Array.from({length:n},(_,i)=>i+s);
const gcd = (a,b) => b ? gcd(b, a%b) : Math.abs(a);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const hit = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const sleep = ms => new Promise(r=>setTimeout(r,ms));

function makeCtx(game, stage, restart){
  const subs = []; let alive = true;
  const $ = id => document.getElementById(id);
  const g = {
    el: stage, keys: {}, alive: () => alive,
    on(t, ev, fn, opt){ t.addEventListener(ev, fn, opt); subs.push(()=>t.removeEventListener(ev, fn, opt)); },
    every(ms, fn){ const i = setInterval(()=>alive&&fn(), ms); subs.push(()=>clearInterval(i)); return i; },
    after(ms, fn){ const i = setTimeout(()=>alive&&fn(), ms); subs.push(()=>clearTimeout(i)); return i; },
    loop(fn){ let last = performance.now(), id;
      const f = t => { if(!alive) return; const dt = Math.min(0.05,(t-last)/1000); last = t; if(fn(dt) !== false) id = requestAnimationFrame(f); };
      id = requestAnimationFrame(f); subs.push(()=>cancelAnimationFrame(id)); },
    score(v){ $('score').textContent = v === '' ? '' : '分數：' + v; },
    info(v){ $('info').textContent = v; },
    best(v, lower){ const k = 'best_' + game.id; let b = null; try{ b = JSON.parse(localStorage.getItem(k)); }catch(e){}
      if(v != null && (b == null || (lower ? v < b : v > b))){ b = v; try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
      $('best').textContent = b == null ? '' : '最佳：' + b; return b; },
    html(h){ stage.insertAdjacentHTML('beforeend', h); return stage.lastElementChild; },
    div(cls, txt){ const d = document.createElement('div'); if(cls) d.className = cls; if(txt != null) d.textContent = txt; stage.appendChild(d); return d; },
    button(txt, fn, cls='btn', parent=stage){ const b = document.createElement('button'); b.className = cls; b.textContent = txt; b.onclick = fn; parent.appendChild(b); return b; },
    canvas(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; c.style.width = Math.min(w, 720) + 'px'; stage.appendChild(c);
      const x = c.getContext('2d'); x.canvas = c; return x; },
    pos(c, e){ const r = c.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e; return {x:(p.clientX-r.left)*c.width/r.width, y:(p.clientY-r.top)*c.height/r.height}; },
    grid(rows, cols, size, onClick, parent=stage){
      const d = document.createElement('div'); d.className = 'grid';
      const s = typeof size === 'number' ? Math.min(size, Math.floor((Math.min(innerWidth, 720)-40)/cols) - 4) : 40;
      d.style.gridTemplateColumns = `repeat(${cols}, ${s}px)`; d.style.gridAutoRows = s + 'px';
      const cells = [];
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){ const b = document.createElement('button'); b.className = 'cell'; b.style.fontSize = Math.floor(s*0.5)+'px';
        b.r = r; b.c = c; if(onClick) b.onclick = () => alive && onClick(r, c, b); d.appendChild(b); cells.push(b); }
      parent.appendChild(d); cells.at = (r,c) => cells[r*cols+c]; cells.size = s; cells.box = d; return cells; },
    onKey(fn){ g._kf = fn; },
    pad(keys = ['ArrowUp','ArrowLeft','ArrowDown','ArrowRight']){
      const lab = {ArrowUp:'▲',ArrowDown:'▼',ArrowLeft:'◀',ArrowRight:'▶',' ':'●'};
      const pos = {ArrowUp:2,ArrowLeft:4,ArrowDown:5,ArrowRight:6,' ':5};
      const p = document.createElement('div'); p.className = 'pad';
      const has4 = keys.includes('ArrowUp') || keys.includes('ArrowDown');
      const slots = Array(has4 ? 6 : 3).fill(null);
      keys.forEach((k,i) => { let idx = has4 ? pos[k]-1 : i; if(k===' ' && has4) idx = 0; slots[idx] = k; });
      slots.forEach(k => { const b = document.createElement('button'); if(!k){ b.style.visibility='hidden'; p.appendChild(b); return; }
        b.textContent = lab[k] || k;
        const dn = e => { e.preventDefault(); g.press(k); }, up = e => { e.preventDefault(); g.keys[k] = false; };
        b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); p.appendChild(b); });
      stage.appendChild(p); return p; },
    press(k){ if(!alive) return; g.keys[k] = true; g._kf && g._kf(k); },
    over(title, sub=''){ alive && (g.ended = true);
      const o = document.createElement('div'); o.className = 'overlay';
      o.innerHTML = `<h3>${title}</h3><div>${sub}</div>`; const b = document.createElement('button'); b.className='btn'; b.textContent='再玩一次'; b.onclick = restart; o.appendChild(b);
      stage.appendChild(o); },
    stop(){ alive = false; subs.forEach(f=>f()); }
  };
  g.on(window, 'keydown', e => { if(e.target.tagName === 'INPUT') return;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    if(!g.keys[e.key]){ g.keys[e.key] = true; g._kf && g._kf(e.key); } });
  g.on(window, 'keyup', e => { g.keys[e.key] = false; });
  return g;
}

// 通用：限時答題引擎（數學、知識類共用）
// gen() 回傳 {q, a, opts?}；有 opts 為選擇題，否則為輸入題
function quiz(g, gen, opt = {}){
  const time = opt.time ?? 60; let score = 0, left = time, cur, streak = 0, n = 0;
  const q = g.div('big'); q.style.whiteSpace = 'pre-line'; if(opt.small) q.style.fontSize = '1.5rem';
  const box = g.div('row'); const msg = g.div('msg'); const bar = g.div('hint');
  g.score(0); g.best();
  const tick = () => { bar.textContent = opt.count ? `第 ${n+1} / ${opt.count} 題` : `剩餘 ${left} 秒`; };
  const end = () => { g.best(score); g.over('時間到！', `得分 ${score}`); };
  const judge = ok => { n++;
    if(ok){ streak++; score += 10 + Math.min(streak, 10); msg.textContent = '✅ 正確！'; msg.style.color = 'var(--ok)'; }
    else { streak = 0; msg.textContent = '❌ 答案：' + cur.a; msg.style.color = 'var(--bad)'; }
    g.score(score); if(opt.count && n >= opt.count){ g.best(score); return g.over('完成！', `得分 ${score}`); } next(); };
  const next = () => { cur = gen(); q.textContent = cur.q; box.innerHTML = '';
    if(cur.opts){ shuffle(cur.opts).forEach(o => g.button(String(o), () => judge(String(o) === String(cur.a)), 'opt', box)); }
    else { const inp = document.createElement('input'); inp.className = 'ans'; inp.inputMode = opt.text ? 'text' : 'decimal'; inp.autocomplete = 'off';
      inp.onkeydown = e => { if(e.key === 'Enter' && inp.value.trim() !== '') judge(norm(inp.value) === norm(cur.a)); };
      box.appendChild(inp); g.button('送出', () => inp.value.trim() !== '' && judge(norm(inp.value) === norm(cur.a)), 'btn', box); setTimeout(()=>inp.focus(), 0); }
    tick(); };
  const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, '');
  if(!opt.count) g.every(1000, () => { left--; tick(); if(left <= 0){ g.stop(); end(); } });
  next();
}
// 由正確答案產生干擾選項
function opts4(a, f = () => a + RR(-10,10)){ const s = new Set([a]); let t = 0; while(s.size < 4 && t++ < 200){ const v = f(); if(v !== a) s.add(v); } return [...s]; }
