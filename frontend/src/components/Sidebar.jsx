import { Link, useLocation } from 'react-router-dom';
import { LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { navigationLinks } from './nav/navigation';

export default function Sidebar() {
  const location = useLocation();
  const { logout, roles } = useAuth();


  return (
    <div className="w-64 glass border-r border-gray-green/20 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-gray-green/20">
          <Zap className="w-8 h-8 text-light-mint mr-2" />
          <h1 className="text-xl font-bold text-white tracking-wide">EC Control</h1>
        </div>
        <nav className="p-4 space-y-2 mt-4">
          {navigationLinks.map((link) => (
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