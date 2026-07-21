"use client";

import React, { useEffect, useState } from 'react';
import { Trash2, RefreshCw, FileText } from 'lucide-react';
import useReportStore from '@/store/reportStore';

export default function ReportsPage() {
  const { getReportsByUser, reportsByUser, reportError, deleteReport } = useReportStore();
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getReportsByUser();
      setLoading(false);
    };
    fetchData();
  }, [getReportsByUser]);

  const handleRefresh = async () => {
    setLoading(true);
    await getReportsByUser();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      setLoading(true);
      try {
        await deleteReport(id);
        setDeleteConfirmId(null);
      } finally {
        setLoading(false);
      }
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center hover:bg-gray-200 transition-colors"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {reportError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{reportError}</div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                      <span>Cargando reportes...</span>
                    </div>
                  </td>
                </tr>
              ) : reportsByUser && reportsByUser.length > 0 ? (
                reportsByUser.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {report.name || `Reporte #${report.id}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.fieldName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{report.comment || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.created_at ? new Date(report.created_at).toLocaleDateString('es-AR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className={deleteConfirmId === report.id
                          ? 'text-red-800 bg-red-100 px-2 py-1 rounded flex items-center gap-1 ml-auto'
                          : 'text-red-600 hover:text-red-900 ml-auto flex'}
                        onClick={() => handleDelete(report.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleteConfirmId === report.id && <span className="text-xs">Confirmar</span>}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="text-gray-500">
                      No hay reportes disponibles. Los reportes se crean desde la app móvil.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
