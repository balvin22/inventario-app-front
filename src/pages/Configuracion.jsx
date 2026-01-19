import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Calendar, Map, ChevronDown, 
    Pencil, MapPin, Clock 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Modal from '../components/Modal';

export default function Configuracion() {
    const [activeTab, setActiveTab] = useState('periodos');

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
            <Toaster position="top-right" />
            
            <div className="flex flex-col gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Configuración del Sistema</h2>
                <p className="text-sm md:text-base text-slate-500">Administra los ciclos de tiempo y rutas.</p>
            </div>
            
            {/* TABS RESPONSIVOS (SCROLL HORIZONTAL SI ES NECESARIO) */}
            <div className="flex overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                <div className="flex p-1 bg-slate-100 rounded-xl w-fit shrink-0">
                    <button 
                        onClick={() => setActiveTab('periodos')}
                        className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'periodos' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Calendar size={18} /> Periodos
                    </button>
                    <button 
                        onClick={() => setActiveTab('rutas')}
                        className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'rutas' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Map size={18} /> Rutas
                    </button>
                </div>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'periodos' ? <GestionPeriodos /> : <GestionRutas />}
            </div>
        </div>
    );
}

// SUB-MÓDULO: GESTIÓN DE RUTAS (RESPONSIVO)
function GestionRutas() {
    const [rutas, setRutas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [editingId, setEditingId] = useState(null);

    const cargar = async () => { const res = await api.get('/rutas/'); setRutas(res.data); };
    useEffect(() => { cargar(); }, []);

    const abrirCrear = () => { setEditingId(null); setFormData({ nombre: '', descripcion: '' }); setShowModal(true); };
    
    const abrirEditar = (ruta) => { 
        setEditingId(ruta.id); 
        setFormData({ nombre: ruta.nombre, descripcion: ruta.descripcion || '' }); 
        setShowModal(true); 
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/rutas/${editingId}`, formData);
                toast.success('Ruta actualizada');
            } else {
                await api.post('/rutas/', { ...formData, activa: true });
                toast.success('Ruta creada');
            }
            setShowModal(false); cargar();
        } catch { toast.error('Error guardando ruta'); }
    };

    const handleEliminar = async (id) => {
        if (!confirm('¿Eliminar esta ruta?')) return;
        try { await api.delete(`/rutas/${id}`); toast.success('Ruta eliminada'); cargar(); } 
        catch { toast.error('Error al eliminar'); }
    };

    return (
        <div className="space-y-6">
            {/* HEADER TARJETA MÓVIL */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><MapPin size={20} /></div>
                    <div>
                        <h3 className="font-bold text-slate-800">Catálogo de Rutas</h3>
                        <p className="text-xs text-slate-500">Destinos disponibles</p>
                    </div>
                </div>
                <button onClick={abrirCrear} className="w-full sm:w-auto text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                    <Plus size={16} /> Nueva Ruta
                </button>
            </div>
            
            {/* GRID RESPONSIVO: 1 COL EN MÓVIL, 2 EN TABLET, 3 EN PC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rutas.map(r => (
                    <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        {/* Botones visibles siempre en móvil, hover en escritorio */}
                        <div className="absolute top-3 right-3 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => abrirEditar(r)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Pencil size={14} /></button>
                            <button onClick={() => handleEliminar(r.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                                {r.nombre.charAt(0).toUpperCase()}
                            </div>
                            <h4 className="font-bold text-slate-700 truncate pr-16">{r.nombre}</h4>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2">{r.descripcion || 'Sin descripción.'}</p>
                    </div>
                ))}
                {rutas.length === 0 && <div className="col-span-full text-center p-8 text-slate-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">No hay rutas creadas.</div>}
            </div>

            {showModal && (
                <Modal title={editingId ? "Editar Ruta" : "Nueva Ruta"} onClose={() => setShowModal(false)}>
                    <form onSubmit={handleGuardar} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700">Nombre</label>
                            <input required className="w-full p-2.5 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Ej: Ruta Norte" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700">Descripción</label>
                            <textarea className="w-full p-2.5 border rounded-lg mt-1 h-24 resize-none focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Detalles opcionales..." value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                        </div>
                        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-transform">Guardar</button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

// SUB-MÓDULO: GESTIÓN DE PERIODOS (RESPONSIVO)
function GestionPeriodos() {
    const [periodos, setPeriodos] = useState([]);
    const [modalPeriodo, setModalPeriodo] = useState({ show: false, editId: null, data: {} });
    const [modalSemana, setModalSemana] = useState({ show: false, periodoId: null, editId: null, data: {} });
    const [expanded, setExpanded] = useState(null);
    const [semanas, setSemanas] = useState([]);

    const cargar = async () => { const res = await api.get('/periodos/'); setPeriodos(res.data); };
    useEffect(() => { cargar(); }, []);

    const toggleExpand = async (id) => {
        if (expanded === id) { setExpanded(null); } 
        else {
            setExpanded(id);
            try { const res = await api.get(`/periodos/${id}/semanas`); setSemanas(res.data); } 
            catch { setSemanas([]); }
        }
    };

    const guardarPeriodo = async (e) => {
        e.preventDefault();
        try {
            if (modalPeriodo.editId) await api.put(`/periodos/${modalPeriodo.editId}`, modalPeriodo.data);
            else await api.post('/periodos/', { ...modalPeriodo.data, activo: true });
            toast.success('Guardado'); setModalPeriodo({ show: false, editId: null, data: {} }); cargar();
        } catch { toast.error('Error'); }
    };

    const eliminarPeriodo = async (id, e) => {
        e.stopPropagation();
        if (!confirm('¿Borrar periodo?')) return;
        try { await api.delete(`/periodos/${id}`); toast.success('Eliminado'); cargar(); } catch { toast.error('Error'); }
    };

    const guardarSemana = async (e) => {
        e.preventDefault();
        try {
            if (modalSemana.editId) await api.put(`/periodos/semanas/${modalSemana.editId}`, { ...modalSemana.data, periodo_id: modalSemana.periodoId });
            else await api.post(`/periodos/${modalSemana.periodoId}/semanas`, { ...modalSemana.data, periodo_id: modalSemana.periodoId });
            toast.success('Semana guardada'); 
            const pid = modalSemana.periodoId;
            setModalSemana({ show: false, periodoId: null, editId: null, data: {} });
            const res = await api.get(`/periodos/${pid}/semanas`); setSemanas(res.data);
        } catch { toast.error('Error'); }
    };

    const eliminarSemana = async (id) => {
        if (!confirm('¿Borrar semana?')) return;
        try { await api.delete(`/periodos/semanas/${id}`); toast.success('Eliminada'); const res = await api.get(`/periodos/${expanded}/semanas`); setSemanas(res.data); } catch { toast.error('Error'); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20} /></div>
                    <div>
                        <h3 className="font-bold text-slate-800">Ciclos de Tiempo</h3>
                        <p className="text-xs text-slate-500">Periodos mensuales</p>
                    </div>
                </div>
                <button 
                    onClick={() => setModalPeriodo({ show: true, editId: null, data: { nombre: '', fecha_inicio: '', fecha_fin: '' } })} 
                    className="w-full sm:w-auto text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                >
                    <Plus size={16} /> Nuevo Periodo
                </button>
            </div>

            <div className="space-y-3">
                {periodos.map(p => (
                    <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all">
                        <div onClick={() => toggleExpand(p.id)} className="p-4 sm:p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50">
                            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                <div className={`transition-transform duration-200 shrink-0 ${expanded === p.id ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}><ChevronDown size={20} /></div>
                                <div className="truncate">
                                    <h4 className="font-bold text-slate-800 text-base sm:text-lg truncate">{p.nombre}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 truncate">
                                        <Calendar size={12} className="shrink-0" />
                                        <span>{new Date(p.fecha_inicio).toLocaleDateString()} - {new Date(p.fecha_fin).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); setModalPeriodo({ show: true, editId: p.id, data: p }); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={18} /></button>
                                <button onClick={(e) => eliminarPeriodo(p.id, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                            </div>
                        </div>

                        {expanded === p.id && (
                            <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 animate-in slide-in-from-top-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Semanas</h5>
                                    <button onClick={() => setModalSemana({ show: true, periodoId: p.id, editId: null, data: { numero: '', fecha_inicio: '', fecha_fin: '' } })} className="text-xs bg-white border border-slate-200 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-50 shadow-sm flex items-center gap-1">
                                        <Plus size={14} /> Agregar
                                    </button>
                                </div>
                                {semanas.length === 0 ? (
                                    <div className="text-center p-4 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">Sin semanas.</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {semanas.map(s => (
                                            <div key={s.id} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center group shadow-sm">
                                                <div>
                                                    <span className="font-bold text-slate-700 block">Semana {s.numero}</span>
                                                    <span className="text-[10px] sm:text-xs text-slate-500">{new Date(s.fecha_inicio).toLocaleDateString()} - {new Date(s.fecha_fin).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => setModalSemana({ show: true, periodoId: p.id, editId: s.id, data: s })} className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded"><Pencil size={14} /></button>
                                                    <button onClick={() => eliminarSemana(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 rounded"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* MODALS REUTILIZABLES PARA MÓVIL */}
            {modalPeriodo.show && (
                <Modal title={modalPeriodo.editId ? "Editar" : "Nuevo Periodo"} onClose={() => setModalPeriodo({ ...modalPeriodo, show: false })}>
                    <form onSubmit={guardarPeriodo} className="space-y-4">
                        <div><label className="text-sm font-semibold">Nombre</label><input required className="w-full p-3 border rounded-xl" value={modalPeriodo.data.nombre} onChange={e => setModalPeriodo({ ...modalPeriodo, data: { ...modalPeriodo.data, nombre: e.target.value } })} /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Inicio</label><input type="datetime-local" required className="w-full p-3 border rounded-xl mt-1" value={modalPeriodo.data.fecha_inicio} onChange={e => setModalPeriodo({ ...modalPeriodo, data: { ...modalPeriodo.data, fecha_inicio: e.target.value } })} /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Fin</label><input type="datetime-local" required className="w-full p-3 border rounded-xl mt-1" value={modalPeriodo.data.fecha_fin} onChange={e => setModalPeriodo({ ...modalPeriodo, data: { ...modalPeriodo.data, fecha_fin: e.target.value } })} /></div>
                        </div>
                        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Guardar</button>
                    </form>
                </Modal>
            )}

            {modalSemana.show && (
                <Modal title={modalSemana.editId ? "Editar Semana" : "Nueva Semana"} onClose={() => setModalSemana({ ...modalSemana, show: false })}>
                    <form onSubmit={guardarSemana} className="space-y-4">
                        <div><label className="text-sm font-semibold">Número Semana</label><input type="number" required className="w-full p-3 border rounded-xl" value={modalSemana.data.numero} onChange={e => setModalSemana({ ...modalSemana, data: { ...modalSemana.data, numero: e.target.value } })} /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Inicio</label><input type="datetime-local" required className="w-full p-3 border rounded-xl mt-1" value={modalSemana.data.fecha_inicio} onChange={e => setModalSemana({ ...modalSemana, data: { ...modalSemana.data, fecha_inicio: e.target.value } })} /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Fin</label><input type="datetime-local" required className="w-full p-3 border rounded-xl mt-1" value={modalSemana.data.fecha_fin} onChange={e => setModalSemana({ ...modalSemana, data: { ...modalSemana.data, fecha_fin: e.target.value } })} /></div>
                        </div>
                        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Guardar</button>
                    </form>
                </Modal>
            )}
        </div>
    );
}