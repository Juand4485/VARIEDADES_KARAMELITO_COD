"use client"

import { useEffect, useState } from "react"
import { CalendarIcon, Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  type Producto,
  type VentaConDetalle,
  eliminarVentaCompleta,
  getAllProductos,
  getVentasConDetalles,
  registrarVenta,
} from "@/services/api"

export default function SoldProductsPage() {
  const { toast } = useToast()
  const [ventasConDetalles, setVentasConDetalles] = useState<VentaConDetalle[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [registerSaleOpen, setRegisterSaleOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingVenta, setDeletingVenta] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state for new sale
  // Modificar el estado de selectedProducts para que sea un solo producto en lugar de un array
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  // Mantener el estado para la cantidad
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  // Modificar el estado para permitir valores vacíos temporalmente
  const [selectedQuantityInput, setSelectedQuantityInput] = useState<string>("1")
  const [saleDate, setSaleDate] = useState<Date>(new Date())

  // Añadamos también una función de utilidad para verificar los datos al cargar

  // Dentro del useEffect donde cargamos los datos, agreguemos más logs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [ventasData, productosData] = await Promise.all([getVentasConDetalles(), getAllProductos()])

        console.log("Ventas con detalles recibidas:", ventasData)
        // Verificamos específicamente las cantidades
        ventasData.forEach((venta) => {
          console.log(
            `Venta ID: ${venta.id_venta}, Producto: ${venta.nombre}, Cantidad: ${venta.cantidad}, Tipo de cantidad: ${typeof venta.cantidad}`,
          )
        })

        setVentasConDetalles(ventasData)
        setProductos(productosData)
        setError(null)
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

  // Filtrar ventas según búsqueda y fecha
  const filteredVentas = ventasConDetalles.filter((venta) => {
    const matchesSearch =
      venta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || venta.codigo_barras.includes(searchTerm)

    const ventaFecha = typeof venta.fecha_venta === "string" ? parseISO(venta.fecha_venta) : new Date(venta.fecha_venta)

    const matchesDate =
      !date ||
      (ventaFecha.getDate() === date.getDate() &&
        ventaFecha.getMonth() === date.getMonth() &&
        ventaFecha.getFullYear() === date.getFullYear())

    return matchesSearch && matchesDate
  })

  // Reemplazar la función handleAddProduct
  const handleSelectProduct = (codigo_barras: string) => {
    setSelectedProduct(codigo_barras)
    // Resetear la cantidad a 1 cuando se selecciona un nuevo producto
    setSelectedQuantity(1)
    setSelectedQuantityInput("1")
  }

  // Eliminar la función handleRemoveProduct ya que ahora solo manejamos un producto

  // Modificar la función handleRegisterSale
  const handleRegisterSale = async () => {
    if (!selectedProduct) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar un producto.",
      })
      return
    }

    try {
      setIsLoading(true)

      // Verificar stock suficiente
      const producto = productos.find((p) => p.codigo_barras === selectedProduct)
      if (producto && producto.cantidad_en_stock < selectedQuantity) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Stock insuficiente para ${producto.nombre}. Solo hay ${producto.cantidad_en_stock} unidades disponibles.`,
        })
        setIsLoading(false)
        return
      }

      // Preparar detalle para la venta (un solo producto con su cantidad)
      const detalles = [
        {
          codigo_barras: selectedProduct,
          cantidad: selectedQuantity,
        },
      ]

      // Registrar la venta
      await registrarVenta(saleDate, detalles)

      // Recargar datos
      const ventasActualizadas = await getVentasConDetalles()
      setVentasConDetalles(ventasActualizadas)

      // Recargar productos para actualizar stock
      const productosActualizados = await getAllProductos()
      setProductos(productosActualizados)

      setRegisterSaleOpen(false)
      setSelectedProduct("")
      setSaleDate(new Date())
      setSelectedQuantity(1)
      setSelectedQuantityInput("1")

      toast({
        title: "Venta registrada",
        description: `Se ha registrado la venta de ${selectedQuantity} unidades de ${producto?.nombre}.`,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar la venta. Intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVenta = (ventaId: number) => {
    setDeletingVenta(ventaId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteVenta = async () => {
    if (!deletingVenta) return

    console.log("Eliminando venta con ID:", deletingVenta)

    try {
      setIsLoading(true)
      await eliminarVentaCompleta(deletingVenta)

      // Recargar datos
      const ventasActualizadas = await getVentasConDetalles()
      setVentasConDetalles(ventasActualizadas)

      // Recargar productos para actualizar stock
      const productosActualizados = await getAllProductos()
      setProductos(productosActualizados)

      setDeleteDialogOpen(false)

      toast({
        title: "Venta eliminada",
        description: "La venta ha sido eliminada correctamente.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la venta. Intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatFecha = (fecha: string | Date) => {
    if (typeof fecha === "string") {
      return format(parseISO(fecha), "dd/MM/yyyy")
    }
    return format(fecha, "dd/MM/yyyy")
  }

  // Calcular el total de la venta para mostrar en la tabla
  const calcularTotalVenta = (id_venta: number) => {
    const detallesDeVenta = ventasConDetalles.filter((venta) => venta.id_venta === id_venta)
    return detallesDeVenta.reduce((total, venta) => total + venta.total, 0)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Productos Vendidos</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setRegisterSaleOpen(true)}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" /> Registrar Venta
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o código de barras..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : "Filtrar por fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
            {date && (
              <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setDate(undefined)}>
                Limpiar filtro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <Button variant="link" className="text-red-700 p-0 h-auto ml-2" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      )}

      {isLoading && !error ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      ) : (
        <div className="rounded-md border bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead>ID Venta</TableHead>
                <TableHead>Fecha de Venta</TableHead>
                <TableHead>Código de Barras</TableHead>
                <TableHead>Nombre del Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVentas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    {searchTerm || date
                      ? "No se encontraron ventas con los filtros aplicados"
                      : "No hay ventas registradas"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVentas.map((venta) => (
                  <TableRow key={`${venta.id_venta}-${venta.codigo_barras}`}>
                    <TableCell>{venta.id_venta}</TableCell>
                    <TableCell>{formatFecha(venta.fecha_venta)}</TableCell>
                    <TableCell className="font-medium">{venta.codigo_barras}</TableCell>
                    <TableCell>{venta.nombre}</TableCell>
                    <TableCell>{venta.tipo}</TableCell>
                    {/* Destacamos y aseguramos que la cantidad se muestre correctamente */}
                    <TableCell className="font-semibold">{venta.cantidad}</TableCell>
                    <TableCell>${venta.precio_unitario.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">${venta.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => handleDeleteVenta(venta.id_venta)}
                        disabled={isLoading}
                      >
                        <span className="sr-only">Eliminar</span>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogo para registrar venta */}
      {/* Modificar la sección del diálogo para registrar venta */}
      {/* Reemplazar la sección del diálogo para registrar venta con este código: */}
      <Dialog open={registerSaleOpen} onOpenChange={setRegisterSaleOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Venta</DialogTitle>
            <DialogDescription>Selecciona el producto y la cantidad vendida.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Fecha
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(saleDate, "PPP", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={saleDate}
                    onSelect={(date) => date && setSaleDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Producto
              </Label>
              <div className="col-span-3">
                <Select value={selectedProduct} onValueChange={handleSelectProduct}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((product) => (
                      <SelectItem
                        key={product.codigo_barras}
                        value={product.codigo_barras}
                        disabled={product.cantidad_en_stock <= 0}
                      >
                        {product.nombre} - ${product.precio_unitario.toFixed(2)}{" "}
                        {product.cantidad_en_stock <= 0 ? "(Sin stock)" : `(${product.cantidad_en_stock} disponibles)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Cantidad
              </Label>
              <div className="col-span-3">
                <Input
                  id="quantity"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={selectedQuantityInput}
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedQuantityInput(value)

                    // Convertir a número solo si hay un valor
                    if (value === "") {
                      setSelectedQuantity(0) // Temporalmente 0, pero no permitiremos guardar con 0
                    } else {
                      const numValue = Number.parseInt(value, 10)
                      if (!isNaN(numValue)) {
                        setSelectedQuantity(numValue)
                      }
                    }
                  }}
                  className={
                    selectedQuantityInput === "" || Number.parseInt(selectedQuantityInput, 10) < 1
                      ? "border-red-500"
                      : ""
                  }
                />
                {(selectedQuantityInput === "" || Number.parseInt(selectedQuantityInput, 10) < 1) && (
                  <p className="text-xs text-red-500 mt-1">La cantidad debe ser al menos 1</p>
                )}
              </div>
            </div>

            {selectedProduct && (
              <div className="border rounded-md p-3 mt-2">
                <h4 className="font-medium mb-2">Resumen de venta:</h4>
                {(() => {
                  const producto = productos.find((p) => p.codigo_barras === selectedProduct)
                  if (!producto) return null

                  const total = producto.precio_unitario * selectedQuantity

                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Producto:</span>
                        <span>{producto.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Precio unitario:</span>
                        <span>${producto.precio_unitario.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cantidad:</span>
                        <span>{selectedQuantity}</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between font-medium">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterSaleOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleRegisterSale}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !selectedProduct || selectedQuantity < 1}
            >
              {isLoading ? "Registrando..." : "Registrar Venta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar venta */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la venta con ID {deletingVenta} y restaurará el stock de los
              productos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteVenta}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}
