import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserPagination({ pagination, onPageChange }) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 glass-card mt-4 border-gray-green/10">
      <p className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1 font-medium">
        Página {pagination.page} de {pagination.totalPages}
      </p>
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(p => Math.abs(p - pagination.page) <= (window.innerWidth < 640 ? 1 : 2))
            .map(p => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all duration-300 ${
                  p === pagination.page
                    ? 'bg-light-mint text-darkest shadow-lg shadow-light-mint/20 scale-110'
                    : 'text-gray-400 hover:bg-dark/50 hover:text-light-mint'
                }`}
              >
                {p}
              </button>
            ))
          }
        </div>
        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
