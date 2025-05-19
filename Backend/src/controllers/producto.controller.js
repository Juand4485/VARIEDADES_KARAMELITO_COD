import * as productoModel from '../models/producto.model.js';

export const getAllProductos = async (req, res) => {
    try {
        const productos = await productoModel.getAllProductos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductoByBarcode = async (req, res) => {
    try {
        const producto = await productoModel.getProductoByBarcode(req.params.codigo_barras);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProducto = async (req, res) => {
    try {
        const { codigo_barras, nombre, tipo, precio_unitario, cantidad_en_stock } = req.body;   

        // Validaciones
        if (!codigo_barras || !nombre || !tipo || !precio_unitario || cantidad_en_stock === undefined) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        if (precio_unitario < 0 || cantidad_en_stock < 0) {
            return res.status(400).json({ message: 'Los valores numéricos deben ser positivos' });
        }

        const newProducto = await productoModel.createProducto(req.body);
        res.status(201).json(newProducto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProducto = async (req, res) => {
    try {
        const { nombre, tipo, precio_unitario, cantidad_en_stock } = req.body;

        // Validaciones
        if (!nombre || !tipo || !precio_unitario || cantidad_en_stock === undefined) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        if (precio_unitario < 0 || cantidad_en_stock < 0) {
            return res.status(400).json({ message: 'Los valores numéricos deben ser positivos' });
        }

        const producto = await productoModel.updateProducto(req.params.codigo_barras, req.body);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProducto = async (req, res) => {
    try {
        const producto = await productoModel.deleteProducto(req.params.codigo_barras);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};