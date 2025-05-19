import { pool } from '../config/database.js';

export const getAllDetalleVentas = async () => {
    const query = `
        SELECT dv.*, p.nombre as nombre_producto, v.fecha_venta as fecha_venta
        FROM detalleventa dv
        JOIN producto p ON dv.codigo_barras = p.codigo_barras
        JOIN venta v ON dv.id_venta = v.id_venta
    `;
    try {
        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        throw new Error('Error al obtener detalles de venta: ' + error.message);
    }
};

export const getDetalleVentaById = async (id) => {
    const query = `
        SELECT dv.*, p.nombre as nombre_producto, v.fecha_venta as fecha_venta
        FROM detalleventa dv
        JOIN producto p ON dv.codigo_barras = p.codigo_barras
        JOIN venta v ON dv.id_venta = v.id_venta
        WHERE dv.id_detalle = $1
    `;
    try {
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al obtener detalle de venta: ' + error.message);
    }
};

export const createDetalleVenta = async (detalleVenta) => {
    const { id_venta, codigo_barras } = detalleVenta;
    const query = `
        INSERT INTO detalleventa (id_venta, codigo_barras)
        VALUES ($1, $2)
        RETURNING *
    `;
    try {
        const { rows } = await pool.query(query, [id_venta, codigo_barras]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al crear detalle de venta: ' + error.message);
    }
};

export const updateDetalleVenta = async (id, detalleVenta) => {
    const { id_venta, codigo_barras, cantidad_vendida } = detalleVenta;
    const query = `
        UPDATE detalleventa
        SET id_venta = $1, codigo_barras = $2
        WHERE id_detalle = $5
        RETURNING *
    `;
    try {
        const { rows } = await pool.query(query, [id_venta, codigo_barras, cantidad_vendida, id]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al actualizar detalle de venta: ' + error.message);
    }
};

export const deleteDetalleVenta = async (id) => {
    const query = 'DELETE FROM detalleventa WHERE id_detalle = $1 RETURNING *';
    try {
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al eliminar detalle de venta: ' + error.message);
    }
};