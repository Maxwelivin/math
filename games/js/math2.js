// ===== 數學類（二）=====
(function(){
const M = (id, name, icon, desc, gen, opt) => add(id, name, 'math', icon, desc, g => quiz(g, gen, opt));
const ch = (q, a, f) => ({q, a, opts: opts4(a, f)});
const frac = (n, d) => { const k = gcd(n, d); n /= k; d /= k; return d === 1 ? String(n) : n + '/' + d; };
const sgn = (v, first) => v < 0 ? (first ? '−' : ' − ') + Math.abs(v) : (first ? '' : ' + ') + v;

M('add3','三位數加法','➕','三位數相加', () => { const a=RR(100,999), b=RR(100,999); return {q:`${a} + ${b} = ?`, a:a+b}; });
M('sub3','三位數減法','➖','三位數相減', () => { const a=RR(300,999), b=RR(100,a); return {q:`${a} − ${b} = ?`, a:a-b}; });
M('mul3','三位乘一位','✖️','三位數乘一位數', () => { const a=RR(101,999), b=RR(2,9); return {q:`${a} × ${b} = ?`, a:a*b}; });
M('div2','二位數除法','➗','除數是兩位數的整除', () => { const b=RR(11,25), q=RR(2,12); return {q:`${b*q} ÷ ${b} = ?`, a:q}; });
M('sqsum','平方和','²','計算 a² + b²', () => { const a=RR(2,15), b=RR(2,15); return {q:`${a}² + ${b}² = ?`, a:a*a+b*b}; });
M('diffsq','平方差速算','²','用 a² − b² = (a+b)(a−b) 速算', () => { const a=RR(20,60), b=RR(2,a-1); return {q:`${a}² − ${b}² = ?`, a:a*a-b*b}; });
M('factor','因式分解','🧩','選出正確的因式分解', () => { const p=RR(-9,9)||1, q=RR(-9,9)||2; const f=(a,b)=>`(x${sgn(a)})(x${sgn(b)})`;
  const e = `x²${(p+q)?sgn(p+q)+'x':''}${sgn(p*q)}`.replace(' + 1x',' + x').replace(' − 1x',' − x');
  const s=new Set([f(p,q)]); for(const [a,b] of shuffle([[-p,-q],[p,-q],[-p,q],[p+1,q-1],[p-1,q+1],[p*q,1]])){ if(s.size>=4) break; if(a*b!==p*q||a+b!==p+q) s.add(f(a,b)); }
  return {q:e, a:f(p,q), opts:[...s]}; }, {small:true});
M('linfunc','一次函數求值','📈','代入 x 求 y', () => { const a=RR(-6,6)||2, b=RR(-10,10), x=RR(-5,5); return {q:`y = ${a}x${sgn(b)}\n當 x = ${x}，y = ?`, a:a*x+b}; });
M('slope','求斜率','📐','通過兩點的直線斜率', () => { const x1=RR(-5,5), y1=RR(-5,5), d=RR(1,4)*(R(2)?1:-1), m=RR(-4,4); return {q:`(${x1}, ${y1}) 與 (${x1+d}, ${y1+m*d})\n斜率 = ?`, a:m}; });
M('circle','圓面積周長','⭕','π 取 3.14', () => { const r=RR(1,10), area=R(2), v=+(area?3.14*r*r:2*3.14*r).toFixed(2); return ch(`半徑 ${r} 的圓\n${area?'面積':'周長'} = ?`, v, () => +(pick([3.14*r*r, 2*3.14*r, 3.14*r, 3.14*(r+1)*(r+1), 2*3.14*(r+1)])).toFixed(2)); });
M('volume','長方體體積','📦','長 × 寬 × 高', () => { const a=RR(2,12), b=RR(2,12), c=RR(2,12); return {q:`長 ${a}、寬 ${b}、高 ${c}\n體積 = ?`, a:a*b*c}; });
M('ratio','比例式','⚖️','求比例中的未知數', () => { const a=RR(1,9), b=RR(1,9), k=RR(2,9); return {q:`${a} : ${b} = ${a*k} : ?`, a:b*k}; });
M('speed','速率時間距離','🚗','距離 = 速率 × 時間', () => { const v=RR(2,12)*5, t=RR(2,8), k=R(3);
  return k===0 ? {q:`速率 ${v} 公里/時，走 ${t} 小時\n距離 = ? 公里`, a:v*t} : k===1 ? {q:`距離 ${v*t} 公里，走了 ${t} 小時\n速率 = ? 公里/時`, a:v} : {q:`距離 ${v*t} 公里，速率 ${v} 公里/時\n時間 = ? 小時`, a:t}; });
M('discount','打折計算','🏷️','原價打幾折後是多少錢？', () => { const p=RR(2,40)*50, k=RR(5,9); return {q:`原價 ${p} 元，打 ${k} 折\n售價 = ? 元`, a:p*k/10}; });
M('explaw','指數律','🔺','求指數', () => { const b=pick(['a','x','2','3']), m=RR(2,6), n=RR(2,6), t=R(3);
  return t===0 ? {q:`${b}^${m} × ${b}^${n} = ${b}^?`, a:m+n} : t===1 ? {q:`(${b}^${m})^${n} = ${b}^?`, a:m*n} : {q:`${b}^${m+n} ÷ ${b}^${n} = ${b}^?`, a:m}; });
M('sqrtsimp','根式化簡','√','把根號化成最簡', () => { const a=RR(2,6), b=pick([2,3,5,6,7]); const f=(p,q)=>`${p}√${q}`;
  return {q:`√${a*a*b} = ?`, a:f(a,b), opts:[f(a,b), f(b,a), f(a+1,b), f(a,b*2)]}; });
M('sumseq','等差級數','➕','求連續整數的和', () => { const n=RR(10,100); return {q:`1 + 2 + 3 + … + ${n} = ?`, a:n*(n+1)/2}; });
M('fact','階乘','❗','n! = 1 × 2 × … × n', () => { const n=RR(1,8); let f=1; for(let i=2;i<=n;i++) f*=i; return {q:`${n}! = ?`, a:f}; });
M('comb','排列組合','👥','有幾種選法？', () => { const n=RR(4,12); return R(2) ? {q:`${n} 人中選 2 人當正、副班長\n有幾種？`, a:n*(n-1)} : {q:`${n} 人中選 2 人當值日生\n有幾種？`, a:n*(n-1)/2}; }, {small:true});
M('prob','骰子機率','🎲','擲兩顆骰子，點數和的機率', () => { const s=RR(2,12), c=6-Math.abs(7-s), a=frac(c,36); const o=new Set([a]); while(o.size<4) o.add(frac(RR(1,6),36)); return {q:`擲兩顆骰子\n點數和為 ${s} 的機率 = ?`, a, opts:[...o]}; }, {small:true});
M('median','中位數','📊','求一組數據的中位數', () => { const n=pick([5,7]), a=range(n).map(()=>RR(1,50)); const s=a.slice().sort((x,y)=>x-y); return {q:a.join(', ')+'\n中位數 = ?', a:s[(n-1)/2]}; }, {small:true});
M('ndiv','因數個數','🔢','這個數有幾個正因數？', () => { const n=RR(6,100); let c=0; for(let i=1;i<=n;i++) if(n%i===0) c++; return {q:`${n} 有幾個正因數？`, a:c}; });
const pf = n => { const m={}; for(let p=2;n>1;p++) while(n%p===0){ m[p]=(m[p]||0)+1; n/=p; } return Object.entries(m).map(([p,e])=>e>1?`${p}^${e}`:p).join(' × '); };
M('pfactor','質因數分解','🌲','選出正確的質因數分解', () => { const n = pick([2,2,3,3,5,7])*pick([2,3,5,7,11])*pick([1,2,3,5]); const a=pf(n); const o=new Set([a]); let t=0; while(o.size<4&&t++<50){ const m=n*pick([2,3,5])/pick([1,2,3]); if(Number.isInteger(m)&&m!==n) o.add(pf(m)); } return {q:`${n} = ?`, a, opts:[...o]}; }, {small:true});
M('polygon','多邊形內角和','⬠','n 邊形內角和 = (n − 2) × 180°', () => { const n=RR(3,15); return {q:`${n} 邊形的內角和 = ? 度`, a:(n-2)*180}; });
M('quadrant','象限判斷','✛','這個點在第幾象限？', () => { const x=RR(1,9)*(R(2)?1:-1), y=RR(1,9)*(R(2)?1:-1); return {q:`(${x}, ${y})`, a: x>0?(y>0?'第一象限':'第四象限'):(y>0?'第二象限':'第三象限'), opts:['第一象限','第二象限','第三象限','第四象限']}; });
})();
