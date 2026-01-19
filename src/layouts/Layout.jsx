import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowLeftRight, Settings, Menu, X } from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
        <Link 
            to={to} 
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-slate-500 hover:bg-white hover:text-blue-600'
            }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

export default function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
            
            {/* BOTÓN HAMBURGUESA (SOLO MÓVIL) */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* OVERLAY OSCURO (SOLO MÓVIL CUANDO ESTÁ ABIERTO) */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR (ADAPTABLE) */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-100 border-r border-slate-200 flex flex-col p-4 transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="mb-8 px-4 mt-2 md:mt-0 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">Inventario<span className="text-blue-600">App</span></h1>
                </div>
                
                <nav className="flex flex-col gap-2 flex-1">
                    <SidebarItem to="/" icon={LayoutDashboard} label="Stock" onClick={() => setIsMobileMenuOpen(false)} />
                    <SidebarItem to="/productos" icon={Package} label="Productos" onClick={() => setIsMobileMenuOpen(false)} />
                    <SidebarItem to="/movimientos" icon={ArrowLeftRight} label="Movimientos" onClick={() => setIsMobileMenuOpen(false)} />
                </nav>

                <div className="mt-auto">
                    <SidebarItem to="/configuracion" icon={Settings} label="Configuración" onClick={() => setIsMobileMenuOpen(false)} />
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8 w-full">
                <Outlet />
            </main>
        </div>
    );
}