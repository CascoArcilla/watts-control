import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, Activity, Shield, LogOut, Clock, Users, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { logout, roles } = useAuth();

  const links = [
    { name: 'Admin Dashboard', path: '/admin', icon: Shield, roles: ['Administrador'] },
    { name: 'Usuarios', path: '/admin/users', icon: Users, roles: ['Administrador'] },
    { name: 'Crear Usuario', path: '/admin/users/create', icon: UserPlus, roles: ['Administrador'] },
    { name: 'Registrar Medidor', path: '/meters/register', icon: Zap, roles: ['Administrador'] },
    { name: 'Medidores', path: '/meters', icon: Clock },
    { name: 'Consumo de Hoy', path: '/consumptions/today', icon: Home },
    { name: 'Registrar Consumo', path: '/consumptions/register', icon: Activity },
  ];

  return (
    <div className="w-64 glass border-r border-gray-green/20 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-gray-green/20">
          <Zap className="w-8 h-8 text-light-mint mr-2" />
          <h1 className="text-xl font-bold text-white tracking-wide">EC Control</h1>
        </div>
        <nav className="p-4 space-y-2 mt-4">
          {links.map((link) => (
            <SidebarLink key={link.name} link={link} userRoles={roles} location={location} />
          ))}
        </nav>
      </div>

      <div className="p-4">
        <Link
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-darkest/50 hover:text-red-400 transition-colors"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </Link>
      </div>
    </div>
  );
}

function SidebarLink({ link, userRoles, location }) {
  const isActive = location.pathname === link.path;
  const Icon = link.icon;

  if (link.roles) {
    const hasAccess = link.roles.some((role) => userRoles.includes(role));
    if (!hasAccess) {
      return null;
    }
  }

  return (
    <Link
      to={link.path}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
        ? 'bg-light-mint text-darkest shadow-md'
        : 'text-gray-300 hover:bg-dark hover:text-light-mint'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{link.name}</span>
    </Link>
  );
}