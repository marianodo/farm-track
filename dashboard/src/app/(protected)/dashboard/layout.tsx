"use client"

import { useState } from "react";
import { Menu, Leaf } from "lucide-react";
import { AppSidebar } from "@/components/ui/app-sidebar";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="rd-shell">
            <AppSidebar open={open} onNavigate={() => setOpen(false)} />
            <div
                className={`rd-scrim${open ? ' show' : ''}`}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />
            <div className="rd-main">
                <div className="rd-mobilebar">
                    <button className="rd-hamb" aria-label="Abrir menú" onClick={() => setOpen(true)}>
                        <Menu size={20} />
                    </button>
                    <Leaf size={18} />
                    <span style={{ fontWeight: 700 }}>BD Metrics</span>
                </div>
                <div className="rd-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
