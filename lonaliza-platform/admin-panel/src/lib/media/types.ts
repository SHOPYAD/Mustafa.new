export type MediaProvider = "unsplash" | "pexels";

export type MediaAsset = {
  id: string;
  provider: MediaProvider;
  mediaType: "image" | "video";
  thumbUrl: string;
  previewUrl: string;
  fullUrl: string;
  authorName: string;
  authorUrl?: string;
  caption?: string;
};

export type MediaSearchResult = {
  items: MediaAsset[];
  total: number;
  page: number;
};
