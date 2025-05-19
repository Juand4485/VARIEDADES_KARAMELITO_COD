"use client"

import { useEffect, useState } from "react"
import { AlertCircle, ArrowDown, ArrowUp, BarChart3, Package, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { type Producto, type VentaConDetalle, getAllProductos, getVentasConDetalles } from "@/services/api"
import { subWeeks, isAfter } from "date-fns"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [productos, setProductos] = useState<Producto[]>([])
  const [ventas, setVentas] = useState<VentaConDetalle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [productosData, ventasData] = await Promise.all([getAllProductos(), getVentasConDetalles()])

        setProductos(productosData)
        setVentas(ventasData)
        setError(null)
        console.log("Datos cargados:", { productosData, ventasData })
      } catch (err) {
        setError("Error al cargar los datos. Por favor, intenta de nuevo.")
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos. Verifica la conexión con la API.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    // Total de productos vendidos
    const totalVendidos = ventas.reduce((total, venta) => total + venta.cantidad, 0)
    console.log(ventas)

    // Producto más vendido
    const ventasPorProducto = ventas.reduce<Record<string, { nombre: string; cantidad: number }>>((acc, venta) => {
      if (!acc[venta.codigo_barras]) {
        acc[venta.codigo_barras] = { nombre: venta.nombre, cantidad: 0 }
      }
      acc[venta.codigo_barras].cantidad += venta.cantidad
      return acc
    }, {})

    console.log("Ventas por producto:", ventasPorProducto)

    const productoMasVendido = Object.values(ventasPorProducto).sort((a, b) => b.cantidad - a.cantidad)[0] || {
      nombre: "Sin ventas",
      cantidad: 0,
    }

    // Total en stock
    const totalStock = productos.reduce((total, producto) => total + producto.cantidad_en_stock, 0)

    // Productos con stock bajo
    const productosStockBajo = productos.filter((producto) => producto.cantidad_en_stock <= 5)

    // Calcular cambio porcentual en ventas desde la semana pasada
    const hoy = new Date()
    const unaSemanaAtras = subWeeks(hoy, 1)
    const dosSemanaAtras = subWeeks(hoy, 2)

    const ventasEstaSemana = ventas.filter((venta) => {
      const fechaVenta = typeof venta.fecha_venta === "string" ? new Date(venta.fecha_venta) : venta.fecha_venta
      return isAfter(fechaVenta, unaSemanaAtras)
    }).length

    const ventasSemanaPasada = ventas.filter((venta) => {
      const fechaVenta = typeof venta.fecha_venta === "string" ? new Date(venta.fecha_venta) : venta.fecha_venta
      return isAfter(fechaVenta, dosSemanaAtras) && !isAfter(fechaVenta, unaSemanaAtras)
    }).length

    const cambioPorcentual =
      ventasSemanaPasada === 0 ? 100 : ((ventasEstaSemana - ventasSemanaPasada) / ventasSemanaPasada) * 100

    // Top 5 productos más vendidos
    const top5Productos = Object.values(ventasPorProducto)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)

    // Ventas por semana (últimas 4 semanas)
    const ventasPorSemana = []
    for (let i = 0; i < 4; i++) {
      const inicioSemana = subWeeks(hoy, i + 1)
      const finSemana = subWeeks(hoy, i)

      const ventasSemana = ventas.filter((venta) => {
        const fechaVenta = typeof venta.fecha_venta === "string" ? new Date(venta.fecha_venta) : venta.fecha_venta
        return isAfter(fechaVenta, inicioSemana) && !isAfter(fechaVenta, finSemana)
      }).length

      ventasPorSemana.unshift(ventasSemana) // Añadir al inicio para que la semana más reciente esté al final
    }

    // Encontrar el valor máximo para calcular porcentajes
    const maxVentasSemana = Math.max(...ventasPorSemana, 1) // Mínimo 1 para evitar división por cero

    return {
      totalVendidos,
      productoMasVendido,
      totalStock,
      productosStockBajo,
      cambioPorcentual,
      top5Productos,
      ventasPorSemana,
      maxVentasSemana,
    }
  }

  const {
    totalVendidos,
    productoMasVendido,
    totalStock,
    productosStockBajo,
    cambioPorcentual,
    top5Productos,
    ventasPorSemana,
    maxVentasSemana,
  } = isLoading
    ? {
        totalVendidos: 0,
        productoMasVendido: { nombre: "Cargando...", cantidad: 0 },
        totalStock: 0,
        productosStockBajo: [],
        cambioPorcentual: 0,
        top5Productos: [],
        ventasPorSemana: [0, 0, 0, 0],
        maxVentasSemana: 1,
      }
    : calcularEstadisticas()

  const handleVerProductosStockBajo = () => {
    router.push("/?stockBajo=true")
  }

  // Colores vibrantes para el gráfico de pastel
  const pieColors = [
    "#0010cf",
    "#3f4ad1",
    "#0071cf",
    "#0064ff",
    "#808aff",
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <Button variant="link" className="text-red-700 p-0 h-auto ml-2" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Productos Vendidos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVendidos}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={`flex items-center ${cambioPorcentual >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {cambioPorcentual >= 0 ? (
                      <ArrowUp className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDown className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(cambioPorcentual).toFixed(1)}%
                  </span>{" "}
                  desde la semana pasada
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Producto Más Vendido</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productoMasVendido.nombre}</div>
                <p className="text-xs text-muted-foreground">{productoMasVendido.cantidad} unidades vendidas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total en Stock</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStock}</div>
                <p className="text-xs text-muted-foreground">{productos.length} productos diferentes en inventario</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Productos con Stock Bajo</CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productosStockBajo.length}</div>
                <p className="text-xs text-muted-foreground">Requieren reabastecimiento</p>
              </CardContent>
            </Card>
          </div>

          {productosStockBajo.length > 0 && (
            <Alert className="mb-6 border-amber-500 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-700">Alerta de Stock</AlertTitle>
              <AlertDescription className="text-amber-700">
                Hay {productosStockBajo.length} productos con stock bajo.
                <Button
                  variant="link"
                  className="p-0 h-auto text-amber-700 font-bold"
                  onClick={handleVerProductosStockBajo}
                >
                  Haz clic para revisarlos
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Productos Más Vendidos</CardTitle>
                <CardDescription>Top 5 productos por cantidad vendida</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="space-y-4">
                  {top5Productos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No hay datos de ventas disponibles</p>
                  ) : (
                    top5Productos.map((producto, index) => {
                      // Calcular el porcentaje para la barra basado en el producto más vendido
                      const porcentaje = (producto.cantidad / (top5Productos[0]?.cantidad || 1)) * 100

                      return (
                        <div className="flex items-center" key={index}>
                          <div className="w-[30%] text-sm">{producto.nombre}</div>
                          <div className="w-[60%] bg-slate-100 rounded-full h-3">
                            <div
                              className="h-3 rounded-full"
                              style={{
                                width: `${porcentaje}%`,
                                backgroundColor: pieColors[index % pieColors.length],
                              }}
                            ></div>
                          </div>
                          <div className="w-[10%] text-right text-sm">{producto.cantidad}</div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Ventas</CardTitle>
                <CardDescription>Porcentaje de productos más vendidos</CardDescription>
              </CardHeader>
              <CardContent>
                {top5Productos.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <p className="text-center text-muted-foreground">No hay datos de ventas disponibles</p>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 h-[250px]">
                    {/* Gráfico de pastel mejorado */}
                    <div className="relative w-[180px] h-[180px] flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {(() => {
                          const totalVentasTop5 = top5Productos.reduce((sum, p) => sum + p.cantidad, 0)
                          let startAngle = 0

                          return top5Productos.map((producto, index) => {
                            // Calcular el porcentaje y ángulos para el sector
                            const porcentaje = (producto.cantidad / totalVentasTop5) * 100
                            const angle = (porcentaje / 100) * 360

                            // Convertir ángulos a coordenadas para el path SVG
                            const endAngle = startAngle + angle
                            const startRad = ((startAngle - 90) * Math.PI) / 180
                            const endRad = ((endAngle - 90) * Math.PI) / 180

                            const x1 = 50 + 50 * Math.cos(startRad)
                            const y1 = 50 + 50 * Math.sin(startRad)
                            const x2 = 50 + 50 * Math.cos(endRad)
                            const y2 = 50 + 50 * Math.sin(endRad)

                            // Determinar si el arco es mayor o menor a 180 grados
                            const largeArcFlag = angle > 180 ? 1 : 0

                            // Crear el path para el sector
                            const pathData = [
                              `M 50 50`,
                              `L ${x1} ${y1}`,
                              `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              `Z`,
                            ].join(" ")

                            const currentPath = (
                              <path
                                key={index}
                                d={pathData}
                                fill={pieColors[index % pieColors.length]}
                                stroke="#fff"
                                strokeWidth="1"
                              />
                            )

                            // Actualizar el ángulo de inicio para el siguiente sector
                            startAngle = endAngle

                            return currentPath
                          })
                        })()}
                        {/* Círculo central para crear efecto de dona */}
                        <circle cx="50" cy="50" r="30" fill="white" />
                      </svg>

                      {/* Texto central */}
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-xs font-medium">Total:</span>
                        <span className="text-lg font-bold">
                          {top5Productos.reduce((sum, p) => sum + p.cantidad, 0)}
                        </span>
                        <span className="text-xs">unidades</span>
                      </div>
                    </div>

                    {/* Leyenda mejorada */}
                    <div className="flex flex-col gap-3 flex-grow">
                      {top5Productos.map((producto, index) => {
                        const totalVentasTop5 = top5Productos.reduce((sum, p) => sum + p.cantidad, 0)
                        const porcentaje = ((producto.cantidad / totalVentasTop5) * 100).toFixed(1)

                        return (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-sm flex-shrink-0"
                              style={{ backgroundColor: pieColors[index % pieColors.length] }}
                            />
                            <div className="flex flex-col flex-grow min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="font-medium truncate" title={producto.nombre}>
                                  {producto.nombre}
                                </span>
                                <span className="font-bold ml-2">{porcentaje}%</span>
                              </div>
                              <div className="text-xs text-muted-foreground">{producto.cantidad} unidades</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Toaster />
    </div>
  )
}
