/* 國三化學互動實驗室共用程式：分頁、按鈕組、學習任務勾選、測驗、畫布工具、音效 */
(function(){
const $=id=>document.getElementById(id);
const Lab={$};
let active=null;const listeners=[];
Lab.tabs=function(){const bs=document.querySelectorAll('nav.tabs button');
  bs.forEach(b=>b.addEventListener('click',()=>{active=b.dataset.p;bs.forEach(x=>x.setAttribute('aria-selected',x===b));
    document.querySelectorAll('section.page').forEach(s=>s.hidden=s.id!==active);listeners.forEach(f=>f(active));try{history.replaceState(null,'','#'+active);}catch(e){}}));
  const first=[...bs].find(b=>'#'+b.dataset.p===location.hash)||bs[0];active=null;first.click();};
Lab.active=()=>active;Lab.onTab=f=>listeners.push(f);
Lab.seg=function(sel,cb){const bs=document.querySelectorAll(sel);bs.forEach(b=>b.addEventListener('click',()=>{bs.forEach(x=>x.setAttribute('aria-pressed',x===b));cb(b);}));};
/* 學習任務：勾選狀態只存在這台裝置 */
Lab.tasks=function(key){document.querySelectorAll('details.goal').forEach((g,gi)=>{const boxes=g.querySelectorAll('.tasks input');const prog=g.querySelector('.prog');
  const upd=()=>{if(prog)prog.textContent=`學習任務 ${[...boxes].filter(b=>b.checked).length}/${boxes.length}`;};
  boxes.forEach((b,i)=>{const k=`${key}-${gi}-${i}`;try{b.checked=localStorage.getItem(k)==='1';}catch(e){}b.addEventListener('change',()=>{try{localStorage.setItem(k,b.checked?'1':'0');}catch(e){}upd();});});upd();});};
Lab.done=function(sel){const b=document.querySelector(sel);if(b&&!b.checked){b.checked=true;b.dispatchEvent(new Event('change'));}};
/* 測驗 */
Lab.quiz=function(id,Q){const box=$(id);let score=0;const sp=document.createElement('p');sp.className='note';sp.innerHTML='答對 <b>0</b> / '+Q.length+' 題';box.appendChild(sp);
  Q.forEach((it,i)=>{const d=document.createElement('div');d.className='q';d.innerHTML=`<p>${i+1}. ${it.q}</p><div class="opts"></div><div class="fb" aria-live="polite"></div>`;
    const ops=d.querySelector('.opts'),fb=d.querySelector('.fb');let done=false;
    it.o.forEach((t,j)=>{const b=document.createElement('button');b.type='button';b.innerHTML=t;b.onclick=()=>{
      if(j===it.a){b.className='ok';fb.textContent='正確！'+(it.w||'');fb.style.color='var(--good)';if(!done){score++;sp.querySelector('b').textContent=score;}done=true;}
      else{b.className='no';fb.textContent='再想想看，可以回到前面的互動實驗試試。';fb.style.color='var(--bad)';done=true;}};ops.appendChild(b);});box.appendChild(d);});};
/* 畫布 */
Lab.txt=function(c,s,x,y,col,size,align,bold){c.fillStyle=col||'#e4ebf0';c.font=`${bold?'bold ':''}${size||22}px "Noto Sans TC",sans-serif`;c.textAlign=align||'left';c.fillText(s,x,y);};
Lab.line=function(c,x1,y1,x2,y2,col,w,dash){c.strokeStyle=col;c.lineWidth=w||2;c.setLineDash(dash||[]);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.setLineDash([]);};
Lab.circle=function(c,x,y,r,fill,stroke){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}};
Lab.pt=function(cv,e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height};};
Lab.beaker=function(c,x,y,w,h,fill,level){c.fillStyle=fill;c.fillRect(x+3,y+h-h*level,w-6,h*level-3);c.strokeStyle='#dfe7ec';c.lineWidth=5;c.beginPath();c.moveTo(x-6,y);c.lineTo(x,y);c.lineTo(x,y+h);c.lineTo(x+w,y+h);c.lineTo(x+w,y);c.lineTo(x+w+6,y);c.stroke();};
Lab.flame=function(c,x,y,t,s){s=s||1;for(let i=0;i<3;i++){c.fillStyle=['#ff6a00','#ffb000','#ffe36e'][i];c.beginPath();c.ellipse(x,y-i*3*s,(22-i*6+Math.sin(t*9+i)*3)*s,(30-i*7)*s,0,0,7);c.fill();}};
/* 單一動畫迴圈 */
const loops=[];Lab.loop=f=>loops.push(f);let last=performance.now();
(function frame(n){const dt=Math.min(0.05,Math.max(0,(n-last)/1000));last=n;loops.forEach(f=>f(dt,n/1000,active));requestAnimationFrame(frame);})(last);
Lab.anim=function(ms,step,done){const t0=performance.now(),id={};Lab._a=id;(function s(n){const f=Math.min(1,Math.max(0,(n-t0)/ms));step(f);if(f<1)requestAnimationFrame(s);else if(done)done();})(t0);};
/* 音效（按鈕觸發後才會播放） */
let AC=null;Lab.ac=()=>{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC;};
Lab.beep=function(f,d,g){const a=Lab.ac(),o=a.createOscillator(),G=a.createGain();o.frequency.value=f;G.gain.setValueAtTime(0.0001,a.currentTime);G.gain.exponentialRampToValueAtTime(g||0.12,a.currentTime+0.01);G.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+(d||0.2));o.connect(G).connect(a.destination);o.start();o.stop(a.currentTime+(d||0.2)+0.05);};
Lab.sub=s=>String(s).replace(/([A-Za-z)])(\d+)/g,(m,a,d)=>a+d.replace(/\d/g,x=>'₀₁₂₃₄₅₆₇₈₉'[x]));
Lab.fmt=(x,d=1)=>(Math.round(x*Math.pow(10,d))/Math.pow(10,d)).toString();
window.Lab=Lab;
})();
