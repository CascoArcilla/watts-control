import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users, UserPlus, Shield, AlertCircle, RefreshCw
} from 'lucide-react';

import EditUserModal from './EditUserModal';
import EditGroupsModal from './EditGroupsModal';
import BlockUnblockUserModal from './BlockUnblockUserModal';

import UserTable from './UserTable';
import UserCardList from './UserCardList';
import UserPagination from './UserPagination';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-light-mint" />
            Usuarios
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">
            {pagination.total} usuario{pagination.total !== 1 ? 's' : ''} registrado{pagination.total !== 1 ? 's' : ''}.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            id="refresh_users"
            onClick={() => fetchUsers(pagination.page)}
            className="p-2 rounded-lg text-gray-400 hover:text-light-mint hover:bg-dark/50 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/admin/users/create" className="btn-primary flex items-center gap-2 text-sm flex-1 sm:flex-none justify-center">
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

      {/* Main Content */}
      <div className="space-y-4">
        <UserTable
          users={users}
          loading={loading}
          groupBadge={groupBadge}
          onEdit={setEditingUser}
          onEditGroups={setEditingGroupsUser}
          onBlockUnblock={setBlockUnblockUser}
        />

        <UserCardList
          users={users}
          loading={loading}
          groupBadge={groupBadge}
          onEdit={setEditingUser}
          onEditGroups={setEditingGroupsUser}
          onBlockUnblock={setBlockUnblockUser}
        />

        <UserPagination
          pagination={pagination}
          onPageChange={goToPage}
        />
      </div>

      {/* Modals */}
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
