import { Package, Loader2, Wheat, Sparkles, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import ResumenRutas from './ResumenRutas';
import { useDetallePeriodo } from '../../hooks/useDetallePeriodo'

export default function DetallePeriodo({ periodoId }) {
    // Usamos el hook y nos olvidamos de useEffects y axios aquí
    const { dataMatrix, loading, page, setPage, totalPages } = useDetallePeriodo(periodoId);
    
    if (loading && !dataMatrix) return (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-2" />
            <p className="text-slate-400">Cargando detalle semanal...</p>
        </div>
    );
    
    if (!dataMatrix || dataMatrix.data.length === 0) return <EmptyState mensaje="No hay datos." />;

    return (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            {/* TABLA MATRIZ SEMANAL */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Package size={20} className="text-blue-600"/> Desglose de Productos
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Inventario por semana</p>
                </div>
                
                <div className="overflow-x-auto relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-50 flex items-center justify-center">
                            <Loader2 className="animate-spin text-blue-600" size={30} />
                        </div>
                    )}
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                                <th className="px-6 py-5 w-64 sticky left-0 bg-slate-50/95 backdrop-blur z-20 border-r border-slate-200">Producto</th>
                                <th className="px-6 py-5 w-48 bg-blue-50/50 text-blue-700 text-center border-r border-slate-200">Total Periodo</th>
                                {dataMatrix.semanas_header.map(num => (
                                    <th key={num} className="px-4 py-5 text-center min-w-[120px] border-r border-slate-100 last:border-0">Semana {num}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dataMatrix.data.map((row) => {
                                const esGrano = row.categoria === 'grano';
                                const esAseo = row.categoria === 'aseo';
                                return (
                                    <tr key={row.producto_id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-20 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-xl shadow-sm ${
                                                    esGrano ? 'bg-amber-100 text-amber-600' : 
                                                    esAseo ? 'bg-cyan-100 text-cyan-600' : 
                                                    'bg-purple-100 text-purple-600'
                                                }`}>
                                                    {esGrano ? <Wheat size={18} /> : 
                                                     esAseo ? <Sparkles size={18} /> : 
                                                     <ImageIcon size={18} />}
                                                </div>
                                                <div className='overflow-hidden'>
                                                    <p className="font-bold text-slate-700 text-sm truncate max-w-[150px]" title={row.nombre}>{row.nombre}</p>
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{row.categoria}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 bg-blue-50/10 group-hover:bg-blue-50/30 border-r border-slate-200 text-center">
                                            <div className="flex flex-col gap-1 items-center">
                                                <span className={`text-lg font-black ${row.resumen.balance < 0 ? 'text-red-500' : 'text-slate-800'}`}>{row.resumen.balance}</span>
                                                <div className="flex gap-2 text-[10px] font-medium opacity-70">
                                                    <span className="text-emerald-600 bg-emerald-50 px-1.5 rounded">+{row.resumen.entradas}</span>
                                                    <span className="text-red-600 bg-red-50 px-1.5 rounded">-{row.resumen.salidas}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {dataMatrix.semanas_header.map(num => {
                                            if (esGrano) return <td key={num} className="px-2 py-4 border-r border-slate-100 bg-slate-50/30 text-center"><div className="h-1 w-8 bg-slate-300 rounded-full mx-auto opacity-30"></div></td>;
                                            const celda = row.semanas[num] || { entradas: 0, salidas: 0 };
                                            const tieneMov = celda.entradas > 0 || celda.salidas > 0;
                                            return (
                                                <td key={num} className="px-2 py-4 text-center border-r border-slate-100 align-top">
                                                    {tieneMov ? (
                                                        <div className="flex gap-2 justify-center w-full">
                                                            {celda.entradas > 0 && <span className="text-xs font-bold text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded-lg">+{celda.entradas}</span>}
                                                            {celda.salidas > 0 && <span className="text-xs font-bold text-red-700 bg-red-100/50 px-2 py-1 rounded-lg">-{celda.salidas}</span>}
                                                        </div>
                                                    ) : <span className="text-slate-200 text-xl">•</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
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

            {/* SECCIÓN DE RUTAS */}
            <ResumenRutas productos={dataMatrix.data} />
        </div>
    );
}