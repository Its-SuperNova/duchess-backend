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
import { Input } from "@/components/ui/input";
import { Search, Users, Shield, User, UserCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as UserType } from "@/lib/supabase";
import { updateUserRole } from "@/lib/auth-utils";
import { toast } from "sonner";
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

type UserWithAddress = UserType & { address: string | null };

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [addressFilter, setAddressFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

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

      const combinedUsers = usersData.map((user) => {
        const address = addressesData?.find((addr) => addr.user_id === user.id);
        return {
          ...user,
          address: address ? `${address.city}, ${address.state}` : null,
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
    newRole: "user" | "admin" | "moderator"
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "moderator":
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
      case "moderator":
        return <UserCheck className="h-4 w-4" />;
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
    ...Array.from(new Set(users.map((u) => u.gender).filter(Boolean))),
  ];

  const addressOptions = [
    "all",
    ...Array.from(
      new Set(users.map((u) => u.address?.split(",")[0].trim()).filter(Boolean))
    ),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        </div>
      </div>

      {/* Filters */}
      <Card>
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
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by gender" />
                </SelectTrigger>
                <SelectContent>
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
                <SelectContent>
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
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Provider</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="hidden lg:table-cell">Gender</TableHead>
                <TableHead className="hidden lg:table-cell">Address</TableHead>
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
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        <span className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.provider}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.gender || "N/A"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.address || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(
                          value: "user" | "admin" | "moderator"
                        ) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
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
    </div>
  );
}
