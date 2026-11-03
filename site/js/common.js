/* ===== Shared: background music + glitter butterflies ===== */

/* ---------- MUSIC ---------- */
// Put your song in assets/music/ and make sure the name below matches.
const MUSIC_FILE = 'assets/music/music.mp3';

(function initMusic(){
  const audio = new Audio(MUSIC_FILE);
  audio.loop = true; audio.volume = 0.6;
  const btn = document.createElement('button');
  btn.id = 'musicBtn'; btn.title = 'Music on/off'; btn.textContent = '♫';
  document.body.appendChild(btn);
  const hint = document.createElement('div');
  hint.id = 'musicHint'; hint.textContent = 'tap for music ♡';
  document.body.appendChild(hint);

  const wantOn = () => sessionStorage.getItem('musicOn') !== '0';
  const t = parseFloat(sessionStorage.getItem('musicTime') || '0');
  audio.addEventListener('loadedmetadata', () => { if (t && t < audio.duration) audio.currentTime = t; });

  function setUI(on){ btn.classList.toggle('playing', on); btn.textContent = on ? '♫' : '✕'; if(on) hint.style.opacity = 0; }
  function play(){ return audio.play().then(()=>{ setUI(true); sessionStorage.setItem('musicOn','1'); }).catch(()=>{}); }
  function pause(){ audio.pause(); setUI(false); sessionStorage.setItem('musicOn','0'); }

  btn.addEventListener('click', e => { e.stopPropagation(); audio.paused ? play() : pause(); });
  // Browsers block autoplay, so start on the first tap/click anywhere
  const first = () => { if (wantOn() && audio.paused) play(); window.removeEventListener('pointerdown', first); };
  window.addEventListener('pointerdown', first);
  if (wantOn()) play();           // works if the browser allows it
  else setUI(false);
  setInterval(() => { if(!audio.paused) sessionStorage.setItem('musicTime', audio.currentTime); }, 1000);
  window.addEventListener('pagehide', () => sessionStorage.setItem('musicTime', audio.currentTime));
  window.bgm = audio;
})();

/* ---------- GLITTER BUTTERFLIES ---------- */
function startButterflies(canvas){
  const ctx = canvas.getContext('2d');
  let W, H, dpr;
  const palette = [
    ['#ff1744','#ff8a9b'], ['#e0143c','#ffb3c1'], ['#ff3fa4','#ffd1ea'],
    ['#8a2be2','#e0b3ff'], ['#ffd27a','#fff2c9'], ['#ff4d7e','#ffffff']
  ];
  function resize(){
    dpr = Math.min(window.devicePixelRatio||1, 2);
    W = canvas.width = innerWidth*dpr; H = canvas.height = innerHeight*dpr;
  }
  resize(); addEventListener('resize', resize);

  const count = innerWidth < 600 ? 10 : 18;
  const flies = Array.from({length:count}, () => makeFly(true));
  function makeFly(anywhere){
    const c = palette[Math.floor(Math.random()*palette.length)];
    return {
      x: Math.random()*W, y: anywhere ? Math.random()*H : H + 60*dpr,
      s: (14 + Math.random()*22)*dpr, c,
      phase: Math.random()*6.28, flap: 5 + Math.random()*5,
      vx: (Math.random()-.5)*0.6*dpr, vy: -(0.35 + Math.random()*0.7)*dpr,
      wob: Math.random()*6.28, wobSpd: .6 + Math.random()
    };
  }
  const sparks = [];
  const stars = Array.from({length:70}, () => ({x:Math.random(), y:Math.random(), r:Math.random()*1.6+.4, p:Math.random()*6.28, sp:1+Math.random()*2}));

  function wing(s, c){
    const g = ctx.createRadialGradient(0,-s*.2,s*.05, s*.4,-s*.2,s*1.2);
    g.addColorStop(0,c[1]); g.addColorStop(.55,c[0]); g.addColorStop(1,'#1a0008');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.bezierCurveTo(s*.2,-s*.9, s*1.25,-s*1.15, s*1.1,-s*.2);
    ctx.bezierCurveTo(s*.9,s*.1, s*.3,s*.1, 0,0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,s*.05);
    ctx.bezierCurveTo(s*.8,s*.1, s*.95,s*.95, s*.4,s*.85);
    ctx.bezierCurveTo(s*.1,s*.7, 0,s*.3, 0,s*.05); ctx.fill();
    // glitter dots on wing
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (const [dx,dy,r] of [[.55,-.55,.06],[.8,-.3,.045],[.5,.45,.05],[.3,-.25,.04]]){
      ctx.beginPath(); ctx.arc(s*dx,s*dy,s*r,0,6.28); ctx.fill();
    }
  }
  function drawFly(f, t){
    const w = .2 + .8*Math.abs(Math.sin(t*f.flap + f.phase));
    const ang = Math.atan2(f.vy, f.vx) + Math.PI/2;
    ctx.save(); ctx.translate(f.x,f.y); ctx.rotate(ang);
    ctx.shadowColor = f.c[0]; ctx.shadowBlur = 18*dpr;
    for (const side of [-1,1]){ ctx.save(); ctx.scale(side*w,1); wing(f.s,f.c); ctx.restore(); }
    ctx.shadowBlur = 0; ctx.strokeStyle = '#fff6'; ctx.lineWidth = 1.5*dpr;
    ctx.beginPath(); ctx.moveTo(0,-f.s*.35); ctx.lineTo(0,f.s*.5); ctx.stroke();
    ctx.restore();
  }
  let last = performance.now();
  function frame(now){
    const dt = Math.min((now-last)/1000, .05); last = now; const t = now/1000;
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation = 'lighter';
    // twinkling background glitter
    for (const s of stars){
      const a = .25 + .75*Math.abs(Math.sin(t*s.sp + s.p));
      ctx.fillStyle = `rgba(255,${120+Math.floor(a*100)},${160+Math.floor(a*60)},${a*.8})`;
      ctx.beginPath(); ctx.arc(s.x*W, s.y*H, s.r*dpr*a*1.4, 0, 6.28); ctx.fill();
    }
    for (let i=0;i<flies.length;i++){
      const f = flies[i];
      f.wob += f.wobSpd*dt;
      f.x += (f.vx + Math.sin(f.wob)*0.9*dpr) * 60*dt;
      f.y += (f.vy + Math.cos(f.wob*.7)*0.35*dpr) * 60*dt;
      if (Math.random() < .5) sparks.push({x:f.x+(Math.random()-.5)*f.s, y:f.y+(Math.random()-.5)*f.s, vy:.2*dpr, life:1, c:f.c[1], r:(1+Math.random()*2)*dpr});
      drawFly(f,t);
      if (f.y < -80*dpr || f.x < -100*dpr || f.x > W+100*dpr) flies[i] = makeFly(false);  // loop forever
    }
    for (let i=sparks.length-1;i>=0;i--){
      const p = sparks[i]; p.life -= dt*.9; p.y += p.vy; 
      if (p.life<=0){ sparks.splice(i,1); continue; }
      ctx.globalAlpha = p.life; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,6.28); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
