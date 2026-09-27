import { createTransport } from "nodemailer";
import { readFile, readdir, stat } from "fs/promises";
import path from "path";

const root = process.cwd();
const domain = "lonaliza.com";
const cid = `brand-logo@${domain}`;

async function loadLogo() {
  const candidates = [
    path.join(root, "public", "logo.png"),
    path.join(root, "public", "brand-logo.png"),
    path.join(root, "public", "favicon.png"),
  ];
  for (const file of candidates) {
    try {
      const content = await readFile(file);
      if (content.length > 0) {
        return { file, content, bytes: content.length };
      }
    } catch {
      /* next */
    }
  }
  try {
    const dir = path.join(root, "public", "uploads", "branding");
    const names = await readdir(dir);
    const ranked = [];
    for (const name of names) {
      if (!/\.(png|jpe?g|webp|gif)$/i.test(name)) continue;
      const file = path.join(dir, name);
      const info = await stat(file);
      ranked.push({ file, mtime: info.mtimeMs });
    }
    ranked.sort((a, b) => b.mtime - a.mtime);
    for (const row of ranked) {
      const content = await readFile(row.file);
      if (content.length > 0) return { file: row.file, content, bytes: content.length };
    }
  } catch {
    /* none */
  }
  return null;
}

const logo = await loadLogo();
if (!logo) {
  console.log("LOGO_BYTES=0");
  console.log("FALLBACK=company-name-wordmark");
  process.exit(0);
}

const transporter = createTransport({
  streamTransport: true,
  buffer: true,
  newline: "unix",
});

const html = `<img src="cid:${cid}" alt="brand" />`;
const info = await transporter.sendMail({
  from: `noreply@${domain}`,
  to: "test@example.com",
  subject: "cid check",
  html,
  text: "cid check",
  attachments: [
    {
      filename: "logo.png",
      content: logo.content,
      contentType: "image/png",
      cid,
      contentDisposition: "inline",
    },
  ],
});

const raw = info.message.toString("utf8");
const cidHeader = raw.match(/Content-ID:\s*(<[^>]+>)/i);
const srcMatch = html.includes(`cid:${cid}`);
const extraBrackets = /Content-ID:\s*<<[^>]+>>/i.test(raw);
const related = /multipart\/related/i.test(raw);
const inline = /Content-Disposition:\s*inline/i.test(raw);
const png = /Content-Type:\s*image\/png/i.test(raw);

console.log(`LOGO_FILE=${logo.file}`);
console.log(`LOGO_BYTES=${logo.bytes}`);
console.log(`CID_TOKEN=${cid}`);
console.log(`HTML_SRC=cid:${cid}`);
console.log(`CONTENT_ID=${cidHeader ? cidHeader[1] : "missing"}`);
console.log(`EXTRA_BRACKETS=${extraBrackets ? "yes" : "no"}`);
console.log(`MULTIPART_RELATED=${related ? "yes" : "no"}`);
console.log(`INLINE=${inline ? "yes" : "no"}`);
console.log(`IMAGE_PNG=${png ? "yes" : "no"}`);
console.log(`SRC_MATCH=${srcMatch ? "yes" : "no"}`);

if (!logo.bytes || extraBrackets || !cidHeader || cidHeader[1] !== `<${cid}>` || !srcMatch) {
  process.exit(1);
}
