import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"

// Sample banner data
const banners = [
  {
    id: "BNR001",
    title: "Summer Strawberry Sale",
    description: "Enjoy 20% off on all strawberry pastries and cakes for the summer season. Limited time offer!",
    image: "/classic-strawberry-cake.png",
    status: "active",
    createdAt: "2023-06-15",
  },
  {
    id: "BNR002",
    title: "Chocolate Delight Promotion",
    description: "Indulge in our premium chocolate collection with buy one get one free on all chocolate items.",
    image: "/decadent-chocolate-cake.png",
    status: "active",
    createdAt: "2023-07-01",
  },
  {
    id: "BNR003",
    title: "Holiday Cookie Special",
    description: "Celebrate the holidays with our special edition festive cookies. Perfect for family gatherings!",
    image: "/festive-cookie-display.png",
    status: "inactive",
    createdAt: "2023-11-20",
  },
  {
    id: "BNR004",
    title: "Fall Flavors Collection",
    description: "Experience the taste of fall with our seasonal pumpkin spice and apple cinnamon pastries.",
    image: "/autumn-treats.png",
    status: "active",
    createdAt: "2023-09-10",
  },
  {
    id: "BNR005",
    title: "Weekend Pastry Discount",
    description: "Every weekend, get 15% off on all pastries when you order online. Valid Saturday and Sunday only.",
    image: "/delightful-pastries.png",
    status: "inactive",
    createdAt: "2023-08-05",
  },
]

export default function BannersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Banners</h1>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Banner
        </Button>
      </div>

      {/* Banner Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Promotional Banners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="admin-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[180px]">Title</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="w-[120px]">Image</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="hidden md:table-cell w-[120px]">Created At</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell className="font-medium">{banner.id}</TableCell>
                    <TableCell>{banner.title}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="line-clamp-2">{banner.description}</span>
                    </TableCell>
                    <TableCell>
                      <div className="relative h-14 w-24 overflow-hidden rounded-md">
                        <img
                          src={banner.image || "/placeholder.svg"}
                          alt={banner.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={banner.status === "active" ? "default" : "outline"}
                        className={banner.status === "active" ? "bg-green-500 hover:bg-green-600" : "text-gray-500"}
                      >
                        {banner.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{banner.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">Showing 1-5 of 5 entries</p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
