import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users, UserPlus, ChevronLeft, ChevronRight,
  Shield, Eye, EyeOff, AlertCircle, RefreshCw,
  Edit, ShieldAlert, UserX, LockKeyhole, LockKeyholeOpen
} from 'lucide-react';
import EditUserModal from './EditUserModal';
import EditGroupsModal from './EditGroupsModal';
import BlockUnblockUserModal from './BlockUnblockUserModal';

const GROUP_COLORS = {
  'Administrador': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'Lector': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Propietario': 'bg-light-mint/15 text-light-mint border-light-mint/30',
};

const groupBadge = (name) => {
  const cls = GROUP_COLORS[name] || 'bg-gray-500/15 text-gray-300 border-gray-500/30';
  return (
    <span key={name} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      <Shield className="w-3 h-3" />
      {name}
    </span>
  );
};

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [availableGroups, setAvailableGroups] = useState([]);

  // Modals state
  const [editingUser, setEditingUser] = useState(null);
  const [editingGroupsUser, setEditingGroupsUser] = useState(null);
  const [blockUnblockUser, setBlockUnblockUser] = useState(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/users?page=${page}&limit=${pagination.limit}`);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch {
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchUsers(1);
    axios.get('/users/groups')
      .then(res => setAvailableGroups(res.data.groups))
      .catch(() => console.error('No se pudieron cargar los grupos.'));
  }, [fetchUsers]);

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchUsers(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-light-mint" />
            Usuarios
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {pagination.total} usuario{pagination.total !== 1 ? 's' : ''} registrado{pagination.total !== 1 ? 's' : ''} en el sistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="refresh_users"
            onClick={() => fetchUsers(pagination.page)}
            className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/admin/users/create" className="btn-primary flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4" />
            Crear Usuario
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-green/20 bg-darkest/40">
                <th className="text-left px-6 py-4 text-gray-400 font-semibold">Usuario</th>
                <th className="text-left px-6 py-4 text-gray-400 font-semibold">Username</th>
                <th className="text-left px-6 py-4 text-gray-400 font-semibold">Grupos</th>
                <th className="text-center px-6 py-4 text-gray-400 font-semibold">Contraseña</th>
                <th className="text-right px-6 py-4 text-gray-400 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <div className="w-8 h-8 border-2 border-light-mint border-t-transparent rounded-full animate-spin" />
                      <span>Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
              {!loading && users.map((user, idx) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-green/10 hover:bg-dark/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-darkest/10'}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-medium-green/30 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-light-mint uppercase">
                          {user.first_name?.[0] || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                        </p>
                        <p className="text-xs text-gray-500">ID #{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 font-mono text-xs">@{user.username}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {user.Groups?.length > 0
                        ? user.Groups.map(g => groupBadge(g.name))
                        : <span className="text-xs text-gray-600 italic">Sin grupos</span>
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.use_password
                      ? <Eye className="w-4 h-4 text-light-mint mx-auto" title="Usa contraseña" />
                      : <EyeOff className="w-4 h-4 text-gray-600 mx-auto" title="Sin contraseña" />
                    }
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 bg-dark/50 hover:bg-light-mint hover:text-darkest text-light-mint rounded-lg transition-colors inline-flex"
                      title="Editar Usuario"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingGroupsUser(user)}
                      className="p-2 bg-dark/50 hover:bg-light-mint hover:text-darkest text-light-mint rounded-lg transition-colors inline-flex"
                      title="Gestionar Grupos"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                    {user.is_bloked ? (
                      <button
                        onClick={() => setBlockUnblockUser(user)}
                        className="p-2 bg-dark/50 hover:bg-red-500/15 hover:text-red-500 text-red-500 rounded-lg transition-colors inline-flex"
                        title="Desbloquear Usuario"
                      >
                        <LockKeyhole className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setBlockUnblockUser(user)}
                        className="p-2 bg-dark/50 hover:bg-light-mint hover:text-darkest text-light-mint rounded-lg transition-colors inline-flex"
                        title="Bloquear Usuario"
                      >
                        <LockKeyholeOpen className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-green/20">
            <p className="text-sm text-gray-500">
              Página {pagination.page} de {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                id="prev_page"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - pagination.page) <= 2)
                .map(p => (
                  <button
                    key={p}
                    id={`page_${p}`}
                    onClick={() => goToPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === pagination.page
                        ? 'bg-light-mint text-darkest'
                        : 'text-gray-400 hover:bg-dark/50 hover:text-light-mint'
                    }`}
                  >
                    {p}
                  </button>
                ))
              }

              <button
                id="next_page"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={() => fetchUsers(pagination.page)}
      />

      <EditGroupsModal
        user={editingGroupsUser}
        availableGroups={availableGroups}
        onClose={() => setEditingGroupsUser(null)}
        onSuccess={() => fetchUsers(pagination.page)}
      />

      <BlockUnblockUserModal
        user={blockUnblockUser}
        onClose={() => setBlockUnblockUser(null)}
        onSuccess={() => fetchUsers(pagination.page)}
      />
    </div>
  );
}
