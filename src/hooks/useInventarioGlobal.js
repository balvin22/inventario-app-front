import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export function useInventarioGlobal() {
    // --- DATOS ---
    const [datosGlobales, setDatosGlobales] = useState({ headers: [], data: [] });
    const [periodosOptions, setPeriodosOptions] = useState([]); // <--- NUEVO: Para el select

    // --- PAGINACIÓN ---
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;

    // --- FILTROS (NUEVOS) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterPeriodo, setFilterPeriodo] = useState('all');

    // --- ESTADOS UI ---
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // 1. Cargar lista de periodos para el Select (Solo una vez)
    useEffect(() => {
        const cargarPeriodosList = async () => {
            try {
                const res = await api.get('/periodos/');
                setPeriodosOptions(res.data);
            } catch (e) { console.error("Error cargando periodos"); }
        };
        cargarPeriodosList();
    }, []);

    // 2. Debounce para el buscador (Espera 500ms antes de buscar)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Resetear página al buscar
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 3. Función de carga principal (Actualizada con filtros)
    const cargarGlobal = useCallback(async () => {
        setLoading(true);
        try {
            // Preparamos los parámetros
            const params = { 
                page, 
                limit,
                search: debouncedSearch || undefined, // <--- NUEVO
                categoria: filterCategory !== 'all' ? filterCategory : undefined, // <--- NUEVO
                periodo_id: filterPeriodo !== 'all' ? filterPeriodo : undefined // <--- NUEVO
            };

            const res = await api.get('/reportes/dashboard/matrix/global', { params });
            setDatosGlobales(res.data);
            
            if (res.data.pagination) {
                setTotalPages(res.data.pagination.total_pages);
                setTotalRecords(res.data.pagination.total);
            }
        } catch (error) {
            console.error("Error cargando global", error);
            toast.error("Error cargando datos del tablero");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, filterCategory, filterPeriodo]);

    // Efecto para recargar cuando cambian los filtros o la página
    useEffect(() => {
        cargarGlobal();
    }, [cargarGlobal]);

    // Función reset para limpiar filtros
    const limpiarFiltros = () => {
        setSearchTerm('');
        setFilterCategory('all');
        setFilterPeriodo('all');
        setPage(1);
    };

    // Función para descargar Excel (Actualizada con filtros)
    const descargarExcel = async () => {
        setDownloading(true);
        try {
            const params = {
                search: debouncedSearch || undefined,
                categoria: filterCategory !== 'all' ? filterCategory : undefined,
                periodo_id: filterPeriodo !== 'all' ? filterPeriodo : undefined
            };

            const response = await api.get('/reportes/exportar-excel', {
                params, // Enviamos los filtros también al Excel
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Excel descargado correctamente");
        } catch (error) {
            console.error("Error excel", error);
            toast.error("Error al generar reporte");
        } finally {
            setDownloading(false);
        }
    };

    return {
        // Datos
        datosGlobales, periodosOptions, totalRecords,
        // Paginación
        page, setPage, totalPages,
        // Filtros y Buscador
        searchTerm, setSearchTerm,
        filterCategory, setFilterCategory,
        filterPeriodo, setFilterPeriodo,
        limpiarFiltros,
        // UI
        loading, downloading,
        // Acciones
        descargarExcel,
        recargar: cargarGlobal
    };
}