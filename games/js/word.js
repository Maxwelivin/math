// ===== 知識・文字類 =====
(function(){
const Wd = (id,name,icon,desc,run) => add(id,name,'word',icon,desc,run);
const pairQuiz = (list, qf, af, pool) => () => { const it = pick(list); const a = af(it); const others = shuffle((pool||list).map(af).filter(v=>v!==a)).slice(0,3); return {q: qf(it), a, opts:[a, ...others]}; };

const WORDS5 = 'apple beach brain bread chair chess clock cloud dance dream earth flame fruit ghost grape green happy heart horse house juice knife lemon light magic money mouse music night ocean paint party piano pizza plane plant queen radio river robot salad sheep shirt smile snake space spoon sport storm sugar table tiger toast train tooth truck water whale world zebra angel bacon candy daisy eagle fairy glove honey igloo jelly koala laser mango noble olive pearl quilt rainy sunny tulip uncle vivid wagon youth zesty badge cabin delta flute giant hotel index joker kayak lunch medal nurse orbit pilot quick roast scale thumb urban vocal wheat yacht'.split(' ');
const LONG = 'elephant computer mountain butterfly umbrella chocolate dinosaur hospital kangaroo pineapple sandwich telephone vacation adventure birthday calendar triangle notebook football basketball strawberry volcano octopus penguin library painting airplane hamburger universe diamond treasure festival magazine squirrel'.split(' ');
const VOCAB = [['apple','蘋果'],['book','書'],['cat','貓'],['dog','狗'],['egg','蛋'],['fish','魚'],['girl','女孩'],['hand','手'],['ice','冰'],['jump','跳'],['king','國王'],['lion','獅子'],['milk','牛奶'],['nose','鼻子'],['orange','柳橙'],['pen','筆'],['queen','皇后'],['rain','雨'],['sun','太陽'],['tree','樹'],['umbrella','雨傘'],['violin','小提琴'],['window','窗戶'],['yellow','黃色'],['zoo','動物園'],['school','學校'],['teacher','老師'],['friend','朋友'],['family','家庭'],['water','水'],['river','河流'],['mountain','山'],['flower','花'],['bird','鳥'],['house','房子'],['car','汽車'],['bus','公車'],['train','火車'],['doctor','醫生'],['kitchen','廚房'],['breakfast','早餐'],['dinner','晚餐'],['beautiful','美麗的'],['happy','快樂的'],['angry','生氣的'],['tired','疲倦的'],['hungry','飢餓的'],['library','圖書館'],['hospital','醫院'],['weather','天氣'],['summer','夏天'],['winter','冬天'],['music','音樂'],['science','科學'],['history','歷史'],['question','問題'],['answer','答案'],['morning','早上'],['night','夜晚'],['computer','電腦']];
const EMOJI = [['🍎','apple'],['🐶','dog'],['🐱','cat'],['🐟','fish'],['🌞','sun'],['🌙','moon'],['⭐','star'],['🚗','car'],['🏠','house'],['📚','book'],['🌳','tree'],['🌸','flower'],['🐦','bird'],['🍌','banana'],['🥛','milk'],['🍞','bread'],['⚽','ball'],['🎂','cake'],['🐷','pig'],['🐮','cow'],['🐸','frog'],['🦁','lion'],['🐯','tiger'],['🐘','elephant'],['🐵','monkey'],['🐰','rabbit'],['🐍','snake'],['🚌','bus'],['✈️','plane'],['🚢','ship'],['🕐','clock'],['🔑','key'],['👟','shoe'],['🎩','hat'],['☂️','umbrella'],['🍕','pizza'],['🍉','watermelon'],['🍇','grape'],['🥚','egg'],['🌧️','rain']];
const CAP = [['日本','東京','亞洲'],['韓國','首爾','亞洲'],['美國','華盛頓','北美洲'],['英國','倫敦','歐洲'],['法國','巴黎','歐洲'],['德國','柏林','歐洲'],['義大利','羅馬','歐洲'],['西班牙','馬德里','歐洲'],['俄羅斯','莫斯科','歐洲'],['加拿大','渥太華','北美洲'],['澳洲','坎培拉','大洋洲'],['巴西','巴西利亞','南美洲'],['阿根廷','布宜諾斯艾利斯','南美洲'],['埃及','開羅','非洲'],['印度','新德里','亞洲'],['泰國','曼谷','亞洲'],['越南','河內','亞洲'],['菲律賓','馬尼拉','亞洲'],['印尼','雅加達','亞洲'],['馬來西亞','吉隆坡','亞洲'],['土耳其','安卡拉','亞洲'],['希臘','雅典','歐洲'],['荷蘭','阿姆斯特丹','歐洲'],['瑞典','斯德哥爾摩','歐洲'],['挪威','奧斯陸','歐洲'],['芬蘭','赫爾辛基','歐洲'],['丹麥','哥本哈根','歐洲'],['波蘭','華沙','歐洲'],['奧地利','維也納','歐洲'],['瑞士','伯恩','歐洲'],['葡萄牙','里斯本','歐洲'],['墨西哥','墨西哥城','北美洲'],['紐西蘭','威靈頓','大洋洲'],['肯亞','奈洛比','非洲'],['沙烏地阿拉伯','利雅德','亞洲'],['伊朗','德黑蘭','亞洲'],['蒙古','烏蘭巴托','亞洲'],['愛爾蘭','都柏林','歐洲'],['比利時','布魯塞爾','歐洲'],['匈牙利','布達佩斯','歐洲'],['捷克','布拉格','歐洲'],['智利','聖地牙哥','南美洲'],['秘魯','利馬','南美洲'],['奈及利亞','阿布加','非洲'],['摩洛哥','拉巴特','非洲'],['古巴','哈瓦那','北美洲']];
const FLAGS = [['🇯🇵','日本'],['🇰🇷','韓國'],['🇺🇸','美國'],['🇬🇧','英國'],['🇫🇷','法國'],['🇩🇪','德國'],['🇮🇹','義大利'],['🇪🇸','西班牙'],['🇨🇦','加拿大'],['🇦🇺','澳洲'],['🇧🇷','巴西'],['🇦🇷','阿根廷'],['🇲🇽','墨西哥'],['🇮🇳','印度'],['🇹🇭','泰國'],['🇻🇳','越南'],['🇵🇭','菲律賓'],['🇮🇩','印尼'],['🇲🇾','馬來西亞'],['🇸🇬','新加坡'],['🇹🇷','土耳其'],['🇬🇷','希臘'],['🇳🇱','荷蘭'],['🇸🇪','瑞典'],['🇳🇴','挪威'],['🇫🇮','芬蘭'],['🇩🇰','丹麥'],['🇵🇱','波蘭'],['🇦🇹','奧地利'],['🇨🇭','瑞士'],['🇵🇹','葡萄牙'],['🇳🇿','紐西蘭'],['🇿🇦','南非'],['🇪🇬','埃及'],['🇷🇺','俄羅斯'],['🇮🇪','愛爾蘭'],['🇧🇪','比利時'],['🇺🇦','烏克蘭'],['🇨🇱','智利'],['🇳🇬','奈及利亞']];
const ELEM = [['H','氫'],['He','氦'],['Li','鋰'],['Be','鈹'],['B','硼'],['C','碳'],['N','氮'],['O','氧'],['F','氟'],['Ne','氖'],['Na','鈉'],['Mg','鎂'],['Al','鋁'],['Si','矽'],['P','磷'],['S','硫'],['Cl','氯'],['Ar','氬'],['K','鉀'],['Ca','鈣'],['Fe','鐵'],['Cu','銅'],['Zn','鋅'],['Ag','銀'],['Au','金'],['Hg','汞'],['Pb','鉛'],['I','碘'],['Mn','錳'],['Ni','鎳'],['Sn','錫']];
const FORM = [['水','H₂O'],['二氧化碳','CO₂'],['氧氣','O₂'],['氮氣','N₂'],['氯化鈉（食鹽）','NaCl'],['氨','NH₃'],['甲烷','CH₄'],['葡萄糖','C₆H₁₂O₆'],['碳酸鈣','CaCO₃'],['硫酸','H₂SO₄'],['氯化氫（鹽酸）','HCl'],['氫氧化鈉','NaOH'],['過氧化氫','H₂O₂'],['一氧化碳','CO'],['乙醇（酒精）','C₂H₅OH'],['碳酸氫鈉（小蘇打）','NaHCO₃'],['硝酸','HNO₃'],['氫氧化鈣','Ca(OH)₂'],['氧化銅','CuO'],['臭氧','O₃']];
const ANT = [['大','小'],['高','矮'],['長','短'],['快','慢'],['多','少'],['冷','熱'],['黑','白'],['上','下'],['前','後'],['左','右'],['開','關'],['進','出'],['真','假'],['新','舊'],['胖','瘦'],['早','晚'],['輕','重'],['遠','近'],['強','弱'],['買','賣'],['哭','笑'],['乾','濕'],['深','淺'],['寬','窄'],['厚','薄'],['甜','苦'],['動','靜'],['熱鬧','冷清'],['勇敢','膽小'],['聰明','愚笨'],['安全','危險'],['成功','失敗'],['開始','結束'],['增加','減少'],['簡單','複雜'],['光明','黑暗'],['快樂','悲傷'],['乾淨','骯髒'],['整齊','凌亂'],['勤勞','懶惰']];
const IDIOM = '一石二鳥 三心二意 四面八方 五顏六色 七上八下 九牛一毛 十全十美 半途而廢 畫蛇添足 守株待兔 對牛彈琴 亡羊補牢 井底之蛙 狐假虎威 杯弓蛇影 刻舟求劍 掩耳盜鈴 自相矛盾 拔苗助長 胸有成竹 一鳴驚人 一帆風順 一心一意 二話不說 百發百中 千方百計 萬紫千紅 風和日麗 鳥語花香 春暖花開 水落石出 雪中送炭 錦上添花 臥虎藏龍 龍飛鳳舞 馬到成功 虎頭蛇尾 如魚得水 對症下藥 大公無私 光明磊落 實事求是 腳踏實地 專心致志 學以致用 溫故知新 不恥下問 有備無患 熟能生巧 眾志成城'.split(' ');
const DYN = ['夏','商','周','秦','漢','三國','晉','南北朝','隋','唐','五代十國','宋','元','明','清'];
const MORSE = {A:'·−',B:'−···',C:'−·−·',D:'−··',E:'·',F:'··−·',G:'−−·',H:'····',I:'··',J:'·−−−',K:'−·−',L:'·−··',M:'−−',N:'−·',O:'−−−',P:'·−−·',Q:'−−·−',R:'·−·',S:'···',T:'−',U:'··−',V:'···−',W:'·−−',X:'−··−',Y:'−·−−',Z:'−−··'};

// 猜單字（吊人）
Wd('hangman','猜單字','🔤','一次猜一個字母，錯 6 次前猜出英文單字', g => {
  const w = pick(LONG).toUpperCase(), got = new Set(); let bad = 0;
  const pic = g.div('big'); const word = g.div('big'); word.style.letterSpacing='8px'; word.style.fontFamily='monospace'; const kb = g.div('row'); kb.style.maxWidth='520px';
  const draw = () => { pic.textContent = ['😀','🙂','😐','😟','😨','😰','💀'][bad]; word.textContent = [...w].map(c=>got.has(c)?c:'_').join(''); g.info(`錯誤 ${bad} / 6`);
    if([...w].every(c=>got.has(c))) g.over('猜對了！🎉', w); else if(bad>=6) g.over('失敗了', '答案是 ' + w); };
  const guess = c => { if(got.has(c)||g.ended) return; got.add(c); if(!w.includes(c)) bad++; const b=kb.querySelector(`[data-c="${c}"]`); if(b){ b.disabled=true; b.style.opacity=.3; } draw(); };
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(c=>{ const b=g.button(c,()=>guess(c),'opt',kb); b.dataset.c=c; b.style.minWidth='38px'; b.style.padding='8px'; });
  g.onKey(k=>{ if(/^[a-z]$/i.test(k)) guess(k.toUpperCase()); }); draw();
});

// 猜詞挑戰
Wd('wordguess','五字母猜詞','🟩','6 次機會猜出 5 個字母的英文單字。綠=位置對、黃=有這字母但位置錯', g => {
  const ans = pick(WORDS5).toUpperCase(); let rows=[], cur='';
  const board = g.div(''); board.style.cssText='display:grid;grid-template-rows:repeat(6,50px);gap:6px';
  const kb = g.div(''); kb.style.cssText='display:flex;flex-direction:column;gap:6px;align-items:center'; const st = {};
  const draw = () => { board.innerHTML=''; for(let r=0;r<6;r++){ const row=document.createElement('div'); row.style.cssText='display:grid;grid-template-columns:repeat(5,50px);gap:6px';
      const w = rows[r]?.w ?? (r===rows.length?cur:''); for(let c=0;c<5;c++){ const d=document.createElement('div'); d.className='cell'; d.style.fontSize='24px'; d.textContent=w[c]||'';
        if(rows[r]){ const s=rows[r].s[c]; d.style.background = s===2?'#16a34a':s===1?'#ca8a04':'#475569'; d.style.color='#fff'; } row.appendChild(d); } board.appendChild(row); }
    kb.innerHTML=''; ['QWERTYUIOP','ASDFGHJKL','⏎ZXCVBNM⌫'].forEach(line=>{ const r=document.createElement('div'); r.className='row'; r.style.gap='4px';
      [...line].forEach(c=>{ const b=g.button(c,()=>key(c),'opt',r); b.style.cssText+=`;min-width:${c==='⏎'||c==='⌫'?50:32}px;padding:10px 4px;font-size:1rem;${st[c]===2?'background:#16a34a;color:#fff':st[c]===1?'background:#ca8a04;color:#fff':st[c]===0?'background:#475569;color:#fff':''}`; }); kb.appendChild(r); }); };
  const key = c => { if(g.ended) return; if(c==='⌫') cur=cur.slice(0,-1); else if(c==='⏎'){ if(cur.length<5) return;
      const s=Array(5).fill(0), rest=[...ans]; [...cur].forEach((ch,i)=>{ if(ch===ans[i]){ s[i]=2; rest[i]=null; } }); [...cur].forEach((ch,i)=>{ if(!s[i]){ const j=rest.indexOf(ch); if(j>=0){ s[i]=1; rest[j]=null; } } });
      [...cur].forEach((ch,i)=>st[ch]=Math.max(st[ch]??0,s[i])); rows.push({w:cur,s}); const w=cur; cur='';
      draw(); if(w===ans){ g.best(rows.length,true); return g.over('答對了！🎉', `${rows.length} 次猜中 ${ans}`); } if(rows.length>=6) return g.over('沒猜到', '答案是 '+ans); }
    else if(cur.length<5) cur+=c; draw(); };
  g.onKey(k=>{ if(k==='Enter') key('⏎'); else if(k==='Backspace') key('⌫'); else if(/^[a-z]$/i.test(k)) key(k.toUpperCase()); });
  g.best(null); draw();
});

Wd('anagram','單字重組','🔀','把打亂的字母重組成正確的英文單字', g => quiz(g, () => { const w=pick([...WORDS5,...LONG]); let s; do{ s=shuffle([...w]).join(''); }while(s===w); return {q:s.toUpperCase().split('').join(' '), a:w}; }, {text:true, time:90}));

// 找字遊戲
Wd('wordsearch','單字搜尋','🔍','在字母方陣中找出所有單字：點第一個字母，再點最後一個字母', g => {
  const N=10, grid=Array(N*N).fill(null), list=shuffle(WORDS5.concat(['cat','dog','sun','moon','star','tree','book','fish'])).slice(0,8).map(w=>w.toUpperCase()), placed=[];
  list.forEach(w=>{ for(let t=0;t<200;t++){ const [dr,dc]=pick([[0,1],[1,0],[1,1],[0,-1],[-1,0],[1,-1]]); const r=R(N), c=R(N); const cs=[...w].map((_,i)=>[r+dr*i,c+dc*i]);
      if(cs.every(([a,b],i)=>a>=0&&b>=0&&a<N&&b<N&&(!grid[a*N+b]||grid[a*N+b]===w[i]))){ cs.forEach(([a,b],i)=>grid[a*N+b]=w[i]); placed.push({w,cs:cs.map(([a,b])=>a*N+b)}); break; } } });
  for(let i=0;i<N*N;i++) if(!grid[i]) grid[i]=String.fromCharCode(65+R(26));
  const found=new Set(), mark=new Set(); let start=null;
  const words=g.div('row');
  const cells=g.grid(N,N,36,(r,c)=>{ const i=r*N+c; if(start===null){ start=i; draw(); return; }
    const hitW = placed.find(p=>!found.has(p.w)&&((p.cs[0]===start&&p.cs.at(-1)===i)||(p.cs.at(-1)===start&&p.cs[0]===i))); if(hitW){ found.add(hitW.w); hitW.cs.forEach(k=>mark.add(k)); } start=null; draw(); });
  const draw = () => { cells.forEach((b,i)=>{ b.textContent=grid[i]; b.style.background = i===start?'#facc15':mark.has(i)?'#86efac':''; });
    words.innerHTML = placed.map(p=>`<span style="padding:4px 8px;border-radius:6px;background:var(--card);${found.has(p.w)?'text-decoration:line-through;opacity:.5':''}">${p.w}</span>`).join('');
    g.info(`找到 ${found.size} / ${placed.length}`); if(found.size===placed.length) g.over('全部找到了！🎉',''); };
  draw();
});

Wd('idiom','成語填空','🀄','選出成語中缺少的字', g => quiz(g, () => { const w=pick(IDIOM), i=R(4); const a=w[i]; const pool=[...new Set(IDIOM.join(''))].filter(c=>c!==a);
  return {q:[...w].map((c,k)=>k===i?'□':c).join(''), a, opts:[a,...shuffle(pool).slice(0,3)]}; }));
Wd('en2zh','英翻中','🇬🇧','選出英文單字的中文意思', g => quiz(g, pairQuiz(VOCAB, v=>v[0], v=>v[1])));
Wd('zh2en','中翻英','🈶','選出中文對應的英文單字', g => quiz(g, pairQuiz(VOCAB, v=>v[1], v=>v[0])));
Wd('emojispell','看圖拼單字','🖍️','看圖示，輸入它的英文單字', g => quiz(g, () => { const e=pick(EMOJI); return {q:e[0]+'\n'+e[1][0]+' '+'_ '.repeat(e[1].length-1), a:e[1]}; }, {text:true, time:90}));
Wd('capital','世界首都','🏙️','選出這個國家的首都', g => quiz(g, pairQuiz(CAP, v=>v[0]+' 的首都是？', v=>v[1]), {small:true}));
Wd('continent','國家在哪洲','🌍','這個國家位於哪一洲？', g => quiz(g, () => { const c=pick(CAP); return {q:c[0], a:c[2], opts:['亞洲','歐洲','非洲','北美洲','南美洲','大洋洲']}; }));
Wd('flags','認識國旗','🚩','看國旗選國家', g => quiz(g, pairQuiz(FLAGS, v=>v[0], v=>v[1])));
Wd('elements','元素符號','⚗️','選出元素符號對應的中文名稱', g => quiz(g, () => R(2) ? pairQuiz(ELEM, v=>v[0], v=>v[1])() : pairQuiz(ELEM, v=>v[1], v=>v[0])()));
Wd('formula','化學式配對','🧪','選出物質正確的化學式', g => quiz(g, pairQuiz(FORM, v=>v[0], v=>v[1]), {small:true}));
Wd('antonym','反義詞','↔️','選出意思相反的詞', g => quiz(g, () => { const p=pick(ANT), k=R(2), a=p[1-k]; const pool=ANT.flat().filter(w=>w!==a&&w!==p[k]&&w.length===a.length); return {q:p[k]+' 的反義詞？', a, opts:[a,...shuffle(pool).slice(0,3)]}; }, {small:true}));
Wd('morse','摩斯密碼','📡','看摩斯密碼，選出對應的英文字母', g => quiz(g, () => { const k=pick(Object.keys(MORSE)); return {q:MORSE[k], a:k, opts:opts4(k,()=>pick(Object.keys(MORSE)))}; }));
Wd('dynasty','朝代順序','📜','中國歷史朝代：選出下一個朝代', g => quiz(g, () => { const i=R(DYN.length-1); const a=DYN[i+1]; return {q:DYN[i]+' 之後是？', a, opts:[a,...shuffle(DYN.filter(d=>d!==a&&d!==DYN[i])).slice(0,3)]}; }, {small:true}));

// 字母順序
Wd('alphabet','字母排序','🔠','依照 A 到 Z 的順序點完 26 個字母', g => {
  const L=shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')); let k=0, t0=0; g.best(null);
  const cells=g.grid(4,7,52,(r,c,b)=>{ const i=r*7+c; if(i>=26) return; if(L[i]!==String.fromCharCode(65+k)){ b.style.background='#fecaca'; setTimeout(()=>b.style.background='',150); return; }
    if(!k) t0=performance.now(); k++; b.style.visibility='hidden'; g.info('下一個：'+(k<26?String.fromCharCode(65+k):''));
    if(k===26){ const s=+((performance.now()-t0)/1000).toFixed(2); g.best(s,true); g.over(s+' 秒','完成！'); } });
  cells.forEach((b,i)=>{ b.textContent=L[i]||''; if(i>=26) b.style.visibility='hidden'; }); g.info('下一個：A');
});
})();
