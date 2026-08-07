import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

// --- Amazon Style Pagination Classes ---
const amazonPageBtn = `
  h-9 px-3 text-sm font-normal rounded-sm border border-gray-300 bg-white
  text-[#0F1111] hover:bg-[#E3E6E6] hover:border-gray-400
  disabled:text-gray-400 disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
  transition-colors
`;

const amazonActiveBtn = `
  h-9 px-3 text-sm font-bold rounded-sm border border-[#E77500] bg-[#EDFDFF]
  text-[#C7511F] cursor-default shadow-sm
`;

const amazonIconBtn = `
  h-9 w-9 flex items-center justify-center rounded-sm border border-gray-300 bg-white
  text-[#0F1111] hover:bg-[#E3E6E6] hover:border-gray-400
  disabled:text-gray-400 disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
  transition-colors
`;

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    showFirstLast = true,
    maxButtons = 5
}) {
    const getPageNumbers = () => {
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center mt-8 mb-4">
            <nav className="flex items-center gap-1" aria-label="Pagination">
                {/* First Page Button */}
                {showFirstLast && (
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className={amazonIconBtn}
                        aria-label="First page"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </button>
                )}

                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={amazonIconBtn}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={currentPage === pageNum ? amazonActiveBtn : amazonPageBtn}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                    >
                        {pageNum}
                    </button>
                ))}

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={amazonIconBtn}
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>

                {/* Last Page Button */}
                {showFirstLast && (
                    <button
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={amazonIconBtn}
                        aria-label="Last page"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                )}
            </nav>
        </div>
    );
}