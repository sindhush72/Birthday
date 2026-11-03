/* ===== Opening animation: cupid arrow hits purple heart -> bursts into tiny hearts ===== */
const intro = document.getElementById('intro');
const cv = document.getElementById('introCanvas');
const ctx = cv.getContext('2d');
let W,H,dpr;
function resize(){ dpr=Math.min(devicePixelRatio||1,2); W=cv.width=innerWidth*dpr; H=cv.height=innerHeight*dpr; }
resize(); addEventListener('resize',resize);

startButterflies(document.getElementById('bg'));

// unit heart path (about 2 units wide)
const heart = new Path2D();
for (let i=0;i<=60;i++){
  const t=i/60*Math.PI*2;
  const x=16*Math.sin(t)**3/16, y=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/16;
  i?heart.lineTo(x,y):heart.moveTo(x,y);
}
heart.closePath();

function revealHome(){
  if (document.body.classList.contains('revealed')) return;
  intro.classList.add('done');
  document.body.classList.add('revealed');
  sessionStorage.setItem('introSeen','1');
  setTimeout(()=>document.body.classList.add('unrolled'), 900);
  setTimeout(()=>intro.remove(), 1600);
}
document.getElementById('skip').onclick = revealHome;
if (sessionStorage.getItem('introSeen')){ intro.remove(); document.body.classList.add('revealed','unrolled'); }

const parts=[]; const rings=[];
let exploded=false, start=null, shownHome=false;
const palette=['#ff1744','#ff4d7e','#ff3fa4','#b34bff','#8a2be2','#ffd27a','#ffffff','#e0143c'];

function explode(cx,cy){
  exploded=true;
  // big firework burst + smaller secondary pops
  for(let i=0;i<260;i++){
    const a=Math.random()*6.283, sp=(2+Math.random()*13)*dpr;
    parts.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:.12*dpr,life:1,decay:.3+Math.random()*.35,
      size:(5+Math.random()*13)*dpr,rot:Math.random()*6.28,vr:(Math.random()-.5)*.2,c:palette[Math.floor(Math.random()*palette.length)],pop:Math.random()<.12});
  }
  rings.push({x:cx,y:cy,r:10*dpr,a:1,c:'#ff3fa4'},{x:cx,y:cy,r:4*dpr,a:1,c:'#b34bff'});
}
function drawHeart(x,y,s,rot,color,alpha,glow){
  ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.scale(s,s);
  ctx.globalAlpha=alpha; ctx.fillStyle=color;
  if(glow){ctx.shadowColor=color; ctx.shadowBlur=glow;}
  ctx.fill(heart); ctx.restore();
}
function drawArrow(tipX,tipY,len,ang,alpha){
  ctx.save(); ctx.translate(tipX,tipY); ctx.rotate(ang); ctx.globalAlpha=alpha;
  const L=len;
  ctx.lineCap='round'; ctx.strokeStyle='#f3d28a'; ctx.lineWidth=5*dpr; ctx.shadowColor='#ffd27a'; ctx.shadowBlur=14*dpr;
  ctx.beginPath(); ctx.moveTo(-L,0); ctx.lineTo(0,0); ctx.stroke();
  ctx.shadowBlur=0; ctx.fillStyle='#ff1744';           // arrow head
  ctx.beginPath(); ctx.moveTo(14*dpr,0); ctx.lineTo(-14*dpr,-14*dpr); ctx.lineTo(-6*dpr,0); ctx.lineTo(-14*dpr,14*dpr); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ff4d7e';                              // fletching
  for(const o of [0,18*dpr]){
    ctx.beginPath(); ctx.moveTo(-L+o,0); ctx.lineTo(-L-16*dpr+o,-14*dpr); ctx.lineTo(-L-4*dpr+o,0); ctx.lineTo(-L-16*dpr+o,14*dpr); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

function frame(now){
  if(!document.getElementById('intro')) return;
  if(start===null) start=now;
  const t=(now-start)/1000;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
  const cx=W/2, cy=H/2, base=Math.min(W,H)*.2;
  const ang=Math.PI*0.88;                 // arrow comes in from the upper right, heading down-left
  const dirX=Math.cos(ang+Math.PI), dirY=Math.sin(ang+Math.PI); // unit vector pointing back to where arrow came from
  // soft ambient glow
  const g=ctx.createRadialGradient(cx,cy,0,cx,cy,base*3);
  g.addColorStop(0,'rgba(138,43,226,.28)'); g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

  if(t<2.7 || (!exploded && t<3)){
    // purple heart appears and beats
    const appear=Math.min(1,t/.9);
    let beat=1+.06*Math.sin(t*7)*(t<1.6?1:0);
    let shake=0;
    if(t>1.5 && t<2.2) shake=Math.sin(t*70)*(2.2-t)*10*dpr;      // impact wobble
    let swell=t>2.2? 1+(t-2.2)*.35 : 1;                          // swells before bursting
    const s=base*ease(appear)*beat*swell;
    drawHeart(cx+shake,cy,s,0,'#9b30ff',1,45*dpr);
    // inner shine
    drawHeart(cx+shake-s*.25,cy-s*.3,s*.18,0,'rgba(255,255,255,.45)',1,0);
    // arrow flies in 1.0 -> 1.5, then stays stuck
    if(t>1.0){
      const k=Math.min(1,(t-1)/.5), e=1-Math.pow(1-k,3);
      const far=Math.max(W,H);
      const tipX=cx+dirX*far*(1-e)*1.0 - dirX*s*.05 + shake;
      const tipY=cy+dirY*far*(1-e)*1.0 - dirY*s*.05;
      drawArrow(tipX,tipY,base*1.6,ang,1);
      if(k>=1 && !rings.length && t<1.7) rings.push({x:cx,y:cy,r:s*.5,a:1,c:'#fff'});
    }
    if(t>=2.7 && !exploded) explode(cx,cy);
  } else if(!exploded) explode(cx,cy);

  if(exploded && t<3.0){ // flash
    ctx.fillStyle=`rgba(255,200,230,${Math.max(0,1-(t-2.7)/.3)*.7})`; ctx.fillRect(0,0,W,H);
  }
  // rings
  for(let i=rings.length-1;i>=0;i--){
    const r=rings[i]; r.r+=7*dpr; r.a-=.03;
    if(r.a<=0){rings.splice(i,1);continue;}
    ctx.globalAlpha=r.a; ctx.strokeStyle=r.c; ctx.lineWidth=3*dpr;
    ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,6.283); ctx.stroke(); ctx.globalAlpha=1;
  }
  // heart particles
  ctx.globalCompositeOperation='lighter';
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];
    p.vx*=.985; p.vy=p.vy*.985+p.g; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.life-=p.decay/60;
    if(p.pop && p.life<.55){ // secondary mini-firework
      p.pop=false;
      for(let k=0;k<7;k++){const a=Math.random()*6.283,sp=(1+Math.random()*4)*dpr;
        parts.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:.08*dpr,life:.8,decay:.7,size:p.size*.5,rot:0,vr:.1,c:p.c,pop:false});}
    }
    if(p.life<=0){parts.splice(i,1);continue;}
    drawHeart(p.x,p.y,p.size,p.rot,p.c,Math.min(1,p.life*1.5),12*dpr);
  }
  ctx.globalCompositeOperation='source-over';

  if(exploded && t>3.4 && !shownHome){ // add a shimmering caption
    ctx.globalAlpha=Math.min(1,(t-3.4)/.8); ctx.fillStyle='#fff'; ctx.shadowColor='#ff3fa4'; ctx.shadowBlur=20*dpr;
    ctx.font=`${Math.min(W,H)*.09}px "Great Vibes", cursive`; ctx.textAlign='center';
    ctx.fillText('for you, with love',cx,cy+base*.2); ctx.shadowBlur=0; ctx.globalAlpha=1;
  }
  if(t>6 && !shownHome){ shownHome=true; revealHome(); }
  requestAnimationFrame(frame);
}
if(!sessionStorage.getItem('introSeen')) requestAnimationFrame(frame);
