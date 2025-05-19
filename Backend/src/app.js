import express from 'express';
import { connectDatabase } from './config/database.js';
import detalleVentaRoutes from './routes/detalleventa.routes.js';
import productoRoutes from './routes/producto.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import cors from "cors";


const app = express();

app.use(cors({ 
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Initialize database connection
connectDatabase();

// Routes
app.use('/api', detalleVentaRoutes);
app.use('/api', productoRoutes);
app.use('/api', ventaRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});