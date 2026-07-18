import CategoryListPageTemplate from "@/components/shared/CategoryListPageTemplate";

export default function PaidMocksPage() {
  return (
    <CategoryListPageTemplate
      title="Paid Mocks"
      description="Select a category to view available paid mock tests."
      basePath="/paid-mocks"
    />
  );
}
