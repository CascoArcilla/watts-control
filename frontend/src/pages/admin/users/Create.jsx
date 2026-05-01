import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, User, AtSign, Lock, Eye, EyeOff, CheckSquare, Square, ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function CreateUser() {
  const navigate = useNavigate();
  const usernameRegex = /^[A-Za-z][A-Za-z0-9_.-]{5,17}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/gm;

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    use_password: true,
    groups: [],
  });

  const [availableGroups, setAvailableGroups] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get('/users/groups')
      .then(res => setAvailableGroups(res.data.groups))
      .catch(() => setError('No se pudieron cargar los grupos.'));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleGroup = (groupId) => {
    setForm(prev => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter(id => id !== groupId)
        : [...prev.groups, groupId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.first_name.trim()) {
      setError('El nombre (first_name) es obligatorio.');
      return;
    }
    if (!form.username.trim()) {
      setError('Nombre de usuario obligatorio.');
      return;
    }
    if (!usernameRegex.test(form.username)) {
      setError('Formato de nombre de usuario inválido.');
      return;
    }
    if (form.use_password && !form.password.trim()) {
      setError('La contraseña es obligatoria si "Usa contraseña" está activo.');
      return;
    }
    if (form.use_password && !passwordRegex.test(form.password)) {
      setError('Formato de contraseña inválido.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/users', {
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        password: form.use_password ? form.password : undefined,
        use_password: form.use_password,
        groups: form.groups,
      });
      setSuccess('Usuario creado exitosamente.');
      setForm({ first_name: '', last_name: '', username: '', password: '', use_password: false, groups: [] });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors"
          title="Volver al listado"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-light-mint" />
            Crear Usuario
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Completa los datos para registrar un nuevo usuario.</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-light-mint/10 border border-light-mint/30 text-light-mint rounded-xl px-4 py-3">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card space-y-6">

        {/* Names row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
              <User className="w-4 h-4 text-light-mint" />
              Nombre <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              className="input-field"
              placeholder="Ej. Juan"
              value={form.first_name}
              onChange={handleChange}
              required
            />
            <span className="text-xs text-gray-300">
              El nombre de usuario debe tener de 6 a 18 caracteres, empezar con una letra y contener solo letras, números, guion bajo, guion o puntos.
            </span>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
              <User className="w-4 h-4 text-gray-500" />
              Apellido
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              className="input-field"
              placeholder="Ej. Pérez"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
            <AtSign className="w-4 h-4 text-light-mint" />
            Nombre de usuario <span className="text-red-400 ml-0.5">*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            className="input-field"
            placeholder="Ej. jperez"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        {/* use_password toggle */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-darkest/30 border border-gray-green/20">
          <button
            id="use_password_toggle"
            type="button"
            onClick={() => setForm(prev => ({ ...prev, use_password: !prev.use_password, password: '' }))}
            className="shrink-0 focus:outline-none"
          >
            {form.use_password
              ? <CheckSquare className="w-5 h-5 text-light-mint" />
              : <Square className="w-5 h-5 text-gray-500" />
            }
          </button>
          <div>
            <p className="text-sm font-medium text-gray-200">Usa contraseña</p>
            <p className="text-xs text-gray-500">El usuario podrá iniciar sesión con usuario y contraseña.</p>
          </div>
        </div>

        {/* Password field — only if use_password is checked */}
        {form.use_password && (
          <div className="space-y-1.5 animate-[fadeIn_0.2s_ease]">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
              <Lock className="w-4 h-4 text-light-mint" />
              Contraseña <span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-light-mint transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-xs text-gray-300">
              Mínimo 8 caracteres, máximo 16 caracteres,
              debe comenzar con una letra,
              debe contener al menos una letra mayúscula,
              debe contener al menos una letra minúscula,
              debe contener al menos un número,
              debe contener caracteres especiales (@ $ ! % * ? &)
            </span>
          </div>
        )}

        {/* Groups checklist */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-300">Grupos</p>
          <p className="text-xs text-gray-500 -mt-1">Selecciona los grupos a los que pertenece el usuario.</p>
          <div className="space-y-2 mt-2">
            {availableGroups.length === 0 && (
              <p className="text-sm text-gray-500 italic">Cargando grupos...</p>
            )}
            {availableGroups.map(group => {
              const checked = form.groups.includes(group.id);
              return (
                <button
                  key={group.id}
                  id={`group_${group.id}`}
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 text-left
                    ${checked
                      ? 'border-light-mint/50 bg-light-mint/10 text-light-mint'
                      : 'border-gray-green/20 bg-darkest/30 text-gray-300 hover:border-gray-green/40'
                    }`}
                >
                  {checked
                    ? <CheckSquare className="w-4 h-4 shrink-0" />
                    : <Square className="w-4 h-4 shrink-0" />
                  }
                  <span className="text-sm font-medium">{group.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="btn-secondary px-6"
          >
            Cancelar
          </button>
          <button
            id="submit_create_user"
            type="submit"
            disabled={loading}
            className="btn-primary px-6 flex items-center gap-2"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-darkest border-t-transparent rounded-full animate-spin" />
              : <UserPlus className="w-4 h-4" />
            }
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}
