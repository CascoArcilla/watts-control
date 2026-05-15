import { useState, useEffect, useCallback } from 'react';
import { Zap, Plus, BarChart2, Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const statusLabel = (s) => s === 'active' ? 'Activo' : 'Inactivo';
const fullName = (u) => u ? [u.first_name, u.last_name].filter(Boolean).join(' ') : '—';

export default function MetersMain() {
  const { hasRole } = useAuth();
  const canAddMeter = hasRole('Administrador');
  const canManagePerms = hasRole('Administrador');

  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMeters = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/meters', { params: { includeLastMeasure: true } });
      setMeters(res.data.meters);
    } catch {
      setError('No se pudo cargar la lista de medidores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMeters(); }, [fetchMeters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Medidores</h1>
          <p className="text-gray-400 text-sm mt-1">
            {loading ? 'Cargando...' : `${meters.length} medidor${meters.length !== 1 ? 'es' : ''} disponible${meters.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="refresh_meters"
            onClick={fetchMeters}
            className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canAddMeter && (
            <Link to="/meters/register" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Añadir Medidor</span>
            </Link>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Skeleton / Empty */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card animate-pulse h-44" />
          ))}
        </div>
      )}

      {!loading && !error && meters.length === 0 && (
        <div className="glass-card text-center py-16">
          <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No tienes medidores disponibles.</p>
          {canAddMeter && (
            <Link to="/meters/register" className="btn-primary inline-flex items-center gap-2 mt-4">
              <Plus className="w-4 h-4" />Añadir Medidor
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meters.map((meter) => {
            const isActive = meter.status_meter === 'active';
            return (
              <div key={meter.id} className="glass-card group relative overflow-hidden flex flex-col gap-4">
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
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isActive ? 'bg-medium-green/20 text-light-mint' : 'bg-red-500/20 text-red-400'}`}>
                        {statusLabel(meter.status_meter)}
                      </span>
                    </div>
                  </div>
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
                    className="text-light-mint hover:underline flex items-center gap-1 text-xs"
                  >
                    <BarChart2 className="w-3 h-3" />
                    Registrar consumo
                  </Link>
                  {canManagePerms && (
                    <Link
                      to={`/admin/meters/${meter.id}/permissions`}
                      className="text-light-mint hover:underline flex items-center gap-1 text-xs"
                      title="Gestionar permisos"
                    >
                      <Shield className="w-3 h-3" />
                      Permisos
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
