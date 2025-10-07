"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Users, UserCheck, UserX, Loader2, Save, X } from "lucide-react"
import { apiService } from "@/lib/api-service"
import toast, { Toaster } from "react-hot-toast"
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
import { useAuth } from "@/contexts/auth-context"

// Sample data for stats (will be calculated from real users)
const getStatsFromUsers = (users) => {
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'active').length;
  const inactiveUsers = totalUsers - activeUsers;
  
  return [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Users",
      value: activeUsers.toString(),
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Inactive Users",
      value: inactiveUsers.toString(),
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];
};

// This will be replaced with dynamic stats

export function TouristsSection() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilteringActive, setIsFilteringActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'tourist',
    isActive: true,
  });
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'tourist'
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAllUsers();
      const usersData = Array.isArray(response) ? response : response?.data || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
      
      // Show success toast if this was a manual refresh
      if (!isLoading) {
        toast.success(`Refreshed users list (${usersData.length} users found)`);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch active users only
  const fetchActiveUsers = async () => {
    try {
      setIsLoading(true);
      const activeOnly = await apiService.getActiveUsers();
      const usersData = Array.isArray(activeOnly) ? activeOnly : activeOnly?.data || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
      setIsFilteringActive(true);
      if (!isLoading) {
        toast.success(`Showing active users (${usersData.length})`);
      }
    } catch (error) {
      console.error("Error fetching active users:", error);
      toast.error("Failed to fetch active users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search
  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Effect to fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Effect to filter users when search changes
  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  // Get dynamic stats from users
  const stats = getStatsFromUsers(users);

  // Handle user deletion
  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        // Show loading toast
        const loadingToast = toast.loading('Deleting user...');
        
        await apiService.deleteUser(userId);
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        setUsers((prev) => prev.filter((user) => user._id !== userId));
        toast.success(`User "${username}" has been deleted.`);
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user. Please try again.");
      }
    }
  };

  // Handle view user
  const handleViewUser = (user) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      full_name: user.full_name || '',
      role: user.role || 'tourist',
      isActive: typeof user.isActive === 'boolean' ? user.isActive : true,
    });
    setIsEditModalOpen(true);
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

    // Handle form submission
  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setIsUpdating(true);
      
      // Show loading toast
      const loadingToast = toast.loading('Updating user...');
      
      const updatedUser = await apiService.updateUser(editingUser._id, editForm);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      
      // Update the user in the local state
      setUsers(prev => prev.map(user => 
        user._id === editingUser._id ? { ...user, ...updatedUser } : user
      ));
      
      toast.success(`User "${editForm.username}" has been updated.`);
      
      setIsEditModalOpen(false);
      setEditingUser(null);
      setEditForm({
        username: '',
        email: '',
        full_name: '',
        role: 'tourist'
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditForm({
      username: '',
      email: '',
      full_name: '',
      role: 'tourist',
      isActive: true,
    });
  };

  // Handle create user
  const handleCreateUser = () => {
    setCreateForm({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'tourist'
    });
    setIsCreateModalOpen(true);
  };

  // Handle create form submission
  const handleCreateUserSubmit = async () => {
    try {
      setIsCreating(true);
      
      // Validate required fields
      if (!createForm.username || !createForm.email || !createForm.password) {
        toast.error("Username, email, and password are required.");
        return;
      }
      
      // Show loading toast
      const loadingToast = toast.loading('Creating user...');
      
      // Create user via API
      const newUser = await apiService.createUser(createForm);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`User "${createForm.username}" has been created.`);
      
      setIsCreateModalOpen(false);
      setCreateForm({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'tourist'
      });
      
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Close create modal
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateForm({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'tourist'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor user accounts</p>
        </div>
        <div className="flex gap-2">
          {/* Quick filters */}
          <Button 
            variant={isFilteringActive ? "secondary" : "outline"}
            onClick={() => { setIsFilteringActive(false); fetchUsers(); }}
            disabled={isLoading}
          >
            All Users
          </Button>
          <Button 
            variant={isFilteringActive ? "outline" : "secondary"}
            onClick={fetchActiveUsers}
            disabled={isLoading}
          >
            Active Only
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <Loader2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isAdmin() && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-blue-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>User Directory</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No users found" : "No users yet"}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? "Try adjusting your search." : "Users will appear here once they register."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-blue-600 text-white">
                            {user.username
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || user.username?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{user.username || "Unknown User"}</p>
                          <p className="text-sm text-gray-500">{user._id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900">{user.email || "No email"}</p>
                        <p className="text-sm text-gray-500">No phone</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          user.role === 'admin' 
                            ? "border-red-200 text-red-700 bg-red-50" 
                            : "border-blue-200 text-blue-700 bg-blue-50"
                        }
                      >
                        {user.role || 'tourist'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={
                          user.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {user.isActive ? 'active' : 'inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewUser(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {isAdmin() && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user._id, user.username || 'Unknown User')}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. Fill in the required information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-username" className="text-right">
                Username *
              </Label>
              <Input
                id="create-username"
                value={createForm.username}
                onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                className="col-span-3"
                placeholder="Enter username"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-email" className="text-right">
                Email *
              </Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                className="col-span-3"
                placeholder="Enter email"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-password" className="text-right">
                Password *
              </Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                className="col-span-3"
                placeholder="Enter password"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-full-name" className="text-right">
                Full Name
              </Label>
              <Input
                id="create-full-name"
                value={createForm.full_name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, full_name: e.target.value }))}
                className="col-span-3"
                placeholder="Enter full name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-role" className="text-right">
                Role
              </Label>
              <Select
                value={createForm.role}
                onValueChange={(value) => setCreateForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourist">Tourist</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="co-worker">Co-Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCreateModal} disabled={isCreating}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleCreateUserSubmit} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View detailed information about this user.
            </DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    {viewingUser.username
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || viewingUser.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {viewingUser.full_name || viewingUser.username || "Unknown User"}
                  </h3>
                  <p className="text-gray-600">{viewingUser.email || "No email"}</p>
                  <Badge 
                    variant="outline" 
                    className={
                      viewingUser.role === 'admin' 
                        ? "border-red-200 text-red-700 bg-red-50" 
                        : "border-blue-200 text-blue-700 bg-blue-50"
                    }
                  >
                    {viewingUser.role || 'tourist'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Username</Label>
                  <p className="text-gray-900">{viewingUser.username || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-gray-900">{viewingUser.email || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                  <p className="text-gray-900">{viewingUser.full_name || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Role</Label>
                  <p className="text-gray-900 capitalize">{viewingUser.role || "tourist"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">User ID</Label>
                  <p className="text-gray-900 font-mono text-sm">{viewingUser._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Join Date</Label>
                  <p className="text-gray-900">
                    {viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            {isAdmin() && (
              <Button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditUser(viewingUser);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={editForm.username}
                onChange={(e) => handleFormChange('username', e.target.value)}
                className="col-span-3"
                placeholder="Enter username"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                className="col-span-3"
                placeholder="Enter email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => handleFormChange('full_name', e.target.value)}
                className="col-span-3"
                placeholder="Enter full name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => handleFormChange('role', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourist">Tourist</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="co-worker">Co-Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Active</Label>
              <div className="col-span-3">
                <Switch
                  checked={!!editForm.isActive}
                  onCheckedChange={(val) => handleFormChange('isActive', !!val)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal} disabled={isUpdating}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
                 </DialogContent>
       </Dialog>

       {/* React Hot Toast Container */}
       <Toaster
         position="top-right"
         toastOptions={{
           duration: 4000,
           style: {
             background: '#363636',
             color: '#fff',
           },
           success: {
             duration: 3000,
             iconTheme: {
               primary: '#10B981',
               secondary: '#fff',
             },
           },
           error: {
             duration: 4000,
             iconTheme: {
               primary: '#EF4444',
               secondary: '#fff',
             },
           },
         }}
       />
     </div>
   )
 }
