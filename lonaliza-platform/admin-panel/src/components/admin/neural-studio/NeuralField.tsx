"use client";
import { useEffect, useRef } from "react";
import { seededRandom } from "@/lib/neural-studio/workspace";
/** Decorative light field only: never represents transactions or backend traffic. */
export default function NeuralField() {
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current; if(!canvas)return;
  const c=canvas.getContext("2d"); if(!c)return;
  const draw=()=>{
   const bounds=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
   canvas.width=Math.round(bounds.width*dpr);canvas.height=Math.round(bounds.height*dpr);
   c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,bounds.width,bounds.height);
   // Same letterboxed coordinate plane as the SVG: layers cannot drift on resize.
   const scale=Math.min(bounds.width/1672,bounds.height/941);
   c.translate((bounds.width-1672*scale)/2,(bounds.height-941*scale)/2);c.scale(scale,scale);
   const random=seededRandom(271828);
   const style=getComputedStyle(canvas),ion=style.getPropertyValue("--ns-ion").trim();
   const amber=style.getPropertyValue("--ns-amber").trim();
   const halo=(x:number,y:number,r:number,color:string,alpha:number)=>{
    c.globalAlpha=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,color);g.addColorStop(1,"transparent");
    c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
   };
   halo(745,455,400,ion,.045);halo(920,620,350,ion,.025);
   const stars=Array.from({length:17500},()=>({x:random()*1672,y:random()*941,r:random(),a:random()}));
   for(const s of stars){
    const distance=Math.hypot((s.x-745)/1.16,s.y-455);
    const density=distance>150&&distance<520?1:.42;
    c.globalAlpha=(.05+s.a*.54)*density;c.fillStyle=s.a>.93?amber:ion;
    c.fillRect(s.x,s.y,s.r>.96?1.6:.35+s.r*.6,s.r>.96?1.6:.35+s.r*.6);
   }
   // Sparse, long, curved filaments at several depths; not a regular wireframe grid.
   for(let i=0;i<125;i++){
    const a=random()*Math.PI*2,r1=150+random()*410,r2=r1+80+random()*300;
    const x=745+Math.cos(a)*r1*1.19,y=455+Math.sin(a)*r1;
    const b=a+(random()-.5)*1.5,tx=745+Math.cos(b)*r2*1.19,ty=455+Math.sin(b)*r2;
    c.globalAlpha=.045+random()*.15;c.strokeStyle=i%9===0?amber:ion;c.lineWidth=.35+random()*.4;
    c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+(ty-y)*.2,y-(tx-x)*.1,tx-(ty-y)*.25,ty+(tx-x)*.15,tx,ty);c.stroke();
   }
   for(let i=0;i<170;i++){
    const a=random()*Math.PI*2,r=155+random()*510,x=745+Math.cos(a)*r*1.2,y=455+Math.sin(a)*r;
    const color=i%5===0?amber:ion,bright=.25+random()*.6;
    halo(x,y,5+random()*10,color,bright*.35);
    c.globalAlpha=bright;c.fillStyle=color;c.beginPath();c.arc(x,y,.6+random()*1.3,0,Math.PI*2);c.fill();
    if(i%7===0){c.strokeStyle=color;c.lineWidth=.45;c.globalAlpha=.45;
     c.beginPath();c.moveTo(x-7,y);c.lineTo(x+7,y);c.moveTo(x,y-7);c.lineTo(x,y+7);c.stroke();}
   }
   c.globalAlpha=1;
  };
  const observer=new ResizeObserver(draw);observer.observe(canvas);draw();return()=>observer.disconnect();
 },[]);
 return <canvas ref={ref} className="ns-field" aria-hidden="true"/>;
}
