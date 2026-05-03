import { useState, useCallback, useEffect } from 'react';
import { Save, ArrowLeft, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function RegisterConsumption() {
  const [meter, setMeter] = useState({ id: '', number_meter: '' });
  const [watts, setWatts] = useState('');

  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMeters = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/meters');
      setMeters(res.data.meters);
    } catch {
      setError('No se pudo cargar la lista de medidores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMeters(); }, [fetchMeters]);

  const changeSelectMeter = (e) => {
    setMeter({
      id: e.target.value,
      number_meter: meters.find(m => m.id === parseInt(e.target.value))?.number_meter
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!meter.id || !watts || isNaN(watts) || parseInt(watts) <= 0) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      await axios.post('/consumptions', { meter, watts });
      setSuccess('Consumo registrado exitosamente.');
      setMeter({ id: '', number_meter: '' });
      setWatts('');
    } catch (err) {
      setError(err.response.data.message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/consumptions/today" className="p-2 bg-dark rounded-lg hover:bg-gray-green/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Registrar Consumo</h1>
          <p className="text-gray-400 text-sm mt-1">Ingresa los watts consumidos para el período actual.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="glass-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Medidor</label>
              <select
                value={meter.id}
                onChange={changeSelectMeter}
                className="input-field"
                disabled={loading}
                required
              >
                <option value="" disabled>Selecciona un medidor</option>
                {meters.map((m) => (
                  <option key={m.id} value={m.id}>
                    #{m.number_meter} - {m.User.first_name} {m.User.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Consumo en kW/h</label>
              <input
                type="number"
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
                className="input-field"
                placeholder="Ej. 120"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-green/20 flex justify-end space-x-3">
           <Link to="/consumptions/today" className="btn-secondary">Cancelar</Link>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Registrar Consumo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
