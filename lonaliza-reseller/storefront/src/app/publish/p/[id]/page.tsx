import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost } from "@/lib/publish/posts";
import { mediaUrlsOf } from "@/lib/publish/state";
import { PROVIDER_LABEL_AR } from "@/lib/publish/constants";
import { listChannels } from "@/lib/publish/channels";

export const dynamic = "force-dynamic";
export const robots = { index: false, follow: false };

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "معاينة منشور",
    robots: { index: false, follow: false, nocache: true },
    description: `معاينة غير مدرجة للمنشور ${id}`,
  };
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video/");
}

export default async function PublishPublicPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  const { channels } = await listChannels();
  const channel = channels.find((row) => row.id === post.channelId);
  const media = mediaUrlsOf(post);
  const when = new Date(post.publishDate);
  const whenLabel = Number.isNaN(when.getTime())
    ? post.publishDate
    : when.toLocaleString("ar-EG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <p className="text-xs font-semibold tracking-wide text-zinc-500">معاينة غير مدرجة — رابط اعتماد</p>
      <article className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-zinc-700">
          {channel?.name || PROVIDER_LABEL_AR[channel?.provider || ""] || post.channelId}
        </p>
        <p className="mt-1 text-xs text-zinc-500">{whenLabel}</p>
        {post.title ? <h1 className="mt-4 text-xl font-black text-zinc-900">{post.title}</h1> : null}
        <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-zinc-800">
          {post.content || "بدون نص"}
        </p>
        {media.length > 0 ? (
          <div className="mt-6 space-y-3">
            {media.map((url) =>
              isVideoUrl(url) ? (
                <video key={url} src={url} controls className="w-full rounded-xl bg-black" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="w-full rounded-xl" />
              )
            )}
          </div>
        ) : null}
        <p className="mt-6 text-[11px] text-zinc-400">الحالة: {post.state}</p>
      </article>
    </main>
  );
}
