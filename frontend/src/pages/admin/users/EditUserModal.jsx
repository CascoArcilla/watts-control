import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, X, AlertCircle, User, AtSign, Lock, Save, CheckSquare, Square, Eye, EyeOff } from 'lucide-react';

export default function EditUserModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', change_username: false, username: '', change_password: false, password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUsername, setShowUsername] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        change_username: false,
        username: user.username || '',
        change_password: false,
        password: ''
      });
      setError('');
      setShowPassword(false);
      setShowUsername(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.first_name.trim()) return setError('El nombre es obligatorio.');

    if (form.change_username) {
      const usernameRegex = /^[A-Za-z][A-Za-z0-9_.-]{5,17}$/;
      if (!form.username.trim()) return setError('El nombre de usuario es obligatorio.');
      if (!usernameRegex.test(form.username)) return setError('Formato de nombre de usuario inválido.');
    }

    if (form.change_password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/gm;
      if (!form.password.trim()) return setError('La nueva contraseña es obligatoria.');
      if (!passwordRegex.test(form.password)) return setError('Formato de contraseña inválido.');
    }

    setLoading(true);
    try {
      await axios.patch(`/users/${user.id}`, {
        first_name: form.first_name,
        last_name: form.last_name,
        change_username: form.change_username,
        username: form.change_username ? form.username : undefined,
        change_password: form.change_password,
        password: form.change_password ? form.password : undefined
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar usuario.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-darkest/80 backdrop-blur-sm p-4">
      <div className="bg-dark/80 border border-gray-green/20 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-green/20">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <Edit className="w-5 h-5 text-light-mint" />
            Actualizar Usuario
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-4 sm:mb-6">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form id="editUserForm" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                  <User className="w-4 h-4 text-light-mint" />
                  Nombre <span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  name="first_name" type="text" className="input-field"
                  value={form.first_name} onChange={handleChange} required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                  <User className="w-4 h-4 text-gray-500" />
                  Apellido
                </label>
                <input
                  name="last_name" type="text" className="input-field"
                  value={form.last_name} onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-darkest/30 border border-gray-green/20">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, change_username: !prev.change_username }))}
                className="shrink-0 focus:outline-none"
              >
                {form.change_username
                  ? <CheckSquare className="w-5 h-5 text-light-mint" />
                  : <Square className="w-5 h-5 text-gray-500" />
                }
              </button>
              <div>
                <p className="text-sm font-medium text-gray-200">
                  Cambiar nombre de usuario <span className="text-gray-400 font-normal">(Actual: @{user?.username})</span>
                </p>
                <p className="text-xs text-gray-500">Activa esto si deseas establecer un nuevo nombre de usuario para el usuario.</p>
              </div>
            </div>

            {form.change_username && (
              <div className="space-y-1.5 animate-[fadeIn_0.2s_ease]">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                  <AtSign className="w-4 h-4 text-light-mint" />
                  Nuevo Nombre de usuario <span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  name="username" type="text" className="input-field"
                  value={form.username} onChange={handleChange} required
                />
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg bg-darkest/30 border border-gray-green/20">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, change_password: !prev.change_password, password: '' }))}
                className="shrink-0 focus:outline-none"
              >
                {form.change_password
                  ? <CheckSquare className="w-5 h-5 text-light-mint" />
                  : <Square className="w-5 h-5 text-gray-500" />
                }
              </button>
              <div>
                <p className="text-sm font-medium text-gray-200">Cambiar contraseña</p>
                <p className="text-xs text-gray-500">Activa esto si deseas establecer una nueva contraseña para el usuario.</p>
              </div>
            </div>

            {form.change_password && (
              <div className="space-y-1.5 animate-[fadeIn_0.2s_ease]">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                  <Lock className="w-4 h-4 text-light-mint" />
                  Nueva Contraseña <span className="text-red-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Mínimo 8 caracteres, especial, número, mayúscula"
                    value={form.password}
                    onChange={handleChange}
                    required={form.change_password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-light-mint transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-green/20 flex justify-end gap-3 bg-darkest/30 mt-auto">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            type="submit" form="editUserForm" disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <span className="w-4 h-4 border-2 border-darkest border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
