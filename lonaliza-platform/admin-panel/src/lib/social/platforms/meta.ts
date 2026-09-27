import {
  getMetaSocialEnv,
  isMetaConfigured,
  META_SCOPES,
  oauthRedirectUri,
  resolveSocialOrigin,
} from "../env";
import { fetchFormJson, fetchJsonWithRetry, SocialHttpError } from "../http";
import { splitMedia } from "../media";
import {
  isTokenExpired,
  patchStoredAccount,
  upsertStoredAccount,
  type UpsertAccountInput,
} from "../token-store";
import type {
  PublishPlatformResult,
  PublishToConnectedAccountsInput,
  StoredSocialAccount,
} from "../types";

type MetaTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: { message?: string };
};

type MetaPage = {
  id: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: { id: string };
};

type MetaAccountsResponse = {
  data?: MetaPage[];
  error?: { message?: string };
};

type MetaUser = {
  id?: string;
  name?: string;
  error?: { message?: string };
};

type IgUser = {
  id?: string;
  username?: string;
  name?: string;
};

type GraphCreateResponse = {
  id?: string;
  post_id?: string;
  error?: { message?: string };
};

type IgContainerStatus = {
  status_code?: string;
  status?: string;
  error?: { message?: string };
};

function graphUrl(version: string, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `https://graph.facebook.com/${version}${clean}`;
}

function expiresAtFromSeconds(seconds?: number): string | undefined {
  if (!seconds || !Number.isFinite(seconds)) return undefined;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export async function buildMetaAuthorizeUrl(req: Request, state: string): Promise<string> {
  const env = await getMetaSocialEnv();
  if (!isMetaConfigured(env)) {
    throw new SocialHttpError("مفاتيح ميتا غير مهيأة (META_APP_ID / META_APP_SECRET)", 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const redirectUri = oauthRedirectUri(origin, "meta");
  const params = new URLSearchParams({
    client_id: env.appId,
    redirect_uri: redirectUri,
    state,
    response_type: "code",
    scope: META_SCOPES.join(","),
  });
  return `https://www.facebook.com/${env.graphVersion}/dialog/oauth?${params.toString()}`;
}

async function exchangeCode(code: string, redirectUri: string): Promise<MetaTokenResponse> {
  const env = await getMetaSocialEnv();
  return fetchFormJson<MetaTokenResponse>(
    graphUrl(env.graphVersion, "/oauth/access_token"),
    {
      client_id: env.appId,
      client_secret: env.appSecret,
      redirect_uri: redirectUri,
      code,
    },
    { method: "GET" }
  );
}

async function exchangeLongLived(shortToken: string): Promise<MetaTokenResponse> {
  const env = await getMetaSocialEnv();
  return fetchFormJson<MetaTokenResponse>(
    graphUrl(env.graphVersion, "/oauth/access_token"),
    {
      grant_type: "fb_exchange_token",
      client_id: env.appId,
      client_secret: env.appSecret,
      fb_exchange_token: shortToken,
    },
    { method: "GET" }
  );
}

export async function completeMetaOAuth(
  req: Request,
  code: string
): Promise<{ facebook: number; instagram: number }> {
  const env = await getMetaSocialEnv();
  const origin = await resolveSocialOrigin(req);
  const redirectUri = oauthRedirectUri(origin, "meta");
  const shortLived = await exchangeCode(code, redirectUri);
  if (!shortLived.access_token) {
    throw new SocialHttpError(
      shortLived.error?.message || "فشل تبادل رمز ميتا",
      400,
      false,
      shortLived
    );
  }

  let userToken = shortLived.access_token;
  let expiresAt = expiresAtFromSeconds(shortLived.expires_in);
  try {
    const longLived = await exchangeLongLived(shortLived.access_token);
    if (longLived.access_token) {
      userToken = longLived.access_token;
      expiresAt = expiresAtFromSeconds(longLived.expires_in);
    }
  } catch {
    /* keep short-lived */
  }

  const me = await fetchJsonWithRetry<MetaUser>(
    `${graphUrl(env.graphVersion, "/me")}?fields=id,name&access_token=${encodeURIComponent(userToken)}`
  );
  const pages = await fetchJsonWithRetry<MetaAccountsResponse>(
    `${graphUrl(env.graphVersion, "/me/accounts")}?fields=id,name,access_token,instagram_business_account&access_token=${encodeURIComponent(userToken)}`
  );
  const list = pages.data || [];
  if (list.length === 0) {
    throw new SocialHttpError(
      "لا توجد صفحات فيسبوك مرتبطة بهذا الحساب. اربط صفحة ثم أعد التحقق.",
      400,
      false
    );
  }

  let facebook = 0;
  let instagram = 0;
  for (const page of list) {
    if (!page.id || !page.access_token) continue;
    const igId = page.instagram_business_account?.id;
    await upsertStoredAccount({
      platform: "facebook",
      displayName: page.name || me.name || "Facebook Page",
      username: page.name,
      externalId: page.id,
      scopes: [...META_SCOPES],
      accessToken: userToken,
      pageAccessToken: page.access_token,
      pageId: page.id,
      instagramUserId: igId,
      tokenExpiresAt: expiresAt,
      status: "connected",
      lastError: undefined,
    });
    facebook += 1;

    if (!igId) continue;
    let igName = "Instagram";
    let igUsername: string | undefined;
    try {
      const ig = await fetchJsonWithRetry<IgUser>(
        `${graphUrl(env.graphVersion, `/${igId}`)}?fields=id,username,name&access_token=${encodeURIComponent(page.access_token)}`
      );
      igName = ig.name || ig.username || igName;
      igUsername = ig.username;
    } catch {
      /* keep defaults */
    }
    await upsertStoredAccount({
      platform: "instagram",
      displayName: igName,
      username: igUsername,
      externalId: igId,
      scopes: [...META_SCOPES],
      accessToken: userToken,
      pageAccessToken: page.access_token,
      pageId: page.id,
      instagramUserId: igId,
      tokenExpiresAt: expiresAt,
      status: "connected",
      lastError: undefined,
    });
    instagram += 1;
  }

  return { facebook, instagram };
}

export async function refreshMetaAccount(
  account: StoredSocialAccount
): Promise<StoredSocialAccount> {
  const env = await getMetaSocialEnv();
  if (!isMetaConfigured(env) || !account.accessToken) {
    await patchStoredAccount(account.id, {
      status: "needs_reauth",
      lastError: "مفاتيح ميتا أو رمز المستخدم مفقودة",
    });
    throw new SocialHttpError("يحتاج إعادة تحقق لميتا", 401, false);
  }
  try {
    const longLived = await exchangeLongLived(account.accessToken);
    if (!longLived.access_token) {
      throw new SocialHttpError("تعذر تجديد رمز ميتا", 401, false, longLived);
    }
    const pages = await fetchJsonWithRetry<MetaAccountsResponse>(
      `${graphUrl(env.graphVersion, "/me/accounts")}?fields=id,name,access_token,instagram_business_account&access_token=${encodeURIComponent(longLived.access_token)}`
    );
    const page = (pages.data || []).find(
      (row) => row.id === (account.pageId || account.externalId)
    );
    const patch: Partial<UpsertAccountInput> = {
      accessToken: longLived.access_token,
      tokenExpiresAt: expiresAtFromSeconds(longLived.expires_in),
      lastRefreshedAt: new Date().toISOString(),
      status: "connected",
      lastError: undefined,
    };
    if (page?.access_token) patch.pageAccessToken = page.access_token;
    const next = await patchStoredAccount(account.id, patch);
    return next || { ...account, ...patch };
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل تجديد رمز ميتا";
    await patchStoredAccount(account.id, {
      status: "needs_reauth",
      lastError: message,
    });
    throw err;
  }
}

async function ensureFreshMeta(
  account: StoredSocialAccount
): Promise<StoredSocialAccount> {
  if (account.status === "needs_reauth") {
    throw new SocialHttpError("الحساب يحتاج إعادة تحقق", 401, false);
  }
  if (isTokenExpired(account) && account.accessToken) {
    return refreshMetaAccount(account);
  }
  return account;
}

function permalinkFacebook(pageId: string, postId: string): string {
  const id = postId.includes("_") ? postId : `${pageId}_${postId}`;
  return `https://www.facebook.com/${id}`;
}

async function waitForIgContainer(
  version: string,
  containerId: string,
  token: string
): Promise<void> {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const status = await fetchJsonWithRetry<IgContainerStatus>(
      `${graphUrl(version, `/${containerId}`)}?fields=status_code,status&access_token=${encodeURIComponent(token)}`
    );
    const code = (status.status_code || "").toUpperCase();
    if (code === "FINISHED" || code === "PUBLISHED") return;
    if (code === "ERROR" || code === "EXPIRED") {
      throw new SocialHttpError(
        status.error?.message || "فشل تجهيز وسائط إنستغرام",
        400,
        false,
        status
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  throw new SocialHttpError("انتهت مهلة تجهيز وسائط إنستغرام", 408, true);
}

async function publishFacebookPage(
  account: StoredSocialAccount,
  input: PublishToConnectedAccountsInput
): Promise<PublishPlatformResult> {
  const env = await getMetaSocialEnv();
  const fresh = await ensureFreshMeta(account);
  const token = fresh.pageAccessToken || fresh.accessToken;
  const pageId = fresh.pageId || fresh.externalId;
  if (!token || !pageId) {
    return {
      ok: false,
      platform: "facebook",
      error: {
        code: "not_connected",
        message: "لا يوجد رمز صفحة فيسبوك",
      },
    };
  }

  const { images, videos } = splitMedia(input.mediaUrls);
  const caption = input.caption.trim();

  if (videos.length > 0) {
    const created = await fetchFormJson<GraphCreateResponse>(
      graphUrl(env.graphVersion, `/${pageId}/videos`),
      {
        file_url: videos[0],
        description: caption,
        title: (input.title || caption).slice(0, 120),
        access_token: token,
      }
    );
    if (!created.id) {
      throw new SocialHttpError(
        created.error?.message || "فشل نشر فيديو فيسبوك",
        400,
        false,
        created
      );
    }
    return {
      ok: true,
      platform: "facebook",
      postId: created.id,
      permalink: permalinkFacebook(pageId, created.id),
    };
  }

  if (images.length === 1) {
    const created = await fetchFormJson<GraphCreateResponse>(
      graphUrl(env.graphVersion, `/${pageId}/photos`),
      {
        url: images[0],
        caption,
        access_token: token,
      }
    );
    const postId = created.post_id || created.id;
    if (!postId) {
      throw new SocialHttpError(
        created.error?.message || "فشل نشر صورة فيسبوك",
        400,
        false,
        created
      );
    }
    return {
      ok: true,
      platform: "facebook",
      postId,
      permalink: permalinkFacebook(pageId, postId),
    };
  }

  if (images.length > 1) {
    const unpublished: string[] = [];
    for (const url of images.slice(0, 10)) {
      const photo = await fetchFormJson<GraphCreateResponse>(
        graphUrl(env.graphVersion, `/${pageId}/photos`),
        {
          url,
          published: "false",
          access_token: token,
        }
      );
      if (photo.id) unpublished.push(photo.id);
    }
    const fields: Record<string, string> = {
      message: caption,
      access_token: token,
    };
    unpublished.forEach((id, index) => {
      fields[`attached_media[${index}]`] = JSON.stringify({ media_fbid: id });
    });
    const created = await fetchFormJson<GraphCreateResponse>(
      graphUrl(env.graphVersion, `/${pageId}/feed`),
      fields
    );
    if (!created.id) {
      throw new SocialHttpError(
        created.error?.message || "فشل نشر ألبوم فيسبوك",
        400,
        false,
        created
      );
    }
    return {
      ok: true,
      platform: "facebook",
      postId: created.id,
      permalink: permalinkFacebook(pageId, created.id),
    };
  }

  const created = await fetchFormJson<GraphCreateResponse>(
    graphUrl(env.graphVersion, `/${pageId}/feed`),
    {
      message: caption,
      access_token: token,
    }
  );
  if (!created.id) {
    throw new SocialHttpError(
      created.error?.message || "فشل نشر منشور فيسبوك",
      400,
      false,
      created
    );
  }
  return {
    ok: true,
    platform: "facebook",
    postId: created.id,
    permalink: permalinkFacebook(pageId, created.id),
  };
}

async function createIgContainer(
  version: string,
  igUserId: string,
  token: string,
  fields: Record<string, string>
): Promise<string> {
  const created = await fetchFormJson<GraphCreateResponse>(
    graphUrl(version, `/${igUserId}/media`),
    { ...fields, access_token: token }
  );
  if (!created.id) {
    throw new SocialHttpError(
      created.error?.message || "فشل إنشاء حاوية إنستغرام",
      400,
      false,
      created
    );
  }
  return created.id;
}

async function publishInstagramAccount(
  account: StoredSocialAccount,
  input: PublishToConnectedAccountsInput
): Promise<PublishPlatformResult> {
  const env = await getMetaSocialEnv();
  const fresh = await ensureFreshMeta(account);
  const token = fresh.pageAccessToken || fresh.accessToken;
  const igUserId = fresh.instagramUserId || fresh.externalId;
  if (!token || !igUserId) {
    return {
      ok: false,
      platform: "instagram",
      error: {
        code: "not_connected",
        message: "لا يوجد حساب إنستغرام أعمال مرتبط",
      },
    };
  }

  const { images, videos } = splitMedia(input.mediaUrls);
  const caption = input.caption.trim();

  let containerId: string;
  if (videos.length > 0) {
    containerId = await createIgContainer(env.graphVersion, igUserId, token, {
      media_type: "REELS",
      video_url: videos[0],
      caption,
      share_to_feed: "true",
    });
  } else if (images.length > 1) {
    const children: string[] = [];
    for (const url of images.slice(0, 10)) {
      const child = await createIgContainer(env.graphVersion, igUserId, token, {
        image_url: url,
        is_carousel_item: "true",
      });
      children.push(child);
    }
    containerId = await createIgContainer(env.graphVersion, igUserId, token, {
      media_type: "CAROUSEL",
      children: children.join(","),
      caption,
    });
  } else if (images.length === 1) {
    containerId = await createIgContainer(env.graphVersion, igUserId, token, {
      image_url: images[0],
      caption,
    });
  } else {
    return {
      ok: false,
      platform: "instagram",
      error: {
        code: "unsupported_media",
        message: "إنستغرام يحتاج صورة أو فيديو عاماً (image_url / video_url)",
      },
    };
  }

  await waitForIgContainer(env.graphVersion, containerId, token);
  const published = await fetchFormJson<GraphCreateResponse>(
    graphUrl(env.graphVersion, `/${igUserId}/media_publish`),
    {
      creation_id: containerId,
      access_token: token,
    }
  );
  if (!published.id) {
    throw new SocialHttpError(
      published.error?.message || "فشل نشر إنستغرام",
      400,
      false,
      published
    );
  }
  return {
    ok: true,
    platform: "instagram",
    postId: published.id,
    permalink: `https://www.instagram.com/${fresh.username || "p"}/`,
  };
}

export async function publishFacebook(
  account: StoredSocialAccount,
  input: PublishToConnectedAccountsInput
): Promise<PublishPlatformResult> {
  return publishFacebookPage(account, input);
}

export async function publishInstagram(
  account: StoredSocialAccount,
  input: PublishToConnectedAccountsInput
): Promise<PublishPlatformResult> {
  return publishInstagramAccount(account, input);
}
