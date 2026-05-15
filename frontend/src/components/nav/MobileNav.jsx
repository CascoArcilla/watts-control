import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, LogOut, Home, Activity, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { navigationLinks } from './navigation';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout, roles } = useAuth();

  const titles = {
    '/admin': 'Dashboard Admin',
    '/meters': 'Medidores',
    '/meters/register': 'Registrar Nuevo Medidor',
    '/consumptions/register': 'Registrar Consumo',
    '/admin/users': 'Usuarios',
    '/admin/users/create': 'Crear Usuario',
    '/consumptions/today': 'Registros de Hoy',
    '/consumptions/history': 'Historial de Registros',
  };

  const currentTitle = titles[location.pathname] || 'EC Control';

  const toggleMenu = () => setIsOpen(!isOpen);

  const bottomNavItems = [
    { name: 'Hoy', path: '/consumptions/today', icon: Home },
    { name: 'Registrar', path: '/consumptions/register', icon: Activity },
    { name: 'Medidores', path: '/meters', icon: Clock },
  ];

  return (
    <div className="md:hidden">
      {/* Mobile Top Bar - Simple Title */}
      <div className="h-16 glass border-b border-gray-green/20 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center">
          <Zap className="w-8 h-8 text-light-mint mr-2" />
          <span className="text-lg font-bold text-white tracking-wide truncate max-w-[250px]">{currentTitle}</span>
        </div>
      </div>

      <div className="h-16" />

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-gray-green/20 z-40 px-4 flex items-center justify-around pb-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 ${isActive ? 'text-light-mint scale-110' : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-light-mint/20' : ''}`} />
              <span className="text-[10px] font-medium uppercase tracking-tighter">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={toggleMenu}
          className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 ${isOpen ? 'text-light-mint scale-110' : 'text-gray-400 hover:text-gray-200'
            }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          <span className="text-[10px] font-medium uppercase tracking-tighter">Más</span>
        </button>
      </div>

      <div className="h-20" />

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-darkest/80 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Drawer - Toggled from bottom */}
      <aside className={`fixed top-0 right-0 h-full w-72 glass border-l border-gray-green/20 z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-green/20 shrink-0">
          <div className="flex items-center">
            <Zap className="w-6 h-6 text-light-mint mr-2" />
            <span className="text-lg font-bold text-white">Menú</span>
          </div>
          <button onClick={toggleMenu} className="p-1 text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-green/20 shrink-0">
          <button
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-darkest/50 hover:text-red-400 transition-colors"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>

        {/* Spacer to push links to the bottom */}
        <div className="flex-1" />

        <nav className="p-4 space-y-2 overflow-y-auto shrink-0 max-h-[70vh]">
          {navigationLinks.map((link) => (
            <MobileNavLink
              key={link.name}
              link={link}
              userRoles={roles}
              location={location}
              onClick={() => setIsOpen(false)}
            />
          ))}
        </nav>
      </aside>
    </div>
  );
}

function MobileNavLink({ link, userRoles, location, onClick }) {
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
      onClick={onClick}
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
