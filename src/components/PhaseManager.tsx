'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Edit,
  Save,
  X,
  CheckCircle2,
  Clock,
  Target,
  Calendar,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Zap,
  Minus,
  Upload,
  Image,
  Video,
  FileText,
  Trash2,
  Download,
  Eye
} from 'lucide-react'

interface PhaseTask {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate?: string
  assignedTo?: string
  priority: 'high' | 'medium' | 'low'
  media?: TaskMedia[]
}

interface TaskMedia {
  id: string
  name: string
  type: 'image' | 'video' | 'document'
  url: string
  size: number
  uploadDate: string
}

interface CreatorPhase {
  id: number
  name: string
  description: string
  color: string
  estimatedDays: number
  tasks: PhaseTask[]
  isActive: boolean
  completedAt?: string
}

interface PhaseManagerProps {
  creatorId: number
  creatorName: string
  currentPhase: number
  onPhaseUpdate: (phases: CreatorPhase[]) => void
}

const defaultPhaseTemplates: Omit<CreatorPhase, 'tasks' | 'isActive'>[] = [
  {
    id: 0,
    name: "Strategy Call",
    description: "Initial planning and goal setting",
    color: "blue",
    estimatedDays: 3
  },
  {
    id: 1,
    name: "Drop Prep",
    description: "Content creation and marketing preparation",
    color: "yellow",
    estimatedDays: 7
  },
  {
    id: 2,
    name: "Launch Week",
    description: "Active launch and promotion",
    color: "green",
    estimatedDays: 7
  },
  {
    id: 3,
    name: "Sell-Out Push",
    description: "Final sales push and urgency marketing",
    color: "orange",
    estimatedDays: 5
  },
  {
    id: 4,
    name: "Post-Sellout",
    description: "Follow-up and relationship building",
    color: "purple",
    estimatedDays: 3
  }
]

const defaultTasks: Record<number, PhaseTask[]> = {
  0: [
    { id: '0-1', title: 'Initial strategy call', description: 'Discuss goals, audience, and pricing', completed: false, priority: 'high', media: [] },
    { id: '0-2', title: 'Define target audience', description: 'Research and document target demographics', completed: false, priority: 'high', media: [] },
    { id: '0-3', title: 'Set pricing strategy', description: 'Determine card price and total quantity', completed: false, priority: 'medium', media: [] },
    { id: '0-4', title: 'Content strategy planning', description: 'Plan content themes and posting schedule', completed: false, priority: 'medium', media: [] }
  ],
  1: [
    { id: '1-1', title: 'Create teaser content', description: 'Design and produce announcement materials', completed: false, priority: 'high', media: [] },
    { id: '1-2', title: 'Set up tracking systems', description: 'Configure analytics and monitoring tools', completed: false, priority: 'medium', media: [] },
    { id: '1-3', title: 'Prepare launch assets', description: 'Finalize all marketing materials', completed: false, priority: 'high', media: [] },
    { id: '1-4', title: 'Schedule content calendar', description: 'Plan and schedule all launch week content', completed: false, priority: 'medium', media: [] }
  ],
  2: [
    { id: '2-1', title: 'Launch announcement', description: 'Post official launch across all platforms', completed: false, priority: 'high', media: [] },
    { id: '2-2', title: 'Daily engagement posts', description: 'Share behind-the-scenes and updates', completed: false, priority: 'high', media: [] },
    { id: '2-3', title: 'Community interaction', description: 'Respond to comments and build excitement', completed: false, priority: 'medium', media: [] },
    { id: '2-4', title: 'Monitor sales progress', description: 'Track sales and adjust strategy as needed', completed: false, priority: 'high', media: [] }
  ],
  3: [
    { id: '3-1', title: 'Create urgency content', description: 'Post about limited quantities remaining', completed: false, priority: 'high', media: [] },
    { id: '3-2', title: 'Final push campaign', description: 'Execute intensive sales campaign', completed: false, priority: 'high', media: [] },
    { id: '3-3', title: 'Leverage FOMO', description: 'Share social proof and testimonials', completed: false, priority: 'medium', media: [] },
    { id: '3-4', title: 'Last chance messaging', description: 'Final opportunity communications', completed: false, priority: 'high', media: [] }
  ],
  4: [
    { id: '4-1', title: 'Thank you message', description: 'Express gratitude to all supporters', completed: false, priority: 'medium', media: [] },
    { id: '4-2', title: 'Deliver exclusive content', description: 'Provide promised exclusive materials', completed: false, priority: 'high', media: [] },
    { id: '4-3', title: 'Gather feedback', description: 'Collect insights for future improvements', completed: false, priority: 'low', media: [] },
    { id: '4-4', title: 'Plan next campaign', description: 'Begin planning for future opportunities', completed: false, priority: 'low', media: [] }
  ]
}

export default function PhaseManager({ creatorId, creatorName, currentPhase, onPhaseUpdate }: PhaseManagerProps) {
  const [phases, setPhases] = useState<CreatorPhase[]>(() =>
    defaultPhaseTemplates.map(template => ({
      ...template,
      tasks: defaultTasks[template.id] || [],
      isActive: template.id === currentPhase
    }))
  )
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([currentPhase]))
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const togglePhaseExpansion = (phaseId: number) => {
    const newExpanded = new Set(expandedPhases)
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId)
    } else {
      newExpanded.add(phaseId)
    }
    setExpandedPhases(newExpanded)
  }

  const toggleTaskCompletion = (phaseId: number, taskId: string) => {
    const updatedPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        }
      }
      return phase
    })
    setPhases(updatedPhases)
    onPhaseUpdate(updatedPhases)
  }

  const addNewTask = (phaseId: number) => {
    const newTask: PhaseTask = {
      id: `${phaseId}-${Date.now()}`,
      title: 'New Task',
      description: 'Task description',
      completed: false,
      priority: 'medium',
      media: []
    }

    const updatedPhases = phases.map(phase =>
      phase.id === phaseId
        ? { ...phase, tasks: [...phase.tasks, newTask] }
        : phase
    )
    setPhases(updatedPhases)
    setEditingTask(newTask.id)
    onPhaseUpdate(updatedPhases)
  }

  const updateTask = (phaseId: number, taskId: string, updates: Partial<PhaseTask>) => {
    const updatedPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        }
      }
      return phase
    })
    setPhases(updatedPhases)
    onPhaseUpdate(updatedPhases)
  }

  const deleteTask = (phaseId: number, taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const updatedPhases = phases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            tasks: phase.tasks.filter(task => task.id !== taskId)
          }
        }
        return phase
      })
      setPhases(updatedPhases)
      onPhaseUpdate(updatedPhases)
    }
  }

  const handleMediaUpload = (phaseId: number, taskId: string, files: FileList | null) => {
    if (!files) return

    setUploadingMedia(taskId)

    // Process each file
    Array.from(files).forEach((file, index) => {
      // Validate file
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert(`File ${file.name} is too large. Maximum size is 50MB.`)
        return
      }

      const newMedia: TaskMedia = {
        id: `${taskId}-media-${Date.now()}-${index}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' :
              file.type.startsWith('video/') ? 'video' : 'document',
        url: URL.createObjectURL(file),
        size: file.size,
        uploadDate: new Date().toISOString()
      }

      // Add media to task
      const updatedPhases = phases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            tasks: phase.tasks.map(task =>
              task.id === taskId 
                ? { ...task, media: [...(task.media || []), newMedia] }
                : task
            )
          }
        }
        return phase
      })
      
      setPhases(updatedPhases)
      onPhaseUpdate(updatedPhases)
    })

    setTimeout(() => {
      setUploadingMedia(null)
      alert(`✅ Successfully uploaded ${files.length} file(s)!`)
    }, 1000)
  }

  const removeMedia = (phaseId: number, taskId: string, mediaId: string) => {
    if (confirm('Are you sure you want to remove this media?')) {
      const updatedPhases = phases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            tasks: phase.tasks.map(task => {
              if (task.id === taskId) {
                // Clean up object URL
                const mediaToRemove = task.media?.find(m => m.id === mediaId)
                if (mediaToRemove?.url) {
                  URL.revokeObjectURL(mediaToRemove.url)
                }
                return {
                  ...task,
                  media: task.media?.filter(m => m.id !== mediaId) || []
                }
              }
              return task
            })
          }
        }
        return phase
      })
      
      setPhases(updatedPhases)
      onPhaseUpdate(updatedPhases)
    }
  }

  const downloadMedia = (media: TaskMedia) => {
    const a = document.createElement('a')
    a.href = media.url
    a.download = media.name
    a.click()
  }

  const previewMedia = (media: TaskMedia) => {
    if (media.type === 'image' || media.type === 'video') {
      window.open(media.url, '_blank')
    } else {
      downloadMedia(media)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  const getPhaseProgress = (phase: CreatorPhase) => {
    if (phase.tasks.length === 0) return 0
    const completedTasks = phase.tasks.filter(task => task.completed).length
    return (completedTasks / phase.tasks.length) * 100
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-3 h-3" />
      case 'medium': return <Zap className="w-3 h-3" />
      case 'low': return <Minus className="w-3 h-3" />
      default: return <Minus className="w-3 h-3" />
    }
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4 text-blue-500" />
      case 'video': return <Video className="w-4 h-4 text-purple-500" />
      case 'document': return <FileText className="w-4 h-4 text-green-500" />
      default: return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getPhaseColorClass = (color: string, isActive: boolean) => {
    const baseColor = isActive ? 'border-2' : 'border'
    switch (color) {
      case 'blue': return `${baseColor} border-blue-500 ${isActive ? 'bg-blue-50' : ''}`
      case 'yellow': return `${baseColor} border-yellow-500 ${isActive ? 'bg-yellow-50' : ''}`
      case 'green': return `${baseColor} border-green-500 ${isActive ? 'bg-green-50' : ''}`
      case 'orange': return `${baseColor} border-orange-500 ${isActive ? 'bg-orange-50' : ''}`
      case 'purple': return `${baseColor} border-purple-500 ${isActive ? 'bg-purple-50' : ''}`
      default: return `${baseColor} border-gray-300`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Phase Management</h3>
          <p className="text-gray-600">Customize phases and tasks for {creatorName}</p>
        </div>
      </div>

      <div className="space-y-4">
        {phases.map((phase) => {
          const progress = getPhaseProgress(phase)
          const isExpanded = expandedPhases.has(phase.id)

          return (
            <Card key={phase.id} className={getPhaseColorClass(phase.color, phase.isActive)}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => togglePhaseExpansion(phase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>Phase {phase.id}: {phase.name}</span>
                        {phase.isActive && <Badge className="bg-green-100 text-green-800">Current</Badge>}
                      </CardTitle>
                      <CardDescription>{phase.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{phase.tasks.filter(t => t.completed).length}/{phase.tasks.length} tasks</p>
                      <div className="w-24">
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      ~{phase.estimatedDays} days
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  <div className="space-y-3">
                    {phase.tasks.map((task) => (
                      <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTaskCompletion(phase.id, task.id)}
                          className="mt-1"
                        />

                        <div className="flex-1">
                          {editingTask === task.id ? (
                            <div className="space-y-3">
                              <Input
                                value={task.title}
                                onChange={(e) => updateTask(phase.id, task.id, { title: e.target.value })}
                                className="font-medium"
                                placeholder="Task title"
                              />
                              <Textarea
                                value={task.description}
                                onChange={(e) => updateTask(phase.id, task.id, { description: e.target.value })}
                                rows={2}
                                placeholder="Task description"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium mb-1">Priority</label>
                                  <Select
                                    value={task.priority}
                                    onValueChange={(value: 'high' | 'medium' | 'low') => 
                                      updateTask(phase.id, task.id, { priority: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="high">
                                        <div className="flex items-center space-x-2">
                                          <AlertTriangle className="w-3 h-3 text-red-600" />
                                          <span>High Priority</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="medium">
                                        <div className="flex items-center space-x-2">
                                          <Zap className="w-3 h-3 text-yellow-600" />
                                          <span>Medium Priority</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="low">
                                        <div className="flex items-center space-x-2">
                                          <Minus className="w-3 h-3 text-blue-600" />
                                          <span>Low Priority</span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Due Date</label>
                                  <Input
                                    type="date"
                                    value={task.dueDate || ''}
                                    onChange={(e) => updateTask(phase.id, task.id, { dueDate: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Assigned To</label>
                                <Input
                                  value={task.assignedTo || ''}
                                  onChange={(e) => updateTask(phase.id, task.id, { assignedTo: e.target.value })}
                                  placeholder="Team member or creator"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" onClick={() => setEditingTask(null)}>
                                  <Save className="w-3 h-3 mr-1" />
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteTask(phase.id, task.id)}>
                                  <X className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                  {task.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <Badge className={`text-xs border ${getPriorityColor(task.priority)}`}>
                                    <div className="flex items-center space-x-1">
                                      {getPriorityIcon(task.priority)}
                                      <span className="capitalize">{task.priority}</span>
                                    </div>
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingTask(task.id)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className={`text-sm mt-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                                {task.description}
                              </p>
                              {(task.dueDate || task.assignedTo) && (
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  {task.dueDate && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  {task.assignedTo && (
                                    <div className="flex items-center space-x-1">
                                      <Target className="w-3 h-3" />
                                      <span>Assigned: {task.assignedTo}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Media Section */}
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Attachments ({task.media?.length || 0})</span>
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        fileInputRef.current?.click()
                                        setUploadingMedia(task.id)
                                      }}
                                      disabled={uploadingMedia === task.id}
                                    >
                                      <Upload className="w-3 h-3 mr-1" />
                                      {uploadingMedia === task.id ? 'Uploading...' : 'Add Media'}
                                    </Button>
                                  </div>
                                </div>

                                {/* Media Grid */}
                                {task.media && task.media.length > 0 && (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {task.media.map((media) => (
                                      <div key={media.id} className="border rounded-lg p-2 hover:bg-gray-50">
                                        <div className="flex items-center space-x-2 mb-1">
                                          {getMediaIcon(media.type)}
                                          <span className="text-xs font-medium truncate">{media.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">{formatFileSize(media.size)}</p>
                                        <div className="flex space-x-1">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => previewMedia(media)}
                                            className="flex-1 text-xs"
                                          >
                                            <Eye className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => downloadMedia(media)}
                                            className="flex-1 text-xs"
                                          >
                                            <Download className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => removeMedia(phase.id, task.id, media.id)}
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {(!task.media || task.media.length === 0) && (
                                  <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-500">No attachments yet</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addNewTask(phase.id)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Hidden file input for media uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        multiple
        className="hidden"
        onChange={(e) => {
          if (uploadingMedia && e.target.files) {
            // Find the phase and task for the current upload
            for (const phase of phases) {
              const task = phase.tasks.find(t => t.id === uploadingMedia)
              if (task) {
                handleMediaUpload(phase.id, task.id, e.target.files)
                break
              }
            }
          }
          // Reset the input
          e.target.value = ''
        }}
      />
    </div>
  )
}