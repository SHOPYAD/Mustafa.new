import type { BuilderAgentSkill, CopilotScope } from "@/lib/builder-agent/types";

type GithubRepoRef = {
  owner: string;
  repo: string;
  ref: string;
  subpath: string;
};

const TITLE_RE = /^#\s+(.+)$/m;

function newId(): string {
  return `skill_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function parseGithubRepoUrl(raw: string): GithubRepoRef | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();
    if (host !== "github.com" && host !== "www.github.com" && host !== "raw.githubusercontent.com") {
      return null;
    }

    if (host === "raw.githubusercontent.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length < 4) return null;
      const [owner, repo, ref, ...rest] = parts;
      if (!owner || !repo || !ref) return null;
      return { owner, repo, ref, subpath: rest.join("/") };
    }

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1]?.replace(/\.git$/, "");
    if (!owner || !repo) return null;
    let ref = "main";
    let subpath = "";
    if (parts[2] === "tree" || parts[2] === "blob") {
      ref = parts[3] || "main";
      subpath = parts.slice(4).join("/");
    }
    return { owner, repo, ref, subpath };
  } catch {
    return null;
  }
}

function titleFromMarkdown(markdown: string, filePath: string): string {
  const heading = markdown.match(TITLE_RE)?.[1]?.trim();
  if (heading) return heading.slice(0, 120);
  const base = filePath.split("/").filter(Boolean).slice(-2).join("/");
  return base.replace(/\/SKILL\.md$/i, "").replace(/\.md$/i, "") || "Imported skill";
}

function isSkillPath(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  if (!lower.endsWith(".md")) return false;
  if (lower.endsWith("skill.md")) return true;
  if (lower.includes("/skills/") || lower.startsWith("skills/")) return true;
  if (lower.includes("/.cursor/skills/") || lower.includes("/.agents/skills/")) return true;
  return false;
}

async function githubGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "lonaliza-builder-agent",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub ${res.status}: ${url}`);
  }
  return (await res.json()) as T;
}

async function fetchRaw(owner: string, repo: string, ref: string, filePath: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Raw fetch failed (${res.status}) for ${filePath}`);
  return res.text();
}

type GithubContent = {
  type?: string;
  path?: string;
  name?: string;
  download_url?: string;
};

async function listMarkdownFiles(ref: GithubRepoRef): Promise<string[]> {
  const { owner, repo, ref: branch, subpath } = ref;
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  try {
    const tree = await githubGet<{ tree?: Array<{ path?: string; type?: string }> }>(treeUrl);
    const files = (tree.tree || [])
      .filter((item) => item.type === "blob" && item.path && isSkillPath(item.path))
      .map((item) => item.path as string)
      .filter((filePath) => !subpath || filePath === subpath || filePath.startsWith(`${subpath}/`));
    if (files.length) return files.slice(0, 40);
  } catch {
    /* fall through to contents API */
  }

  const contentsUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${subpath || ""}?ref=${encodeURIComponent(branch)}`;
  const contents = await githubGet<GithubContent | GithubContent[]>(contentsUrl);
  const items = Array.isArray(contents) ? contents : [contents];
  const files: string[] = [];
  for (const item of items) {
    if (item.type === "file" && item.path && isSkillPath(item.path)) {
      files.push(item.path);
    }
    if (item.type === "dir" && item.path && /skills/i.test(item.path)) {
      const nested = await githubGet<GithubContent[]>(
        `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}?ref=${encodeURIComponent(branch)}`
      );
      for (const child of nested) {
        if (child.type === "file" && child.path && isSkillPath(child.path)) {
          files.push(child.path);
        }
        if (child.type === "dir" && child.path) {
          const deep = await githubGet<GithubContent[]>(
            `https://api.github.com/repos/${owner}/${repo}/contents/${child.path}?ref=${encodeURIComponent(branch)}`
          );
          for (const leaf of deep) {
            if (leaf.type === "file" && leaf.path && isSkillPath(leaf.path)) {
              files.push(leaf.path);
            }
          }
        }
      }
    }
  }
  return files.slice(0, 40);
}

export async function importSkillsFromGithub(
  repoUrl: string,
  scope: CopilotScope = "editor"
): Promise<BuilderAgentSkill[]> {
  const parsed = parseGithubRepoUrl(repoUrl);
  if (!parsed) {
    throw new Error("Enter a public GitHub repo URL (github.com/owner/repo).");
  }

  const files = await listMarkdownFiles(parsed);
  if (!files.length) {
    throw new Error("No SKILL.md or skills/*.md files found in that public repo.");
  }

  const ts = new Date().toISOString();
  const skills: BuilderAgentSkill[] = [];
  for (const filePath of files) {
    const markdown = (await fetchRaw(parsed.owner, parsed.repo, parsed.ref, filePath)).slice(0, 24_000);
    skills.push({
      id: newId(),
      title: titleFromMarkdown(markdown, filePath),
      markdown,
      enabled: true,
      source: "github",
      scope,
      repoUrl: `https://github.com/${parsed.owner}/${parsed.repo}`,
      filePath,
      createdAt: ts,
      updatedAt: ts,
    });
  }
  return skills;
}
