/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Staff, Order, Dish } from '../types';
import { Flame, Check, Loader2, Sparkles, Send, Coffee, Clock } from 'lucide-react';

interface ChefPanelProps {
  staff: Staff[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status'], chefId?: string, chefName?: string) => void;
  dishes: Dish[];
}

export default function ChefPanel({ staff, orders, onUpdateOrderStatus, dishes }: ChefPanelProps) {
  const [selectedChefId, setSelectedChefId] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Tick current time for elapsed calculations
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const chefs = staff.filter(s => s.role === 'chef');

  // Filter orders that need cooking
  const activeKitchenOrders = orders.filter(o => 
    o.status === 'Recibido' || o.status === 'En Cocina'
  );

  // Helper to calculate elapsed time in minutes
  const getElapsedMins = (createdAtStr: string) => {
    const created = new Date(createdAtStr);
    const diffMs = currentTime.getTime() - created.getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const queryAI = async (customPrompt?: string) => {
    const promptToSend = customPrompt || aiPrompt;
    if (!promptToSend.trim()) return;

    setLoadingAi(true);
    setAiResponse('');
    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          contextType: 'chef',
          data: { menuItems: dishes }
        })
      });

      const data = await res.json();
      if (data.error) {
        setAiResponse(`❌ Error: ${data.error}`);
      } else {
        setAiResponse(data.text || "No se recibió respuesta.");
      }
    } catch (err) {
      console.error(err);
      setAiResponse("❌ Error de red al enlazar con el Chef AI.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setAiPrompt(text);
    queryAI(text);
  };

  return (
    <div className="space-y-6" id="chef_panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-800">Monitor de Cocina (Chefs)</h1>
          <p className="text-sm text-slate-500">Gestión de tiempos de preparación, comandas entrantes y recetas.</p>
        </div>

        {/* Chef Selection */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-600">Chef en Turno:</span>
          <select
            value={selectedChefId}
            onChange={(e) => setSelectedChefId(e.target.value)}
            className="bg-white border border-slate-250 p-1.5 focus:outline-hidden rounded-md text-slate-700 font-medium"
          >
            <option value="">-- Autenticar Chef --</option>
            {chefs.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Kitchen Monitoring Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-600 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700">Comandas en Línea de Fuego</h3>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm font-semibold">
              {activeKitchenOrders.length} comandas activas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeKitchenOrders.length > 0 ? (
              activeKitchenOrders.map((order) => {
                const elapsedMins = getElapsedMins(order.createdAt);
                
                // Color code alert level based on minutes taken
                let alertBg = "bg-white border-slate-100";
                let timerText = "text-slate-500";
                
                if (elapsedMins >= 10 && elapsedMins < 20) {
                  alertBg = "bg-amber-50/20 border-amber-200 shadow-xs";
                  timerText = "text-amber-600 font-bold";
                } else if (elapsedMins >= 20) {
                  alertBg = "bg-red-50/25 border-red-300 shadow-xs kitchen-pulse";
                  timerText = "text-red-600 font-bold animate-pulse";
                }

                return (
                  <div key={order.id} className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${alertBg}`}>
                    {/* Upper ticket data */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-800">Mesa {order.tableNumber}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            order.status === 'Recibido' ? 'bg-amber-50 text-indigo-700 border border-slate-200' : 'bg-orange-50 text-orange-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Mesero: {order.waiterName} • Ticket: <span className="font-mono font-semibold">{order.ticketNumber}</span>
                        </p>
                      </div>

                      {/* Display elapsed clock */}
                      <div className="flex items-center space-x-1">
                        <Clock className={`w-3.5 h-3.5 ${timerText}`} />
                        <span className={`text-xs font-mono ${timerText}`}>{elapsedMins} min</span>
                      </div>
                    </div>

                    {/* Order Lines */}
                    <div className="border-t border-slate-50 pt-3 flex-1 space-y-2">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="text-xs flex justify-between items-start group">
                          <p className="text-slate-700 font-medium">
                            <span className="font-mono font-bold text-slate-450 mr-2">{it.quantity}x</span>
                            <span>{it.dish.name}</span>
                            {it.notes && (
                              <span className="block text-[10px] text-amber-600 italic font-normal mt-0.5">
                                💬 {it.notes}
                              </span>
                            )}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 rounded-sm">
                            {it.dish.preparationTime} min
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action controls */}
                    <div className="pt-2">
                      {order.status === 'Recibido' ? (
                        <button
                          type="button"
                          onClick={() => {
                            const chefRecord = staff.find(s => s.id === selectedChefId);
                            onUpdateOrderStatus(
                              order.id, 
                              'En Cocina', 
                              selectedChefId || undefined, 
                              chefRecord?.name || undefined
                            );
                          }}
                          className="w-full py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Empezar Preparación (En Cocina)</span>
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 italic">
                            Preparando por Chef: <strong className="text-slate-600">{order.chefName || 'Chef'}</strong>
                          </p>
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, 'Listo para Servir')}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Completado - Mandar Servir (Listo!)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-20 bg-white border border-dashed border-slate-200 text-center rounded-xl space-y-3">
                <Coffee className="w-12 h-12 mx-auto text-slate-200" />
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Línea de Servicio Despejada</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">No hay comandas pendientes de cocina en este momento. ¡Excelente trabajo!</p>
              </div>
            )}
          </div>
        </div>

        {/* Gemini Chef Advisor Block */}
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-lg h-fit flex flex-col justify-between space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            <h3 className="text-sm font-bold text-orange-400 font-display">Sabor IA - Asistente de Cocina</h3>
          </div>

          {/* Quick Query selections */}
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 font-medium">Consultor de recetas y organización culinaria:</p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleSuggestionClick("Danos sugerencias para presentar de forma premium (emplatado) el Salmón Glaseado al Chipotle de nuestro menú.")}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-left"
              >
                🐟 Emplatado de Salmón al Chipotle
              </button>
              <button
                type="button"
                onClick={() => handleSuggestionClick("Propón un maridaje y copa perfecta para los Tacos de Rib Eye y el Volcán de Chocolate.")}
                className="text-[10px] bg-slate-800 hover:bg-slate-705 border border-slate-700/60 text-slate-300 py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-left"
              >
                🍷 Maridaje de Tacos & Volcán
              </button>
              <button
                type="button"
                onClick={() => handleSuggestionClick("¿Cuál sería una receta optimizada y rápida para el mole de nuestras Enchiladas Poblanas sin sacrificar el sabor artesanal?")}
                className="text-[10px] bg-slate-800 hover:bg-slate-705 border border-slate-700/60 text-slate-300 py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-left"
              >
                🌶️ Receta express de Mole Poblano
              </button>
            </div>
          </div>

          {/* Assistant Reply area */}
          <div className="bg-slate-950/50 rounded-lg p-3.5 border border-slate-800 overflow-y-auto max-h-56 text-xs leading-relaxed scrollbar-thin">
            {loadingAi ? (
              <div className="flex items-center space-x-2 text-slate-400 py-4 justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                <span>Analizando recetas de cocina premium...</span>
              </div>
            ) : aiResponse ? (
              <div className="space-y-2 text-slate-200">
                {aiResponse.split("\n").map((line, ix) => (
                  <p key={ix}>{line}</p>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center italic py-4">Utiliza una de las consultas de chef arriba o realiza una propia abajo para obtener respuestas moleculares, maridajes o técnicas de emplatado.</p>
            )}
          </div>

          {/* Form input */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Pregunta a Chef IA sobre sabor, recetas, gluten..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && queryAI()}
              className="flex-1 text-xs bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-200 focus:outline-hidden"
              disabled={loadingAi}
            />
            <button
              type="button"
              onClick={() => queryAI()}
              disabled={loadingAi || !aiPrompt.trim()}
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center font-bold"
            >
              <Send className="w-3.5 h-3.5 animate-pulse" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
