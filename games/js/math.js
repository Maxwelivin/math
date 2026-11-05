// ===== 數學類 =====
(function(){
const M = (id, name, icon, desc, gen, opt) => add(id, name, 'math', icon, desc, g => quiz(g, gen, opt));
const ch = (q, a, f) => ({q, a, opts: opts4(a, f)});
const frac = (n, d) => { const k = gcd(n, d); n /= k; d /= k; if(d < 0){ n = -n; d = -d; } return d === 1 ? String(n) : n + '/' + d; };

M('add1','加法快算','➕','60 秒內答對越多越好：一位數加法', () => { const a=RR(1,9), b=RR(1,9); return {q:`${a} + ${b} = ?`, a:a+b}; });
M('add2','二位數加法','➕','兩位數相加，輸入答案按 Enter', () => { const a=RR(10,99), b=RR(10,99); return {q:`${a} + ${b} = ?`, a:a+b}; });
M('sub1','減法快算','➖','20 以內減法', () => { const a=RR(5,20), b=RR(1,a); return {q:`${a} − ${b} = ?`, a:a-b}; });
M('sub2','二位數減法','➖','兩位數相減', () => { const a=RR(30,99), b=RR(10,a); return {q:`${a} − ${b} = ?`, a:a-b}; });
M('mul9','九九乘法','✖️','九九乘法表快問快答', () => { const a=RR(2,9), b=RR(2,9); return {q:`${a} × ${b} = ?`, a:a*b}; });
M('mul2','二位乘一位','✖️','兩位數乘一位數', () => { const a=RR(11,99), b=RR(2,9); return {q:`${a} × ${b} = ?`, a:a*b}; });
M('mul22','二位乘二位','✖️','挑戰兩位數乘兩位數（選擇題）', () => { const a=RR(11,40), b=RR(11,40); return ch(`${a} × ${b} = ?`, a*b, () => a*b + pick([-10,10,-20,20,-1,1,a,-a,b,-b])); });
M('div1','除法快算','➗','整除的除法', () => { const b=RR(2,9), q=RR(2,12); return {q:`${b*q} ÷ ${b} = ?`, a:q}; });
M('mix','四則混合','🧮','先乘除後加減', () => { const a=RR(1,20), b=RR(2,9), c=RR(2,9), op=pick(['+','−']); return {q:`${a} ${op} ${b} × ${c} = ?`, a: op==='+' ? a+b*c : a-b*c}; });
M('paren','括號運算','🧮','括號優先計算', () => { const a=RR(1,15), b=RR(1,15), c=RR(2,9); return {q:`(${a} + ${b}) × ${c} = ?`, a:(a+b)*c}; });
M('neg','正負數加減','➕','整數加減，注意正負號', () => { const a=RR(-20,20), b=RR(-20,20), p=R(2); return {q:`(${a}) ${p?'+':'−'} (${b}) = ?`, a: p ? a+b : a-b}; });
M('negm','正負數乘除','✖️','整數乘除', () => { const a=RR(-12,12)||3, b=RR(-9,9)||-2; return R(2) ? {q:`(${a}) × (${b}) = ?`, a:a*b} : {q:`(${a*b}) ÷ (${b}) = ?`, a:a}; });
M('sq','平方數','²','求平方', () => { const a=RR(2,25); return {q:`${a}² = ?`, a:a*a}; });
M('sqrt','平方根','√','求完全平方數的平方根', () => { const a=RR(2,25); return {q:`√${a*a} = ?`, a}; });
M('cube','立方數','³','求立方', () => { const a=RR(2,12); return {q:`${a}³ = ?`, a:a**3}; });
M('pow2','指數運算','🔺','次方計算', () => { const b=pick([2,2,3,5,10]), e = b===2 ? RR(2,10) : RR(2,4); return {q:`${b}^${e} = ?`, a:b**e}; });
M('fracadd','分數加減','🍰','答案以最簡分數輸入，例如 3/4', () => { const d1=RR(2,9), d2=RR(2,9), n1=RR(1,d1-1||1), n2=RR(1,d2-1||1), p=R(2);
  const n = p ? n1*d2+n2*d1 : n1*d2-n2*d1, d = d1*d2; return {q:`${n1}/${d1} ${p?'+':'−'} ${n2}/${d2} = ?`, a:frac(n,d)}; });
M('fraccmp','分數比大小','⚖️','哪一個比較大？', () => { let a,b,c,d; do{ b=RR(2,12); a=RR(1,b-1); d=RR(2,12); c=RR(1,d-1); }while(a*d===b*c);
  return {q:`${a}/${b}  ?  ${c}/${d}`, a: a*d>b*c ? '>' : '<', opts:['>','<']}; });
M('fracmul','分數乘法','🍰','答案以最簡分數輸入', () => { const a=RR(1,9), b=RR(2,9), c=RR(1,9), d=RR(2,9); return {q:`${a}/${b} × ${c}/${d} = ?`, a:frac(a*c,b*d)}; });
M('dec','小數加減','🔟','小數運算', () => { const a=RR(1,99)/10, b=RR(1,99)/10, p=R(2); return {q:`${a} ${p?'+':'−'} ${b} = ?`, a: +((p?a+b:a-b).toFixed(1))}; });
M('pct','百分比','％','求某數的百分之幾', () => { const p=pick([5,10,20,25,50,75,15,30,40]), n=pick([20,40,60,80,100,120,200,400,500]); return {q:`${n} 的 ${p}% = ?`, a: n*p/100}; });
M('gcd','最大公因數','🔗','求 GCD', () => { const k=RR(2,12), a=RR(1,9)*k, b=RR(1,9)*k; return {q:`gcd(${a}, ${b}) = ?`, a:gcd(a,b)}; });
M('lcm','最小公倍數','🔗','求 LCM', () => { const a=RR(2,15), b=RR(2,15); return {q:`lcm(${a}, ${b}) = ?`, a:a*b/gcd(a,b)}; });
const isP = n => { if(n<2) return false; for(let i=2;i*i<=n;i++) if(n%i===0) return false; return true; };
M('prime','質數判斷','🔍','這個數是質數嗎？', () => { const n=RR(2,150); return {q:`${n} 是質數嗎？`, a: isP(n)?'是':'不是', opts:['是','不是']}; });
M('divis','整除判斷','🔍','能否被整除？', () => { const d=pick([2,3,4,5,6,9,11]), n = R(2) ? d*RR(5,90) : RR(20,999); return {q:`${n} 能被 ${d} 整除嗎？`, a: n%d===0?'能':'不能', opts:['能','不能']}; });
M('mod','餘數','➗','求除法的餘數', () => { const a=RR(10,99), b=RR(2,9); return {q:`${a} ÷ ${b} 的餘數 = ?`, a:a%b}; });
M('cmp','算式比大小','⚖️','左右兩邊哪邊大？', () => { const a=RR(2,12)*RR(2,9), b=RR(10,99)+RR(1,30); const l=`${a/ (a%2?1:1)}`; const x=RR(2,9), y=RR(2,12), z=RR(10,60), w=RR(10,60);
  const L=x*y, Rr=z+w; return {q:`${x}×${y}  ?  ${z}+${w}`, a: L>Rr?'>':L<Rr?'<':'=', opts:['>','=','<']}; });
M('eq1','解一元一次方程','𝑥','求 x', () => { const x=RR(-10,10), a=RR(2,9), b=RR(-20,20); return {q:`${a}x ${b<0?'−':'+'} ${Math.abs(b)} = ${a*x+b}\nx = ?`, a:x}; });
M('eq2','二元方程速解','𝑥𝑦','x + y 與 x − y 已知，求 x', () => { const x=RR(1,20), y=RR(1,20); return {q:`x + y = ${x+y}\nx − y = ${x-y}\nx = ?`, a:x}; });
M('bin','二進位轉換','💻','把二進位轉成十進位', () => { const n=RR(1,63); return {q:`(${n.toString(2)})₂ = ? (十進位)`, a:n}; });
M('hex16','十六進位','💻','把十六進位轉成十進位', () => { const n=RR(10,255); return {q:`0x${n.toString(16).toUpperCase()} = ?`, a:n}; });
const roman = n => [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']].reduce((s,[v,c])=>{while(n>=v){s+=c;n-=v;}return s;},'');
M('roman','羅馬數字','🏛️','羅馬數字代表多少？', () => { const n=RR(1,200); return {q:`${roman(n)} = ?`, a:n}; });
M('abs','絕對值','｜｜','絕對值運算', () => { const a=RR(-30,30), b=RR(-30,30); return {q:`|${a}| + |${b}| = ?`, a:Math.abs(a)+Math.abs(b)}; });
M('make10','湊整數','🎯','補多少能湊到 100？', () => { const t=pick([10,100,100,1000]), a=RR(1,t-1); return {q:`${a} + ? = ${t}`, a:t-a}; });
M('est','估算高手','≈','選出最接近的答案', () => { const a=RR(21,99), b=RR(21,99), c=a*b; return ch(`${a} × ${b} ≈ ?`, c, () => Math.round(c*(0.6+Math.random()*0.8))); });
M('seq','數列規律','📈','找出下一項', () => { const t=R(3), a=RR(1,10), d=RR(2,7); let s;
  if(t===0) s=range(5).map(i=>a+d*i); else if(t===1) s=range(5).map(i=>a*Math.pow(2,i)); else s=range(5).map(i=>(i+a)*(i+a));
  return {q: s.slice(0,4).join(', ') + ', ?', a:s[4]}; });
M('angle','三角形內角','📐','三角形內角和 180°，求第三個角', () => { const a=RR(20,100), b=RR(20,160-a); return {q:`∠A=${a}°，∠B=${b}°\n∠C = ?`, a:180-a-b}; });
M('area','面積計算','⬛','長方形或三角形面積', () => { const w=RR(2,20), h=RR(2,20)*2; return R(2) ? {q:`長方形 長 ${w}、寬 ${h/2}\n面積 = ?`, a:w*h/2} : {q:`三角形 底 ${w}、高 ${h}\n面積 = ?`, a:w*h/2}; });
M('peri','周長計算','⭕','長方形周長', () => { const w=RR(2,30), h=RR(2,30); return {q:`長方形 長 ${w}、寬 ${h}\n周長 = ?`, a:2*(w+h)}; });
M('sci','科學記號','🔬','選出正確的科學記號', () => { const m=RR(11,99)/10, e=RR(2,7), n=Math.round(m*10**e); return {q:`${n.toLocaleString()} = ?`, a:`${m}×10^${e}`, opts:[`${m}×10^${e}`,`${m}×10^${e+1}`,`${m}×10^${e-1}`,`${m*10}×10^${e+1}`]}; });
M('unit','單位換算','📏','長度、重量、時間換算', () => { const t=pick([['公尺','公分',100],['公里','公尺',1000],['公斤','公克',1000],['小時','分鐘',60],['分鐘','秒',60],['公升','毫升',1000]]), n=RR(2,12); return {q:`${n} ${t[0]} = ? ${t[1]}`, a:n*t[2]}; });
M('pyth','畢氏定理','📐','求直角三角形斜邊', () => { const t=pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15],[20,21,29]]); return {q:`兩股 ${t[0]}、${t[1]}\n斜邊 = ?`, a:t[2]}; });
M('avg','平均數','📊','求平均', () => { const n=RR(3,5), a=range(n).map(()=>RR(1,20)); const s=a.reduce((x,y)=>x+y); a[0] += (n - s%n)%n; return {q:`${a.join(', ')} 的平均 = ?`, a:(s+(n-s%n)%n)/n}; });
M('mul11','乘以 11','⚡','速算技巧：兩位數 × 11', () => { const a=RR(11,99); return {q:`${a} × 11 = ?`, a:a*11}; });
M('dbl','連續加倍','⏫','把數字乘以 2', () => { const a=RR(13,499); return {q:`${a} × 2 = ?`, a:a*2}; });

// 24 點
add('p24','24 點','math','🃏','用四個數字和 + − × ÷ 算出 24（每個數字用一次）', g => {
  const solve = (ns) => { if(ns.length===1) return Math.abs(ns[0]-24)<1e-6;
    for(let i=0;i<ns.length;i++) for(let j=0;j<ns.length;j++) if(i!==j){ const rest=ns.filter((_,k)=>k!==i&&k!==j), a=ns[i], b=ns[j];
      for(const v of [a+b,a-b,a*b, b?a/b:NaN]) if(!isNaN(v) && solve([...rest, v])) return true; } return false; };
  let score = 0; g.score(0); g.best();
  const cards = g.div('row'), out = g.div('big'), ops = g.div('row'), msg = g.div('msg');
  let st;
  const deal = () => { let ns; do{ ns = range(4).map(()=>RR(1,10)); }while(!solve(ns)); st = {items: ns.map(v=>({v, s:String(v)})), sel:null, op:null}; base = ns; draw(); };
  const draw = () => { cards.innerHTML=''; st.items.forEach((it,i) => { const b = g.button(it.s, () => clickN(i), 'opt', cards); if(st.sel===i) b.style.borderColor='var(--pri)', b.style.borderWidth='3px'; });
    out.textContent = st.op ? `${st.items[st.sel].s} ${st.op} …` : ''; };
  const clickN = i => { if(st.sel===null || !st.op){ st.sel = i; draw(); return; } if(i===st.sel) return;
    const A = st.items[st.sel], B = st.items[i]; let v; const o = st.op;
    if(o==='÷' && B.v===0) return; v = o==='+'?A.v+B.v : o==='−'?A.v-B.v : o==='×'?A.v*B.v : A.v/B.v;
    const nw = {v, s:`(${A.s}${o}${B.s})`}; st.items = st.items.filter((_,k)=>k!==i&&k!==st.sel); st.items.push(nw); st.sel = st.items.length-1; st.op = null;
    if(st.items.length===1){ if(Math.abs(v-24)<1e-6){ score++; g.score(score); g.best(score); msg.textContent='🎉 成功！' + nw.s.slice(1,-1) + ' = 24'; g.after(1200, ()=>{ msg.textContent=''; deal(); }); }
      else { msg.textContent = '結果是 ' + +v.toFixed(3) + '，再試一次'; } }
    draw(); };
  ['+','−','×','÷'].forEach(o => g.button(o, () => { if(st.sel!==null){ st.op = o; draw(); } }, 'opt', ops));
  const r2 = g.div('row'); let base;
  g.button('重來這題', () => { st.items = base.map(v=>({v, s:String(v)})); st.sel=null; st.op=null; msg.textContent=''; draw(); }, 'btn alt', r2);
  g.button('跳過', () => { msg.textContent=''; deal(); }, 'btn alt', r2);
  deal();
});

// 猜數字
add('guess','猜數字','math','❓','電腦想了 1～100 的數字，用最少次數猜中', g => {
  const t = RR(1,100); let n = 0, lo = 1, hi = 100; g.best();
  const m = g.div('big', '1 ～ 100'); const row = g.div('row'); const msg = g.div('msg');
  const inp = document.createElement('input'); inp.className='ans'; inp.inputMode='numeric'; row.appendChild(inp);
  const go = () => { const v = +inp.value; if(!v) return; n++; inp.value=''; g.info('已猜 ' + n + ' 次');
    if(v===t){ g.best(n, true); g.over('猜中了！', `答案 ${t}，共 ${n} 次`); }
    else { if(v<t) lo = Math.max(lo, v+1); else hi = Math.min(hi, v-1); msg.textContent = v<t ? `${v} 太小了 ⬆️` : `${v} 太大了 ⬇️`; m.textContent = `${lo} ～ ${hi}`; } };
  inp.onkeydown = e => e.key==='Enter' && go(); g.button('猜', go, 'btn', row); inp.focus();
});

// 1A2B
add('ab','1A2B 猜數字','math','🔢','猜 4 位不重複數字。A=數字與位置都對，B=數字對位置錯', g => {
  const t = shuffle(range(10)).slice(0,4).join(''); let n = 0; g.best();
  const row = g.div('row'); const log = g.div(''); log.style.cssText='font-family:monospace;font-size:1.2rem;line-height:1.7';
  const inp = document.createElement('input'); inp.className='ans'; inp.maxLength=4; inp.inputMode='numeric'; row.appendChild(inp);
  const go = () => { const v = inp.value; if(!/^\d{4}$/.test(v) || new Set(v).size<4){ g.info('請輸入 4 個不重複數字'); return; }
    n++; let A=0,B=0; for(let i=0;i<4;i++){ if(v[i]===t[i]) A++; else if(t.includes(v[i])) B++; }
    log.insertAdjacentHTML('afterbegin', `<div>#${n}  ${v}  →  <b>${A}A${B}B</b></div>`); inp.value=''; g.info('');
    if(A===4){ g.best(n, true); g.over('答對了！', `答案 ${t}，共 ${n} 次`); } };
  inp.onkeydown = e => e.key==='Enter' && go(); g.button('猜', go, 'btn', row); inp.focus();
});

// 湊數字
add('target','湊數字','math','🎯','點選數字，讓總和剛好等於目標值', g => {
  let score = 0, left = 60, tgt, sel; g.score(0); g.best();
  const tv = g.div('big'); let cells;
  const box = g.div(''); const msg = g.div('hint');
  const deal = () => { box.innerHTML = ''; sel = new Set(); const ns = range(16).map(()=>RR(1,9)); tgt = shuffle(ns).slice(0, RR(2,4)).reduce((a,b)=>a+b);
    tv.textContent = '目標：' + tgt;
    cells = g.grid(4,4,64,(r,c,b)=>{ const i=r*4+c; sel.has(i)?sel.delete(i):sel.add(i); b.style.background = sel.has(i)?'var(--pri)':''; b.style.color = sel.has(i)?'#fff':'';
      const s=[...sel].reduce((a,k)=>a+ns[k],0); msg.textContent = '目前總和：' + s;
      if(s===tgt){ score += sel.size*5; g.score(score); deal(); } else if(s>tgt){ msg.textContent = '超過了！重新選'; sel.clear(); cells.forEach(x=>{x.style.background='';x.style.color='';}); } }, box);
    cells.forEach((b,i)=>b.textContent=ns[i]); };
  g.every(1000, () => { left--; g.info('剩餘 ' + left + ' 秒'); if(left<=0){ g.stop(); g.best(score); g.over('時間到！', '得分 ' + score); } });
  deal();
});

// 填運算符號
add('ops','填運算符號','math','❔','選出讓等式成立的運算符號', g => quiz(g, () => { const a=RR(2,12), b=RR(1,12); const o = pick(['+','−','×','÷']);
  let A = a; if(o==='÷') A = a*b; const r = o==='+'?A+b:o==='−'?A-b:o==='×'?A*b:A/b;
  const all = ['+','−','×','÷'].filter(x => { const v = x==='+'?A+b:x==='−'?A-b:x==='×'?A*b:A/b; return v===r; });
  return {q:`${A} ☐ ${b} = ${r}`, a: all[0], opts:['+','−','×','÷'].filter(x=>x===all[0]||!all.includes(x))}; }));

// 魔方陣
add('magic','魔方陣','math','✨','把 1～9 填入，使每行、每列、對角線總和都是 15', g => {
  const v = Array(9).fill(0); let pickN = 1; const used = () => new Set(v.filter(Boolean));
  const msg = g.div('msg'); const cells = g.grid(3,3,80,(r,c,b)=>{ const i=r*3+c; if(v[i]) v[i]=0; else { if(used().has(pickN)) return; v[i]=pickN; } draw(); });
  const nums = g.div('row'); const nb = range(9,1).map(n => g.button(n, () => { pickN = n; draw(); }, 'opt', nums));
  const draw = () => { cells.forEach((b,i)=>b.textContent = v[i]||''); const u = used(); nb.forEach((b,i)=>{ b.style.opacity = u.has(i+1)?.3:1; b.style.borderColor = pickN===i+1?'var(--pri)':''; });
    const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    if(v.every(Boolean)){ if(L.every(l=>l.reduce((s,i)=>s+v[i],0)===15)) g.over('完成魔方陣！','每條線都是 15'); else msg.textContent='還有線不等於 15'; } else msg.textContent=''; };
  draw();
});

// 數字墜落
add('mathrain','算式雨','math','🌧️','算式從天而降，輸入答案擊落它，別讓它落地', g => {
  const x = g.canvas(400, 460); let items = [], score = 0, life = 5, t = 0, sp = 30; g.score(0); g.best();
  const row = g.div('row'); const inp = document.createElement('input'); inp.className='ans'; inp.inputMode='numeric'; row.appendChild(inp); inp.focus();
  inp.oninput = () => { const v = inp.value.trim(); const i = items.findIndex(o => String(o.a) === v); if(i>=0){ items.splice(i,1); score+=10; g.score(score); inp.value=''; sp += 1.5; } };
  g.loop(dt => { t -= dt; if(t<=0){ t = Math.max(0.9, 2.6 - score/200); const a=RR(1,12), b=RR(1,12), o=pick(['+','−','×']);
      items.push({q:`${o==='−'?a+b:a} ${o} ${b}`, a: o==='+'?a+b : o==='−'?a : a*b, x:RR(40,340), y:0}); }
    x.fillStyle='#0b1020'; x.fillRect(0,0,400,460); x.font='bold 20px sans-serif'; x.textAlign='center';
    items.forEach(o => { o.y += sp*dt; x.fillStyle='#fbbf24'; x.fillText(o.q, o.x, o.y); });
    const fell = items.filter(o=>o.y>460).length; if(fell){ life -= fell; items = items.filter(o=>o.y<=460); }
    x.fillStyle='#f87171'; x.textAlign='left'; x.fillText('❤'.repeat(Math.max(0,life)), 8, 450);
    if(life<=0){ g.best(score); g.over('遊戲結束', '得分 '+score); return false; } });
});

// 搶 30
add('race30','搶 30','math','🏁','輪流報數，每次可加 1～3，說出 30 的人贏！你先手', g => {
  let n = 0; const big = g.div('big', '0'); const msg = g.div('msg', '你的回合'); const row = g.div('row');
  const say = (who, k) => { n += k; big.textContent = n; msg.textContent = `${who} +${k}`; if(n>=30){ g.over(who==='你'?'你贏了！🎉':'電腦贏了', who==='你'?'':'提示：搶到 2、6、10、14… 就必勝'); return true; } };
  [1,2,3].forEach(k => g.button('+'+k, () => { if(n+k>30) return; if(say('你', k)) return;
    g.after(500, () => { let c = (30-n)%4 || RR(1,3); c = Math.min(c, 30-n); say('電腦', c); }); }, 'opt', row));
});

// 數字配對 10
add('pair10','湊十消除','math','🔟','點兩個相加等於 10 的數字（或兩個相同數字）消除它們', g => {
  let score = 0; g.score(0); g.best(); let sel = null; const N = 6;
  let v = range(36).map(()=>RR(1,9)); const msg = g.div('msg');
  const cells = g.grid(N,N,54,(r,c,b)=>{ const i=r*N+c; if(!v[i]) return;
    if(sel===null){ sel=i; draw(); return; } if(sel===i){ sel=null; draw(); return; }
    if(v[sel]+v[i]===10 || v[sel]===v[i]){ v[sel]=v[i]=0; score+=10; g.score(score); } sel=null; draw(); });
  const can = () => { const a = v.filter(Boolean); for(let i=0;i<a.length;i++) for(let j=i+1;j<a.length;j++) if(a[i]+a[j]===10||a[i]===a[j]) return true; return false; };
  const draw = () => { cells.forEach((b,i)=>{ b.textContent = v[i]||''; b.style.background = i===sel?'var(--pri)':v[i]?'':'transparent'; });
    if(v.every(x=>!x)){ g.best(score); g.over('全部清空！','得分 '+score); } else if(!can()){ g.best(score); g.over('沒有可消的了','得分 '+score); } };
  g.button('補充 6 個數字', () => { let k=0; for(let i=0;i<36&&k<6;i++) if(!v[i]){ v[i]=RR(1,9); k++; } score = Math.max(0, score-5); g.score(score); draw(); }, 'btn alt');
  draw();
});

// 時鐘讀時
add('clock','看時鐘','math','🕐','看指針，選出正確時間', g => {
  const x = g.canvas(220, 220); x.canvas.style.background = 'transparent';
  quiz(g, () => { const h = RR(1,12), m = R(12)*5; x.clearRect(0,0,220,220); x.save(); x.translate(110,110);
    x.fillStyle='#fff'; x.strokeStyle='#334155'; x.lineWidth=4; x.beginPath(); x.arc(0,0,100,0,7); x.fill(); x.stroke();
    x.fillStyle='#0f172a'; x.font='bold 16px sans-serif'; x.textAlign='center'; x.textBaseline='middle';
    for(let i=1;i<=12;i++){ const a=i*Math.PI/6; x.fillText(i, 82*Math.sin(a), -82*Math.cos(a)); }
    const hand = (a,l,w,c) => { x.strokeStyle=c; x.lineWidth=w; x.beginPath(); x.moveTo(0,0); x.lineTo(l*Math.sin(a), -l*Math.cos(a)); x.stroke(); };
    hand((h%12 + m/60)*Math.PI/6, 50, 6, '#0f172a'); hand(m*Math.PI/30, 75, 3, '#dc2626'); x.restore();
    const f = (hh,mm) => `${hh}:${String(mm).padStart(2,'0')}`;
    return ch('', f(h,m), () => f(RR(1,12), R(12)*5)); }, {small:true});
});
})();
