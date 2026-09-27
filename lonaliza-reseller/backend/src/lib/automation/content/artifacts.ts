import { promises as fs } from "fs";
import path from "path";
import type { DiscoveredTopic, GeneratedArticle } from "@/lib/automation/types";

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function rootDir(): string {
  if (isServerlessHosting()) return path.join("/tmp", "alrayyan-automation");
  return path.join(process.cwd(), ".data", "automation");
}

export async function writeDryRunArtifacts(input: {
  jobId: string;
  topics: DiscoveredTopic[];
  article: GeneratedArticle;
}): Promise<{ dir: string; topicsPath: string; articlePath: string }> {
  const dir = path.join(rootDir(), "dry-runs", input.jobId);
  await fs.mkdir(dir, { recursive: true });
  const topicsPath = path.join(dir, "topics.json");
  const articlePath = path.join(dir, "article.json");
  await fs.writeFile(
    topicsPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: input.topics.length,
        topics: input.topics,
      },
      null,
      2
    ),
    "utf8"
  );
  await fs.writeFile(
    articlePath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        wordCountAr: input.article.wordCountAr,
        article: input.article,
      },
      null,
      2
    ),
    "utf8"
  );
  return { dir, topicsPath, articlePath };
}

export async function writeJobTopics(input: {
  jobId: string;
  topics: DiscoveredTopic[];
}): Promise<string> {
  const dir = path.join(rootDir(), "runs", input.jobId);
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, "topics.json");
  await fs.writeFile(
    file,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: input.topics.length,
        topics: input.topics,
      },
      null,
      2
    ),
    "utf8"
  );
  return file;
}
