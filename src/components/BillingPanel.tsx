/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Order, Sale, Client } from '../types';
import { 
  DollarSign, 
  Wallet, 
  CreditCard, 
  Receipt, 
  Hash, 
  ArrowRight, 
  CheckCircle, 
  Printer, 
  X, 
  Grid, 
  Layers, 
  Wifi, 
  AlertTriangle, 
  Check, 
  BookOpen, 
  Sparkles, 
  History,
  TrendingUp,
  CreditCard as DebitIcon,
  Loader2
} from 'lucide-react';

interface BillingPanelProps {
  orders: Order[];
  onProcessPayment: (orderId: string, paymentMethod: Sale['paymentMethod'], finalTotal: number, tipAmount?: number) => void;
  clients: Client[];
  sales: Sale[];
}

export default function BillingPanel({ orders, onProcessPayment, clients, sales }: BillingPanelProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [tipPercent, setTipPercent] = useState<number>(10);
  const [splitCount, setSplitCount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('Tarjeta');
  const [cashReceived, setCashReceived] = useState<string>('');
  
  // Terminal card processing state
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [cardStep, setCardStep] = useState<'conectar' | 'leyendo' | 'autorizando' | 'aprobado' | 'idle'>('idle');

  // Receipt modal states
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceiptData, setCurrentReceiptData] = useState<Order | null>(null);
  const [calculatedFinalTotal, setCalculatedFinalTotal] = useState<number>(0);
  const [savedTipPercent, setSavedTipPercent] = useState<number>(10);

  // Filter orders that are not Paid yet
  const unpaidOrders = orders.filter(o => o.status !== 'Cobrado');
  const activeOrder = orders.find(o => o.id === selectedOrderId);

  // Create active tables mapping for geometric room layout
  const activeTablesMap: Record<number, Order> = {};
  unpaidOrders.forEach(o => {
    activeTablesMap[o.tableNumber] = o;
  });

  // Compute values
  const subtotal = activeOrder ? activeOrder.total : 0;
  const ivaValue = Math.round(subtotal * 0.16);
  const tipValue = Math.round(subtotal * (tipPercent / 100));
  const finalTotal = subtotal + tipValue; // Total includes subtotal and tip (the mock total originally is tax-inclusive)
  
  const splitAmount = splitCount > 1 ? Math.round(finalTotal / splitCount) : finalTotal;
  const changeValue = paymentMethod === 'Efectivo' && Number(cashReceived) >= finalTotal
    ? Math.round(Number(cashReceived) - finalTotal)
    : 0;

  // Real-time suggested cash bills for quick cash input
  const finalTotalRounded = Math.ceil(finalTotal);
  const quickCashOptions = Array.from(new Set([
    finalTotalRounded,
    Math.ceil(finalTotalRounded / 50) * 50,
    Math.ceil(finalTotalRounded / 100) * 100,
    200,
    500,
    1000,
    2000
  ])).filter(val => val >= finalTotalRounded).sort((a,b) => a-b).slice(0, 5);

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    setTipPercent(10);
    setSplitCount(1);
    setCashReceived('');
    setIsProcessingCard(false);
    setCardStep('idle');
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    
    if (paymentMethod === 'Efectivo') {
      if (!cashReceived || Number(cashReceived) < finalTotal) {
        alert("Por favor introduce un pago en efectivo válido igual o superior al total.");
        return;
      }
      
      // Complete cash payment instantly
      finalizePayment(paymentMethod, finalTotal);
    } else if (paymentMethod === 'Tarjeta') {
      // Trigger card payment simulation
      runCardPaymentTerminalSimulation();
    } else {
      // Transfer payments (SPEI) instant payment
      finalizePayment(paymentMethod, finalTotal);
    }
  };

  // Card Payment Terminal Simulation
  const runCardPaymentTerminalSimulation = () => {
    if (!activeOrder) return;
    setIsProcessingCard(true);
    setCardStep('conectar');

    setTimeout(() => {
      setCardStep('leyendo');
    }, 700);

    setTimeout(() => {
      setCardStep('autorizando');
    }, 1500);

    setTimeout(() => {
      setCardStep('aprobado');
    }, 2400);

    setTimeout(() => {
      finalizePayment('Tarjeta', finalTotal);
      setIsProcessingCard(false);
      setCardStep('idle');
    }, 3200);
  };

  // Finish process
  const finalizePayment = (method: Sale['paymentMethod'], totalAmount: number) => {
    if (!activeOrder) return;
    
    // Process payment in upper state
    onProcessPayment(activeOrder.id, method, totalAmount, tipValue);

    // Save for printable receipt presentation
    setCurrentReceiptData({ ...activeOrder, paymentMethod: method });
    setCalculatedFinalTotal(totalAmount);
    setSavedTipPercent(tipPercent);
    setShowReceiptModal(true);

    // Clean active selection
    setSelectedOrderId('');
  };

  // Reprint previous receipt from history
  const handleReprintReceipt = (sale: Sale) => {
    // Reconstruct virtual order representation for previous sale
    const matchingOrder = orders.find(o => o.id === sale.orderId) || {
      id: sale.orderId,
      ticketNumber: sale.ticketNumber,
      tableNumber: sale.tableNumber,
      waiterId: 'sys',
      waiterName: sale.waiterName,
      clientName: clients.find(c => c.name === sale.waiterName)?.name || 'Cliente de Piso',
      items: [],
      status: 'Cobrado' as const,
      total: sale.total,
      createdAt: sale.date
    } as any;

    setCurrentReceiptData({ ...matchingOrder, paymentMethod: sale.paymentMethod });
    // Assuming 10% tip was included or fallback
    setCalculatedFinalTotal(sale.total);
    setSavedTipPercent(10);
    setShowReceiptModal(true);
  };

  return (
    <div className="space-y-6" id="billing_panel">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-800">Caja y Cobranza (Cobros)</h1>
        <p className="text-sm text-slate-500">Gestión de cuentas abiertas en mesa, plano visual del salón, cálculo de propinas, facturación y recibos.</p>
      </div>

      {/* SALON GEOMETRIC DESIGN FOR CASHIER */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-450 tracking-wider flex items-center space-x-1.5">
              <Grid className="w-4 h-4 text-emerald-600" />
              <span>Distribución de Mesas en la Sala (Plano de Caja)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Disposición real de mesas en piso. Selecciona una mesa con cuenta activa para liquidar.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="size-2 rounded-full bg-slate-100 border border-slate-200"></span>Libre
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="size-2 rounded-full bg-amber-400 animate-pulse"></span>Comensal Abierto (${unpaidOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString()} total)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500"></span>Cobrando Ahora
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3.5 pt-1">
          {Array.from({ length: 12 }).map((_, i) => {
            const tableNo = i + 1;
            const orderForTable = activeTablesMap[tableNo];
            const hasBill = !!orderForTable;
            const isBeingBilled = activeOrder && activeOrder.tableNumber === tableNo;

            return (
              <button
                key={tableNo}
                type="button"
                disabled={!hasBill}
                onClick={() => handleOrderSelect(orderForTable.id)}
                className={`h-16 rounded-xl border flex flex-col justify-between p-2.5 transition-all text-left group ${
                  isBeingBilled
                    ? 'bg-emerald-600 text-white border-transparent ring-2 ring-emerald-500 ring-offset-2 scale-102'
                    : hasBill
                    ? 'bg-amber-50/70 border-amber-250 text-amber-900 hover:bg-amber-100/80 hover:border-amber-400 shadow-3xs cursor-pointer'
                    : 'bg-slate-50/60 border-slate-100 text-slate-350 opacity-55 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${isBeingBilled ? 'text-emerald-100' : 'text-slate-400'}`}>
                    M-{tableNo}
                  </span>
                  {hasBill && !isBeingBilled && (
                    <span className="size-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></span>
                  )}
                </div>
                <span className="text-lg font-bold font-mono self-center scale-95 leading-none">
                  {tableNo}
                </span>
                {hasBill ? (
                  <span className={`text-[8px] font-mono leading-none font-bold ${isBeingBilled ? 'text-emerald-100' : 'text-amber-700'}`}>
                    ${orderForTable.total.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-[8px] text-slate-400 leading-none">Libre</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Unpaid Orders list and Daily Receipts history */}
        <div className="space-y-6">
          {/* Unpaid items */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Lista de Comandas por Cobrar</span>
            </h3>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {unpaidOrders.length > 0 ? (
                unpaidOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => handleOrderSelect(order.id)}
                    className={`w-full text-left p-3 rounded-lg border flex flex-col justify-between space-y-2 cursor-pointer transition-all ${
                      selectedOrderId === order.id
                        ? 'bg-emerald-50 border-emerald-500 shadow-3xs'
                        : 'bg-slate-50/35 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono bg-white border px-1.5 py-0.5 rounded-sm font-bold text-slate-500">
                        {order.ticketNumber}
                      </span>
                      <strong className="text-slate-700">Mesa {order.tableNumber}</strong>
                    </div>

                    <p className="text-[11px] text-slate-450 leading-none">
                      Cliente: <span className="font-semibold text-slate-650">{order.clientName}</span>
                    </p>

                    <div className="border-t border-slate-100/60 pt-1.5 flex justify-between items-center">
                      <span className="text-[9px] text-slate-400 uppercase">Total Consumo</span>
                      <strong className="text-xs font-mono text-slate-850">${order.total} MXN</strong>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center space-y-2">
                  <Receipt className="w-8 h-8 mx-auto text-slate-200" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Sin cuentas pendientes</p>
                  <p className="text-[11px] text-slate-450">Toda la sala está limpia y pagada.</p>
                </div>
              )}
            </div>
          </div>

          {/* Previous Sales / Print logs drawer */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs space-y-4">
            <div className="flex justify-between items-center border-b pb-1.5">
              <h3 className="text-xs font-bold uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-400" />
                <span>Historial de Cobros Recientes</span>
              </h3>
              <span className="text-[9px] font-bold font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                {sales.length} pagos
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 bg-slate-50/40 rounded-lg border border-slate-100 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono bg-slate-100 text-[10px] px-1.5 py-0.2 rounded font-semibold text-slate-600">
                          {sale.ticketNumber}
                        </span>
                        <strong className="text-slate-800">Mesa {sale.tableNumber}</strong>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        PAGADO CON: <strong className="text-slate-500 uppercase">{sale.paymentMethod}</strong>
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end space-y-1">
                      <strong className="font-mono text-emerald-700">${sale.total.toLocaleString()} MXN</strong>
                      <button
                        type="button"
                        onClick={() => handleReprintReceipt(sale)}
                        className="cursor-pointer text-[9px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center"
                      >
                        <Printer className="w-2.5 h-2.5 mr-0.5" />
                        <span>Comprobante</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 italic text-center py-6">Ninguna venta concretada en esta sesión.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive POS Billing terminal */}
        <div className="lg:col-span-2">
          {activeOrder ? (
            <form onSubmit={handlePaySubmit} className="bg-white rounded-xl border border-slate-100 shadow-xs divide-y divide-slate-100">
              {/* Box title & details */}
              <div className="p-5 flex justify-between items-center bg-slate-50/40">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Consumo Activo del Local</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <h3 className="text-lg font-black text-slate-850">Mesa {activeOrder.tableNumber}</h3>
                    <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                      Cuenta Abierta
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-500 bg-white border px-2 py-1 rounded-md">
                    {activeOrder.ticketNumber}
                  </span>
                </div>
              </div>

              {/* Items Summary list */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Conceptos Consumidos</h4>
                  <span className="text-[10px] text-slate-400">{activeOrder.items.reduce((sum, i) => sum + i.quantity, 0)} platillos ordenados</span>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="text-xs flex justify-between items-center py-1 border-b border-slate-50">
                      <p className="text-slate-650 flex items-center pr-3">
                        <span className="font-mono font-bold text-indigo-600 text-[11px] bg-slate-50 size-5 rounded flex items-center justify-center mr-2">
                          {item.quantity}
                        </span>
                        <span className="font-semibold text-slate-750">{item.dish.name}</span>
                        {item.notes && <span className="text-[9px] bg-amber-50 rounded px-1 text-amber-800 ml-2 italic">"{item.notes}"</span>}
                      </p>
                      <strong className="font-mono text-slate-650 flex-shrink-0">${item.dish.price * item.quantity} MXN</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips & split bill customizer */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/30">
                {/* Propina */}
                <div className="space-y-2.5 text-xs">
                  <label className="text-[10px] uppercase text-slate-400 font-bold block">Añadir Sugerencia de Propina (Servicio)</label>
                  <div className="flex gap-1.5">
                    {[0, 10, 15, 20].map((percent) => (
                      <button
                        key={percent}
                        type="button"
                        onClick={() => setTipPercent(percent)}
                        className={`cursor-pointer flex-1 py-2 rounded-lg font-bold text-center transition-all text-[11px] ${
                          tipPercent === percent
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white border hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        {percent}% {percent === 10 ? '(Est.)' : ''}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-450 italic px-0.5">
                    <span>Propina adicional:</span>
                    <strong className="font-mono text-slate-600 font-bold">+${tipValue} MXN</strong>
                  </div>
                </div>

                {/* Dividir Cuenta */}
                <div className="space-y-2.5 text-xs">
                  <label className="text-[10px] uppercase text-slate-400 font-bold block">¿Salar Cuentas Divididas? (Group Billing)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={splitCount}
                      onChange={(e) => setSplitCount(Number(e.target.value))}
                      className="flex-1 accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                    <span className="font-mono font-bold bg-white border w-14 text-center text-slate-700 py-1 rounded-md text-xs flex-shrink-0">
                      {splitCount} pers.
                    </span>
                  </div>
                  {splitCount > 1 && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-1.5 rounded-lg text-center font-bold text-[10px] leading-tight flex items-center justify-center space-x-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Individual: ${splitAmount.toLocaleString()} MXN</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment methods selection */}
              <div className="p-5 space-y-4">
                <label className="text-[10px] uppercase text-slate-400 font-bold block">Vía de Liquidación (Canal de Pago)</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    disabled={isProcessingCard}
                    onClick={() => {
                      setPaymentMethod('Tarjeta');
                      setCashReceived('');
                    }}
                    className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all text-xs focus:outline-hidden disabled:opacity-50 ${
                      paymentMethod === 'Tarjeta'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-805 ring-1 ring-indigo-400'
                        : 'bg-white border-slate-150 text-slate-500 hover:border-slate-305'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    <span className="font-bold">Tarjeta de C./D.</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessingCard}
                    onClick={() => {
                      setPaymentMethod('Efectivo');
                      setCashReceived('');
                    }}
                    className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all text-xs focus:outline-hidden disabled:opacity-50 ${
                      paymentMethod === 'Efectivo'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-850 ring-1 ring-emerald-400'
                        : 'bg-white border-slate-150 text-slate-500 hover:border-slate-305'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold">Efectivo (Cash)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessingCard}
                    onClick={() => {
                      setPaymentMethod('Transferencia');
                      setCashReceived('');
                    }}
                    className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all text-xs focus:outline-hidden disabled:opacity-50 ${
                      paymentMethod === 'Transferencia'
                        ? 'bg-purple-50 border-purple-400 text-purple-850 ring-1 ring-purple-400'
                        : 'bg-white border-slate-150 text-slate-500 hover:border-slate-355'
                    }`}
                  >
                    <Hash className="w-5 h-5 text-purple-600" />
                    <span className="font-bold">SPEI / Trf.</span>
                  </button>
                </div>

                {/* Cash payment specials */}
                {paymentMethod === 'Efectivo' && (
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-xs leading-normal space-y-3.5 animate-slide-down">
                    <div>
                      <span className="text-[10px] uppercase text-slate-450 font-bold block mb-1">Billetes sugeridos para cobrar rápido:</span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {quickCashOptions.map((qty) => (
                          <button
                            key={qty}
                            type="button"
                            onClick={() => setCashReceived(qty.toString())}
                            className={`cursor-pointer text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border text-slate-705 shadow-3xs transition-all ${
                              Number(cashReceived) === qty 
                                ? 'bg-emerald-600 text-white border-transparent scale-102' 
                                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-350'
                            }`}
                          >
                            ${qty.toLocaleString()} M
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-slate-100">
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase text-slate-550 font-bold">Efectivo Recibido</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            placeholder="Monto recibido del cliente..."
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="w-full text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg py-2 pl-6 pr-3 focus:outline-hidden text-slate-750 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            min={finalTotal}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col justify-center items-end text-right">
                        <span className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Cambio a Entregar (Efectivo)</span>
                        <strong className="text-xl font-mono text-emerald-600 font-bold block">
                          ${changeValue.toLocaleString()} MXN
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* BANK TERMINAL SIMULATOR FOR CARD PAYMENTS */}
                {paymentMethod === 'Tarjeta' && isProcessingCard && (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-3 shadow-md border-2 border-slate-800 animate-slide-down">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-mono font-bold font-display uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                        <Wifi className="w-3.5 h-3.5 text-sky-400 mr-1 animate-pulse" />
                        <span>Terminal SMART-POS Clip Pro v3.0</span>
                      </span>
                      <span className="text-[9px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.2 rounded">NET-OK</span>
                    </div>

                    <div className="flex items-center space-x-3.5 p-1">
                      <div className="size-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-700">
                        {cardStep === 'aprobado' ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400 animate-bounce" />
                        ) : (
                          <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="font-mono text-[10px] text-slate-400 tracking-wider">ESTADO DE COBRO CON TARJETA:</p>
                        <p className="text-xs font-bold text-white">
                          {cardStep === 'conectar' && "🔌 Inicializando pasarela de pago bancaria..."}
                          {cardStep === 'leyendo' && "💳 Leyendo chip NFC/EMV de tarjeta segura..."}
                          {cardStep === 'autorizando' && "⚡ Solicitando autorización de fondos al banco emisor..."}
                          {cardStep === 'aprobado' && "✔ ¡TRANSACCIÓN APROBADA! Código auto: #92015"}
                        </p>
                      </div>
                    </div>

                    <div className="relative w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-sky-500 rounded-full transition-all duration-300 ${
                          cardStep === 'conectar' ? 'w-1/4' :
                          cardStep === 'leyendo' ? 'w-2/4' :
                          cardStep === 'autorizando' ? 'w-4/5' : 'w-full bg-emerald-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout details block */}
              <div className="p-5 bg-slate-50/40 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="text-xs space-y-1 border-r border-slate-100 pr-4">
                  <div className="flex justify-between max-w-[220px]">
                    <span className="text-slate-400">Consumo Neto:</span>
                    <strong className="font-mono text-slate-700">${subtotal.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between max-w-[220px]">
                    <span className="text-slate-400">Propina Sugerida ({tipPercent}%):</span>
                    <strong className="font-mono text-slate-700">+${tipValue.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between max-w-[220px] text-[10px] italic text-slate-400 pt-1 border-t border-slate-100/60">
                    <span>*IVA Incluido en precios</span>
                    <span>16% (${ivaValue.toLocaleString()} MXN)</span>
                  </div>
                </div>

                <div className="text-right flex flex-col justify-center items-end">
                  <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Cargar Importe Total de Factura</span>
                  <strong className="text-2xl font-mono text-slate-800 font-extrabold">${finalTotal.toLocaleString()} MXN</strong>
                  <p className="text-[10px] text-slate-400 mt-1">Sabor & Gestión POS Terminal</p>
                </div>
              </div>

              {/* Process billing action button */}
              <div className="p-5">
                <button
                  type="submit"
                  disabled={isProcessingCard || (paymentMethod === 'Efectivo' && (!cashReceived || Number(cashReceived) < finalTotal))}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-slate-50 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {isProcessingCard ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Conectando con Terminal Clip Bancaria...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Cobrar y Registrar Mesa ({paymentMethod})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 p-20 text-center text-slate-400 flex flex-col items-center justify-center h-full min-h-[460px] space-y-4">
              <Receipt className="w-12 h-12 text-slate-205" />
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Esperando Mesa</h3>
                <p className="text-xs max-w-sm mt-1 leading-relaxed text-slate-400">Selecciona un comensal abierto tocando el plano interactivo de la sala arriba para cargar el ticket, elegir propina y emitir la factura fiscal.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VINTAGE THERMAL RECEIPT MODAL */}
      {showReceiptModal && currentReceiptData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border rounded-2xl shadow-2xl p-6 max-w-sm w-full relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Vintage style thermal ticket wrapper */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(to_right,#ccc_33%,transparent_33%)] bg-[length:6px_1px]"></div>
              
              <div className="space-y-1">
                <span className="text-[9px] font-bold tracking-tight text-white bg-slate-800 px-2 py-0.5 rounded-sm inline-block">COMPROBANTE DE PAGO</span>
                <h3 className="text-[13px] font-bold pt-1">SABOR & GESTIÓN S.A. DE C.V.</h3>
                <p className="text-[9px] text-slate-500">RESTAURANTE DE FUSIÓN DE ALTA GAMA</p>
                <p className="text-[9px] text-slate-400">AV. REFORMA S/N, CIUDAD DE MÉXICO</p>
                <p className="text-[9px] text-slate-450 font-semibold uppercase">RFC: SGE-260526-ME1</p>
              </div>

              <div className="border-t border-b border-dashed border-slate-350 py-2.5 text-left space-y-1 text-[10px]">
                <p>RECIBO TICKET: <strong className="float-right text-slate-800 font-bold">{currentReceiptData.ticketNumber}</strong></p>
                <p>FECHA: <span className="float-right text-slate-700">{new Date(currentReceiptData.createdAt || Date.now()).toLocaleString()}</span></p>
                <p>MESA: <span className="float-right text-slate-800 font-bold">Mesa #{currentReceiptData.tableNumber}</span></p>
                <p>MESERO: <span className="float-right text-slate-700">{currentReceiptData.waiterName}</span></p>
                <p>CLIENTE: <span className="float-right text-slate-700 truncate max-w-[130px] font-semibold">{currentReceiptData.clientName || 'Cliente de Piso'}</span></p>
                <p>METODO PAGO: <span className="float-right text-emerald-700 font-bold uppercase">{currentReceiptData.paymentMethod}</span></p>
              </div>

              {/* Items listing */}
              <div className="space-y-1.5 text-left border-b border-dashed border-slate-350 pb-2.5">
                <div className="flex justify-between text-[9px] uppercase font-bold text-slate-450">
                  <span>Platillo / Cant</span>
                  <span>PRECIO</span>
                </div>
                {currentReceiptData.items.length > 0 ? (
                  currentReceiptData.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-750">
                      <span className="truncate max-w-[200px] font-medium">
                        {it.quantity}x {it.dish.name}
                      </span>
                      <span className="font-mono text-slate-700">${(it.dish.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between text-[11px] text-slate-755 font-semibold">
                    <span>Consumo Consolidado</span>
                    <span className="font-mono">${(currentReceiptData.total).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Values block with tips & VAT (IVA) detailed */}
              <div className="text-right space-y-1.5 text-[10px] pb-2 border-b border-dashed border-slate-350">
                <div className="flex justify-between">
                  <span className="text-slate-450">Consumo Base:</span>
                  <span className="font-mono font-bold">${currentReceiptData.total.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Propina de Servicio ({savedTipPercent}%):</span>
                  <span className="font-mono font-bold">+${Math.round(currentReceiptData.total * (savedTipPercent / 100)).toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 italic">
                  <span>*IVA Incluido en precios</span>
                  <span>16% (${Math.round(currentReceiptData.total * 0.16).toLocaleString()} MXN)</span>
                </div>
                <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200 text-slate-900 uppercase">
                  <strong>Total Pagado:</strong>
                  <strong className="font-mono font-extrabold text-emerald-705 text-sm">${calculatedFinalTotal.toLocaleString()} MXN</strong>
                </div>
              </div>

              {/* Loyalty reward points if any linked customer */}
              {currentReceiptData.clientId && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-center py-2 px-2.5 rounded-lg text-[10px] space-y-0.5 leading-tight">
                  <p className="font-bold">✨ ¡Cliente Frecuente Identificado! ✨</p>
                  <p>Has ganado <strong className="font-bold underline">+{Math.round(calculatedFinalTotal * 0.1)} puntos</strong> en tu monedero de fidelidad para próximas visitas.</p>
                </div>
              )}

              {/* Barcode representation */}
              <div className="space-y-1 pt-1">
                <div className="h-6 bg-linear-to-r from-black via-slate-700 to-black w-3/4 mx-auto flex items-center justify-center">
                  <span className="text-[7px] text-white tracking-[7px] font-bold select-none">||||||||||||||||||||</span>
                </div>
                <p className="text-[8px] tracking-widest text-slate-400 font-mono">POS-SGE-#{Date.now().toString().slice(-7)}</p>
              </div>

              <p className="text-[9px] italic text-slate-400 pt-1 leading-normal">
                *** GRACIAS POR GUSTAR DE CULINARIA PREMIUM ***<br />
                SABOR & GESTIÓN VALORA SU PREFERENCIA
              </p>
            </div>

            <div className="mt-5 flex space-x-2.5">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="cursor-pointer flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Recibo</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="cursor-pointer flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-all shadow-sm"
              >
                Cerrar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
