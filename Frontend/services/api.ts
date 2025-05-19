// Constante para la URL base de la API
const API_BASE_URL = "http://localhost:5000/api"

// Interfaz para el modelo de Producto
export interface Producto {
  id?: number
  codigo_barras: string
  nombre: string
  tipo: string
  cantidad_en_stock: number
  precio_unitario: number
}

// Interfaz para el modelo de Venta (corregida según la estructura real)
export interface Venta {
  id_venta?: number
  fecha_venta: string | Date
  total_venta: number
  cantidad_vendida: number
}

// Modificar la interfaz DetalleVenta para incluir la cantidad
export interface DetalleVenta {
  id_detalle: number
  id_venta: number
  codigo_barras: string
  cantidad?: number // Añadimos el campo cantidad como opcional para mantener compatibilidad
}

// Interfaz para mostrar ventas con detalles
export interface VentaConDetalle {
  id_venta: number
  fecha_venta: string | Date
  codigo_barras: string
  nombre: string
  tipo: string
  cantidad: number
  precio_unitario: number
  total: number
}

// FUNCIONES PARA PRODUCTOS

// Función para obtener todos los productos
export async function getAllProductos(): Promise<Producto[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/productos`)

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al obtener productos:", error)
    throw error
  }
}

// Función para obtener un producto por código de barras
export async function getProductoByBarcode(barcode: string): Promise<Producto> {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/${barcode}`)

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al obtener producto con código ${barcode}:`, error)
    throw error
  }
}

// Función para crear un nuevo producto
export async function createProducto(producto: Producto): Promise<Producto> {
  try {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(producto),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al crear producto:", error)
    throw error
  }
}

// Función para actualizar un producto existente
export async function updateProducto(barcode: string, producto: Producto): Promise<Producto> {
  try {
    console.log(`Actualizando producto ${barcode} con datos:`, producto)

    const response = await fetch(`${API_BASE_URL}/productos/${barcode}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(producto),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta: ${response.status} - ${errorText}`)
      throw new Error(`Error: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al actualizar producto con código ${barcode}:`, error)
    throw error
  }
}

// Función para eliminar un producto
export async function deleteProducto(barcode: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/${barcode}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
  } catch (error) {
    console.error(`Error al eliminar producto con código ${barcode}:`, error)
    throw error
  }
}

// Función para actualizar el stock de un producto
export async function updateProductStock(barcode: string, newStock: number): Promise<Producto> {
  try {
    // Primero obtenemos el producto actual
    const producto = await getProductoByBarcode(barcode)

    // Actualizamos solo el stock
    const updatedProducto = {
      ...producto,
      cantidad_en_stock: newStock, // Usamos el nombre correcto del campo
    }

    // Enviamos la actualización
    return await updateProducto(barcode, updatedProducto)
  } catch (error) {
    console.error(`Error al actualizar stock del producto con código ${barcode}:`, error)
    throw error
  }
}

// FUNCIONES PARA VENTAS

// Función para obtener todas las ventas
export async function getAllVentas(): Promise<Venta[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/ventas`)

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al obtener ventas:", error)
    throw error
  }
}

// Función para obtener una venta por ID
export async function getVentaById(id: number): Promise<Venta> {
  try {
    const response = await fetch(`${API_BASE_URL}/ventas/${id}`)

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al obtener venta con ID ${id}:`, error)
    throw error
  }
}

// Función para crear una nueva venta
export async function createVenta(venta: Venta): Promise<Venta> {
  try {
    const response = await fetch(`${API_BASE_URL}/ventas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(venta),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al crear venta:", error)
    throw error
  }
}

// Función para actualizar una venta existente
export async function updateVenta(id: number, venta: Venta): Promise<Venta> {
  try {
    const response = await fetch(`${API_BASE_URL}/ventas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(venta),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al actualizar venta con ID ${id}:`, error)
    throw error
  }
}

// Función para eliminar una venta
export async function deleteVenta(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/ventas/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
  } catch (error) {
    console.error(`Error al eliminar venta con ID ${id}:`, error)
    throw error
  }
}

// FUNCIONES PARA DETALLES DE VENTA

// Función para obtener todos los detalles de venta
export async function getAllDetalleVentas(): Promise<DetalleVenta[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/detalleventa`)

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al obtener detalles de venta:", error)
    throw error
  }
}

// Función para obtener un detalle de venta por ID
export async function getDetalleVentaById(id: number): Promise<DetalleVenta> {
  try {
    const response = await fetch(`${API_BASE_URL}/detalleventa/${id}`)

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al obtener detalle de venta con ID ${id}:`, error)
    throw error
  }
}

// Función para crear un nuevo detalle de venta
export async function createDetalleVenta(detalleVenta: DetalleVenta): Promise<DetalleVenta> {
  try {
    const response = await fetch(`${API_BASE_URL}/detalleventa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(detalleVenta),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al crear detalle de venta:", error)
    throw error
  }
}

// Función para actualizar un detalle de venta existente
export async function updateDetalleVenta(id: number, detalleVenta: DetalleVenta): Promise<DetalleVenta> {
  try {
    const response = await fetch(`${API_BASE_URL}/detalleventa/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(detalleVenta),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al actualizar detalle de venta con ID ${id}:`, error)
    throw error
  }
}

// Función para eliminar un detalle de venta
export async function deleteDetalleVenta(id: number): Promise<void> {
  console.log(`Eliminando detalle de venta con ID ${id}...`)
  try {
    const response = await fetch(`${API_BASE_URL}/detalleventa/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
  } catch (error) {
    console.error(`Error al eliminar detalle de venta con ID ${id}:`, error)
    throw error
  }
}

// FUNCIONES COMBINADAS

// Modificar la función getVentasConDetalles para usar la cantidad del detalle
export async function getVentasConDetalles(): Promise<VentaConDetalle[]> {
  try {
    // Obtenemos todas las ventas
    const ventas = await getAllVentas()


    // Obtenemos todos los detalles de venta
    const detallesVenta = await getAllDetalleVentas()
    console.log("Detalles de venta obtenidos:", detallesVenta)

    // Obtenemos todos los productos
    const productos = await getAllProductos()

    // Creamos un mapa de productos para acceso rápido
    const productosMap = new Map<string, Producto>()
    productos.forEach((producto) => {
      productosMap.set(producto.codigo_barras, producto)
    })

    // Combinamos los datos
    const ventasConDetalles: VentaConDetalle[] = []

    for (const detalle of detallesVenta) {
      const venta = ventas.find((v) => v.id_venta === detalle.id_venta)
      const producto = productosMap.get(detalle.codigo_barras)

      if (venta && producto) {
        // Usamos la cantidad del detalle si existe, de lo contrario asumimos 1
      const cantidad = venta.cantidad_vendida
        console.log(
          `Procesando detalle para venta ${detalle.id_venta}, producto ${detalle.codigo_barras}, cantidad: ${cantidad}`,
        )

        ventasConDetalles.push({
          id_venta: venta.id_venta!,
          fecha_venta: venta.fecha_venta,
          codigo_barras: detalle.codigo_barras,
          nombre: producto.nombre,
          tipo: producto.tipo,
          cantidad: cantidad,
          precio_unitario: producto.precio_unitario,
          total: cantidad * producto.precio_unitario,
        })
      }
    }

    console.log("Ventas con detalles procesadas:", ventasConDetalles)
    return ventasConDetalles
  } catch (error) {
    console.error("Error al obtener ventas con detalles:", error)
    throw error
  }
}

// Modificar la función registrarVenta para crear un solo detalle con la cantidad especificada
export async function registrarVenta(
  fecha: Date,
  detalles: { codigo_barras: string; cantidad: number }[],
): Promise<Venta> {
  try {
    // Obtenemos los productos para calcular el total
    const productos: Producto[] = []
    for (const detalle of detalles) {
      const producto = await getProductoByBarcode(detalle.codigo_barras)
      productos.push(producto)
    }

    // Calculamos totales
    const cantidadVendida = detalles.reduce((total, detalle) => total + detalle.cantidad, 0)
    let totalVenta = 0

    // Calculamos el total de la venta multiplicando precio por cantidad
    detalles.forEach((detalle, index) => {
      const producto = productos[index]
      totalVenta += producto.precio_unitario * detalle.cantidad
    })

    // Creamos la venta
    const nuevaVenta: Venta = {
      fecha_venta: fecha,
      cantidad_vendida: cantidadVendida,
      total_venta: totalVenta,
    }

    const ventaCreada = await createVenta(nuevaVenta)

    // Creamos un solo detalle por producto con la cantidad especificada
    for (let i = 0; i < detalles.length; i++) {
      const detalle = detalles[i]
      const producto = productos[i]

      // Crear un único detalle con la cantidad especificada
      const nuevoDetalle: DetalleVenta = {
        id_detalle: 0, // Asumimos que el ID se genera automáticamente
        id_venta: ventaCreada.id_venta!,
        codigo_barras: detalle.codigo_barras,
        cantidad: detalle.cantidad, // Añadimos la cantidad al detalle
      }

      await createDetalleVenta(nuevoDetalle)

      // Actualizamos el stock del producto
      const nuevoStock = producto.cantidad_en_stock - detalle.cantidad
      await updateProductStock(detalle.codigo_barras, nuevoStock)
    }

    return ventaCreada
  } catch (error) {
    console.error("Error al registrar venta completa:", error)
    throw error
  }
}

// Modifiquemos también la función eliminarVentaCompleta para asegurarnos de que está restaurando la cantidad correcta del stock

export async function eliminarVentaCompleta(id: number): Promise<void> {
  try {
    // Obtenemos todos los detalles de venta
    const detallesVenta = await getAllDetalleVentas()
    console.log(`Detalles de venta obtenidos para eliminar: ${JSON.stringify(detallesVenta)}`)

    // Filtramos los detalles que pertenecen a esta venta
    const detallesDeEstaVenta = detallesVenta.filter((detalle) => detalle.id_venta === id)

    console.log(`Detalles de venta a eliminar: ${JSON.stringify(detallesDeEstaVenta)}`)

    // Eliminamos cada detalle y restauramos el stock
    for (const detalle of detallesDeEstaVenta) {
      console.log(`Eliminando detalle de venta con ID ${detalle.id_detalle}...`)
      await deleteDetalleVenta(detalle.id_detalle)

      // Restauramos el stock del producto usando la cantidad del detalle
      const producto = await getProductoByBarcode(detalle.codigo_barras)

      // Nos aseguramos de manejar el caso donde cantidad es undefined
      const cantidadARestaurar = detalle.cantidad !== undefined ? detalle.cantidad : 1
      console.log(
        `Restaurando stock para ${detalle.codigo_barras}: cantidad actual ${producto.cantidad_en_stock}, añadiendo ${cantidadARestaurar}`,
      )

      const nuevoStock = producto.cantidad_en_stock + cantidadARestaurar
      await updateProductStock(detalle.codigo_barras, nuevoStock)
    }

    // Finalmente eliminamos la venta
    await deleteVenta(id)
  } catch (error) {
    console.error(`Error al eliminar venta completa con ID ${id}:`, error)
    throw error
  }
}
