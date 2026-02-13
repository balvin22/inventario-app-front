import { Package, Wheat, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function StatsCards({ stats, filterCategory, setFilterCategory, setPage }) {
    
    // DEFINIMOS LOS ESTILOS COMPLETOS AQUÍ
    // Al escribir las clases completas, Tailwind sí las detecta y genera el CSS.
    const categories = [
        { 
            id: 'all', 
            label: 'Todos', 
            icon: Package, 
            // Estilos específicos para cuando está activo
            styles: {
                cardActive: 'bg-blue-50 border-blue-200 ring-2 ring-blue-500',
                iconActive: 'bg-blue-600 text-white', // Usamos blue-600 para mejor contraste
                textActive: 'text-blue-800',
                iconHover: 'group-hover:bg-blue-100 group-hover:text-blue-600'
            }
        },
        { 
            id: 'grano', 
            label: 'Grano', 
            icon: Wheat, 
            styles: {
                cardActive: 'bg-amber-50 border-amber-200 ring-2 ring-amber-500',
                iconActive: 'bg-amber-500 text-white',
                textActive: 'text-amber-800',
                iconHover: 'group-hover:bg-amber-100 group-hover:text-amber-600'
            }
        },
        { 
            id: 'galeria', 
            label: 'Galería', 
            icon: ImageIcon, 
            styles: {
                cardActive: 'bg-purple-50 border-purple-200 ring-2 ring-purple-500',
                iconActive: 'bg-purple-500 text-white',
                textActive: 'text-purple-800',
                iconHover: 'group-hover:bg-purple-100 group-hover:text-purple-600'
            }
        },
        { 
            id: 'aseo', 
            label: 'Aseo', 
            icon: Sparkles, 
            styles: {
                cardActive: 'bg-cyan-50 border-cyan-200 ring-2 ring-cyan-500',
                iconActive: 'bg-cyan-500 text-white',
                textActive: 'text-cyan-800',
                iconHover: 'group-hover:bg-cyan-100 group-hover:text-cyan-600'
            }
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((item) => {
                const isActive = filterCategory === item.id;
                
                return (
                    <button
                        key={item.id}
                        onClick={() => { setFilterCategory(item.id); setPage(1); }}
                        className={`p-4 rounded-xl border transition-all text-left flex flex-col gap-2 relative overflow-hidden group ${
                            isActive 
                            ? `${item.styles.cardActive} shadow-md` 
                            : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                        }`}
                    >
                        <div className="flex justify-between items-start w-full">
                            <div className={`p-2 rounded-lg w-fit transition-colors ${
                                isActive 
                                ? item.styles.iconActive 
                                : `bg-slate-100 text-slate-500 ${item.styles.iconHover}`
                            }`}>
                                <item.icon size={20} />
                            </div>
                            <span className={`text-xl font-bold ${isActive ? item.styles.textActive : 'text-slate-700'}`}>
                                {stats[item.id] || 0}
                            </span>
                        </div>
                        <span className={`font-bold text-sm ${isActive ? item.styles.textActive : 'text-slate-600'}`}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}