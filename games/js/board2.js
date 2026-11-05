// ===== 棋牌類（二）=====
(function(){
const B = (id,name,icon,desc,run) => add(id,name,'board',icon,desc,run);
const F = '⚀⚁⚂⚃⚄⚅';

// 百家樂
B('baccarat','百家樂','🎴','押「閒」「莊」或「和」，點數取個位數，接近 9 者勝（虛擬籌碼）', g => {
  let chips=100; const ph=g.div('row'), bh=g.div('row'), msg=g.div('msg','選擇下注'), row=g.div('row');
  const pt=c=>c.r>=10?0:c.r, tot=h=>h.reduce((s,c)=>s+pt(c),0)%10;
  const play=bet=>{ if(chips<10) return; chips-=10; const d=deck(); const P=[d.pop(),d.pop()], Bk=[d.pop(),d.pop()];
    if(tot(P)<8&&tot(Bk)<8){ let p3=null; if(tot(P)<=5){ p3=d.pop(); P.push(p3); }
      const b=tot(Bk), v=p3?pt(p3):null; const draw = p3==null ? b<=5 : b<=2 || (b===3&&v!==8) || (b===4&&v>=2&&v<=7) || (b===5&&v>=4&&v<=7) || (b===6&&(v===6||v===7)); if(draw) Bk.push(d.pop()); }
    const p=tot(P), b=tot(Bk), w = p>b?'閒':p<b?'莊':'和'; let win=0;
    if(w===bet) win = bet==='和'?90 : bet==='莊'?19.5 : 20; else if(w==='和') win=10;
    chips+=win; ph.innerHTML='閒 '+P.map(c=>cardHTML(c)).join('')+` <b>${p}</b>`; bh.innerHTML='莊 '+Bk.map(c=>cardHTML(c)).join('')+` <b>${b}</b>`;
    msg.textContent=`${w}贏！`+(win>10?` 你贏得 ${win}`:win===10?'（和局退還）':''); g.info('籌碼 '+chips); g.best(chips); if(chips<10) g.over('籌碼輸光了',''); };
  ['閒','莊','和'].forEach(b=>g.button(`押${b}（10）`,()=>play(b),'btn',row)); g.info('籌碼 '+chips); g.best();
});

// 骰寶
B('sicbo','骰寶大小','🎲','擲三顆骰子，猜大（11～17）、小（4～10）、單或雙。豹子（三顆相同）莊家通殺', g => {
  let chips=100; const big=g.div('big','🎲🎲🎲'); big.style.fontSize='3rem'; const msg=g.div('msg'), row=g.div('row');
  ['大','小','單','雙'].forEach(b=>g.button(`押${b}（10）`,async()=>{ if(chips<10) return; chips-=10; let d;
    for(let k=0;k<10;k++){ d=[R(6)+1,R(6)+1,R(6)+1]; big.textContent=d.map(v=>F[v-1]).join(''); await sleep(60); if(!g.alive()) return; }
    const s=d[0]+d[1]+d[2], tri=d[0]===d[1]&&d[1]===d[2]; const ok=!tri&&(b==='大'?s>=11:b==='小'?s<=10:b==='單'?s%2===1:s%2===0);
    if(ok) chips+=20; msg.textContent=`總和 ${s}${tri?'（豹子）':''}，${ok?'你贏了！':'你輸了'}`; g.info('籌碼 '+chips); g.best(chips); if(chips<10) g.over('籌碼輸光了',''); },'btn',row));
  g.info('籌碼 '+chips); g.best();
});

// 輪盤
B('roulette','輪盤','🎡','押顏色、單雙、大小或單一號碼（0～36），轉動輪盤看結果', g => {
  const RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]); let chips=100;
  const big=g.div('big','🎡'); big.style.fontSize='3rem'; const msg=g.div('msg'), row=g.div('row'), r2=g.div('row');
  const col=n=>n===0?'#16a34a':RED.has(n)?'#dc2626':'#111';
  const spin=async(test,pay,lab)=>{ if(chips<10) return; chips-=10; let n; for(let k=0;k<20;k++){ n=R(37); big.textContent=n; big.style.color=col(n); await sleep(40+k*8); if(!g.alive()) return; }
    const w=test(n); if(w) chips+=10*pay; msg.textContent=`開出 ${n}（${n===0?'綠':RED.has(n)?'紅':'黑'}），押${lab}${w?`，贏 ${10*pay}！`:'，沒中'}`; g.info('籌碼 '+chips); g.best(chips); if(chips<10) g.over('籌碼輸光了',''); };
  [['紅',n=>RED.has(n)],['黑',n=>n&&!RED.has(n)],['單',n=>n%2===1],['雙',n=>n&&n%2===0],['1～18',n=>n>=1&&n<=18],['19～36',n=>n>=19]].forEach(([l,t])=>g.button(`押${l}`,()=>spin(t,2,l),'btn',row));
  const inp=document.createElement('input'); inp.className='ans'; inp.style.width='80px'; inp.inputMode='numeric'; inp.placeholder='0-36'; r2.appendChild(inp);
  g.button('押號碼（贏 36 倍）',()=>{ const v=+inp.value; if(inp.value===''||v<0||v>36) return; spin(n=>n===v,36,'號碼 '+v); },'btn alt',r2);
  g.info('籌碼 '+chips+'（每注 10）'); g.best();
});

// 抽鬼牌
B('oldmaid','抽鬼牌','🃏','輪流從對方手中抽一張牌，湊成對就丟掉。最後手上留著落單 Q（鬼牌）的人輸', g => {
  const d=deck().filter(c=>!(c.r===12&&c.s==='♣')); let me=[], cp=[]; d.forEach((c,i)=>(i%2?cp:me).push(c));
  const pairs=h=>{ const by={}; h.forEach(c=>(by[c.r]=by[c.r]||[]).push(c)); return Object.values(by).flatMap(a=>a.length%2?[a[0]]:[]); };
  me=pairs(me); cp=pairs(cp);
  const cpb=g.div('row'), msg=g.div('msg','點電腦的一張牌來抽'), mb=g.div('row'); let lock=false;
  const end=()=>{ if(!me.length||!cp.length){ g.over(me.length?'你拿到鬼牌了，輸了':'你贏了！🎉',''); return true; } return false; };
  const draw=()=>{ cpb.innerHTML=''; cp.forEach((c,i)=>{ const w=document.createElement('span'); w.innerHTML=cardHTML(null,true); w.style.cursor='pointer'; w.onclick=()=>take(i); cpb.appendChild(w); });
    mb.innerHTML=me.map(c=>cardHTML(c)).join(''); g.info(`你 ${me.length} 張・電腦 ${cp.length} 張`); };
  const take=async i=>{ if(lock||g.ended) return; lock=true; const c=cp.splice(i,1)[0]; me.push(c); const b=me.length; me=pairs(me); msg.textContent=`你抽到 ${RANKS[c.r-1]}${c.s}`+(me.length<b?'，配成一對丟掉':''); me=shuffle(me).sort((a,z)=>a.r-z.r); draw(); if(end()) return;
    await sleep(900); if(!g.alive()) return; const j=R(me.length), c2=me.splice(j,1)[0]; cp.push(c2); const n=cp.length; cp=shuffle(pairs(cp)); msg.textContent=`電腦抽走你的 ${RANKS[c2.r-1]}${c2.s}`+(cp.length<n?'，配對丟掉':''); draw(); end(); lock=false; };
  draw();
});

// 十點半
B('tenhalf','十點半','🀄','A～10 照點數，J Q K 算半點。越接近 10.5 越好，超過就爆了', g => {
  let d, P, D, live=false, chips=100; const dh=g.div('row'), ph=g.div('row'), msg=g.div('msg'), row=g.div('row');
  const v=h=>h.reduce((s,c)=>s+(c.r>10?.5:c.r),0);
  const show=hide=>{ dh.innerHTML=D.map((c,i)=>cardHTML(c,hide&&i===0)).join('')+`<div style="width:100%;text-align:center">莊家 ${hide?'?':v(D)}</div>`; ph.innerHTML=P.map(c=>cardHTML(c)).join('')+`<div style="width:100%;text-align:center">你 ${v(P)}</div>`; g.info('籌碼 '+chips); };
  const fin=()=>{ live=false; while(v(D)<8) D.push(d.pop()); const p=v(P), q=v(D); const w = p>10.5?-1 : q>10.5||p>q?1 : p<q?-1 : 0; chips+=w*10; msg.textContent=w>0?'你贏了！':w<0?'你輸了':'平手'; show(false); g.best(chips); if(chips<=0) g.over('籌碼輸光了',''); };
  g.button('發牌',()=>{ if(live) return; d=deck(); P=[d.pop()]; D=[d.pop(),d.pop()]; live=true; msg.textContent=''; show(true); },'btn',row);
  g.button('要牌',()=>{ if(!live) return; P.push(d.pop()); show(true); if(v(P)>10.5) fin(); },'btn alt',row);
  g.button('停牌',()=>live&&fin(),'btn alt',row);
  d=deck(); P=[d.pop()]; D=[d.pop(),d.pop()]; live=true; show(true); g.best();
});

// 狐狸與鵝
B('foxgeese','狐狸與鵝','🦊','你操控 13 隻鵝（只能往下、左、右走），把狐狸困住就贏；狐狸會跳過鵝吃掉牠', g => {
  const N=7, ok=(r,c)=>(r>=2&&r<=4)||(c>=2&&c<=4); const b=range(49).map(i=>ok(Math.floor(i/7),i%7)?0:-1);
  range(49).forEach(i=>{ const r=Math.floor(i/7); if(b[i]===0&&r<=2) b[i]=1; }); let fox=3*7+3, sel=null;
  const inB=(r,c)=>r>=0&&c>=0&&r<7&&c<7&&b[r*7+c]>=0;
  const foxMoves=()=>{ const r=Math.floor(fox/7), c=fox%7, m=[]; [[0,1],[1,0],[0,-1],[-1,0]].forEach(([a,d])=>{ if(inB(r+a,c+d)&&b[(r+a)*7+c+d]===0&&(r+a)*7+c+d!==fox) m.push({t:(r+a)*7+c+d});
      else if(inB(r+a,c+d)&&b[(r+a)*7+c+d]===1&&inB(r+2*a,c+2*d)&&b[(r+2*a)*7+c+2*d]===0) m.push({t:(r+2*a)*7+c+2*d,x:(r+a)*7+c+d}); }); return m; };
  const cells=g.grid(7,7,48,(r,c)=>{ if(g.ended) return; const i=r*7+c; if(b[i]===1){ sel=i; draw(); return; } if(sel===null||b[i]!==0||i===fox) return;
    const sr=Math.floor(sel/7), sc=sel%7; if(!((r===sr+1&&c===sc)||(r===sr&&Math.abs(c-sc)===1))) return; b[i]=1; b[sel]=0; sel=null; draw(); g.after(400,foxTurn); });
  const foxTurn=()=>{ let m=foxMoves(); if(!m.length){ draw(); return g.over('困住狐狸了！🎉',''); }
    const caps=m.filter(x=>x.x!=null); let mv = caps.length ? pick(caps) : m.sort((a,z)=>{ const f=t=>{ const o=fox; fox=t; const n=foxMoves().length; fox=o; return n; }; return f(z.t)-f(a.t); })[0];
    fox=mv.t; if(mv.x!=null){ b[mv.x]=0; const more=()=>foxMoves().filter(x=>x.x!=null); let mm; while((mm=more()).length){ const z=pick(mm); fox=z.t; b[z.x]=0; } }
    draw(); if(b.filter(v=>v===1).length<5) g.over('鵝太少了，狐狸贏','');  else if(!foxMoves().length) g.over('困住狐狸了！🎉',''); };
  const draw=()=>{ cells.forEach((x,i)=>{ x.style.visibility=b[i]<0?'hidden':''; x.textContent=i===fox?'🦊':b[i]===1?'🪿':''; x.style.background=i===sel?'#fde68a':''; }); g.info(`鵝 ${b.filter(v=>v===1).length} 隻`); };
  draw();
});

// 超級井字棋
B('ultttt','超級井字棋（雙人）','#️⃣','9 個小井字棋組成大棋盤。你下在小格的位置，決定對手下一步要下在哪個小棋盤', g => {
  const b=Array(81).fill(null), big=Array(9).fill(null); let turn='X', force=-1;
  const sub=k=>range(9).map(j=>b[k*9+j]);
  const cells=g.grid(9,9,38,(r,c)=>{ if(g.ended) return; const k=Math.floor(r/3)*3+Math.floor(c/3), j=(r%3)*3+c%3, i=k*9+j;
    if(b[i]||big[k]||(force>=0&&force!==k)) return; b[i]=turn; const w=t3win(sub(k)); if(w) big[k]=w;
    force = big[j] ? -1 : j; const W=t3win(big.map(v=>v==='D'?null:v)); if(W&&W!=='D'){ draw(); return g.over((W==='X'?'✕':'◯')+' 獲勝！',''); }
    if(big.every(Boolean)){ draw(); return g.over('平手',''); } turn=turn==='X'?'O':'X'; draw(); });
  cells.forEach(x=>{ if(x.c%3===2&&x.c<8) x.style.marginRight='6px'; if(x.r%3===2&&x.r<8) x.style.marginBottom='6px'; });
  const draw=()=>{ cells.forEach(x=>{ const k=Math.floor(x.r/3)*3+Math.floor(x.c/3), i=k*9+(x.r%3)*3+x.c%3; x.textContent=b[i]==='X'?'✕':b[i]==='O'?'◯':''; x.style.color=b[i]==='X'?'#2563eb':'#dc2626';
      x.style.background = big[k]==='X'?'#bfdbfe':big[k]==='O'?'#fecaca':big[k]?'#d1d5db':(force<0||force===k)?'#fef9c3':''; }); g.info(`輪到 ${turn==='X'?'✕':'◯'}（黃色區域可下）`); };
  draw();
});

// 搶火柴
B('matches21','搶火柴','🔥','21 根火柴，輪流拿 1～3 根，拿到最後一根的人輸！你先拿', g => {
  let n=21; const big=g.div('big'); big.style.fontSize='1.6rem'; big.style.wordBreak='break-all'; const msg=g.div('msg','你的回合'), row=g.div('row');
  const show=()=>{ big.textContent='🔥'.repeat(n)||'（沒了）'; g.info(`剩 ${n} 根`); };
  [1,2,3].forEach(k=>g.button(`拿 ${k} 根`,()=>{ if(g.ended||k>n) return; n-=k; show(); if(!n) return g.over('你拿到最後一根，輸了','提示：讓剩下的根數是 4 的倍數 +1');
    g.after(600,()=>{ let c=(n-1)%4||RR(1,3); c=Math.min(c,n); n-=c; msg.textContent=`電腦拿了 ${c} 根`; show(); if(!n) g.over('電腦拿到最後一根，你贏了！🎉',''); }); },'opt',row));
  show();
});

// 吃子圍棋
B('atarigo','吃子圍棋（雙人）','⚪','7×7 圍棋入門：誰先吃掉對方任何一顆棋子就獲勝', g => {
  const N=7, b=Array(N*N).fill(0); let turn=1; const S=50, O=30, x=g.canvas(O*2+S*(N-1),O*2+S*(N-1));
  const nb=i=>{ const r=Math.floor(i/N), c=i%N, o=[]; if(r) o.push(i-N); if(r<N-1) o.push(i+N); if(c) o.push(i-1); if(c<N-1) o.push(i+1); return o; };
  const libs=(s,i)=>{ const p=s[i], st=[i], seen=new Set([i]), L=new Set(); while(st.length){ const k=st.pop(); nb(k).forEach(j=>{ if(!s[j]) L.add(j); else if(s[j]===p&&!seen.has(j)){ seen.add(j); st.push(j); } }); } return L.size; };
  const draw=()=>{ x.fillStyle='#d6a556'; x.fillRect(0,0,x.canvas.width,x.canvas.height); x.strokeStyle='#5b3a12'; for(let k=0;k<N;k++){ x.beginPath(); x.moveTo(O,O+k*S); x.lineTo(O+(N-1)*S,O+k*S); x.moveTo(O+k*S,O); x.lineTo(O+k*S,O+(N-1)*S); x.stroke(); }
    b.forEach((v,i)=>{ if(v){ x.fillStyle=v===1?'#111':'#f8fafc'; x.beginPath(); x.arc(O+(i%N)*S,O+Math.floor(i/N)*S,S*.42,0,7); x.fill(); x.strokeStyle='#333'; x.stroke(); } }); g.info(`輪到 ${turn===1?'⚫ 黑':'⚪ 白'}`); };
  g.on(x.canvas,'pointerdown',e=>{ if(g.ended) return; const p=g.pos(x.canvas,e), c=Math.round((p.x-O)/S), r=Math.round((p.y-O)/S); if(r<0||c<0||r>=N||c>=N) return; const i=r*N+c; if(b[i]) return;
    b[i]=turn; if(nb(i).some(j=>b[j]===3-turn&&!libs(b,j))){ draw(); return g.over((turn===1?'⚫ 黑':'⚪ 白')+'吃子獲勝！',''); }
    if(!libs(b,i)){ b[i]=0; g.info('不能下在沒有氣的地方'); return; } turn=3-turn; draw(); });
  draw();
});

// 關箱子
B('shutbox','關箱子','📦','擲兩顆骰子，翻下總和等於點數的數字牌。翻不下去就結束，剩下的數字和越小越好', g => {
  const up=new Set(range(9,1)); let roll=0, sel=new Set();
  const tiles=g.div('row'); const big=g.div('big','🎲'); const msg=g.div('msg'); const row=g.div('row');
  const can=(t,arr)=>{ if(!t) return true; if(!arr.length) return false; const [h,...r]=arr; return (h<=t&&can(t-h,r))||can(t,r); };
  const draw=()=>{ tiles.innerHTML=''; range(9,1).forEach(k=>{ const b=g.button(up.has(k)?k:'·',()=>{ if(!roll||!up.has(k)) return; sel.has(k)?sel.delete(k):sel.add(k); draw(); },'opt',tiles); b.style.minWidth='44px'; b.style.background=sel.has(k)?'#fde68a':up.has(k)?'':'transparent'; b.style.color='#0f172a'; });
    g.info(`剩餘數字和 ${[...up].reduce((a,b)=>a+b,0)}`); };
  g.button('擲骰',()=>{ if(roll) return; const one=[...up].reduce((a,b)=>a+b,0)<=6; const d=one?[R(6)+1]:[R(6)+1,R(6)+1]; roll=d.reduce((a,b)=>a+b); big.textContent=d.map(v=>F[v-1]).join(' ')+' = '+roll;
    if(!can(roll,[...up])){ const s=[...up].reduce((a,b)=>a+b,0); g.best(s,true); g.over('翻不下去了', `剩餘 ${s} 分`); } else msg.textContent='選出總和為 '+roll+' 的數字牌'; draw(); },'btn',row);
  g.button('確定翻牌',()=>{ if([...sel].reduce((a,b)=>a+b,0)!==roll) return msg.textContent='總和要剛好等於 '+roll; sel.forEach(k=>up.delete(k)); sel.clear(); roll=0; msg.textContent='';
    if(!up.size){ g.best(0,true); g.over('全部關上！完美 🎉','0 分'); } draw(); },'btn alt',row);
  g.best(null); draw();
});

// 六點連線 Sim
B('sim','六點連線','🔺','輪流連線（你紅、電腦藍）。誰先用自己的顏色連出三角形就輸！', g => {
  const P=range(6).map(i=>[200+150*Math.cos(i*Math.PI/3-Math.PI/2),190+150*Math.sin(i*Math.PI/3-Math.PI/2)]); const E=[]; for(let i=0;i<6;i++) for(let j=i+1;j<6;j++) E.push([i,j]);
  const col={}; const x=g.canvas(400,380);
  const tri=(c)=>{ for(let a=0;a<6;a++) for(let b=a+1;b<6;b++) for(let d=b+1;d<6;d++) if(col[a+','+b]===c&&col[a+','+d]===c&&col[b+','+d]===c) return true; return false; };
  const draw=()=>{ x.fillStyle='#0b1020'; x.fillRect(0,0,400,380); E.forEach(([a,b])=>{ const c=col[a+','+b]; x.strokeStyle=c===1?'#ef4444':c===2?'#3b82f6':'#334155'; x.lineWidth=c?5:2; x.setLineDash(c?[]:[4,6]); x.beginPath(); x.moveTo(...P[a]); x.lineTo(...P[b]); x.stroke(); }); x.setLineDash([]);
    P.forEach(p=>{ x.fillStyle='#e2e8f0'; x.beginPath(); x.arc(p[0],p[1],9,0,7); x.fill(); }); };
  const ai=()=>{ const free=E.filter(([a,b])=>!col[a+','+b]); const safe=free.filter(([a,b])=>{ col[a+','+b]=2; const t=tri(2); delete col[a+','+b]; return !t; });
    const pool=safe.length?safe:free; const score=([a,b])=>{ let s=0; for(let k=0;k<6;k++) if(k!==a&&k!==b){ const e1=[a,k].sort((p,q)=>p-q).join(), e2=[b,k].sort((p,q)=>p-q).join(); if(col[e1]===2) s++; if(col[e2]===2) s++; if(col[e1]===1||col[e2]===1) s-=.5; } return s+Math.random()*.3; };
    const m=pool.sort((p,q)=>score(p)-score(q))[0]; col[m.join()]=2; draw(); if(tri(2)) g.over('電腦連出藍色三角形，你贏了！🎉',''); };
  g.on(x.canvas,'pointerdown',e=>{ if(g.ended) return; const p=g.pos(x.canvas,e); let best=null, bd=18;
    E.forEach(([a,b])=>{ if(col[a+','+b]) return; const [x1,y1]=P[a],[x2,y2]=P[b]; const t=clamp(((p.x-x1)*(x2-x1)+(p.y-y1)*(y2-y1))/((x2-x1)**2+(y2-y1)**2),0,1); const d=Math.hypot(p.x-(x1+t*(x2-x1)),p.y-(y1+t*(y2-y1))); if(d<bd){ bd=d; best=[a,b]; } });
    if(!best) return; col[best.join()]=1; draw(); if(tri(1)) return g.over('你連出紅色三角形，輸了',''); g.after(500,ai); });
  g.div('hint','點兩點之間的虛線來連線'); draw();
});

// 立體井字棋
B('ttt3d','立體井字棋（雙人）','🧊','3 層 3×3 棋盤，在任何方向（含跨層、立體對角）連成 3 個就贏', g => {
  const b=Array(27).fill(null); let turn='X'; const L=[];
  for(let a=0;a<27;a++) for(const [dz,dy,dx] of [[0,0,1],[0,1,0],[1,0,0],[0,1,1],[0,1,-1],[1,0,1],[1,0,-1],[1,1,0],[1,-1,0],[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1]]){
    const z=Math.floor(a/9), y=Math.floor(a/3)%3, x0=a%3; const pts=[0,1,2].map(k=>[z+dz*k,y+dy*k,x0+dx*k]); if(pts.every(p=>p.every(v=>v>=0&&v<3))) L.push(pts.map(([p,q,r])=>p*9+q*3+r)); }
  const box=g.div('row'); box.style.gap='18px'; const all=[];
  for(let z=0;z<3;z++){ const w=document.createElement('div'); w.innerHTML=`<div class="hint">第 ${z+1} 層</div>`; box.appendChild(w);
    const cs=g.grid(3,3,58,(r,c)=>{ const i=z*9+r*3+c; if(g.ended||b[i]) return; b[i]=turn; draw(); const w2=L.find(l=>l.every(k=>b[k]===turn)); if(w2){ w2.forEach(k=>all[k].style.background='#86efac'); return g.over((turn==='X'?'✕':'◯')+' 獲勝！',''); }
      if(b.every(Boolean)) return g.over('平手',''); turn=turn==='X'?'O':'X'; g.info(`輪到 ${turn==='X'?'✕':'◯'}`); },w); all.push(...cs); }
  const draw=()=>all.forEach((x,i)=>{ x.textContent=b[i]==='X'?'✕':b[i]==='O'?'◯':''; x.style.color=b[i]==='X'?'#2563eb':'#dc2626'; });
  g.info('輪到 ✕'); draw();
});

// 撲克比大小（戰爭）
B('war','撲克比大小','⚔️','每回合雙方各翻一張，大的收走兩張（A 最大）。平手就「開戰」各蓋三張再比', g => {
  const d=deck(); let me=d.slice(0,26), cp=d.slice(26), rounds=0; const val=c=>c.r===1?14:c.r;
  const box=g.div('row'), msg=g.div('msg'), row=g.div('row');
  const one=()=>{ if(!me.length||!cp.length) return; rounds++; let pot=[], a, b;
    do{ a=me.shift(); b=cp.shift(); pot.push(a,b); if(val(a)===val(b)){ for(let k=0;k<3&&me.length>1&&cp.length>1;k++) pot.push(me.shift(),cp.shift()); } }while(val(a)===val(b)&&me.length&&cp.length);
    const win=val(a)>val(b); (win?me:cp).push(...shuffle(pot)); box.innerHTML=`你 ${cardHTML(a)} vs ${cardHTML(b)} 電腦`; msg.textContent=(win?'你':'電腦')+'收走 '+pot.length+' 張'+(pot.length>2?'（開戰！）':'');
    g.info(`你 ${me.length} 張・電腦 ${cp.length} 張・第 ${rounds} 回合`);
    if(!cp.length) g.over('你贏得所有牌！🎉',''); else if(!me.length) g.over('牌被收光了',''); else if(rounds>=300) g.over(me.length>cp.length?'時間到，你贏了':'時間到，電腦贏了',`${me.length} : ${cp.length}`); };
  g.button('翻牌',one,'btn',row); let auto=null; g.button('自動 20 回合',async()=>{ if(auto) return; auto=1; for(let k=0;k<20&&g.alive()&&!g.ended;k++){ one(); await sleep(150); } auto=null; },'btn alt',row);
  g.info('你 26 張・電腦 26 張');
});

// 保齡球取瓶
B('kayles','保齡球取瓶','🎳','一排 12 個球瓶，每次可擊倒 1 個或相鄰的 2 個，擊倒最後一個的人贏', g => {
  const n=12, up=Array(n).fill(true); let sel=[];
  const G=[0]; for(let k=1;k<=n;k++){ const s=new Set(); for(let t=1;t<=2;t++) for(let i=0;i+t<=k;i++) s.add(G[i]^G[k-i-t]); let m=0; while(s.has(m)) m++; G.push(m); }
  const segs=()=>{ const o=[]; let c=0; up.forEach(v=>{ if(v) c++; else { if(c) o.push(c); c=0; } }); if(c) o.push(c); return o; };
  const row=g.div('row'); const msg=g.div('msg','點 1 個或相鄰 2 個球瓶，再按「擊倒」'); const ctl=g.div('row');
  const draw=()=>{ row.innerHTML=''; up.forEach((v,i)=>{ const b=g.button(v?'🎳':'·',()=>{ if(!v) return; const k=sel.indexOf(i); if(k>=0) sel.splice(k,1); else sel.push(i); draw(); },'opt',row); b.style.minWidth='40px'; b.style.padding='6px'; b.style.background=sel.includes(i)?'#fde68a':''; }); };
  const end=w=>{ if(!up.some(Boolean)){ g.over(w?'你贏了！🎉':'電腦贏了',''); return true; } return false; };
  g.button('擊倒',()=>{ sel.sort((a,b)=>a-b); if(!sel.length||sel.length>2||(sel.length===2&&sel[1]-sel[0]!==1)) return msg.textContent='只能選 1 個或相鄰的 2 個'; sel.forEach(i=>up[i]=false); sel=[]; draw(); if(end(true)) return;
    g.after(600,()=>{ let mv=null; for(let i=0;i<n&&!mv;i++) for(let t=1;t<=2&&!mv;t++){ if(range(t).every(k=>up[i+k])){ range(t).forEach(k=>up[i+k]=false); if(!segs().reduce((a,s)=>a^G[s],0)) mv=[i,t]; range(t).forEach(k=>up[i+k]=true); } }
      if(!mv){ const i=up.indexOf(true); mv=[i,1]; } range(mv[1]).forEach(k=>up[mv[0]+k]=false); msg.textContent=`電腦擊倒第 ${mv[0]+1}${mv[1]>1?'、'+(mv[0]+2):''} 瓶`; draw(); end(false); }); },'btn',ctl);
  draw();
});

B('c5grav','重力五子棋（雙人）','🟣','9×8 直立棋盤，棋子會往下掉，先連成 5 個者勝', connectGame(9,8,5,true,null));
})();
