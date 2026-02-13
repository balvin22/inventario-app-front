import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export function usePeriodos() {
    const [periodos, setPeriodos] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [semanas, setSemanas] = useState([]);
    
    // Modals
    const [modalPeriodo, setModalPeriodo] = useState({ show: false, editId: null, data: { nombre: '', fecha_inicio: '', fecha_fin: '' } });
    const [modalSemana, setModalSemana] = useState({ show: false, periodoId: null, editId: null, data: { numero: '', fecha_inicio: '', fecha_fin: '' } });

    const cargarPeriodos = async () => { 
        try {
            const res = await api.get('/periodos/'); 
            setPeriodos(res.data); 
        } catch (error) { console.error(error); }
    };
    
    useEffect(() => { cargarPeriodos(); }, []);

    // --- Lógica de UI (Expandir/Colapsar) ---
    const toggleExpand = async (id) => {
        if (expanded === id) { 
            setExpanded(null); 
        } else {
            setExpanded(id);
            try { 
                const res = await api.get(`/periodos/${id}/semanas`); 
                setSemanas(res.data); 
            } catch { 
                setSemanas([]); 
            }
        }
    };

    // --- CRUD Periodos ---
    const abrirModalPeriodo = (periodo = null) => {
        if (periodo) {
            setModalPeriodo({ show: true, editId: periodo.id, data: periodo });
        } else {
            setModalPeriodo({ show: true, editId: null, data: { nombre: '', fecha_inicio: '', fecha_fin: '' } });
        }
    };

    const guardarPeriodo = async (e) => {
        e.preventDefault();
        try {
            if (modalPeriodo.editId) await api.put(`/periodos/${modalPeriodo.editId}`, modalPeriodo.data);
            else await api.post('/periodos/', { ...modalPeriodo.data, activo: true });
            
            toast.success('Guardado'); 
            setModalPeriodo({ ...modalPeriodo, show: false }); 
            cargarPeriodos();
        } catch { toast.error('Error guardando periodo'); }
    };

    const eliminarPeriodo = async (id, e) => {
        e.stopPropagation(); // Evitar que se expanda al hacer click en borrar
        if (!window.confirm('¿Borrar periodo?')) return;
        try { 
            await api.delete(`/periodos/${id}`); 
            toast.success('Eliminado'); 
            cargarPeriodos(); 
        } catch { toast.error('Error eliminando'); }
    };

    // --- CRUD Semanas ---
    const abrirModalSemana = (periodoId, semana = null) => {
        if (semana) {
            setModalSemana({ show: true, periodoId, editId: semana.id, data: semana });
        } else {
            setModalSemana({ show: true, periodoId, editId: null, data: { numero: '', fecha_inicio: '', fecha_fin: '' } });
        }
    };

    const guardarSemana = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = { ...modalSemana.data, periodo_id: modalSemana.periodoId };
            
            if (modalSemana.editId) {
                await api.put(`/periodos/semanas/${modalSemana.editId}`, dataToSend);
            } else {
                await api.post(`/periodos/${modalSemana.periodoId}/semanas`, dataToSend);
            }
            
            toast.success('Semana guardada');
            setModalSemana({ ...modalSemana, show: false });
            
            // Recargar semanas del periodo expandido
            const res = await api.get(`/periodos/${modalSemana.periodoId}/semanas`); 
            setSemanas(res.data);
        } catch { toast.error('Error guardando semana'); }
    };

    const eliminarSemana = async (id) => {
        if (!window.confirm('¿Borrar semana?')) return;
        try { 
            await api.delete(`/periodos/semanas/${id}`); 
            toast.success('Eliminada'); 
            // Recargar
            const res = await api.get(`/periodos/${expanded}/semanas`); 
            setSemanas(res.data); 
        } catch { toast.error('Error eliminando'); }
    };

    return {
        periodos, semanas, expanded, toggleExpand,
        modalPeriodo, setModalPeriodo, abrirModalPeriodo, guardarPeriodo, eliminarPeriodo,
        modalSemana, setModalSemana, abrirModalSemana, guardarSemana, eliminarSemana
    };
}