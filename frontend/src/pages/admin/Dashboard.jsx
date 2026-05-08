import { useState, useEffect } from 'react';
import { Users, Zap, TrendingUp, AlertCircle, ShieldCheck, ShieldAlert, Key, KeyRound, Activity, Battery, Hash } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/dashboard/stats');
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Error al cargar las estadísticas.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-10 h-10 border-4 border-light-mint border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card flex items-center space-x-4 border-red-500/20 bg-red-500/5">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <div>
          <h2 className="text-xl font-bold text-white">Error</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const { users, meters, consumption } = data || {};

  const stats = [
    { title: 'Total Usuarios', value: users?.total || 0, icon: Users, color: 'text-light-mint', bg: 'bg-light-mint/10' },
    { title: 'Total Medidores', value: meters?.total || 0, icon: Zap, color: 'text-medium-green', bg: 'bg-medium-green/10' },
    { title: 'Consumo Mensual', value: `${consumption?.totalCurrentMonth || 0} kWh`, icon: TrendingUp, color: 'text-med-light-green', bg: 'bg-med-light-green/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Resumen Administrativo</h1>
          <p className="text-gray-400 text-sm mt-1">Vista general del sistema y consumos.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-card flex items-center space-x-4 hover:bg-white/5 transition-colors duration-300">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Users Info */}
        <div className="glass-card hover:border-light-mint/20 transition-colors">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-light-mint" /> Detalles de Usuarios
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-darkest/30 rounded-lg border border-gray-green/10">
              <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-medium-green" /><span className="text-gray-300">Activos</span></div>
              <span className="text-white font-bold">{users?.active || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-darkest/30 rounded-lg border border-gray-green/10">
              <div className="flex items-center gap-3"><ShieldAlert className="w-5 h-5 text-red-400" /><span className="text-gray-300">Bloqueados</span></div>
              <span className="text-white font-bold">{users?.blocked || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-darkest/30 rounded-lg border border-gray-green/10">
              <div className="flex items-center gap-3"><Key className="w-5 h-5 text-light-mint" /><span className="text-gray-300">Con Contraseña</span></div>
              <span className="text-white font-bold">{users?.withPassword || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-darkest/30 rounded-lg border border-gray-green/10">
              <div className="flex items-center gap-3"><KeyRound className="w-5 h-5 text-gray-500" /><span className="text-gray-300">Sin Contraseña</span></div>
              <span className="text-white font-bold">{users?.withoutPassword || 0}</span>
            </div>
          </div>
        </div>

        {/* Meters Info */}
        <div className="glass-card hover:border-medium-green/20 transition-colors">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-medium-green" /> Detalles de Medidores
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-darkest/30 rounded-lg border border-gray-green/10">
              <div className="flex items-center gap-3"><Activity className="w-5 h-5 text-medium-green" /><span className="text-gray-300">Activos</span></div>
              <span className="text-white font-bold">{meters?.active || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-darkest/30 rounded-lg border border-gray-green/10">
              <div className="flex items-center gap-3"><Battery className="w-5 h-5 text-gray-500" /><span className="text-gray-300">Inactivos</span></div>
              <span className="text-white font-bold">{meters?.inactive || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Consumption by Meter */}
      <div className="glass-card mt-6 hover:border-med-light-green/20 transition-colors">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-med-light-green" /> Consumo por Medidor (Mes Actual)
        </h2>
        {consumption?.byMeterCurrentMonth?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {consumption.byMeterCurrentMonth.map((item, idx) => (
              <div key={idx} className="flex flex-col p-4 bg-darkest/30 rounded-lg border border-gray-green/10 hover:border-light-mint/20 hover:bg-darkest/50 transition-all cursor-default group">
                <div className="flex items-center gap-2 mb-2 text-gray-400 group-hover:text-light-mint transition-colors">
                  <Hash className="w-4 h-4" /> <span className="text-sm font-medium">Medidor #{item.meterNumber}</span>
                </div>
                <div className="text-2xl font-bold text-white">{item.totalWatts.toLocaleString()} <span className="text-sm text-gray-500 font-normal">kWs</span></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-darkest/20 rounded-xl border border-gray-green/5">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No hay datos de consumo registrados este mes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
