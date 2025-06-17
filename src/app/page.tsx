'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Calendar,
  Target,
  DollarSign,
  MessageSquare,
  Copy,
  Eye
} from 'lucide-react'
import Analytics from '@/components/Analytics'
import CreatorManagement from '@/components/CreatorManagement'
import AirtableIntegration from '@/components/AirtableIntegration'
import ContentManager from '@/components/ContentManager'
import ContentCalendar from '@/components/ContentCalendar'
import StrategyGuide from '@/components/StrategyGuide'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// Mock data for creators - Updated with full creator objects for testing
const creators = [
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
    bio: "Top Smash Bros player with 500K+ following",
    socialMedia: {
      instagram: "@kurama_smash",
      twitter: "@KuramaPlays",
      youtube: "@KuramaGaming",
      tiktok: "@kurama.gaming"
    },
    assets: { profileImages: [], videos: [], pressKit: [] },
    strategy: {
      launchDate: "2025-06-20",
      targetAudience: "Competitive gaming fans",
      contentPlan: "Daily gameplay tips"
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
    bio: "Popular streamer and co-founder",
    socialMedia: {
      instagram: "@ninalin",
      twitter: "@NinaStreams",
      tiktok: "@nina.streams"
    },
    assets: { profileImages: [], videos: [], pressKit: [] },
    strategy: {
      launchDate: "2025-06-25",
      targetAudience: "Streaming community",
      contentPlan: "Stream highlights"
    },
    createdAt: "2025-06-12",
    lastUpdated: "2025-06-16"
  },
  {
    id: 3,
    name: "Edward So",
    email: "edward@example.com",
    phone: "+1 (555) 345-6789",
    category: "Music",
    phase: "Phase 3: Sell-Out Push",
    phaseNumber: 3,
    cardsSold: 85,
    totalCards: 100,
    cardPrice: 90,
    daysInPhase: 1,
    nextTask: "Post 'only 15 left' story",
    salesVelocity: "Medium",
    avatar: "🎵",
    bio: "DJ and creative entrepreneur",
    socialMedia: {
      instagram: "@edwardso",
      twitter: "@EdwardSoMusic",
      tiktok: "@edward.djmusic"
    },
    assets: { profileImages: [], videos: [], pressKit: [] },
    strategy: {
      launchDate: "2025-06-18",
      targetAudience: "Music fans",
      contentPlan: "Live sets and remixes"
    },
    createdAt: "2025-06-08",
    lastUpdated: "2025-06-16"
  }
]

const phases = [
  { name: "Strategy Call", color: "bg-blue-500" },
  { name: "Drop Prep", color: "bg-yellow-500" },
  { name: "Launch Week", color: "bg-green-500" },
  { name: "Sell-Out Push", color: "bg-orange-500" },
  { name: "Post-Sellout", color: "bg-purple-500" }
]

// Phase-specific task sequences
const phaseTaskSequences = {
  0: [ // Phase 0: Strategy Call
    "Schedule strategy call",
    "Complete strategy call",
    "Define target audience",
    "Set pricing strategy",
    "Plan content calendar"
  ],
  1: [ // Phase 1: Drop Prep
    "Record teaser video",
    "Create launch assets",
    "Set up tracking systems",
    "Schedule content calendar",
    "Prepare for launch"
  ],
  2: [ // Phase 2: Launch Week
    "Post launch announcement",
    "Post group chat screenshot",
    "Share behind-the-scenes content",
    "Monitor sales progress",
    "Engage with community"
  ],
  3: [ // Phase 3: Sell-Out Push
    "Post 'only 15 left' story",
    "Create urgency content",
    "Share social proof",
    "Final push campaign",
    "Last chance messaging"
  ],
  4: [ // Phase 4: Post-Sellout
    "Send thank you message",
    "Deliver exclusive content",
    "Gather feedback",
    "Plan next campaign",
    "Campaign complete"
  ]
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

// Get next task in sequence for current phase
const getNextTaskInPhase = (currentTask: string, phaseNumber: number) => {
  const tasks = phaseTaskSequences[phaseNumber as keyof typeof phaseTaskSequences] || []
  const currentIndex = tasks.indexOf(currentTask)
  
  if (currentIndex === -1) {
    // If current task not found, return first task of phase
    return tasks[0] || "Complete phase tasks"
  }
  
  if (currentIndex < tasks.length - 1) {
    // Return next task in sequence
    return tasks[currentIndex + 1]
  }
  
  // If at end of phase tasks, ready to progress
  return "Ready for next phase"
}

// Check if creator should progress to next phase
const shouldProgressPhase = (creator: any) => {
  const { phaseNumber, cardsSold, nextTask } = creator
  
  // Phase progression logic
  switch (phaseNumber) {
    case 0: // Strategy Call -> Drop Prep
      return nextTask === "Ready for next phase" || nextTask === "Plan content calendar"
    case 1: // Drop Prep -> Launch Week  
      return (nextTask === "Ready for next phase" || nextTask === "Prepare for launch") && cardsSold >= 0
    case 2: // Launch Week -> Sell-Out Push
      return cardsSold >= 50 || nextTask === "Ready for next phase"
    case 3: // Sell-Out Push -> Post-Sellout
      return cardsSold >= 100 || nextTask === "Ready for next phase"
    case 4: // Already at final phase
      return false
    default:
      return false
  }
}

// Get first task for a phase
const getFirstTaskForPhase = (phaseNumber: number) => {
  const tasks = phaseTaskSequences[phaseNumber as keyof typeof phaseTaskSequences] || []
  return tasks[0] || "Complete phase"
}

export default function Dashboard() {
  // Use localStorage to persist data across page refreshes
  const [allCreators, setAllCreators, isCreatorsHydrated] = useLocalStorage('stacked-creators', creators)
  const [allContent, setAllContent] = useLocalStorage('stacked-content', [])
  const [selectedCreator, setSelectedCreator] = useState(creators[0])
  const [showAddCreator, setShowAddCreator] = useState(false)
  const [activeTab, setActiveTab, isTabHydrated] = useLocalStorage('stacked-active-tab', "pipeline")
  const [isAutoSyncing, setIsAutoSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime, isSyncTimeHydrated] = useLocalStorage('stacked-last-sync', '')

  // Update selected creator when allCreators changes or hydrates
  useEffect(() => {
    if (isCreatorsHydrated && allCreators.length > 0) {
      if (!selectedCreator || !allCreators.find(c => c.id === selectedCreator.id)) {
        setSelectedCreator(allCreators[0])
      } else {
        // Update selected creator with latest data
        const updatedCreator = allCreators.find(c => c.id === selectedCreator.id)
        if (updatedCreator) {
          setSelectedCreator(updatedCreator)
        }
      }
    }
  }, [allCreators, selectedCreator, isCreatorsHydrated])

  // Auto-sync to Airtable every 5 minutes
  useEffect(() => {
    const autoSync = setInterval(async () => {
      if (allCreators.length > 0) {
        setIsAutoSyncing(true)
        try {
          // Simulate API call to sync with Airtable
          await new Promise(resolve => setTimeout(resolve, 2000))
          setLastSyncTime(new Date().toLocaleTimeString())
          console.log('Auto-synced creators to Airtable')
        } catch (error) {
          console.error('Auto-sync failed:', error)
        } finally {
          setIsAutoSyncing(false)
        }
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(autoSync)
  }, [allCreators, setLastSyncTime])

  // Handle marking task as complete with proper phase alignment
  const handleMarkTaskComplete = (creatorId: number) => {
    const creator = allCreators.find(c => c.id === creatorId)
    if (!creator) return

    const updatedCreators = allCreators.map(c => {
      if (c.id === creatorId) {
        let newPhaseNumber = c.phaseNumber
        let newPhase = c.phase
        let newNextTask = c.nextTask
        let newDaysInPhase = c.daysInPhase

        // Check if should progress to next phase
        if (shouldProgressPhase(c)) {
          // Progress to next phase
          newPhaseNumber = Math.min(c.phaseNumber + 1, 4)
          newPhase = `Phase ${newPhaseNumber}: ${phases[newPhaseNumber]?.name || 'Complete'}`
          newNextTask = getFirstTaskForPhase(newPhaseNumber)
          newDaysInPhase = 0
        } else {
          // Stay in current phase, move to next task
          newNextTask = getNextTaskInPhase(c.nextTask, c.phaseNumber)
          newDaysInPhase = c.daysInPhase
        }

        return {
          ...c,
          phaseNumber: newPhaseNumber,
          phase: newPhase,
          nextTask: newNextTask,
          daysInPhase: newDaysInPhase,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      }
      return c
    })

    setAllCreators(updatedCreators)
    
    // Show success message with context
    const updatedCreator = updatedCreators.find(c => c.id === creatorId)
    if (updatedCreator) {
      const wasProgressed = updatedCreator.phaseNumber > creator.phaseNumber
      const message = wasProgressed 
        ? `🎉 ${creator.name} progressed to ${updatedCreator.phase}!\nNext: ${updatedCreator.nextTask}`
        : `✅ Task completed for ${creator.name}!\nNext: ${updatedCreator.nextTask}`
      
      alert(message)
    }
  }

  // Handle copying content prompt
  const handleCopyContentPrompt = (creator: any) => {
    const prompts = {
      0: `Hey ${creator.name}! Ready to plan your Top 100 launch strategy? Let's schedule a call to discuss your goals, pricing, and timeline. When works best for you this week?`,
      1: `${creator.name}, time to create some buzz! 🔥 Can you record a quick teaser video showing behind-the-scenes content? Your fans love exclusive access - this will get them excited for what's coming!`,
      2: `Launch week is here! 🚀 ${creator.name}, post your official announcement across all platforms. Remember to emphasize the limited quantity (only 100 spots) and exclusive access your top supporters will get.`,
      3: `${creator.name}, it's crunch time! ⏰ Create urgency content showing how many cards are left. Post stories like "Only X cards remaining!" and share testimonials from current members.`,
      4: `Amazing work ${creator.name}! 🎉 Time to thank your Top 100 members and deliver on those exclusive promises. This sets you up perfectly for your next campaign.`
    }

    const prompt = prompts[creator.phaseNumber as keyof typeof prompts] || `Great work ${creator.name}! Keep up the momentum.`
    
    navigator.clipboard.writeText(prompt)
    alert(`📋 Content prompt copied to clipboard!\n\nYou can now paste and send this to ${creator.name} via your preferred communication method.`)
  }

  // Handle viewing analytics
  const handleViewAnalytics = (creator: any) => {
    setActiveTab("analytics")
    // You could also filter analytics by creator here
  }

  const totalCardsInMarket = allCreators.reduce((sum, creator) => sum + creator.cardsSold, 0)
  const totalRevenue = allCreators.reduce((sum, creator) => sum + (creator.cardsSold * creator.cardPrice), 0)
  const averageSellRate = allCreators.length > 0 ? totalCardsInMarket / (allCreators.length * 100) * 100 : 0
  const highPriorityCreators = allCreators.filter(creator =>
    creator.salesVelocity === 'Low' || creator.daysInPhase > 7
  ).length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Stacked Workflow</h1>
            <p className="text-gray-600 mt-2">Creator pipeline management & automation</p>
            {lastSyncTime && (
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full mr-2 ${isAutoSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                {isAutoSyncing ? 'Syncing...' : `Last synced: ${lastSyncTime}`}
              </div>
            )}
          </div>
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => {
              console.log('Add Creator button clicked')
              setActiveTab("creators")
              setShowAddCreator(true)
              console.log('Set activeTab to creators and showAddCreator to true')
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Creator
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Creators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allCreators.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cards Sold</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCardsInMarket}</div>
              <p className="text-xs text-muted-foreground">
                {averageSellRate.toFixed(1)}% avg sell rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Real-time calculated revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highPriorityCreators}</div>
              <p className="text-xs text-muted-foreground">
                Creators needing attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="pipeline">Creator Pipeline</TabsTrigger>
            <TabsTrigger value="creators">Creator Management</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="strategy">Strategy Guide</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="airtable">Airtable</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Creator List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Creator Pipeline</CardTitle>
                    <CardDescription>
                      Track each creator through the 5-phase launch process
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {allCreators.map((creator) => (
                      <div
                        key={creator.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedCreator.id === creator.id
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedCreator(creator)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{creator.avatar}</div>
                            <div>
                              <h3 className="font-semibold">{creator.name}</h3>
                              <p className="text-sm text-gray-600">{creator.category}</p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`bg-${getPhaseColor(creator.phaseNumber)}-100 text-${getPhaseColor(creator.phaseNumber)}-800 border-${getPhaseColor(creator.phaseNumber)}-200`}
                          >
                            {creator.phase}
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Cards Sold</span>
                            <span>{creator.cardsSold}/100</span>
                          </div>
                          <Progress value={creator.cardsSold} className="h-2" />

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Next: {creator.nextTask}</span>
                            <Badge
                              variant="outline"
                              className={getSalesVelocityColor(creator.salesVelocity)}
                            >
                              {creator.salesVelocity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Creator Detail */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span className="text-2xl">{selectedCreator.avatar}</span>
                      <span>{selectedCreator.name}</span>
                    </CardTitle>
                    <CardDescription>{selectedCreator.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Current Phase</h4>
                      <Badge
                        className={`bg-${getPhaseColor(selectedCreator.phaseNumber)}-100 text-${getPhaseColor(selectedCreator.phaseNumber)}-800`}
                      >
                        {selectedCreator.phase}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Day {selectedCreator.daysInPhase} in phase
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Progress</h4>
                      <Progress value={selectedCreator.cardsSold} className="h-3" />
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedCreator.cardsSold}/100 cards sold ({(selectedCreator.cardsSold/100*100).toFixed(0)}%)
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Current Task</h4>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium">{selectedCreator.nextTask}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Phase {selectedCreator.phaseNumber} • {selectedCreator.phase}
                        </p>
                        <Button 
                          size="sm" 
                          className="mt-2"
                          onClick={() => handleMarkTaskComplete(selectedCreator.id)}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Mark Complete
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => handleCopyContentPrompt(selectedCreator)}
                        >
                          <MessageSquare className="w-3 h-3 mr-2" />
                          Copy Content Prompt
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => handleViewAnalytics(selectedCreator)}
                        >
                          <BarChart3 className="w-3 h-3 mr-2" />
                          View Analytics
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveTab("strategy")
                            // Could also set selected creator in strategy guide
                          }}
                        >
                          <Target className="w-3 h-3 mr-2" />
                          View Strategy Guide
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="creators">
            <CreatorManagement
              creators={allCreators}
              onCreatorsUpdate={setAllCreators}
              showAddCreator={showAddCreator}
              onAddCreatorClose={() => setShowAddCreator(false)}
            />
          </TabsContent>

          <TabsContent value="content">
            <ContentManager
              creators={allCreators}
              onContentUpdate={setAllContent}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <ContentCalendar
              content={allContent}
              creators={allCreators}
              onContentUpdate={setAllContent}
            />
          </TabsContent>

          <TabsContent value="strategy">
            <StrategyGuide creators={allCreators} />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics creators={allCreators} content={allContent} />
          </TabsContent>

          <TabsContent value="airtable">
            <AirtableIntegration
              creators={allCreators}
              content={allContent}
              autoSync={true}
              onSyncComplete={(success) => {
                if (success) {
                  setLastSyncTime(new Date().toLocaleTimeString())
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}