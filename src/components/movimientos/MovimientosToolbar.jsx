import { Search, Calendar, Filter, Truck, X } from 'lucide-react';

export default function MovimientosToolbar({ 
    filterType, setFilterType, setPage, 
    searchTerm, setSearchTerm, 
    selectedPeriodo, setSelectedPeriodo, setSelectedSemana,
    selectedSemana, semanasOptions,
    selectedRuta, setSelectedRuta,
    periodos, rutas, limpiarFiltros 
}) {
    const hayFiltrosActivos = filterType !== 'todos' || searchTerm !== '' || selectedPeriodo !== 'todos' || selectedRuta !== 'todos';

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex p-1 bg-slate-100 rounded-lg w-full md:w-auto">
                    {['todos', 'entrada', 'salida'].map((tipo) => (
                        <button
                            key={tipo}
                            onClick={() => { setFilterType(tipo); setPage(1); }}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                                filterType === tipo ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tipo}s
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" placeholder="Buscar producto..." 
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-50">
                <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select 
                        value={selectedPeriodo}
                        onChange={(e) => { setSelectedPeriodo(e.target.value); setPage(1); setSelectedSemana('todos'); }}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-blue-300 outline-none cursor-pointer hover:bg-slate-50"
                    >
                        <option value="todos">Todos los Periodos</option>
                        {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select 
                        value={selectedSemana}
                        onChange={(e) => { setSelectedSemana(e.target.value); setPage(1); }}
                        disabled={selectedPeriodo === 'todos'}
                        className={`w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-blue-300 outline-none ${selectedPeriodo === 'todos' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'}`}
                    >
                        <option value="todos">Todas las Semanas</option>
                        {semanasOptions.map(s => <option key={s.id} value={s.id}>Semana {s.numero}</option>)}
                    </select>
                </div>

                <div className="relative">
                    <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select 
                        value={selectedRuta}
                        onChange={(e) => { setSelectedRuta(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-blue-300 outline-none cursor-pointer hover:bg-slate-50"
                    >
                        <option value="todos">Todas las Rutas</option>
                        {rutas.map(r => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}
                    </select>
                </div>

                {hayFiltrosActivos && (
                    <button onClick={limpiarFiltros} className="flex items-center justify-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors">
                        <X size={16} /> Limpiar
                    </button>
                )}
            </div>
        </div>
    );
}