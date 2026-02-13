import { Wheat, Image as ImageIcon, Sparkles, Save } from 'lucide-react';

export default function ProductForm({ formData, setFormData, onSave, isEditing }) {
    
    // Helper para las categorías del formulario
    const categories = [
        { id: 'grano', label: 'GRANO', icon: Wheat, style: 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500' },
        { id: 'galeria', label: 'GALERÍA', icon: ImageIcon, style: 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500' },
        { id: 'aseo', label: 'ASEO', icon: Sparkles, style: 'bg-cyan-50 border-cyan-500 text-cyan-700 ring-1 ring-cyan-500' },
    ];

    return (
        <form onSubmit={onSave} className="space-y-5">
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
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            type="button" 
                            onClick={() => setFormData({...formData, categoria: cat.id})}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                                formData.categoria === cat.id 
                                ? cat.style 
                                : 'bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <cat.icon size={24} />
                            <span className="text-xs font-bold">{cat.label}</span>
                        </button>
                    ))}
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
                <Save size={20} /> {isEditing ? "Guardar Cambios" : "Crear Producto"}
            </button>
        </form>
    );
}