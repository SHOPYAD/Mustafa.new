import fs from "node:fs";
import {createHash} from "node:crypto";
import {PNG} from "pngjs";
import pixelmatch from "pixelmatch";
const root="../../docs/neural-studio/";
const manifest=JSON.parse(fs.readFileSync(root+"reference-manifest.json","utf8"));
const reviews=JSON.parse(fs.readFileSync(root+"visual-reviews.json","utf8"));
fs.mkdirSync("evidence",{recursive:true});
const reports=[];
for(const item of manifest.references){
 const id=item.name.slice(0,2),capture="evidence/surface-"+id+".png";
 const bytes=fs.readFileSync(root+item.file),hash=createHash("sha256").update(bytes).digest("hex").toUpperCase();
 if(hash!==item.sha256)throw new Error("Immutable reference changed: "+id);
 if(!fs.existsSync(capture)){reports.push({id,capture,accepted:false,reason:"missing-render"});continue;}
 const reference=PNG.sync.read(bytes),actual=PNG.sync.read(fs.readFileSync(capture));
 if(reference.width!==actual.width||reference.height!==actual.height){reports.push({id,accepted:false,reason:"viewport-mismatch"});continue;}
 const diff=new PNG({width:actual.width,height:actual.height});
 const differentPixels=pixelmatch(reference.data,actual.data,diff.data,actual.width,actual.height,{threshold:0,includeAA:true});
 fs.writeFileSync("evidence/"+id+"-pixel-diff.png",PNG.sync.write(diff));
 const review=reviews.reviews.find(r=>r.id===id);
 const accepted=!!(review&&review.approved===true&&typeof review.score==="number"&&review.score>=90&&review.score<=100&&
  review.commit===process.env.GITHUB_SHA&&review.referenceSha256===hash&&review.reviewer&&review.rationale);
 reports.push({id,reference:item.name,capture,differentPixels,totalPixels:actual.width*actual.height,
  score:review?.score??null,accepted,interpretation:"Raw differing pixels are diagnostic, not a perceptual score. Final score requires documented review of this exact commit."});
}
const passed=reports.length===20&&reports.every(r=>r.accepted);
fs.writeFileSync("evidence/visual-audit.json",JSON.stringify({minimumPerScreen:90,passed,reports},null,2));
console.log(JSON.stringify({rendered:reports.filter(r=>r.differentPixels!==undefined).length,accepted:reports.filter(r=>r.accepted).length,required:20,minimumPerScreen:90,passed}));
if(!passed)process.exitCode=1;
