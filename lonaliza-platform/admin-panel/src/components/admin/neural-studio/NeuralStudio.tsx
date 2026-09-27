"use client";
import { useEffect, useRef, useState } from "react";
import { STUDIO_DOMAINS, STUDIO_PAGES, STUDIO_SCREENS, SOURCE_COMMIT, type DomainId } from "@/lib/neural-studio/catalog";
import { clampZoom } from "@/lib/neural-studio/workspace";
import NeuralField from "./NeuralField";
import NeuralAtlas from "./NeuralAtlas";
import FloatingWindow from "./FloatingWindow";
import "./neural-studio.css";
type Observation = { tool: string; status: string; observedAt?: string; readDurationMs?: number; facts: Array<{ key: string; labelAr: string; value: unknown; source: string; available: boolean }> };
type Snapshot = { status: string; observedAt?: string; observations: Observation[] };
export default function NeuralStudio() {
  const [selected, setSelected] = useState<DomainId>("overview");
  const [expanded, setExpanded] = useState<string[]>([]);
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
  const toggle = (id: string) => setExpanded(previous => previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]);
  const inspectPage = (href: string) => {
    const page = STUDIO_PAGES.find(p => p.href === href);
    if (page?.domain) setSelected(page.domain as DomainId);
    setPageHref(href); setInspector(true);
  };
  const select = (id: DomainId) => { setSelected(id); setPageHref(null); setInspector(true); };
  const status = loading ? "جارٍ الاستعلام" : error ? "تعذر الاتصال" : snapshot?.status === "ready" ? "قراءة موثقة" : snapshot?.status === "partial" ? "قراءة جزئية" : "غير موصول بعد";
  return <main className="ns-studio" dir="rtl" data-testid="neural-studio">
    <NeuralField />
    <header className="ns-topbar">
      <div><h1>الأطلس العصبي الشامل</h1><p>منصة عمليات المعرفة المؤسسية</p></div>
      <div className="ns-depth" aria-label="مستوى التوسع">L{expanded.length ? 1 : 0}<span /> {expanded.length} فروع مفتوحة</div>
      <nav aria-label="مسار الاستوديو"><a href="/admin">لوحة الإدارة</a><span>‹</span><button onClick={() => { setExpanded([]); select("overview"); setZoom(1); }}>الأطلس الشامل</button></nav>
    </header>
    <NeuralAtlas selected={selected} expanded={expanded} onSelect={select} onToggle={toggle}
      onInspect={inspectPage} zoom={zoom} level={level} listening={listening} />
    {sidebar ? <aside className="ns-explorer" aria-label="مستكشف المنصة">
      <header><strong>المستكشف</strong><button aria-label="إغلاق المستكشف" onClick={() => setSidebar(false)}>×</button></header>
      <input aria-label="البحث في أقسام المنصة" placeholder="البحث في المجالات…" value={query} onChange={e => setQuery(e.target.value)} />
      <div className="ns-explorer-scroll">
        {STUDIO_DOMAINS.filter(d => !query || d.label.includes(query) || STUDIO_PAGES.some(p => p.domain === d.id && p.label.includes(query))).map(d =>
          <section key={d.id}>
            <div className={"ns-tree-domain " + (selected === d.id ? "is-selected" : "")}>
              <button aria-label={"توسيع " + d.label} aria-expanded={expanded.includes(d.id)} onClick={() => toggle(d.id)}>{expanded.includes(d.id) ? "▾" : "◂"}</button>
              <button onClick={() => select(d.id)}><span className="ns-tree-orb" />{d.label}</button>
            </div>
            {(expanded.includes(d.id) || query) && <ul>{STUDIO_PAGES.filter(p => p.domain === d.id && (!query || d.label.includes(query) || p.label.includes(query))).map(p =>
              <li key={p.href}><button onClick={() => inspectPage(p.href)}>{p.label}</button></li>)}</ul>}
          </section>)}
      </div>
      <footer>{STUDIO_PAGES.filter(p => p.domain).length} ملف صفحة مصنف · فهرس المصدر، لا حالة تشغيل</footer>
    </aside> : <button className="ns-explorer-reopen" aria-label="فتح المستكشف" onClick={() => setSidebar(true)}>المستكشف ‹</button>}
    {inspector && <FloatingWindow id="inspector" title="معلومات السياق" initial={{ x: 14, y: 86, width: 300, height: 365 }} onClose={() => setInspector(false)}>
      <p className="ns-eyeline">التحديد</p><h2>{selectedPage?.label || domain.label}</h2>
      <dl><dt>المصدر</dt><dd>فهرس المستودع · {SOURCE_COMMIT.slice(0, 7)}</dd><dt>القراءة التشغيلية</dt><dd data-testid="source-status">{status}</dd></dl>
      {selectedPage && <><code className="ns-route" dir="ltr">{selectedPage.href}</code>
        {!selectedPage.dynamic && <a className="ns-action" href={selectedPage.href} target="_blank" rel="noreferrer">فتح واجهة القسم الحالية</a>}
        <p className="ns-note">هذه علاقة احتواء موثقة بالملف، وليست مسار تنفيذ حي أو اتصال مزود.</p></>}
      {loading && <p role="status">قراءة الأدوات المسجلة لهذا المجال…</p>}
      {error && <p role="alert">{error}</p>}
      {snapshot?.observations.map(o => <section className="ns-observation" key={o.tool}>
        <code dir="ltr">{o.tool}</code>
        {o.status !== "ready" ? <p>المصدر غير متاح</p> : o.facts.map(f =>
          <dl key={f.key}><dt>{f.labelAr}</dt><dd>{f.available ? String(f.value ?? "غير متاح") : "غير متاح"}</dd></dl>)}
        {o.observedAt && <small>وقت القراءة: {new Date(o.observedAt).toLocaleTimeString("ar")}</small>}
      </section>)}
      {!loading && !error && snapshot?.status === "not_connected" && <p className="ns-note">لا يوجد محول قراءة معتمد لهذا المجال بعد. الإجراءات الحية غير مفعلة في هذا الاستوديو التجريبي.</p>}
    </FloatingWindow>}
    {references && <FloatingWindow id="references" title="عقد الواجهات العشرين" initial={{ x: 330, y: 100, width: 440, height: 560 }} onClose={() => setReferences(false)}>
      <p>كل مرجع محفوظ في المستودع. هذه قائمة نطاق التنفيذ وليست إعلان اكتماله.</p>
      <ol className="ns-reference-list">{STUDIO_SCREENS.map(s => <li key={s.id}><strong>{s.id} · {s.title}</strong><p>{s.scenario}</p><small>القبول البصري: بانتظار الرندرة والمراجعة</small></li>)}</ol>
    </FloatingWindow>}
    <footer className="ns-dock">
      <button className={listening ? "is-listening" : ""} onClick={() => void toggleAudio()} aria-pressed={listening} aria-label="قياس صوت الميكروفون">◉ <span>{listening ? "إيقاف الميكروفون" : "قياس الميكروفون"}</span></button>
      <span className="ns-meter" aria-label="مستوى الصوت الفعلي">{Array.from({ length: 20 }, (_, i) => <i key={i} style={{ height: 3 + level * (8 + i * 11 % 26) }} />)}</span>
      <button onClick={() => setZoom(z => clampZoom(z-.15))} aria-label="تصغير المشهد">−</button><output>{Math.round(zoom*100)}%</output>
      <button onClick={() => setZoom(z => clampZoom(z+.15))} aria-label="تكبير المشهد">+</button>
      <button onClick={() => { setInspector(true); setSidebar(true); }}>إعادة النوافذ</button>
      <button onClick={() => setReferences(true)}>الواجهات العشرون</button>
      <button onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.querySelector(".ns-studio")?.requestFullscreen().catch(() => setError("الشاشة الكاملة غير متاحة في هذا المتصفح.")); }}>ملء الشاشة</button>
      <small>نسخة تطوير · الربط الجزئي معلّم · المطابقة غير معتمدة</small>
    </footer>
    {audioError && <div role="alert" className="ns-audio-error">{audioError}</div>}
  </main>;
}
