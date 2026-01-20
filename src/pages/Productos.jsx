import { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
    Plus, Search, Package, Save, 
    Wheat, Image as ImageIcon, Sparkles, 
    Pencil, Trash2, X 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Modal from '../components/Modal';

export default function Productos() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // 1. NUEVO ESTADO PARA EL FILTRO DE TARJETAS
    // 'all' muestra todo. Si vale 'grano', solo muestra granos, etc.
    const [filterCategory, setFilterCategory] = useState('all'); 
    
    const [formData, setFormData] = useState({ nombre: '', categoria: 'grano', descripcion: '' });
    const [editingId, setEditingId] = useState(null);

    const cargarProductos = async () => {
        try {
            const res = await api.get('/productos/');
            setProductos(res.data);
        } catch (error) { toast.error("Error cargando lista"); } 
        finally { setLoading(false); }
    };

    useEffect(() => { cargarProductos(); }, []);

    const abrirModalCrear = () => {
        setEditingId(null);
        setFormData({ nombre: '', categoria: 'grano', descripcion: '' });
        setShowModal(true);
    };

    const abrirModalEditar = (producto) => {
        setEditingId(producto.id);
        setFormData({
            nombre: producto.nombre,
            categoria: producto.categoria,
            descripcion: producto.descripcion || ''
        });
        setShowModal(true);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/productos/${editingId}`, formData);
                toast.success("Producto actualizado");
            } else {
                await api.post('/productos/', formData);
                toast.success("Producto creado");
            }
            setShowModal(false);
            cargarProductos();
        } catch (error) { toast.error("Error al guardar"); }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Eliminar producto?")) return;
        try {
            await api.delete(`/productos/${id}`);
            toast.success("Eliminado");
            cargarProductos();
        } catch (error) { toast.error("No se puede eliminar"); }
    };

    // 2. LÓGICA DE FILTRADO ACTUALIZADA (BUSCADOR + CATEGORÍA)
    const filteredProductos = productos.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || p.categoria === filterCategory;
        return matchesSearch && matchesCategory;
    });
    
    // Contadores para las tarjetas
    const totalGrano = productos.filter(p => p.categoria === 'grano').length;
    const totalGaleria = productos.filter(p => p.categoria === 'galeria').length;
    const totalAseo = productos.filter(p => p.categoria === 'aseo').length;

    // Helper de estilos
    const getCatStyle = (cat) => {
        switch(cat) {
            case 'grano': return { icon: <Wheat size={12}/>, style: 'bg-amber-50 text-amber-700' };
            case 'aseo': return { icon: <Sparkles size={12}/>, style: 'bg-cyan-50 text-cyan-700' };
            default: return { icon: <ImageIcon size={12}/>, style: 'bg-purple-50 text-purple-700' };
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <Toaster position="top-right" />
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Inventario</h2>
                    <p className="text-slate-500">Gestiona el catálogo maestro.</p>
                </div>
                <button 
                    onClick={abrirModalCrear} 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-200 font-medium active:scale-95"
                >
                    <Plus size={20} /> Nuevo Producto
                </button>
            </div>

            {/* 3. TARJETAS INTERACTIVAS 
                - Agregamos 'cursor-pointer'
                - Agregamos 'onClick'
                - Cambiamos el estilo si está activa (ring-2)
            */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                
                {/* TARJETA TOTAL (Muestra todos) */}
                <div 
                    onClick={() => setFilterCategory('all')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        filterCategory === 'all' 
                        ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 shadow-md' 
                        : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:bg-slate-50'
                    }`}
                >
                    <div className={`p-3 rounded-xl ${filterCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        <Package size={20} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase ${filterCategory === 'all' ? 'text-blue-700' : 'text-slate-500'}`}>Total</p>
                        <p className="text-xl font-black text-slate-800">{productos.length}</p>
                    </div>
                </div>

                {/* TARJETA GRANO */}
                <div 
                    onClick={() => setFilterCategory('grano')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        filterCategory === 'grano' 
                        ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500 shadow-md' 
                        : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:bg-amber-50/30'
                    }`}
                >
                    <div className={`p-3 rounded-xl ${filterCategory === 'grano' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'}`}>
                        <Wheat size={20} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase ${filterCategory === 'grano' ? 'text-amber-700' : 'text-slate-500'}`}>Grano</p>
                        <p className="text-xl font-black text-slate-800">{totalGrano}</p>
                    </div>
                </div>

                {/* TARJETA GALERÍA */}
                <div 
                    onClick={() => setFilterCategory('galeria')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        filterCategory === 'galeria' 
                        ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-500 shadow-md' 
                        : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:bg-purple-50/30'
                    }`}
                >
                    <div className={`p-3 rounded-xl ${filterCategory === 'galeria' ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-600'}`}>
                        <ImageIcon size={20} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase ${filterCategory === 'galeria' ? 'text-purple-700' : 'text-slate-500'}`}>Galería</p>
                        <p className="text-xl font-black text-slate-800">{totalGaleria}</p>
                    </div>
                </div>

                {/* TARJETA ASEO */}
                <div 
                    onClick={() => setFilterCategory('aseo')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        filterCategory === 'aseo' 
                        ? 'bg-cyan-50 border-cyan-200 ring-2 ring-cyan-500 shadow-md' 
                        : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:bg-cyan-50/30'
                    }`}
                >
                    <div className={`p-3 rounded-xl ${filterCategory === 'aseo' ? 'bg-cyan-500 text-white' : 'bg-cyan-50 text-cyan-600'}`}>
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase ${filterCategory === 'aseo' ? 'text-cyan-700' : 'text-slate-500'}`}>Aseo</p>
                        <p className="text-xl font-black text-slate-800">{totalAseo}</p>
                    </div>
                </div>
            </div>

            {/* Buscador */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" placeholder={`Buscar en ${filterCategory === 'all' ? 'todos' : filterCategory}...`}
                        className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                {/* Botón para limpiar filtro si no es 'all' */}
                {filterCategory !== 'all' && (
                    <button 
                        onClick={() => setFilterCategory('all')}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1 text-xs font-medium"
                    >
                        <X size={16}/> Ver todos
                    </button>
                )}
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase whitespace-nowrap">Producto</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase whitespace-nowrap">Categoría</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase whitespace-nowrap">Descripción</th>
                                <th className="px-6 py-4 text-right font-semibold text-slate-600 text-xs uppercase whitespace-nowrap">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center p-8 text-slate-400">Cargando...</td></tr>
                            ) : filteredProductos.length === 0 ? (
                                <tr><td colSpan="4" className="text-center p-8 text-slate-400">
                                    {filterCategory !== 'all' 
                                        ? `No hay productos de categoría "${filterCategory.toUpperCase()}"`
                                        : "No hay productos encontrados."}
                                </td></tr>
                            ) : (
                                filteredProductos.map((prod) => {
                                    const { icon, style } = getCatStyle(prod.categoria);
                                    return (
                                        <tr key={prod.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{prod.nombre}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${style}`}>
                                                    {icon}
                                                    {prod.categoria.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm truncate max-w-xs min-w-[200px]" title={prod.descripcion}>
                                                {prod.descripcion || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => abrirModalEditar(prod)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button onClick={() => handleEliminar(prod.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <Modal title={editingId ? "Editar Producto" : "Nuevo Producto"} onClose={() => setShowModal(false)}>
                    <form onSubmit={handleGuardar} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
                            <input required className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" 
                                placeholder="Ej: Jabón Líquido"
                                value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button type="button" onClick={() => setFormData({...formData, categoria: 'grano'})}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.categoria === 'grano' ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                    <Wheat size={24} /><span className="text-xs font-bold">GRANO</span>
                                </button>
                                <button type="button" onClick={() => setFormData({...formData, categoria: 'galeria'})}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.categoria === 'galeria' ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                    <ImageIcon size={24} /><span className="text-xs font-bold">GALERÍA</span>
                                </button>
                                <button type="button" onClick={() => setFormData({...formData, categoria: 'aseo'})}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.categoria === 'aseo' ? 'bg-cyan-50 border-cyan-500 text-cyan-700 ring-1 ring-cyan-500' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                    <Sparkles size={24} /><span className="text-xs font-bold">ASEO</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
                            <textarea className="w-full px-4 py-3 border rounded-xl h-24 resize-none focus:ring-2 focus:ring-blue-100 outline-none" 
                                placeholder="Opcional..."
                                value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                            />
                        </div>
                        <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-transform flex justify-center gap-2">
                            <Save size={20} /> {editingId ? "Guardar Cambios" : "Crear Producto"}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}