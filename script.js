
// ── CONFIG ────────────────────────────────────────────────────────────
const CATEGORIES=[
  {name:'Love',  color:'#ff6eb4',rgb:'255,110,180',glow:'rgba(255,110,180,0.7)',burst:'💖'},
  {name:'Career',color:'#ffd700',rgb:'255,215,0',  glow:'rgba(255,215,0,0.7)',  burst:'⚡'},
  {name:'Health',color:'#5effa3',rgb:'94,255,163', glow:'rgba(94,255,163,0.7)', burst:'🌿'},
  {name:'Travel',color:'#5aaeff',rgb:'90,174,255', glow:'rgba(90,174,255,0.7)', burst:'🌊'},
  {name:'Family',color:'#ff9a5c',rgb:'255,154,92', glow:'rgba(255,154,92,0.7)', burst:'🌸'},
  {name:'Dream', color:'#b48bff',rgb:'180,139,255',glow:'rgba(180,139,255,0.7)',burst:'✨'},
  {name:'Other', color:'#e0e0e0',rgb:'224,224,224',glow:'rgba(224,224,224,0.5)',burst:'💫'},
];
let selectedCat=CATEGORIES[6];
let deadlineMode='none';

// ── STATE ─────────────────────────────────────────────────────────────
let wishes=JSON.parse(localStorage.getItem('wishverse_v3'))||[];
let activeStar=null;
let constellationMode=false;

// ── DOM REFS ──────────────────────────────────────────────────────────
const wishArea=document.getElementById('wishArea');
const wishCanvas=document.getElementById('wishCanvas');
const ctx=wishCanvas.getContext('2d');
const popupOverlay=document.getElementById('popupOverlay');
const popupWish=document.getElementById('popupWish');
const popupBadge=document.getElementById('popupBadge');
const popupDeadlineInfo=document.getElementById('popupDeadlineInfo');
const wishEmpty=document.getElementById('wishEmpty');

// ── INIT ──────────────────────────────────────────────────────────────
buildCategoryBtns();
buildFilterSelect();
createBgStars();
createFlowLines();
loadSavedStars();
renderGraveyard();
updateStats();
scheduleShooting();
setInterval(scheduleShooting,8000);
resizeCanvas();
window.addEventListener('resize',()=>{resizeCanvas();if(constellationMode)drawConstellation();});
// Set default deadline btn
document.getElementById('dlNo').classList.add('active');

// ── CURSOR ────────────────────────────────────────────────────────────
const cursor=document.getElementById('cursor');
const cursorRing=document.getElementById('cursorRing');
document.addEventListener('mousemove',e=>{
  cursor.style.left=e.clientX-5+'px';
  cursor.style.top=e.clientY-5+'px';
  cursorRing.style.left=e.clientX-18+'px';
  cursorRing.style.top=e.clientY-18+'px';
});
document.addEventListener('mousedown',()=>{cursor.style.transform='scale(1.8)';cursorRing.style.transform='scale(0.7)';});
document.addEventListener('mouseup',()=>{cursor.style.transform='scale(1)';cursorRing.style.transform='scale(1)';});

// ── DEADLINE ──────────────────────────────────────────────────────────
function setDeadlineMode(mode){
  deadlineMode=mode;
  document.getElementById('dlNo').classList.toggle('active',mode==='none');
  document.getElementById('dlYes').classList.toggle('active',mode==='date');
  document.getElementById('deadlinePicker').classList.toggle('show',mode==='date');
  if(mode==='date'){
    // Set min date to today
    const today=new Date().toISOString().split('T')[0];
    document.getElementById('deadlineDate').min=today;
  }
}

function getDeadlineStatus(deadlineStr){
  if(!deadlineStr)return 'none';
  const dl=new Date(deadlineStr);
  const now=new Date();
  const diff=(dl-now)/(1000*60*60*24);
  if(diff<0)return 'overdue';
  if(diff<=7)return 'soon';
  return 'ok';
}

function formatDeadline(deadlineStr){
  if(!deadlineStr)return '';
  const dl=new Date(deadlineStr);
  const now=new Date();
  const diff=Math.ceil((dl-now)/(1000*60*60*24));
  if(diff<0)return `Overdue by ${Math.abs(diff)} day${Math.abs(diff)!==1?'s':''}`;
  if(diff===0)return 'Due today';
  if(diff===1)return 'Due tomorrow';
  if(diff<=7)return `Due in ${diff} days`;
  return `Due ${dl.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`;
}

// ── CATEGORIES ───────────────────────────────────────────────────────
function buildCategoryBtns(){
  const el=document.getElementById('catBtns');
  CATEGORIES.forEach(cat=>{
    const btn=document.createElement('button');
    btn.className='cat-btn'+(cat===selectedCat?' active':'');
    btn.textContent=cat.name;
    btn.style.setProperty('--cat-color',cat.color);
    btn.style.setProperty('--cat-rgb',cat.rgb);
    btn.onclick=()=>{
      selectedCat=cat;
      el.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    };
    el.appendChild(btn);
  });
}

function buildFilterSelect(){
  const sel=document.getElementById('filterCat');
  CATEGORIES.forEach(cat=>{
    const opt=document.createElement('option');
    opt.value=cat.name;
    opt.textContent=cat.name;
    sel.appendChild(opt);
  });
}

// ── BACKGROUND ────────────────────────────────────────────────────────
function createBgStars(){
  for(let i=0;i<280;i++){
    const s=document.createElement('div');
    s.className='bg-star';
    s.style.left=Math.random()*window.innerWidth+'px';
    s.style.top=Math.random()*window.innerHeight+'px';
    s.style.animationDuration=(Math.random()*4+2)+'s';
    s.style.animationDelay=(Math.random()*5)+'s';
    s.style.width=s.style.height=(Math.random()>0.9?3:2)+'px';
    document.body.appendChild(s);
  }
}
function createFlowLines(){
  for(let i=0;i<14;i++){
    const l=document.createElement('div');
    l.className='flow-line';
    l.style.left=Math.random()*window.innerWidth+'px';
    l.style.top=Math.random()*window.innerHeight+'px';
    l.style.animationDuration=(Math.random()*8+6)+'s';
    l.style.animationDelay=(Math.random()*8)+'s';
    document.body.appendChild(l);
  }
}
function scheduleShooting(){
  setTimeout(()=>{
    const s=document.createElement('div');
    s.className='shooting-star';
    s.style.left=Math.random()*window.innerWidth+'px';
    s.style.top=Math.random()*window.innerHeight*0.5+'px';
    s.style.transform=`rotate(${-15+Math.random()*-20}deg)`;
    s.style.animationDuration='1.2s';
    document.body.appendChild(s);
    setTimeout(()=>s.remove(),1400);
  },Math.random()*2000);
}

// ── CANVAS ────────────────────────────────────────────────────────────
function resizeCanvas(){
  wishCanvas.width=wishArea.clientWidth;
  wishCanvas.height=wishArea.clientHeight;
}
function drawConstellation(){
  ctx.clearRect(0,0,wishCanvas.width,wishCanvas.height);
  const stars=[...wishArea.querySelectorAll('.wish-star')].filter(s=>s.style.display!=='none');
  if(stars.length<2)return;
  const pts=stars.map(s=>({x:parseInt(s.style.left)+11,y:parseInt(s.style.top)+11,cat:s.dataset.cat}));
  ctx.setLineDash([4,8]);
  ctx.lineWidth=0.8;
  for(let i=0;i<pts.length-1;i++){
    const a=pts[i],b=pts[i+1];
    const cat=CATEGORIES.find(c=>c.name===a.cat)||CATEGORIES[6];
    const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
    g.addColorStop(0,cat.color+'55');
    g.addColorStop(1,'rgba(143,123,255,0.2)');
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
    ctx.strokeStyle=g;ctx.stroke();
  }
}
function clearConstellation(){ctx.clearRect(0,0,wishCanvas.width,wishCanvas.height);}
function toggleConstellation(){
  constellationMode=!constellationMode;
  document.getElementById('constellBtn').classList.toggle('on',constellationMode);
  if(constellationMode)drawConstellation();else clearConstellation();
}

// ── CREATE WISH ───────────────────────────────────────────────────────
function createWish(){
  const input=document.getElementById('wishInput');
  const wish=input.value.trim();
  if(!wish)return;

  const cat=selectedCat;
  let deadline=null;
  if(deadlineMode==='date'){
    deadline=document.getElementById('deadlineDate').value||null;
  }

  const finalX=Math.random()*(wishArea.clientWidth-80)+30;
  const finalY=Math.random()*(wishArea.clientHeight-100)+30;

  const fly=document.createElement('div');
  fly.style.cssText=`position:absolute;width:24px;height:24px;left:50%;top:40px;z-index:99;transition:all 1.8s cubic-bezier(0.2,0.8,0.2,1);pointer-events:none;`;
  fly.innerHTML=starSVG(28,cat.color,cat.glow);
  wishArea.appendChild(fly);
  setTimeout(()=>{fly.style.left=finalX+'px';fly.style.top=finalY+'px';fly.style.transform='scale(0.8)';},80);
  setTimeout(()=>{
    fly.remove();
    const data={wish,cat:cat.name,x:finalX,y:finalY,completed:false,deadline,createdAt:new Date().toISOString()};
    const starEl=makeStar(data,wishes.length);
    wishArea.appendChild(starEl);
    wishes.push(data);
    saveWishes();
    updateStats();
    wishEmpty.style.display='none';
    if(constellationMode)drawConstellation();
    showToast('✦ Wish cast into the cosmos');
  },1900);

  input.value='';
}

function starSVG(size,color,glow){
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="--star-color:${color};--star-glow:${glow}">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="${color}"/>
  </svg>`;
}

function makeStar(item,index){
  const catObj=CATEGORIES.find(c=>c.name===item.cat)||CATEGORIES[6];
  const status=getDeadlineStatus(item.deadline);
  const star=document.createElement('div');
  star.className='wish-star'+(status==='overdue'?' overdue':'');
  star.style.left=item.x+'px';
  star.style.top=item.y+'px';
  star.style.setProperty('--star-color',catObj.color);
  star.style.setProperty('--star-glow',catObj.glow);
  star.style.animationDuration=(3.5+Math.random()*2)+'s';
  star.style.animationDelay=(Math.random()*2)+'s';
  star.dataset.wish=item.wish;
  star.dataset.cat=item.cat;
  star.dataset.deadline=item.deadline||'';
  star.dataset.index=index;

  let badgeHTML='';
  if(item.deadline){
    badgeHTML=`<div class="deadline-badge ${status}">${formatDeadline(item.deadline)}</div>`;
  }
  const label=item.wish.length>20?item.wish.slice(0,20)+'…':item.wish;
  star.innerHTML=badgeHTML+starSVG(24,catObj.color,catObj.glow)+`<span class="star-label">${label}</span>`;

  star.onclick=()=>{
    activeStar=star;
    popupOverlay.classList.add('show');
    popupWish.textContent=item.wish;
    popupBadge.textContent=catObj.name;
    popupBadge.style.background=catObj.color+'22';
    popupBadge.style.color=catObj.color;
    popupBadge.style.border=`1px solid ${catObj.color}44`;
    if(item.deadline){
      popupDeadlineInfo.textContent=formatDeadline(item.deadline);
      popupDeadlineInfo.className='popup-deadline-info '+status;
    } else {
      popupDeadlineInfo.className='popup-deadline-info none';
    }
  };
  return star;
}

// ── LOAD ──────────────────────────────────────────────────────────────
function loadSavedStars(){
  const active=wishes.filter(w=>!w.completed);
  if(active.length>0)wishEmpty.style.display='none';
  wishes.forEach((item,i)=>{
    if(item.completed)return;
    wishArea.appendChild(makeStar(item,i));
  });
}

// ── FILTER ────────────────────────────────────────────────────────────
function filterWishes(){
  const cf=document.getElementById('filterCat').value;
  const df=document.getElementById('filterDeadline').value;
  wishArea.querySelectorAll('.wish-star').forEach(s=>{
    const matchC=cf==='all'||s.dataset.cat===cf;
    let matchD=true;
    if(df==='overdue')matchD=getDeadlineStatus(s.dataset.deadline)==='overdue';
    else if(df==='soon')matchD=getDeadlineStatus(s.dataset.deadline)==='soon';
    else if(df==='nodeadline')matchD=!s.dataset.deadline;
    s.style.display=(matchC&&matchD)?'':'none';
  });
  if(constellationMode)drawConstellation();
}

// ── POPUP ACTIONS ─────────────────────────────────────────────────────
function closePopup(e){
  if(!e||e.target===popupOverlay)popupOverlay.classList.remove('show');
}

function deleteWish(){
  if(!activeStar)return;
  activeStar.style.transition='all 0.4s';
  activeStar.style.transform='scale(0)';
  activeStar.style.opacity='0';
  const idx=parseInt(activeStar.dataset.index);
  setTimeout(()=>activeStar.remove(),400);
  wishes.splice(idx,1);
  saveWishes();
  updateStats();
  popupOverlay.classList.remove('show');
  showToast('Wish removed from the cosmos');
  if(wishes.filter(w=>!w.completed).length===0)wishEmpty.style.display='flex';
  if(constellationMode)setTimeout(drawConstellation,500);
}

function completeWish(){
  if(!activeStar)return;
  createConfetti();
  activeStar.style.transition='all 0.8s ease';
  activeStar.style.transform='scale(3)';
  activeStar.style.opacity='0';
  const idx=parseInt(activeStar.dataset.index);
  setTimeout(()=>activeStar.remove(),800);
  wishes[idx].completed=true;
  wishes[idx].completedAt=new Date().toISOString();
  saveWishes();
  updateStats();
  renderGraveyard();
  document.getElementById('popupWish').textContent='✨ Congratulations — your dream became reality.';
  setTimeout(()=>popupOverlay.classList.remove('show'),2200);
  showToast('✦ Wish fulfilled! It now shines in your Supernova.');
  if(wishes.filter(w=>!w.completed).length===0)wishEmpty.style.display='flex';
  if(constellationMode)setTimeout(drawConstellation,1000);
}

// ── SUPERNOVA GRAVEYARD ────────────────────────────────────────────────
function renderGraveyard(){
  const grid=document.getElementById('supernovaGrid');
  const empty=document.getElementById('supernovaEmpty');
  const done=wishes.filter(w=>w.completed).reverse();

  if(!done.length){
    grid.innerHTML='';
    grid.appendChild(empty||createEmptyEl());
    if(empty)empty.style.display='block';
    return;
  }
  if(empty)empty.style.display='none';

  // Keep empty el in DOM, rebuild cards
  const existing=[...grid.querySelectorAll('.sn-card')];
  existing.forEach(c=>c.remove());

  // Build grid container if needed
  let sngrid=grid.querySelector('.sn-grid');
  if(!sngrid){sngrid=document.createElement('div');sngrid.className='sn-grid';grid.appendChild(sngrid);}
  sngrid.innerHTML='';

  done.forEach(item=>{
    const cat=CATEGORIES.find(c=>c.name===item.cat)||CATEGORIES[6];
    const completedDate=item.completedAt?new Date(item.completedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—';
    const createdDate=item.createdAt?new Date(item.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—';
    const deadlineTag=item.deadline?`<div class="sn-tag">📅 Deadline <span>${new Date(item.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span></div>`:'';

    const card=document.createElement('div');
    card.className='sn-card';
    card.style.setProperty('--sn-color',cat.color);
    card.innerHTML=`
      <div class="sn-burst">${cat.burst}</div>
      <div class="sn-cat" style="color:${cat.color};">${cat.name}</div>
      <div class="sn-wish">"${item.wish}"</div>
      <div class="sn-meta">
        <div class="sn-tag">✦ Wished <span>${createdDate}</span></div>
        <div class="sn-tag">💫 Fulfilled <span>${completedDate}</span></div>
        ${deadlineTag}
      </div>`;
    sngrid.appendChild(card);
  });
}

// ── STATS ─────────────────────────────────────────────────────────────
function updateStats(){
  const total=wishes.length;
  const completed=wishes.filter(w=>w.completed).length;
  const remaining=total-completed;
  const pct=total?Math.round(completed/total*100):0;
  const overdue=wishes.filter(w=>!w.completed&&getDeadlineStatus(w.deadline)==='overdue').length;

  animateCount('totalCount',total);
  animateCount('completedCount',completed);
  animateCount('remainingCount',remaining);
  animateCount('overdueCount',overdue);
  document.getElementById('percentCount').textContent=pct+'%';

  const bd=document.getElementById('catBreakdown');
  bd.innerHTML='';
  CATEGORIES.forEach(cat=>{
    const count=wishes.filter(w=>w.cat===cat.name).length;
    if(!count)return;
    const pctBar=total?Math.round(count/total*100):0;
    bd.innerHTML+=`<div class="cat-bar-row">
      <span class="cat-bar-label">${cat.name}</span>
      <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${pctBar}%;background:${cat.color};"></div></div>
      <span class="cat-bar-count">${count}</span>
    </div>`;
  });
}

function animateCount(id,target){
  const el=document.getElementById(id);
  const start=parseInt(el.textContent)||0;
  if(start===target)return;
  const step=target>start?1:-1;
  const steps=Math.abs(target-start);
  const interval=Math.max(16,400/steps);
  let cur=start;
  const t=setInterval(()=>{cur+=step;el.textContent=cur;if(cur===target)clearInterval(t);},interval);
}

// ── CONFETTI ──────────────────────────────────────────────────────────
function createConfetti(){
  const colors=['#ff4d6d','#ffd60a','#00f5d4','#c77dff','#ffffff','#4cc9f0','#ff6eb4','#5aaeff'];
  for(let i=0;i<130;i++){
    const c=document.createElement('div');
    c.className='confetti';
    document.body.appendChild(c);
    c.style.cssText=`background:${colors[~~(Math.random()*colors.length)]};left:${window.innerWidth/2}px;top:${window.innerHeight/2}px;width:${Math.random()*10+5}px;height:${Math.random()*10+5}px;border-radius:${Math.random()>.5?'50%':'3px'};`;
    const x=(Math.random()-.5)*1000,y=(Math.random()-.5)*900,r=Math.random()*720;
    c.animate([{transform:'translate(0,0) rotate(0deg)',opacity:1},{transform:`translate(${x}px,${y}px) rotate(${r}deg)`,opacity:0}],{duration:2200+Math.random()*1500,easing:'cubic-bezier(0.1,0.8,0.2,1)',fill:'forwards'});
    setTimeout(()=>c.remove(),4000);
  }
}

// ── TOAST ─────────────────────────────────────────────────────────────
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2800);
}

// ── SAVE ──────────────────────────────────────────────────────────────
function saveWishes(){localStorage.setItem('wishverse_v3',JSON.stringify(wishes));}

// ── KEYBOARD ──────────────────────────────────────────────────────────
window.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&document.activeElement===document.getElementById('wishInput'))createWish();
  if(e.key==='Escape')closePopup();
});
