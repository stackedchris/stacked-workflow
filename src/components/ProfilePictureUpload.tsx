'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  User,
  X,
  Check,
  AlertCircle,
  Camera,
  Edit
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface ProfilePictureUploadProps {
  currentAvatar?: string
  onAvatarUpdate: (avatarUrl: string) => void
  creatorName?: string
}

export default function ProfilePictureUpload({
  currentAvatar,
  onAvatarUpdate,
  creatorName = 'Creator'
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error } = useToast()

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file
    if (!file.type.startsWith('image/')) {
      error('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      error('Image size must be less than 10MB')
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Simulate upload process
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          
          // In a real app, this would be the URL from your cloud storage
          // For demo purposes, we'll use the object URL
          onAvatarUpdate(objectUrl)
          success('Profile picture updated successfully')
          
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const handleRemoveAvatar = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    onAvatarUpdate('👤') // Reset to default emoji
    success('Profile picture removed')
  }

  const displayAvatar = previewUrl || (currentAvatar && currentAvatar !== '👤' ? currentAvatar : null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="w-5 h-5" />
          <span>Profile Picture</span>
        </CardTitle>
        <CardDescription>
          Upload a profile picture for {creatorName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Avatar Display */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={`${creatorName} profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl text-gray-400">
                  {currentAvatar && currentAvatar !== '👤' ? currentAvatar : <User className="w-16 h-16" />}
                </div>
              )}
            </div>
            
            {/* Edit Button Overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
              title="Change profile picture"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 mb-1">
            Click to upload a new profile picture
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            {displayAvatar ? 'Change Picture' : 'Upload Picture'}
          </Button>
          
          {displayAvatar && (
            <Button
              variant="outline"
              onClick={handleRemoveAvatar}
              disabled={isUploading}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {/* Upload Guidelines */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium mb-1">Guidelines:</h4>
          <ul className="space-y-1">
            <li>• Use a clear, high-quality image</li>
            <li>• Square images work best (1:1 ratio)</li>
            <li>• Face should be clearly visible</li>
            <li>• Professional or brand-appropriate style</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}