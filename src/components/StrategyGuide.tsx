'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Target,
  DollarSign,
  Clock,
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  CheckCircle2,
  Copy,
  Calendar,
  Zap,
  Award,
  BarChart3,
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  Link
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface Creator {
  id: number
  name: string
  category: string
  phase: string
  phaseNumber: number
  cardsSold: number
  totalCards: number
  cardPrice: number
  salesVelocity: string
}

interface CustomStrategy {
  id: string
  title: string
  description: string
  content: string
  phase: number[]
  category: string[]
  priority: 'high' | 'medium' | 'low'
  createdAt: string
  lastUsed?: string
  useCount: number
  linkedCreators: number[]
  tasks: string[]
}

interface StrategyGuideProps {
  creators?: Creator[]
}

const strategySteps = [
  {
    id: 1,
    title: "Strategic Pricing & Messaging",
    icon: <DollarSign className="w-6 h-6" />,
    description: "Leverage price drops and limited-time offers to create urgency",
    content: `Start by understanding what your fans are willing to pay. If you decide to lower the price, let's use that to your advantage with a limited-time offer.`,
    suggestedReel: `"You guys asked—I listened. I'm dropping the price for a short time so more of you can join. Still only 100 spots. Once they're gone, they're gone."`,
    tips: [
      "Use a countdown sticker and progress bar to create urgency",
      "Show 'Original Price vs. Now' on-screen to highlight savings",
      "Emphasize the limited quantity (only 100 spots)"
    ],
    phase: [1, 2]
  },
  {
    id: 2,
    title: "Scarcity + Real-Time Progress",
    icon: <Target className="w-6 h-6" />,
    description: "Make the limited availability clear to drive demand",
    content: `There are only 100 spots, let's make that clear to drive demand.`,
    suggestedReel: `"My cards are live and selling fast, only XX left. Don't miss your chance."`,
    tips: [
      "Pin a story highlight showing live updates like: 'Sold 68/100'",
      "Add a dynamic counter to your bio if possible",
      "Post regular updates as numbers decrease"
    ],
    phase: [2, 3]
  },
  {
    id: 3,
    title: "Highlight the Inner Chat",
    icon: <MessageSquare className="w-6 h-6" />,
    description: "Position this as direct access, not just content",
    content: `This is more than content, it's direct access to you.`,
    suggestedReel: `"This isn't just a chat. This is my group. We talk about everything, music, life, whatever's on our minds. And I'm here every day."`,
    tips: [
      "Show blurred screen recordings or voice replies",
      "Reinforce that this is daily connection that only 100 people get",
      "Highlight the personal, intimate nature of the access"
    ],
    phase: [1, 2, 3]
  },
  {
    id: 4,
    title: "Perks & Value for Holders",
    icon: <Star className="w-6 h-6" />,
    description: "Show this is more than a subscription - it's a collectible with real perks",
    content: `Let fans know this is more than just a subscription, it's a collectible with real perks.`,
    suggestedReel: `"This isn't just content. It's access. Some holders are getting concert invites, exclusive drops, and early access to everything I do."`,
    tips: [
      "Free access to events (livestream, concert, party)",
      "A permanent '1 of 100' badge",
      "Holders get to vote or participate in special projects"
    ],
    phase: [2, 3, 4]
  }
]

const nextStepsTemplate = {
  pricingFinalization: "Will there be an intro price drop? How long will it last?",
  ctaAlignment: "Choose which messages to use in each Reel",
  reelScheduling: "Aim for 3–5 short Reels over the next week",
  adBoosting: "Send us ad code access so we can promote your Reels directly"
}

export default function StrategyGuide({ creators = [] }: StrategyGuideProps) {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)
  const [activeStep, setActiveStep] = useState(1)
  const [customStrategies, setCustomStrategies] = useLocalStorage<CustomStrategy[]>('stacked-custom-strategies', [])
  const [creatorStrategies, setCreatorStrategies] = useLocalStorage<Record<number, string[]>>('stacked-creator-strategies', {})
  const [isCreatingStrategy, setIsCreatingStrategy] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<CustomStrategy | null>(null)
  const [newStrategy, setNewStrategy] = useState<Partial<CustomStrategy>>({
    title: '',
    description: '',
    content: '',
    phase: [],
    category: [],
    priority: 'medium',
    tasks: []
  })

  // Filter creators by phase for strategy recommendations
  const creatorsByPhase = useMemo(() => {
    return creators.reduce((acc, creator) => {
      if (!acc[creator.phaseNumber]) {
        acc[creator.phaseNumber] = []
      }
      acc[creator.phaseNumber].push(creator)
      return acc
    }, {} as Record<number, Creator[]>)
  }, [creators])

  const getPhaseRecommendations = (phaseNumber: number) => {
    return strategySteps.filter(step => step.phase.includes(phaseNumber))
  }

  const getCustomStrategiesForCreator = (creator: Creator) => {
    const linkedStrategies = customStrategies.filter(strategy => 
      strategy.linkedCreators.includes(creator.id) ||
      strategy.phase.includes(creator.phaseNumber) ||
      strategy.category.includes(creator.category)
    )
    return linkedStrategies
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // No popup - just silent copy
  }

  const handleCreateStrategy = () => {
    if (!newStrategy.title || !newStrategy.content) return

    const strategy: CustomStrategy = {
      id: `custom-${Date.now()}`,
      title: newStrategy.title || '',
      description: newStrategy.description || '',
      content: newStrategy.content || '',
      phase: newStrategy.phase || [],
      category: newStrategy.category || [],
      priority: newStrategy.priority || 'medium',
      createdAt: new Date().toISOString(),
      useCount: 0,
      linkedCreators: newStrategy.linkedCreators || [],
      tasks: newStrategy.tasks || []
    }

    setCustomStrategies([...customStrategies, strategy])
    setNewStrategy({
      title: '',
      description: '',
      content: '',
      phase: [],
      category: [],
      priority: 'medium',
      tasks: []
    })
    setIsCreatingStrategy(false)
  }

  const handleEditStrategy = (strategy: CustomStrategy) => {
    setEditingStrategy(strategy)
    setNewStrategy(strategy)
    setIsCreatingStrategy(true)
  }

  const handleSaveEdit = () => {
    if (!editingStrategy || !newStrategy.title || !newStrategy.content) return

    const updatedStrategies = customStrategies.map(s =>
      s.id === editingStrategy.id ? { ...editingStrategy, ...newStrategy } : s
    )
    setCustomStrategies(updatedStrategies)
    setEditingStrategy(null)
    setIsCreatingStrategy(false)
    setNewStrategy({
      title: '',
      description: '',
      content: '',
      phase: [],
      category: [],
      priority: 'medium',
      tasks: []
    })
  }

  const handleDeleteStrategy = (strategyId: string) => {
    setCustomStrategies(customStrategies.filter(s => s.id !== strategyId))
  }

  const handleLinkStrategyToCreator = (strategyId: string, creatorId: number) => {
    const updatedStrategies = customStrategies.map(strategy => {
      if (strategy.id === strategyId) {
        const linkedCreators = strategy.linkedCreators.includes(creatorId)
          ? strategy.linkedCreators.filter(id => id !== creatorId)
          : [...strategy.linkedCreators, creatorId]
        return { ...strategy, linkedCreators }
      }
      return strategy
    })
    setCustomStrategies(updatedStrategies)
  }

  const handleUseStrategy = (strategy: CustomStrategy) => {
    const updatedStrategies = customStrategies.map(s =>
      s.id === strategy.id 
        ? { ...s, useCount: s.useCount + 1, lastUsed: new Date().toISOString() }
        : s
    )
    setCustomStrategies(updatedStrategies)
    copyToClipboard(strategy.content)
  }

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Top 100 Launch Strategy Guide</h2>
          <p className="text-gray-600">Internal strategy templates and creator-specific recommendations</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsCreatingStrategy(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Strategy
          </Button>
          <Badge className="bg-blue-100 text-blue-800">
            <Award className="w-4 h-4 mr-1" />
            Internal Resource
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Strategy Overview</TabsTrigger>
          <TabsTrigger value="creators">Creator-Specific</TabsTrigger>
          <TabsTrigger value="custom">Custom Strategies</TabsTrigger>
          <TabsTrigger value="templates">Content Templates</TabsTrigger>
          <TabsTrigger value="tracking">Progress Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Target className="w-6 h-6 mr-2" />
                  Mission: Help Creators Sell Out Top 100 Memberships
                </CardTitle>
                <CardDescription className="text-blue-700">
                  This strategy focuses on what drives fans to take action: limited access, price drops, and personal connection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium">Strategic Pricing</h4>
                    <p className="text-sm text-gray-600">Limited-time offers & urgency</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium">Scarcity Marketing</h4>
                    <p className="text-sm text-gray-600">Only 100 spots available</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium">Personal Access</h4>
                    <p className="text-sm text-gray-600">Direct creator connection</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <h3 className="text-xl font-semibold">4-Step Strategy Framework</h3>
              {strategySteps.map((step, index) => (
                <Card
                  key={step.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeStep === step.id ? 'border-blue-500 shadow-md' : ''
                  }`}
                  onClick={() => setActiveStep(step.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          activeStep === step.id ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {step.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold">{index + 1}. {step.title}</h4>
                          <div className="flex space-x-1">
                            {step.phase.map(phaseNum => (
                              <Badge key={phaseNum} className={getPhaseColor(phaseNum)}>
                                Phase {phaseNum}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{step.description}</p>

                        {activeStep === step.id && (
                          <div className="space-y-4 mt-4 pt-4 border-t">
                            <div>
                              <h5 className="font-medium mb-2">Strategy Details:</h5>
                              <p className="text-gray-700">{step.content}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">Suggested Reel Script:</h5>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(step.suggestedReel)}
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <p className="text-gray-700 italic">"{step.suggestedReel}"</p>
                            </div>

                            <div>
                              <h5 className="font-medium mb-2">Implementation Tips:</h5>
                              <ul className="space-y-1">
                                {step.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex} className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="creators">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Select Creator</CardTitle>
                  <CardDescription>Get personalized strategy recommendations</CardDescription>
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
                        <div>
                          <h4 className="font-medium">{creator.name}</h4>
                          <p className="text-sm text-gray-600">{creator.category}</p>
                        </div>
                        <Badge className={getPhaseColor(creator.phaseNumber)}>
                          Phase {creator.phaseNumber}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{creator.cardsSold}/100 sold</span>
                          <span>${(creator.cardsSold * creator.cardPrice).toLocaleString()} revenue</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {selectedCreator ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Strategy for {selectedCreator.name}</CardTitle>
                      <CardDescription>
                        Current Phase: {selectedCreator.phase} • {selectedCreator.cardsSold}/100 cards sold
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">Progress</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {Math.round((selectedCreator.cardsSold / selectedCreator.totalCards) * 100)}%
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">Revenue</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${(selectedCreator.cardsSold * selectedCreator.cardPrice).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg text-center">
                          <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">Velocity</p>
                          <p className="text-2xl font-bold text-orange-600">{selectedCreator.salesVelocity}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Recommended Strategies for Phase {selectedCreator.phaseNumber}:</h4>
                        <div className="space-y-4">
                          {getPhaseRecommendations(selectedCreator.phaseNumber).map((strategy) => (
                            <div key={strategy.id} className="border rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                                  {strategy.icon}
                                </div>
                                <h5 className="font-medium">{strategy.title}</h5>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                              <div className="bg-gray-50 p-3 rounded">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium">Suggested Reel:</span>
                                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(strategy.suggestedReel)}>
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                                <p className="text-sm italic">"{strategy.suggestedReel}"</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Custom Strategies for {selectedCreator.name}:</h4>
                        <div className="space-y-3">
                          {getCustomStrategiesForCreator(selectedCreator).map((strategy) => (
                            <div key={strategy.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{strategy.title}</h5>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getPriorityColor(strategy.priority)}>
                                    {strategy.priority}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleLinkStrategyToCreator(strategy.id, selectedCreator.id)}
                                  >
                                    <Link className="w-3 h-3 mr-1" />
                                    {strategy.linkedCreators.includes(selectedCreator.id) ? 'Unlink' : 'Link'}
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                              <div className="bg-gray-50 p-3 rounded">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium">Strategy Content:</span>
                                  <Button size="sm" variant="ghost" onClick={() => handleUseStrategy(strategy)}>
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                                <p className="text-sm">{strategy.content}</p>
                              </div>
                              {strategy.tasks.length > 0 && (
                                <div className="mt-3">
                                  <span className="text-xs font-medium">Tasks:</span>
                                  <ul className="text-sm text-gray-600 mt-1">
                                    {strategy.tasks.map((task, index) => (
                                      <li key={index} className="flex items-center">
                                        <CheckCircle2 className="w-3 h-3 text-green-500 mr-1" />
                                        {task}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                          {getCustomStrategiesForCreator(selectedCreator).length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">No custom strategies for this creator yet</p>
                              <Button size="sm" className="mt-2" onClick={() => setIsCreatingStrategy(true)}>
                                <Plus className="w-3 h-3 mr-1" />
                                Create Custom Strategy
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select a creator to see personalized strategy recommendations</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Custom Strategies ({customStrategies.length})</h3>
                <p className="text-gray-600">Create and manage your own strategy templates</p>
              </div>
              <Button onClick={() => setIsCreatingStrategy(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Strategy
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customStrategies.map((strategy) => (
                <Card key={strategy.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{strategy.title}</CardTitle>
                      <Badge className={getPriorityColor(strategy.priority)}>
                        {strategy.priority}
                      </Badge>
                    </div>
                    <CardDescription>{strategy.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700 line-clamp-3">{strategy.content}</p>

                    <div className="flex flex-wrap gap-1">
                      {strategy.phase.map((phase) => (
                        <Badge key={phase} className={getPhaseColor(phase)}>
                          Phase {phase}
                        </Badge>
                      ))}
                      {strategy.category.map((category) => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Used {strategy.useCount} times</span>
                      <span>{strategy.linkedCreators.length} creators linked</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1" onClick={() => handleUseStrategy(strategy)}>
                        <Copy className="w-3 h-3 mr-1" />
                        Use
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditStrategy(strategy)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteStrategy(strategy.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {customStrategies.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No custom strategies yet</p>
                  <Button onClick={() => setIsCreatingStrategy(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Strategy
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid gap-4">
            <h3 className="text-xl font-semibold">Content Templates & Scripts</h3>

            {strategySteps.map((step) => (
              <Card key={step.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {step.icon}
                    <span className="ml-2">{step.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">Reel Script Template:</h5>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(step.suggestedReel)}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Script
                      </Button>
                    </div>
                    <p className="italic text-gray-800">"{step.suggestedReel}"</p>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Implementation Checklist:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {step.tips.map((tip, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Next Steps Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">Finalize Pricing Strategy</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(nextStepsTemplate.pricingFinalization)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">CTA Alignment</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(nextStepsTemplate.ctaAlignment)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">Reel Scheduling</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(nextStepsTemplate.reelScheduling)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">Ad Boosting Setup</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(nextStepsTemplate.adBoosting)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tracking">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Implementation Progress</CardTitle>
                <CardDescription>Track which creators are using which strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(creatorsByPhase).map(([phase, creators]) => (
                    <div key={phase}>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Badge className={getPhaseColor(Number(phase))} style={{ marginRight: '8px' }}>
                          Phase {phase}
                        </Badge>
                        {creators.length} Creator{creators.length !== 1 ? 's' : ''}
                      </h4>
                      <div className="grid gap-3">
                        {creators.map((creator) => {
                          const recommendations = getPhaseRecommendations(creator.phaseNumber)
                          const customStrategiesForCreator = getCustomStrategiesForCreator(creator)
                          return (
                            <div key={creator.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{creator.name}</h5>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">
                                    {creator.cardsSold}/100 sold
                                  </span>
                                  <Badge className={
                                    creator.salesVelocity === 'High' ? 'bg-green-100 text-green-800' :
                                    creator.salesVelocity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    creator.salesVelocity === 'Low' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }>
                                    {creator.salesVelocity}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                <strong>Recommended strategies:</strong> {recommendations.map(r => r.title).join(', ')}
                              </div>
                              {customStrategiesForCreator.length > 0 && (
                                <div className="text-sm text-gray-600 mt-1">
                                  <strong>Custom strategies:</strong> {customStrategiesForCreator.map(s => s.title).join(', ')}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Strategy Modal */}
      {isCreatingStrategy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingStrategy ? 'Edit Strategy' : 'Create Custom Strategy'}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => {
                  setIsCreatingStrategy(false)
                  setEditingStrategy(null)
                  setNewStrategy({
                    title: '',
                    description: '',
                    content: '',
                    phase: [],
                    category: [],
                    priority: 'medium',
                    tasks: []
                  })
                }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Strategy Title *</label>
                <Input
                  value={newStrategy.title || ''}
                  onChange={(e) => setNewStrategy({...newStrategy, title: e.target.value})}
                  placeholder="Enter strategy title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={newStrategy.description || ''}
                  onChange={(e) => setNewStrategy({...newStrategy, description: e.target.value})}
                  placeholder="Brief description of the strategy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Strategy Content *</label>
                <Textarea
                  value={newStrategy.content || ''}
                  onChange={(e) => setNewStrategy({...newStrategy, content: e.target.value})}
                  placeholder="Enter the strategy content, script, or instructions..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Applicable Phases</label>
                  <div className="space-y-2">
                    {[0, 1, 2, 3, 4].map((phase) => (
                      <label key={phase} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newStrategy.phase?.includes(phase) || false}
                          onChange={(e) => {
                            const phases = newStrategy.phase || []
                            if (e.target.checked) {
                              setNewStrategy({...newStrategy, phase: [...phases, phase]})
                            } else {
                              setNewStrategy({...newStrategy, phase: phases.filter(p => p !== phase)})
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Phase {phase}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Creator Categories</label>
                  <div className="space-y-2">
                    {['Gaming', 'Music', 'Streaming', 'Lifestyle', 'Comedy', 'Fashion'].map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newStrategy.category?.includes(category) || false}
                          onChange={(e) => {
                            const categories = newStrategy.category || []
                            if (e.target.checked) {
                              setNewStrategy({...newStrategy, category: [...categories, category]})
                            } else {
                              setNewStrategy({...newStrategy, category: categories.filter(c => c !== category)})
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <Select
                  value={newStrategy.priority || 'medium'}
                  onValueChange={(value: 'high' | 'medium' | 'low') => setNewStrategy({...newStrategy, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Associated Tasks (Optional)</label>
                <Textarea
                  value={newStrategy.tasks?.join('\n') || ''}
                  onChange={(e) => setNewStrategy({
                    ...newStrategy, 
                    tasks: e.target.value.split('\n').filter(task => task.trim())
                  })}
                  placeholder="Enter tasks, one per line..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Enter each task on a new line</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={editingStrategy ? handleSaveEdit : handleCreateStrategy}
                  disabled={!newStrategy.title || !newStrategy.content}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingStrategy ? 'Save Changes' : 'Create Strategy'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsCreatingStrategy(false)
                  setEditingStrategy(null)
                  setNewStrategy({
                    title: '',
                    description: '',
                    content: '',
                    phase: [],
                    category: [],
                    priority: 'medium',
                    tasks: []
                  })
                }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}