"use client";
import {useEffect,useRef,useState} from "react";
import * as THREE from "three";
import type {PublicStage} from "@/lib/neural-studio/surfaces";
export default function HumanoidPresence({level,stage}:{level:number;stage:PublicStage}){
 const host=useRef<HTMLDivElement>(null),activity=useRef({level,stage});
 const [error,setError]=useState("");activity.current={level,stage};
 useEffect(()=>{
  const element=host.current;if(!element)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"high-performance"});}
  catch{setError("الرسم ثلاثي الأبعاد غير متاح في هذا المتصفح. يمكن متابعة استخدام الأدوات والصوت.");return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));element.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,60);camera.position.set(0,.35,9);
  const figure=new THREE.Group();scene.add(figure);
  const positions:number[]=[],sizes:number[]=[];
  const ring=(y:number,rx:number,rz:number,count:number,offset=0)=>{
   for(let i=0;i<count;i++){const a=i/count*Math.PI*2;positions.push(rx*Math.cos(a),y+offset*Math.cos(a*2),rz*Math.sin(a));sizes.push(.6+((i*19)%13)/13);}
  };
  for(let i=0;i<85;i++){const t=-1+2*i/84,y=1.22+t*1.08;ring(y,Math.sqrt(Math.max(0,1-t*t))*(.67+.08*t),Math.sqrt(Math.max(0,1-t*t))*.48,230);}
  for(let i=0;i<34;i++){const t=i/33;ring(-.75+t*.98,.26+.12*(1-t)**2,.24,150);}
  for(let i=0;i<58;i++){const t=i/57;ring(-1.75+t*1.15,1.8-.85*t,.31+.15*(1-t),240,.18*(1-t));}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute("aSize",new THREE.Float32BufferAttribute(sizes,1));
  const shader=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
   uniforms:{uLevel:{value:0},uTime:{value:0},uColor:{value:new THREE.Color("#16e7f1")}},
   vertexShader:`attribute float aSize;uniform float uLevel;uniform float uTime;varying float vFront;
    void main(){vec3 p=position;p.x+=sin(p.y*17.+uTime*3.)*.009*uLevel;
     vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
     gl_PointSize=clamp((1.1+aSize+uLevel*.4)*8./-mv.z,.5,4.);vFront=.45+.55*clamp(p.z+.5,0.,1.);}`,
   fragmentShader:`uniform vec3 uColor;varying float vFront;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(uColor,(1.-smoothstep(.1,1.,r))*vFront);}`});
  const points=new THREE.Points(geometry,shader);figure.add(points);
  const glowGeometry=new THREE.BufferGeometry();glowGeometry.setAttribute("position",new THREE.Float32BufferAttribute([0,1.13,.12,0,-1.16,.12],3));
  const glowShader=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uLevel:{value:0}},
   vertexShader:`uniform float uLevel;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=(155.+uLevel*70.)*6./-p.z;}`,
   fragmentShader:`void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float a=exp(-r*r*5.)*(1.-smoothstep(.6,1.,r));gl_FragColor=vec4(1.,.46,.05,a*.85);}`});
  figure.add(new THREE.Points(glowGeometry,glowShader));
  const veinGeometry=new THREE.BufferGeometry();const v:number[]=[];
  for(let i=0;i<100;i++){const y=-1.2+i*.022;v.push(Math.sin(i*.29)*.06,y,.29);}
  veinGeometry.setAttribute("position",new THREE.Float32BufferAttribute(v,3));
  const veinMaterial=new THREE.LineBasicMaterial({color:0xffbb55,transparent:true,opacity:.8});figure.add(new THREE.Line(veinGeometry,veinMaterial));
  const plumePositions:number[]=[],plumeSize:number[]=[];
  for(let i=0;i<1800;i++){const f=((i*193)%1801)/1801,a=i*2.39996;plumePositions.push(Math.cos(a)*f*.8,2.16+f*.82,Math.sin(a)*f*.55);plumeSize.push(.2);}
  const plumeGeometry=new THREE.BufferGeometry();plumeGeometry.setAttribute("position",new THREE.Float32BufferAttribute(plumePositions,3));plumeGeometry.setAttribute("aSize",new THREE.Float32BufferAttribute(plumeSize,1));
  figure.add(new THREE.Points(plumeGeometry,shader));
  const resize=()=>{const r=element.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize);observer.observe(element);resize();
  let frame=0;const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const start=performance.now();
  const render=()=>{shader.uniforms.uTime.value=reduced.matches?0:(performance.now()-start)/1000;shader.uniforms.uLevel.value=activity.current.level;
   glowShader.uniforms.uLevel.value=activity.current.level;
   renderer.render(scene,camera);frame=requestAnimationFrame(render);};render();
  let dragging=false,lastX=0;
  const down=(e:PointerEvent)=>{dragging=true;lastX=e.clientX;element.setPointerCapture(e.pointerId);};
  const move=(e:PointerEvent)=>{if(dragging){figure.rotation.y=Math.max(-.8,Math.min(.8,figure.rotation.y+(e.clientX-lastX)*.006));lastX=e.clientX;}};
  const up=()=>{dragging=false;};
  element.addEventListener("pointerdown",down);element.addEventListener("pointermove",move);element.addEventListener("pointerup",up);element.addEventListener("pointercancel",up);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();element.removeEventListener("pointerdown",down);element.removeEventListener("pointermove",move);element.removeEventListener("pointerup",up);element.removeEventListener("pointercancel",up);
   geometry.dispose();glowGeometry.dispose();veinGeometry.dispose();plumeGeometry.dispose();shader.dispose();glowShader.dispose();veinMaterial.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <section className="ns-presence" data-testid="surface-20"><div ref={host} className="ns-presence-renderer" aria-label="حضور بشري ثلاثي الأبعاد قابل للتدوير"/><div className="ns-presence-label"><h2>الحضور البشري</h2><p>{stage} · اسحب لتدوير المجسم</p><p>طاقة التوهج مرتبطة بقياس الصوت؛ الحضور لا يعني تنفيذ إجراء.</p></div>{error&&<p role="alert">{error}</p>}</section>;
}
