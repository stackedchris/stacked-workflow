'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Instagram,
  Twitter,
  Youtube,
  Search,
  ExternalLink,
  Heart,
  MessageCircle,
  Share,
  Eye,
  TrendingUp,
  Calendar,
  Users,
  Play
} from 'lucide-react'

interface SocialPost {
  id: string
  platform: 'instagram' | 'twitter' | 'youtube' | 'tiktok'
  content: string
  engagement: {
    likes: number
    comments: number
    shares: number
    views?: number
  }
  date: string
  url: string
  type: 'post' | 'story' | 'video' | 'reel'
  relevance: 'high' | 'medium' | 'low'
  tags: string[]
}

interface CreatorProfile {
  platform: string
  username: string
  followers: number
  engagement_rate: number
  verified: boolean
  bio: string
  posts_count: number
  recent_activity: string
}

interface SocialScraperProps {
  creatorId: number
  creatorName: string
  socialMedia: {
    instagram?: string
    twitter?: string
    youtube?: string
    tiktok?: string
  }
}

export default function SocialScraper({ creatorId, creatorName, socialMedia }: SocialScraperProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [profiles, setProfiles] = useState<CreatorProfile[]>([])
  const [posts, setPosts] = useState<SocialPost[]>([])

  // Mock data for demonstration
  const mockPosts: SocialPost[] = [
    {
      id: '1',
      platform: 'instagram',
      content: '🔥 New gaming setup reveal! What do you think of this RGB lighting? #gaming #setup #streaming',
      engagement: { likes: 15420, comments: 892, shares: 234 },
      date: '2025-06-15',
      url: 'https://instagram.com/p/abc123',
      type: 'post',
      relevance: 'high',
      tags: ['gaming', 'setup', 'streaming']
    },
    {
      id: '2',
      platform: 'twitter',
      content: 'Just hit 500K followers! 🎉 Thinking about launching something exclusive for my top supporters. What would you want to see?',
      engagement: { likes: 8930, comments: 445, shares: 1200 },
      date: '2025-06-14',
      url: 'https://twitter.com/creator/status/123',
      type: 'post',
      relevance: 'high',
      tags: ['milestone', 'community', 'exclusive']
    },
    {
      id: '3',
      platform: 'youtube',
      content: 'EXCLUSIVE Behind the Scenes: How I Built My Gaming Empire | Q&A with Top Supporters',
      engagement: { likes: 12400, comments: 567, shares: 89, views: 156000 },
      date: '2025-06-13',
      url: 'https://youtube.com/watch?v=xyz789',
      type: 'video',
      relevance: 'high',
      tags: ['behind-the-scenes', 'exclusive', 'q&a']
    }
  ]

  const mockProfiles: CreatorProfile[] = [
    {
      platform: 'Instagram',
      username: '@kurama_smash',
      followers: 524000,
      engagement_rate: 4.2,
      verified: true,
      bio: '🎮 Pro Smash Player | 🏆 Tournament Winner | 📺 Streaming Daily',
      posts_count: 1247,
      recent_activity: '2 hours ago'
    },
    {
      platform: 'Twitter',
      username: '@KuramaPlays',
      followers: 398000,
      engagement_rate: 3.8,
      verified: true,
      bio: 'Professional Smash Bros player. Streaming, tournaments, and gaming content.',
      posts_count: 8920,
      recent_activity: '4 hours ago'
    },
    {
      platform: 'YouTube',
      username: '@KuramaGaming',
      followers: 890000,
      engagement_rate: 5.1,
      verified: true,
      bio: 'Daily gaming content, tutorials, and tournament highlights',
      posts_count: 342,
      recent_activity: '1 day ago'
    }
  ]

  const handleScrapeProfiles = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setProfiles(mockProfiles)
      setIsLoading(false)
    }, 2000)
  }

  const handleScrapeContent = async (platform: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setPosts(mockPosts.filter(post => platform === 'all' || post.platform === platform))
      setIsLoading(false)
    }, 1500)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-600" />
      case 'twitter': return <Twitter className="w-4 h-4 text-blue-600" />
      case 'youtube': return <Youtube className="w-4 h-4 text-red-600" />
      default: return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Social Media Intelligence</h3>
          <p className="text-gray-600">Analyze {creatorName}'s content and engagement</p>
        </div>
        <Button onClick={handleScrapeProfiles} disabled={isLoading}>
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Analyzing...' : 'Analyze Profiles'}
        </Button>
      </div>

      <Tabs defaultValue="profiles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profiles">Profile Analytics</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Trends</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profiles.map((profile, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getPlatformIcon(profile.platform)}
                      <span className="font-medium">{profile.platform}</span>
                    </div>
                    {profile.verified && (
                      <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{profile.username}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Followers</span>
                        <p className="font-medium">{formatNumber(profile.followers)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Engagement</span>
                        <p className="font-medium">{profile.engagement_rate}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Posts</span>
                        <p className="font-medium">{formatNumber(profile.posts_count)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Active</span>
                        <p className="font-medium">{profile.recent_activity}</p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {profiles.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Click "Analyze Profiles" to get creator social media insights</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleScrapeContent('all')}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                All Platforms
              </Button>
              <Button
                onClick={() => handleScrapeContent('instagram')}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <Instagram className="w-3 h-3 mr-1" />
                Instagram
              </Button>
              <Button
                onClick={() => handleScrapeContent('twitter')}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <Twitter className="w-3 h-3 mr-1" />
                Twitter
              </Button>
              <Button
                onClick={() => handleScrapeContent('youtube')}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <Youtube className="w-3 h-3 mr-1" />
                YouTube
              </Button>
            </div>

            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getPlatformIcon(post.platform)}
                          <span className="font-medium capitalize">{post.platform}</span>
                          <Badge variant="outline">{post.type}</Badge>
                          <Badge className={getRelevanceColor(post.relevance)}>
                            {post.relevance} relevance
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">{post.date}</span>
                      </div>

                      <p className="text-gray-700">{post.content}</p>

                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{formatNumber(post.engagement.likes)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{formatNumber(post.engagement.comments)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share className="w-4 h-4" />
                            <span>{formatNumber(post.engagement.shares)}</span>
                          </div>
                          {post.engagement.views && (
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{formatNumber(post.engagement.views)}</span>
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Post
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {posts.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a platform to analyze recent content</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Likes</span>
                    <span className="font-medium">12.4K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Comments</span>
                    <span className="font-medium">634</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Engagement Rate</span>
                    <span className="font-medium">4.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Post Frequency</span>
                    <span className="font-medium">1.2/day</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Top Performing Type</span>
                    <span className="font-medium">Gaming content</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Best Time to Post</span>
                    <span className="font-medium">7-9 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Trending Tags</span>
                    <span className="font-medium">#gaming #exclusive</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Community Interest</span>
                    <span className="font-medium">Behind-the-scenes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities">
          <div className="space-y-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">
                  🎯 High Stacked Potential
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-green-700">
                  <li>• Strong community engagement (4.2% rate)</li>
                  <li>• Regular mentions of "exclusive content" and "top supporters"</li>
                  <li>• High interest in behind-the-scenes content</li>
                  <li>• Active across multiple platforms</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">
                  📋 Recommended Approach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-blue-700">
                  <li>• Start with behind-the-scenes content as main value prop</li>
                  <li>• Price around $75-100 based on engagement levels</li>
                  <li>• Launch during peak engagement time (7-9 PM EST)</li>
                  <li>• Focus on gaming community and exclusive access angle</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800">
                  ⚠️ Considerations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-orange-700">
                  <li>• Monitor for any existing membership programs</li>
                  <li>• Check recent content for Stacked-related keywords</li>
                  <li>• Verify engagement authenticity across platforms</li>
                  <li>• Assess competition in gaming creator space</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
