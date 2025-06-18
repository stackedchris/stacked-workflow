import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { syncService } from '@/lib/sync-service'

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
  const [rawCategories, setRawCategories] = useLocalStorage<CreatorCategory[]>('stacked-categories', defaultCategories)
  
  // Ensure categories is always an array to prevent errors
  const categories = Array.isArray(rawCategories) ? rawCategories : defaultCategories

  // Subscribe to sync events for categories
  useEffect(() => {
    const cleanup = syncService.on('sync', (event: any) => {
      if (event.type === 'categories' && event.action === 'update' && event.userId !== 'local') {
        setRawCategories(event.data);
      }
    });
    
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [setRawCategories]);

  const addCategory = (category: Omit<CreatorCategory, 'id' | 'createdAt'>) => {
    const newCategory: CreatorCategory = {
      ...category,
      id: category.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString()
    }
    
    const updatedCategories = [...categories, newCategory];
    setRawCategories(updatedCategories)
    
    // Emit sync event
    syncService.emitSyncEvent({
      type: 'categories',
      action: 'update',
      data: updatedCategories
    });
    
    return newCategory
  }

  const updateCategory = (id: string, updates: Partial<CreatorCategory>) => {
    const updatedCategories = categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    );
    
    setRawCategories(updatedCategories)
    
    // Emit sync event
    syncService.emitSyncEvent({
      type: 'categories',
      action: 'update',
      data: updatedCategories
    });
  }

  const deleteCategory = (id: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== id);
    setRawCategories(updatedCategories)
    
    // Emit sync event
    syncService.emitSyncEvent({
      type: 'categories',
      action: 'update',
      data: updatedCategories
    });
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