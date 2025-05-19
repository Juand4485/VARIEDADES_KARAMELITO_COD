"use client"

import { useState } from "react"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Sample data for demonstration
const lowStockProducts = [
  {
    id: 4,
    barcode: "7504567890123",
    name: "Chicles Trident",
    type: "Dulces",
    stock: 5,
    price: 12000,
  },
  {
    id: 5,
    barcode: "7505678901234",
    name: "Refresco Coca-Cola",
    type: "Bebidas",
    stock: 3,
    price: 25000,
  },
]

export default function StockBajoPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = lowStockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Función para formatear precios en pesos colombianos
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-karamelito">Productos con Stock Bajo</h1>
      </div>

      <Card className="mb-6 border-karamelito/30 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                className="pl-8 border-karamelito/40 focus-visible:ring-karamelito/30 focus-visible:border-karamelito"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border border-karamelito/30 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-karamelito/10">
            <TableRow>
              <TableHead>Código de Barras</TableHead>
              <TableHead>Nombre del Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Precio Unitario</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="bg-amber-50">
                <TableCell className="font-medium">{product.barcode}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.type}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {product.stock}
                    <Badge variant="outline" className="text-amber-600 border-amber-600 flex items-center">
                      ⚠️ ¡Quedan pocas unidades!
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
