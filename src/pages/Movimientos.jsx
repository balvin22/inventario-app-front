import { Plus } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import MovimientoForm from '../components/MovimientoForm';

// Componentes Visuales
import MovimientosToolbar from '../components/movimientos/MovimientosToolbar';
import MovimientosTable from '../components/movimientos/MovimientosTable';

// Hook de Lógica
import { useMovimientos } from '../hooks/useMovimientos';

export default function Movimientos() {
    const {
        // Datos
        movimientos, periodos, rutas, semanasOptions, totalRecords,
        // Paginación
        page, setPage, totalPages, loading,
        // Filtros
        filterType, setFilterType,
        searchTerm, setSearchTerm,
        selectedPeriodo, setSelectedPeriodo,
        selectedSemana, setSelectedSemana,
        selectedRuta, setSelectedRuta,
        limpiarFiltros,
        // UI Modal & Acciones
        showModal, setShowModal,
        movimientoAEditar,
        handleCrear, handleEditar, handleEliminar, handleSuccessForm,
        // Helpers
        getProdName, getPeriodoName
    } = useMovimientos();

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <Toaster position="top-right" />
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Bitácora</h2>
                    <p className="text-slate-500 text-sm">
                        Total registros: <span className="font-semibold text-slate-700">{totalRecords}</span>
                    </p>
                </div>
                <button 
                    onClick={handleCrear}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-200 font-medium active:scale-95"
                >
                    <Plus size={20} /> Registrar Movimiento
                </button>
            </div>

            {/* BARRA DE HERRAMIENTAS */}
            <MovimientosToolbar 
                filterType={filterType} setFilterType={setFilterType}
                setPage={setPage}
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                selectedPeriodo={selectedPeriodo} setSelectedPeriodo={setSelectedPeriodo}
                selectedSemana={selectedSemana} setSelectedSemana={setSelectedSemana}
                semanasOptions={semanasOptions}
                selectedRuta={selectedRuta} setSelectedRuta={setSelectedRuta}
                periodos={periodos} rutas={rutas}
                limpiarFiltros={limpiarFiltros}
            />

            {/* TABLA */}
            <MovimientosTable 
                movimientos={movimientos}
                loading={loading}
                page={page} setPage={setPage} totalPages={totalPages}
                onEdit={handleEditar}
                onDelete={handleEliminar}
                getProdName={getProdName}
                getPeriodoName={getPeriodoName}
            />

            {/* MODAL (Reutilizamos el componente que ya tenías) */}
            {showModal && (
                <MovimientoForm 
                    initialData={movimientoAEditar} 
                    onClose={() => setShowModal(false)}
                    onSuccess={handleSuccessForm}
                />
            )}
        </div>
    );
}