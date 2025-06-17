'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Eye,
  Edit,
  Clock,
  User,
  Image,
  Video,
  FileText
} from 'lucide-react'

interface ContentItem {
  id: string
  name: string
  type: 'image' | 'video' | 'document'
  category: string
  status: 'draft' | 'scheduled' | 'posted'
  creatorId?: number
  creatorName?: string
  scheduledDate?: string
  postedDate?: string
  priority?: 'low' | 'medium' | 'high'
  platform?: string[]
  description: string
}

interface Creator {
  id: number
  name: string
  category: string
  avatar: string
}

interface ContentCalendarProps {
  content?: ContentItem[]
  creators?: Creator[]
  onContentUpdate?: (content: ContentItem[]) => void
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    name: 'Kurama Gaming Setup Reveal',
    type: 'image',
    category: 'promotional',
    status: 'scheduled',
    creatorId: 1,
    creatorName: 'Kurama',
    scheduledDate: '2025-01-18T14:00',
    priority: 'high',
    platform: ['Instagram', 'Twitter'],
    description: 'High-quality photo of new gaming setup with RGB lighting'
  },
  {
    id: '2',
    name: 'Behind the Scenes Training',
    type: 'video',
    category: 'behind-scenes',
    status: 'scheduled',
    creatorId: 1,
    creatorName: 'Kurama',
    scheduledDate: '2025-01-19T16:30',
    priority: 'medium',
    platform: ['Instagram Story', 'YouTube'],
    description: 'Exclusive training session footage'
  },
  {
    id: '3',
    name: 'Nina Stream Highlights',
    type: 'video',
    category: 'promotional',
    status: 'scheduled',
    creatorId: 2,
    creatorName: 'Nina Lin',
    scheduledDate: '2025-01-20T18:00',
    priority: 'high',
    platform: ['TikTok', 'Instagram Reels'],
    description: 'Best moments compilation for teaser video'
  },
  {
    id: '4',
    name: 'Edward DJ Set Photos',
    type: 'image',
    category: 'profile',
    status: 'scheduled',
    creatorId: 3,
    creatorName: 'Edward So',
    scheduledDate: '2025-01-21T20:00',
    priority: 'medium',
    platform: ['Instagram', 'Twitter'],
    description: 'Professional DJ set photos for social media'
  },
  {
    id: '5',
    name: 'Launch Week Announcement',
    type: 'image',
    category: 'announcement',
    status: 'scheduled',
    creatorId: 1,
    creatorName: 'Kurama',
    scheduledDate: '2025-01-22T12:00',
    priority: 'high',
    platform: ['Instagram', 'Twitter', 'TikTok'],
    description: 'Official launch announcement with countdown'
  },
  {
    id: '6',
    name: 'Community Q&A Session',
    type: 'video',
    category: 'behind-scenes',
    status: 'scheduled',
    creatorId: 2,
    creatorName: 'Nina Lin',
    scheduledDate: '2025-01-23T15:00',
    priority: 'medium',
    platform: ['YouTube', 'Instagram Live'],
    description: 'Live Q&A with community members'
  },
  {
    id: '7',
    name: 'Music Production Teaser',
    type: 'video',
    category: 'teaser',
    status: 'scheduled',
    creatorId: 3,
    creatorName: 'Edward So',
    scheduledDate: '2025-01-24T19:00',
    priority: 'high',
    platform: ['TikTok', 'Instagram Reels'],
    description: 'Sneak peek of new music production'
  }
]

export default function ContentCalendar({ 
  content = mockContent, 
  creators = [], 
  onContentUpdate 
}: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [filterCreator, setFilterCreator] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  // Filter content based on current filters
  const filteredContent = useMemo(() => {
    return content.filter(item => {
      const matchesCreator = filterCreator === 'all' || item.creatorId?.toString() === filterCreator
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus
      const matchesType = filterType === 'all' || item.type === filterType
      return matchesCreator && matchesStatus && matchesType
    })
  }, [content, filterCreator, filterStatus, filterType])

  // Get content for a specific date
  const getContentForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredContent.filter(item => {
      if (item.scheduledDate) {
        return item.scheduledDate.split('T')[0] === dateStr
      }
      if (item.postedDate) {
        return item.postedDate.split('T')[0] === dateStr
      }
      return false
    })
  }

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDateObj = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDateObj))
      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const navigateToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-3 h-3" />
      case 'video': return <Video className="w-3 h-3" />
      case 'document': return <FileText className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-blue-500'
      default: return 'border-l-gray-300'
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const calendarDays = generateCalendarDays()
  const selectedDateContent = selectedDate ? getContentForDate(selectedDate) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Calendar</h2>
          <p className="text-gray-600">Schedule and track content across all creators</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={navigateToToday}>
            <Calendar className="w-4 h-4 mr-2" />
            Today
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Content
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filterCreator} onValueChange={setFilterCreator}>
              <SelectTrigger className="w-48">
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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const dayContent = getContentForDate(date)
                  const isSelected = selectedDate?.toDateString() === date.toDateString()
                  
                  return (
                    <div
                      key={index}
                      className={`
                        min-h-24 p-1 border rounded cursor-pointer transition-colors
                        ${isCurrentMonth(date) ? 'bg-white' : 'bg-gray-50'}
                        ${isToday(date) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                        ${isSelected ? 'border-black bg-gray-100' : ''}
                        hover:bg-gray-50
                      `}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isCurrentMonth(date) ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayContent.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className={`
                              text-xs p-1 rounded border-l-2 truncate
                              ${getStatusColor(item.status)}
                              ${getPriorityColor(item.priority)}
                            `}
                            title={`${item.name} - ${item.creatorName}`}
                          >
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(item.type)}
                              <span className="truncate">{item.name}</span>
                            </div>
                          </div>
                        ))}
                        {dayContent.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayContent.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'Select a Date'}
              </CardTitle>
              <CardDescription>
                {selectedDate ? `${selectedDateContent.length} content item(s) scheduled` : 'Click on a date to view content'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-3">
                  {selectedDateContent.length > 0 ? (
                    selectedDateContent.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 border rounded-lg border-l-4 ${getPriorityColor(item.priority)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(item.type)}
                            <span className="font-medium text-sm">{item.name}</span>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                            {item.status}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{item.creatorName}</span>
                          </div>
                          {item.scheduledDate && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(item.scheduledDate).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                          )}
                        </div>
                        
                        {item.platform && item.platform.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.platform.map((platform) => (
                              <Badge key={platform} variant="secondary" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex space-x-1 mt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No content scheduled for this date</p>
                      <Button size="sm" className="mt-2">
                        <Plus className="w-3 h-3 mr-1" />
                        Schedule Content
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Select a date to view scheduled content</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Scheduled</p>
                <p className="text-2xl font-bold">{filteredContent.filter(c => c.status === 'scheduled').length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Posted This Month</p>
                <p className="text-2xl font-bold">{filteredContent.filter(c => c.status === 'posted').length}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold">{filteredContent.filter(c => c.priority === 'high').length}</p>
              </div>
              <Badge className="bg-red-100 text-red-800">!</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Creators</p>
                <p className="text-2xl font-bold">{new Set(filteredContent.map(c => c.creatorId)).size}</p>
              </div>
              <User className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}