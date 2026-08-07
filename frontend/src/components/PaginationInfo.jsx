export default function PaginationInfo({
  currentPage,
  resultPerPage,
  productsCount,
  count,
}) {
  const startItem = (currentPage - 1) * resultPerPage + 1;
  const endItem = Math.min(currentPage * resultPerPage, productsCount);

  if (productsCount === 0) return null;

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
      Showing {startItem} to {endItem} of {productsCount} products
      {count !== productsCount && ` (${count} on this page)`}
    </div>
  );
}
