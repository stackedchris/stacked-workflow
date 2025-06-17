'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  Upload,
  Download,
  Eye,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Target,
  DollarSign,
  TrendingUp,
  Settings,
  Tag,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import AssetUpload from './AssetUpload'
import PhaseManager from './PhaseManager'
import CategoryManager from './CategoryManager'
import { useCategories } from '@/hooks/useCategories'
import { useToast } from '@/components/ui/toast'

export interface Creator {
  id: number
  name: string
  email: string
  phone: string
  category: string
  region: string
  phase: string
  phaseNumber: number
  cardsSold: number
  totalCards: number
  cardPrice: number
  daysInPhase: number
  nextTask: string
  salesVelocity: string
  avatar: string
  bio: string
  socialMedia: {
    instagram?: string
    twitter?: string
    youtube?: string
    tiktok?: string
  }
  assets: {
    profileImages: string[]
    videos: string[]
    pressKit: string[]
  }
  strategy: {
    launchDate?: string
    pricingStructure?: string
    targetAudience?: string
    contentPlan?: string
  }
  stackedProfileUrl?: string
  createdAt: string
  lastUpdated: string
}

interface CreatorManagementProps {
  creators: Creator[]
  onCreatorsUpdate: (creators: Creator[]) => void
  showAddCreator?: boolean
  onAddCreatorClose?: () => void
}

const regions = [
  { value: 'US', label: 'United States (North America)', flag: '🇺🇸' },
  { value: 'Brazil', label: 'Brazil (South America)', flag: '🇧🇷' }
]

const salesVelocityOptions = ['Pending', 'Low', 'Medium', 'High', 'Very High']

const phases = [
  { number: 0, name: 'Phase 0: Strategy Call', color: 'bg-blue-100 text-blue-800' },
  { number: 1, name: 'Phase 1: Drop Prep', color: 'bg-yellow-100 text-yellow-800' },
  { number: 2, name: 'Phase 2: Launch Week', color: 'bg-green-100 text-green-800' },
  { number: 3, name: 'Phase 3: Sell-Out Push', color: 'bg-orange-100 text-orange-800' },
  { number: 4, name: 'Phase 4: Post-Sellout', color: 'bg-purple-100 text-purple-800' }
]

export default function CreatorManagement({
  creators,
  onCreatorsUpdate,
  showAddCreator = false,
  onAddCreatorClose
}: CreatorManagementProps) {
  const { categories, getCategoryNames } = useCategories()
  const { success, error } = useToast()
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(showAddCreator)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Creator>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle showAddCreator prop changes
  useState(() => {
    setIsCreating(showAddCreator)
  })

  const handleCreateCreator = () => {
    if (!editForm.name || !editForm.category) {
      error('Name and category are required')
      return
    }

    const newCreator: Creator = {
      id: Date.now(),
      name: editForm.name || '',
      email: editForm.email || '',
      phone: editForm.phone || '',
      category: editForm.category || '',
      region: editForm.region || 'US',
      phase: 'Phase 0: Strategy Call',
      phaseNumber: 0,
      cardsSold: 0,
      totalCards: 100,
      cardPrice: editForm.cardPrice || 100,
      daysInPhase: 0,
      nextTask: 'Schedule strategy call',
      salesVelocity: 'Pending',
      avatar: editForm.avatar || '👤',
      bio: editForm.bio || '',
      socialMedia: {
        instagram: editForm.socialMedia?.instagram || '',
        twitter: editForm.socialMedia?.twitter || '',
        youtube: editForm.socialMedia?.youtube || '',
        tiktok: editForm.socialMedia?.tiktok || ''
      },
      assets: {
        profileImages: [],
        videos: [],
        pressKit: []
      },
      strategy: {
        launchDate: editForm.strategy?.launchDate || '',
        targetAudience: editForm.strategy?.targetAudience || '',
        contentPlan: editForm.strategy?.contentPlan || ''
      },
      stackedProfileUrl: editForm.stackedProfileUrl || '',
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    onCreatorsUpdate([...creators, newCreator])
    setIsCreating(false)
    setEditForm({})
    onAddCreatorClose?.()
    success('Creator added successfully')
  }

  const handleUpdateCreator = () => {
    if (!selectedCreator || !editForm.name || !editForm.category) {
      error('Name and category are required')
      return
    }

    const updatedCreators = creators.map(creator =>
      creator.id === selectedCreator.id
        ? {
            ...creator,
            ...editForm,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : creator
    )

    onCreatorsUpdate(updatedCreators)
    setSelectedCreator(updatedCreators.find(c => c.id === selectedCreator.id) || null)
    setIsEditing(false)
    success('Creator updated successfully')
  }

  const handleDeleteCreator = (creatorId: number) => {
    const updatedCreators = creators.filter(creator => creator.id !== creatorId)
    onCreatorsUpdate(updatedCreators)
    if (selectedCreator?.id === creatorId) {
      setSelectedCreator(null)
    }
    success('Creator deleted successfully')
  }

  const handlePhaseChange = (creatorId: number, newPhaseNumber: number) => {
    const phase = phases.find(p => p.number === newPhaseNumber)
    if (!phase) return

    const updatedCreators = creators.map(creator =>
      creator.id === creatorId
        ? {
            ...creator,
            phaseNumber: newPhaseNumber,
            phase: phase.name,
            daysInPhase: 0, // Reset days when manually changing phase
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : creator
    )

    onCreatorsUpdate(updatedCreators)
    if (selectedCreator?.id === creatorId) {
      setSelectedCreator(updatedCreators.find(c => c.id === creatorId) || null)
    }
    success(`Creator moved to ${phase.name}`)
  }

  const startEditing = (creator: Creator) => {
    setSelectedCreator(creator)
    setEditForm(creator)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm({})
  }

  const cancelCreating = () => {
    setIsCreating(false)
    setEditForm({})
    onAddCreatorClose?.()
  }

  const handleAssetsUpdate = (assetType: keyof Creator['assets'], assets: string[]) => {
    if (!selectedCreator) return

    const updatedCreator = {
      ...selectedCreator,
      assets: {
        ...selectedCreator.assets,
        [assetType]: assets
      },
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    const updatedCreators = creators.map(creator =>
      creator.id === selectedCreator.id ? updatedCreator : creator
    )

    onCreatorsUpdate(updatedCreators)
    setSelectedCreator(updatedCreator)
    success('Assets updated successfully')
  }

  const getRegionDisplay = (region: string) => {
    const regionData = regions.find(r => r.value === region)
    return regionData ? `${regionData.flag} ${regionData.label}` : region
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName)
    if (!category) return 'bg-gray-100 text-gray-800'
    
    const colorMap: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-800',
      pink: 'bg-pink-100 text-pink-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      teal: 'bg-teal-100 text-teal-800',
      gray: 'bg-gray-100 text-gray-800'
    }
    
    return colorMap[category.color] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Creator Management</h2>
          <p className="text-gray-600">Manage creator profiles, assets, and pipeline progress</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowCategoryManager(true)}>
            <Tag className="w-4 h-4 mr-2" />
            Manage Categories
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Creator
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Creator List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Creators ({creators.length})</CardTitle>
              <CardDescription>Select a creator to view details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {creators.map((creator) => (
                <div
                  key={creator.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCreator?.id === creator.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCreator(creator)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{creator.avatar}</span>
                      <div>
                        <h4 className="font-medium text-sm">{creator.name}</h4>
                        <div className="flex items-center space-x-1">
                          <Badge className={`text-xs ${getCategoryColor(creator.category)}`}>
                            {creator.category}
                          </Badge>
                          <span className="text-xs">
                            {regions.find(r => r.value === creator.region)?.flag}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {creator.cardsSold}/100 cards • ${(creator.cardsSold * creator.cardPrice).toLocaleString()}
                  </div>
                </div>
              ))}
              {creators.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No creators yet</p>
                  <Button size="sm" className="mt-2" onClick={() => setIsCreating(true)}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add First Creator
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Creator Details */}
        <div className="lg:col-span-3">
          {isCreating ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Add New Creator</CardTitle>
                  <Button variant="outline" size="sm" onClick={cancelCreating}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Creator name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Avatar</label>
                    <Input
                      value={editForm.avatar || ''}
                      onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                      placeholder="👤"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <Select
                      value={editForm.category || ''}
                      onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCategoryNames().map((category) => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center space-x-2">
                              <Badge className={`text-xs ${getCategoryColor(category)}`}>
                                {category}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Region</label>
                    <Select
                      value={editForm.region || 'US'}
                      onValueChange={(value) => setEditForm({ ...editForm, region: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.flag} {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="creator@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Price</label>
                    <Input
                      type="number"
                      value={editForm.cardPrice || 100}
                      onChange={(e) => setEditForm({ ...editForm, cardPrice: Number(e.target.value) })}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stacked Profile URL</label>
                    <Input
                      value={editForm.stackedProfileUrl || ''}
                      onChange={(e) => setEditForm({ ...editForm, stackedProfileUrl: e.target.value })}
                      placeholder="https://stacked.com/creator-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <Textarea
                    value={editForm.bio || ''}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Creator bio and description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Instagram</label>
                    <Input
                      value={editForm.socialMedia?.instagram || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialMedia: { ...editForm.socialMedia, instagram: e.target.value }
                      })}
                      placeholder="@username or full URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Twitter</label>
                    <Input
                      value={editForm.socialMedia?.twitter || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialMedia: { ...editForm.socialMedia, twitter: e.target.value }
                      })}
                      placeholder="@username or full URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">YouTube</label>
                    <Input
                      value={editForm.socialMedia?.youtube || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialMedia: { ...editForm.socialMedia, youtube: e.target.value }
                      })}
                      placeholder="@channel or full URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">TikTok</label>
                    <Input
                      value={editForm.socialMedia?.tiktok || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialMedia: { ...editForm.socialMedia, tiktok: e.target.value }
                      })}
                      placeholder="@username or full URL"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button onClick={handleCreateCreator} disabled={!editForm.name || !editForm.category}>
                    <Save className="w-4 h-4 mr-2" />
                    Create Creator
                  </Button>
                  <Button variant="outline" onClick={cancelCreating}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedCreator ? (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-12">
                <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
                <TabsTrigger value="assets" className="text-sm">Assets</TabsTrigger>
                <TabsTrigger value="phases" className="text-sm">Phases</TabsTrigger>
                <TabsTrigger value="strategy" className="text-sm">Strategy</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{selectedCreator.avatar}</span>
                        <div>
                          <CardTitle className="text-2xl">{selectedCreator.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getCategoryColor(selectedCreator.category)}>
                              {selectedCreator.category}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {getRegionDisplay(selectedCreator.region)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {selectedCreator.stackedProfileUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={selectedCreator.stackedProfileUrl} target="_blank" rel="noopener noreferrer">
                              <Globe className="w-4 h-4 mr-2" />
                              View Profile
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => startEditing(selectedCreator)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCreator(selectedCreator.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <Input
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Avatar</label>
                            <Input
                              value={editForm.avatar || ''}
                              onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <Select
                              value={editForm.category || ''}
                              onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getCategoryNames().map((category) => (
                                  <SelectItem key={category} value={category}>
                                    <Badge className={`text-xs ${getCategoryColor(category)}`}>
                                      {category}
                                    </Badge>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Region</label>
                            <Select
                              value={editForm.region || ''}
                              onValueChange={(value) => setEditForm({ ...editForm, region: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {regions.map((region) => (
                                  <SelectItem key={region.value} value={region.value}>
                                    {region.flag} {region.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <Input
                              type="email"
                              value={editForm.email || ''}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            <Input
                              value={editForm.phone || ''}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Card Price</label>
                            <Input
                              type="number"
                              value={editForm.cardPrice || 0}
                              onChange={(e) => setEditForm({ ...editForm, cardPrice: Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Sales Velocity</label>
                            <Select
                              value={editForm.salesVelocity || ''}
                              onValueChange={(value) => setEditForm({ ...editForm, salesVelocity: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {salesVelocityOptions.map((velocity) => (
                                  <SelectItem key={velocity} value={velocity}>
                                    {velocity}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Cards Sold</label>
                            <Input
                              type="number"
                              value={editForm.cardsSold || 0}
                              onChange={(e) => setEditForm({ ...editForm, cardsSold: Number(e.target.value) })}
                              max={editForm.totalCards || 100}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Current Phase</label>
                            <Select
                              value={editForm.phaseNumber?.toString() || ''}
                              onValueChange={(value) => {
                                const phaseNumber = Number(value)
                                const phase = phases.find(p => p.number === phaseNumber)
                                if (phase) {
                                  setEditForm({ 
                                    ...editForm, 
                                    phaseNumber,
                                    phase: phase.name,
                                    daysInPhase: 0 // Reset days when changing phase
                                  })
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {phases.map((phase) => (
                                  <SelectItem key={phase.number} value={phase.number.toString()}>
                                    <div className="flex items-center space-x-2">
                                      <Badge className={phase.color}>
                                        {phase.name}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Stacked Profile URL</label>
                            <Input
                              value={editForm.stackedProfileUrl || ''}
                              onChange={(e) => setEditForm({ ...editForm, stackedProfileUrl: e.target.value })}
                              placeholder="https://stacked.com/creator-name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Bio</label>
                          <Textarea
                            value={editForm.bio || ''}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Instagram</label>
                            <Input
                              value={editForm.socialMedia?.instagram || ''}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                socialMedia: { ...editForm.socialMedia, instagram: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Twitter</label>
                            <Input
                              value={editForm.socialMedia?.twitter || ''}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                socialMedia: { ...editForm.socialMedia, twitter: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">YouTube</label>
                            <Input
                              value={editForm.socialMedia?.youtube || ''}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                socialMedia: { ...editForm.socialMedia, youtube: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">TikTok</label>
                            <Input
                              value={editForm.socialMedia?.tiktok || ''}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                socialMedia: { ...editForm.socialMedia, tiktok: e.target.value }
                              })}
                            />
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button onClick={handleUpdateCreator}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <Target className="w-5 h-5 text-blue-600 mr-2" />
                              <span className="text-sm font-medium">Cards Sold</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600 mt-1">
                              {selectedCreator.cardsSold}/{selectedCreator.totalCards}
                            </p>
                            <p className="text-xs text-blue-600">
                              {Math.round((selectedCreator.cardsSold / selectedCreator.totalCards) * 100)}% complete
                            </p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                              <span className="text-sm font-medium">Revenue</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                              ${(selectedCreator.cardsSold * selectedCreator.cardPrice).toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600">${selectedCreator.cardPrice} per card</p>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
                              <span className="text-sm font-medium">Velocity</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-600 mt-1">{selectedCreator.salesVelocity}</p>
                            <p className="text-xs text-orange-600">Sales performance</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                              <span className="text-sm font-medium">Phase</span>
                            </div>
                            <p className="text-lg font-bold text-purple-600 mt-1">{selectedCreator.phaseNumber}</p>
                            <p className="text-xs text-purple-600">{selectedCreator.daysInPhase} days</p>
                          </div>
                        </div>

                        {/* Phase Management */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Phase Management</h3>
                          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge className={phases.find(p => p.number === selectedCreator.phaseNumber)?.color}>
                                  {selectedCreator.phase}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  Day {selectedCreator.daysInPhase}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Next task: {selectedCreator.nextTask}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePhaseChange(selectedCreator.id, Math.max(0, selectedCreator.phaseNumber - 1))}
                                disabled={selectedCreator.phaseNumber === 0}
                                title="Move to previous phase"
                              >
                                <ArrowUp className="w-4 h-4" />
                                Previous
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePhaseChange(selectedCreator.id, Math.min(4, selectedCreator.phaseNumber + 1))}
                                disabled={selectedCreator.phaseNumber === 4}
                                title="Move to next phase"
                              >
                                Next
                                <ArrowDown className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{selectedCreator.email || 'No email provided'}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{selectedCreator.phone || 'No phone provided'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        {selectedCreator.bio && (
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Bio</h3>
                            <p className="text-gray-700">{selectedCreator.bio}</p>
                          </div>
                        )}

                        {/* Social Media */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Social Media</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {selectedCreator.socialMedia.instagram && (
                              <a
                                href={selectedCreator.socialMedia.instagram.startsWith('http') 
                                  ? selectedCreator.socialMedia.instagram 
                                  : `https://instagram.com/${selectedCreator.socialMedia.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                              >
                                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded" />
                                <span className="text-sm">Instagram</span>
                              </a>
                            )}
                            {selectedCreator.socialMedia.twitter && (
                              <a
                                href={selectedCreator.socialMedia.twitter.startsWith('http') 
                                  ? selectedCreator.socialMedia.twitter 
                                  : `https://twitter.com/${selectedCreator.socialMedia.twitter.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                              >
                                <div className="w-4 h-4 bg-blue-500 rounded" />
                                <span className="text-sm">Twitter</span>
                              </a>
                            )}
                            {selectedCreator.socialMedia.youtube && (
                              <a
                                href={selectedCreator.socialMedia.youtube.startsWith('http') 
                                  ? selectedCreator.socialMedia.youtube 
                                  : `https://youtube.com/${selectedCreator.socialMedia.youtube.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                              >
                                <div className="w-4 h-4 bg-red-500 rounded" />
                                <span className="text-sm">YouTube</span>
                              </a>
                            )}
                            {selectedCreator.socialMedia.tiktok && (
                              <a
                                href={selectedCreator.socialMedia.tiktok.startsWith('http') 
                                  ? selectedCreator.socialMedia.tiktok 
                                  : `https://tiktok.com/@${selectedCreator.socialMedia.tiktok.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                              >
                                <div className="w-4 h-4 bg-black rounded" />
                                <span className="text-sm">TikTok</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Current Task */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Current Task</h3>
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="font-medium">{selectedCreator.nextTask}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedCreator.phase} • Day {selectedCreator.daysInPhase}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assets">
                <div className="space-y-6">
                  <AssetUpload
                    creatorId={selectedCreator.id}
                    assetType="profileImages"
                    existingAssets={selectedCreator.assets.profileImages}
                    onAssetsUpdate={(assets) => handleAssetsUpdate('profileImages', assets)}
                  />
                  <AssetUpload
                    creatorId={selectedCreator.id}
                    assetType="videos"
                    existingAssets={selectedCreator.assets.videos}
                    onAssetsUpdate={(assets) => handleAssetsUpdate('videos', assets)}
                  />
                  <AssetUpload
                    creatorId={selectedCreator.id}
                    assetType="pressKit"
                    existingAssets={selectedCreator.assets.pressKit}
                    onAssetsUpdate={(assets) => handleAssetsUpdate('pressKit', assets)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="phases">
                <PhaseManager
                  creatorId={selectedCreator.id}
                  creatorName={selectedCreator.name}
                  currentPhase={selectedCreator.phaseNumber}
                  onPhaseUpdate={(phases) => {
                    // Handle phase updates if needed
                    console.log('Phase updated:', phases)
                  }}
                />
              </TabsContent>

              <TabsContent value="strategy">
                <Card>
                  <CardHeader>
                    <CardTitle>Strategy & Planning</CardTitle>
                    <CardDescription>Launch strategy and planning details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Launch Date</label>
                      <Input
                        type="date"
                        value={selectedCreator.strategy.launchDate || ''}
                        onChange={(e) => {
                          const updatedCreator = {
                            ...selectedCreator,
                            strategy: { ...selectedCreator.strategy, launchDate: e.target.value }
                          }
                          const updatedCreators = creators.map(c => c.id === selectedCreator.id ? updatedCreator : c)
                          onCreatorsUpdate(updatedCreators)
                          setSelectedCreator(updatedCreator)
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Audience</label>
                      <Textarea
                        value={selectedCreator.strategy.targetAudience || ''}
                        onChange={(e) => {
                          const updatedCreator = {
                            ...selectedCreator,
                            strategy: { ...selectedCreator.strategy, targetAudience: e.target.value }
                          }
                          const updatedCreators = creators.map(c => c.id === selectedCreator.id ? updatedCreator : c)
                          onCreatorsUpdate(updatedCreators)
                          setSelectedCreator(updatedCreator)
                        }}
                        placeholder="Describe the target audience for this creator"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Content Plan</label>
                      <Textarea
                        value={selectedCreator.strategy.contentPlan || ''}
                        onChange={(e) => {
                          const updatedCreator = {
                            ...selectedCreator,
                            strategy: { ...selectedCreator.strategy, contentPlan: e.target.value }
                          }
                          const updatedCreators = creators.map(c => c.id === selectedCreator.id ? updatedCreator : c)
                          onCreatorsUpdate(updatedCreators)
                          setSelectedCreator(updatedCreator)
                        }}
                        placeholder="Outline the content strategy and plan"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a creator to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Category Manager Modal */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />
    </div>
  )
}