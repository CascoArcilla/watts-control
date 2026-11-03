import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const formatTick = (timestamp) =>
  new Date(timestamp).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
  });

const formatTooltipLabel = (timestamp) =>
  new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const formatWatts = (value) => Number(value).toLocaleString();

/**
 * Simple line chart for a meter's cumulative consumption.
 * @param {{data: Array<{timestamp: number, watts: number}>}} props
 */
export default function ConsumptionLineChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-72 sm:h-96 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#909590"
            strokeOpacity={0.2}
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatTick}
            stroke="#909590"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            minTickGap={28}
          />
          <YAxis
            dataKey="watts"
            domain={['auto', 'auto']}
            tickFormatter={formatWatts}
            stroke="#909590"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            width={56}
          />
          <Tooltip
            labelFormatter={formatTooltipLabel}
            formatter={(value) => [`${formatWatts(value)} kWh`, 'Consumo']}
            contentStyle={{
              backgroundColor: '#2C302E',
              border: '1px solid rgba(144, 149, 144, 0.3)',
              borderRadius: 12,
              color: '#fff',
            }}
            labelStyle={{ color: '#9AE19D' }}
            itemStyle={{ color: '#fff' }}
            cursor={{ stroke: '#9AE19D', strokeOpacity: 0.3 }}
          />
          <Line
            type="monotone"
            dataKey="watts"
            name="Consumo"
            stroke="#9AE19D"
            strokeWidth={2}
            dot={{ r: 2.5, fill: '#9AE19D', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
