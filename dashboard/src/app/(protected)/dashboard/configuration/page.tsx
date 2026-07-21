"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Mail, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useAuthStore, Role } from '@/store/authStore';

export default function ConfigurationPage() {
  const router = useRouter();
  const { user, role, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const displayName = user?.username || user?.name || 'Usuario';

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Mi cuenta</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Nombre</div>
              <div className="text-sm font-medium text-gray-900">{displayName}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-sm font-medium text-gray-900">{user?.email || '-'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Rol</div>
              <div className="text-sm font-medium text-gray-900">
                {role === Role.ADMIN ? 'Administrador' : 'Usuario'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-700 rounded-md flex items-center gap-2 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
