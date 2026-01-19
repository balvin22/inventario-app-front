import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Filter, ArrowDownLeft, ArrowUpRight, 
    Calendar, Truck, User, Search, PackageOpen 
} from 'lucide-react';
import MovimientoForm from '../components/MovimientoForm';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

export default function Movimientos() {
    const [movimientos, setMovimientos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filterType, setFilterType] = useState('todos'); // todos | entrada | salida
    const [searchTerm, setSearchTerm] = useState('');

    // Cargar TODO: Movimientos y Catálogos para mapear nombres
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [resMovs, resProds, resPers] = await Promise.all([
                api.get('/movimientos/'),
                api.get('/productos/'),
                api.get('/periodos/')
            ]);
            setMovimientos(resMovs.data);
            setProductos(resProds.data);
            setPeriodos(resPers.data);
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
    
    // --- FILTRADO ---
    const movimientosFiltrados = movimientos.filter(m => {
        const cumpleTipo = filterType === 'todos' || m.tipo === filterType;
        const nombreProd = getProdName(m.producto_id).toLowerCase();
        const cumpleSearch = nombreProd.includes(searchTerm.toLowerCase());
        return cumpleTipo && cumpleSearch;
    });

    // --- STATS RÁPIDOS ---
    const totalEntradas = movimientos.filter(m => m.tipo === 'entrada').length;
    const totalSalidas = movimientos.filter(m => m.tipo === 'salida').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <Toaster position="top-right" />
            
            {/* HEADER RESPONSIVO */}
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

            {/* DASHBOARD MINI (GRID) */}
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

            {/* BARRA DE HERRAMIENTAS (Filtros y Buscador) */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                
                {/* Tabs de Filtro (Scroll horizontal en móvil) */}
                <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                    <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
                        {['todos', 'entrada', 'salida'].map((tipo) => (
                            <button
                                key={tipo}
                                onClick={() => setFilterType(tipo)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap ${
                                    filterType === tipo 
                                    ? 'bg-white text-slate-800 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tipo}s
                            </button>
                        ))}
                    </div>
                </div>

                {/* Buscador */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar producto..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
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
                                            <p>No hay movimientos registrados.</p>
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