// ===== 動作類（一）=====
const A = (id,name,icon,desc,run) => add(id,name,'arcade',icon,desc,run);
const bg = (x, c='#0b1020') => { x.fillStyle=c; x.fillRect(0,0,x.canvas.width,x.canvas.height); };
const txt = (x,s,X,Y,size=20,col='#fff',al='center') => { x.fillStyle=col; x.font=`bold ${size}px sans-serif`; x.textAlign=al; x.textBaseline='middle'; x.fillText(s,X,Y); };
const circ = (x,X,Y,r,c) => { x.fillStyle=c; x.beginPath(); x.arc(X,Y,r,0,7); x.fill(); };
const tapper = (g, el, fn) => { g.on(el,'pointerdown',e=>{ e.preventDefault(); fn(e); }); };
const steer = (g, c, obj, W) => { g.on(c,'pointermove',e=>{ obj.tx = g.pos(c,e).x; }); g.on(c,'pointerdown',e=>{ obj.tx = g.pos(c,e).x; }); };
(function(){

// 貪食蛇
const snake = (mode) => g => {
  const N=20, S=20, x=g.canvas(N*S,N*S); g.pad(); let s=[[10,10],[9,10],[8,10]], dir=[1,0], q=[], food, score=0, sp=130;
  const walls = mode==='maze' ? [...range(10,5).map(i=>[i,5]), ...range(10,5).map(i=>[i,14]), ...range(6,7).map(i=>[4,i]), ...range(6,7).map(i=>[15,i])].filter(([a,b])=>!(b===10)) : [];
  const isW = (a,b) => walls.some(w=>w[0]===a&&w[1]===b);
  const place = () => { do{ food=[R(N),R(N)]; }while(s.some(p=>p[0]===food[0]&&p[1]===food[1])||isW(...food)); };
  g.score(0); g.best(); place();
  let go=false; g.onKey(k=>{ const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]}[k]; if(d){ go=true; q.push(d); } });
  let sx; g.on(x.canvas,'touchstart',e=>{ sx=e.touches[0]; },{passive:true}); g.on(x.canvas,'touchend',e=>{ const t=e.changedTouches[0], dx=t.clientX-sx.clientX, dy=t.clientY-sx.clientY; if(Math.max(Math.abs(dx),Math.abs(dy))>20) go=true, q.push(Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)]); });
  const tick = () => { if(!go) return; while(q.length){ const d=q.shift(); if(d[0]!==-dir[0]||d[1]!==-dir[1]){ dir=d; break; } }
    let h=[s[0][0]+dir[0], s[0][1]+dir[1]];
    if(mode==='wrap') h=[(h[0]+N)%N,(h[1]+N)%N];
    if(h[0]<0||h[1]<0||h[0]>=N||h[1]>=N||s.some(p=>p[0]===h[0]&&p[1]===h[1])||isW(...h)){ g.best(score); g.over('撞到了！', '得分 '+score); return; }
    s.unshift(h); if(h[0]===food[0]&&h[1]===food[1]){ score+=10; g.score(score); place(); if(mode==='fast'){ sp=Math.max(50,sp-6); clearInterval(t); t=g.every(sp,tick); } } else s.pop(); draw(); };
  const draw = () => { bg(x); walls.forEach(([a,b])=>{ x.fillStyle='#64748b'; x.fillRect(a*S,b*S,S,S); });
    circ(x, food[0]*S+S/2, food[1]*S+S/2, S/2-2, '#ef4444'); s.forEach((p,i)=>{ x.fillStyle = i?'#22c55e':'#86efac'; x.fillRect(p[0]*S+1,p[1]*S+1,S-2,S-2); });
    if(!go) txt(x,'按方向鍵或滑動開始',N*S/2,N*S/2+60,18,'#e2e8f0');
    if(mode==='wrap'){ x.strokeStyle='#38bdf8'; x.setLineDash([4,4]); x.strokeRect(1,1,N*S-2,N*S-2); x.setLineDash([]); } };
  let t = g.every(sp, tick); draw();
};
A('snake','貪食蛇','🐍','方向鍵或滑動控制，吃紅點變長，別撞牆或撞自己', snake('classic'));
A('snake2','穿牆貪食蛇','🐉','可以穿越邊界從另一邊出來，只要別咬到自己', snake('wrap'));
A('snake3','極速貪食蛇','⚡','每吃一個速度就變快！', snake('fast'));
A('snake4','迷宮貪食蛇','🧱','場地中有牆壁障礙物，小心閃避', snake('maze'));

// 打磚塊
A('breakout','打磚塊','🧱','移動滑鼠/手指或方向鍵控制板子，把磚塊全部打掉', g => {
  const W=400,H=500, x=g.canvas(W,H); const p={x:160,w:80,tx:null}; let b, bricks=[], lives=3, score=0, lv=1; steer(g,x.canvas,p);
  const build = () => { bricks=[]; for(let r=0;r<5+lv;r++) for(let c=0;c<8;c++) bricks.push({x:4+c*49,y:50+r*20,w:45,h:16,col:`hsl(${r*40},70%,55%)`}); };
  const reset = () => { b={x:200,y:400,vx:(Math.random()<.5?-1:1)*170,vy:-260-lv*30,stuck:true}; };
  tapper(g,x.canvas,()=>{ b.stuck=false; }); g.onKey(k=>{ if(k===' ') b.stuck=false; });
  g.score(0); g.best(); build(); reset(); g.div('hint','點擊或空白鍵發球');
  g.loop(dt=>{ if(g.keys.ArrowLeft) p.x-=420*dt, p.tx=null; if(g.keys.ArrowRight) p.x+=420*dt, p.tx=null; if(p.tx!=null) p.x += (p.tx-p.w/2-p.x)*Math.min(1,dt*15); p.x=clamp(p.x,0,W-p.w);
    if(b.stuck){ b.x=p.x+p.w/2; b.y=460; } else { b.x+=b.vx*dt; b.y+=b.vy*dt;
      if(b.x<6||b.x>W-6){ b.vx*=-1; b.x=clamp(b.x,6,W-6); } if(b.y<6){ b.vy=Math.abs(b.vy); }
      if(b.vy>0&&b.y>468&&b.y<482&&b.x>p.x-4&&b.x<p.x+p.w+4){ const t=(b.x-p.x)/p.w-.5, sp=Math.hypot(b.vx,b.vy)*1.01; b.vx=sp*Math.sin(t*2.2); b.vy=-Math.abs(sp*Math.cos(t*2.2)); }
      for(const k of bricks){ if(!k.dead && b.x>k.x-5&&b.x<k.x+k.w+5&&b.y>k.y-5&&b.y<k.y+k.h+5){ k.dead=true; score+=10; g.score(score);
          if(b.x<k.x||b.x>k.x+k.w) b.vx*=-1; else b.vy*=-1; break; } }
      if(b.y>H){ lives--; if(!lives){ g.best(score); g.over('遊戲結束','得分 '+score); return false; } reset(); }
      if(bricks.every(k=>k.dead)){ lv++; build(); reset(); } }
    bg(x); bricks.forEach(k=>{ if(!k.dead){ x.fillStyle=k.col; x.fillRect(k.x,k.y,k.w,k.h); } }); x.fillStyle='#e2e8f0'; x.fillRect(p.x,470,p.w,10); circ(x,b.x,b.y,6,'#facc15');
    txt(x,'❤'.repeat(lives),10,20,16,'#f87171','left'); txt(x,'第 '+lv+' 關',W-10,20,16,'#94a3b8','right'); });
});

// 乒乓
const pong = two => g => {
  const W=500,H=340, x=g.canvas(W,H); const L={y:140}, Rp={y:140}, ph=70; let b, s=[0,0];
  const serve = d => b={x:W/2,y:H/2,vx:d*260,vy:(Math.random()-.5)*240};
  serve(1);
  g.on(x.canvas,'pointermove',e=>{ const p=g.pos(x.canvas,e); if(!two||p.x<W/2) L.ty=p.y; else Rp.ty=p.y; });
  g.on(x.canvas,'touchmove',e=>{ for(const t of e.touches){ const p=g.pos(x.canvas,{clientX:t.clientX,clientY:t.clientY}); if(!two||p.x<W/2) L.ty=p.y; else Rp.ty=p.y; } e.preventDefault(); },{passive:false});
  g.div('hint', two?'左方：W / S ；右方：↑ / ↓（觸控可左右兩邊各自拖曳）':'用滑鼠/手指或 ↑↓ 控制左邊球拍，先得 7 分獲勝');
  g.loop(dt=>{ const mv=(P,up,dn)=>{ if(g.keys[up]) P.y-=360*dt, P.ty=null; if(g.keys[dn]) P.y+=360*dt, P.ty=null; if(P.ty!=null) P.y+=(P.ty-ph/2-P.y)*Math.min(1,dt*14); P.y=clamp(P.y,0,H-ph); };
    if(two){ mv(L,'w','s'); mv(Rp,'ArrowUp','ArrowDown'); } else { mv(L,'ArrowUp','ArrowDown'); const t=b.y-ph/2; Rp.y += clamp(t-Rp.y,-250*dt,250*dt); Rp.y=clamp(Rp.y,0,H-ph); }
    b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.y<6||b.y>H-6){ b.vy*=-1; b.y=clamp(b.y,6,H-6); }
    const hitP = (P,px,dirOk) => { if(dirOk && Math.abs(b.x-px)<10 && b.y>P.y-6 && b.y<P.y+ph+6){ const t=(b.y-P.y)/ph-.5; const sp=Math.min(700,Math.hypot(b.vx,b.vy)*1.06); b.vx=-Math.sign(b.vx)*sp*Math.cos(t); b.vy=sp*Math.sin(t)*1.4; } };
    hitP(L,22,b.vx<0); hitP(Rp,W-22,b.vx>0);
    if(b.x<0||b.x>W){ s[b.x<0?1:0]++; if(s[0]>=7||s[1]>=7){ g.over(two?(s[0]>s[1]?'左方獲勝':'右方獲勝'):(s[0]>s[1]?'你贏了！🎉':'電腦贏了'), `${s[0]} : ${s[1]}`); return false; } serve(b.x<0?1:-1); }
    bg(x); x.setLineDash([8,8]); x.strokeStyle='#334155'; x.beginPath(); x.moveTo(W/2,0); x.lineTo(W/2,H); x.stroke(); x.setLineDash([]);
    x.fillStyle='#60a5fa'; x.fillRect(12,L.y,10,ph); x.fillStyle='#f87171'; x.fillRect(W-22,Rp.y,10,ph); circ(x,b.x,b.y,7,'#fff');
    txt(x,s[0],W/2-40,30,28,'#60a5fa'); txt(x,s[1],W/2+40,30,28,'#f87171'); });
};
A('pong','乒乓球','🏓','和電腦對打乒乓，先得 7 分者勝', pong(false));
A('pong2','雙人乒乓','🏓','兩人同一台電腦對戰：W/S 與 ↑/↓', pong(true));

// 落塊方塊
A('blocksfall','落塊方塊','🟪','←→移動、↑旋轉、↓加速、空白鍵直接落下，填滿橫行就會消除', g => {
  const C=10, Rw=20, S=24, x=g.canvas(C*S+120, Rw*S); g.pad(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown',' ']);
  const SH = {I:[[0,1],[1,1],[2,1],[3,1]],O:[[1,0],[2,0],[1,1],[2,1]],T:[[1,0],[0,1],[1,1],[2,1]],S:[[1,0],[2,0],[0,1],[1,1]],Z:[[0,0],[1,0],[1,1],[2,1]],J:[[0,0],[0,1],[1,1],[2,1]],L:[[2,0],[0,1],[1,1],[2,1]]};
  const COL = {I:'#22d3ee',O:'#facc15',T:'#a855f7',S:'#22c55e',Z:'#ef4444',J:'#3b82f6',L:'#f97316'};
  const b = Array(C*Rw).fill(null); let p, nxt=pick(Object.keys(SH)), score=0, lines=0, acc=0;
  const cells = q => q.c.map(([a,c])=>[q.x+a, q.y+c]);
  const ok = q => cells(q).every(([a,c])=>a>=0&&a<C&&c<Rw&&(c<0||!b[c*C+a]));
  const spawn = () => { p={t:nxt, c:SH[nxt].map(v=>v.slice()), x:3, y:-1}; nxt=pick(Object.keys(SH)); if(!ok(p)){ g.best(score); g.over('遊戲結束', `得分 ${score}，消除 ${lines} 行`); return false; } return true; };
  const lock = () => { cells(p).forEach(([a,c])=>{ if(c>=0) b[c*C+a]=COL[p.t]; }); let n=0;
    for(let r=Rw-1;r>=0;r--){ if(range(C).every(c=>b[r*C+c])){ b.splice(r*C,C); b.unshift(...Array(C).fill(null)); n++; r++; } }
    lines+=n; score += [0,100,300,500,800][n]; g.score(score); return spawn(); };
  const mv = (dx,dy) => { const q={...p,x:p.x+dx,y:p.y+dy}; if(ok(q)){ p=q; return true; } return false; };
  const rot = () => { if(p.t==='O') return; const n = p.t==='I'?3:2; const q={...p, c:p.c.map(([a,c])=>[n-c, a])}; for(const k of [0,-1,1,-2,2]){ const z={...q,x:q.x+k}; if(ok(z)){ p=z; return; } } };
  g.onKey(k=>{ if(g.ended) return; if(k==='ArrowLeft') mv(-1,0); if(k==='ArrowRight') mv(1,0); if(k==='ArrowUp') rot(); if(k==='ArrowDown'){ if(!mv(0,1)) lock(); } if(k===' '){ while(mv(0,1)); lock(); } });
  g.score(0); g.best(); spawn();
  g.loop(dt=>{ acc+=dt; const sp = Math.max(.08, .7 - lines*.02); if(acc>sp){ acc=0; if(!mv(0,1) && !lock()) return false; } if(g.ended) return false;
    bg(x); x.fillStyle='#111827'; x.fillRect(0,0,C*S,Rw*S);
    b.forEach((v,i)=>{ if(v){ x.fillStyle=v; x.fillRect((i%C)*S+1,Math.floor(i/C)*S+1,S-2,S-2); } });
    let gy={...p}; while(ok({...gy,y:gy.y+1})) gy.y++; x.globalAlpha=.25; cells(gy).forEach(([a,c])=>{ x.fillStyle=COL[p.t]; x.fillRect(a*S+1,c*S+1,S-2,S-2); }); x.globalAlpha=1;
    cells(p).forEach(([a,c])=>{ x.fillStyle=COL[p.t]; x.fillRect(a*S+1,c*S+1,S-2,S-2); });
    txt(x,'下一個',C*S+60,30,16,'#94a3b8'); SH[nxt].forEach(([a,c])=>{ x.fillStyle=COL[nxt]; x.fillRect(C*S+22+a*20,60+c*20,18,18); });
    txt(x,'行數 '+lines,C*S+60,150,16,'#e2e8f0'); });
});

// 飛鳥穿管
A('flappy','飛鳥穿管','🐤','點擊或空白鍵讓小鳥往上飛，穿過水管間隙', g => {
  const W=360,H=520, x=g.canvas(W,H); let y=250, v=0, pipes=[], t=0, score=0, started=false;
  const flap = () => { started=true; v=-300; }; tapper(g,x.canvas,flap); g.onKey(k=>{ if(k===' '||k==='ArrowUp') flap(); }); g.score(0); g.best();
  g.loop(dt=>{ if(started){ v+=900*dt; y+=v*dt; t-=dt; if(t<=0){ t=1.5; pipes.push({x:W, gap:RR(120,H-200), ok:false}); } }
    pipes.forEach(p=>{ p.x-=140*dt; if(!p.ok&&p.x+50<80){ p.ok=true; score++; g.score(score); } }); pipes=pipes.filter(p=>p.x>-60);
    const dead = y>H-20||y<0||pipes.some(p=>80+14>p.x&&80-14<p.x+50&&(y-12<p.gap||y+12>p.gap+140));
    bg(x,'#0c4a6e'); pipes.forEach(p=>{ x.fillStyle='#16a34a'; x.fillRect(p.x,0,50,p.gap); x.fillRect(p.x,p.gap+140,50,H); });
    x.fillStyle='#854d0e'; x.fillRect(0,H-20,W,20); txt(x,'🐤',80,y,30); if(!started) txt(x,'點擊開始',W/2,H/2+60,22);
    if(dead){ g.best(score); g.over('撞到了！','得分 '+score); return false; } });
});

// 恐龍跑酷
A('runner','荒野跑酷','🦖','空白鍵或點擊跳躍，閃過仙人掌和飛鳥', g => {
  const W=600,H=220, x=g.canvas(W,H); let y=0, v=0, obs=[], t=1, sp=300, dist=0;
  const jump = () => { if(y===0) v=620; }; tapper(g,x.canvas,jump); g.onKey(k=>{ if(k===' '||k==='ArrowUp') jump(); }); g.best();
  g.loop(dt=>{ v-=1700*dt; y=Math.max(0,y+v*dt); if(y===0) v=Math.max(v,0); sp+=6*dt; dist+=sp*dt/10; t-=dt;
    if(t<=0){ t=RR(7,16)/10*(320/sp)+.4; obs.push(Math.random()<.75?{x:W,w:RR(16,30),h:RR(30,50),e:'🌵',fly:0}:{x:W,w:30,h:24,e:'🐦',fly:RR(0,1)?60:28}); }
    obs.forEach(o=>o.x-=sp*dt); obs=obs.filter(o=>o.x>-40);
    const me={x:60,y:H-30-y-40,w:30,h:40}; const dead=obs.some(o=>hit(me,{x:o.x+4,y:H-30-o.h-o.fly,w:o.w-8,h:o.h-4}));
    bg(x,'#f1f5f9'); x.fillStyle='#64748b'; x.fillRect(0,H-30,W,2); txt(x,'🦖',75,H-30-y-20,38);
    obs.forEach(o=>{ if(o.e==='🌵'){ x.fillStyle='#15803d'; x.fillRect(o.x,H-30-o.h,o.w,o.h); } else txt(x,'🐦',o.x+15,H-30-o.fly-12,26); });
    txt(x,Math.floor(dist)+' m',W-10,20,18,'#334155','right'); g.score(Math.floor(dist));
    if(dead){ g.best(Math.floor(dist)); g.over('撞到了！',Math.floor(dist)+' 公尺'); return false; } });
});

// 太空射擊
A('shooter','太空射擊','🚀','移動戰機（滑鼠/觸控/方向鍵），自動射擊消滅敵機', g => {
  const W=400,H=540, x=g.canvas(W,H); const me={x:180,y:480,tx:null}; let bul=[], en=[], eb=[], t=0, ft=0, score=0, hp=3, inv=0, stars=range(50).map(()=>[R(W),R(H),RR(1,3)]);
  steer(g,x.canvas,me); g.score(0); g.best();
  g.loop(dt=>{ if(g.keys.ArrowLeft) me.x-=320*dt, me.tx=null; if(g.keys.ArrowRight) me.x+=320*dt, me.tx=null; if(me.tx!=null) me.x+=(me.tx-20-me.x)*Math.min(1,dt*12); me.x=clamp(me.x,0,W-40);
    ft-=dt; if(ft<=0){ ft=.18; bul.push({x:me.x+18,y:me.y}); } t-=dt; if(t<=0){ t=Math.max(.3,1-score/3000); en.push({x:R(W-40),y:-40,hp:1+R(1+score/800|0),vx:(Math.random()-.5)*80,s:RR(70,140)}); }
    bul.forEach(b=>b.y-=520*dt); bul=bul.filter(b=>b.y>-10);
    en.forEach(e=>{ e.y+=e.s*dt; e.x=clamp(e.x+e.vx*dt,0,W-40); if(Math.random()<dt*.5) eb.push({x:e.x+20,y:e.y+40}); });
    eb.forEach(b=>b.y+=260*dt); eb=eb.filter(b=>b.y<H);
    en.forEach(e=>bul.forEach(b=>{ if(!b.d&&b.x>e.x&&b.x<e.x+40&&b.y>e.y&&b.y<e.y+36){ b.d=1; e.hp--; if(e.hp<=0){ e.d=1; score+=100; g.score(score); } } }));
    bul=bul.filter(b=>!b.d); inv-=dt;
    const mb={x:me.x+8,y:me.y+6,w:24,h:28};
    if(inv<=0 && (en.some(e=>!e.d&&hit(mb,{x:e.x+4,y:e.y+4,w:32,h:28})) || eb.some(b=>hit(mb,{x:b.x-3,y:b.y-3,w:6,h:6})))){ hp--; inv=1.5; eb=[]; if(!hp){ g.best(score); g.over('戰機被擊落','得分 '+score); return false; } }
    en=en.filter(e=>!e.d&&e.y<H);
    bg(x,'#020617'); stars.forEach(s=>{ s[1]=(s[1]+s[2]*60*dt)%H; x.fillStyle='#64748b'; x.fillRect(s[0],s[1],s[2],s[2]); });
    bul.forEach(b=>{ x.fillStyle='#facc15'; x.fillRect(b.x-2,b.y-8,4,10); }); eb.forEach(b=>circ(x,b.x,b.y,4,'#f87171'));
    en.forEach(e=>txt(x,e.hp>1?'👾':'🛸',e.x+20,e.y+18,32)); if(inv<=0||Math.floor(inv*10)%2) txt(x,'🚀',me.x+20,me.y+20,34);
    txt(x,'❤'.repeat(hp),10,18,16,'#f87171','left'); });
});

// 小行星
A('rocks','太空岩石','☄️','←→旋轉、↑推進、空白鍵射擊，擊碎所有岩石', g => {
  const W=500,H=420, x=g.canvas(W,H); g.pad(['ArrowLeft','ArrowUp','ArrowRight',' ']);
  const s={x:W/2,y:H/2,a:-Math.PI/2,vx:0,vy:0}; let rocks=[], bul=[], score=0, lives=3, inv=2, lv=0, cd=0;
  const wave = () => { lv++; for(let i=0;i<3+lv;i++){ const a=Math.random()*7; rocks.push({x:W/2+Math.cos(a)*220,y:H/2+Math.sin(a)*200,r:40,vx:(Math.random()-.5)*100,vy:(Math.random()-.5)*100,pts:range(9).map(()=>.75+Math.random()*.35)}); } };
  g.score(0); g.best(); wave();
  g.loop(dt=>{ if(g.keys.ArrowLeft) s.a-=4*dt; if(g.keys.ArrowRight) s.a+=4*dt; if(g.keys.ArrowUp){ s.vx+=Math.cos(s.a)*260*dt; s.vy+=Math.sin(s.a)*260*dt; }
    s.vx*=.99; s.vy*=.99; s.x=(s.x+s.vx*dt+W)%W; s.y=(s.y+s.vy*dt+H)%H; cd-=dt; inv-=dt;
    if(g.keys[' ']&&cd<=0){ cd=.22; bul.push({x:s.x,y:s.y,vx:Math.cos(s.a)*420+s.vx,vy:Math.sin(s.a)*420+s.vy,t:1}); }
    bul.forEach(b=>{ b.x=(b.x+b.vx*dt+W)%W; b.y=(b.y+b.vy*dt+H)%H; b.t-=dt; }); bul=bul.filter(b=>b.t>0);
    rocks.forEach(r=>{ r.x=(r.x+r.vx*dt+W)%W; r.y=(r.y+r.vy*dt+H)%H; });
    const nr=[]; rocks.forEach(r=>{ const b=bul.find(b=>Math.hypot(b.x-r.x,b.y-r.y)<r.r); if(b){ b.t=0; score+=r.r>30?20:r.r>15?50:100; g.score(score);
        if(r.r>15) for(let k=0;k<2;k++) nr.push({x:r.x,y:r.y,r:r.r/2,vx:(Math.random()-.5)*180,vy:(Math.random()-.5)*180,pts:r.pts}); } else nr.push(r); }); rocks=nr;
    if(inv<=0 && rocks.some(r=>Math.hypot(r.x-s.x,r.y-s.y)<r.r+10)){ lives--; inv=2; s.x=W/2; s.y=H/2; s.vx=s.vy=0; if(!lives){ g.best(score); g.over('飛船被撞毀','得分 '+score); return false; } }
    if(!rocks.length) wave();
    bg(x,'#020617'); x.strokeStyle='#cbd5e1'; x.lineWidth=2;
    rocks.forEach(r=>{ x.beginPath(); r.pts.forEach((k,i)=>{ const a=i/9*Math.PI*2; x.lineTo(r.x+Math.cos(a)*r.r*k, r.y+Math.sin(a)*r.r*k); }); x.closePath(); x.stroke(); });
    bul.forEach(b=>circ(x,b.x,b.y,2,'#facc15'));
    if(inv<=0||Math.floor(inv*10)%2){ x.strokeStyle='#38bdf8'; x.beginPath(); x.moveTo(s.x+Math.cos(s.a)*14,s.y+Math.sin(s.a)*14); x.lineTo(s.x+Math.cos(s.a+2.5)*11,s.y+Math.sin(s.a+2.5)*11); x.lineTo(s.x+Math.cos(s.a-2.5)*11,s.y+Math.sin(s.a-2.5)*11); x.closePath(); x.stroke(); }
    txt(x,'▲'.repeat(lives),10,16,14,'#38bdf8','left'); });
});

// 接水果
A('catch','接水果','🧺','移動籃子接住水果，小心炸彈！漏接 5 個就結束', g => {
  const W=400,H=500, x=g.canvas(W,H); const p={x:170,tx:null}; let it=[], t=0, score=0, miss=0; steer(g,x.canvas,p); g.score(0); g.best();
  g.loop(dt=>{ if(g.keys.ArrowLeft) p.x-=380*dt, p.tx=null; if(g.keys.ArrowRight) p.x+=380*dt, p.tx=null; if(p.tx!=null) p.x+=(p.tx-35-p.x)*Math.min(1,dt*14); p.x=clamp(p.x,0,W-70);
    t-=dt; if(t<=0){ t=Math.max(.35,1-score/600); it.push({x:RR(20,W-20),y:-20,v:RR(120,200)+score/3,e:Math.random()<.18?'💣':pick(['🍎','🍌','🍇','🍓','🍊','🍉'])}); }
    for(const o of it){ o.y+=o.v*dt; if(o.y>H-50&&o.y<H-20&&o.x>p.x-5&&o.x<p.x+75&&!o.d){ o.d=1; if(o.e==='💣'){ g.best(score); g.over('接到炸彈！💥','得分 '+score); return false; } score+=10; g.score(score); }
      if(o.y>H&&!o.d){ o.d=1; if(o.e!=='💣') miss++; } }
    it=it.filter(o=>!o.d); if(miss>=5){ g.best(score); g.over('漏接太多了','得分 '+score); return false; }
    bg(x,'#0c4a6e'); it.forEach(o=>txt(x,o.e,o.x,o.y,30)); txt(x,'🧺',p.x+35,H-35,52); txt(x,'漏接 '+miss+'/5',W-10,18,15,'#fca5a5','right'); });
});

// 躲隕石
A('dodge','躲避隕石','🌠','左右移動閃過掉落的隕石，撐得越久越好', g => {
  const W=400,H=500, x=g.canvas(W,H); const p={x:185,tx:null}; let m=[], t=0, time=0; steer(g,x.canvas,p); g.best();
  g.loop(dt=>{ time+=dt; if(g.keys.ArrowLeft) p.x-=360*dt, p.tx=null; if(g.keys.ArrowRight) p.x+=360*dt, p.tx=null; if(p.tx!=null) p.x+=(p.tx-15-p.x)*Math.min(1,dt*14); p.x=clamp(p.x,0,W-30);
    t-=dt; if(t<=0){ t=Math.max(.08,.5-time/80); m.push({x:R(W),y:-20,r:RR(8,22),v:RR(150,260)+time*6}); }
    m.forEach(o=>o.y+=o.v*dt); m=m.filter(o=>o.y<H+30);
    bg(x,'#020617'); m.forEach(o=>circ(x,o.x,o.y,o.r,'#f97316')); txt(x,'🧑‍🚀',p.x+15,H-30,30); g.score(time.toFixed(1)+' 秒');
    if(m.some(o=>Math.hypot(o.x-(p.x+15),o.y-(H-30))<o.r+12)){ const s=+time.toFixed(1); g.best(s); g.over('被擊中了！',`撐了 ${s} 秒`); return false; } });
});

// 過馬路
A('crossy','過馬路','🐔','方向鍵或按鈕前進，閃過車子到達對面，關卡越來越快', g => {
  const C=11, Rw=11, S=40, x=g.canvas(C*S,Rw*S); g.pad(); let lv=1, me, lanes, best=0;
  const init = () => { me=[5,Rw-1]; lanes=range(Rw).map(r=> r===0||r===Rw-1||r===5 ? null : {d:r%2?1:-1, sp:(40+R(60))*(1+lv*.2), cars:range(RR(1,3)).map(k=>({x:k*C*S/3+R(80), w:S*RR(1,2)}))}); g.info('第 '+lv+' 關'); };
  g.onKey(k=>{ const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[k]; if(!d||g.ended) return; me=[clamp(me[0]+d[0],0,C-1), clamp(me[1]+d[1],0,Rw-1)];
    if(me[1]===0){ lv++; init(); } });
  g.best(); init();
  g.loop(dt=>{ bg(x,'#166534'); lanes.forEach((l,r)=>{ if(!l) return; x.fillStyle='#334155'; x.fillRect(0,r*S,C*S,S);
      l.cars.forEach(c=>{ c.x+=l.d*l.sp*dt; if(c.x>C*S+20) c.x=-c.w-20; if(c.x<-c.w-20) c.x=C*S+20; x.fillStyle=`hsl(${(r*57)%360},70%,55%)`; x.fillRect(c.x,r*S+6,c.w,S-12); }); });
    txt(x,'🐔',me[0]*S+S/2,me[1]*S+S/2,30);
    const l=lanes[me[1]]; if(l && l.cars.some(c=>me[0]*S+8<c.x+c.w&&me[0]*S+S-8>c.x)){ g.best(lv-1); g.over('被車撞了！🚗',`通過 ${lv-1} 關`); return false; } });
});

// 打地鼠
A('mole','打地鼠','🔨','30 秒內敲越多地鼠越好，小心別敲到兔子', g => {
  let score=0, left=30; const st=Array(9).fill(null); g.score(0); g.best();
  const cells = g.grid(3,3,100,(r,c,b)=>{ const i=r*3+c; if(!st[i]) return; if(st[i]==='🐹'){ score+=10; } else score=Math.max(0,score-20); st[i]=null; g.score(score); draw(); b.style.background='#fde68a'; setTimeout(()=>b.style.background='',120); });
  const draw = () => cells.forEach((x,i)=>{ x.textContent=st[i]||'🕳️'; x.style.fontSize='48px'; });
  g.every(450, ()=>{ const i=R(9); if(!st[i]){ st[i]=Math.random()<.15?'🐰':'🐹'; draw(); const k=i; setTimeout(()=>{ if(st[k]){ st[k]=null; draw(); } }, Math.max(500, 1100-score*2)); } });
  g.every(1000, ()=>{ left--; g.info('剩餘 '+left+' 秒'); if(left<=0){ g.stop(); g.best(score); g.over('時間到！','得分 '+score); } });
  draw();
});

// 外星入侵
A('invaders','外星入侵','👽','左右移動、空白鍵（或點擊）射擊，在外星人降落前消滅牠們', g => {
  const W=440,H=500, x=g.canvas(W,H); g.pad(['ArrowLeft',' ','ArrowRight']); const p={x:200,tx:null}; let al=[], dir=1, sp=30, bul=null, eb=[], score=0, lives=3, lv=0;
  const wave = () => { lv++; al=[]; for(let r=0;r<5;r++) for(let c=0;c<9;c++) al.push({x:30+c*40,y:50+r*34,e:['👾','👽','🛸','👾','👽'][r]}); sp=25+lv*10; };
  const fire = () => { if(!bul) bul={x:p.x+16,y:H-50}; }; g.onKey(k=>{ if(k===' ') fire(); });
  g.on(x.canvas,'pointerdown',e=>{ p.tx=g.pos(x.canvas,e).x; fire(); }); g.on(x.canvas,'pointermove',e=>{ p.tx=g.pos(x.canvas,e).x; });
  g.score(0); g.best(); wave();
  g.loop(dt=>{ if(g.keys.ArrowLeft) p.x-=300*dt, p.tx=null; if(g.keys.ArrowRight) p.x+=300*dt, p.tx=null; if(p.tx!=null) p.x+=(p.tx-16-p.x)*Math.min(1,dt*12); p.x=clamp(p.x,0,W-32);
    const v = sp*(1+(45-al.length)/12); let edge=false; al.forEach(a=>{ a.x+=dir*v*dt; if(a.x<10||a.x>W-30) edge=true; }); if(edge){ dir*=-1; al.forEach(a=>{ a.y+=16; a.x+=dir*4; }); }
    if(bul){ bul.y-=500*dt; const h=al.findIndex(a=>bul.x>a.x-4&&bul.x<a.x+30&&bul.y>a.y-14&&bul.y<a.y+14); if(h>=0){ al.splice(h,1); score+=50; g.score(score); bul=null; } else if(bul.y<0) bul=null; }
    if(al.length && Math.random()<dt*(1+lv*.4)){ const a=pick(al); eb.push({x:a.x+12,y:a.y+12}); }
    eb.forEach(b=>b.y+=220*dt); const hitMe = eb.findIndex(b=>b.y>H-50&&b.y<H-20&&b.x>p.x&&b.x<p.x+32); if(hitMe>=0){ eb.splice(hitMe,1); lives--; }
    eb=eb.filter(b=>b.y<H);
    if(!lives || al.some(a=>a.y>H-70)){ g.best(score); g.over('地球淪陷了','得分 '+score); return false; } if(!al.length) wave();
    bg(x,'#020617'); al.forEach(a=>txt(x,a.e,a.x+12,a.y,24)); if(bul){ x.fillStyle='#facc15'; x.fillRect(bul.x-2,bul.y-10,4,12); } eb.forEach(b=>{ x.fillStyle='#f87171'; x.fillRect(b.x-2,b.y,4,10); });
    txt(x,'🔫',p.x+16,H-34,28); txt(x,'❤'.repeat(lives),10,16,14,'#f87171','left'); });
});

// 跳台
A('jumper','跳跳樂','🐸','自動彈跳，左右移動踩著平台往上爬，掉下去就結束', g => {
  const W=360,H=540, x=g.canvas(W,H); const p={x:170,y:400,vy:-600,tx:null}; let pl=[], cam=0, maxH=0; steer(g,x.canvas,p);
  for(let i=0;i<10;i++) pl.push({x:R(W-60),y:H-i*60-20,m:0}); pl[0].x=150; g.best();
  g.loop(dt=>{ if(g.keys.ArrowLeft) p.x-=320*dt, p.tx=null; if(g.keys.ArrowRight) p.x+=320*dt, p.tx=null; if(p.tx!=null) p.x+=(p.tx-p.x)*Math.min(1,dt*8); p.x=(p.x+W)%W;
    p.vy+=1300*dt; const oy=p.y; p.y+=p.vy*dt;
    if(p.vy>0) for(const q of pl){ if(oy+14<=q.y && p.y+14>=q.y && p.x>q.x-10 && p.x<q.x+70){ if(q.b){ q.gone=1; continue; } p.vy=q.s?-1000:-640; p.y=q.y-14; } }
    pl.forEach(q=>{ if(q.m) { q.x+=q.m*dt; if(q.x<0||q.x>W-60) q.m*=-1; } }); pl=pl.filter(q=>!q.gone);
    if(p.y-cam<H*.4) cam=p.y-H*.4; maxH=Math.max(maxH,Math.floor(-cam/10)); g.score(maxH);
    pl=pl.filter(q=>q.y-cam<H+20); while(pl.length<11){ const top=Math.min(...pl.map(q=>q.y)); const hgt=maxH; pl.push({x:R(W-60),y:top-RR(45,70+Math.min(40,hgt/30)),m:Math.random()<Math.min(.4,hgt/2000)?80:0,b:Math.random()<Math.min(.2,hgt/3000),s:Math.random()<.06}); }
    if(p.y-cam>H){ g.best(maxH); g.over('掉下去了！','高度 '+maxH); return false; }
    bg(x,'#e0f2fe'); pl.forEach(q=>{ x.fillStyle=q.b?'#a16207':q.m?'#3b82f6':'#16a34a'; x.fillRect(q.x,q.y-cam,60,10); if(q.s) txt(x,'🌀',q.x+30,q.y-cam-8,16); }); txt(x,'🐸',p.x,p.y-cam,28); });
});

// 疊疊樂
A('stack','疊高塔','🏗️','方塊左右移動，點擊或空白鍵放下，超出的部分會被切掉', g => {
  const W=360,H=540, x=g.canvas(W,H); let st=[{x:80,w:200}], cur={x:0,w:200,d:1}, sp=180, score=0, cam=0, cut=[];
  const drop = () => { if(g.ended) return; const t=st.at(-1), l=Math.max(t.x,cur.x), r=Math.min(t.x+t.w,cur.x+cur.w);
    if(r<=l){ g.best(score); g.over('沒疊到！','高度 '+score); return; }
    if(cur.x<l) cut.push({x:cur.x,w:l-cur.x,y:st.length,vy:0}); if(cur.x+cur.w>r) cut.push({x:r,w:cur.x+cur.w-r,y:st.length,vy:0});
    if(Math.abs(r-l-t.w)<4 && Math.abs(l-t.x)<4){ st.push({x:t.x,w:t.w}); } else st.push({x:l,w:r-l}); score++; g.score(score); sp+=8; cur={x:Math.random()<.5?-st.at(-1).w:W,w:st.at(-1).w,d:1}; cur.d=cur.x<0?1:-1; };
  tapper(g,x.canvas,drop); g.onKey(k=>k===' '&&drop()); g.score(0); g.best();
  g.loop(dt=>{ if(g.ended) return false; cur.x+=cur.d*sp*dt; if(cur.x>W) cur.d=-1; if(cur.x+cur.w<0) cur.d=1;
    const tgt=Math.max(0,st.length-8)*24; cam+=(tgt-cam)*dt*5; bg(x,'#1e1b4b'); const Y = i => H-40-i*24+cam;
    st.forEach((s,i)=>{ x.fillStyle=`hsl(${i*12},70%,55%)`; x.fillRect(s.x,Y(i),s.w,24); });
    x.fillStyle=`hsl(${st.length*12},70%,55%)`; x.fillRect(cur.x,Y(st.length),cur.w,24);
    cut.forEach(c=>{ c.vy+=600*dt; c.y-=c.vy*dt/24; x.globalAlpha=.6; x.fillRect(c.x,Y(c.y),c.w,24); x.globalAlpha=1; }); cut=cut.filter(c=>Y(c.y)<H); });
});

// 下樓梯
A('downstairs','下樓梯','⬇️','左右移動踩著平台往下，別被頂端尖刺刺到，也別掉出底部', g => {
  const W=360,H=540, x=g.canvas(W,H); const p={x:170,y:100,vy:0,tx:null,hp:10}; let pl=[], t=0, floor=0, sp=80; steer(g,x.canvas,p);
  for(let i=0;i<7;i++) pl.push({x:R(W-90),y:150+i*70,k:0}); pl[0].x=140; g.best();
  g.loop(dt=>{ sp+=dt*1.5; if(g.keys.ArrowLeft) p.x-=260*dt, p.tx=null; if(g.keys.ArrowRight) p.x+=260*dt, p.tx=null; if(p.tx!=null) p.x+=clamp(p.tx-p.x,-260*dt,260*dt); p.x=clamp(p.x,10,W-10);
    pl.forEach(q=>q.y-=sp*dt); t+=sp*dt; if(t>70){ t=0; floor++; g.score(floor); pl.push({x:R(W-90),y:H+10,k:Math.random()<.2?1:Math.random()<.1?2:0}); } pl=pl.filter(q=>q.y>-20);
    p.vy+=900*dt; let on=null; const ny=p.y+p.vy*dt;
    for(const q of pl){ if(p.vy>=0 && p.y+14<=q.y+2 && ny+14>=q.y && p.x>q.x-6 && p.x<q.x+96){ on=q; break; } }
    if(on){ p.y=on.y-14; if(!on.hit){ on.hit=1; if(on.k===1) p.hp-=3; else p.hp=Math.min(10,p.hp+1); } if(on.k===2){ p.vy=-450; } else p.vy=0; } else p.y=ny;
    if(p.y<30){ p.hp-=4; p.y=40; p.vy=150; }
    if(p.hp<=0||p.y>H){ g.best(floor); g.over('遊戲結束','到達地下 '+floor+' 層'); return false; }
    bg(x,'#1c1917'); x.fillStyle='#ef4444'; for(let i=0;i<W;i+=20){ x.beginPath(); x.moveTo(i,0); x.lineTo(i+10,22); x.lineTo(i+20,0); x.fill(); }
    pl.forEach(q=>{ x.fillStyle=q.k===1?'#dc2626':q.k===2?'#22c55e':'#a8a29e'; x.fillRect(q.x,q.y,90,10); if(q.k===1) txt(x,'▲▲▲▲▲',q.x+45,q.y-4,12,'#fca5a5'); });
    txt(x,'🙂',p.x,p.y,26); x.fillStyle='#334155'; x.fillRect(10,H-20,100,10); x.fillStyle='#22c55e'; x.fillRect(10,H-20,p.hp*10,10); });
});

// 射氣球
A('balloon','射氣球','🎈','點擊升空的氣球，30 秒內射破越多越好', g => {
  const W=400,H=500, x=g.canvas(W,H); let b=[], t=0, score=0, left=30; g.score(0); g.best();
  g.on(x.canvas,'pointerdown',e=>{ const p=g.pos(x.canvas,e); for(const o of b){ if(Math.hypot(o.x-p.x,o.y-p.y)<o.r+6){ o.d=1; score+=o.r<20?30:10; g.score(score); break; } } });
  g.every(1000,()=>{ left--; g.info('剩餘 '+left+' 秒'); });
  g.loop(dt=>{ t-=dt; if(t<=0){ t=.35; b.push({x:RR(30,W-30),y:H+30,r:RR(14,30),v:RR(80,180),c:`hsl(${R(360)},80%,60%)`,ph:Math.random()*6}); }
    b.forEach(o=>{ o.y-=o.v*dt; o.ph+=dt*2; }); b=b.filter(o=>!o.d&&o.y>-40);
    bg(x,'#bae6fd'); b.forEach(o=>{ const X=o.x+Math.sin(o.ph)*10; x.strokeStyle='#475569'; x.beginPath(); x.moveTo(X,o.y+o.r); x.lineTo(X,o.y+o.r+20); x.stroke(); x.fillStyle=o.c; x.beginPath(); x.ellipse(X,o.y,o.r*.85,o.r,0,0,7); x.fill(); o.x2=X; });
    if(left<=0){ g.best(score); g.over('時間到！','得分 '+score); return false; } });
});

// 投籃
A('hoops','投籃高手','🏀','從球往後拖曳再放開來投籃（像彈弓），10 球內投進越多越好', g => {
  const W=480,H=360, x=g.canvas(W,H); let ball, hoop, drag=null, shots=10, score=0;
  const reset = () => { ball={x:80,y:280,vx:0,vy:0,fly:false,scored:false}; };
  const newHoop = () => { hoop={x:RR(300,420),y:RR(100,220)}; };
  reset(); newHoop(); g.score(0); g.best();
  g.on(x.canvas,'pointerdown',e=>{ if(!ball.fly) drag=g.pos(x.canvas,e); });
  g.on(x.canvas,'pointermove',e=>{ if(drag) drag.c=g.pos(x.canvas,e); });
  g.on(window,'pointerup',()=>{ if(!drag||!drag.c){ drag=null; return; } const dx=drag.x-drag.c.x, dy=drag.y-drag.c.y; ball.vx=dx*4; ball.vy=dy*4; ball.fly=true; drag=null; shots--; });
  g.loop(dt=>{ if(ball.fly){ const oy=ball.y; ball.vy+=600*dt; ball.x+=ball.vx*dt; ball.y+=ball.vy*dt;
      if(!ball.scored && oy<hoop.y && ball.y>=hoop.y && ball.x>hoop.x+6 && ball.x<hoop.x+54){ ball.scored=true; score++; g.score(score); }
      [[hoop.x,hoop.y],[hoop.x+60,hoop.y]].forEach(([rx,ry])=>{ const d=Math.hypot(ball.x-rx,ball.y-ry); if(d<14){ const nx=(ball.x-rx)/d, ny=(ball.y-ry)/d, dot=ball.vx*nx+ball.vy*ny; if(dot<0){ ball.vx-=1.6*dot*nx; ball.vy-=1.6*dot*ny; } } });
      if(ball.x>hoop.x+60&&ball.x<hoop.x+74&&ball.y<hoop.y&&ball.y>hoop.y-90) { ball.vx=-Math.abs(ball.vx)*.6; }
      if(ball.y>H+20||ball.x>W+20||ball.x<-20){ if(ball.scored) newHoop(); reset(); if(shots<=0){ g.best(score); g.over('投完了！',`10 投 ${score} 中`); return false; } } }
    bg(x,'#1e293b'); x.fillStyle='#78350f'; x.fillRect(0,H-40,W,40); x.fillStyle='#e2e8f0'; x.fillRect(hoop.x+62,hoop.y-90,8,110);
    x.strokeStyle='#ef4444'; x.lineWidth=4; x.beginPath(); x.moveTo(hoop.x,hoop.y); x.lineTo(hoop.x+60,hoop.y); x.stroke();
    x.strokeStyle='#e2e8f0'; x.lineWidth=1; for(let i=0;i<=6;i++){ x.beginPath(); x.moveTo(hoop.x+i*10,hoop.y); x.lineTo(hoop.x+15+i*5,hoop.y+30); x.stroke(); }
    txt(x,'🏀',ball.x,ball.y,26);
    if(drag&&drag.c){ x.strokeStyle='#facc15'; x.setLineDash([5,5]); x.beginPath(); let px=ball.x, py=ball.y, vx=(drag.x-drag.c.x)*4, vy=(drag.y-drag.c.y)*4; x.moveTo(px,py); for(let k=0;k<20;k++){ vy+=600*.03; px+=vx*.03; py+=vy*.03; x.lineTo(px,py); } x.stroke(); x.setLineDash([]); }
    txt(x,'剩 '+shots+' 球',10,20,16,'#e2e8f0','left'); });
});

// 射箭
A('archery','射箭比賽','🏹','往後拖曳瞄準再放開射箭，注意風向！共 6 箭', g => {
  const W=520,H=340, x=g.canvas(W,H); let a, tgt, drag=null, left=6, score=0, wind;
  const reset = () => { a={x:50,y:250,vx:0,vy:0,fly:false,stuck:false}; tgt={x:RR(380,480),y:RR(80,240)}; wind=RR(-60,60); };
  reset(); g.score(0); g.best();
  g.on(x.canvas,'pointerdown',e=>{ if(!a.fly&&!a.stuck) drag=g.pos(x.canvas,e); });
  g.on(x.canvas,'pointermove',e=>{ if(drag) drag.c=g.pos(x.canvas,e); });
  g.on(window,'pointerup',()=>{ if(!drag||!drag.c){ drag=null; return; } a.vx=(drag.x-drag.c.x)*5; a.vy=(drag.y-drag.c.y)*5; a.fly=true; drag=null; left--; });
  g.loop(dt=>{ if(a.fly){ const ox=a.x; a.vy+=400*dt; a.vx+=wind*dt; a.x+=a.vx*dt; a.y+=a.vy*dt;
      if(ox<tgt.x && a.x>=tgt.x && Math.abs(a.y-tgt.y)<50){ a.fly=false; a.stuck=true; a.x=tgt.x; const d=Math.abs(a.y-tgt.y); const pts=d<6?10:d<14?8:d<24?6:d<36?4:2; score+=pts; g.score(score); g.info('+'+pts+' 分'); g.after(900, next); }
      else if(a.y>H||a.x>W||a.x<0){ a.fly=false; g.info('脫靶！'); g.after(600, next); } }
    bg(x,'#bbf7d0'); x.fillStyle='#65a30d'; x.fillRect(0,H-30,W,30);
    [50,36,24,14,6].forEach((r,i)=>{ x.fillStyle=['#fff','#111','#3b82f6','#ef4444','#facc15'][i]; x.fillRect(tgt.x-4,tgt.y-r,10,r*2); });
    const ang = a.fly ? Math.atan2(a.vy,a.vx) : drag&&drag.c ? Math.atan2(drag.y-drag.c.y, drag.x-drag.c.x) : 0;
    x.save(); x.translate(a.x,a.y); x.rotate(ang); x.strokeStyle='#78350f'; x.lineWidth=3; x.beginPath(); x.moveTo(-30,0); x.lineTo(0,0); x.stroke(); x.fillStyle='#475569'; x.beginPath(); x.moveTo(0,-4); x.lineTo(8,0); x.lineTo(0,4); x.fill(); x.restore();
    txt(x,`風 ${wind>0?'→':'←'} ${Math.abs(wind)}　剩 ${left} 箭`,10,18,15,'#14532d','left'); });
  const next = () => { if(left<=0){ g.best(score); g.over('比賽結束','總分 '+score); } else { reset(); g.info(''); } };
});

// 直升機洞穴
A('cave','洞穴飛行','🚁','按住滑鼠/空白鍵上升，放開下降，閃避洞穴牆壁', g => {
  const W=520,H=320, x=g.canvas(W,H); let y=160, v=0, hold=false, cols=[], top=40, gap=200, dist=0, obs=[];
  for(let i=0;i<=W/10+1;i++) cols.push([top,gap]);
  g.on(x.canvas,'pointerdown',()=>hold=true); g.on(window,'pointerup',()=>hold=false); g.best();
  let off=0;
  g.loop(dt=>{ const up = hold || g.keys[' ']; v += (up?-700:600)*dt; v=clamp(v,-300,300); y+=v*dt;
    dist+=200*dt; const sh=200*dt;
    off+=sh; while(off>=10){ off-=10; cols.shift(); top=clamp(top+RR(-12,12),10,H-gap-10); gap=Math.max(120,200-dist/40); cols.push([top,gap]); if(Math.random()<.04) obs.push({x:W,y:top+RR(20,gap-60)}); }
    obs.forEach(o=>o.x-=sh); obs=obs.filter(o=>o.x>-20);
    bg(x,'#0f172a'); x.fillStyle='#16a34a'; cols.forEach((c,i)=>{ const X=i*10-off; x.fillRect(X,0,11,c[0]); x.fillRect(X,c[0]+c[1],11,H); });
    obs.forEach(o=>{ x.fillStyle='#16a34a'; x.fillRect(o.x,o.y,16,50); });
    txt(x,'🚁',100,y,28); g.score(Math.floor(dist/10));
    const c=cols[10]; const dead = y-10<c[0]||y+10>c[0]+c[1]||obs.some(o=>100+12>o.x&&100-12<o.x+16&&y+10>o.y&&y-10<o.y+50);
    if(dead){ const s=Math.floor(dist/10); g.best(s); g.over('撞牆了！','距離 '+s); return false; } });
});

// 賽車閃避
A('racer','賽車閃避','🏎️','←→ 或點擊左右切換車道，閃過前方車輛', g => {
  const W=300,H=520, x=g.canvas(W,H); let lane=1, cx=150, cars=[], t=0, sp=260, dist=0, off=0;
  g.onKey(k=>{ if(k==='ArrowLeft') lane=Math.max(0,lane-1); if(k==='ArrowRight') lane=Math.min(2,lane+1); });
  g.on(x.canvas,'pointerdown',e=>{ const p=g.pos(x.canvas,e); if(p.x<W/2) lane=Math.max(0,lane-1); else lane=Math.min(2,lane+1); }); g.pad(['ArrowLeft','ArrowRight']); g.best();
  g.loop(dt=>{ sp+=dt*8; dist+=sp*dt/10; t-=dt; off=(off+sp*dt)%40;
    if(t<=0){ t=Math.max(.35,1.1-dist/4000); const L=R(3); cars.push({l:L,y:-80,e:pick(['🚗','🚙','🚕','🚌'])}); if(Math.random()<.25) cars.push({l:(L+1+R(2))%3,y:-80-RR(0,40),e:'🚓'}); }
    cars.forEach(c=>c.y+=sp*.6*dt); cars=cars.filter(c=>c.y<H+60); cx += (50+lane*100-cx)*Math.min(1,dt*12);
    bg(x,'#374151'); x.fillStyle='#e5e7eb'; for(let k=-1;k<14;k++){ x.fillRect(98,k*40+off,4,22); x.fillRect(198,k*40+off,4,22); }
    cars.forEach(c=>{ x.save(); x.translate(50+c.l*100,c.y); x.rotate(Math.PI/2); txt(x,c.e,0,0,46); x.restore(); });
    x.save(); x.translate(cx,H-70); x.rotate(-Math.PI/2); txt(x,'🏎️',0,0,46); x.restore(); g.score(Math.floor(dist));
    if(cars.some(c=>Math.abs(50+c.l*100-cx)<40&&Math.abs(c.y-(H-70))<50)){ const s=Math.floor(dist); g.best(s); g.over('撞車了！💥','距離 '+s); return false; } });
});
})();
