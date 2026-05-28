import { useState, useEffect, useCallback } from 'react';
import { Zap, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import MeterItem from './MeterItem';
import ConfirmStatusModal from './ConfirmStatusModal';
import EditMeterModal from './EditMeterModal';

export default function MetersMain() {
  const { hasRole } = useAuth();
  const canAddMeter = hasRole('Administrador');
  const canManagePerms = hasRole('Administrador');
  const isAdmin = hasRole('Administrador');

  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [editingMeter, setEditingMeter] = useState(null);
  const [togglingStatusMeter, setTogglingStatusMeter] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

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

  const handleConfirmStatusToggle = async () => {
    if (!togglingStatusMeter) return;
    setModalLoading(true);
    setError('');
    const nextStatus = togglingStatusMeter.status_meter === 'active' ? 'inactive' : 'active';
    try {
      const res = await axios.put(`/meters/${togglingStatusMeter.id}`, {
        status_meter: nextStatus
      });
      setMeters(prev => prev.map(m => m.id === togglingStatusMeter.id ? res.data.meter : m));
      setTogglingStatusMeter(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar el estatus del medidor.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveEdit = async (updatedData) => {
    if (!editingMeter) return;
    setModalLoading(true);
    setError('');
    try {
      const res = await axios.put(`/meters/${editingMeter.id}`, updatedData);
      setMeters(prev => prev.map(m => m.id === editingMeter.id ? res.data.meter : m));
      setEditingMeter(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el medidor.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Medidores</h1>
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">
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
          {meters.map((meter) => (
            <MeterItem
              key={meter.id}
              meter={meter}
              isAdmin={isAdmin}
              canManagePerms={canManagePerms}
              onEditClick={setEditingMeter}
              onStatusToggleClick={setTogglingStatusMeter}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <ConfirmStatusModal
        isOpen={!!togglingStatusMeter}
        onClose={() => setTogglingStatusMeter(null)}
        onConfirm={handleConfirmStatusToggle}
        meter={togglingStatusMeter}
        loading={modalLoading}
      />

      <EditMeterModal
        key={editingMeter ? editingMeter.id : 'none'}
        isOpen={!!editingMeter}
        onClose={() => setEditingMeter(null)}
        onSave={handleSaveEdit}
        meter={editingMeter}
        loading={modalLoading}
      />
    </div>
  );
}

