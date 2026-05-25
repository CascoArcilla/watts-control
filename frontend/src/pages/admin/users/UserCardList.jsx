import { Edit, ShieldAlert, Eye, EyeOff, LockKeyhole, LockKeyholeOpen } from 'lucide-react';

export default function UserCardList({
  users,
  loading,
  groupBadge,
  onEdit,
  onEditGroups,
  onBlockUnblock
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {loading && [1, 2, 3].map(i => (
        <div key={i} className="glass-card h-32 animate-pulse" />
      ))}
      {!loading && users.length === 0 && (
        <p className="text-center py-10 text-gray-500 italic font-mono text-xs">
          No hay usuarios registrados.
        </p>
      )}
      {!loading && users.map(user => (
        <div key={user.id} className="glass-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-medium-green/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-light-mint uppercase">
                  {user.first_name?.[0] || '?'}
                </span>
              </div>
              <div>
                <p className="font-bold text-white text-base">
                  {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                </p>
                <p className="text-xs text-gray-500 font-mono">@{user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.is_bloked && <LockKeyhole className="w-4 h-4 text-red-500" />}
              {user.use_password ? <Eye className="w-4 h-4 text-light-mint" /> : <EyeOff className="w-4 h-4 text-gray-700" />}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {user.Groups?.length > 0
              ? user.Groups.map(g => groupBadge(g.name))
              : <span className="text-xs text-gray-600 italic">Sin grupos</span>
            }
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-green/10">
            <p className="text-[10px] text-gray-500 font-mono italic">ID #{user.id}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(user)}
                className="p-2 bg-darkest/40 text-light-mint rounded-lg border border-gray-green/10 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEditGroups(user)}
                className="p-2 bg-darkest/40 text-light-mint rounded-lg border border-gray-green/10 transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
              <button
                onClick={() => onBlockUnblock(user)}
                className={`p-2 bg-darkest/40 rounded-lg border border-gray-green/10 transition-colors ${user.is_bloked ? 'text-red-400' : 'text-light-mint'}`}
              >
                {user.is_bloked ? <LockKeyhole className="w-4 h-4" /> : <LockKeyholeOpen className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
