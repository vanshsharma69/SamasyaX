"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { ProjectsView } from "@/components/projects-view"
import { IssuesView } from "@/components/issues-view"
import { UsersView } from "@/components/users-view"
import { SettingsView } from "@/components/settings-view"
import { ProjectDetailView } from "@/components/project-detail-view"

interface User {
  id: string
  email: string
  role: "Admin" | "Developer" | "Client"
  assignedProjects?: string[]
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState("dashboard")
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showProjectDetail, setShowProjectDetail] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setCurrentView("dashboard")
    setShowProjectDetail(false)
    setSelectedProject(null)
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view)
    setShowProjectDetail(false)
    setSelectedProject(null)
  }

  const handleProjectSelect = (project: any) => {
    setSelectedProject(project)
    setShowProjectDetail(true)
  }

  const handleBackToProjects = () => {
    setShowProjectDetail(false)
    setSelectedProject(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  const renderCurrentView = () => {
    if (showProjectDetail && selectedProject) {
      return <ProjectDetailView project={selectedProject} user={user} onBack={handleBackToProjects} />
    }

    switch (currentView) {
      case "dashboard":
        return <Dashboard user={user} />
      case "projects":
        return <ProjectsView user={user} onProjectSelect={handleProjectSelect} />
      case "issues":
        return <IssuesView user={user} />
      case "users":
        return user.role === "Admin" ? <UsersView user={user} /> : <Dashboard user={user} />
      case "settings":
        return <SettingsView user={user} />
      default:
        return <Dashboard user={user} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} currentView={currentView} onViewChange={handleViewChange} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{renderCurrentView()}</div>
      </main>
    </div>
  )
}
