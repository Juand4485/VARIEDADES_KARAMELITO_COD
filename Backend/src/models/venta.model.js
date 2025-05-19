import { pool } from '../config/database.js';

export const getAllVentas = async () => {
    const query = `
        SELECT v.*
        FROM venta v
        LEFT JOIN detalleventa dv ON v.id_venta = dv.id_venta
        GROUP BY v.id_venta
        ORDER BY v.fecha_venta DESC`;
    try {
        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        throw new Error('Error al obtener ventas: ' + error.message);
    }
};

export const getVentaById = async (id) => {
    const query = `
        SELECT v.*,
               COALESCE(SUM(dv.subtotal), 0) as total_calculado
        FROM venta v
        LEFT JOIN detalleventa dv ON v.id_venta = dv.id_venta
        WHERE v.id_venta = $1
        GROUP BY v.id_venta`;
    try {
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al obtener venta: ' + error.message);
    }
};

export const createVenta = async (venta) => {
    const { fecha_venta, total_venta, cantidad_vendida } = venta;
    const query = `
        INSERT INTO venta (fecha_venta, total_venta, cantidad_vendida)
        VALUES ($1, $2, $3)
        RETURNING *`;
    try {
        const { rows } = await pool.query(query, [fecha_venta, total_venta, cantidad_vendida]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al crear venta: ' + error.message);
    }
};

export const updateVenta = async (id, venta) => {
    const { fecha_venta, total_venta, cantidad_vendida } = venta;
    const query = `
        UPDATE venta
        SET fecha_venta = $1, total_venta = $2, cantidad_vendida = $4
        WHERE id_venta = $3
        RETURNING *`;
    try {
        const { rows } = await pool.query(query, [fecha_venta, total_venta, id, cantidad_vendida]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al actualizar venta: ' + error.message);
    }
};

export const deleteVenta = async (id) => {
    const query = 'DELETE FROM venta WHERE id_venta = $1 RETURNING *';
    try {
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al eliminar venta: ' + error.message);
    }
};