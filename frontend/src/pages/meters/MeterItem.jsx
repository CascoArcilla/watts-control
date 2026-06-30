import { Link } from 'react-router-dom';
import { Zap, BarChart2, Shield, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';

const statusLabel = (s) => s === 'active' ? 'Activo' : 'Inactivo';
const fullName = (u) => u ? [u.first_name, u.last_name].filter(Boolean).join(' ') : '—';

export default function MeterItem({ meter, isAdmin, canManagePerms, onEditClick, onStatusToggleClick }) {
  const isActive = meter.status_meter === 'active';

  return (
    <div className="glass-card group relative overflow-hidden flex flex-col gap-3 md:gap-4">
      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-light-mint/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />

      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-dark rounded-lg border border-gray-green/20">
            <Zap className="w-6 h-6 text-light-mint" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">#{meter.number_meter}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isActive ? 'bg-medium-green/20 text-light-mint' : 'bg-red-500/20 text-red-400'}`}>
                {statusLabel(meter.status_meter)}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onStatusToggleClick(meter)}
                  className="text-gray-400 hover:text-light-mint transition-colors focus:outline-none"
                  title={isActive ? 'Desactivar medidor' : 'Activar medidor'}
                >
                  {isActive ? (
                    <ToggleRight className="w-5 h-5 text-light-mint cursor-pointer" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-500 cursor-pointer" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Button for Admin */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => onEditClick(meter)}
            className="p-1.5 bg-dark hover:bg-gray-green/20 rounded-lg text-gray-300 hover:text-white transition-colors border border-gray-green/10"
            title="Editar medidor"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Owner */}
      <div className="text-sm text-gray-400">
        <span className="text-gray-500 text-xs uppercase tracking-wide">Propietario</span>
        <p className="text-white font-medium mt-0.5">{fullName(meter.User)}</p>
      </div>

      {/* Last Measure */}
      {meter.lastMeasure && (
        <div className="text-sm text-gray-400">
          <span className="text-gray-500 text-xs uppercase tracking-wide">Última Lectura</span>
          <p className="text-white font-medium mt-0.5">
            <span className="text-light-mint font-bold">{meter.lastMeasure.watts.toLocaleString()}</span>
            <span className="text-[10px] text-gray-500 ml-1">kWs</span>
          </p>
          <p className="text-[10px] text-gray-500">
            {new Date(meter.lastMeasure.createdAt).toLocaleDateString()} {new Date(meter.lastMeasure.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-green/20 flex items-center justify-between gap-2">
        <Link
          to="/consumptions/register"
          state={{ meterId: meter.id, meterNumber: meter.number_meter }}
          className="text-light-mint hover:underline flex items-center gap-1 text-[10px] sm:text-xs"
        >
          <BarChart2 className="w-3 h-3" />
          Registrar consumo
        </Link>
        {canManagePerms && (
          <Link
            to={`/admin/meters/${meter.id}/permissions`}
            className="text-light-mint hover:underline flex items-center gap-1 text-[10px] sm:text-xs"
            title="Gestionar permisos"
          >
            <Shield className="w-3 h-3" />
            Permisos
          </Link>
        )}
      </div>
    </div>
  );
}
