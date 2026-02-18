import { defineCollection, z } from "astro:content";
import { grimoireLoader, topicLoader } from "./loaders/registry-loader";

const grimoires = defineCollection({
  loader: grimoireLoader(),
  schema: z.object({
    grimoireName: z.string(),
    description: z.string(),
    github: z.string().optional(),
    path: z.string().optional(),
    sourceType: z.string().optional(),
    topicCount: z.number(),
  }),
});

const topics = defineCollection({
  loader: topicLoader(),
  schema: z.object({
    grimoireName: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    order: z.number(),
    category: z.string(),
    tags: z.array(z.string()),
    relatedFiles: z.array(z.string()),
    content: z.string(),
    filename: z.string(),
  }),
});

export const collections = { grimoires, topics };
