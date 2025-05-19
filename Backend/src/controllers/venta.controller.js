import * as ventaModel from '../models/venta.model.js';

export const getAllVentas = async (req, res) => {
    try {
        const ventas = await ventaModel.getAllVentas();
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getVentaById = async (req, res) => {
    try {
        const venta = await ventaModel.getVentaById(req.params.id);
        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        res.json(venta);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createVenta = async (req, res) => {
    try {
        const { fecha_venta, total_venta, cantidad_vendida } = req.body;

        // Validaciones
        if (!fecha_venta || total_venta === undefined) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        if (total_venta < 0) {
            return res.status(400).json({ message: 'El total de la venta debe ser positivo' });
        }

        if (cantidad_vendida < 0) {
            return res.status(400).json({ message: 'La cantidad vendida debe ser positiva' });
        }

        const newVenta = await ventaModel.createVenta(req.body);
        res.status(201).json(newVenta);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateVenta = async (req, res) => {
    try {
        const { fecha_venta, total_venta, cantidad_vendida } = req.body;

        // Validaciones
        if (!fecha_venta || total_venta === undefined) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        if (total_venta < 0) {
            return res.status(400).json({ message: 'El total de la venta debe ser positivo' });
        }

        if (cantidad_vendida < 0) {
            return res.status(400).json({ message: 'La cantidad vendida debe ser positiva' });
        }

        const venta = await ventaModel.updateVenta(req.params.id, req.body);
        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        res.json(venta);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteVenta = async (req, res) => {
    try {
        const venta = await ventaModel.deleteVenta(req.params.id);
        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        res.json({ message: 'Venta eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};