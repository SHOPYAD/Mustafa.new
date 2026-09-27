---
name: advanced-ui-theming
description: Advanced UI Theming and Component Architecture Principles (Shadcn/Vercel standard) for highly professional Next.js dashboards.
---

# Advanced UI Theming & Component Architecture (2026 Standards)

**CRITICAL RULE:** You MUST adhere to these rules when building or refactoring UI components for dashboards. Failure to do so will result in an amateur-looking system.

## 1. Centralized Theming (Shadcn UI Standard)
- Never use hardcoded absolute Tailwind color classes (e.g., `bg-slate-900`, `text-gray-500`, `border-white/10`).
- Always use semantic tokens mapped globally in `globals.css`:
  - **Backgrounds:** `bg-background`, `bg-card`, `bg-popover`
  - **Text:** `text-foreground`, `text-muted-foreground`, `text-primary-foreground`
  - **Accents:** `bg-primary`, `bg-secondary`, `bg-accent`, `bg-destructive`
  - **Layout:** `border-border`, `border-input`, `ring-ring`
  - **Shapes:** `rounded-lg`, `rounded-md`, `rounded-sm` (controlled by the global `--radius` variable)

## 2. Component Ownership & Abstraction
- Treat `shadcn/ui` and `21st.dev` components as part of the source code, not black-box dependencies.
- Organize components strictly to maintain a highly scalable architecture:
  - `components/ui/` for raw base primitives (Buttons, Inputs, Dialogs).
  - `components/blocks/` or feature-specific folders for product abstractions that wrap UI primitives.

## 3. Data-Heavy UI Guidelines
- **Progressive Disclosure:** Follow "essentials first, details on demand". Use side-panels or drill-down views instead of overwhelming the screen.
- **State Design:** Always design visually pleasing states for Empty, Loading, and Error. A dashboard with no data is the most common state for new users—make it helpful.

## 4. Visual Hierarchy & Microinteractions
- Rely on structural layout, padding (8-point grid), and typography (opacity/weight) to establish hierarchy rather than excessive colors.
- Add microinteractions (e.g., subtle hover background shifts, scale-down on active) to provide instant feedback loops to user actions.
