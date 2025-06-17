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
  Upload,
  User,
  Calendar,
  DollarSign,
  Target,
  Phone,
  Mail,
  ExternalLink,
  FileText,
  Image,
  Video,
  Music,
  Gamepad2,
  Tv,
  Sparkles,
  Trash2,
  AlertTriangle,
  MessageSquare
} from 'lucide-react'
import { TikTokIcon, InstagramIcon, TwitterIcon, YouTubeIcon } from '@/components/ui/icons'
import AssetUpload from './AssetUpload'
import SocialScraper from './SocialScraper'
import PhaseManager from './PhaseManager'
import { useToast } from '@/components/ui/toast'

const categories = [
  { value: "Gaming", icon: <Gamepad2 className="w-4 h-4" />, color: "bg-purple-100 text-purple-800" },
  { value: "Music", icon: <Music className="w-4 h-4" />, color: "bg-pink-100 text-pink-800" },
  { value: "Streaming", icon: <Tv className="w-4 h-4" />, color: "bg-blue-100 text-blue-800" },
  { value: "Lifestyle", icon: <Sparkles className="w-4 h-4" />, color: "bg-green-100 text-green-800" },
  { value: "Comedy", icon: <MessageSquare className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-800" },
  { value: "Fashion", icon: <User className="w-4 h-4" />, color: "bg-orange-100 text-orange-800" }
]

const phases = [
  { value: 0, name: "Phase 0: Strategy Call", color: "blue" },
  { value: 1, name: "Phase 1: Drop Prep", color: "yellow" },
  { value: 2, name: "Phase 2: Launch Week", color: "green" },
  { value: 3, name: "Phase 3: Sell-Out Push", color: "orange" },
  { value: 4, name: "Phase 4: Post-Sellout", color: "purple" }
]

interface Creator {
  id: number
  name: string
  email: string
  phone: string
  category: string
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
    tiktok?: string
    youtube?: string
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
  createdAt: string
  lastUpdated: string
}

const initialCreators: Creator[] = [
  {
    id: 1,
    name: "Kurama",
    email: "kurama@example.com",
    phone: "+1 (555) 123-4567",
    category: "Gaming",
    phase: "Phase 2: Launch Week",
    phaseNumber: 2,
    cardsSold: 67,
    totalCards: 100,
    cardPrice: 100,
    daysInPhase: 2,
    nextTask: "Post group chat screenshot",
    salesVelocity: "High",
    avatar: "🎮",
    bio: "Top Smash Bros player with 500K+ following. Known for competitive gameplay and community engagement.",
    socialMedia: {
      instagram: "@kurama_smash",
      twitter: "@KuramaPlays",
      youtube: "@KuramaGaming",
      tiktok: "@kurama.gaming"
    },
    assets: {
      profileImages: ["profile1.jpg", "action_shot.jpg"],
      videos: ["intro_video.mp4", "gameplay_highlight.mp4"],
      pressKit: ["bio.pdf", "stats_sheet.pdf"]
    },
    strategy: {
      launchDate: "2025-06-20",
      pricingStructure: "$100 per card",
      targetAudience: "Competitive gaming fans, Smash community",
      contentPlan: "Daily gameplay tips, tournament insights, behind-the-scenes"
    },
    createdAt: "2025-06-10",
    lastUpdated: "2025-06-16"
  },
  {
    id: 2,
    name: "Nina Lin",
    email: "nina@example.com",
    phone: "+1 (555) 234-5678",
    category: "Streaming",
    phase: "Phase 1: Drop Prep",
    phaseNumber: 1,
    cardsSold: 0,
    totalCards: 100,
    cardPrice: 75,
    daysInPhase: 5,
    nextTask: "Record teaser video",
    salesVelocity: "Pending",
    avatar: "📺",
    bio: "Popular streamer and co-founder of O3. Known for variety content and community building.",
    socialMedia: {
      instagram: "@ninalin",
      twitter: "@NinaStreams",
      tiktok: "@nina.streams"
    },
    assets: {
      profileImages: ["nina_profile.jpg"],
      videos: ["stream_highlights.mp4"],
      pressKit: ["media_kit.pdf"]
    },
    strategy: {
      launchDate: "2025-06-25",
      pricingStructure: "$75 per card",
      targetAudience: "Streaming community, variety content viewers",
      contentPlan: "Stream highlights, Q&A sessions, exclusive behind-the-scenes"
    },
    createdAt: "2025-06-12",
    lastUpdated: "2025-06-16"
  }
]

interface CreatorManagementProps {
  creators?: Creator[]
  onCreatorsUpdate?: (creators: Creator[]) => void
  showAddCreator?: boolean
  onAddCreatorClose?: () => void
}

export default function CreatorManagement({
  creators: propCreators,
  onCreatorsUpdate,
  showAddCreator = false,
  onAddCreatorClose
}: CreatorManagementProps = {}) {
  const { addToast } = useToast()
  const [creators, setCreators] = useState<Creator[]>(propCreators || initialCreators)
  const [isAddingCreator, setIsAddingCreator] = useState(false)
  const [editingCreator, setEditingCreator] = useState<number | null>(null)
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)
  const [deletingCreator, setDeletingCreator] = useState<Creator | null>(null)

  // Sync with prop changes
  useEffect(() => {
    if (propCreators && JSON.stringify(propCreators) !== JSON.stringify(creators)) {
      console.log('Syncing creators from props:', propCreators)
      setCreators(propCreators)
      // Update selected creator if it was modified
      if (selectedCreator) {
        const updatedSelected = propCreators.find(c => c.id === selectedCreator.id)
        if (updatedSelected) {
          setSelectedCreator(updatedSelected)
        }
      }
    }
  }, [propCreators, creators, selectedCreator])

  // Handle showAddCreator prop
  useEffect(() => {
    console.log('CreatorManagement useEffect - showAddCreator:', showAddCreator)
    if (showAddCreator) {
      console.log('Setting isAddingCreator to true')
      setIsAddingCreator(true)
    }
  }, [showAddCreator])
  const [activeTab, setActiveTab] = useState("overview")

  const [newCreator, setNewCreator] = useState<Partial<Creator>>({
    name: "",
    email: "",
    phone: "",
    category: "",
    phase: "Phase 0: Strategy Call",
    phaseNumber: 0,
    cardsSold: 0,
    totalCards: 100,
    cardPrice: 100,
    daysInPhase: 0,
    nextTask: "Schedule strategy call",
    salesVelocity: "Pending",
    avatar: "👤",
    bio: "",
    socialMedia: {},
    assets: {
      profileImages: [],
      videos: [],
      pressKit: []
    },
    strategy: {}
  })

  const handleAddCreator = () => {
    if (!newCreator.name || !newCreator.category) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        description: 'Please provide at least a name and category for the creator.'
      })
      return
    }

    const creator: Creator = {
      ...newCreator,
      id: creators.length > 0 ? Math.max(...creators.map(c => c.id)) + 1 : 1,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    } as Creator

    const updatedCreators = [...creators, creator]
    console.log('Adding new creator:', creator.name, 'Updated creators list:', updatedCreators)
    setCreators(updatedCreators)
    onCreatorsUpdate?.(updatedCreators)

    // Reset form
    setNewCreator({
      name: "",
      email: "",
      phone: "",
      category: "",
      phase: "Phase 0: Strategy Call",
      phaseNumber: 0,
      cardsSold: 0,
      totalCards: 100,
      cardPrice: 100,
      daysInPhase: 0,
      nextTask: "Schedule strategy call",
      salesVelocity: "Pending",
      avatar: "👤",
      bio: "",
      socialMedia: {},
      assets: {
        profileImages: [],
        videos: [],
        pressKit: []
      },
      strategy: {}
    })
    setIsAddingCreator(false)
    onAddCreatorClose?.()

    addToast({
      type: 'success',
      title: 'Creator Added',
      description: `${creator.name} has been added to your pipeline successfully.`
    })
  }

  const handleUpdateCreator = (updatedCreator: Creator) => {
    const updatedCreators = creators.map(c =>
      c.id === updatedCreator.id
        ? { ...updatedCreator, lastUpdated: new Date().toISOString().split('T')[0] }
        : c
    )
    console.log('Updating creator:', updatedCreator.name, 'Updated creators:', updatedCreators)
    setCreators(updatedCreators)
    onCreatorsUpdate?.(updatedCreators)
    setEditingCreator(null)

    // Also update selected creator if it's the same one
    if (selectedCreator?.id === updatedCreator.id) {
      setSelectedCreator({
        ...updatedCreator,
        lastUpdated: new Date().toISOString().split('T')[0]
      })
    }

    addToast({
      type: 'success',
      title: 'Creator Updated',
      description: `${updatedCreator.name}'s profile has been saved successfully.`
    })
  }

  const handlePhaseChange = (creatorId: number, newPhase: number) => {
    const creator = creators.find(c => c.id === creatorId)
    if (!creator) return

    const phaseInfo = phases[newPhase]
    const updatedCreator = {
      ...creator,
      phaseNumber: newPhase,
      phase: phaseInfo.name,
      daysInPhase: 0,
      nextTask: getNextTask(newPhase),
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    const updatedCreators = creators.map(c => c.id === creatorId ? updatedCreator : c)
    setCreators(updatedCreators)
    onCreatorsUpdate?.(updatedCreators)
  }

  const getNextTask = (phase: number) => {
    const tasks = [
      "Schedule strategy call",
      "Record teaser video",
      "Post launch announcement",
      "Create urgency content",
      "Send thank you message"
    ]
    return tasks[phase] || "Complete phase"
  }

  const handleDeleteCreator = (creatorToDelete: Creator) => {
    const updatedCreators = creators.filter(c => c.id !== creatorToDelete.id)
    setCreators(updatedCreators)
    onCreatorsUpdate?.(updatedCreators)

    // If we're deleting the selected creator, clear the selection
    if (selectedCreator?.id === creatorToDelete.id) {
      setSelectedCreator(null)
    }

    setDeletingCreator(null)

    addToast({
      type: 'success',
      title: 'Creator Deleted',
      description: `${creatorToDelete.name} has been removed from your pipeline.`
    })
  }

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.value === category) || categories[0]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Creator Management</h2>
          <p className="text-gray-600">Manage creators, assets, and pipeline progression</p>
        </div>
        <Button onClick={() => setIsAddingCreator(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Creator
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Creator List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Creators ({creators.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {creators.map((creator) => {
                const categoryInfo = getCategoryInfo(creator.category)
                return (
                  <div
                    key={creator.id}
                    className={`group p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCreator?.id === creator.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCreator(creator)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{creator.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{creator.name}</h4>
                        <div className="flex items-center space-x-1">
                          {categoryInfo.icon}
                          <span className="text-xs text-gray-600">{creator.category}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingCreator(creator)
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="mt-2">
                      <Progress value={creator.cardsSold} className="h-1" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{creator.cardsSold}/100</span>
                        <span>Phase {creator.phaseNumber}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Creator Details */}
        <div className="lg:col-span-3">
          {selectedCreator ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="social">Social Intel</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{selectedCreator.avatar}</div>
                        <div>
                          <CardTitle className="text-2xl">{selectedCreator.name}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            {editingCreator === selectedCreator.id ? (
                              <Select
                                value={selectedCreator.category}
                                onValueChange={(value) => setSelectedCreator({
                                  ...selectedCreator,
                                  category: value
                                })}
                              >
                                <SelectTrigger className="w-40 h-6 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.value} value={category.value}>
                                      <div className="flex items-center space-x-2">
                                        {category.icon}
                                        <span>{category.value}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <>
                                {getCategoryInfo(selectedCreator.category).icon}
                                <span>{selectedCreator.category}</span>
                              </>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditingCreator(selectedCreator.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const updatedCreator = {...selectedCreator, lastUpdated: new Date().toISOString().split('T')[0]}
                            handleUpdateCreator(updatedCreator)
                            setSelectedCreator(updatedCreator)
                            setEditingCreator(null)
                          }}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setDeletingCreator(selectedCreator)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {editingCreator === selectedCreator.id ? (
                      <Textarea
                        value={selectedCreator.bio}
                        onChange={(e) => setSelectedCreator({...selectedCreator, bio: e.target.value})}
                        placeholder="Creator bio..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-700">{selectedCreator.bio}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Contact Info</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            {editingCreator === selectedCreator.id ? (
                              <Input
                                type="email"
                                value={selectedCreator.email}
                                onChange={(e) => setSelectedCreator({...selectedCreator, email: e.target.value})}
                                className="h-6 text-sm"
                              />
                            ) : (
                              <span>{selectedCreator.email}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            {editingCreator === selectedCreator.id ? (
                              <Input
                                value={selectedCreator.phone}
                                onChange={(e) => setSelectedCreator({...selectedCreator, phone: e.target.value})}
                                className="h-6 text-sm"
                              />
                            ) : (
                              <span>{selectedCreator.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Social Media</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <InstagramIcon className="w-4 h-4" />
                            {editingCreator === selectedCreator.id ? (
                              <Input
                                value={selectedCreator.socialMedia.instagram || ''}
                                onChange={(e) => setSelectedCreator({
                                  ...selectedCreator,
                                  socialMedia: { ...selectedCreator.socialMedia, instagram: e.target.value }
                                })}
                                placeholder="@username"
                                className="h-6 text-sm"
                              />
                            ) : (
                              <span>{selectedCreator.socialMedia.instagram || 'Not set'}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <TwitterIcon className="w-4 h-4" />
                            {editingCreator === selectedCreator.id ? (
                              <Input
                                value={selectedCreator.socialMedia.twitter || ''}
                                onChange={(e) => setSelectedCreator({
                                  ...selectedCreator,
                                  socialMedia: { ...selectedCreator.socialMedia, twitter: e.target.value }
                                })}
                                placeholder="@username"
                                className="h-6 text-sm"
                              />
                            ) : (
                              <span>{selectedCreator.socialMedia.twitter || 'Not set'}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <YouTubeIcon className="w-4 h-4" />
                            {editingCreator === selectedCreator.id ? (
                              <Input
                                value={selectedCreator.socialMedia.youtube || ''}
                                onChange={(e) => setSelectedCreator({
                                  ...selectedCreator,
                                  socialMedia: { ...selectedCreator.socialMedia, youtube: e.target.value }
                                })}
                                placeholder="@channel"
                                className="h-6 text-sm"
                              />
                            ) : (
                              <span>{selectedCreator.socialMedia.youtube || 'Not set'}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <TikTokIcon className="w-4 h-4" />
                            {editingCreator === selectedCreator.id ? (
                              <Input
                                value={selectedCreator.socialMedia.tiktok || ''}
                                onChange={(e) => setSelectedCreator({
                                  ...selectedCreator,
                                  socialMedia: { ...selectedCreator.socialMedia, tiktok: e.target.value }
                                })}
                                placeholder="@username"
                                className="h-6 text-sm"
                              />
                            ) : (
                              <span>{selectedCreator.socialMedia.tiktok || 'Not set'}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Performance</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span>Cards Sold:</span>
                            {editingCreator === selectedCreator.id ? (
                              <Input
                                type="number"
                                value={selectedCreator.cardsSold}
                                onChange={(e) => setSelectedCreator({...selectedCreator, cardsSold: Number.parseInt(e.target.value) || 0})}
                                className="h-6 w-20 text-sm"
                                min="0"
                                max="100"
                              />
                            ) : (
                              <span className="font-medium">{selectedCreator.cardsSold}/100</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Card Price:</span>
                            {editingCreator === selectedCreator.id ? (
                              <Input
                                type="number"
                                value={selectedCreator.cardPrice}
                                onChange={(e) => setSelectedCreator({...selectedCreator, cardPrice: Number.parseInt(e.target.value) || 0})}
                                className="h-6 w-20 text-sm"
                                min="1"
                              />
                            ) : (
                              <span className="font-medium">${selectedCreator.cardPrice}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Sales Velocity:</span>
                            {editingCreator === selectedCreator.id ? (
                              <Select
                                value={selectedCreator.salesVelocity}
                                onValueChange={(value) => setSelectedCreator({...selectedCreator, salesVelocity: value})}
                              >
                                <SelectTrigger className="h-6 w-20 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="High">High</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="font-medium">{selectedCreator.salesVelocity}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assets" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Creator Assets</CardTitle>
                    <CardDescription>Manage profile images, videos, and press materials</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <AssetUpload
                      creatorId={selectedCreator.id}
                      assetType="profileImages"
                      existingAssets={selectedCreator.assets.profileImages}
                      onAssetsUpdate={(assets) => {
                        const updatedCreator = {
                          ...selectedCreator,
                          assets: { ...selectedCreator.assets, profileImages: assets }
                        }
                        handleUpdateCreator(updatedCreator)
                      }}
                    />

                    <AssetUpload
                      creatorId={selectedCreator.id}
                      assetType="videos"
                      existingAssets={selectedCreator.assets.videos}
                      onAssetsUpdate={(assets) => {
                        const updatedCreator = {
                          ...selectedCreator,
                          assets: { ...selectedCreator.assets, videos: assets }
                        }
                        handleUpdateCreator(updatedCreator)
                      }}
                    />

                    <AssetUpload
                      creatorId={selectedCreator.id}
                      assetType="pressKit"
                      existingAssets={selectedCreator.assets.pressKit}
                      onAssetsUpdate={(assets) => {
                        const updatedCreator = {
                          ...selectedCreator,
                          assets: { ...selectedCreator.assets, pressKit: assets }
                        }
                        handleUpdateCreator(updatedCreator)
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="strategy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Strategy & Planning</CardTitle>
                    <CardDescription>Launch strategy and content planning details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Launch Date</label>
                        <Input
                          type="date"
                          value={selectedCreator.strategy.launchDate || ""}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Pricing Structure</label>
                        <Input
                          value={selectedCreator.strategy.pricingStructure || ""}
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Audience</label>
                      <Textarea
                        value={selectedCreator.strategy.targetAudience || ""}
                        readOnly
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Content Plan</label>
                      <Textarea
                        value={selectedCreator.strategy.contentPlan || ""}
                        readOnly
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="space-y-6">
                <PhaseManager
                  creatorId={selectedCreator.id}
                  creatorName={selectedCreator.name}
                  currentPhase={selectedCreator.phaseNumber}
                  onPhaseUpdate={(updatedPhases) => {
                    // Handle phase updates for this specific creator
                    console.log('Phase updated for creator:', selectedCreator.id, updatedPhases)
                  }}
                />
              </TabsContent>

              <TabsContent value="social" className="space-y-6">
                <SocialScraper
                  creatorId={selectedCreator.id}
                  creatorName={selectedCreator.name}
                  socialMedia={selectedCreator.socialMedia}
                />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Creator Settings</CardTitle>
                    <CardDescription>Update creator information and preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Settings panel for advanced creator configuration...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Creator</h3>
                <p className="text-gray-600">Choose a creator from the list to view their details and manage their pipeline.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Creator Modal */}
      {isAddingCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {console.log('Rendering Add Creator Modal - isAddingCreator:', isAddingCreator)}
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Creator</CardTitle>
                <Button variant="outline" size="sm" onClick={() => {
                  setIsAddingCreator(false)
                  onAddCreatorClose?.()
                }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Creator Name *</label>
                  <Input
                    value={newCreator.name || ""}
                    onChange={(e) => setNewCreator({...newCreator, name: e.target.value})}
                    placeholder="Enter creator name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <Select
                    value={newCreator.category || ""}
                    onValueChange={(value) => setNewCreator({...newCreator, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center space-x-2">
                            {category.icon}
                            <span>{category.value}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={newCreator.email || ""}
                    onChange={(e) => setNewCreator({...newCreator, email: e.target.value})}
                    placeholder="creator@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    value={newCreator.phone || ""}
                    onChange={(e) => setNewCreator({...newCreator, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <Textarea
                  value={newCreator.bio || ""}
                  onChange={(e) => setNewCreator({...newCreator, bio: e.target.value})}
                  placeholder="Brief description of the creator..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Price ($)</label>
                  <Input
                    type="number"
                    value={newCreator.cardPrice || 100}
                    onChange={(e) => setNewCreator({...newCreator, cardPrice: Number.parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Avatar Emoji</label>
                  <Input
                    value={newCreator.avatar || "👤"}
                    onChange={(e) => setNewCreator({...newCreator, avatar: e.target.value})}
                    placeholder="👤"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Instagram</label>
                  <Input
                    value={newCreator.socialMedia?.instagram || ""}
                    onChange={(e) => setNewCreator({
                      ...newCreator,
                      socialMedia: { ...newCreator.socialMedia, instagram: e.target.value }
                    })}
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Twitter</label>
                  <Input
                    value={newCreator.socialMedia?.twitter || ""}
                    onChange={(e) => setNewCreator({
                      ...newCreator,
                      socialMedia: { ...newCreator.socialMedia, twitter: e.target.value }
                    })}
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">YouTube</label>
                  <Input
                    value={newCreator.socialMedia?.youtube || ""}
                    onChange={(e) => setNewCreator({
                      ...newCreator,
                      socialMedia: { ...newCreator.socialMedia, youtube: e.target.value }
                    })}
                    placeholder="@channel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">TikTok</label>
                  <Input
                    value={newCreator.socialMedia?.tiktok || ""}
                    onChange={(e) => setNewCreator({
                      ...newCreator,
                      socialMedia: { ...newCreator.socialMedia, tiktok: e.target.value }
                    })}
                    placeholder="@username"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Strategy Details (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Planned Launch Date</label>
                    <Input
                      type="date"
                      value={newCreator.strategy?.launchDate || ""}
                      onChange={(e) => setNewCreator({
                        ...newCreator,
                        strategy: { ...newCreator.strategy, launchDate: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Audience</label>
                    <Input
                      value={newCreator.strategy?.targetAudience || ""}
                      onChange={(e) => setNewCreator({
                        ...newCreator,
                        strategy: { ...newCreator.strategy, targetAudience: e.target.value }
                      })}
                      placeholder="e.g., Gaming community, 18-35"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddCreator}
                  disabled={!newCreator.name || !newCreator.category}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add Creator
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsAddingCreator(false)
                  onAddCreatorClose?.()
                }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Creator Confirmation Modal */}
      {deletingCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <CardTitle className="text-red-800">Delete Creator</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{deletingCreator.name}</span>?
                This action cannot be undone and will remove all their data from the pipeline.
              </p>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>This will permanently delete:</strong>
                </p>
                <ul className="text-sm text-red-700 mt-1 space-y-1">
                  <li>• Creator profile and contact information</li>
                  <li>• Pipeline progress and phase history</li>
                  <li>• Social media data and analytics</li>
                  <li>• All uploaded assets and documents</li>
                  <li>• Strategy notes and content plans</li>
                </ul>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeletingCreator(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteCreator(deletingCreator)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Permanently
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
