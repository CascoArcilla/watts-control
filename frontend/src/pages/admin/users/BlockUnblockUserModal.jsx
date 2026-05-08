import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, X, AlertCircle, Save, Ban, CheckCircle2 } from 'lucide-react';

export default function BlockUnblockUserModal({ user, onClose, onSuccess }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');
  const [question, setQuestion] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (user) {
      setError('');
      if (user.is_bloked) {
        setAction('Desbloquear');
        setQuestion('¿Estás seguro de que quieres desbloquear al usuario?');
        setIcon(<CheckCircle2 />);
        setColor('bg-green-500/10 border-green-500/30 text-green-400');
      } else {
        setAction('Bloquear');
        setQuestion('¿Estás seguro de que quieres bloquear al usuario?');
        setIcon(<Ban />);
        setColor('bg-red-500/10 border-red-500/30 text-red-400');
      }
    }
  }, [user]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await axios.put(`/users/${user.id}/block`, {
        block: !user.is_bloked
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al bloquear/desbloquear usuario.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-darkest/80 backdrop-blur-sm p-4">
      <div className="bg-dark/80 border border-gray-green/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-green/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-medium-green" />
            Bloquear/Desbloquear Usuario
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-gray-300 mb-4">
            Usuario <span className="font-bold text-light-mint">@{user.username}</span>
          </p>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-300 italic">{question}</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-green/20 flex justify-end gap-3 bg-darkest/30 mt-auto">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            type="button" onClick={handleSubmit} disabled={loading}
            className={`btn-primary flex items-center gap-2 ${color}`}
          >
            {loading ? <span className="w-4 h-4 border-2 border-darkest border-t-transparent rounded-full animate-spin" /> : icon}
            {loading ? 'Guardando...' : action}
          </button>
        </div>
      </div>
    </div>
  );
}
