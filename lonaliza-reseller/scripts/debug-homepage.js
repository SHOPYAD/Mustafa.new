const fs = require("fs");
const s = fs.readFileSync("src/data/homepage.ts", "utf8");
const m = s.match(/nameEn: "R[^"]+"/);
console.log(m && m[0]);
if (m) {
  for (const c of m[0]) process.stdout.write(`${c}:${c.charCodeAt(0)} `);
}
console.log("\nincludes Rory?", s.includes("Rory"));
console.log("includes Rize?", s.includes("Rize".replace("o","i").replace("ry","ze"))); // nonsense
console.log("includes literal Rize?", s.includes("Ri"+"ze"));
// Force rewrite destinations tail
const start = s.indexOf('id: "d7"');
console.log("d7 at", start);
