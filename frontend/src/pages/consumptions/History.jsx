import { parseDateInput } from '../../utils/parseDateInput';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Zap, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ItemRegister from './ItemRegister';
import Pagination from './Pagination';

export default function History() {
  const { page: pageParam } = useParams();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    page: parseInt(pageParam) || 1,
    totalPages: 1,
    total: 0
  });

  const [measures, setMeasures] = useState([]);
  const [meters, setMeters] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

    if (isNaN(page) || page < 1) {
      setError('Número de página inválido.');
      setLoading(false);
      return;
    }

    try {
      const params = {
        page,
        limit: 10,
        meterId: selectedMeter || undefined,
        startDate: parseDateInput(startDate)?.toDateString() || undefined,
        endDate: parseDateInput(endDate)?.toDateString() || undefined
      };
      const res = await axios.get('/consumptions', { params });

      const { measures: fetchedMeasures, pagination: fetchedPagination } = res.data;

      if (page > fetchedPagination.totalPages && fetchedPagination.totalPages > 0) {
        setError(`La página ${page} no existe. El historial solo tiene ${fetchedPagination.totalPages} páginas.`);
      }

      setMeasures(fetchedMeasures);
      setPagination(fetchedPagination);
    } catch (err) {
      setError('No se pudo cargar el historial de consumos.');
    } finally {
      setLoading(false);
    }
  }, [selectedMeter, startDate, endDate]);

  useEffect(() => { fetchMeters(); }, []);

  useEffect(() => { fetchMeasures(pagination.page); }, [pagination.page]);

  useEffect(() => {
    if (pagination.page > 1) handlePageChange(1);
    else fetchMeasures();
  }, [selectedMeter]);

  useEffect(() => {
    if (startDate === '' || endDate === '') return;
    if (startDate > endDate) {
      setError('La fecha de inicio no puede ser mayor a la fecha de fin.');
      return;
    }

    if (pagination.page > 1) handlePageChange(1);
    else fetchMeasures();
  }, [startDate, endDate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
      navigate(`/consumptions/history/${newPage}`);
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
                  Medidor #{meter.number_meter} - {meter.User?.first_name} {meter.User?.last_name}
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
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <Pagination measures={measures} pagination={pagination} handlePageChange={handlePageChange} isTop={true} />
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
            {measures.map((measure) => <ItemRegister key={measure.id} measure={measure} />)}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <Pagination measures={measures} pagination={pagination} handlePageChange={handlePageChange} />
        )}
      </div>
    </div>
  );
}