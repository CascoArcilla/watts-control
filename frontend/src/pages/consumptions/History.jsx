import { useState, useEffect, useCallback } from 'react';
import { UserIcon, Plus, Filter, ChevronLeft, ChevronRight, Zap, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function History() {
  const [measures, setMeasures] = useState([]);
  const [meters, setMeters] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMeters = async () => {
    try {
      const res = await axios.get('/meters');
      setMeters(res.data.meters);
    } catch (err) {
      console.error('Error fetching meters:', err);
    }
  };

  const fetchMeasures = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10,
        meterId: selectedMeter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };
      const res = await axios.get('/consumptions', { params });
      setMeasures(res.data.measures);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('No se pudo cargar el historial de consumos.');
    } finally {
      setLoading(false);
    }
  }, [selectedMeter, startDate, endDate]);

  useEffect(() => {
    fetchMeters();
  }, []);

  useEffect(() => {
    fetchMeasures(1);
  }, [fetchMeasures]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMeasures(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Historial de Consumo</h1>
          <p className="text-gray-400 text-sm mt-1">Consulta todos los registros históricos del sistema.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchMeasures(pagination.page)}
            className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/consumptions/register" className="btn-primary flex items-center space-x-2 whitespace-nowrap">
            <Plus className="w-4 h-4" />
            <span>Registrar Consumo</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark/30 p-4 rounded-xl border border-gray-green/10 space-y-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros Avanzados:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 font-medium">Medidor</label>
            <select
              value={selectedMeter}
              onChange={(e) => setSelectedMeter(e.target.value)}
              className="input-field py-1.5 text-sm"
            >
              <option value="">Todos los medidores</option>
              {meters.map((meter) => (
                <option key={meter.id} value={meter.id} className="bg-darkest text-white">
                  Medidor #{meter.number_meter}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 font-medium">Desde</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field !pl-9 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 font-medium">Hasta</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field !pl-9 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="glass-card">
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-darkest/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : measures.length === 0 ? (
          <div className="text-center py-16">
            <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No se encontraron consumos con los filtros aplicados.</p>
            <Link to="/consumptions/register" className="btn-primary inline-flex items-center gap-2 mt-4">
              <Plus className="w-4 h-4" /> Registrar Consumo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {measures.map((measure) => (
              <div key={measure.id} className="flex items-center justify-between p-4 bg-darkest/30 rounded-lg border border-gray-green/10 hover:border-light-mint/20 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-dark flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5 text-light-mint" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Medición registrada</p>
                    <p className="text-sm text-gray-400">
                      Usuario <span className="text-light-mint font-semibold">@{measure.User.username}</span> registró <span className="text-white font-bold">{measure.watts} kW/h</span> en el medidor <span className="text-white">#{measure.Meter.number_meter}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-gray-500 block">
                    {new Date(measure.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-600 block">
                    {new Date(measure.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-green/10">
            <p className="text-sm text-gray-500">
              Mostrando {measures.length} de {pagination.total} registros
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
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      p === pagination.page
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
        )}
      </div>
    </div>
  );
}
