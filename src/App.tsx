/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Staff, Dish, Client, Order, Sale, StaffStatus, Category, StaffShift, WaiterCall } from './types';
import { 
  INITIAL_STAFF, 
  INITIAL_DISHES, 
  INITIAL_CLIENTS, 
  INITIAL_ORDERS, 
  INITIAL_SALES 
} from './data';

import Dashboard from './components/Dashboard';
import WaiterPanel from './components/WaiterPanel';
import ChefPanel from './components/ChefPanel';
import BillingPanel from './components/BillingPanel';
import MenuPanel from './components/MenuPanel';
import StaffPanel from './components/StaffPanel';
import ClientPanel from './components/ClientPanel';
import ClientQRMenu from './components/ClientQRMenu';
import LoginPanel from './components/LoginPanel';

import { 
  TrendingUp, 
  Utensils, 
  Flame, 
  DollarSign, 
  MenuSquare, 
  Users, 
  UserSquare, 
  Store,
  Bell,
  Clock,
  Sparkles,
  QrCode,
  Shield,
  LogOut
} from 'lucide-react';

export default function App() {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<
    'inicio' | 'comandas' | 'cocina' | 'caja' | 'menu' | 'personal' | 'clientes' | 'qr_menu'
  >('inicio');

  // Core App Persistent States
  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('sabor_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [dishes, setDishes] = useState<Dish[]>(() => {
    const saved = localStorage.getItem('sabor_dishes');
    return saved ? JSON.parse(saved) : INITIAL_DISHES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('sabor_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sabor_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('sabor_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [shifts, setShifts] = useState<StaffShift[]>(() => {
    const saved = localStorage.getItem('sabor_shifts');
    return saved ? JSON.parse(saved) : [];
  });

  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>(() => {
    const saved = localStorage.getItem('sabor_waiter_calls');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<Staff | null>(() => {
    const saved = localStorage.getItem('sabor_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [withdrawnTips, setWithdrawnTips] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('sabor_withdrawn_tips');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('sabor_withdrawn_tips', JSON.stringify(withdrawnTips));
  }, [withdrawnTips]);

  // Persist edits to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sabor_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sabor_current_user');
    }
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('sabor_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('sabor_dishes', JSON.stringify(dishes));
  }, [dishes]);

  useEffect(() => {
    localStorage.setItem('sabor_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('sabor_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sabor_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('sabor_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('sabor_waiter_calls', JSON.stringify(waiterCalls));
  }, [waiterCalls]);

  // -- STATE CHANGE ACTIONS --

  // 1. ORDERS / TICKET CONTROLS
  const handleCreateOrder = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
  };

  const handleUpdateOrderStatus = (
    orderId: string, 
    status: Order['status'], 
    chefId?: string, 
    chefName?: string
  ) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          ...(chefId ? { chefId, chefName } : {})
        };
      }
      return o;
    }));
  };

  const handleProcessPayment = (
    orderId: string, 
    paymentMethod: Sale['paymentMethod'], 
    finalTotal: number,
    tipAmount?: number
  ) => {
    const orderToPay = orders.find(o => o.id === orderId);
    if (!orderToPay) return;

    // Create a new Sale entry
    const newSale: Sale = {
      id: `sa-${Date.now()}`,
      orderId,
      ticketNumber: orderToPay.ticketNumber,
      waiterName: orderToPay.waiterName,
      tableNumber: orderToPay.tableNumber,
      total: orderToPay.total, // base amount or custom final total
      paymentMethod,
      date: new Date().toISOString(),
      itemsCount: orderToPay.items.reduce((acc, it) => acc + it.quantity, 0),
      tip: tipAmount || 0,
      waiterId: orderToPay.waiterId
    };

    setSales([newSale, ...sales]);

    // Set order status as Paid (Cobrado)
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Cobrado', paymentMethod } : o));

    // If client is linked, increment visits and add loyalty points (10% of total)
    if (orderToPay.clientId) {
      setClients(clients.map(c => {
        if (c.id === orderToPay.clientId) {
          return {
            ...c,
            visits: c.visits + 1,
            loyaltyPoints: c.loyaltyPoints + Math.round(finalTotal * 0.1),
            lastVisit: new Date().toISOString().split('T')[0]
          };
        }
        return c;
      }));
    }
  };

  const handleCollectTips = (waiterName: string) => {
    const earned = sales
      .filter(s => s.waiterName === waiterName)
      .reduce((sum, s) => sum + (s.tip || 0), 0);
    
    const withdrawn = withdrawnTips[waiterName] || 0;
    const available = Math.max(0, earned - withdrawn);

    if (available <= 0) return;

    setWithdrawnTips(prev => ({
      ...prev,
      [waiterName]: (prev[waiterName] || 0) + available
    }));
  };

  // 2. DISHES / MENU CONTROLS
  const handleAddDish = (dish: Dish) => {
    setDishes([dish, ...dishes]);
  };

  const handleEditDish = (updatedDish: Dish) => {
    setDishes(dishes.map(d => d.id === updatedDish.id ? updatedDish : d));
  };

  const handleDeleteDish = (dishId: string) => {
    setDishes(dishes.filter(d => d.id !== dishId));
  };

  // 3. STAFF CONTROLS
  const handleAddStaff = (newMember: Staff) => {
    setStaff([newMember, ...staff]);
  };

  const handleUpdateStaffStatus = (staffId: string, status: StaffStatus) => {
    setStaff(staff.map(s => s.id === staffId ? { ...s, status } : s));
  };

  // 4. CLIENTS CONTROLS
  const handleAddClient = (newClient: Client) => {
    setClients([newClient, ...clients]);
  };

  // 5. STAFF SHIFTS & SPECIAL PERMISSIONS CONTROLS
  const handleUpdateStaffPermissions = (staffId: string, permissions: string[]) => {
    setStaff(staff.map(s => s.id === staffId ? { ...s, permissions } : s));
  };

  const handleRegisterShift = (newShift: StaffShift) => {
    setShifts([...shifts, newShift]);
  };

  // 5.5. STAFF SESSION CONTROLS
  const handleLogin = (user: Staff) => {
    setCurrentUser(user);
    if (user.role === 'mesero') {
      setActiveTab('comandas');
    } else if (user.role === 'chef') {
      setActiveTab('cocina');
    } else if (user.role === 'cliente') {
      setActiveTab('qr_menu');
    } else {
      setActiveTab('inicio');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('inicio');
  };

  // 6. CUSTOMER TABLE CALL SERVICE HANDLING
  const handleTriggerCall = (tableNumber: number, type: WaiterCall['type']) => {
    const newCall: WaiterCall = {
      id: `call-${Date.now()}`,
      tableNumber,
      type,
      status: 'pendiente',
      createdAt: new Date().toISOString()
    };
    setWaiterCalls([newCall, ...waiterCalls]);
  };

  const handleResolveCall = (callId: string) => {
    setWaiterCalls(waiterCalls.map(c => c.id === callId ? { ...c, status: 'atendido' } : c));
  };

  if (!currentUser) {
    return <LoginPanel staff={staff} onLogin={handleLogin} />;
  }

  const isMesero = currentUser.role === 'mesero';
  const isChef = currentUser.role === 'chef';
  const isAdmin = currentUser.role === 'administrador';
  const isClient = currentUser.role === 'cliente';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" id="app_container">
      {/* SIDEBAR CONSOLE */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex-shrink-0 flex flex-col justify-between border-r border-slate-850 shadow-md">
        <div className="space-y-5 p-5">
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-3 border-b border-slate-850 pb-4">
            <div className="p-2 bg-emerald-500 rounded-xl text-slate-950">
              <Store className="w-5 h-5 shadow-xs" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display tracking-tight text-slate-100">Sabor & Gestión</h2>
              <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold font-mono">Control Suite</span>
            </div>
          </div>

          {/* Active Employee Session Badge */}
          <div className="bg-slate-800/40 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <img 
                referrerPolicy="no-referrer" 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-8 h-8 rounded-full object-cover border border-emerald-400 flex-shrink-0" 
              />
              <div className="overflow-hidden">
                <p className="text-xs font-black text-white truncate leading-tight">{currentUser.name}</p>
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold font-mono block mt-0.5">
                  {currentUser.role === 'mesero' ? 'Mesero' : currentUser.role === 'chef' ? 'Chef' : currentUser.role === 'cliente' ? 'Comensal' : 'Administrador'}
                </span>
              </div>
            </div>
            <button 
              type="button" 
              onClick={handleLogout} 
              title="Cerrar Sesión / Bloquear Pantalla"
              className="cursor-pointer p-1.5 text-slate-400 hover:text-rose-450 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Nav Categories */}
          <div className="space-y-1.5" id="nav_menu_list">
            {/* Show Admin/Corp controls only if role matches */}
            {isAdmin && (
              <>
                <p className="text-[10px] tracking-wider uppercase text-slate-500 font-bold px-2.5">Corporativo</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('inicio')}
                  className={`w-full text-xs font-semibold py-2 px-3 rounded-lg flex items-center space-x-3 transition-colors cursor-pointer ${
                    activeTab === 'inicio' ? 'bg-emerald-600 text-slate-55 shadow-xs' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Dashboard Financiero</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className={`w-full text-xs font-semibold py-2 px-3 rounded-lg flex items-center space-x-3 transition-colors cursor-pointer ${
                    activeTab === 'menu' ? 'bg-emerald-600 text-slate-55 shadow-xs' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <MenuSquare className="w-4 h-4" />
                  <span>Gestión de Menú</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('personal')}
                  className={`w-full text-xs font-semibold py-2 px-3 rounded-lg flex items-center space-x-3 transition-colors cursor-pointer ${
                    activeTab === 'personal' ? 'bg-emerald-600 text-slate-55 shadow-xs' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Personal (Nóminas)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('clientes')}
                  className={`w-full text-xs font-semibold py-2 px-3 rounded-lg flex items-center space-x-3 transition-colors cursor-pointer ${
                    activeTab === 'clientes' ? 'bg-emerald-600 text-slate-55 shadow-xs' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <UserSquare className="w-4 h-4" />
                  <span>Cartera Clientes CRM</span>
                </button>
              </>
            )}

            {/* Waiter specific controls or admin access */}
            {(isAdmin || isMesero) && (
              <>
                <p className="text-[10px] tracking-wider uppercase text-slate-505 font-bold px-2.5 pt-3">Operación Sala</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('comandas')}
                  className={`w-full text-xs font-semibold py-2 px-3 rounded-lg flex items-center space-x-3 transition-colors cursor-pointer ${
                    activeTab === 'comandas' ? 'bg-emerald-600 text-slate-55 shadow-xs' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Utensils className="w-4 h-4 text-emerald-400" />
                  <span>Meseros (Comandas)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('caja')}
                  className={`w-full text-xs font-semibold py-2 px-3 rounded-lg flex items-center space-x-3 transition-colors cursor-pointer ${
                    activeTab === 'caja' ? 'bg-emerald-600 text-slate-55 shadow-xs' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-yellow-500 animate-pulse" />
                  <span>Cobrar Mesa (Caja)</span>
                  {orders.filter(o => o.status === 'Listo para Servir' || o.status === 'Entregado').length > 0 && (
                    <span className="bg-emerald-500 text-slate-900 size-4.5 text-[9px] font-bold rounded-full flex items-center justify-center ml-auto">
                      {orders.filter(o => o.status === 'Listo para Servir' || o.status === 'Entregado').length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('qr_menu')}
                  className={`w-full text-xs font-semibold py-2 px-3 rounded-lg flex items-center space-x-3 transition-colors cursor-pointer ${
                    activeTab === 'qr_menu' ? 'bg-emerald-600 text-slate-55 shadow-xs' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-400 font-bold" />
                  <span>Auto-Servicio QR</span>
                </button>
              </>
            )}

            {/* Chef specific controls or admin access */}
            {(isAdmin || isChef) && (
              <>
                <p className="text-[10px] tracking-wider uppercase text-slate-505 font-bold px-2.5 pt-3">Operación Cocina</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('cocina')}
                  className={`w-full text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center space-x-3 transition-colors cursor-pointer relative ${
                    activeTab === 'cocina' ? 'bg-emerald-600 text-slate-50 shadow-xs' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Monitor Cocina (Platillos)</span>
                  {orders.filter(o => o.status === 'Recibido').length > 0 && (
                    <span className="bg-orange-500 text-slate-100 size-4.5 text-[9px] font-bold rounded-full flex items-center justify-center ml-auto">
                      {orders.filter(o => o.status === 'Recibido').length}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Client specific controls */}
            {isClient && (
              <>
                <p className="text-[10px] tracking-wider uppercase text-slate-505 font-bold px-2.5 pt-3">Mi Mesa</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('qr_menu')}
                  className={`w-full text-xs font-semibold py-2 px-3 rounded-lg flex items-center space-x-3 transition-colors cursor-pointer ${
                    activeTab === 'qr_menu' ? 'bg-emerald-600 text-slate-50 shadow-xs' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-300 font-bold" />
                  <span>Auto-Servicio QR</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer credentials info */}
        <div className="p-4 bg-slate-950/40 border-t border-slate-850 text-center text-[10px] text-slate-500 leading-normal space-y-1">
          <p>Licencia: <strong className="text-slate-455">Restaurante Premium</strong></p>
          <div className="flex items-center justify-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Establecimiento Conectado</span>
          </div>
        </div>
      </aside>

      {/* CORE DISPLAY STAGE */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {isAdmin && activeTab === 'inicio' && (
          <Dashboard 
            sales={sales} 
            orders={orders} 
            staff={staff} 
            dishes={dishes} 
            shifts={shifts}
          />
        )}
        {isAdmin && activeTab === 'menu' && (
          <MenuPanel 
            dishes={dishes} 
            onAddDish={handleAddDish} 
            onEditDish={handleEditDish} 
            onDeleteDish={handleDeleteDish} 
          />
        )}
        {isAdmin && activeTab === 'personal' && (
          <StaffPanel 
            staff={staff} 
            onAddStaff={handleAddStaff} 
            onUpdateStaffStatus={handleUpdateStaffStatus} 
            onUpdateStaffPermissions={handleUpdateStaffPermissions}
            shifts={shifts}
            onRegisterShift={handleRegisterShift}
          />
        )}
        {isAdmin && activeTab === 'clientes' && (
          <ClientPanel 
            clients={clients} 
            onAddClient={handleAddClient} 
          />
        )}
        {activeTab === 'qr_menu' && (
          <ClientQRMenu 
            dishes={dishes}
            activeCalls={waiterCalls}
            onTriggerCall={handleTriggerCall}
            orders={orders}
            onCreateOrder={handleCreateOrder}
            onProcessPayment={handleProcessPayment}
            staff={staff}
          />
        )}
        {(isAdmin || isMesero) && activeTab === 'comandas' && (
          <WaiterPanel 
            staff={staff} 
            dishes={dishes} 
            clients={clients} 
            orders={orders} 
            onCreateOrder={handleCreateOrder} 
            onUpdateOrderStatus={handleUpdateOrderStatus} 
            onProcessPayment={handleProcessPayment}
            activeCalls={waiterCalls}
            onResolveCall={handleResolveCall}
            currentUser={currentUser}
            sales={sales}
            withdrawnTips={withdrawnTips}
            onCollectTips={handleCollectTips}
          />
        )}
        {(isAdmin || isChef) && activeTab === 'cocina' && (
          <ChefPanel 
            staff={staff} 
            orders={orders} 
            onUpdateOrderStatus={handleUpdateOrderStatus} 
            dishes={dishes}
          />
        )}
        {(isAdmin || isMesero) && activeTab === 'caja' && (
          <BillingPanel 
            orders={orders} 
            clients={clients} 
            sales={sales}
            onProcessPayment={handleProcessPayment} 
          />
        )}
      </main>
    </div>
  );
}
