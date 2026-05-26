/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'chef' | 'mesero' | 'administrador' | 'cajero' | 'cliente';
export type StaffStatus = 'disponible' | 'ocupado' | 'inactivo';

export interface StaffShift {
  id: string;
  staffId: string;
  staffName: string;
  role: Role;
  type: 'entrada' | 'salida';
  timestamp: string;
}

export interface WaiterCall {
  id: string;
  tableNumber: number;
  type: 'servicio' | 'cuenta' | 'orden';
  status: 'pendiente' | 'atendido';
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: Role;
  status: StaffStatus;
  avatar: string;
  phone: string;
  salary: number;
  joinDate: string;
  permissions?: string[]; // permissions list managed per member
  password?: string; // Access PIN or password created by admin
}

export type Category = 'Entradas' | 'Platos Fuertes' | 'Postres' | 'Bebidas';

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  available: boolean;
  preparationTime: number; // in minutes
  imageUrl?: string;
}

export type OrderStatus = 'Recibido' | 'En Cocina' | 'Listo para Servir' | 'Entregado' | 'Cobrado';

export interface OrderItem {
  dish: Dish;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  ticketNumber: string; // e.g. "COM-104"
  tableNumber: number;
  waiterId: string;
  waiterName: string;
  chefId?: string;
  chefName?: string;
  clientId?: string;
  clientName?: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
  notes?: string;
  paymentMethod?: 'Efectivo' | 'Tarjeta' | 'Transferencia';
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  loyaltyPoints: number;
  notes?: string;
  lastVisit?: string;
}

export interface Sale {
  id: string;
  orderId: string;
  ticketNumber: string;
  waiterName: string;
  tableNumber: number;
  total: number;
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  date: string;
  itemsCount: number;
  tip?: number;
  waiterId?: string;
}
