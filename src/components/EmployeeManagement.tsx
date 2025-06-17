'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  User,
  Mail,
  Phone,
  Users,
  BarChart3,
  Target,
  Calendar,
  Award,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useToast } from '@/components/ui/toast'

export interface Employee {
  id: number
  name: string
  email: string
  phone: string
  role: string
  department: string
  avatar: string
  bio: string
  assignedCreators: number[]
  startDate: string
  status: 'active' | 'inactive'
  permissions: string[]
  createdAt: string
  lastUpdated: string
}

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
  assignedEmployee?: number
}

interface EmployeeManagementProps {
  creators?: Creator[]
  onCreatorsUpdate?: (creators: Creator[]) => void
}

const defaultEmployees: Employee[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@company.com",
    phone: "+1 (555) 123-4567",
    role: "Creator Manager",
    department: "Operations",
    avatar: "👩‍💼",
    bio: "Experienced creator manager specializing in gaming and streaming creators",
    assignedCreators: [],
    startDate: "2024-01-15",
    status: "active",
    permissions: ["creator_management", "analytics", "content_approval"],
    createdAt: "2024-01-15",
    lastUpdated: "2025-01-17"
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@company.com",
    phone: "+1 (555) 234-5678",
    role: "Strategy Lead",
    department: "Strategy",
    avatar: "👨‍💻",
    bio: "Strategic planning and campaign optimization specialist",
    assignedCreators: [],
    startDate: "2024-02-01",
    status: "active",
    permissions: ["strategy_management", "analytics", "reporting"],
    createdAt: "2024-02-01",
    lastUpdated: "2025-01-17"
  }
]

const roles = [
  "Creator Manager",
  "Strategy Lead", 
  "Content Coordinator",
  "Analytics Specialist",
  "Account Executive",
  "Team Lead"
]

const departments = [
  "Operations",
  "Strategy", 
  "Content",
  "Analytics",
  "Sales",
  "Management"
]

const permissions = [
  "creator_management",
  "content_approval", 
  "analytics",
  "strategy_management",
  "reporting",
  "admin"
]

export default function EmployeeManagement({ creators = [], onCreatorsUpdate }: EmployeeManagementProps) {
  const [employees, setEmployees] = useLocalStorage<Employee[]>('stacked-employees', defaultEmployees)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Employee>>({})
  const { success, error } = useToast()

  const handleCreateEmployee = () => {
    if (!editForm.name || !editForm.email || !editForm.role) {
      error('Name, email, and role are required')
      return
    }

    const newEmployee: Employee = {
      id: Date.now(),
      name: editForm.name || '',
      email: editForm.email || '',
      phone: editForm.phone || '',
      role: editForm.role || '',
      department: editForm.department || '',
      avatar: editForm.avatar || '👤',
      bio: editForm.bio || '',
      assignedCreators: [],
      startDate: editForm.startDate || new Date().toISOString().split('T')[0],
      status: 'active',
      permissions: editForm.permissions || [],
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    setEmployees([...employees, newEmployee])
    setIsCreating(false)
    setEditForm({})
    success('Employee added successfully')
  }

  const handleUpdateEmployee = () => {
    if (!selectedEmployee || !editForm.name || !editForm.email || !editForm.role) {
      error('Name, email, and role are required')
      return
    }

    const updatedEmployees = employees.map(employee =>
      employee.id === selectedEmployee.id
        ? {
            ...employee,
            ...editForm,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : employee
    )

    setEmployees(updatedEmployees)
    setSelectedEmployee(updatedEmployees.find(e => e.id === selectedEmployee.id) || null)
    setIsEditing(false)
    success('Employee updated successfully')
  }

  const handleDeleteEmployee = (employeeId: number) => {
    if (confirm('Are you sure you want to remove this employee? This will unassign them from all creators.')) {
      const updatedEmployees = employees.filter(employee => employee.id !== employeeId)
      setEmployees(updatedEmployees)
      
      // Unassign from creators
      if (onCreatorsUpdate) {
        const updatedCreators = creators.map(creator =>
          creator.assignedEmployee === employeeId
            ? { ...creator, assignedEmployee: undefined }
            : creator
        )
        onCreatorsUpdate(updatedCreators)
      }

      if (selectedEmployee?.id === employeeId) {
        setSelectedEmployee(null)
      }
      success('Employee removed successfully')
    }
  }

  const assignCreatorToEmployee = (creatorId: number, employeeId: number) => {
    // Update employee's assigned creators
    const updatedEmployees = employees.map(employee => {
      if (employee.id === employeeId) {
        const assignedCreators = employee.assignedCreators.includes(creatorId)
          ? employee.assignedCreators.filter(id => id !== creatorId)
          : [...employee.assignedCreators, creatorId]
        return { ...employee, assignedCreators, lastUpdated: new Date().toISOString().split('T')[0] }
      }
      // Remove creator from other employees
      return {
        ...employee,
        assignedCreators: employee.assignedCreators.filter(id => id !== creatorId)
      }
    })
    setEmployees(updatedEmployees)

    // Update creator's assigned employee
    if (onCreatorsUpdate) {
      const updatedCreators = creators.map(creator =>
        creator.id === creatorId
          ? { ...creator, assignedEmployee: employeeId }
          : creator
      )
      onCreatorsUpdate(updatedCreators)
    }

    success('Creator assignment updated')
  }

  const getEmployeeAnalytics = (employee: Employee) => {
    const assignedCreators = creators.filter(creator => 
      employee.assignedCreators.includes(creator.id)
    )

    const totalRevenue = assignedCreators.reduce((sum, creator) => 
      sum + (creator.cardsSold * creator.cardPrice), 0
    )

    const totalCardsSold = assignedCreators.reduce((sum, creator) => 
      sum + creator.cardsSold, 0
    )

    const averageProgress = assignedCreators.length > 0
      ? assignedCreators.reduce((sum, creator) => 
          sum + (creator.cardsSold / creator.totalCards * 100), 0
        ) / assignedCreators.length
      : 0

    const highPerformers = assignedCreators.filter(creator => 
      creator.salesVelocity === 'High'
    ).length

    return {
      totalCreators: assignedCreators.length,
      totalRevenue,
      totalCardsSold,
      averageProgress,
      highPerformers,
      assignedCreators
    }
  }

  const startEditing = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEditForm(employee)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm({})
  }

  const cancelCreating = () => {
    setIsCreating(false)
    setEditForm({})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-gray-600">Manage team members and creator assignments</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees">Team Members</TabsTrigger>
          <TabsTrigger value="assignments">Creator Assignments</TabsTrigger>
          <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Employee List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Team ({employees.length})</CardTitle>
                  <CardDescription>Select an employee to view details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedEmployee?.id === employee.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{employee.avatar}</span>
                          <div>
                            <h4 className="font-medium text-sm">{employee.name}</h4>
                            <p className="text-xs text-gray-600">{employee.role}</p>
                          </div>
                        </div>
                        <Badge className={employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {employee.status}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {employee.assignedCreators.length} creator{employee.assignedCreators.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                  {employees.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No employees yet</p>
                      <Button size="sm" className="mt-2" onClick={() => setIsCreating(true)}>
                        <Plus className="w-3 h-3 mr-1" />
                        Add First Employee
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Employee Details */}
            <div className="lg:col-span-3">
              {isCreating ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Add New Employee</CardTitle>
                      <Button variant="outline" size="sm" onClick={cancelCreating}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <Input
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Employee name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Avatar</label>
                        <Input
                          value={editForm.avatar || ''}
                          onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                          placeholder="👤"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          placeholder="employee@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <Input
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Role *</label>
                        <Select
                          value={editForm.role || ''}
                          onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Department</label>
                        <Select
                          value={editForm.department || ''}
                          onValueChange={(value) => setEditForm({ ...editForm, department: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Start Date</label>
                        <Input
                          type="date"
                          value={editForm.startDate || ''}
                          onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Bio</label>
                      <Textarea
                        value={editForm.bio || ''}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Employee bio and description"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Permissions</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {permissions.map((permission) => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editForm.permissions?.includes(permission) || false}
                              onChange={(e) => {
                                const currentPermissions = editForm.permissions || []
                                if (e.target.checked) {
                                  setEditForm({
                                    ...editForm,
                                    permissions: [...currentPermissions, permission]
                                  })
                                } else {
                                  setEditForm({
                                    ...editForm,
                                    permissions: currentPermissions.filter(p => p !== permission)
                                  })
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm capitalize">{permission.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button onClick={handleCreateEmployee} disabled={!editForm.name || !editForm.email || !editForm.role}>
                        <Save className="w-4 h-4 mr-2" />
                        Create Employee
                      </Button>
                      <Button variant="outline" onClick={cancelCreating}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : selectedEmployee ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{selectedEmployee.avatar}</span>
                        <div>
                          <CardTitle className="text-2xl">{selectedEmployee.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="bg-blue-100 text-blue-800">
                              {selectedEmployee.role}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {selectedEmployee.department}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => startEditing(selectedEmployee)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <Input
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Avatar</label>
                            <Input
                              value={editForm.avatar || ''}
                              onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <Input
                              type="email"
                              value={editForm.email || ''}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            <Input
                              value={editForm.phone || ''}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <Select
                              value={editForm.role || ''}
                              onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Department</label>
                            <Select
                              value={editForm.department || ''}
                              onValueChange={(value) => setEditForm({ ...editForm, department: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept} value={dept}>
                                    {dept}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <Select
                              value={editForm.status || ''}
                              onValueChange={(value: 'active' | 'inactive') => setEditForm({ ...editForm, status: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Bio</label>
                          <Textarea
                            value={editForm.bio || ''}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Permissions</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {permissions.map((permission) => (
                              <label key={permission} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editForm.permissions?.includes(permission) || false}
                                  onChange={(e) => {
                                    const currentPermissions = editForm.permissions || []
                                    if (e.target.checked) {
                                      setEditForm({
                                        ...editForm,
                                        permissions: [...currentPermissions, permission]
                                      })
                                    } else {
                                      setEditForm({
                                        ...editForm,
                                        permissions: currentPermissions.filter(p => p !== permission)
                                      })
                                    }
                                  }}
                                  className="mr-2"
                                />
                                <span className="text-sm capitalize">{permission.replace('_', ' ')}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button onClick={handleUpdateEmployee}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Performance Metrics */}
                        {(() => {
                          const analytics = getEmployeeAnalytics(selectedEmployee)
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                  <Users className="w-5 h-5 text-blue-600 mr-2" />
                                  <span className="text-sm font-medium">Assigned Creators</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-600 mt-1">
                                  {analytics.totalCreators}
                                </p>
                              </div>
                              <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                                  <span className="text-sm font-medium">Total Revenue</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                  ${analytics.totalRevenue.toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                  <Target className="w-5 h-5 text-orange-600 mr-2" />
                                  <span className="text-sm font-medium">Cards Sold</span>
                                </div>
                                <p className="text-2xl font-bold text-orange-600 mt-1">
                                  {analytics.totalCardsSold}
                                </p>
                              </div>
                              <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                  <Award className="w-5 h-5 text-purple-600 mr-2" />
                                  <span className="text-sm font-medium">High Performers</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-600 mt-1">
                                  {analytics.highPerformers}
                                </p>
                              </div>
                            </div>
                          )
                        })()}

                        {/* Contact Information */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{selectedEmployee.email}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{selectedEmployee.phone || 'No phone provided'}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">Started: {new Date(selectedEmployee.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className={selectedEmployee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {selectedEmployee.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        {selectedEmployee.bio && (
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Bio</h3>
                            <p className="text-gray-700">{selectedEmployee.bio}</p>
                          </div>
                        )}

                        {/* Permissions */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Permissions</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedEmployee.permissions.map((permission) => (
                              <Badge key={permission} variant="secondary" className="text-xs">
                                {permission.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Assigned Creators */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Assigned Creators ({selectedEmployee.assignedCreators.length})</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedEmployee.assignedCreators.map((creatorId) => {
                              const creator = creators.find(c => c.id === creatorId)
                              if (!creator) return null
                              return (
                                <div key={creatorId} className="border rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{creator.name}</h4>
                                    <Badge className="text-xs">
                                      {creator.category}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {creator.phase} • {creator.cardsSold}/100 cards
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Revenue: ${(creator.cardsSold * creator.cardPrice).toLocaleString()}
                                  </div>
                                </div>
                              )
                            })}
                            {selectedEmployee.assignedCreators.length === 0 && (
                              <div className="col-span-full text-center py-8 text-gray-500">
                                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No creators assigned yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select an employee to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Creator Assignments</CardTitle>
                <CardDescription>Assign creators to team members for management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {creators.map((creator) => {
                    const assignedEmployee = employees.find(emp => emp.assignedCreators.includes(creator.id))
                    return (
                      <div key={creator.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium">{creator.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{creator.category}</span>
                              <span>•</span>
                              <span>{creator.phase}</span>
                              <span>•</span>
                              <span>{creator.cardsSold}/100 cards</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {assignedEmployee && (
                            <Badge className="bg-blue-100 text-blue-800">
                              {assignedEmployee.name}
                            </Badge>
                          )}
                          <Select
                            value={assignedEmployee?.id.toString() || ''}
                            onValueChange={(value) => {
                              if (value) {
                                assignCreatorToEmployee(creator.id, Number(value))
                              }
                            }}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Assign to employee" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Unassigned</SelectItem>
                              {employees.filter(emp => emp.status === 'active').map((employee) => (
                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                  {employee.name} - {employee.role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )
                  })}
                  {creators.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No creators available for assignment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {employees.filter(emp => emp.status === 'active').map((employee) => {
                const analytics = getEmployeeAnalytics(employee)
                return (
                  <Card key={employee.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{employee.avatar}</span>
                        <div>
                          <CardTitle className="text-lg">{employee.name}</CardTitle>
                          <CardDescription>{employee.role}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Creators</p>
                          <p className="font-semibold">{analytics.totalCreators}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Revenue</p>
                          <p className="font-semibold">${analytics.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Cards Sold</p>
                          <p className="font-semibold">{analytics.totalCardsSold}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">High Performers</p>
                          <p className="font-semibold">{analytics.highPerformers}</p>
                        </div>
                      </div>
                      {analytics.totalCreators > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Avg Progress</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(analytics.averageProgress, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{analytics.averageProgress.toFixed(1)}%</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Team Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Summary</CardTitle>
                <CardDescription>Overall team metrics and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {employees.filter(emp => emp.status === 'active').length}
                    </div>
                    <p className="text-sm text-gray-600">Active Employees</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {creators.filter(creator => creator.assignedEmployee).length}
                    </div>
                    <p className="text-sm text-gray-600">Assigned Creators</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      ${employees.reduce((sum, emp) => sum + getEmployeeAnalytics(emp).totalRevenue, 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Total Team Revenue</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {employees.reduce((sum, emp) => sum + getEmployeeAnalytics(emp).totalCardsSold, 0)}
                    </div>
                    <p className="text-sm text-gray-600">Total Cards Sold</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}