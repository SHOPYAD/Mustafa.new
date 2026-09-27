import { inflateRawSync } from "zlib";
import { normalizeAudienceTable, type AudienceParseResult } from "@/lib/email/parse-audience";

function readU16(buf: Buffer, offset: number): number {
  return buf.readUInt16LE(offset);
}

function readU32(buf: Buffer, offset: number): number {
  return buf.readUInt32LE(offset);
}

function extractZipFiles(buf: Buffer): Map<string, string> {
  let eocd = -1;
  const min = Math.max(0, buf.length - 22 - 0xffff);
  for (let i = buf.length - 22; i >= min; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("ملف Excel غير صالح");

  const count = readU16(buf, eocd + 10);
  const cdOff = readU32(buf, eocd + 16);
  const files = new Map<string, string>();
  let p = cdOff;

  for (let i = 0; i < count; i += 1) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) break;
    const method = readU16(buf, p + 10);
    const compSize = readU32(buf, p + 20);
    const nameLen = readU16(buf, p + 28);
    const extraLen = readU16(buf, p + 30);
    const commentLen = readU16(buf, p + 32);
    const localOff = readU32(buf, p + 42);
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString("utf8");

    if (localOff + 30 <= buf.length && buf.readUInt32LE(localOff) === 0x04034b50) {
      const localNameLen = readU16(buf, localOff + 26);
      const localExtra = readU16(buf, localOff + 28);
      const dataStart = localOff + 30 + localNameLen + localExtra;
      const compressed = buf.subarray(dataStart, dataStart + compSize);
      let data: Buffer;
      if (method === 0) data = Buffer.from(compressed);
      else if (method === 8) data = inflateRawSync(compressed);
      else {
        p += 46 + nameLen + extraLen + commentLen;
        continue;
      }
      files.set(name.replace(/\\/g, "/"), data.toString("utf8"));
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

function xmlDecode(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function innerTexts(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "gi");
  const out: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml))) {
    out.push(xmlDecode(match[1].replace(/<[^>]+>/g, "")));
  }
  return out;
}

function parseSharedStrings(xml: string): string[] {
  const blocks = xml.split(/<si\b/i).slice(1);
  return blocks.map((block) => {
    const body = block.split(/<\/si>/i)[0] || "";
    return innerTexts(body, "t").join("");
  });
}

function colIndex(ref: string): number {
  const letters = (ref.match(/^([A-Za-z]+)/) || [])[1] || "";
  let n = 0;
  for (const ch of letters.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return Math.max(0, n - 1);
}

function rowIndex(ref: string): number {
  const n = Number((ref.match(/(\d+)$/) || [])[1] || "0");
  return Math.max(1, n) - 1;
}

function parseSheetTable(sheetXml: string, shared: string[]): string[][] {
  const cells = [
    ...sheetXml.matchAll(
      /<c\b([^>]*)>([\s\S]*?)<\/c>/gi
    ),
  ];
  const grid = new Map<string, string>();
  let maxRow = -1;
  let maxCol = -1;

  for (const match of cells) {
    const attrs = match[1] || "";
    const inner = match[2] || "";
    const ref = (attrs.match(/\br="([^"]+)"/) || [])[1] || "";
    if (!ref) continue;
    const type = (attrs.match(/\bt="([^"]+)"/) || [])[1] || "";
    let value = "";
    if (type === "s") {
      const idx = Number((inner.match(/<v[^>]*>([\s\S]*?)<\/v>/i) || [])[1] || "");
      value = Number.isFinite(idx) ? shared[idx] || "" : "";
    } else if (type === "inlineStr" || type === "str") {
      value = innerTexts(inner, "t").join("");
    } else {
      value = xmlDecode((inner.match(/<v[^>]*>([\s\S]*?)<\/v>/i) || [])[1] || "");
    }
    const r = rowIndex(ref);
    const c = colIndex(ref);
    grid.set(`${r}:${c}`, value.trim());
    maxRow = Math.max(maxRow, r);
    maxCol = Math.max(maxCol, c);
  }

  const table: string[][] = [];
  for (let r = 0; r <= maxRow; r += 1) {
    const row: string[] = [];
    for (let c = 0; c <= maxCol; c += 1) {
      row.push(grid.get(`${r}:${c}`) || "");
    }
    if (row.some(Boolean)) table.push(row);
  }
  return table;
}

function firstSheetPath(files: Map<string, string>): string {
  const workbook = files.get("xl/workbook.xml") || "";
  const first = workbook.match(/<sheet\b[^>]*\br:id="([^"]+)"/i);
  const rels = files.get("xl/_rels/workbook.xml.rels") || "";
  if (first) {
    const rid = first[1];
    const rel = rels.match(
      new RegExp(`<Relationship\\b[^>]*Id="${rid}"[^>]*Target="([^"]+)"`, "i")
    );
    if (rel?.[1]) {
      const target = rel[1].replace(/^\//, "");
      const path = target.startsWith("xl/") ? target : `xl/${target}`;
      if (files.has(path)) return path;
    }
  }
  const fallback = [...files.keys()].find((name) =>
    /^xl\/worksheets\/sheet\d+\.xml$/i.test(name)
  );
  if (!fallback) throw new Error("لا توجد ورقة عمل في ملف Excel");
  return fallback;
}

export function parseXlsxAudience(buffer: Buffer, fileName = ""): AudienceParseResult {
  const files = extractZipFiles(buffer);
  const sheetPath = firstSheetPath(files);
  const shared = parseSharedStrings(files.get("xl/sharedStrings.xml") || "");
  const table = parseSheetTable(files.get(sheetPath) || "", shared);
  if (!table.length) {
    throw new Error("ملف Excel فارغ");
  }
  return normalizeAudienceTable(table, fileName);
}
