import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export function useMovimientos() {
    // --- ESTADOS DE DATOS ---
    const [movimientos, setMovimientos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [rutas, setRutas] = useState([]);
    const [semanasOptions, setSemanasOptions] = useState([]);

    // --- ESTADOS DE PAGINACIÓN ---
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DE FILTRO ---
    const [filterType, setFilterType] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedPeriodo, setSelectedPeriodo] = useState('todos');
    const [selectedSemana, setSelectedSemana] = useState('todos');
    const [selectedRuta, setSelectedRuta] = useState('todos');

    // --- ESTADOS DE UI (MODAL) ---
    const [showModal, setShowModal] = useState(false);
    const [movimientoAEditar, setMovimientoAEditar] = useState(null);

    // 1. CARGA INICIAL DE CATÁLOGOS
    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [resProds, resPers, resRutas] = await Promise.all([
                    api.get('/productos/', { params: { limit: 1000 } }),
                    api.get('/periodos/'),
                    api.get('/rutas/')
                ]);
                
                const listaProductos = resProds.data.data || resProds.data;
                setProductos(Array.isArray(listaProductos) ? listaProductos : []);
                setPeriodos(resPers.data);
                setRutas(resRutas.data);
            } catch (error) {
                console.error(error);
                toast.error("Error cargando catálogos");
            }
        };
        cargarCatalogos();
    }, []);

    // 2. DEBOUNCE BUSCADOR
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 3. CARGA DE MOVIMIENTOS
    const fetchMovimientos = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: debouncedSearch || undefined,
                tipo: filterType !== 'todos' ? filterType : undefined,
                periodo_id: selectedPeriodo !== 'todos' ? selectedPeriodo : undefined,
                semana_id: selectedSemana !== 'todos' ? selectedSemana : undefined,
                ruta_nombre: selectedRuta !== 'todos' ? selectedRuta : undefined
            };

            const response = await api.get('/movimientos/', { params });
            setMovimientos(response.data.data);
            setTotalPages(response.data.total_pages);
            setTotalRecords(response.data.total);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando datos");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, filterType, selectedPeriodo, selectedSemana, selectedRuta]);

    useEffect(() => { fetchMovimientos(); }, [fetchMovimientos]);

    // 4. CARGA DINÁMICA DE SEMANAS
    useEffect(() => {
        const fetchSemanas = async () => {
            if (selectedPeriodo === 'todos') {
                setSemanasOptions([]);
                return;
            }
            try {
                const res = await api.get(`/periodos/${selectedPeriodo}/semanas`);
                setSemanasOptions(res.data);
            } catch (err) {
                setSemanasOptions([]);
            }
        };
        fetchSemanas();
    }, [selectedPeriodo]);

    // --- ACCIONES CRUD ---
    const handleCrear = () => {
        setMovimientoAEditar(null);
        setShowModal(true);
    };

    const handleEditar = (movimiento) => {
        setMovimientoAEditar(movimiento);
        setShowModal(true);
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Eliminar este movimiento?")) return;
        try {
            await api.delete(`/movimientos/${id}`);
            toast.success("Eliminado");
            fetchMovimientos();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const handleSuccessForm = () => {
        setShowModal(false);
        if (!movimientoAEditar) setPage(1);
        fetchMovimientos();
        toast.success(movimientoAEditar ? "Actualizado" : "Registrado");
    };

    const limpiarFiltros = () => {
        setFilterType('todos');
        setSearchTerm('');
        setSelectedPeriodo('todos');
        setSelectedSemana('todos');
        setSelectedRuta('todos');
        setPage(1);
    };

    // Helpers para obtener nombres
    const getProdName = (id) => {
        if (!Array.isArray(productos)) return 'Cargando...';
        return productos.find(p => p.id === id)?.nombre || 'Producto desconocido';
    };
    
    const getPeriodoName = (id) => {
        if (!Array.isArray(periodos)) return '-';
        return periodos.find(p => p.id === id)?.nombre || '-';
    };

    return {
        // Datos
        movimientos, productos, periodos, rutas, semanasOptions, totalRecords,
        // Paginación
        page, setPage, totalPages, loading,
        // Filtros
        filterType, setFilterType,
        searchTerm, setSearchTerm,
        selectedPeriodo, setSelectedPeriodo,
        selectedSemana, setSelectedSemana,
        selectedRuta, setSelectedRuta,
        limpiarFiltros,
        // UI Modal
        showModal, setShowModal,
        movimientoAEditar,
        // Acciones
        handleCrear, handleEditar, handleEliminar, handleSuccessForm,
        // Helpers
        getProdName, getPeriodoName
    };
}