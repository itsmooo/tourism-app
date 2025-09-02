"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
} from "lucide-react";
import { CreatePlaceModal } from "@/components/create-place-modal";
import { apiService } from "@/lib/api-service";
import toast, { Toaster } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";

export function DestinationsSection() {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // View and Edit modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPlace, setViewingPlace] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name_eng: '',
    name_som: '',
    desc_eng: '',
    desc_som: '',
    location: '',
    category: '',
    pricePerPerson: '',
    maxCapacity: ''
  });

  const categories = [
    "all",
    "beach",
    "historical",
    "cultural",
    "religious",
    "suburb",
    "urban park",
  ];

  // Fetch places from API
  const fetchPlaces = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAllPlaces();
      // Handle both direct array and wrapped response
      const placesData = Array.isArray(response)
        ? response
        : response?.data || [];
      setPlaces(placesData);
      setFilteredPlaces(placesData);
      
      // Show success toast if this was a manual refresh
      if (!isLoading) {
        toast.success(`Refreshed places list (${placesData.length} places found)`);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      toast.error("Failed to fetch places. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter places based on search and category
  const filterPlaces = () => {
    let filtered = places;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (place) => place.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (place) =>
          place.name_eng.toLowerCase().includes(query) ||
          place.name_som.toLowerCase().includes(query) ||
          place.location.toLowerCase().includes(query) ||
          place.category.toLowerCase().includes(query)
      );
    }

    setFilteredPlaces(filtered);
  };

  // Handle place creation
  const handlePlaceCreated = (newPlace) => {
    setPlaces((prev) => [newPlace, ...prev]);
    filterPlaces();
    toast.success(`Place "${newPlace.name_eng}" has been added to the list.`);
  };

  // Handle place deletion
  const handleDeletePlace = async (placeId, placeName) => {
    if (window.confirm(`Are you sure you want to delete "${placeName}"?`)) {
      try {
        const loadingToast = toast.loading('Deleting place...');
        await apiService.deletePlace(placeId);
        toast.dismiss(loadingToast);
        setPlaces((prev) => prev.filter((place) => place._id !== placeId));
        filterPlaces();
        toast.success(`Place "${placeName}" has been deleted.`);
      } catch (error) {
        console.error("Error deleting place:", error);
        toast.error("Failed to delete place. Please try again.");
      }
    }
  };

  // Handle viewing place details
  const handleViewPlace = (place) => {
    setViewingPlace(place);
    setIsViewModalOpen(true);
  };

  // Handle editing place
  const handleEditPlace = (place) => {
    setEditingPlace(place);
    setEditForm({
      name_eng: place.name_eng || '',
      name_som: place.name_som || '',
      desc_eng: place.desc_eng || '',
      desc_som: place.desc_som || '',
      location: place.location || '',
      category: place.category || '',
      pricePerPerson: place.pricePerPerson || '',
      maxCapacity: place.maxCapacity || ''
    });
    setIsEditModalOpen(true);
  };

  // Handle form changes
  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle updating place
  const handleUpdatePlace = async () => {
    try {
      setIsUpdating(true);
      const loadingToast = toast.loading('Updating place...');
      
      // Create FormData for the update
      const formData = new FormData();
      formData.append('name_eng', editForm.name_eng);
      formData.append('name_som', editForm.name_som);
      formData.append('desc_eng', editForm.desc_eng);
      formData.append('desc_som', editForm.desc_som);
      formData.append('location', editForm.location);
      formData.append('category', editForm.category);
      formData.append('pricePerPerson', editForm.pricePerPerson);
      formData.append('maxCapacity', editForm.maxCapacity);

      const updatedPlace = await apiService.updatePlace(editingPlace._id, formData);
      
      toast.dismiss(loadingToast);
      toast.success(`Place "${editForm.name_eng}" has been updated.`);
      
      // Update the places list
      setPlaces(prev => prev.map(place => 
        place._id === editingPlace._id ? updatedPlace : place
      ));
      filterPlaces();
      
      closeEditModal();
    } catch (error) {
      console.error("Error updating place:", error);
      toast.error("Failed to update place. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPlace(null);
    setEditForm({
      name_eng: '',
      name_som: '',
      desc_eng: '',
      desc_som: '',
      location: '',
      category: '',
      pricePerPerson: '',
      maxCapacity: ''
    });
  };

  // Effect to fetch places on component mount
  useEffect(() => {
    fetchPlaces();
  }, []);

  // Effect to filter places when search or category changes
  useEffect(() => {
    filterPlaces();
  }, [searchQuery, selectedCategory, places]);

  const getCategoryColor = (category) => {
    const colors = {
      beach: "bg-blue-100 text-blue-800",
      historical: "bg-amber-100 text-amber-800",
      cultural: "bg-purple-100 text-purple-800",
      religious: "bg-green-100 text-green-800",
      suburb: "bg-gray-100 text-gray-800",
      "urban park": "bg-emerald-100 text-emerald-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to construct proper image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, use it
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it starts with /uploads, construct the full URL
    if (imagePath.startsWith('/uploads')) {
      return `http://localhost:9000${imagePath}`;
    }
    
    // If it's just a filename (from seed data), add the uploads path
    return `http://localhost:9000/uploads/${imagePath}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Destinations</h2>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Place
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Destinations</h2>
          <p className="text-muted-foreground">
            Manage and view all tourist destinations
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchPlaces}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Place
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search places by name, location, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Places Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlaces.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || selectedCategory !== "all"
                ? "No places found"
                : "No places yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or category filter."
                : "Get started by adding your first tourist destination."}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Place
              </Button>
            )}
          </div>
        ) : (
          filteredPlaces.map((place) => (
            <Card
              key={place._id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
                              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {place.image_path ? (
                    <img
                      src={getImageUrl(place.image_path)}
                      alt={place.name_eng}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', place.image_path, 'URL:', getImageUrl(place.image_path));
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <Badge
                    className={`absolute top-2 right-2 ${getCategoryColor(
                      place.category
                    )}`}
                  >
                    {place.category}
                  </Badge>
                </div>

              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {place.name_eng}
                    </h3>
                    <p className="text-sm text-gray-600">{place.name_som}</p>
                  </div>

                  <p className="text-gray-700 text-sm line-clamp-2">
                    {place.desc_eng}
                  </p>

                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {place.location}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-green-600">
                      <DollarSign className="h-4 w-4 mr-1" />$
                      {place.pricePerPerson}
                    </div>
                    <div className="flex items-center text-blue-600">
                      <Users className="h-4 w-4 mr-1" />
                      {place.maxCapacity}
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    Added {formatDate(place.createdAt)}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewPlace(place)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditPlace(place)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePlace(place._id, place.name_eng)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Place Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Place Details</DialogTitle>
            <DialogDescription>
              View detailed information about this place.
            </DialogDescription>
          </DialogHeader>
          {viewingPlace && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Place ID</Label>
                  <p className="text-gray-900 font-mono text-sm">{viewingPlace._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Category</Label>
                  <Badge className={getCategoryColor(viewingPlace.category)}>
                    {viewingPlace.category}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">English Name</Label>
                  <p className="text-gray-900">{viewingPlace.name_eng}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Somali Name</Label>
                  <p className="text-gray-900">{viewingPlace.name_som}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Location</Label>
                <p className="text-gray-900">{viewingPlace.location}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">English Description</Label>
                <p className="text-gray-900 text-sm">{viewingPlace.desc_eng}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Somali Description</Label>
                <p className="text-gray-900 text-sm">{viewingPlace.desc_som}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Price per Person</Label>
                  <p className="text-gray-900">${viewingPlace.pricePerPerson}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Max Capacity</Label>
                  <p className="text-gray-900">{viewingPlace.maxCapacity} people</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <p className="text-gray-900 text-sm">{formatDate(viewingPlace.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p className="text-gray-900 text-sm">{formatDate(viewingPlace.updatedAt)}</p>
                </div>
              </div>

              {viewingPlace.image_path && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Image</Label>
                  <div className="mt-2">
                    <img
                      src={getImageUrl(viewingPlace.image_path)}
                      alt={viewingPlace.name_eng}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewModalOpen(false);
                handleEditPlace(viewingPlace);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Place
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Place Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Place</DialogTitle>
            <DialogDescription>
              Update the information for this place.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name_eng">English Name</Label>
                <Input
                  id="name_eng"
                  value={editForm.name_eng}
                  onChange={(e) => handleFormChange('name_eng', e.target.value)}
                  placeholder="Enter English name"
                />
              </div>
              <div>
                <Label htmlFor="name_som">Somali Name</Label>
                <Input
                  id="name_som"
                  value={editForm.name_som}
                  onChange={(e) => handleFormChange('name_som', e.target.value)}
                  placeholder="Enter Somali name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                placeholder="Enter location"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={editForm.category} onValueChange={(value) => handleFormChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat !== 'all').map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricePerPerson">Price per Person ($)</Label>
                <Input
                  id="pricePerPerson"
                  type="number"
                  value={editForm.pricePerPerson}
                  onChange={(e) => handleFormChange('pricePerPerson', e.target.value)}
                  placeholder="Enter price"
                />
              </div>
              <div>
                <Label htmlFor="maxCapacity">Max Capacity</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  value={editForm.maxCapacity}
                  onChange={(e) => handleFormChange('maxCapacity', e.target.value)}
                  placeholder="Enter capacity"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="desc_eng">English Description</Label>
              <textarea
                id="desc_eng"
                value={editForm.desc_eng}
                onChange={(e) => handleFormChange('desc_eng', e.target.value)}
                placeholder="Enter English description"
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="desc_som">Somali Description</Label>
              <textarea
                id="desc_som"
                value={editForm.desc_som}
                onChange={(e) => handleFormChange('desc_som', e.target.value)}
                placeholder="Enter Somali description"
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal} disabled={isUpdating}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUpdatePlace} disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Updating...' : 'Update Place'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Place Modal */}
      <CreatePlaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlaceCreated={handlePlaceCreated}
      />

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
  );
}
