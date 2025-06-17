'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  Instagram,
  Twitter,
  MessageSquare,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Heart,
  Share
} from 'lucide-react'

const templates = [
  {
    id: 1,
    name: "Launch Day Announcement",
    platform: "Instagram",
    phase: "Phase 2: Launch Week",
    category: "Announcement",
    content: "🚀 My exclusive Top 100 is LIVE! Only 100 cards available for my biggest supporters. Get yours before they're gone! Link in bio 👆",
    engagement: "High",
    successRate: "87%",
    uses: 24,
    tags: ["launch", "announcement", "urgency"],
    lastUsed: "2025-06-15"
  },
  {
    id: 2,
    name: "Group Chat Screenshot",
    platform: "Instagram Story",
    phase: "Phase 2: Launch Week",
    category: "Social Proof",
    content: "Behind the scenes access is unreal 🔥 [Screenshot of group chat with members discussing exclusive content]",
    engagement: "Very High",
    successRate: "92%",
    uses: 31,
    tags: ["social-proof", "screenshot", "community"],
    lastUsed: "2025-06-16"
  },
  {
    id: 3,
    name: "Urgency Push - Limited Left",
    platform: "Twitter",
    phase: "Phase 3: Sell-Out Push",
    category: "Urgency",
    content: "⚠️ Only 15 cards left in my Top 100! Once they're gone, the window closes forever. Don't miss your spot 👇",
    engagement: "High",
    successRate: "78%",
    uses: 18,
    tags: ["urgency", "scarcity", "sellout"],
    lastUsed: "2025-06-14"
  },
  {
    id: 4,
    name: "Voting Power Showcase",
    platform: "TikTok",
    phase: "Phase 2: Launch Week",
    category: "Utility",
    content: "My Top 100 holders literally get to vote on my next drop 🗳️ This is your chance to have real influence! [Video showing voting interface]",
    engagement: "Medium",
    successRate: "65%",
    uses: 12,
    tags: ["voting", "utility", "influence"],
    lastUsed: "2025-06-13"
  },
  {
    id: 5,
    name: "Behind the Scenes Teaser",
    platform: "Instagram",
    phase: "Phase 1: Drop Prep",
    category: "Teaser",
    content: "Something big is coming... 👀 My inner circle is about to get exclusive access to everything. Stay tuned for the announcement 📱",
    engagement: "Medium",
    successRate: "71%",
    uses: 15,
    tags: ["teaser", "anticipation", "prep"],
    lastUsed: "2025-06-12"
  },
  {
    id: 6,
    name: "Community Value Prop",
    platform: "Twitter",
    phase: "Phase 0: Strategy Call",
    category: "Education",
    content: "Your favorite creators have millions of followers but only connect with their top 100 fans. What if you could be one of them? 🤔",
    engagement: "High",
    successRate: "83%",
    uses: 22,
    tags: ["education", "value-prop", "strategy"],
    lastUsed: "2025-06-11"
  }
]

const getEngagementColor = (engagement: string) => {
  switch (engagement) {
    case "Very High": return "bg-green-100 text-green-800"
    case "High": return "bg-blue-100 text-blue-800"
    case "Medium": return "bg-yellow-100 text-yellow-800"
    case "Low": return "bg-red-100 text-red-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Instagram": return <Instagram className="w-4 h-4 text-pink-600" />
    case "Instagram Story": return <Instagram className="w-4 h-4 text-pink-600" />
    case "Twitter": return <Twitter className="w-4 h-4 text-blue-600" />
    case "TikTok": return <MessageSquare className="w-4 h-4 text-black" />
    default: return <MessageSquare className="w-4 h-4 text-gray-600" />
  }
}

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [selectedPhase, setSelectedPhase] = useState("all")
  const [isCreating, setIsCreating] = useState(false)

  const handleUseTemplate = (templateId: number, templateName: string) => {
    console.log('Using template:', templateId, templateName)
    navigator.clipboard.writeText(templates.find(t => t.id === templateId)?.content || '')
    alert(`Template "${templateName}" copied to clipboard!`)
  }

  const handleEditTemplate = (templateId: number) => {
    console.log('Editing template:', templateId)
    alert(`Opening editor for template ${templateId}`)
  }

  const handleDeleteTemplate = (templateId: number) => {
    console.log('Deleting template:', templateId)
    if (confirm('Are you sure you want to delete this template?')) {
      alert(`Template ${templateId} deleted!`)
    }
  }

  const handleGenerateTemplate = () => {
    console.log('Generating AI template')
    alert('AI template generator coming soon!')
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesPlatform = selectedPlatform === "all" || template.platform === selectedPlatform
    const matchesPhase = selectedPhase === "all" || template.phase === selectedPhase

    return matchesSearch && matchesPlatform && matchesPhase
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Templates</h2>
          <p className="text-gray-600">Reusable templates for social media and marketing</p>
        </div>
        <Button onClick={() => {
          console.log('Creating new template')
          setIsCreating(true)
          alert('Opening template creator...')
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList>
          <TabsTrigger value="library">Template Library</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="generator">AI Generator</TabsTrigger>
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
                      placeholder="Search templates, content, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Instagram Story">Instagram Story</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Phases" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    <SelectItem value="Phase 0: Strategy Call">Phase 0: Strategy Call</SelectItem>
                    <SelectItem value="Phase 1: Drop Prep">Phase 1: Drop Prep</SelectItem>
                    <SelectItem value="Phase 2: Launch Week">Phase 2: Launch Week</SelectItem>
                    <SelectItem value="Phase 3: Sell-Out Push">Phase 3: Sell-Out Push</SelectItem>
                    <SelectItem value="Phase 4: Post-Sellout">Phase 4: Post-Sellout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {getPlatformIcon(template.platform)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">{template.phase}</Badge>
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700 line-clamp-3">{template.content}</p>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1 text-gray-500" />
                        {template.successRate}
                      </div>
                      <div className="flex items-center">
                        <Share className="w-3 h-3 mr-1 text-gray-500" />
                        {template.uses} uses
                      </div>
                    </div>
                    <Badge className={getEngagementColor(template.engagement)}>
                      {template.engagement}
                    </Badge>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" className="flex-1" onClick={() => handleUseTemplate(template.id, template.name)}>
                      <Copy className="w-3 h-3 mr-1" />
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template.id)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No templates found matching your criteria.</p>
                <Button className="mt-4" onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Template
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">Group Chat Screenshot</div>
                <p className="text-sm text-gray-600">92% success rate</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Very High Engagement</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">Group Chat Screenshot</div>
                <p className="text-sm text-gray-600">31 uses this month</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">Popular</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avg Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">79%</div>
                <p className="text-sm text-gray-600">Across all templates</p>
                <div className="flex items-center text-green-600 text-sm mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8% vs last month
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Template Performance Breakdown</CardTitle>
              <CardDescription>Success rates by platform and category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">By Platform</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Instagram Story</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Instagram</span>
                      <span className="font-medium">79%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Twitter</span>
                      <span className="font-medium">81%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>TikTok</span>
                      <span className="font-medium">65%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">By Category</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Social Proof</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Announcement</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Education</span>
                      <span className="font-medium">83%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Urgency</span>
                      <span className="font-medium">78%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                AI Template Generator
              </CardTitle>
              <CardDescription>
                Generate custom templates based on phase, platform, and goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="instagram-story">Instagram Story</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phase</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phase-0">Phase 0: Strategy Call</SelectItem>
                      <SelectItem value="phase-1">Phase 1: Drop Prep</SelectItem>
                      <SelectItem value="phase-2">Phase 2: Launch Week</SelectItem>
                      <SelectItem value="phase-3">Phase 3: Sell-Out Push</SelectItem>
                      <SelectItem value="phase-4">Phase 4: Post-Sellout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Creator Context</label>
                <Textarea
                  placeholder="Describe the creator (category, style, audience, etc.)"
                  className="min-h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Goal/Objective</label>
                <Textarea
                  placeholder="What should this template achieve? (drive sales, build hype, show utility, etc.)"
                  className="min-h-20"
                />
              </div>

              <Button className="w-full" onClick={handleGenerateTemplate}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
