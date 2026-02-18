import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const grimoires = await getCollection("grimoires");
  const topics = await getCollection("topics");

  const paths: Array<{ params: { name: string; slug: string } }> = [];

  for (const g of grimoires) {
    const grimoireName = g.data.grimoireName;
    for (const t of topics.filter((t) => t.data.grimoireName === grimoireName)) {
      paths.push({
        params: { name: grimoireName, slug: t.data.slug },
      });
    }
  }

  return paths;
}

export const GET: APIRoute = async ({ params }) => {
  const topics = await getCollection("topics");
  const t = topics.find(
    (t) => t.data.grimoireName === params.name && t.data.slug === params.slug,
  );

  if (!t) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return new Response(
    JSON.stringify({
      frontmatter: {
        title: t.data.title,
        slug: t.data.slug,
        description: t.data.description,
        order: t.data.order,
        category: t.data.category,
        tags: t.data.tags,
        relatedFiles: t.data.relatedFiles,
      },
      content: t.data.content,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
};
