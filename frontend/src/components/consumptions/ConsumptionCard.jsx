import { Zap } from 'lucide-react';

export default function ConsumptionCard({ consumption, label = 'Consumo' }) {
  if (!consumption || !consumption.kwh) return null;

  return (
    <div className="glass-card">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Zap className="w-4 h-4 text-light-mint" />
          <span className="text-sm md:text-md text-gray-300 font-medium">{label}:</span>
        </div>
        <p className="text-lg md:text-xl font-bold text-white">{consumption.kwh} kWh</p>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-green/10">
        <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mb-1">Referencia Anterior</p>
        <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
          {new Date(consumption.referenceDate).toLocaleDateString()} {new Date(consumption.referenceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <span className="text-white font-medium ml-1">({consumption.referenceKwh} kWh)</span>
        </p>
      </div>
    </div>
  );
}
