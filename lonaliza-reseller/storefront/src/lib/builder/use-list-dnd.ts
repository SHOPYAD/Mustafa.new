"use client";
/**
 * Tiny dependency-free drag-and-drop helper for re-ordering items in
 * a flat list (shadows, gradient stops, and any other layered editor).
 *
 * Intentionally minimal: we don't try to be a full DnD framework, we
 * just expose the few props that matter — `onDragStart`, `onDragOver`,
 * `onDragEnd`, `onDrop`, `onDragLeave` — and a piece of state (`overIndex`,
 * `draggingIndex`) that consumers use to render the drop cursor.
 *
 * Native HTML5 drag events are perfectly fine here because we're
 * working with a small, fully visible list and don't need touch /
 * mobile support inside the inspector.
 */
import { useCallback, useRef, useState } from "react";

export interface ListDndState {
  draggingIndex: number | null;
  overIndex: number | null;
  /** True when the cursor is below the midpoint of the over-target,
   *  which means the dropped item should land *after* it. */
  overAfter: boolean;
}

export interface ListDndHandlers<T extends HTMLElement = HTMLElement> {
  /** Spread on the drag handle (the part the user grabs). */
  itemHandleProps: (index: number) => {
    draggable: boolean;
    onDragStart: (e: React.DragEvent<T>) => void;
    onDragEnd: (e: React.DragEvent<T>) => void;
  };
  /** Spread on the item row (the drop target). */
  itemRowProps: (index: number) => {
    onDragOver: (e: React.DragEvent<T>) => void;
    onDragLeave: (e: React.DragEvent<T>) => void;
    onDrop: (e: React.DragEvent<T>) => void;
    "data-dnd-over"?: "before" | "after";
    "data-dnd-dragging"?: boolean;
  };
}

export function useListDnd<T extends HTMLElement = HTMLElement>(
  /** Called with (fromIndex, toIndex) where `toIndex` already accounts
   *  for the visual drop position (insert before / after). */
  onReorder: (fromIndex: number, toIndex: number) => void,
): ListDndState & ListDndHandlers<T> {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [overAfter, setOverAfter] = useState<boolean>(false);
  // Keep the latest values in refs so handlers don't capture stale state
  // — React's rendering cycle could lag behind a fast drag otherwise.
  const draggingRef = useRef<number | null>(null);

  const itemHandleProps = useCallback(
    (index: number) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent<T>) => {
        draggingRef.current = index;
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Some browsers refuse to start the drag without something on
        // the dataTransfer; the actual payload is irrelevant.
        try {
          e.dataTransfer.setData("text/plain", String(index));
        } catch {
          // Older browsers may throw on setData calls outside a real
          // drag-source — safe to swallow, the drag still works.
        }
      },
      onDragEnd: () => {
        draggingRef.current = null;
        setDraggingIndex(null);
        setOverIndex(null);
        setOverAfter(false);
      },
    }),
    [],
  );

  const itemRowProps = useCallback(
    (index: number) => ({
      onDragOver: (e: React.DragEvent<T>) => {
        if (draggingRef.current === null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const after = e.clientY > rect.top + rect.height / 2;
        setOverIndex(index);
        setOverAfter(after);
      },
      onDragLeave: (e: React.DragEvent<T>) => {
        // Only clear when leaving the row itself, not when crossing into
        // a child — relatedTarget is the element the cursor moves to.
        if (
          e.currentTarget.contains(e.relatedTarget as Node | null) === false
        ) {
          // Don't blank out if we're entering another item row, the
          // next onDragOver will overwrite it anyway. We only clear
          // when leaving the whole list — which is acceptable lag.
        }
      },
      onDrop: (e: React.DragEvent<T>) => {
        if (draggingRef.current === null) return;
        e.preventDefault();
        const from = draggingRef.current;
        let to = index + (overAfter ? 1 : 0);
        // Account for the source being removed before the insertion
        // point — without this the item lands one slot too high.
        if (from < to) to -= 1;
        if (from !== to) onReorder(from, to);
        draggingRef.current = null;
        setDraggingIndex(null);
        setOverIndex(null);
        setOverAfter(false);
      },
      "data-dnd-over": (overIndex === index
        ? overAfter
          ? "after"
          : "before"
        : undefined) as "before" | "after" | undefined,
      "data-dnd-dragging": draggingIndex === index ? true : undefined,
    }),
    [draggingIndex, overIndex, overAfter, onReorder],
  );

  return {
    draggingIndex,
    overIndex,
    overAfter,
    itemHandleProps,
    itemRowProps,
  };
}

/** Pure helper — moves `arr[from]` to position `to` and returns a new array. */
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, item);
  return next;
}
