"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, MapPin, Camera, Star, DollarSign, Clock } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"


const categories = [
  "beach",
  "historical", 
  "cultural",
  "religious",
  "suburb",
  "urban park"
]

export function CreatePlaceModal({ isOpen, onClose, onPlaceCreated }) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name_eng: "",
    name_som: "",
    desc_eng: "",
    desc_som: "",
    location: "",
    category: "",
    pricePerPerson: "",
    maxCapacity: "",
    availableDates: []
  })

  const [dragActive, setDragActive] = useState(false)
  const [images, setImages] = useState([])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files) => {
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }))

    setImages((prev) => [...prev, ...newImages])
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      
      // Add text fields
      formDataToSend.append('name_eng', formData.name_eng)
      formDataToSend.append('name_som', formData.name_som)
      formDataToSend.append('desc_eng', formData.desc_eng)
      formDataToSend.append('desc_som', formData.desc_som)
      formDataToSend.append('location', formData.location)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('pricePerPerson', formData.pricePerPerson || '5')
      formDataToSend.append('maxCapacity', formData.maxCapacity || '10')
      
      // Add images if any
      if (images.length > 0) {
        images.forEach((image, index) => {
          formDataToSend.append('images', image.file)
        })
      }

      // Send to API
      const createdPlace = await apiService.createPlace(formDataToSend)
      
      toast({
        title: "Success!",
        description: `Place "${createdPlace.name_eng}" created successfully!`,
      })

      // Reset form
      setFormData({
        name_eng: "",
        name_som: "",
        desc_eng: "",
        desc_som: "",
        location: "",
        category: "",
        pricePerPerson: "",
        maxCapacity: "",
        availableDates: []
      })
      setImages([])
      
      // Notify parent component
      if (onPlaceCreated) {
        onPlaceCreated(createdPlace)
      }
      
      onClose()
    } catch (error) {
      console.error('Error creating place:', error)
      toast({
        title: "Error",
        description: "Failed to create place. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Create New Place
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_eng">Place Name (English) *</Label>
                  <Input
                    id="name_eng"
                    value={formData.name_eng}
                    onChange={(e) => handleInputChange("name_eng", e.target.value)}
                    placeholder="e.g., Lido Beach"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_som">Place Name (Somali) *</Label>
                  <Input
                    id="name_som"
                    value={formData.name_som}
                    onChange={(e) => handleInputChange("name_som", e.target.value)}
                    placeholder="e.g., Jaziira Liido"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., Mogadishu, Somalia"
                    required
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="desc_eng">Description (English) *</Label>
                  <Textarea
                    id="desc_eng"
                    value={formData.desc_eng}
                    onChange={(e) => handleInputChange("desc_eng", e.target.value)}
                    placeholder="Describe the place in English..."
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="desc_som">Description (Somali) *</Label>
                  <Textarea
                    id="desc_som"
                    value={formData.desc_som}
                    onChange={(e) => handleInputChange("desc_som", e.target.value)}
                    placeholder="Describe the place in Somali..."
                    rows={4}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing and Capacity */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Pricing & Capacity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricePerPerson">Price Per Person (USD) *</Label>
                  <Input
                    id="pricePerPerson"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerPerson}
                    onChange={(e) => handleInputChange("pricePerPerson", e.target.value)}
                    placeholder="e.g., 5.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxCapacity">Maximum Capacity</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    min="1"
                    value={formData.maxCapacity}
                    onChange={(e) => handleInputChange("maxCapacity", e.target.value)}
                    placeholder="e.g., 50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-600" />
                Images
              </h3>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Drag and drop images here, or click to select</p>
                <p className="text-sm text-gray-500 mb-4">Support for JPG, PNG, WebP files up to 5MB each</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
                <Button type="button" variant="outline" onClick={() => document.getElementById("image-upload").click()}>
                  Select Images
                </Button>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Uploaded Images ({images.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
            >
              {isSubmitting ? "Creating..." : "Create Place"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
