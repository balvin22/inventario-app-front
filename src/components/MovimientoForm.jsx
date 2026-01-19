import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function MovimientoForm({ onClose, onSuccess }) {
    // Estados para llenar los selects
    const [productos, setProductos] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [semanas, setSemanas] = useState([]);
    const [rutas, setRutas] = useState([]);

    // Estado del formulario
    const [formData, setFormData] = useState({
        producto_id: '',
        tipo: 'entrada', // entrada | salida
        cantidad: '',
        periodo_id: '',
        semana_id: '',
        destino_tipo: 'ruta', // ruta | tercero
        ruta_nombre: '',
        nota_terceros: ''
    });

    // Cargar datos iniciales (Productos y Periodos)
   useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resProd, resPer, resRutas] = await Promise.all([
                    api.get('/productos/'),
                    api.get('/periodos/'),
                    api.get('/rutas/') // <--- NUEVO: Petición a la API
                ]);
                setProductos(resProd.data);
                setPeriodos(resPer.data);
                setRutas(resRutas.data); // <--- Guardamos las rutas
            } catch (error) {
                console.error(error);
                toast.error("Error cargando datos del formulario");
            }
        };
        cargarDatos();
    }, []);

    // Efecto Inteligente: Cuando cambia el periodo, cargar sus semanas
    useEffect(() => {
        if (formData.periodo_id) {
            api.get(`/periodos/${formData.periodo_id}/semanas`)
                .then(res => setSemanas(res.data))
                .catch(() => setSemanas([]));
        }
    }, [formData.periodo_id]);

    // Helper para saber si el producto seleccionado es GALERIA
    const isGaleria = () => {
        const prod = productos.find(p => p.id === parseInt(formData.producto_id));
        return prod?.categoria === 'galeria';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Limpieza de datos antes de enviar
            const payload = { ...formData };
            
            // Si es Grano, borrar semana (por si acaso)
            if (!isGaleria()) payload.semana_id = null;
            
            // Si es Entrada, borrar datos de salida
            if (payload.tipo === 'entrada') {
                payload.destino_tipo = null;
                payload.ruta_nombre = null;
                payload.nota_terceros = null;
            } else {
                // Si es Salida, limpiar lo que no corresponda
                if (payload.destino_tipo === 'ruta') payload.nota_terceros = null;
                if (payload.destino_tipo === 'tercero') payload.ruta_nombre = null;
            }

            await api.post('/movimientos/', payload);
            toast.success('Movimiento registrado con éxito');
            onSuccess(); // Recargar tabla
            onClose();   // Cerrar modal
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error registrando movimiento');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header del Modal */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Registrar Movimiento</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* 1. Selección de Producto y Tipo */}
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
                                    <option key={p.id} value={p.id}>{p.nombre} ({p.categoria})</option>
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

                    {/* 2. Cantidad */}
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

                    {/* 3. Tiempo (Periodo y Semana) - Lógica Condicional */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Periodo</label>
                            <select 
                                className="w-full p-2 border rounded-lg bg-white outline-none"
                                value={formData.periodo_id}
                                onChange={e => setFormData({...formData, periodo_id: e.target.value})}
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {periodos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Solo mostramos Semana si es Galeria o si es Salida (ambos la usan a veces) 
                            Pero tu regla decía: Galeria ENTRADA obligatoria semana. Grano ENTRADA prohibida semana.
                            Aquí mostramos el select si es Galería.
                        */}
                        {isGaleria() && (
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Semana</label>
                                <select 
                                    className="w-full p-2 border rounded-lg bg-white outline-none"
                                    value={formData.semana_id}
                                    onChange={e => setFormData({...formData, semana_id: e.target.value})}
                                    required={formData.tipo === 'entrada'} // Obligatorio solo en entrada
                                >
                                    <option value="">Seleccionar...</option>
                                    {semanas.map(s => (
                                        <option key={s.id} value={s.id}>Semana {s.numero}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* 4. Sección de SALIDAS (Condicional) */}
                    {formData.tipo === 'salida' && (
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-red-800 mb-3 uppercase tracking-wider">Detalles de Salida</h4>
                            
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-red-700 mb-1">Destino</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="destino" value="ruta" checked={formData.destino_tipo === 'ruta'} onChange={() => setFormData({...formData, destino_tipo: 'ruta'})} className="text-red-600 focus:ring-red-500" />
                                        <span className="text-sm text-slate-700">Ruta de Venta</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="destino" value="tercero" checked={formData.destino_tipo === 'tercero'} onChange={() => setFormData({...formData, destino_tipo: 'tercero'})} className="text-red-600 focus:ring-red-500" />
                                        <span className="text-sm text-slate-700">Terceros / Otros</span>
                                    </label>
                                </div>
                            </div>

                            {formData.destino_tipo === 'ruta' ? (
                                <div>
                                    <label className="block text-sm font-medium text-red-700 mb-1">Seleccionar Ruta</label>
                                    {/* CAMBIO: Ahora es un SELECT, no un INPUT */}
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
                                    {rutas.length === 0 && <p className="text-xs text-red-500 mt-1">⚠️ No hay rutas creadas. Debes crear una primero.</p>}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-red-700 mb-1">Nota Explicativa</label>
                                    <textarea placeholder="¿Por qué sale este producto?" className="w-full p-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-200 outline-none h-20" value={formData.nota_terceros} onChange={e => setFormData({...formData, nota_terceros: e.target.value})} required />
                                </div>
                            )}
                        </div>
                    )}

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-200">
                        <Save size={20} /> Registrar Movimiento
                    </button>
                </form>
            </div>
        </div>
    );
}