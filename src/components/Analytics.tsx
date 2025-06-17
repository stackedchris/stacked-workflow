'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, DollarSign, Users, Target, Clock, Award, BarChart3, Calendar } from 'lucide-react'

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
  createdAt: string
  lastUpdated: string
}

interface AnalyticsProps {
  creators?: Creator[]
  content?: any[]
}

export default function Analytics({ creators = [], content = [] }: AnalyticsProps) {
  // Calculate real-time metrics
  const metrics = useMemo(() => {
    const totalRevenue = creators.reduce((sum, creator) => sum + (creator.cardsSold * creator.cardPrice), 0)
    const totalCardsSold = creators.reduce((sum, creator) => sum + creator.cardsSold, 0)
    const totalCards = creators.reduce((sum, creator) => sum + creator.totalCards, 0)
    const averageSellRate = totalCards > 0 ? (totalCardsSold / totalCards) * 100 : 0
    const activeCreators = creators.length

    // Phase distribution
    const phaseDistribution = creators.reduce((acc, creator) => {
      acc[creator.phaseNumber] = (acc[creator.phaseNumber] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    // Top performers
    const topPerformers = [...creators]
      .sort((a, b) => (b.cardsSold * b.cardPrice) - (a.cardsSold * a.cardPrice))
      .slice(0, 5)

    // Category performance
    const categoryStats = creators.reduce((acc, creator) => {
      if (!acc[creator.category]) {
        acc[creator.category] = { revenue: 0, creators: 0, cardsSold: 0 }
      }
      acc[creator.category].revenue += creator.cardsSold * creator.cardPrice
      acc[creator.category].creators += 1
      acc[creator.category].cardsSold += creator.cardsSold
      return acc
    }, {} as Record<string, { revenue: number, creators: number, cardsSold: number }>)

    // Content stats
    const contentStats = content.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalRevenue,
      totalCardsSold,
      totalCards,
      averageSellRate,
      activeCreators,
      phaseDistribution,
      topPerformers,
      categoryStats,
      contentStats
    }
  }, [creators, content])
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-600">Performance metrics and success tracking</p>
        </div>
        <Select defaultValue="30d">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Real-time tracking
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Sold</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCardsSold.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600 flex items-center">
                <BarChart3 className="w-3 h-3 mr-1" />
                of {metrics.totalCards.toLocaleString()} total
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Creators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCreators}</div>
            <p className="text-xs text-muted-foreground">
              Currently in pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sell Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageSellRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all creators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Items</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{content.length}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.contentStats.posted || 0} posted, {metrics.contentStats.scheduled || 0} scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="creators">Creator Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(metrics.categoryStats).map(([category, stats]) => {
              const percentage = metrics.totalRevenue > 0 ? (stats.revenue / metrics.totalRevenue * 100).toFixed(1) : 0
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                    <p className="text-sm text-gray-600">{percentage}% of total</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Creators: {stats.creators}</span>
                        <span>Cards: {stats.cardsSold}</span>
                      </div>
                      <Progress value={Number(percentage)} className="h-1" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {Object.keys(metrics.categoryStats).length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No category data available. Add creators to see analytics.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="creators">
          <Card>
            <CardHeader>
              <CardTitle>Creator Performance</CardTitle>
              <CardDescription>Detailed metrics for all creators</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead>Cards Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Sell Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.topPerformers.map((creator) => {
                    const revenue = creator.cardsSold * creator.cardPrice
                    const sellRate = ((creator.cardsSold / creator.totalCards) * 100).toFixed(1)
                    const getVelocityColor = (velocity: string) => {
                      switch (velocity) {
                        case 'High': return 'text-green-600 bg-green-100'
                        case 'Medium': return 'text-yellow-600 bg-yellow-100'
                        case 'Low': return 'text-red-600 bg-red-100'
                        default: return 'text-gray-600 bg-gray-100'
                      }
                    }

                    return (
                      <TableRow key={creator.id}>
                        <TableCell className="font-medium">{creator.name}</TableCell>
                        <TableCell>{creator.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            Phase {creator.phaseNumber}
                          </Badge>
                        </TableCell>
                        <TableCell>{creator.cardsSold}/{creator.totalCards}</TableCell>
                        <TableCell>${revenue.toLocaleString()}</TableCell>
                        <TableCell>{sellRate}%</TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getVelocityColor(creator.salesVelocity)}`}>
                            {creator.salesVelocity}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {creators.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No creators available. Add creators to see performance data.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Distribution</CardTitle>
              <CardDescription>Current creators by phase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { phase: 0, name: "Phase 0: Strategy Call", color: "bg-blue-500" },
                  { phase: 1, name: "Phase 1: Drop Prep", color: "bg-yellow-500" },
                  { phase: 2, name: "Phase 2: Launch Week", color: "bg-green-500" },
                  { phase: 3, name: "Phase 3: Sell-Out Push", color: "bg-orange-500" },
                  { phase: 4, name: "Phase 4: Post-Sellout", color: "bg-purple-500" }
                ].map((phaseInfo) => {
                  const count = metrics.phaseDistribution[phaseInfo.phase] || 0
                  const percentage = creators.length > 0 ? (count / creators.length * 100) : 0

                  return (
                    <div key={phaseInfo.phase} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${phaseInfo.color}`} />
                        <span>{phaseInfo.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={percentage} className="w-24 h-2" />
                        <span className="font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  )
                })}
                {creators.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No creators in pipeline. Add creators to see phase distribution.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
