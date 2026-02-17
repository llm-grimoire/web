import type { Loader } from "astro/loaders";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** Parse frontmatter, falling back to line-by-line extraction on YAML errors */
function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  try {
    return matter(raw);
  } catch {
    // Fallback: extract frontmatter manually for files with unquoted colons
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { data: {}, content: raw };

    const data: Record<string, unknown> = {};
    for (const line of match[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let val: unknown = line.slice(idx + 1).trim();
      // Parse arrays like [a, b, c]
      if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
        val = val.slice(1, -1).split(",").map((s) => s.trim());
      }
      // Parse numbers
      if (typeof val === "string" && /^\d+$/.test(val)) {
        val = parseInt(val, 10);
      }
      data[key] = val;
    }
    return { data, content: match[2] };
  }
}

const REGISTRY_DIR = path.resolve("registry/packages");

interface GrimoireEntry {
  owner: string;
  repo: string;
  name: string;
  description: string;
  version: string;
  github?: string;
  path?: string;
  sourceType?: string;
  topicCount: number;
}

interface TopicEntry {
  owner: string;
  repo: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  category: string;
  tags: string[];
  relatedFiles: string[];
  content: string;
  filename: string;
}

function walkRegistry(): { grimoires: GrimoireEntry[]; topics: TopicEntry[] } {
  const grimoires: GrimoireEntry[] = [];
  const topics: TopicEntry[] = [];

  if (!fs.existsSync(REGISTRY_DIR)) {
    return { grimoires, topics };
  }

  for (const owner of fs.readdirSync(REGISTRY_DIR)) {
    const ownerDir = path.join(REGISTRY_DIR, owner);
    if (!fs.statSync(ownerDir).isDirectory() || owner.startsWith(".")) continue;

    for (const repo of fs.readdirSync(ownerDir)) {
      const repoDir = path.join(ownerDir, repo);
      if (!fs.statSync(repoDir).isDirectory() || repo.startsWith(".")) continue;

      const configPath = path.join(repoDir, "grimoire.json");
      if (!fs.existsSync(configPath)) continue;

      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      const topicsDir = path.join(repoDir, config.topicsDir || "topics");

      let topicCount = 0;
      if (fs.existsSync(topicsDir)) {
        const mdFiles = fs.readdirSync(topicsDir).filter((f) => f.endsWith(".md"));
        topicCount = mdFiles.length;

        for (const file of mdFiles) {
          const raw = fs.readFileSync(path.join(topicsDir, file), "utf-8");
          const { data, content } = parseFrontmatter(raw);

          topics.push({
            owner,
            repo,
            title: data.title || file.replace(/\.md$/, ""),
            slug: data.slug || file.replace(/^\d+-/, "").replace(/\.md$/, ""),
            description: data.description || "",
            order: data.order ?? 99,
            category: data.category || "general",
            tags: data.tags || [],
            relatedFiles: data.relatedFiles || [],
            content,
            filename: file,
          });
        }
      }

      grimoires.push({
        owner,
        repo,
        name: config.name || repo,
        description: config.description || "",
        version: config.version || "0.1.0",
        github: config.github,
        path: config.path,
        sourceType: config.sourceType,
        topicCount,
      });
    }
  }

  return { grimoires, topics };
}

export function grimoireLoader(): Loader {
  return {
    name: "grimoire-loader",
    load: async ({ store, logger }) => {
      const { grimoires } = walkRegistry();
      logger.info(`Found ${grimoires.length} grimoire(s)`);
      store.clear();

      for (const g of grimoires) {
        store.set({
          id: `${g.owner}/${g.repo}`,
          data: g,
        });
      }
    },
  };
}

export function topicLoader(): Loader {
  return {
    name: "topic-loader",
    load: async ({ store, logger }) => {
      const { topics } = walkRegistry();
      logger.info(`Found ${topics.length} topic(s)`);
      store.clear();

      for (const t of topics) {
        store.set({
          id: `${t.owner}/${t.repo}/${t.slug}`,
          data: t,
          body: t.content,
        });
      }
    },
  };
}
