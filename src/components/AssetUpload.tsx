'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Upload,
  type File,
  Image,
  Video,
  FileText,
  X,
  Check,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Plus
} from 'lucide-react'

interface AssetFile {
  id: string
  name: string
  type: 'image' | 'video' | 'document'
  size: number
  url?: string
  status: 'uploading' | 'completed' | 'error'
  progress: number
  createdAt: string
}

interface AssetUploadProps {
  creatorId: number
  assetType: 'profileImages' | 'videos' | 'pressKit'
  existingAssets: string[]
  onAssetsUpdate: (assets: string[]) => void
}

export default function AssetUpload({
  creatorId,
  assetType,
  existingAssets,
  onAssetsUpdate
}: AssetUploadProps) {
  const [assets, setAssets] = useState<AssetFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      uploadIntervalsRef.current.forEach((interval) => {
        clearInterval(interval)
      })
      uploadIntervalsRef.current.clear()
    }
  }, [])

  const getAssetTypeConfig = () => {
    switch (assetType) {
      case 'profileImages':
        return {
          title: 'Profile Images',
          icon: <Image className="w-5 h-5" />,
          accept: 'image/*',
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
          description: 'Upload profile photos, headshots, and promotional images'
        }
      case 'videos':
        return {
          title: 'Videos',
          icon: <Video className="w-5 h-5" />,
          accept: 'video/*',
          maxSize: 100 * 1024 * 1024, // 100MB
          allowedTypes: ['video/mp4', 'video/webm', 'video/mov'],
          description: 'Upload intro videos, highlights, and promotional content'
        }
      case 'pressKit':
        return {
          title: 'Press Kit',
          icon: <FileText className="w-5 h-5" />,
          accept: '.pdf,.doc,.docx,.txt',
          maxSize: 25 * 1024 * 1024, // 25MB
          allowedTypes: ['application/pdf', 'application/msword', 'text/plain'],
          description: 'Upload bio, media kit, statistics, and press materials'
        }
    }
  }

  const config = getAssetTypeConfig()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  const validateFile = (file: File) => {
    if (file.size > config.maxSize) {
      return `File size exceeds ${formatFileSize(config.maxSize)} limit`
    }
    if (!config.allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`
    }
    return null
  }

  const handleRealUpload = async (file: File, assetId: string) => {
    // Create object URL for immediate preview
    const objectUrl = URL.createObjectURL(file)

    // Update asset with object URL for preview
    setAssets(prev => prev.map(asset =>
      asset.id === assetId
        ? { ...asset, url: objectUrl, progress: 0 }
        : asset
    ))

    // Simulate upload progress (in real app, this would be actual upload to cloud storage)
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        uploadIntervalsRef.current.delete(assetId)
        
        setAssets(prev => prev.map(asset =>
          asset.id === assetId
            ? {
                ...asset,
                status: 'completed',
                progress: 100,
                url: objectUrl // Keep object URL for demo (in real app, use cloud storage URL)
              }
            : asset
        ))
        // Update parent component with the file name
        const updatedAssets = [...existingAssets, file.name]
        onAssetsUpdate(updatedAssets)

        // Show success notification
        console.log(`✅ Successfully uploaded ${file.name}`)
      } else {
        setAssets(prev => prev.map(asset =>
          asset.id === assetId ? { ...asset, progress: Math.round(progress) } : asset
        ))
      }
    }, 200)

    // Store interval reference for cleanup
    uploadIntervalsRef.current.set(assetId, interval)
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const validFiles = []
    const errors = []

    for (const file of Array.from(files)) {
      const validation = validateFile(file)
      if (validation) {
        errors.push(`${file.name}: ${validation}`)
        continue
      }
      validFiles.push(file)
    }

    // Show validation errors
    if (errors.length > 0) {
      alert(`❌ Upload errors:\n${errors.join('\n')}`)
    }

    // Process valid files
    for (const file of validFiles) {
      const assetId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const asset: AssetFile = {
        id: assetId,
        name: file.name,
        type: assetType === 'profileImages' ? 'image' : assetType === 'videos' ? 'video' : 'document',
        size: file.size,
        status: 'uploading',
        progress: 0,
        createdAt: new Date().toISOString()
      }

      setAssets(prev => [...prev, asset])
      handleRealUpload(file, assetId)
    }

    if (validFiles.length > 0) {
      console.log(`Starting upload of ${validFiles.length} file(s)`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeAsset = (assetId: string) => {
    // Clear any running interval for this asset
    const interval = uploadIntervalsRef.current.get(assetId)
    if (interval) {
      clearInterval(interval)
      uploadIntervalsRef.current.delete(assetId)
    }

    const asset = assets.find(a => a.id === assetId)
    if (asset && asset.url) {
      URL.revokeObjectURL(asset.url) // Clean up memory
    }
    setAssets(prev => prev.filter(asset => asset.id !== assetId))
  }

  const removeExistingAsset = (assetName: string) => {
    if (confirm(`Are you sure you want to remove ${assetName}?`)) {
      const updatedAssets = existingAssets.filter(asset => asset !== assetName)
      onAssetsUpdate(updatedAssets)
      alert('✅ Asset removed successfully!')
    }
  }

  const previewAsset = (asset: AssetFile | string) => {
    if (typeof asset === 'string') {
      alert(`Preview for ${asset} - Would open in new window in real app`)
    } else if (asset.url) {
      window.open(asset.url, '_blank')
    }
  }

  const downloadAsset = (asset: AssetFile | string) => {
    if (typeof asset === 'string') {
      alert(`Download ${asset} - Would trigger download in real app`)
    } else if (asset.url) {
      const a = document.createElement('a')
      a.href = asset.url
      a.download = asset.name
      a.click()
    }
  }

  const getFileIcon = (type: 'image' | 'video' | 'document') => {
    switch (type) {
      case 'image': return <Image className="w-8 h-8 text-blue-500" />
      case 'video': return <Video className="w-8 h-8 text-purple-500" />
      case 'document': return <FileText className="w-8 h-8 text-green-500" />
    }
  }

  const getStatusIcon = (status: 'uploading' | 'completed' | 'error') => {
    switch (status) {
      case 'uploading': return <Upload className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'completed': return <Check className="w-4 h-4 text-green-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {config.icon}
          <span>{config.title}</span>
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Assets */}
        {existingAssets.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Existing Assets ({existingAssets.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {existingAssets.map((asset) => (
                <div key={asset} className="border rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                  {getFileIcon(assetType === 'profileImages' ? 'image' : assetType === 'videos' ? 'video' : 'document')}
                  <p className="text-sm text-gray-600 mt-2 truncate" title={asset}>{asset}</p>
                  <div className="flex justify-center space-x-1 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => previewAsset(asset)}
                      title="Preview"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsset(asset)}
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeExistingAsset(asset)}
                      className="text-red-600 hover:text-red-700"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to upload
          </h3>
          <p className="text-gray-600 mb-4">
            Max file size: {formatFileSize(config.maxSize)} • Supported: {config.allowedTypes.join(', ')}
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={config.accept}
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {/* Upload Progress */}
        {assets.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Upload Progress ({assets.length})</h4>
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(asset.type)}
                      <div className="flex-1">
                        <h5 className="font-medium text-sm truncate">{asset.name}</h5>
                        <p className="text-xs text-gray-500">{formatFileSize(asset.size)} • {new Date(asset.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(asset.status)}
                      {asset.status === 'uploading' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeAsset(asset.id)}
                          title="Cancel upload"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                      {asset.status === 'completed' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewAsset(asset)}
                            title="Preview"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadAsset(asset)}
                            title="Download"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {asset.status === 'uploading' && (
                    <div className="space-y-1">
                      <Progress value={asset.progress} className="h-2" />
                      <p className="text-xs text-gray-500">{asset.progress}% uploaded</p>
                    </div>
                  )}
                  {asset.status === 'completed' && (
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Uploaded Successfully
                      </Badge>
                      <p className="text-xs text-gray-500">Ready to use</p>
                    </div>
                  )}
                  {asset.status === 'error' && (
                    <div className="flex items-center justify-between">
                      <Badge className="bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Upload Failed
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Retry upload logic would go here
                          alert('Retry functionality would be implemented here')
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Summary */}
        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-1">Supported formats:</p>
              <p>{config.allowedTypes.join(', ')}</p>
            </div>
            <div>
              <p className="font-medium mb-1">Upload limits:</p>
              <p>Max file size: {formatFileSize(config.maxSize)}</p>
              <p>Multiple files supported</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}