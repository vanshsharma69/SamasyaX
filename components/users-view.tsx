"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Shield, Edit, Eye } from "lucide-react"

interface User {
  id: string
  email: string
  role: "Admin" | "Developer" | "Client"
}

interface UserData {
  _id: string
  email: string
  role: "Admin" | "Developer" | "Client"
  assignedProjects: Array<{
    _id: string
    name: string
  }>
  createdAt: string
  isActive: boolean
}

interface Project {
  _id: string
  name: string
}

interface UsersViewProps {
  user: User
}

export function UsersView({ user }: UsersViewProps) {
  const [users, setUsers] = useState<UserData[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState<"Admin" | "Developer" | "Client">("Developer")
  const [assigning, setAssigning] = useState(false)
  const [updatingRole, setUpdatingRole] = useState(false)

  useEffect(() => {
    if (user.role === "Admin") {
      fetchUsers()
      fetchProjects()
    }
  }, [user.role])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched users:", data)
        setUsers(data)
      } else {
        setError("Failed to fetch users")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err)
    }
  }

  const handleAssignProjects = async () => {
    if (!selectedUser) return

    setAssigning(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/users/${selectedUser._id}/assign-projects`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectIds: selectedProjects }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)))
        setIsAssignDialogOpen(false)
        setSelectedUser(null)
        setSelectedProjects([])
        setSuccess("Projects assigned successfully!")
      } else {
        const data = await response.json()
        setError(data.message || "Failed to assign projects")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    } finally {
      setAssigning(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedUser) return

    setUpdatingRole(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/users/${selectedUser._id}/update-role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)))
        setIsRoleDialogOpen(false)
        setSelectedUser(null)
        setSuccess("User role updated successfully!")
      } else {
        const data = await response.json()
        setError(data.message || "Failed to update user role")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    } finally {
      setUpdatingRole(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/users/${userId}/toggle-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)))
        setSuccess(`User ${isActive ? "activated" : "deactivated"} successfully!`)
      } else {
        setError("Failed to update user status")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    }
  }

  const openAssignDialog = (userData: UserData) => {
    setSelectedUser(userData)
    // Extract project IDs from the populated assignedProjects
    const projectIds = userData.assignedProjects?.map((project) => project._id) || []
    setSelectedProjects(projectIds)
    setIsAssignDialogOpen(true)
  }

  const openRoleDialog = (userData: UserData) => {
    setSelectedUser(userData)
    setSelectedRole(userData.role)
    setIsRoleDialogOpen(true)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin":
        return "default"
      case "Developer":
        return "secondary"
      case "Client":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Shield className="h-3 w-3 mr-1" />
      case "Client":
        return <Eye className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  if (user.role !== "Admin") {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Access Denied</h3>
        <p className="text-muted-foreground">Only administrators can access user management.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and project assignments</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({users.length})
          </CardTitle>
          <CardDescription>Manage user roles and project assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Projects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userData) => (
                  <TableRow key={userData._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {userData.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{userData.email}</div>
                          <div className="text-sm text-muted-foreground">ID: {userData._id.slice(-6)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(userData.role)}>
                        {getRoleIcon(userData.role)}
                        {userData.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {userData.assignedProjects?.length > 0 ? (
                          userData.assignedProjects.map((project) => (
                            <Badge key={`assigned-${project._id}`} variant="outline" className="mr-1">
                              {project.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No projects assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={userData.isActive ? "default" : "secondary"}>
                        {userData.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(userData.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openAssignDialog(userData)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openRoleDialog(userData)}>
                          Role
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleUserStatus(userData._id, !userData.isActive)}
                        >
                          {userData.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Projects Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Projects</DialogTitle>
            <DialogDescription>Select projects to assign to {selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Assigned Projects</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                {selectedProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects assigned</p>
                ) : (
                  selectedProjects.map((projectId) => {
                    const project = projects.find((p) => p._id === projectId)
                    return project ? (
                      <div
                        key={`dialog-assigned-${project._id}`}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <span className="text-sm">{project.name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProjects(selectedProjects.filter((id) => id !== project._id))
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : null
                  })
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Projects</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                {projects.filter((project) => !selectedProjects.includes(project._id)).length === 0 ? (
                  <p className="text-sm text-muted-foreground">All projects are assigned</p>
                ) : (
                  projects
                    .filter((project) => !selectedProjects.includes(project._id))
                    .map((project) => (
                      <div
                        key={`dialog-available-${project._id}`}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <span className="text-sm">{project.name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProjects([...selectedProjects, project._id])
                          }}
                        >
                          Assign
                        </Button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignProjects} disabled={assigning}>
              {assigning ? "Assigning..." : "Assign Projects"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>Change the role for {selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin - Full access to everything</SelectItem>
                  <SelectItem value="Developer">Developer - Can create and manage issues</SelectItem>
                  <SelectItem value="Client">Client - Can only view own issues</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Admin:</strong> Full access to all features including user management and project deletion.
              </p>
              <p>
                <strong>Developer:</strong> Can create, edit issues and view assigned projects.
              </p>
              <p>
                <strong>Client:</strong> Can only view issues they created or that admins created in their projects.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={updatingRole}>
              {updatingRole ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
