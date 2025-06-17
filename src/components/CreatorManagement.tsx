'use client'

import { useState, useEffect, useRef } from 'react'
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
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Tag
} from 'lucide-react'
import { InstagramIcon, TwitterIcon, YouTubeIcon, TikTokIcon } from '@/components/ui/icons'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useToast } from '@/components/ui/toast'
import PhaseManager from '@/components/PhaseManager'
import AssetUpload from '@/components/AssetUpload'
import ProfilePictureUpload from '@/components/ProfilePictureUpload'
import CategoryManager from '@/components/CategoryManager'

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
  'US',
  'Canada',
  'UK',
  'Australia',
  'Brazil',
  'Japan',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Mexico',
  'South Korea',
  'India',
  'China',
  'Russia',
  'Other'
]

const phases = [
  { id: 0, name: 'Phase 0: Strategy Call', color: 'blue' },
  { id: 1, name: 'Phase 1: Drop Prep', color: 'yellow' },
  { id: 2, name: 'Phase 2: Launch Week', color: 'green' },
  { id: 3, name: 'Phase 3: Sell-Out Push', color: 'orange' },
  { id: 4, name: 'Phase 4: Post-Sellout', color: 'purple' }
]

const velocities = [
  { id: 'High', name: 'High', color: 'green' },
  { id: 'Medium', name: 'Medium', color: 'yellow' },
  { id: 'Low', name: 'Low', color: 'red' },
  { id: 'Pending', name: 'Pending', color: 'gray' },
  { id: 'Very High', name: 'Very High', color: 'blue' }
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
  const [activeTab, setActiveTab] = useState('info')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPhase, setFilterPhase] = useState('all')
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const { success, error } = useToast()

  // Update isCreating when showAddCreator prop changes
  useEffect(() => {
    setIsCreating(showAddCreator)
  }, [showAddCreator])

  // Update selectedCreator when creators change
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

    const phaseNumber = editForm.phaseNumber || 0
    const phaseName = phases.find(p => p.id === phaseNumber)?.name || 'Phase 0: Strategy Call'

    const newCreator: Creator = {
      id: Date.now(),
      name: editForm.name || '',
      email: editForm.email || '',
      phone: editForm.phone || '',
      category: editForm.category || '',
      region: editForm.region || 'US',
      phase: phaseName,
      phaseNumber: phaseNumber,
      cardsSold: editForm.cardsSold || 0,
      totalCards: editForm.totalCards || 100,
      cardPrice: editForm.cardPrice || 100,
      daysInPhase: editForm.daysInPhase || 0,
      nextTask: editForm.nextTask || 'Schedule strategy call',
      salesVelocity: editForm.salesVelocity || 'Pending',
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
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    onCreatorsUpdate([...creators, newCreator])
    setSelectedCreator(newCreator)
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

    const phaseNumber = editForm.phaseNumber !== undefined ? editForm.phaseNumber : selectedCreator.phaseNumber
    const phaseName = phases.find(p => p.id === phaseNumber)?.name || selectedCreator.phase

    const updatedCreator: Creator = {
      ...selectedCreator,
      name: editForm.name || selectedCreator.name,
      email: editForm.email || selectedCreator.email,
      phone: editForm.phone || selectedCreator.phone,
      category: editForm.category || selectedCreator.category,
      region: editForm.region || selectedCreator.region,
      phase: phaseName,
      phaseNumber: phaseNumber,
      cardsSold: editForm.cardsSold !== undefined ? editForm.cardsSold : selectedCreator.cardsSold,
      totalCards: editForm.totalCards || selectedCreator.totalCards,
      cardPrice: editForm.cardPrice || selectedCreator.cardPrice,
      daysInPhase: editForm.daysInPhase !== undefined ? editForm.daysInPhase : selectedCreator.daysInPhase,
      nextTask: editForm.nextTask || selectedCreator.nextTask,
      salesVelocity: editForm.salesVelocity || selectedCreator.salesVelocity,
      avatar: editForm.avatar || selectedCreator.avatar,
      bio: editForm.bio || selectedCreator.bio,
      socialMedia: {
        instagram: editForm.socialMedia?.instagram || selectedCreator.socialMedia.instagram || '',
        twitter: editForm.socialMedia?.twitter || selectedCreator.socialMedia.twitter || '',
        youtube: editForm.socialMedia?.youtube || selectedCreator.socialMedia.youtube || '',
        tiktok: editForm.socialMedia?.tiktok || selectedCreator.socialMedia.tiktok || ''
      },
      strategy: {
        launchDate: editForm.strategy?.launchDate || selectedCreator.strategy.launchDate || '',
        targetAudience: editForm.strategy?.targetAudience || selectedCreator.strategy.targetAudience || '',
        contentPlan: editForm.strategy?.contentPlan || selectedCreator.strategy.contentPlan || ''
      },
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    const updatedCreators = creators.map(creator =>
      creator.id === selectedCreator.id ? updatedCreator : creator
    )

    onCreatorsUpdate(updatedCreators)
    setSelectedCreator(updatedCreator)
    setIsEditing(false)
    setEditForm({})
    success('Creator updated successfully')
  }

  const handleDeleteCreator = (id: number) => {
    if (confirm('Are you sure you want to delete this creator?')) {
      const updatedCreators = creators.filter(creator => creator.id !== id)
      onCreatorsUpdate(updatedCreators)
      
      if (selectedCreator?.id === id) {
        setSelectedCreator(updatedCreators.length > 0 ? updatedCreators[0] : null)
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

  const handleAvatarUpdate = (avatar: string) => {
    if (isEditing && selectedCreator) {
      setEditForm({ ...editForm, avatar })
    } else if (isCreating) {
      setEditForm({ ...editForm, avatar })
    } else if (selectedCreator) {
      // Direct update without edit mode
      const updatedCreator = { ...selectedCreator, avatar, lastUpdated: new Date().toISOString().split('T')[0] }
      const updatedCreators = creators.map(creator =>
        creator.id === selectedCreator.id ? updatedCreator : creator
      )
      onCreatorsUpdate(updatedCreators)
      setSelectedCreator(updatedCreator)
      success('Profile picture updated')
    }
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

    const updatedCreators = creators.map(creator =>
      creator.id === selectedCreator.id ? updatedCreator : creator
    )

    onCreatorsUpdate(updatedCreators)
    setSelectedCreator(updatedCreator)
    success('Assets updated successfully')
  }

  const handlePhaseUpdate = (phases: any[]) => {
    if (!selectedCreator) return

    // Update creator with phase information
    const updatedCreator = {
      ...selectedCreator,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    const updatedCreators = creators.map(creator =>
      creator.id === selectedCreator.id ? updatedCreator : creator
    )

    onCreatorsUpdate(updatedCreators)
    setSelectedCreator(updatedCreator)
    success('Phases updated successfully')
  }

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || creator.category === filterCategory
    const matchesPhase = filterPhase === 'all' || creator.phaseNumber.toString() === filterPhase
    return matchesSearch && matchesCategory && matchesPhase
  })

  const getPhaseColor = (phaseNumber: number) => {
    const colors = {
      0: "bg-blue-100 text-blue-800",
      1: "bg-yellow-100 text-yellow-800",
      2: "bg-green-100 text-green-800",
      3: "bg-orange-100 text-orange-800",
      4: "bg-purple-100 text-purple-800"
    }
    return colors[phaseNumber as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getVelocityColor = (velocity: string) => {
    const colors = {
      'High': "bg-green-100 text-green-800",
      'Medium': "bg-yellow-100 text-yellow-800",
      'Low': "bg-red-100 text-red-800",
      'Pending': "bg-gray-100 text-gray-800",
      'Very High': "bg-blue-100 text-blue-800"
    }
    return colors[velocity as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const uniqueCategories = Array.from(new Set(creators.map(creator => creator.category)))

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
            Manage Categories
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Creator
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPhase} onValueChange={setFilterPhase}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Phases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                {phases.map((phase) => (
                  <SelectItem key={phase.id} value={phase.id.toString()}>
                    {phase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creator List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Creators ({filteredCreators.length})</CardTitle>
              <CardDescription>Select a creator to view details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredCreators.map((creator) => (
                <div
                  key={creator.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCreator?.id === creator.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedCreator(creator)
                    setIsEditing(false)
                    setEditForm({})
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{creator.avatar}</div>
                      <div>
                        <h4 className="font-medium">{creator.name}</h4>
                        <p className="text-sm text-gray-600">{creator.category}</p>
                      </div>
                    </div>
                    <Badge className={getPhaseColor(creator.phaseNumber)}>
                      Phase {creator.phaseNumber}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{creator.cardsSold}/{creator.totalCards} cards</span>
                      <Badge className={`text-xs ${getVelocityColor(creator.salesVelocity)}`}>
                        {creator.salesVelocity}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCreators.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No creators found</p>
                  <Button size="sm" className="mt-2" onClick={() => setIsCreating(true)}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Creator
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Creator Details */}
        <div className="lg:col-span-2">
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
                        {uniqueCategories.map((category) => (
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
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Initial Phase</label>
                    <Select
                      value={editForm.phaseNumber?.toString() || '0'}
                      onValueChange={(value) => setEditForm({ ...editForm, phaseNumber: parseInt(value, 10) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select phase" />
                      </SelectTrigger>
                      <SelectContent>
                        {phases.map((phase) => (
                          <SelectItem key={phase.id} value={phase.id.toString()}>
                            {phase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <label className="block text-sm font-medium mb-2">Social Media</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <InstagramIcon className="w-4 h-4" />
                      <Input
                        value={editForm.socialMedia?.instagram || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          socialMedia: { ...editForm.socialMedia, instagram: e.target.value }
                        })}
                        placeholder="Instagram handle or URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <TwitterIcon className="w-4 h-4" />
                      <Input
                        value={editForm.socialMedia?.twitter || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          socialMedia: { ...editForm.socialMedia, twitter: e.target.value }
                        })}
                        placeholder="Twitter handle or URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <YouTubeIcon className="w-4 h-4" />
                      <Input
                        value={editForm.socialMedia?.youtube || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          socialMedia: { ...editForm.socialMedia, youtube: e.target.value }
                        })}
                        placeholder="YouTube handle or URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <Input
                        value={editForm.socialMedia?.tiktok || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          socialMedia: { ...editForm.socialMedia, tiktok: e.target.value }
                        })}
                        placeholder="TikTok handle or URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Price ($)</label>
                    <Input
                      type="number"
                      value={editForm.cardPrice || 100}
                      onChange={(e) => setEditForm({ ...editForm, cardPrice: parseInt(e.target.value, 10) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Cards</label>
                    <Input
                      type="number"
                      value={editForm.totalCards || 100}
                      onChange={(e) => setEditForm({ ...editForm, totalCards: parseInt(e.target.value, 10) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cards Sold</label>
                    <Input
                      type="number"
                      value={editForm.cardsSold || 0}
                      onChange={(e) => setEditForm({ ...editForm, cardsSold: parseInt(e.target.value, 10) })}
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
                        <Badge variant="outline">
                          {selectedCreator.region}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleUpdateCreator} disabled={!editForm.name || !editForm.category}>
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
              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="info">Basic Info</TabsTrigger>
                    <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                    <TabsTrigger value="social">Social Media</TabsTrigger>
                    <TabsTrigger value="assets">Assets</TabsTrigger>
                    <TabsTrigger value="phases">Phase Management</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info">
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
                                {uniqueCategories.map((category) => (
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
                                  <SelectItem key={region} value={region}>
                                    {region}
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
                              placeholder="Emoji or image URL"
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
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ProfilePictureUpload
                            currentAvatar={selectedCreator.avatar}
                            onAvatarUpdate={handleAvatarUpdate}
                            creatorName={selectedCreator.name}
                          />
                          
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-gray-500" />
                                  <span>{selectedCreator.email || 'No email provided'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span>{selectedCreator.phone || 'No phone provided'}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold mb-2">Creator Details</h3>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <span>Category: {selectedCreator.category}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span>Added: {selectedCreator.createdAt}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span>Last Updated: {selectedCreator.lastUpdated}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {selectedCreator.bio && (
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Bio</h3>
                            <p className="text-gray-700">{selectedCreator.bio}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="pipeline">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Phase</label>
                            <Select
                              value={editForm.phaseNumber?.toString() || selectedCreator.phaseNumber.toString()}
                              onValueChange={(value) => setEditForm({ ...editForm, phaseNumber: parseInt(value, 10) })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {phases.map((phase) => (
                                  <SelectItem key={phase.id} value={phase.id.toString()}>
                                    {phase.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Sales Velocity</label>
                            <Select
                              value={editForm.salesVelocity || selectedCreator.salesVelocity}
                              onValueChange={(value) => setEditForm({ ...editForm, salesVelocity: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {velocities.map((velocity) => (
                                  <SelectItem key={velocity.id} value={velocity.id}>
                                    {velocity.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Days in Phase</label>
                            <Input
                              type="number"
                              value={editForm.daysInPhase !== undefined ? editForm.daysInPhase : selectedCreator.daysInPhase}
                              onChange={(e) => setEditForm({ ...editForm, daysInPhase: parseInt(e.target.value, 10) })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Next Task</label>
                            <Input
                              value={editForm.nextTask || selectedCreator.nextTask}
                              onChange={(e) => setEditForm({ ...editForm, nextTask: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Cards Sold</label>
                            <Input
                              type="number"
                              value={editForm.cardsSold !== undefined ? editForm.cardsSold : selectedCreator.cardsSold}
                              onChange={(e) => setEditForm({ ...editForm, cardsSold: parseInt(e.target.value, 10) })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Total Cards</label>
                            <Input
                              type="number"
                              value={editForm.totalCards || selectedCreator.totalCards}
                              onChange={(e) => setEditForm({ ...editForm, totalCards: parseInt(e.target.value, 10) })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Card Price ($)</label>
                            <Input
                              type="number"
                              value={editForm.cardPrice || selectedCreator.cardPrice}
                              onChange={(e) => setEditForm({ ...editForm, cardPrice: parseInt(e.target.value, 10) })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Launch Date</label>
                          <Input
                            type="date"
                            value={editForm.strategy?.launchDate || selectedCreator.strategy.launchDate || ''}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              strategy: { ...editForm.strategy, launchDate: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Pipeline Status</h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Current Phase</span>
                                  <Badge className={getPhaseColor(selectedCreator.phaseNumber)}>
                                    {selectedCreator.phase}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Days in Phase</span>
                                  <span className="font-medium">{selectedCreator.daysInPhase}</span>
                                </div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Sales Velocity</span>
                                  <Badge className={getVelocityColor(selectedCreator.salesVelocity)}>
                                    {selectedCreator.salesVelocity}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Next Task</span>
                                  <span className="font-medium">{selectedCreator.nextTask}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-3">Sales Performance</h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Cards Sold</span>
                                  <span className="font-medium">{selectedCreator.cardsSold}/{selectedCreator.totalCards}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${(selectedCreator.cardsSold / selectedCreator.totalCards) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Card Price</span>
                                <span className="font-medium">${selectedCreator.cardPrice}</span>
                              </div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Total Revenue</span>
                                <span className="font-medium">${selectedCreator.cardsSold * selectedCreator.cardPrice}</span>
                              </div>
                              {selectedCreator.strategy.launchDate && (
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Launch Date</span>
                                  <span className="font-medium">{selectedCreator.strategy.launchDate}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3">Strategy</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCreator.strategy.targetAudience && (
                              <div>
                                <h4 className="font-medium text-sm mb-1">Target Audience</h4>
                                <p className="text-sm text-gray-700">{selectedCreator.strategy.targetAudience}</p>
                              </div>
                            )}
                            {selectedCreator.strategy.contentPlan && (
                              <div>
                                <h4 className="font-medium text-sm mb-1">Content Plan</h4>
                                <p className="text-sm text-gray-700">{selectedCreator.strategy.contentPlan}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="social">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Instagram</label>
                            <div className="flex items-center space-x-2">
                              <InstagramIcon className="w-4 h-4" />
                              <Input
                                value={editForm.socialMedia?.instagram || ''}
                                onChange={(e) => setEditForm({
                                  ...editForm,
                                  socialMedia: { ...editForm.socialMedia, instagram: e.target.value }
                                })}
                                placeholder="@username or URL"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Twitter</label>
                            <div className="flex items-center space-x-2">
                              <TwitterIcon className="w-4 h-4" />
                              <Input
                                value={editForm.socialMedia?.twitter || ''}
                                onChange={(e) => setEditForm({
                                  ...editForm,
                                  socialMedia: { ...editForm.socialMedia, twitter: e.target.value }
                                })}
                                placeholder="@username or URL"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">YouTube</label>
                            <div className="flex items-center space-x-2">
                              <YouTubeIcon className="w-4 h-4" />
                              <Input
                                value={editForm.socialMedia?.youtube || ''}
                                onChange={(e) => setEditForm({
                                  ...editForm,
                                  socialMedia: { ...editForm.socialMedia, youtube: e.target.value }
                                })}
                                placeholder="@channel or URL"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">TikTok</label>
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="w-4 h-4" />
                              <Input
                                value={editForm.socialMedia?.tiktok || ''}
                                onChange={(e) => setEditForm({
                                  ...editForm,
                                  socialMedia: { ...editForm.socialMedia, tiktok: e.target.value }
                                })}
                                placeholder="@username or URL"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Target Audience</label>
                          <Textarea
                            value={editForm.strategy?.targetAudience || ''}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              strategy: { ...editForm.strategy, targetAudience: e.target.value }
                            })}
                            placeholder="Describe the creator's target audience"
                            rows={2}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Content Plan</label>
                          <Textarea
                            value={editForm.strategy?.contentPlan || ''}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              strategy: { ...editForm.strategy, contentPlan: e.target.value }
                            })}
                            placeholder="Outline the content strategy"
                            rows={2}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Social Media Profiles</h3>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <InstagramIcon className="w-5 h-5" />
                                <span className="text-sm">
                                  {selectedCreator.socialMedia.instagram || 'Not provided'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <TwitterIcon className="w-5 h-5" />
                                <span className="text-sm">
                                  {selectedCreator.socialMedia.twitter || 'Not provided'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <YouTubeIcon className="w-5 h-5" />
                                <span className="text-sm">
                                  {selectedCreator.socialMedia.youtube || 'Not provided'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-sm">
                                  {selectedCreator.socialMedia.tiktok || 'Not provided'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-3">Strategy</h3>
                            <div className="space-y-3">
                              {selectedCreator.strategy.targetAudience && (
                                <div>
                                  <h4 className="font-medium text-sm mb-1">Target Audience</h4>
                                  <p className="text-sm text-gray-700">{selectedCreator.strategy.targetAudience}</p>
                                </div>
                              )}
                              {selectedCreator.strategy.contentPlan && (
                                <div>
                                  <h4 className="font-medium text-sm mb-1">Content Plan</h4>
                                  <p className="text-sm text-gray-700">{selectedCreator.strategy.contentPlan}</p>
                                </div>
                              )}
                              {!selectedCreator.strategy.targetAudience && !selectedCreator.strategy.contentPlan && (
                                <p className="text-sm text-gray-500">No strategy information provided yet.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
                      onPhaseUpdate={handlePhaseUpdate}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : !isCreating && filteredCreators.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No creators found matching your criteria</p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Creator
                </Button>
              </CardContent>
            </Card>
          ) : !isCreating ? (
            <Card>
              <CardContent className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a creator to view details</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {showCategoryManager && (
        <CategoryManager
          isOpen={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </div>
  )
}