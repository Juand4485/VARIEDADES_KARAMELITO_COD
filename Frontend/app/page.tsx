"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Barcode, Edit, Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import BarcodeScanner from "@/components/barcode-scanner"
import {
  type Producto,
  getAllProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  getProductoByBarcode,
  updateProductStock,
} from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
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

export default function StockPage() {
  const searchParams = useSearchParams()
  const stockBajoParam = searchParams.get("stockBajo")

  const { toast } = useToast()
  const [products, setProducts] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("Todos")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addUnitsDialogOpen, setAddUnitsDialogOpen] = useState(false)
  const [scannerDialogOpen, setScannerDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form states
  const [newProduct, setNewProduct] = useState<Producto>({
    codigo_barras: "",
    nombre: "",
    tipo: "Dulces",
    cantidad_en_stock: 1,
    precio_unitario: 0,
  })

  const tipos = ["Dulces", "Galletas", "Snacks", "Bebidas", "Otros", ]

  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [addingUnitsProduct, setAddingUnitsProduct] = useState<Producto | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Producto | null>(null)
  const [unitsToAdd, setUnitsToAdd] = useState(1)

  // Obtener todos los productos al cargar la página
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const data = await getAllProductos()
        setProducts(data)
        setError(null)

        // Si hay un parámetro stockBajo, establecer el filtro para mostrar solo productos con stock bajo
        if (stockBajoParam === "true") {
          setFilterType("StockBajo")
        }
      } catch (err) {
        setError("Error al cargar los productos. Por favor, intenta de nuevo.")
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los productos. Verifica la conexión con la API.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [toast, stockBajoParam])

  // Filtrar productos según búsqueda y tipo
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || product.codigo_barras.includes(searchTerm)

    let matchesType = true
    if (filterType === "StockBajo") {
      matchesType = product.cantidad_en_stock <= 5
    } else {
      matchesType = filterType === "Todos" || product.tipo === filterType
    }

    return matchesSearch && matchesType
  })

  // Obtener tipos únicos para el filtro
  const uniqueTypes = Array.from(new Set(products.map((product) => product.tipo)))

  // Manejadores de eventos
  const handleEditProduct = (product: Producto) => {
    setEditingProduct({ ...product })
    setEditDialogOpen(true)
  }

  const handleAddUnits = (product: Producto) => {
    setAddingUnitsProduct(product)
    setUnitsToAdd(1)
    setAddUnitsDialogOpen(true)
  }

  const handleDeleteProduct = (product: Producto) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  const saveNewProduct = async () => {
    try {
      setIsLoading(true)
      const createdProduct = await createProducto({
        ...newProduct,
        cantidad_en_stock: Number(newProduct.cantidad_en_stock),
        precio_unitario: Number(newProduct.precio_unitario),
      })

      setProducts([...products, createdProduct])
      setAddDialogOpen(false)
      setNewProduct({
        codigo_barras: "",
        nombre: "",
        tipo: "Dulces",
        cantidad_en_stock: 1,
        precio_unitario: 0,
      })

      toast({
        title: "Producto agregado",
        description: `${createdProduct.nombre} ha sido agregado al inventario.`,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar el producto. Verifica los datos e intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveEditedProduct = async () => {
    if (!editingProduct) return

    try {
      setIsLoading(true)
      const updatedProduct = await updateProducto(editingProduct.codigo_barras, {
        ...editingProduct,
        cantidad_en_stock: Number(editingProduct.cantidad_en_stock),
        precio_unitario: Number(editingProduct.precio_unitario),
      })

      const updatedProducts = products.map((p) =>
        p.codigo_barras === updatedProduct.codigo_barras ? updatedProduct : p,
      )

      setProducts(updatedProducts)
      setEditDialogOpen(false)

      toast({
        title: "Producto actualizado",
        description: `${updatedProduct.nombre} ha sido actualizado correctamente.`,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el producto. Verifica los datos e intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveAddedUnits = async () => {
    if (!addingUnitsProduct) return

    try {
      setIsLoading(true)
      // Usamos el nombre correcto del campo
      const newStock = addingUnitsProduct.cantidad_en_stock + Number(unitsToAdd)

      console.log(
        `Actualizando stock de ${addingUnitsProduct.nombre} de ${addingUnitsProduct.cantidad_en_stock} a ${newStock}`,
      )

      const updatedProduct = await updateProductStock(addingUnitsProduct.codigo_barras, newStock)

      const updatedProducts = products.map((p) =>
        p.codigo_barras === updatedProduct.codigo_barras ? updatedProduct : p,
      )

      setProducts(updatedProducts)
      setAddUnitsDialogOpen(false)

      toast({
        title: "Stock actualizado",
        description: `Se han añadido ${unitsToAdd} unidades de ${updatedProduct.nombre}.`,
      })
    } catch (err) {
      console.error("Error al actualizar stock:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el stock. Intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return

    try {
      setIsLoading(true)
      await deleteProducto(deletingProduct.codigo_barras)

      const updatedProducts = products.filter((p) => p.codigo_barras !== deletingProduct.codigo_barras)

      setProducts(updatedProducts)
      setDeleteDialogOpen(false)

      toast({
        title: "Producto eliminado",
        description: `${deletingProduct.nombre} ha sido eliminado del inventario.`,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el producto. Intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBarcodeDetected = async (barcode: string) => {
    try {
      // Intentar encontrar el producto por código de barras
      const existingProduct = await getProductoByBarcode(barcode)

      // Si el producto existe, preparar para añadir unidades
      setAddingUnitsProduct(existingProduct)
      setUnitsToAdd(1)
      setScannerDialogOpen(false)
      setAddUnitsDialogOpen(true)

      toast({
        title: "Producto encontrado",
        description: `Se encontró ${existingProduct.nombre} en el inventario.`,
      })
    } catch (err) {
      // Si el producto no existe, preparar para agregarlo
      setNewProduct({
        ...newProduct,
        codigo_barras: barcode,
      })
      setScannerDialogOpen(false)
      setAddDialogOpen(true)

      toast({
        title: "Producto nuevo",
        description: "Este código de barras no existe en el inventario. Puedes agregar un nuevo producto.",
      })
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Productos en Stock</h1>
        <div className="flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setAddDialogOpen(true)} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" /> Agregar producto
          </Button>
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => setScannerDialogOpen(true)}
            disabled={isLoading}
          >
            <Barcode className="mr-2 h-4 w-4" /> Escanear código
          </Button>
        </div>
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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo de producto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los tipos</SelectItem>
                <SelectItem value="StockBajo">Stock bajo</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <div className="rounded-md border bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead>Código de Barras</TableHead>
                <TableHead>Nombre del Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm || filterType !== "Todos"
                      ? "No se encontraron productos con los filtros aplicados"
                      : "No hay productos en el inventario"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.codigo_barras} className={product.cantidad_en_stock <= 5 ? "bg-amber-50" : ""}>
                    <TableCell className="font-medium">{product.codigo_barras}</TableCell>
                    <TableCell>{product.nombre}</TableCell>
                    <TableCell>{product.tipo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.cantidad_en_stock}
                        {product.cantidad_en_stock <= 5 && (
                          <Badge variant="outline" className="text-amber-600 border-amber-600 flex items-center">
                            ⚠️ ¡Quedan pocas unidades!
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>${product.precio_unitario.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600"
                          onClick={() => handleAddUnits(product)}
                          disabled={isLoading}
                        >
                          <span className="sr-only">Añadir unidades</span>
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600"
                          onClick={() => handleEditProduct(product)}
                          disabled={isLoading}
                        >
                          <span className="sr-only">Editar</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => handleDeleteProduct(product)}
                          disabled={isLoading}
                        >
                          <span className="sr-only">Eliminar</span>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogos (sin cambios) */}
      {/* ... */}

      {/* Diálogo para agregar producto */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
            <DialogDescription>Ingresa los detalles del nuevo producto para agregarlo al inventario.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right">
                Código de Barras
              </Label>
              <Input
                id="barcode"
                value={newProduct.codigo_barras}
                onChange={(e) => setNewProduct({ ...newProduct, codigo_barras: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={newProduct.nombre}
                onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Select value={newProduct.tipo} onValueChange={(value) => setNewProduct({ ...newProduct, tipo: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock Inicial
              </Label>
              <Input
                id="stock"
                type="number"
                min="1"
                value={newProduct.cantidad_en_stock}
                onChange={(e) => setNewProduct({ ...newProduct, cantidad_en_stock: Number.parseInt(e.target.value) })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Precio Unitario
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={newProduct.precio_unitario}
                onChange={(e) => setNewProduct({ ...newProduct, precio_unitario: Number.parseFloat(e.target.value) })}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={saveNewProduct} disabled={isLoading || !newProduct.codigo_barras || !newProduct.nombre}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar producto */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Modifica los detalles del producto seleccionado.</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-barcode" className="text-right">
                  Código de Barras
                </Label>
                <Input
                  id="edit-barcode"
                  value={editingProduct.codigo_barras}
                  onChange={(e) => setEditingProduct({ ...editingProduct, codigo_barras: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="edit-name"
                  value={editingProduct.nombre}
                  onChange={(e) => setEditingProduct({ ...editingProduct, nombre: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">
                  Tipo
                </Label>
                <Select
                  value={editingProduct.tipo}
                  onValueChange={(value) => setEditingProduct({ ...editingProduct, tipo: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dulces">Dulces</SelectItem>
                    <SelectItem value="Galletas">Galletas</SelectItem>
                    <SelectItem value="Snacks">Snacks</SelectItem>
                    <SelectItem value="Bebidas">Bebidas</SelectItem>
                    <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">
                  Stock Actual
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={editingProduct.cantidad_en_stock}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, cantidad_en_stock: Number.parseInt(e.target.value) })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Precio Unitario
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingProduct.precio_unitario}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, precio_unitario: Number.parseFloat(e.target.value) })
                  }
                  className="col-span-3"
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={saveEditedProduct}
              disabled={isLoading || !editingProduct?.codigo_barras || !editingProduct?.nombre}
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para añadir unidades */}
      <Dialog open={addUnitsDialogOpen} onOpenChange={setAddUnitsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir Unidades</DialogTitle>
            <DialogDescription>
              {addingUnitsProduct && `Añadir unidades a: ${addingUnitsProduct.nombre}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="units" className="text-right">
                Unidades a añadir
              </Label>
              <Input
                id="units"
                type="number"
                min="1"
                value={unitsToAdd}
                onChange={(e) => setUnitsToAdd(Number.parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            {addingUnitsProduct && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Stock actual</Label>
                <div className="col-span-3">{addingUnitsProduct.cantidad_en_stock} unidades</div>
              </div>
            )}
            {addingUnitsProduct && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Stock nuevo</Label>
                <div className="col-span-3 font-bold">
                  {addingUnitsProduct ? addingUnitsProduct.cantidad_en_stock + unitsToAdd : 0} unidades
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUnitsDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={saveAddedUnits} disabled={isLoading || unitsToAdd < 1}>
              {isLoading ? "Añadiendo..." : "Añadir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para escanear código de barras */}
      <Dialog open={scannerDialogOpen} onOpenChange={setScannerDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Escanear Código de Barras</DialogTitle>
            <DialogDescription>Coloca el código de barras frente a la cámara para escanear.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <BarcodeScanner onDetected={handleBarcodeDetected} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScannerDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar producto */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el producto
              {deletingProduct && <strong> "{deletingProduct.nombre}"</strong>} del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
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
