import express from 'express';
import {
    getAllProductos,
    getProductoByBarcode,
    createProducto,
    updateProducto,
    deleteProducto
} from '../controllers/producto.controller.js';

const router = express.Router();

router.get('/productos', getAllProductos);
router.get('/productos/:codigo_barras', getProductoByBarcode);
router.post('/productos', createProducto);
router.put('/productos/:codigo_barras', updateProducto);
router.delete('/productos/:codigo_barras', deleteProducto);

export default router;