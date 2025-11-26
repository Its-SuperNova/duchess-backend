"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  Users,
  Shield,
  User,
  UserCheck,
  Edit,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as UserType } from "@/lib/supabase";
import { updateUserRole } from "@/lib/auth-utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { LuChefHat } from "react-icons/lu";

type UserWithAddress = UserType & {
  address: string | null;
  totalOrders?: number;
  totalAmountPaid?: number;
};

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [addressFilter, setAddressFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string;
    newRole: "user" | "admin" | "shop_worker";
    userName: string;
    originalRole: "user" | "admin" | "shop_worker";
  } | null>(null);

  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    userId: string;
    userName: string;
  } | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Edit user dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<{
    userId: string;
    userName: string;
    currentRole: "user" | "admin" | "shop_worker";
    newRole: "user" | "admin" | "shop_worker";
  } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) {
        console.error("Error fetching users:", usersError);
        toast.error("Failed to fetch users");
        setLoading(false);
        return;
      }

      const { data: addressesData, error: addressesError } = await supabase
        .from("addresses")
        .select("user_id, city, state")
        .eq("is_default", true);

      if (addressesError) {
        // This is not a fatal error, so we just log it
        console.warn("Could not fetch user addresses:", addressesError.message);
      }

      // Fetch orders data for all users
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("user_id, total_amount, status");

      if (ordersError) {
        console.warn("Could not fetch orders data:", ordersError.message);
      }

      const combinedUsers = usersData.map((user) => {
        const address = addressesData?.find((addr) => addr.user_id === user.id);

        // Calculate total orders and amount for this user
        const userOrders =
          ordersData?.filter((order) => order.user_id === user.id) || [];
        const totalOrders = userOrders.length;
        const totalAmountPaid = userOrders
          .filter(
            (order) =>
              order.status === "completed" || order.status === "delivered"
          )
          .reduce((sum, order) => sum + (order.total_amount || 0), 0);

        return {
          ...user,
          address: address ? address.city : null,
          totalOrders,
          totalAmountPaid,
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      toast.error("An unexpected error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "user" | "admin" | "shop_worker"
  ) => {
    try {
      const userToUpdate = users.find((u) => u.id === userId);
      if (!userToUpdate) return;

      const updatedUserFromDB = await updateUserRole(
        userToUpdate.email,
        newRole
      );

      if (updatedUserFromDB) {
        // Re-apply the address to the user object after update
        setUsers(
          users.map((u) =>
            u.id === userId
              ? { ...updatedUserFromDB, address: userToUpdate.address }
              : u
          )
        );
        toast.success(
          `Role for ${updatedUserFromDB.name} updated to ${newRole}`
        );
      } else {
        toast.error("Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("An unexpected error occurred while updating the role.");
    }
  };

  const initiateRoleChange = (
    userId: string,
    newRole: "user" | "admin" | "shop_worker",
    userName: string
  ) => {
    const originalRole = users.find((u) => u.id === userId)?.role || "user";
    setPendingRoleChange({
      userId,
      newRole,
      userName,
      originalRole,
    });
    setShowConfirmDialog(true);
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;

    await handleRoleChange(pendingRoleChange.userId, pendingRoleChange.newRole);
    setShowConfirmDialog(false);
    setPendingRoleChange(null);
  };

  const cancelRoleChange = () => {
    if (!pendingRoleChange) return;

    setShowConfirmDialog(false);
    setPendingRoleChange(null);
  };

  const initiateDeleteUser = (userId: string, userName: string) => {
    setPendingDelete({ userId, userName });
    setDeleteConfirmationText("");
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (!pendingDelete || deleteConfirmationText !== "delete the user") return;

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", pendingDelete.userId);

      if (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
        return;
      }

      // Remove user from local state
      setUsers(users.filter((user) => user.id !== pendingDelete.userId));
      toast.success(`User ${pendingDelete.userName} deleted successfully`);

      setShowDeleteDialog(false);
      setPendingDelete(null);
      setDeleteConfirmationText("");
    } catch (error) {
      console.error("Error in confirmDeleteUser:", error);
      toast.error("An unexpected error occurred while deleting the user.");
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteDialog(false);
    setPendingDelete(null);
    setDeleteConfirmationText("");
  };

  const initiateEditUser = (
    userId: string,
    userName: string,
    currentRole: "user" | "admin" | "shop_worker"
  ) => {
    setPendingEdit({
      userId,
      userName,
      currentRole,
      newRole: currentRole,
    });
    setShowEditDialog(true);
  };

  const confirmEditUser = async () => {
    if (!pendingEdit) return;

    try {
      const userToUpdate = users.find((u) => u.id === pendingEdit.userId);
      if (!userToUpdate) return;

      console.log("Attempting to update user role:", {
        userId: pendingEdit.userId,
        userEmail: userToUpdate.email,
        currentRole: pendingEdit.currentRole,
        newRole: pendingEdit.newRole,
      });

      const updatedUserFromDB = await updateUserRole(
        userToUpdate.email,
        pendingEdit.newRole
      );

      console.log("Update result:", updatedUserFromDB);

      if (updatedUserFromDB) {
        // Update the user in local state
        setUsers(
          users.map((u) =>
            u.id === pendingEdit.userId
              ? {
                  ...updatedUserFromDB,
                  address: u.address,
                  totalOrders: u.totalOrders,
                  totalAmountPaid: u.totalAmountPaid,
                }
              : u
          )
        );
        toast.success(
          `Role for ${updatedUserFromDB.name} updated to ${pendingEdit.newRole}`
        );
      } else {
        toast.error("Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("An unexpected error occurred while updating the role.");
    }

    setShowEditDialog(false);
    setPendingEdit(null);
  };

  const cancelEditUser = () => {
    setShowEditDialog(false);
    setPendingEdit(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "shop_worker":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "user":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "shop_worker":
        return <LuChefHat className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const filteredUsers = users.filter((user) => {
    const userCity = user.address?.split(",")[0].trim();
    return (
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "all" || user.role === roleFilter) &&
      (genderFilter === "all" || user.gender === genderFilter) &&
      (addressFilter === "all" || userCity === addressFilter)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const genderOptions = [
    "all",
    ...Array.from(
      new Set(
        users
          .map((u) => u.gender)
          .filter((gender): gender is string => Boolean(gender))
      )
    ),
  ];

  const addressOptions = [
    "all",
    ...Array.from(
      new Set(
        users
          .map((u) => u.address)
          .filter((address): address is string => Boolean(address))
      )
    ),
  ];

  // Skeleton components
  const TableSkeleton = () => (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden lg:table-cell">Gender</TableHead>
              <TableHead className="hidden lg:table-cell">Address</TableHead>
              <TableHead className="hidden md:table-cell">
                Total Orders
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Total Amount
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        {/* Page Header Skeleton */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Filters Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-16" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <TableSkeleton />

        {/* Pagination Skeleton */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts and roles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {filteredUsers.length} of {users.length} users
          </span>
          {/* Refresh Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="ml-2"
            onClick={fetchUsers}
            title="Refresh user data"
            aria-label="Refresh user data"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12a7.5 7.5 0 0113.36-4.64m0 0V3.75m0 3.61H15.11m4.39 4.64a7.5 7.5 0 01-13.36 4.64m0 0v3.61m0-3.61h2.75"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="shop_worker">Shop Worker</SelectItem>
                </SelectContent>
              </Select>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by gender" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {genderOptions.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender === "all" ? "All Genders" : gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={addressFilter} onValueChange={setAddressFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by address" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {addressOptions.map((address) => (
                    <SelectItem key={address} value={address}>
                      {address === "all" ? "All Addresses" : address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden lg:table-cell">Gender</TableHead>
                <TableHead className="hidden lg:table-cell">Address</TableHead>
                <TableHead className="hidden md:table-cell">
                  Total Orders
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Total Amount
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback>
                            {(user.name?.charAt(0) || "U").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getRoleColor(
                          user.role
                        )} hover:no-underline hover:bg-opacity-100`}
                      >
                        <span className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.gender || "N/A"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.address || "N/A"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.totalOrders || 0}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      ₹
                      {user.totalAmountPaid
                        ? user.totalAmountPaid.toFixed(2)
                        : "0.00"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            initiateEditUser(
                              user.id,
                              user.name || "User",
                              user.role
                            );
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            initiateDeleteUser(user.id, user.name || "User");
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(currentPage - 1)}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={() => handlePageChange(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {showConfirmDialog && (
        <AlertDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change the role of{" "}
                {pendingRoleChange?.userName} to {pendingRoleChange?.newRole}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelRoleChange}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmRoleChange}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {showDeleteDialog && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the user{" "}
                {pendingDelete?.userName}?
                <br />
                <br />
                To confirm, please type <strong>"delete the user"</strong> in
                the box below:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input
                placeholder="Type 'delete the user' to confirm"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDeleteUser}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteUser}
                disabled={deleteConfirmationText !== "delete the user"}
                className={`${
                  deleteConfirmationText !== "delete the user"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                } bg-blue-600 hover:bg-blue-700 text-white`}
              >
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {showEditDialog && (
        <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit User Role</AlertDialogTitle>
              <AlertDialogDescription>
                Change the role for user:{" "}
                <span className="text-black font-semibold">
                  {pendingEdit?.userName}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Role:</label>
                <Select
                  value={pendingEdit?.newRole}
                  onValueChange={(value: "user" | "admin" | "shop_worker") => {
                    setPendingEdit((prev) =>
                      prev ? { ...prev, newRole: value } : null
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="shop_worker">Shop Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelEditUser}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmEditUser}
                disabled={pendingEdit?.newRole === pendingEdit?.currentRole}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Confirm Change
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
