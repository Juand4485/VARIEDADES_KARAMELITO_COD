"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Box, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Productos en Stock",
      icon: Box,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Productos Vendidos",
      icon: ShoppingCart,
      href: "/vendidos",
      active: pathname === "/vendidos",
    },
    {
      label: "Dashboard",
      icon: BarChart3,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
  ]

  return (
    <div className="h-full border-r border-karamelito/40 bg-white w-64 flex flex-col shadow-sm">
      <div className="py-6 px-3 flex justify-center border-b border-karamelito/40">
        <Image src={"/Logo 1.png"} alt="Logo" width={2500} height={2500}  />
      </div>
      <div className="flex flex-col p-3 space-y-2 flex-1">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={route.active ? "default" : "ghost"}
            className={cn(
              "justify-start text-base font-medium",
              route.active ? "bg-karamelito hover:bg-karamelito/90" : "hover:bg-karamelito/10 hover:text-karamelito",
            )}
            asChild
          >
            <Link href={route.href}>
              <route.icon className="h-5 w-5 mr-3" />
              {route.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
