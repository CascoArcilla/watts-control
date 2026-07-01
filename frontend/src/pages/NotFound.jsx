import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-darkest flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-medium-green rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-light-mint rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-light-gray-green rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="z-10 w-full max-w-md p-8 text-center">
        <div className="glass-card shadow-2xl p-12">
          <h1 className="text-8xl font-bold text-light-mint mb-4">404</h1>
          <p className="text-2xl font-semibold text-white mb-2">Página no encontrada</p>
          <p className="text-gray-400 mb-8">La página que buscas no existe o ha sido movida.</p>
          <Link
            to="/consumptions/today"
            className="inline-flex items-center space-x-2 btn-primary"
          >
            <Home className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
