/* SVG room controller. No framework, no network requests. */
(() => {
  const root = document.querySelector('[data-agent-room]');
  if (!root) return;
  const agents = [...root.querySelectorAll('[data-agent-id]')];
  const names = Object.fromEntries(agents.map(el => [el.dataset.agentId, el.dataset.name]));
  const positions = Object.fromEntries(agents.map(el => [el.dataset.agentId, [Number(el.dataset.x), Number(el.dataset.y)]]));
  positions.supervisor = [960, 500]; positions.user = [960, 1000];
  let speaker = null, automatic = true, demoStarted = performance.now(), micStream = null, audioContext = null;
  let analyser = null, samples = null, micLastSpeech = 0, raf = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const status = document.querySelector('#live-status');
  const select = document.querySelector('#speaker-select');
  const demoButton = document.querySelector('#demo-toggle');
  const micButton = document.querySelector('#mic-toggle');
  const levels = new Map();
  const plan = ['supervisor','operations','user','social','analytics','sales','campaigns','business','travel','intelligence'];

  function setSpeaker(id, { demo = false } = {}) {
    if (id !== null && !Object.hasOwn(positions, id)) throw new Error('Unknown speaker: ' + id);
    if (!demo) { automatic = false; updateDemoButton(); }
    if (speaker === id) return;
    speaker = id;
    root.dataset.speaker = id || '';
    agents.forEach(el => {
      const key = el.dataset.agentId;
      const state = id === key ? 'speaking' : id ? 'listening' : 'idle';
      el.dataset.state = state;
      el.dataset.audio = 'false';
      el.style.setProperty('--mouth-open', '.12');
      const line = root.querySelector(`[data-link="${key}"]`);
      if (line) line.dataset.state = state;
      const p = id ? positions[id] : positions.supervisor;
      const [x,y] = positions[key];
      const dx = id === key ? 0 : Math.max(-3.5, Math.min(3.5, (p[0]-x)/180));
      const dy = id === key ? 0 : Math.max(-2, Math.min(2, (p[1]-y)/170));
      el.style.setProperty('--eye-x', `${dx}px`); el.style.setProperty('--eye-y', `${dy}px`);
      const label = el.querySelector('.state-label');
      if (label) label.textContent = state === 'speaking' ? 'يتحدث' : state === 'listening' ? 'يستمع' : 'جاهز';
      el.setAttribute('aria-label', `${names[key]} — ${label?.textContent || state}`);
      el.setAttribute('aria-pressed', String(state === 'speaking'));
    });
    if (status) status.textContent = id ? 'المتحدث: ' + (names[id] || (id === 'user' ? 'أنت' : 'المشرف العام')) : 'الجميع في وضع الاستعداد';
    if (select) select.value = id || 'idle';
  }

  function setAudioLevel(id, level) {
    if (!Object.hasOwn(positions,id)) return;
    levels.set(id, { value: Math.max(0, Math.min(1, Number(level)||0)), time: performance.now() });
  }
  function setViseme(id, viseme) {
    const el = agents.find(el => el.dataset.agentId === id);
    if (!el) return;
    const widths = {rest:9, A:10, E:14, I:15, O:7, U:6, M:11};
    el.querySelector('.mouth-open')?.setAttribute('rx', widths[viseme] || 10);
  }
  function updateDemoButton() {
    if (demoButton) { demoButton.textContent = automatic ? 'إيقاف العرض التلقائي' : 'تشغيل العرض التلقائي'; demoButton.setAttribute('aria-pressed',String(automatic)); }
  }
  function manualSpeaker(id) { stopMic(); setSpeaker(id); }
  async function stopMic() {
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    micStream = null; analyser = null; samples = null;
    const old = audioContext; audioContext = null;
    if (old && old.state !== 'closed') await old.close();
    if (micButton) { micButton.textContent = 'تجربة صوتي بالميكروفون'; micButton.setAttribute('aria-pressed','false'); }
  }
  async function toggleMic() {
    if (micStream) { await stopMic(); setSpeaker(null); return; }
    if (!navigator.mediaDevices?.getUserMedia) {
      status.textContent = 'الميكروفون يحتاج فتح المعاينة على localhost أو HTTPS.'; return;
    }
    automatic = false; updateDemoButton();
    try {
      micStream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
      audioContext = new AudioContext(); await audioContext.resume();
      analyser = audioContext.createAnalyser(); analyser.fftSize = 1024;
      audioContext.createMediaStreamSource(micStream).connect(analyser);
      samples = new Float32Array(analyser.fftSize);
      micButton.textContent = 'إيقاف الميكروفون'; micButton.setAttribute('aria-pressed','true');
      setSpeaker(null); status.textContent = 'الميكروفون جاهز — تحدث لترى الوكلاء يستمعون';
    } catch (err) {
      await stopMic(); status.textContent = 'لم يعمل الميكروفون. اسمح بالوصول إليه ثم أعد المحاولة.';
    }
  }
  function tick(now) {
    if (automatic) {
      const elapsed=(now-demoStarted)/1000, index=Math.floor(elapsed/4.2)%plan.length;
      const phase=elapsed%4.2;
      setSpeaker(phase > 3.65 ? null : plan[index], {demo:true});
    }
    if (analyser && samples) {
      analyser.getFloatTimeDomainData(samples);
      const rms=Math.sqrt(samples.reduce((sum,v)=>sum+v*v,0)/samples.length);
      if (rms > .018) micLastSpeech=now;
      const active = now-micLastSpeech < 420;
      setSpeaker(active ? 'user' : null);
      setAudioLevel('user', Math.min(1,rms*9));
    }
    agents.forEach((el,i) => {
      const key=el.dataset.agentId;
      if (el.dataset.state === 'speaking') {
        const sample=levels.get(key), fresh=sample && now-sample.time < 200;
        // Fallback movement is explicitly a visual demo, not lip sync.
        const value=fresh ? sample.value : (.22+.65*Math.abs(Math.sin(now/135)*Math.cos(now/233)));
        el.dataset.audio=String(Boolean(fresh));
        el.style.setProperty('--mouth-open', reduced.matches ? '.6' : String(.1+value*1.3));
      }
    });
    raf=requestAnimationFrame(tick);
  }
  agents.forEach(el => {
    el.addEventListener('click',()=>manualSpeaker(el.dataset.agentId));
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();manualSpeaker(el.dataset.agentId);}});
  });
  select?.addEventListener('change',()=>manualSpeaker(select.value==='idle'?null:select.value));
  demoButton?.addEventListener('click',async()=>{await stopMic();automatic=!automatic;demoStarted=performance.now();updateDemoButton();if(!automatic)setSpeaker(null);});
  micButton?.addEventListener('click',toggleMic);
  document.querySelector('#hide-agents')?.addEventListener('click',e=>{
    const hidden=root.classList.toggle('agents-hidden');
    e.currentTarget.textContent=hidden?'إظهار الوكلاء':'إخفاء الوكلاء';
    e.currentTarget.setAttribute('aria-pressed',String(hidden));
  });
  document.querySelector('#arrange-agents')?.addEventListener('click',()=>{manualSpeaker(null);root.classList.remove('agents-hidden');document.querySelector('#hide-agents').textContent='إخفاء الوكلاء';document.querySelector('#hide-agents').setAttribute('aria-pressed','false');});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);stopMic();});
  window.AgentRoom = { setSpeaker, setAudioLevel, setViseme, stopMic,
    getState:()=>({speaker,automatic,states:Object.fromEntries(agents.map(el=>[el.dataset.agentId,el.dataset.state]))}) };
  // Example host dispatch: window.dispatchEvent(new CustomEvent('agent-room:speaker',{detail:{id:'operations'}}));
  window.addEventListener('agent-room:speaker',e=>setSpeaker(e.detail.id));
  window.addEventListener('agent-room:level',e=>setAudioLevel(e.detail.id,e.detail.level));
  window.addEventListener('agent-room:viseme',e=>setViseme(e.detail.id,e.detail.viseme));
  updateDemoButton(); raf=requestAnimationFrame(tick);
})();
