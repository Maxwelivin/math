// ===== 動作類（二）=====
(function(){

// 切水果
A('slice','切水果','🍉','滑動滑鼠/手指劃過水果把它切開，避開炸彈，漏掉 3 個就結束', g => {
  const W=420,H=480, x=g.canvas(W,H); let it=[], trail=[], t=0, score=0, miss=0, down=false; g.score(0); g.best();
  g.on(x.canvas,'pointerdown',e=>{ down=true; trail=[g.pos(x.canvas,e)]; }); g.on(window,'pointerup',()=>{ down=false; trail=[]; });
  g.on(x.canvas,'pointermove',e=>{ if(!down&&e.pointerType!=='mouse') return; const p=g.pos(x.canvas,e); p.t=performance.now(); trail.push(p); if(trail.length>8) trail.shift();
    const q=trail.at(-2); if(!q) return; for(const o of it){ if(o.cut) continue; const d=Math.hypot(o.x-p.x,o.y-p.y); if(d<30 && Math.hypot(p.x-q.x,p.y-q.y)>4){ o.cut=1; o.ct=0;
        if(o.e==='💣'){ g.best(score); g.over('切到炸彈！💥','得分 '+score); } else { score+=10; g.score(score); } } } });
  g.loop(dt=>{ if(g.ended) return false; t-=dt; if(t<=0){ t=Math.max(.4,1.2-score/800); for(let k=RR(1,3);k>0;k--) it.push({x:RR(60,W-60),y:H+20,vx:RR(-80,80),vy:-RR(480,620),e:Math.random()<.15?'💣':pick(['🍉','🍎','🍊','🍍','🥝','🍋']),r:0}); }
    it.forEach(o=>{ o.vy+=600*dt; o.x+=o.vx*dt; o.y+=o.vy*dt; o.r+=dt*3; if(o.cut) o.ct+=dt; if(o.y>H+40&&!o.cut&&!o.gone){ o.gone=1; if(o.e!=='💣') miss++; } });
    it=it.filter(o=>!o.gone&&!(o.cut&&o.ct>.4)); if(miss>=3){ g.best(score); g.over('漏掉太多了','得分 '+score); return false; }
    bg(x,'#422006'); it.forEach(o=>{ if(o.cut){ x.globalAlpha=1-o.ct*2.5; txt(x,o.e,o.x-o.ct*80,o.y,40); txt(x,o.e,o.x+o.ct*80,o.y,40); x.globalAlpha=1; } else { x.save(); x.translate(o.x,o.y); x.rotate(o.r); txt(x,o.e,0,0,44); x.restore(); } });
    if(trail.length>1){ x.strokeStyle='#fff'; x.lineWidth=4; x.beginPath(); trail.forEach((p,i)=>i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y)); x.stroke(); }
    txt(x,'✖'.repeat(miss)+'○'.repeat(3-miss),W-10,18,16,'#f87171','right'); });
});

// 泡泡龍
A('bubble','泡泡射擊','🫧','瞄準後點擊發射泡泡，3 個以上同色相連就會消除', g => {
  const W=400,H=520, Rr=20, COLS=10, x=g.canvas(W,H); const C=['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7'];
  let grid=[], shot=null, cur=R(5), nxt=R(5), aim=-Math.PI/2, score=0, n=0;
  const pos = (r,c) => [Rr+c*Rr*2+(r%2?Rr:0), Rr+r*Rr*1.74];
  for(let r=0;r<6;r++){ grid[r]=[]; for(let c=0;c<COLS-(r%2);c++) grid[r][c]=R(5); }
  const nb = (r,c) => (r%2 ? [[r,c-1],[r,c+1],[r-1,c],[r-1,c+1],[r+1,c],[r+1,c+1]] : [[r,c-1],[r,c+1],[r-1,c-1],[r-1,c],[r+1,c-1],[r+1,c]]).filter(([a,b])=>a>=0&&b>=0&&grid[a]&&b<COLS-(a%2));
  const at = (r,c) => grid[r]?.[c];
  g.on(x.canvas,'pointermove',e=>{ const p=g.pos(x.canvas,e); aim=clamp(Math.atan2(p.y-(H-30),p.x-W/2),-Math.PI+.15,-.15); });
  g.on(x.canvas,'pointerdown',e=>{ const p=g.pos(x.canvas,e); aim=clamp(Math.atan2(p.y-(H-30),p.x-W/2),-Math.PI+.15,-.15); if(!shot){ shot={x:W/2,y:H-30,vx:Math.cos(aim)*700,vy:Math.sin(aim)*700,c:cur}; cur=nxt; nxt=R(5); } });
  g.score(0); g.best();
  const snap = () => { let best=null, bd=1e9; for(let r=0;r<grid.length+1;r++){ if(!grid[r]) grid[r]=[]; for(let c=0;c<COLS-(r%2);c++){ if(at(r,c)!=null) continue; const [px,py]=pos(r,c), d=Math.hypot(px-shot.x,py-shot.y); if(d<bd&&(r===0||nb(r,c).some(([a,b])=>at(a,b)!=null))){ bd=d; best=[r,c]; } } }
    if(!best) return; const [r,c]=best; grid[r][c]=shot.c; shot=null;
    const st=[[r,c]], same=new Set([r+','+c]); while(st.length){ const [a,b]=st.pop(); nb(a,b).forEach(([p,q])=>{ const k=p+','+q; if(!same.has(k)&&at(p,q)===grid[r][c]){ same.add(k); st.push([p,q]); } }); }
    if(same.size>=3){ same.forEach(k=>{ const [a,b]=k.split(',').map(Number); grid[a][b]=null; }); score+=same.size*10;
      const keep=new Set(), q=[]; (grid[0]||[]).forEach((v,c2)=>{ if(v!=null){ keep.add('0,'+c2); q.push([0,c2]); } });
      while(q.length){ const [a,b]=q.pop(); nb(a,b).forEach(([p,q2])=>{ const k=p+','+q2; if(!keep.has(k)&&at(p,q2)!=null){ keep.add(k); q.push([p,q2]); } }); }
      grid.forEach((row,a)=>row.forEach((v,b)=>{ if(v!=null&&!keep.has(a+','+b)){ grid[a][b]=null; score+=20; } })); g.score(score); }
    n++; if(n%6===0){ grid.unshift(range(COLS-((grid.length+1)%2)).map(()=>R(5))); grid = grid.map((row,a)=>range(COLS-(a%2)).map(c2=>row[c2]??null)); for(let r2=0;r2<grid.length;r2++){} }
    const filled = grid.flat().filter(v=>v!=null).length; if(!filled){ g.best(score); g.over('全部清空！🎉','得分 '+score); }
    if(grid.some((row,a)=>row.some(v=>v!=null)&&pos(a,0)[1]>H-80)){ g.best(score); g.over('泡泡到底了','得分 '+score); } };
  g.loop(dt=>{ if(g.ended) return false; if(shot){ for(let k=0;k<4;k++){ shot.x+=shot.vx*dt/4; shot.y+=shot.vy*dt/4; if(shot.x<Rr||shot.x>W-Rr) shot.vx*=-1;
        if(shot.y<Rr || grid.some((row,a)=>row.some((v,b)=>v!=null&&Math.hypot(pos(a,b)[0]-shot.x,pos(a,b)[1]-shot.y)<Rr*1.8))){ snap(); break; } } }
    bg(x); grid.forEach((row,a)=>row.forEach((v,b)=>{ if(v!=null){ const [px,py]=pos(a,b); circ(x,px,py,Rr-1,C[v]); } }));
    x.fillStyle='#ef444433'; x.fillRect(0,H-80,W,2);
    x.strokeStyle='#ffffff55'; x.setLineDash([6,6]); x.beginPath(); x.moveTo(W/2,H-30); x.lineTo(W/2+Math.cos(aim)*120,H-30+Math.sin(aim)*120); x.stroke(); x.setLineDash([]);
    circ(x,W/2,H-30,Rr-1,C[cur]); circ(x,W/2+60,H-20,10,C[nxt]); if(shot) circ(x,shot.x,shot.y,Rr-1,C[shot.c]); });
});

// 彈珠消磚
A('ballz','彈珠消磚','⚪','瞄準後放開，一次射出一排彈珠，把數字磚打到 0；磚塊碰到底部就輸', g => {
  const W=360,H=520, S=51, x=g.canvas(W,H); let bricks=[], balls=[], n=1, lvl=1, sx=W/2, aiming=null, shooting=false, toLaunch=0, lt=0, nx=null, ang=0, plus=[];
  const addRow = () => { bricks.forEach(b=>b.r++); plus.forEach(p=>p.r++); const cs=shuffle(range(7)); const k=RR(1,4); cs.slice(0,k).forEach(c=>bricks.push({r:1,c,hp:Math.random()<.3?lvl*2:lvl})); plus.push({r:1,c:cs[k]}); };
  addRow(); g.best();
  g.on(x.canvas,'pointerdown',e=>{ if(!shooting) aiming=g.pos(x.canvas,e); });
  g.on(x.canvas,'pointermove',e=>{ if(aiming) aiming=g.pos(x.canvas,e); });
  g.on(window,'pointerup',()=>{ if(!aiming) return; const a=Math.atan2(aiming.y-(H-20),aiming.x-sx); aiming=null; if(a>-0.1||a<-Math.PI+0.1) return; ang=a; shooting=true; toLaunch=n; lt=0; nx=null; });
  g.loop(dt=>{ if(shooting){ lt-=dt; if(toLaunch&&lt<=0){ lt=.07; toLaunch--; balls.push({x:sx,y:H-20,vx:Math.cos(ang)*520,vy:Math.sin(ang)*520}); }
      for(const b of balls){ for(let k=0;k<3;k++){ b.x+=b.vx*dt/3; b.y+=b.vy*dt/3; if(b.x<6){b.x=6;b.vx=Math.abs(b.vx);} if(b.x>W-6){b.x=W-6;b.vx=-Math.abs(b.vx);} if(b.y<6){b.y=6;b.vy=Math.abs(b.vy);}
          for(const q of bricks){ const bx=q.c*S+2, by=q.r*S+2; if(b.x>bx-6&&b.x<bx+S-4+6&&b.y>by-6&&b.y<by+S-4+6){ q.hp--; const ox=Math.min(Math.abs(b.x-bx+6),Math.abs(b.x-(bx+S-4)-6)), oy=Math.min(Math.abs(b.y-by+6),Math.abs(b.y-(by+S-4)-6)); if(ox<oy) b.vx*=-1; else b.vy*=-1; b.x+=b.vx*dt/3; b.y+=b.vy*dt/3; break; } }
          bricks=bricks.filter(q=>q.hp>0); plus=plus.filter(p=>{ if(Math.hypot(b.x-(p.c*S+S/2),b.y-(p.r*S+S/2))<20){ n++; return false; } return true; });
          if(b.y>H-20&&b.vy>0){ b.done=1; if(nx==null) nx=b.x; break; } } }
      balls=balls.filter(b=>!b.done); if(!toLaunch&&!balls.length){ shooting=false; sx=clamp(nx??sx,10,W-10); lvl++; addRow(); g.score(lvl-1);
        if(bricks.some(q=>q.r>=9)){ g.best(lvl-1); g.over('磚塊到底了！','過了 '+(lvl-1)+' 回合'); return false; } } }
    bg(x); bricks.forEach(q=>{ x.fillStyle=`hsl(${(q.hp*13)%360},65%,50%)`; x.fillRect(q.c*S+2,q.r*S+2,S-4,S-4); txt(x,q.hp,q.c*S+S/2,q.r*S+S/2,18); });
    plus.forEach(p=>{ x.strokeStyle='#4ade80'; x.lineWidth=3; x.beginPath(); x.arc(p.c*S+S/2,p.r*S+S/2,10,0,7); x.stroke(); txt(x,'+',p.c*S+S/2,p.r*S+S/2,16,'#4ade80'); });
    balls.forEach(b=>circ(x,b.x,b.y,6,'#fff')); if(!shooting) circ(x,sx,H-20,6,'#fff'); txt(x,'×'+n,sx,H-6,12,'#94a3b8');
    if(aiming){ const a=Math.atan2(aiming.y-(H-20),aiming.x-sx); x.strokeStyle='#ffffff88'; x.setLineDash([4,6]); x.beginPath(); x.moveTo(sx,H-20); x.lineTo(sx+Math.cos(a)*300,H-20+Math.sin(a)*300); x.stroke(); x.setLineDash([]); } });
  g.div('hint','在畫面上按住拖曳瞄準，放開發射');
});

// 重力翻轉
A('gravity','重力翻轉','🔃','點擊或空白鍵翻轉重力，在天花板與地面之間閃避障礙', g => {
  const W=520,H=300, x=g.canvas(W,H); let y=H-40, v=0, gdir=1, obs=[], t=0, sp=260, dist=0;
  const flip = () => { gdir*=-1; }; tapper(g,x.canvas,flip); g.onKey(k=>k===' '&&flip()); g.best();
  g.loop(dt=>{ sp+=dt*6; dist+=sp*dt/10; v+=gdir*1600*dt; y+=v*dt; if(y>H-40){ y=H-40; v=0; } if(y<40){ y=40; v=0; }
    t-=dt; if(t<=0){ t=RR(6,12)/10*(300/sp)+.3; const top=R(2); obs.push({x:W,top,h:RR(40,110)}); }
    obs.forEach(o=>o.x-=sp*dt); obs=obs.filter(o=>o.x>-40);
    bg(x,'#1e1b4b'); x.fillStyle='#6366f1'; x.fillRect(0,0,W,24); x.fillRect(0,H-24,W,24);
    obs.forEach(o=>{ x.fillStyle='#f43f5e'; x.fillRect(o.x,o.top?24:H-24-o.h,30,o.h); });
    x.fillStyle='#facc15'; x.fillRect(80,y-16,32,32); g.score(Math.floor(dist));
    if(obs.some(o=>hit({x:80,y:y-16,w:32,h:32},{x:o.x,y:o.top?24:H-24-o.h,w:30,h:o.h}))){ const s=Math.floor(dist); g.best(s); g.over('撞到了！','距離 '+s); return false; } });
});

// 蓄力跳躍
A('charge','蓄力跳躍','🦘','按住蓄力、放開跳躍，剛好落在下一個平台上', g => {
  const W=480,H=320, x=g.canvas(W,H); let pl, me, charge=0, holding=false, jump=null, score=0, cam=0;
  const init = () => { pl=[{x:40,w:70},{x:220,w:60}]; me={x:75,y:0}; };
  init(); g.score(0); g.best();
  const start = () => { if(!jump&&!g.ended){ holding=true; charge=0; } }, release = () => { if(holding){ holding=false; jump={vx:charge*380,vy:-420,t:0,x0:me.x}; } };
  g.on(x.canvas,'pointerdown',start); g.on(window,'pointerup',release); g.on(window,'keydown',e=>e.key===' '&&start()); g.on(window,'keyup',e=>e.key===' '&&release());
  g.loop(dt=>{ if(holding) charge=Math.min(1.5,charge+dt*.9);
    if(jump){ jump.t+=dt; jump.vy+=1000*dt; me.x+=jump.vx*dt; me.y+=jump.vy*dt;
      if(me.y>=0){ me.y=0; const p=pl.find(q=>me.x>=q.x&&me.x<=q.x+q.w); jump=null;
        if(!p){ g.best(score); g.over('掉下去了！','得分 '+score); return false; }
        if(p===pl.at(-1)){ const ctr=Math.abs(me.x-(p.x+p.w/2))<8; score+=ctr?2:1; g.score(score); const last=pl.at(-1); pl.push({x:last.x+last.w+RR(60,200),w:RR(30,70)}); if(pl.length>4) pl.shift(); } } }
    cam += (me.x-120-cam)*Math.min(1,dt*4);
    bg(x,'#ecfeff'); pl.forEach(q=>{ x.fillStyle='#0e7490'; x.fillRect(q.x-cam,H-100,q.w,100); x.fillStyle='#facc15'; x.fillRect(q.x-cam+q.w/2-3,H-100,6,4); });
    const sq = holding? 1-charge*.25 : 1; x.fillStyle='#e11d48'; x.fillRect(me.x-cam-10,H-100+me.y-30*sq,20,30*sq);
    if(holding){ x.fillStyle='#334155'; x.fillRect(20,20,150,10); x.fillStyle='#f97316'; x.fillRect(20,20,charge/1.5*150,10); } });
});

// 環繞閃避
A('orbit','軌道閃避','🪐','點擊或空白鍵切換內外軌道，閃避迎面而來的障礙', g => {
  const W=400,H=400, x=g.canvas(W,H); let a=0, outer=true, rr=150, obs=[], t=0, time=0;
  const sw = () => outer=!outer; tapper(g,x.canvas,sw); g.onKey(k=>k===' '&&sw()); g.best();
  g.loop(dt=>{ time+=dt; const sp=1.6+time/40; a+=sp*dt; rr += ((outer?150:100)-rr)*Math.min(1,dt*14);
    t-=dt; if(t<=0){ t=Math.max(.35,1-time/60); obs.push({a:a+Math.PI*1.3, o:Math.random()<.5}); }
    obs=obs.filter(o=>((o.a-a)%(Math.PI*2)+Math.PI*2)%(Math.PI*2) > .05 || Math.abs(o.a-a)<Math.PI);
    bg(x,'#0f172a'); x.strokeStyle='#334155'; x.lineWidth=2; [150,100].forEach(r=>{ x.beginPath(); x.arc(200,200,r,0,7); x.stroke(); });
    circ(x,200,200,30,'#f59e0b');
    let dead=false; obs.forEach(o=>{ const r=o.o?150:100, ox=200+Math.cos(o.a)*r, oy=200+Math.sin(o.a)*r; circ(x,ox,oy,10,'#ef4444'); if(Math.hypot(ox-(200+Math.cos(a)*rr),oy-(200+Math.sin(a)*rr))<20) dead=true; });
    obs=obs.filter(o=>o.a-a>-0.5);
    circ(x,200+Math.cos(a)*rr,200+Math.sin(a)*rr,11,'#38bdf8'); g.score(time.toFixed(1)+' 秒');
    if(dead){ const s=+time.toFixed(1); g.best(s); g.over('撞到了！','撐了 '+s+' 秒'); return false; } });
});

// 大魚吃小魚
A('eatfish','大魚吃小魚','🐟','移動滑鼠/手指（或方向鍵）控制小魚，吃比你小的魚長大，避開大魚', g => {
  const W=480,H=400, x=g.canvas(W,H); const me={x:240,y:200,r:12,tx:240,ty:200}; let fish=[], t=0, score=0;
  g.on(x.canvas,'pointermove',e=>{ const p=g.pos(x.canvas,e); me.tx=p.x; me.ty=p.y; }); g.on(x.canvas,'pointerdown',e=>{ const p=g.pos(x.canvas,e); me.tx=p.x; me.ty=p.y; });
  g.score(0); g.best();
  g.loop(dt=>{ const kx=(g.keys.ArrowRight?1:0)-(g.keys.ArrowLeft?1:0), ky=(g.keys.ArrowDown?1:0)-(g.keys.ArrowUp?1:0); if(kx||ky){ me.tx=me.x+kx*60; me.ty=me.y+ky*60; }
    const dx=me.tx-me.x, dy=me.ty-me.y, d=Math.hypot(dx,dy); if(d>2){ const s=Math.min(d,220*dt); me.x+=dx/d*s; me.y+=dy/d*s; me.f=dx<0; }
    me.x=clamp(me.x,0,W); me.y=clamp(me.y,0,H);
    t-=dt; if(t<=0){ t=.5; const l=Math.random()<.5; fish.push({x:l?-40:W+40,y:RR(20,H-20),r:Math.max(5,me.r*(.4+Math.random()*1.3)),vx:(l?1:-1)*RR(40,130)}); }
    fish.forEach(f=>f.x+=f.vx*dt); fish=fish.filter(f=>f.x>-60&&f.x<W+60);
    for(const f of fish){ if(Math.hypot(f.x-me.x,f.y-me.y)<f.r+me.r*.8){ if(f.r<me.r){ f.d=1; me.r=Math.min(60,me.r+f.r*.12); score+=Math.round(f.r); g.score(score); } else { g.best(score); g.over('被吃掉了！🦈','得分 '+score); return false; } } }
    fish=fish.filter(f=>!f.d);
    bg(x,'#075985'); fish.forEach(f=>{ x.save(); x.translate(f.x,f.y); if(f.vx>0) x.scale(-1,1); txt(x,f.r<me.r?'🐟':'🐡',0,0,f.r*2); x.restore(); });
    x.save(); x.translate(me.x,me.y); if(!me.f) x.scale(-1,1); txt(x,'🐠',0,0,me.r*2); x.restore(); });
});

// 空氣曲棍球
A('hockey','空氣曲棍球','🥅','拖曳你的球拍（下方）把冰球打進上方球門，先得 5 分獲勝', g => {
  const W=340,H=520, x=g.canvas(W,H); const me={x:170,y:440,px:170,py:440}, ai={x:170,y:80}; let pk, s=[0,0];
  const reset = d => pk={x:170,y:d>0?300:220,vx:0,vy:0};
  reset(1);
  g.on(x.canvas,'pointermove',e=>{ const p=g.pos(x.canvas,e); me.x=clamp(p.x,25,W-25); me.y=clamp(p.y,H/2+25,H-25); });
  g.on(x.canvas,'touchmove',e=>e.preventDefault(),{passive:false});
  g.loop(dt=>{ const mvx=(me.x-me.px)/dt, mvy=(me.y-me.py)/dt; me.px=me.x; me.py=me.y;
    const tx = pk.y<H/2 ? pk.x : 170, ty = pk.y<H/2 ? Math.min(pk.y-20, H/2-25) : 80; ai.x+=clamp(tx-ai.x,-220*dt,220*dt); ai.y+=clamp(ty-ai.y,-220*dt,220*dt); ai.y=clamp(ai.y,25,H/2-25);
    pk.x+=pk.vx*dt; pk.y+=pk.vy*dt; pk.vx*=.995; pk.vy*=.995;
    if(pk.x<14||pk.x>W-14){ pk.vx*=-1; pk.x=clamp(pk.x,14,W-14); }
    if(pk.y<14||pk.y>H-14){ if(pk.x>110&&pk.x<230){ s[pk.y<14?0:1]++; if(s[0]>=5||s[1]>=5){ g.over(s[0]>s[1]?'你贏了！🎉':'電腦贏了',`${s[0]} : ${s[1]}`); return false; } reset(pk.y<14?-1:1); } else { pk.vy*=-1; pk.y=clamp(pk.y,14,H-14); } }
    [[me,mvx,mvy],[ai,0,0]].forEach(([m,vx,vy])=>{ const dx=pk.x-m.x, dy=pk.y-m.y, d=Math.hypot(dx,dy); if(d<38&&d>0){ const nx=dx/d, ny=dy/d; pk.x=m.x+nx*38; pk.y=m.y+ny*38; const rel=(pk.vx-vx)*nx+(pk.vy-vy)*ny; if(rel<0){ pk.vx-=2*rel*nx; pk.vy-=2*rel*ny; } const sp=Math.hypot(pk.vx,pk.vy); if(sp>900){ pk.vx*=900/sp; pk.vy*=900/sp; } if(m===ai&&sp<200){ pk.vy+=200; } } });
    bg(x,'#e0f2fe'); x.strokeStyle='#ef4444'; x.lineWidth=2; x.beginPath(); x.moveTo(0,H/2); x.lineTo(W,H/2); x.stroke(); x.beginPath(); x.arc(W/2,H/2,50,0,7); x.stroke();
    x.fillStyle='#1e293b'; x.fillRect(110,0,120,6); x.fillRect(110,H-6,120,6);
    circ(x,pk.x,pk.y,14,'#111'); circ(x,me.x,me.y,24,'#2563eb'); circ(x,ai.x,ai.y,24,'#dc2626');
    txt(x,s[1],20,H/2-20,24,'#dc2626','left'); txt(x,s[0],20,H/2+20,24,'#2563eb','left'); });
});

// 點球大戰
A('penalty','點球大戰','⚽','選擇射門方向，守門員會猜方向撲救。輪流 5 球，你也要當守門員！', g => {
  let round=0, me=0, cpu=0, phase='shoot'; const big=g.div('big','🥅'); big.style.fontSize='3rem'; const msg=g.div('msg'); const row=g.div('row');
  const dirs=['↖ 左上','↑ 中間','↗ 右上','↙ 左下','↘ 右下'];
  const draw = () => { row.innerHTML=''; msg.textContent = phase==='shoot' ? `第 ${round+1} 輪：你射門，選方向` : `換你守門，猜電腦射哪裡`; g.info(`你 ${me} : ${cpu} 電腦`);
    dirs.forEach((d,i)=>g.button(d, ()=>act(i), 'opt', row)); };
  const act = i => { const c=R(5); if(phase==='shoot'){ const goal = c!==i || Math.random()<.15; if(goal) me++; big.textContent = goal?'⚽ 進球！':'🧤 被撲出！'; phase='keep'; }
    else { const goal = c!==i; if(goal) cpu++; big.textContent = goal?`電腦射${dirs[c].slice(2)}，進球`:'🧤 你撲出了！'; phase='shoot'; round++; }
    if(round>=5 && phase==='shoot' && me!==cpu){ draw(); return g.over(me>cpu?'你贏了！🏆':'電腦贏了',`${me} : ${cpu}`); }
    if(round>=5 && phase==='shoot') msg.textContent='平手，驟死賽！'; draw(); };
  draw();
});

// 打靶場
A('gallery','移動打靶','🎯','點擊移動中的靶子，越小越遠分數越高。共 20 發子彈', g => {
  const W=480,H=360, x=g.canvas(W,H); let tg=[], ammo=20, score=0, t=0, fx=[]; g.score(0); g.best();
  g.on(x.canvas,'pointerdown',e=>{ if(ammo<=0) return; ammo--; const p=g.pos(x.canvas,e); fx.push({...p,t:.3}); let hitAny=false;
    for(const o of tg){ const d=Math.hypot(o.x-p.x,o.y-p.y); if(d<o.r){ const pts = Math.round((1-d/o.r)*5+1)*(o.r<20?3:1); score+=pts; g.score(score); o.d=1; hitAny=true; break; } }
    if(ammo<=0) g.after(400, ()=>{ g.best(score); g.over('子彈用完了','得分 '+score); }); });
  g.loop(dt=>{ t-=dt; if(t<=0){ t=.7; const row=R(3); tg.push({x:row%2?W+30:-30,y:70+row*100,vx:(row%2?-1:1)*RR(80,180),r:RR(14,30)}); }
    tg.forEach(o=>o.x+=o.vx*dt); tg=tg.filter(o=>!o.d&&o.x>-50&&o.x<W+50);
    bg(x,'#78350f'); for(let r=0;r<3;r++){ x.fillStyle='#a16207'; x.fillRect(0,70+r*100+32,W,6); }
    tg.forEach(o=>{ [[1,'#fff'],[.7,'#ef4444'],[.4,'#fff'],[.15,'#ef4444']].forEach(([k,c])=>circ(x,o.x,o.y,o.r*k,c)); });
    fx.forEach(f=>{ f.t-=dt; circ(x,f.x,f.y,6,'#111'); }); fx=fx.filter(f=>f.t>0); txt(x,'子彈 '+ammo,10,16,15,'#fde68a','left'); });
});

// 光輪對戰
A('tron','光輪對戰','🏍️','方向鍵轉向，別撞到牆壁或任何光軌，讓電腦先撞！', g => {
  const N=60, S=7, x=g.canvas(N*S,N*S); g.pad(); const b=new Uint8Array(N*N); let p={x:15,y:30,d:[1,0]}, c={x:45,y:30,d:[-1,0]}, q=[];
  g.onKey(k=>{ const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[k]; if(d) q.push(d); });
  bg(x);
  const free = (X,Y) => X>=0&&Y>=0&&X<N&&Y<N&&!b[Y*N+X];
  const look = (X,Y,d) => { let n=0; while(free(X+d[0]*(n+1),Y+d[1]*(n+1))&&n<30) n++; return n; };
  g.every(55, ()=>{ while(q.length){ const d=q.shift(); if(d[0]!==-p.d[0]||d[1]!==-p.d[1]){ p.d=d; break; } }
    const opts=[c.d,[c.d[1],-c.d[0]],[-c.d[1],c.d[0]]]; let best=c.d, bv=-1; opts.forEach((d,i)=>{ const v=look(c.x,c.y,d)+(i===0?2:0)+Math.random()*2; if(v>bv){bv=v;best=d;} }); if(Math.random()<.9||!free(c.x+c.d[0],c.y+c.d[1])) c.d=best;
    [p,c].forEach(o=>{ b[o.y*N+o.x]=1; o.x+=o.d[0]; o.y+=o.d[1]; });
    const pd=!free(p.x,p.y)||(p.x===c.x&&p.y===c.y), cd=!free(c.x,c.y);
    x.fillStyle='#38bdf8'; x.fillRect(p.x*S,p.y*S,S,S); x.fillStyle='#f97316'; x.fillRect(c.x*S,c.y*S,S,S);
    if(pd||cd){ g.stop(); g.over(pd&&cd?'同歸於盡':pd?'你撞到了':'電腦撞到了！你贏了🎉',''); } });
});

// 節奏鍵盤
A('rhythm','節奏打擊','🎵','音符落到判定線時按 D F J K（或點擊軌道）', g => {
  const W=320,H=520, x=g.canvas(W,H); const K=['d','f','j','k']; let notes=[], t=0, score=0, combo=0, miss=0, fl=[0,0,0,0], time=0;
  const press = l => { fl[l]=.15; const n=notes.find(o=>o.l===l&&!o.d&&Math.abs(o.y-(H-60))<45); if(n){ n.d=1; const pf=Math.abs(n.y-(H-60))<18; combo++; score+=(pf?100:50)+combo*2; g.score(score); } else { combo=0; } };
  g.onKey(k=>{ const i=K.indexOf(k.toLowerCase()); if(i>=0) press(i); });
  g.on(x.canvas,'pointerdown',e=>press(clamp(Math.floor(g.pos(x.canvas,e).x/80),0,3))); g.score(0); g.best();
  g.loop(dt=>{ time+=dt; const sp=260+time*3; t-=dt; if(t<=0){ t=Math.max(.22,.6-time/120); notes.push({l:R(4),y:-20}); }
    notes.forEach(n=>{ n.y+=sp*dt; if(n.y>H-15&&!n.d){ n.d=1; miss++; combo=0; } }); notes=notes.filter(n=>!n.d);
    if(miss>=10){ g.best(score); g.over('漏掉太多了','得分 '+score); return false; }
    bg(x,'#18181b'); for(let l=0;l<4;l++){ fl[l]-=dt; x.fillStyle=fl[l]>0?'#3f3f46':'#27272a'; x.fillRect(l*80+2,0,76,H); txt(x,K[l].toUpperCase(),l*80+40,H-20,18,'#71717a'); }
    x.fillStyle='#e879f9'; x.fillRect(0,H-62,W,4); notes.forEach(n=>{ x.fillStyle=['#f43f5e','#facc15','#22c55e','#38bdf8'][n.l]; x.fillRect(n.l*80+8,n.y-10,64,20); });
    txt(x,combo>2?combo+' COMBO':'',W/2,60,22,'#fde047'); txt(x,'MISS '+miss+'/10',W-8,16,13,'#f87171','right'); });
});

// 別踩白塊
A('tiles','別踩白塊','⬛','只點黑色方塊，從下往上依序點，踩到白塊或漏掉就輸', g => {
  const W=320,H=480, x=g.canvas(W,H); let rows=[], off=0, sp=200, score=0, started=false;
  for(let i=0;i<6;i++) rows.push({k:R(4),hit:false}); rows[0].hit=true;
  g.on(x.canvas,'pointerdown',e=>{ const p=g.pos(x.canvas,e), col=Math.floor(p.x/80); const idx=rows.findIndex(r=>!r.hit); const r=rows[idx]; const ry=H-(idx+1)*120+off;
    if(p.y<ry||p.y>ry+120){ return; } if(col===r.k){ r.hit=true; started=true; score++; g.score(score); } else { g.best(score); g.over('踩到白塊了！','得分 '+score); } });
  g.score(0); g.best(); g.div('hint','（也可以用 D F J K 鍵）');
  g.onKey(k=>{ const col='dfjk'.indexOf(k.toLowerCase()); if(col<0) return; const r=rows.find(r=>!r.hit); if(col===r.k){ r.hit=true; started=true; score++; g.score(score); } else { g.best(score); g.over('按錯了！','得分 '+score); } });
  g.loop(dt=>{ if(g.ended) return false; if(started){ sp+=dt*8; off+=sp*dt; } while(off>=120){ off-=120; if(!rows[0].hit){ g.best(score); g.over('漏掉了！','得分 '+score); return false; } rows.shift(); rows.push({k:R(4),hit:false}); }
    if(started && !rows[0].hit && H-120+off>H){ g.best(score); g.over('漏掉了！','得分 '+score); return false; }
    bg(x,'#fff'); rows.forEach((r,i)=>{ const y=H-(i+1)*120+off; x.fillStyle=r.hit?'#cbd5e1':'#111'; x.fillRect(r.k*80,y,80,120); });
    x.strokeStyle='#cbd5e1'; for(let c=1;c<4;c++){ x.beginPath(); x.moveTo(c*80,0); x.lineTo(c*80,H); x.stroke(); } if(!started) txt(x,'點最下面的黑塊開始',W/2,H-60,16,'#ef4444'); });
});

// 搭橋過關
A('bridge','搭橋過關','🌉','按住讓木棍變長，放開後木棍倒下，剛好搭到下一根柱子才能過去', g => {
  const W=420,H=360, x=g.canvas(W,H); let p, stick=0, st='idle', ang=0, hx=0, score=0, cam=0;
  const init = () => { p=[{x:20,w:60},{x:RR(140,300),w:RR(25,70)}]; hx=60; };
  init(); g.score(0); g.best();
  const down = () => { if(st==='idle'){ st='grow'; stick=0; } }, up = () => { if(st==='grow'){ st='fall'; ang=0; } };
  g.on(x.canvas,'pointerdown',down); g.on(window,'pointerup',up); g.on(window,'keydown',e=>e.key===' '&&down()); g.on(window,'keyup',e=>e.key===' '&&up());
  g.loop(dt=>{ const a=p[0], b=p[1], base=a.x+a.w;
    if(st==='grow') stick+=260*dt;
    if(st==='fall'){ ang+=dt*5; if(ang>=Math.PI/2){ ang=Math.PI/2; st='walk'; } }
    if(st==='walk'){ hx+=220*dt; const end=base+stick, ok=end>=b.x&&end<=b.x+b.w, tgt=ok?b.x+b.w-15:end+10;
      if(hx>=tgt){ hx=tgt; if(ok){ score++; if(Math.abs(end-(b.x+b.w/2))<5) score++; g.score(score); st='shift'; } else st='drop'; } }
    if(st==='drop'){ g.best(score); g.over('掉下去了！','得分 '+score); return false; }
    if(st==='shift'){ const d=b.x-20; cam+=dt*400; if(cam>=d){ p=[{x:20,w:b.w},{x:20+b.w+RR(40,240),w:RR(20,70)}]; hx=20+b.w-15; cam=0; st='idle'; stick=0; ang=0; } }
    bg(x,'#fde68a'); x.save(); x.translate(-cam,0); p.forEach(q=>{ x.fillStyle='#111'; x.fillRect(q.x,H-120,q.w,120); x.fillStyle='#ef4444'; x.fillRect(q.x+q.w/2-3,H-120,6,4); });
    x.save(); x.translate(base,H-120); x.rotate(st==='idle'||st==='grow'?0:ang); x.fillStyle='#78350f'; x.fillRect(-2,-stick,4,stick); x.restore();
    txt(x,'🧍',hx,H-134,24); x.restore(); });
});

// 顏色通關
A('colorswitch','顏色通關','🔵','點擊讓球往上跳，只能穿過和球同顏色的區段', g => {
  const W=340,H=520, x=g.canvas(W,H); const C=['#f43f5e','#facc15','#22d3ee','#a855f7']; let y=420, v=0, cam=0, col=0, rings=[], score=0, started=false;
  for(let i=0;i<4;i++) rings.push({y:250-i*260,a:Math.random()*6,sp:(Math.random()<.5?-1:1)*(1.2+i*.05),sw:true});
  const jump = () => { started=true; v=-380; }; tapper(g,x.canvas,jump); g.onKey(k=>k===' '&&jump()); g.score(0); g.best();
  g.loop(dt=>{ if(started){ v+=1000*dt; y+=v*dt; } if(y-cam<H*.45) cam=y-H*.45; if(y-cam>H){ g.best(score); g.over('掉下去了','得分 '+score); return false; }
    bg(x,'#18181b'); let dead=false;
    rings.forEach(r=>{ r.a+=r.sp*dt; const cy=r.y-cam; for(let k=0;k<4;k++){ x.strokeStyle=C[k]; x.lineWidth=14; x.beginPath(); x.arc(W/2,cy,80,r.a+k*Math.PI/2,r.a+(k+1)*Math.PI/2); x.stroke(); }
      const dy=y-r.y; if(Math.abs(Math.abs(dy)-80)<9){ const ang=((dy>0?Math.PI/2:-Math.PI/2)-r.a)%(Math.PI*2); const k=Math.floor(((ang+Math.PI*4)%(Math.PI*2))/(Math.PI/2)); if(k!==col) dead=true; }
      if(r.sw){ txt(x,'✦',W/2,cy,22,'#fff'); if(Math.abs(y-r.y)<14){ r.sw=false; let n; do{ n=R(4); }while(n===col); col=n; score++; g.score(score); } } });
    const top=Math.min(...rings.map(r=>r.y)); if(rings[0].y-cam>H+120){ rings.shift(); rings.push({y:top-260,a:Math.random()*6,sp:(Math.random()<.5?-1:1)*(1.2+score*.06),sw:true}); }
    circ(x,W/2,y-cam,10,C[col]); if(!started) txt(x,'點擊開始',W/2,H-40,18);
    if(dead){ g.best(score); g.over('顏色不對！','得分 '+score); return false; } });
});

// 坦克砲戰
A('artillery','坦克砲戰','💥','調整角度和力道發射砲彈，先擊中對方坦克 3 次獲勝', g => {
  const W=560,H=320, x=g.canvas(W,H); const ground = range(W/4+1).map(i=>220+Math.sin(i/9)*30+Math.sin(i/3.7)*8);
  const gy = X => ground[clamp(Math.round(X/4),0,ground.length-1)];
  const me={x:60,hp:3}, en={x:500,hp:3}; let ang=45, pow=60, shell=null, turn='me', wind=RR(-30,30);
  const ctl = g.div('row'); const ai = g.html('<span></span>');
  const mk = (lab,get,set) => { const s=document.createElement('label'); s.innerHTML=`${lab} <input type="range" min="${lab==='角度'?10:20}" max="${lab==='角度'?85:100}" value="${get()}">`; s.querySelector('input').oninput=e=>set(+e.target.value); ctl.appendChild(s); };
  mk('角度',()=>ang,v=>ang=v); mk('力道',()=>pow,v=>pow=v);
  g.button('發射！', ()=>{ if(turn==='me'&&!shell) fire(me,ang,pow,1); }, 'btn', ctl);
  const fire = (t,a,p,dir) => { const r=a*Math.PI/180; shell={x:t.x,y:gy(t.x)-14,vx:Math.cos(r)*p*5*dir,vy:-Math.sin(r)*p*5,from:t}; };
  let aiErr = 18;
  g.loop(dt=>{ if(shell){ shell.vy+=300*dt; shell.vx+=wind*dt; shell.x+=shell.vx*dt; shell.y+=shell.vy*dt;
      const tg = shell.from===me?en:me; if(Math.hypot(shell.x-tg.x,shell.y-(gy(tg.x)-8))<18){ tg.hp--; shell=null; next(); }
      else if(shell.x<0||shell.x>W||shell.y>gy(shell.x)){ if(shell.from===en) aiErr=Math.max(2,aiErr*.6); shell=null; next(); } }
    bg(x,'#bae6fd'); x.fillStyle='#65a30d'; x.beginPath(); x.moveTo(0,H); ground.forEach((v,i)=>x.lineTo(i*4,v)); x.lineTo(W,H); x.fill();
    [[me,'#2563eb',ang,1],[en,'#dc2626',45,-1]].forEach(([t,c,a,d])=>{ const y=gy(t.x); x.fillStyle=c; x.fillRect(t.x-14,y-14,28,12); x.strokeStyle=c; x.lineWidth=4; x.beginPath(); x.moveTo(t.x,y-12); x.lineTo(t.x+Math.cos(a*Math.PI/180)*20*d,y-12-Math.sin(a*Math.PI/180)*20); x.stroke(); txt(x,'❤'.repeat(t.hp),t.x,y-34,12,c); });
    if(shell) circ(x,shell.x,shell.y,4,'#111'); txt(x,`風 ${wind>0?'→':'←'} ${Math.abs(wind)}`,W/2,16,15,'#0f172a'); });
  const next = () => { if(en.hp<=0) return g.over('你贏了！🎉',''); if(me.hp<=0) return g.over('你被擊敗了','');
    if(turn==='me'){ turn='en'; ai.textContent='電腦瞄準中…'; g.after(900, ()=>{ let best=null, bd=1e9;
        for(let a=20;a<=80;a+=5) for(let p=20;p<=100;p+=2){ let sx=en.x, sy=gy(en.x)-14, vx=-Math.cos(a*Math.PI/180)*p*5, vy=-Math.sin(a*Math.PI/180)*p*5; for(let k=0;k<400;k++){ vy+=300*.02; vx+=wind*.02; sx+=vx*.02; sy+=vy*.02; if(sy>gy(sx)||sx<0) break; } const d=Math.abs(sx-me.x); if(d<bd){ bd=d; best=[a,p]; } }
        fire(en,best[0]+RR(-aiErr,aiErr)/4,best[1]+RR(-aiErr,aiErr)/3,-1); ai.textContent=''; }); }
    else { turn='me'; wind=RR(-30,30); } };
});

// 釣魚
A('fishing','釣魚樂','🎣','點擊放下魚鉤，碰到魚就會釣上來，60 秒內釣越多分越高（別釣到垃圾）', g => {
  const W=420,H=460, x=g.canvas(W,H); let hook={x:W/2,y:60,st:'idle',vy:0,got:null}, fish=[], t=0, score=0, left=60; g.score(0); g.best();
  g.on(x.canvas,'pointermove',e=>{ if(hook.st==='idle') hook.x=clamp(g.pos(x.canvas,e).x,20,W-20); });
  g.on(x.canvas,'pointerdown',e=>{ if(hook.st==='idle'){ hook.x=clamp(g.pos(x.canvas,e).x,20,W-20); hook.st='down'; } });
  g.onKey(k=>{ if(hook.st!=='idle') return; if(k==='ArrowLeft') hook.x=Math.max(20,hook.x-20); if(k==='ArrowRight') hook.x=Math.min(W-20,hook.x+20); if(k===' '||k==='ArrowDown') hook.st='down'; });
  g.every(1000,()=>{ left--; g.info('剩餘 '+left+' 秒'); });
  g.loop(dt=>{ t-=dt; if(t<=0){ t=.6; const l=Math.random()<.5, k=Math.random(); fish.push({x:l?-30:W+30,y:RR(150,H-30),vx:(l?1:-1)*RR(40,120),e:k<.12?'👢':k<.25?'🐡':k<.35?'🦈':'🐟',}); }
    fish.forEach(f=>f.x+=f.vx*dt); fish=fish.filter(f=>f.x>-50&&f.x<W+50&&!f.d);
    if(hook.st==='down'){ hook.y+=260*dt; const f=fish.find(f=>Math.hypot(f.x-hook.x,f.y-hook.y)<22); if(f){ f.d=1; hook.got=f.e; hook.st='up'; } if(hook.y>H-10) hook.st='up'; }
    if(hook.st==='up'){ hook.y-=(hook.got?200:400)*dt; if(hook.y<=60){ hook.y=60; hook.st='idle'; if(hook.got){ score+={'🐟':10,'🐡':20,'🦈':50,'👢':-15}[hook.got]; g.score(score); } hook.got=null; } }
    bg(x,'#0369a1'); x.fillStyle='#bae6fd'; x.fillRect(0,0,W,110); txt(x,'🚣',hook.x,70,40);
    x.strokeStyle='#111'; x.beginPath(); x.moveTo(hook.x,70); x.lineTo(hook.x,hook.y); x.stroke(); txt(x,hook.got||'🪝',hook.x,hook.y+6,20);
    fish.forEach(f=>{ x.save(); x.translate(f.x,f.y); if(f.vx>0) x.scale(-1,1); txt(x,f.e,0,0,28); x.restore(); });
    if(left<=0){ g.best(score); g.over('時間到！','得分 '+score); return false; } });
});
})();
