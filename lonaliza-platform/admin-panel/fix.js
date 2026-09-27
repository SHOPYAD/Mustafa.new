const fs = require('fs');
const path = require('path');
function fix(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) fix(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      if (c.includes("content-[\\'\\']")) {
        c = c.split("content-[\\'\\']").join("content-['']");
        fs.writeFileSync(p, c);
      }
    }
  }
}
fix('src/app/admin');
fix('src/components/admin');
console.log('Fixed quotes!');
