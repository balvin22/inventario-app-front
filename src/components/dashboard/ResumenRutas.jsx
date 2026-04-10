import { useMemo, useState } from 'react';
import { Truck, MapPin, Filter, User } from 'lucide-react';

export default function ResumenRutas({ productos, rutasCompletas, tercerosCompletos }) {
    // Datos completos organizados por semana
    const rutasSinPagar = rutasCompletas || {};
    const tercerosSinPagar = tercerosCompletos || {};
    
    const tieneDatosCompletos = Object.keys(rutasSinPagar).length > 0 || Object.keys(tercerosSinPagar).length > 0;

    const nombresRutas = Object.keys(rutasSinPagar);
    const nombresTerceros = Object.keys(tercerosSinPagar);
    
    if (nombresRutas.length === 0 && nombresTerceros.length === 0 && !productos?.length) return null;

    return (
        <div className="space-y-6">
            {/* RUTAS */}
            {nombresRutas.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-orange-50/30 flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Truck size={20} /></div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Logística y Rutas</h3>
                            <p className="text-xs text-slate-500">¿Qué salió y por dónde?</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nombresRutas.map(ruta => (
                            <TarjetaRuta 
                                key={ruta} 
                                nombreRuta={ruta} 
                                datosSemanas={rutasSinPagar[ruta]} 
                                esCompleto={true}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* TERCEROS */}
            {nombresTerceros.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-purple-50/30 flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><User size={20} /></div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Terceros</h3>
                            <p className="text-xs text-slate-500">Salidas a terceros</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nombresTerceros.map(tercero => (
                            <TarjetaRuta 
                                key={tercero} 
                                nombreRuta={tercero} 
                                datosSemanas={tercerosSinPagar[tercero]} 
                                esTercero={true}
                                esCompleto={true}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function TarjetaRuta({ nombreRuta, datosSemanas, esTercero = false, esCompleto = false }) {
    // Si es completo, datosSemanas es { "1": [...], "2": [...] }
    if (esCompleto && typeof datosSemanas === 'object' && !Array.isArray(datosSemanas)) {
        const semanasDisponibles = Object.keys(datosSemanas).sort((a, b) => parseInt(a) - parseInt(b));
        const [semanaActiva, setSemanaActiva] = useState(semanasDisponibles[0] || '1');
        const productosMostrar = datosSemanas[semanaActiva] || [];

        return (
            <div className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col h-full">
                <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex flex-col gap-3">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                        <MapPin size={16} className={esTercero ? "text-purple-500" : "text-orange-500"} /> 
                        <span className="truncate" title={nombreRuta}>{nombreRuta}</span>
                    </h4>
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select 
                            value={semanaActiva}
                            onChange={(e) => setSemanaActiva(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold py-2 pl-9 pr-2 rounded-lg outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 appearance-none cursor-pointer"
                        >
                            {semanasDisponibles.map(sem => (
                                <option key={sem} value={sem}>Semana {sem}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-4 flex-1">
                    <div className="space-y-3">
                        {productosMostrar.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full shadow-sm ${
                                        item.categoria === 'grano' ? 'bg-amber-400' : 
                                        item.categoria === 'aseo' ? 'bg-cyan-400' : 
                                        'bg-purple-400'
                                    }`}></div>
                                    <span className="text-slate-600 font-medium">{item.producto}</span>
                                </div>
                                <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs border border-red-100">
                                    -{item.cantidad}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                    Total ítems: {productosMostrar.length}
                </div>
            </div>
        );
    }
    
    // Fallback para datos desde productos paginados (old format)
    const semanasDisponibles = Object.keys(datosSemanas || {}).sort((a, b) => a - b);
    const [semanaActiva, setSemanaActiva] = useState(semanasDisponibles[0] || '1');
    const productosMostrar = datosSemanas?.[semanaActiva] || [];

    return (
        <div className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col h-full">
            <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex flex-col gap-3">
                <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                    <MapPin size={16} className={esTercero ? "text-purple-500" : "text-orange-500"} /> 
                    <span className="truncate" title={nombreRuta}>{nombreRuta}</span>
                </h4>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                        value={semanaActiva}
                        onChange={(e) => setSemanaActiva(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold py-2 pl-9 pr-2 rounded-lg outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 appearance-none cursor-pointer"
                    >
                        {semanasDisponibles.map(sem => (
                            <option key={sem} value={sem}>{sem === 'periodo' ? 'Ver Total' : `Ver Semana ${sem}`}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="p-4 flex-1">
                <div className="space-y-3">
                    {productosMostrar.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full shadow-sm ${
                                    item.categoria === 'grano' ? 'bg-amber-400' : 
                                    item.categoria === 'aseo' ? 'bg-cyan-400' : 
                                    'bg-purple-400'
                                }`}></div>
                                <span className="text-slate-600 font-medium">{item.producto}</span>
                            </div>
                            <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs border border-red-100">
                                -{item.cantidad}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                Total ítems: {productosMostrar.length}
            </div>
        </div>
    );
}