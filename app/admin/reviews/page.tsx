"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
const ratingAnimation = require("../../../public/Lottie/Rating.json");

type ReviewStatus = "published" | "pending" | "reported";

interface Review {
  id: string;
  product: {
    name: string;
    image: string;
  };
  rating: number;
  review: string;
  customer: {
    name: string;
    avatar?: string | null;
    verified: boolean;
  };
  date: string;
  status: ReviewStatus;
}

interface ReviewStats {
  total: number;
  averageRating: number;
  pending: number;
  reported: number;
}

type StatusFilter = "all" | ReviewStatus;

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    averageRating: 0,
    pending: 0,
    reported: 0,
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/reviews");
        if (!res.ok) {
          throw new Error("Failed to load reviews");
        }
        const data = await res.json();
        setReviews(data.reviews || []);
        setStats(
          data.stats || { total: 0, averageRating: 0, pending: 0, reported: 0 }
        );
      } catch (err) {
        console.error("Error loading reviews:", err);
        setError("Unable to load reviews right now.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    if (statusFilter === "all") return reviews;
    return reviews.filter((r) => r.status === statusFilter);
  }, [reviews, statusFilter]);

  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i - 0.5 === rating) {
        stars.push(
          <StarHalf
            key={i}
            className="h-4 w-4 fill-yellow-400 text-yellow-400"
          />
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return <div className="flex">{stars}</div>;
  };

  // Render status badge
  const renderStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600 hover:bg-yellow-100"
          >
            Pending
          </Badge>
        );
      case "reported":
        return <Badge variant="destructive">Reported</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">
          Manage customer reviews and feedback for your products.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? "Based on all customer reviews"
                : "No reviews yet"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}/5
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="flex mr-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i <= Math.round(stats.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              from {stats.total} reviews
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reported Reviews
            </CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reported}</div>
            <p className="text-xs text-muted-foreground">Flagged for review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            className={`text-sm h-8 border ${
              statusFilter === "all"
                ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                : "border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "published" ? "default" : "outline"}
            className={`text-sm h-8 border ${
              statusFilter === "published"
                ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                : "border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            }`}
            onClick={() => setStatusFilter("published")}
          >
            Published
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            className={`text-sm h-8 border ${
              statusFilter === "pending"
                ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                : "border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            }`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "reported" ? "default" : "outline"}
            className={`text-sm h-8 border ${
              statusFilter === "reported"
                ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                : "border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            }`}
            onClick={() => setStatusFilter("reported")}
          >
            Reported
          </Button>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            className="text-sm h-8 border border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
          >
            All Stars
          </Button>
          <Button
            variant="outline"
            className="text-sm h-8 flex items-center border border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
          >
            5 <Star className="ml-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
          </Button>
          <Button
            variant="outline"
            className="text-sm h-8 border border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
          >
            4+
          </Button>
          <Button
            variant="outline"
            className="text-sm h-8 border border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
          >
            3+
          </Button>
        </div>
      </div>

      {/* Reviews Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>
            A list of all customer reviews for your products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading reviews...</p>
          ) : filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-64 h-64">
                <Lottie animationData={ratingAnimation} loop autoplay />
              </div>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                No reviews found for the selected filters.
              </p>
            </div>
          ) : (
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
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={review.product.image || "/placeholder.svg"}
                          alt={review.product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        <span className="font-medium">
                          {review.product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px]">
                      <p className="truncate">{review.review}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={review.customer.avatar || "/placeholder.svg"}
                            alt={review.customer.name}
                          />
                          <AvatarFallback>
                            {review.customer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {review.customer.name}
                          </p>
                          {review.customer.verified && (
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />{" "}
                              Verified
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {review.date}
                    </TableCell>
                    <TableCell>{renderStatusBadge(review.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
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
          )}

          {/* Pagination */}
          {!isLoading && filteredReviews.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing 1-5 of 125 reviews
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 bg-blue-600 text-white hover:bg-blue-700 border border-blue-600"
                >
                  <span className="sr-only">Page 1</span>1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                >
                  <span className="sr-only">Page 2</span>2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                >
                  <span className="sr-only">Page 3</span>3
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
