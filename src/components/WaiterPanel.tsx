/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Staff, Dish, Client, Order, OrderItem, Sale, WaiterCall } from '../types';
import { Plus, Search, ShoppingCart, User, Users, Coffee, Trash2, Utensils, Clipboard, AlertCircle, CreditCard, Wallet, QrCode, Phone, ArrowRight, CheckCircle, Printer, X, Bell, Clock, ShieldAlert } from 'lucide-react';

interface WaiterPanelProps {
  staff: Staff[];
  dishes: Dish[];
  clients: Client[];
  orders: Order[];
  onCreateOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onProcessPayment: (orderId: string, paymentMethod: Sale['paymentMethod'], finalTotal: number, tipAmount?: number) => void;
  activeCalls: WaiterCall[];
  onResolveCall: (callId: string) => void;
  currentUser?: Staff;
  sales: Sale[];
  withdrawnTips: Record<string, number>;
  onCollectTips: (waiterName: string) => void;
}

export default function WaiterPanel({ 
  staff, 
  dishes, 
  clients, 
  orders, 
  onCreateOrder, 
  onUpdateOrderStatus,
  onProcessPayment,
  activeCalls,
  onResolveCall,
  currentUser,
  sales,
  withdrawnTips,
  onCollectTips
}: WaiterPanelProps) {
  const [activeTab, setActiveTab] = useState<'visualizar' | 'crear'>('visualizar');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedWaiter, setSelectedWaiter] = useState<string>(() => {
    if (currentUser && currentUser.role === 'mesero') {
      return currentUser.id;
    }
    return '';
  });
  const [selectedClient, setSelectedClient] = useState<string>('c-general');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [searchDishQuery, setSearchDishQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todo' | Dish['category']>('Todo');

  // Inline table-side billing states
  const [isDirectBilling, setIsDirectBilling] = useState<boolean>(false);
  const [billingTipPercent, setBillingTipPercent] = useState<number>(10);
  const [billingSplitPercent, setBillingSplitPercent] = useState<number>(1);
  const [billingPaymentMethod, setBillingPaymentMethod] = useState<Sale['paymentMethod']>('Tarjeta');
  const [billingCashReceived, setBillingCashReceived] = useState<string>('');
  const [showDirectReceipt, setShowDirectReceipt] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<Order | null>(null);
  const [receiptFinalTotal, setReceiptFinalTotal] = useState<number>(0);
  const [mobilePaymentSimulatorStep, setMobilePaymentSimulatorStep] = useState<'qr_scan' | 'paid' | null>(null);

  // Selected waiter's tips statistics
  const currentSelectedWaiterRecord = staff.find(s => s.id === selectedWaiter);
  const targetWaiterName = currentSelectedWaiterRecord?.name || '';
  
  const waiterTipsEarned = sales
    .filter(s => s.waiterId === selectedWaiter || s.waiterName === targetWaiterName)
    .reduce((sum, s) => sum + (s.tip || 0), 0);
    
  const waiterTipsWithdrawn = withdrawnTips[targetWaiterName] || 0;
  const waiterTipsAvailable = Math.max(0, waiterTipsEarned - waiterTipsWithdrawn);

  // Filter available waiters
  const waiters = staff.filter(s => s.role === 'mesero');

  // Interactive Tables layout (1 to 12)
  const totalTables = 12;
  const activeTablesMap = orders
    .filter(o => o.status !== 'Cobrado')
    .reduce((map, o) => {
      map[o.tableNumber] = o;
      return map;
    }, {} as Record<number, Order>);

  // Cart operations
  const addToCart = (dish: Dish) => {
    const existingIndex = cart.findIndex(item => item.dish.id === dish.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { dish, quantity: 1, notes: '' }]);
    }
  };

  const updateItemNotes = (dishId: string, notes: string) => {
    setCart(cart.map(item => item.dish.id === dishId ? { ...item, notes } : item));
  };

  const updateItemQty = (dishId: string, change: number) => {
    const updated = cart.map(item => {
      if (item.dish.id === dishId) {
        const newQty = item.quantity + change;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as OrderItem[];
    setCart(updated);
  };

  const removeFromCart = (dishId: string) => {
    setCart(cart.filter(item => item.dish.id !== dishId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  // Submit Comanda
  const handleSubmitComanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) {
      alert("Por favor selecciona un número de mesa.");
      return;
    }
    if (!selectedWaiter) {
      alert("Por favor selecciona el mesero a cargo.");
      return;
    }
    if (cart.length === 0) {
      alert("La comanda está vacía. Añade platillos antes de enviar.");
      return;
    }

    const waiterRecord = staff.find(s => s.id === selectedWaiter);
    const clientRecord = clients.find(c => c.id === selectedClient);

    const ticketNumber = `COM-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      ticketNumber,
      tableNumber: selectedTable,
      waiterId: selectedWaiter,
      waiterName: waiterRecord?.name || 'Mesero Desconocido',
      clientId: selectedClient === 'c-general' ? undefined : selectedClient,
      clientName: selectedClient === 'c-general' ? 'Cliente General' : clientRecord?.name || 'Cliente',
      items: cart,
      status: 'Recibido',
      total: cartTotal,
      createdAt: new Date().toISOString(),
      notes: generalNotes || undefined,
    };

    onCreateOrder(newOrder);

    // Reset fields
    setSelectedTable(null);
    setCart([]);
    setGeneralNotes('');
    setActiveTab('visualizar');
  };

  const handleSelectTableAndStart = (tableNum: number) => {
    if (activeTablesMap[tableNum]) {
      // Table is occupied, select it to view details instead of starting order
      setSelectedTable(tableNum);
      return;
    }
    setSelectedTable(tableNum);
    setActiveTab('crear');
  };

  // Dish filtering
  const filteredDishes = dishes.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchDishQuery.toLowerCase()) || d.description.toLowerCase().includes(searchDishQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todo' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="waiter_panel">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-800">Servicio de Meseros (Sala)</h1>
          <p className="text-sm text-slate-500">Mapeo de mesas, apertura de comandas e interacción en piso.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('visualizar')}
            className={`cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'visualizar' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Mapeo de Mesas & Comandas
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('crear');
              if (!selectedTable) setSelectedTable(1);
            }}
            className={`cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'crear' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            + Nueva Comanda
          </button>
        </div>
      </div>

      {activeTab === 'visualizar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tables Grid */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Waiter Tips Wallet */}
            {currentSelectedWaiterRecord && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4.5 space-y-3 shadow-3xs animate-fade-in" id="waiter_tips_purse">
                <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                  <div className="flex items-center space-x-2 text-emerald-900">
                    <div className="p-1.5 bg-emerald-550 rounded-lg text-white">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Monedero de Propinas</h4>
                      <p className="text-[10px] text-emerald-700 font-medium">Bolsa personal de {currentSelectedWaiterRecord.name}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-250">
                    Sabor & Gestión
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-0.5 text-center font-sans">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100/60 shadow-3xs">
                    <span className="text-[9px] uppercase tracking-wide text-slate-400 block font-bold">Acumulado</span>
                    <strong className="text-sm font-mono text-slate-700 font-extrabold">${waiterTipsEarned.toLocaleString()}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100/60 shadow-3xs">
                    <span className="text-[9px] uppercase tracking-wide text-slate-400 block font-bold">Ya Retirado</span>
                    <strong className="text-sm font-mono text-slate-450 font-extrabold">${waiterTipsWithdrawn.toLocaleString()}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200 ring-2 ring-emerald-500 ring-offset-2 shadow-3xs">
                    <span className="text-[9px] uppercase tracking-wide text-emerald-600 block font-black">Por Recoger</span>
                    <strong className="text-base font-mono text-emerald-700 font-black">${waiterTipsAvailable.toLocaleString()}</strong>
                  </div>
                </div>

                {waiterTipsAvailable > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      onCollectTips(currentSelectedWaiterRecord.name);
                    }}
                    className="cursor-pointer w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-slate-50 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md mt-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Recoger Propinas de Hoy (${waiterTipsAvailable.toLocaleString()} MXN)</span>
                  </button>
                ) : (
                  <p className="text-[10.5px] text-emerald-700 text-center italic bg-emerald-100/40 py-2.5 px-3 rounded-lg border border-emerald-100/80 leading-normal">
                    Tienes todas tus propinas retiradas y liquidadas al momento. ¡Excelente servicio!
                  </p>
                )}
              </div>
            )}
            
            {/* Live Client Tabletop QR Alerts Dashboard */}
            {activeCalls.filter(c => c.status === 'pendiente').length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-amber-800">
                  <Bell className="w-4 h-4 animate-bounce text-amber-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Llamados Activos de Comensales QR ({activeCalls.filter(c => c.status === 'pendiente').length})</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeCalls.filter(c => c.status === 'pendiente').map(call => (
                    <div key={call.id} className="bg-white border border-amber-100 rounded-lg p-3 flex justify-between items-center shadow-3xs">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-800">Mesa {call.tableNumber}</span>
                          <span className="text-[9px] text-slate-400">Escaneado</span>
                        </div>
                        <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-wide mt-0.5">
                          {call.type === 'servicio' ? '🛎️ Pide Servicio / Mesero' : call.type === 'cuenta' ? '🧾 Solicita Cuenta' : '🌮 Tomar Pedido'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onResolveCall(call.id)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Atender
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700">Diseño Geográfico de la Sala</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {Array.from({ length: totalTables }).map((_, i) => {
                  const tableNumber = i + 1;
                  const activeOrder = activeTablesMap[tableNumber];
                  const isOccupied = !!activeOrder;

                  return (
                    <button
                      key={tableNumber}
                      type="button"
                      onClick={() => {
                        handleSelectTableAndStart(tableNumber);
                        setIsDirectBilling(false);
                        setMobilePaymentSimulatorStep(null);
                      }}
                      className={`p-4 rounded-xl border flex flex-col justify-between items-center h-28 cursor-pointer transition-all ${
                        selectedTable === tableNumber
                          ? 'ring-2 ring-emerald-500 border-transparent scale-102 bg-slate-50'
                          : isOccupied
                          ? 'bg-amber-50/50 border-amber-200 hover:border-amber-400 font-semibold'
                          : 'bg-white border-slate-100 hover:border-emerald-300 hover:shadow-xs'
                      }`}
                    >
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Mesa</span>
                      <span className={`text-2xl font-bold font-mono ${isOccupied ? 'text-amber-700' : 'text-slate-600'}`}>
                        {tableNumber}
                      </span>

                      {isOccupied ? (
                        <div className="text-center">
                          <span className="text-[9px] px-1.5 py-0.5 bg-amber-100/80 text-amber-800 rounded-md font-bold block">
                            ${activeOrder.total} MXN
                          </span>
                          <span className="text-[8px] text-slate-400 block mt-1 truncate max-w-20">
                            {activeOrder.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded-md text-center">
                          Libre
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Sidebar of Selected Table with embedded Payment & thermal Print actions */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs h-fit space-y-4">
            {selectedTable && activeTablesMap[selectedTable] ? (
              (() => {
                const currentOrder = activeTablesMap[selectedTable];
                
                // Calculations
                const subTotalOrder = currentOrder.total;
                const tipValueOrder = Math.round(subTotalOrder * (billingTipPercent / 100));
                const finalTotalOrder = subTotalOrder + tipValueOrder;
                const splitAmountOrder = Math.round(finalTotalOrder / billingSplitPercent);
                const cashChangeOrder = billingPaymentMethod === 'Efectivo' && Number(billingCashReceived) >= finalTotalOrder
                  ? Math.round(Number(billingCashReceived) - finalTotalOrder)
                  : 0;

                const handleExecuteDirectBill = (e: React.FormEvent) => {
                  e.preventDefault();
                  
                  if (billingPaymentMethod === 'Efectivo' && (!billingCashReceived || Number(billingCashReceived) < finalTotalOrder)) {
                    alert("Por favor introduce efectivo válido superior al total.");
                    return;
                  }

                  // Process
                  onProcessPayment(currentOrder.id, billingPaymentMethod, finalTotalOrder, tipValueOrder);
                  
                  // Setup Receipt state data
                  setReceiptData({ ...currentOrder, paymentMethod: billingPaymentMethod });
                  setReceiptFinalTotal(finalTotalOrder);
                  setShowDirectReceipt(true);
                  
                  // reset states
                  setIsDirectBilling(false);
                  setSelectedTable(null);
                  setMobilePaymentSimulatorStep(null);
                };

                return (
                  <div className="space-y-4" id={`table_details_${selectedTable}`}>
                    
                    {/* Interactive Inline billing wizard toggler */}
                    {!isDirectBilling ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                          <div>
                            <span className="text-xs text-slate-400 uppercase font-bold">Mesa Activa</span>
                            <h3 className="text-lg font-bold text-slate-800">Mesa {selectedTable}</h3>
                          </div>
                          <span className="text-xs px-2 py-0.5 font-mono bg-amber-50 text-amber-800 rounded-md font-bold border border-amber-100">
                            {currentOrder.ticketNumber}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">
                            <strong className="text-slate-700 font-medium">Mesero Sabor:</strong> {currentOrder.waiterName}
                          </p>
                          <p className="text-xs text-slate-500">
                            <strong className="text-slate-700 font-medium">Cliente:</strong> {currentOrder.clientName}
                          </p>
                          <p className="text-xs text-slate-500">
                            <strong className="text-slate-700 font-medium">Llegada:</strong> {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <div className="pt-2 flex items-center">
                            <strong className="text-xs text-slate-700 mr-2">Estado:</strong>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              currentOrder.status === 'Recibido' ? 'bg-amber-50 text-amber-700' :
                              currentOrder.status === 'En Cocina' ? 'bg-orange-50 text-orange-700' :
                              currentOrder.status === 'Listo para Servir' ? 'bg-blue-50 text-blue-700' :
                              currentOrder.status === 'Entregado' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {currentOrder.status}
                            </span>
                          </div>
                        </div>

                        {/* Items on Ticket */}
                        <div className="border-t border-b border-slate-50 py-3 space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Platillos Servidos de Mesa</p>
                          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                            {currentOrder.items.map((item, idx) => (
                              <div key={idx} className="text-xs flex justify-between leading-normal">
                                <div className="max-w-[160px]">
                                  <span className="font-mono font-bold text-slate-450 mr-1.5">{item.quantity}x</span>
                                  <span className="font-semibold text-slate-705">{item.dish.name}</span>
                                  {item.notes && <p className="text-[10px] text-amber-600 italic">⭐ {item.notes}</p>}
                                </div>
                                <span className="font-mono text-slate-500">${item.dish.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total & Quick Waiter Action */}
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-xs font-bold text-slate-500 uppercase">Subtotal:</span>
                          <span className="text-lg font-bold font-mono text-emerald-600">${currentOrder.total} MXN</span>
                        </div>

                        <div className="space-y-2 pt-2">
                          {currentOrder.status === 'Listo para Servir' && (
                            <button
                              type="button"
                              onClick={() => onUpdateOrderStatus(currentOrder.id, 'Entregado')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-slate-50 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
                            >
                              <Utensils className="w-3.5 h-3.5" />
                              <span>Marcar Como ENTREGADO a Mesa</span>
                            </button>
                          )}

                          {/* Trigger Cobrar right in Waiter Panel!! */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsDirectBilling(true);
                              setBillingTipPercent(10);
                              setBillingSplitPercent(1);
                              setBillingCashReceived('');
                            }}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-slate-50 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>💰 Cobrar Mesa Directamente</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Table-side Direct Checkout Terminal Form */
                      <form onSubmit={handleExecuteDirectBill} className="space-y-4 text-xs animate-fade-in">
                        <div className="flex justify-between items-center border-b pb-2">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Terminal Móvil de Mesero</span>
                            <h4 className="text-sm font-bold text-slate-800">Cerrar Cuenta Mesa {selectedTable}</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsDirectBilling(false)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Conceptual amounts summary */}
                        <div className="bg-slate-50 p-3 rounded-lg space-y-1 text-slate-600">
                          <div className="flex justify-between">
                            <span>Consumo Base:</span>
                            <strong className="font-mono">${subTotalOrder}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Tip Sugerido (+{billingTipPercent}%):</span>
                            <strong className="font-mono text-indigo-650">+${tipValueOrder}</strong>
                          </div>
                          <div className="border-t pt-1.5 flex justify-between text-slate-800">
                            <span className="font-semibold">Importe Total:</span>
                            <strong className="font-mono text-emerald-600 text-sm">${finalTotalOrder} MXN</strong>
                          </div>
                        </div>

                        {/* Interactive tip selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-450">Servicio de Propina sugerido</label>
                          <div className="flex gap-1.5">
                            {[0, 10, 15, 20].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setBillingTipPercent(t)}
                                className={`cursor-pointer flex-1 py-1 rounded-md text-center font-bold font-mono transition-colors text-[10px] ${
                                  billingTipPercent === t
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-205'
                                }`}
                              >
                                {t}%
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Split account widget */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-450">Dividir cuenta entre comensales</label>
                          <div className="flex items-center justify-between space-x-2 text-[11px]">
                            <input
                              type="range"
                              min="1"
                              max="6"
                              className="flex-1 accent-emerald-600 h-1.5 bg-slate-150 rounded-lg cursor-pointer"
                              value={billingSplitPercent}
                              onChange={(e) => setBillingSplitPercent(Number(e.target.value))}
                            />
                            <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700 whitespace-nowrap">
                              {billingSplitPercent} pax
                            </span>
                          </div>
                          {billingSplitPercent > 1 && (
                            <p className="text-[10px] font-medium text-indigo-700 bg-indigo-50/70 p-1.5 rounded-md text-center">
                              Cada persona aporta: <strong className="font-mono">${splitAmountOrder} MXN</strong>
                            </p>
                          )}
                        </div>

                        {/* Payment method */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-450 block">Forma de Pago del Cliente</label>
                          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                            <button
                              type="button"
                              onClick={() => {
                                setBillingPaymentMethod('Tarjeta');
                                setMobilePaymentSimulatorStep(null);
                              }}
                              className={`cursor-pointer p-2 border rounded-md flex justify-center items-center space-x-1 font-semibold ${
                                billingPaymentMethod === 'Tarjeta' ? 'bg-indigo-50 border-indigo-500 text-indigo-800' : 'bg-white border-slate-200'
                              }`}
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Tarjeta</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBillingPaymentMethod('Efectivo');
                                setMobilePaymentSimulatorStep(null);
                              }}
                              className={`cursor-pointer p-2 border rounded-md flex justify-center items-center space-x-1 font-semibold ${
                                billingPaymentMethod === 'Efectivo' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200'
                              }`}
                            >
                              <Wallet className="w-3 h-3" />
                              <span>Efectivo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBillingPaymentMethod('Transferencia');
                                setMobilePaymentSimulatorStep(null);
                              }}
                              className={`cursor-pointer p-2 border rounded-md flex justify-center items-center space-x-1 font-semibold ${
                                billingPaymentMethod === 'Transferencia' ? 'bg-violet-50 border-violet-500 text-violet-800' : 'bg-white border-slate-200'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>SPEI / Trf.</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBillingPaymentMethod('Móvil');
                                setMobilePaymentSimulatorStep('qr_scan');
                              }}
                              className={`cursor-pointer p-2 border rounded-md flex justify-center items-center space-x-1 font-semibold ${
                                billingPaymentMethod === 'Móvil' ? 'bg-pink-50 border-pink-500 text-pink-800' : 'bg-white border-slate-200'
                              }`}
                            >
                              <QrCode className="w-3 h-3" />
                              <span>Móvil (QR)</span>
                            </button>
                          </div>
                        </div>

                        {/* Cash specifics layout */}
                        {billingPaymentMethod === 'Efectivo' && (
                          <div className="bg-slate-50 p-2.5 rounded-lg space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-slate-500 uppercase font-bold">Monto Recibido:</span>
                              <div className="relative w-28">
                                <span className="absolute left-2 top-1.5 text-[10px] text-slate-400 font-bold">$</span>
                                <input
                                  type="number"
                                  placeholder="Cash recibido..."
                                  value={billingCashReceived}
                                  onChange={(e) => setBillingCashReceived(e.target.value)}
                                  className="w-full text-[11px] font-mono font-bold bg-white border border-slate-200 rounded py-1 pl-4 pr-1 text-right text-slate-700 focus:outline-hidden"
                                  min={finalTotalOrder}
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center border-t pt-1 text-[11px]">
                              <span className="text-slate-500 font-bold">Cambio a Entregar:</span>
                              <span className="font-mono font-bold text-emerald-600">${cashChangeOrder} MXN</span>
                            </div>
                          </div>
                        )}

                        {/* Dynamic mobile checkout generator simulator integrated */}
                        {billingPaymentMethod === 'Móvil' && mobilePaymentSimulatorStep && (
                          <div className="bg-slate-900 text-slate-100 p-3 rounded-xl border border-slate-800 space-y-2 text-center relative overflow-hidden">
                            <h5 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Cobro Móvil CoDi / SPEI</h5>
                            
                            {mobilePaymentSimulatorStep === 'qr_scan' ? (
                              <div className="space-y-2">
                                <div className="p-2 bg-white inline-block rounded-lg shadow-sm">
                                  {/* Simulated CoDi matrix code */}
                                  <div className="relative size-24 bg-slate-50 flex items-center justify-center">
                                    <QrCode className="size-20 text-slate-900" />
                                    <div className="absolute size-5 bg-white shadow-3xs rounded-xs flex items-center justify-center">
                                      <Phone className="size-3 text-pink-500" />
                                    </div>
                                  </div>
                                </div>
                                <p className="text-[9px] text-slate-450 leading-normal">
                                  Escanee el QR dinámico en table o dispositivo para procesar con Apple Pay, Mercado Pago o SPEI.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setMobilePaymentSimulatorStep('paid')}
                                  className="cursor-pointer w-full py-1.5 bg-pink-600 hover:bg-pink-700 text-slate-50 text-[10px] font-semibold rounded-md transition-colors"
                                >
                                  📱 Simular escaneo de QR exitoso
                                </button>
                              </div>
                            ) : (
                              <div className="py-2 text-center space-y-1">
                                <CheckCircle className="size-8 text-emerald-450 mx-auto animate-bounce" />
                                <h6 className="text-[11px] font-bold text-emerald-400">Pago Móvil Confirmado</h6>
                                <p className="text-[9px] text-slate-400">Transacción CoDi autenticada mediante API.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Submit bill & close accounts */}
                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={billingPaymentMethod === 'Móvil' && mobilePaymentSimulatorStep !== 'paid'}
                            className="cursor-pointer w-full py-3 bg-emerald-605 hover:bg-emerald-700 text-slate-50 font-bold rounded-lg text-xs tracking-wide shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Confirmar Pago de Mesa ({billingPaymentMethod})</span>
                          </button>
                        </div>
                      </form>
                    )}

                  </div>
                );
              })()
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Utensils className="w-10 h-10 mx-auto text-slate-200" />
                <h4 className="text-xs font-semibold uppercase text-slate-500 font-display">Información General de Mesa</h4>
                <p className="text-[11px] leading-relaxed">Selecciona cualquiera de las {totalTables} mesas a la izquierda para ver su comanda activa, procesar cobro electrónico, consultar tickets, o marcar como entregado.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Create Comanda Module */
        <form onSubmit={handleSubmitComanda} className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-700">1. Seleccionar Platillos</h3>
            
            {/* Filters row */}
            <div className="flex flex-col sm:flex-row gap-2 border-b border-slate-50 pb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar en el menú..."
                  value={searchDishQuery}
                  onChange={(e) => setSearchDishQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-lg focus:outline-hidden"
                />
              </div>

              {/* Category tabs */}
              <div className="flex overflow-x-auto gap-1 self-center max-w-full">
                {['Todo', 'Entradas', 'Platos Fuertes', 'Postres', 'Bebidas'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat as any)}
                    className={`cursor-pointer text-[10px] font-bold py-1.5 px-3 rounded-md transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredDishes.length > 0 ? (
                filteredDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-1.5 ${dish.available ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        <h4 className="text-xs font-bold text-slate-700">{dish.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 max-w-[200px]">{dish.description}</p>
                      <p className="text-[11px] font-bold text-indigo-600 font-mono">${dish.price} MXN</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(dish)}
                      className="cursor-pointer size-7 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 rounded-lg flex items-center justify-center transition-colors font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-12 text-center text-slate-400">
                  <Coffee className="w-8 h-8 mx-auto text-slate-200 mb-1" />
                  <p className="text-xs">No se encontraron platos asociados.</p>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Cart Sidebar */}
          <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">2. Resumen del Ticket</h3>
              </div>

              {/* Table / Waiter selectors */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Mesa</label>
                  <select
                    value={selectedTable || ''}
                    onChange={(e) => setSelectedTable(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-hidden text-slate-700 font-bold"
                    required
                  >
                    <option value="">Elegir...</option>
                    {Array.from({ length: totalTables }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>Mesa {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Mesero Sabor</label>
                  <select
                    value={selectedWaiter}
                    onChange={(e) => setSelectedWaiter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-hidden text-slate-700 disabled:bg-slate-50 disabled:text-slate-450 disabled:cursor-not-allowed font-medium"
                    required
                    disabled={currentUser?.role === 'mesero'}
                  >
                    <option value="">Elegir...</option>
                    {waiters.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Selector */}
              <div className="text-xs">
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Cliente Vinculado</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-hidden text-slate-700"
                >
                  <option value="c-general">Cliente General (Común)</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.loyaltyPoints} pts)</option>
                  ))}
                </select>
              </div>

              {/* Selected items list */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Líneas de Comanda</p>
                <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
                  {cart.length > 0 ? (
                    cart.map((item, id) => (
                      <div key={id} className="p-2.5 bg-white border border-slate-100 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between items-start font-medium">
                          <span className="text-slate-700 leading-tight">{item.dish.name}</span>
                          <span className="font-mono text-indigo-600 font-bold">${item.dish.price * item.quantity}</span>
                        </div>

                        {/* Controls & comments */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.dish.id, -1)}
                              className="size-5 bg-slate-50 rounded-sm hover:bg-slate-100 transition-all flex items-center justify-center text-slate-600"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-slate-700">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.dish.id, 1)}
                              className="size-5 bg-slate-50 rounded-sm hover:bg-slate-100 transition-all flex items-center justify-center text-slate-600"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.dish.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Custom individual note input */}
                        <input
                          type="text"
                          placeholder="Nota (ej. sin picante, etc)"
                          value={item.notes || ''}
                          onChange={(e) => updateItemNotes(item.dish.id, e.target.value)}
                          className="w-full text-[10px] py-1 px-2 border border-slate-100 focus:border-slate-300 rounded-md focus:outline-hidden text-slate-600"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-[11px] bg-white border border-dashed border-slate-250 py-10 rounded-lg">
                      Falta añadir platillos al ticket.
                    </div>
                  )}
                </div>
              </div>

              {/* Global notes */}
              <div className="text-xs">
                <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Notas Generales de Servicio</label>
                <textarea
                  rows={2}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Ej. Servir bebidas primero, etc..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-hidden text-xs text-slate-600"
                />
              </div>
            </div>

            {/* Price block & button */}
            <div className="border-t border-slate-200/60 pt-4 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold uppercase">Total Comanda:</span>
                <span className="text-xl font-bold font-mono text-emerald-600">${cartTotal} MXN</span>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0 || !selectedTable || !selectedWaiter}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-slate-50 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Utensils className="w-4 h-4" />
                <span>Enviar Comanda a Cocina (Chef)</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* DIRECT PRINTABLE THERMAL RECEIPT FOR TABLE-SIDE SERVICE */}
      {showDirectReceipt && receiptData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border rounded-xl shadow-2xl p-6 max-w-sm w-full relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowDirectReceipt(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Vintage style thermal ticket */}
            <div className="border border-slate-200 p-4 font-mono text-slate-800 text-xs text-center space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold">SABOR & GESTIÓN S.A. DE C.V.</h3>
                <p className="text-[10px]">PAGO CONFIRMADO - SERVICIO DE MESA</p>
                <p className="text-[9px]">AV. REFORMA S/N, CIUDAD DE MÉXICO</p>
                <p className="text-[9px]">RFC: SGE-260526-ME1</p>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-2 text-left space-y-1">
                <p className="text-[10px]">TICKET DE PAGO: <strong className="float-right">{receiptData.ticketNumber}</strong></p>
                <p className="text-[10px]">FECHA: <span className="float-right">{new Date().toLocaleString()}</span></p>
                <p className="text-[10px]">MESA: <span className="float-right">{receiptData.tableNumber}</span></p>
                <p className="text-[10px]">MESERO: <span className="float-right">{receiptData.waiterName}</span></p>
                <p className="text-[10px]">CLIENTE: <span className="float-right truncate max-w-[120px]">{receiptData.clientName}</span></p>
                <p className="text-[10px]">MÉTODO DE PAGO: <span className="float-right uppercase">{billingPaymentMethod}</span></p>
              </div>

              {/* Items listing */}
              <div className="space-y-1.5 text-left border-b border-dashed border-slate-300 pb-2">
                <p className="text-[10px] uppercase font-bold text-slate-500">CONCEPTO / CANT / TOTAL</p>
                {receiptData.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[10px]">
                    <span className="truncate max-w-[170px]">{it.dish.name}</span>
                    <span>{it.quantity}x • ${it.dish.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Values block */}
              <div className="text-right space-y-1 text-[10px] pb-2 border-b border-dashed border-slate-300">
                <p>Consumo Base: <span className="float-right font-bold ml-10">${receiptData.total}</span></p>
                <p>Propina de Servicio ({billingTipPercent}%): <span className="float-right font-bold ml-10">+${Math.round(receiptData.total * (billingTipPercent / 100))}</span></p>
                <p className="text-xs">TOTAL COBRADO: <strong className="float-right font-bold ml-10">${receiptFinalTotal} MXN</strong></p>
              </div>

              {/* Barcode representation */}
              <div className="space-y-1">
                <div className="h-6 bg-linear-to-r from-black via-slate-800 to-black w-3/4 mx-auto flex items-center justify-center">
                  <span className="text-[7px] text-white tracking-[6px] font-bold">|||||||||||||||||||</span>
                </div>
                <p className="text-[8px] tracking-widest text-slate-400">SABOR-POS-TABLE-{Date.now().toString().slice(-6)}</p>
              </div>

              <p className="text-[9px] italic text-slate-400 pt-1">*** COMPROBANTE COBRADO DE MESA ***<br />SABOR & GESTIÓN AGRADECE SU VISITA</p>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="cursor-pointer flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg flex items-center justify-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Recibo</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDirectReceipt(false)}
                className="cursor-pointer flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center"
              >
                Cerrar Pantalla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
