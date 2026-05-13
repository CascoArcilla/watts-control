import { MessageSquare, UserIcon } from "lucide-react";

export default function ItemRegister({ measure }) {
  return (
    <div key={measure.id} className="flex items-center justify-between p-4 bg-darkest/30 rounded-lg border border-gray-green/10 hover:border-light-mint/20 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-dark flex items-center justify-center shrink-0">
          <UserIcon className="w-5 h-5 text-light-mint" />
        </div>
        <div>
          <p className="text-white font-medium">{measure.watts} kW/h registrados</p>
          <p className="text-sm text-gray-400">
            Medidor: <span className="text-white">#{measure.Meter.number_meter}</span> |
            Propietario: <span className="text-white">{measure.Meter.User.first_name + " " + measure.Meter.User.last_name + ", "} @{measure.Meter.User.username}</span> |
            Registrado por: <span className="text-light-mint">{measure.User.first_name + " " + measure.User.last_name + ", "} @{measure.User.username}</span>
          </p>
          <p className="text-sm text-gray-400">
            Fecha: <span className="text-white">{new Date(measure.createdAt).toLocaleDateString()}</span> |
            Hora: <span className="text-white">{new Date(measure.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}hrs</span>
          </p>
        </div>
      </div>
    </div>
  );
}