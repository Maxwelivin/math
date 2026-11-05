// ===== 益智類 =====
(function(){
const P = (id,name,icon,desc,run) => add(id,name,'puzzle',icon,desc,run);
const swipe = (g, el, fn) => { let s; g.on(el,'touchstart',e=>{ s = e.touches[0]; },{passive:true});
  g.on(el,'touchend',e=>{ if(!s) return; const t = e.changedTouches[0], dx = t.clientX-s.clientX, dy = t.clientY-s.clientY; if(Math.max(Math.abs(dx),Math.abs(dy))<25) return;
    fn(Math.abs(dx)>Math.abs(dy) ? (dx>0?'ArrowRight':'ArrowLeft') : (dy>0?'ArrowDown':'ArrowUp')); s = null; }); };
const D4 = [[0,1],[1,0],[0,-1],[-1,0]];

// 滑塊拼圖
[3,4,5].forEach(n => P('slide'+n, `滑塊拼圖 ${n}×${n}`, '🧱', `點擊空格旁的方塊，把數字排回 1～${n*n-1}`, g => {
  let b = range(n*n,1); b[n*n-1] = 0; let e = n*n-1, moves = 0; g.best(null);
  const mv = i => { const er = Math.floor(e/n), ec = e%n, r = Math.floor(i/n), c = i%n; if(Math.abs(er-r)+Math.abs(ec-c)!==1) return false; [b[e],b[i]]=[b[i],b[e]]; e = i; return true; };
  for(let k=0;k<n*n*40;k++){ const er=Math.floor(e/n), ec=e%n; const nb = D4.map(([dr,dc])=>[er+dr,ec+dc]).filter(([r,c])=>r>=0&&c>=0&&r<n&&c<n); const [r,c]=pick(nb); mv(r*n+c); }
  const cells = g.grid(n,n,Math.floor(320/n),(r,c)=>{ if(mv(r*n+c)){ moves++; g.info('步數 ' + moves); draw(); } });
  const draw = () => { cells.forEach((x,i)=>{ x.textContent = b[i]||''; x.style.background = b[i] ? (b[i]===i+1?'#86efac':'') : 'transparent'; x.style.color = b[i]===i+1?'#14532d':''; });
    if(b.every((v,i)=>i===n*n-1 ? v===0 : v===i+1)){ g.best(moves, true); g.over('完成！', `共 ${moves} 步`); } };
  g.onKey(k => { const er=Math.floor(e/n), ec=e%n; const d = {ArrowUp:[1,0],ArrowDown:[-1,0],ArrowLeft:[0,1],ArrowRight:[0,-1]}[k]; if(!d) return;
    const r=er+d[0], c=ec+d[1]; if(r>=0&&c>=0&&r<n&&c<n && mv(r*n+c)){ moves++; g.info('步數 ' + moves); draw(); } });
  draw();
}));

// 數字合併
[3,4,5,6].forEach(n => P('merge'+n, `數字合併 ${n}×${n}`, '🔷', '方向鍵或滑動，相同數字相撞會合併，努力合出更大的數！', g => {
  let b = Array(n*n).fill(0), score = 0; g.score(0); g.best();
  const col = v => ['','#eee4da','#ede0c8','#f2b179','#f59563','#f67c5f','#f65e3b','#edcf72','#edcc61','#edc850','#edc53f','#edc22e','#3c3a32'][Math.min(12, Math.log2(v||1))];
  const spawn = () => { const e = b.map((v,i)=>v?-1:i).filter(i=>i>=0); if(e.length) b[pick(e)] = Math.random()<.9?2:4; };
  const cells = g.grid(n,n,Math.floor(340/n)); g.pad();
  const line = (k,i) => range(n).map(j => k==='ArrowLeft'? i*n+j : k==='ArrowRight'? i*n+(n-1-j) : k==='ArrowUp'? j*n+i : (n-1-j)*n+i);
  const move = k => { if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(k)) return; let ch = false;
    for(let i=0;i<n;i++){ const idx = line(k,i), v = idx.map(x=>b[x]).filter(Boolean), o = [];
      for(let j=0;j<v.length;j++){ if(v[j]===v[j+1]){ o.push(v[j]*2); score += v[j]*2; j++; } else o.push(v[j]); }
      idx.forEach((x,j)=>{ const nv = o[j]||0; if(b[x]!==nv) ch = true; b[x] = nv; }); }
    if(ch){ spawn(); g.score(score); draw(); } };
  const draw = () => { cells.forEach((x,i)=>{ x.textContent = b[i]||''; x.style.background = b[i]?col(b[i]):''; x.style.color = b[i]>4?'#fff':'#776e65'; x.style.fontSize = (b[i]>=1000?cells.size*.3:cells.size*.42)+'px'; });
    const can = b.some(v=>!v) || b.some((v,i)=> (i%n<n-1 && v===b[i+1]) || (i+n<n*n && v===b[i+n]));
    if(!can){ g.best(score); g.over('沒有步可走了', `得分 ${score}，最大 ${Math.max(...b)}`); } };
  g.onKey(move); swipe(g, cells.box, move); spawn(); spawn(); draw();
}));

// 踩地雷
[['mines1','初級',9,9,10],['mines2','中級',12,12,25],['mines3','高級',16,16,45]].forEach(([id,lv,R0,C0,N]) => P(id, `踩地雷（${lv}）`, '💣', `找出 ${N} 顆地雷。右鍵或「插旗模式」標記地雷`, g => {
  let mine = null, open = Array(R0*C0).fill(false), flag = Array(R0*C0).fill(false), flagMode = false, done = false, t0 = 0;
  const nb = i => { const r=Math.floor(i/C0), c=i%C0, o=[]; for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){ const rr=r+dr, cc=c+dc; if((dr||dc)&&rr>=0&&cc>=0&&rr<R0&&cc<C0) o.push(rr*C0+cc);} return o; };
  const cnt = i => nb(i).filter(j=>mine[j]).length;
  const tb = g.div('row'); const fb = g.button('🚩 插旗模式：關', () => { flagMode = !flagMode; fb.textContent = '🚩 插旗模式：' + (flagMode?'開':'關'); }, 'btn alt', tb);
  g.best(null);
  const cells = g.grid(R0,C0,34,(r,c)=>click(r*C0+c));
  cells.forEach((b,i)=> b.oncontextmenu = e => { e.preventDefault(); if(!done && !open[i]){ flag[i]=!flag[i]; draw(); } });
  const flood = i => { const st=[i]; while(st.length){ const k=st.pop(); if(open[k]||flag[k]) continue; open[k]=true; if(!cnt(k)) nb(k).forEach(j=>!open[j]&&st.push(j)); } };
  const click = i => { if(done) return; if(flagMode){ if(!open[i]) flag[i]=!flag[i]; return draw(); } if(flag[i]) return;
    if(!mine){ mine = Array(R0*C0).fill(false); const safe = new Set([i, ...nb(i)]); shuffle(range(R0*C0).filter(k=>!safe.has(k))).slice(0,N).forEach(k=>mine[k]=true); t0 = Date.now(); }
    if(open[i] && cnt(i)){ const f = nb(i).filter(j=>flag[j]).length; if(f===cnt(i)) nb(i).forEach(j=>{ if(!flag[j]&&!open[j]){ if(mine[j]) open[j]=true; else flood(j); } }); }
    else if(mine[i]) open[i] = true; else flood(i);
    draw(); };
  const draw = () => { const boom = mine && open.some((o,i)=>o&&mine[i]);
    cells.forEach((b,i)=>{ const n = mine && cnt(i);
      b.textContent = open[i] ? (mine[i]?'💥':(n||'')) : (boom&&mine[i]?'💣':flag[i]?'🚩':'');
      b.style.background = open[i] ? 'transparent' : ''; b.style.color = ['','#2563eb','#16a34a','#dc2626','#7c3aed','#b45309','#0891b2','#000','#666'][n]||''; });
    g.info('剩餘地雷 ' + (N - flag.filter(Boolean).length));
    if(boom){ done = true; g.over('💥 踩到地雷了', ''); }
    else if(mine && open.filter(Boolean).length === R0*C0-N){ done = true; const s = Math.round((Date.now()-t0)/1000); g.best(s, true); g.over('🎉 成功排雷！', `用時 ${s} 秒`); } };
  draw();
}));

// 數獨
const sudokuFull = () => { const b = Array(81).fill(0);
  const ok = (i,v) => { const r=Math.floor(i/9), c=i%9, br=r-r%3, bc=c-c%3; for(let k=0;k<9;k++){ if(b[r*9+k]===v||b[k*9+c]===v||b[(br+Math.floor(k/3))*9+bc+k%3]===v) return false; } return true; };
  const fill = i => { if(i===81) return true; for(const v of shuffle(range(9,1))) if(ok(i,v)){ b[i]=v; if(fill(i+1)) return true; b[i]=0; } return false; };
  fill(0); return b; };
[['sudoku1','簡單',36],['sudoku2','中等',46],['sudoku3','困難',54]].forEach(([id,lv,hole]) => P(id, `數獨（${lv}）`, '9️⃣', '每行、每列、每個 3×3 宮格都要填入 1～9', g => {
  const sol = sudokuFull(), fixed = sol.slice(); shuffle(range(81)).slice(0,hole).forEach(i=>fixed[i]=0);
  const v = fixed.slice(); let sel = -1, t0 = Date.now(), err = 0;
  const cells = g.grid(9,9,40,(r,c)=>{ sel = r*9+c; draw(); });
  cells.forEach((b,i)=>{ const r=Math.floor(i/9), c=i%9; if(c%3===2&&c<8) b.style.marginRight='3px'; if(r%3===2&&r<8) b.style.marginBottom='3px'; b.style.borderRadius='3px'; });
  const nums = g.div('row'); range(9,1).forEach(n => g.button(n, () => put(n), 'opt', nums)); g.button('清除', () => put(0), 'btn alt', nums);
  const put = n => { if(sel<0 || fixed[sel]) return; v[sel] = n; if(n && n!==sol[sel]) err++; draw(); };
  g.onKey(k => { if(/^[1-9]$/.test(k)) put(+k); else if(k==='Backspace'||k==='0') put(0);
    else if(sel>=0){ const d={ArrowUp:-9,ArrowDown:9,ArrowLeft:-1,ArrowRight:1}[k]; if(d){ sel = clamp(sel+d,0,80); draw(); } } });
  const draw = () => { cells.forEach((b,i)=>{ b.textContent = v[i]||''; const same = sel>=0 && v[sel] && v[i]===v[sel];
      const rel = sel>=0 && (Math.floor(i/9)===Math.floor(sel/9) || i%9===sel%9);
      b.style.background = i===sel ? 'var(--pri)' : same ? '#fde68a' : rel ? 'var(--pri2)' : '';
      b.style.color = i===sel ? '#fff' : fixed[i] ? '' : (v[i] && v[i]!==sol[i]) ? '#dc2626' : '#2563eb'; b.style.fontWeight = fixed[i]?'800':'500'; });
    g.info('錯誤 ' + err);
    if(v.every((x,i)=>x===sol[i])){ const s=Math.round((Date.now()-t0)/1000); g.best(s, true); g.over('🎉 完成數獨！', `用時 ${s} 秒`); } };
  g.best(null); draw();
}));

// 點燈遊戲
[3,5,7].forEach(n => P('lights'+n, `關燈遊戲 ${n}×${n}`, '💡', '點一盞燈會切換它和上下左右的燈，把燈全部關掉', g => {
  const b = Array(n*n).fill(false); let moves = 0;
  const tog = i => { const r=Math.floor(i/n), c=i%n; [[0,0],...D4].forEach(([dr,dc])=>{ const rr=r+dr, cc=c+dc; if(rr>=0&&cc>=0&&rr<n&&cc<n) b[rr*n+cc]=!b[rr*n+cc]; }); };
  do{ for(let k=0;k<n*n;k++) if(Math.random()<.4) tog(k); }while(!b.some(Boolean));
  g.best(null);
  const cells = g.grid(n,n,Math.floor(320/n),(r,c)=>{ tog(r*n+c); moves++; g.info('步數 '+moves); draw(); });
  const draw = () => { cells.forEach((x,i)=>{ x.style.background = b[i]?'#facc15':'#334155'; x.style.boxShadow = b[i]?'0 0 12px #facc15':''; });
    if(!b.some(Boolean)){ g.best(moves,true); g.over('全部熄滅！', `共 ${moves} 步`); } };
  draw();
}));

// 翻牌記憶
[['mem1','翻牌記憶（水果）',4,4,'🍎🍌🍇🍓🍒🍑🍍🥝'],['mem2','翻牌記憶（動物）',4,5,'🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯'],['mem3','翻牌記憶（大師）',6,6,'⚽🏀🏈⚾🎾🏐🏉🎱🏓🏸🥊🎯⛳🎳🏒🥌🛹🎿']].forEach(([id,name,rr,cc,set]) => P(id, name, '🃏', '翻開兩張相同的牌就能配對，用最少步數完成', g => {
  const em = [...set].slice(0, rr*cc/2); const d = shuffle([...em, ...em]); const open = Array(d.length).fill(false); let a = null, lock = false, moves = 0;
  g.best(null);
  const cells = g.grid(rr,cc,70,(r,c,b)=>{ const i=r*cc+c; if(lock||open[i]||i===a) return; b.textContent = d[i]; b.style.background='var(--pri2)';
    if(a===null){ a = i; return; } moves++; g.info('步數 '+moves);
    if(d[a]===d[i]){ open[a]=open[i]=true; a=null; if(open.every(Boolean)){ g.best(moves,true); g.over('全部配對！', `共 ${moves} 步`); } }
    else { lock = true; const j=a; a=null; g.after(700, ()=>{ cells[i].textContent=''; cells[j].textContent=''; cells[i].style.background=cells[j].style.background=''; lock=false; }); } });
}));

// 河內塔
P('hanoi','河內塔','🗼','把所有圓盤移到最右邊的柱子，大盤不能放在小盤上', g => {
  let n = 4, pegs, hold, moves;
  const sel = g.div('row'); [3,4,5,6,7].forEach(k => g.button(k+' 層', () => { n = k; reset(); }, 'btn alt', sel));
  const x = g.canvas(480, 260);
  const reset = () => { pegs = [range(n).map(i=>n-i),[],[]]; hold = null; moves = 0; g.info(`最少 ${2**n-1} 步`); draw(); };
  const draw = () => { x.fillStyle='#0b1020'; x.fillRect(0,0,480,260); x.fillStyle='#64748b'; x.fillRect(20,236,440,8);
    pegs.forEach((p,k)=>{ const cx = 80+k*160; x.fillStyle = hold===k?'#60a5fa':'#94a3b8'; x.fillRect(cx-4,60,8,176);
      p.forEach((d,j)=>{ const w = 30+d*16; x.fillStyle = `hsl(${d*45},70%,55%)`; const y = 214-j*22 - (hold===k&&j===p.length-1?40:0); x.fillRect(cx-w/2, y, w, 20); }); });
    x.fillStyle='#fff'; x.font='16px sans-serif'; x.fillText('步數：'+moves, 12, 24); };
  g.on(x.canvas,'pointerdown',e=>{ const k = clamp(Math.floor(g.pos(x.canvas,e).x/160),0,2);
    if(hold===null){ if(pegs[k].length) hold = k; } else { const d = pegs[hold].at(-1); if(k!==hold && (!pegs[k].length || pegs[k].at(-1)>d)){ pegs[k].push(pegs[hold].pop()); moves++; } hold = null; }
    draw(); if(pegs[2].length===n){ g.over('完成！', `${moves} 步（最少 ${2**n-1} 步）`); } });
  reset();
});

// 珠璣妙算
P('mastermind','珠璣妙算','🔴','猜出 4 個顏色的密碼（可重複）。●=顏色位置都對，○=顏色對位置錯，共 10 次', g => {
  const C = ['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899'], code = range(4).map(()=>R(6)); let cur = [], tries = 0;
  const log = g.div(''); const now = g.div('row'); const pal = g.div('row'); const ctl = g.div('row');
  const dot = (c, s=28) => `<span style="display:inline-block;width:${s}px;height:${s}px;border-radius:50%;background:${c};margin:2px;vertical-align:middle;border:2px solid #0003"></span>`;
  const draw = () => { now.innerHTML = range(4).map(i=>dot(cur[i]!=null?C[cur[i]]:'transparent',36)).join(''); g.info(`第 ${tries+1} / 10 次`); };
  C.forEach((c,i)=>{ const b = g.button('', () => { if(cur.length<4){ cur.push(i); draw(); } }, 'opt', pal); b.style.cssText = `background:${c};min-width:44px;height:44px;border-radius:50%`; });
  g.button('⌫', () => { cur.pop(); draw(); }, 'btn alt', ctl);
  g.button('確定', () => { if(cur.length<4) return; tries++; let A=0,B=0; const ca=[],cb=[];
    for(let i=0;i<4;i++){ if(cur[i]===code[i]) A++; else { ca.push(code[i]); cb.push(cur[i]); } }
    cb.forEach(v=>{ const j=ca.indexOf(v); if(j>=0){ B++; ca.splice(j,1); } });
    log.insertAdjacentHTML('beforeend', `<div>${cur.map(v=>dot(C[v])).join('')} &nbsp; ${'●'.repeat(A)}${'○'.repeat(B)}</div>`);
    cur = []; draw();
    if(A===4){ g.best(tries, true); g.over('破解成功！', `用了 ${tries} 次`); } else if(tries>=10) g.over('失敗了', '答案：' + code.map(v=>dot(C[v])).join('')); }, 'btn', ctl);
  g.best(null); draw();
});

// 推箱子
const SOKO = [
["#######","#     #","# .$@ #","#     #","#######"],
["########","#      #","# $ $  #","# .#. @#","#      #","########"],
["########","#..  $ #","#  $   #","## ### #","#  @   #","########"],
["#########","#   #   #","# $   $ #","#  ...  #","# $ # @ #","#   #   #","#########"]];
P('sokoban','推箱子','📦','方向鍵推動箱子，把所有箱子推到 ● 目標點上', g => {
  let lv = 0, map, me, boxes, goals, moves;
  const x = g.canvas(400, 320); g.pad(); const row = g.div('row'); g.button('重來本關', () => load(), 'btn alt', row);
  const load = () => { map = SOKO[lv].map(s=>[...s]); boxes = new Set(); goals = new Set(); moves = 0;
    map.forEach((r,y)=>r.forEach((ch,c)=>{ const k=y*20+c; if(ch==='@') me=[y,c]; if(ch==='$') boxes.add(k); if(ch==='.') goals.add(k); if(ch==='*'){boxes.add(k);goals.add(k);} }));
    g.info(`第 ${lv+1} / ${SOKO.length} 關`); draw(); };
  const draw = () => { const s = 40; x.fillStyle='#0b1020'; x.fillRect(0,0,400,320); x.font='28px sans-serif'; x.textAlign='center'; x.textBaseline='middle';
    map.forEach((r,y)=>r.forEach((ch,c)=>{ const k=y*20+c, px=c*s+20, py=y*s+20; if(ch==='#'){ x.fillStyle='#64748b'; x.fillRect(px,py,s-2,s-2); }
      if(goals.has(k)){ x.fillStyle='#f87171'; x.beginPath(); x.arc(px+s/2,py+s/2,7,0,7); x.fill(); }
      if(boxes.has(k)) x.fillText(goals.has(k)?'✅':'📦', px+s/2, py+s/2+2); }));
    x.fillText('🧑', me[1]*s+20+s/2, me[0]*s+20+s/2+2); };
  g.onKey(k => { const d = {ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[k]; if(!d||g.ended) return;
    const ny=me[0]+d[0], nx=me[1]+d[1], nk=ny*20+nx; if(map[ny][nx]==='#') return;
    if(boxes.has(nk)){ const by=ny+d[0], bx=nx+d[1], bk=by*20+bx; if(map[by][bx]==='#'||boxes.has(bk)) return; boxes.delete(nk); boxes.add(bk); }
    me=[ny,nx]; moves++; draw();
    if([...boxes].every(b=>goals.has(b))){ if(lv<SOKO.length-1){ lv++; g.after(500, load); } else g.over('全部過關！🎉',''); } });
  load();
});

// 填色洪水
P('flood','顏色洪水','🌊','從左上角開始換色，在 22 步內把整個盤面變成同一色', g => {
  const N = 12, C = ['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899']; const b = range(N*N).map(()=>R(6)); let moves = 0;
  const cells = g.grid(N,N,28); cells.box.style.gap='0'; cells.forEach(c=>c.style.borderRadius='0');
  const row = g.div('row');
  C.forEach((c,i)=>{ const x = g.button('', () => go(i), 'opt', row); x.style.cssText=`background:${c};min-width:48px;height:48px`; });
  const go = col => { const old = b[0]; if(old===col) return; const st=[0], seen=new Set(); while(st.length){ const i=st.pop(); if(seen.has(i)||b[i]!==old) continue; seen.add(i); b[i]=col; const r=Math.floor(i/N),c=i%N; D4.forEach(([dr,dc])=>{const rr=r+dr,cc=c+dc; if(rr>=0&&cc>=0&&rr<N&&cc<N) st.push(rr*N+cc);}); }
    moves++; draw(); };
  const draw = () => { cells.forEach((x,i)=>x.style.background=C[b[i]]); g.info(`步數 ${moves} / 22`);
    if(b.every(v=>v===b[0])){ g.best(moves,true); g.over('成功！', `${moves} 步完成`); } else if(moves>=22) g.over('步數用完了', ''); };
  g.best(null); draw();
});

// 消消樂 SameGame
P('same','方塊消消樂','🟥','點擊 2 個以上相連的同色方塊消除，一次消越多分數越高', g => {
  const W=10, H=10, C=['#ef4444','#f59e0b','#22c55e','#3b82f6']; let b = range(W*H).map(()=>R(4)), score=0; g.score(0); g.best();
  const cells = g.grid(H,W,34,(r,c)=>{ const grp = group(r*W+c); if(grp.length<2) return; grp.forEach(i=>b[i]=-1); score += (grp.length-1)**2; g.score(score); fall(); draw(); });
  const group = s => { if(b[s]<0) return []; const st=[s], seen=new Set(); while(st.length){ const i=st.pop(); if(seen.has(i)||b[i]!==b[s]) continue; seen.add(i); const r=Math.floor(i/W),c=i%W; D4.forEach(([dr,dc])=>{const rr=r+dr,cc=c+dc; if(rr>=0&&cc>=0&&rr<H&&cc<W) st.push(rr*W+cc);}); } return [...seen]; };
  const fall = () => { const cols = range(W).map(c=>range(H).map(r=>b[r*W+c]).filter(v=>v>=0)).filter(col=>col.length);
    b = Array(W*H).fill(-1); cols.forEach((col,c)=>col.forEach((v,k)=>{ b[(H-col.length+k)*W+c]=v; })); };
  const draw = () => { cells.forEach((x,i)=>{ x.style.background = b[i]<0?'transparent':C[b[i]]; x.style.cursor = b[i]<0?'default':'pointer'; });
    if(!b.some((v,i)=>v>=0 && ((i%W<W-1&&b[i+1]===v)||(i+W<W*H&&b[i+W]===v)))){ const left=b.filter(v=>v>=0).length; if(!left) score+=1000; g.score(score); g.best(score); g.over(left?'沒有可消的了':'全部清空！+1000', `得分 ${score}，剩 ${left} 塊`); } };
  draw();
});

// 三消
P('match3','寶石三消','💎','點兩個相鄰寶石交換，連成 3 個以上即可消除。共 30 步', g => {
  const N=8, E=['💎','🍀','🔥','⭐','🍇','🌙']; let b, sel=null, score=0, moves=30, busy=false; g.score(0); g.best();
  const find = () => { const m = new Set(); for(let r=0;r<N;r++) for(let c=0;c<N;c++){ const v=b[r*N+c];
      if(c<N-2 && v===b[r*N+c+1] && v===b[r*N+c+2]) [0,1,2].forEach(k=>m.add(r*N+c+k));
      if(r<N-2 && v===b[(r+1)*N+c] && v===b[(r+2)*N+c]) [0,1,2].forEach(k=>m.add((r+k)*N+c)); } return m; };
  do{ b = range(N*N).map(()=>R(6)); }while(find().size);
  const cells = g.grid(N,N,44,async (r,c)=>{ if(busy) return; const i=r*N+c; if(sel===null){ sel=i; draw(); return; }
    const j=sel; sel=null; if(Math.abs(Math.floor(i/N)-Math.floor(j/N))+Math.abs(i%N-j%N)!==1){ draw(); return; }
    [b[i],b[j]]=[b[j],b[i]]; if(!find().size){ [b[i],b[j]]=[b[j],b[i]]; draw(); return; }
    busy=true; moves--; let combo=1, m;
    while((m=find()).size){ m.forEach(k=>b[k]=-1); score += m.size*10*combo; combo++; g.score(score); draw(); await sleep(250); if(!g.alive()) return;
      for(let c2=0;c2<N;c2++){ const col = range(N).map(r2=>b[r2*N+c2]).filter(v=>v>=0); while(col.length<N) col.unshift(R(6)); col.forEach((v,r2)=>b[r2*N+c2]=v); } draw(); await sleep(200); if(!g.alive()) return; }
    busy=false; draw(); if(moves<=0){ g.best(score); g.over('步數用完', '得分 '+score); } });
  const draw = () => { cells.forEach((x,i)=>{ x.textContent = b[i]<0?'':E[b[i]]; x.style.background = i===sel?'var(--pri)':''; }); g.info('剩餘 '+moves+' 步'); };
  draw();
});

// 迷宮
P('maze','迷宮探險','🌀','用方向鍵走出迷宮，從左上走到右下的旗子', g => {
  let lv = 1;
  const x = g.canvas(420, 420); g.pad();
  let N, wall, me, t0;
  const gen = () => { N = 8 + lv*2; wall = range(N*N).map(()=>[1,1,1,1]); const seen = new Set([0]), st=[0];
    while(st.length){ const i=st.at(-1), r=Math.floor(i/N), c=i%N; const nb = D4.map(([dr,dc],d)=>[r+dr,c+dc,d]).filter(([rr,cc])=>rr>=0&&cc>=0&&rr<N&&cc<N&&!seen.has(rr*N+cc));
      if(!nb.length){ st.pop(); continue; } const [rr,cc,d] = pick(nb), j=rr*N+cc; wall[i][d]=0; wall[j][(d+2)%4]=0; seen.add(j); st.push(j); }
    me = 0; t0 = Date.now(); g.info('第 '+lv+' 關'); draw(); };
  const draw = () => { const s = 400/N; x.fillStyle='#0b1020'; x.fillRect(0,0,420,420); x.strokeStyle='#94a3b8'; x.lineWidth=2;
    for(let i=0;i<N*N;i++){ const px=10+(i%N)*s, py=10+Math.floor(i/N)*s, w=wall[i]; x.beginPath();
      if(w[0]){x.moveTo(px+s,py);x.lineTo(px+s,py+s);} if(w[1]){x.moveTo(px,py+s);x.lineTo(px+s,py+s);} if(w[2]){x.moveTo(px,py);x.lineTo(px,py+s);} if(w[3]){x.moveTo(px,py);x.lineTo(px+s,py);} x.stroke(); }
    x.font = s*.7+'px sans-serif'; x.textAlign='center'; x.textBaseline='middle';
    x.fillText('🏁', 10+(N-.5)*s, 10+(N-.5)*s); x.fillStyle='#facc15'; x.beginPath(); x.arc(10+(me%N+.5)*s, 10+(Math.floor(me/N)+.5)*s, s*.32, 0, 7); x.fill(); };
  g.onKey(k => { const d = ['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].indexOf(k); if(d<0||g.ended) return; if(wall[me][d]) return;
    me += [1,N,-1,-N][d]; draw(); if(me===N*N-1){ lv++; if(lv>5) g.over('全部通關！', `用時 ${Math.round((Date.now()-t0)/1000)} 秒`); else gen(); } });
  gen();
});

// 數織
[5,8].forEach(n => P('nono'+n, `數織 ${n}×${n}`, '🖼️', '依照行列提示的數字塗黑格子（數字代表連續黑格長度）', g => {
  const sol = range(n*n).map(()=>Math.random()<.55); const v = Array(n*n).fill(0);
  const clue = a => { const o=[]; let k=0; a.forEach(x=>{ if(x) k++; else if(k){o.push(k);k=0;} }); if(k) o.push(k); return o.length?o:[0]; };
  const rowC = i => range(n).map(c=>i(c)), rc = s => range(n).map(r=>clue(range(n).map(c=>s(r*n+c)))), cc = s => range(n).map(c=>clue(range(n).map(r=>s(r*n+c))));
  const R1 = rc(i=>sol[i]), C1 = cc(i=>sol[i]); let xMode = false;
  const tb = g.div('row'); const mb = g.button('模式：塗黑', () => { xMode=!xMode; mb.textContent = '模式：' + (xMode?'打叉':'塗黑'); }, 'btn alt', tb);
  const s = Math.min(36, Math.floor((Math.min(innerWidth,720)-120)/n));
  const tbl = g.div(''); tbl.style.cssText = `display:grid;grid-template-columns:auto repeat(${n},${s}px);gap:3px;align-items:end`;
  tbl.appendChild(document.createElement('div'));
  C1.forEach(c => { const d = document.createElement('div'); d.style.cssText='text-align:center;font-size:12px;line-height:1.1;color:var(--mute)'; d.innerHTML = c.join('<br>'); tbl.appendChild(d); });
  const cells = [];
  for(let r=0;r<n;r++){ const d = document.createElement('div'); d.style.cssText='font-size:12px;padding-right:6px;text-align:right;color:var(--mute);align-self:center'; d.textContent = R1[r].join(' '); tbl.appendChild(d);
    for(let c=0;c<n;c++){ const b = document.createElement('button'); b.className='cell'; b.style.height = s+'px'; const i = r*n+c;
      b.onclick = () => { v[i] = v[i] ? 0 : (xMode?2:1); draw(); }; b.oncontextmenu = e => { e.preventDefault(); v[i] = v[i]===2?0:2; draw(); }; tbl.appendChild(b); cells.push(b); } }
  const draw = () => { cells.forEach((b,i)=>{ b.style.background = v[i]===1?'#1e293b':''; b.textContent = v[i]===2?'✕':''; });
    const f = i => v[i]===1; if(JSON.stringify(rc(f))===JSON.stringify(R1) && JSON.stringify(cc(f))===JSON.stringify(C1)) g.over('完成！🎨',''); };
  draw();
}));

// 孔明棋
P('peg','孔明棋','⚫','跳過相鄰棋子到空位並吃掉它，最後只剩一顆最厲害', g => {
  const N=7, ok = (r,c) => (r>=2&&r<=4)||(c>=2&&c<=4); const b = range(49).map(i=>ok(Math.floor(i/7),i%7)?1:-1); b[24]=0; let sel=null;
  const cells = g.grid(N,N,48,(r,c)=>{ const i=r*7+c; if(b[i]<0) return; if(b[i]===1){ sel=i; draw(); return; }
    if(sel!==null){ const sr=Math.floor(sel/7), sc=sel%7; if((Math.abs(sr-r)===2&&sc===c)||(Math.abs(sc-c)===2&&sr===r)){ const m=((sr+r)/2)*7+(sc+c)/2; if(b[m]===1){ b[m]=0; b[sel]=0; b[i]=1; sel=null; draw(); } } } });
  const moves = () => { for(let i=0;i<49;i++) if(b[i]===1){ const r=Math.floor(i/7), c=i%7; for(const [dr,dc] of D4){ const r2=r+2*dr, c2=c+2*dc; if(r2>=0&&c2>=0&&r2<7&&c2<7&&b[r2*7+c2]===0&&b[(r+dr)*7+c+dc]===1) return true; } } return false; };
  const draw = () => { cells.forEach((x,i)=>{ x.style.visibility = b[i]<0?'hidden':''; x.style.borderRadius='50%'; x.style.background = i===sel?'#f59e0b':b[i]===1?'#7c3aed':''; });
    const left = b.filter(v=>v===1).length; g.info('剩餘 '+left+' 顆'); if(!moves()){ g.best(left,true); g.over(left===1?'完美！只剩 1 顆':'無法再跳了', `剩下 ${left} 顆`); } };
  g.best(null); draw();
});

// 連連看
P('link','連連看','🔗','點選兩個相同圖案，若能用不超過兩個轉彎的線連起來就消除', g => {
  const H=6, W=8, E=[...'🍎🍊🍋🍉🍇🍓🍒🥝🍑🍍🥥🥑'];
  let b = Array((H+2)*(W+2)).fill(null); const S = W+2; let sel=null, left=H*W, t0=Date.now();
  const deal = list => { let k=0; for(let r=1;r<=H;r++) for(let c=1;c<=W;c++){ b[r*S+c] = list[k++]; } };
  deal(shuffle(range(H*W/2).flatMap(i=>[E[i%E.length],E[i%E.length]])));
  const path = (a, z) => { // BFS 最多 2 次轉彎
    const q = [[a,-1,0]], best = new Map(); const dirs=[1,S,-1,-S];
    while(q.length){ const [p,d,t] = q.shift(); for(let k=0;k<4;k++){ const nt = d<0||d===k ? t : t+1; if(nt>2) continue; let n = p+dirs[k];
        while(n>=0 && n<b.length && Math.abs((n%S)-((n-dirs[k])%S))<=1){ if(n===z) return true; if(b[n]) break; const key=n*4+k; if(!best.has(key)||best.get(key)>nt){ best.set(key,nt); q.push([n,k,nt]); } n+=dirs[k]; } } } return false; };
  const cells = g.grid(H,W,46,(r,c)=>{ const i=(r+1)*S+c+1; if(!b[i]) return; if(sel===null||sel===i){ sel = sel===i?null:i; draw(); return; }
    if(b[sel]===b[i] && path(sel,i)){ b[sel]=b[i]=null; left-=2; } sel=null; draw(); });
  const row = g.div('row'); g.button('重新洗牌', () => { const rest = shuffle(b.filter(Boolean)); let k=0; for(let i=0;i<b.length;i++) if(b[i]) b[i]=rest[k++]; draw(); }, 'btn alt', row);
  const draw = () => { cells.forEach((x,k)=>{ const i=(x.r+1)*S+x.c+1; x.textContent = b[i]||''; x.style.background = i===sel?'var(--pri)':b[i]?'':'transparent'; });
    if(!left){ const s=Math.round((Date.now()-t0)/1000); g.best(s,true); g.over('全部消除！', `用時 ${s} 秒`); } };
  g.best(null); draw();
});

// 八皇后
P('queens','八皇后','👑','在棋盤上放 8 個皇后，彼此不能在同行、同列或同斜線', g => {
  const q = new Set();
  const cells = g.grid(8,8,44,(r,c)=>{ const i=r*8+c; q.has(i)?q.delete(i):q.add(i); draw(); });
  const att = (a,b) => { const ar=Math.floor(a/8),ac=a%8,br=Math.floor(b/8),bc=b%8; return ar===br||ac===bc||Math.abs(ar-br)===Math.abs(ac-bc); };
  const draw = () => { let bad=0; cells.forEach((x,i)=>{ const dark=(x.r+x.c)%2; const conf = q.has(i) && [...q].some(j=>j!==i&&att(i,j)); if(conf) bad++;
      x.textContent = q.has(i)?'♛':''; x.style.background = conf?'#fca5a5':dark?'#b45309':'#fde68a'; x.style.color='#111'; });
    g.info(`已放 ${q.size} / 8`); if(q.size===8&&!bad) g.over('成功！👑','8 個皇后互不攻擊'); };
  draw();
});

// 騎士巡邏
[5,6].forEach(n => P('knight'+n, `騎士巡邏 ${n}×${n}`, '♞', '騎士走「日」字，每格只能經過一次，試著走遍所有格子', g => {
  const v = Array(n*n).fill(0); let cur=-1, k=0;
  const can = (a,b) => { const dr=Math.abs(Math.floor(a/n)-Math.floor(b/n)), dc=Math.abs(a%n-b%n); return (dr===1&&dc===2)||(dr===2&&dc===1); };
  const cells = g.grid(n,n,56,(r,c)=>{ const i=r*n+c; if(v[i]) return; if(cur>=0 && !can(cur,i)) return; v[i]=++k; cur=i; draw(); });
  const draw = () => { cells.forEach((x,i)=>{ x.textContent = i===cur?'♞':v[i]||''; x.style.background = i===cur?'#f59e0b':v[i]?'#93c5fd':(cur>=0&&can(cur,i)?'#bbf7d0':(x.r+x.c)%2?'#94a3b8':''); });
    g.info(`已走 ${k} / ${n*n}`); g.best(k);
    if(k===n*n) g.over('完美巡邏！🎉',''); else if(cur>=0 && !range(n*n).some(i=>!v[i]&&can(cur,i))) g.over('無路可走', `走了 ${k} 格`); };
  g.best(); draw();
}));

// 水管接接樂
P('pipes','水管接接樂','🚰','點擊旋轉水管，讓所有水管連通（中心水源開始點亮）', g => {
  const N=7; const m = Array(N*N).fill(0); // 位元：1上 2右 4下 8左
  const seen=new Set([24]), st=[24];
  while(st.length){ const i=st.at(-1), r=Math.floor(i/N), c=i%N; const nb=[[-1,0,1,4],[0,1,2,8],[1,0,4,1],[0,-1,8,2]].filter(([dr,dc])=>{const rr=r+dr,cc=c+dc;return rr>=0&&cc>=0&&rr<N&&cc<N&&!seen.has(rr*N+cc);});
    if(!nb.length){ st.pop(); continue; } const [dr,dc,a,bb]=pick(nb), j=(r+dr)*N+c+dc; m[i]|=a; m[j]|=bb; seen.add(j); st.push(j); }
  const rot = v => ((v<<1)|(v>>3))&15; const cur = m.map(v=>{ let x=v; for(let k=R(4);k>0;k--) x=rot(x); return x; }); let moves=0;
  const x = g.canvas(N*56, N*56); const s=56;
  const lit = () => { const L=new Set([24]), q=[24]; while(q.length){ const i=q.pop(), r=Math.floor(i/N), c=i%N;
      [[-1,0,1,4],[0,1,2,8],[1,0,4,1],[0,-1,8,2]].forEach(([dr,dc,a,bb])=>{ const rr=r+dr,cc=c+dc,j=rr*N+cc; if(rr>=0&&cc>=0&&rr<N&&cc<N&&(cur[i]&a)&&(cur[j]&bb)&&!L.has(j)){L.add(j);q.push(j);} }); } return L; };
  const draw = () => { const L = lit(); x.fillStyle='#0b1020'; x.fillRect(0,0,N*s,N*s);
    for(let i=0;i<N*N;i++){ const cx=(i%N)*s+s/2, cy=Math.floor(i/N)*s+s/2; x.strokeStyle='#1e293b'; x.strokeRect(cx-s/2,cy-s/2,s,s);
      x.strokeStyle = L.has(i)?'#38bdf8':'#64748b'; x.lineWidth=10; x.lineCap='round';
      [[1,0,-1],[2,1,0],[4,0,1],[8,-1,0]].forEach(([b,dx,dy])=>{ if(cur[i]&b){ x.beginPath(); x.moveTo(cx,cy); x.lineTo(cx+dx*s/2,cy+dy*s/2); x.stroke(); } });
      if(i===24){ x.fillStyle='#38bdf8'; x.beginPath(); x.arc(cx,cy,12,0,7); x.fill(); } else if([1,2,4,8].includes(cur[i])){ x.fillStyle=L.has(i)?'#38bdf8':'#64748b'; x.beginPath(); x.arc(cx,cy,9,0,7); x.fill(); } }
    g.info('旋轉 '+moves+' 次'); if(L.size===N*N) g.over('全部連通！💧', `旋轉 ${moves} 次`); };
  g.on(x.canvas,'pointerdown',e=>{ if(g.ended) return; const p=g.pos(x.canvas,e), i=Math.floor(p.y/s)*N+Math.floor(p.x/s); cur[i]=rot(cur[i]); moves++; draw(); });
  draw();
});

// 華容道
P('klotski','華容道','🐉','移動木塊，讓曹操（大紅塊）從下方中間出口逃出', g => {
  const pcs = [{n:'曹操',r:0,c:1,h:2,w:2,col:'#dc2626'},{n:'張飛',r:0,c:0,h:2,w:1,col:'#2563eb'},{n:'趙雲',r:0,c:3,h:2,w:1,col:'#2563eb'},{n:'關羽',r:2,c:1,h:1,w:2,col:'#16a34a'},
    {n:'馬超',r:2,c:0,h:2,w:1,col:'#2563eb'},{n:'黃忠',r:2,c:3,h:2,w:1,col:'#2563eb'},{n:'兵',r:3,c:1,h:1,w:1,col:'#d97706'},{n:'兵',r:3,c:2,h:1,w:1,col:'#d97706'},{n:'兵',r:4,c:0,h:1,w:1,col:'#d97706'},{n:'兵',r:4,c:3,h:1,w:1,col:'#d97706'}];
  let sel = 0, moves = 0; const s = 70; const x = g.canvas(4*s+20, 5*s+20); g.pad();
  const occ = (r,c,skip) => pcs.some((p,k)=>k!==skip && r>=p.r && r<p.r+p.h && c>=p.c && c<p.c+p.w);
  const tryMove = (k,dr,dc) => { const p=pcs[k]; for(let r=p.r+dr;r<p.r+dr+p.h;r++) for(let c=p.c+dc;c<p.c+dc+p.w;c++){ if(r<0||c<0||r>4||c>3||occ(r,c,k)) return false; } p.r+=dr; p.c+=dc; moves++; return true; };
  const draw = () => { x.fillStyle='#0b1020'; x.fillRect(0,0,x.canvas.width,x.canvas.height); x.fillStyle='#22c55e'; x.fillRect(10+s,5*s+12,2*s,6);
    pcs.forEach((p,k)=>{ x.fillStyle=p.col; x.fillRect(10+p.c*s+3,10+p.r*s+3,p.w*s-6,p.h*s-6); if(k===sel){ x.strokeStyle='#facc15'; x.lineWidth=4; x.strokeRect(10+p.c*s+3,10+p.r*s+3,p.w*s-6,p.h*s-6); }
      x.fillStyle='#fff'; x.font='bold 18px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(p.n, 10+(p.c+p.w/2)*s, 10+(p.r+p.h/2)*s); });
    g.info('步數 '+moves); if(pcs[0].r===3&&pcs[0].c===1) g.over('曹操逃出！🎉', `共 ${moves} 步`); };
  g.on(x.canvas,'pointerdown',e=>{ const p=g.pos(x.canvas,e), r=Math.floor((p.y-10)/s), c=Math.floor((p.x-10)/s);
    const k = pcs.findIndex(q=>r>=q.r&&r<q.r+q.h&&c>=q.c&&c<q.c+q.w);
    if(k>=0) sel=k; else { const q=pcs[sel]; const dr = r<q.r?-1:r>=q.r+q.h?1:0, dc = c<q.c?-1:c>=q.c+q.w?1:0; if(!dr!==!dc) tryMove(sel,dr,dc); } draw(); });
  g.onKey(k=>{ const d={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[k]; if(d&&!g.ended){ tryMove(sel,...d); draw(); } });
  g.div('hint','點選木塊後，按方向鍵或點旁邊空格移動');
  draw();
});

// 倒水排序
P('ballsort','顏色排序','🧪','點一支試管再點另一支，把頂端的球倒過去，讓每支試管只剩同一種顏色', g => {
  const C=['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899'], K=4; const balls = shuffle(range(C.length*K).map(i=>i%C.length));
  const T = range(C.length).map(i=>balls.slice(i*K,i*K+K)); T.push([],[]); let sel=null, moves=0;
  const box = g.div('row'); box.style.alignItems='flex-end';
  const draw = () => { box.innerHTML=''; T.forEach((t,i)=>{ const d=document.createElement('div');
      d.style.cssText=`width:46px;height:${K*42+14}px;border:3px solid ${sel===i?'#facc15':'var(--mute)'};border-top:0;border-radius:0 0 22px 22px;display:flex;flex-direction:column-reverse;align-items:center;padding:4px 0;gap:3px;cursor:pointer;${sel===i?'transform:translateY(-10px)':''}`;
      t.forEach(v=>{ const b=document.createElement('div'); b.style.cssText=`width:36px;height:36px;border-radius:50%;background:${C[v]}`; d.appendChild(b); });
      d.onclick = () => click(i); box.appendChild(d); });
    g.info('步數 '+moves);
    if(T.every(t=>!t.length||(t.length===K&&t.every(v=>v===t[0])))){ g.best(moves,true); g.over('排序完成！', `${moves} 步`); } };
  const click = i => { if(sel===null){ if(T[i].length) sel=i; } else { const a=T[sel], b=T[i]; if(i!==sel && b.length<K && (!b.length || b.at(-1)===a.at(-1))){ b.push(a.pop()); moves++; } sel=null; } draw(); };
  g.best(null); draw();
});

// 解開糾結
P('untangle','解開線團','🕸️','拖動圓點，讓所有線段都不交叉', g => {
  const x = g.canvas(420,420); const L = range(5).map(()=>{ const a=Math.random()*Math.PI; return {a, d:(Math.random()-.5)*100}; });
  const V = [], key = {};
  for(let i=0;i<L.length;i++) for(let j=i+1;j<L.length;j++){ key[i+','+j] = V.length; V.push({}); }
  const E = []; // 每條線上依交點位置排序後相鄰連線
  for(let i=0;i<L.length;i++){ const li=L[i]; const pts = [];
    for(let j=0;j<L.length;j++) if(j!==i){ const lj=L[j]; const det = Math.cos(li.a)*Math.sin(lj.a)-Math.sin(li.a)*Math.cos(lj.a);
      // 直線 i: 點 p = n_i*d_i + t*(cos a, sin a)，以 t 排序
      const ni=[-Math.sin(li.a),Math.cos(li.a)], nj=[-Math.sin(lj.a),Math.cos(lj.a)], dir=[Math.cos(li.a),Math.sin(li.a)];
      const t = (lj.d - (ni[0]*nj[0]+ni[1]*nj[1])*li.d) / (dir[0]*nj[0]+dir[1]*nj[1]); pts.push([t, key[Math.min(i,j)+','+Math.max(i,j)]]); }
    pts.sort((a,b)=>a[0]-b[0]); for(let k=0;k<pts.length-1;k++) E.push([pts[k][1], pts[k+1][1]]); }
  V.forEach((v,i)=>{ const a = i/V.length*Math.PI*2 + 0.3; v.x = 210+170*Math.cos(a); v.y = 210+170*Math.sin(a); });
  const ccw=(a,b,c)=>(c.y-a.y)*(b.x-a.x)>(b.y-a.y)*(c.x-a.x);
  const cross=(e,f)=>{ if(e[0]===f[0]||e[0]===f[1]||e[1]===f[0]||e[1]===f[1]) return false; const [a,b,c,d]=[V[e[0]],V[e[1]],V[f[0]],V[f[1]]]; return ccw(a,c,d)!==ccw(b,c,d)&&ccw(a,b,c)!==ccw(a,b,d); };
  let drag=-1, moves=0;
  const draw = () => { x.fillStyle='#0b1020'; x.fillRect(0,0,420,420); const bad = new Set(); let n=0;
    E.forEach((e,i)=>E.forEach((f,j)=>{ if(i<j&&cross(e,f)){ bad.add(i); bad.add(j); n++; } }));
    E.forEach((e,i)=>{ x.strokeStyle=bad.has(i)?'#f87171':'#4ade80'; x.lineWidth=3; x.beginPath(); x.moveTo(V[e[0]].x,V[e[0]].y); x.lineTo(V[e[1]].x,V[e[1]].y); x.stroke(); });
    V.forEach((v,i)=>{ x.fillStyle=i===drag?'#facc15':'#60a5fa'; x.beginPath(); x.arc(v.x,v.y,11,0,7); x.fill(); });
    g.info('交叉數 '+n); return n; };
  g.on(x.canvas,'pointerdown',e=>{ const p=g.pos(x.canvas,e); drag = V.findIndex(v=>Math.hypot(v.x-p.x,v.y-p.y)<20); });
  g.on(x.canvas,'pointermove',e=>{ if(drag<0) return; const p=g.pos(x.canvas,e); V[drag].x=clamp(p.x,10,410); V[drag].y=clamp(p.y,10,410); draw(); });
  g.on(window,'pointerup',()=>{ if(drag<0) return; drag=-1; moves++; if(draw()===0) g.over('解開了！🎉', `移動 ${moves} 次`); });
  draw();
});

// 旋轉拼圖
P('rotate','旋轉拼圖','🔄','點擊格子，會把以它為左上角的 2×2 區塊順時針旋轉。排回 1～16', g => {
  const N=4; let b = range(16,1), moves=0;
  const rot = (r,c) => { r=Math.min(r,N-2); c=Math.min(c,N-2); const i=[r*N+c, r*N+c+1, (r+1)*N+c+1, (r+1)*N+c]; const t=b[i[3]]; b[i[3]]=b[i[2]]; b[i[2]]=b[i[1]]; b[i[1]]=b[i[0]]; b[i[0]]=t; };
  for(let k=0;k<30;k++) rot(R(3),R(3));
  const cells = g.grid(N,N,70,(r,c)=>{ rot(r,c); moves++; draw(); });
  const draw = () => { cells.forEach((x,i)=>{ x.textContent=b[i]; x.style.background = b[i]===i+1?'#86efac':''; x.style.color = b[i]===i+1?'#14532d':''; }); g.info('步數 '+moves);
    if(b.every((v,i)=>v===i+1)){ g.best(moves,true); g.over('完成！', `${moves} 步`); } };
  g.best(null); draw();
});

// 方塊拼放
P('blocks','方塊拼放','🟦','選擇下方的方塊放到 8×8 盤面上，填滿一整行或一整列就會消除', g => {
  const N=8; const SH = [[[0,0]],[[0,0],[0,1]],[[0,0],[1,0]],[[0,0],[0,1],[0,2]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[1,0],[1,1]],[[0,0],[1,0],[1,1]],[[0,1],[1,0],[1,1]],[[0,0],[0,1],[1,1]],[[0,0],[0,1],[0,2],[0,3]],[[0,0],[1,0],[2,0],[3,0]],[[0,0],[1,0],[2,0],[2,1],[2,2]],[[0,0],[0,1],[0,2],[1,1]],[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]]];
  const COL=['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899','#14b8a6'];
  const b = Array(N*N).fill(null); let hand=[], sel=0, score=0; g.score(0); g.best();
  const cells = g.grid(N,N,42,(r,c)=>place(r,c));
  const hb = g.div('row');
  const fits = (sh,r,c) => sh.s.every(([dr,dc])=>{ const rr=r+dr, cc=c+dc; return rr<N&&cc<N&&!b[rr*N+cc]; });
  const anyFit = sh => range(N*N).some(i=>fits(sh,Math.floor(i/N),i%N));
  const deal = () => { hand = range(3).map(()=>({s:pick(SH), col:pick(COL)})); sel=0; };
  const place = (r,c) => { const sh = hand[sel]; if(!sh||!fits(sh,r,c)) return; sh.s.forEach(([dr,dc])=>b[(r+dr)*N+c+dc]=sh.col); score += sh.s.length;
    const fr = range(N).filter(r2=>range(N).every(c2=>b[r2*N+c2])), fc = range(N).filter(c2=>range(N).every(r2=>b[r2*N+c2]));
    fr.forEach(r2=>range(N).forEach(c2=>b[r2*N+c2]=null)); fc.forEach(c2=>range(N).forEach(r2=>b[r2*N+c2]=null)); score += (fr.length+fc.length)*10*(fr.length+fc.length);
    hand[sel]=null; if(hand.every(h=>!h)) deal(); sel = hand.findIndex(Boolean); g.score(score); draw(); };
  const draw = () => { cells.forEach((x,i)=>x.style.background = b[i]||''); hb.innerHTML='';
    hand.forEach((h,k)=>{ const d=document.createElement('div'); d.style.cssText=`display:grid;grid-template-columns:repeat(3,14px);grid-auto-rows:14px;gap:2px;padding:8px;border-radius:8px;cursor:pointer;border:3px solid ${k===sel?'var(--pri)':'var(--line)'};min-width:62px;min-height:62px`;
      if(h) h.s.forEach(([r,c])=>{ const q=document.createElement('div'); q.style.cssText=`grid-row:${r+1};grid-column:${c+1};background:${h.col};border-radius:2px`; d.appendChild(q); });
      d.onclick=()=>{ if(h){ sel=k; draw(); } }; hb.appendChild(d); });
    if(!hand.some(h=>h&&anyFit(h))){ g.best(score); g.over('放不下了！', '得分 '+score); } };
  deal(); draw();
});
})();
