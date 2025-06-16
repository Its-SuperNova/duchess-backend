import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  MessageSquare,
  MoreVertical,
  Search,
  Star,
  StarHalf,
  ThumbsUp,
  Trash2,
  Clock,
} from "lucide-react"

export default function ReviewsPage() {
  // Sample review data
  const reviews = [
    {
      id: 1,
      product: {
        name: "Chocolate Eclair",
        image: "/classic-chocolate-eclair.png",
      },
      rating: 5,
      review: "Absolutely delicious! The chocolate filling was rich and creamy. Will definitely order again.",
      customer: {
        name: "Sarah Johnson",
        avatar: "/user-avatar-1.png",
        verified: true,
      },
      date: "2025-04-28",
      status: "published",
    },
    {
      id: 2,
      product: {
        name: "Strawberry Cheesecake",
        image: "/classic-strawberry-cheesecake.png",
      },
      rating: 4,
      review: "Great flavor and texture. The strawberry topping was fresh, but I wish there was a bit more of it.",
      customer: {
        name: "Michael Chen",
        avatar: "/user-avatar-2.png",
        verified: true,
      },
      date: "2025-04-27",
      status: "published",
    },
    {
      id: 3,
      product: {
        name: "Raspberry Macarons",
        image: "/vibrant-raspberry-macarons.png",
      },
      rating: 2,
      review: "Disappointing. The macarons were too sweet and the shells were cracked. Not worth the price.",
      customer: {
        name: "Emily Rodriguez",
        avatar: "/user-avatar-3.png",
        verified: false,
      },
      date: "2025-04-26",
      status: "reported",
    },
    {
      id: 4,
      product: {
        name: "Lemon Tart",
        image: "/bright-lemon-tart.png",
      },
      rating: 5,
      review: "Perfect balance of sweet and tangy. The crust was buttery and flaky. One of the best desserts I've had!",
      customer: {
        name: "David Wilson",
        avatar: "/user-avatar-4.png",
        verified: true,
      },
      date: "2025-04-25",
      status: "published",
    },
    {
      id: 5,
      product: {
        name: "Chocolate Chip Cookies",
        image: "/classic-chocolate-chip-cookies.png",
      },
      rating: 3,
      review: "Good but not great. The cookies were a bit too hard for my liking. Decent flavor though.",
      customer: {
        name: "Jessica Brown",
        avatar: "/user-avatar-5.png",
        verified: true,
      },
      date: "2025-04-24",
      status: "pending",
    },
  ]

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
      } else if (i - 0.5 === rating) {
        stars.push(<StarHalf key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />)
      }
    }
    return <div className="flex">{stars}</div>
  }

  // Render status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "reported":
        return <Badge variant="destructive">Reported</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">Manage customer reviews and feedback for your products.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search reviews..." className="w-full pl-8" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">+8 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2/5</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="flex mr-1">
                {[1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                <StarHalf className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
              from 125 reviews
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported Reviews</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Flagged for review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm h-8">
            All
          </Button>
          <Button variant="outline" className="text-sm h-8">
            Published
          </Button>
          <Button variant="outline" className="text-sm h-8">
            Pending
          </Button>
          <Button variant="outline" className="text-sm h-8">
            Reported
          </Button>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" className="text-sm h-8">
            All Stars
          </Button>
          <Button variant="outline" className="text-sm h-8 flex items-center">
            5 <Star className="ml-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
          </Button>
          <Button variant="outline" className="text-sm h-8">
            4+
          </Button>
          <Button variant="outline" className="text-sm h-8">
            3+
          </Button>
        </div>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>A list of all customer reviews for your products.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="hidden md:table-cell">Review</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={review.product.image || "/placeholder.svg"}
                        alt={review.product.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <span className="font-medium">{review.product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{renderStars(review.rating)}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px]">
                    <p className="truncate">{review.review}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.customer.avatar || "/placeholder.svg"} alt={review.customer.name} />
                        <AvatarFallback>{review.customer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{review.customer.name}</p>
                        {review.customer.verified && (
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Verified
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{review.date}</TableCell>
                  <TableCell>{renderStatusBadge(review.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Reply</span>
                        </DropdownMenuItem>
                        {review.status === "pending" && (
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Approve</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          <span>Highlight</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {review.status !== "reported" && (
                          <DropdownMenuItem>
                            <Flag className="mr-2 h-4 w-4" />
                            <span>Report</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">Showing 1-5 of 125 reviews</p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-primary text-primary-foreground">
                <span className="sr-only">Page 1</span>1
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Page 2</span>2
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Page 3</span>3
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
