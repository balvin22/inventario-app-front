import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export function useProductos() {
    // --- ESTADOS DE DATOS ---
    const [productos, setProductos] = useState([]);
    const [stats, setStats] = useState({ all: 0, grano: 0, galeria: 0, aseo: 0 });
    
    // --- ESTADOS DE PAGINACIÓN ---
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DE FILTROS ---
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // --- ESTADOS DEL FORMULARIO ---
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', categoria: 'grano', descripcion: '' });

    // 1. Efecto Debounce para búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. Cargar Estadísticas
    const cargarStats = async () => {
        try {
            const res = await api.get('/productos/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Error cargando stats");
        }
    };

    // 3. Cargar Productos (Callback para evitar recreaciones)
    const cargarProductos = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: debouncedSearch || undefined,
                categoria: filterCategory !== 'all' ? filterCategory : undefined
            };

            const res = await api.get('/productos/', { params });
            setProductos(res.data.data);
            setTotalPages(res.data.total_pages);
        } catch (error) {
            toast.error("Error cargando lista");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, filterCategory]);

    // Carga inicial
    useEffect(() => {
        cargarProductos();
        cargarStats();
    }, [cargarProductos]);

    // --- MANEJADORES DEL MODAL ---
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

    // --- CRUD ---
    const guardarProducto = async (e) => {
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
            cargarStats();
        } catch (error) {
            toast.error("Error al guardar");
        }
    };

    const eliminarProducto = async (id) => {
        if (!window.confirm("¿Eliminar producto?")) return;
        try {
            await api.delete(`/productos/${id}`);
            toast.success("Eliminado");
            cargarProductos();
            cargarStats();
        } catch (error) {
            toast.error("No se puede eliminar");
        }
    };

    // Exportamos todo lo que la UI necesita
    return {
        productos, stats, loading,
        page, setPage, totalPages,
        filterCategory, setFilterCategory,
        searchTerm, setSearchTerm,
        showModal, setShowModal,
        formData, setFormData, editingId,
        abrirModalCrear, abrirModalEditar,
        guardarProducto, eliminarProducto
    };
}