import { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ItemRegister from './ItemRegister';
import Pagination from './Pagination';

export default function Today() {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [consumption, setConsumption] = useState({ kwh: 0, referenceDate: null, referenceKwh: null });

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
        date: new Date().toDateString(),
        page,
        limit: 10,
        meterId: selectedMeter || undefined
      };
      const res = await axios.get('/consumptions', { params });

      const { measures: fetchedMeasures, pagination: fetchedPagination, consumption: fetchedConsumption } = res.data;

      if (page > fetchedPagination.totalPages && fetchedPagination.totalPages > 0) {
        setError(`La página ${page} no existe. Para hoy solo hay ${fetchedPagination.totalPages} páginas.`);
      }

      setMeasures(fetchedMeasures);
      setPagination(fetchedPagination);
      setConsumption(fetchedConsumption);
    } catch (err) {
      setError('No se pudieron cargar los registros de hoy.');
    } finally {
      setLoading(false);
    }
  }, [selectedMeter]);

  useEffect(() => { fetchMeters(); }, []);
  useEffect(() => { fetchMeasures(pagination.page); }, [pagination.page]);

  useEffect(() => {
    if (pagination.page > 1) handlePageChange(1);
    else fetchMeasures();
  }, [selectedMeter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
      navigate(`/consumptions/today/${newPage}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Registros de Hoy</h1>
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">Aquí puedes ver los registros de consumo en el día.</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-dark/30 p-4 rounded-xl border border-gray-green/10">
        <div className="flex items-center gap-2 text-gray-400 shrink-0">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtrar:</span>
        </div>
        <select
          value={selectedMeter}
          onChange={(e) => { setSelectedMeter(e.target.value); }}
          className="input-field w-full sm:w-auto py-1.5 text-sm"
        >
          <option value="">Todos los medidores</option>
          {meters.map((meter) => (
            <option key={meter.id} value={meter.id}>
              Medidor #{meter.number_meter} - {meter.User?.first_name} {meter.User?.last_name}
            </option>
          ))}
        </select>
      </div>

      {/* Consumption Card */}
      {consumption && consumption.kwh && (
        <div className="glass-card">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Zap className="w-4 h-4 text-light-mint" />
              <span className="text-sm md:text-md text-gray-300 font-medium">Consumo:</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-white">{consumption.kwh} kWh</p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-green/10">
            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mb-1">Referencia Anterior</p>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              {new Date(consumption.referenceDate).toLocaleDateString()} {new Date(consumption.referenceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}hrs 
              <span className="text-white font-medium ml-1">({consumption.referenceKwh} kWh)</span>
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="glass-card">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-4 mb-6">
            <div className="flex items-center gap-3">
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-darkest/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : measures.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay consumos registrados para hoy.</p>
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