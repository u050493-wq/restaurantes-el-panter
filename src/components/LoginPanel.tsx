/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Staff } from '../types';
import { 
  Key, 
  User, 
  Lock, 
  ShieldCheck, 
  HelpCircle,
  TrendingUp,
  X,
  Sparkles,
  ArrowRight,
  AlertCircle,
  QrCode
} from 'lucide-react';

interface LoginPanelProps {
  staff: Staff[];
  onLogin: (user: Staff) => void;
}

export default function LoginPanel({ staff, onLogin }: LoginPanelProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const selectedStaff = staff.find(s => s.id === selectedStaffId);

  const handleKeyTap = (num: string) => {
    setErrorMsg('');
    if (pinCode.length < 8) {
      setPinCode(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setErrorMsg('');
    setPinCode(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMsg('');
    setPinCode('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedStaffId) {
      setErrorMsg('Por favor, selecciona tu cuenta de staff arriba.');
      return;
    }
    if (!pinCode) {
      setErrorMsg('Por favor, ingresa tu PIN de acceso.');
      return;
    }

    const expectedPassword = selectedStaff?.password || '1234';
    if (pinCode === expectedPassword) {
      // Successful login
      onLogin(selectedStaff!);
    } else {
      setErrorMsg('PIN de acceso incorrecto. Inténtalo de nuevo.');
      setPinCode('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white" id="login_container">
      {/* Upper header */}
      <div className="text-center mb-6 space-y-1.5 animate-fade-in">
        <div className="size-14 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-900/40">
          <ShieldCheck className="w-8 h-8 text-neutral-900" />
        </div>
        <h1 className="text-2xl font-black font-display text-white tracking-tight pt-1">Sabor & Gestión POS</h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">Terminal inteligente de control para restaurantes y operaciones de mesa de alto nivel.</p>
      </div>

      <div className="w-full max-w-4xl bg-slate-850 hover:border-slate-800 transition-colors rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left column: Visual Employee Directory Selection */}
        <div className="p-6 sm:p-8 bg-slate-900/60 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Elegir cuenta de empleado</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Toca tu perfil de la lista para activar el ingreso electrónico.</p>
            </div>

            {/* List of active staff */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {staff.map((member) => {
                const isSelected = selectedStaffId === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setSelectedStaffId(member.id);
                      setErrorMsg('');
                      setPinCode('');
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center text-center space-y-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/5 scale-102'
                        : 'bg-slate-800/40 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <img
                      referrerPolicy="no-referrer"
                      src={member.avatar}
                      alt={member.name}
                      className={`w-12 h-12 rounded-full object-cover border transition-all ${
                        isSelected ? 'border-emerald-400 scale-105 shadow-sm' : 'border-slate-705'
                      }`}
                    />
                    <div className="w-full text-center">
                      <p className="text-xs font-bold truncate block">{member.name}</p>
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded mt-1.5 inline-block ${
                        member.role === 'mesero' 
                          ? 'bg-sky-500/10 text-sky-400' 
                          : member.role === 'chef'
                          ? 'bg-rose-500/10 text-rose-450'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {member.role === 'mesero' ? 'Mesero' : member.role === 'chef' ? 'Chef' : 'Admin'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 font-mono border-t border-slate-800 mt-4">
            <div className="bg-slate-800/30 border border-slate-800 p-3 rounded-xl text-[10px] text-slate-500 space-y-1.5">
              <p className="text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Pistas de Demostración</span>
              </p>
              <ul className="list-disc pl-3.5 space-y-1">
                <li>PIN General por defecto: <strong className="text-emerald-400">1234</strong></li>
                <li>Los meseros <strong className="text-slate-400 font-bold">solo</strong> pueden crear pedidos y cobrar mesas.</li>
                <li>Los administradores administran inventarios, nóminas y control total.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right column: PIN Pad input */}
        <div className="p-6 sm:p-8 flex flex-col justify-between bg-slate-850">
          <div className="space-y-4 text-center">
            <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center justify-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verificación de PIN</span>
            </h2>

            {/* Display Selected Employee or pending instruction */}
            <div className="p-3 bg-slate-900 rounded-2xl flex items-center justify-center min-h-[60px] border border-slate-800">
              {selectedStaff ? (
                <div className="flex items-center space-x-3 text-left">
                  <img
                    referrerPolicy="no-referrer"
                    src={selectedStaff.avatar}
                    alt={selectedStaff.name}
                    className="w-8 h-8 rounded-full border border-slate-700"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase">{selectedStaff.name}</h3>
                    <p className="text-[10px] text-slate-450">Puesto: {selectedStaff.role.toUpperCase()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic text-center">Toca tu tarjeta a la izquierda para iniciar...</p>
              )}
            </div>

            {/* Password Display */}
            <div className="relative max-w-[200px] mx-auto">
              <input
                type="password"
                readOnly
                placeholder="••••"
                value={pinCode}
                className="w-full text-center bg-slate-900 border border-slate-800 text-emerald-400 rounded-xl py-3 font-mono font-black tracking-[8px] text-xl focus:outline-hidden"
              />
              {pinCode.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 top-3 text-[9px] text-slate-500 hover:text-slate-350 underline uppercase cursor-pointer"
                >
                  Borrar
                </button>
              )}
            </div>

            {/* Error dialog alert widget */}
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 text-[11px] font-bold p-2.5 rounded-xl flex items-center justify-center space-x-2 animate-bounce">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* NUMERIC KEYPAD */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyTap(num)}
                  className="cursor-pointer h-12 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-95 text-white font-bold text-md font-mono transition-all border border-slate-750 flex items-center justify-center shadow-3xs"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleBackspace}
                className="cursor-pointer h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold text-xs transition-colors border border-slate-800 flex items-center justify-center"
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={() => handleKeyTap('0')}
                className="cursor-pointer h-12 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-95 text-white font-bold text-md font-mono transition-all border border-slate-755 flex items-center justify-center shadow-3xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="cursor-pointer h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-500 font-bold text-[10px] uppercase transition-colors border border-slate-800 flex items-center justify-center"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              disabled={!selectedStaffId || !pinCode}
              onClick={() => handleSubmit()}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-slate-900 font-bold text-xs rounded-xl transform transition-all shadow-md shadow-emerald-990 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <span>Ingresar Seguridades</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Client Quick Entry Banner */}
      <div className="w-full max-w-4xl mt-6 bg-linear-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg animate-fade-in" id="diner_portal_login">
        <div className="flex items-center space-x-3 text-left">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/25 text-emerald-400">
            <QrCode className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wide">¿Eres un Cliente en Mesa?</h3>
            <p className="text-slate-400 text-xs mt-0.5 leading-normal">
              Accede al portal interactivo de la carta digital de platillos. No necesitas contraseña ni PIN.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const virtualClient: Staff = {
              id: 'guest-client',
              name: 'Cliente de Mesa',
              role: 'cliente',
              status: 'disponible',
              avatar: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=120&q=80',
              phone: '000-000-0000',
              salary: 0,
              joinDate: new Date().toISOString()
            };
            onLogin(virtualClient);
          }}
          className="w-full sm:w-auto px-5 py-3 hover:scale-102 cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shrink-0"
        >
          <span>Acceder como Comensal (QR)</span>
          <ArrowRight className="w-4 h-4 text-slate-900" />
        </button>
      </div>

      {/* Sabor label */}
      <span className="text-[10px] text-slate-600 font-mono tracking-widest pt-6 uppercase select-none">
        Copyright © SGE v4.56 • Fusión Gastronómica Premium
      </span>
    </div>
  );
}
