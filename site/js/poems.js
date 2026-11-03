/* ===== Poem list (edit titles here; files live in assets/poems + assets/pdfs) ===== */
const POEMS = Array.from({length:10},(_,i)=>{
  const n = String(i+1).padStart(2,'0');
  return { title:`Poem ${i+1}`, img:`assets/poems/poem${n}.jpg`, pdf:`assets/pdfs/poem${n}.pdf` };
});
// e.g. POEMS[0].title = 'Even Apart';

startButterflies(document.getElementById('bg'));
const board = document.getElementById('board');
const papers = ['#ffc2d6','#e3c6ff','#f7d9a8','#ffb3b3','#c9e4ff','#ffd1ea','#f4c4f3','#ffcba4'];
const tapes  = ['#ff4d7e','#b34bff','#f3d28a','#ff8fa3','#7fc4ff'];
const kinds  = ['dots','lines','check',''];
const stickers = ['❤️','🦋','✨','🌹','💌','💜','🌸','⭐','💕','🕊️'];
const rnd = (a,b,s)=>{ const x=Math.sin(s*9301+49297)*233280; return a+(x-Math.floor(x))*(b-a); }; // stable "random"

POEMS.forEach((p,i)=>{
  const el = document.createElement('article');
  el.className = 'item';
  el.style.setProperty('--rot', rnd(-4.5,4.5,i+1).toFixed(2)+'deg');
  el.style.setProperty('--i', i);
  el.style.setProperty('--paper', papers[i%papers.length]);
  el.style.setProperty('--tape', tapes[(i*2)%tapes.length]);
  el.style.setProperty('--tr', rnd(-8,8,i+7).toFixed(1)+'deg');
  el.style.marginTop = (i%3===1 ? 1.2 : 0)+'rem';
  const s1 = stickers[i%stickers.length], s2 = stickers[(i*3+4)%stickers.length];
  el.innerHTML = `
    <div class="backing ${kinds[i%kinds.length]}"></div>
    <div class="tape"></div>
    <div class="note"><img src="${p.img}" alt="${p.title}" loading="lazy"></div>
    <div class="label">${p.title}</div>
    <span class="sticker" style="right:-10px;top:${rnd(5,40,i)}%;--d:${(i*.3)%2}s">${s1}</span>
    <span class="sticker" style="left:-12px;bottom:${rnd(8,30,i+3)}%;font-size:1.6rem;--d:${(i*.5)%2}s">${s2}</span>`;
  el.addEventListener('click',()=>openLb(i));
  board.appendChild(el);
});

/* lightbox */
const lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg');
let idx = 0;
function openLb(i){
  idx = (i+POEMS.length)%POEMS.length;
  lbImg.src = POEMS[idx].img;
  document.getElementById('lbNum').textContent = `${POEMS[idx].title}  ·  ${idx+1} / ${POEMS.length}`;
  document.getElementById('lbPdf').href = POEMS[idx].pdf;
  lb.classList.add('open');
}
const closeLb = ()=>lb.classList.remove('open');
document.getElementById('lbClose').onclick = closeLb;
document.getElementById('lbPrev').onclick = e=>{e.stopPropagation();openLb(idx-1)};
document.getElementById('lbNext').onclick = e=>{e.stopPropagation();openLb(idx+1)};
lb.addEventListener('click',e=>{ if(e.target===lb) closeLb(); });
addEventListener('keydown',e=>{ if(!lb.classList.contains('open')) return;
  if(e.key==='Escape') closeLb(); if(e.key==='ArrowRight') openLb(idx+1); if(e.key==='ArrowLeft') openLb(idx-1); });
