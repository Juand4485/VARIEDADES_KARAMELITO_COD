import express from 'express';
import {
    getAllVentas,
    getVentaById,
    createVenta,
    updateVenta,
    deleteVenta
} from '../controllers/venta.controller.js';

const router = express.Router();

router.get('/ventas', getAllVentas);
router.get('/ventas/:id', getVentaById);
router.post('/ventas', createVenta);
router.put('/ventas/:id', updateVenta);
router.delete('/ventas/:id', deleteVenta);

export default router;