// ===== 益智類（二）=====
(function(){
const P = (id,name,icon,desc,run) => add(id,name,'puzzle',icon,desc,run);
const D4 = [[0,1],[1,0],[0,-1],[-1,0]];

// 通用數獨（n×n，宮格 br×bc）
const sudokuGen = (n, br, bc) => { const b = Array(n*n).fill(0);
  const ok = (i,v) => { const r=Math.floor(i/n), c=i%n, r0=r-r%br, c0=c-c%bc; for(let k=0;k<n;k++){ if(b[r*n+k]===v||b[k*n+c]===v) return false; } for(let a=0;a<br;a++) for(let d=0;d<bc;d++) if(b[(r0+a)*n+c0+d]===v) return false; return true; };
  const fill = i => { if(i===n*n) return true; for(const v of shuffle(range(n,1))) if(ok(i,v)){ b[i]=v; if(fill(i+1)) return true; b[i]=0; } return false; };
  fill(0); return b; };
const sudokuUI = (n, br, bc, hole) => g => {
  const sol = sudokuGen(n,br,bc), fixed = sol.slice(); shuffle(range(n*n)).slice(0,hole).forEach(i=>fixed[i]=0);
  const v = fixed.slice(); let sel = -1, t0 = Date.now(), err = 0;
  const cells = g.grid(n,n,n>6?40:56,(r,c)=>{ sel=r*n+c; draw(); });
  cells.forEach((b,i)=>{ const r=Math.floor(i/n), c=i%n; if(c%bc===bc-1&&c<n-1) b.style.marginRight='3px'; if(r%br===br-1&&r<n-1) b.style.marginBottom='3px'; b.style.borderRadius='3px'; });
  const nums = g.div('row'); range(n,1).forEach(k => g.button(k, () => put(k), 'opt', nums)); g.button('清除', () => put(0), 'btn alt', nums);
  const put = k => { if(sel<0||fixed[sel]) return; v[sel]=k; if(k&&k!==sol[sel]) err++; draw(); };
  g.onKey(k => { if(/^[1-9]$/.test(k) && +k<=n) put(+k); else if(k==='Backspace'||k==='0') put(0); else if(sel>=0){ const d={ArrowUp:-n,ArrowDown:n,ArrowLeft:-1,ArrowRight:1}[k]; if(d){ sel=clamp(sel+d,0,n*n-1); draw(); } } });
  const draw = () => { cells.forEach((b,i)=>{ b.textContent=v[i]||''; const same = sel>=0&&v[sel]&&v[i]===v[sel];
      b.style.background = i===sel?'var(--pri)':same?'#fde68a':''; b.style.color = i===sel?'#fff':fixed[i]?'':(v[i]&&v[i]!==sol[i])?'#dc2626':'#2563eb'; b.style.fontWeight=fixed[i]?'800':'500'; });
    g.info('錯誤 '+err); if(v.every((x,i)=>x===sol[i])){ const s=Math.round((Date.now()-t0)/1000); g.best(s,true); g.over('🎉 完成！', `用時 ${s} 秒`); } };
  g.best(null); draw();
};
P('sudoku4','迷你數獨 4×4','4️⃣','每行、每列、每個 2×2 宮格填入 1～4（適合入門）', sudokuUI(4,2,2,9));
P('sudoku6','數獨 6×6','6️⃣','每行、每列、每個 2×3 宮格填入 1～6', sudokuUI(6,2,3,20));
P('sudokux','數獨（專家）','🧠','只給極少提示的 9×9 數獨', sudokuUI(9,3,3,58));

// 不等式數獨
P('futoshiki','不等號數獨','⋚','5×5 每行每列填入 1～5 不重複，並符合格子間的 < > 符號', g => {
  const n=5; const sol = sudokuGen(n,1,n); const fixed = Array(n*n).fill(0); shuffle(range(n*n)).slice(0,4).forEach(i=>fixed[i]=sol[i]);
  const H = {}, V = {}; range(n*n).forEach(i=>{ if(i%n<n-1&&Math.random()<.35) H[i]=sol[i]<sol[i+1]?'<':'>'; if(i<n*(n-1)&&Math.random()<.3) V[i]=sol[i]<sol[i+n]?'∧':'∨'; });
  const v = fixed.slice(); let sel=-1;
  const box = g.div(''); box.style.cssText=`display:grid;grid-template-columns:repeat(${2*n-1},auto);gap:2px;align-items:center;justify-items:center`;
  const cells=[];
  for(let r=0;r<2*n-1;r++) for(let c=0;c<2*n-1;c++){ const d=document.createElement(r%2===0&&c%2===0?'button':'div');
    if(r%2===0&&c%2===0){ const i=(r/2)*n+c/2; d.className='cell'; d.style.cssText='width:52px;height:52px;font-size:24px'; d.onclick=()=>{ sel=i; draw(); }; cells.push(d); }
    else { d.style.cssText='font-weight:700;color:var(--mute);min-width:14px;text-align:center'; if(r%2===0) d.textContent = H[(r/2)*n+(c-1)/2]||''; else if(c%2===0) d.textContent = V[((r-1)/2)*n+c/2]||''; }
    box.appendChild(d); }
  const nums=g.div('row'); range(n,1).forEach(k=>g.button(k,()=>put(k),'opt',nums)); g.button('清除',()=>put(0),'btn alt',nums);
  const put = k => { if(sel<0||fixed[sel]) return; v[sel]=k; draw(); };
  g.onKey(k=>{ if(/^[1-5]$/.test(k)) put(+k); if(k==='Backspace') put(0); });
  const valid = () => { for(let r=0;r<n;r++){ if(new Set(range(n).map(c=>v[r*n+c])).size<n) return false; if(new Set(range(n).map(c=>v[c*n+r])).size<n) return false; }
    for(const i in H){ if(H[i]==='<' ? !(v[i]<v[+i+1]) : !(v[i]>v[+i+1])) return false; } for(const i in V){ if(V[i]==='∧' ? !(v[i]<v[+i+n]) : !(v[i]>v[+i+n])) return false; } return true; };
  const draw = () => { cells.forEach((b,i)=>{ b.textContent=v[i]||''; b.style.background=i===sel?'var(--pri)':''; b.style.color=i===sel?'#fff':fixed[i]?'':'#2563eb'; b.style.fontWeight=fixed[i]?'800':'500'; });
    if(v.every(Boolean)){ if(valid()) g.over('完成！🎉',''); else g.info('還有地方不符合規則'); } else g.info(''); };
  g.div('hint','∧ 表示上面的數比較小，∨ 表示上面的數比較大'); draw();
});

// 圖案拼圖
P('picslide','圖案拼圖','🖼️','把打亂的圖片拼回原樣（點空格旁的方塊移動）', g => {
  const n=3, S=300, c=document.createElement('canvas'); c.width=c.height=S; const x=c.getContext('2d');
  const gr=x.createLinearGradient(0,0,S,S); const h=R(360); gr.addColorStop(0,`hsl(${h},70%,75%)`); gr.addColorStop(1,`hsl(${h+60},70%,55%)`); x.fillStyle=gr; x.fillRect(0,0,S,S);
  x.font='220px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(pick(['🐼','🦊','🐸','🦁','🐙','🌻','🍉','🚀','🐳','🦄']),S/2,S/2+14);
  const url=c.toDataURL(); let b=range(n*n), e=n*n-1, moves=0;
  const mv = i => { const er=Math.floor(e/n), ec=e%n, r=Math.floor(i/n), cc=i%n; if(Math.abs(er-r)+Math.abs(ec-cc)!==1) return false; [b[e],b[i]]=[b[i],b[e]]; e=i; return true; };
  for(let k=0;k<200;k++){ const er=Math.floor(e/n), ec=e%n; const nb=D4.map(([a,d])=>[er+a,ec+d]).filter(([r,cc])=>r>=0&&cc>=0&&r<n&&cc<n); const [r,cc]=pick(nb); mv(r*n+cc); }
  const cells=g.grid(n,n,100,(r,cc)=>{ if(mv(r*n+cc)){ moves++; draw(); } }); cells.box.style.gap='2px';
  const s=cells.size;
  const draw = () => { cells.forEach((t,i)=>{ const k=b[i]; t.style.borderRadius='2px'; if(k===n*n-1&&i===e&&moves<1e9&&!b.every((v,j)=>v===j)){ t.style.background='transparent'; return; }
      t.style.background=`url(${url}) ${-(k%n)*s}px ${-Math.floor(k/n)*s}px / ${s*n}px ${s*n}px`; });
    g.info('步數 '+moves); if(b.every((v,j)=>v===j)){ g.best(moves,true); g.over('拼好了！🎉',`${moves} 步`); } };
  const ref=g.div('hint','原圖：'); const im=document.createElement('img'); im.src=url; im.style.cssText='width:80px;vertical-align:middle;border-radius:6px'; ref.appendChild(im);
  g.best(null); draw();
});

// 一筆畫
P('onestroke','一筆畫','✏️','從起點出發，一筆走過所有格子且不重複（點相鄰格前進，點走過的格子可退回）', g => {
  let lv=1;
  const box=g.div('');
  const round = () => { box.innerHTML=''; const n=Math.min(7,4+Math.floor(lv/2)); let walk;
    for(let t=0;t<200;t++){ const s=R(n*n), w=[s], seen=new Set([s]); for(;;){ const i=w.at(-1), r=Math.floor(i/n), c=i%n;
        const nb=D4.map(([a,d])=>[r+a,c+d]).filter(([a,d])=>a>=0&&d>=0&&a<n&&d<n&&!seen.has(a*n+d)).map(([a,d])=>a*n+d); if(!nb.length) break;
        nb.sort((p,q)=>D4.filter(([a,d])=>{const rr=Math.floor(p/n)+a,cc=p%n+d;return rr>=0&&cc>=0&&rr<n&&cc<n&&!seen.has(rr*n+cc);}).length-D4.filter(([a,d])=>{const rr=Math.floor(q/n)+a,cc=q%n+d;return rr>=0&&cc>=0&&rr<n&&cc<n&&!seen.has(rr*n+cc);}).length);
        const j=Math.random()<.75?nb[0]:pick(nb); w.push(j); seen.add(j); } if(w.length>=n*n*.8){ walk=w; break; } if(!walk||w.length>walk.length) walk=w; }
    const open=new Set(walk); let path=[walk[0]];
    const cells=g.grid(n,n,Math.floor(320/n),(r,c)=>{ const i=r*n+c; if(!open.has(i)) return; const k=path.indexOf(i);
      if(k>=0){ path=path.slice(0,k+1); } else { const l=path.at(-1); if(Math.abs(Math.floor(l/n)-r)+Math.abs(l%n-c)===1) path.push(i); } draw(); },box);
    const draw = () => { cells.forEach((b,i)=>{ const k=path.indexOf(i); b.style.background=!open.has(i)?'#1e293b':k===0?'#16a34a':k===path.length-1?'#f59e0b':k>0?'#60a5fa':''; b.textContent=k===0?'●':''; b.style.color='#fff'; b.style.cursor=open.has(i)?'pointer':'default'; });
      g.info(`第 ${lv} 關・${path.length} / ${open.size}`); if(path.length===open.size){ lv++; g.after(500, lv>8?()=>g.over('全部通關！✏️',''):round); } };
    draw(); };
  round();
});

// 對角翻轉
P('xlights','對角翻轉','✖️','點一格會切換它和四個斜角的燈，把燈全部關掉', g => {
  const n=5, b=Array(n*n).fill(false); let moves=0;
  const tog = i => { const r=Math.floor(i/n), c=i%n; [[0,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,d])=>{ const rr=r+a, cc=c+d; if(rr>=0&&cc>=0&&rr<n&&cc<n) b[rr*n+cc]=!b[rr*n+cc]; }); };
  do{ for(let k=0;k<n*n;k++) if(Math.random()<.4) tog(k); }while(!b.some(Boolean));
  const cells=g.grid(n,n,64,(r,c)=>{ tog(r*n+c); moves++; draw(); });
  const draw = () => { cells.forEach((x,i)=>{ x.style.background=b[i]?'#f472b6':'#334155'; x.style.boxShadow=b[i]?'0 0 12px #f472b6':''; }); g.info('步數 '+moves);
    if(!b.some(Boolean)){ g.best(moves,true); g.over('全部熄滅！',`${moves} 步`); } };
  g.best(null); draw();
});

// 算式翻牌
P('mathmem','算式翻牌','🧮','翻開兩張牌，算式和它的答案配成一對', g => {
  const pairs=[], used=new Set(); while(pairs.length<8){ const a=RR(2,9), b=RR(2,9), o=pick(['+','×','−']); const v=o==='+'?a+b:o==='×'?a*b:a+b; if(used.has(v)) continue; used.add(v);
    pairs.push([o==='−'?`${a+b+a}−${a}`:`${a}${o}${b}`, String(o==='−'?a+b:v)]); }
  const d=shuffle(pairs.flatMap((p,k)=>[{t:p[0],k},{t:p[1],k}])); const open=Array(16).fill(false); let a=null, lock=false, moves=0;
  const cells=g.grid(4,4,76,(r,c,b)=>{ const i=r*4+c; if(lock||open[i]||i===a) return; b.textContent=d[i].t; b.style.background='var(--pri2)'; b.style.fontSize='20px';
    if(a===null){ a=i; return; } moves++; g.info('步數 '+moves);
    if(d[a].k===d[i].k){ open[a]=open[i]=true; cells[a].style.background=cells[i].style.background='#bbf7d0'; a=null; if(open.every(Boolean)){ g.best(moves,true); g.over('全部配對！',`${moves} 步`); } }
    else { lock=true; const j=a; a=null; g.after(800,()=>{ cells[i].textContent=cells[j].textContent=''; cells[i].style.background=cells[j].style.background=''; lock=false; }); } });
  g.best(null);
});

// 冰面滑行
P('ice','冰面滑行','🧊','在冰上一移動就會滑到撞牆為止，用最少步數滑到旗子', g => {
  const n=9; let wall, st, goal, me, best, moves, lv=1;
  const slide = (p,[a,d]) => { let r=Math.floor(p/n), c=p%n; for(;;){ const rr=r+a, cc=c+d; if(rr<0||cc<0||rr>=n||cc>=n||wall.has(rr*n+cc)) break; r=rr; c=cc; if(r*n+c===goal) break; } return r*n+c; };
  const bfs = () => { const dist=new Map([[st,0]]), q=[st]; while(q.length){ const p=q.shift(); if(p===goal) return dist.get(p); for(const d of D4){ const t=slide(p,d); if(!dist.has(t)){ dist.set(t,dist.get(p)+1); q.push(t); } } } return -1; };
  const x=g.canvas(n*44,n*44); g.pad();
  const gen = () => { for(;;){ wall=new Set(shuffle(range(n*n)).slice(0,14+lv*2)); const free=range(n*n).filter(i=>!wall.has(i)); st=pick(free); goal=pick(free); if(st===goal) continue; best=bfs(); if(best>=3+Math.min(lv,4)) break; } me=st; moves=0; g.info(`第 ${lv} 關・最少 ${best} 步`); draw(); };
  const draw = () => { x.fillStyle='#e0f2fe'; x.fillRect(0,0,n*44,n*44); for(let i=0;i<n*n;i++){ const X=(i%n)*44, Y=Math.floor(i/n)*44; if(wall.has(i)){ x.fillStyle='#475569'; x.fillRect(X+1,Y+1,42,42); } }
    x.font='30px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('🚩',(goal%n)*44+22,Math.floor(goal/n)*44+24); x.fillText('🐧',(me%n)*44+22,Math.floor(me/n)*44+24); };
  g.onKey(k=>{ const d={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[k]; if(!d||g.ended) return; const t=slide(me,d); if(t===me) return; me=t; moves++; draw(); g.info(`第 ${lv} 關・最少 ${best} 步・已走 ${moves} 步`);
    if(me===goal){ lv++; if(lv>6) g.over('全部通關！🐧',''); else g.after(500,gen); } });
  const r=g.div('row'); g.button('重來本關',()=>{ me=st; moves=0; draw(); },'btn alt',r);
  gen();
});

// 數字連路
P('hidato','數字連路','🔢','從 1 開始，每次點一個相鄰的空格放下一個數字，連到 25（已給的數字不能改）', g => {
  const n=5; let path;
  for(let t=0;t<500&&!path;t++){ const s=R(n*n), w=[s], seen=new Set([s]); const deg=p=>D4.filter(([a,d])=>{const rr=Math.floor(p/n)+a,cc=p%n+d;return rr>=0&&cc>=0&&rr<n&&cc<n&&!seen.has(rr*n+cc);}).length;
    for(;;){ const i=w.at(-1), r=Math.floor(i/n), c=i%n; const nb=D4.map(([a,d])=>[r+a,c+d]).filter(([a,d])=>a>=0&&d>=0&&a<n&&d<n&&!seen.has(a*n+d)).map(([a,d])=>a*n+d); if(!nb.length) break;
      nb.sort((p,q)=>deg(p)-deg(q)+(Math.random()-.5)); w.push(nb[0]); seen.add(nb[0]); } if(w.length===n*n) path=w; }
  const given={}; [0,n*n-1,...shuffle(range(1,n*n-2)).slice(0,8)].forEach(k=>given[k+1]=path[k]);
  const pos={}; let cur=1; pos[1]=given[1]; const stack=[];
  const adj=(a,b)=>Math.abs(Math.floor(a/n)-Math.floor(b/n))+Math.abs(a%n-b%n)===1;
  const advance=()=>{ while(given[cur+1]!=null && adj(pos[cur],given[cur+1])){ cur++; pos[cur]=given[cur]; } };
  advance();
  const cells=g.grid(n,n,62,(r,c)=>{ const i=r*n+c; if(Object.values(pos).includes(i)||Object.values(given).includes(i)) return; if(given[cur+1]!=null||!adj(pos[cur],i)) return;
    stack.push(cur); cur++; pos[cur]=i; advance(); draw(); });
  const row=g.div('row'); g.button('↶ 復原',()=>{ if(!stack.length) return; const k=stack.pop(); while(cur>k){ delete pos[cur]; cur--; } draw(); },'btn alt',row);
  const draw=()=>{ const at={}; for(const k in pos) at[pos[k]]=+k; for(const k in given) at[given[k]]=+k;
    cells.forEach((b,i)=>{ const k=at[i]; b.textContent=k||''; const isG=Object.values(given).includes(i); b.style.background = pos[cur]===i?'#f59e0b':isG?'#cbd5e1':k?'#bfdbfe':''; b.style.color='#0f172a'; b.style.fontWeight=isG?'800':'500'; });
    g.info(given[cur+1]!=null&&!adj(pos[cur],given[cur+1]) ? `${cur+1} 不在 ${cur} 旁邊，請復原` : `下一個：${cur+1}`); if(cur===n*n) g.over('連通了！🎉',''); };
  draw();
});

// 黑暗迷宮
P('darkmaze','黑暗迷宮','🔦','只看得到周圍一小圈，摸黑找到出口', g => {
  const N=15; const wall=range(N*N).map(()=>[1,1,1,1]); const seen=new Set([0]), st=[0];
  while(st.length){ const i=st.at(-1), r=Math.floor(i/N), c=i%N; const nb=D4.map(([a,d],k)=>[r+a,c+d,k]).filter(([a,d])=>a>=0&&d>=0&&a<N&&d<N&&!seen.has(a*N+d)); if(!nb.length){ st.pop(); continue; } const [a,d,k]=pick(nb), j=a*N+d; wall[i][k]=0; wall[j][(k+2)%4]=0; seen.add(j); st.push(j); }
  // D4 順序：右、下、左、上
  let me=0, steps=0; const goal=N*N-1; const s=26, x=g.canvas(N*s+20,N*s+20); g.pad(); const vis=new Set();
  const draw=()=>{ x.fillStyle='#000'; x.fillRect(0,0,x.canvas.width,x.canvas.height); const mr=Math.floor(me/N), mc=me%N;
    for(let i=0;i<N*N;i++){ const r=Math.floor(i/N), c=i%N, d=Math.hypot(r-mr,c-mc); if(d<=2.5) vis.add(i); if(!vis.has(i)) continue; const X=10+c*s, Y=10+r*s;
      x.globalAlpha = d<=2.5 ? 1 : .25; x.fillStyle='#1e293b'; x.fillRect(X,Y,s,s); x.strokeStyle='#fbbf24'; x.lineWidth=2; x.beginPath(); const w=wall[i];
      if(w[0]){x.moveTo(X+s,Y);x.lineTo(X+s,Y+s);} if(w[1]){x.moveTo(X,Y+s);x.lineTo(X+s,Y+s);} if(w[2]){x.moveTo(X,Y);x.lineTo(X,Y+s);} if(w[3]){x.moveTo(X,Y);x.lineTo(X+s,Y);} x.stroke(); }
    x.globalAlpha=1; x.font='18px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; if(vis.has(goal)) x.fillText('🚪',10+(N-.5)*s,10+(N-.5)*s); x.fillText('🔦',10+(mc+.5)*s,10+(mr+.5)*s); g.info('步數 '+steps); };
  g.onKey(k=>{ const d=['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].indexOf(k); if(d<0||g.ended||wall[me][d]) return; me+=[1,N,-1,-N][d]; steps++; draw(); if(me===goal){ g.best(steps,true); g.over('逃出來了！',`${steps} 步`); } });
  g.best(null); draw();
});

// 塞車脫困
P('rushhour','塞車脫困','🚙','移動車子讓紅車從右側出口開出去。點車子後再點空格或按方向鍵移動', g => {
  const n=6; let cars, sel=0, moves=0, minM;
  const occ = (cs, skip) => { const o=Array(36).fill(-1); cs.forEach((c,k)=>{ if(k===skip) return; for(let t=0;t<c.l;t++) o[(c.r+(c.h?0:t))*n+c.c+(c.h?t:0)]=k; }); return o; };
  const key = cs => cs.map(c=>c.r*n+c.c).join(',');
  const nexts = cs => { const out=[], o=occ(cs); cs.forEach((c,k)=>{ for(const dir of [-1,1]){ for(let s=1;s<6;s++){ const nr=c.r+(c.h?0:dir*s), nc=c.c+(c.h?dir*s:0); const er=nr+(c.h?0:c.l-1), ec=nc+(c.h?c.l-1:0);
        if(nr<0||nc<0||er>=n||ec>=n) break; const cell = dir<0 ? nr*n+nc : er*n+ec; if(o[cell]!==-1) break; const z=cs.map(q=>({...q})); z[k].r=nr; z[k].c=nc; out.push(z); } } }); return out; };
  const solve = cs => { const seen=new Set([key(cs)]); let fr=[cs], d=0; while(fr.length&&seen.size<30000){ if(fr.some(z=>z[0].c===4)) return d; const nf=[]; for(const z of fr) for(const y of nexts(z)){ const k=key(y); if(!seen.has(k)){ seen.add(k); nf.push(y); } } fr=nf; d++; } return -1; };
  for(let t=0;t<300;t++){ const cs=[{r:2,c:RR(0,1),l:2,h:1,col:'#dc2626'}]; for(let k=0;k<40&&cs.length<10;k++){ const h=R(2), l=Math.random()<.7?2:3, r=R(h?n:n-l+1), c=R(h?n-l+1:n); if(h&&r===2) continue;
      const o=occ(cs); let ok=true; for(let s=0;s<l;s++) if(o[(r+(h?0:s))*n+c+(h?s:0)]!==-1) ok=false; if(ok) cs.push({r,c,l,h,col:`hsl(${R(300)+30},60%,${l===3?45:55}%)`}); }
    const m=solve(cs); if(m>=6){ cars=cs; minM=m; break; } if(m>=4&&!cars){ cars=cs; minM=m; } }
  const S=60, x=g.canvas(n*S+30,n*S+20);
  const draw=()=>{ x.fillStyle='#334155'; x.fillRect(0,0,x.canvas.width,x.canvas.height); x.fillStyle='#1e293b'; x.fillRect(10,10,n*S,n*S); x.fillStyle='#22c55e'; x.fillRect(10+n*S,10+2*S+8,14,S-16);
    cars.forEach((c,k)=>{ x.fillStyle=c.col; const X=10+c.c*S+4, Y=10+c.r*S+4, w=(c.h?c.l:1)*S-8, h=(c.h?1:c.l)*S-8; x.fillRect(X,Y,w,h); if(k===sel){ x.strokeStyle='#facc15'; x.lineWidth=4; x.strokeRect(X,Y,w,h); } });
    g.info(`步數 ${moves}（最少約 ${minM} 步）`); };
  const tryMove=(k,dir)=>{ const c=cars[k]; const nr=c.r+(c.h?0:dir), nc=c.c+(c.h?dir:0), er=nr+(c.h?0:c.l-1), ec=nc+(c.h?c.l-1:0); if(nr<0||nc<0||er>=n||ec>=n) return false;
    const o=occ(cars,k); for(let t=0;t<c.l;t++) if(o[(nr+(c.h?0:t))*n+nc+(c.h?t:0)]!==-1) return false; c.r=nr; c.c=nc; return true; };
  const after=()=>{ draw(); if(cars[0].c===4){ g.best(moves,true); g.over('紅車脫困！🎉',`${moves} 步`); } };
  g.on(x.canvas,'pointerdown',e=>{ if(g.ended) return; const p=g.pos(x.canvas,e), r=Math.floor((p.y-10)/S), c=Math.floor((p.x-10)/S); if(r<0||c<0||r>=n||c>=n) return; const o=occ(cars);
    if(o[r*n+c]>=0){ sel=o[r*n+c]; draw(); return; } const q=cars[sel]; let dir=0, dist=0;
    if(q.h&&r===q.r){ dir=c<q.c?-1:1; dist=c<q.c?q.c-c:c-(q.c+q.l-1); } else if(!q.h&&c===q.c){ dir=r<q.r?-1:1; dist=r<q.r?q.r-r:r-(q.r+q.l-1); }
    if(!dir) return; let moved=false; for(let s=0;s<dist;s++){ if(tryMove(sel,dir)) moved=true; else break; } if(moved){ moves++; after(); } });
  g.onKey(k=>{ const q=cars[sel]; const d={ArrowLeft:q.h?-1:0,ArrowRight:q.h?1:0,ArrowUp:q.h?0:-1,ArrowDown:q.h?0:1}[k]; if(d&&tryMove(sel,d)){ moves++; after(); } });
  g.best(null); draw();
});

// 翻煎餅
P('pancake','翻煎餅','🥞','點一塊煎餅，會把它和上面的煎餅整疊翻過來。把煎餅由小到大（上小下大）排好', g => {
  const n=7; let s; do{ s=shuffle(range(n,1)); }while(s.every((v,i)=>v===i+1)); let moves=0;
  const box=g.div(''); box.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px';
  const draw=()=>{ box.innerHTML=''; s.forEach((v,i)=>{ const b=document.createElement('button'); b.style.cssText=`width:${40+v*32}px;height:34px;border-radius:17px;border:0;background:hsl(${30+v*6},75%,${68-v*3}%);color:#3b2106;font-weight:700;cursor:pointer`; b.textContent=v;
      b.onclick=()=>{ if(g.ended) return; s=s.slice(0,i+1).reverse().concat(s.slice(i+1)); moves++; draw(); }; box.appendChild(b); });
    g.info('翻轉 '+moves+' 次'); if(s.every((v,i)=>v===i+1)){ g.best(moves,true); g.over('排好了！🥞',`${moves} 次翻轉`); } };
  g.best(null); draw();
});

// 密碼鎖
P('lock','密碼鎖','🔐','每個按鈕會讓特定幾個轉盤 +1（9 之後回到 0），把轉盤轉成目標密碼', g => {
  const B=[[0,1],[1,2],[2,3],[3,0],[0,2]], lab=['A','B','C','D','E']; const v=[0,0,0,0], tgt=[0,0,0,0]; let moves=0;
  for(let k=0;k<12;k++) pick(B).forEach(i=>tgt[i]=(tgt[i]+1)%10);
  const t=g.div('big'); const d=g.div('big'); d.style.fontSize='3rem'; d.style.letterSpacing='12px'; const row=g.div('row');
  B.forEach((b,k)=>g.button(`${lab[k]}（轉 ${b.map(i=>i+1).join('、')}）`,()=>{ b.forEach(i=>v[i]=(v[i]+1)%10); moves++; draw(); },'opt',row));
  const draw=()=>{ t.textContent='目標 '+tgt.join(' '); d.textContent=v.join(''); g.info('按了 '+moves+' 次'); if(v.join()===tgt.join()){ g.best(moves,true); g.over('開鎖成功！🔓',`${moves} 次`); } };
  g.best(null); draw();
});

// 找假幣
P('scale','天平找假幣','⚖️','9 枚硬幣中有 1 枚比較重，只能秤 2 次，找出它！點硬幣切換放左盤 / 右盤 / 不放', g => {
  const fake=R(9), side=Array(9).fill(0); let left=2;
  const coins=g.div('row'); const res=g.div('big','⚖️'); const ctl=g.div('row');
  const draw=()=>{ coins.innerHTML=''; side.forEach((s,i)=>{ const b=g.button(`${i+1}\n${s===1?'左':s===2?'右':'—'}`,()=>{ side[i]=(side[i]+1)%3; draw(); },'opt',coins); b.style.whiteSpace='pre'; b.style.minWidth='56px'; b.style.background=s===1?'#bfdbfe':s===2?'#fecaca':''; b.style.color='#0f172a'; });
    g.info(`剩 ${left} 次秤重`); };
  g.button('秤重',()=>{ if(!left) return; const L=side.map((s,i)=>s===1?(i===fake?2:1):0).reduce((a,b)=>a+b), Rr=side.map((s,i)=>s===2?(i===fake?2:1):0).reduce((a,b)=>a+b);
    const nl=side.filter(s=>s===1).length, nr=side.filter(s=>s===2).length; if(nl!==nr){ res.textContent='兩邊硬幣數要一樣'; return; }
    left--; res.textContent = L>Rr?'⬇️ 左邊比較重':L<Rr?'⬇️ 右邊比較重':'⚖️ 一樣重'; side.fill(0); draw(); },'btn',ctl);
  const gs=g.div('row'); g.div('hint','猜假幣：');
  range(9).forEach(i=>g.button('猜 '+(i+1),()=>g.over(i===fake?'猜對了！🎉':'猜錯了', `假幣是第 ${fake+1} 枚`+(i===fake&&left>=0?`，秤了 ${2-left} 次`:'')),'btn alt',gs));
  draw();
});

// 數字金字塔
P('tower','數字金字塔','🔺','每一格等於下面兩格的和。填出所有空格', g => {
  const base=range(4).map(()=>RR(1,12)); const rows=[base]; while(rows[0].length>1){ const r=rows[0]; rows.unshift(r.slice(1).map((v,i)=>v+r[i])); }
  const hideB=R(4); const inputs=[];
  const box=g.div(''); box.style.cssText='display:flex;flex-direction:column;align-items:center;gap:6px';
  rows.forEach((r,ri)=>{ const row=document.createElement('div'); row.className='row'; row.style.gap='6px';
    r.forEach((v,ci)=>{ const shown = ri===0 || (ri===3 && ci!==hideB); if(shown){ const d=document.createElement('div'); d.className='opt'; d.style.cssText='min-width:72px;text-align:center;font-weight:800'; d.textContent=v; row.appendChild(d); }
      else { const i=document.createElement('input'); i.className='ans'; i.style.width='72px'; i.inputMode='numeric'; i.dataset.v=v; row.appendChild(i); inputs.push(i); } }); box.appendChild(row); });
  const msg=g.div('msg');
  g.button('檢查',()=>{ let ok=0; inputs.forEach(i=>{ const good=+i.value===+i.dataset.v; i.style.borderColor=good?'var(--ok)':'var(--bad)'; if(good) ok++; }); msg.textContent=`答對 ${ok} / ${inputs.length}`; if(ok===inputs.length) g.over('全部正確！🎉',''); });
});

// 二元數獨
P('binary','二元數獨','0️⃣','6×6 填 0 或 1：每行每列 0 和 1 各一半，且不能有三個相同的連在一起', g => {
  const n=6, b=Array(n*n).fill(-1);
  const lineOk=(a)=>{ if(a.filter(v=>v===0).length>n/2||a.filter(v=>v===1).length>n/2) return false; for(let i=0;i+2<n;i++) if(a[i]>=0&&a[i]===a[i+1]&&a[i]===a[i+2]) return false; return true; };
  const okAt=i=>{ const r=Math.floor(i/n), c=i%n; return lineOk(range(n).map(k=>b[r*n+k])) && lineOk(range(n).map(k=>b[k*n+c])); };
  const fill=i=>{ if(i===n*n) return true; for(const v of shuffle([0,1])){ b[i]=v; if(okAt(i)&&fill(i+1)) return true; } b[i]=-1; return false; };
  fill(0); const fixed=b.map(v=>Math.random()<.4?v:-1); const v=fixed.slice();
  const cells=g.grid(n,n,56,(r,c)=>{ const i=r*n+c; if(fixed[i]>=0) return; v[i]=v[i]===-1?0:v[i]===0?1:-1; draw(); });
  const draw=()=>{ cells.forEach((x,i)=>{ x.textContent=v[i]<0?'':v[i]; x.style.background=v[i]===0?'#bfdbfe':v[i]===1?'#fde68a':''; x.style.color='#0f172a'; x.style.fontWeight=fixed[i]>=0?'800':'400'; x.style.opacity=fixed[i]>=0?.8:1; });
    if(v.every(x=>x>=0)){ const rowsOk=range(n).every(r=>{ const a=range(n).map(k=>v[r*n+k]); return lineOk(a)&&a.filter(x=>x===0).length===n/2; }), colsOk=range(n).every(c=>{ const a=range(n).map(k=>v[k*n+c]); return lineOk(a)&&a.filter(x=>x===0).length===n/2; });
      if(rowsOk&&colsOk) g.over('完成！🎉',''); else g.info('還有行或列不符合規則'); } else g.info('點格子切換：空 → 0 → 1'); };
  draw();
});
})();
