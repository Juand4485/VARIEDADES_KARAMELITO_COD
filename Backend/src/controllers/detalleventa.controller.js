import * as detalleVentaModel from '../models/detalleventa.model.js';

export const getAllDetalleVentas = async (req, res) => {
    try {
        const detalleVentas = await detalleVentaModel.getAllDetalleVentas();
        res.json(detalleVentas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDetalleVentaById = async (req, res) => {
    try {
        const detalleVenta = await detalleVentaModel.getDetalleVentaById(req.params.id);
        if (!detalleVenta) {
            return res.status(404).json({ message: 'Detalle de venta no encontrado' });
        }
        res.json(detalleVenta);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createDetalleVenta = async (req, res) => {
    try {
        const { id_venta, codigo_barras } = req.body;
        
        if (!id_venta || !codigo_barras ) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        const newDetalleVenta = await detalleVentaModel.createDetalleVenta(req.body);
        res.status(201).json(newDetalleVenta);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDetalleVenta = async (req, res) => {
    try {
        const detalleVenta = await detalleVentaModel.updateDetalleVenta(req.params.id, req.body);
        if (!detalleVenta) {
            return res.status(404).json({ message: 'Detalle de venta no encontrado' });
        }
        res.json(detalleVenta);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDetalleVenta = async (req, res) => {
    try {
        const detalleVenta = await detalleVentaModel.deleteDetalleVenta(req.params.id);
        if (!detalleVenta) {
            return res.status(404).json({ message: 'Detalle de venta no encontrado' });
        }
        res.json({ message: 'Detalle de venta eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};