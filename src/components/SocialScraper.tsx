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
  Play,
  RefreshCw,
  AlertCircle
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
  url: string
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
  const [activeAnalysis, setActiveAnalysis] = useState<string>('')

  // Generate mock data based on actual social media links
  const generateMockProfiles = (): CreatorProfile[] => {
    const mockProfiles: CreatorProfile[] = []

    if (socialMedia.instagram) {
      const username = socialMedia.instagram.replace('@', '').replace('https://instagram.com/', '').replace('https://www.instagram.com/', '')
      mockProfiles.push({
        platform: 'Instagram',
        username: `@${username}`,
        followers: Math.floor(Math.random() * 500000) + 100000,
        engagement_rate: Number((Math.random() * 3 + 2).toFixed(1)),
        verified: Math.random() > 0.5,
        bio: `${creatorName}'s official Instagram • Content creator • ${Math.floor(Math.random() * 1000)}K followers`,
        posts_count: Math.floor(Math.random() * 500) + 200,
        recent_activity: `${Math.floor(Math.random() * 24)} hours ago`,
        url: socialMedia.instagram.startsWith('http') ? socialMedia.instagram : `https://instagram.com/${username}`
      })
    }

    if (socialMedia.twitter) {
      const username = socialMedia.twitter.replace('@', '').replace('https://twitter.com/', '').replace('https://x.com/', '')
      mockProfiles.push({
        platform: 'Twitter',
        username: `@${username}`,
        followers: Math.floor(Math.random() * 300000) + 50000,
        engagement_rate: Number((Math.random() * 2 + 1.5).toFixed(1)),
        verified: Math.random() > 0.3,
        bio: `${creatorName} • Creator & Influencer • Building community`,
        posts_count: Math.floor(Math.random() * 2000) + 500,
        recent_activity: `${Math.floor(Math.random() * 12)} hours ago`,
        url: socialMedia.twitter.startsWith('http') ? socialMedia.twitter : `https://twitter.com/${username}`
      })
    }

    if (socialMedia.youtube) {
      const username = socialMedia.youtube.replace('@', '').replace('https://youtube.com/', '').replace('https://www.youtube.com/', '')
      mockProfiles.push({
        platform: 'YouTube',
        username: `@${username}`,
        followers: Math.floor(Math.random() * 800000) + 200000,
        engagement_rate: Number((Math.random() * 4 + 3).toFixed(1)),
        verified: Math.random() > 0.2,
        bio: `${creatorName}'s YouTube channel • Weekly uploads • Subscribe for exclusive content`,
        posts_count: Math.floor(Math.random() * 200) + 50,
        recent_activity: `${Math.floor(Math.random() * 7)} days ago`,
        url: socialMedia.youtube.startsWith('http') ? socialMedia.youtube : `https://youtube.com/${username}`
      })
    }

    if (socialMedia.tiktok) {
      const username = socialMedia.tiktok.replace('@', '').replace('https://tiktok.com/', '').replace('https://www.tiktok.com/', '')
      mockProfiles.push({
        platform: 'TikTok',
        username: `@${username}`,
        followers: Math.floor(Math.random() * 1000000) + 300000,
        engagement_rate: Number((Math.random() * 5 + 4).toFixed(1)),
        verified: Math.random() > 0.4,
        bio: `${creatorName} • Viral content creator • Follow for daily content`,
        posts_count: Math.floor(Math.random() * 800) + 300,
        recent_activity: `${Math.floor(Math.random() * 6)} hours ago`,
        url: socialMedia.tiktok.startsWith('http') ? socialMedia.tiktok : `https://tiktok.com/@${username}`
      })
    }

    return mockProfiles
  }

  // Generate mock posts based on creator and platform
  const generateMockPosts = (platform?: string): SocialPost[] => {
    const platforms = platform ? [platform] : ['instagram', 'twitter', 'youtube', 'tiktok']
    const mockPosts: SocialPost[] = []

    platforms.forEach(plt => {
      if (plt === 'instagram' && socialMedia.instagram) {
        mockPosts.push({
          id: `ig-${Date.now()}`,
          platform: 'instagram',
          content: `🔥 New setup reveal! What do you think of this RGB lighting? Building something special for my community 💪 #${creatorName.toLowerCase()} #setup #exclusive`,
          engagement: { 
            likes: Math.floor(Math.random() * 20000) + 5000, 
            comments: Math.floor(Math.random() * 1000) + 200, 
            shares: Math.floor(Math.random() * 500) + 50 
          },
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          url: `${socialMedia.instagram}/p/abc123`,
          type: 'post',
          relevance: 'high',
          tags: ['setup', 'exclusive', 'community']
        })
      }

      if (plt === 'twitter' && socialMedia.twitter) {
        mockPosts.push({
          id: `tw-${Date.now()}`,
          platform: 'twitter',
          content: `Just hit ${Math.floor(Math.random() * 500 + 100)}K followers! 🎉 Thinking about launching something exclusive for my top supporters. What would you want to see? 👀`,
          engagement: { 
            likes: Math.floor(Math.random() * 15000) + 3000, 
            comments: Math.floor(Math.random() * 800) + 150, 
            shares: Math.floor(Math.random() * 2000) + 300 
          },
          date: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          url: `${socialMedia.twitter}/status/123456`,
          type: 'post',
          relevance: 'high',
          tags: ['milestone', 'community', 'exclusive']
        })
      }

      if (plt === 'youtube' && socialMedia.youtube) {
        mockPosts.push({
          id: `yt-${Date.now()}`,
          platform: 'youtube',
          content: `EXCLUSIVE Behind the Scenes: How I Built My ${creatorName} Empire | Q&A with Top Supporters`,
          engagement: { 
            likes: Math.floor(Math.random() * 25000) + 8000, 
            comments: Math.floor(Math.random() * 1200) + 300, 
            shares: Math.floor(Math.random() * 200) + 50, 
            views: Math.floor(Math.random() * 200000) + 50000 
          },
          date: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          url: `${socialMedia.youtube}/watch?v=xyz789`,
          type: 'video',
          relevance: 'high',
          tags: ['behind-the-scenes', 'exclusive', 'q&a']
        })
      }

      if (plt === 'tiktok' && socialMedia.tiktok) {
        mockPosts.push({
          id: `tt-${Date.now()}`,
          platform: 'tiktok',
          content: `POV: You're in my exclusive inner circle 👑 Only my top 100 supporters get this access... should I open more spots? 🤔`,
          engagement: { 
            likes: Math.floor(Math.random() * 50000) + 15000, 
            comments: Math.floor(Math.random() * 2000) + 500, 
            shares: Math.floor(Math.random() * 3000) + 800, 
            views: Math.floor(Math.random() * 500000) + 100000 
          },
          date: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          url: `${socialMedia.tiktok}/video/987654`,
          type: 'video',
          relevance: 'high',
          tags: ['exclusive', 'inner-circle', 'top100']
        })
      }
    })

    return mockPosts
  }

  const handleScrapeProfiles = async () => {
    setIsLoading(true)
    setActiveAnalysis('profiles')
    
    // Simulate API call
    setTimeout(() => {
      const mockProfiles = generateMockProfiles()
      setProfiles(mockProfiles)
      setIsLoading(false)
      setActiveAnalysis('')
    }, 2000)
  }

  const handleScrapeContent = async (platform: string) => {
    setIsLoading(true)
    setActiveAnalysis(platform)
    
    // Simulate API call
    setTimeout(() => {
      const mockPosts = generateMockPosts(platform === 'all' ? undefined : platform)
      setPosts(mockPosts)
      setIsLoading(false)
      setActiveAnalysis('')
    }, 1500)
  }

  const openSocialProfile = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-600" />
      case 'twitter': return <Twitter className="w-4 h-4 text-blue-600" />
      case 'youtube': return <Youtube className="w-4 h-4 text-red-600" />
      case 'tiktok': return <Play className="w-4 h-4 text-black" />
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

  const hasAnySocialMedia = Object.values(socialMedia).some(url => url && url.trim() !== '')

  if (!hasAnySocialMedia) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Social Media Links</h3>
            <p className="text-gray-600 mb-4">
              Add social media links to {creatorName}'s profile to enable social intelligence analysis.
            </p>
            <p className="text-sm text-gray-500">
              Go to Creator Management → Overview → Edit to add Instagram, Twitter, YouTube, or TikTok links.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Social Media Intelligence</h3>
          <p className="text-gray-600">Analyze {creatorName}'s content and engagement</p>
        </div>
        <Button onClick={handleScrapeProfiles} disabled={isLoading}>
          {isLoading && activeAnalysis === 'profiles' ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Analyze Profiles
            </>
          )}
        </Button>
      </div>

      {/* Connected Platforms Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
          <CardDescription>Social media accounts linked to {creatorName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(socialMedia).map(([platform, url]) => {
              if (!url) return null
              
              const cleanUrl = url.startsWith('http') ? url : `https://${platform}.com/${url.replace('@', '')}`
              
              return (
                <div key={platform} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(platform)}
                    <span className="font-medium capitalize">{platform}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openSocialProfile(cleanUrl)}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profiles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profiles">Profile Analytics</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Trends</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getPlatformIcon(profile.platform)}
                      <span className="font-medium">{profile.platform}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {profile.verified && (
                        <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openSocialProfile(profile.url)}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
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
                variant={activeAnalysis === 'all' ? "default" : "outline"}
                size="sm"
                disabled={isLoading}
              >
                {isLoading && activeAnalysis === 'all' ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : null}
                All Platforms
              </Button>
              
              {socialMedia.instagram && (
                <Button
                  onClick={() => handleScrapeContent('instagram')}
                  variant={activeAnalysis === 'instagram' ? "default" : "outline"}
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading && activeAnalysis === 'instagram' ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Instagram className="w-3 h-3 mr-1" />
                  )}
                  Instagram
                </Button>
              )}
              
              {socialMedia.twitter && (
                <Button
                  onClick={() => handleScrapeContent('twitter')}
                  variant={activeAnalysis === 'twitter' ? "default" : "outline"}
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading && activeAnalysis === 'twitter' ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Twitter className="w-3 h-3 mr-1" />
                  )}
                  Twitter
                </Button>
              )}
              
              {socialMedia.youtube && (
                <Button
                  onClick={() => handleScrapeContent('youtube')}
                  variant={activeAnalysis === 'youtube' ? "default" : "outline"}
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading && activeAnalysis === 'youtube' ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Youtube className="w-3 h-3 mr-1" />
                  )}
                  YouTube
                </Button>
              )}
              
              {socialMedia.tiktok && (
                <Button
                  onClick={() => handleScrapeContent('tiktok')}
                  variant={activeAnalysis === 'tiktok' ? "default" : "outline"}
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading && activeAnalysis === 'tiktok' ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 mr-1" />
                  )}
                  TikTok
                </Button>
              )}
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
                        <Button variant="outline" size="sm" onClick={() => window.open(post.url, '_blank')}>
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
                    <span className="font-medium">Exclusive content</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Best Time to Post</span>
                    <span className="font-medium">7-9 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Trending Tags</span>
                    <span className="font-medium">#exclusive #community</span>
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
                  <li>• Strong community engagement across platforms</li>
                  <li>• Regular mentions of "exclusive content" and "top supporters"</li>
                  <li>• High interest in behind-the-scenes content</li>
                  <li>• Active across multiple platforms with verified accounts</li>
                  <li>• Audience actively requesting exclusive access</li>
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
                  <li>• Focus on community and exclusive access angle</li>
                  <li>• Leverage existing social proof from comments</li>
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
                  <li>• Assess competition in creator's niche</li>
                  <li>• Review platform-specific community guidelines</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}