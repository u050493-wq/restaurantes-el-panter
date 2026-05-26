/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Staff, Dish, Client, Order, Sale } from './types';

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'st-1',
    name: 'Carlos Mendoza',
    role: 'mesero',
    status: 'disponible',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '55-1234-5678',
    salary: 8500,
    joinDate: '2024-02-15',
    password: '1234',
  },
  {
    id: 'st-2',
    name: 'Sofía Rodríguez',
    role: 'mesero',
    status: 'ocupado',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '55-8765-4321',
    salary: 8500,
    joinDate: '2024-05-10',
    password: '1234',
  },
  {
    id: 'st-3',
    name: 'Gustavo Ortega',
    role: 'chef',
    status: 'disponible',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    phone: '55-9988-7766',
    salary: 18000,
    joinDate: '2023-08-01',
    password: '1234',
  },
  {
    id: 'st-4',
    name: 'Elena Gómez',
    role: 'chef',
    status: 'disponible',
    avatar: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150&auto=format&fit=crop&q=80',
    phone: '55-5544-3322',
    salary: 16500,
    joinDate: '2024-01-20',
    password: '1234',
  },
  {
    id: 'st-5',
    name: 'Alejandra Pérez',
    role: 'administrador',
    status: 'disponible',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '55-1122-3344',
    salary: 22000,
    joinDate: '2023-01-10',
    password: '1234',
  },
];

export const INITIAL_DISHES: Dish[] = [
  // Entradas
  {
    id: 'd-1',
    name: 'Guacamole Premium',
    description: 'Guacamole fresco machacado en molcajete con cilantro, cebolla, chile serrano y totopos crujientes de la casa.',
    price: 135,
    category: 'Entradas',
    available: true,
    preparationTime: 8,
  },
  {
    id: 'd-2',
    name: 'Queso Fundido con Chorizo',
    description: 'Mezcla cremosa de quesos asadero y Oaxaca fundidos, servido con chorizo artesanal y tortillas de harina calientes.',
    price: 155,
    category: 'Entradas',
    available: true,
    preparationTime: 10,
  },
  {
    id: 'd-3',
    name: 'Calamares Fritos al Ajillo',
    description: 'Anillos de calamar crujientes sazonados con ajo, guajillo dorado y un toque de limón real.',
    price: 185,
    category: 'Entradas',
    available: true,
    preparationTime: 12,
  },

  // Platos Fuertes
  {
    id: 'd-4',
    name: 'Tacos de Rib Eye (3 pzas)',
    description: 'Rib eye premium a la parrilla sobre tortillas de maíz taqueras con cebollitas asadas, aguacate y salsa macha aparte.',
    price: 260,
    category: 'Platos Fuertes',
    available: true,
    preparationTime: 15,
  },
  {
    id: 'd-5',
    name: 'Salmón Glaseado al Chipotle',
    description: 'Filete de salmón fresco con un glaseado agridulce de chipotle, servido sobre puré de camote rústico y espárragos asados.',
    price: 320,
    category: 'Platos Fuertes',
    available: true,
    preparationTime: 18,
  },
  {
    id: 'd-6',
    name: 'Enchiladas de Mole Poblano',
    description: 'Tres enchiladas rellenas de pollo deshebrado, bañadas en mole poblano artesanal con ajonjolí, crema fresca y queso cotija.',
    price: 195,
    category: 'Platos Fuertes',
    available: true,
    preparationTime: 12,
  },
  {
    id: 'd-7',
    name: 'Corte New York Steak',
    description: 'Corte New York de res de 350g cocinado al término deseado, acompañado de papas gajo al romero y chiles toreados.',
    price: 390,
    category: 'Platos Fuertes',
    available: true,
    preparationTime: 20,
  },

  // Postres
  {
    id: 'd-8',
    name: 'Flan de Elote Rústico',
    description: 'Flan casero horneado con elote tierno dulce y un sutil espejo de caramelo de piloncillo.',
    price: 95,
    category: 'Postres',
    available: true,
    preparationTime: 5,
  },
  {
    id: 'd-9',
    name: 'Pastel de Tres Leches con Rompope',
    description: 'Pastel húmedo de vainilla bañado en nuestra receta de tres leches perfumada con rompope de vainilla mexicano.',
    price: 110,
    category: 'Postres',
    available: true,
    preparationTime: 5,
  },
  {
    id: 'd-10',
    name: 'Volcán de Chocolate con Nuez',
    description: 'Pastelito de chocolate tibio con centro líquido fluido, acompañado de helado de vainilla de Papantla.',
    price: 125,
    category: 'Postres',
    available: true,
    preparationTime: 12,
  },

  // Bebidas
  {
    id: 'd-11',
    name: 'Margarita de Mezcal Artesanal',
    description: 'Cóctel refrescante con mezcal espadín, jugo de limón fresco, licor de naranja y escarchado con sal de gusano.',
    price: 140,
    category: 'Bebidas',
    available: true,
    preparationTime: 6,
  },
  {
    id: 'd-12',
    name: 'Agua de Jamaica Orgánica',
    description: 'Agua infusionada fría de flor de jamaica premium, ligeramente endulzada con agave, opción de menta fresca.',
    price: 55,
    category: 'Bebidas',
    available: true,
    preparationTime: 3,
  },
  {
    id: 'd-13',
    name: 'Cerveza Artesanal Porter',
    description: 'Cerveza oscura local con notas pronunciadas a café tostado, cacao y un amargor balanceado.',
    price: 85,
    category: 'Bebidas',
    available: true,
    preparationTime: 2,
  },
  {
    id: 'd-14',
    name: 'Limonada Mineral con Chia',
    description: 'Agua mineral gasificada con jugo de limón fresco prensado al momento y semillas de chía hidratadas.',
    price: 60,
    category: 'Bebidas',
    available: true,
    preparationTime: 3,
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c-1',
    name: 'Francisco Javier',
    phone: '55-2233-4455',
    email: 'fjavier@gmail.com',
    visits: 12,
    loyaltyPoints: 120,
    notes: 'Cliente frecuente de los viernes. Prefiere mesas de terraza, le gusta mucho el Rib Eye bien cocido y las Margaritas.',
    lastVisit: '2026-05-24',
  },
  {
    id: 'c-2',
    name: 'Mariana Elizondo',
    phone: '55-6677-8899',
    email: 'mariana.eli@outlook.com',
    visits: 8,
    loyaltyPoints: 80,
    notes: 'Vegetariana flexible (pide platillos sin carne o mariscos). Alérgica a las nueces.',
    lastVisit: '2026-05-25',
  },
  {
    id: 'c-3',
    name: 'Juan Pablo Ortiz',
    phone: '55-5555-5555',
    email: 'jportiz@empresa.com',
    visits: 25,
    loyaltyPoints: 340,
    notes: 'Cliente corporativo vip. Paga siempre con Tarjeta de Crédito corporativa y solicita factura detallada.',
    lastVisit: '2026-05-26',
  },
  {
    id: 'c-4',
    name: 'Sofía Caballero',
    phone: '55-4433-2211',
    email: 'sof.caballero@live.com.mx',
    visits: 3,
    loyaltyPoints: 30,
    notes: 'Viene acompañada de niños pequeños. Solicita silla alta.',
    lastVisit: '2026-05-18',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'o-1',
    ticketNumber: 'COM-101',
    tableNumber: 4,
    waiterId: 'st-1',
    waiterName: 'Carlos Mendoza',
    chefId: 'st-3',
    chefName: 'Gustavo Ortega',
    clientId: 'c-1',
    clientName: 'Francisco Javier',
    items: [
      {
        dish: INITIAL_DISHES[3], // Tacos Rib Eye
        quantity: 2,
        notes: 'Bien cocidos por favor',
      },
      {
        dish: INITIAL_DISHES[10], // Margarita Mezcal
        quantity: 2,
      },
      {
        dish: INITIAL_DISHES[0], // Guacamole
        quantity: 1,
      }
    ],
    status: 'Listo para Servir',
    total: 790,
    createdAt: '2026-05-26T03:45:00Z',
  },
  {
    id: 'o-2',
    ticketNumber: 'COM-102',
    tableNumber: 8,
    waiterId: 'st-2',
    waiterName: 'Sofía Rodríguez',
    chefId: 'st-4',
    chefName: 'Elena Gómez',
    clientId: 'c-2',
    clientName: 'Mariana Elizondo',
    items: [
      {
        dish: INITIAL_DISHES[4], // Salmon
        quantity: 1,
        notes: 'Sin espárragos, doble puré de camote',
      },
      {
        dish: INITIAL_DISHES[11], // Agua Jamaica
        quantity: 1,
      },
      {
        dish: INITIAL_DISHES[7], // Flan de elote
        quantity: 1,
      }
    ],
    status: 'En Cocina',
    total: 470,
    createdAt: '2026-05-26T04:15:00Z',
  },
  {
    id: 'o-3',
    ticketNumber: 'COM-103',
    tableNumber: 12,
    waiterId: 'st-1',
    waiterName: 'Carlos Mendoza',
    items: [
      {
        dish: INITIAL_DISHES[1], // Queso fundido
        quantity: 1,
      },
      {
        dish: INITIAL_DISHES[12], // Cerveza Porter
        quantity: 2,
      }
    ],
    status: 'Recibido',
    total: 325,
    createdAt: '2026-05-26T04:30:00Z',
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sa-1',
    orderId: 'o-old-1',
    ticketNumber: 'COM-098',
    waiterName: 'Carlos Mendoza',
    tableNumber: 5,
    total: 1045,
    paymentMethod: 'Tarjeta',
    date: '2026-05-25T14:30:00Z',
    itemsCount: 5,
  },
  {
    id: 'sa-2',
    orderId: 'o-old-2',
    ticketNumber: 'COM-099',
    waiterName: 'Sofía Rodríguez',
    tableNumber: 2,
    total: 515,
    paymentMethod: 'Efectivo',
    date: '2026-05-25T16:10:00Z',
    itemsCount: 3,
  },
  {
    id: 'sa-3',
    orderId: 'o-old-3',
    ticketNumber: 'COM-100',
    waiterName: 'Carlos Mendoza',
    tableNumber: 1,
    total: 820,
    paymentMethod: 'Tarjeta',
    date: '2026-05-25T21:40:00Z',
    itemsCount: 4,
  },
  {
    id: 'sa-4',
    orderId: 'o-old-4',
    ticketNumber: 'COM-095',
    waiterName: 'Sofía Rodríguez',
    tableNumber: 10,
    total: 1250,
    paymentMethod: 'Transferencia',
    date: '2026-05-24T15:20:00Z',
    itemsCount: 6,
  },
  {
    id: 'sa-5',
    orderId: 'o-old-5',
    ticketNumber: 'COM-096',
    waiterName: 'Sofía Rodríguez',
    tableNumber: 3,
    total: 680,
    paymentMethod: 'Efectivo',
    date: '2026-05-24T18:45:00Z',
    itemsCount: 3,
  },
  {
    id: 'sa-6',
    orderId: 'o-old-6',
    ticketNumber: 'COM-097',
    waiterName: 'Carlos Mendoza',
    tableNumber: 9,
    total: 345,
    paymentMethod: 'Tarjeta',
    date: '2026-05-24T20:10:00Z',
    itemsCount: 2,
  },
  {
    id: 'sa-7',
    orderId: 'o-old-7',
    ticketNumber: 'COM-090',
    waiterName: 'Carlos Mendoza',
    tableNumber: 6,
    total: 2100,
    paymentMethod: 'Tarjeta',
    date: '2026-05-23T15:00:00Z',
    itemsCount: 8,
  },
  {
    id: 'sa-8',
    orderId: 'o-old-8',
    ticketNumber: 'COM-091',
    waiterName: 'Sofía Rodríguez',
    tableNumber: 4,
    total: 940,
    paymentMethod: 'Efectivo',
    date: '2026-05-23T20:30:00Z',
    itemsCount: 5,
  },
];
