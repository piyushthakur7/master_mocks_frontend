import CategoryPageTemplate from "@/components/shared/CategoryPageTemplate";

export default async function Page({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  return <CategoryPageTemplate title="Free Mocks" accessType="free" resourceType="mock" categoryId={categoryId} />;
}
