import { AlertTriangle } from 'lucide-react';

export default function ConfirmStatusModal({ isOpen, onClose, onConfirm, meter, loading }) {
  if (!isOpen || !meter) return null;

  const nextStatus = meter.status_meter === 'active' ? 'inactivo' : 'activo';
  const nextStatusLabel = nextStatus === 'activo' ? 'Activo' : 'Inactivo';

  return (
    <div className="fixed inset-0 bg-darkest/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-dark border border-gray-green/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">¿Cambiar estatus del medidor?</h2>
        </div>

        {/* Content */}
        <p className="text-gray-300 text-sm leading-relaxed">
          ¿Estás seguro de que deseas cambiar el estatus del medidor{' '}
          <span className="text-light-mint font-bold">#{meter.number_meter}</span> a{' '}
          <span className={nextStatus === 'activo' ? 'text-light-mint font-semibold' : 'text-red-400 font-semibold'}>
            {nextStatusLabel}
          </span>
          ?
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50 flex items-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{loading ? 'Cargando...' : 'Sí, cambiar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
