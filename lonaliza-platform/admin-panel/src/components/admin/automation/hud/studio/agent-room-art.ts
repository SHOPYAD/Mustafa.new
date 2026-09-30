/* رسوم غرفة الوكلاء كما في animated-agent-room.html: روبوتات متحركة وأعصاب، بلا صورة الخلفية. */
export const AGENT_ROOM_SVG = `<svg data-agent-room="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" pointer-events="none" style="display:block;width:100%;height:100%"><defs><filter id="nerve-glow" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="3"/></filter><linearGradient id="nerve-intelligence" gradientUnits="userSpaceOnUse" x1="563" y1="270.5" x2="811" y2="335"><stop stop-color="#A795FF"/><stop offset=".65" stop-color="#A795FF"/><stop offset="1" stop-color="#40eeff"/></linearGradient><linearGradient id="nerve-campaigns" gradientUnits="userSpaceOnUse" x1="358" y1="430.5" x2="777" y2="474"><stop stop-color="#579DFF"/><stop offset=".65" stop-color="#579DFF"/><stop offset="1" stop-color="#40eeff"/></linearGradient><linearGradient id="nerve-social" gradientUnits="userSpaceOnUse" x1="383" y1="615.5" x2="816" y2="628"><stop stop-color="#E682FF"/><stop offset=".65" stop-color="#E682FF"/><stop offset="1" stop-color="#40eeff"/></linearGradient><linearGradient id="nerve-analytics" gradientUnits="userSpaceOnUse" x1="563" y1="765.5" x2="818" y2="753"><stop stop-color="#FFC45C"/><stop offset=".65" stop-color="#FFC45C"/><stop offset="1" stop-color="#40eeff"/></linearGradient><linearGradient id="nerve-operations" gradientUnits="userSpaceOnUse" x1="1357" y1="270.5" x2="1109" y2="335"><stop stop-color="#54E6FF"/><stop offset=".65" stop-color="#54E6FF"/><stop offset="1" stop-color="#40eeff"/></linearGradient><linearGradient id="nerve-sales" gradientUnits="userSpaceOnUse" x1="1562" y1="430.5" x2="1143" y2="474"><stop stop-color="#38EDAA"/><stop offset=".65" stop-color="#38EDAA"/><stop offset="1" stop-color="#40eeff"/></linearGradient><linearGradient id="nerve-business" gradientUnits="userSpaceOnUse" x1="1537" y1="615.5" x2="1104" y2="628"><stop stop-color="#27D9CD"/><stop offset=".65" stop-color="#27D9CD"/><stop offset="1" stop-color="#40eeff"/></linearGradient><linearGradient id="nerve-travel" gradientUnits="userSpaceOnUse" x1="1357" y1="765.5" x2="1102" y2="753"><stop stop-color="#53C8FF"/><stop offset=".65" stop-color="#53C8FF"/><stop offset="1" stop-color="#40eeff"/></linearGradient><clipPath id="chrome"><path d="M0 0H1920V181H0ZM0 1020H1920V1080H0Z"/></clipPath></defs><style>.robot{--eye-x:0px;--eye-y:0px;--mouth-open:.15;cursor:pointer;outline:none}
.robot .pupils{transform:translate(var(--eye-x),var(--eye-y));transition:transform .45s ease}
.robot .eyelids{transform-box:fill-box;transform-origin:center;animation:robot-blink 5.3s infinite;animation-delay:var(--blink-delay,0s)}
.robot .mouth-open{transform-box:fill-box;transform-origin:center;transform:scaleY(var(--mouth-open));opacity:0}
.robot .smile{opacity:1;transition:opacity .12s}
.robot[data-state="speaking"] .mouth-open{opacity:1}
.robot[data-state="speaking"] .smile{opacity:0}
.robot .talk-bars{opacity:0}
.robot[data-state="speaking"] .talk-bars{opacity:.95}
.robot .talk-bars path{transform-box:fill-box;transform-origin:center;animation:robot-meter .38s infinite alternate}
.robot .talk-bars path:nth-child(2){animation-delay:-.11s}
.robot .talk-bars path:nth-child(3){animation-delay:-.26s}
.robot .listen-halo{opacity:0;transform-origin:120px 108px}
.robot[data-state="listening"] .listen-halo{opacity:.75;animation:robot-listen 2s infinite ease-out}
.robot[data-state="speaking"] .active-ring{stroke-width:3.7;filter:drop-shadow(0 0 3px currentColor);animation:robot-ring 1.1s infinite alternate}
.robot[data-state="listening"] .ear-light{animation:robot-ring 1.4s infinite alternate}
.robot .head-motion{transform-origin:120px 145px;animation:robot-breathe 4.5s infinite ease-in-out;animation-delay:var(--blink-delay,0s)}
.robot[data-state="speaking"] .head-motion{animation:robot-talk .75s infinite ease-in-out}
.robot:hover .active-ring,.robot:focus-visible .active-ring{stroke:#fff;stroke-width:3}
.robot .state-label{font-size:11px;fill:#d7f1ff;font-family:Tahoma,Arial;opacity:.85}
.robot .eye-light{filter:drop-shadow(0 0 2px currentColor)}
.nerve-flow{fill:none;stroke:currentColor;stroke-width:2;stroke-dasharray:3 36;opacity:.35;animation:nerve-travel 2.8s linear infinite}
[data-link][data-state="speaking"] .nerve-flow{opacity:1;animation-direction:reverse;animation-duration:1.25s}
[data-link][data-state="listening"] .nerve-flow{opacity:.75}
.agents-hidden .agent-nerves,.agents-hidden [data-agent-id],.agents-hidden [data-link]{visibility:hidden}
@keyframes robot-blink{0%,42%,45%,100%{transform:scaleY(1)}43.5%{transform:scaleY(.08)}}
@keyframes robot-listen{0%{transform:scale(.98);opacity:.7}100%{transform:scale(1.07);opacity:0}}
@keyframes robot-ring{from{opacity:.65}to{opacity:1}}
@keyframes robot-meter{from{transform:scaleY(.3)}to{transform:scaleY(1)}}
@keyframes robot-breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.4px)}}
@keyframes robot-talk{0%,100%{transform:rotate(-.6deg)}50%{transform:rotate(.6deg)}}
@keyframes nerve-travel{to{stroke-dashoffset:156}}
@media(prefers-reduced-motion:reduce){.robot *,.nerve-flow{animation:none!important;transition:none!important}.robot .listen-halo{opacity:.35!important}}
</style><g class="agent-nerves"><path d="M563 264.5 C668 246.5, 721 311.0, 811 335" fill="none" stroke="url(#nerve-intelligence)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M563 264.5 C668 246.5, 721 311.0, 811 335" fill="none" stroke="url(#nerve-intelligence)" stroke-width="0.75" opacity="0.5"/><path d="M563 268.5 C668 262.5, 721 327.0, 811 335" fill="none" stroke="url(#nerve-intelligence)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M563 268.5 C668 262.5, 721 327.0, 811 335" fill="none" stroke="url(#nerve-intelligence)" stroke-width="1.4" opacity="0.85"/><circle cx="607.0403749999999" cy="270.13012499999996" r="5" fill="#A795FF" filter="url(#nerve-glow)"/><circle cx="607.0403749999999" cy="270.13012499999996" r="1.7" fill="#eaffff"/><circle cx="690.365161" cy="295.519727" r="5" fill="#A795FF" filter="url(#nerve-glow)"/><circle cx="690.365161" cy="295.519727" r="1.7" fill="#eaffff"/><circle cx="756.024728" cy="322.86849599999994" r="5" fill="#A795FF" filter="url(#nerve-glow)"/><circle cx="756.024728" cy="322.86849599999994" r="1.7" fill="#eaffff"/><path d="M563 272.5 C668 278.5, 721 343.0, 811 335" fill="none" stroke="url(#nerve-intelligence)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M563 272.5 C668 278.5, 721 343.0, 811 335" fill="none" stroke="url(#nerve-intelligence)" stroke-width="0.75" opacity="0.5"/><path d="M563 276.5 C668 294.5, 721 359.0, 811 335" fill="none" stroke="url(#nerve-intelligence)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M563 276.5 C668 294.5, 721 359.0, 811 335" fill="none" stroke="url(#nerve-intelligence)" stroke-width="0.75" opacity="0.5"/><circle cx="811" cy="335" r="4" fill="#82f8ff" filter="url(#nerve-glow)"/><path d="M358 424.5 C463 406.5, 687 450.0, 777 474" fill="none" stroke="url(#nerve-campaigns)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M358 424.5 C463 406.5, 687 450.0, 777 474" fill="none" stroke="url(#nerve-campaigns)" stroke-width="0.75" opacity="0.5"/><path d="M358 428.5 C463 422.5, 687 466.0, 777 474" fill="none" stroke="url(#nerve-campaigns)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M358 428.5 C463 422.5, 687 466.0, 777 474" fill="none" stroke="url(#nerve-campaigns)" stroke-width="1.4" opacity="0.85"/><circle cx="412.4286249999999" cy="428.85437499999995" r="5" fill="#579DFF" filter="url(#nerve-glow)"/><circle cx="412.4286249999999" cy="428.85437499999995" r="1.7" fill="#eaffff"/><circle cx="568.3005029999999" cy="445.33468500000004" r="5" fill="#579DFF" filter="url(#nerve-glow)"/><circle cx="568.3005029999999" cy="445.33468500000004" r="1.7" fill="#eaffff"/><circle cx="700.8371440000001" cy="464.47048" r="5" fill="#579DFF" filter="url(#nerve-glow)"/><circle cx="700.8371440000001" cy="464.47048" r="1.7" fill="#eaffff"/><path d="M358 432.5 C463 438.5, 687 482.0, 777 474" fill="none" stroke="url(#nerve-campaigns)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M358 432.5 C463 438.5, 687 482.0, 777 474" fill="none" stroke="url(#nerve-campaigns)" stroke-width="0.75" opacity="0.5"/><path d="M358 436.5 C463 454.5, 687 498.0, 777 474" fill="none" stroke="url(#nerve-campaigns)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M358 436.5 C463 454.5, 687 498.0, 777 474" fill="none" stroke="url(#nerve-campaigns)" stroke-width="0.75" opacity="0.5"/><circle cx="777" cy="474" r="4" fill="#82f8ff" filter="url(#nerve-glow)"/><path d="M383 609.5 C488 591.5, 726 604.0, 816 628" fill="none" stroke="url(#nerve-social)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M383 609.5 C488 591.5, 726 604.0, 816 628" fill="none" stroke="url(#nerve-social)" stroke-width="0.75" opacity="0.5"/><path d="M383 613.5 C488 607.5, 726 620.0, 816 628" fill="none" stroke="url(#nerve-social)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M383 613.5 C488 607.5, 726 620.0, 816 628" fill="none" stroke="url(#nerve-social)" stroke-width="1.4" opacity="0.85"/><circle cx="438.27912499999996" cy="611.9711249999999" r="5" fill="#E682FF" filter="url(#nerve-glow)"/><circle cx="438.27912499999996" cy="611.9711249999999" r="1.7" fill="#eaffff"/><circle cx="600.090531" cy="615.299623" r="5" fill="#E682FF" filter="url(#nerve-glow)"/><circle cx="600.090531" cy="615.299623" r="1.7" fill="#eaffff"/><circle cx="738.102488" cy="622.311504" r="5" fill="#E682FF" filter="url(#nerve-glow)"/><circle cx="738.102488" cy="622.311504" r="1.7" fill="#eaffff"/><path d="M383 617.5 C488 623.5, 726 636.0, 816 628" fill="none" stroke="url(#nerve-social)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M383 617.5 C488 623.5, 726 636.0, 816 628" fill="none" stroke="url(#nerve-social)" stroke-width="0.75" opacity="0.5"/><path d="M383 621.5 C488 639.5, 726 652.0, 816 628" fill="none" stroke="url(#nerve-social)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M383 621.5 C488 639.5, 726 652.0, 816 628" fill="none" stroke="url(#nerve-social)" stroke-width="0.75" opacity="0.5"/><circle cx="816" cy="628" r="4" fill="#82f8ff" filter="url(#nerve-glow)"/><path d="M563 759.5 C668 741.5, 728 729.0, 818 753" fill="none" stroke="url(#nerve-analytics)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M563 759.5 C668 741.5, 728 729.0, 818 753" fill="none" stroke="url(#nerve-analytics)" stroke-width="0.75" opacity="0.5"/><path d="M563 763.5 C668 757.5, 728 745.0, 818 753" fill="none" stroke="url(#nerve-analytics)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M563 763.5 C668 757.5, 728 745.0, 818 753" fill="none" stroke="url(#nerve-analytics)" stroke-width="1.4" opacity="0.85"/><circle cx="607.4656249999999" cy="760.4523749999998" r="5" fill="#FFC45C" filter="url(#nerve-glow)"/><circle cx="607.4656249999999" cy="760.4523749999998" r="1.7" fill="#eaffff"/><circle cx="693.760175" cy="753.174573" r="5" fill="#FFC45C" filter="url(#nerve-glow)"/><circle cx="693.760175" cy="753.174573" r="1.7" fill="#eaffff"/><circle cx="762.1573999999999" cy="750.409104" r="5" fill="#FFC45C" filter="url(#nerve-glow)"/><circle cx="762.1573999999999" cy="750.409104" r="1.7" fill="#eaffff"/><path d="M563 767.5 C668 773.5, 728 761.0, 818 753" fill="none" stroke="url(#nerve-analytics)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M563 767.5 C668 773.5, 728 761.0, 818 753" fill="none" stroke="url(#nerve-analytics)" stroke-width="0.75" opacity="0.5"/><path d="M563 771.5 C668 789.5, 728 777.0, 818 753" fill="none" stroke="url(#nerve-analytics)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M563 771.5 C668 789.5, 728 777.0, 818 753" fill="none" stroke="url(#nerve-analytics)" stroke-width="0.75" opacity="0.5"/><circle cx="818" cy="753" r="4" fill="#82f8ff" filter="url(#nerve-glow)"/><path d="M1357 264.5 C1252 246.5, 1199 311.0, 1109 335" fill="none" stroke="url(#nerve-operations)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1357 264.5 C1252 246.5, 1199 311.0, 1109 335" fill="none" stroke="url(#nerve-operations)" stroke-width="0.75" opacity="0.5"/><path d="M1357 268.5 C1252 262.5, 1199 327.0, 1109 335" fill="none" stroke="url(#nerve-operations)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1357 268.5 C1252 262.5, 1199 327.0, 1109 335" fill="none" stroke="url(#nerve-operations)" stroke-width="1.4" opacity="0.85"/><circle cx="1312.9596249999997" cy="270.13012499999996" r="5" fill="#54E6FF" filter="url(#nerve-glow)"/><circle cx="1312.9596249999997" cy="270.13012499999996" r="1.7" fill="#eaffff"/><circle cx="1229.634839" cy="295.519727" r="5" fill="#54E6FF" filter="url(#nerve-glow)"/><circle cx="1229.634839" cy="295.519727" r="1.7" fill="#eaffff"/><circle cx="1163.975272" cy="322.86849599999994" r="5" fill="#54E6FF" filter="url(#nerve-glow)"/><circle cx="1163.975272" cy="322.86849599999994" r="1.7" fill="#eaffff"/><path d="M1357 272.5 C1252 278.5, 1199 343.0, 1109 335" fill="none" stroke="url(#nerve-operations)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1357 272.5 C1252 278.5, 1199 343.0, 1109 335" fill="none" stroke="url(#nerve-operations)" stroke-width="0.75" opacity="0.5"/><path d="M1357 276.5 C1252 294.5, 1199 359.0, 1109 335" fill="none" stroke="url(#nerve-operations)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1357 276.5 C1252 294.5, 1199 359.0, 1109 335" fill="none" stroke="url(#nerve-operations)" stroke-width="0.75" opacity="0.5"/><circle cx="1109" cy="335" r="4" fill="#82f8ff" filter="url(#nerve-glow)"/><path d="M1562 424.5 C1457 406.5, 1233 450.0, 1143 474" fill="none" stroke="url(#nerve-sales)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1562 424.5 C1457 406.5, 1233 450.0, 1143 474" fill="none" stroke="url(#nerve-sales)" stroke-width="0.75" opacity="0.5"/><path d="M1562 428.5 C1457 422.5, 1233 466.0, 1143 474" fill="none" stroke="url(#nerve-sales)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1562 428.5 C1457 422.5, 1233 466.0, 1143 474" fill="none" stroke="url(#nerve-sales)" stroke-width="1.4" opacity="0.85"/><circle cx="1507.571375" cy="428.85437499999995" r="5" fill="#38EDAA" filter="url(#nerve-glow)"/><circle cx="1507.571375" cy="428.85437499999995" r="1.7" fill="#eaffff"/><circle cx="1351.699497" cy="445.33468500000004" r="5" fill="#38EDAA" filter="url(#nerve-glow)"/><circle cx="1351.699497" cy="445.33468500000004" r="1.7" fill="#eaffff"/><circle cx="1219.162856" cy="464.47048" r="5" fill="#38EDAA" filter="url(#nerve-glow)"/><circle cx="1219.162856" cy="464.47048" r="1.7" fill="#eaffff"/><path d="M1562 432.5 C1457 438.5, 1233 482.0, 1143 474" fill="none" stroke="url(#nerve-sales)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1562 432.5 C1457 438.5, 1233 482.0, 1143 474" fill="none" stroke="url(#nerve-sales)" stroke-width="0.75" opacity="0.5"/><path d="M1562 436.5 C1457 454.5, 1233 498.0, 1143 474" fill="none" stroke="url(#nerve-sales)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1562 436.5 C1457 454.5, 1233 498.0, 1143 474" fill="none" stroke="url(#nerve-sales)" stroke-width="0.75" opacity="0.5"/><circle cx="1143" cy="474" r="4" fill="#82f8ff" filter="url(#nerve-glow)"/><path d="M1537 609.5 C1432 591.5, 1194 604.0, 1104 628" fill="none" stroke="url(#nerve-business)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1537 609.5 C1432 591.5, 1194 604.0, 1104 628" fill="none" stroke="url(#nerve-business)" stroke-width="0.75" opacity="0.5"/><path d="M1537 613.5 C1432 607.5, 1194 620.0, 1104 628" fill="none" stroke="url(#nerve-business)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1537 613.5 C1432 607.5, 1194 620.0, 1104 628" fill="none" stroke="url(#nerve-business)" stroke-width="1.4" opacity="0.85"/><circle cx="1481.720875" cy="611.9711249999999" r="5" fill="#27D9CD" filter="url(#nerve-glow)"/><circle cx="1481.720875" cy="611.9711249999999" r="1.7" fill="#eaffff"/><circle cx="1319.909469" cy="615.299623" r="5" fill="#27D9CD" filter="url(#nerve-glow)"/><circle cx="1319.909469" cy="615.299623" r="1.7" fill="#eaffff"/><circle cx="1181.897512" cy="622.311504" r="5" fill="#27D9CD" filter="url(#nerve-glow)"/><circle cx="1181.897512" cy="622.311504" r="1.7" fill="#eaffff"/><path d="M1537 617.5 C1432 623.5, 1194 636.0, 1104 628" fill="none" stroke="url(#nerve-business)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1537 617.5 C1432 623.5, 1194 636.0, 1104 628" fill="none" stroke="url(#nerve-business)" stroke-width="0.75" opacity="0.5"/><path d="M1537 621.5 C1432 639.5, 1194 652.0, 1104 628" fill="none" stroke="url(#nerve-business)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1537 621.5 C1432 639.5, 1194 652.0, 1104 628" fill="none" stroke="url(#nerve-business)" stroke-width="0.75" opacity="0.5"/><circle cx="1104" cy="628" r="4" fill="#82f8ff" filter="url(#nerve-glow)"/><path d="M1357 759.5 C1252 741.5, 1192 729.0, 1102 753" fill="none" stroke="url(#nerve-travel)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1357 759.5 C1252 741.5, 1192 729.0, 1102 753" fill="none" stroke="url(#nerve-travel)" stroke-width="0.75" opacity="0.5"/><path d="M1357 763.5 C1252 757.5, 1192 745.0, 1102 753" fill="none" stroke="url(#nerve-travel)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1357 763.5 C1252 757.5, 1192 745.0, 1102 753" fill="none" stroke="url(#nerve-travel)" stroke-width="1.4" opacity="0.85"/><circle cx="1312.534375" cy="760.4523749999998" r="5" fill="#53C8FF" filter="url(#nerve-glow)"/><circle cx="1312.534375" cy="760.4523749999998" r="1.7" fill="#eaffff"/><circle cx="1226.239825" cy="753.174573" r="5" fill="#53C8FF" filter="url(#nerve-glow)"/><circle cx="1226.239825" cy="753.174573" r="1.7" fill="#eaffff"/><circle cx="1157.8426" cy="750.409104" r="5" fill="#53C8FF" filter="url(#nerve-glow)"/><circle cx="1157.8426" cy="750.409104" r="1.7" fill="#eaffff"/><path d="M1357 767.5 C1252 773.5, 1192 761.0, 1102 753" fill="none" stroke="url(#nerve-travel)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1357 767.5 C1252 773.5, 1192 761.0, 1102 753" fill="none" stroke="url(#nerve-travel)" stroke-width="0.75" opacity="0.5"/><path d="M1357 771.5 C1252 789.5, 1192 777.0, 1102 753" fill="none" stroke="url(#nerve-travel)" stroke-width="4" opacity=".25" filter="url(#nerve-glow)"/><path d="M1357 771.5 C1252 789.5, 1192 777.0, 1102 753" fill="none" stroke="url(#nerve-travel)" stroke-width="0.75" opacity="0.5"/><circle cx="1102" cy="753" r="4" fill="#82f8ff" filter="url(#nerve-glow)"/><g data-link="intelligence" data-state="idle" style="color:#BCAFFF"><path class="nerve-flow" d="M563 267 C668 249,721 353,811 335"/></g><g data-link="operations" data-state="idle" style="color:#82EFFF"><path class="nerve-flow" d="M1357 267 C1252 249,1199 353,1109 335"/></g><g data-link="campaigns" data-state="idle" style="color:#89BDFF"><path class="nerve-flow" d="M348 431 C453 413,687 492,777 474"/></g><g data-link="sales" data-state="idle" style="color:#78F6C8"><path class="nerve-flow" d="M1572 431 C1467 413,1233 492,1143 474"/></g><g data-link="social" data-state="idle" style="color:#F0B0FF"><path class="nerve-flow" d="M383 619 C488 601,726 646,816 628"/></g><g data-link="business" data-state="idle" style="color:#73F3E4"><path class="nerve-flow" d="M1537 619 C1432 601,1194 646,1104 628"/></g><g data-link="analytics" data-state="idle" style="color:#FFDA8B"><path class="nerve-flow" d="M563 767 C668 749,728 771,818 753"/></g><g data-link="travel" data-state="idle" style="color:#92DEFF"><path class="nerve-flow" d="M1357 767 C1252 749,1192 771,1102 753"/></g></g><svg class="robot" pointer-events="auto" data-agent-id="intelligence" data-name="مخابرات الشركات" data-x="490" data-y="267" tabindex="0" data-state="idle" xmlns="http://www.w3.org/2000/svg" x="395" y="182" width="190" height="204.25" viewBox="0 0 240 258" role="button" aria-labelledby="intelligence-title" style="--blink-delay:-0.00s;color:#BCAFFF">
 <title id="intelligence-title">مخابرات الشركات</title>
 <defs>
  <radialGradient id="intelligence-bg"><stop stop-color="#BCAFFF" stop-opacity=".32"/><stop offset="1" stop-color="#07121f"/></radialGradient>
  <linearGradient id="intelligence-metal" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#ffffff"/><stop offset=".24" stop-color="#f5fbff"/><stop offset=".52" stop-color="#d4e5f1"/><stop offset=".77" stop-color="#ffffff"/><stop offset="1" stop-color="#a3bccf"/></linearGradient>
  <linearGradient id="intelligence-body" x2="0" y2="1"><stop stop-color="#f7fdff"/><stop offset="1" stop-color="#b8d1e3"/></linearGradient>
  <filter id="intelligence-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <clipPath id="intelligence-clip"><circle cx="120" cy="108" r="88"/></clipPath>
 </defs>
 <circle cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-opacity=".06" stroke-width="8"/>
 <circle cx="120" cy="108" r="93" fill="#06101e" stroke="currentColor" stroke-opacity=".26"/>
 <circle cx="120" cy="108" r="88" fill="url(#intelligence-bg)" stroke="currentColor" stroke-opacity=".55" stroke-width="1.5"/>
 <circle cx="120" cy="108" r="93" fill="none" stroke="currentColor" stroke-width="2.5" class="active-ring" stroke-dasharray="100 192" transform="rotate(-50 120 108)"/>
 <circle class="listen-halo" cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-width="1.5"/><g clip-path="url(#intelligence-clip)"><g class="head-motion">
 <path d="M55 190Q59 169 96 160L107 150H133L144 160Q181 169 185 190V207H55Z" fill="url(#intelligence-body)" stroke="#697f98"/>
 <path d="M108 143H132V164L120 176 108 164Z" fill="#9ab6c8" stroke="#8097af"/>
 <path d="M70 176 94 168 107 185M170 176 146 168 133 185" fill="none" stroke="currentColor" stroke-width="2"/>
 <path d="M73 195H101M167 195H139" stroke="#8195ad" stroke-opacity=".3"/>
 <path d="M109 185H131L136 197H104Z" fill="#e9f8ff" stroke="#6f8299"/>
 <path d="M116 190H124" stroke="currentColor" stroke-width="3"/>
 <rect x="68" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <rect x="155" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <path d="M73 99V114M167 99V114" stroke="currentColor" stroke-width="3"/>
 <path d="M77 77 92 60H148L163 77V131L146 151H94L77 131Z" fill="url(#intelligence-metal)" stroke="#bdd0e1" stroke-width="1.1"/>
 <path d="M88 121 97 142M152 121 143 142" stroke="#9aafbf" stroke-width="3"/>
 <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M108 58V44H132V58M120 44V35"/><circle cx="120" cy="32" r="4" fill="currentColor"/></g>
 <rect x="83" y="78" width="74" height="64" rx="20" fill="#18364a" stroke="#ffffff" stroke-width="1.3"/>
 <path d="M92 81H119" stroke="#c5f8ff" stroke-width="2" opacity=".55" stroke-linecap="round"/>
 <g class="eyelids"><rect x="90" y="89" width="25" height="23" rx="7" fill="#f2fcff"/><rect x="125" y="89" width="25" height="23" rx="7" fill="#f2fcff"/><g class="pupils"><ellipse class="eye-light" cx="103" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><ellipse class="eye-light" cx="137" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><circle cx="103" cy="101" r="3.2" fill="#163343"/><circle cx="137" cy="101" r="3.2" fill="#163343"/><circle cx="101" cy="98" r="1.8" fill="white"/><circle cx="135" cy="98" r="1.8" fill="white"/></g></g>
 <path class="smile" d="M110 125Q120 132 130 125" fill="none" stroke="#e0faff" stroke-width="2.6" stroke-linecap="round"/>
 <ellipse class="mouth-open" cx="120" cy="127" rx="10" ry="7" fill="#78edff" stroke="#e3fbff" stroke-width="1.3"/>
 <path class="ear-light" d="M72 99V113M168 99V113" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
 <path d="M89 118H94M146 118H151" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
 </g>
 </g><circle cx="185" cy="173" r="7" fill="#05101b" stroke="currentColor" stroke-width="1.2"/>
 <circle cx="185" cy="173" r="3" fill="currentColor"/>
 <text x="120" y="234" text-anchor="middle" direction="rtl" fill="currentColor" font-family="Tahoma,Arial,sans-serif" font-size="17" font-weight="700">مخابرات الشركات</text>
<text class="state-label" x="120" y="253" text-anchor="middle" direction="rtl">جاهز</text><g class="talk-bars" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M109 207v6"/><path d="M120 204v12"/><path d="M131 207v6"/></g></svg><svg class="robot" pointer-events="auto" data-agent-id="campaigns" data-name="البريد والحملات" data-x="275" data-y="431" tabindex="0" data-state="idle" xmlns="http://www.w3.org/2000/svg" x="180" y="346" width="190" height="204.25" viewBox="0 0 240 258" role="button" aria-labelledby="campaigns-title" style="--blink-delay:-1.14s;color:#89BDFF">
 <title id="campaigns-title">البريد والحملات</title>
 <defs>
  <radialGradient id="campaigns-bg"><stop stop-color="#89BDFF" stop-opacity=".32"/><stop offset="1" stop-color="#07121f"/></radialGradient>
  <linearGradient id="campaigns-metal" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#ffffff"/><stop offset=".24" stop-color="#f5fbff"/><stop offset=".52" stop-color="#d4e5f1"/><stop offset=".77" stop-color="#ffffff"/><stop offset="1" stop-color="#a3bccf"/></linearGradient>
  <linearGradient id="campaigns-body" x2="0" y2="1"><stop stop-color="#f7fdff"/><stop offset="1" stop-color="#b8d1e3"/></linearGradient>
  <filter id="campaigns-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <clipPath id="campaigns-clip"><circle cx="120" cy="108" r="88"/></clipPath>
 </defs>
 <circle cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-opacity=".06" stroke-width="8"/>
 <circle cx="120" cy="108" r="93" fill="#06101e" stroke="currentColor" stroke-opacity=".26"/>
 <circle cx="120" cy="108" r="88" fill="url(#campaigns-bg)" stroke="currentColor" stroke-opacity=".55" stroke-width="1.5"/>
 <circle cx="120" cy="108" r="93" fill="none" stroke="currentColor" stroke-width="2.5" class="active-ring" stroke-dasharray="100 192" transform="rotate(-50 120 108)"/>
 <circle class="listen-halo" cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-width="1.5"/><g clip-path="url(#campaigns-clip)"><g class="head-motion">
 <path d="M55 190Q59 169 96 160L107 150H133L144 160Q181 169 185 190V207H55Z" fill="url(#campaigns-body)" stroke="#697f98"/>
 <path d="M108 143H132V164L120 176 108 164Z" fill="#9ab6c8" stroke="#8097af"/>
 <path d="M70 176 94 168 107 185M170 176 146 168 133 185" fill="none" stroke="currentColor" stroke-width="2"/>
 <path d="M73 195H101M167 195H139" stroke="#8195ad" stroke-opacity=".3"/>
 <path d="M109 185H131L136 197H104Z" fill="#e9f8ff" stroke="#6f8299"/>
 <path d="M116 190H124" stroke="currentColor" stroke-width="3"/>
 <rect x="68" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <rect x="155" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <path d="M73 99V114M167 99V114" stroke="currentColor" stroke-width="3"/>
 <path d="M78 80Q78 66 94 66H146Q162 66 162 80V131L146 149H94L78 131Z" fill="url(#campaigns-metal)" stroke="#bdd0e1" stroke-width="1.1"/>
 <path d="M88 121 97 142M152 121 143 142" stroke="#9aafbf" stroke-width="3"/>
 <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M72 95V58L64 49M168 95V58L176 49"/><circle cx="64" cy="45" r="4" fill="currentColor"/><circle cx="176" cy="45" r="4" fill="currentColor"/></g>
 <rect x="83" y="78" width="74" height="64" rx="20" fill="#18364a" stroke="#ffffff" stroke-width="1.3"/>
 <path d="M92 81H119" stroke="#c5f8ff" stroke-width="2" opacity=".55" stroke-linecap="round"/>
 <g class="eyelids"><rect x="90" y="89" width="25" height="23" rx="11" fill="#f2fcff"/><rect x="125" y="89" width="25" height="23" rx="11" fill="#f2fcff"/><g class="pupils"><ellipse class="eye-light" cx="103" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><ellipse class="eye-light" cx="137" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><circle cx="103" cy="101" r="3.2" fill="#163343"/><circle cx="137" cy="101" r="3.2" fill="#163343"/><circle cx="101" cy="98" r="1.8" fill="white"/><circle cx="135" cy="98" r="1.8" fill="white"/></g></g>
 <path class="smile" d="M110 125Q120 132 130 125" fill="none" stroke="#e0faff" stroke-width="2.6" stroke-linecap="round"/>
 <ellipse class="mouth-open" cx="120" cy="127" rx="10" ry="7" fill="#78edff" stroke="#e3fbff" stroke-width="1.3"/>
 <path class="ear-light" d="M72 99V113M168 99V113" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
 <path d="M89 118H94M146 118H151" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
 </g>
 </g><circle cx="185" cy="173" r="7" fill="#05101b" stroke="currentColor" stroke-width="1.2"/>
 <circle cx="185" cy="173" r="3" fill="currentColor"/>
 <text x="120" y="234" text-anchor="middle" direction="rtl" fill="currentColor" font-family="Tahoma,Arial,sans-serif" font-size="17" font-weight="700">البريد والحملات</text>
<text class="state-label" x="120" y="253" text-anchor="middle" direction="rtl">جاهز</text><g class="talk-bars" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M109 207v6"/><path d="M120 204v12"/><path d="M131 207v6"/></g></svg><svg class="robot" pointer-events="auto" data-agent-id="social" data-name="المحتوى الاجتماعي" data-x="310" data-y="619" tabindex="0" data-state="idle" xmlns="http://www.w3.org/2000/svg" x="215" y="534" width="190" height="204.25" viewBox="0 0 240 258" role="button" aria-labelledby="social-title" style="--blink-delay:-2.28s;color:#F0B0FF">
 <title id="social-title">المحتوى الاجتماعي</title>
 <defs>
  <radialGradient id="social-bg"><stop stop-color="#F0B0FF" stop-opacity=".32"/><stop offset="1" stop-color="#07121f"/></radialGradient>
  <linearGradient id="social-metal" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#ffffff"/><stop offset=".24" stop-color="#f5fbff"/><stop offset=".52" stop-color="#d4e5f1"/><stop offset=".77" stop-color="#ffffff"/><stop offset="1" stop-color="#a3bccf"/></linearGradient>
  <linearGradient id="social-body" x2="0" y2="1"><stop stop-color="#f7fdff"/><stop offset="1" stop-color="#b8d1e3"/></linearGradient>
  <filter id="social-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <clipPath id="social-clip"><circle cx="120" cy="108" r="88"/></clipPath>
 </defs>
 <circle cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-opacity=".06" stroke-width="8"/>
 <circle cx="120" cy="108" r="93" fill="#06101e" stroke="currentColor" stroke-opacity=".26"/>
 <circle cx="120" cy="108" r="88" fill="url(#social-bg)" stroke="currentColor" stroke-opacity=".55" stroke-width="1.5"/>
 <circle cx="120" cy="108" r="93" fill="none" stroke="currentColor" stroke-width="2.5" class="active-ring" stroke-dasharray="100 192" transform="rotate(-50 120 108)"/>
 <circle class="listen-halo" cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-width="1.5"/><g clip-path="url(#social-clip)"><g class="head-motion">
 <path d="M55 190Q59 169 96 160L107 150H133L144 160Q181 169 185 190V207H55Z" fill="url(#social-body)" stroke="#697f98"/>
 <path d="M108 143H132V164L120 176 108 164Z" fill="#9ab6c8" stroke="#8097af"/>
 <path d="M70 176 94 168 107 185M170 176 146 168 133 185" fill="none" stroke="currentColor" stroke-width="2"/>
 <path d="M73 195H101M167 195H139" stroke="#8195ad" stroke-opacity=".3"/>
 <path d="M109 185H131L136 197H104Z" fill="#e9f8ff" stroke="#6f8299"/>
 <path d="M116 190H124" stroke="currentColor" stroke-width="3"/>
 <rect x="68" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <rect x="155" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <path d="M73 99V114M167 99V114" stroke="currentColor" stroke-width="3"/>
 <path d="M78 88Q78 60 120 60Q162 60 162 88V125Q162 153 120 153Q78 153 78 125Z" fill="url(#social-metal)" stroke="#bdd0e1" stroke-width="1.1"/>
 <path d="M88 121 97 142M152 121 143 142" stroke="#9aafbf" stroke-width="3"/>
 <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M103 61 98 46M137 61 142 46"/><circle cx="97" cy="42" r="5" fill="currentColor"/><circle cx="143" cy="42" r="5" fill="currentColor"/></g>
 <rect x="83" y="78" width="74" height="64" rx="20" fill="#18364a" stroke="#ffffff" stroke-width="1.3"/>
 <path d="M92 81H119" stroke="#c5f8ff" stroke-width="2" opacity=".55" stroke-linecap="round"/>
 <g class="eyelids"><rect x="90" y="89" width="25" height="23" rx="11" fill="#f2fcff"/><rect x="125" y="89" width="25" height="23" rx="11" fill="#f2fcff"/><g class="pupils"><ellipse class="eye-light" cx="103" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><ellipse class="eye-light" cx="137" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><circle cx="103" cy="101" r="3.2" fill="#163343"/><circle cx="137" cy="101" r="3.2" fill="#163343"/><circle cx="101" cy="98" r="1.8" fill="white"/><circle cx="135" cy="98" r="1.8" fill="white"/></g></g>
 <path class="smile" d="M110 125Q120 132 130 125" fill="none" stroke="#e0faff" stroke-width="2.6" stroke-linecap="round"/>
 <ellipse class="mouth-open" cx="120" cy="127" rx="10" ry="7" fill="#78edff" stroke="#e3fbff" stroke-width="1.3"/>
 <path class="ear-light" d="M72 99V113M168 99V113" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
 <path d="M89 118H94M146 118H151" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
 </g>
 </g><circle cx="185" cy="173" r="7" fill="#05101b" stroke="currentColor" stroke-width="1.2"/>
 <circle cx="185" cy="173" r="3" fill="currentColor"/>
 <text x="120" y="234" text-anchor="middle" direction="rtl" fill="currentColor" font-family="Tahoma,Arial,sans-serif" font-size="17" font-weight="700">المحتوى الاجتماعي</text>
<text class="state-label" x="120" y="253" text-anchor="middle" direction="rtl">جاهز</text><g class="talk-bars" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M109 207v6"/><path d="M120 204v12"/><path d="M131 207v6"/></g></svg><svg class="robot" pointer-events="auto" data-agent-id="analytics" data-name="التحليلات والأداء" data-x="490" data-y="767" tabindex="0" data-state="idle" xmlns="http://www.w3.org/2000/svg" x="395" y="682" width="190" height="204.25" viewBox="0 0 240 258" role="button" aria-labelledby="analytics-title" style="--blink-delay:-3.42s;color:#FFDA8B">
 <title id="analytics-title">التحليلات والأداء</title>
 <defs>
  <radialGradient id="analytics-bg"><stop stop-color="#FFDA8B" stop-opacity=".32"/><stop offset="1" stop-color="#07121f"/></radialGradient>
  <linearGradient id="analytics-metal" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#ffffff"/><stop offset=".24" stop-color="#f5fbff"/><stop offset=".52" stop-color="#d4e5f1"/><stop offset=".77" stop-color="#ffffff"/><stop offset="1" stop-color="#a3bccf"/></linearGradient>
  <linearGradient id="analytics-body" x2="0" y2="1"><stop stop-color="#f7fdff"/><stop offset="1" stop-color="#b8d1e3"/></linearGradient>
  <filter id="analytics-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <clipPath id="analytics-clip"><circle cx="120" cy="108" r="88"/></clipPath>
 </defs>
 <circle cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-opacity=".06" stroke-width="8"/>
 <circle cx="120" cy="108" r="93" fill="#06101e" stroke="currentColor" stroke-opacity=".26"/>
 <circle cx="120" cy="108" r="88" fill="url(#analytics-bg)" stroke="currentColor" stroke-opacity=".55" stroke-width="1.5"/>
 <circle cx="120" cy="108" r="93" fill="none" stroke="currentColor" stroke-width="2.5" class="active-ring" stroke-dasharray="100 192" transform="rotate(-50 120 108)"/>
 <circle class="listen-halo" cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-width="1.5"/><g clip-path="url(#analytics-clip)"><g class="head-motion">
 <path d="M55 190Q59 169 96 160L107 150H133L144 160Q181 169 185 190V207H55Z" fill="url(#analytics-body)" stroke="#697f98"/>
 <path d="M108 143H132V164L120 176 108 164Z" fill="#9ab6c8" stroke="#8097af"/>
 <path d="M70 176 94 168 107 185M170 176 146 168 133 185" fill="none" stroke="currentColor" stroke-width="2"/>
 <path d="M73 195H101M167 195H139" stroke="#8195ad" stroke-opacity=".3"/>
 <path d="M109 185H131L136 197H104Z" fill="#e9f8ff" stroke="#6f8299"/>
 <path d="M116 190H124" stroke="currentColor" stroke-width="3"/>
 <rect x="68" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <rect x="155" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <path d="M73 99V114M167 99V114" stroke="currentColor" stroke-width="3"/>
 <path d="M120 55 158 74 166 105 153 136 120 154 87 136 74 105 82 74Z" fill="url(#analytics-metal)" stroke="#bdd0e1" stroke-width="1.1"/>
 <path d="M88 121 97 142M152 121 143 142" stroke="#9aafbf" stroke-width="3"/>
 <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M120 57V37M112 44 120 36 128 44"/></g>
 <rect x="83" y="78" width="74" height="64" rx="20" fill="#18364a" stroke="#ffffff" stroke-width="1.3"/>
 <path d="M92 81H119" stroke="#c5f8ff" stroke-width="2" opacity=".55" stroke-linecap="round"/>
 <g class="eyelids"><rect x="90" y="89" width="25" height="23" rx="7" fill="#f2fcff"/><rect x="125" y="89" width="25" height="23" rx="7" fill="#f2fcff"/><g class="pupils"><ellipse class="eye-light" cx="103" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><ellipse class="eye-light" cx="137" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><circle cx="103" cy="101" r="3.2" fill="#163343"/><circle cx="137" cy="101" r="3.2" fill="#163343"/><circle cx="101" cy="98" r="1.8" fill="white"/><circle cx="135" cy="98" r="1.8" fill="white"/></g></g>
 <path class="smile" d="M110 125Q120 132 130 125" fill="none" stroke="#e0faff" stroke-width="2.6" stroke-linecap="round"/>
 <ellipse class="mouth-open" cx="120" cy="127" rx="10" ry="7" fill="#78edff" stroke="#e3fbff" stroke-width="1.3"/>
 <path class="ear-light" d="M72 99V113M168 99V113" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
 <path d="M89 118H94M146 118H151" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
 </g>
 </g><circle cx="185" cy="173" r="7" fill="#05101b" stroke="currentColor" stroke-width="1.2"/>
 <circle cx="185" cy="173" r="3" fill="currentColor"/>
 <text x="120" y="234" text-anchor="middle" direction="rtl" fill="currentColor" font-family="Tahoma,Arial,sans-serif" font-size="17" font-weight="700">التحليلات والأداء</text>
<text class="state-label" x="120" y="253" text-anchor="middle" direction="rtl">جاهز</text><g class="talk-bars" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M109 207v6"/><path d="M120 204v12"/><path d="M131 207v6"/></g></svg><svg class="robot" pointer-events="auto" data-agent-id="operations" data-name="تشغيل اللوحة" data-x="1430" data-y="267" tabindex="0" data-state="idle" xmlns="http://www.w3.org/2000/svg" x="1335" y="182" width="190" height="204.25" viewBox="0 0 240 258" role="button" aria-labelledby="operations-title" style="--blink-delay:-0.57s;color:#82EFFF">
 <title id="operations-title">تشغيل اللوحة</title>
 <defs>
  <radialGradient id="operations-bg"><stop stop-color="#82EFFF" stop-opacity=".32"/><stop offset="1" stop-color="#07121f"/></radialGradient>
  <linearGradient id="operations-metal" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#ffffff"/><stop offset=".24" stop-color="#f5fbff"/><stop offset=".52" stop-color="#d4e5f1"/><stop offset=".77" stop-color="#ffffff"/><stop offset="1" stop-color="#a3bccf"/></linearGradient>
  <linearGradient id="operations-body" x2="0" y2="1"><stop stop-color="#f7fdff"/><stop offset="1" stop-color="#b8d1e3"/></linearGradient>
  <filter id="operations-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <clipPath id="operations-clip"><circle cx="120" cy="108" r="88"/></clipPath>
 </defs>
 <circle cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-opacity=".06" stroke-width="8"/>
 <circle cx="120" cy="108" r="93" fill="#06101e" stroke="currentColor" stroke-opacity=".26"/>
 <circle cx="120" cy="108" r="88" fill="url(#operations-bg)" stroke="currentColor" stroke-opacity=".55" stroke-width="1.5"/>
 <circle cx="120" cy="108" r="93" fill="none" stroke="currentColor" stroke-width="2.5" class="active-ring" stroke-dasharray="100 192" transform="rotate(-50 120 108)"/>
 <circle class="listen-halo" cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-width="1.5"/><g clip-path="url(#operations-clip)"><g class="head-motion">
 <path d="M55 190Q59 169 96 160L107 150H133L144 160Q181 169 185 190V207H55Z" fill="url(#operations-body)" stroke="#697f98"/>
 <path d="M108 143H132V164L120 176 108 164Z" fill="#9ab6c8" stroke="#8097af"/>
 <path d="M70 176 94 168 107 185M170 176 146 168 133 185" fill="none" stroke="currentColor" stroke-width="2"/>
 <path d="M73 195H101M167 195H139" stroke="#8195ad" stroke-opacity=".3"/>
 <path d="M109 185H131L136 197H104Z" fill="#e9f8ff" stroke="#6f8299"/>
 <path d="M116 190H124" stroke="currentColor" stroke-width="3"/>
 <rect x="68" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <rect x="155" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <path d="M73 99V114M167 99V114" stroke="currentColor" stroke-width="3"/>
 <path d="M80 78Q80 59 100 59H140Q160 59 160 78V130Q155 151 120 155Q85 151 80 130Z" fill="url(#operations-metal)" stroke="#bdd0e1" stroke-width="1.1"/>
 <path d="M88 121 97 142M152 121 143 142" stroke="#9aafbf" stroke-width="3"/>
 <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M104 61V47H136V61"/><rect x="108" y="44" width="24" height="8" rx="4" fill="currentColor"/></g>
 <rect x="83" y="78" width="74" height="64" rx="20" fill="#18364a" stroke="#ffffff" stroke-width="1.3"/>
 <path d="M92 81H119" stroke="#c5f8ff" stroke-width="2" opacity=".55" stroke-linecap="round"/>
 <g class="eyelids"><rect x="90" y="89" width="25" height="23" rx="11" fill="#f2fcff"/><rect x="125" y="89" width="25" height="23" rx="11" fill="#f2fcff"/><g class="pupils"><ellipse class="eye-light" cx="103" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><ellipse class="eye-light" cx="137" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><circle cx="103" cy="101" r="3.2" fill="#163343"/><circle cx="137" cy="101" r="3.2" fill="#163343"/><circle cx="101" cy="98" r="1.8" fill="white"/><circle cx="135" cy="98" r="1.8" fill="white"/></g></g>
 <path class="smile" d="M110 125Q120 132 130 125" fill="none" stroke="#e0faff" stroke-width="2.6" stroke-linecap="round"/>
 <ellipse class="mouth-open" cx="120" cy="127" rx="10" ry="7" fill="#78edff" stroke="#e3fbff" stroke-width="1.3"/>
 <path class="ear-light" d="M72 99V113M168 99V113" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
 <path d="M89 118H94M146 118H151" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
 </g>
 </g><circle cx="185" cy="173" r="7" fill="#05101b" stroke="currentColor" stroke-width="1.2"/>
 <circle cx="185" cy="173" r="3" fill="currentColor"/>
 <text x="120" y="234" text-anchor="middle" direction="rtl" fill="currentColor" font-family="Tahoma,Arial,sans-serif" font-size="17" font-weight="700">تشغيل اللوحة</text>
<text class="state-label" x="120" y="253" text-anchor="middle" direction="rtl">جاهز</text><g class="talk-bars" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M109 207v6"/><path d="M120 204v12"/><path d="M131 207v6"/></g></svg><svg class="robot" pointer-events="auto" data-agent-id="sales" data-name="المبيعات والأتمتة" data-x="1645" data-y="431" tabindex="0" data-state="idle" xmlns="http://www.w3.org/2000/svg" x="1550" y="346" width="190" height="204.25" viewBox="0 0 240 258" role="button" aria-labelledby="sales-title" style="--blink-delay:-1.71s;color:#78F6C8">
 <title id="sales-title">المبيعات والأتمتة</title>
 <defs>
  <radialGradient id="sales-bg"><stop stop-color="#78F6C8" stop-opacity=".32"/><stop offset="1" stop-color="#07121f"/></radialGradient>
  <linearGradient id="sales-metal" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#ffffff"/><stop offset=".24" stop-color="#f5fbff"/><stop offset=".52" stop-color="#d4e5f1"/><stop offset=".77" stop-color="#ffffff"/><stop offset="1" stop-color="#a3bccf"/></linearGradient>
  <linearGradient id="sales-body" x2="0" y2="1"><stop stop-color="#f7fdff"/><stop offset="1" stop-color="#b8d1e3"/></linearGradient>
  <filter id="sales-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <clipPath id="sales-clip"><circle cx="120" cy="108" r="88"/></clipPath>
 </defs>
 <circle cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-opacity=".06" stroke-width="8"/>
 <circle cx="120" cy="108" r="93" fill="#06101e" stroke="currentColor" stroke-opacity=".26"/>
 <circle cx="120" cy="108" r="88" fill="url(#sales-bg)" stroke="currentColor" stroke-opacity=".55" stroke-width="1.5"/>
 <circle cx="120" cy="108" r="93" fill="none" stroke="currentColor" stroke-width="2.5" class="active-ring" stroke-dasharray="100 192" transform="rotate(-50 120 108)"/>
 <circle class="listen-halo" cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-width="1.5"/><g clip-path="url(#sales-clip)"><g class="head-motion">
 <path d="M55 190Q59 169 96 160L107 150H133L144 160Q181 169 185 190V207H55Z" fill="url(#sales-body)" stroke="#697f98"/>
 <path d="M108 143H132V164L120 176 108 164Z" fill="#9ab6c8" stroke="#8097af"/>
 <path d="M70 176 94 168 107 185M170 176 146 168 133 185" fill="none" stroke="currentColor" stroke-width="2"/>
 <path d="M73 195H101M167 195H139" stroke="#8195ad" stroke-opacity=".3"/>
 <path d="M109 185H131L136 197H104Z" fill="#e9f8ff" stroke="#6f8299"/>
 <path d="M116 190H124" stroke="currentColor" stroke-width="3"/>
 <rect x="68" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <rect x="155" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <path d="M73 99V114M167 99V114" stroke="currentColor" stroke-width="3"/>
 <path d="M76 84 94 62H146L164 84 159 132 140 153H100L81 132Z" fill="url(#sales-metal)" stroke="#bdd0e1" stroke-width="1.1"/>
 <path d="M88 121 97 142M152 121 143 142" stroke="#9aafbf" stroke-width="3"/>
 <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M97 64 105 49H135L143 64"/><path d="M110 56H130" stroke-width="4"/></g>
 <rect x="83" y="78" width="74" height="64" rx="20" fill="#18364a" stroke="#ffffff" stroke-width="1.3"/>
 <path d="M92 81H119" stroke="#c5f8ff" stroke-width="2" opacity=".55" stroke-linecap="round"/>
 <g class="eyelids"><rect x="90" y="89" width="25" height="23" rx="7" fill="#f2fcff"/><rect x="125" y="89" width="25" height="23" rx="7" fill="#f2fcff"/><g class="pupils"><ellipse class="eye-light" cx="103" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><ellipse class="eye-light" cx="137" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><circle cx="103" cy="101" r="3.2" fill="#163343"/><circle cx="137" cy="101" r="3.2" fill="#163343"/><circle cx="101" cy="98" r="1.8" fill="white"/><circle cx="135" cy="98" r="1.8" fill="white"/></g></g>
 <path class="smile" d="M110 125Q120 132 130 125" fill="none" stroke="#e0faff" stroke-width="2.6" stroke-linecap="round"/>
 <ellipse class="mouth-open" cx="120" cy="127" rx="10" ry="7" fill="#78edff" stroke="#e3fbff" stroke-width="1.3"/>
 <path class="ear-light" d="M72 99V113M168 99V113" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
 <path d="M89 118H94M146 118H151" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
 </g>
 </g><circle cx="185" cy="173" r="7" fill="#05101b" stroke="currentColor" stroke-width="1.2"/>
 <circle cx="185" cy="173" r="3" fill="currentColor"/>
 <text x="120" y="234" text-anchor="middle" direction="rtl" fill="currentColor" font-family="Tahoma,Arial,sans-serif" font-size="17" font-weight="700">المبيعات والأتمتة</text>
<text class="state-label" x="120" y="253" text-anchor="middle" direction="rtl">جاهز</text><g class="talk-bars" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M109 207v6"/><path d="M120 204v12"/><path d="M131 207v6"/></g></svg><svg class="robot" pointer-events="auto" data-agent-id="business" data-name="ربط B2B لوناليزا" data-x="1610" data-y="619" tabindex="0" data-state="idle" xmlns="http://www.w3.org/2000/svg" x="1515" y="534" width="190" height="204.25" viewBox="0 0 240 258" role="button" aria-labelledby="business-title" style="--blink-delay:-2.85s;color:#73F3E4">
 <title id="business-title">ربط B2B لوناليزا</title>
 <defs>
  <radialGradient id="business-bg"><stop stop-color="#73F3E4" stop-opacity=".32"/><stop offset="1" stop-color="#07121f"/></radialGradient>
  <linearGradient id="business-metal" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#ffffff"/><stop offset=".24" stop-color="#f5fbff"/><stop offset=".52" stop-color="#d4e5f1"/><stop offset=".77" stop-color="#ffffff"/><stop offset="1" stop-color="#a3bccf"/></linearGradient>
  <linearGradient id="business-body" x2="0" y2="1"><stop stop-color="#f7fdff"/><stop offset="1" stop-color="#b8d1e3"/></linearGradient>
  <filter id="business-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <clipPath id="business-clip"><circle cx="120" cy="108" r="88"/></clipPath>
 </defs>
 <circle cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-opacity=".06" stroke-width="8"/>
 <circle cx="120" cy="108" r="93" fill="#06101e" stroke="currentColor" stroke-opacity=".26"/>
 <circle cx="120" cy="108" r="88" fill="url(#business-bg)" stroke="currentColor" stroke-opacity=".55" stroke-width="1.5"/>
 <circle cx="120" cy="108" r="93" fill="none" stroke="currentColor" stroke-width="2.5" class="active-ring" stroke-dasharray="100 192" transform="rotate(-50 120 108)"/>
 <circle class="listen-halo" cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-width="1.5"/><g clip-path="url(#business-clip)"><g class="head-motion">
 <path d="M55 190Q59 169 96 160L107 150H133L144 160Q181 169 185 190V207H55Z" fill="url(#business-body)" stroke="#697f98"/>
 <path d="M108 143H132V164L120 176 108 164Z" fill="#9ab6c8" stroke="#8097af"/>
 <path d="M70 176 94 168 107 185M170 176 146 168 133 185" fill="none" stroke="currentColor" stroke-width="2"/>
 <path d="M73 195H101M167 195H139" stroke="#8195ad" stroke-opacity=".3"/>
 <path d="M109 185H131L136 197H104Z" fill="#e9f8ff" stroke="#6f8299"/>
 <path d="M116 190H124" stroke="currentColor" stroke-width="3"/>
 <rect x="68" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <rect x="155" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <path d="M73 99V114M167 99V114" stroke="currentColor" stroke-width="3"/>
 <path d="M80 72 100 61H140L160 72V133L144 151H96L80 133Z" fill="url(#business-metal)" stroke="#bdd0e1" stroke-width="1.1"/>
 <path d="M88 121 97 142M152 121 143 142" stroke="#9aafbf" stroke-width="3"/>
 <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M104 62V46H113V62M127 62V46H136V62"/><path d="M106 47H111M129 47H134" stroke-width="4"/></g>
 <rect x="83" y="78" width="74" height="64" rx="20" fill="#18364a" stroke="#ffffff" stroke-width="1.3"/>
 <path d="M92 81H119" stroke="#c5f8ff" stroke-width="2" opacity=".55" stroke-linecap="round"/>
 <g class="eyelids"><rect x="90" y="89" width="25" height="23" rx="7" fill="#f2fcff"/><rect x="125" y="89" width="25" height="23" rx="7" fill="#f2fcff"/><g class="pupils"><ellipse class="eye-light" cx="103" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><ellipse class="eye-light" cx="137" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><circle cx="103" cy="101" r="3.2" fill="#163343"/><circle cx="137" cy="101" r="3.2" fill="#163343"/><circle cx="101" cy="98" r="1.8" fill="white"/><circle cx="135" cy="98" r="1.8" fill="white"/></g></g>
 <path class="smile" d="M110 125Q120 132 130 125" fill="none" stroke="#e0faff" stroke-width="2.6" stroke-linecap="round"/>
 <ellipse class="mouth-open" cx="120" cy="127" rx="10" ry="7" fill="#78edff" stroke="#e3fbff" stroke-width="1.3"/>
 <path class="ear-light" d="M72 99V113M168 99V113" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
 <path d="M89 118H94M146 118H151" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
 </g>
 </g><circle cx="185" cy="173" r="7" fill="#05101b" stroke="currentColor" stroke-width="1.2"/>
 <circle cx="185" cy="173" r="3" fill="currentColor"/>
 <text x="120" y="234" text-anchor="middle" direction="rtl" fill="currentColor" font-family="Tahoma,Arial,sans-serif" font-size="17" font-weight="700">ربط B2B لوناليزا</text>
<text class="state-label" x="120" y="253" text-anchor="middle" direction="rtl">جاهز</text><g class="talk-bars" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M109 207v6"/><path d="M120 204v12"/><path d="M131 207v6"/></g></svg><svg class="robot" pointer-events="auto" data-agent-id="travel" data-name="السفر الذكي بالموقع" data-x="1430" data-y="767" tabindex="0" data-state="idle" xmlns="http://www.w3.org/2000/svg" x="1335" y="682" width="190" height="204.25" viewBox="0 0 240 258" role="button" aria-labelledby="travel-title" style="--blink-delay:-3.99s;color:#92DEFF">
 <title id="travel-title">السفر الذكي بالموقع</title>
 <defs>
  <radialGradient id="travel-bg"><stop stop-color="#92DEFF" stop-opacity=".32"/><stop offset="1" stop-color="#07121f"/></radialGradient>
  <linearGradient id="travel-metal" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#ffffff"/><stop offset=".24" stop-color="#f5fbff"/><stop offset=".52" stop-color="#d4e5f1"/><stop offset=".77" stop-color="#ffffff"/><stop offset="1" stop-color="#a3bccf"/></linearGradient>
  <linearGradient id="travel-body" x2="0" y2="1"><stop stop-color="#f7fdff"/><stop offset="1" stop-color="#b8d1e3"/></linearGradient>
  <filter id="travel-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <clipPath id="travel-clip"><circle cx="120" cy="108" r="88"/></clipPath>
 </defs>
 <circle cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-opacity=".06" stroke-width="8"/>
 <circle cx="120" cy="108" r="93" fill="#06101e" stroke="currentColor" stroke-opacity=".26"/>
 <circle cx="120" cy="108" r="88" fill="url(#travel-bg)" stroke="currentColor" stroke-opacity=".55" stroke-width="1.5"/>
 <circle cx="120" cy="108" r="93" fill="none" stroke="currentColor" stroke-width="2.5" class="active-ring" stroke-dasharray="100 192" transform="rotate(-50 120 108)"/>
 <circle class="listen-halo" cx="120" cy="108" r="96" fill="none" stroke="currentColor" stroke-width="1.5"/><g clip-path="url(#travel-clip)"><g class="head-motion">
 <path d="M55 190Q59 169 96 160L107 150H133L144 160Q181 169 185 190V207H55Z" fill="url(#travel-body)" stroke="#697f98"/>
 <path d="M108 143H132V164L120 176 108 164Z" fill="#9ab6c8" stroke="#8097af"/>
 <path d="M70 176 94 168 107 185M170 176 146 168 133 185" fill="none" stroke="currentColor" stroke-width="2"/>
 <path d="M73 195H101M167 195H139" stroke="#8195ad" stroke-opacity=".3"/>
 <path d="M109 185H131L136 197H104Z" fill="#e9f8ff" stroke="#6f8299"/>
 <path d="M116 190H124" stroke="currentColor" stroke-width="3"/>
 <rect x="68" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <rect x="155" y="90" width="17" height="33" rx="7" fill="#e8f5ff" stroke="#8194ae"/>
 <path d="M73 99V114M167 99V114" stroke="currentColor" stroke-width="3"/>
 <path d="M78 86 88 66 120 58 152 66 162 86 157 132 137 151H103L83 132Z" fill="url(#travel-metal)" stroke="#bdd0e1" stroke-width="1.1"/>
 <path d="M88 121 97 142M152 121 143 142" stroke="#9aafbf" stroke-width="3"/>
 <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M75 87 66 69 67 116 79 128M165 87 174 69 173 116 161 128" fill="#dceeff"/></g>
 <rect x="83" y="78" width="74" height="64" rx="20" fill="#18364a" stroke="#ffffff" stroke-width="1.3"/>
 <path d="M92 81H119" stroke="#c5f8ff" stroke-width="2" opacity=".55" stroke-linecap="round"/>
 <g class="eyelids"><rect x="90" y="89" width="25" height="23" rx="7" fill="#f2fcff"/><rect x="125" y="89" width="25" height="23" rx="7" fill="#f2fcff"/><g class="pupils"><ellipse class="eye-light" cx="103" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><ellipse class="eye-light" cx="137" cy="101" rx="6.5" ry="8.3" fill="currentColor"/><circle cx="103" cy="101" r="3.2" fill="#163343"/><circle cx="137" cy="101" r="3.2" fill="#163343"/><circle cx="101" cy="98" r="1.8" fill="white"/><circle cx="135" cy="98" r="1.8" fill="white"/></g></g>
 <path class="smile" d="M110 125Q120 132 130 125" fill="none" stroke="#e0faff" stroke-width="2.6" stroke-linecap="round"/>
 <ellipse class="mouth-open" cx="120" cy="127" rx="10" ry="7" fill="#78edff" stroke="#e3fbff" stroke-width="1.3"/>
 <path class="ear-light" d="M72 99V113M168 99V113" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
 <path d="M89 118H94M146 118H151" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
 </g>
 </g><circle cx="185" cy="173" r="7" fill="#05101b" stroke="currentColor" stroke-width="1.2"/>
 <circle cx="185" cy="173" r="3" fill="currentColor"/>
 <text x="120" y="234" text-anchor="middle" direction="rtl" fill="currentColor" font-family="Tahoma,Arial,sans-serif" font-size="17" font-weight="700">السفر الذكي بالموقع</text>
<text class="state-label" x="120" y="253" text-anchor="middle" direction="rtl">جاهز</text><g class="talk-bars" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M109 207v6"/><path d="M120 204v12"/><path d="M131 207v6"/></g></svg></svg>`;
