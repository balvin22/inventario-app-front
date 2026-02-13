import { Plus, Search, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Modal from '../components/Modal';

// Componentes UI
import StatsCards from '../components/productos/StatsCards';
import ProductTable from '../components/productos/ProductTable';
import ProductForm from '../components/productos/ProductForm';

// Hook de Lógica
import { useProductos } from '../hooks/useProductos';

export default function Productos() {
    // Extraemos todo lo necesario del Hook
    const {
        productos, stats, loading,
        page, setPage, totalPages,
        filterCategory, setFilterCategory,
        searchTerm, setSearchTerm,
        showModal, setShowModal,
        formData, setFormData, editingId,
        abrirModalCrear, abrirModalEditar,
        guardarProducto, eliminarProducto
    } = useProductos();

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <Toaster position="top-right" />
            
            {/* HEADER */}
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

            {/* TARJETAS DE ESTADÍSTICAS Y FILTROS */}
            <StatsCards 
                stats={stats} 
                filterCategory={filterCategory} 
                setFilterCategory={setFilterCategory} 
                setPage={setPage} 
            />

            {/* BARRA DE BÚSQUEDA */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" placeholder={`Buscar en ${filterCategory === 'all' ? 'todo' : filterCategory}...`}
                        className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                {filterCategory !== 'all' && (
                    <button 
                        onClick={() => { setFilterCategory('all'); setPage(1); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1 text-xs font-medium"
                    >
                        <X size={16}/> Limpiar
                    </button>
                )}
            </div>

            {/* TABLA DE PRODUCTOS */}
            <ProductTable 
                productos={productos}
                loading={loading}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                onEdit={abrirModalEditar}
                onDelete={eliminarProducto}
            />

            {/* MODAL */}
            {showModal && (
                <Modal 
                    title={editingId ? "Editar Producto" : "Nuevo Producto"} 
                    onClose={() => setShowModal(false)}
                >
                    <ProductForm 
                        formData={formData} 
                        setFormData={setFormData} 
                        onSave={guardarProducto} 
                        isEditing={!!editingId} 
                    />
                </Modal>
            )}
        </div>
    );
}