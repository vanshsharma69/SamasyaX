"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Bug, Upload, ImageIcon, Eye } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface User {
  id: string
  email: string
  role: "Admin" | "Developer"
}

interface Issue {
  _id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "done"
  project: {
    _id: string
    name: string
  }
  expectedOutcome: string
  currentOutcome: string
  bugImage?: string
  createdAt: string
  assignedTo?: string
  reporter?: {
    _id: string
    email: string
  }
}

interface IssuesViewProps {
  user: User
}

export function IssuesView({ user }: IssuesViewProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null)
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    status: "todo" as const,
    project: "",
    expectedOutcome: "",
    currentOutcome: "",
    bugImage: null as File | null,
  })
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null)
  const [deletingIssue, setDeletingIssue] = useState<Issue | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchIssues()
    fetchProjects()
  }, [])

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIssues(data)
      } else {
        setError("Failed to fetch issues")
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewIssue({ ...newIssue, bugImage: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

      const formData = new FormData()
      formData.append("title", newIssue.title)
      formData.append("description", newIssue.description)
      formData.append("priority", newIssue.priority)
      formData.append("status", newIssue.status)
      formData.append("project", newIssue.project)
      formData.append("expectedOutcome", newIssue.expectedOutcome)
      formData.append("currentOutcome", newIssue.currentOutcome)

      if (newIssue.bugImage) {
        formData.append("bugImage", newIssue.bugImage)
      }

      const response = await fetch(`${API_URL}/api/issues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const issue = await response.json()
        setIssues([...issues, issue])
        setNewIssue({
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
          project: "",
          expectedOutcome: "",
          currentOutcome: "",
          bugImage: null,
        })
        setImagePreview("")
        setIsCreateDialogOpen(false)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create issue")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteIssue = async () => {
    if (!deletingIssue) return

    setDeleting(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/issues/${deletingIssue._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIssues(issues.filter((issue) => issue._id !== deletingIssue._id))
        setDeletingIssue(null)
      } else {
        setError("Failed to delete issue")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    } finally {
      setDeleting(false)
    }
  }

  const handleUpdateIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingIssue) return

    setUpdating(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/issues/${editingIssue._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingIssue.title,
          description: editingIssue.description,
          priority: editingIssue.priority,
          status: editingIssue.status,
          expectedOutcome: editingIssue.expectedOutcome,
          currentOutcome: editingIssue.currentOutcome,
        }),
      })

      if (response.ok) {
        const updatedIssue = await response.json()
        setIssues(issues.map((issue) => (issue._id === updatedIssue._id ? updatedIssue : issue)))
        setIsEditDialogOpen(false)
        setEditingIssue(null)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to update issue")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    } finally {
      setUpdating(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
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
          <h1 className="text-3xl font-bold text-foreground">Issues</h1>
          <p className="text-muted-foreground">Track and manage all issues</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Issue</DialogTitle>
              <DialogDescription>Report a new bug or issue for a project.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateIssue}>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select
                    value={newIssue.project}
                    onValueChange={(value) => setNewIssue({ ...newIssue, project: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                    required
                    placeholder="Enter issue title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                    required
                    placeholder="Describe the issue in detail"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedOutcome">Expected Outcome</Label>
                  <Textarea
                    id="expectedOutcome"
                    value={newIssue.expectedOutcome}
                    onChange={(e) => setNewIssue({ ...newIssue, expectedOutcome: e.target.value })}
                    required
                    placeholder="What should happen?"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentOutcome">Current Outcome</Label>
                  <Textarea
                    id="currentOutcome"
                    value={newIssue.currentOutcome}
                    onChange={(e) => setNewIssue({ ...newIssue, currentOutcome: e.target.value })}
                    required
                    placeholder="What actually happens?"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bugImage">Bug Screenshot (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input id="bugImage" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("bugImage")?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </Button>
                    {newIssue.bugImage && (
                      <span className="text-sm text-muted-foreground">{newIssue.bugImage.name}</span>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Bug preview"
                        className="max-w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newIssue.priority}
                      onValueChange={(value: any) => setNewIssue({ ...newIssue, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newIssue.status}
                      onValueChange={(value: any) => setNewIssue({ ...newIssue, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Issue"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {issues.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No issues yet</h3>
            <p className="text-muted-foreground mb-4">Start tracking bugs and issues.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Issue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Issues ({issues.length})</CardTitle>
            <CardDescription>Track and manage project issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{issue.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{issue.description}</div>
                          {issue.bugImage && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ImageIcon className="h-3 w-3" />
                              <span>Has screenshot</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{issue.project.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(issue.status)}>{issue.status.replace("-", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{issue.reporter?.email ?? "Unknown"}</span>
                      </TableCell>
                      <TableCell>{new Date(issue.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setViewingIssue(issue)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(user.role === "Admin" || user.role === "Developer") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingIssue(issue)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {user.role === "Admin" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeletingIssue(issue)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      {/* View Issue Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
            <DialogDescription>Complete information about this issue</DialogDescription>
          </DialogHeader>
          {viewingIssue && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <p className="text-lg font-semibold">{viewingIssue.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">{viewingIssue.description}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Expected Outcome</Label>
                    <p className="text-sm text-muted-foreground">{viewingIssue.expectedOutcome}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Outcome</Label>
                    <p className="text-sm text-muted-foreground">{viewingIssue.currentOutcome}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Priority</Label>
                      <div className="mt-1">
                        <Badge className={getPriorityColor(viewingIssue.priority)}>{viewingIssue.priority}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(viewingIssue.status)}>
                          {viewingIssue.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Project</Label>
                    <p className="text-sm text-muted-foreground">{viewingIssue.project.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Reporter</Label>
                    <p className="text-sm text-muted-foreground">{viewingIssue.reporter?.email || "Unknown"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">{new Date(viewingIssue.createdAt).toLocaleString()}</p>
                  </div>
                  {viewingIssue.assignedTo && (
                    <div>
                      <Label className="text-sm font-medium">Assigned To</Label>
                      <p className="text-sm text-muted-foreground">{viewingIssue.assignedTo}</p>
                    </div>
                  )}
                </div>
              </div>
              {viewingIssue.bugImage && (
                <div>
                  <Label className="text-sm font-medium">Bug Screenshot</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${viewingIssue.bugImage}`}
                      alt="Bug screenshot"
                      className="w-full max-h-96 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=400"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Issue Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Issue</DialogTitle>
            <DialogDescription>Update the issue details.</DialogDescription>
          </DialogHeader>
          {editingIssue && (
            <form onSubmit={handleUpdateIssue}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingIssue.title}
                    onChange={(e) => setEditingIssue({ ...editingIssue, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingIssue.description}
                    onChange={(e) => setEditingIssue({ ...editingIssue, description: e.target.value })}
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-expected">Expected Outcome</Label>
                  <Textarea
                    id="edit-expected"
                    value={editingIssue.expectedOutcome}
                    onChange={(e) => setEditingIssue({ ...editingIssue, expectedOutcome: e.target.value })}
                    required
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-current">Current Outcome</Label>
                  <Textarea
                    id="edit-current"
                    value={editingIssue.currentOutcome}
                    onChange={(e) => setEditingIssue({ ...editingIssue, currentOutcome: e.target.value })}
                    required
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={editingIssue.priority}
                      onValueChange={(value: any) => setEditingIssue({ ...editingIssue, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={editingIssue.status}
                      onValueChange={(value: any) => setEditingIssue({ ...editingIssue, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updating}>
                  {updating ? "Updating..." : "Update Issue"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Issue Confirmation Dialog */}
      <AlertDialog open={!!deletingIssue} onOpenChange={() => setDeletingIssue(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Issue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the issue "{deletingIssue?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteIssue} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Deleting..." : "Delete Issue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
