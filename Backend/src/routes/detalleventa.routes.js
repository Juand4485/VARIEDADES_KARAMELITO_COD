import express from 'express';
import {
    getAllDetalleVentas,
    getDetalleVentaById,
    createDetalleVenta,
    updateDetalleVenta,
    deleteDetalleVenta
} from '../controllers/detalleventa.controller.js';

const router = express.Router();

    router.get('/detalleventa', getAllDetalleVentas);
    router.get('/detalleventa/:id', getDetalleVentaById);
    router.post('/detalleventa', createDetalleVenta);
    router.put('/detalleventa/:id', updateDetalleVenta);
    router.delete('/detalleventa/:id', deleteDetalleVenta);

export default router;