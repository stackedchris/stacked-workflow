'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Clock,
  Tag,
  Settings
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useToast } from '@/components/ui/toast'
import { TikTokIcon, InstagramIcon, TwitterIcon, YouTubeIcon } from '@/components/ui/icons'
import PhaseManager from '@/components/PhaseManager'
import AssetUpload from '@/components/AssetUpload'
import CategoryManager from '@/components/CategoryManager'
import ProfilePictureUpload from '@/components/ProfilePictureUpload'
import { useCategories } from '@/hooks/useCategories'

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
  creators: Creator[]
  onCreatorsUpdate: (creators: Creator[]) => void
  showAddCreator?: boolean
  onAddCreatorClose?: () => void
}

const defaultCreator: Omit<Creator, 'id'> = {
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
  },
  createdAt: new Date().toISOString().split('T')[0],
  lastUpdated: new Date().toISOString().split('T')[0]
}

const regions = [
  { value: 'US', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'India', label: 'India' },
  { value: 'Other', label: 'Other' }
]

export default function CreatorManagement({
  creators,
  onCreatorsUpdate,
  showAddCreator = false,
  onAddCreatorClose
}: CreatorManagementProps) {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(showAddCreator)
  const [editForm, setEditForm] = useState<Partial<Creator>>({})
  const [activeTab, setActiveTab] = useState('profile')
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const { success, error } = useToast()
  const { categories, getCategoryNames } = useCategories()

  // Update isCreating when showAddCreator prop changes
  useEffect(() => {
    setIsCreating(showAddCreator)
  }, [showAddCreator])

  // Reset selected creator when creators list changes
  useEffect(() => {
    if (selectedCreator) {
      const updatedCreator = creators.find(c => c.id === selectedCreator.id)
      if (updatedCreator) {
        setSelectedCreator(updatedCreator)
      } else if (creators.length > 0) {
        setSelectedCreator(creators[0])
      } else {
        setSelectedCreator(null)
      }
    } else if (creators.length > 0 && !isCreating) {
      setSelectedCreator(creators[0])
    }
  }, [creators, selectedCreator, isCreating])

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

    onCreatorsUpdate([...creators, newCreator])
    setIsCreating(false)
    setEditForm({})
    success('Creator added successfully')
    
    if (onAddCreatorClose) {
      onAddCreatorClose()
    }
  }

  const handleUpdateCreator = () => {
    if (!selectedCreator) return
    if (!editForm.name || !editForm.category) {
      error('Name and category are required')
      return
    }

    const updatedCreator = {
      ...selectedCreator,
      ...editForm,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    onCreatorsUpdate(
      creators.map(creator =>
        creator.id === selectedCreator.id ? updatedCreator : creator
      )
    )
    setSelectedCreator(updatedCreator)
    setIsEditing(false)
    success('Creator updated successfully')
  }

  const handleDeleteCreator = (id: number) => {
    if (confirm('Are you sure you want to delete this creator?')) {
      onCreatorsUpdate(creators.filter(creator => creator.id !== id))
      if (selectedCreator?.id === id) {
        setSelectedCreator(creators.length > 1 ? creators.find(c => c.id !== id) || null : null)
      }
      success('Creator deleted successfully')
    }
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
    
    if (onAddCreatorClose) {
      onAddCreatorClose()
    }
  }

  const updateCreatorField = (field: string, value: any) => {
    if (!selectedCreator) return

    const updatedCreator = {
      ...selectedCreator,
      [field]: value,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    onCreatorsUpdate(
      creators.map(creator =>
        creator.id === selectedCreator.id ? updatedCreator : creator
      )
    )
    setSelectedCreator(updatedCreator)
  }

  const updateSocialMedia = (platform: string, value: string) => {
    if (!selectedCreator) return

    const updatedCreator = {
      ...selectedCreator,
      socialMedia: {
        ...selectedCreator.socialMedia,
        [platform]: value
      },
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    onCreatorsUpdate(
      creators.map(creator =>
        creator.id === selectedCreator.id ? updatedCreator : creator
      )
    )
    setSelectedCreator(updatedCreator)
  }

  const updateStrategy = (field: string, value: string) => {
    if (!selectedCreator) return

    const updatedCreator = {
      ...selectedCreator,
      strategy: {
        ...selectedCreator.strategy,
        [field]: value
      },
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    onCreatorsUpdate(
      creators.map(creator =>
        creator.id === selectedCreator.id ? updatedCreator : creator
      )
    )
    setSelectedCreator(updatedCreator)
  }

  const updateAssets = (assetType: 'profileImages' | 'videos' | 'pressKit', assets: string[]) => {
    if (!selectedCreator) return

    const updatedCreator = {
      ...selectedCreator,
      assets: {
        ...selectedCreator.assets,
        [assetType]: assets
      },
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    onCreatorsUpdate(
      creators.map(creator =>
        creator.id === selectedCreator.id ? updatedCreator : creator
      )
    )
    setSelectedCreator(updatedCreator)
  }

  const updatePhases = (phases: any[]) => {
    if (!selectedCreator) return

    // Extract current phase info from phases
    const currentPhase = phases.find(phase => phase.isActive)
    if (!currentPhase) return

    const updatedCreator = {
      ...selectedCreator,
      phase: `Phase ${currentPhase.id}: ${currentPhase.name}`,
      phaseNumber: currentPhase.id,
      nextTask: currentPhase.tasks[0]?.title || 'Complete phase tasks',
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    onCreatorsUpdate(
      creators.map(creator =>
        creator.id === selectedCreator.id ? updatedCreator : creator
      )
    )
    setSelectedCreator(updatedCreator)
  }

  const updateAvatar = (avatarUrl: string) => {
    if (!selectedCreator) return

    const updatedCreator = {
      ...selectedCreator,
      avatar: avatarUrl,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    onCreatorsUpdate(
      creators.map(creator =>
        creator.id === selectedCreator.id ? updatedCreator : creator
      )
    )
    setSelectedCreator(updatedCreator)
  }

  const getPhaseColor = (phaseNumber: number) => {
    const colors = ["blue", "yellow", "green", "orange", "purple"]
    return colors[phaseNumber] || "gray"
  }

  const getSalesVelocityColor = (velocity: string) => {
    switch (velocity) {
      case "High": return "bg-green-100 text-green-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "Low": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Creator Management</h2>
          <p className="text-gray-600">Manage creators and their pipeline status</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Creator
          </Button>
          <Button variant="outline" onClick={() => setIsCategoryManagerOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Categories
          </Button>
        </div>
      </div>

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
                        {category}
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
                  placeholder="email@example.com"
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
                  placeholder="Emoji or image URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Card Price ($)</label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Instagram</label>
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
                <label className="block text-sm font-medium mb-2">Twitter</label>
                <Input
                  value={editForm.socialMedia?.twitter || ''}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    socialMedia: { ...editForm.socialMedia, twitter: e.target.value }
                  })}
                  placeholder="@username"
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
      ) : (
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
                          <h4 className="font-medium">{creator.name}</h4>
                          <p className="text-xs text-gray-600">{creator.category}</p>
                        </div>
                      </div>
                      <Badge className={`bg-${getPhaseColor(creator.phaseNumber)}-100 text-${getPhaseColor(creator.phaseNumber)}-800`}>
                        Phase {creator.phaseNumber}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{creator.cardsSold}/{creator.totalCards} sold</span>
                        <span>${(creator.cardsSold * creator.cardPrice).toLocaleString()}</span>
                      </div>
                      <Progress value={(creator.cardsSold / creator.totalCards) * 100} className="h-1 mt-1" />
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
            {selectedCreator ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{selectedCreator.avatar}</span>
                        <div>
                          <CardTitle className="text-2xl">{selectedCreator.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{selectedCreator.category}</Badge>
                            <Badge variant="outline">{regions.find(r => r.value === selectedCreator.region)?.label || selectedCreator.region}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {isEditing ? (
                          <>
                            <Button onClick={handleUpdateCreator}>
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button variant="outline" onClick={cancelEditing}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" onClick={startEditing}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDeleteCreator(selectedCreator.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                                    {category}
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
                            <label className="block text-sm font-medium mb-2">Card Price ($)</label>
                            <Input
                              type="number"
                              value={editForm.cardPrice || 0}
                              onChange={(e) => setEditForm({ ...editForm, cardPrice: Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Cards Sold</label>
                            <Input
                              type="number"
                              value={editForm.cardsSold || 0}
                              onChange={(e) => setEditForm({ ...editForm, cardsSold: Number(e.target.value) })}
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
                              placeholder="@username"
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
                              placeholder="@username"
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
                              placeholder="@channel"
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
                              placeholder="@username"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList>
                          <TabsTrigger value="profile">Profile</TabsTrigger>
                          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                          <TabsTrigger value="assets">Assets</TabsTrigger>
                          <TabsTrigger value="strategy">Strategy</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="md:col-span-1">
                                <ProfilePictureUpload
                                  currentAvatar={selectedCreator.avatar}
                                  onAvatarUpdate={updateAvatar}
                                  creatorName={selectedCreator.name}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex items-center space-x-3">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span>{selectedCreator.email || 'No email provided'}</span>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span>{selectedCreator.phone || 'No phone provided'}</span>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <Tag className="w-4 h-4 text-gray-500" />
                                        <span>{selectedCreator.category}</span>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span>{regions.find(r => r.value === selectedCreator.region)?.label || selectedCreator.region}</span>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-medium mb-2">Bio</h4>
                                      <p className="text-gray-700">{selectedCreator.bio || 'No bio provided'}</p>
                                    </div>

                                    <div>
                                      <h4 className="font-medium mb-2">Social Media</h4>
                                      <div className="grid grid-cols-2 gap-3">
                                        {selectedCreator.socialMedia.instagram && (
                                          <a
                                            href={selectedCreator.socialMedia.instagram.startsWith('http') ? selectedCreator.socialMedia.instagram : `https://instagram.com/${selectedCreator.socialMedia.instagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                                          >
                                            <InstagramIcon className="w-4 h-4" />
                                            <span>{selectedCreator.socialMedia.instagram}</span>
                                          </a>
                                        )}
                                        {selectedCreator.socialMedia.twitter && (
                                          <a
                                            href={selectedCreator.socialMedia.twitter.startsWith('http') ? selectedCreator.socialMedia.twitter : `https://twitter.com/${selectedCreator.socialMedia.twitter.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                                          >
                                            <TwitterIcon className="w-4 h-4" />
                                            <span>{selectedCreator.socialMedia.twitter}</span>
                                          </a>
                                        )}
                                        {selectedCreator.socialMedia.youtube && (
                                          <a
                                            href={selectedCreator.socialMedia.youtube.startsWith('http') ? selectedCreator.socialMedia.youtube : `https://youtube.com/${selectedCreator.socialMedia.youtube.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                                          >
                                            <YouTubeIcon className="w-4 h-4" />
                                            <span>{selectedCreator.socialMedia.youtube}</span>
                                          </a>
                                        )}
                                        {selectedCreator.socialMedia.tiktok && (
                                          <a
                                            href={selectedCreator.socialMedia.tiktok.startsWith('http') ? selectedCreator.socialMedia.tiktok : `https://tiktok.com/@${selectedCreator.socialMedia.tiktok.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                                          >
                                            <TikTokIcon className="w-4 h-4" />
                                            <span>{selectedCreator.socialMedia.tiktok}</span>
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>

                            <Card>
                              <CardHeader>
                                <CardTitle>Social Media Management</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Instagram</label>
                                    <div className="flex space-x-2">
                                      <Input
                                        value={selectedCreator.socialMedia.instagram || ''}
                                        onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                                        placeholder="@username"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Twitter</label>
                                    <div className="flex space-x-2">
                                      <Input
                                        value={selectedCreator.socialMedia.twitter || ''}
                                        onChange={(e) => updateSocialMedia('twitter', e.target.value)}
                                        placeholder="@username"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">YouTube</label>
                                    <div className="flex space-x-2">
                                      <Input
                                        value={selectedCreator.socialMedia.youtube || ''}
                                        onChange={(e) => updateSocialMedia('youtube', e.target.value)}
                                        placeholder="@channel"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">TikTok</label>
                                    <div className="flex space-x-2">
                                      <Input
                                        value={selectedCreator.socialMedia.tiktok || ''}
                                        onChange={(e) => updateSocialMedia('tiktok', e.target.value)}
                                        placeholder="@username"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>

                        <TabsContent value="pipeline">
                          <div className="space-y-6">
                            <Card>
                              <CardHeader>
                                <CardTitle>Pipeline Status</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Current Phase</label>
                                    <Badge className={`bg-${getPhaseColor(selectedCreator.phaseNumber)}-100 text-${getPhaseColor(selectedCreator.phaseNumber)}-800`}>
                                      {selectedCreator.phase}
                                    </Badge>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Days in Phase</label>
                                    <div className="flex items-center space-x-2">
                                      <Clock className="w-4 h-4 text-gray-500" />
                                      <Input
                                        type="number"
                                        value={selectedCreator.daysInPhase}
                                        onChange={(e) => updateCreatorField('daysInPhase', Number(e.target.value))}
                                        className="max-w-24"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Sales Velocity</label>
                                    <Select
                                      value={selectedCreator.salesVelocity}
                                      onValueChange={(value) => updateCreatorField('salesVelocity', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-2">Next Task</label>
                                  <Input
                                    value={selectedCreator.nextTask}
                                    onChange={(e) => updateCreatorField('nextTask', e.target.value)}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-2">Sales Progress</label>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Cards Sold</span>
                                      <div className="flex items-center space-x-2">
                                        <Input
                                          type="number"
                                          value={selectedCreator.cardsSold}
                                          onChange={(e) => updateCreatorField('cardsSold', Number(e.target.value))}
                                          className="w-20"
                                        />
                                        <span>/ {selectedCreator.totalCards}</span>
                                      </div>
                                    </div>
                                    <Progress value={(selectedCreator.cardsSold / selectedCreator.totalCards) * 100} className="h-2" />
                                    <div className="flex justify-between text-xs text-gray-500">
                                      <span>{Math.round((selectedCreator.cardsSold / selectedCreator.totalCards) * 100)}% complete</span>
                                      <span>${(selectedCreator.cardsSold * selectedCreator.cardPrice).toLocaleString()} revenue</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <PhaseManager
                              creatorId={selectedCreator.id}
                              creatorName={selectedCreator.name}
                              currentPhase={selectedCreator.phaseNumber}
                              onPhaseUpdate={updatePhases}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="assets">
                          <div className="space-y-6">
                            <AssetUpload
                              creatorId={selectedCreator.id}
                              assetType="profileImages"
                              existingAssets={selectedCreator.assets.profileImages}
                              onAssetsUpdate={(assets) => updateAssets('profileImages', assets)}
                            />

                            <AssetUpload
                              creatorId={selectedCreator.id}
                              assetType="videos"
                              existingAssets={selectedCreator.assets.videos}
                              onAssetsUpdate={(assets) => updateAssets('videos', assets)}
                            />

                            <AssetUpload
                              creatorId={selectedCreator.id}
                              assetType="pressKit"
                              existingAssets={selectedCreator.assets.pressKit}
                              onAssetsUpdate={(assets) => updateAssets('pressKit', assets)}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="strategy">
                          <div className="space-y-6">
                            <Card>
                              <CardHeader>
                                <CardTitle>Launch Strategy</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Launch Date</label>
                                  <Input
                                    type="date"
                                    value={selectedCreator.strategy.launchDate || ''}
                                    onChange={(e) => updateStrategy('launchDate', e.target.value)}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-2">Target Audience</label>
                                  <Textarea
                                    value={selectedCreator.strategy.targetAudience || ''}
                                    onChange={(e) => updateStrategy('targetAudience', e.target.value)}
                                    placeholder="Describe the target audience for this creator"
                                    rows={3}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-2">Content Plan</label>
                                  <Textarea
                                    value={selectedCreator.strategy.contentPlan || ''}
                                    onChange={(e) => updateStrategy('contentPlan', e.target.value)}
                                    placeholder="Outline the content strategy and plan"
                                    rows={3}
                                  />
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <DollarSign className="w-5 h-5 text-blue-600" />
                                      <h4 className="font-medium">Revenue</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                      ${(selectedCreator.cardsSold * selectedCreator.cardPrice).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                      ${selectedCreator.cardPrice} per card
                                    </p>
                                  </div>
                                  <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Target className="w-5 h-5 text-green-600" />
                                      <h4 className="font-medium">Completion</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">
                                      {Math.round((selectedCreator.cardsSold / selectedCreator.totalCards) * 100)}%
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                      {selectedCreator.cardsSold}/{selectedCreator.totalCards} cards sold
                                    </p>
                                  </div>
                                  <div className="p-4 bg-orange-50 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <TrendingUp className="w-5 h-5 text-orange-600" />
                                      <h4 className="font-medium">Velocity</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-600">
                                      {selectedCreator.salesVelocity}
                                    </p>
                                    <p className="text-xs text-orange-600 mt-1">
                                      {selectedCreator.daysInPhase} days in current phase
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              </div>
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
      )}

      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />
    </div>
  )
}