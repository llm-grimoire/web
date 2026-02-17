import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const grimoires = await getCollection("grimoires");
  return grimoires.map((g) => ({
    params: { owner: g.data.owner, repo: g.data.repo },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const topics = await getCollection("topics");
  const matching = topics
    .filter((t) => t.data.owner === params.owner && t.data.repo === params.repo)
    .sort((a, b) => a.data.order - b.data.order);

  return new Response(
    JSON.stringify({
      topics: matching.map((t) => ({
        slug: t.data.slug,
        title: t.data.title,
        order: t.data.order,
        filename: t.data.filename,
      })),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
};
