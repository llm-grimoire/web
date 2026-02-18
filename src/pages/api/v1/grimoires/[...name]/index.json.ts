import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const grimoires = await getCollection("grimoires");
  return grimoires.map((g) => ({
    params: { name: g.data.grimoireName },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const grimoires = await getCollection("grimoires");
  const g = grimoires.find((g) => g.data.grimoireName === params.name);

  if (!g) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return new Response(
    JSON.stringify({
      name: g.data.grimoireName,
      description: g.data.description,
      github: g.data.github,
      path: g.data.path,
      sourceType: g.data.sourceType,
      topicCount: g.data.topicCount,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
};
