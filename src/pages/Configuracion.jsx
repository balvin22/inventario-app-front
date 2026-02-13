import { useState } from 'react';
import { Calendar, Map } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Componentes modulares
import PeriodosManager from '../components/configuracion/PeriodosManager';
import RutasManager from '../components/configuracion/RutasManager';

export default function Configuracion() {
    const [activeTab, setActiveTab] = useState('periodos');

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
            <Toaster position="top-right" />
            
            <div className="flex flex-col gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Configuración del Sistema</h2>
                <p className="text-sm md:text-base text-slate-500">Administra los ciclos de tiempo y rutas.</p>
            </div>
            
            {/* TABS RESPONSIVOS */}
            <div className="flex overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                <div className="flex p-1 bg-slate-100 rounded-xl w-fit shrink-0">
                    <button 
                        onClick={() => setActiveTab('periodos')}
                        className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'periodos' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Calendar size={18} /> Periodos
                    </button>
                    <button 
                        onClick={() => setActiveTab('rutas')}
                        className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'rutas' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Map size={18} /> Rutas
                    </button>
                </div>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'periodos' ? <PeriodosManager /> : <RutasManager />}
            </div>
        </div>
    );
}