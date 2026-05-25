import { UserIcon } from "lucide-react";

export default function ItemRegister({ measure }) {
  return (
    <div key={measure.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-darkest/30 rounded-lg border border-gray-green/10 hover:border-light-mint/20 transition-colors gap-4">
      <div className="flex items-start sm:items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-dark flex items-center justify-center shrink-0">
          <UserIcon className="w-5 h-5 text-light-mint" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-medium truncate">{measure.watts} kW/h registrados</p>
          <div className="mt-1 space-y-1">
            <p className="text-xs sm:text-sm text-gray-400">
              Medidor: <span className="text-white">#{measure.Meter.number_meter}</span>
            </p>
            <p className="text-xs sm:text-sm text-gray-400 break-words">
              Propietario: <span className="text-white">{measure.Meter.User.first_name} {measure.Meter.User.last_name}</span> <span className="text-gray-500">@{measure.Meter.User.username}</span>
            </p>
            <p className="text-xs sm:text-sm text-gray-400 break-words">
              Por: <span className="text-light-mint">{measure.User.first_name} {measure.User.last_name}</span> <span className="text-gray-500">@{measure.User.username}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-green/10 pt-3 sm:pt-0 gap-2">
        <p className="text-[10px] sm:text-xs text-gray-400 bg-dark/50 px-2 py-1 rounded">
          {new Date(measure.createdAt).toLocaleDateString()}
        </p>
        <p className="text-[10px] sm:text-xs text-white font-bold bg-medium-green/20 px-2 py-1 rounded border border-medium-green/30">
          {new Date(measure.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}hrs
        </p>
      </div>
    </div>
  );
}