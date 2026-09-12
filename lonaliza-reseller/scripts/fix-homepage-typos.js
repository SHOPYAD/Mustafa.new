const fs = require("fs");
const p = "src/data/homepage.ts";
let s = fs.readFileSync(p, "utf8");

// Normalize line endings for easier surgery, then restore CRLF
const hadCRLF = s.includes("\r\n");
s = s.replace(/\r\n/g, "\n");

const d8Start = s.indexOf('\n    {\n      id: "d8"');
if (d8Start !== -1) {
  const after = s.indexOf("\n  ],\n  features:", d8Start);
  if (after !== -1) {
    s = s.slice(0, d8Start) + s.slice(after);
  }
}

// Fix d7 display name
s = s.replace(
  'nameEn: "Rize / Ayder"',
  'nameEn: "Rize & Ayder"'
);
// Ensure Rize spelling (in case display confusion)
s = s.replace(/nameEn: "Ri[^"]*Ayder"/, 'nameEn: "Rory & Ayder"'.replace("Rory", "Ri" + "ze"));
s = s.replace(/nameEn: "Rize & Ayder"/, 'nameEn: "' + "Ri" + "ze" + ' & Ayder"');

if (hadCRLF) s = s.replace(/\n/g, "\r\n");
fs.writeFileSync(p, s);

const check = fs.readFileSync(p, "utf8");
console.log("has d8?", check.includes('id: "d8"'));
const idx = check.indexOf('id: "d7"');
console.log(JSON.stringify(check.slice(idx, idx + 80)));
