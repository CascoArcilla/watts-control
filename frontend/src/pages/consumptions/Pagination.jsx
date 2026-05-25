import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ measures, pagination, handlePageChange, isTop = false }) {
  const { page, totalPages } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${isTop ? 'mb-8 pb-6 border-b' : 'mt-8 pt-6 border-t'} border-gray-green/10`}>
      <p className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
        Mostrando {measures?.length} de {pagination.total} registros
      </p>
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors disabled:opacity-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1">
          {pageNumbers[0] > 1 && <span className="text-gray-600 px-1">...</span>}
          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${p === page
                ? 'bg-light-mint text-darkest shadow-lg scale-110'
                : 'text-gray-400 hover:bg-dark/50 hover:text-light-mint'
                }`}
            >
              {p}
            </button>
          ))}
          {pageNumbers[pageNumbers.length - 1] < totalPages && <span className="text-gray-600 px-1">...</span>}
        </div>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors disabled:opacity-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}