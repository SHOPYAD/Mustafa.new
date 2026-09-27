"use client";
import { useEffect, useRef, useState } from "react";
import { STUDIO_DOMAINS, STUDIO_PAGES, STUDIO_SCREENS, SOURCE_COMMIT, type DomainId } from "@/lib/neural-studio/catalog";
import { clampZoom } from "@/lib/neural-studio/workspace";
import { ATLAS_CLUSTERS } from "@/lib/neural-studio/atlas-composition";
import NeuralField from "./NeuralField";
import NeuralAtlas from "./NeuralAtlas";
import FloatingWindow from "./FloatingWindow";
import { getSurface, type ScreenId, type PublicStage } from "@/lib/neural-studio/surfaces";
import StudioSurfaces from "./StudioSurfaces";
import SupervisorPanel from "./SupervisorPanel";
import "./neural-studio.css";
type Observation = { tool: string; status: string; observedAt?: string; readDurationMs?: number; facts: Array<{ key: string; labelAr: string; value: unknown; source: string; available: boolean }> };
type Snapshot = { status: string; observedAt?: string; observations: Observation[] };
export default function NeuralStudio() {
  const [screen, setScreen] = useState<ScreenId>("01");
  const [nativeHref, setNativeHref] = useState<string | null>(null);
  const [supervisorOpen, setSupervisorOpen] = useState(false);
  const [stage, setStage] = useState<PublicStage>("idle"), [outputLevel, setOutputLevel] = useState(0);
  const screenTitle = STUDIO_SCREENS.find(s => s.id === screen)!.title;
  const [selected, setSelected] = useState<DomainId>("overview");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [families, setFamilies] = useState<string[]>([]);
  const [sidebar, setSidebar] = useState(true), [query, setQuery] = useState("");
  const [inspector, setInspector] = useState(true), [references, setReferences] = useState(false);
  const [pageHref, setPageHref] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1), [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false), [error, setError] = useState("");
  const [level, setLevel] = useState(0), [listening, setListening] = useState(false), [audioError, setAudioError] = useState("");
  const request = useRef<AbortController | null>(null);
  const mic = useRef<{ stream: MediaStream; context: AudioContext; frame: number } | null>(null);
  const audioRequest = useRef(0), mounted = useRef(true);
  const domain = STUDIO_DOMAINS.find(d => d.id === selected)!;
  const selectedPage = STUDIO_PAGES.find(p => p.href === pageHref);
  useEffect(() => {
    let cancelled = false;
    request.current?.abort(); const abort = new AbortController(); request.current = abort;
    setLoading(true); setError(""); setSnapshot(null);
    fetch("/api/admin/automation/studio-snapshot?domain=" + selected, { signal: abort.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error(response.status === 401 ? "انتهت جلسة الإدارة. أعد تسجيل الدخول." : "تعذر قراءة مصدر البيانات.");
        const data = await response.json();
        if (data.ok !== true || !Array.isArray(data.observations)) throw new Error("استجابة المصدر غير صالحة.");
        if (!cancelled) setSnapshot(data);
      }).catch(e => { if (!cancelled && e.name !== "AbortError") setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; abort.abort(); };
  }, [selected]);
  const stopAudio = () => {
    audioRequest.current++;
    if (mic.current) { cancelAnimationFrame(mic.current.frame); mic.current.stream.getTracks().forEach(t => t.stop()); void mic.current.context.close(); mic.current = null; }
    if (mounted.current) { setListening(false); setLevel(0); }
  };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; stopAudio(); }; }, []);
  const toggleAudio = async () => {
    if (mic.current) { stopAudio(); return; }
    const attempt = ++audioRequest.current;
    setAudioError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (!mounted.current || attempt !== audioRequest.current) { stream.getTracks().forEach(t => t.stop()); return; }
      const context = new AudioContext();
      const session = { stream, context, frame: 0 }; mic.current = session;
      await context.resume();
      if (!mounted.current || attempt !== audioRequest.current) { stream.getTracks().forEach(t => t.stop()); if (context.state !== "closed") await context.close(); return; }
      const analyser = context.createAnalyser(); analyser.fftSize = 256;
      context.createMediaStreamSource(stream).connect(analyser); // never route microphone to speakers
      const samples = new Uint8Array(analyser.fftSize);
      setListening(true);
      const tick = () => {
        analyser.getByteTimeDomainData(samples);
        const rms = Math.sqrt(samples.reduce((sum, v) => sum + ((v-128)/128)**2, 0) / samples.length);
        setLevel(Math.min(1, rms * 6)); session.frame = requestAnimationFrame(tick);
      }; tick();
    } catch { stopAudio(); setAudioError("تعذر فتح الميكروفون؛ تحقق من الإذن واتصال HTTPS."); }
  };
  const navigateScreen = (id: ScreenId) => {
    setScreen(id); const target = getSurface(id)?.domains[0]; if (target) setSelected(target as DomainId);
    setInspector(id === "01"); setReferences(false);
    if (id === "17") setSupervisorOpen(true);
    history.replaceState(null, "", "#screen=" + id);
  };
  useEffect(() => {
    const read = () => { const id = new URLSearchParams(location.hash.slice(1)).get("screen"); if (STUDIO_SCREENS.some(s => s.id === id)) {
      setScreen(id as ScreenId); setInspector(id === "01"); const domain = getSurface(id!)?.domains[0]; if (domain) setSelected(domain as DomainId);
    }};
    read(); addEventListener("hashchange", read); return () => removeEventListener("hashchange", read);
  }, []);
  const openNative = (href: string) => {
    const page = STUDIO_PAGES.find(p => p.href === href && !p.dynamic && p.domain);
    if (page) setNativeHref(page.href); // static same-origin source allowlist, never an LLM URL
  };
  const toggle = (id: string) => setExpanded(previous => previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]);
  const inspectPage = (href: string) => {
    const page = STUDIO_PAGES.find(p => p.href === href);
    if (page?.domain) setSelected(page.domain as DomainId);
    setPageHref(href); setInspector(true);
  };
  const select = (id: DomainId) => { setSelected(id); setPageHref(null); setInspector(true); };
  const status = loading ? "جارٍ الاستعلام" : error ? "تعذر الاتصال" : snapshot?.status === "ready" ? "قراءة موثقة" : snapshot?.status === "partial" ? "قراءة جزئية" : "غير موصول بعد";
  return <main className="ns-studio" dir="rtl" data-testid="neural-studio" data-screen-id={screen}>
    <NeuralField />
    <header className="ns-topbar">
      <div><h1>{screenTitle}</h1><p>منصة عمليات المعرفة المؤسسية</p></div>
      <div className="ns-depth" aria-label="مستوى التوسع"><b>L{expanded.length ? 1 : 0}</b><span><i /><i /><i /><i /></span> مستوى العمق</div>
      <nav aria-label="مسار الاستوديو"><select aria-label="واجهة الاستوديو" value={screen} onChange={e => navigateScreen(e.target.value as ScreenId)}>{STUDIO_SCREENS.map(s => <option key={s.id} value={s.id}>{s.id} · {s.title}</option>)}</select><a href="/admin">لوحة الإدارة</a><span>‹</span><button onClick={() => { setExpanded([]); select("overview"); setZoom(1); }}>الأطلس الشامل</button></nav>
    </header>
    <div className={screen === "01" ? "ns-atlas-layer" : "ns-atlas-layer ns-hidden"}><NeuralAtlas selected={selected} expanded={expanded} onSelect={select} onToggle={toggle}
      onInspect={inspectPage} zoom={zoom} level={stage === "speaking" ? outputLevel : level} listening={listening} /></div>
    {screen !== "01" && <div className={"ns-surface-host " + (!sidebar ? "is-wide" : "")}><StudioSurfaces id={screen} onOpen={openNative} onNavigate={navigateScreen} onRestore={() => { setInspector(true); setSidebar(true); }} onSidebar={() => setSidebar(s => !s)} onVoice={() => setSupervisorOpen(true)} stage={listening ? "listening" : stage} level={stage === "speaking" ? outputLevel : level} /></div>}
    {sidebar ? <aside className="ns-explorer" aria-label="مستكشف المنصة">
      <header><strong>المستكشف</strong><button aria-label="إغلاق المستكشف" onClick={() => setSidebar(false)}>×</button></header>
      <input aria-label="البحث في أقسام المنصة" placeholder="البحث في المجالات…" value={query} onChange={e => setQuery(e.target.value)} />
      <div className="ns-explorer-scroll">
        <div className="ns-tree-root">الأطلس العصبي الشامل</div>
        {ATLAS_CLUSTERS.filter(group => !query || group.label.includes(query) || STUDIO_PAGES.some(p => group.domains.includes(p.domain as DomainId) && p.label.includes(query))).map(group => {
          const grouped = group.domains.length > 1, show = families.includes(group.id) || !!query;
          return <section key={group.id} className={"ns-family ns-family-" + group.tone}>
            {grouped && <div className="ns-tree-domain"><button aria-label={"فتح مجموعة " + group.label} aria-expanded={show}
              onClick={() => setFamilies(f => f.includes(group.id) ? f.filter(id => id !== group.id) : [...f,group.id])}> {show ? "▾" : "◂"} </button>
              <button onClick={() => { select(group.domains[0]); setFamilies(f => f.includes(group.id) ? f : [...f,group.id]); }}><span className="ns-tree-orb"/>{group.label}</button></div>}
            {(!grouped || show) && group.domains.map(id => {
              const d = STUDIO_DOMAINS.find(d => d.id === id)!;
              return <div key={id} className={grouped ? "ns-family-child" : ""}>
                <div className={"ns-tree-domain " + (selected === d.id ? "is-selected" : "")}>
                  <button aria-label={"توسيع " + d.label} aria-expanded={expanded.includes(d.id)} onClick={() => toggle(d.id)}>{expanded.includes(d.id) ? "▾" : "◂"}</button>
                  <button onClick={() => { select(d.id); if (screen !== "01") navigateScreen(d.screen as ScreenId); }}><span className="ns-tree-orb"/>{grouped ? d.label : group.label}</button>
                </div>
                {(expanded.includes(d.id) || query) && <ul>{STUDIO_PAGES.filter(p => p.domain === d.id && (!query || group.label.includes(query) || p.label.includes(query))).map(p =>
                  <li key={p.href}><button onClick={() => inspectPage(p.href)}>{p.label}</button></li>)}</ul>}
              </div>;
            })}
          </section>;
        })}
      </div>
      <footer>{STUDIO_PAGES.filter(p => p.domain).length} ملف صفحة مصنف · فهرس المصدر، لا حالة تشغيل</footer>
    </aside> : <button className="ns-explorer-reopen" aria-label="فتح المستكشف" onClick={() => setSidebar(true)}>المستكشف ‹</button>}
    {inspector && <FloatingWindow id="inspector" title="معلومات السياق" initial={{ x: 14, y: 80, width: 306, height: 258 }} onClose={() => setInspector(false)}>
      <div className="ns-context-row"><span aria-hidden="true">◎</span><div><p>التحديد</p><h2>{selectedPage?.label || domain.label}</h2></div></div>
      <div className="ns-context-row"><span aria-hidden="true">⌘</span><div><p>العلاقات</p><p>{ATLAS_CLUSTERS.length} مجموعة رئيسية · {STUDIO_DOMAINS.length} مجال موثق</p></div></div>
      <div className="ns-context-row"><span aria-hidden="true">◇</span><div><p>الطبقة</p><p>L{expanded.length ? 1 : 0} — {expanded.length ? "فروع متراكمة" : "المستوى العام"}</p></div></div>
      <p className="ns-source-status" data-testid="source-status">{status}</p>
      <details className="ns-source-details" open={!!selectedPage}><summary>مصدر البيانات والتفاصيل</summary>
      <small>فهرس المستودع · {SOURCE_COMMIT.slice(0, 7)}</small>
      {selectedPage && <><code className="ns-route" dir="ltr">{selectedPage.href}</code>
        {!selectedPage.dynamic && <><a className="ns-action" href={selectedPage.href} target="_blank" rel="noreferrer">فتح واجهة القسم الحالية</a><button className="ns-action" onClick={() => openNative(selectedPage.href)}>فتح داخل الاستوديو</button></>}
        <p className="ns-note">هذه علاقة احتواء موثقة بالملف، وليست مسار تنفيذ حي أو اتصال مزود.</p></>}
      {loading && <p role="status">قراءة الأدوات المسجلة لهذا المجال…</p>}
      </details>
      {error && <p role="alert">{error}</p>}
      <details className="ns-source-details"><summary>القراءة التشغيلية</summary>
      {snapshot?.observations.map(o => <section className="ns-observation" key={o.tool}>
        <code dir="ltr">{o.tool}</code>
        {o.status !== "ready" ? <p>المصدر غير متاح</p> : o.facts.map(f =>
          <dl key={f.key}><dt>{f.labelAr}</dt><dd>{f.available ? String(f.value ?? "غير متاح") : "غير متاح"}</dd></dl>)}
        {o.observedAt && <small>وقت القراءة: {new Date(o.observedAt).toLocaleTimeString("ar")}</small>}
      </section>)}
      {!loading && !error && snapshot?.status === "not_connected" && <p className="ns-note">لا يوجد محول قراءة معتمد لهذا المجال بعد. الإجراءات الحية غير مفعلة في هذا الاستوديو التجريبي.</p>}
      </details>
    </FloatingWindow>}
    {references && <FloatingWindow id="references" title="عقد الواجهات العشرين" initial={{ x: 330, y: 100, width: 440, height: 560 }} onClose={() => setReferences(false)}>
      <p>كل مرجع محفوظ في المستودع. هذه قائمة نطاق التنفيذ وليست إعلان اكتماله.</p>
      <ol className="ns-reference-list">{STUDIO_SCREENS.map(s => <li key={s.id}><button onClick={() => navigateScreen(s.id)}>{s.id} · {s.title}</button><p>{s.scenario}</p><small>القبول البصري: بانتظار الرندرة والمراجعة</small></li>)}</ol>
    </FloatingWindow>}
    {nativeHref && <FloatingWindow id="native-surface" title={STUDIO_PAGES.find(p => p.href === nativeHref)?.label || "أداة الإدارة"} initial={{ x: 50, y: 90, width: 1100, height: 700 }} onClose={() => setNativeHref(null)}>
      <p className="ns-note">واجهة الإدارة الأصلية بصلاحيات جلستك؛ الإجراءات التي تؤكدها هنا قد تغيّر النظام فعليًا.</p>
      <a href={nativeHref} target="_blank" rel="noreferrer">فتح في تبويب مستقل</a>
      <iframe className="ns-native-frame" src={nativeHref} title="أداة الإدارة الأصلية" />
    </FloatingWindow>}
    {supervisorOpen && <FloatingWindow id="supervisor" title="المشرف العام" initial={{ x: 340, y: 94, width: 630, height: 680 }} onClose={() => { setSupervisorOpen(false); setStage("idle"); setOutputLevel(0); }}>
      <SupervisorPanel domain={selected} onActivity={(state, rms) => { setStage(state); setOutputLevel(rms); }} />
    </FloatingWindow>}
    <footer className="ns-dock">
      <button className={listening ? "is-listening" : ""} onClick={() => void toggleAudio()} aria-pressed={listening} aria-label="قياس صوت الميكروفون">◉ <span>{listening ? "إيقاف الميكروفون" : "قياس الميكروفون"}</span></button>
      <span className="ns-meter" aria-label="مستوى الصوت الفعلي">{Array.from({ length: 20 }, (_, i) => <i key={i} style={{ height: 3 + level * (8 + i * 11 % 26) }} />)}</span>
      <button onClick={() => setZoom(z => clampZoom(z-.15))} aria-label="تصغير المشهد">−</button><output>{Math.round(zoom*100)}%</output>
      <button onClick={() => setZoom(z => clampZoom(z+.15))} aria-label="تكبير المشهد">+</button>
      <button onClick={() => { setInspector(true); setSidebar(true); }}>إعادة النوافذ</button>
      <button onClick={() => setReferences(true)}>الواجهات العشرون</button><button onClick={() => setSupervisorOpen(true)}>المشرف العام</button>
      <button onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.querySelector(".ns-studio")?.requestFullscreen().catch(() => setError("الشاشة الكاملة غير متاحة في هذا المتصفح.")); }}>ملء الشاشة</button>
      <small>نسخة تطوير · ربط جزئي موثق · القبول البصري ≥ 90 لم يُعتمد</small>
    </footer>
    {audioError && <div role="alert" className="ns-audio-error">{audioError}</div>}
  </main>;
}
