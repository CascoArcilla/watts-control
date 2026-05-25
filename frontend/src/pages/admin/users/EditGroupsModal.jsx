import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, X, AlertCircle, CheckSquare, Square, Save } from 'lucide-react';

export default function EditGroupsModal({ user, availableGroups, onClose, onSuccess }) {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedGroups(user.Groups ? user.Groups.map(g => g.id) : []);
      setError('');
    }
  }, [user]);

  const toggleGroup = (groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await axios.put(`/users/${user.id}/groups`, {
        groups: selectedGroups
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar grupos.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-darkest/80 backdrop-blur-sm p-4">
      <div className="bg-dark/80 border border-gray-green/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-green/20">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-medium-green" />
            Gestionar Grupos
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto">
          <p className="text-sm text-gray-300 mb-4">
            Grupos para el usuario <span className="font-bold text-light-mint">@{user.username}</span>
          </p>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            {availableGroups.length === 0 && (
              <p className="text-sm text-gray-500 italic">No hay grupos disponibles.</p>
            )}
            {availableGroups.map(group => {
              const checked = selectedGroups.includes(group.id);
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 text-left
                    ${checked
                      ? 'border-light-mint/50 bg-light-mint/10 text-light-mint'
                      : 'border-gray-green/20 bg-darkest/30 text-gray-300 hover:border-gray-green/40'
                    }`}
                >
                  {checked ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 shrink-0" />}
                  <span className="text-sm font-medium">{group.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-green/20 flex justify-end gap-3 bg-darkest/30 mt-auto">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            type="button" onClick={handleSubmit} disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <span className="w-4 h-4 border-2 border-darkest border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Guardando...' : 'Guardar Grupos'}
          </button>
        </div>
      </div>
    </div>
  );
}
