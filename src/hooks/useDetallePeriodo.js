import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useDetallePeriodo(periodoId) {
    const [dataMatrix, setDataMatrix] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Resetear página al cambiar de periodo
    useEffect(() => {
        setPage(1);
    }, [periodoId]);

    useEffect(() => {
        if (!periodoId) return;

        const cargar = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/reportes/dashboard/matrix/${periodoId}`, {
                    params: { page, limit }
                });
                setDataMatrix(res.data);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.total_pages);
                }
            } catch (error) {
                console.error("Error cargando detalle", error);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [periodoId, page]);

    return {
        dataMatrix,
        loading,
        page,
        setPage,
        totalPages
    };
}