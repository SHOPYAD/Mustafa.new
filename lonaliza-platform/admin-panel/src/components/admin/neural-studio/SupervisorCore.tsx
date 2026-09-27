"use client";
export default function SupervisorCore({ level = 0, listening = false }: { level?: number; listening?: boolean }) {
 const amplitude = Math.max(0, Math.min(1, level));
 return <g aria-label={listening ? "المشرف: قياس صوت الميكروفون" : "نواة المشرف — غير متصل بالمحادثة"}>
  <circle r="163" fill="url(#ns-corona)" />
  {[146,137,126,118,112,103,94,86,78,69,58,50,43].map((r,i)=><circle key={r} r={r}
   className={"ns-ring "+(i%3===0?"ns-amber":"ns-ion")} strokeWidth={i===3?4:i===5?3.5:i===7?2.5:.65}
   opacity={i<2?.4:1} strokeDasharray={i===3?"220 12 76 18":i===5?"190 8 84 22":undefined}/>)}
  {[121,109,98,89].map((r,i)=><circle key={r} r={r} className={i%2?"ns-ring ns-ion":"ns-ring ns-amber"}
   strokeWidth={i%2?1.4:2} strokeDasharray="2 7 1 14 3 28" opacity=".8" />)}
  {Array.from({length:72},(_,i)=>{const a=i*Math.PI/36;const r=i%6===0?136:131;return <line key={i}
   x1={Math.cos(a)*r} y1={Math.sin(a)*r} x2={Math.cos(a)*(r+5)} y2={Math.sin(a)*(r+5)}
   className={i%6===0?"ns-amber":"ns-ion"} opacity={i%6===0?.9:.35} strokeWidth=".8"/>;})}
  <circle r="47" className="ns-core-face"/>
  <circle r="47" fill="url(#ns-amber-volume)" />
  <circle r="44" className="ns-ring ns-amber" strokeWidth="1.2"/>
  <path d="M -70 0 H 70 M 0 -63 V 55" className="ns-amber" strokeWidth=".5" opacity=".65"/>
  {Array.from({length:39},(_,i)=>{
   const envelope=Math.sin(i/38*Math.PI);
   const h=1.5+amplitude*envelope*(6+i*17%27);
   return <line key={i} x1={-57+i*3} x2={-57+i*3} y1={-h} y2={h} className="ns-amber ns-wave" strokeWidth="1.3"/>;
  })}
  <rect x="-68" y="50" width="136" height="28" rx="10" className="ns-core-caption"/>
  <text y="70" textAnchor="middle" direction="rtl" className="ns-core-label">الوكيل المشرف</text>
 </g>;
}
