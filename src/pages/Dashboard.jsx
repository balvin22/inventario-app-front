import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { 
    BarChart3, TrendingUp, TrendingDown, Calendar, 
    ArrowRight, ArrowLeft, Package, Truck, 
    Wheat, Image as ImageIcon, AlertCircle, MousePointerClick,
    MapPin, Filter, Download, Sparkles // <--- IMPORTANTE: Sparkles para Aseo
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null); 
    const [periodoNombre, setPeriodoNombre] = useState(''); 
    
    const [datosGlobales, setDatosGlobales] = useState({ headers: [], data: [] });
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false); // Estado para el botón

    useEffect(() => {
        if (!periodoSeleccionado) cargarGlobal();
    }, [periodoSeleccionado]);

    const cargarGlobal = async () => {
        setLoading(true);
        try {
            const res = await api.get('/reportes/dashboard/matrix/global');
            setDatosGlobales(res.data);
        } catch (error) {
            console.error("Error cargando global");
        } finally {
            setLoading(false);
        }
    };

    const verDetallePeriodo = (id, nombre) => {
        setPeriodoSeleccionado(id);
        setPeriodoNombre(nombre);
    };

    // --- FUNCIÓN DE DESCARGA EXCEL ---
    const handleDescargarExcel = async () => {
        setDownloading(true);
        try {
            const response = await api.get('/reportes/exportar-excel', {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Inventario_Completo_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Excel descargado correctamente");
        } catch (error) {
            console.error("Error descargando excel", error);
            toast.error("Error al generar el reporte");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <Toaster position="top-right" />

            {/* HEADER DINÁMICO */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        {periodoSeleccionado ? (
                            <>
                                <Calendar className="text-blue-600" /> Detalle: {periodoNombre}
                            </>
                        ) : 'Inventario Global'}
                    </h2>
                    <p className="text-slate-500 font-medium">
                        {periodoSeleccionado 
                            ? 'Desglose detallado por semanas y rutas' 
                            : 'Vista general de productos a través de todos los periodos'}
                    </p>
                </div>

                <div className="flex gap-3">
                    {/* BOTÓN DE DESCARGA (Solo en Global) */}
                    {!periodoSeleccionado && (
                        <button 
                            onClick={handleDescargarExcel}
                            disabled={downloading}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {downloading ? (
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                                <Download size={18} />
                            )}
                            {downloading ? 'Generando...' : 'Exportar Excel'}
                        </button>
                    )}

                    {periodoSeleccionado && (
                        <button 
                            onClick={() => setPeriodoSeleccionado(null)}
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
                        >
                            <ArrowLeft size={18} /> Volver al Global
                        </button>
                    )}
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium mt-4 animate-pulse">Cargando datos...</p>
                </div>
            ) : (
                <>
                    {!periodoSeleccionado && (
                        <TablaGlobalProductos 
                            header={datosGlobales.headers} 
                            data={datosGlobales.data} 
                            onPeriodoClick={verDetallePeriodo}
                        />
                    )}

                    {periodoSeleccionado && (
                        <DetallePeriodo periodoId={periodoSeleccionado} />
                    )}
                </>
            )}
        </div>
    );
}

// ===============================================
// VISTA 1: TABLA GLOBAL (Con soporte para Aseo)
// ===============================================
function TablaGlobalProductos({ header, data, onPeriodoClick }) {
    if (!data || data.length === 0) return <EmptyState mensaje="No hay datos registrados." />;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-blue-50 p-2 rounded-lg w-fit">
                <MousePointerClick size={14} />
                <span>Tip: Haz clic en el nombre de un periodo (columna) para ver su detalle semanal.</span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden pb-2">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                                <th className="px-6 py-5 w-64 sticky left-0 bg-slate-50/95 backdrop-blur z-20 border-r border-slate-200 shadow-sm">Producto</th>
                                <th className="px-6 py-5 min-w-[180px] bg-slate-100 text-slate-700 text-center border-r border-slate-200">Total Histórico</th>
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
                                    <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-20 border-r border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            {/* LOGICA DE ICONOS Y COLORES (ASEO INCLUIDO) */}
                                            <div className={`p-2 rounded-lg shadow-sm ${
                                                row.categoria === 'grano' ? 'bg-amber-100 text-amber-600' : 
                                                row.categoria === 'aseo' ? 'bg-cyan-100 text-cyan-600' : 
                                                'bg-purple-100 text-purple-600'
                                            }`}>
                                                {row.categoria === 'grano' ? <Wheat size={16} /> : 
                                                 row.categoria === 'aseo' ? <Sparkles size={16} /> : 
                                                 <ImageIcon size={16} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{row.nombre}</p>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">{row.categoria}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 bg-slate-50/50 border-r border-slate-200">
                                        <div className="flex flex-col gap-1 items-center">
                                            <span className={`text-lg font-black ${row.global.balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>{row.global.balance}</span>
                                            <div className="flex gap-2 text-[10px] font-bold">
                                                <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">+{row.global.entradas}</span>
                                                <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">-{row.global.salidas}</span>
                                            </div>
                                        </div>
                                    </td>
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
            </div>
        </div>
    );
}

// ===============================================
// VISTA 2: DETALLE DEL PERIODO (Con soporte para Aseo)
// ===============================================
function DetallePeriodo({ periodoId }) {
    const [dataMatrix, setDataMatrix] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get(`/reportes/dashboard/matrix/${periodoId}`);
                setDataMatrix(res.data);
            } catch (error) { console.error("Error cargando detalle"); } finally { setLoading(false); }
        };
        cargar();
    }, [periodoId]);

    if (loading) return <div className="text-center py-10 text-slate-400">Cargando desglose...</div>;
    if (!dataMatrix || dataMatrix.data.length === 0) return <EmptyState mensaje="No hay movimientos en este periodo." />;

    return (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            
            {/* TABLA MATRIZ */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden pb-4">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Package size={20} className="text-blue-600"/> Desglose de Productos
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Inventario por semana</p>
                </div>
                <div className="overflow-x-auto">
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
                                                <div><p className="font-bold text-slate-700 text-sm">{row.nombre}</p><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{row.categoria}</p></div>
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
            </div>

            {/* SECCIÓN DE RUTAS */}
            <ResumenRutas productos={dataMatrix.data} />
        </div>
    );
}

// LOGICA DE RUTAS
function ResumenRutas({ productos }) {
    const rutasProcesadas = useMemo(() => {
        const rutasMap = {};
        productos.forEach(prod => {
            Object.entries(prod.semanas).forEach(([semNum, data]) => {
                if (data.rutas) {
                    Object.entries(data.rutas).forEach(([nombreRuta, cantidad]) => {
                        if (!rutasMap[nombreRuta]) rutasMap[nombreRuta] = {};
                        if (!rutasMap[nombreRuta][semNum]) rutasMap[nombreRuta][semNum] = [];
                        
                        rutasMap[nombreRuta][semNum].push({
                            producto: prod.nombre,
                            categoria: prod.categoria,
                            cantidad: cantidad
                        });
                    });
                }
            });
        });
        return rutasMap;
    }, [productos]);

    const nombresRutas = Object.keys(rutasProcesadas);

    if (nombresRutas.length === 0) return null;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-orange-50/30 flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Truck size={20} /></div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">Logística y Rutas</h3>
                    <p className="text-xs text-slate-500">¿Qué salió y por dónde?</p>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nombresRutas.map(ruta => (
                    <TarjetaRuta key={ruta} nombreRuta={ruta} datosSemanas={rutasProcesadas[ruta]} />
                ))}
            </div>
        </div>
    );
}

// COMPONENTE TARJETA INDIVIDUAL (Con soporte de color para Aseo)
function TarjetaRuta({ nombreRuta, datosSemanas }) {
    const semanasDisponibles = Object.keys(datosSemanas).sort((a, b) => a - b);
    const [semanaActiva, setSemanaActiva] = useState(semanasDisponibles[0]);
    const productosMostrar = datosSemanas[semanaActiva] || [];

    return (
        <div className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col h-full">
            <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex flex-col gap-3">
                <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-orange-500" /> 
                    <span className="truncate" title={nombreRuta}>{nombreRuta}</span>
                </h4>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                        value={semanaActiva}
                        onChange={(e) => setSemanaActiva(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold py-2 pl-9 pr-2 rounded-lg outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 appearance-none cursor-pointer"
                    >
                        {semanasDisponibles.map(sem => (
                            <option key={sem} value={sem}>Ver Semana {sem}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="p-4 flex-1">
                <div className="space-y-3">
                    {productosMostrar.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full shadow-sm ${
                                    item.categoria === 'grano' ? 'bg-amber-400' : 
                                    item.categoria === 'aseo' ? 'bg-cyan-400' : 
                                    'bg-purple-400'
                                }`}></div>
                                <span className="text-slate-600 font-medium">{item.producto}</span>
                            </div>
                            <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs border border-red-100">
                                -{item.cantidad}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                Total ítems: {productosMostrar.length}
            </div>
        </div>
    );
}

const EmptyState = ({ mensaje }) => (
    <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 border-dashed">
        <div className="bg-slate-50 p-4 rounded-full mb-4"><AlertCircle size={32} className="text-slate-400" /></div>
        <p className="text-slate-500 font-medium text-lg">{mensaje}</p>
    </div>
);