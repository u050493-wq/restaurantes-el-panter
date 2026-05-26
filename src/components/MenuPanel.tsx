/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dish, Category } from '../types';
import { Search, Plus, Filter, Trash2, Edit2, Check, X, Tag } from 'lucide-react';

interface MenuPanelProps {
  dishes: Dish[];
  onAddDish: (dish: Dish) => void;
  onEditDish: (dish: Dish) => void;
  onDeleteDish: (dishId: string) => void;
}

export default function MenuPanel({ dishes, onAddDish, onEditDish, onDeleteDish }: MenuPanelProps) {
  const [activeTab, setActiveTab] = useState<'visualizar' | 'crear'>('visualizar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'Todo' | Category>('Todo');
  
  // Form State
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishPrice, setDishPrice] = useState<number>(100);
  const [dishCategory, setDishCategory] = useState<Category>('Platos Fuertes');
  const [dishAvailable, setDishAvailable] = useState(true);
  const [dishPrepTime, setDishPrepTime] = useState<number>(15);

  const resetForm = () => {
    setEditingDishId(null);
    setDishName('');
    setDishDescription('');
    setDishPrice(100);
    setDishCategory('Platos Fuertes');
    setDishAvailable(true);
    setDishPrepTime(15);
  };

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim() || !dishDescription.trim()) {
      alert("Por favor completa los campos principales.");
      return;
    }

    if (editingDishId) {
      const updated: Dish = {
        id: editingDishId,
        name: dishName,
        description: dishDescription,
        price: Number(dishPrice),
        category: dishCategory,
        available: dishAvailable,
        preparationTime: Number(dishPrepTime),
      };
      onEditDish(updated);
    } else {
      const created: Dish = {
        id: `d-${Date.now()}`,
        name: dishName,
        description: dishDescription,
        price: Number(dishPrice),
        category: dishCategory,
        available: dishAvailable,
        preparationTime: Number(dishPrepTime),
      };
      onAddDish(created);
    }

    resetForm();
    setActiveTab('visualizar');
  };

  const handleEditInit = (dish: Dish) => {
    setEditingDishId(dish.id);
    setDishName(dish.name);
    setDishDescription(dish.description);
    setDishPrice(dish.price);
    setDishCategory(dish.category);
    setDishAvailable(dish.available);
    setDishPrepTime(dish.preparationTime);
    
    setActiveTab('crear');
  };

  // Filter lists
  const filteredDishes = dishes.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'Todo' || d.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="menu_panel">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-800">Menú del Restaurante (Platillos)</h1>
          <p className="text-sm text-slate-500">Gestión de la carta comercial, categorización de alimentos y precios.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setActiveTab('visualizar');
            }}
            className={`cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'visualizar' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Carta General
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setActiveTab('crear');
            }}
            className={`cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'crear' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {editingDishId ? 'Editar Platillo' : '+ Añadir Platillo'}
          </button>
        </div>
      </div>

      {activeTab === 'visualizar' ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative text-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o ingredientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-lg focus:outline-hidden"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
              {['Todo', 'Entradas', 'Platos Fuertes', 'Postres', 'Bebidas'].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(category as any)}
                  className={`cursor-pointer text-[11px] font-bold py-1.5 px-3 rounded-md transition-colors whitespace-nowrap ${
                    selectedCategoryFilter === category
                      ? 'bg-emerald-600 text-slate-50 shadow-xs'
                      : 'bg-white text-slate-500 border border-slate-205 hover:bg-slate-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDishes.length > 0 ? (
              filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between space-y-4 shadow-3xs"
                >
                  {/* Category Name */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[8px] tracking-wider font-bold px-2 py-0.5 rounded-full uppercase ${
                        dish.category === 'Entradas' ? 'bg-blue-50 text-blue-700' :
                        dish.category === 'Platos Fuertes' ? 'bg-emerald-50 text-emerald-700' :
                        dish.category === 'Postres' ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'
                      }`}>
                        {dish.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 mt-2">{dish.name}</h3>
                    </div>

                    <div className="text-right">
                      <strong className="text-sm font-mono font-bold text-slate-800">${dish.price} MXN</strong>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {dish.description}
                  </p>

                  {/* Specific preparation metrics */}
                  <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center">
                      <Tag className="w-3.5 h-3.5 mr-1 text-slate-350" />
                      Prep: <strong className="text-slate-600 ml-1">{dish.preparationTime} mins</strong>
                    </span>

                    {/* Stock switch */}
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${dish.available ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <strong className={dish.available ? 'text-emerald-705' : 'text-red-505'}>
                        {dish.available ? 'Disponible' : 'Agotado'}
                      </strong>
                    </div>
                  </div>

                  {/* Commands */}
                  <div className="flex space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleEditInit(dish)}
                      className="cursor-pointer flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg border border-slate-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Modificar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Seguro que deseas eliminar el plato "${dish.name}" de la base de datos?`)) {
                          onDeleteDish(dish.id);
                        }
                      }}
                      className="cursor-pointer w-10 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 bg-white border border-dashed border-slate-200 text-center rounded-xl">
                <p className="text-xs text-slate-400">No se encontraron productos coincidentes en el menú.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Form Creation Dish */
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-50 pb-2">
            {editingDishId ? 'Modificar Elemento del Menú' : 'Dar de Alta Nuevo Platillo o Bebida'}
          </h3>

          <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] uppercase text-slate-400 font-bold block">Nombre Completo del Platillo</label>
              <input
                type="text"
                placeholder="Ej. Tacos de Rib Eye con Salsa Macha..."
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="w-full p-2 border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden text-xs text-slate-750"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] uppercase text-slate-400 font-bold block">Descripción Detallada (Ingredientes / Presentación)</label>
              <textarea
                rows={3}
                placeholder="Menciona los insumos principales, alérgenos potenciales y cocción..."
                value={dishDescription}
                onChange={(e) => setDishDescription(e.target.value)}
                className="w-full p-2 border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden text-xs text-slate-750"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-400 font-bold block">Precio de Venta (MXN)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  placeholder="240"
                  value={dishPrice || ''}
                  onChange={(e) => setDishPrice(Number(e.target.value))}
                  className="w-full py-2 pl-6 pr-3 border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-400 font-bold block">Categorización</label>
              <select
                value={dishCategory}
                onChange={(e) => setDishCategory(e.target.value as Category)}
                className="w-full py-2 px-3 bg-white border border-slate-205 focus:border-emerald-500 rounded-lg focus:outline-hidden text-slate-700 font-medium"
              >
                <option value="Entradas">Entradas</option>
                <option value="Platos Fuertes">Platos Fuertes</option>
                <option value="Postres">Postres</option>
                <option value="Bebidas">Bebidas</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-400 font-bold block">Minutos de Cocción (T. Prep)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="2"
                  max="45"
                  value={dishPrepTime}
                  onChange={(e) => setDishPrepTime(Number(e.target.value))}
                  className="flex-1 accent-emerald-600 h-1.5 bg-slate-150 rounded-lg cursor-pointer"
                />
                <span className="font-mono bg-slate-50 py-1.5 px-3 rounded-lg text-slate-650 font-bold border border-slate-100">
                  {dishPrepTime} min
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50/75 border border-slate-100 rounded-xl mt-3">
              <div>
                <strong className="text-[11px] text-slate-700 block font-semibold">Ofertar en Menú</strong>
                <span className="text-[10px] text-slate-400">Si se marca, el mesero podrá agregarlo a tickets.</span>
              </div>
              <input
                type="checkbox"
                checked={dishAvailable}
                onChange={(e) => setDishAvailable(e.target.checked)}
                className="size-5 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="md:col-span-2 flex space-x-2 pt-4 border-t border-slate-50">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab('visualizar');
                }}
                className="cursor-pointer flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-lg border text-center transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="cursor-pointer flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-center transition-colors flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingDishId ? 'Salvar Modificación' : 'Añadir al Menú Comercial'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
