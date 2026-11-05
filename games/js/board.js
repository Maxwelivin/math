// ===== 棋牌類 =====
(function(){
const B = (id,name,icon,desc,run) => add(id,name,'board',icon,desc,run);
const lineWin = (b, W, H, r, c, k) => { const v = b[r*W+c]; if(!v) return false;
  for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){ let n=1; for(const s of [1,-1]){ let rr=r+dr*s, cc=c+dc*s; while(rr>=0&&cc>=0&&rr<H&&cc<W&&b[rr*W+cc]===v){ n++; rr+=dr*s; cc+=dc*s; } } if(n>=k) return true; } return false; };
const SUITS = ['♠','♥','♦','♣'], RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const deck = () => shuffle(range(52).map(i=>({r:i%13+1, s:SUITS[Math.floor(i/13)]})));
const cardHTML = (c, hidden) => hidden ? `<span class="card" style="display:inline-flex;width:52px;height:74px;border-radius:6px;background:repeating-linear-gradient(45deg,#1d4ed8,#1d4ed8 6px,#3b82f6 6px,#3b82f6 12px);margin:2px;border:2px solid #fff"></span>`
  : `<span class="card" style="display:inline-flex;flex-direction:column;justify-content:center;align-items:center;width:52px;height:74px;border-radius:6px;background:#fff;margin:2px;border:1px solid #94a3b8;font-weight:700;font-size:18px;color:${'♥♦'.includes(c.s)?'#dc2626':'#111'}">${RANKS[c.r-1]}<span>${c.s}</span></span>`;

// 井字棋
const T3 = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const t3win = b => { for(const l of T3) if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[1]]===b[l[2]]) return b[l[0]]; return b.every(Boolean) ? 'D' : null; };
const ttt = (mode) => g => { const b = Array(9).fill(null); let turn = 'X', done = false;
  const mm = (p, misere) => { const w = t3win(b); if(w==='D') return 0; if(w) return (w==='O') !== !!misere ? 10 : -10;
    let best = p==='O'?-99:99; for(let i=0;i<9;i++) if(!b[i]){ b[i]=p; const s = mm(p==='O'?'X':'O', misere); b[i]=null; best = p==='O'?Math.max(best,s - Math.sign(s)):Math.min(best,s - Math.sign(s)); } return best; };
  const ai = () => { const mis = mode==='mis'; const mv = range(9).filter(i=>!b[i]).map(i=>{ b[i]='O'; const s=mm('X',mis); b[i]=null; return [s+Math.random()*.5,i]; }).sort((a,c)=>c[0]-a[0]); return mv[0][1]; };
  const msg = g.div('msg', '你是 ✕，先下');
  const cells = g.grid(3,3,96,(r,c)=>{ const i=r*3+c; if(done||b[i]||(mode!=='2p'&&turn==='O')) return; play(i); if(!done&&mode!=='2p') g.after(300, ()=>play(ai())); });
  const play = i => { b[i]=turn; turn = turn==='X'?'O':'X'; draw(); };
  const draw = () => { cells.forEach((x,i)=>{ x.textContent = b[i]==='X'?'✕':b[i]==='O'?'◯':''; x.style.color = b[i]==='X'?'#2563eb':'#dc2626'; });
    const w = t3win(b); if(w){ done = true; const mis = mode==='mis';
      g.over(w==='D'?'平手':mode==='2p'?(w==='X'?'✕ 獲勝':'◯ 獲勝'):((w==='X')!==mis?'你贏了！🎉':'電腦贏了'), mis?'反井字棋：連成三個的人輸':''); }
    else msg.textContent = mode==='2p' ? `輪到 ${turn==='X'?'✕':'◯'}` : ''; };
};
B('ttt','井字棋（電腦）','⭕','和完美 AI 對下井字棋，你能逼和嗎？', ttt('ai'));
B('ttt2','井字棋（雙人）','⭕','兩人輪流下，先連成一線者勝', ttt('2p'));
B('tttmis','反井字棋','❌','規則相反：誰先連成三個誰就輸！', ttt('mis'));

// 連線棋通用（四子棋、五子棋、4×4 井字）
const connect = (W,H,K,gravity,ai) => g => {
  const b = Array(W*H).fill(0); let turn = 1, done = false, last=-1;
  const msg = g.div('msg');
  const drop = c => { if(!gravity) return c; for(let r=H-1;r>=0;r--) if(!b[r*W+c%W]) return r*W+c%W; return -1; };
  const cells = g.grid(H,W, gravity?52:Math.min(36,52),(r,c)=>{ if(done||(ai&&turn===2)) return; const i = gravity?drop(c):r*W+c; if(i<0||b[i]) return; put(i); if(!done&&ai) g.after(250, ()=>put(ai(b,W,H,K,drop))); });
  const put = i => { b[i]=turn; last=i; draw(); if(lineWin(b,W,H,Math.floor(i/W),i%W,K)){ done=true; g.over(ai?(turn===1?'你贏了！🎉':'電腦贏了'):(turn===1?'🔴 獲勝':'🟡 獲勝'),''); return; }
    if(b.every(Boolean)){ done=true; g.over('平手',''); return; } turn = 3-turn; msg.textContent = ai ? '' : `輪到 ${turn===1?'🔴':'🟡'}`; };
  const draw = () => cells.forEach((x,i)=>{ x.textContent = b[i]===1?(gravity?'🔴':'⚫'):b[i]===2?(gravity?'🟡':'⚪'):''; x.style.background = gravity?'#1d4ed8':'#d6a556'; x.style.borderRadius = gravity?'50%':'2px'; x.style.outline = i===last?'2px solid #ef4444':''; });
  msg.textContent = ai ? '你先下' : '輪到 ' + (gravity?'🔴':'⚫'); draw();
};
// 四子棋 AI：極小化極大
const c4ai = (b,W,H,K,drop) => {
  const score = () => { let s=0; const L=[[0,1],[1,0],[1,1],[1,-1]];
    for(let r=0;r<H;r++) for(let c=0;c<W;c++) for(const [dr,dc] of L){ let a=0,h=0,ok=true; for(let k=0;k<4;k++){ const rr=r+dr*k, cc=c+dc*k; if(rr<0||cc<0||rr>=H||cc>=W){ok=false;break;} const v=b[rr*W+cc]; if(v===2)a++; else if(v===1)h++; }
      if(ok&&!(a&&h)) s += a===4?1e5:h===4?-1e5:a===3?50:h===3?-60:a===2?5:h===2?-5:0; }
    for(let r=0;r<H;r++) s += (b[r*W+3]===2?3:b[r*W+3]===1?-3:0); return s; };
  const neg = (d, p, al, be) => { const moves = range(W).map(c=>drop(c)).filter(i=>i>=0);
    if(!d||!moves.length) return [score(), -1]; let best = p===2?-Infinity:Infinity, bm = moves[0];
    for(const i of shuffle(moves).sort((x,y)=>Math.abs(x%W-3)-Math.abs(y%W-3))){ b[i]=p; let v;
      if(lineWin(b,W,H,Math.floor(i/W),i%W,4)) v = p===2?1e6+d:-1e6-d; else v = neg(d-1,3-p,al,be)[0]; b[i]=0;
      if(p===2? v>best : v<best){ best=v; bm=i; } if(p===2) al=Math.max(al,v); else be=Math.min(be,v); if(al>=be) break; }
    return [best,bm]; };
  return neg(5,2,-Infinity,Infinity)[1]; };
// 五子棋 AI：評分
const gmai = (b,W,H) => { let best=-1, bs=-1; const DIR=[[0,1],[1,0],[1,1],[1,-1]];
  const val = (i,p) => { const r=Math.floor(i/W), c=i%W; let s=0; for(const [dr,dc] of DIR){ let n=1, open=0;
      for(const sg of [1,-1]){ let rr=r+dr*sg, cc=c+dc*sg; while(rr>=0&&cc>=0&&rr<H&&cc<W&&b[rr*W+cc]===p){ n++; rr+=dr*sg; cc+=dc*sg; } if(rr>=0&&cc>=0&&rr<H&&cc<W&&!b[rr*W+cc]) open++; }
      s += n>=5?1e6 : n===4?(open?5e4:open===0?0:5e3) : n===3?(open===2?3e3:open?300:0) : n===2?(open===2?100:10):open; } return s; };
  for(let i=0;i<W*H;i++) if(!b[i]){ const s = val(i,2)*1.1 + val(i,1) + Math.random(); if(s>bs){ bs=s; best=i; } }
  if(!b.some(Boolean)) return Math.floor(H/2)*W+Math.floor(W/2); return best; };
B('c4','四子棋（電腦）','🔴','點選欄位投下棋子，先連成 4 個者勝', connect(7,6,4,true,c4ai));
B('c42','四子棋（雙人）','🟡','兩人輪流投子，先連成 4 個者勝', connect(7,6,4,true,null));
B('gomoku','五子棋（電腦）','⚫','在 13×13 棋盤上，先連成 5 子者勝', connect(13,13,5,false,gmai));
B('gomoku2','五子棋（雙人）','⚪','兩人輪流下，先連成 5 子者勝', connect(13,13,5,false,null));
B('ttt4','四連井字（雙人）','#️⃣','6×6 棋盤，先連成 4 個者勝', connect(6,6,4,false,null));

// 黑白棋
const reversi = ai => g => {
  const N=8, b=Array(64).fill(0); b[27]=b[36]=2; b[28]=b[35]=1; let turn=1;
  const flips = (i,p) => { if(b[i]) return []; const r=Math.floor(i/8), c=i%8, out=[];
    for(const [dr,dc] of [[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]){ const t=[]; let rr=r+dr, cc=c+dc;
      while(rr>=0&&cc>=0&&rr<8&&cc<8&&b[rr*8+cc]===3-p){ t.push(rr*8+cc); rr+=dr; cc+=dc; } if(t.length&&rr>=0&&cc>=0&&rr<8&&cc<8&&b[rr*8+cc]===p) out.push(...t); } return out; };
  const legal = p => range(64).filter(i=>flips(i,p).length);
  const W8 = [100,-20,10,5,5,10,-20,100,-20,-50,-2,-2,-2,-2,-50,-20,10,-2,1,1,1,1,-2,10,5,-2,1,0,0,1,-2,5];
  const wt = i => { const r=Math.floor(i/8), c=i%8; const rr=r<4?r:7-r, cc=c<4?c:7-c; return W8[rr*8+cc] ?? W8[Math.min(rr,cc)*8+Math.max(rr,cc)]; };
  const msg = g.div('msg');
  const cells = g.grid(8,8,46,(r,c)=>{ if(ai&&turn===2) return; move(r*8+c); });
  const move = i => { const f = flips(i,turn); if(!f.length) return; b[i]=turn; f.forEach(k=>b[k]=turn); turn=3-turn;
    if(!legal(turn).length){ turn=3-turn; if(!legal(turn).length){ draw(); return end(); } msg.textContent = '對方無棋可下，繼續'; }
    draw(); if(ai&&turn===2) g.after(500, ()=>{ const ms = legal(2); let best=ms[0], bs=-1e9; ms.forEach(m=>{ const s=wt(m)*3+flips(m,2).length+Math.random(); if(s>bs){bs=s;best=m;} }); move(best); }); };
  const end = () => { const a=b.filter(v=>v===1).length, z=b.filter(v=>v===2).length; g.over(a>z?(ai?'你贏了！🎉':'⚫ 獲勝'):a<z?(ai?'電腦贏了':'⚪ 獲勝'):'平手', `⚫ ${a} : ${z} ⚪`); };
  const draw = () => { const L = new Set(legal(turn)); cells.forEach((x,i)=>{ x.style.background='#15803d'; x.textContent = b[i]===1?'⚫':b[i]===2?'⚪':(L.has(i)&&!(ai&&turn===2)?'·':''); x.style.color='#bbf7d0'; });
    g.info(`⚫ ${b.filter(v=>v===1).length} : ${b.filter(v=>v===2).length} ⚪`); if(!msg.textContent.includes('無棋')) msg.textContent = `輪到 ${turn===1?'⚫':'⚪'}`; else g.after(1000,()=>msg.textContent=''); };
  draw();
};
B('reversi','黑白棋（電腦）','⚫','夾住對方的棋子就能翻轉，結束時棋子多者勝。你執黑', reversi(true));
B('reversi2','黑白棋（雙人）','⚪','兩人輪流，夾住對方棋子即可翻面', reversi(false));

// 點格棋
B('dots','點格棋','🔲','輪流畫線，圍成方格的人得分並再畫一次。和電腦比誰的格子多', g => {
  const N=5, S=60, O=30; const H = Array(N*(N-1)).fill(0), V = Array((N-1)*N).fill(0), box = Array((N-1)*(N-1)).fill(0); let turn=1, sc=[0,0,0];
  const x = g.canvas(O*2+S*(N-1), O*2+S*(N-1));
  const sides = k => { const r=Math.floor(k/(N-1)), c=k%(N-1); return [H[r*(N-1)+c], H[(r+1)*(N-1)+c], V[r*N+c], V[r*N+c+1]].filter(Boolean).length; };
  const boxesOf = (t,i) => { const o=[]; if(t==='h'){ const r=Math.floor(i/(N-1)), c=i%(N-1); if(r>0) o.push((r-1)*(N-1)+c); if(r<N-1) o.push(r*(N-1)+c); } else { const r=Math.floor(i/N), c=i%N; if(c>0) o.push(r*(N-1)+c-1); if(c<N-1) o.push(r*(N-1)+c); } return o; };
  const play = (t,i) => { const A = t==='h'?H:V; if(A[i]) return false; A[i]=turn; let got=0; boxesOf(t,i).forEach(k=>{ if(sides(k)===4&&!box[k]){ box[k]=turn; sc[turn]++; got++; } });
    if(!got) turn=3-turn; draw(); if(sc[1]+sc[2]===(N-1)**2){ g.over(sc[1]>sc[2]?'你贏了！🎉':sc[1]<sc[2]?'電腦贏了':'平手', `你 ${sc[1]} : ${sc[2]} 電腦`); return true; }
    if(turn===2) g.after(400, ai); return true; };
  const ai = () => { const all = [...H.map((v,i)=>v?null:['h',i]), ...V.map((v,i)=>v?null:['v',i])].filter(Boolean);
    const gain = m => boxesOf(...m).filter(k=>sides(k)===3).length, risk = m => boxesOf(...m).filter(k=>sides(k)===2).length;
    let m = all.find(m=>gain(m)) || pick(all.filter(m=>!risk(m)).length ? all.filter(m=>!risk(m)) : all); play(...m); };
  const draw = () => { x.fillStyle='#0b1020'; x.fillRect(0,0,x.canvas.width,x.canvas.height);
    box.forEach((v,k)=>{ if(v){ x.fillStyle=v===1?'#1d4ed8':'#b91c1c'; x.fillRect(O+(k%(N-1))*S+4, O+Math.floor(k/(N-1))*S+4, S-8, S-8); } });
    x.lineWidth=6; x.lineCap='round';
    H.forEach((v,i)=>{ x.strokeStyle=v===1?'#60a5fa':v===2?'#f87171':'#1e293b'; const r=Math.floor(i/(N-1)), c=i%(N-1); x.beginPath(); x.moveTo(O+c*S,O+r*S); x.lineTo(O+(c+1)*S,O+r*S); x.stroke(); });
    V.forEach((v,i)=>{ x.strokeStyle=v===1?'#60a5fa':v===2?'#f87171':'#1e293b'; const r=Math.floor(i/N), c=i%N; x.beginPath(); x.moveTo(O+c*S,O+r*S); x.lineTo(O+c*S,O+(r+1)*S); x.stroke(); });
    x.fillStyle='#e2e8f0'; for(let r=0;r<N;r++) for(let c=0;c<N;c++){ x.beginPath(); x.arc(O+c*S,O+r*S,5,0,7); x.fill(); }
    g.info(`你（藍）${sc[1]} : ${sc[2]} 電腦（紅）`); };
  g.on(x.canvas,'pointerdown',e=>{ if(turn!==1||g.ended) return; const p=g.pos(x.canvas,e), fx=(p.x-O)/S, fy=(p.y-O)/S;
    const dx = Math.abs(fx-Math.round(fx)), dy = Math.abs(fy-Math.round(fy));
    if(dy<dx){ const r=Math.round(fy), c=Math.floor(fx); if(r>=0&&r<N&&c>=0&&c<N-1) play('h', r*(N-1)+c); }
    else { const r=Math.floor(fy), c=Math.round(fx); if(r>=0&&r<N-1&&c>=0&&c<N) play('v', r*N+c); } });
  draw();
});

// 取石子 Nim
B('nim','取石子','🪨','輪流從一堆中拿走任意顆石子，拿到最後一顆的人贏', g => {
  const p = [3,4,5].map(n=>n+R(3)); let sel=null;
  const box = g.div(''); const msg = g.div('msg','你的回合：點石子拿走該顆及其右邊所有');
  const draw = () => { box.innerHTML=''; p.forEach((n,k)=>{ const row=document.createElement('div'); row.className='row'; row.style.margin='8px 0';
      for(let i=0;i<n;i++){ const s=document.createElement('button'); s.className='opt'; s.textContent='🪨'; s.style.minWidth='44px'; s.style.padding='6px'; s.onclick=()=>take(k, n-i); row.appendChild(s); }
      if(!n) row.textContent='（空）'; box.appendChild(row); }); };
  const take = (k, m) => { if(g.ended) return; p[k]-=m; draw(); if(p.every(v=>!v)) return g.over('你贏了！🎉','');
    msg.textContent='電腦思考中…'; g.after(600, ()=>{ const x = p.reduce((a,b)=>a^b); let k2, m2;
      if(x){ k2 = p.findIndex(v=>(v^x)<v); m2 = p[k2]-(p[k2]^x); } else { k2 = p.findIndex(v=>v); m2 = 1; }
      p[k2]-=m2; msg.textContent = `電腦從第 ${k2+1} 堆拿了 ${m2} 顆`; draw(); if(p.every(v=>!v)) g.over('電腦贏了','提示：讓三堆的 XOR 為 0 就必勝'); }); };
  draw();
});

// 播棋 Kalah
B('mancala','播棋','🥣','選一個坑撒種子（逆時針），最後落在自己倉庫可再下一次。倉庫種子多者勝', g => {
  let b = [4,4,4,4,4,4,0,4,4,4,4,4,4,0], turn=0;
  const sow = (s, i, pl) => { s=s.slice(); let n=s[i]; s[i]=0; let k=i; while(n){ k=(k+1)%14; if(k===(pl?6:13)) continue; s[k]++; n--; }
    let again = k===(pl?13:6); const own = pl ? k>6&&k<13 : k<6;
    if(own && s[k]===1 && s[12-k]){ s[pl?13:6] += s[12-k]+1; s[k]=s[12-k]=0; }
    if(s.slice(0,6).every(v=>!v)||s.slice(7,13).every(v=>!v)){ for(let j=0;j<6;j++){ s[6]+=s[j]; s[13]+=s[j+7]; s[j]=s[j+7]=0; } again=false; }
    return [s, again]; };
  const top = g.div('row'), mid = g.div('row'), bot = g.div('row'); const msg = g.div('msg','你在下方，點選一個坑');
  const pit = (i, click) => { const d=document.createElement('button'); d.className='opt'; d.style.cssText='min-width:0;width:46px;height:46px;border-radius:50%;padding:0;font-size:1.1rem'; d.textContent=b[i]; if(click) d.onclick=click; return d; };
  const draw = () => { top.innerHTML=''; bot.innerHTML=''; mid.innerHTML='';
    for(let i=12;i>=7;i--) top.appendChild(pit(i)); for(let i=0;i<6;i++) bot.appendChild(pit(i, ()=>me(i)));
    mid.innerHTML = `<div class="opt" style="min-width:70px">電腦<br><b>${b[13]}</b></div><div style="width:110px"></div><div class="opt" style="min-width:70px">你<br><b>${b[6]}</b></div>`; check(); };
  const check = () => { if(b.slice(0,6).every(v=>!v)&&b.slice(7,13).every(v=>!v)) g.over(b[6]>b[13]?'你贏了！🎉':b[6]<b[13]?'電腦贏了':'平手', `你 ${b[6]} : ${b[13]} 電腦`); };
  const me = i => { if(turn||!b[i]||g.ended) return; const [s,a] = sow(b,i,0); b=s; draw(); if(!a){ turn=1; g.after(600, cpu); } else msg.textContent='再下一次！'; };
  const cpu = () => { if(g.ended) return; let best=-1, bv=-1e9; for(let i=7;i<13;i++) if(b[i]){ const [s,a]=sow(b,i,1); const v = s[13]-s[6] + (a?3:0) + Math.random(); if(v>bv){bv=v;best=i;} }
    const [s,a]=sow(b,best,1); b=s; msg.textContent = '電腦選了第 '+(13-best)+' 坑' + (a?'，再下一次':''); draw(); if(a&&!g.ended) g.after(700,cpu); else turn=0; };
  draw();
});

// 六貫棋
B('hex','六貫棋（雙人）','⬡','紅方連接上下兩邊、藍方連接左右兩邊，先連通者勝', g => {
  const N=9, b=Array(N*N).fill(0); let turn=1; const s=34;
  const x = g.canvas(Math.ceil(s*N*1.5+s+20), Math.ceil(s*N*.87+s+10));
  const ctr = i => { const r=Math.floor(i/N), c=i%N; return [20+s*.5+c*s+r*s/2, 20+s*.5+r*s*.87]; };
  const nb = i => { const r=Math.floor(i/N), c=i%N; return [[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0]].map(([dr,dc])=>[r+dr,c+dc]).filter(([a,b2])=>a>=0&&b2>=0&&a<N&&b2<N).map(([a,b2])=>a*N+b2); };
  const won = p => { const st = range(N).map(k=>p===1?k:k*N).filter(i=>b[i]===p), seen=new Set(st);
    while(st.length){ const i=st.pop(); if(p===1?Math.floor(i/N)===N-1:i%N===N-1) return true; nb(i).forEach(j=>{ if(b[j]===p&&!seen.has(j)){ seen.add(j); st.push(j); } }); } return false; };
  const hexp = (cx,cy,r) => { x.beginPath(); for(let k=0;k<6;k++){ const a=Math.PI/6+k*Math.PI/3; x.lineTo(cx+r*Math.cos(a), cy+r*Math.sin(a)); } x.closePath(); };
  const draw = () => { x.fillStyle='#0b1020'; x.fillRect(0,0,x.canvas.width,x.canvas.height);
    for(let i=0;i<N*N;i++){ const [cx,cy]=ctr(i); hexp(cx,cy,s*.57); x.fillStyle=b[i]===1?'#ef4444':b[i]===2?'#3b82f6':'#334155'; x.fill(); x.strokeStyle='#0b1020'; x.lineWidth=2; x.stroke(); }
    x.fillStyle='#ef4444'; x.fillRect(20,4,s*N,5); x.fillRect(20+(N-1)*s/2, x.canvas.height-8, s*N, 5);
    x.strokeStyle='#3b82f6'; x.lineWidth=4; for(let r=0;r<N;r++){ const [lx,ly]=ctr(r*N), [rx,ry]=ctr(r*N+N-1); x.beginPath(); x.moveTo(lx-s*.6,ly-s*.3); x.lineTo(lx-s*.6,ly+s*.3); x.moveTo(rx+s*.6,ry-s*.3); x.lineTo(rx+s*.6,ry+s*.3); x.stroke(); }
    g.info(`輪到 ${turn===1?'🔴 紅（上下）':'🔵 藍（左右）'}`); };
  g.on(x.canvas,'pointerdown',e=>{ if(g.ended) return; const p=g.pos(x.canvas,e); let bi=-1, bd=1e9; for(let i=0;i<N*N;i++){ const [cx,cy]=ctr(i), d=Math.hypot(cx-p.x,cy-p.y); if(d<bd){bd=d;bi=i;} }
    if(bd>s*.6||b[bi]) return; b[bi]=turn; draw(); if(won(turn)) return g.over(turn===1?'🔴 紅方獲勝':'🔵 藍方獲勝',''); turn=3-turn; draw(); });
  draw();
});

// 圍棋 9×9
B('go9','圍棋 9×9（雙人）','⚫','輪流下子，提掉沒有氣的棋子。雙方連續虛手後以子數＋地數計勝負', g => {
  const N=9; let b=Array(N*N).fill(0), turn=1, passes=0, cap=[0,0,0], prev='';
  const nb = i => { const r=Math.floor(i/N), c=i%N, o=[]; if(r) o.push(i-N); if(r<N-1) o.push(i+N); if(c) o.push(i-1); if(c<N-1) o.push(i+1); return o; };
  const grp = (s,i) => { const p=s[i], st=[i], seen=new Set([i]); let lib=0; const L=new Set(); while(st.length){ const k=st.pop(); nb(k).forEach(j=>{ if(!s[j]) L.add(j); else if(s[j]===p&&!seen.has(j)){ seen.add(j); st.push(j); } }); } return [seen, L.size]; };
  const x = g.canvas(400,400); const S=40, O=40;
  const row = g.div('row'); g.button('虛手（Pass）', () => { passes++; turn=3-turn; if(passes>=2) end(); draw(); }, 'btn alt', row);
  const end = () => { const terr=[0,0,0], seen=new Set(); for(let i=0;i<N*N;i++) if(!b[i]&&!seen.has(i)){ const st=[i], reg=[], own=new Set(); seen.add(i);
      while(st.length){ const k=st.pop(); reg.push(k); nb(k).forEach(j=>{ if(!b[j]&&!seen.has(j)){ seen.add(j); st.push(j); } else if(b[j]) own.add(b[j]); }); } if(own.size===1) terr[[...own][0]]+=reg.length; }
    const s1 = b.filter(v=>v===1).length+terr[1], s2 = b.filter(v=>v===2).length+terr[2]+6.5; g.over(s1>s2?'⚫ 黑棋勝':'⚪ 白棋勝', `黑 ${s1} : ${s2} 白（含貼目 6.5）`); };
  const draw = () => { x.fillStyle='#d6a556'; x.fillRect(0,0,400,400); x.strokeStyle='#5b3a12'; x.lineWidth=1;
    for(let k=0;k<N;k++){ x.beginPath(); x.moveTo(O,O+k*S); x.lineTo(O+(N-1)*S,O+k*S); x.moveTo(O+k*S,O); x.lineTo(O+k*S,O+(N-1)*S); x.stroke(); }
    [[2,2],[2,6],[6,2],[6,6],[4,4]].forEach(([r,c])=>{ x.fillStyle='#5b3a12'; x.beginPath(); x.arc(O+c*S,O+r*S,4,0,7); x.fill(); });
    b.forEach((v,i)=>{ if(!v) return; x.fillStyle=v===1?'#111':'#f8fafc'; x.beginPath(); x.arc(O+(i%N)*S,O+Math.floor(i/N)*S,S*.45,0,7); x.fill(); x.strokeStyle='#333'; x.stroke(); });
    g.info(`輪到 ${turn===1?'⚫ 黑':'⚪ 白'}　提子 黑 ${cap[1]}・白 ${cap[2]}`); };
  g.on(x.canvas,'pointerdown',e=>{ if(g.ended) return; const p=g.pos(x.canvas,e), c=Math.round((p.x-O)/S), r=Math.round((p.y-O)/S); if(r<0||c<0||r>=N||c>=N) return; const i=r*N+c; if(b[i]) return;
    const s=b.slice(); s[i]=turn; let took=0; nb(i).forEach(j=>{ if(s[j]===3-turn){ const [gp,l]=grp(s,j); if(!l){ gp.forEach(k=>s[k]=0); took+=gp.size; } } });
    if(!grp(s,i)[1]) return; const key=s.join(''); if(key===prev) return; prev=b.join(''); b=s; cap[turn]+=took; passes=0; turn=3-turn; draw(); });
  draw();
});

// 西洋跳棋
B('checkers','西洋跳棋','🔴','斜走一格，可跳吃對方棋子（可連跳），到底升王可後退。吃光對方就贏', g => {
  const b = Array(64).fill(0); // 1 玩家 2 電腦 ，+2 為王
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) if((r+c)%2){ if(r<3) b[r*8+c]=2; if(r>4) b[r*8+c]=1; }
  const own = (v,p) => v && (v-1)%2+1===p, king = v => v>2;
  const movesOf = (i,p,capOnly) => { const v=b[i], r=Math.floor(i/8), c=i%8, o=[]; const dirs = king(v)?[[1,1],[1,-1],[-1,1],[-1,-1]]:p===1?[[-1,1],[-1,-1]]:[[1,1],[1,-1]];
    for(const [dr,dc] of dirs){ const r1=r+dr,c1=c+dc,r2=r+2*dr,c2=c+2*dc;
      if(r2>=0&&c2>=0&&r2<8&&c2<8&&own(b[r1*8+c1],3-p)&&!b[r2*8+c2]) o.push({f:i,t:r2*8+c2,x:r1*8+c1});
      else if(!capOnly&&r1>=0&&c1>=0&&r1<8&&c1<8&&!b[r1*8+c1]) o.push({f:i,t:r1*8+c1}); } return o; };
  const all = p => { const m = range(64).filter(i=>own(b[i],p)).flatMap(i=>movesOf(i,p)); const cap = m.filter(x=>x.x!=null); return cap.length?cap:m; };
  let sel=null, chain=null;
  const doMove = m => { b[m.t]=b[m.f]; b[m.f]=0; if(m.x!=null) b[m.x]=0; const r=Math.floor(m.t/8); if((r===0&&b[m.t]===1)||(r===7&&b[m.t]===2)) b[m.t]+=2;
    return m.x!=null && movesOf(m.t, (b[m.t]-1)%2+1, true).length; };
  const cells = g.grid(8,8,46,(r,c)=>{ const i=r*8+c; const legal = chain!=null ? movesOf(chain,1,true) : all(1);
    if(own(b[i],1) && chain==null){ sel=i; draw(); return; } const m = legal.find(x=>x.f===sel&&x.t===i); if(!m) return;
    if(doMove(m)){ chain=sel=m.t; draw(); return; } chain=sel=null; draw(); if(!check()) g.after(500, cpu); });
  const cpu = async () => { let ms = all(2); if(!ms.length) return check(); let m = pick(ms);
    const safe = ms.filter(x=>{ const r=Math.floor(x.t/8),c=x.t%8; return ![[1,1],[1,-1]].some(([dr,dc])=>{ const a=(r+dr)*8+c+dc, z=(r-dr)*8+c-dc; return r+dr<8&&c+dc>=0&&c+dc<8&&own(b[a],1)&&r-dr>=0&&c-dc>=0&&c-dc<8&&(!b[z]||z===x.f); }); });
    if(m.x==null && safe.length) m = pick(safe);
    while(doMove(m)){ draw(); await sleep(400); if(!g.alive()) return; m = movesOf(m.t,2,true)[0]; } draw(); check(); };
  const check = () => { const p1 = all(1).length, p2 = all(2).length; if(!p1){ g.over('電腦贏了',''); return true; } if(!p2){ g.over('你贏了！🎉',''); return true; } return false; };
  const draw = () => { const L = new Set((chain!=null?movesOf(chain,1,true):all(1)).filter(m=>m.f===sel).map(m=>m.t));
    cells.forEach((x,i)=>{ const v=b[i]; x.style.background = (x.r+x.c)%2 ? (L.has(i)?'#4ade80':'#7c4a1e') : '#f3e2c0'; x.textContent = v===1?'🔴':v===2?'⚫':v===3?'♔':v===4?'♚':''; x.style.color = v===3?'#dc2626':'#111';
      x.style.outline = i===sel?'3px solid #facc15':''; }); g.info(`你 🔴 ${b.filter(v=>own(v,1)).length} : ${b.filter(v=>own(v,2)).length} ⚫ 電腦`); };
  g.div('hint','有吃子時必須吃子'); draw();
});

// 剪刀石頭布
B('rps','剪刀石頭布','✌️','和電腦猜拳，電腦會學習你的習慣喔！', g => {
  const E=['✊','✋','✌️'], N=['石頭','布','剪刀']; let w=0,l=0,d=0; const hist=[];
  const big = g.div('big','✊ vs ✊'); const msg = g.div('msg'); const row = g.div('row');
  E.forEach((e,i)=>g.button(e+' '+N[i], () => { let ai;
    if(hist.length>3){ const cnt=[0,0,0]; for(let k=0;k<hist.length-1;k++) if(hist[k]===hist.at(-1)) cnt[hist[k+1]]++; const guess=cnt.indexOf(Math.max(...cnt)); ai=(guess+1)%3; if(Math.random()<.3) ai=R(3); } else ai=R(3);
    hist.push(i); big.textContent = `${E[i]}  vs  ${E[ai]}`; const r=(i-ai+3)%3; if(r===0){d++;msg.textContent='平手';} else if(r===1){w++;msg.textContent='你贏了！';} else {l++;msg.textContent='你輸了';}
    g.info(`勝 ${w}・負 ${l}・和 ${d}`); }, 'opt', row));
});

// 豬骰子 Pig
B('pig','擲骰比賽','🎲','輪流擲骰累積點數，擲到 1 這回合歸零！先到 50 分者勝', g => {
  let sc=[0,0], turnPts=0; const big=g.div('big','🎲'); const msg=g.div('msg','你的回合'); const row=g.div('row');
  const F='⚀⚁⚂⚃⚄⚅';
  const show = () => g.info(`你 ${sc[0]} ・ 電腦 ${sc[1]} ・ 本回合 ${turnPts}`);
  const roll = () => R(6)+1;
  const rb = g.button('擲骰', () => { const v=roll(); big.textContent=F[v-1]; if(v===1){ turnPts=0; msg.textContent='擲到 1！換電腦'; cpu(); } else { turnPts+=v; if(sc[0]+turnPts>=50){ sc[0]+=turnPts; show(); return g.over('你贏了！🎉',''); } } show(); }, 'btn', row);
  const hb = g.button('停手存分', () => { sc[0]+=turnPts; turnPts=0; show(); cpu(); }, 'btn alt', row);
  const cpu = async () => { rb.disabled=hb.disabled=true; let t=0; await sleep(700);
    while(g.alive()){ const v=roll(); big.textContent=F[v-1]; if(v===1){ t=0; msg.textContent='電腦擲到 1！'; break; } t+=v; msg.textContent=`電腦累積 ${t}`; await sleep(600);
      if(sc[1]+t>=50 || t>=20 || (sc[0]>40&&t>=10&&sc[1]+t<sc[0]&&false)) break; }
    if(!g.alive()) return; sc[1]+=t; show(); if(sc[1]>=50) return g.over('電腦贏了',''); msg.textContent+='，換你'; rb.disabled=hb.disabled=false; };
  show();
});

// 21 點
B('blackjack','21 點','🂡','點數接近 21 但不能超過，A 可算 1 或 11，莊家 17 點以上停牌', g => {
  let d, P, Dh, chips=100, bet=10; const dealer=g.div('row'), player=g.div('row'), msg=g.div('msg'), row=g.div('row');
  const val = h => { let s=0,a=0; h.forEach(c=>{ s+=Math.min(c.r,10); if(c.r===1) a++; }); while(a&&s+10<=21){ s+=10; a--; } return s; };
  let live=false;
  const draw = (hide) => { dealer.innerHTML = Dh.map((c,i)=>cardHTML(c, hide&&i===1)).join('') + `<div style="width:100%;text-align:center">莊家 ${hide?'?':val(Dh)}</div>`;
    player.innerHTML = P.map(c=>cardHTML(c)).join('') + `<div style="width:100%;text-align:center">你 ${val(P)}</div>`; g.info('籌碼 '+chips); };
  const fin = () => { live=false; while(val(Dh)<17) Dh.push(d.pop()); const p=val(P), q=val(Dh); let r;
    if(p>21) r=-1; else if(q>21||p>q) r=1; else if(p<q) r=-1; else r=0; if(p===21&&P.length===2&&r>0) r=1.5;
    chips += r*bet; msg.textContent = r>0?'你贏了！':r<0?'你輸了':'平手'; draw(false); g.best(chips); if(chips<=0) g.over('籌碼輸光了',''); };
  const deal = () => { if(live) return; d=deck(); P=[d.pop(),d.pop()]; Dh=[d.pop(),d.pop()]; live=true; msg.textContent=''; draw(true); if(val(P)===21) fin(); };
  g.button('發牌（下注 10）', deal, 'btn', row);
  g.button('要牌', () => { if(!live) return; P.push(d.pop()); draw(true); if(val(P)>21) fin(); }, 'btn alt', row);
  g.button('停牌', () => live && fin(), 'btn alt', row);
  g.best(); deal();
});

// 猜大小
B('hilo','撲克猜大小','🃏','猜下一張牌會比現在大還是小，連續猜對越多分數越高', g => {
  let d=deck(), cur=d.pop(), score=0; const show=g.div('row'), msg=g.div('msg'), row=g.div('row'); g.score(0); g.best();
  const draw = () => show.innerHTML = cardHTML(cur);
  const go = hi => { const n=d.pop(); if(!d.length) d=deck(); const ok = n.r===cur.r || (hi ? n.r>cur.r : n.r<cur.r);
    msg.textContent = `下一張是 ${RANKS[n.r-1]}${n.s}` + (n.r===cur.r?'（相同算對）':''); cur=n; draw();
    if(ok){ score++; g.score(score); } else { g.best(score); g.over('猜錯了', `連續猜對 ${score} 次`); } };
  g.button('⬆ 比較大', () => go(true), 'btn', row); g.button('⬇ 比較小', () => go(false), 'btn', row); draw();
});

// 拉霸
B('slot','水果拉霸','🎰','拉下拉霸，三個相同就中大獎！（純娛樂虛擬幣）', g => {
  const S=['🍒','🍋','🍊','🍇','🔔','⭐','7️⃣'], pay={'🍒':5,'🍋':8,'🍊':10,'🍇':15,'🔔':20,'⭐':40,'7️⃣':100}; let coin=100, spin=false;
  const reels = g.div('big'); reels.style.fontSize='3.5rem'; reels.textContent='🍒🍋🍊'; const msg=g.div('msg');
  g.button('拉！（5 枚）', async () => { if(spin||coin<5) return; spin=true; coin-=5; g.info('代幣 '+coin); let r;
    for(let k=0;k<15;k++){ r=[pick(S),pick(S),pick(S)]; reels.textContent=r.join(''); await sleep(60+k*8); if(!g.alive()) return; }
    if(r[0]===r[1]&&r[1]===r[2]){ coin+=pay[r[0]]*5; msg.textContent=`🎉 三個 ${r[0]}！贏得 ${pay[r[0]]*5}`; }
    else if(r[0]===r[1]||r[1]===r[2]||r[0]===r[2]){ coin+=8; msg.textContent='兩個相同，贏得 8'; } else msg.textContent='沒中…';
    g.info('代幣 '+coin); g.best(coin); spin=false; if(coin<5) g.over('代幣用完了',''); });
  g.info('代幣 '+coin); g.best();
});

// 海戰棋
B('battle','海戰棋','🚢','攻擊敵方海域，先擊沉對方全部 5 艘船的人獲勝', g => {
  const N=8, ships=[4,3,3,2,2];
  const place = () => { const b=Array(N*N).fill(0); ships.forEach((L,k)=>{ for(;;){ const h=R(2), r=R(h?N:N-L+1), c=R(h?N-L+1:N); const cs=range(L).map(i=>h?r*N+c+i:(r+i)*N+c);
      if(cs.every(i=>!b[i])){ cs.forEach(i=>b[i]=k+1); break; } } }); return b; };
  const me=place(), en=place(), shotE=Array(N*N).fill(0), shotM=Array(N*N).fill(0); let lock=false; const q=[];
  g.div('hint','敵方海域（點擊攻擊）'); const E = g.grid(N,N,34,(r,c)=>{ const i=r*N+c; if(lock||shotE[i]) return; shotE[i]=1; draw(); if(done()) return; lock=true; g.after(500, cpu); });
  g.div('hint','我方海域'); const M = g.grid(N,N,26);
  const sunk = (b,s,k) => b.every((v,i)=>v!==k||s[i]);
  const cpu = () => { let i; while(q.length){ const j=q.pop(); if(!shotM[j]){ i=j; break; } } if(i==null) do{ i=R(N*N); }while(shotM[i]||(Math.floor(i/N)+i%N)%2&&Math.random()<.7);
    shotM[i]=1; if(me[i]){ const r=Math.floor(i/N), c=i%N; [[0,1],[1,0],[0,-1],[-1,0]].forEach(([dr,dc])=>{ const rr=r+dr,cc=c+dc; if(rr>=0&&cc>=0&&rr<N&&cc<N) q.push(rr*N+cc); }); }
    lock=false; draw(); done(); };
  const done = () => { if(range(5).every(k=>sunk(en,shotE,k+1))){ g.over('你擊沉了全部敵艦！🎉',''); return true; } if(range(5).every(k=>sunk(me,shotM,k+1))){ g.over('我方艦隊全滅',''); return true; } return false; };
  const draw = () => { E.forEach((x,i)=>{ x.textContent = shotE[i] ? (en[i]?(sunk(en,shotE,en[i])?'💀':'🔥'):'·') : ''; x.style.background = shotE[i]&&en[i]?'#7f1d1d':shotE[i]?'#1e3a8a':'#0369a1'; });
    M.forEach((x,i)=>{ x.textContent = shotM[i] ? (me[i]?'🔥':'·') : ''; x.style.background = me[i]?'#64748b':'#0369a1'; x.style.cursor='default'; });
    g.info(`敵艦剩 ${5-range(5).filter(k=>sunk(en,shotE,k+1)).length} 艘・我方剩 ${5-range(5).filter(k=>sunk(me,shotM,k+1)).length} 艘`); };
  draw();
});

// 蛇梯棋
B('snakes','蛇梯棋','🐍','擲骰前進，爬梯子往上、遇到蛇滑下去，先到 100 者勝', g => {
  const J = {4:25,13:46,33:49,42:63,50:69,62:81,74:92, 27:5,40:3,43:18,54:31,66:45,76:58,89:53,99:41};
  let pos=[1,1], turn=0, busy=false;
  const cells = g.grid(10,10,38); cells.forEach((x,k)=>{ const r=9-Math.floor(k/10), c=k%10; x.n = r*10 + (r%2 ? 10-c : c+1); x.style.fontSize='10px'; x.style.flexDirection='column'; x.style.cursor='default'; });
  const big = g.div('big','🎲'); const msg=g.div('msg','你是 🔵，電腦是 🔴');
  const draw = () => cells.forEach(x=>{ const t=J[x.n]; x.innerHTML = `<span>${x.n}</span><span style="font-size:13px">${pos[0]===x.n?'🔵':''}${pos[1]===x.n?'🔴':''}${!(pos[0]===x.n||pos[1]===x.n)&&t?(t>x.n?'🪜':'🐍'):''}</span>`;
    x.style.background = t ? (t>x.n?'#bbf7d0':'#fecaca') : ''; x.title = t?`→ ${t}`:''; x.style.color='#111'; });
  const step = async p => { const v=R(6)+1; big.textContent='⚀⚁⚂⚃⚄⚅'[v-1]; const who=p?'電腦':'你';
    if(pos[p]+v<=100){ pos[p]+=v; draw(); await sleep(400); if(J[pos[p]]){ msg.textContent = `${who}${J[pos[p]]>pos[p]?'爬梯子 🪜':'被蛇咬 🐍'} ${pos[p]} → ${J[pos[p]]}`; pos[p]=J[pos[p]]; } else msg.textContent=`${who}擲出 ${v}`; }
    else msg.textContent = `${who}擲出 ${v}，超過 100 不能走`;
    draw(); if(pos[p]===100){ g.over(p?'電腦贏了':'你贏了！🎉',''); return true; } return false; };
  g.button('擲骰', async () => { if(busy||g.ended) return; busy=true; if(!(await step(0))){ await sleep(800); if(g.alive()) await step(1); } busy=false; });
  draw();
});

// 視訊撲克
B('vpoker','五張撲克','🂮','拿到 5 張牌，選擇要保留的牌後換牌一次，組成越大的牌型贏越多', g => {
  let coin=100, d, h, held, phase=0; const box=g.div('row'), msg=g.div('msg'), row=g.div('row');
  const rank = h => { const r=h.map(c=>c.r).sort((a,b)=>a-b), cnt={}; r.forEach(v=>cnt[v]=(cnt[v]||0)+1); const cs=Object.values(cnt).sort((a,b)=>b-a);
    const fl = h.every(c=>c.s===h[0].s), st = (new Set(r).size===5 && r[4]-r[0]===4) || r.join()==='1,10,11,12,13';
    if(st&&fl) return r[0]===1&&r[1]===10?['皇家同花順',250]:['同花順',50]; if(cs[0]===4) return ['四條',25]; if(cs[0]===3&&cs[1]===2) return ['葫蘆',9]; if(fl) return ['同花',6]; if(st) return ['順子',4];
    if(cs[0]===3) return ['三條',3]; if(cs[0]===2&&cs[1]===2) return ['兩對',2]; const p=Object.keys(cnt).find(k=>cnt[k]===2); if(p&&(+p>=11||+p===1)) return ['一對（J 以上）',1]; return ['沒有牌型',0]; };
  const draw = () => { box.innerHTML=''; h.forEach((c,i)=>{ const w=document.createElement('div'); w.style.cssText='display:flex;flex-direction:column;align-items:center;cursor:pointer'; w.innerHTML=cardHTML(c)+`<small>${held[i]?'保留':'　'}</small>`;
      if(held[i]) w.firstChild.style.outline='3px solid #facc15'; w.onclick=()=>{ if(phase===1){ held[i]=!held[i]; draw(); } }; box.appendChild(w); }); g.info('代幣 '+coin); };
  const btn = g.button('發牌（1 枚）', () => { if(phase===0){ if(coin<1) return; coin--; d=deck(); h=range(5).map(()=>d.pop()); held=Array(5).fill(false); phase=1; btn.textContent='換牌'; msg.textContent='點選要保留的牌'; draw(); }
    else { h=h.map((c,i)=>held[i]?c:d.pop()); const [n,p]=rank(h); coin+=p; msg.textContent = `${n}${p?`！贏 ${p}`:''}`; phase=0; btn.textContent='發牌（1 枚）'; held=Array(5).fill(false); draw(); g.best(coin); if(coin<=0) g.over('代幣用完了',''); } }, 'btn', row);
  g.best(); d=deck(); h=range(5).map(()=>d.pop()); held=Array(5).fill(false); draw(); msg.textContent='按「發牌」開始';
});

// 金字塔接龍
B('pyramid','金字塔接龍','🔺','點兩張未被壓住、點數相加為 13 的牌消除（K 單獨消除，J=11 Q=12）', g => {
  const d=deck(); const P=range(28).map(()=>d.pop()), gone=Array(28).fill(false); let stock=d, waste=[], sel=null, pass=0;
  const rowOf = i => { let r=0, s=0; while(s+r+1<=i){ s+=r+1; r++; } return [r, i-s]; };
  const idx = (r,c) => r*(r+1)/2+c;
  const free = i => { const [r,c]=rowOf(i); return r===6 || (gone[idx(r+1,c)] && gone[idx(r+1,c+1)]); };
  const box = g.div(''); box.style.cssText='position:relative;width:340px;height:300px';
  const bot = g.div('row');
  const val = s => s==='w' ? waste.at(-1)?.r : P[s].r;
  const remove = s => { if(s==='w') waste.pop(); else gone[s]=true; };
  const click = s => { if(s!=='w' && (gone[s]||!free(s))) return; if(s==='w'&&!waste.length) return;
    if(val(s)===13){ remove(s); sel=null; return draw(); }
    if(sel===null||sel===s){ sel = sel===s?null:s; return draw(); }
    if(val(sel)+val(s)===13){ remove(sel); remove(s); } sel=null; draw(); };
  const draw = () => { box.innerHTML='';
    P.forEach((c,i)=>{ if(gone[i]) return; const [r,cc]=rowOf(i); const w=document.createElement('div'); w.innerHTML=cardHTML(c); const el=w.firstChild;
      el.style.cssText += `;position:absolute;left:${140-r*24+cc*48}px;top:${r*36}px;width:46px;height:64px;font-size:15px;cursor:pointer;${free(i)?'':'filter:brightness(.6)'};${sel===i?'outline:3px solid #facc15':''}`;
      el.onclick=()=>click(i); box.appendChild(el); });
    bot.innerHTML=''; const sb=document.createElement('div'); sb.innerHTML = stock.length?cardHTML(null,true):`<span class="opt">↻</span>`; sb.style.cursor='pointer';
    sb.onclick=()=>{ if(stock.length) waste.push(stock.pop()); else if(pass<2){ stock=waste.reverse(); waste=[]; pass++; } sel=null; draw(); }; bot.appendChild(sb);
    const wb=document.createElement('div'); wb.innerHTML = waste.length?cardHTML(waste.at(-1)):'<span class="opt">空</span>'; wb.style.cursor='pointer'; if(sel==='w') wb.firstChild.style.outline='3px solid #facc15'; wb.onclick=()=>click('w'); bot.appendChild(wb);
    g.info(`牌堆 ${stock.length}・可再洗 ${2-pass} 次`); if(gone.every(Boolean)) g.over('金字塔清空！🎉','');
    else if(!stock.length && pass>=2){ const av = P.map((c,i)=>!gone[i]&&free(i)?c.r:null).filter(v=>v!=null); if(waste.length) av.push(waste.at(-1).r);
      if(!av.some(v=>v===13) && !av.some((v,i)=>av.some((u,j)=>i!==j&&u+v===13))) g.over('沒有步可走了', `剩 ${gone.filter(x=>!x).length} 張`); } };
  draw();
});

// 高爾夫接龍
B('golf','高爾夫接龍','⛳','把各列最下方的牌移到底牌，點數須差 1（A 與 K 不相連）。清光 35 張就贏', g => {
  const d=deck(); const cols=range(7).map(()=>range(5).map(()=>d.pop())); let stock=d, base=[stock.pop()];
  const tbl=g.div('row'); tbl.style.alignItems='flex-start'; const bot=g.div('row');
  const draw = () => { tbl.innerHTML=''; cols.forEach((col,k)=>{ const c=document.createElement('div'); c.style.cssText='display:flex;flex-direction:column;width:52px';
      col.forEach((cd,j)=>{ const w=document.createElement('div'); w.innerHTML=cardHTML(cd); const el=w.firstChild; el.style.marginTop=j?'-50px':'0'; el.style.width='48px';
        if(j===col.length-1){ el.style.cursor='pointer'; el.onclick=()=>{ if(Math.abs(cd.r-base.at(-1).r)===1){ base.push(col.pop()); draw(); } }; } c.appendChild(el); }); tbl.appendChild(c); });
    bot.innerHTML=''; const sb=document.createElement('div'); sb.innerHTML = stock.length?cardHTML(null,true):'<span class="opt">空</span>'; sb.style.cursor='pointer'; sb.onclick=()=>{ if(stock.length){ base.push(stock.pop()); draw(); } };
    bot.appendChild(sb); const bb=document.createElement('div'); bb.innerHTML=cardHTML(base.at(-1)); bot.appendChild(bb);
    const left = cols.reduce((s,c)=>s+c.length,0); g.info(`剩 ${left} 張・牌堆 ${stock.length}`);
    if(!left) g.over('全部清空！⛳',''); else if(!stock.length && !cols.some(c=>c.length&&Math.abs(c.at(-1).r-base.at(-1).r)===1)){ g.best(left,true); g.over('沒步可走', `剩 ${left} 張`); } };
  g.best(null); draw();
});

// 快艇骰子
B('yacht','快艇骰子','🎲','每回合最多擲 3 次，可保留骰子，選一個項目計分。12 回合後總分越高越好', g => {
  const F='⚀⚁⚂⚃⚄⚅'; let dice=[1,1,1,1,1], hold=Array(5).fill(false), rolls=0, used={};
  const cats = [['一點',d=>d.filter(v=>v===1).length],['二點',d=>2*d.filter(v=>v===2).length],['三點',d=>3*d.filter(v=>v===3).length],['四點',d=>4*d.filter(v=>v===4).length],['五點',d=>5*d.filter(v=>v===5).length],['六點',d=>6*d.filter(v=>v===6).length],
    ['四條',d=>{ const c=cnt(d); return Math.max(...c)>=4 ? d.reduce((a,b)=>a+b) : 0; }],['葫蘆',d=>{ const c=cnt(d).filter(Boolean).sort(); return c.join()==='2,3' ? d.reduce((a,b)=>a+b) : 0; }],
    ['小順 (4)',d=>{ const s=new Set(d); return [[1,2,3,4],[2,3,4,5],[3,4,5,6]].some(q=>q.every(v=>s.has(v)))?15:0; }],['大順 (5)',d=>{ const s=[...new Set(d)].sort().join(''); return s==='12345'||s==='23456'?30:0; }],
    ['任意',d=>d.reduce((a,b)=>a+b)],['快艇 (5 同)',d=>new Set(d).size===1?50:0]];
  const cnt = d => range(7).map(k=>d.filter(v=>v===k).length);
  const dr = g.div('row'); const ctl = g.div('row'); const tbl = g.div(''); tbl.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:6px;width:min(100%,420px)';
  const rb = g.button('擲骰', () => { if(rolls>=3) return; dice=dice.map((v,i)=>hold[i]?v:R(6)+1); rolls++; draw(); }, 'btn', ctl);
  const draw = () => { dr.innerHTML=''; dice.forEach((v,i)=>{ const b=g.button(F[v-1], ()=>{ if(rolls){ hold[i]=!hold[i]; draw(); } }, 'opt', dr); b.style.fontSize='2.6rem'; b.style.padding='0 8px'; b.style.minWidth='0'; if(hold[i]) b.style.background='#fde68a'; });
    rb.textContent = `擲骰（剩 ${3-rolls} 次）`; tbl.innerHTML='';
    cats.forEach(([n,f])=>{ const b=g.button(`${n}：${used[n]!=null?used[n]:rolls?'+'+f(dice):'-'}`, ()=>{ if(used[n]!=null||!rolls) return; used[n]=f(dice); rolls=0; hold.fill(false); draw();
        if(Object.keys(used).length===12){ let s=Object.values(used).reduce((a,b)=>a+b); const up=range(6).reduce((a,k)=>a+used[cats[k][0]],0); if(up>=63) s+=35; g.best(s); g.over('遊戲結束', `總分 ${s}${up>=63?'（含上半區獎勵 35）':''}`); } }, 'opt', tbl);
      b.style.fontSize='1rem'; if(used[n]!=null) b.style.opacity=.5; });
    const s = Object.values(used).reduce((a,b)=>a+b,0); g.score(s); };
  g.best(); draw();
});

// 移動井字棋
B('ttt3move','三子移動棋（雙人）','♻️','每人只有 3 顆棋子，放完後要移動自己的棋子到空格，先連成一線者勝', g => {
  const b=Array(9).fill(null); let turn='X', sel=null;
  const msg=g.div('msg');
  const cells = g.grid(3,3,96,(r,c)=>{ const i=r*3+c; const n=b.filter(v=>v===turn).length;
    if(n<3){ if(b[i]) return; b[i]=turn; next(); return; }
    if(b[i]===turn){ sel=i; draw(); return; } if(sel!==null&&!b[i]){ b[i]=turn; b[sel]=null; sel=null; next(); } });
  const next = () => { const w=t3win(b); draw(); if(w&&w!=='D') return g.over((w==='X'?'✕':'◯')+' 獲勝！',''); turn=turn==='X'?'O':'X'; draw(); };
  const draw = () => { cells.forEach((x,i)=>{ x.textContent=b[i]==='X'?'✕':b[i]==='O'?'◯':''; x.style.color=b[i]==='X'?'#2563eb':'#dc2626'; x.style.background=i===sel?'#fde68a':''; });
    msg.textContent = `輪到 ${turn==='X'?'✕':'◯'}` + (b.filter(v=>v===turn).length>=3?'：選一顆自己的棋子再點空格移動':'：放置棋子'); };
  draw();
});
})();
