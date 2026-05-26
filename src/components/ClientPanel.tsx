/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Client } from '../types';
import { Search, UserPlus, Phone, Mail, Award, Plus, MessageSquare } from 'lucide-react';

interface ClientPanelProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
}

export default function ClientPanel({ clients, onAddClient }: ClientPanelProps) {
  const [activeTab, setActiveTab] = useState<'visualizar' | 'crear'>('visualizar');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClient: Client = {
      id: `c-${Date.now()}`,
      name,
      phone: phone || 'Sin teléfono',
      email: email || 'Sin correo',
      visits: 1, // first sign-in
      loyaltyPoints: 10, // complementary signup credits
      notes: notes || undefined,
      lastVisit: new Date().toISOString().split('T')[0],
    };

    onAddClient(newClient);

    // Reset Form
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setActiveTab('visualizar');
  };

  const getLoyaltyBadge = (points: number) => {
    if (points >= 300) {
      return { label: 'VIP Oro', style: 'bg-amber-100 text-amber-850 border border-amber-200' };
    } else if (points >= 100) {
      return { label: 'Socio Plata', style: 'bg-slate-100 text-slate-800 border border-slate-300' };
    }
    return { label: 'Frecuente Bronce', style: 'bg-amber-50 text-amber-900 border border-slate-200' };
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6" id="client_panel">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-800">Cartera de Clientes Sabor (CRM)</h1>
          <p className="text-sm text-slate-500">Historial de visitas frecuentes, acumulación de puntos de lealtad y preferencias.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('visualizar')}
            className={`cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'visualizar' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Directorio Diners
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crear')}
            className={`cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'crear' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            + Regitrar Cliente
          </button>
        </div>
      </div>

      {activeTab === 'visualizar' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative text-xs max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo electrónico o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden"
            />
          </div>

          {/* CRM Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const badge = getLoyaltyBadge(client.loyaltyPoints);
              return (
                <div
                  key={client.id}
                  className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between space-y-4 shadow-3xs hover:border-slate-200 transition-colors"
                >
                  {/* Client title information */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{client.name}</h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge.style}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <span>Visitas totales: <strong className="text-slate-650 font-bold">{client.visits}</strong></span>
                      <span>•</span>
                      <span>Loyalty Pts: <strong className="text-emerald-700 font-mono font-bold">{client.loyaltyPoints}</strong></span>
                    </div>
                  </div>

                  {/* General Contact lists */}
                  <div className="space-y-1 text-xs leading-normal">
                    <div className="flex items-center text-slate-500">
                      <Phone className="w-3.5 h-3.5 mr-2 text-slate-350" />
                      <span className="font-mono">{client.phone}</span>
                    </div>
                    <div className="flex items-center text-slate-500">
                      <Mail className="w-3.5 h-3.5 mr-2 text-slate-350" />
                      <span className="truncate max-w-[180px]">{client.email}</span>
                    </div>
                  </div>

                  {/* Guest comments notes */}
                  {client.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start space-x-1.5 text-[11px] line-clamp-3 leading-relaxed text-slate-500">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="italic">"{client.notes}"</p>
                    </div>
                  )}

                  <div className="border-t border-slate-50 pt-2 text-[10px] text-slate-400 font-medium">
                    Última visita registrada: <span className="font-mono">{client.lastVisit || 'Sin historial'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Form creation regulars */
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs max-w-xl mx-auto">
          <h3 className="text-sm font-bold text-slate-705 mb-4 border-b border-slate-50 pb-2 flex items-center">
            <UserPlus className="w-4 h-4 text-emerald-600 mr-2" />
            <span>Regitrar Socio Comensal de Sabor</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-405 font-bold block">Nombre Completo del Cliente</label>
              <input
                type="text"
                placeholder="Ej. Francisco Javier Mendoza..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-405 font-bold block">Celular / Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej. 55-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-405 font-bold block">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="Ej. fjavier@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-405 font-bold block">Preferencia Alimentaria o de Mesa (Comentarios del CRM)</label>
              <textarea
                rows={3}
                placeholder="Ej. Prefiere ubicarse en terraza, es alérgico a los mariscos u ostiones, ordena margaritas..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden"
              />
            </div>

            <div className="flex space-x-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('visualizar')}
                className="cursor-pointer flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold border rounded-lg text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="cursor-pointer flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-center flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Cliente VIP</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
