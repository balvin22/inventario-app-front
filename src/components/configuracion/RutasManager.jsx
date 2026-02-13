import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../Modal';
import { useRutas } from '../../hooks/useRutas';

export default function RutasManager() {
    const {
        rutas, showModal, setShowModal,
        formData, setFormData, editingId,
        abrirCrear, abrirEditar,
        guardarRuta, eliminarRuta
    } = useRutas();

    return (
        <div className="space-y-6">
            {/* HEADER */}
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
            
            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rutas.map(r => (
                    <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-3 right-3 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => abrirEditar(r)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Pencil size={14} /></button>
                            <button onClick={() => eliminarRuta(r.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg"><Trash2 size={14} /></button>
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

            {/* MODAL */}
            {showModal && (
                <Modal title={editingId ? "Editar Ruta" : "Nueva Ruta"} onClose={() => setShowModal(false)}>
                    <form onSubmit={guardarRuta} className="space-y-4">
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