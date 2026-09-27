import { describe, expect, it } from "vitest";
import {
  activeTabIndex,
  isHomeRoot,
  isMenuPath,
  roleForTabPath,
  roleForUrl,
} from "./bottom-nav-active";

const TABS = ["/", "/account?tab=wallet", "/community", "/account", "/menu"];

describe("bottom-nav active state", () => {
  it("highlights home only on the site root", () => {
    expect(isHomeRoot("https://lonaliza.com/")).toBe(true);
    expect(isHomeRoot("https://lonaliza.com/?app=1")).toBe(true);
    expect(isHomeRoot("/?app=1&locale=ar")).toBe(true);
    expect(isHomeRoot("https://lonaliza.com/flights?app=1")).toBe(false);
    expect(isHomeRoot("/hotels/")).toBe(false);
    expect(roleForUrl("/")).toBe("home");
    expect(roleForUrl("/?app=1")).toBe("home");
    expect(activeTabIndex("https://lonaliza.com/?app=1", TABS)).toBe(0);
  });

  it("does not keep home active on deep service or checkout routes", () => {
    expect(roleForUrl("/flights")).toBe("more");
    expect(roleForUrl("/flights/search?from=IST")).toBe("more");
    expect(roleForUrl("/flights/booking?id=abc")).toBe("more");
    expect(roleForUrl("/hotels/book?app=1")).toBe("more");
    expect(roleForUrl("/hotels/slug-hotel")).toBe("more");
    expect(roleForUrl("/cars")).toBe("more");
    expect(roleForUrl("/transfers/vip")).toBe("more");
    expect(roleForUrl("/holidays/istanbul")).toBe("more");
    expect(roleForUrl("/visa?type=schengen")).toBe("more");
    expect(roleForUrl("/search")).toBe("more");
    expect(activeTabIndex("https://lonaliza.com/flights?app=1", TABS)).toBe(4);
    expect(activeTabIndex("https://lonaliza.com/flights?app=1", TABS)).not.toBe(0);
  });

  it("maps wallet, community, and account including subpages", () => {
    expect(roleForUrl("/account?tab=wallet&app=1")).toBe("wallet");
    expect(roleForUrl("/wallet")).toBe("wallet");
    expect(roleForUrl("/community")).toBe("community");
    expect(roleForUrl("/community/reels")).toBe("community");
    expect(roleForUrl("/community/compose")).toBe("community");
    expect(roleForUrl("/account")).toBe("account");
    expect(roleForUrl("/account/bookings/xyz")).toBe("account");
    expect(roleForUrl("/account/chat/1")).toBe("account");
    expect(roleForUrl("/account/messages/2")).toBe("account");
    expect(activeTabIndex("/account?tab=wallet", TABS)).toBe(1);
    expect(activeTabIndex("/community/reels?app=1", TABS)).toBe(2);
    expect(activeTabIndex("/account/companions/u1", TABS)).toBe(3);
  });

  it("highlights more for the menu, legal, and help routes", () => {
    expect(isMenuPath("/menu?app=1")).toBe(true);
    expect(roleForUrl("/menu")).toBe("more");
    expect(roleForUrl("/terms")).toBe("more");
    expect(roleForUrl("/privacy")).toBe("more");
    expect(roleForUrl("/gdpr")).toBe("more");
    expect(roleForUrl("/ai-chat")).toBe("more");
    expect(activeTabIndex("/menu?app=1", TABS)).toBe(4);
  });

  it("leaves no root tab on unmatched deep routes", () => {
    expect(roleForUrl("/r/ABC")).toBe("none");
    expect(activeTabIndex("https://lonaliza.com/unknown-surface", TABS)).toBe(-1);
  });

  it("classifies tab config paths independently of live deep URLs", () => {
    expect(roleForTabPath("/")).toBe("home");
    expect(roleForTabPath("/account?tab=wallet")).toBe("wallet");
    expect(roleForTabPath("/community")).toBe("community");
    expect(roleForTabPath("/account")).toBe("account");
    expect(roleForTabPath("/menu")).toBe("more");
  });
});
