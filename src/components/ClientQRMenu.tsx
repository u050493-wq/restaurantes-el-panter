/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dish, Category, WaiterCall, Order, Staff, Sale } from '../types';
import { 
  QrCode, 
  Smartphone, 
  Bell, 
  Receipt, 
  ShoppingBag, 
  Search, 
  CheckCircle, 
  ArrowRight, 
  Wifi, 
  Sparkles, 
  X, 
  BookOpen, 
  Wallet, 
  CreditCard,
  Check, 
  Loader2 
} from 'lucide-react';

interface ClientQRMenuProps {
  dishes: Dish[];
  activeCalls: WaiterCall[];
  onTriggerCall: (tableNumber: number, type: WaiterCall['type']) => void;
  orders: Order[];
  onCreateOrder: (order: Order) => void;
  onProcessPayment: (orderId: string, paymentMethod: Sale['paymentMethod'], finalTotal: number, tipAmount?: number) => void;
  staff: Staff[];
}

export default function ClientQRMenu({ 
  dishes, 
  activeCalls, 
  onTriggerCall,
  orders,
  onCreateOrder,
  onProcessPayment,
  staff
}: ClientQRMenuProps) {
  const [selectedTable, setSelectedTable] = useState<number>(5);
  const [isPhoneScanned, setIsPhoneScanned] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'Todo' | Category>('Todo');
  const [clientName, setClientName] = useState('');
  
  // Mobile app navigation state
  const [mobileTab, setMobileTab] = useState<'menu' | 'ticket'>('menu');

  // Pre-cart simulation state
  const [clientCart, setClientCart] = useState<{ dish: Dish; qty: number }[]>([]);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  // Client Payment simulation states
  const [checkoutTipPercent, setCheckoutTipPercent] = useState<number>(10);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<Sale['paymentMethod']>('Tarjeta');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'processing' | 'done'>('idle');

  // Stats
  const availableDishes = dishes.filter(d => d.available);
  const filteredDishes = availableDishes.filter(d => {
    const s = searchQuery.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(s) || d.description.toLowerCase().includes(s);
    const matchCat = activeCategory === 'Todo' || d.category === activeCategory;
    return matchSearch && matchCat;
  });

  const cartTotal = clientCart.reduce((sum, item) => sum + item.dish.price * item.qty, 0);

  // Search active order for selected table (not paid yet)
  const activeOrderForTable = orders.find(o => o.tableNumber === selectedTable && o.status !== 'Cobrado');

  // Calculates ticket costs
  const activeOrderSubtotal = activeOrderForTable ? activeOrderForTable.total : 0;
  const activeOrderTipValue = Math.round(activeOrderSubtotal * (checkoutTipPercent / 100));
  const activeOrderFinalTotal = activeOrderSubtotal + activeOrderTipValue;

  const handleAddToCart = (dish: Dish) => {
    const idx = clientCart.findIndex(item => item.dish.id === dish.id);
    if (idx > -1) {
      const copy = [...clientCart];
      copy[idx].qty += 1;
      setClientCart(copy);
    } else {
      setClientCart([...clientCart, { dish, qty: 1 }]);
    }
  };

  const updateCartQty = (dishId: string, delta: number) => {
    const updated = clientCart.map(item => {
      if (item.dish.id === dishId) {
        const nQ = item.qty + delta;
        return nQ > 0 ? { ...item, qty: nQ } : null;
      }
      return item;
    }).filter(Boolean) as { dish: Dish; qty: number }[];
    setClientCart(updated);
  };

  const handleServiceCall = (type: WaiterCall['type']) => {
    onTriggerCall(selectedTable, type);
    
    const messages = {
      servicio: "🛎️ ¡Mesero llamado para asistencia a mesa!",
      cuenta: "🧾 Se ha enviado la solicitud de la cuenta al cajero y mesero.",
      orden: "🌮 Se solicitó la toma presencial de la orden."
    };
    
    setOrderNotification(messages[type]);
    setTimeout(() => setOrderNotification(null), 5000);
  };

  const handleSendRealOrder = () => {
    if (clientCart.length === 0) return;

    const ticketNumber = `COM-${Math.floor(100 + Math.random() * 900)}`;
    const assignedWaiter = staff.find(s => s.role === 'mesero' && s.status === 'disponible') || staff.find(s => s.role === 'mesero') || { id: 'sys-qr', name: 'Auto-Servicio' };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      ticketNumber,
      tableNumber: selectedTable,
      waiterId: assignedWaiter.id,
      waiterName: assignedWaiter.name,
      clientName: clientName.trim() || `Comensal QR Mesa ${selectedTable}`,
      items: clientCart.map(item => ({
        dish: item.dish,
        quantity: item.qty,
        notes: 'Pedido directo de Comensal por QR'
      })),
      status: 'Recibido',
      total: cartTotal,
      createdAt: new Date().toISOString(),
      notes: `Ingresado desde teléfono de mesa.`
    };

    onCreateOrder(newOrder);
    setOrderNotification(`🎉 ¡Pedido enviado a Cocina! Su orden #${ticketNumber} ya se está preparando.`);
    setClientCart([]);
    setMobileTab('ticket'); // Toggle to live invoice check section
    setTimeout(() => setOrderNotification(null), 6000);
  };

  const handleClientPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderForTable) return;

    setIsProcessingPayment(true);
    setPaymentStep('processing');

    // Simulate mobile payment service
    setTimeout(() => {
      setPaymentStep('done');
      onProcessPayment(
        activeOrderForTable.id, 
        checkoutPaymentMethod, 
        activeOrderFinalTotal, 
        activeOrderTipValue
      );
      setIsProcessingPayment(false);
      setOrderNotification(`💳 ¡Pago Procesado Exitosamente por ${checkoutPaymentMethod}! Mesa liberada y cuenta saldada.`);
      setTimeout(() => setOrderNotification(null), 6000);
    }, 2200);
  };

  const myTableCalls = activeCalls.filter(c => c.tableNumber === selectedTable && c.status === 'pendiente');

  return (
    <div className="space-y-6" id="client_qr_menu_view">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-800">Menú Auto-Servicio QR & Cobro Digital</h1>
        <p className="text-sm text-slate-500">Módulo interactivo digital para comensales en mesa: realizar orden directa, elegir propina y pagar en efectivo o tarjeta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: 5/12 - Digital QR Stand Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-450 tracking-wider">Simulador de Mesa Física</h3>
            
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600">Seleccionar número de mesa:</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setSelectedTable(num);
                      setClientCart([]);
                      setMobileTab('menu');
                      setPaymentStep('idle');
                    }}
                    className={`cursor-pointer py-1.5 rounded-lg text-xs font-bold font-mono border text-center transition-all ${
                      selectedTable === num
                        ? 'bg-emerald-600 border-emerald-500 text-slate-50 shadow-xs'
                        : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50 hover:border-slate-350'
                    }`}
                  >
                    Mesa {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated table QR stand */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full rotate-45 transform translate-x-3 -translate-y-3"></div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-800 tracking-wider uppercase">Sabor & Gestión</span>
                <p className="text-[9px] text-slate-400">Escanea para acceder a la carta digital</p>
              </div>

              {/* QR Render card */}
              <div className="bg-white p-4 inline-block rounded-xl shadow-xs border border-amber-100/60 transition-transform hover:scale-102">
                <div className="p-2 border border-slate-900 rounded-lg">
                  <div className="relative size-32 bg-slate-50 flex items-center justify-center">
                    <QrCode className="size-28 text-slate-800" strokeWidth={1.5} />
                    <div className="absolute size-8 bg-white border border-slate-100 shadow-3xs rounded-md flex items-center justify-center">
                      <span className="font-mono text-[9px] font-bold text-emerald-600">M-{selectedTable}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-mono font-bold text-slate-700">MESA {selectedTable}</div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 leading-normal">
                  Este código QR simula el acceso del cliente desde su propio dispositivo móvil. Permite ordenar, pagar y llamar al mesero.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPhoneScanned(!isPhoneScanned)}
                  className="cursor-pointer py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 mx-auto"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>{isPhoneScanned ? "Ocultar Teléfono Móvil" : "Simular Escaneo (Abrir Móvil)"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table active calls log */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Alertas Emitidas de Mesa {selectedTable}</h4>
            {myTableCalls.length > 0 ? (
              <div className="space-y-2">
                {myTableCalls.map((call) => (
                  <div key={call.id} className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <span className="font-semibold text-slate-700 capitalize">
                        Solicitud: {call.type === 'servicio' ? 'Atención / Servicio' : call.type === 'cuenta' ? 'Pedir la Cuenta' : 'Tomar Pedido'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-450 italic bg-slate-50/50 p-3 rounded-lg text-center">Sin solicitudes de asistencia física pendientes.</p>
            )}
          </div>
        </div>

        {/* Right column: 7/12 - Comensal Smartphone Simulator View */}
        <div className={`lg:col-span-7 transition-all ${isPhoneScanned ? 'opacity-100 scale-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="relative mx-auto max-w-[370px] bg-slate-900 rounded-[50px] p-4 shadow-2xl border-4 border-slate-800">
            {/* Speaker & camera slot */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-900 rounded-full flex items-center justify-center space-x-1 z-10">
              <span className="w-12 h-1 bg-slate-800 rounded-full"></span>
              <span className="size-1.5 bg-slate-800 rounded-full"></span>
            </div>

            {/* Inner viewport container */}
            <div className="bg-slate-50 text-slate-800 rounded-[38px] overflow-hidden min-h-[660px] flex flex-col justify-between select-none">
              
              {/* Phone Status bar */}
              <div className="bg-slate-900 text-slate-100 text-[10px] font-mono px-6 pt-3 pb-2 flex justify-between items-center">
                <span className="font-bold flex items-center">
                  <Wifi className="w-3 h-3 text-emerald-400 mr-1" />
                  Sabor_Guest_WiFi
                </span>
                <span className="font-bold bg-slate-800 px-1.5 py-0.5 rounded-sm">MESA {selectedTable}</span>
                <span>12:00 PM</span>
              </div>

              {/* Toast Notification area */}
              {orderNotification && (
                <div className="bg-emerald-600 text-slate-50 scale-95 mx-3 mt-3 p-3 rounded-xl shadow-md text-[11px] font-semibold text-center animate-fade-in flex items-center justify-center space-x-1.5 z-20">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-200 flex-shrink-0" />
                  <span>{orderNotification}</span>
                </div>
              )}

              {/* Mobile app virtual navigation tab-bar */}
              <div className="bg-white border-b border-slate-150 grid grid-cols-2 text-center text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMobileTab('menu');
                    setPaymentStep('idle');
                  }}
                  className={`cursor-pointer py-3.5 flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
                    mobileTab === 'menu'
                      ? 'border-emerald-650 text-emerald-700 bg-emerald-50/20'
                      : 'border-transparent text-slate-450 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>📖 Menú Digital</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileTab('ticket');
                    setPaymentStep('idle');
                  }}
                  className={`cursor-pointer py-3.5 flex items-center justify-center space-x-1.5 border-b-2 transition-all relative ${
                    mobileTab === 'ticket'
                      ? 'border-emerald-650 text-emerald-700 bg-emerald-50/20'
                      : 'border-transparent text-slate-450 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>🧾 Mi Cuenta</span>
                  {activeOrderForTable && (
                    <span className="absolute top-2 right-4- w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  )}
                </button>
              </div>

              {/* Viewport content */}
              <div className="flex-1 overflow-y-auto max-h-[460px] p-4 space-y-4">
                
                {/* MENU TAB VIEW */}
                {mobileTab === 'menu' && (
                  <div className="space-y-4">
                    {/* Header welcoming */}
                    <div className="bg-linear-to-r from-teal-905 to-emerald-905 text-slate-805 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Auto-Servicio Sabor</span>
                      </div>
                      <h2 className="text-base font-bold">¡Pide desde tu Móvil!</h2>
                      <p className="text-[10.5px] text-slate-450 leading-relaxed">
                        Selecciona tus alimentos favoritos y envíalos directamente a las comisiones del chef sin esperar.
                      </p>
                    </div>

                    {/* Live Client detail block */}
                    <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-3xs space-y-2">
                      <label className="block text-[9px] uppercase font-black tracking-wide text-slate-400">¿A nombre de quién?</label>
                      <input
                        type="text"
                        placeholder="Tu Nombre para el ticket..."
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 focus:bg-white border border-slate-150 focus:border-emerald-500 rounded-lg focus:outline-hidden font-medium"
                      />
                    </div>

                    {/* Waiter Actions Block */}
                    <div className="grid grid-cols-2 gap-2 pb-0.5">
                      <button
                        type="button"
                        onClick={() => handleServiceCall('servicio')}
                        className="cursor-pointer p-2.5 bg-amber-55 border border-amber-200 hover:bg-amber-100/60 rounded-xl flex items-center justify-center space-x-1.5 text-amber-900 transition-colors"
                      >
                        <Bell className="w-4 h-4 shrink-0 text-amber-600" />
                        <span className="text-[10px] font-black">Llamar Mesero</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleServiceCall('cuenta')}
                        className="cursor-pointer p-2.5 bg-indigo-55 border border-indigo-205 hover:bg-indigo-100/60 rounded-xl flex items-center justify-center space-x-1.5 text-indigo-900 transition-colors"
                      >
                        <Receipt className="w-4 h-4 shrink-0 text-indigo-600" />
                        <span className="text-[10px] font-black">Pedir Cuenta Fís.</span>
                      </button>
                    </div>

                    {/* Categories Scroll */}
                    <div className="space-y-3">
                      <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
                        {['Todo', 'Entradas', 'Platos Fuertes', 'Postres', 'Bebidas'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveCategory(cat as any)}
                            className={`cursor-pointer text-[10px] font-bold py-1 px-2.5 rounded-full transition-colors whitespace-nowrap ${
                              activeCategory === cat
                                ? 'bg-emerald-600 text-slate-50'
                                : 'bg-white text-slate-500 border border-slate-150/70 hover:bg-slate-100'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Search inner */}
                      <div className="relative text-xs">
                        <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar comida, bebidas..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-150 rounded-lg text-xs"
                        />
                      </div>

                      {/* Food item cards */}
                      <div className="space-y-2">
                        {filteredDishes.map((dish) => (
                          <div key={dish.id} className="bg-white p-2.5 rounded-xl border border-slate-100/80 flex justify-between gap-3 text-xs shadow-3xs hover:border-slate-200">
                            <div className="space-y-1 flex-1">
                              <h4 className="font-bold text-slate-800 leading-tight">{dish.name}</h4>
                              <p className="text-[10px] text-slate-400 line-clamp-1 leading-normal">{dish.description}</p>
                              <span className="font-bold font-mono text-emerald-600 block">${dish.price} MXN</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(dish)}
                              className="cursor-pointer self-center size-7.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 font-bold rounded-lg flex items-center justify-center transition-all"
                            >
                              +
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TICKET / CHECKOUT TAB VIEW */}
                {mobileTab === 'ticket' && (
                  <div className="space-y-4">
                    {activeOrderForTable ? (
                      paymentStep === 'processing' ? (
                        /* Simulated loading process */
                        <div className="bg-white rounded-2xl p-6 text-center space-y-4 shadow-3xs border border-slate-100 py-12 animate-fade-in">
                          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto animate-bounce" />
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold uppercase text-slate-450 tracking-wider font-mono">Pasarela Web Segura</h4>
                            <p className="text-xs font-bold text-slate-750">Procesando {checkoutPaymentMethod} en línea...</p>
                            <p className="text-[10px] text-slate-400 leading-normal">Solicitando autorización segura de fondos con su entidad financiera...</p>
                          </div>
                        </div>
                      ) : paymentStep === 'done' ? (
                        /* Simulated paid confirmation */
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-4 shadow-3xs py-10 animate-fade-in">
                          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                          <div className="space-y-1.5">
                            <h3 className="font-bold text-slate-800 text-sm">¡Comitente Saldado Perfectamente!</h3>
                            <p className="text-xs text-slate-500 leading-normal">El cobro de la Mesa {selectedTable} ha sido recibido y notificado a la suite central.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentStep('idle');
                              setMobileTab('menu');
                            }}
                            className="py-1 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                          >
                            Volver al Menú
                          </button>
                        </div>
                      ) : (
                        /* Live Active Order invoice list & checkout controls */
                        <form onSubmit={handleClientPayment} className="space-y-3.5 animate-fade-in">
                          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-3xs space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <div>
                                <span className="text-[8px] uppercase font-bold text-slate-400">Consumo de Mesa {selectedTable}</span>
                                <h3 className="text-xs font-bold text-slate-800">Orden Activa {activeOrderForTable.ticketNumber}</h3>
                              </div>
                              <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-100 font-bold font-mono py-0.5 px-2 rounded-full">
                                Por Pagar
                              </span>
                            </div>

                            {/* Ticket items breakdown */}
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                              {activeOrderForTable.items.map((item, id) => (
                                <div key={id} className="text-xs flex justify-between items-center py-1">
                                  <div className="flex items-center space-x-1.5 text-slate-655 font-medium truncate max-w-[150px]">
                                    <span className="bg-slate-100 font-bold size-5 font-mono text-[10px] text-slate-500 rounded flex items-center justify-center">
                                      {item.quantity}
                                    </span>
                                    <span className="truncate">{item.dish.name}</span>
                                  </div>
                                  <strong className="font-mono text-[11px] text-slate-500">${item.dish.price * item.quantity}</strong>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-slate-100 pt-2 flex justify-between text-xs text-slate-600">
                              <span>Consumo Neto:</span>
                              <strong className="font-mono">${activeOrderSubtotal} MXN</strong>
                            </div>
                          </div>

                          {/* Split checkout: Tip selector */}
                          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-3xs space-y-2.5">
                            <label className="block text-[9px] uppercase tracking-wide font-black text-slate-400">Añadir Propina del Mesero</label>
                            <div className="grid grid-cols-4 gap-1.5">
                              {[0, 10, 15, 20].map((perc) => (
                                <button
                                  key={perc}
                                  type="button"
                                  onClick={() => setCheckoutTipPercent(perc)}
                                  className={`cursor-pointer py-1.5 rounded-lg text-xs font-bold text-center border transition-all ${
                                    checkoutTipPercent === perc
                                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                                  }`}
                                >
                                  {perc}%
                                </button>
                              ))}
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Monto de Propina:</span>
                              <strong className="font-mono text-slate-600 font-bold">+${activeOrderTipValue} MXN</strong>
                            </div>
                          </div>

                          {/* Payment method selector (Cash or Card) */}
                          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-3xs space-y-2.5">
                            <label className="block text-[9px] uppercase tracking-wide font-black text-slate-400 font-sans">Opción de Pago</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setCheckoutPaymentMethod('Tarjeta')}
                                className={`cursor-pointer py-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all text-xs ${
                                  checkoutPaymentMethod === 'Tarjeta'
                                    ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold ring-1 ring-indigo-400'
                                    : 'bg-white border-slate-150 text-slate-500'
                                }`}
                              >
                                <CreditCard className="w-5 h-5 text-indigo-500" />
                                <span>Pagar con Tarjeta</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setCheckoutPaymentMethod('Efectivo')}
                                className={`cursor-pointer py-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all text-xs ${
                                  checkoutPaymentMethod === 'Efectivo'
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-400'
                                    : 'bg-white border-slate-150 text-slate-500'
                                }`}
                              >
                                <Wallet className="w-5 h-5 text-emerald-600" />
                                <span>Pagar con Efectivo</span>
                              </button>
                            </div>

                            {checkoutPaymentMethod === 'Efectivo' ? (
                              <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 leading-normal animate-slide-down">
                                💡 Al seleccionar <strong>Efectivo</strong>, puedes registrar el pago directo de la mesa, pero recuerda entregar el efectivo al mesero {activeOrderForTable.waiterName} para registrar el corte de caja.
                              </p>
                            ) : (
                              <p className="text-[10px] text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100 leading-normal animate-slide-down">
                                🔒 Su pago con <strong>Tarjeta</strong> estará cifrado en una pasarela virtual segura de pago bancario de extremo a extremo.
                              </p>
                            )}
                          </div>

                          {/* Summary and Pay Action */}
                          <div className="p-1 pb-2 flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Importe Total</span>
                            <span className="font-black font-mono text-base text-slate-850">${activeOrderFinalTotal.toLocaleString()} MXN</span>
                          </div>

                          <button
                            type="submit"
                            disabled={isProcessingPayment}
                            className="w-full py-3 bg-emerald-650 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-md active:scale-98 transition-all"
                          >
                            <CreditCard className="w-4 h-4 text-emerald-305" />
                            <span>Saldar Cuenta (${activeOrderFinalTotal.toLocaleString()} MXN)</span>
                          </button>
                        </form>
                      )
                    ) : (
                      /* No active order message */
                      <div className="bg-white rounded-2xl p-8 shadow-3xs border border-slate-100 text-center py-12 space-y-3 animate-fade-in">
                        <Receipt className="w-9 h-9 text-slate-250 mx-auto" />
                        <div>
                          <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Sin consumos cargados</h4>
                          <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed mt-1">La Mesa {selectedTable} no tiene ninguna cuenta activa registrada en este momento.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMobileTab('menu')}
                          className="py-1 px-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10.5px] font-bold"
                        >
                          Ir al Menú a Ordenar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic bottom pre-cart dock (ONLY displayed when mobileTab === 'menu') */}
              {mobileTab === 'menu' && (
                <div className="bg-white border-t border-slate-150 p-4 space-y-3 rounded-b-[38px] max-h-56 overflow-y-auto">
                  {clientCart.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-500">Mi Carrito de Mesa:</span>
                        <strong className="font-mono text-emerald-600 text-sm">${cartTotal} MXN</strong>
                      </div>

                      {/* Cart scroll */}
                      <div className="space-y-1.5 max-h-24 overflow-y-auto">
                        {clientCart.map((item) => (
                          <div key={item.dish.id} className="flex justify-between items-center text-[11px] bg-slate-50 px-2.5 py-1 rounded-md">
                            <span className="truncate max-w-[150px] font-medium text-slate-700">{item.dish.name}</span>
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.dish.id, -1)}
                                className="size-4 bg-slate-200 rounded-sm text-[10px] flex items-center justify-center font-bold text-slate-650 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.dish.id, 1)}
                                className="size-4 bg-slate-200 rounded-sm text-[10px] flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleSendRealOrder}
                        className="cursor-pointer w-full py-2.5 bg-emerald-650 hover:bg-emerald-700 text-slate-50 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-305" />
                        <span>Confirmar y Pedir Platillos</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-[10px] text-slate-400">
                      Selecciona platillos arriba para ordenar.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
