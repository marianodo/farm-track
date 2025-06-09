"use client";

import React, { useEffect, useState } from 'react';
import { ArrowRight, RefreshCw, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function GeneralPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Quick stats for the dashboard overview
  const overviewStats = [
    { name: 'Campos', value: '4', path: '/dashboard/fields' },
    { name: 'Corrales', value: '12', path: '/dashboard/pens' },
    { name: 'Variables', value: '18', path: '/dashboard/variables' },
    { name: 'Reportes', value: '6', path: '/dashboard/reports' }
  ];

  // Recent activity items
  const recentActivity = [
    { id: 1, description: 'Nuevo campo agregado', date: '2 horas atrás', category: 'Campos' },
    { id: 2, description: 'Variable actualizada', date: 'Ayer', category: 'Variables' },
    { id: 3, description: 'Reporte generado', date: '3 días atrás', category: 'Reportes' },
    { id: 4, description: 'Nuevo corral registrado', date: '1 semana atrás', category: 'Corrales' }
  ];

  // Pending tasks
  const pendingTasks = [
    { id: 1, description: 'Actualizar datos de campo', completed: false },
    { id: 2, description: 'Revisar variables de seguimiento', completed: false },
    { id: 3, description: 'Generar reporte mensual', completed: false },
  ];

  return (
    <div className="p-6">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {user?.name || 'Usuario'}</h1>
        <p className="text-gray-600 mt-2">Aquí está el resumen de tu actividad agrícola</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Estadísticas Generales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat, index) => (
            <Link href={stat.path} key={index}>
              <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                <p className="text-gray-500">{stat.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                  <ChevronRight className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Actividad Reciente</h2>
            <button className="text-sm text-green-600 hover:underline flex items-center">
              Ver Todas <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                  <span className="text-xs text-gray-500">{activity.date}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{activity.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Tareas Pendientes</h2>
            <button className="text-sm text-green-600 hover:underline flex items-center">
              Gestionar <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-green-600 rounded border-gray-300 focus:ring-green-500" 
                  checked={task.completed} 
                  readOnly
                />
                <span className={`ml-3 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Acceso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/fields">
            <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-green-500">
              <h3 className="font-medium text-gray-700 mb-1">Gestionar Campos</h3>
              <p className="text-sm text-gray-500">Ver y administrar tus campos agrícolas</p>
            </div>
          </Link>
          <Link href="/dashboard/variables">
            <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500">
              <h3 className="font-medium text-gray-700 mb-1">Gestionar Variables</h3>
              <p className="text-sm text-gray-500">Controlar variables de seguimiento</p>
            </div>
          </Link>
          <Link href="/dashboard/reports">
            <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-purple-500">
              <h3 className="font-medium text-gray-700 mb-1">Generar Reportes</h3>
              <p className="text-sm text-gray-500">Crear y visualizar informes</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
