import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { 
    Plus, Filter, ArrowDownLeft, ArrowUpRight, 
    Calendar, Truck, User, Search, PackageOpen, X 
} from 'lucide-react';
import MovimientoForm from '../components/MovimientoForm';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

export default function Movimientos() {
    const [movimientos, setMovimientos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [rutas, setRutas] = useState([]); // Nuevo estado para rutas
    
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // --- ESTADOS DE FILTRO ---
    const [filterType, setFilterType] = useState('todos'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPeriodo, setSelectedPeriodo] = useState('todos'); // ID o 'todos'
    const [selectedSemana, setSelectedSemana] = useState('todos');   // Numero o 'todos'
    const [selectedRuta, setSelectedRuta] = useState('todos');       // NombreRuta o 'todos'

    // Cargar TODO
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [resMovs, resProds, resPers, resRutas] = await Promise.all([
                api.get('/movimientos/'),
                api.get('/productos/'),
                api.get('/periodos/'),
                api.get('/rutas/') // Asumo que tienes este endpoint, si no, lo omitimos
            ]);
            setMovimientos(resMovs.data);
            setProductos(resProds.data);
            setPeriodos(resPers.data);
            setRutas(resRutas.data); 
        } catch (error) {
            toast.error("Error cargando historial");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    // --- HELPER FUNCTIONS ---
    const getProdName = (id) => productos.find(p => p.id === id)?.nombre || 'Producto desconocido';
    const getPeriodoName = (id) => periodos.find(p => p.id === id)?.nombre || '-';
    
    // Calcular semanas disponibles según el periodo seleccionado (para el dropdown dinámico)
    const semanasDisponibles = useMemo(() => {
        if (selectedPeriodo === 'todos') return [];
        // Aquí podrías filtrar las semanas reales del periodo si tuvieras esa data a mano.
        // Por ahora, sacamos las semanas únicas que aparecen en los movimientos de ese periodo.
        const semanasDelPeriodo = movimientos
            .filter(m => m.periodo_id === parseInt(selectedPeriodo) && m.semana_id)
            .map(m => m.semana_id); // Ojo: Aquí usas semana_id (que suele ser el ID de la tabla semana, no el número 1,2,3).
            // Si quieres mostrar "Semana 1", necesitas cruzar con la tabla Semanas o asumir que semana_id es el número.
            // Para simplificar, usaremos los valores únicos encontrados.
        return [...new Set(semanasDelPeriodo)].sort((a,b) => a - b);
    }, [selectedPeriodo, movimientos]);

    // --- FILTRADO AVANZADO ---
    const movimientosFiltrados = movimientos.filter(m => {
        // 1. Filtro Tipo (Entrada/Salida)
        const cumpleTipo = filterType === 'todos' || m.tipo === filterType;
        
        // 2. Filtro Buscador (Producto)
        const nombreProd = getProdName(m.producto_id).toLowerCase();
        const cumpleSearch = nombreProd.includes(searchTerm.toLowerCase());

        // 3. Filtro Periodo
        const cumplePeriodo = selectedPeriodo === 'todos' || m.periodo_id === parseInt(selectedPeriodo);

        // 4. Filtro Semana (Solo si hay periodo seleccionado y el movimiento tiene semana)
        const cumpleSemana = selectedSemana === 'todos' || (m.semana_id && m.semana_id === parseInt(selectedSemana));

        // 5. Filtro Ruta (Solo para salidas)
        const cumpleRuta = selectedRuta === 'todos' || (m.destino_tipo === 'ruta' && m.ruta_nombre === selectedRuta);

        return cumpleTipo && cumpleSearch && cumplePeriodo && cumpleSemana && cumpleRuta;
    });

    // --- STATS RÁPIDOS (Basados en lo filtrado o totales? Usualmente totales) ---
    const totalEntradas = movimientos.filter(m => m.tipo === 'entrada').length;
    const totalSalidas = movimientos.filter(m => m.tipo === 'salida').length;

    // Función para limpiar todos los filtros
    const limpiarFiltros = () => {
        setFilterType('todos');
        setSearchTerm('');
        setSelectedPeriodo('todos');
        setSelectedSemana('todos');
        setSelectedRuta('todos');
    };

    const hayFiltrosActivos = filterType !== 'todos' || searchTerm !== '' || selectedPeriodo !== 'todos' || selectedRuta !== 'todos';

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <Toaster position="top-right" />
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Bitácora</h2>
                    <p className="text-slate-500">Historial detallado de movimientos.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-200 font-medium active:scale-95"
                >
                    <Plus size={20} /> Registrar Movimiento
                </button>
            </div>

            {/* DASHBOARD MINI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ArrowDownLeft size={20} /></div>
                    <div><p className="text-xs text-emerald-600 font-bold uppercase">Entradas</p><p className="text-xl font-bold text-emerald-800">{totalEntradas}</p></div>
                </div>
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ArrowUpRight size={20} /></div>
                    <div><p className="text-xs text-red-600 font-bold uppercase">Salidas</p><p className="text-xl font-bold text-red-800">{totalSalidas}</p></div>
                </div>
            </div>

            {/* BARRA DE HERRAMIENTAS AVANZADA */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                
                {/* Fila Superior: Tabs Tipo + Buscador */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex p-1 bg-slate-100 rounded-lg w-full md:w-auto">
                        {['todos', 'entrada', 'salida'].map((tipo) => (
                            <button
                                key={tipo}
                                onClick={() => setFilterType(tipo)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                                    filterType === tipo ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tipo}s
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" placeholder="Buscar producto..." 
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Fila Inferior: Selectores de Filtro (Periodo, Semana, Ruta) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-50">
                    
                    {/* Selector Periodo */}
                    <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select 
                            value={selectedPeriodo}
                            onChange={(e) => { setSelectedPeriodo(e.target.value); setSelectedSemana('todos'); }}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-blue-300 outline-none appearance-none cursor-pointer hover:bg-slate-50"
                        >
                            <option value="todos">Todos los Periodos</option>
                            {periodos.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Selector Semana (Deshabilitado si no hay periodo) */}
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select 
                            value={selectedSemana}
                            onChange={(e) => setSelectedSemana(e.target.value)}
                            disabled={selectedPeriodo === 'todos'}
                            className={`w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-blue-300 outline-none appearance-none ${selectedPeriodo === 'todos' ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-slate-50'}`}
                        >
                            <option value="todos">Todas las Semanas</option>
                            {semanasDisponibles.map(s => (
                                <option key={s} value={s}>Semana {s}</option> // Aquí deberías mapear ID a Numero si tienes la data
                            ))}
                        </select>
                    </div>

                    {/* Selector Ruta */}
                    <div className="relative">
                        <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select 
                            value={selectedRuta}
                            onChange={(e) => setSelectedRuta(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-blue-300 outline-none appearance-none cursor-pointer hover:bg-slate-50"
                        >
                            <option value="todos">Todas las Rutas</option>
                            {rutas.map(r => (
                                <option key={r.id} value={r.nombre}>{r.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Botón Limpiar Filtros */}
                    {hayFiltrosActivos && (
                        <button 
                            onClick={limpiarFiltros}
                            className="flex items-center justify-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            <X size={16} /> Limpiar Filtros
                        </button>
                    )}
                </div>
            </div>

            {/* TABLA CON SCROLL HORIZONTAL */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Fecha</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Tipo</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Producto</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Cantidad</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Detalle / Destino</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center p-8 text-slate-400">Cargando movimientos...</td></tr>
                            ) : movimientosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <div className="flex flex-col items-center text-slate-400">
                                            <PackageOpen size={40} className="mb-2 opacity-50" />
                                            <p>No se encontraron movimientos con estos filtros.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                movimientosFiltrados.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                        
                                        {/* 1. Fecha */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar size={14} className="text-slate-400 shrink-0"/>
                                                <span className="text-sm font-medium">
                                                    {new Date(m.fecha).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(m.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400 ml-6 mt-0.5 whitespace-nowrap">
                                                {getPeriodoName(m.periodo_id)} 
                                                {m.semana_id && ` • Sem ${m.semana_id}`} 
                                            </div>
                                        </td>

                                        {/* 2. Tipo (Badge) */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                m.tipo === 'entrada' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {m.tipo === 'entrada' ? <ArrowDownLeft size={12}/> : <ArrowUpRight size={12}/>}
                                                {m.tipo.toUpperCase()}
                                            </span>
                                        </td>

                                        {/* 3. Producto */}
                                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                                            {getProdName(m.producto_id)}
                                        </td>

                                        {/* 4. Cantidad */}
                                        <td className="px-6 py-4 font-bold text-slate-800 text-lg whitespace-nowrap">
                                            {m.cantidad}
                                        </td>

                                        {/* 5. Detalles */}
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                            {m.tipo === 'entrada' ? (
                                                <span className="text-slate-400 italic">Ingreso a bodega</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {m.destino_tipo === 'ruta' ? (
                                                        <>
                                                            <div className="p-1 bg-orange-100 text-orange-600 rounded shrink-0"><Truck size={14}/></div>
                                                            <span className="font-medium truncate max-w-[150px]">{m.ruta_nombre}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="p-1 bg-purple-100 text-purple-600 rounded shrink-0"><User size={14}/></div>
                                                            <span className="italic truncate max-w-[150px]">"{m.nota_terceros}"</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FORMULARIO */}
            {showModal && (
                <MovimientoForm 
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        console.log("Recargando...");
                        cargarDatos(); 
                    }}
                />
            )}
        </div>
    );
}