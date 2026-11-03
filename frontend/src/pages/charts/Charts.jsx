import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ChartLine, Filter, Zap, AlertCircle, Calendar } from 'lucide-react';
import ConsumptionCard from '../../components/consumptions/ConsumptionCard';
import ConsumptionLineChart from '../../components/charts/ConsumptionLineChart';
import { parseDateInput } from '../../utils/parseDateInput';

const MAX_MEASURES = 1000;

// Local calendar date encoded as UTC midnight; the backend converts it to UTC
// using the client offset (same convention used in Today/History).
const encodeLocalDate = (dateInput) => {
  const date = parseDateInput(dateInput);
  if (!date) return undefined;
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  ).toISOString();
};

export default function Charts() {
  const [report, setReport] = useState('consumption');
  const [meters, setMeters] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [measures, setMeasures] = useState([]);
  const [consumption, setConsumption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    let active = true;
    axios
      .get('/meters')
      .then((res) => {
        if (active) setMeters(res.data.meters);
      })
      .catch((err) => {
        if (active) console.error('Error fetching meters:', err);
      });
    return () => {
      active = false;
    };
  }, []);

  const isComplete = Boolean(selectedMeter && startDate && endDate);
  const isRangeValid = isComplete && startDate <= endDate;
  const rangeError =
    isComplete && !isRangeValid
      ? 'La fecha de inicio no puede ser mayor a la fecha de final.'
      : '';
  const error = rangeError || fetchError;

  // Only request data when the meter and both dates are present and valid.
  useEffect(() => {
    if (!isRangeValid) return;

    const controller = new AbortController();

    const fetchConsumption = async () => {
      setLoading(true);
      setFetchError('');

      try {
        const start = parseDateInput(startDate);
        const end = parseDateInput(endDate);
        const referenceDate = start || end || new Date();

        const res = await axios.get('/consumptions', {
          signal: controller.signal,
          params: {
            page: 1,
            limit: MAX_MEASURES,
            meterId: selectedMeter,
            startDate: encodeLocalDate(startDate),
            endDate: encodeLocalDate(endDate),
            offset: -referenceDate.getTimezoneOffset() * 60 * 1000,
          },
        });

        console.log(res.data);

        setMeasures(res.data.measures || []);
        setConsumption(res.data.consumption || null);
      } catch (err) {
        if (err.code === 'ERR_CANCELED') return;
        setMeasures([]);
        setConsumption(null);
        setFetchError('No se pudo cargar el consumo del rango seleccionado.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchConsumption();

    return () => controller.abort();
  }, [selectedMeter, startDate, endDate, isRangeValid]);

  const chartData = useMemo(
    () =>
      measures
        .map((measure) => ({
          timestamp: new Date(measure.createdAt).getTime(),
          watts: Number(measure.watts),
        }))
        .filter(
          (point) =>
            Number.isFinite(point.timestamp) && Number.isFinite(point.watts),
        )
        .sort((a, b) => a.timestamp - b.timestamp),
    [measures],
  );

  const showChart = isRangeValid && !loading && chartData.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Gráficos</h1>
        <p className="text-gray-400 text-xs md:text-sm mt-0.5">
          Visualiza el consumo de un medidor en un rango de fechas.
        </p>
      </div>

      {/* Report selector */}
      <div className="bg-dark/30 p-4 rounded-xl border border-gray-green/10 space-y-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Gráfico:</span>
        </div>

        <div className="max-w-sm space-y-1.5">
          <label className="text-xs text-gray-500 font-medium">Reporte</label>
          <select
            value={report}
            onChange={(e) => setReport(e.target.value)}
            className="input-field py-1.5 text-xs sm:text-sm"
          >
            <option value="consumption">Revisión de consumo</option>
          </select>
        </div>

        {report === 'consumption' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Medidor</label>
              <select
                value={selectedMeter}
                onChange={(e) => setSelectedMeter(e.target.value)}
                className="input-field py-1.5 text-xs sm:text-sm truncate"
              >
                <option value="">Selecciona un medidor</option>
                {meters.map((meter) => (
                  <option key={meter.id} value={meter.id}>
                    Medidor #{meter.number_meter} - {meter.User?.first_name} {meter.User?.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Fecha de inicio</label>
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
              <label className="text-xs text-gray-500 font-medium">Fecha de final</label>
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
        )}
      </div>

      {/* Total consumption, above the chart */}
      {showChart && consumption && (
        <ConsumptionCard consumption={consumption} label="Consumo total" />
      )}

      {/* Chart */}
      <div className="glass-card">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {!isComplete ? (
          <div className="text-center py-16">
            <ChartLine className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              Selecciona un medidor y un rango de fechas para generar la gráfica.
            </p>
          </div>
        ) : !isRangeValid || loading ? (
          <div className="h-72 sm:h-96 bg-darkest/30 rounded-lg animate-pulse" />
        ) : chartData.length > 0 ? (
          <ConsumptionLineChart data={chartData} />
        ) : error ? null : (
          <div className="text-center py-16">
            <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              No hay registros de consumo en el rango seleccionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
