// Theme toggle (dark-first). 저장된 preference가 있으면 사용.
(() => {
  const body = document.body;
  const toggle = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('theme');
  if (stored === 'light') body.classList.add('light');
  else if (stored === 'dark') body.classList.remove('light');
  // default: dark (no class)

  toggle.addEventListener('click', ()=>{
    const isLight = body.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
})();

// Back to top visibility and action
(() => {
  const back = document.getElementById('backToTop');
  window.addEventListener('scroll', ()=>{
    if(window.scrollY>400) back.style.display='block'; else back.style.display='none';
  });
  back.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));
})();

// Scroll progress bar (uses #scroll-progress per design)
(() => {
  const progress = document.getElementById('scroll-progress') || document.getElementById('progress');
  if(!progress) return;
  window.addEventListener('scroll', ()=>{
    const h = document.documentElement;
    const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = pct + '%';
  }, {passive:true});
})();

// Scrollspy: 현재 섹션 강조
(() => {
  const sections = document.querySelectorAll('section[data-section]');
  const navLinks = document.querySelectorAll('.nav a');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const id = entry.target.id;
        navLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href') === '#'+id));
      }
    });
  },{threshold:0.45});
  sections.forEach(s=>obs.observe(s));
})();

// Skills filter: 강조 및 재정렬(모든 항목은 항상 노출됨)
(() => {
  const buttons = document.querySelectorAll('.skill-filter');
  const container = document.getElementById('skills-list');
  const skills = Array.from(container.children);
  function applyFilter(f){
    document.querySelectorAll('.skill-filter').forEach(b=>b.classList.toggle('active', b.dataset.filter===f));
    // emphasize matching, move matches to front
    const matches = skills.filter(s=>f==='all' || s.dataset.skill===f);
    const others = skills.filter(s=>!matches.includes(s));
    // re-append in order
    container.innerHTML = '';
    matches.forEach(m=>{ m.classList.add('emphasize'); container.appendChild(m); });
    others.forEach(o=>{ o.classList.remove('emphasize'); container.appendChild(o); });
  }
  buttons.forEach(b=>b.addEventListener('click', ()=>applyFilter(b.dataset.filter)));
})();

// Charts: Sales (line), Segment (bar), Funnel (horizontal bars as approximation)
(() => {
  // Sales
  const salesCtx = document.getElementById('salesChart')?.getContext('2d');
  if(salesCtx){
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const salesData = [120,140,180,200,220,260,300,280,260,240,210,230];
    new Chart(salesCtx, {type:'line',data:{labels,datasets:[{label:'월별 매출 (데모)',data:salesData,borderColor:'rgba(0,229,255,0.95)',backgroundColor:'rgba(0,229,255,0.08)',tension:0.3,pointRadius:3}]},options:{plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},scales:{y:{beginAtZero:false}}}});
  }

  // Segment bar
  const segCtx = document.getElementById('segmentBar')?.getContext('2d');
  if(segCtx){
    const labels=['Top20','Mid50','Tail30'];
    const data=[48,37,15];
    new Chart(segCtx,{type:'bar',data:{labels,datasets:[{label:'매출 비중',data,backgroundColor:['rgba(0,229,255,0.9)','rgba(155,124,255,0.8)','rgba(110,240,196,0.8)']} ]},options:{plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.dataset.data[ctx.dataIndex]+'%'}}},scales:{y:{beginAtZero:true,ticks:{callback:v=>v+'%'}}}});
  }

  // Funnel-like: horizontal bar
  const funnelCtx = document.getElementById('funnelChart')?.getContext('2d');
  if(funnelCtx){
    const labels=['Visits','Add to Cart','Checkout','Purchase'];
    const data=[10000,1200,500,420];
    new Chart(funnelCtx,{type:'bar',data:{labels,datasets:[{label:'Users',data,backgroundColor:'rgba(124,247,255,0.9)'}]},options:{indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.dataset.data[ctx.dataIndex]}}},scales:{x:{beginAtZero:true}}}});
  }
})();

// Form handling (front-end only) — 접근성: 상태 메시지, basic validation
(() => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    status.textContent='';
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();
    if(!name || !email || !msg){ status.textContent='모든 필드를 입력해주세요.'; status.style.color='var(--accent)'; return; }
    // Simulate send
    status.textContent='메시지를 성공적으로 보냈습니다 (데모). 이메일로 회신 바랍니다.';
    status.style.color='var(--neon)';
    form.reset();
  });
})();

// IntersectionObserver for reveal animations (subtle)
(() => {
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
  },{threshold:0.15});
  document.querySelectorAll('.reveal, .card, .glass, .hero-card').forEach(el=>obs.observe(el));
})();

// add initial reveal
window.addEventListener('load', ()=>document.querySelectorAll('.hero-card, .glass, .card').forEach(el=>el.classList.add('reveal')));

