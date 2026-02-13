import { useState, useEffect } from 'react';
import { Save, X, Loader2, Calendar } from 'lucide-react'; // <--- Importamos Calendar
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function MovimientoForm({ onClose, onSuccess, initialData }) {
    const [productos, setProductos] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [semanas, setSemanas] = useState([]);
    const [rutas, setRutas] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fecha: '', // <--- NUEVO: Estado para la fecha
        producto_id: '',
        tipo: 'entrada', 
        cantidad: '',
        periodo_id: '',
        semana_id: '',
        destino_tipo: 'ruta', 
        ruta_nombre: '',
        nota_terceros: ''
    });

    // 1. CARGAR DATOS INICIALES (CATÁLOGOS)
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resProd, resPer, resRutas] = await Promise.all([
                    api.get('/productos/', { params: { limit: 1000 } }),
                    api.get('/periodos/'),
                    api.get('/rutas/')
                ]);

                const listaProductos = resProd.data.data || resProd.data;
                setProductos(Array.isArray(listaProductos) ? listaProductos : []);
                setPeriodos(resPer.data);
                setRutas(resRutas.data);
            } catch (error) {
                console.error(error);
                toast.error("Error cargando datos del formulario");
            }
        };
        cargarDatos();
    }, []);

    // 2. CARGAR DATOS SI ES EDICIÓN
    useEffect(() => {
        if (initialData) {
            // <--- NUEVO: Formatear fecha para datetime-local (YYYY-MM-DDTHH:mm)
            // slice(0, 16) recorta los segundos y zona horaria
            const fechaFormateada = new Date(initialData.fecha).toISOString().slice(0, 16);

            setFormData({
                fecha: fechaFormateada, // <--- Asignamos la fecha formateada
                producto_id: initialData.producto_id,
                cantidad: initialData.cantidad,
                tipo: initialData.tipo,
                periodo_id: initialData.periodo_id,
                semana_id: initialData.semana_id || "",
                destino_tipo: initialData.destino_tipo || "ruta",
                ruta_nombre: initialData.ruta_nombre || "",
                nota_terceros: initialData.nota_terceros || "",
            });

            if (initialData.periodo_id) {
                api.get(`/periodos/${initialData.periodo_id}/semanas`)
                    .then(res => setSemanas(res.data))
                    .catch(() => setSemanas([]));
            }
        } else {
            // <--- NUEVO: Si es registro nuevo, asignar fecha actual local
            const ahora = new Date();
            // Ajuste manual de zona horaria para que toISOString de la hora local correcta
            ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
            
            setFormData(prev => ({ 
                ...prev, 
                fecha: ahora.toISOString().slice(0, 16) 
            }));
        }
    }, [initialData]);

    const handlePeriodoChange = (e) => {
        const pid = e.target.value;
        setFormData({ ...formData, periodo_id: pid });
        if (pid) {
            api.get(`/periodos/${pid}/semanas`)
                .then(res => setSemanas(res.data))
                .catch(() => setSemanas([]));
        } else {
            setSemanas([]);
        }
    };

    const isGaleria = () => {
        const prod = productos.find(p => p.id === parseInt(formData.producto_id));
        return prod?.categoria === 'galeria';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { 
                ...formData,
                // <--- NUEVO: Convertir fecha de vuelta a ISO string completo para el backend
                fecha: new Date(formData.fecha).toISOString(),
                
                producto_id: parseInt(formData.producto_id),
                cantidad: parseFloat(formData.cantidad),
                periodo_id: parseInt(formData.periodo_id),
                semana_id: formData.semana_id ? parseInt(formData.semana_id) : null
            };
            
            if (!isGaleria()) payload.semana_id = null;
            
            if (payload.tipo === 'entrada') {
                payload.destino_tipo = null;
                payload.ruta_nombre = null;
                payload.nota_terceros = null;
            } else {
                if (payload.destino_tipo === 'ruta') payload.nota_terceros = null;
                if (payload.destino_tipo === 'tercero') payload.ruta_nombre = null;
            }

            if (initialData) {
                await api.patch(`/movimientos/${initialData.id}`, payload);
                toast.success('Movimiento actualizado');
            } else {
                await api.post('/movimientos/', payload);
                toast.success('Movimiento registrado');
            }
            
            onSuccess(); 
            onClose(); 
        } catch (error) {
            console.error(error);
            let msg = "Error al guardar";
            const detail = error.response?.data?.detail;
            if (Array.isArray(detail)) {
                msg = detail[0].msg;
            } else if (typeof detail === 'string') {
                msg = detail;
            }
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">
                        {initialData ? 'Editar Movimiento' : 'Registrar Movimiento'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    
                    {/* --- NUEVO CAMPO: FECHA --- */}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Fecha y Hora</label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input 
                                type="datetime-local"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-slate-700"
                                value={formData.fecha}
                                onChange={e => setFormData({...formData, fecha: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    {/* -------------------------- */}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Producto</label>
                            <select 
                                className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                value={formData.producto_id}
                                onChange={e => setFormData({...formData, producto_id: e.target.value})}
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Tipo</label>
                            <select 
                                className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                value={formData.tipo}
                                onChange={e => setFormData({...formData, tipo: e.target.value})}
                            >
                                <option value="entrada">📥 Entrada</option>
                                <option value="salida">📤 Salida</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Cantidad</label>
                        <input 
                            type="number" 
                            step="0.01"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                            value={formData.cantidad}
                            onChange={e => setFormData({...formData, cantidad: e.target.value})}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Periodo</label>
                            <select 
                                className="w-full p-2 border rounded-lg bg-white outline-none"
                                value={formData.periodo_id}
                                onChange={handlePeriodoChange}
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {periodos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {isGaleria() && (
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Semana</label>
                                <select 
                                    className="w-full p-2 border rounded-lg bg-white outline-none"
                                    value={formData.semana_id}
                                    onChange={e => setFormData({...formData, semana_id: e.target.value})}
                                    required={formData.tipo === 'entrada'}
                                >
                                    <option value="">Seleccionar...</option>
                                    {semanas.map(s => (
                                        <option key={s.id} value={s.id}>Semana {s.numero}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {formData.tipo === 'salida' && (
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-red-800 mb-3 uppercase tracking-wider">Detalles de Salida</h4>
                            
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-red-700 mb-1">Destino</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="destino" value="ruta" checked={formData.destino_tipo === 'ruta'} onChange={() => setFormData({...formData, destino_tipo: 'ruta'})} className="text-red-600 focus:ring-red-500" />
                                        <span className="text-sm text-slate-700">Ruta</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="destino" value="tercero" checked={formData.destino_tipo === 'tercero'} onChange={() => setFormData({...formData, destino_tipo: 'tercero'})} className="text-red-600 focus:ring-red-500" />
                                        <span className="text-sm text-slate-700">Tercero</span>
                                    </label>
                                </div>
                            </div>

                            {formData.destino_tipo === 'ruta' ? (
                                <div>
                                    <label className="block text-sm font-medium text-red-700 mb-1">Ruta</label>
                                    <select 
                                        className="w-full p-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-200 outline-none bg-white"
                                        value={formData.ruta_nombre}
                                        onChange={e => setFormData({...formData, ruta_nombre: e.target.value})}
                                        required
                                    >
                                        <option value="">-- Elige una ruta --</option>
                                        {rutas.map(r => (
                                            <option key={r.id} value={r.nombre}>{r.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-red-700 mb-1">Nota</label>
                                    <textarea placeholder="Motivo..." className="w-full p-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-200 outline-none h-20 resize-none" value={formData.nota_terceros} onChange={e => setFormData({...formData, nota_terceros: e.target.value})} required />
                                </div>
                            )}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        {initialData ? 'Guardar Cambios' : 'Registrar Movimiento'}
                    </button>
                </form>
            </div>
        </div>
    );
}