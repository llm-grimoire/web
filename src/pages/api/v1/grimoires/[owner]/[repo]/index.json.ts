import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const grimoires = await getCollection("grimoires");
  return grimoires.map((g) => ({
    params: { owner: g.data.owner, repo: g.data.repo },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const grimoires = await getCollection("grimoires");
  const g = grimoires.find(
    (g) => g.data.owner === params.owner && g.data.repo === params.repo,
  );

  if (!g) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return new Response(
    JSON.stringify({
      name: g.data.name,
      owner: g.data.owner,
      repo: g.data.repo,
      description: g.data.description,
      github: g.data.github,
      path: g.data.path,
      sourceType: g.data.sourceType,
      topicCount: g.data.topicCount,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
};
