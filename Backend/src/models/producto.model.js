import { pool } from '../config/database.js';

export const getAllProductos = async () => {
    const query = 'SELECT * FROM producto ORDER BY nombre';
    try {
        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        throw new Error('Error al obtener productos: ' + error.message);
    }
};

export const getProductoByBarcode = async (codigo_barras) => {
    const query = 'SELECT * FROM producto WHERE codigo_barras = $1';
    try {
        const { rows } = await pool.query(query, [codigo_barras]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al obtener producto: ' + error.message);
    }
};

export const createProducto = async (producto) => {
    const { codigo_barras, nombre, tipo, precio_unitario, cantidad_en_stock } = producto;
    const query = `
        INSERT INTO producto (codigo_barras, nombre, tipo, precio_unitario, cantidad_en_stock)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    try {
        const { rows } = await pool.query(query, [
            codigo_barras,
            nombre,
            tipo,
            precio_unitario,
            cantidad_en_stock
        ]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al crear producto: ' + error.message);
    }
};

export const updateProducto = async (codigo_barras, producto) => {
    const { nombre, tipo, precio_unitario, cantidad_en_stock } = producto;
    const query = `
        UPDATE producto 
        SET nombre = $1, tipo = $2, precio_unitario = $3, cantidad_en_stock = $4
        WHERE codigo_barras = $5
        RETURNING *
    `;
    try {
        const { rows } = await pool.query(query, [
            nombre,
            tipo,
            precio_unitario,
            cantidad_en_stock,
            codigo_barras
        ]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al actualizar producto: ' + error.message);
    }
};

export const deleteProducto = async (codigo_barras) => {
    const query = 'DELETE FROM producto WHERE codigo_barras = $1 RETURNING *';
    try {
        const { rows } = await pool.query(query, [codigo_barras]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al eliminar producto: ' + error.message);
    }
};