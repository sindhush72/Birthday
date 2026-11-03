/* ===== Album settings (edit these) ===== */
const IMAGE_COUNT = 44;                      // number of photos
const IMAGE_DIR   = 'assets/images/';       // put photos here, named 1.jpg, 2.jpg ... 58.jpg
const IMAGE_EXTS  = ['jpeg','jpg','png','webp','JPG','PNG'];   // tries each if one is missing
const COVER_TITLE = 'Our Love Story';
const COVER_SUB   = `${IMAGE_COUNT} moments · one forever`;
const DEDICATION  = ['To my love,', 'every page is a heartbeat'];
const CAPTIONS    = {};                      // optional, e.g. {1:'Our first day', 7:'Sunset together'}
/* ======================================= */

startButterflies(document.getElementById('bg'));
const book = document.getElementById('book');
const wrap = document.getElementById('bookwrap');

/* ---------- build the pages ---------- */
function photoPage(n){
  if (n > IMAGE_COUNT) return `<div class="page"><div class="photo"><div class="ph"><b>♥</b></div></div></div>`;
  return `<div class="page"><div class="photo">
    <img class="img" data-n="${n}" data-try="0" src="${IMAGE_DIR}${n}.${IMAGE_EXTS[0]}" alt="Memory ${n}" loading="${n<8?'eager':'lazy'}">
    ${CAPTIONS[n] ? `<div class="cap">${CAPTIONS[n]}</div>` : ''}
  </div><div class="pnum">— ${n} —</div></div>`;
}
const twinkles = Array.from({length:14},()=>`<span class="tw" style="left:${Math.random()*92+2}%;top:${Math.random()*92+2}%;animation-delay:${(Math.random()*2.2).toFixed(2)}s"></span>`).join('');
const frontCover = `<div class="cover front-cover"><div class="frame"></div>${twinkles}<div class="emblem">💜</div><h2>${COVER_TITLE}</h2><p>${COVER_SUB}</p></div>`;
const inside = `<div class="inside"><div><div class="t">${DEDICATION[0]}</div><div class="s">${DEDICATION[1]}</div></div></div>`;
const theEnd = `<div class="inside"><div><div class="t">The End?</div><div class="s">…no, just the beginning ♥</div></div></div>`;
const backCover = `<div class="cover"><div class="frame"></div>${twinkles}<div class="emblem">♥</div><h2>Forever Yours</h2></div>`;

const leaves = [];
const photoLeaves = Math.ceil(IMAGE_COUNT/2);
leaves.push([frontCover, inside]);
for (let k=1;k<=photoLeaves;k++) leaves.push([photoPage(2*k-1), photoPage(2*k)]);
leaves.push([theEnd, backCover]);
const L = leaves.length;

const els = leaves.map(([f,b],i)=>{
  const d = document.createElement('div');
  d.className = 'leaf';
  d.innerHTML = `<div class="face front">${f}</div><div class="face back">${b}</div>`;
  book.appendChild(d); return d;
});

/* image fallbacks: try other extensions, then show a placeholder */
document.addEventListener('error', e=>{
  const img = e.target; if (!(img instanceof HTMLImageElement) || !img.dataset.n) return;
  const t = +img.dataset.try + 1;
  if (t < IMAGE_EXTS.length){ img.dataset.try = t; img.src = `${IMAGE_DIR}${img.dataset.n}.${IMAGE_EXTS[t]}`; }
  else img.replaceWith(Object.assign(document.createElement('div'),{className:'ph',innerHTML:`<b>♥</b>photo ${img.dataset.n}<br><small>add ${img.dataset.n}.jpg to assets/images</small>`}));
}, true);

/* ---------- flipping ---------- */
let cur = 0, busy = false;
const DUR = 1150;
function layout(){
  els.forEach((el,i)=>{ el.style.zIndex = i < cur ? i : L - i; });
  wrap.style.transform = cur===0 ? 'translateX(-25%)' : cur===L ? 'translateX(25%)' : 'translateX(0)';
  const pg = cur===0 ? null : cur===L ? null : Math.min(IMAGE_COUNT, cur*2);
  document.getElementById('indicator').textContent =
    cur===0 ? 'Tap the cover to open ♡' : cur===L ? 'Forever yours ♥' : cur===1 ? `Photo 1 of ${IMAGE_COUNT}` : cur===L-1 ? `Photo ${IMAGE_COUNT} · The End` : `Photos ${cur*2-2}–${Math.min(IMAGE_COUNT,cur*2-1)} of ${IMAGE_COUNT}`;
  document.getElementById('prev').disabled = cur===0;
  document.getElementById('next').disabled = cur===L;
}
function go(dir){
  if (busy) return;
  if (dir>0 && cur>=L) return; if (dir<0 && cur<=0) return;
  busy = true;
  const i = dir>0 ? cur : cur-1, el = els[i];
  el.style.zIndex = L + 10;                 // lift the turning page above everything
  el.classList.remove('turning'); void el.offsetWidth; el.classList.add('turning');
  if (dir>0){ el.classList.add('flipped'); cur++; } else { el.classList.remove('flipped'); cur--; }
  if (i===0 && dir>0){ el.classList.add('opening'); magicBurst(); }
  if (i===0 && dir<0){ magicBurst(.6); }
  wrap.style.transform = cur===0 ? 'translateX(-25%)' : cur===L ? 'translateX(25%)' : 'translateX(0)';
  setTimeout(()=>{ el.classList.remove('turning','opening'); layout(); busy=false; }, DUR);
}
const next = ()=>go(1), prev = ()=>go(-1);
document.getElementById('next').onclick = next;
document.getElementById('prev').onclick = prev;
book.addEventListener('click', e=>{
  const r = book.getBoundingClientRect();
  (e.clientX > r.left + r.width/2 || cur===0) ? (cur===L ? prev() : next()) : prev();
});
addEventListener('keydown', e=>{ if(e.key==='ArrowRight'||e.key===' ') next(); if(e.key==='ArrowLeft') prev(); });
let sx=null, sy=null, swiped=false;
book.addEventListener('touchstart', e=>{ if(e.touches.length!==1) return; sx=e.touches[0].clientX; sy=e.touches[0].clientY; swiped=false; }, {passive:true});
book.addEventListener('touchend', e=>{
  if(sx===null || !e.changedTouches.length) return;
  const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
  if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.2){ swiped=true; dx<0?next():prev(); }
  sx=null; sy=null;
}, {passive:true});
book.addEventListener('click', e=>{ if(swiped){ e.stopImmediatePropagation(); swiped=false; } }, true);
layout();

/* ---------- magical sparkle burst when the cover opens ---------- */
const mc = document.getElementById('magic'), mx = mc.getContext('2d');
let sp = [], running = false;
function sizeMagic(){ mc.width = innerWidth; mc.height = innerHeight; } sizeMagic(); addEventListener('resize', sizeMagic);
function magicBurst(power=1){
  const r = book.getBoundingClientRect();
  const ox = r.left + r.width/2 + r.width*.0, oy = r.top + r.height/2;
  const cols = ['#fff','#ffd1ea','#ff3fa4','#c04bff','#ffe6a8'];
  for (let i=0;i<160*power;i++){
    const a = Math.random()*6.283, v = 1+Math.random()*7;
    sp.push({x:ox+(Math.random()-.5)*r.width*.5, y:oy+(Math.random()-.5)*r.height*.7, vx:Math.cos(a)*v, vy:Math.sin(a)*v-1.5, life:1, d:.008+Math.random()*.012,
      s:1.5+Math.random()*4, c:cols[Math.floor(Math.random()*cols.length)], star:Math.random()<.4});
  }
  if(!running){ running=true; requestAnimationFrame(tick); }
}
function tick(){
  mx.clearRect(0,0,mc.width,mc.height); mx.globalCompositeOperation='lighter';
  for (let i=sp.length-1;i>=0;i--){
    const p = sp[i]; p.x+=p.vx; p.y+=p.vy; p.vx*=.97; p.vy=p.vy*.97+.04; p.life-=p.d;
    if (p.life<=0){ sp.splice(i,1); continue; }
    mx.globalAlpha = p.life; mx.fillStyle = p.c; mx.shadowColor = p.c; mx.shadowBlur = 12;
    if (p.star){ mx.save(); mx.translate(p.x,p.y); mx.rotate(p.life*6); mx.beginPath();
      for(let k=0;k<8;k++){ const rr = k%2? p.s*.9 : p.s*2.6, aa = k*Math.PI/4; mx.lineTo(Math.cos(aa)*rr, Math.sin(aa)*rr); }
      mx.closePath(); mx.fill(); mx.restore(); }
    else { mx.beginPath(); mx.arc(p.x,p.y,p.s,0,6.283); mx.fill(); }
  }
  mx.globalAlpha=1; mx.shadowBlur=0; mx.globalCompositeOperation='source-over';
  if (sp.length) requestAnimationFrame(tick); else { running=false; mx.clearRect(0,0,mc.width,mc.height); }
}
