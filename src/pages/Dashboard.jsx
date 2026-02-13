import { useState } from 'react';
import { Calendar, ArrowLeft, Download, Loader2, Search, Filter, X, Clock } from 'lucide-react'; // <--- Iconos nuevos
import { Toaster } from 'react-hot-toast';

// Componentes UI
import TablaGlobal from '../components/dashboard/TablaGlobal';
import DetallePeriodo from '../components/dashboard/DetallePeriodo';

// Custom Hooks
import { useInventarioGlobal } from '../hooks/useInventarioGlobal';

export default function Dashboard() {
    const [vistaDetalle, setVistaDetalle] = useState({ id: null, nombre: '' });

    // Extraemos las nuevas props del Hook
    const { 
        datosGlobales, periodosOptions, // <--- Lista de periodos
        loading, 
        page, setPage, totalPages, totalRecords,
        searchTerm, setSearchTerm, // <--- Buscador
        filterCategory, setFilterCategory, // <--- Filtro Categoría
        filterPeriodo, setFilterPeriodo, // <--- Filtro Periodo
        limpiarFiltros, // <--- Reset
        downloading, descargarExcel 
    } = useInventarioGlobal();

    const abrirDetalle = (id, nombre) => setVistaDetalle({ id, nombre });
    const cerrarDetalle = () => setVistaDetalle({ id: null, nombre: '' });
    const esVistaGlobal = !vistaDetalle.id;

    const hayFiltrosActivos = searchTerm !== '' || filterCategory !== 'all' || filterPeriodo !== 'all';

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <Toaster position="top-right" />

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        {!esVistaGlobal ? (
                            <>
                                <Calendar className="text-blue-600" /> Detalle: {vistaDetalle.nombre}
                            </>
                        ) : 'Inventario Global'}
                    </h2>
                    <p className="text-slate-500 font-medium">
                        {!esVistaGlobal 
                            ? 'Desglose detallado por semanas y rutas' 
                            : `Vista general (${totalRecords} productos en total)`}
                    </p>
                </div>

                <div className="flex gap-3">
                    {esVistaGlobal && (
                        <button 
                            onClick={descargarExcel}
                            disabled={downloading}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            {downloading ? 'Generando...' : 'Exportar Todo'}
                        </button>
                    )}

                    {!esVistaGlobal && (
                        <button 
                            onClick={cerrarDetalle}
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
                        >
                            <ArrowLeft size={18} /> Volver al Global
                        </button>
                    )}
                </div>
            </div>

            {/* --- NUEVA BARRA DE BÚSQUEDA Y FILTROS (Solo visible en Vista Global) --- */}
            {esVistaGlobal && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Buscador */}
                    <div className="md:col-span-5 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar producto..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtro Categoría */}
                    <div className="md:col-span-3 relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        <select 
                            value={filterCategory}
                            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:border-blue-300 outline-none cursor-pointer hover:bg-slate-50 appearance-none"
                        >
                            <option value="all">Todas las Categorías</option>
                            <option value="grano">Grano</option>
                            <option value="aseo">Aseo</option>
                            <option value="galeria">Galería</option>
                        </select>
                    </div>

                    {/* Filtro Periodo */}
                    <div className="md:col-span-3 relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        <select 
                            value={filterPeriodo}
                            onChange={(e) => { setFilterPeriodo(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:border-blue-300 outline-none cursor-pointer hover:bg-slate-50 appearance-none"
                        >
                            <option value="all">Todos los Periodos</option>
                            {periodosOptions.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Botón Limpiar */}
                    <div className="md:col-span-1 flex justify-end">
                        {hayFiltrosActivos && (
                            <button 
                                onClick={limpiarFiltros}
                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                title="Limpiar filtros"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* CONTENIDO PRINCIPAL */}
            {loading && !datosGlobales.data.length ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
                    <p className="text-slate-400 font-medium animate-pulse">Calculando matriz de inventario...</p>
                </div>
            ) : (
                <>
                    {esVistaGlobal ? (
                        <TablaGlobal 
                            header={datosGlobales.headers} 
                            data={datosGlobales.data} 
                            onPeriodoClick={abrirDetalle}
                            page={page}
                            totalPages={totalPages}
                            setPage={setPage}
                            loading={loading}
                        />
                    ) : (
                        <DetallePeriodo periodoId={vistaDetalle.id} />
                    )}
                </>
            )}
        </div>
    );
}