import { Loader2, Package, Wheat, Image as ImageIcon, Sparkles, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductTable({ productos, loading, page, setPage, totalPages, onEdit, onDelete }) {

    const getCatStyle = (cat) => {
        switch(cat) {
            case 'grano': return { icon: <Wheat size={14}/>, style: 'bg-amber-50 text-amber-700 border-amber-200' };
            case 'aseo': return { icon: <Sparkles size={14}/>, style: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
            case 'galeria': return { icon: <ImageIcon size={14}/>, style: 'bg-purple-50 text-purple-700 border-purple-200' };
            default: return { icon: <Package size={14}/>, style: 'bg-slate-50 text-slate-700 border-slate-200' };
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="overflow-x-auto custom-scrollbar flex-grow">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase whitespace-nowrap">Producto</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase whitespace-nowrap">Categoría</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase whitespace-nowrap w-full">Descripción</th>
                            <th className="px-6 py-4 text-right font-semibold text-slate-600 text-xs uppercase whitespace-nowrap w-24">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="4">
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-pulse">
                                        <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
                                        <p>Cargando catálogo...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : productos.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-12 text-center">
                                    <div className="flex flex-col items-center text-slate-400">
                                        <Package size={48} className="mb-3 opacity-30" />
                                        <p className="font-medium text-slate-500">No se encontraron productos</p>
                                        <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            productos.map((prod) => {
                                const { icon, style } = getCatStyle(prod.categoria);
                                return (
                                    <tr key={prod.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{prod.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border ${style}`}>
                                                {icon}
                                                {prod.categoria.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm truncate max-w-xs min-w-[200px]" title={prod.descripcion}>
                                            {prod.descripcion || <span className="text-slate-300 italic">Sin descripción</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => onEdit(prod)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95" title="Editar">
                                                    <Pencil size={18} />
                                                </button>
                                                <div className="w-px h-4 bg-slate-200 my-auto mx-1"></div>
                                                <button onClick={() => onDelete(prod.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95" title="Eliminar">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* FOOTER PAGINACIÓN */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                <div>
                    Página <span className="font-bold text-slate-700">{page}</span> de <span className="font-bold text-slate-700">{totalPages}</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                    >
                        <ChevronLeft size={16} /> Anterior
                    </button>
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                        className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                    >
                        Siguiente <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}