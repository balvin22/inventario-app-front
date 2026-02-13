import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export function useRutas() {
    const [rutas, setRutas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [editingId, setEditingId] = useState(null);

    const cargarRutas = async () => { 
        try {
            const res = await api.get('/rutas/'); 
            setRutas(res.data); 
        } catch (error) {
            console.error(error);
        }
    };
    
    useEffect(() => { cargarRutas(); }, []);

    const abrirCrear = () => { 
        setEditingId(null); 
        setFormData({ nombre: '', descripcion: '' }); 
        setShowModal(true); 
    };
    
    const abrirEditar = (ruta) => { 
        setEditingId(ruta.id); 
        setFormData({ nombre: ruta.nombre, descripcion: ruta.descripcion || '' }); 
        setShowModal(true); 
    };

    const guardarRuta = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/rutas/${editingId}`, formData);
                toast.success('Ruta actualizada');
            } else {
                await api.post('/rutas/', { ...formData, activa: true });
                toast.success('Ruta creada');
            }
            setShowModal(false); 
            cargarRutas();
        } catch { 
            toast.error('Error guardando ruta'); 
        }
    };

    const eliminarRuta = async (id) => {
        if (!window.confirm('¿Eliminar esta ruta?')) return;
        try { 
            await api.delete(`/rutas/${id}`); 
            toast.success('Ruta eliminada'); 
            cargarRutas(); 
        } catch { 
            toast.error('Error al eliminar'); 
        }
    };

    return {
        rutas, showModal, setShowModal,
        formData, setFormData, editingId,
        abrirCrear, abrirEditar,
        guardarRuta, eliminarRuta
    };
}