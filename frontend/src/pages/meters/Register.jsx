import { useState, useEffect, useRef } from 'react';
import { Save, ArrowLeft, Zap, Search, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterMeter() {
  const navigate = useNavigate();

  const [number, setNumber]   = useState('');
  // { id, first_name, last_name, username }
  const [owner, setOwner]     = useState(null);
  const [search, setSearch]   = useState('');
  const [owners, setOwners]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced owner search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Don't search if the search text matches the selected owner's name
    const currentOwnerName = owner ? `${owner.first_name} ${owner.last_name || ''}`.trim() : '';
    if (owner && search === currentOwnerName) {
      setShowDropdown(false);
      return;
    }

    if (!search.trim()) {
      setOwners([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axios.get(`/meters/owners?search=${encodeURIComponent(search)}`);
        setOwners(res.data.owners);
        setShowDropdown(true);
      } catch {
        setOwners([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [search, owner]);

  const selectOwner = (user) => {
    setOwner(user);
    setSearch(`${user.first_name} ${user.last_name || ''}`.trim());
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!number || isNaN(number) || parseInt(number) <= 0) {
      setError('El número de medidor debe ser un número positivo.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/meters', {
        number_meter: parseInt(number),
        userId: owner?.id || null,
        status_meter: 'active',
      });
      setSuccess('Medidor registrado exitosamente.');
      setNumber('');
      setOwner(null);
      setSearch('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el medidor.');
    } finally {
      setLoading(false);
    }
  };

  const fullName = (u) => [u.first_name, u.last_name].filter(Boolean).join(' ');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/meters" className="p-2 bg-dark rounded-lg hover:bg-gray-green/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 md:w-6 md:h-6 text-light-mint" />
            Registrar Nuevo Medidor
          </h1>
          <p className="text-gray-400 text-sm mt-1">Añade un nuevo medidor al sistema.</p>
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

      <div className="glass-card">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">

          {/* Número de medidor */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Número de Medidor <span className="text-red-400">*</span>
            </label>
            <input
              id="number_meter"
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="input-field"
              placeholder="Ej. 100456"
              min="1"
              required
            />
            <p className="text-xs text-gray-500">Debe ser único en el sistema.</p>
          </div>

          {/* Propietario con búsqueda */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Propietario
              <span className="text-gray-500 font-normal ml-1">(Grupo: Propietario)</span>
            </label>

            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="owner_search"
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setOwner(null); }}
                  onFocus={() => { if (owners.length > 0) setShowDropdown(true); }}
                  className="input-field !pl-9"
                  placeholder="Buscar por nombre o usuario..."
                  autoComplete="off"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-light-mint border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-dark border border-gray-green/30 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                  {owners.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500 text-center">Sin resultados</p>
                  ) : (
                    owners.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => selectOwner(u)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-darkest/60 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-medium-green/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-light-mint uppercase">
                            {u.first_name?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{fullName(u)}</p>
                          <p className="text-xs text-gray-500">@{u.username}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected owner badge */}
            {owner && (
              <div className="flex items-center gap-2 px-3 py-2 bg-light-mint/10 border border-light-mint/30 rounded-lg mt-2">
                <User className="w-4 h-4 text-light-mint shrink-0" />
                <span className="text-sm text-light-mint font-medium">{fullName(owner)}</span>
                <span className="text-xs text-gray-400 ml-1">@{owner.username}</span>
                <button
                  type="button"
                  onClick={() => { setOwner(null); setSearch(''); }}
                  className="ml-auto text-gray-500 hover:text-red-400 transition-colors text-xs"
                >✕</button>
              </div>
            )}

            {!owner && (
              <p className="text-xs text-gray-500">Opcional — solo aparecen usuarios del grupo Propietario.</p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-green/20 flex justify-end gap-3">
            <Link to="/meters" className="btn-secondary">Cancelar</Link>
            <button
              id="submit_register_meter"
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-darkest border-t-transparent rounded-full animate-spin" />
                : <Save className="w-4 h-4" />
              }
              {loading ? 'Guardando...' : 'Guardar Medidor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
