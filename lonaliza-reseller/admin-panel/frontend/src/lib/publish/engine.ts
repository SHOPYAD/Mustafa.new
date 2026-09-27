import { decryptChannelSecrets, persistDecryptedSecrets } from "./channels";
import { NOT_APPROVED_AR } from "./constants";
import { onPublishLifecycle } from "./hooks";
import { dispatchProvider, getPublishRegistry, type PublishRegistry } from "./registry";
import { refreshChannelOrRecord } from "./refresh";
import { mediaUrlsOf, postApproved, toError, toPublished } from "./state";
import { getStoredChannel, getStoredPost, recordPublishError, saveStoredPost } from "./store";
import type { PublishContext, PublishPost, PublishProviderResult } from "./types";

export type RunPublishOptions = {
  approved?: boolean;
  registry?: PublishRegistry;
};

function asApproved(post: PublishPost, override?: boolean): boolean {
  if (override === true) return true;
  if (override === false) return false;
  return postApproved(post);
}

async function notifyLifecycle(
  post: PublishPost,
  event: "published" | "error"
): Promise<void> {
  try {
    await onPublishLifecycle(post, event);
  } catch (err) {
    console.error(
      "[publish-engine] lifecycle hook failed",
      post.id,
      err instanceof Error ? err.message : err
    );
  }
}

async function buildContext(
  post: PublishPost,
  approved: boolean
): Promise<{ ctx: PublishContext } | { error: string; code: string }> {
  const channel = await getStoredChannel(post.channelId);
  if (!channel) {
    return { error: "القناة غير موجودة", code: "not_connected" };
  }
  if (channel.disabled) {
    return { error: "القناة معطّلة", code: "not_connected" };
  }
  if (channel.refreshNeeded) {
    return { error: "الحساب يحتاج إعادة تحقق", code: "needs_reauth" };
  }
  const secrets = await decryptChannelSecrets(channel);
  if (!secrets.accessToken && !secrets.pageAccessToken) {
    return { error: "لا يوجد رمز وصول محفوظ لهذه القناة", code: "not_connected" };
  }
  return {
    ctx: {
      post,
      channel,
      approved,
      caption: post.content,
      title: post.title,
      mediaUrls: mediaUrlsOf(post),
      accessToken: secrets.accessToken,
      refreshToken: secrets.refreshToken,
      pageAccessToken: secrets.pageAccessToken,
    },
  };
}

/**
 * Execute a queued post. Never hits a social network unless approved === true.
 */
export async function runPublishPost(
  postId: string,
  options: RunPublishOptions = {}
): Promise<{ post: PublishPost; result: PublishProviderResult }> {
  const post = await getStoredPost(postId);
  if (!post) {
    throw new Error("المنشور غير موجود");
  }
  const approved = asApproved(post, options.approved);
  if (approved !== true) {
    await recordPublishError({
      postId: post.id,
      channelId: post.channelId,
      provider: "none",
      code: "not_approved",
      message: NOT_APPROVED_AR,
    });
    return {
      post,
      result: {
        ok: false,
        provider: "none",
        error: { code: "not_approved", message: NOT_APPROVED_AR },
      },
    };
  }

  const built = await buildContext(post, true);
  if ("error" in built) {
    await recordPublishError({
      postId: post.id,
      channelId: post.channelId,
      provider: "unknown",
      code: built.code,
      message: built.error,
    });
    const failed = await saveStoredPost(toError(post, built.error), false);
    await notifyLifecycle(failed, "error");
    return {
      post: failed,
      result: { ok: false, provider: "unknown", error: { code: built.code, message: built.error } },
    };
  }

  const { ctx } = built;
  if (ctx.channel.tokenExpiresAt) {
    const expires = Date.parse(ctx.channel.tokenExpiresAt);
    if (Number.isFinite(expires) && expires - 60_000 <= Date.now()) {
      const refreshed = await refreshChannelOrRecord(ctx.channel);
      if (refreshed.error) {
        const failed = await saveStoredPost(toError(post, refreshed.error), false);
        await notifyLifecycle(failed, "error");
        return {
          post: failed,
          result: {
            ok: false,
            provider: ctx.channel.provider,
            error: { code: "needs_reauth", message: refreshed.error, retryable: true },
          },
        };
      }
      ctx.channel = refreshed.channel;
      const secrets = await decryptChannelSecrets(refreshed.channel);
      ctx.accessToken = secrets.accessToken;
      ctx.refreshToken = secrets.refreshToken;
      ctx.pageAccessToken = secrets.pageAccessToken;
    }
  }

  const registry = options.registry || getPublishRegistry();
  const result = await dispatchProvider(ctx.channel.provider, ctx, registry);

  if (result.ok) {
    const published = await saveStoredPost(
      toPublished(post, { releaseId: result.releaseId, releaseURL: result.releaseURL }),
      false
    );
    await notifyLifecycle(published, "published");
    return { post: published, result };
  }

  const message = result.error?.message || "فشل النشر";
  await recordPublishError({
    postId: post.id,
    channelId: post.channelId,
    provider: ctx.channel.provider,
    code: result.error?.code || "publish_failed",
    message,
    retryable: result.error?.retryable,
  });
  if (result.error?.code === "needs_reauth") {
    await persistDecryptedSecrets(ctx.channel.id, { refreshNeeded: true });
  }
  const failed = await saveStoredPost(toError(post, message), false);
  await notifyLifecycle(failed, "error");
  return { post: failed, result };
}
