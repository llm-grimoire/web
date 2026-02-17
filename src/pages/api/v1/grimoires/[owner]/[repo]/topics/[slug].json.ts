import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const topics = await getCollection("topics");
  return topics.map((t) => ({
    params: {
      owner: t.data.owner,
      repo: t.data.repo,
      slug: t.data.slug,
    },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const topics = await getCollection("topics");
  const t = topics.find(
    (t) =>
      t.data.owner === params.owner &&
      t.data.repo === params.repo &&
      t.data.slug === params.slug,
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
