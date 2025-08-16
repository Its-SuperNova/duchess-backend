import CategoryClient from "./category-client";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Get category name from slug for display
  const categoryName = slug.replace(/-/g, " ").replace(/\band\b/g, "&");

  return <CategoryClient categorySlug={slug} categoryName={categoryName} />;
}
