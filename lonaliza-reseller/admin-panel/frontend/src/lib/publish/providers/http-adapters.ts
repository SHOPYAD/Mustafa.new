import { mediumHandler, devtoHandler, hashnodeHandler, wordpressHandler, listmonkHandler } from "./blogs";
import { discordHandler, slackHandler, kickHandler, twitchHandler } from "./chat";
import {
  dribbbleHandler,
  wrapcastHandler,
  nostrHandler,
  vkHandler,
  moltbookHandler,
  whopHandler,
  skoolHandler,
  meweHandler,
  tumblrHandler,
} from "./community";
import { mastodonHandler, blueskyHandler, lemmyHandler } from "./fediverse";
import { gmbHandler } from "./gmb";
import { instagramStandaloneHandler } from "./instagram-standalone";
import { linkedinHandler, linkedinPageHandler } from "./linkedin";
import { pinterestHandler } from "./pinterest";
import { redditHandler } from "./reddit";
import { telegramHandler } from "./telegram";
import { threadsHandler } from "./threads";
import { tiktokBusinessHandler } from "./tiktok-business";
import type { ValidatingPublishHandler } from "./http-base";

export { HTTP_ADAPTER_IDS } from "./http-base";

export function httpAdapterHandlers(): ValidatingPublishHandler[] {
  return [
    telegramHandler(),
    linkedinHandler(),
    linkedinPageHandler(),
    threadsHandler(),
    gmbHandler(),
    pinterestHandler(),
    redditHandler(),
    instagramStandaloneHandler(),
    tiktokBusinessHandler(),
    dribbbleHandler(),
    discordHandler(),
    slackHandler(),
    kickHandler(),
    twitchHandler(),
    mastodonHandler(),
    blueskyHandler(),
    lemmyHandler(),
    wrapcastHandler(),
    nostrHandler(),
    vkHandler(),
    mediumHandler(),
    devtoHandler(),
    hashnodeHandler(),
    wordpressHandler(),
    listmonkHandler(),
    moltbookHandler(),
    whopHandler(),
    skoolHandler(),
    meweHandler(),
    tumblrHandler(),
  ];
}
