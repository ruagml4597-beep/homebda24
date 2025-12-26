// 주요 인터랙티브 로직: 테마, 필터, 모달, 아코디언, 차트, 스크롤 애니메이션
// 접근성 주석과 간단한 설명을 포함합니다.

// Theme toggle: 시스템 설정을 기본으로 사용, 사용자가 선택하면 localStorage에 저장
(() => {
  const body = document.body;
  const toggle = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'light') body.classList.add('light');
  else if (stored === 'dark') body.classList.remove('light');
  else if (!prefersDark) body.classList.add('light');

  toggle.addEventListener('click', ()=>{
    const isLight = body.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });

  // Smooth show/hide back-to-top
  const back = document.getElementById('backToTop');
  window.addEventListener('scroll', ()=>{
    if(window.scrollY>400) back.style.display='block'; else back.style.display='none';
  });
  back.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));
})();

// Filters for project cards
(() => {
  const buttons = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project-card');
  buttons.forEach(btn=>btn.addEventListener('click', ()=>{
    buttons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    projects.forEach(p=>{
      if(f==='all') p.style.display='block';
      else {
        const techs = p.dataset.tech.split(' ');
        p.style.display = techs.includes(f) ? 'block' : 'none';
      }
    });
  }));
})();

// Modal + project detail content (문장 구성: 문제 정의 → 접근 방식 → 핵심 결과 → 제안)
(() => {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  const closeBtn = document.querySelector('.modal-close');
  const detailBtns = document.querySelectorAll('.details-btn');

  // Project detail templates based on README.md content
  const details = {
    '온라인 쇼핑몰 판매 데이터 분석': {
      goal: '고객 세그먼트 분석 및 상품 추천 전략 수립',
      data: '판매 기록, 고객 구매 로그, 상품 메타데이터 (CSV/DB)',
      method: 'SQL로 집계 후 Python(Pandas)으로 전처리, Tableau로 시각화 및 대시보드 제작',
      results: 'VIP 고객층의 LTV가 높았고, 계절별 인기 상품 군이 명확히 나타남. 추천군 적용 시 전환율 개선 시뮬레이션 결과 +8% 예상',
      recommend: 'VIP 대상 맞춤형 프로모션 집중, 계절성 인기상품에 따른 재고·마케팅 스케줄 조정 추천',
      tech: 'Python, SQL, Excel, Tableau'
    },
    '영화 평점 데이터 분석': {
      goal: '장르별 평점 분석 및 추천 인사이트 도출',
      data: '영화 평점 데이터(사용자, 영화, 장르, 평점)',
      method: 'Python으로 EDA, 장르별 통계 및 시각화, Tableau로 스토리보드화',
      results: '특정 장르에서 높은 재시청률 발견, 추천 우선순위 조정 시 사용자 만족도 향상 기대',
      recommend: '장르 기반 개인화 추천 알고리즘 우선 적용 및 콘텐츠 투자 우선순위 제안',
      tech: 'Python, Tableau'
    }
  };

  function openModal(title){
    const d = details[title];
    if(!d) return;
    modalContent.innerHTML = `
      <h3>${title}</h3>
      <p><strong>Goal:</strong> ${d.goal}</p>
      <p><strong>Data:</strong> ${d.data}</p>
      <p><strong>Method:</strong> ${d.method}</p>
      <p><strong>Results:</strong> ${d.results}</p>
      <p><strong>Recommendation:</strong> ${d.recommend}</p>
      <p><strong>Tech:</strong> ${d.tech}</p>
      <hr />
      <!-- Accordion: 분석과 인사이트 상세 -->
      <div class="accordion">
        <button class="acc-btn">분석 과정 (클릭하여 펼치기)</button>
        <div class="acc-panel"><p>데이터 정합성 검사 → 결측/이상치 처리 → 피처 엔지니어링 → 시각화 및 KPI 도출</p></div>
        <button class="acc-btn">인사이트 & 제안</button>
        <div class="acc-panel"><p>주요 고객군 타겟팅, 프로모션 스케줄, 추천 로직 개선 등 실행 가능한 제안 포함</p></div>
      </div>
    `;
    modal.setAttribute('aria-hidden','false');
  }

  detailBtns.forEach((btn)=>{
    btn.addEventListener('click', (e)=>{
      const card = e.target.closest('.project-card');
      const title = card.querySelector('h3').innerText.trim();
      openModal(title);
    });
  });

  closeBtn.addEventListener('click', ()=>modal.setAttribute('aria-hidden','true'));
  modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.setAttribute('aria-hidden','true') });

  // Accordion behavior
  document.addEventListener('click', (e)=>{
    if(e.target.classList.contains('acc-btn')){
      const panel = e.target.nextElementSibling;
      const open = panel.style.maxHeight;
      document.querySelectorAll('.acc-panel').forEach(p=>p.style.maxHeight=null);
      if(!open) panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
})();

// Chart.js: 샘플 KPI 차트 (데모 데이터)
(() => {
  const ctx = document.getElementById('salesChart').getContext('2d');
  const labels = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const data = {
    labels,
    datasets: [{
      label: '월별 매출 (데모 데이터)',
      data: [120,140,180,200,220,260,300,280,260,240,210,230],
      borderColor: 'rgba(124,247,255,0.9)',
      backgroundColor: 'rgba(124,247,255,0.12)',
      tension: 0.3,
      pointRadius:4
    }]
  };
  const salesChart = new Chart(ctx, {type:'line',data,options:{responsive:true,plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},scales:{y:{beginAtZero:false}}}});
})();

// IntersectionObserver for reveal animations
(() => {
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
  },{threshold:0.15});
  document.querySelectorAll('.reveal, .card, .glass, .hero-card').forEach(el=>obs.observe(el));
})();

// Small: add reveal class to key elements on load
window.addEventListener('load', ()=>{
  document.querySelectorAll('.hero-card, .glass, .card').forEach(el=>el.classList.add('reveal'));
});
