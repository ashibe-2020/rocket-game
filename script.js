// このプログラムの数値はすべてゲーム専用の架空ポイントです。
// 実在ロケットの性能計算・設計・飛行を再現するものではありません。
const parts = {
  engine: [
    {id:"engine-basic",name:"標準エンジン",cost:18,thrust:55,structure:5,fuel:5,delta:8,shape:1},
    {id:"engine-plus",name:"強化エンジン",cost:29,thrust:82,structure:0,fuel:0,delta:12,shape:2},
    {id:"engine-efficient",name:"効率重視エンジン",cost:25,thrust:63,structure:4,fuel:12,delta:15,shape:1}
  ],
  structure: [
    {id:"frame-standard",name:"標準フレーム",cost:16,thrust:0,structure:62,fuel:0,delta:0,shape:1},
    {id:"frame-light",name:"軽量フレーム",cost:24,thrust:0,structure:43,fuel:4,delta:8,shape:2},
    {id:"frame-reinforced",name:"補強フレーム",cost:27,thrust:0,structure:88,fuel:0,delta:0,shape:3}
  ],
  tank: [
    {id:"tank-compact",name:"コンパクトタンク",cost:12,thrust:0,structure:4,fuel:48,delta:5,shape:1},
    {id:"tank-standard",name:"標準タンク",cost:20,thrust:0,structure:0,fuel:72,delta:12,shape:2},
    {id:"tank-large",name:"大容量タンク",cost:29,thrust:0,structure:-8,fuel:94,delta:18,shape:3}
  ],
  booster: [
    {id:"booster-none",name:"ブースターなし",cost:0,thrust:0,structure:0,fuel:0,delta:0,shape:0},
    {id:"booster-small",name:"補助ブースター",cost:13,thrust:18,structure:-3,fuel:3,delta:3,shape:1},
    {id:"booster-pair",name:"強化ブースター",cost:22,thrust:31,structure:-9,fuel:5,delta:5,shape:2}
  ]
};
const labels = {engine:"エンジン",structure:"機体構造",tank:"燃料タンク",booster:"ブースター"};
const state = {engine:"engine-basic",structure:"frame-standard",tank:"tank-standard",booster:"booster-none"};
const $ = id => document.getElementById(id);
const allParts = Object.values(parts).flat();
const selectedPart = key => parts[key].find(p => p.id === state[key]);
function totals(){
  const chosen = Object.keys(state).map(selectedPart);
  const sum = field => chosen.reduce((n,p)=>n+(p[field]||0),0);
  return {
    cost:sum("cost"),
    thrust:clamp(35 + sum("thrust"),0,100),
    structure:clamp(35 + sum("structure"),0,100),
    fuel:clamp(15 + sum("fuel"),0,100),
    delta:clamp(20 + sum("delta"),0,100)
  };
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function renderParts(){
  const host=$("partGroups"); host.innerHTML="";
  Object.keys(parts).forEach(key=>{
    const group=document.createElement("div"); group.className="category";
    const title=document.createElement("div"); title.className="category-title";
    title.innerHTML=`<span>${labels[key]}</span><span>${key.toUpperCase()}</span>`;
    group.appendChild(title);
    parts[key].forEach(p=>{
      const btn=document.createElement("button");
      btn.className="part-option"+(state[key]===p.id?" selected":"");
      btn.innerHTML=`<span><span class="part-name">${p.name}</span><br><span class="part-detail">ゲーム内性能パラメータ</span></span><span class="part-cost">${p.cost} PT</span>`;
      btn.addEventListener("click",()=>{state[key]=p.id;render();});
      group.appendChild(btn);
    });
    host.appendChild(group);
  });
}
function setMetric(name,value){
  $(name+"Value").textContent=value;
  $(name+"Bar").style.width=value+"%";
}
function render(){
  renderParts();
  const t=totals(), left=100-t.cost;
  $("budgetLeft").textContent=left;
  $("budgetBar").style.width=clamp(left,0,100)+"%";
  $("budgetMessage").textContent=left<0?"予算を超えています。部品を見直そう":"予算内で設計できます";
  $("budgetMessage").style.color=left<0?"#ff9d85":"#8fb3c6";
  $("costValue").textContent=t.cost;
  setMetric("thrust",t.thrust);setMetric("structure",t.structure);
  setMetric("fuel",t.fuel);setMetric("delta",t.delta);
  $("launchButton").disabled=left<0;
  $("configName").textContent=`${selectedPart("engine").name.toUpperCase()} / ${selectedPart("structure").name.toUpperCase()}`;
  drawRocket();
}
function drawRocket(){
  const engine=selectedPart("engine"), frame=selectedPart("structure"), tank=selectedPart("tank"), booster=selectedPart("booster");
  const bodyW=frame.shape===2?76:frame.shape===3?92:84;
  const tankH=tank.shape===1?100:tank.shape===3?175:135;
  const engineW=engine.shape===2?58:42;
  const boosterW=booster.shape===2?24:booster.shape===1?18:0;
  const x=210-bodyW/2, y=165;
  let s=`<g stroke="#77a9c8" stroke-width="2" fill="url(#bodyGradient)">
    <path d="M210 75 Q${210+bodyW/2} 115 ${210+bodyW/2} 165 L${210+bodyW/2} ${165+tankH} L${210-bodyW/2} ${165+tankH} L${210-bodyW/2} 165 Q${210-bodyW/2} 115 210 75Z"/>
    <rect x="${x+5}" y="${165+tankH}" width="${bodyW-10}" height="52" rx="5" fill="#91a9bd"/>
    <rect x="${210-engineW/2}" y="${217}" width="${engineW}" height="35" rx="4" fill="#607f98"/>
    <path d="M${210-engineW/2+8} 252 L${210+engineW/2-8} 252 L210 312Z" fill="url(#flameGradient)" stroke="#ffb16e"/>
    <path d="M${210-bodyW/2} 260 L${210-bodyW/2-27} 305 L${210-bodyW/2+5} 294Z" fill="#668ba6"/>
    <path d="M${210+bodyW/2} 260 L${210+bodyW/2+27} 305 L${210+bodyW/2-5} 294Z" fill="#668ba6"/>
    <rect x="${x+7}" y="${180}" width="${bodyW-14}" height="3" fill="#4b7b9c" stroke="none"/>
    <circle cx="210" cy="140" r="13" fill="#234b66" stroke="#7cc5dc"/><circle cx="210" cy="140" r="7" fill="#10283b" stroke="#8bd7e9"/>
  </g>`;
  if(boosterW){
    [-1,1].forEach(side=>{
      const bx=side<0?210-bodyW/2-boosterW-8:210+bodyW/2+8;
      s+=`<g fill="#8fa9bc" stroke="#77a9c8" stroke-width="2"><path d="M${bx} 145 Q${bx+boosterW/2} 125 ${bx+boosterW} 145 L${bx+boosterW} 250 L${bx} 250Z"/><path d="M${bx} 250 L${bx+boosterW} 250 L${bx+boosterW/2} 280Z" fill="#d18b62"/></g>`;
    });
  }
  s+=`<g stroke="#77a9c8" stroke-width="1" fill="none"><path d="M210 65 V45 M195 52 H225"/><path d="M${x+12} ${165+tankH-15} H${x+bodyW-12}"/></g>`;
  $("rocketParts").innerHTML=s;
}
function analyze(){
  const t=totals();
  const checks=[
    {ok:t.thrust>=65,label:"推進性能",why:"上昇を支えるゲーム内指標が目標より低めです。"},
    {ok:t.structure>=58,label:"構造バランス",why:"機体の軽さと安定性のバランスを見直してみましょう。"},
    {ok:t.fuel>=65,label:"燃料余裕",why:"ミッションを続ける余裕が不足しています。"},
    {ok:t.delta>=58,label:"速度変更能力",why:"目標軌道へ移るためのゲーム内余裕が不足しています。"}
  ];
  const passed=checks.filter(c=>c.ok).length;
  const success=t.cost<=100&&passed===4;
  return {success,checks,passed};
}
function launch(){
  const result=analyze();
  $("resultPanel").hidden=false;
  $("resultPanel").scrollIntoView({behavior:"smooth",block:"start"});
  $("launchButton").disabled=true;
  $("flightRocket").classList.remove("animate");
  void $("flightRocket").offsetWidth;
  $("flightRocket").classList.add("animate");
  $("flightStatus").textContent="COUNTDOWN  3 · 2 · 1";
  $("flightCaption").textContent="シミュレーションを開始しています…";
  $("resultTitle").textContent="飛行シミュレーション";
  $("resultBadge").textContent="IN PROGRESS";
  $("analysisHeading").textContent="飛行結果を確認中";
  $("analysisText").textContent="設計した機体のゲーム内パラメータをもとに、ミッション条件を確認しています。";
  $("analysisList").innerHTML="";
  setTimeout(()=>{
    $("flightStatus").textContent=result.success?"ORBIT GOAL · ACHIEVED":"MISSION REVIEW · COMPLETE";
    $("flightCaption").textContent=result.success?"目標ミッションの条件を満たしました":"今回の設計では、すべての条件を満たせませんでした";
    $("resultTitle").textContent=result.success?"ミッション成功！":"ミッション分析";
    $("resultBadge").textContent=result.success?"SUCCESS":"NEEDS IMPROVEMENT";
    $("resultBadge").style.color=result.success?"#83dfb8":"#ffbd87";
    $("analysisHeading").textContent=result.success?"バランスの取れた設計です！":`4つの条件のうち ${result.passed} つをクリア`;
    $("analysisText").textContent=result.success
      ?"今回のゲーム内ミッション条件をすべて満たしました。どの部品が成功に貢献したか、設計パラメータを振り返ってみましょう。"
      :"失敗は次の設計へのヒントです。下の項目を参考に、部品を入れ替えて再挑戦しましょう。";
    $("analysisList").innerHTML=result.checks.map(c=>`<li>${c.ok?"✓":"△"} ${c.label}：${c.ok?"条件クリア":c.why}</li>`).join("");
    $("launchButton").disabled=totals().cost>100;
  },3900);
}
$("launchButton").addEventListener("click",launch);
$("retryButton").addEventListener("click",()=>{
  $("resultPanel").hidden=true;
  $("flightRocket").classList.remove("animate");
  $("resultBadge").style.color="";
  $("resultPanel").scrollIntoView({behavior:"smooth",block:"start"});
  $("launchButton").disabled=totals().cost>100;
});
render();
