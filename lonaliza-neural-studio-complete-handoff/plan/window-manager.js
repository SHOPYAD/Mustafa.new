/**
 * Lonaliza Cybernetic Studio Window Manager
 * Handles Dragging, Resizing, Pinning, Minimizing, Restoring, Maximizing, and Keyboard A11y.
 */
export class CyberWindowManager {
  constructor(storageKey = "lonaliza.workspace.v1") {
    this.storageKey = storageKey;
    this.state = this.loadState();
    this.activeDrag = null;
    this.activeResize = null;
    this.highestZ = 20;
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Storage not available", e);
    }
    return { positions: {}, minimized: {}, closed: {}, pinned: {} };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Save failed", e);
    }
  }

  bringToFront(panelEl) {
    this.highestZ += 1;
    panelEl.style.zIndex = this.highestZ;
  }

  startDrag(panelEl, startX, startY) {
    if (panelEl.classList.contains("pinned") || panelEl.classList.contains("maximized")) return;
    const rect = panelEl.getBoundingClientRect();
    this.activeDrag = {
      el: panelEl,
      offsetX: startX - rect.left,
      offsetY: startY - rect.top,
      initX: rect.left,
      initY: rect.top
    };
    this.bringToFront(panelEl);
  }

  onDrag(currX, currY) {
    if (!this.activeDrag) return;
    const { el, offsetX, offsetY } = this.activeDrag;
    const parentRect = el.parentElement?.getBoundingClientRect() || { width: 1672, height: 941, left: 0, top: 0 };
    let newX = currX - offsetX - parentRect.left;
    let newY = currY - offsetY - parentRect.top;

    // Constraint within stage
    newX = Math.max(10, Math.min(parentRect.width - el.offsetWidth - 10, newX));
    newY = Math.max(10, Math.min(parentRect.height - el.offsetHeight - 10, newY));

    el.style.left = `${newX}px`;
    el.style.top = `${newY}px`;
    el.style.bottom = "auto";
    el.style.right = "auto";
  }

  endDrag() {
    if (!this.activeDrag) return;
    const id = this.activeDrag.el.id || this.activeDrag.el.dataset.panel;
    if (id) {
      this.state.positions[id] = {
        left: this.activeDrag.el.style.left,
        top: this.activeDrag.el.style.top
      };
      this.saveState();
    }
    this.activeDrag = null;
  }

  togglePin(panelEl) {
    const isPinned = panelEl.classList.toggle("pinned");
    const id = panelEl.id;
    if (id) {
      this.state.pinned[id] = isPinned;
      this.saveState();
    }
  }

  minimize(panelEl, dockEl) {
    panelEl.classList.add("minimized");
    const id = panelEl.id;
    const title = panelEl.querySelector(".panelHead b")?.textContent || id;
    if (dockEl) {
      const chip = document.createElement("button");
      chip.dataset.restore = id;
      chip.className = "dockChip";
      chip.innerHTML = `<span>⇱</span> ${title}`;
      chip.onclick = () => this.restore(panelEl, chip);
      dockEl.appendChild(chip);
    }
    if (id) {
      this.state.minimized[id] = true;
      this.saveState();
    }
  }

  restore(panelEl, chipEl) {
    panelEl.classList.remove("minimized");
    chipEl?.remove();
    this.bringToFront(panelEl);
    const id = panelEl.id;
    if (id) {
      this.state.minimized[id] = false;
      this.saveState();
    }
  }

  toggleMaximize(panelEl) {
    panelEl.classList.toggle("maximized");
    this.bringToFront(panelEl);
  }

  close(panelEl) {
    panelEl.classList.add("closed");
    const id = panelEl.id;
    if (id) {
      this.state.closed[id] = true;
      this.saveState();
    }
  }

  restoreAll(panels, dockEl) {
    panels.forEach(p => {
      p.classList.remove("closed", "minimized", "maximized");
      p.style.display = "";
    });
    if (dockEl) dockEl.innerHTML = "";
    this.state.closed = {};
    this.state.minimized = {};
    this.saveState();
  }
}
