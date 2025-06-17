'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  Tag,
  Palette
} from 'lucide-react'
import { useCategories, type CreatorCategory } from '@/hooks/useCategories'
import { useToast } from '@/components/ui/toast'

const colorOptions = [
  { name: 'Purple', value: 'purple', class: 'bg-purple-100 text-purple-800' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-100 text-pink-800' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-100 text-blue-800' },
  { name: 'Green', value: 'green', class: 'bg-green-100 text-green-800' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-100 text-yellow-800' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-100 text-orange-800' },
  { name: 'Red', value: 'red', class: 'bg-red-100 text-red-800' },
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-100 text-indigo-800' },
  { name: 'Teal', value: 'teal', class: 'bg-teal-100 text-teal-800' },
  { name: 'Gray', value: 'gray', class: 'bg-gray-100 text-gray-800' }
]

interface CategoryManagerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories()
  const { success, error } = useToast()
  const [editingCategory, setEditingCategory] = useState<CreatorCategory | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    color: 'blue',
    description: ''
  })

  const handleSave = () => {
    if (!formData.name.trim()) {
      error('Category name is required')
      return
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, formData)
      success('Category updated')
      setEditingCategory(null)
    } else {
      addCategory(formData)
      success('Category created')
      setIsCreating(false)
    }

    setFormData({ name: '', color: 'blue', description: '' })
  }

  const handleEdit = (category: CreatorCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      description: category.description || ''
    })
    setIsCreating(true)
  }

  const handleDelete = (category: CreatorCategory) => {
    deleteCategory(category.id)
    success('Category deleted')
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingCategory(null)
    setFormData({ name: '', color: 'blue', description: '' })
  }

  const getColorClass = (color: string) => {
    const colorOption = colorOptions.find(opt => opt.value === color)
    return colorOption?.class || 'bg-gray-100 text-gray-800'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Manage Creator Categories
              </CardTitle>
              <CardDescription>
                Add, edit, or remove creator categories. Changes apply across the entire platform.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create/Edit Form */}
          {isCreating && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${color.class.split(' ')[0]}`} />
                            <span>{color.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description for this category"
                    rows={2}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button onClick={handleSave} disabled={!formData.name.trim()}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add New Button */}
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Category
            </Button>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Current Categories ({categories.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getColorClass(category.color)}>
                          {category.name}
                        </Badge>
                        <div className={`w-3 h-3 rounded-full bg-${category.color}-500`} />
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600">{category.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(category.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Usage Info */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Category Usage</h4>
              <p className="text-sm text-gray-600">
                Categories are used throughout the platform in:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Creator profiles and management</li>
                <li>• Custom strategy creation and filtering</li>
                <li>• Analytics and reporting</li>
                <li>• Content management and assignment</li>
                <li>• Airtable and Notion integrations</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}