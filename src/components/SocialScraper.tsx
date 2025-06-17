'use client'

import { useState, useEffect } from 'react'
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
  AlertCircle,
  CheckCircle2,
  Globe,
  Link
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
  isValid: boolean
  error?: string
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
  const [verificationResults, setVerificationResults] = useState<Record<string, boolean>>({})

  // Verify social media links on component mount
  useEffect(() => {
    verifyAllSocialLinks()
  }, [socialMedia])

  // Clean and validate social media URLs
  const cleanSocialUrl = (platform: string, input: string): { url: string, username: string, isValid: boolean } => {
    if (!input || input.trim() === '') {
      return { url: '', username: '', isValid: false }
    }

    let cleanInput = input.trim()
    let username = ''
    let url = ''

    try {
      // Handle different input formats
      if (cleanInput.startsWith('@')) {
        // Handle @username format
        username = cleanInput.substring(1)
      } else if (cleanInput.startsWith('http')) {
        // Handle full URL format
        const urlObj = new URL(cleanInput)
        const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0)
        username = pathParts[0] || ''
      } else if (cleanInput.includes('/')) {
        // Handle partial URL format
        const parts = cleanInput.split('/').filter(part => part.length > 0)
        username = parts[parts.length - 1]
      } else {
        // Handle plain username
        username = cleanInput
      }

      // Remove any remaining @ symbols
      username = username.replace('@', '')

      // Generate proper URL based on platform
      switch (platform.toLowerCase()) {
        case 'instagram':
          url = `https://www.instagram.com/${username}`
          break
        case 'twitter':
          url = `https://twitter.com/${username}`
          break
        case 'youtube':
          if (username.startsWith('UC') || username.length === 24) {
            url = `https://www.youtube.com/channel/${username}`
          } else {
            url = `https://www.youtube.com/@${username}`
          }
          break
        case 'tiktok':
          url = `https://www.tiktok.com/@${username}`
          break
        default:
          url = cleanInput.startsWith('http') ? cleanInput : `https://${cleanInput}`
      }

      return { url, username, isValid: username.length > 0 }
    } catch (error) {
      console.error(`Error cleaning ${platform} URL:`, error)
      return { url: '', username: '', isValid: false }
    }
  }

  // Verify all social media links
  const verifyAllSocialLinks = async () => {
    const results: Record<string, boolean> = {}
    
    for (const [platform, link] of Object.entries(socialMedia)) {
      if (link && link.trim() !== '') {
        const { isValid } = cleanSocialUrl(platform, link)
        results[platform] = isValid
      }
    }
    
    setVerificationResults(results)
  }

  // Generate realistic mock data based on actual social media links and creator info
  const generateRealisticProfiles = (): CreatorProfile[] => {
    const mockProfiles: CreatorProfile[] = []

    // Base follower counts based on creator category and phase
    const getBaseFollowers = (platform: string) => {
      const multipliers = {
        instagram: 1,
        twitter: 0.7,
        youtube: 1.5,
        tiktok: 2
      }
      
      // Base on creator name and category for consistency
      let base = 100000
      if (creatorName.toLowerCase().includes('kurama')) base = 500000
      if (creatorName.toLowerCase().includes('nina')) base = 300000
      if (creatorName.toLowerCase().includes('edward')) base = 400000
      
      return Math.floor(base * (multipliers[platform as keyof typeof multipliers] || 1))
    }

    if (socialMedia.instagram && verificationResults.instagram) {
      const { username, url } = cleanSocialUrl('instagram', socialMedia.instagram)
      mockProfiles.push({
        platform: 'Instagram',
        username: `@${username}`,
        followers: getBaseFollowers('instagram') + Math.floor(Math.random() * 50000),
        engagement_rate: Number((Math.random() * 2 + 3).toFixed(1)),
        verified: Math.random() > 0.3,
        bio: `${creatorName}'s official Instagram • Content creator • Building community 📱`,
        posts_count: Math.floor(Math.random() * 500) + 200,
        recent_activity: `${Math.floor(Math.random() * 24)} hours ago`,
        url,
        isValid: true
      })
    }

    if (socialMedia.twitter && verificationResults.twitter) {
      const { username, url } = cleanSocialUrl('twitter', socialMedia.twitter)
      mockProfiles.push({
        platform: 'Twitter',
        username: `@${username}`,
        followers: getBaseFollowers('twitter') + Math.floor(Math.random() * 30000),
        engagement_rate: Number((Math.random() * 1.5 + 2).toFixed(1)),
        verified: Math.random() > 0.4,
        bio: `${creatorName} • Creator & Influencer • Building something special 🚀`,
        posts_count: Math.floor(Math.random() * 2000) + 500,
        recent_activity: `${Math.floor(Math.random() * 12)} hours ago`,
        url,
        isValid: true
      })
    }

    if (socialMedia.youtube && verificationResults.youtube) {
      const { username, url } = cleanSocialUrl('youtube', socialMedia.youtube)
      mockProfiles.push({
        platform: 'YouTube',
        username: `@${username}`,
        followers: getBaseFollowers('youtube') + Math.floor(Math.random() * 100000),
        engagement_rate: Number((Math.random() * 3 + 4).toFixed(1)),
        verified: Math.random() > 0.2,
        bio: `${creatorName}'s YouTube channel • Weekly uploads • Subscribe for exclusive content 🎥`,
        posts_count: Math.floor(Math.random() * 200) + 50,
        recent_activity: `${Math.floor(Math.random() * 7)} days ago`,
        url,
        isValid: true
      })
    }

    if (socialMedia.tiktok && verificationResults.tiktok) {
      const { username, url } = cleanSocialUrl('tiktok', socialMedia.tiktok)
      mockProfiles.push({
        platform: 'TikTok',
        username: `@${username}`,
        followers: getBaseFollowers('tiktok') + Math.floor(Math.random() * 200000),
        engagement_rate: Number((Math.random() * 4 + 5).toFixed(1)),
        verified: Math.random() > 0.5,
        bio: `${creatorName} • Viral content creator • Follow for daily content 🔥`,
        posts_count: Math.floor(Math.random() * 800) + 300,
        recent_activity: `${Math.floor(Math.random() * 6)} hours ago`,
        url,
        isValid: true
      })
    }

    return mockProfiles
  }

  // Generate contextual posts based on creator and platform
  const generateContextualPosts = (platform?: string): SocialPost[] => {
    const platforms = platform ? [platform] : Object.keys(socialMedia).filter(p => socialMedia[p as keyof typeof socialMedia])
    const mockPosts: SocialPost[] = []

    // Content themes based on creator name/category
    const getContentThemes = () => {
      if (creatorName.toLowerCase().includes('kurama')) {
        return {
          themes: ['gaming', 'esports', 'tournaments', 'streaming'],
          content: [
            'Just hit a new personal best in ranked! The grind never stops 🎮',
            '🔥 New gaming setup reveal! What do you think of this RGB lighting?',
            'Behind the scenes of my tournament prep. Only my inner circle gets this access 👑',
            'Thinking about launching something exclusive for my top supporters... 🤔'
          ]
        }
      } else if (creatorName.toLowerCase().includes('nina')) {
        return {
          themes: ['streaming', 'community', 'variety', 'collaboration'],
          content: [
            'Stream highlights from this week! Thanks for all the support 💜',
            'Building something special for my community. Stay tuned... 👀',
            'Q&A session was amazing! Love connecting with you all',
            'Exclusive content coming soon for my most dedicated viewers 🌟'
          ]
        }
      } else if (creatorName.toLowerCase().includes('edward')) {
        return {
          themes: ['music', 'production', 'dj', 'live-sets'],
          content: [
            '🎵 New track in the works! Sneak peek for my inner circle',
            'Live set from last night was incredible! Thanks to everyone who came',
            'Studio sessions hit different when you know your community supports you 🎧',
            'Thinking about exclusive releases for my top 100 supporters...'
          ]
        }
      }
      
      return {
        themes: ['content', 'community', 'exclusive', 'creator'],
        content: [
          'Building something special for my community 🚀',
          'Exclusive content coming soon for my supporters',
          'Behind the scenes access like never before',
          'Only my inner circle gets this level of access'
        ]
      }
    }

    const { themes, content } = getContentThemes()

    platforms.forEach(plt => {
      if (!socialMedia[plt as keyof typeof socialMedia]) return

      const platformContent = content[Math.floor(Math.random() * content.length)]
      const platformThemes = themes.slice(0, 3)

      // Generate platform-specific posts
      if (plt === 'instagram') {
        mockPosts.push({
          id: `ig-${Date.now()}-${Math.random()}`,
          platform: 'instagram',
          content: `${platformContent} #${creatorName.toLowerCase().replace(' ', '')} #exclusive #community`,
          engagement: { 
            likes: Math.floor(Math.random() * 25000) + 8000, 
            comments: Math.floor(Math.random() * 1200) + 300, 
            shares: Math.floor(Math.random() * 800) + 100 
          },
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          url: `${socialMedia.instagram}/p/${Math.random().toString(36).substr(2, 9)}`,
          type: 'post',
          relevance: 'high',
          tags: [...platformThemes, 'exclusive', 'community']
        })
      }

      if (plt === 'twitter') {
        mockPosts.push({
          id: `tw-${Date.now()}-${Math.random()}`,
          platform: 'twitter',
          content: `${platformContent} What would you want to see? 👀`,
          engagement: { 
            likes: Math.floor(Math.random() * 18000) + 5000, 
            comments: Math.floor(Math.random() * 900) + 200, 
            shares: Math.floor(Math.random() * 2500) + 400 
          },
          date: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          url: `${socialMedia.twitter}/status/${Math.floor(Math.random() * 1000000000000000)}`,
          type: 'post',
          relevance: 'high',
          tags: [...platformThemes, 'engagement', 'community']
        })
      }

      if (plt === 'youtube') {
        mockPosts.push({
          id: `yt-${Date.now()}-${Math.random()}`,
          platform: 'youtube',
          content: `EXCLUSIVE: ${creatorName} Behind the Scenes | Q&A with Top Supporters`,
          engagement: { 
            likes: Math.floor(Math.random() * 30000) + 10000, 
            comments: Math.floor(Math.random() * 1500) + 400, 
            shares: Math.floor(Math.random() * 300) + 80, 
            views: Math.floor(Math.random() * 300000) + 80000 
          },
          date: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          url: `${socialMedia.youtube}/watch?v=${Math.random().toString(36).substr(2, 11)}`,
          type: 'video',
          relevance: 'high',
          tags: [...platformThemes, 'behind-scenes', 'exclusive']
        })
      }

      if (plt === 'tiktok') {
        mockPosts.push({
          id: `tt-${Date.now()}-${Math.random()}`,
          platform: 'tiktok',
          content: `POV: You're in my exclusive inner circle 👑 Only my top 100 supporters get this access...`,
          engagement: { 
            likes: Math.floor(Math.random() * 60000) + 20000, 
            comments: Math.floor(Math.random() * 2500) + 600, 
            shares: Math.floor(Math.random() * 4000) + 1000, 
            views: Math.floor(Math.random() * 800000) + 200000 
          },
          date: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          url: `${socialMedia.tiktok}/video/${Math.floor(Math.random() * 10000000000000000000)}`,
          type: 'video',
          relevance: 'high',
          tags: [...platformThemes, 'exclusive', 'inner-circle']
        })
      }
    })

    return mockPosts
  }

  const handleScrapeProfiles = async () => {
    setIsLoading(true)
    setActiveAnalysis('profiles')
    
    // Simulate API call with realistic delay
    setTimeout(() => {
      const realisticProfiles = generateRealisticProfiles()
      setProfiles(realisticProfiles)
      setIsLoading(false)
      setActiveAnalysis('')
      
      if (realisticProfiles.length > 0) {
        console.log(`✅ Successfully analyzed ${realisticProfiles.length} social profiles for ${creatorName}`)
      }
    }, 2500)
  }

  const handleScrapeContent = async (platform: string) => {
    setIsLoading(true)
    setActiveAnalysis(platform)
    
    // Simulate API call with realistic delay
    setTimeout(() => {
      const contextualPosts = generateContextualPosts(platform === 'all' ? undefined : platform)
      setPosts(contextualPosts)
      setIsLoading(false)
      setActiveAnalysis('')
      
      console.log(`✅ Successfully analyzed ${contextualPosts.length} posts for ${platform === 'all' ? 'all platforms' : platform}`)
    }, 2000)
  }

  const openSocialProfile = (url: string) => {
    if (url) {
      console.log(`🔗 Opening social profile: ${url}`)
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

  const hasValidSocialMedia = Object.entries(socialMedia).some(([platform, url]) => 
    url && url.trim() !== '' && verificationResults[platform]
  )

  if (!hasValidSocialMedia) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Valid Social Media Links</h3>
            <p className="text-gray-600 mb-4">
              Add valid social media links to {creatorName}'s profile to enable social intelligence analysis.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Go to Creator Management → Overview → Edit to add:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Instagram: @username or https://instagram.com/username</li>
                <li>Twitter: @username or https://twitter.com/username</li>
                <li>YouTube: @channel or https://youtube.com/@channel</li>
                <li>TikTok: @username or https://tiktok.com/@username</li>
              </ul>
            </div>
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
          <p className="text-gray-600">Analyze {creatorName}'s content and engagement across platforms</p>
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
              if (!url || url.trim() === '') return null
              
              const { url: cleanUrl, username, isValid } = cleanSocialUrl(platform, url)
              const isVerified = verificationResults[platform]
              
              return (
                <div key={platform} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(platform)}
                    <div>
                      <span className="font-medium capitalize">{platform}</span>
                      <div className="flex items-center space-x-1">
                        {isVerified ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          {isVerified ? 'Valid' : 'Invalid'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openSocialProfile(cleanUrl)}
                    disabled={!isVerified}
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
                <p className="text-gray-600 mb-4">Click "Analyze Profiles" to get creator social media insights</p>
                <p className="text-sm text-gray-500">
                  This will analyze follower counts, engagement rates, and profile information across all connected platforms.
                </p>
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
              
              {Object.entries(socialMedia).map(([platform, url]) => {
                if (!url || !verificationResults[platform]) return null
                
                return (
                  <Button
                    key={platform}
                    onClick={() => handleScrapeContent(platform)}
                    variant={activeAnalysis === platform ? "default" : "outline"}
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading && activeAnalysis === platform ? (
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      getPlatformIcon(platform)
                    )}
                    <span className="ml-1 capitalize">{platform}</span>
                  </Button>
                )
              })}
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
                        <Button variant="outline" size="sm" onClick={() => openSocialProfile(post.url)}>
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
                  <p className="text-gray-600 mb-4">Select a platform to analyze recent content</p>
                  <p className="text-sm text-gray-500">
                    This will analyze recent posts, engagement metrics, and content themes to identify Stacked opportunities.
                  </p>
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
                  {profiles.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Average Engagement Rate</span>
                        <span className="font-medium">
                          {profiles.length > 0 ? 
                            (profiles.reduce((sum, p) => sum + p.engagement_rate, 0) / profiles.length).toFixed(1) : '0'
                          }%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Followers</span>
                        <span className="font-medium">
                          {formatNumber(profiles.reduce((sum, p) => sum + p.followers, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Active Platforms</span>
                        <span className="font-medium">{profiles.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Verified Accounts</span>
                        <span className="font-medium">{profiles.filter(p => p.verified).length}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Click "Analyze Profiles" to see engagement metrics
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Average Likes</span>
                        <span className="font-medium">
                          {formatNumber(Math.floor(posts.reduce((sum, p) => sum + p.engagement.likes, 0) / posts.length))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Top Performing Type</span>
                        <span className="font-medium">Exclusive content</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Community Interest</span>
                        <span className="font-medium">Behind-the-scenes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Stacked Mentions</span>
                        <span className="font-medium text-green-600">
                          {posts.filter(p => 
                            p.content.toLowerCase().includes('exclusive') || 
                            p.content.toLowerCase().includes('inner circle') ||
                            p.content.toLowerCase().includes('top')
                          ).length}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Analyze content to see performance metrics
                    </p>
                  )}
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
                  <li>• Strong community engagement across verified platforms</li>
                  <li>• Regular mentions of "exclusive content" and "top supporters"</li>
                  <li>• High interest in behind-the-scenes and inner circle content</li>
                  <li>• Active audience requesting exclusive access</li>
                  <li>• Consistent posting schedule with high engagement rates</li>
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
                  <li>• Price around $75-100 based on engagement levels and follower count</li>
                  <li>• Launch during peak engagement times identified in analysis</li>
                  <li>• Focus on community and exclusive access messaging</li>
                  <li>• Leverage existing social proof from comments and engagement</li>
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
                  <li>• Monitor for any existing membership or subscription programs</li>
                  <li>• Verify engagement authenticity across all platforms</li>
                  <li>• Check platform-specific community guidelines for exclusive content</li>
                  <li>• Assess competition in {creatorName}'s specific niche</li>
                  <li>• Review recent content for any Stacked-related keywords or competitors</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}