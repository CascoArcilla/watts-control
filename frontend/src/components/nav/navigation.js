import { Home, Zap, Activity, Shield, Clock, Users, UserPlus, History } from 'lucide-react';

export const navigationLinks = [
  { name: 'Admin Dashboard', path: '/admin', icon: Shield, roles: ['Administrador'] },
  { name: 'Usuarios', path: '/admin/users', icon: Users, roles: ['Administrador'] },
  { name: 'Crear Usuario', path: '/admin/users/create', icon: UserPlus, roles: ['Administrador'] },
  { name: 'Registrar Medidor', path: '/meters/register', icon: Zap, roles: ['Administrador'] },
  { name: 'Medidores', path: '/meters', icon: Clock },
  { name: 'Registros de Hoy', path: '/consumptions/today', icon: Home },
  { name: 'Historial de Registros', path: '/consumptions/history', icon: History },
  { name: 'Registrar Consumo', path: '/consumptions/register', icon: Activity },
];
