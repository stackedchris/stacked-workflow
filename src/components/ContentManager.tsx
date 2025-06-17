'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Upload,
  Image,
  Video,
  FileText,
  X,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  Tag,
  Search,
  Filter,
  Play,
  Pause,
  Plus
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface ContentItem {
  id: string
  name: string
  type: 'image' | 'video' | 'document'
  category: 'profile' | 'promotional' | 'behind-scenes' | 'announcement' | 'template'
  url: string
  thumbnail?: string
  size: number
  uploadDate: string
  assignedTo?: string[] // Creator IDs
  scheduledDate?: string
  postedDate?: string
  status: 'draft' | 'scheduled' | 'posted'
  tags: string[]
  description: string
  phase?: string
  platform?: string[]
  creatorId?: number // Primary assigned creator
  notes?: string
  priority?: 'low' | 'medium' | 'high'
}

interface Creator {
  id: number
  name: string
  category: string
  phase: string
  phaseNumber: number
}

interface ContentManagerProps {
  creators?: Creator[]
  onContentUpdate?: (content: ContentItem[]) => void
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    name: 'Kurama Gaming Setup Reveal',
    type: 'image',
    category: 'promotional',
    url: 'https://source.unsplash.com/800x600/?gaming,setup',
    thumbnail: 'https://source.unsplash.com/400x300/?gaming,setup',
    size: 2500000,
    uploadDate: '2025-06-15',
    creatorId: 1,
    assignedTo: ['1'],
    scheduledDate: '2025-06-18T14:00',
    status: 'scheduled',
    tags: ['gaming', 'setup', 'RGB', 'announcement'],
    description: 'High-quality photo of new gaming setup with RGB lighting for launch announcement',
    phase: 'Phase 2: Launch Week',
    platform: ['Instagram', 'Twitter'],
    priority: 'high',
    notes: 'Make sure to post at peak engagement time'
  },
  {
    id: '2',
    name: 'Behind the Scenes Training',
    type: 'video',
    category: 'behind-scenes',
    url: 'https://source.unsplash.com/800x600/?training,gaming',
    thumbnail: 'https://source.unsplash.com/400x300/?training,gaming',
    size: 45000000,
    uploadDate: '2025-06-14',
    creatorId: 1,
    assignedTo: ['1'],
    status: 'draft',
    tags: ['training', 'exclusive', 'behind-scenes'],
    description: 'Exclusive training session footage for Top 100 members',
    phase: 'Phase 2: Launch Week',
    platform: ['Instagram Story', 'YouTube'],
    priority: 'medium',
    notes: 'Wait for creator approval before scheduling'
  },
  {
    id: '3',
    name: 'Nina Stream Highlights',
    type: 'video',
    category: 'promotional',
    url: 'https://source.unsplash.com/800x600/?streaming,computer',
    thumbnail: 'https://source.unsplash.com/400x300/?streaming,computer',
    size: 38000000,
    uploadDate: '2025-06-13',
    creatorId: 2,
    assignedTo: ['2'],
    status: 'posted',
    postedDate: '2025-06-14T16:30',
    tags: ['streaming', 'highlights', 'community'],
    description: 'Best moments compilation for teaser video',
    phase: 'Phase 1: Drop Prep',
    platform: ['TikTok', 'Instagram Reels'],
    priority: 'high',
    notes: 'Performed very well, great engagement'
  },
  {
    id: '4',
    name: 'Edward DJ Set Photos',
    type: 'image',
    category: 'profile',
    url: 'https://source.unsplash.com/800x600/?dj,music',
    thumbnail: 'https://source.unsplash.com/400x300/?dj,music',
    size: 1800000,
    uploadDate: '2025-06-12',
    creatorId: 3,
    assignedTo: ['3'],
    scheduledDate: '2025-06-17T20:00',
    status: 'scheduled',
    tags: ['music', 'dj', 'live', 'performance'],
    description: 'Professional DJ set photos for social media',
    phase: 'Phase 3: Sell-Out Push',
    platform: ['Instagram', 'Twitter'],
    priority: 'medium',
    notes: 'Schedule for prime time posting'
  }
]

export default function ContentManager({ creators = [], onContentUpdate }: ContentManagerProps = {}) {
  // Use localStorage to persist content across page refreshes
  const [content, setContent] = useLocalStorage('stacked-content', mockContent)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCreator, setFilterCreator] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Notify parent component of content updates
  const updateContent = (newContent: ContentItem[]) => {
    setContent(newContent)
    onContentUpdate?.(newContent)
  }

  // Get creator name by ID
  const getCreatorName = (creatorId?: number) => {
    if (!creatorId) return 'Unassigned'
    const creator = creators.find(c => c.id === creatorId)
    return creator?.name || 'Unknown Creator'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'profile': return <Image className="w-4 h-4" />
      case 'promotional': return <Tag className="w-4 h-4" />
      case 'behind-scenes': return <Eye className="w-4 h-4" />
      case 'announcement': return <Calendar className="w-4 h-4" />
      case 'template': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    setIsUploading(true)
    setUploadProgress(0)

    // Process each file
    Array.from(files).forEach((file, index) => {
      // Validate file
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert(`File ${file.name} is too large. Maximum size is 100MB.`)
        return
      }

      const newContent: ContentItem = {
        id: `${Date.now()}_${index}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' :
              file.type.startsWith('video/') ? 'video' : 'document',
        category: 'promotional',
        url: URL.createObjectURL(file),
        thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        size: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'draft',
        tags: [],
        description: `Uploaded: ${file.name}`,
        priority: 'medium',
        notes: ''
      }

      // Add to content immediately for instant feedback
      const updatedContent = [...content, newContent]
      updateContent(updatedContent)
    })

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          alert(`✅ Successfully uploaded ${files.length} file(s)!`)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const filteredContent = content.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getCreatorName(item.creatorId).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    const matchesCreator = filterCreator === 'all' || item.creatorId?.toString() === filterCreator
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority

    return matchesSearch && matchesCategory && matchesStatus && matchesCreator && matchesPriority
  })

  const deleteContent = (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      const item = content.find(c => c.id === id)
      if (item?.url) {
        URL.revokeObjectURL(item.url) // Clean up memory
      }
      const updatedContent = content.filter(item => item.id !== id)
      updateContent(updatedContent)
      if (selectedContent?.id === id) {
        setSelectedContent(null)
      }
      alert('✅ Content deleted successfully!')
    }
  }

  const markAsPosted = (id: string) => {
    const updatedContent = content.map(item =>
      item.id === id ? {
        ...item,
        status: 'posted' as const,
        postedDate: new Date().toISOString()
      } : item
    )
    updateContent(updatedContent)
    if (selectedContent?.id === id) {
      setSelectedContent({
        ...selectedContent,
        status: 'posted',
        postedDate: new Date().toISOString()
      })
    }
    alert('✅ Content marked as posted!')
  }

  const assignToCreator = (contentId: string, creatorId: number) => {
    const updatedContent = content.map(item =>
      item.id === contentId ? {
        ...item,
        creatorId,
        assignedTo: [creatorId.toString()]
      } : item
    )
    updateContent(updatedContent)
    if (selectedContent?.id === contentId) {
      setSelectedContent({
        ...selectedContent,
        creatorId,
        assignedTo: [creatorId.toString()]
      })
    }
  }

  const updateContentStatus = (id: string, newStatus: 'draft' | 'scheduled' | 'posted') => {
    const updatedContent = content.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    )
    updateContent(updatedContent)
    if (selectedContent?.id === id) {
      setSelectedContent({ ...selectedContent, status: newStatus })
    }
  }

  const scheduleContent = (id: string, scheduledDate: string) => {
    const updatedContent = content.map(item =>
      item.id === id ? {
        ...item,
        status: 'scheduled' as const,
        scheduledDate
      } : item
    )
    updateContent(updatedContent)
    if (selectedContent?.id === id) {
      setSelectedContent({
        ...selectedContent,
        status: 'scheduled',
        scheduledDate
      })
    }
    alert('✅ Content scheduled successfully!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Manager</h2>
          <p className="text-gray-600">Upload, manage and schedule visual content for creators</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Content
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Uploading content...</span>
                <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList>
          <TabsTrigger value="library">Content Library</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Posts</TabsTrigger>
          <TabsTrigger value="templates">Content Templates</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="library">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search content, tags, or creators..."
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
                    <SelectItem value="profile">Profile</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="behind-scenes">Behind Scenes</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCreator} onValueChange={setFilterCreator}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Creators" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Creators</SelectItem>
                    {creators.map((creator) => (
                      <SelectItem key={creator.id} value={creator.id.toString()}>
                        {creator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Content Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContent.map((item) => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedContent?.id === item.id ? 'border-blue-500 shadow-md' : ''
                    }`}
                    onClick={() => setSelectedContent(item)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          {item.type === 'image' && item.thumbnail && (
                            <img
                              src={item.thumbnail}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {item.type === 'video' && (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                              <Play className="w-12 h-12 text-white opacity-80" />
                            </div>
                          )}
                          {item.type === 'document' && (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                              <FileText className="w-12 h-12 text-blue-500" />
                            </div>
                          )}

                          {/* Status Badge */}
                          <Badge
                            className={`absolute top-2 right-2 ${getStatusColor(item.status)}`}
                          >
                            {item.status}
                          </Badge>
                        </div>

                        {/* Content Info */}
                        <div>
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {getCategoryIcon(item.category)}
                            <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{getCreatorName(item.creatorId)}</p>
                        </div>

                        {/* Tags and Priority */}
                        <div className="flex flex-wrap gap-1">
                          {item.priority && (
                            <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </Badge>
                          )}
                          {item.tags.slice(0, 1).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {item.tags.length > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.tags.length - 1}
                            </Badge>
                          )}
                        </div>

                        {/* Quick Actions */}
                        {item.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsPosted(item.id)
                            }}
                            className="w-full text-xs mt-2"
                          >
                            ✅ Mark as Posted
                          </Button>
                        )}

                        {/* Meta Info */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{formatFileSize(item.size)}</span>
                          <span>{item.uploadDate}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredContent.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No content found matching your criteria</p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Upload First Content
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Content Details */}
            <div className="lg:col-span-1">
              {selectedContent ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Content Details</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingContent(true)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Preview */}
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {selectedContent.type === 'image' && selectedContent.url && (
                        <img
                          src={selectedContent.url}
                          alt={selectedContent.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {selectedContent.type === 'video' && (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <Button variant="ghost" size="sm" className="text-white">
                            <Play className="w-6 h-6" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">{selectedContent.name}</h4>
                      <p className="text-sm text-gray-600">{selectedContent.description}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <span className="capitalize">{selectedContent.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="capitalize">{selectedContent.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Size:</span>
                        <span>{formatFileSize(selectedContent.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <Badge className={getStatusColor(selectedContent.status)}>
                          {selectedContent.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Assigned to:</span>
                        <span>{getCreatorName(selectedContent.creatorId)}</span>
                      </div>
                      {selectedContent.priority && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Priority:</span>
                          <Badge className={getPriorityColor(selectedContent.priority)}>
                            {selectedContent.priority}
                          </Badge>
                        </div>
                      )}
                      {selectedContent.scheduledDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Scheduled:</span>
                          <span>{new Date(selectedContent.scheduledDate).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedContent.postedDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Posted:</span>
                          <span>{new Date(selectedContent.postedDate).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Tags</h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedContent.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {selectedContent.platform && (
                      <div>
                        <h5 className="font-medium mb-2">Platforms</h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedContent.platform.map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteContent(selectedContent.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Status Management */}
                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-3">Content Management</h5>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <Select
                              value={selectedContent.status}
                              onValueChange={(value: 'draft' | 'scheduled' | 'posted') =>
                                updateContentStatus(selectedContent.id, value)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="posted">Posted</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Priority</label>
                            <Select
                              value={selectedContent.priority || 'medium'}
                              onValueChange={(value: 'low' | 'medium' | 'high') => {
                                const updatedContent = { ...selectedContent, priority: value }
                                setSelectedContent(updatedContent)
                                const newContent = content.map(item =>
                                  item.id === selectedContent.id ? updatedContent : item
                                )
                                updateContent(newContent)
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Assign to Creator</label>
                          <Select
                            value={selectedContent.creatorId?.toString() || ''}
                            onValueChange={(value) => {
                              if (value) {
                                assignToCreator(selectedContent.id, Number.parseInt(value))
                              }
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select creator" />
                            </SelectTrigger>
                            <SelectContent>
                              {creators.map((creator) => (
                                <SelectItem key={creator.id} value={creator.id.toString()}>
                                  {creator.name} - {creator.category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedContent.status === 'scheduled' && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Schedule Date & Time</label>
                            <Input
                              type="datetime-local"
                              value={selectedContent.scheduledDate ?
                                new Date(selectedContent.scheduledDate).toISOString().slice(0, 16) : ''
                              }
                              onChange={(e) => scheduleContent(selectedContent.id, e.target.value)}
                              className="w-full"
                            />
                          </div>
                        )}

                        {selectedContent.status === 'scheduled' && (
                          <Button
                            onClick={() => markAsPosted(selectedContent.id)}
                            className="w-full"
                          >
                            ✅ Mark as Posted
                          </Button>
                        )}

                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <Textarea
                            value={selectedContent.description}
                            onChange={(e) => {
                              const updatedContent = { ...selectedContent, description: e.target.value }
                              setSelectedContent(updatedContent)
                              const newContent = content.map(item =>
                                item.id === selectedContent.id ? updatedContent : item
                              )
                              updateContent(newContent)
                            }}
                            placeholder="Add description..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Notes</label>
                          <Textarea
                            value={selectedContent.notes || ''}
                            onChange={(e) => {
                              const updatedContent = { ...selectedContent, notes: e.target.value }
                              setSelectedContent(updatedContent)
                              const newContent = content.map(item =>
                                item.id === selectedContent.id ? updatedContent : item
                              )
                              updateContent(newContent)
                            }}
                            placeholder="Add notes or instructions..."
                            rows={2}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Add Tags</label>
                          <Input
                            placeholder="Type tag and press Enter"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                const newTag = e.currentTarget.value.trim().toLowerCase()
                                if (!selectedContent.tags.includes(newTag)) {
                                  const updatedContent = {
                                    ...selectedContent,
                                    tags: [...selectedContent.tags, newTag]
                                  }
                                  setSelectedContent(updatedContent)
                                  const newContent = content.map(item =>
                                    item.id === selectedContent.id ? updatedContent : item
                                  )
                                  updateContent(newContent)
                                }
                                e.currentTarget.value = ''
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select content to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Content</CardTitle>
              <CardDescription>Content scheduled for future publishing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.filter(item => item.status === 'scheduled').map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.type === 'image' && <Image className="w-6 h-6 text-gray-500" />}
                      {item.type === 'video' && <Video className="w-6 h-6 text-gray-500" />}
                      {item.type === 'document' && <FileText className="w-6 h-6 text-gray-500" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        Scheduled for {item.scheduledDate ? new Date(item.scheduledDate).toLocaleString() : 'No date set'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">Assigned to: {getCreatorName(item.creatorId)}</span>
                        {item.priority && (
                          <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => markAsPosted(item.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        ✅ Posted
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedContent(item)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {content.filter(item => item.status === 'scheduled').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No scheduled content. Schedule some content to see it here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Content Templates</CardTitle>
              <CardDescription>Reusable content formats and layouts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">Content templates coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Analytics and insights for your content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">Performance analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
