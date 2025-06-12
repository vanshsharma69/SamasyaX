"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderOpen, Users, Bug, Trash2 } from "lucide-react"

interface User {
  id: string
  email: string
  role: "Admin" | "Developer" | "Client"
  assignedProjects?: string[]
}

interface Project {
  _id: string
  name: string
  description: string
  creator: string
  assignedUsers: string[]
  issueCount: number
  openIssues: number
  createdAt: string
}

interface ProjectsViewProps {
  user: User
  onProjectSelect?: (project: Project) => void
}

export function ProjectsView({ user, onProjectSelect }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState({ name: "", description: "" })
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

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
      } else {
        setError("Failed to fetch projects")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      })

      if (response.ok) {
        const project = await response.json()
        setProjects([...projects, project])
        setNewProject({ name: "", description: "" })
        setIsCreateDialogOpen(false)
        setSuccess("Project created successfully!")
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create project")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!deletingProject) return

    setDeleting(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/projects/${deletingProject._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(projects.filter((project) => project._id !== deletingProject._id))
        setSuccess(`Project "${data.deletedProject}" and all its issues have been deleted successfully!`)
        setDeletingProject(null)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete project")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    } finally {
      setDeleting(false)
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
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">
            {user.role === "Admin"
              ? "Manage all projects"
              : user.role === "Developer"
                ? "Your assigned projects"
                : "Projects you have access to"}
          </p>
        </div>
        {user.role === "Admin" && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Add a new project to track issues and bugs.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      required
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      required
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
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

      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              {user.role === "Admin"
                ? "Get started by creating your first project."
                : "No projects have been assigned to you yet."}
            </p>
            {user.role === "Admin" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription className="mt-2">{project.description}</CardDescription>
                  </div>
                  {user.role === "Admin" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeletingProject(project)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Bug className="h-4 w-4 text-muted-foreground" />
                    <span>{project.issueCount || 0} issues</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{project.assignedUsers?.length || 0} users</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline">{project.openIssues || 0} open</Badge>
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => onProjectSelect && onProjectSelect(project)}
                >
                  View Project
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={!!deletingProject} onOpenChange={() => setDeletingProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete the project{" "}
                <span className="font-semibold">"{deletingProject?.name}"</span>?
              </p>
              <p className="text-red-600 font-medium">
                This action will permanently delete the project and ALL associated issues. This cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
