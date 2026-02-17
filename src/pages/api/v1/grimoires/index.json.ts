import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const grimoires = await getCollection("grimoires");

  return new Response(
    JSON.stringify({
      grimoires: grimoires.map((g) => ({
        name: g.data.name,
        owner: g.data.owner,
        repo: g.data.repo,
        description: g.data.description,
        topicCount: g.data.topicCount,
      })),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
};
