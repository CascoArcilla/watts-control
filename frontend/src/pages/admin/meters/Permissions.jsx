import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Shield, Search, UserPlus, UserMinus, AlertCircle,
  CheckCircle, ArrowLeft, Zap, RefreshCw
} from 'lucide-react';

export default function MeterPermissions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meter, setMeter] = useState(null);
  const [authorized, setAuthorized] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Load meter + current authorized list
  const fetchMeter = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/meters/${id}/authorized`);
      setMeter(res.data.meter);
      setAuthorized(res.data.authorized);
    } catch {
      setError('No se pudo cargar la información del medidor.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchMeter(); }, [fetchMeter]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced candidate search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search.trim()) { setCandidates([]); setShowDropdown(false); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axios.get(`/meters/candidates?search=${encodeURIComponent(search)}`);
        // Filter out already-authorized users
        const authorizedIds = new Set(authorized.map(u => u.id));
        setCandidates(res.data.candidates.filter(u => !authorizedIds.has(u.id)));
        setShowDropdown(true);
      } catch {
        setCandidates([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [search, authorized]);

  const addUser = (user) => {
    setAuthorized(prev => [...prev, user]);
    setSearch('');
    setCandidates([]);
    setShowDropdown(false);
  };

  const removeUser = (userId) => {
    setAuthorized(prev => prev.filter(u => u.id !== userId));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await axios.put(`/meters/${id}/authorized`, {
        userIds: authorized.map(u => u.id),
      });
      setSuccess('Permisos guardados exitosamente.');
    } catch {
      setError('Error al guardar los permisos.');
    } finally {
      setSaving(false);
    }
  };

  const fullName = (u) => [u.first_name, u.last_name].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-light-mint border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/meters')}
          className="p-2 bg-dark rounded-lg hover:bg-gray-green/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-light-mint" />
            Permisos del Medidor
          </h1>
          {meter && (
            <p className="text-gray-400 text-xs md:text-sm mt-0.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-light-mint" />
                Medidor #{meter.number_meter}
              </span>
              {meter.User && <span className="text-gray-500 hidden sm:inline">—</span>}
              {meter.User && <span className="text-gray-500 italic sm:not-italic">Propietario: {fullName(meter.User)}</span>}
            </p>
          )}
        </div>
        <button
          onClick={fetchMeter}
          className="ml-auto p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors"
          title="Actualizar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
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

      {/* Card */}
      <div className="glass-card space-y-6">
        <div>
          <h2 className="text-base font-semibold text-white mb-1">Usuarios Autorizados</h2>
          <p className="text-xs text-gray-500">Lectores y Propietarios que pueden registrar consumos en este medidor.</p>
        </div>

        {/* Search candidates */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">Agregar usuario</label>
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="candidate_search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => { if (candidates.length > 0) setShowDropdown(true); }}
                className="input-field !pl-9"
                placeholder="Buscar Lector o Propietario..."
                autoComplete="off"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-light-mint border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {showDropdown && (
              <div className="absolute z-50 mt-1 w-full bg-dark border border-gray-green/30 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                {candidates.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-500 text-center">Sin resultados</p>
                ) : (
                  candidates.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => addUser(u)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-darkest/60 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-medium-green/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-light-mint uppercase">{u.first_name?.[0] || '?'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{fullName(u)}</p>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                      <UserPlus className="w-4 h-4 text-light-mint ml-auto" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Authorized list */}
        <div className="space-y-2">
          {authorized.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4 italic">Ningún usuario autorizado aún.</p>
          )}
          {authorized.map(u => (
            <div
              key={u.id}
              className="flex items-center gap-3 px-4 py-3 bg-darkest/30 border border-gray-green/20 rounded-xl group hover:border-red-500/20 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-medium-green/30 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-light-mint uppercase">{u.first_name?.[0] || '?'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{fullName(u)}</p>
                <p className="text-xs text-gray-500">@{u.username}</p>
              </div>
              <button
                type="button"
                onClick={() => removeUser(u.id)}
                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                title="Quitar acceso"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="flex justify-end pt-2 border-t border-gray-green/20">
          <button
            id="save_permissions"
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-darkest border-t-transparent rounded-full animate-spin" />
              : <Shield className="w-4 h-4" />
            }
            {saving ? 'Guardando...' : 'Guardar Permisos'}
          </button>
        </div>
      </div>
    </div>
  );
}
