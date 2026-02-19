import { useState } from 'react';
import api from '../../api/axios'; 

// Ahora recibimos 'filters' y 'totalRecords'
export default function ActaDashboardModal({ isOpen, onClose, filters, totalRecords }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        responsable_entrega_nombre: '',
        responsable_entrega_cargo: '',
        responsable_recibe_nombre: '',
        responsable_recibe_cargo: '',
        project_name: 'Inventario Global Consolidado',
        folio_id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDownload = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Preparamos el payload con los FILTROS, no con los items
            const payload = {
                ...formData,
                search: filters.search,
                categoria: filters.category,
                // Si el filtro es 'all' enviamos null o 0 según tu backend lo prefiera
                periodo_id: filters.period === 'all' ? null : Number(filters.period)
            };

            console.log("Enviando solicitud de PDF Global:", payload);

            const response = await api.post('/reportes/descargar-acta-pdf', payload, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Acta_Global_${formData.folio_id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            onClose();

        } catch (error) {
            console.error("Error descargando:", error);
            alert("Error al generar el PDF. Revisa la consola.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Acta Global de Inventario</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                <form onSubmit={handleDownload} className="p-6 space-y-5">
                    
                    {/* Campos de firma (Igual que antes) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wide">Entrega</label>
                            <input required name="responsable_entrega_nombre" placeholder="Nombre" onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                            <input required name="responsable_entrega_cargo" placeholder="Cargo" onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-green-600 uppercase tracking-wide">Recibe</label>
                            <input required name="responsable_recibe_nombre" placeholder="Nombre" onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                            <input required name="responsable_recibe_cargo" placeholder="Cargo" onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
                        <input name="project_name" value={formData.project_name} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
                        <div className="text-blue-500 mt-0.5">ℹ️</div>
                        <p className="text-xs text-blue-700">
                            <strong>Atención:</strong> Se generará el reporte con <strong>TODOS</strong> los registros que coincidan con los filtros actuales ({totalRecords} productos en total).
                            <br/>Esto puede tardar unos segundos.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 shadow-lg disabled:opacity-70 flex items-center gap-2">
                            {loading ? 'Procesando...' : '📄 Descargar Todo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}