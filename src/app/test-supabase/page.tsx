'use client'

import SupabaseConnectionTest from '@/components/SupabaseConnectionTest'

export default function TestSupabasePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Supabase Connection Test</h1>
          <p className="text-gray-600 mt-2">
            Verify your Supabase database is properly configured and working
          </p>
        </div>

        <SupabaseConnectionTest />

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Once the connection test passes, your website will work online with real-time data sync.
          </p>
        </div>
      </div>
    </div>
  )
}