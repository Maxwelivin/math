// ===== 反應類 =====
(function(){
const F = (id,name,icon,desc,run) => add(id,name,'reflex',icon,desc,run);
const pad = (g, h=260) => { const d = g.div(''); d.style.cssText = `width:min(100%,520px);height:${h}px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:1.6rem;font-weight:700;color:#fff;cursor:pointer;text-align:center;touch-action:manipulation`; return d; };

F('react','反應時間','⏱️','畫面變綠時立刻點擊！測 5 次取平均', g => {
  const d = pad(g); let st='wait', t0, tm, res=[]; g.best(null);
  const ready = () => { st='wait'; d.style.background='#dc2626'; d.textContent='等變綠…'; tm=g.after(RR(1200,3500), ()=>{ st='go'; d.style.background='#16a34a'; d.textContent='點！'; t0=performance.now(); }); };
  g.on(d,'pointerdown',()=>{ if(g.ended) return; if(st==='wait'){ clearTimeout(tm); d.style.background='#f59e0b'; d.textContent='太早了！點擊重試'; st='early'; }
    else if(st==='early') ready();
    else if(st==='go'){ const ms=Math.round(performance.now()-t0); res.push(ms); g.info(res.map(v=>v+'ms').join('、')); st='show'; d.style.background='#2563eb'; d.textContent=ms+' 毫秒（點擊繼續）';
      if(res.length>=5){ const avg=Math.round(res.reduce((a,b)=>a+b)/5); g.best(avg,true); g.over('平均 '+avg+' 毫秒', avg<250?'反應超快！':'繼續加油'); } }
    else if(st==='show') ready(); });
  ready();
});

F('cps','點擊速度','👆','10 秒內盡可能快速點擊，測你的 CPS', g => {
  const d = pad(g); d.style.background='#7c3aed'; d.textContent='點擊開始'; let n=0, t0=0; g.best();
  g.on(d,'pointerdown',()=>{ if(g.ended) return; if(!t0){ t0=performance.now(); g.every(50,()=>{ const s=(performance.now()-t0)/1000; g.info('剩餘 '+Math.max(0,10-s).toFixed(1)+' 秒');
      if(s>=10){ g.stop(); const c=+(n/10).toFixed(1); g.best(c); g.over(c+' 次/秒', `共點擊 ${n} 次`); } }); } n++; d.textContent=n; });
});

F('aim','瞄準訓練','🎯','盡快點掉出現的 30 個靶子', g => {
  const W=480,H=360, x=g.canvas(W,H); let t, n=0, t0=0, miss=0; g.best(null);
  const nw = () => t={x:RR(30,W-30),y:RR(30,H-30),r:22};
  g.on(x.canvas,'pointerdown',e=>{ const p=g.pos(x.canvas,e); if(Math.hypot(p.x-t.x,p.y-t.y)<t.r){ if(!t0) t0=performance.now(); n++; if(n>=30){ const s=+((performance.now()-t0)/1000).toFixed(2); g.best(s,true); g.over(s+' 秒',`失誤 ${miss} 次`); return; } nw(); } else if(t0) miss++; draw(); });
  const draw = () => { x.fillStyle='#0b1020'; x.fillRect(0,0,W,H); [[1,'#ef4444'],[.66,'#fff'],[.33,'#ef4444']].forEach(([k,c])=>{ x.fillStyle=c; x.beginPath(); x.arc(t.x,t.y,t.r*k,0,7); x.fill(); }); g.info(`${n} / 30・失誤 ${miss}`); };
  nw(); draw();
});

const WORDS = 'the quick brown fox jumps over lazy dog apple banana orange school teacher student happy family friend water light music money paper green house river mountain flower summer winter spring autumn yellow purple window garden pencil rocket planet number letter animal people little world great small large young early city country bridge dinner breakfast science history computer keyboard monitor travel ticket station market'.split(' ');
F('typing','英打速度','⌨️','60 秒內盡量打出正確的英文單字（空白鍵送出）', g => {
  let left=60, ok=0, bad=0, started=false, list=range(200).map(()=>pick(WORDS)), i=0;
  const show = g.div(''); show.style.cssText='font-size:1.4rem;max-width:560px;line-height:1.8;text-align:center;font-family:monospace';
  const inp = document.createElement('input'); inp.className='ans'; inp.style.width='240px'; inp.autocapitalize='off'; inp.autocomplete='off'; g.el.appendChild(inp); inp.focus();
  const draw = () => { show.innerHTML = list.slice(i,i+8).map((w,k)=>k?w:`<b style="color:var(--pri);text-decoration:underline">${w}</b>`).join(' '); g.info(`剩 ${left} 秒・正確 ${ok}・錯誤 ${bad}`); };
  inp.onkeydown = e => { if(!started){ started=true; g.every(1000,()=>{ left--; draw(); if(left<=0){ g.stop(); inp.disabled=true; g.best(ok); g.over(ok+' WPM',`正確 ${ok}・錯誤 ${bad}`); } }); }
    if(e.key===' '||e.key==='Enter'){ e.preventDefault(); if(!inp.value.trim()) return; if(inp.value.trim()===list[i]) ok++; else bad++; i++; inp.value=''; draw(); } };
  g.best(); draw();
});

F('typerain','字母雨','🔤','字母從天而降，按下對應的鍵盤按鍵把它消除', g => {
  const W=420,H=460, x=g.canvas(W,H); let it=[], t=0, score=0, life=5, sp=60; g.score(0); g.best();
  g.onKey(k=>{ const i=it.findIndex(o=>o.c===k.toUpperCase()); if(i>=0){ it.splice(i,1); score+=10; sp+=1; g.score(score); } });
  const kb = g.div('row'); 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(c=>{ const b=g.button(c,()=>g.press(c.toLowerCase()),'opt',kb); b.style.minWidth='34px'; b.style.padding='6px'; b.style.fontSize='1rem'; });
  g.loop(dt=>{ t-=dt; if(t<=0){ t=Math.max(.4,1.3-score/500); it.push({c:String.fromCharCode(65+R(26)),x:RR(20,W-20),y:-10}); }
    it.forEach(o=>o.y+=sp*dt); const f=it.filter(o=>o.y>H).length; life-=f; it=it.filter(o=>o.y<=H);
    x.fillStyle='#0b1020'; x.fillRect(0,0,W,H); x.font='bold 28px monospace'; x.textAlign='center'; x.fillStyle='#4ade80'; it.forEach(o=>x.fillText(o.c,o.x,o.y));
    x.fillStyle='#f87171'; x.font='16px sans-serif'; x.textAlign='left'; x.fillText('❤'.repeat(Math.max(0,life)),8,H-10);
    if(life<=0){ g.best(score); g.over('遊戲結束','得分 '+score); return false; } });
});

[[5,'schulte','舒爾特方格'],[6,'schulte6','舒爾特方格 6×6']].forEach(([n,id,name]) => F(id,name,'🔢',`依序點擊 1 到 ${n*n}，訓練專注力與視野`, g => {
  const v=shuffle(range(n*n,1)); let k=1, t0=0; g.best(null);
  const cells=g.grid(n,n,64,(r,c,b)=>{ const i=r*n+c; if(v[i]!==k) { b.style.background='#fecaca'; setTimeout(()=>b.style.background='',150); return; } if(k===1) t0=performance.now(); b.style.background='#bbf7d0'; k++;
    if(k>n*n){ const s=+((performance.now()-t0)/1000).toFixed(2); g.best(s,true); g.over(s+' 秒','完成！'); } else g.info('下一個：'+k); });
  cells.forEach((b,i)=>b.textContent=v[i]); g.info('下一個：1');
}));

F('stroop','色字干擾','🎨','點選「文字的顏色」，而不是文字本身寫的顏色', g => {
  const C=[['紅','#dc2626'],['藍','#2563eb'],['綠','#16a34a'],['黃','#ca8a04'],['紫','#9333ea']];
  quiz(g, () => { const w=pick(C), c=pick(C); setTimeout(()=>{ const q=g.el.querySelector('.big'); if(q){ q.style.color=c[1]; q.style.fontSize='3.5rem'; } }); return {q:w[0], a:c[0], opts:C.map(x=>x[0])}; }, {time:45});
});

F('oddcolor','找不同色塊','🟩','找出顏色稍微不同的那一格，越後面越難', g => {
  let lv=1, left=60, score=0; const box=g.div(''); g.score(0); g.best();
  const next = () => { box.innerHTML=''; const n=Math.min(8,2+Math.floor(lv/3)), h=R(360), d=Math.max(4,30-lv), odd=R(n*n);
    const cells=g.grid(n,n,Math.floor(320/n),(r,c)=>{ if(r*n+c===odd){ score+=lv; lv++; g.score(score); next(); } else left=Math.max(0,left-3); },box);
    cells.forEach((b,i)=>b.style.background=`hsl(${h},60%,${i===odd?50+d/2:50}%)`); };
  g.every(1000,()=>{ left--; g.info('剩餘 '+left+' 秒・第 '+lv+' 關'); if(left<=0){ g.stop(); g.best(score); g.over('時間到！',`到達第 ${lv} 關，得分 ${score}`); } });
  next();
});

F('simon','記憶燈號','🟢','記住燈號亮起的順序並照著按，序列會越來越長', g => {
  const C=['#22c55e','#ef4444','#eab308','#3b82f6'], seq=[]; let i=0, lock=true; g.best();
  const cells=g.grid(2,2,130,async (r,c,b)=>{ if(lock) return; const k=r*2+c; flash(k);
    if(k!==seq[i]){ lock=true; g.best(seq.length-1); return g.over('按錯了！',`記住了 ${seq.length-1} 個`); } i++; if(i===seq.length){ lock=true; await sleep(600); if(g.alive()) round(); } });
  cells.forEach((b,i)=>{ b.style.background=C[i]; b.style.opacity=.35; });
  const flash = k => { cells[k].style.opacity=1; setTimeout(()=>cells[k].style.opacity=.35, 300); };
  const round = async () => { seq.push(R(4)); g.info('長度 '+seq.length); for(const k of seq){ await sleep(450); if(!g.alive()) return; flash(k); } await sleep(300); i=0; lock=false; };
  g.after(500, round);
});

F('digits','數字記憶','🧠','記住閃過的數字，然後輸入它，位數會越來越多', g => {
  let n=3, cur; const big=g.div('big'); big.style.fontSize='3rem'; big.style.letterSpacing='4px'; const row=g.div('row'); g.best();
  const inp=document.createElement('input'); inp.className='ans'; inp.inputMode='numeric'; row.appendChild(inp); inp.style.visibility='hidden';
  const round = () => { cur=range(n).map(()=>R(10)).join(''); big.textContent=cur; inp.value=''; inp.style.visibility='hidden'; g.info(n+' 位數');
    g.after(800+n*400, ()=>{ big.textContent='？'.repeat(n); inp.style.visibility='visible'; inp.focus(); }); };
  inp.onkeydown = e => { if(e.key!=='Enter') return; if(inp.value===cur){ n++; round(); } else { g.best(n-1); g.over('記錯了', `答案 ${cur}，你記住了 ${n-1} 位數`); } };
  round();
});

F('vismem','方塊記憶','🔳','記住亮起的格子位置，然後點出它們', g => {
  let lv=1, lives=3; const box=g.div(''); g.best();
  const round = () => { box.innerHTML=''; const n=Math.min(7,3+Math.floor(lv/3)), k=2+lv, tg=new Set(shuffle(range(n*n)).slice(0,k)); let found=0, bad=0, lock=true;
    const cells=g.grid(n,n,Math.floor(300/n),(r,c,b)=>{ if(lock) return; const i=r*n+c; if(b.dataset.done) return; b.dataset.done=1;
      if(tg.has(i)){ b.style.background='#3b82f6'; found++; if(found===k){ lock=true; lv++; g.after(500,round); } } else { b.style.background='#475569'; bad++; if(bad>=3){ lock=true; lives--; if(!lives){ g.best(lv); g.over('遊戲結束','到達第 '+lv+' 關'); } else g.after(600,round); } } },box);
    tg.forEach(i=>cells[i].style.background='#3b82f6'); g.info(`第 ${lv} 關・❤ ${lives}`);
    g.after(1200, ()=>{ cells.forEach(b=>b.style.background=''); lock=false; }); };
  round();
});

F('chimp','黑猩猩測試','🐵','記住數字位置，點第 1 個後其他數字會隱藏，依序點完', g => {
  let n=4, strikes=0; const box=g.div(''); g.best();
  const round = () => { box.innerHTML=''; const pos=shuffle(range(40)).slice(0,n); let k=1, hide=false;
    const cells=g.grid(5,8,48,(r,c,b)=>{ const i=r*8+c, v=pos.indexOf(i)+1; if(!v||b.dataset.done) return;
      if(v===k){ b.dataset.done=1; b.style.visibility='hidden'; if(k===1){ hide=true; cells.forEach(x=>{ if(!x.dataset.done&&x.textContent) x.textContent='■'; }); } k++; if(k>n){ n++; round(); } }
      else { strikes++; if(strikes>=3){ g.best(n-1); g.over('三次失誤','最高記住 '+(n-1)+' 個'); } else round(); } },box);
    cells.forEach((b,i)=>{ const v=pos.indexOf(i)+1; b.textContent=v||''; if(!v){ b.style.background='transparent'; b.style.cursor='default'; } }); g.info(`${n} 個數字・失誤 ${strikes}/3`); };
  round();
});

F('stopwatch','停在 10 秒','⏲️','按開始後默數 10 秒再按停止，誤差越小越好（計時器 3 秒後隱藏）', g => {
  const big=g.div('big','0.00'); big.style.fontSize='3.5rem'; let t0=0, run=false; g.best(null);
  const b=g.button('開始', ()=>{ if(!run){ run=true; t0=performance.now(); b.textContent='停止'; } else { run=false; const s=(performance.now()-t0)/1000, e=+Math.abs(s-10).toFixed(3); big.textContent=s.toFixed(3); g.best(e,true); g.over(s.toFixed(3)+' 秒', `誤差 ${e} 秒`); } });
  g.loop(()=>{ if(run){ const s=(performance.now()-t0)/1000; big.textContent = s<3 ? s.toFixed(2) : '?.??'; } });
});

F('arrows','方向快反應','⬅️','看到箭頭立刻按對應方向鍵（或按鈕），30 秒內越多越好', g => {
  const A=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'], S={ArrowUp:'⬆️',ArrowDown:'⬇️',ArrowLeft:'⬅️',ArrowRight:'➡️'}; let cur, score=0, left=30, rev;
  const big=g.div('big'); big.style.fontSize='5rem'; const hint=g.div('msg'); g.pad(); g.score(0); g.best();
  const next = () => { cur=pick(A); rev = score>10 && Math.random()<.3; big.textContent=S[cur]; big.style.filter = rev?'hue-rotate(180deg) saturate(3)':''; hint.textContent = rev?'🔴 紅框：按相反方向！':''; big.style.outline = rev?'4px solid #ef4444':''; };
  const opp = {ArrowUp:'ArrowDown',ArrowDown:'ArrowUp',ArrowLeft:'ArrowRight',ArrowRight:'ArrowLeft'};
  g.onKey(k=>{ if(!A.includes(k)||g.ended) return; if(k===(rev?opp[cur]:cur)){ score++; } else score=Math.max(0,score-1); g.score(score); next(); });
  g.every(1000,()=>{ left--; g.info('剩餘 '+left+' 秒'); if(left<=0){ g.stop(); g.best(score); g.over('時間到！','得分 '+score); } });
  next();
});

F('runaway','抓住按鈕','🏃','按鈕會逃跑！在 20 秒內點到它越多次越好', g => {
  const box=g.div(''); box.style.cssText='position:relative;width:min(100%,520px);height:340px;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden';
  const b=document.createElement('button'); b.className='btn'; b.textContent='抓我！'; b.style.position='absolute'; box.appendChild(b); let score=0, left=20; g.score(0); g.best();
  const mv = () => { b.style.left=R(box.clientWidth-80)+'px'; b.style.top=R(300)+'px'; };
  g.on(b,'pointerenter',()=>{ if(Math.random()<Math.min(.85,.35+score*.05)) mv(); });
  g.on(b,'pointerdown',()=>{ score++; g.score(score); mv(); });
  g.every(1000,()=>{ left--; g.info('剩餘 '+left+' 秒'); if(left<=0){ g.stop(); g.best(score); g.over('時間到！','抓到 '+score+' 次'); } }); mv();
});

F('nback','和上一個一樣嗎','🔁','判斷現在的圖案是否和「上一個」相同，考驗短期記憶', g => {
  const E=['🍎','🚗','⭐','🐶','🌙','⚽']; let prev=null, cur=pick(E), score=0, left=45;
  const big=g.div('big'); big.style.fontSize='5rem'; const row=g.div('row'); const msg=g.div('msg','記住這個圖案，按「下一個」開始'); g.score(0); g.best();
  const next = () => { prev=cur; cur = Math.random()<.4 ? prev : pick(E); big.textContent=cur; };
  const ans = same => { if(prev===null) return; const ok=(cur===prev)===same; score+=ok?1:-1; score=Math.max(0,score); g.score(score); msg.textContent=ok?'✅':'❌'; next(); };
  big.textContent=cur; const st=g.button('下一個', ()=>{ st.remove(); next(); g.every(1000,()=>{ left--; g.info('剩餘 '+left+' 秒'); if(left<=0){ g.stop(); g.best(score); g.over('時間到！','得分 '+score); } }); }, 'btn', row);
  g.button('✅ 相同', ()=>ans(true), 'opt', row); g.button('❌ 不同', ()=>ans(false), 'opt', row);
  g.onKey(k=>{ if(k==='ArrowLeft') ans(true); if(k==='ArrowRight') ans(false); });
});

F('countdots','快速數點','⚫','點點只會閃現一下，估計有幾個', g => {
  const x=g.canvas(360,240); x.canvas.style.background='#0b1020';
  quiz(g, () => { const n=RR(3,15); x.fillStyle='#0b1020'; x.fillRect(0,0,360,240); x.fillStyle='#facc15'; const pts=[];
    for(let k=0;k<n;k++){ let p; do{ p=[RR(20,340),RR(20,220)]; }while(pts.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<26)); pts.push(p); x.beginPath(); x.arc(p[0],p[1],9,0,7); x.fill(); }
    setTimeout(()=>{ x.fillStyle='#0b1020'; x.fillRect(0,0,360,240); }, 700); return {q:'有幾個點？', a:n, opts:opts4(n,()=>n+RR(-3,3))}; }, {count:15, small:true});
});

F('gonogo','綠燈按紅燈停','🚦','綠燈出現時快按，紅燈出現時不要按！', g => {
  const d=pad(g); let st='idle', score=0, n=0, tm, t0; d.style.background='#334155'; d.textContent='準備…'; g.score(0); g.best();
  const next = () => { if(n>=20){ g.best(score); return g.over('完成！','得分 '+score); } st='idle'; d.style.background='#334155'; d.textContent='…';
    tm=g.after(RR(500,1500), ()=>{ n++; const go=Math.random()<.65; st=go?'go':'nogo'; d.style.background=go?'#16a34a':'#dc2626'; d.textContent=go?'按！':'不要按！'; t0=performance.now();
      tm=g.after(go?700:900, ()=>{ if(st==='nogo'){ score+=1; g.score(score); } else if(st==='go'){ g.info('太慢了'); } next(); }); }); g.info(`第 ${n} / 20`); };
  g.on(d,'pointerdown',()=>{ if(st==='go'){ clearTimeout(tm); const ms=performance.now()-t0; score+=ms<400?2:1; g.score(score); g.info(Math.round(ms)+'ms'); next(); }
    else if(st==='nogo'){ clearTimeout(tm); score=Math.max(0,score-2); g.score(score); g.info('不能按紅燈！'); next(); } });
  next();
});
})();
