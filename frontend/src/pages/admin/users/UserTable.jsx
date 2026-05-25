import { Edit, ShieldAlert, Eye, EyeOff, LockKeyhole, LockKeyholeOpen } from 'lucide-react';

export default function UserTable({
  users,
  loading,
  groupBadge,
  onEdit,
  onEditGroups,
  onBlockUnblock
}) {
  return (
    <div className="glass-card overflow-hidden p-0 hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-green/20 bg-darkest/40">
              <th className="text-left px-6 py-4 text-gray-400 font-semibold">Usuario</th>
              <th className="text-left px-6 py-4 text-gray-400 font-semibold">Username</th>
              <th className="text-left px-6 py-4 text-gray-400 font-semibold">Grupos</th>
              <th className="text-center px-6 py-4 text-gray-400 font-semibold">Pass</th>
              <th className="text-right px-6 py-4 text-gray-400 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500 italic">Cargando...</td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500 italic">No hay usuarios.</td>
              </tr>
            )}
            {!loading && users.map((user, idx) => (
              <tr key={user.id} className={`border-b border-gray-green/10 hover:bg-dark/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-darkest/5'}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-medium-green/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-light-mint uppercase">{user.first_name?.[0] || '?'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white truncate max-w-[150px]">{[user.first_name, user.last_name].filter(Boolean).join(' ')}</p>
                      <p className="text-[10px] text-gray-500 font-mono">ID #{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">@{user.username}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.Groups?.length > 0 ? user.Groups.map(g => groupBadge(g.name)) : <span className="text-xs text-gray-600">Sin grupos</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {user.use_password ? <Eye className="w-4 h-4 text-light-mint mx-auto" /> : <EyeOff className="w-4 h-4 text-gray-700 mx-auto" />}
                </td>
                <td className="px-6 py-4 text-right space-x-1">
                  <button onClick={() => onEdit(user)} className="p-2 text-light-mint hover:bg-light-mint/10 rounded-lg inline-flex"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => onEditGroups(user)} className="p-2 text-light-mint hover:bg-light-mint/10 rounded-lg inline-flex"><ShieldAlert className="w-4 h-4" /></button>
                  {user.is_bloked ? (
                    <button onClick={() => onBlockUnblock(user)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors inline-flex"><LockKeyhole className="w-4 h-4" /></button>
                  ) : (
                    <button onClick={() => onBlockUnblock(user)} className="p-2 text-light-mint hover:bg-light-mint/10 rounded-lg transition-colors inline-flex"><LockKeyholeOpen className="w-4 h-4" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
