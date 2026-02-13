import { MousePointerClick, ArrowRight, Wheat, Sparkles, Image as ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

export default function TablaGlobal({ header, data, onPeriodoClick, page, totalPages, setPage, loading }) {
    if (!data || data.length === 0) return <EmptyState mensaje="No hay datos registrados." />;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-blue-50 p-2 rounded-lg w-fit">
                <MousePointerClick size={14} />
                <span>Tip: Haz clic en el nombre de un periodo (columna) para ver su detalle semanal.</span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
                <div className="overflow-x-auto custom-scrollbar relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-50 flex items-center justify-center">
                            <Loader2 className="animate-spin text-blue-600" size={30} />
                        </div>
                    )}
                    
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                                <th className="px-6 py-5 w-64 sticky left-0 bg-slate-50/95 backdrop-blur z-20 border-r border-slate-200 shadow-sm">Producto</th>
                                <th className="px-6 py-5 min-w-[150px] bg-slate-100 text-slate-700 text-center border-r border-slate-200">Total Histórico</th>
                                {header.map(h => (
                                    <th key={h.id} onClick={() => onPeriodoClick(h.id, h.nombre)} className="px-4 py-5 text-center min-w-[140px] border-r border-slate-100 last:border-0 whitespace-nowrap cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors group">
                                        <div className="flex items-center justify-center gap-1">{h.nombre}<ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((row) => (
                                <tr key={row.producto_id} className="group hover:bg-slate-50/80 transition-colors">
                                    {/* COLUMNA FIJA: PRODUCTO */}
                                    <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-20 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg shadow-sm ${
                                                row.categoria === 'grano' ? 'bg-amber-100 text-amber-600' : 
                                                row.categoria === 'aseo' ? 'bg-cyan-100 text-cyan-600' : 
                                                'bg-purple-100 text-purple-600'
                                            }`}>
                                                {row.categoria === 'grano' ? <Wheat size={16} /> : 
                                                 row.categoria === 'aseo' ? <Sparkles size={16} /> : 
                                                 <ImageIcon size={16} />}
                                            </div>
                                            <div className='overflow-hidden'>
                                                <p className="font-bold text-slate-700 text-sm truncate" title={row.nombre}>{row.nombre}</p>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">{row.categoria}</p>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* COLUMNA TOTAL HISTÓRICO */}
                                    <td className="px-4 py-4 bg-slate-50/50 border-r border-slate-200">
                                        <div className="flex flex-col gap-1 items-center">
                                            <span className={`text-lg font-black ${row.global.balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>{row.global.balance}</span>
                                            <div className="flex gap-2 text-[10px] font-bold">
                                                <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">+{row.global.entradas}</span>
                                                <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">-{row.global.salidas}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* COLUMNAS DE PERIODOS */}
                                    {header.map(h => {
                                        const celda = row.periodos[h.id] || { balance: 0, entradas: 0, salidas: 0 };
                                        const tieneMov = celda.entradas > 0 || celda.salidas > 0;
                                        return (
                                            <td key={h.id} className="px-4 py-4 text-center border-r border-slate-100">
                                                {tieneMov ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`font-bold text-sm ${celda.balance >= 0 ? 'text-slate-700' : 'text-red-600'}`}>{celda.balance}</span>
                                                        <div className="flex gap-1 text-[9px] font-medium opacity-60">
                                                            {celda.entradas > 0 && <span className="text-emerald-600">+{celda.entradas}</span>}
                                                            {celda.salidas > 0 && <span className="text-red-600">-{celda.salidas}</span>}
                                                        </div>
                                                    </div>
                                                ) : <span className="text-slate-200 text-xl">•</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER PAGINACIÓN */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">
                        Página <span className="text-slate-800 font-bold">{page}</span> de <span className="text-slate-800 font-bold">{totalPages}</span>
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors shadow-sm"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors shadow-sm"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}