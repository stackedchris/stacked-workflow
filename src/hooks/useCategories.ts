import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export interface CreatorCategory {
  id: string
  name: string
  color: string
  description?: string
  createdAt: string
}

const defaultCategories: CreatorCategory[] = [
  { id: 'gaming', name: 'Gaming', color: 'purple', description: 'Gaming content creators', createdAt: '2025-01-01' },
  { id: 'music', name: 'Music', color: 'pink', description: 'Musicians and music producers', createdAt: '2025-01-01' },
  { id: 'streaming', name: 'Streaming', color: 'blue', description: 'Live streamers and content creators', createdAt: '2025-01-01' },
  { id: 'lifestyle', name: 'Lifestyle', color: 'green', description: 'Lifestyle and wellness creators', createdAt: '2025-01-01' },
  { id: 'comedy', name: 'Comedy', color: 'yellow', description: 'Comedy and entertainment creators', createdAt: '2025-01-01' },
  { id: 'fashion', name: 'Fashion', color: 'orange', description: 'Fashion and style influencers', createdAt: '2025-01-01' }
]

export function useCategories() {
  const [categories, setCategories] = useLocalStorage<CreatorCategory[]>('stacked-categories', defaultCategories)

  const addCategory = (category: Omit<CreatorCategory, 'id' | 'createdAt'>) => {
    const newCategory: CreatorCategory = {
      ...category,
      id: category.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString()
    }
    setCategories([...categories, newCategory])
    return newCategory
  }

  const updateCategory = (id: string, updates: Partial<CreatorCategory>) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ))
  }

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id))
  }

  const getCategoryByName = (name: string) => {
    return categories.find(cat => cat.name === name)
  }

  const getCategoryNames = () => {
    return categories.map(cat => cat.name)
  }

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryByName,
    getCategoryNames
  }
}