# Strict Package Manager Rule: ALWAYS USE PNPM

CRITICAL SYSTEM INSTRUCTION:
- ALWAYS use `pnpm` for all builds, installations, dependencies, scripts, and commands in this repository.
- NEVER use `npm`, `npx`, or `yarn`.
- When running Next.js builds: use `pnpm build` or `pnpm exec next build`.
- When running scripts: use `pnpm run <script>` or `pnpm <script>`.
- When installing packages: use `pnpm add` or `pnpm install`.
- `pnpm` is installed globally at `/root/.nvm/versions/node/v20.20.2/bin/pnpm` (version 10.x).
