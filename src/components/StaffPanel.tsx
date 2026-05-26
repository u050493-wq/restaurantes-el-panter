/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Staff, Role, StaffStatus, StaffShift } from '../types';
import { Search, UserPlus, Phone, Calendar, DollarSign, ShieldAlert, Award, User, RefreshCcw, LogIn, LogOut, CheckSquare, Shield, Clipboard, Clock } from 'lucide-react';

interface StaffPanelProps {
  staff: Staff[];
  onAddStaff: (member: Staff) => void;
  onUpdateStaffStatus: (staffId: string, status: StaffStatus) => void;
  onUpdateStaffPermissions: (staffId: string, permissions: string[]) => void;
  shifts: StaffShift[];
  onRegisterShift: (shift: StaffShift) => void;
}

export default function StaffPanel({ 
  staff, 
  onAddStaff, 
  onUpdateStaffStatus,
  onUpdateStaffPermissions,
  shifts,
  onRegisterShift
}: StaffPanelProps) {
  const [activeTab, setActiveTab] = useState<'visualizar' | 'crear' | 'asistencias'>('visualizar');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Permissions preset checklist
  const allPermissionsPreset = [
    "Crear Comandas",
    "Preparar Alimentos",
    "Procesar Cobros",
    "Editar Platillos",
    "Administrar Personal",
    "Visualizar Reportes"
  ];

  // Selected employee for fine-grained permissions settings
  const [selectedStaffForPermissions, setSelectedStaffForPermissions] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('mesero');
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState<number>(8500);
  const [password, setPassword] = useState('1234');
  const [avatarIndex, setAvatarIndex] = useState(0);

  const mockAvatarUrls = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert("Por favor rellena el nombre y teléfono del empleado.");
      return;
    }

    const newMember: Staff = {
      id: `st-${Date.now()}`,
      name,
      role,
      status: 'disponible',
      avatar: mockAvatarUrls[avatarIndex % mockAvatarUrls.length],
      phone,
      salary: Number(salary),
      joinDate: new Date().toISOString().split('T')[0],
      password: password || '1234',
    };

    onAddStaff(newMember);

    // Reset Form
    setName('');
    setPhone('');
    setSalary(8500);
    setPassword('1234');
    setActiveTab('visualizar');
  };

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="staff_panel">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-800">Directorio de Personal (Staff)</h1>
          <p className="text-sm text-slate-500">Supervisión de turnos, nóminas, roles asignados y estados de guardia.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('visualizar')}
            className={`cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'visualizar' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Directorio de Personal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('asistencias')}
            className={`cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'asistencias' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ⏱ Control de Turnos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crear')}
            className={`cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'crear' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            + Integrar Nuevo
          </button>
        </div>
      </div>

      {activeTab === 'visualizar' ? (
        <div className="space-y-4 animate-fade-in">
          {/* Controls */}
          <div className="relative text-xs max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar personal por nombre o rol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden text-slate-750 font-medium"
            />
          </div>

          {/* Table / Grid list wrapper */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((member) => {
              // Calculate Check-In shift status
              const memberShifts = shifts.filter(s => s.staffId === member.id);
              const lastShift = memberShifts[memberShifts.length - 1];
              const isCheckedIn = lastShift ? lastShift.type === 'entrada' : false;

              // Current permissions list fallback
              const activePermissions = member.permissions || (
                member.role === 'administrador' ? allPermissionsPreset :
                member.role === 'chef' ? ["Preparar Alimentos", "Crear Comandas"] :
                member.role === 'mesero' ? ["Crear Comandas"] : []
              );

              const handleTogglePermission = (permission: string) => {
                let updatedList: string[];
                if (activePermissions.includes(permission)) {
                  updatedList = activePermissions.filter(p => p !== permission);
                } else {
                  updatedList = [...activePermissions, permission];
                }
                onUpdateStaffPermissions(member.id, updatedList);
              };

              const handleClockShift = (type: 'entrada' | 'salida') => {
                const newShift: StaffShift = {
                  id: `sh-${Date.now()}`,
                  staffId: member.id,
                  staffName: member.name,
                  role: member.role,
                  type,
                  timestamp: new Date().toISOString()
                };
                onRegisterShift(newShift);
              };

              return (
                <div
                  key={member.id}
                  className="bg-white p-5 rounded-xl border border-slate-105 shadow-3xs flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Shift Badge Indicator */}
                  <div className="absolute top-4 right-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                      isCheckedIn 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' 
                        : 'bg-slate-50 text-slate-450 border border-slate-150'
                    }`}>
                      <span className={`size-1.5 rounded-full mr-1 ${isCheckedIn ? 'bg-emerald-505 animate-pulse' : 'bg-slate-400'}`}></span>
                      <span>{isCheckedIn ? 'En Turno' : 'Fuera de Turno'}</span>
                    </span>
                  </div>

                  {/* Employee Info Header */}
                  <div className="flex items-start space-x-3">
                    <img
                      referrerPolicy="no-referrer"
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-100 flex-shrink-0"
                    />
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{member.name}</h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        member.role === 'chef' ? 'bg-red-50 text-red-700' :
                        member.role === 'mesero' ? 'bg-indigo-50 text-indigo-700' : 
                        member.role === 'administrador' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Direct info cards */}
                  <div className="space-y-1.5 text-xs leading-normal">
                    <div className="flex items-center text-slate-500">
                      <Phone className="w-3.5 h-3.5 mr-2 text-slate-350" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center text-slate-500">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-slate-350" />
                      <span>Alta contratada: <strong className="text-slate-600 font-semibold">{member.joinDate}</strong></span>
                    </div>
                    <div className="flex items-center text-slate-500">
                      <DollarSign className="w-3.5 h-3.5 mr-2 text-slate-350" />
                      <span>Sueldo Bruto: <strong className="text-slate-700 font-mono">${member.salary.toLocaleString()} MXN/mes</strong></span>
                    </div>
                    <div className="flex items-center text-slate-500 font-mono">
                      <Shield className="w-3.5 h-3.5 mr-2 text-slate-350" />
                      <span>PIN de Acceso: <strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">{member.password || '1234'}</strong></span>
                    </div>
                    {lastShift && (
                      <p className="text-[10px] text-slate-400 italic">
                        Último evento: {lastShift.type === 'entrada' ? 'Entrada' : 'Salida'} a las {new Date(lastShift.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>

                  {/* Interactive Clock-In / Clock-Out Shift Buttons */}
                  <div className="bg-slate-50/50 p-2.5 rounded-lg grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isCheckedIn}
                      onClick={() => handleClockShift('entrada')}
                      className="cursor-pointer py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center space-x-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>Checar Entrada</span>
                    </button>
                    <button
                      type="button"
                      disabled={!isCheckedIn}
                      onClick={() => handleClockShift('salida')}
                      className="cursor-pointer py-1.5 bg-slate-600 hover:bg-slate-750 text-white rounded-md text-[10px] font-bold flex items-center justify-center space-x-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Checar Salida</span>
                    </button>
                  </div>

                  {/* Permissions accordion drawer trigger */}
                  <div className="space-y-2 border-t border-slate-50 pt-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] uppercase text-slate-450 font-bold flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-slate-450" />
                        <span>Permisos de Acceso</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedStaffForPermissions(selectedStaffForPermissions === member.id ? null : member.id)}
                        className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        {selectedStaffForPermissions === member.id ? '✕ Ocultar' : '✎ Gestionar'}
                      </button>
                    </div>

                    {selectedStaffForPermissions === member.id ? (
                      <div className="bg-slate-50 p-2.5 rounded-lg space-y-1.5 animate-slide-down">
                        <p className="text-[9px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">Configuración Personalizada</p>
                        {allPermissionsPreset.map(perm => (
                          <label key={perm} className="flex items-center space-x-2 text-[10px] text-slate-605 cursor-pointer hover:text-slate-900 leading-normal">
                            <input
                              type="checkbox"
                              className="accent-emerald-600 text-[10px]"
                              checked={activePermissions.includes(perm)}
                              onChange={() => handleTogglePermission(perm)}
                            />
                            <span>{perm}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-450 truncate">
                        {activePermissions.join(', ') || 'Sin permisos otorgados'}
                      </p>
                    )}
                  </div>

                  {/* Status modifier bar */}
                  <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Estado Disponibilidad</span>
                    <div className="flex items-center">
                      <select
                        value={member.status}
                        onChange={(e) => onUpdateStaffStatus(member.id, e.target.value as StaffStatus)}
                        className={`text-[9px] font-bold py-1 px-2 focus:outline-hidden rounded-md cursor-pointer ${
                          member.status === 'disponible' ? 'bg-emerald-50 text-emerald-700' :
                          member.status === 'ocupado' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <option value="disponible">✓ Disponible</option>
                        <option value="ocupado">⚠ Ocupado</option>
                        <option value="inactivo">💤 Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'asistencias' ? (
        /* Real Shift history logs panel */
        <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                <span>Bitácora de Asistencias (Entradas y Salidas)</span>
              </h3>
              <p className="text-[11px] text-slate-450 mt-0.5">Control fiscal real de check-in / check-out del personal para auditoría de horas trabajadas.</p>
            </div>
            <span className="bg-slate-100 text-slate-650 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              Total Registros: {shifts.length}
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto pr-1">
            {shifts.length > 0 ? (
              <table className="w-full text-left text-xs text-slate-650 divide-y divide-slate-100">
                <thead className="bg-slate-50 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Empleado</th>
                    <th className="py-2.5 px-3">Puesto</th>
                    <th className="py-2.5 px-3">Evento</th>
                    <th className="py-2.5 px-3">Fecha y Hora Real</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {shifts.slice().reverse().map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <span className="text-slate-800 font-bold">{s.staffName}</span>
                      </td>
                      <td className="py-3 px-3 uppercase text-[9px] font-semibold text-slate-400">
                        {s.role}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          s.type === 'entrada' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.type === 'entrada' ? '📥 Check-In (Entrada)' : '📤 Check-Out (Salida)'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {new Date(s.timestamp).toLocaleDateString()} {new Date(s.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl">
                <Clock className="w-8 h-8 mx-auto text-slate-300 animate-pulse" />
                <p className="text-xs font-semibold uppercase text-slate-500">Sin Registros Generados</p>
                <p className="text-[11px] max-w-xs mx-auto">Cuando el personal registre su entrada o salida, desfilarán cronológicamente los logs en esta sección fiscal.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Form Creation Employee */
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs max-w-xl mx-auto">
          <h3 className="text-sm font-bold text-slate-705 mb-4 border-b border-slate-50 pb-2 flex items-center">
            <UserPlus className="w-4 h-4 text-emerald-600 mr-2" />
            <span>Contratar y Unirse Al Equipo Sabor</span>
          </h3>

          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-405 font-bold block">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Roberto Martínez..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-405 font-bold block">Celular / Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej. 55-9080-7060..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-405 font-bold block">Puesto / Rol Corporativo</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full p-2 bg-white border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden text-slate-700"
                >
                  <option value="mesero">Mesero (Sala)</option>
                  <option value="chef">Chef Ejecutivo o Cocinero (Cocina)</option>
                  <option value="administrador">Administrador / Cajero (Gerente)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-405 font-bold block">Nómina Mensual Pactada (MXN)</label>
                <input
                  type="number"
                  placeholder="12000"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full p-2 border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-405 font-bold block">PIN / Contraseña de Acceso (Ej. 1234)</label>
              <input
                type="text"
                placeholder="Ingresa el PIN numérico o contraseña de inicio..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden font-mono text-xs font-bold"
                required
              />
              <p className="text-[10px] text-slate-400">Este código será solicitado para el inicio de sesión y validación de transacciones en la tablet.</p>
            </div>

            {/* Custom Avatar generator selector */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-slate-450 font-bold block">Fotografía de Perfil (Asignar Avatar)</label>
              <div className="flex space-x-3 items-center">
                {mockAvatarUrls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarIndex(i)}
                    className={`cursor-pointer w-10 h-10 rounded-full overflow-hidden border-2 transition-transform ${
                      avatarIndex === i ? 'border-emerald-600 scale-110' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img referrerPolicy="no-referrer" src={url} alt="option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('visualizar')}
                className="cursor-pointer flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold border rounded-lg text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="cursor-pointer flex-1 py-2 bg-emerald-605 hover:bg-emerald-700 text-white font-bold rounded-lg text-center flex items-center justify-center space-x-1"
              >
                <span>Añadir Nuevo Empleado Contractual</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
