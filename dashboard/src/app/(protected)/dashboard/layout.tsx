"use client"

import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isMobile = useIsMobile()
    return (
        <section className="flex min-h-screen w-full bg-gray-50">
            <AppSidebar />
            {isMobile && <SidebarTrigger className="absolute top-0" />}
            <div className="flex-grow px-20 pr-10">
                {children}
            </div>
        </section>
    );
}
