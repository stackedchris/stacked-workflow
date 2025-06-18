'use client'

import { useState, useEffect } from 'react'
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
  User,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Youtube,
  MessageSquare,
  Calendar,
  DollarSign,
  Tag,
  Settings
} from 'lucide-react'
import { TikTokIcon, InstagramIcon, TwitterIcon, YouTubeIcon } from '@/components/ui/icons'
import { useCategories } from '@/hooks/useCategories'
import PhaseManager from '@/components/PhaseManager'
import ProfilePictureUpload from '@/components/ProfilePictureUpload'
import AssetUpload from '@/components/AssetUpload'
import CategoryManager from '@/components/CategoryManager'
import { useToast } from '@/components/ui/toast'
import { syncService } from '@/lib/sync-service'

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
    targetAudience?: string
    contentPlan?: string
  }
  createdAt: string
  lastUpdated: string
}

interface CreatorManagementProps {
  creators?: Creator[]
  onCreatorsUpdate?: (creators: Creator[]) => void
  showAddCreator?: boolean
  onAddCreatorClose?: () => void
}

const defaultCreator: Omit<Creator, 'id' | 'createdAt' | 'lastUpdated'> = {
  name: '',
  email: '',
  phone: '',
  category: 'Gaming',
  region: 'US',
  phase: 'Phase 0: Strategy Call',
  phaseNumber: 0,
  cardsSold: 0,
  totalCards: 100,
  cardPrice: 100,
  daysInPhase: 0,
  nextTask: 'Schedule strategy call',
  salesVelocity: 'Pending',
  avatar: '👤',
  bio: '',
  socialMedia: {
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: ''
  },
  assets: {
    profileImages: [],
    videos: [],
    pressKit: []
  },
  strategy: {
    launchDate: '',
    targetAudience: '',
    contentPlan: ''
  }
}

const regions = [
  { value: 'US', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Japan', label: 'Japan' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Mexico', label: 'Mexico' }
]

const velocities = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
  { value: 'Pending', label: 'Pending' }
]

export default function CreatorManagement({ 
  creators = [], 
  onCreatorsUpdate,
  showAddCreator = false,
  onAddCreatorClose
}: CreatorManagementProps) {
  // Ensure creators is always an array
  const safeCreators = Array.isArray(creators) ? creators : [];
  
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(showAddCreator)
  const [editForm, setEditForm] = useState<Partial<Creator>>({})
  const [activeTab, setActiveTab] = useState('profile')
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const { categories, getCategoryNames } = useCategories()
  const { success, error } = useToast()

  // Update isCreating when showAddCreator changes
  useEffect(() => {
    setIsCreating(showAddCreator)
  }, [showAddCreator])

  // Select first creator by default if none selected
  useEffect(() => {
    if (!selectedCreator && safeCreators.length > 0) {
      setSelectedCreator(safeCreators[0])
    }
  }, [safeCreators, selectedCreator])

  // Reset selected creator if it's no longer in the list
  useEffect(() => {
    if (selectedCreator && !safeCreators.find(c => c.id === selectedCreator.id)) {
      setSelectedCreator(safeCreators[0] || null)
    }
  }, [safeCreators, selectedCreator])

  const handleCreateCreator = () => {
    if (!editForm.name || !editForm.category) {
      error('Name and category are required')
      return
    }

    const newCreator: Creator = {
      id: Date.now(),
      ...defaultCreator,
      ...editForm,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    const updatedCreators = [...safeCreators, newCreator]
    onCreatorsUpdate?.(updatedCreators)
    setSelectedCreator(newCreator)
    setIsCreating(false)
    setEditForm({})
    success('Creator added successfully')
    onAddCreatorClose?.()
    
    // Emit sync event
    syncService.emitSyncEvent({
      type: 'creators',
      action: 'update',
      data: updatedCreators
    })
  }

  const handleUpdateCreator = () => {
    if (!selectedCreator) return

    const updatedCreator = {
      ...selectedCreator,
      ...editForm,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    const updatedCreators = safeCreators.map(creator =>
      creator.id === selectedCreator.id ? updatedCreator : creator
    )

    onCreatorsUpdate?.(updatedCreators)
    setSelectedCreator(updatedCreator)
    setIsEditing(false)
    success('Creator updated successfully')
    
    // Emit sync event
    syncService.emitSyncEvent({
      type: 'creators',
      action: 'update',
      data: updatedCreators
    })
  }

  const handleDeleteCreator = (creatorId: number) => {
    if (confirm('Are you sure you want to delete this creator?')) {
      const updatedCreators = safeCreators.filter(creator => creator.id !== creatorId)
      onCreatorsUpdate?.(updatedCreators)
      
      if (selectedCreator?.id === creatorId) {
        setSelectedCreator(updatedCreators[0] || null)
      }
      
      success('Creator deleted successfully')
      
      // Emit sync event
      syncService.emitSyncEvent({
        type: 'creators',
        action: 'update',
        data: updatedCreators
      })
    }
  }

  const handlePhaseUpdate = (phases: any[]) => {
    if (!selectedCreator) return

    // Find the active phase
    const activePhase = phases.find(phase => phase.isActive)
    if (!activePhase) return

    // Update creator with new phase data
    const updatedCreator = {
      ...selectedCreator,
      phase: `Phase ${activePhase.id}: ${activePhase.name}`,
      phaseNumber: activePhase.id,
      nextTask: activePhase.tasks[0]?.title || 'Complete phase tasks'
    }

    const updatedCreators = safeCreators.map(creator =>
      creator.id === selectedCreator.id ? updatedCreator : creator
    )

    onCreatorsUpdate?.(updatedCreators)
    setSelectedCreator(updatedCreator)
    success('Phases updated successfully')
    
    // Emit sync event
    syncService.emitSyncEvent({
      type: 'creators',
      action: 'update',
      data: updatedCreators
    })
  }

  const handleAvatarUpdate = (avatarUrl: string) => {
    if (!selectedCreator) return

    const updatedCreator = {
      ...selectedCreator,
      avatar: avatarUrl,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    const updatedCreators = safeCreators.map(creator =>
      creator.id === selectedCreator.id ? updatedCreator : creator
    )

    onCreatorsUpdate?.(updatedCreators)
    setSelectedCreator(updatedCreator)
    
    // Emit sync event
    syncService.emitSyncEvent({
      type: 'creators',
      action: 'update',
      data: updatedCreators
    })
  }

  const handleAssetsUpdate = (assetType: 'profileImages' | 'videos' | 'pressKit', assets: string[]) => {
    if (!selectedCreator) return

    const updatedCreator = {
      ...selectedCreator,
      assets: {
        ...selectedCreator.assets,
        [assetType]: assets
      },
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    const updatedCreators = safeCreators.map(creator =>
      creator.id === selectedCreator.id ? updatedCreator : creator
    )

    onCreatorsUpdate?.(updatedCreators)
    setSelectedCreator(updatedCreator)
    
    // Emit sync event
    syncService.emitSyncEvent({
      type: 'creators',
      action: 'update',
      data: updatedCreators
    })
  }

  const startEditing = () => {
    if (!selectedCreator) return
    setEditForm(selectedCreator)
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

  const getPhaseColor = (phaseNumber: number) => {
    const colors = ["blue", "yellow", "green", "orange", "purple"]
    return colors[phaseNumber] || "gray"
  }

  const getVelocityColor = (velocity: string) => {
    switch (velocity) {
      case 'High': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Creator Management</h2>
          <p className="text-gray-600">Add, edit, and manage creators in your pipeline</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowCategoryManager(true)} variant="outline">
            <Tag className="w-4 h-4 mr-2" />
            Categories
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
              <CardTitle>Creators ({safeCreators.length})</CardTitle>
              <CardDescription>Select a creator to view details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {safeCreators.map((creator) => (
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
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{creator.avatar}</div>
                      <div>
                        <h4 className="font-medium">{creator.name}</h4>
                        <p className="text-sm text-gray-600">{creator.category}</p>
                      </div>
                    </div>
                    <Badge
                      className={`bg-${getPhaseColor(creator.phaseNumber)}-100 text-${getPhaseColor(creator.phaseNumber)}-800`}
                    >
                      Phase {creator.phaseNumber}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{creator.cardsSold}/100 cards</span>
                      <span>${(creator.cardsSold * creator.cardPrice).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {safeCreators.length === 0 && (
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
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <div className="flex space-x-2">
                      <Select
                        value={editForm.category || ''}
                        onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCategoryNames().map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowCategoryManager(true)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
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
                    <label className="block text-sm font-medium mb-2">Region</label>
                    <Select
                      value={editForm.region || 'US'}
                      onValueChange={(value) => setEditForm({ ...editForm, region: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Avatar</label>
                    <Input
                      value={editForm.avatar || '👤'}
                      onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                      placeholder="Emoji or URL"
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
                    <label className="block text-sm font-medium mb-2">Total Cards</label>
                    <Input
                      type="number"
                      value={editForm.totalCards || 100}
                      onChange={(e) => setEditForm({ ...editForm, totalCards: Number(e.target.value) })}
                      placeholder="100"
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

                <div>
                  <h4 className="font-medium mb-3">Social Media</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-medium mb-2">
                        <InstagramIcon className="w-4 h-4 mr-2" />
                        Instagram
                      </label>
                      <Input
                        value={editForm.socialMedia?.instagram || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          socialMedia: { ...editForm.socialMedia, instagram: e.target.value }
                        })}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium mb-2">
                        <TwitterIcon className="w-4 h-4 mr-2" />
                        Twitter
                      </label>
                      <Input
                        value={editForm.socialMedia?.twitter || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          socialMedia: { ...editForm.socialMedia, twitter: e.target.value }
                        })}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium mb-2">
                        <YouTubeIcon className="w-4 h-4 mr-2" />
                        YouTube
                      </label>
                      <Input
                        value={editForm.socialMedia?.youtube || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          socialMedia: { ...editForm.socialMedia, youtube: e.target.value }
                        })}
                        placeholder="@channel"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium mb-2">
                        <TikTokIcon className="w-4 h-4 mr-2" />
                        TikTok
                      </label>
                      <Input
                        value={editForm.socialMedia?.tiktok || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          socialMedia: { ...editForm.socialMedia, tiktok: e.target.value }
                        })}
                        placeholder="@username"
                      />
                    </div>
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{selectedCreator.avatar}</div>
                    <div>
                      <CardTitle className="text-2xl">{selectedCreator.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">
                          {selectedCreator.category}
                        </Badge>
                        <Badge
                          className={`bg-${getPhaseColor(selectedCreator.phaseNumber)}-100 text-${getPhaseColor(selectedCreator.phaseNumber)}-800`}
                        >
                          {selectedCreator.phase}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={startEditing}>
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
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <div className="flex space-x-2">
                          <Select
                            value={editForm.category || ''}
                            onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getCategoryNames().map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowCategoryManager(true)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
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
                                {region.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Avatar</label>
                        <Input
                          value={editForm.avatar || ''}
                          onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Cards Sold</label>
                        <Input
                          type="number"
                          value={editForm.cardsSold}
                          onChange={(e) => setEditForm({ ...editForm, cardsSold: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Card Price</label>
                        <Input
                          type="number"
                          value={editForm.cardPrice}
                          onChange={(e) => setEditForm({ ...editForm, cardPrice: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Sales Velocity</label>
                        <Select
                          value={editForm.salesVelocity || 'Pending'}
                          onValueChange={(value) => setEditForm({ ...editForm, salesVelocity: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {velocities.map((velocity) => (
                              <SelectItem key={velocity.value} value={velocity.value}>
                                {velocity.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Next Task</label>
                        <Input
                          value={editForm.nextTask || ''}
                          onChange={(e) => setEditForm({ ...editForm, nextTask: e.target.value })}
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

                    <div>
                      <h4 className="font-medium mb-3">Social Media</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center text-sm font-medium mb-2">
                            <InstagramIcon className="w-4 h-4 mr-2" />
                            Instagram
                          </label>
                          <Input
                            value={editForm.socialMedia?.instagram || ''}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              socialMedia: { ...editForm.socialMedia, instagram: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <label className="flex items-center text-sm font-medium mb-2">
                            <TwitterIcon className="w-4 h-4 mr-2" />
                            Twitter
                          </label>
                          <Input
                            value={editForm.socialMedia?.twitter || ''}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              socialMedia: { ...editForm.socialMedia, twitter: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <label className="flex items-center text-sm font-medium mb-2">
                            <YouTubeIcon className="w-4 h-4 mr-2" />
                            YouTube
                          </label>
                          <Input
                            value={editForm.socialMedia?.youtube || ''}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              socialMedia: { ...editForm.socialMedia, youtube: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <label className="flex items-center text-sm font-medium mb-2">
                            <TikTokIcon className="w-4 h-4 mr-2" />
                            TikTok
                          </label>
                          <Input
                            value={editForm.socialMedia?.tiktok || ''}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              socialMedia: { ...editForm.socialMedia, tiktok: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Strategy</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Launch Date</label>
                          <Input
                            type="date"
                            value={editForm.strategy?.launchDate || ''}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              strategy: { ...editForm.strategy, launchDate: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Target Audience</label>
                          <Input
                            value={editForm.strategy?.targetAudience || ''}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              strategy: { ...editForm.strategy, targetAudience: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium mb-2">Content Plan</label>
                        <Textarea
                          value={editForm.strategy?.contentPlan || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            strategy: { ...editForm.strategy, contentPlan: e.target.value }
                          })}
                          rows={2}
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
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="phases">Phases</TabsTrigger>
                      <TabsTrigger value="assets">Assets</TabsTrigger>
                      <TabsTrigger value="strategy">Strategy</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Contact Information</h4>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span>{selectedCreator.email || 'No email provided'}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span>{selectedCreator.phone || 'No phone provided'}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <User className="w-4 h-4 text-gray-500" />
                                <span>Region: {regions.find(r => r.value === selectedCreator.region)?.label || selectedCreator.region}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Pipeline Status</h4>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>Day {selectedCreator.daysInPhase} in {selectedCreator.phase}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <span>{selectedCreator.cardsSold}/{selectedCreator.totalCards} cards sold (${(selectedCreator.cardsSold * selectedCreator.cardPrice).toLocaleString()})</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Badge className={getVelocityColor(selectedCreator.salesVelocity)}>
                                  {selectedCreator.salesVelocity} Velocity
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Bio</h4>
                          <p className="text-gray-700">{selectedCreator.bio || 'No bio provided'}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Social Media</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCreator.socialMedia.instagram && (
                              <div className="flex items-center space-x-3">
                                <InstagramIcon className="w-5 h-5" />
                                <a
                                  href={selectedCreator.socialMedia.instagram.startsWith('http')
                                    ? selectedCreator.socialMedia.instagram
                                    : `https://instagram.com/${selectedCreator.socialMedia.instagram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {selectedCreator.socialMedia.instagram}
                                </a>
                              </div>
                            )}
                            {selectedCreator.socialMedia.twitter && (
                              <div className="flex items-center space-x-3">
                                <TwitterIcon className="w-5 h-5" />
                                <a
                                  href={selectedCreator.socialMedia.twitter.startsWith('http')
                                    ? selectedCreator.socialMedia.twitter
                                    : `https://twitter.com/${selectedCreator.socialMedia.twitter.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {selectedCreator.socialMedia.twitter}
                                </a>
                              </div>
                            )}
                            {selectedCreator.socialMedia.youtube && (
                              <div className="flex items-center space-x-3">
                                <YouTubeIcon className="w-5 h-5" />
                                <a
                                  href={selectedCreator.socialMedia.youtube.startsWith('http')
                                    ? selectedCreator.socialMedia.youtube
                                    : `https://youtube.com/${selectedCreator.socialMedia.youtube.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {selectedCreator.socialMedia.youtube}
                                </a>
                              </div>
                            )}
                            {selectedCreator.socialMedia.tiktok && (
                              <div className="flex items-center space-x-3">
                                <TikTokIcon className="w-5 h-5" />
                                <a
                                  href={selectedCreator.socialMedia.tiktok.startsWith('http')
                                    ? selectedCreator.socialMedia.tiktok
                                    : `https://tiktok.com/@${selectedCreator.socialMedia.tiktok.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {selectedCreator.socialMedia.tiktok}
                                </a>
                              </div>
                            )}
                            {!selectedCreator.socialMedia.instagram &&
                             !selectedCreator.socialMedia.twitter &&
                             !selectedCreator.socialMedia.youtube &&
                             !selectedCreator.socialMedia.tiktok && (
                              <p className="text-gray-500">No social media profiles provided</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Current Task</h4>
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm font-medium">{selectedCreator.nextTask}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Phase {selectedCreator.phaseNumber} • {selectedCreator.phase}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Created: {selectedCreator.createdAt}</span>
                          <span>Last Updated: {selectedCreator.lastUpdated}</span>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="phases">
                      <PhaseManager
                        creatorId={selectedCreator.id}
                        creatorName={selectedCreator.name}
                        currentPhase={selectedCreator.phaseNumber}
                        onPhaseUpdate={handlePhaseUpdate}
                      />
                    </TabsContent>

                    <TabsContent value="assets">
                      <div className="space-y-6">
                        <ProfilePictureUpload
                          currentAvatar={selectedCreator.avatar}
                          onAvatarUpdate={handleAvatarUpdate}
                          creatorName={selectedCreator.name}
                        />

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

                    <TabsContent value="strategy">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-3">Launch Strategy</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Launch Date</p>
                              <p className="text-gray-700">
                                {selectedCreator.strategy.launchDate
                                  ? new Date(selectedCreator.strategy.launchDate).toLocaleDateString()
                                  : 'Not set'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Target Audience</p>
                              <p className="text-gray-700">
                                {selectedCreator.strategy.targetAudience || 'Not defined'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Content Plan</h4>
                          <p className="text-gray-700">
                            {selectedCreator.strategy.contentPlan || 'No content plan defined'}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Recommended Next Steps</h4>
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <ul className="space-y-2">
                              {selectedCreator.phaseNumber === 0 && (
                                <>
                                  <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Schedule initial strategy call</span>
                                  </li>
                                  <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Define target audience and pricing strategy</span>
                                  </li>
                                </>
                              )}
                              {selectedCreator.phaseNumber === 1 && (
                                <>
                                  <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Create teaser content for social media</span>
                                  </li>
                                  <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Prepare launch assets and schedule content</span>
                                  </li>
                                </>
                              )}
                              {selectedCreator.phaseNumber === 2 && (
                                <>
                                  <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Post daily engagement content</span>
                                  </li>
                                  <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Share behind-the-scenes content</span>
                                  </li>
                                </>
                              )}
                              {selectedCreator.phaseNumber === 3 && (
                                <>
                                  <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Create urgency with limited availability messaging</span>
                                  </li>
                                  <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Share social proof and testimonials</span>
                                  </li>
                                </>
                              )}
                              {selectedCreator.phaseNumber === 4 && (
                                <>
                                  <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Send thank you message to supporters</span>
                                  </li>
                                  <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Deliver exclusive content to card holders</span>
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a creator to view details</p>
                {safeCreators.length === 0 && (
                  <Button className="mt-4" onClick={() => setIsCreating(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Creator
                  </Button>
                )}
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