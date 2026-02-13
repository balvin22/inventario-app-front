import { Loader2, PackageOpen, Calendar, ArrowDownLeft, ArrowUpRight, Truck, User, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MovimientosTable({ 
    movimientos, loading, 
    page, setPage, totalPages, 
    onEdit, onDelete, 
    getProdName, getPeriodoName 
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="overflow-x-auto custom-scrollbar flex-grow">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase">Fecha</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase">Tipo</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase">Producto</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase">Cantidad</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase w-full">Detalle</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6">
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-pulse">
                                        <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
                                        <p>Cargando datos...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : movimientos.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <PackageOpen size={48} className="mb-3 opacity-30" />
                                        <p className="font-medium">No se encontraron movimientos</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            movimientos.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                                    {/* Fecha */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar size={14} className="text-slate-400 shrink-0"/>
                                            <span className="text-sm font-medium">{new Date(m.fecha).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 ml-6 mt-0.5">
                                            {new Date(m.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {getPeriodoName(m.periodo_id)} 
                                        </div>
                                    </td>
                                    
                                    {/* Tipo */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                            m.tipo === 'entrada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                            {m.tipo === 'entrada' ? <ArrowDownLeft size={12}/> : <ArrowUpRight size={12}/>}
                                            {m.tipo.toUpperCase()}
                                        </span>
                                    </td>

                                    {/* Producto */}
                                    <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                                        {getProdName(m.producto_id)}
                                    </td>

                                    {/* Cantidad */}
                                    <td className="px-6 py-4 font-bold text-slate-800 text-lg whitespace-nowrap">
                                        {m.cantidad}
                                    </td>

                                    {/* Detalle */}
                                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                        {m.tipo === 'entrada' ? (
                                            <span className="text-slate-400 italic flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Ingreso
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {m.destino_tipo === 'ruta' ? (
                                                    <>
                                                        <div className="p-1.5 bg-orange-50 text-orange-600 rounded-md shrink-0 border border-orange-100"><Truck size={14}/></div>
                                                        <span className="font-medium truncate max-w-[200px]">{m.ruta_nombre}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md shrink-0 border border-purple-100"><User size={14}/></div>
                                                        <span className="italic truncate max-w-[200px]">"{m.nota_terceros}"</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => onEdit(m)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95" title="Editar">
                                                <Edit2 size={18} />
                                            </button>
                                            <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                            <button onClick={() => onDelete(m.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95" title="Eliminar">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINACIÓN */}
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