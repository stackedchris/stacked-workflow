'use client'

import FirebaseSetup from '@/components/FirebaseSetup'

export default function FirebaseSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Firebase Integration</h1>
          <p className="text-gray-600 mt-2">
            Set up reliable, real-time database sync for your team
          </p>
        </div>

        <FirebaseSetup />

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Firebase provides a much more reliable alternative to Supabase with zero migration conflicts.
          </p>
        </div>
      </div>
    </div>
  )
}