"use client"

import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutGrid,
  Home,
  Map,
  Layers,
  BarChart2,
  FileText,
  LineChart,
  TrendingUp,
  Settings,
  LogOut,
  Leaf,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

type NavItem = { name: string; path: string; icon: React.ReactNode; exact?: boolean };

const operacion: NavItem[] = [
  { name: 'Resumen', path: '/dashboard', icon: <LayoutGrid />, exact: true },
  { name: 'General', path: '/dashboard/general', icon: <Home /> },
  { name: 'Campos', path: '/dashboard/fields', icon: <Map /> },
  { name: 'Corrales', path: '/dashboard/pens', icon: <Layers /> },
  { name: 'Variables', path: '/dashboard/variables', icon: <BarChart2 /> },
  { name: 'Reportes', path: '/dashboard/reports', icon: <FileText /> },
  { name: 'Análisis', path: '/dashboard/analisis', icon: <LineChart /> },
];

export function AppSidebar({ open = false, onNavigate }: { open?: boolean; onNavigate?: () => void }) {
  const { logout, user, role } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (item: { path: string; exact?: boolean }) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const displayName = user?.username || user?.name || 'Usuario';
  const initial = displayName?.[0]?.toUpperCase() || 'U';

  return (
    <aside className={`rd-sidebar${open ? ' open' : ''}`}>
      <div className="rd-brand">
        <div className="rd-brand-mark"><Leaf size={20} strokeWidth={2} /></div>
        <div>
          <div className="rd-brand-name">BD Metrics</div>
          <div className="rd-brand-sub">Bienestar ganadero</div>
        </div>
      </div>

      <div className="rd-navlabel">Operación</div>
      {operacion.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          onClick={onNavigate}
          className={`rd-nav${isActive(item) ? ' active' : ''}`}
        >
          {item.icon}
          {item.name}
        </Link>
      ))}

      {role === 'ADMIN' && (
        <>
          <div className="rd-navlabel">Inteligencia</div>
          <Link
            href="/dashboard/analytics"
            onClick={onNavigate}
            className={`rd-nav${pathname.startsWith('/dashboard/analytics') ? ' active' : ''}`}
          >
            <TrendingUp />
            Analítica
          </Link>
        </>
      )}

      <div className="rd-sb-foot">
        <Link
          href="/dashboard/configuration"
          onClick={onNavigate}
          className={`rd-nav${pathname.startsWith('/dashboard/configuration') ? ' active' : ''}`}
        >
          <Settings />
          Configuración
        </Link>
        <button type="button" onClick={handleLogout} className="rd-nav logout" style={{ background: 'transparent', border: 0, width: '100%', textAlign: 'left' }}>
          <LogOut />
          Cerrar sesión
        </button>
        <div className="rd-sb-user">
          <div className="rd-avatar">{initial}</div>
          <div>
            <div className="who">{displayName}</div>
            <div className="role">{role === 'ADMIN' ? 'Administrador' : 'Usuario'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
