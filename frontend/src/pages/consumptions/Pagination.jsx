import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ measures, pagination, handlePageChange, isTop = false }) {
  return (
    <div className={`flex items-center justify-between ${isTop ? 'mb-8 pb-6 border-b' : 'mt-8 pt-6 border-t'} border-gray-green/10`}>
      <p className="text-sm text-gray-500">
        Mostrando {measures?.length} de {pagination.total} registros
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === pagination.page
                ? 'bg-light-mint text-darkest'
                : 'text-gray-400 hover:bg-dark/50 hover:text-light-mint'
                }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}