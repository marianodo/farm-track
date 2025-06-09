"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  Layers, 
  BarChart2, 
  Calendar, 
  FileBarChart,
  RefreshCw, 
  Settings, 
  LogOut, 
  ChevronDown 
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

export function AppSidebar() {
    const { logout, authLoading, user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    
    // Navigation items matching the provided design
    const navItems = [
        {
            name: 'Campos',
            path: '/general',
            icon: <Home className="h-5 w-5" />
        },
        {
            name: 'Corrales',
            path: '/pens',
            icon: <Layers className="h-5 w-5" />
        },
        {
            name: 'Variables',
            path: '/variables',
            icon: <BarChart2 className="h-5 w-5" />
        },
        {
            name: 'Reportes',
            path: '/reports',
            icon: <Calendar className="h-5 w-5" />
        },
        {
            name: 'Análisis',
            path: '/',
            icon: <FileBarChart className="h-5 w-5" />
        }
    ];
    
    const handleLogout = () => {
        logout();
        router.replace('/login');
    }
    
    return (
        <Sidebar className="w-72 border-r border-gray-200" style={{ backgroundColor: '#f1f1f1' }}>
            <SidebarContent>
                {/* Logo/Title */}
                <div className="p-4 flex items-center gap-2">
                    <div className="bg-emerald-500 text-white rounded-md p-2 flex items-center justify-center">
                        <span className="font-bold text-xl">M</span>
                    </div>
                    <h1 className="text-gray-700 font-bold text-xl">MeasureMe</h1>
                </div>
                
                {/* Removed dropdown menus as requested */}
                
                {/* Navigation Section */}
                <div className="px-4 pt-6">
                    <h2 className="text-gray-500 text-sm font-medium mb-2">Navegación</h2>
                    <SidebarGroup className="flex flex-col">
                        {navItems.map((item) => (
                            <Link 
                                key={item.name} 
                                href={item.path} 
                                className={`flex items-center py-3 px-2 rounded-md ${pathname.includes(item.path) ? 'text-green-700 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                <div className="mr-3">
                                    {item.icon}
                                </div>
                                <div>
                                    {item.name}
                                </div>
                            </Link>
                        ))}
                    </SidebarGroup>
                </div>
                
                {/* Action Buttons removed */}
                
                {/* Configuration Link */}
                <div className="px-4 pt-4">
                    <Link 
                        href="/dashboard/configuration" 
                        className="flex items-center py-3 px-2 text-gray-600 hover:text-gray-800"
                    >
                        <Settings className="h-5 w-5 mr-3" />
                        <span>Configuración</span>
                    </Link>
                </div>
            </SidebarContent>
            
            {/* User Profile and Logout */}
            <SidebarFooter>
                <SidebarGroupContent>
                    <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                        {/* User name display */}
                        {user && (
                            <div className="mb-3 py-2 px-2 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-3">
                                    <span className="font-medium text-sm">{(user.username || user.name)?.[0]?.toUpperCase() || 'U'}</span>
                                </div>
                                <span className="text-gray-800 font-medium">{user.username || user.name || 'Usuario'}</span>
                            </div>
                        )}
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center py-2 px-2 text-gray-600 hover:text-red-600"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </SidebarGroupContent>
            </SidebarFooter>
        </Sidebar>
    )
}