import { Clock, Plus, ChevronDown, Calendar, Pencil, Trash2 } from 'lucide-react';
import Modal from '../Modal';
import { usePeriodos } from '../../hooks/usePeriodos';

export default function PeriodosManager() {
    const {
        periodos, semanas, expanded, toggleExpand,
        modalPeriodo, setModalPeriodo, abrirModalPeriodo, guardarPeriodo, eliminarPeriodo,
        modalSemana, setModalSemana, abrirModalSemana, guardarSemana, eliminarSemana
    } = usePeriodos();

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20} /></div>
                    <div>
                        <h3 className="font-bold text-slate-800">Ciclos de Tiempo</h3>
                        <p className="text-xs text-slate-500">Periodos mensuales</p>
                    </div>
                </div>
                <button 
                    onClick={() => abrirModalPeriodo()} 
                    className="w-full sm:w-auto text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                >
                    <Plus size={16} /> Nuevo Periodo
                </button>
            </div>

            {/* LISTA PERIODOS */}
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
                                <button onClick={(e) => { e.stopPropagation(); abrirModalPeriodo(p); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={18} /></button>
                                <button onClick={(e) => eliminarPeriodo(p.id, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                            </div>
                        </div>

                        {/* DETALLE SEMANAS */}
                        {expanded === p.id && (
                            <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 animate-in slide-in-from-top-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Semanas</h5>
                                    <button onClick={() => abrirModalSemana(p.id)} className="text-xs bg-white border border-slate-200 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-50 shadow-sm flex items-center gap-1">
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
                                                    <button onClick={() => abrirModalSemana(p.id, s)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded"><Pencil size={14} /></button>
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

            {/* MODALS */}
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