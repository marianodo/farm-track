"use client";

import React from 'react';
import { Construction } from 'lucide-react';

export default function PensPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <Construction className="w-16 h-16 text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Página en Construcción</h1>
      <p className="text-gray-600 mb-4 text-center max-w-md">
        Estamos trabajando en esta sección para brindarte la mejor experiencia posible.
        ¡Vuelve pronto para ver nuestras actualizaciones!
      </p>
    </div>
  );
}
