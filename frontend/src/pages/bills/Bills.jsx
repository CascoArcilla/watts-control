import { useState, useEffect } from 'react';
import { FileText, Calendar, Zap, ArrowRight, Gauge, AlertCircle, Loader, Search } from 'lucide-react';
import axios from 'axios';

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function Bills() {
  const [meterId, setMeterId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchMeters = async () => {
      setFetching(true);
      try {
        const res = await axios.get('/meters');
        setMeters(res.data.meters);
      } catch {
        setError('No se pudo cargar la lista de medidores.');
      } finally {
        setFetching(false);
      }
    };
    fetchMeters();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!meterId || !startDate || !endDate) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (endDate <= startDate) {
      setError('La fecha final debe ser mayor a la fecha inicial.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get('/bills/check-info', {
        params: { meterId, startDate, endDate }
      });
      console.log(res.data);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al consultar la factura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-dark rounded-lg">
          <FileText className="w-5 h-5 text-light-mint" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Consulta de Factura</h1>
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">
            Selecciona un medidor y rango de fechas para calcular el consumo.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="glass-card">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Medidor</label>
              <select
                value={meterId}
                onChange={(e) => setMeterId(e.target.value)}
                className="input-field py-1.5 text-xs sm:text-sm truncate"
                disabled={loading || fetching}
                required
              >
                <option value="" disabled>Selecciona un medidor</option>
                {meters.map((m) => (
                  <option key={m.id} value={m.id}>
                    #{m.number_meter} - {m.User?.first_name} {m.User?.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Final</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-green/20 flex justify-end">
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading || fetching}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Consultar Factura</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="glass-card divide-y divide-gray-green/20">
          <div className="p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-light-mint" />
              Resumen de Factura
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex items-start gap-3 p-3 bg-dark/50 rounded-xl">
                <Calendar className="w-5 h-5 text-light-mint shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Periodo</p>
                  <p className="text-sm text-white font-medium">{result.start}</p>
                  <p className="text-xs text-gray-400">al {result.end}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-dark/50 rounded-xl">
                <Zap className="w-5 h-5 text-light-mint shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Medidor</p>
                  <p className="text-sm text-white font-medium">#{result.meter?.number_meter}</p>
                  <p className="text-xs text-gray-400">
                    {result.meter?.User?.first_name} {result.meter?.User?.last_name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-light-mint" />
              Mediciones
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-dark/50 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-amber-400">1</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Medición más antigua</p>
                  <p className="text-lg font-bold text-white">{result.oldMesure?.watts?.toLocaleString()} <span className="text-xs font-normal text-gray-400">kW/h</span></p>
                  <p className="text-xs text-gray-400">{formatDate(result.oldMesure?.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-dark/50 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-400">2</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Medición más reciente</p>
                  <p className="text-lg font-bold text-white">{result.recentMesure?.watts?.toLocaleString()} <span className="text-xs font-normal text-gray-400">kW/h</span></p>
                  <p className="text-xs text-gray-400">{formatDate(result.recentMesure?.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between p-4 bg-light-mint/10 rounded-xl border border-light-mint/20">
              <div className="flex items-center gap-3">
                <Gauge className="w-6 h-6 text-light-mint" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Consumo Total</p>
                  <p className="text-xl font-bold text-white">{result.consumption?.toLocaleString()} <span className="text-sm font-normal text-gray-400">kW/h</span></p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-light-mint" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
