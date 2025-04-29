import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarMenuButton } from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'
import { ListIcon, CheckCheck, LayoutDashboard, LogOut } from "lucide-react"; // Importa los íconos de lucide-react

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname();
    const navItems = [
        {
            name: 'General',
            path: '/dashboard/general',
            icon: <ListIcon className="h-5 w-5" />
        },
        {
            name: 'Evaluaciones',
            path: '/dashboard/evaluations',
            icon: <CheckCheck className="h-5 w-5" />
        },
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: <LayoutDashboard className="h-5 w-5" />
        }
    ];
    return (
        <Sidebar className="w-72">
            <SidebarContent>
                {/* Title */}
                <h1 className="p-4 w-full flex items-center justify-center text-green-dark font-bold text-2xl">Measure Me</h1>
                {/* Links */}
                <SidebarGroup className="flex flex-col p-4">
                    {navItems.map((item) => (
                        <Link key={item.name} href={item.path} className={`flex font-semibold items-center text-green-dark p-3 ${pathname === item.path ? 'bg-green-dark text-white' : 'hover:bg-[#f8fdf0fe]'} rounded-md gap-4 mb-3`}>
                            <div className="mr-2">
                                {item.icon}
                            </div>
                            <div>
                                {item.name}
                            </div>
                        </Link>
                    ))}
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarGroupContent>
                    <div className="flex flex-col gap-2">
                        <div className=" ml-4 text-green-dark text-md">
                            <h1>Jhon Doe</h1>
                        </div>
                        <button className="p-4 gap-2 w-full cursor-pointer flex flex-row items-center text-green-dark font-bold text-1xl"
                            onClick={() => router.push("/login")}
                        >
                            <LogOut className="h-5 w-5" />
                            <h1>Cerrar Sesión</h1>
                        </button>
                    </div>
                </SidebarGroupContent>
            </SidebarFooter>
        </Sidebar>
    )
}