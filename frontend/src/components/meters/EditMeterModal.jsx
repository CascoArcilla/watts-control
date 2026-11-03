import { useState, useEffect, useRef } from 'react';
import { Save, Search, User, AlertCircle, X, Zap } from 'lucide-react';
import axios from 'axios';

export default function EditMeterModal({ isOpen, onClose, onSave, meter, loading }) {
  // Hooks called unconditionally at the top
  const [number, setNumber] = useState(meter?.number_meter || '');
  const [status, setStatus] = useState(meter?.status_meter || 'active');
  const [changeOwner, setChangeOwner] = useState(false);
  const [owner, setOwner] = useState(meter?.User || null); // Selected owner: { id, first_name, last_name, username }
  const [search, setSearch] = useState('');
  const [owners, setOwners] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');

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

  // Handle owner search input change and trigger debounced fetch
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setOwner(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!val.trim()) {
      setOwners([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axios.get(`/meters/owners?search=${encodeURIComponent(val)}`);
        setOwners(res.data.owners);
        setShowDropdown(true);
      } catch {
        setOwners([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const selectOwner = (user) => {
    setOwner(user);
    setSearch(`${user.first_name} ${user.last_name || ''}`.trim());
    setShowDropdown(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!number || isNaN(number) || parseInt(number) <= 0) {
      setError('El número de medidor debe ser un número positivo.');
      return;
    }

    // Prepare update payload
    const payload = {
      number_meter: parseInt(number),
      status_meter: status,
    };

    // If changeOwner is checked, we send the new owner's id (or null if cleared).
    // Otherwise, we send the original owner's ID.
    if (changeOwner) {
      payload.userId = owner ? owner.id : null;
    } else {
      payload.userId = meter?.userId;
    }

    onSave(payload);
  };

  const fullName = (u) => [u.first_name, u.last_name].filter(Boolean).join(' ');

  // Early return if not open
  if (!isOpen || !meter) return null;

  return (
    <div className="fixed inset-0 bg-darkest/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-dark border border-gray-green/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 overflow-visible relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-green/20 pb-3">
          <div className="p-2 bg-light-mint/10 rounded-lg border border-light-mint/20 text-light-mint">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Editar Medidor</h2>
            <p className="text-gray-400 text-xs mt-0.5">Modifica los detalles del medidor seleccionado.</p>
          </div>
        </div>

        {/* Local Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-2.5 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Número de Medidor */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Número de Medidor <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="input-field"
              placeholder="Ej. 100456"
              min="1"
              required
            />
          </div>

          {/* Estatus */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Estatus del Medidor
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          {/* Propietario actual (Bloqueado) */}
          <div className="space-y-3 pt-2 border-t border-gray-green/10">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">
                Propietario Actual
              </label>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-darkest/40 border border-gray-green/15 rounded-lg text-gray-400 select-none">
                <User className="w-4 h-4 shrink-0 text-gray-500" />
                <span className="text-sm font-medium">
                  {meter.User ? `${fullName(meter.User)} (@${meter.User.username})` : 'Sin propietario asignado'}
                </span>
              </div>
            </div>

            {/* Checkbox to allow changing owner */}
            <div className="flex items-center">
              <label className="flex items-center gap-2.5 text-sm text-gray-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={changeOwner}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setChangeOwner(checked);
                    if (!checked) {
                      setOwner(meter.User || null);
                      setSearch('');
                    } else {
                      setOwner(null);
                      setSearch('');
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-green/30 text-light-mint focus:ring-light-mint/50 focus:ring-offset-0 bg-darkest"
                />
                <span>{meter.User ? 'Cambiar propietario' : 'Asignar propietario'}</span>
              </label>
            </div>

            {/* Search field - only shown if changeOwner is checked */}
            {changeOwner && (
              <div className="space-y-1.5 relative" ref={searchRef}>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Buscar Nuevo Propietario
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    onFocus={() => { if (owners.length > 0) setShowDropdown(true); }}
                    className="input-field !pl-9"
                    placeholder="Buscar por nombre o usuario..."
                    autoComplete="off"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-light-mint border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* Search dropdown */}
                {showDropdown && (
                  <div className="absolute z-50 mt-1 w-full bg-darkest border border-gray-green/30 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                    {owners.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-gray-400 text-center">Sin resultados</p>
                    ) : (
                      owners.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => selectOwner(u)}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-dark/50 transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-full bg-medium-green/20 flex items-center justify-center shrink-0">
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

                {/* Selected badge */}
                {owner && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-light-mint/10 border border-light-mint/30 rounded-lg mt-2">
                    <User className="w-4 h-4 text-light-mint shrink-0" />
                    <span className="text-sm text-light-mint font-medium">{fullName(owner)}</span>
                    <span className="text-xs text-gray-400 ml-1">@{owner.username}</span>
                    <button
                      type="button"
                      onClick={() => { setOwner(null); setSearch(''); }}
                      className="ml-auto text-gray-500 hover:text-red-400 transition-colors text-sm font-bold"
                    >✕</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-gray-green/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-darkest border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
