declare module "arabic-reshaper" {
  type ArabicReshaper = {
    convertArabic: (text: string) => string;
  };
  const reshaper: ArabicReshaper;
  export default reshaper;
}

declare module "bidi-js" {
  type EmbeddingLevels = {
    levels: Uint8Array;
    paragraphs: Array<{ start: number; end: number; level: number }>;
  };
  type BidiApi = {
    getEmbeddingLevels: (text: string, dir?: "ltr" | "rtl") => EmbeddingLevels;
    getReorderedString: (text: string, levels: EmbeddingLevels) => string;
  };
  export default function bidiFactory(): BidiApi;
}
