import { describe, expect, it } from "vitest";
import {
  isEditorChromeTarget,
  isSectionToolbarAction,
  readSectionToolbarAction,
} from "./section-toolbar";

type FakeEl = {
  closest: (sel: string) => FakeEl | null;
  getAttribute: (name: string) => string | null;
};

function fakeButton(action: string, instanceId: string): { icon: FakeEl; root: FakeEl } {
  const root: FakeEl = {
    closest: (sel) => {
      if (sel.includes("data-section-toolbar") || sel.includes("data-builder-chrome") || sel.includes(".sw-toolbar")) {
        return root;
      }
      return null;
    },
    getAttribute: () => null,
  };
  const btn: FakeEl = {
    closest: (sel) => {
      if (sel.includes("data-section-action")) return btn;
      if (sel.includes("data-section-id") || sel.includes("data-instance-id")) return root;
      if (sel.includes("data-section-toolbar") || sel.includes("data-builder-chrome")) return root;
      return null;
    },
    getAttribute: (name) => {
      if (name === "data-section-action") return action;
      if (name === "data-instance-id") return instanceId;
      if (name === "data-section-id") return instanceId;
      return null;
    },
  };
  const icon: FakeEl = {
    closest: (sel) => btn.closest(sel),
    getAttribute: () => null,
  };
  return { icon, root };
}

describe("section toolbar chrome helpers", () => {
  it("recognizes toolbar actions", () => {
    expect(isSectionToolbarAction("delete")).toBe(true);
    expect(isSectionToolbarAction("duplicate")).toBe(true);
    expect(isSectionToolbarAction("settings")).toBe(true);
    expect(isSectionToolbarAction("explode")).toBe(false);
  });

  it("treats toolbar markup as editor chrome", () => {
    const { icon } = fakeButton("delete", "hero-1");
    expect(isEditorChromeTarget(icon as unknown as EventTarget)).toBe(true);
    expect(isEditorChromeTarget({} as EventTarget)).toBe(false);
  });

  it("reads action + instance id from nested icon clicks", () => {
    const { icon } = fakeButton("duplicate", "hero-1");
    expect(readSectionToolbarAction(icon as unknown as EventTarget)).toEqual({
      action: "duplicate",
      instanceId: "hero-1",
    });
  });

  it("ignores unmarked buttons", () => {
    const plain: FakeEl = {
      closest: () => null,
      getAttribute: () => null,
    };
    expect(readSectionToolbarAction(plain as unknown as EventTarget)).toBeNull();
  });
});
